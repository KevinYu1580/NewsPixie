import { resolveAICredentials } from '~/server/utils/session'

interface BriefingRequest {
  topicName: string
  headlines: string[]
  model?: string
  provider?: string
}

export default defineEventHandler(async (event) => {
  const body = await readJsonBody<BriefingRequest>(event)

  const { topicName, headlines } = body

  if (!headlines || headlines.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 headlines' })
  }

  const { apiKey, provider, model } = resolveAICredentials(event, body)
  const { chat, model: resolvedModel } = createAIClient(apiKey, model, provider)

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
    const summary = await chat({
      model: resolvedModel,
      maxTokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    return { summary, generatedAt: new Date().toISOString() }
  }
  catch (error) {
    throw toApiError(error, 'AI 摘要生成失敗')
  }
})
