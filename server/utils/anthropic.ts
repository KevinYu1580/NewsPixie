import Anthropic from '@anthropic-ai/sdk'

export const ALLOWED_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
] as const

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'

/**
 * API key を検証し Anthropic クライアントとモデルを返す。
 * key が未設定なら 503 エラーを throw する。
 */
export function createAnthropicClient(clientKey: string | undefined, clientModel: string | undefined) {
  const config = useRuntimeConfig()
  const resolvedKey = clientKey?.trim() || config.anthropicApiKey

  if (!resolvedKey) {
    throw createError({
      statusCode: 503,
      statusMessage: '未設定 ANTHROPIC_API_KEY，請至右上角設定輸入 API Key',
    })
  }

  const model = clientModel && (ALLOWED_MODELS as readonly string[]).includes(clientModel)
    ? clientModel
    : DEFAULT_MODEL

  return { client: new Anthropic({ apiKey: resolvedKey }), model }
}
