import crypto from 'node:crypto'

let cachedPrivKey: crypto.KeyObject | null = null
let cachedPubKeyPem: string | null = null

function loadKeys(): void {
  if (cachedPrivKey)
    return
  const config = useRuntimeConfig()
  const privPem = (config.rsaPrivateKey as string)?.trim()
  const pubPem = (config.rsaPublicKey as string)?.trim()
  if (!privPem || !pubPem) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_RSA_PRIVATE_KEY / NUXT_RSA_PUBLIC_KEY 未設定',
    })
  }
  cachedPrivKey = crypto.createPrivateKey(privPem)
  cachedPubKeyPem = pubPem
}

export function getPublicKeyPem(): string {
  loadKeys()
  return cachedPubKeyPem!
}

export interface EncryptedEnvelope {
  wrappedKey: string
  iv: string
  ciphertext: string
}

function isEnvelope(v: unknown): v is EncryptedEnvelope {
  if (!v || typeof v !== 'object')
    return false
  const o = v as Record<string, unknown>
  return typeof o.wrappedKey === 'string'
    && typeof o.iv === 'string'
    && typeof o.ciphertext === 'string'
}

export function decryptEnvelope<T = unknown>(env: unknown): T {
  if (!isEnvelope(env)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid encrypted payload' })
  }
  loadKeys()
  try {
    const aesKey = crypto.privateDecrypt(
      {
        key: cachedPrivKey!,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(env.wrappedKey, 'base64'),
    )
    const iv = Buffer.from(env.iv, 'base64')
    const fullCt = Buffer.from(env.ciphertext, 'base64')
    if (fullCt.length < 16) {
      throw new Error('ciphertext too short')
    }
    const authTag = fullCt.subarray(fullCt.length - 16)
    const ct = fullCt.subarray(0, fullCt.length - 16)
    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    const plain = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
    return JSON.parse(plain) as T
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid encrypted payload' })
  }
}
