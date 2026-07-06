import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'

let cachedPrivKey: crypto.KeyObject | null = null
let cachedPubKeyPem: string | null = null

/**
 * 接受 PEM 或純 DER base64 兩種格式：
 * - PEM：含 `-----BEGIN ... KEY-----` headers
 * - DER：純 base64 字串（單行、無 headers），對應 PKCS#8 私鑰 / SPKI 公鑰
 */
function parseKey(input: string, kind: 'private' | 'public'): crypto.KeyObject {
  const trimmed = input.trim()
  if (trimmed.startsWith('-----BEGIN')) {
    return kind === 'private'
      ? crypto.createPrivateKey(trimmed)
      : crypto.createPublicKey(trimmed)
  }
  const der = Buffer.from(trimmed, 'base64')
  return kind === 'private'
    ? crypto.createPrivateKey({ key: der, format: 'der', type: 'pkcs8' })
    : crypto.createPublicKey({ key: der, format: 'der', type: 'spki' })
}

function loadKeys(): void {
  if (cachedPrivKey)
    return
  const config = useRuntimeConfig()
  const privInput = (config.rsaPrivateKey as string)?.trim()
  const pubInput = (config.rsaPublicKey as string)?.trim()
  if (!privInput || !pubInput) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_RSA_PRIVATE_KEY / NUXT_RSA_PUBLIC_KEY 未設定',
    })
  }
  cachedPrivKey = parseKey(privInput, 'private')
  // pubkey 端點固定回 PEM 給 client（client 端 importKey 接 SPKI DER 已從 PEM 解出）
  const pubKeyObj = parseKey(pubInput, 'public')
  cachedPubKeyPem = pubKeyObj.export({ format: 'pem', type: 'spki' }) as string
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
