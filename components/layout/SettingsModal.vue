<script setup lang="ts">
import type { AIProvider } from '@/types/ai'
import { useSettingsStore } from '@/stores/settingsStore'
import { PROVIDER_CONFIGS } from '@/types/ai'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const dialog = ref(false)
const localProvider = ref<AIProvider>('anthropic')
const localKeys = ref<Record<AIProvider, string>>({ anthropic: '', openai: '', gemini: '' })
const localModels = ref<Record<AIProvider, string>>({
  anthropic: 'claude-haiku-4-5-20251001',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-3-flash-preview',
})
const localFetchTime = ref('')
const localArticleCount = ref(5)
const localRepoCount = ref(8)
const showKey = ref(false)

const providers = ['anthropic', 'openai', 'gemini'] as const

// 動態模型清單狀態
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
    const res = await $fetch<{ models: { id: string, label: string }[] }>('/api/ai-models', {
      method: 'POST',
      body: { provider, apiKey: apiKey.trim() },
    })
    dynamicModels.value[provider] = res.models
    const ids = res.models.map(m => m.id)
    if (ids.length && !ids.includes(localModels.value[provider])) {
      localModels.value[provider] = ids[0]
    }
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    modelsError.value[provider] = err?.data?.statusMessage || err?.message || t('settings.modelListError')
  }
  finally {
    modelsLoading.value[provider] = false
  }
}

function syncLocalSettings() {
  localProvider.value = settingsStore.provider
  localKeys.value = {
    anthropic: settingsStore.anthropicKey,
    openai: settingsStore.openaiKey,
    gemini: settingsStore.geminiKey,
  }
  localModels.value = {
    anthropic: settingsStore.anthropicModel,
    openai: settingsStore.openaiModel,
    gemini: settingsStore.geminiModel,
  }
  localFetchTime.value = settingsStore.fetchTime
  localArticleCount.value = settingsStore.articleCount
  localRepoCount.value = settingsStore.repoCount
  showKey.value = false

  // 若已有 key，自動拉取模型清單
  for (const p of providers) {
    if (localKeys.value[p].trim()) {
      fetchModels(p, localKeys.value[p])
    }
  }
}

// 切換 provider 時若已有 key 且尚未 fetch，自動觸發
watch(localProvider, (p) => {
  if (localKeys.value[p].trim() && !dynamicModels.value[p].length && !modelsLoading.value[p]) {
    fetchModels(p, localKeys.value[p])
  }
})

function openDialog() {
  syncLocalSettings()
  dialog.value = true
}

function handleSave() {
  settingsStore.setProvider(localProvider.value)
  for (const p of providers) {
    settingsStore.setProviderKey(p, localKeys.value[p].trim())
    settingsStore.setProviderModel(p, localModels.value[p])
  }
  settingsStore.setFetchTime(localFetchTime.value)
  settingsStore.setArticleCount(Number(localArticleCount.value))
  settingsStore.setRepoCount(Number(localRepoCount.value))
  dialog.value = false
}

const currentConfig = computed(() => PROVIDER_CONFIGS[localProvider.value])

const maskedKey = computed(() => {
  const k = ({ anthropic: settingsStore.anthropicKey, openai: settingsStore.openaiKey, gemini: settingsStore.geminiKey })[localProvider.value]
  if (!k)
    return ''
  return `${k.slice(0, 6)}••••••••••••••••${k.slice(-4)}`
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

  <v-dialog v-model="dialog" max-width="420">
    <v-card>
      <v-card-title class="font-mono-label text-sm tracking-widest text-uppercase pt-5 px-5">
        {{ t('settings.title') }}
      </v-card-title>

      <v-card-text class="px-5 pb-5">
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
            <v-btn variant="text" value="anthropic" class=" ">
              {{ PROVIDER_CONFIGS.anthropic.label }}
            </v-btn>
            <v-tooltip :text="t('settings.notAvailable')" location="top">
              <template #activator="{ props: ttProps }">
                <span v-bind="ttProps" class="flex-1-1 d-inline-flex" style="pointer-events: all;">
                  <v-btn variant="text" value="openai" class=" " disabled>
                    {{ PROVIDER_CONFIGS.openai.label }}
                  </v-btn>
                </span>
              </template>
            </v-tooltip>
            <v-tooltip :text="t('settings.notAvailable')" location="top">
              <template #activator="{ props: ttProps }">
                <span v-bind="ttProps" class="flex-1-1 d-inline-flex" style="pointer-events: all;">
                  <v-btn variant="text" value="gemini" class="" disabled>
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
        </div>

        <v-divider class="mb-5" />

        <!-- 每日精選設定 -->
        <div class="mb-5">
          <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-3">
            {{ t('settings.dailyBriefingSettings') }}
          </div>

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

          <p class="text-body-small mt-2">
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
            <!-- 載入中 -->
            <template v-if="modelsLoading[localProvider]">
              <v-skeleton-loader
                v-for="i in 3"
                :key="i"
                type="list-item-two-line"
                class="rounded"
              />
            </template>

            <!-- 錯誤 -->
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

            <!-- 未輸入 key -->
            <p
              v-else-if="!localKeys[localProvider]?.trim()"
              class="text-body-2 text-medium-emphasis"
            >
              {{ t('settings.enterKeyFirst') }}
            </p>

            <!-- 動態模型卡片 -->
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
      </v-card-text>

      <v-card-actions class="justify-end px-5 pb-5 pt-0">
        <v-btn
          variant="text"
          @click="dialog = false"
        >
          {{ t('settings.cancel') }}
        </v-btn>
        <v-btn
          variant="flat"
          @click="handleSave"
        >
          {{ t('settings.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
