<script setup lang="ts">
import type { AIModel, AIProvider } from '@/types/ai'
import { useSettingsStore } from '@/stores/settingsStore'
import { PROVIDER_CONFIGS } from '@/types/ai'

const props = withDefaults(defineProps<{
  forceOpen?: boolean
}>(), {
  forceOpen: false,
})

const settingsStore = useSettingsStore()

const dialog = ref(false)
const localProvider = ref<AIProvider>('anthropic')
const localKeys = ref<Record<AIProvider, string>>({ anthropic: '', openai: '', gemini: '' })
const localModels = ref<Record<AIProvider, AIModel>>({
  anthropic: 'claude-haiku-4-5-20251001',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
})
const localFetchTime = ref('')
const localArticleCount = ref(5)
const localRepoCount = ref(8)
const showKey = ref(false)

const providers = ['anthropic', 'openai', 'gemini'] as const

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
}

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

const dialogModel = computed({
  get: () => props.forceOpen || dialog.value,
  set: (value) => {
    if (!props.forceOpen)
      dialog.value = value
  },
})

const currentConfig = computed(() => PROVIDER_CONFIGS[localProvider.value])

const maskedKey = computed(() => {
  const k = ({ anthropic: settingsStore.anthropicKey, openai: settingsStore.openaiKey, gemini: settingsStore.geminiKey })[localProvider.value]
  if (!k)
    return ''
  return `${k.slice(0, 6)}••••••••••••••••${k.slice(-4)}`
})

const canSave = computed(() => !!localKeys.value[localProvider.value].trim())

const showForceMessage = computed(() => props.forceOpen || !settingsStore.hasApiKey)

watch(() => props.forceOpen, (forceOpen, wasForceOpen) => {
  if (forceOpen) {
    openDialog()
    return
  }
  if (wasForceOpen && settingsStore.hasApiKey)
    dialog.value = false
}, { immediate: true })
</script>

<template>
  <v-btn
    v-if="!forceOpen"
    icon="mdi-cog-outline"
    variant="text"
    size="small"
    aria-label="開啟設定"
    @click="openDialog"
  />

  <v-dialog v-model="dialogModel" max-width="420">
    <v-card>
      <v-card-title class="font-mono-label text-sm tracking-widest text-uppercase pt-5 px-5">
        設定
      </v-card-title>

      <v-card-text class="px-5 pb-5">
        <p
          v-if="showForceMessage"
          class="text-body-2 text-medium-emphasis mb-4"
        >
          NewsPixie 依賴 AI 服務，請先選擇 Provider 並輸入 API Key 以開始使用。
        </p>

        <!-- Provider 選擇 -->
        <div class="mb-5">
          <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
            AI Provider
          </div>
          <v-btn-toggle
            v-model="localProvider"
            mandatory
            density="compact"
            variant="outlined"
            divided
            color="np-accent"
            class="w-100"
          >
            <v-btn
              v-for="p in providers"
              :key="p"
              :value="p"
              class="flex-1-1 text-caption"
            >
              {{ PROVIDER_CONFIGS[p].label }}
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- API Key -->
        <div class="mb-5">
          <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
            API Key
          </div>
          <div
            v-if="maskedKey"
            class="font-mono-label text-caption text-medium-emphasis mb-2"
          >
            目前：{{ maskedKey }}
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
            >
              <template #append-inner>
                <v-btn
                  :icon="showKey ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="text"
                  size="x-small"
                  :aria-label="showKey ? '隱藏 API Key' : '顯示 API Key'"
                  @click="showKey = !showKey"
                />
              </template>
            </v-text-field>
          </div>
          <p class="text-body-small mt-2">
            Key 儲存於瀏覽器 localStorage並且經過加密(AES)，不會傳送至任何第三方。
          </p>
        </div>

        <v-divider class="mb-5" />

        <!-- 每日精選設定 -->
        <div class="mb-5">
          <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-3">
            每日精選設定
          </div>

          <div class="text-caption text-medium-emphasis mb-1">
            自動觸發時間
          </div>
          <v-text-field
            v-model="localFetchTime"
            type="time"
            density="compact"
            variant="outlined"
            hide-details
            aria-label="每日自動觸發時間"
            class="mb-3"
          />

          <p class="text-body-small mt-2">
            App 開啟後若已過觸發時間且當日尚未抓取，將自動執行一次。
          </p>

          <div class="d-flex ga-3">
            <div class="flex-1-1">
              <div class="text-caption text-medium-emphasis mb-1">
                精選篇數（4–10）
              </div>
              <v-text-field
                v-model.number="localArticleCount"
                type="number"
                min="4"
                max="10"
                density="compact"
                variant="outlined"
                hide-details
                aria-label="每主題精選文章數量"
              />
            </div>
            <div class="flex-1-1">
              <div class="text-caption text-medium-emphasis mb-1">
                Repo 數（4–10）
              </div>
              <v-text-field
                v-model.number="localRepoCount"
                type="number"
                min="4"
                max="10"
                density="compact"
                variant="outlined"
                hide-details
                aria-label="每主題顯示 Repo 數量"
              />
            </div>
          </div>
        </div>

        <v-divider class="mb-5" />

        <!-- 模型選擇 -->
        <div>
          <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
            AI 摘要模型
          </div>
          <div class="d-flex flex-column ga-2">
            <v-card
              v-for="opt in currentConfig.models"
              :key="opt.value"
              :variant="localModels[localProvider] === opt.value ? 'tonal' : 'outlined'"
              :color="localModels[localProvider] === opt.value ? 'np-accent' : undefined"
              class="cursor-pointer"
              :aria-pressed="localModels[localProvider] === opt.value"
              @click="localModels[localProvider] = opt.value"
            >
              <v-card-text class="d-flex align-start ga-3 pa-3">
                <v-icon
                  :icon="localModels[localProvider] === opt.value ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
                  :color="localModels[localProvider] === opt.value ? 'np-accent' : 'medium-emphasis'"
                  size="small"
                  class="mt-0"
                />
                <div>
                  <div
                    class="text-body-2 font-weight-medium"
                    :class="localModels[localProvider] === opt.value ? 'text-np-accent' : ''"
                  >
                    {{ opt.label }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ opt.note }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-end px-5 pb-5 pt-0">
        <v-btn
          v-if="!forceOpen"
          variant="text"
          @click="dialog = false"
        >
          取消
        </v-btn>
        <v-btn
          :disabled="!canSave"
          variant="flat"
          @click="handleSave"
        >
          儲存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
