import Anthropic from '@anthropic-ai/sdk'

interface ArticleWithContent {
  title: string
  url: string
  content: string
}

interface SummarizeRequest {
  topicName: string
  articles: ArticleWithContent[]
  apiKey?: string
  model?: string
}

export interface SummarizedArticle {
  title: string
  url: string
  summary: string
}

const ALLOWED_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
]

export default defineEventHandler(async (event) => {
  let body: SummarizeRequest
  try {
    body = await readBody<SummarizeRequest>(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '無效的請求格式' })
  }

  const { topicName, articles, apiKey: clientKey, model: clientModel } = body

  if (!articles || articles.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 articles' })
  }

  const config = useRuntimeConfig()
  const resolvedKey = clientKey?.trim() || config.anthropicApiKey

  if (!resolvedKey) {
    throw createError({
      statusCode: 503,
      statusMessage: '未設定 ANTHROPIC_API_KEY，請至右上角設定輸入 API Key',
    })
  }

  const model = clientModel && ALLOWED_MODELS.includes(clientModel)
    ? clientModel
    : 'claude-haiku-4-5-20251001'

  const client = new Anthropic({ apiKey: resolvedKey })

  const articlesText = articles.map((a, i) => {
    const trimmedContent = a.content.slice(0, 2000) // 限制每篇長度，節省 token
    return `=== 文章 ${i + 1}：${a.title} ===\n${trimmedContent}`
  }).join('\n\n')

  const prompt = `你是「${topicName}」領域的內容編輯，請為以下 ${articles.length} 篇文章各寫 1 至 5 句**繁體中文**摘要，聚焦在最核心的洞見或新聞價值，句子長度不限。

${articlesText}

只回傳 JSON 陣列，格式如下（不要有任何額外文字）：
["文章1摘要", "文章2摘要", ...]`

  try {
    const message = await client.messages.create({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'

    let summaries: string[]
    try {
      summaries = JSON.parse(text)
      if (!Array.isArray(summaries))
        summaries = []
    }
    catch {
      const match = text.match(/\[[\s\S]*\]/)
      summaries = match ? JSON.parse(match[0]) : []
    }

    const result: SummarizedArticle[] = articles.map((a, i) => ({
      title: a.title,
      url: a.url,
      summary: summaries[i] ?? '',
    }))

    return { articles: result, generatedAt: new Date().toISOString() }
  }
  catch (error) {
    const msg = error instanceof Error ? error.message : 'AI 摘要生成失敗'
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
