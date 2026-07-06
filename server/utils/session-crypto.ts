import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'

let cachedKey: Buffer | null = null

function getKey(): Buffer {
  if (cachedKey)
    return cachedKey
  const config = useRuntimeConfig()
  const secret = (config.sessionSecret as string)?.trim()
  if (!secret || secret.length < 16) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_SESSION_SECRET 未設定或長度不足（需 ≥16 字元）',
    })
  }
  cachedKey = crypto.scryptSync(secret, 'newspixie-session-v1', 32)
  return cachedKey
}

/** AES-256-GCM 加密任意 JSON-serializable payload，回 base64(iv ‖ ciphertext ‖ authTag) */
export function encryptSessionPayload(payload: unknown): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const plain = Buffer.from(JSON.stringify(payload), 'utf8')
  const ct = Buffer.concat([cipher.update(plain), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, ct, authTag]).toString('base64')
}

export function decryptSessionPayload<T = unknown>(token: string): T | null {
  try {
    const key = getKey()
    const buf = Buffer.from(token, 'base64')
    if (buf.length < 12 + 16 + 1)
      return null
    const iv = buf.subarray(0, 12)
    const authTag = buf.subarray(buf.length - 16)
    const ct = buf.subarray(12, buf.length - 16)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    const plain = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
    return JSON.parse(plain) as T
  }
  catch {
    return null
  }
}
