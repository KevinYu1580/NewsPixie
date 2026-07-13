<script setup lang="ts">
import type { AIProvider } from '@/types/ai'
import { useSettingsStore } from '@/stores/settingsStore'
import { PROVIDER_CONFIGS } from '@/types/ai'
import { encryptPayload } from '@/utils/crypto-payload'
import { getErrorMessage } from '@/utils/utils'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const dialog = ref(false)
const tab = ref<'ai' | 'briefing'>('ai')
const localProvider = ref<AIProvider>('anthropic')
const localKeys = ref<Record<AIProvider, string>>({ anthropic: '', openai: '', gemini: '' })
const localModels = ref<Record<AIProvider, string>>({
  anthropic: PROVIDER_CONFIGS.anthropic.defaultModel,
  openai: PROVIDER_CONFIGS.openai.defaultModel,
  gemini: PROVIDER_CONFIGS.gemini.defaultModel,
})
const localFetchTime = ref('')
const localArticleCount = ref(5)
const localRepoCount = ref(8)
const showKey = ref(false)
const saving = ref(false)
const saveError = ref<string | null>(null)
const clearing = ref(false)
/** 已有儲存的 key 時預設隱藏輸入框，按「更換 Key」才顯示 */
const replacingKey = ref(false)
/** 清除 key 前的確認跳窗 */
const confirmClearOpen = ref(false)

const dynamicModels = ref<Record<AIProvider, { id: string, label: string }[]>>({
  anthropic: [],
  openai: [],
  gemini: [],
})
const modelsLoading = ref<Record<AIProvider, boolean>>({
  anthropic: false,
  openai: false,
  gemini: false,
})
const modelsError = ref<Record<AIProvider, string | null>>({
  anthropic: null,
  openai: null,
  gemini: null,
})

/** 未傳 apiKey 時由 server 使用 session 中已儲存的 key 查詢模型清單 */
async function fetchModels(provider: AIProvider, apiKey?: string) {
  const trimmed = apiKey?.trim()
  const hasStoredKey = !!settingsStore.sessionMeta?.masked?.[provider]
  if (!trimmed && !hasStoredKey)
    return
  modelsLoading.value[provider] = true
  modelsError.value[provider] = null
  try {
    const encrypted = trimmed ? await encryptPayload({ apiKey: trimmed }) : undefined
    const res = await $fetch<{ models: { id: string, label: string }[] }>('/api/ai-models', {
      method: 'POST',
      body: { provider, encrypted },
    })
    dynamicModels.value[provider] = res.models
    const ids = res.models.map(m => m.id)
    const first = ids[0]
    if (first && !ids.includes(localModels.value[provider])) {
      localModels.value[provider] = first
    }
  }
  catch (e: unknown) {
    modelsError.value[provider] = getErrorMessage(e) || t('settings.modelListError')
  }
  finally {
    modelsLoading.value[provider] = false
  }
}

function syncLocalSettings() {
  tab.value = 'ai'
  localProvider.value = settingsStore.provider
  localKeys.value = { anthropic: '', openai: '', gemini: '' }
  const meta = settingsStore.sessionMeta
  localModels.value = {
    anthropic: meta?.models.anthropic ?? PROVIDER_CONFIGS.anthropic.defaultModel,
    openai: meta?.models.openai ?? PROVIDER_CONFIGS.openai.defaultModel,
    gemini: meta?.models.gemini ?? PROVIDER_CONFIGS.gemini.defaultModel,
  }
  localFetchTime.value = settingsStore.fetchTime
  localArticleCount.value = settingsStore.articleCount
  localRepoCount.value = settingsStore.repoCount
  showKey.value = false
  saveError.value = null
  replacingKey.value = false
  dynamicModels.value = { anthropic: [], openai: [], gemini: [] }
}

watch(localProvider, (p) => {
  replacingKey.value = false
  const typed = localKeys.value[p].trim()
  const stored = !!settingsStore.sessionMeta?.masked?.[p]
  if ((typed || stored) && !dynamicModels.value[p].length && !modelsLoading.value[p]) {
    fetchModels(p, typed || undefined)
  }
})

