import type { H3Event } from 'h3'
import type { AIProvider } from '~/types/ai'
import process from 'node:process'
import { AI_PROVIDERS } from '~/types/ai'
import { decryptSessionPayload, encryptSessionPayload } from './session-crypto'

export type { AIProvider }

export interface SessionPayload {
  v: 1
  provider: AIProvider
  keys: Record<AIProvider, string>
  models: Record<AIProvider, string>
}

export interface SessionMeta {
  hasKey: boolean
  providers: AIProvider[]
  masked: Partial<Record<AIProvider, string>>
  models: Record<AIProvider, string>
  currentProvider: AIProvider
}

const SESSION_COOKIE = 'np_session'
const META_COOKIE = 'np_session_meta'
const MAX_AGE = 60 * 60 * 24 * 30

function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

function maskKey(key: string): string {
  const trimmed = key?.trim() ?? ''
  if (!trimmed)
    return ''
  if (trimmed.length <= 4)
    return `••••${trimmed}`
  return `••••${trimmed.slice(-4)}`
}

export function buildMeta(payload: SessionPayload): SessionMeta {
  const providers: AIProvider[] = []
  const masked: Partial<Record<AIProvider, string>> = {}
  AI_PROVIDERS.forEach((p) => {
    if (payload.keys[p]?.trim()) {
      providers.push(p)
      masked[p] = maskKey(payload.keys[p])
    }
  })
  return {
    hasKey: providers.length > 0,
    providers,
    masked,
    models: payload.models,
    currentProvider: payload.provider,
  }
}

export function readSession(event: H3Event): SessionPayload | null {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token)
    return null
  const payload = decryptSessionPayload<SessionPayload>(token)
  if (!payload || payload.v !== 1)
    return null
  return payload
}

export function writeSession(event: H3Event, payload: SessionPayload): SessionMeta {
  const token = encryptSessionPayload(payload)
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE,
  })
  const meta = buildMeta(payload)
  setCookie(event, META_COOKIE, JSON.stringify(meta), {
    httpOnly: false,
    secure: isProd(),
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE,
  })
  return meta
}

export interface ResolvedAICredentials {
  apiKey: string
  provider: AIProvider
  model: string
}

/**
 * 從 session cookie 解出當前 AI credentials。
 * `body.provider` 與 `body.model` 可選擇性 override（前者用於切換 provider、後者讓 client 指定模型）。
 * 找不到 session 或對應 provider 的 key → throw 401。
 */
export function resolveAICredentials(
  event: H3Event,
  body: { provider?: string, model?: string },
): ResolvedAICredentials {
  const session = readSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '尚未設定 API Key，請至右上角設定輸入' })
  }
  const candidate = body.provider as AIProvider | undefined
  const provider: AIProvider = candidate && AI_PROVIDERS.includes(candidate)
    ? candidate
    : session.provider
  const apiKey = session.keys[provider]?.trim()
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: `${provider} 尚未設定 API Key` })
  }
  const model = body.model?.trim() || session.models[provider]
  return { apiKey, provider, model }
}

export function clearSessionCookies(event: H3Event): void {
  for (const name of [SESSION_COOKIE, META_COOKIE]) {
    setCookie(event, name, '', {
      httpOnly: name === SESSION_COOKIE,
      secure: isProd(),
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })
  }
}
