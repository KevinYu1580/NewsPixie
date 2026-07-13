import type { AIModel, AIProvider } from '@/types/ai'
import { defineStore } from 'pinia'
import { CONTENT_CACHE_PREFIXES } from '@/constants'
import { getEncryptStorage } from '@/plugins/encrypt-storage'
import { clearLocalStorageCache } from '@/utils/utils'

export type { AIModel, AIProvider }
export type ThemeName = 'dark' | 'light'

export interface SessionMeta {
  hasKey: boolean
  providers: AIProvider[]
  masked: Partial<Record<AIProvider, string>>
  models: Record<AIProvider, string>
  currentProvider: AIProvider
}

const META_COOKIE = 'np_session_meta'
const LEGACY_KEYS = ['anthropicKey', 'openaiKey', 'geminiKey'] as const

function readMetaCookie(): SessionMeta | null {
  if (typeof document === 'undefined')
    return null
  const match = document.cookie.split('; ').find(r => r.startsWith(`${META_COOKIE}=`))
  if (!match)
    return null
  try {
    return JSON.parse(decodeURIComponent(match.slice(META_COOKIE.length + 1))) as SessionMeta
  }
  catch {
    return null
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const provider = ref<AIProvider>('anthropic')
  const themeName = ref<ThemeName>('dark')
  const mobileDrawerOpen = ref(false)
  /** 每日自動觸發時間，格式 HH:MM */
  const fetchTime = ref('07:00')
  /** 每個主題精選文章數量 */
  const articleCount = ref(5)
  /** 每個主題顯示的 repo 數量 */
  const repoCount = ref(8)

  /** 由 server-side cookie 帶出的非機密 session meta（hasKey、masked、models 等） */
  const sessionMeta = ref<SessionMeta | null>(null)
  /** 偵測到舊版 localStorage 內仍存有明文 key、需提示使用者重新輸入 */
  const legacyKeyDetected = ref(false)

  /** mock 模式（NUXT_PUBLIC_MOCK_MODE=1）下 UI 閘門一律視為已有 key */
  const mockMode = String(useRuntimeConfig().public.mockMode) === '1'

  const hasApiKey = computed(() => mockMode || !!sessionMeta.value?.hasKey)
  const currentModel = computed<string>(() => sessionMeta.value?.models[provider.value] ?? '')
  const maskedCurrentKey = computed<string>(() => sessionMeta.value?.masked?.[provider.value] ?? '')

  function setProvider(p: AIProvider) {
    provider.value = p
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

  function loadSessionMeta() {
    sessionMeta.value = readMetaCookie()
    if (sessionMeta.value?.currentProvider) {
      provider.value = sessionMeta.value.currentProvider
    }
  }

  function applyMeta(meta: SessionMeta) {
    sessionMeta.value = meta
    if (meta.currentProvider)
      provider.value = meta.currentProvider
  }

  async function clearSession() {
    try {
      await $fetch('/api/session/clear', { method: 'POST' })
    }
    finally {
      sessionMeta.value = null
      // 以已清除的 key 抓取的內容快取一併移除，避免殘留舊資料
      CONTENT_CACHE_PREFIXES.forEach(prefix => clearLocalStorageCache(prefix))
    }
  }

  /**
   * 一次性遷移：偵測舊版 localStorage 中仍以 encrypt-storage 加密儲存的明文 key 欄位。
   * 發現則：(1) 還原非機密欄位到 store (2) 清除 encrypted blob，讓 persistedstate 之後寫入
   * 新的明文 blob（已不含 keys） (3) 設旗標提示使用者重新輸入 API Key。
   */
  function detectAndClearLegacyKeys() {
    if (typeof localStorage === 'undefined')
      return
    if (localStorage.getItem('newspixie-key-migration-v2') === '1')
      return

    const storage = getEncryptStorage()
    if (!storage) {
      localStorage.setItem('newspixie-key-migration-v2', '1')
      return
    }

    try {
      const decrypted = storage.getItem<Record<string, unknown>>('newspixie-settings')
      if (decrypted && typeof decrypted === 'object') {
        const hasLegacy = LEGACY_KEYS.some((k) => {
          const v = decrypted[k]
          return typeof v === 'string' && v.trim().length > 0
        })
        if (hasLegacy) {
          if (typeof decrypted.provider === 'string')
            provider.value = decrypted.provider as AIProvider
          if (typeof decrypted.themeName === 'string')
            themeName.value = decrypted.themeName as ThemeName
          if (typeof decrypted.fetchTime === 'string')
            fetchTime.value = decrypted.fetchTime
          if (typeof decrypted.articleCount === 'number')
            articleCount.value = decrypted.articleCount
          if (typeof decrypted.repoCount === 'number')
            repoCount.value = decrypted.repoCount
          legacyKeyDetected.value = true
        }
      }
    }
    catch { /* 解密失敗（secret 變更等）忽略 */ }

    localStorage.removeItem('newspixie-settings')
    localStorage.setItem('newspixie-key-migration-v2', '1')
  }

  function dismissLegacyKeyHint() {
    legacyKeyDetected.value = false
  }

  return {
    provider,
    themeName,
    mobileDrawerOpen,
    fetchTime,
    articleCount,
    repoCount,
    sessionMeta,
    legacyKeyDetected,
    hasApiKey,
    currentModel,
    maskedCurrentKey,
    setProvider,
    setThemeName,
    setMobileDrawer,
    setFetchTime,
    setArticleCount,
    setRepoCount,
    loadSessionMeta,
    applyMeta,
    clearSession,
    detectAndClearLegacyKeys,
    dismissLegacyKeyHint,
  }
}, {
  persist: {
    key: 'newspixie-settings',
    pick: ['provider', 'themeName', 'mobileDrawerOpen', 'fetchTime', 'articleCount', 'repoCount'],
  },
})
