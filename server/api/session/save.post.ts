import type { AIProvider, SessionPayload } from '~/server/utils/session'
import { decryptEnvelope } from '~/server/utils/asymmetric'
import { writeSession } from '~/server/utils/session'

interface SavePayload {
  provider: AIProvider
  anthropicKey?: string
  openaiKey?: string
  geminiKey?: string
  anthropicModel?: string
  openaiModel?: string
  geminiModel?: string
}

const VALID_PROVIDERS: AIProvider[] = ['anthropic', 'openai', 'gemini']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = decryptEnvelope<SavePayload>(body)

  if (!VALID_PROVIDERS.includes(data.provider)) {
    throw createError({ statusCode: 400, statusMessage: '無效的 provider' })
  }

  const keys: Record<AIProvider, string> = {
    anthropic: (data.anthropicKey ?? '').trim(),
    openai: (data.openaiKey ?? '').trim(),
    gemini: (data.geminiKey ?? '').trim(),
  }

  const hasAny = VALID_PROVIDERS.some(p => keys[p].length > 0)
  if (!hasAny) {
    throw createError({ statusCode: 400, statusMessage: '至少需提供一組 API Key' })
  }

  const models: Record<AIProvider, string> = {
    anthropic: data.anthropicModel?.trim() || 'claude-haiku-4-5-20251001',
    openai: data.openaiModel?.trim() || 'gpt-4o-mini',
    gemini: data.geminiModel?.trim() || 'gemini-3-flash-preview',
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
