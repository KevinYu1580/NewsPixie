import type { AIProvider, SessionPayload } from '~/server/utils/session'
import { DEFAULT_MODELS } from '~/server/utils/ai-client'
import { decryptEnvelope } from '~/server/utils/asymmetric'
import { writeSession } from '~/server/utils/session'
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

  const keys: Record<AIProvider, string> = {
    anthropic: (data.anthropicKey ?? '').trim(),
    openai: (data.openaiKey ?? '').trim(),
    gemini: (data.geminiKey ?? '').trim(),
  }

  const hasAny = AI_PROVIDERS.some(p => keys[p].length > 0)
  if (!hasAny) {
    throw createError({ statusCode: 400, statusMessage: '至少需提供一組 API Key' })
  }

  const models: Record<AIProvider, string> = {
    anthropic: data.anthropicModel?.trim() || DEFAULT_MODELS.anthropic,
    openai: data.openaiModel?.trim() || DEFAULT_MODELS.openai,
    gemini: data.geminiModel?.trim() || DEFAULT_MODELS.gemini,
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
