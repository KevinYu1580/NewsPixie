import { defineStore } from 'pinia'
import type { AIModel, AIProvider, AnthropicModel, GeminiModel, OpenAIModel } from '@/types/ai'
import { getEncryptStorage } from '@/plugins/encrypt-storage'

export type { AIProvider, AIModel, AnthropicModel, OpenAIModel, GeminiModel }
export type ThemeName = 'dark' | 'light'

export const useSettingsStore = defineStore('settings', () => {
  const provider = ref<AIProvider>('anthropic')
  const anthropicKey = ref('')
  const openaiKey = ref('')
  const geminiKey = ref('')
  const anthropicModel = ref<AnthropicModel>('claude-haiku-4-5-20251001')
  const openaiModel = ref<OpenAIModel>('gpt-4o-mini')
  const geminiModel = ref<GeminiModel>('gemini-2.0-flash')
  const themeName = ref<ThemeName>('dark')
  const mobileDrawerOpen = ref(false)
  /** 每日自動觸發時間，格式 HH:MM */
  const fetchTime = ref('07:00')
  /** 每個主題精選文章數量 */
  const articleCount = ref(5)
  /** 每個主題顯示的 repo 數量 */
  const repoCount = ref(8)

  const currentApiKey = computed(() =>
    ({ anthropic: anthropicKey, openai: openaiKey, gemini: geminiKey })[provider.value].value,
  )
  const currentModel = computed(() =>
    ({ anthropic: anthropicModel, openai: openaiModel, gemini: geminiModel })[provider.value].value,
  )
  const hasApiKey = computed(() => !!currentApiKey.value.trim())

  function setProvider(p: AIProvider) {
    provider.value = p
  }

  function setProviderKey(p: AIProvider, key: string) {
    if (p === 'anthropic') anthropicKey.value = key
    else if (p === 'openai') openaiKey.value = key
    else geminiKey.value = key
  }

  function setProviderModel(p: AIProvider, m: AIModel) {
    if (p === 'anthropic') anthropicModel.value = m as AnthropicModel
    else if (p === 'openai') openaiModel.value = m as OpenAIModel
    else geminiModel.value = m as GeminiModel
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
    provider,
    anthropicKey,
    openaiKey,
    geminiKey,
    anthropicModel,
    openaiModel,
    geminiModel,
    themeName,
    mobileDrawerOpen,
    fetchTime,
    articleCount,
    repoCount,
    currentApiKey,
    currentModel,
    hasApiKey,
    setProvider,
    setProviderKey,
    setProviderModel,
    setThemeName,
    setMobileDrawer,
    setFetchTime,
    setArticleCount,
    setRepoCount,
  }
}, {
  persist: {
    key: 'newspixie-settings',
    storage: import.meta.client
      ? {
          // lazy：每次讀寫才取 instance，確保 plugin 已初始化
          getItem: key => getEncryptStorage()?.getItem<string>(key) ?? null,
          setItem: (key, value) => getEncryptStorage()?.setItem(key, value),
        }
      : undefined,
  },
})
