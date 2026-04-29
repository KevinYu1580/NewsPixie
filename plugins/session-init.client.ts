import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Client-only：在 Nuxt app 初始化後執行
 * 1. detectAndClearLegacyKeys() — 一次性遷移舊版加密 localStorage 中的明文 key
 * 2. loadSessionMeta() — 從 np_session_meta cookie 還原 sessionMeta 至 store
 * 順序很重要：先清舊資料，再讀新 cookie。
 */
export default defineNuxtPlugin({
  name: 'newspixie-session-init',
  enforce: 'post',
  setup() {
    const settingsStore = useSettingsStore()
    settingsStore.detectAndClearLegacyKeys()
    settingsStore.loadSessionMeta()
  },
})
