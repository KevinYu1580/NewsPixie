export interface EncryptedEnvelope {
  wrappedKey: string
  iv: string
  ciphertext: string
}

let cachedPubKey: CryptoKey | null = null

const PEM_HEADER_RE = /-----BEGIN [^-]+-----/
const PEM_FOOTER_RE = /-----END [^-]+-----/
const WHITESPACE_RE = /\s+/g

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(PEM_HEADER_RE, '').replace(PEM_FOOTER_RE, '').replace(WHITESPACE_RE, '')
  const binary = atob(b64)
  const buf = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i)
  return buf
}

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!)
  return btoa(s)
}

async function getServerPubKey(): Promise<CryptoKey> {
  if (cachedPubKey)
    return cachedPubKey
  const { pubkey } = await $fetch<{ pubkey: string }>('/api/session/pubkey')
  cachedPubKey = await crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(pubkey),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  )
  return cachedPubKey
}

/** 用 server RSA 公鑰 + 隨機 AES-256-GCM 加密任意 JSON-serializable payload */
export async function encryptPayload(obj: unknown): Promise<EncryptedEnvelope> {
  const pubkey = await getServerPubKey()
  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt'],
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(JSON.stringify(obj)),
  )
  const rawAes = await crypto.subtle.exportKey('raw', aesKey)
  const wrapped = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubkey, rawAes)
  return {
    wrappedKey: bufToB64(wrapped),
    iv: bufToB64(iv),
    ciphertext: bufToB64(ct),
  }
}

export function clearPubKeyCache(): void {
  cachedPubKey = null
}
