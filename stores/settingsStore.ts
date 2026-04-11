import { defineStore } from 'pinia'

export type AnthropicModel = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' | 'claude-opus-4-6'
export type ThemeName = 'dark' | 'light'

export const MODEL_OPTIONS: { value: AnthropicModel, label: string, note: string }[] = [
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', note: '速度快、成本低（推薦）' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', note: '品質更高、速度適中' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6', note: '最高品質、成本較高' },
]

export const useSettingsStore = defineStore('settings', () => {
  const apiKey = ref('')
  const model = ref<AnthropicModel>('claude-haiku-4-5-20251001')
  const themeName = ref<ThemeName>('dark')
  const mobileDrawerOpen = ref(false)
  /** 每日自動觸發時間，格式 HH:MM */
  const fetchTime = ref('07:00')
  /** 每個主題精選文章數量 */
  const articleCount = ref(5)
  /** 每個主題顯示的 repo 數量 */
  const repoCount = ref(8)
  const hasApiKey = computed(() => !!apiKey.value.trim())

  function setApiKey(key: string) {
    apiKey.value = key
  }

  function setModel(m: AnthropicModel) {
    model.value = m
  }

  function setThemeName(name: ThemeName) {
    themeName.value = name
  }

  function setMobileDrawer(open: boolean) {
    mobileDrawerOpen.value = open
  }

  function setFetchTime(time: string) {
    fetchTime.value = time
  }

  function setArticleCount(count: number) {
    articleCount.value = Math.min(10, Math.max(3, count))
  }

  function setRepoCount(count: number) {
    repoCount.value = Math.min(10, Math.max(4, count))
  }

  return {
    apiKey,
    model,
    themeName,
    mobileDrawerOpen,
    fetchTime,
    articleCount,
    repoCount,
    hasApiKey,
    setApiKey,
    setModel,
    setThemeName,
    setMobileDrawer,
    setFetchTime,
    setArticleCount,
    setRepoCount,
  }
}, {
  persist: { key: 'newspixie-settings' },
})
