import { calcSummarizeMaxTokens } from '~/constants'

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
  provider?: string
}

export interface SummarizedArticle {
  title: string
  url: string
  summary: string
}

export default defineEventHandler(async (event) => {
  let body: SummarizeRequest
  try {
    body = await readBody<SummarizeRequest>(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '無效的請求格式' })
  }

  const { topicName, articles, apiKey: clientKey, model: clientModel, provider: clientProvider } = body

  if (!articles || articles.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 articles' })
  }

  const { chat, model } = createAIClient(clientKey, clientModel, clientProvider)
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
      model,
      maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })

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
