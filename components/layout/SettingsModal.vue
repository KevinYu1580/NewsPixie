<script setup lang="ts">
import type { AnthropicModel } from '@/stores/settingsStore'
import { MODEL_OPTIONS, useSettingsStore } from '@/stores/settingsStore'

const props = withDefaults(defineProps<{
  forceOpen?: boolean
}>(), {
  forceOpen: false,
})

const settingsStore = useSettingsStore()

const dialog = ref(false)
const keyInput = ref('')
const showKey = ref(false)
const saved = ref(false)

function openDialog() {
  keyInput.value = settingsStore.apiKey
  saved.value = false
  dialog.value = true
}

function handleSave() {
  settingsStore.setApiKey(keyInput.value.trim())
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2000)
}

const dialogModel = computed({
  get: () => props.forceOpen || dialog.value,
  set: (value) => {
    if (!props.forceOpen)
      dialog.value = value
  },
})

const maskedKey = computed(() => {
  const k = settingsStore.apiKey
  if (!k)
    return ''
  return `${k.slice(0, 8)}••••••••••••••••${k.slice(-4)}`
})

const canSave = computed(() =>
  !!keyInput.value.trim() && keyInput.value.trim() !== settingsStore.apiKey,
)

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

  <v-dialog v-model="dialogModel" max-width="400">
    <v-card>
      <v-card-title class="font-mono-label text-sm tracking-widest text-uppercase pt-5 px-5">
        設定
      </v-card-title>

      <v-card-text class="px-5 pb-5">
        <p
          v-if="showForceMessage"
          class="text-body-2 text-medium-emphasis mb-4"
        >
          NewsPixie 依賴 Anthropic AI，請先輸入 API Key 以開始使用。
        </p>

        <!-- API Key -->
        <div class="mb-5">
          <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
            Anthropic API Key
          </div>
          <div v-if="settingsStore.apiKey" class="font-mono-label text-caption text-medium-emphasis mb-2">
            目前：{{ maskedKey }}
          </div>
          <div class="d-flex align-center ga-2">
            <v-text-field
              v-model="keyInput"
              :type="showKey ? 'text' : 'password'"
              placeholder="sk-ant-..."
              density="compact"
              variant="outlined"
              hide-details
              aria-label="Anthropic API Key"
              class="flex-grow-1"
              @update:model-value="saved = false"
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
            <v-btn
              :disabled="!canSave"
              :prepend-icon="saved ? 'mdi-check-circle' : undefined"
              variant="flat"
              size="small"
              @click="handleSave"
            >
              {{ saved ? '已儲存' : '儲存' }}
            </v-btn>
          </div>

          <p
            class="text-body-small mt-2"
          >
            Key 儲存於瀏覽器 localStorage，不會傳送至任何第三方。
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
            :model-value="settingsStore.fetchTime"
            type="time"
            density="compact"
            variant="outlined"
            hide-details
            aria-label="每日自動觸發時間"
            class="mb-3"
            @update:model-value="settingsStore.setFetchTime($event as string)"
          />

          <p
            class="text-body-small mt-2"
          >
            App 開啟後若已過觸發時間且當日尚未抓取，將自動執行一次。
          </p>

          <div class="d-flex ga-3">
            <div class="flex-1-1">
              <div class="text-caption text-medium-emphasis mb-1">
                精選篇數（4–10）
              </div>
              <v-text-field
                :model-value="settingsStore.articleCount"
                type="number"
                min="4"
                max="10"
                density="compact"
                variant="outlined"
                hide-details
                aria-label="每主題精選文章數量"
                @update:model-value="settingsStore.setArticleCount(Number($event))"
              />
            </div>
            <div class="flex-1-1">
              <div class="text-caption text-medium-emphasis mb-1">
                Repo 數（4–10）
              </div>
              <v-text-field
                :model-value="settingsStore.repoCount"
                type="number"
                min="4"
                max="10"
                density="compact"
                variant="outlined"
                hide-details
                aria-label="每主題顯示 Repo 數量"
                @update:model-value="settingsStore.setRepoCount(Number($event))"
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
              v-for="opt in MODEL_OPTIONS"
              :key="opt.value"
              :variant="settingsStore.model === opt.value ? 'tonal' : 'outlined'"
              :color="settingsStore.model === opt.value ? 'np-accent' : undefined"
              class="cursor-pointer"
              :aria-pressed="settingsStore.model === opt.value"
              @click="settingsStore.setModel(opt.value as AnthropicModel)"
            >
              <v-card-text class="d-flex align-start ga-3 pa-3">
                <v-icon
                  :icon="settingsStore.model === opt.value ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
                  :color="settingsStore.model === opt.value ? 'np-accent' : 'medium-emphasis'"
                  size="small"
                  class="mt-0"
                />
                <div>
                  <div
                    class="text-body-2 font-weight-medium"
                    :class="settingsStore.model === opt.value ? 'text-np-accent' : ''"
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
    </v-card>
  </v-dialog>
</template>
