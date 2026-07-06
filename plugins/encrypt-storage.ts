import { EncryptStorage } from 'encrypt-storage'

let instance: EncryptStorage | null = null

/** 僅在 plugin 初始化時呼叫，設定 secret 並建立 singleton */
export function initEncryptStorage(secret: string): void {
  if (instance)
    return
  if (!secret || secret.length < 10) {
    console.warn('[encrypt-storage] NUXT_PUBLIC_ENCRYPT_SECRET 未設定或長度不足 10 字元，settingsStore 將以明文儲存')
    return
  }
  instance = new EncryptStorage(secret, {
    storageType: 'localStorage',
    stateManagementUse: true,
  })
}

/** 取得 EncryptStorage 實例，未初始化時回傳 null */
export function getEncryptStorage(): EncryptStorage | null {
  return instance
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }
  const { public: pub } = useRuntimeConfig()
  initEncryptStorage(pub.encryptSecret as string)
})
