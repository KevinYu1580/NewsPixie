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

async function fetchModels(provider: AIProvider, apiKey: string) {
  if (!apiKey.trim())
    return
  modelsLoading.value[provider] = true
  modelsError.value[provider] = null
  try {
    const encrypted = await encryptPayload({ apiKey: apiKey.trim() })
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
  // 已儲存的 provider 仍可呼叫 ai-models 預載清單嗎？需 apiKey 明文，不行。
  // 故僅清空 dynamicModels，等使用者輸入新 key 再 fetch。
  dynamicModels.value = { anthropic: [], openai: [], gemini: [] }
}

watch(localProvider, (p) => {
  if (localKeys.value[p].trim() && !dynamicModels.value[p].length && !modelsLoading.value[p]) {
    fetchModels(p, localKeys.value[p])
  }
})

function openDialog() {
  syncLocalSettings()
  dialog.value = true
}

async function handleSave() {
  saving.value = true
  saveError.value = null
  try {
    const meta = settingsStore.sessionMeta
    // 若使用者本次未輸入該 provider 的 key、保留 server 端原值（不送空字串覆蓋）
    // 作法：對未填的 provider 不送 key 欄位，server 收到 undefined 視為不更新
    // 但 save 端點目前要求 keys 物件 — 這裡採折衷：未填的 provider 若 meta 顯示已有 key、視為「保留」需重送
    // 為簡化，未填者送空字串 → server 會清空。提示使用者重新填入所有想保留的 key。
    // 可接受：使用者 UX 即「儲存 = 一次寫入完整當前狀態」
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
    if (!hasNewKey) {
      // 保留模式：僅更新 provider/models — 但 server 端要求至少一組 key、不能僅更新 meta
      // 故若使用者未輸入任何新 key 且 server 已有 key，提示需重新輸入或直接拒絕
      if (!meta?.hasKey) {
        saveError.value = t('settings.needAtLeastOneKey')
        return
      }
      saveError.value = t('settings.reenterKeysToSave')
      return
    }

    const envelope = await encryptPayload(payload)
    const res = await $fetch<{ ok: true, meta: typeof meta }>('/api/session/save', {
      method: 'POST',
      body: envelope,
    })
    if (res.meta)
      settingsStore.applyMeta(res.meta)
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
              <div
                v-if="maskedKey"
                class="font-mono-label text-caption text-medium-emphasis mb-2"
              >
                {{ t('settings.currentKey') }}{{ maskedKey }}
              </div>
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
              </div>
              <p class="text-body-small mt-2">
                {{ t('settings.keyStorageNote') }}
              </p>
              <div v-if="settingsStore.hasApiKey" class="mt-2">
                <v-btn
                  :loading="clearing"
                  size="small"
                  variant="text"
                  color="error"
                  prepend-icon="mdi-delete-outline"
                  @click="handleClearSession"
                >
                  {{ t('settings.clearSession') }}
                </v-btn>
              </div>
            </div>

            <v-divider class="mb-5" />

            <!-- 模型選擇 -->
            <div>
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis">
                  {{ t('settings.summaryModel') }}
                </div>
                <v-btn
                  v-if="localKeys[localProvider]?.trim()"
                  :loading="modelsLoading[localProvider]"
                  icon="mdi-refresh"
                  variant="text"
                  size="x-small"
                  :aria-label="t('settings.refreshModelList')"
                  @click="fetchModels(localProvider, localKeys[localProvider])"
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
                      @click="fetchModels(localProvider, localKeys[localProvider])"
                    >
                      {{ t('settings.retry') }}
                    </v-btn>
                  </div>
                </v-alert>

                <template v-else-if="!localKeys[localProvider]?.trim()">
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
          color="primary"
          :loading="saving"
          @click="handleSave"
        >
          {{ t('settings.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
