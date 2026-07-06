import { calcSummarizeMaxTokens } from '~/constants'
import { resolveAICredentials } from '~/server/utils/session'

interface ArticleWithContent {
  title: string
  url: string
  content: string
}

interface SummarizeRequest {
  topicName: string
  articles: ArticleWithContent[]
  model?: string
  provider?: string
}

export interface SummarizedArticle {
  title: string
  url: string
  summary: string
}

export default defineEventHandler(async (event) => {
  const body = await readJsonBody<SummarizeRequest>(event)

  const { topicName, articles } = body

  if (!articles || articles.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 articles' })
  }

  const { apiKey, provider, model } = resolveAICredentials(event, body)
  const { chat, model: resolvedModel } = createAIClient(apiKey, model, provider)
  const maxTokens = calcSummarizeMaxTokens(articles.length)

  const articlesText = articles.map((a, i) => {
    const trimmedContent = a.content.slice(0, 2000)
    return `=== 文章 ${i + 1}：${a.title} ===\n${trimmedContent}`
  }).join('\n\n')

  const prompt = `你是「${topicName}」領域的內容編輯，請為以下 ${articles.length} 篇文章各寫 1 至 5 句**繁體中文**摘要，聚焦在最核心的洞見或新聞價值，句子長度不限。

${articlesText}

只回傳 JSON 陣列，格式如下（不要有任何額外文字）：
["文章1摘要", "文章2摘要", ...]`

  try {
    const text = await chat({
      model: resolvedModel,
      maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })

    const summaries = parseAIJsonArray<string>(text)

    const result: SummarizedArticle[] = articles.map((a, i) => ({
      title: a.title,
      url: a.url,
      summary: summaries[i] ?? '',
    }))

    return { articles: result, generatedAt: new Date().toISOString() }
  }
  catch (error) {
    throw toApiError(error, 'AI 摘要生成失敗')
  }
})