function openDialog() {
  syncLocalSettings()
  dialog.value = true
  // 已有儲存的 key：由 session 預載模型清單，不需重新輸入 key
  if (settingsStore.sessionMeta?.masked?.[localProvider.value]) {
    fetchModels(localProvider.value)
  }
}

async function handleSave() {
  saving.value = true
  saveError.value = null
  try {
    const meta = settingsStore.sessionMeta
    // 合併式更新：空欄位 = 沿用 server 端既有的 key，清除 key 一律走「清除」按鈕
    const payload = {
      provider: localProvider.value,
      anthropicKey: localKeys.value.anthropic.trim(),
      openaiKey: localKeys.value.openai.trim(),
      geminiKey: localKeys.value.gemini.trim(),
      anthropicModel: localModels.value.anthropic,
      openaiModel: localModels.value.openai,
      geminiModel: localModels.value.gemini,
    }
    const hasNewKey = !!(payload.anthropicKey || payload.openaiKey || payload.geminiKey)
    // 沒有新 key 也沒有已存 key 時，session 無可更新 — 僅儲存本地偏好設定
    if (hasNewKey || meta?.hasKey) {
      const envelope = await encryptPayload(payload)
      const res = await $fetch<{ ok: true, meta: typeof meta }>('/api/session/save', {
        method: 'POST',
        body: envelope,
      })
      if (res.meta)
        settingsStore.applyMeta(res.meta)
    }
    settingsStore.setProvider(localProvider.value)
    settingsStore.setFetchTime(localFetchTime.value)
    settingsStore.setArticleCount(Number(localArticleCount.value))
    settingsStore.setRepoCount(Number(localRepoCount.value))
    settingsStore.dismissLegacyKeyHint()
    dialog.value = false
  }
  catch (e: unknown) {
    saveError.value = getErrorMessage(e) || t('settings.saveError')
  }
  finally {
    saving.value = false
  }
}

async function handleClearSession() {
  clearing.value = true
  try {
    await settingsStore.clearSession()
    syncLocalSettings()
  }
  catch (e: unknown) {
    saveError.value = getErrorMessage(e) || t('settings.clearError')
  }
  finally {
    clearing.value = false
    confirmClearOpen.value = false
  }
}

const currentConfig = computed(() => PROVIDER_CONFIGS[localProvider.value])

const maskedKey = computed(() => settingsStore.sessionMeta?.masked?.[localProvider.value] ?? '')

const savedModelLabel = computed(() => {
  const id = settingsStore.sessionMeta?.models?.[localProvider.value] ?? ''
  if (!id)
    return ''
  const match = PROVIDER_CONFIGS[localProvider.value].models.find(m => m.value === id)
  return match?.label ?? id
})
</script>

