import type { AIProvider, SessionPayload } from '~/server/utils/session'
import { DEFAULT_MODELS } from '~/server/utils/ai-client'
import { decryptEnvelope } from '~/server/utils/asymmetric'
import { readSession, writeSession } from '~/server/utils/session'
import { AI_PROVIDERS } from '~/types/ai'

interface SavePayload {
  provider: AIProvider
  anthropicKey?: string
  openaiKey?: string
  geminiKey?: string
  anthropicModel?: string
  openaiModel?: string
  geminiModel?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = decryptEnvelope<SavePayload>(body)

  if (!AI_PROVIDERS.includes(data.provider)) {
    throw createError({ statusCode: 400, statusMessage: '無效的 provider' })
  }

  // 合併式更新：空欄位 = 沿用 session 中既有的 key，清除 key 一律走 /api/session/clear
  const existing = readSession(event)

  const keys: Record<AIProvider, string> = {
    anthropic: (data.anthropicKey ?? '').trim() || existing?.keys.anthropic?.trim() || '',
    openai: (data.openaiKey ?? '').trim() || existing?.keys.openai?.trim() || '',
    gemini: (data.geminiKey ?? '').trim() || existing?.keys.gemini?.trim() || '',
  }

  const hasAny = AI_PROVIDERS.some(p => keys[p].length > 0)
  if (!hasAny) {
    throw createError({ statusCode: 400, statusMessage: '至少需提供一組 API Key' })
  }

  const models: Record<AIProvider, string> = {
    anthropic: data.anthropicModel?.trim() || existing?.models.anthropic || DEFAULT_MODELS.anthropic,
    openai: data.openaiModel?.trim() || existing?.models.openai || DEFAULT_MODELS.openai,
    gemini: data.geminiModel?.trim() || existing?.models.gemini || DEFAULT_MODELS.gemini,
  }

  const payload: SessionPayload = {
    v: 1,
    provider: data.provider,
    keys,
    models,
  }

  const meta = writeSession(event, payload)
  return { ok: true, meta }
})
