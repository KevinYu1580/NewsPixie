import Anthropic from '@anthropic-ai/sdk'

interface BriefingRequest {
  topicName: string
  headlines: string[]
  apiKey?: string
  model?: string
}

const ALLOWED_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
]

export default defineEventHandler(async (event) => {
  let body: BriefingRequest
  try {
    body = await readBody<BriefingRequest>(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '無效的請求格式' })
  }

  const { topicName, headlines, apiKey: clientKey, model: clientModel } = body

  const config = useRuntimeConfig()
  const resolvedKey = clientKey?.trim() || config.anthropicApiKey

  if (!resolvedKey) {
    throw createError({
      statusCode: 503,
      statusMessage: '未設定 ANTHROPIC_API_KEY，請至右上角設定輸入 API Key',
    })
  }

  if (!headlines || headlines.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 headlines' })
  }

  const model = clientModel && ALLOWED_MODELS.includes(clientModel)
    ? clientModel
    : 'claude-haiku-4-5-20251001'

  const client = new Anthropic({ apiKey: resolvedKey })

  const headlineText = headlines
    .slice(0, 15)
    .map((h, i) => `${i + 1}. ${h}`)
    .join('\n')

  const prompt = `你是一位簡潔、精準的科技財經晨間播報員。
以下是今日「${topicName}」主題的熱門標題：

${headlineText}

請用**繁體中文**，以 3 句話（每句不超過 50 字）摘要今日最重要的趨勢或洞見。
風格：直接、犀利、有洞察力。不要用「今天」等模糊詞，聚焦在實質內容。
格式：直接輸出 3 句話，用換行分隔，不需要編號或符號。`

  try {
    const message = await client.messages.create({
      model,
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const summary
      = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    return { summary, generatedAt: new Date().toISOString() }
  }
  catch (error) {
    const msg = error instanceof Error ? error.message : 'AI 摘要生成失敗'
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