<template>
  <v-btn
    icon="mdi-cog-outline"
    variant="text"
    size="small"
    :aria-label="t('settings.openSettings')"
    @click="openDialog"
  />

  <v-dialog v-model="dialog" max-width="420" scrollable>
    <v-card>
      <v-card-title class="font-mono-label text-sm tracking-widest text-uppercase pt-5 px-5">
        {{ t('settings.title') }}
      </v-card-title>

      <v-tabs
        v-model="tab"
        density="compact"
        color="np-accent"
        grow
        class="px-5 flex-shrink-0"
      >
        <v-tab value="ai">
          {{ t('settings.tabAi') }}
        </v-tab>
        <v-tab value="briefing">
          {{ t('settings.tabBriefing') }}
        </v-tab>
      </v-tabs>

      <v-card-text class="px-5 pb-5 pt-5">
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="ai">
            <!-- Provider 選擇 -->
            <div class="mb-5">
              <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
                {{ t('settings.aiProvider') }}
              </div>

              <v-btn-toggle
                v-model="localProvider"
                mandatory
                density="compact"
                variant="outlined"
                color="np-accent"
                class="w-100"
              >
                <v-btn variant="text" value="anthropic">
                  {{ PROVIDER_CONFIGS.anthropic.label }}
                </v-btn>
                <v-tooltip :text="t('settings.notAvailable')" location="top">
                  <template #activator="{ props: ttProps }">
                    <span v-bind="ttProps" class="flex-1-1 d-inline-flex" style="pointer-events: all;">
                      <v-btn variant="text" value="openai" disabled>
                        {{ PROVIDER_CONFIGS.openai.label }}
                      </v-btn>
                    </span>
                  </template>
                </v-tooltip>
                <v-tooltip :text="t('settings.notAvailable')" location="top">
                  <template #activator="{ props: ttProps }">
                    <span v-bind="ttProps" class="flex-1-1 d-inline-flex" style="pointer-events: all;">
                      <v-btn variant="text" value="gemini" disabled>
                        {{ PROVIDER_CONFIGS.gemini.label }}
                      </v-btn>
                    </span>
                  </template>
                </v-tooltip>
              </v-btn-toggle>
            </div>

            <!-- API Key -->
            <div class="mb-5">
              <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
                {{ t('settings.apiKey') }}
              </div>

              <!-- 已有儲存的 key：顯示遮罩值與操作，不顯示輸入框 -->
              <template v-if="maskedKey && !replacingKey">
                <div class="font-mono-label text-caption text-medium-emphasis mb-2">
                  {{ t('settings.currentKey') }}{{ maskedKey }}
                </div>
                <div class="d-flex align-center ga-2">
                  <v-btn
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-pencil-outline"
                    @click="replacingKey = true"
                  >
                    {{ t('settings.replaceKey') }}
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    color="error"
                    prepend-icon="mdi-delete-outline"
                    @click="confirmClearOpen = true"
                  >
                    {{ t('settings.clearSession') }}
                  </v-btn>
                </div>
              </template>

              <!-- 尚無 key、或按了「更換 Key」：顯示輸入框 -->
              <template v-else>
                <div class="d-flex align-center ga-2">
                  <v-text-field
                    v-model="localKeys[localProvider]"
                    :type="showKey ? 'text' : 'password'"
                    :placeholder="currentConfig.keyPlaceholder"
                    autocomplete="new-password"
                    name="np-api-key"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :aria-label="`${currentConfig.label} API Key`"
                    class="flex-grow-1"
                    @blur="fetchModels(localProvider, localKeys[localProvider])"
                  >
                    <template #append-inner>
                      <v-btn
                        :icon="showKey ? 'mdi-eye-off' : 'mdi-eye'"
                        variant="text"
                        size="x-small"
                        :aria-label="showKey ? t('settings.hideKey') : t('settings.showKey')"
                        @click="showKey = !showKey"
                      />
                    </template>
                  </v-text-field>
                  <v-btn
                    v-if="replacingKey"
                    size="small"
                    variant="text"
                    @click="replacingKey = false; localKeys[localProvider] = ''"
                  >
                    {{ t('settings.cancel') }}
                  </v-btn>
                </div>
                <p v-if="replacingKey" class="text-body-small mt-2">
                  {{ t('settings.replaceKeyHint') }}
                </p>
              </template>

              <p class="text-body-small mt-2">
                {{ t('settings.keyStorageNote') }}
              </p>
            </div>

            <v-divider class="mb-5" />

            <!-- 模型選擇 -->
            <div>
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis">
                  {{ t('settings.summaryModel') }}
                </div>
                <v-btn
                  v-if="localKeys[localProvider]?.trim() || maskedKey"
                  :loading="modelsLoading[localProvider]"
                  icon="mdi-refresh"
                  variant="text"
                  size="x-small"
                  :aria-label="t('settings.refreshModelList')"
                  @click="fetchModels(localProvider, localKeys[localProvider]?.trim() || undefined)"
                />
              </div>
              <div class="d-flex flex-column ga-2">
                <template v-if="modelsLoading[localProvider]">
                  <v-skeleton-loader
                    v-for="i in 3"
                    :key="i"
                    type="list-item-two-line"
                    class="rounded"
                  />
                </template>

                <v-alert
                  v-else-if="modelsError[localProvider]"
                  type="error"
                  density="compact"
                  variant="tonal"
                >
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2">{{ modelsError[localProvider] }}</span>
                    <v-btn
                      size="small"
                      variant="text"
                      @click="fetchModels(localProvider, localKeys[localProvider]?.trim() || undefined)"
                    >
                      {{ t('settings.retry') }}
                    </v-btn>
                  </div>
                </v-alert>

                <template v-else-if="!dynamicModels[localProvider].length">
                  <v-card
                    v-if="savedModelLabel"
                    variant="tonal"
                    color="np-accent"
                  >
                    <v-card-text class="pa-3">
                      <div class="text-caption text-medium-emphasis mb-1">
                        {{ t('settings.currentModel') }}
                      </div>
                      <div class="text-body-2 font-weight-medium text-np-accent">
                        {{ savedModelLabel }}
                      </div>
                    </v-card-text>
                  </v-card>
                  <p v-else class="text-body-2 text-medium-emphasis">
                    {{ t('settings.enterKeyFirst') }}
                  </p>
                </template>

                <template v-else>
                  <v-card
                    v-for="m in dynamicModels[localProvider]"
                    :key="m.id"
                    :variant="localModels[localProvider] === m.id ? 'tonal' : 'outlined'"
                    :color="localModels[localProvider] === m.id ? 'np-accent' : undefined"
                    class="cursor-pointer"
                    :aria-pressed="localModels[localProvider] === m.id"
                    @click="localModels[localProvider] = m.id"
                  >
                    <v-card-text class="d-flex align-start ga-3 pa-3">
                      <v-icon
                        :icon="localModels[localProvider] === m.id ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
                        :color="localModels[localProvider] === m.id ? 'np-accent' : 'medium-emphasis'"
                        size="small"
                        class="mt-0"
                      />
                      <div class="text-body-2 font-weight-medium" :class="localModels[localProvider] === m.id ? 'text-np-accent' : ''">
                        {{ m.label }}
                      </div>
                    </v-card-text>
                  </v-card>
                </template>
              </div>
            </div>
          </v-tabs-window-item>

          <v-tabs-window-item value="briefing">
            <!-- 每日精選設定 -->
            <div class="text-caption text-medium-emphasis mb-1">
              {{ t('settings.autoTriggerTime') }}
            </div>
            <v-text-field
              v-model="localFetchTime"
              type="time"
              density="compact"
              variant="outlined"
              hide-details
              :aria-label="t('settings.autoTriggerTime')"
              class="mb-3"
            />

            <p class="text-body-small mt-2 mb-5">
              {{ t('settings.autoTriggerNote') }}
            </p>

            <div class="d-flex ga-3">
              <div class="flex-1-1">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ t('settings.articleCount') }}
                </div>
                <v-text-field
                  v-model.number="localArticleCount"
                  type="number"
                  min="4"
                  max="10"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :aria-label="t('settings.articleCount')"
                />
              </div>
              <div class="flex-1-1">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ t('settings.repoCount') }}
                </div>
                <v-text-field
                  v-model.number="localRepoCount"
                  type="number"
                  min="4"
                  max="10"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :aria-label="t('settings.repoCount')"
                />
              </div>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>

        <v-alert
          v-if="saveError"
          type="error"
          density="compact"
          variant="tonal"
          class="mt-4"
        >
          {{ saveError }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="justify-end px-5 pb-5 pt-0">
        <v-btn
          variant="text"
          :disabled="saving"
          @click="dialog = false"
        >
          {{ t('settings.cancel') }}
        </v-btn>
        <v-btn
          variant="flat"
          :loading="saving"
          @click="handleSave"
        >
          {{ t('settings.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 清除 key 確認跳窗 -->
    <v-dialog v-model="confirmClearOpen" max-width="360">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-medium pt-4 px-5">
          {{ t('settings.clearConfirmTitle') }}
        </v-card-title>
        <v-card-text class="px-5 text-body-2 text-medium-emphasis">
          {{ t('settings.clearConfirmText') }}
        </v-card-text>
        <v-card-actions class="justify-end px-5 pb-4">
          <v-btn
            variant="text"
            :disabled="clearing"
            @click="confirmClearOpen = false"
          >
            {{ t('settings.cancel') }}
          </v-btn>
          <v-btn
            variant="flat"
            color="error"
            :loading="clearing"
            @click="handleClearSession"
          >
            {{ t('settings.confirmClear') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>
