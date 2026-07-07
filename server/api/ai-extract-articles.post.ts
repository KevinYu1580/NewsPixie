import { calcExtractMaxTokens, MAX_CONTENT_LENGTH } from '~/constants'
import { resolveAICredentials } from '~/server/utils/session'

interface ExtractRequest {
  content: string
  model?: string
  provider?: string
}

export default defineEventHandler(async (event) => {
  const body = await readJsonBody<ExtractRequest>(event)

  const { content } = body

  if (!content) {
    throw createError({ statusCode: 400, statusMessage: '缺少 content' })
  }

  if (isMockMode()) {
    return { articles: MOCK_ARTICLES }
  }

  const { apiKey, provider, model } = resolveAICredentials(event, body)
  const { chat, model: resolvedModel } = createAIClient(apiKey, model, provider)

  const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH)
  const maxTokens = calcExtractMaxTokens(trimmedContent.length)

  const prompt = `以下是一個網頁的 Markdown 內容。請從中提取所有「新聞文章」或「部落格文章」的標題與 URL。

規則：
- 只提取真正的文章連結（有明確標題且指向文章頁面的）
- 排除：導航選單、分類頁、登入/註冊、圖片連結、廣告、頁尾連結、社群連結
- 標題必須是人類可讀的文字，不是 "Image 1" 或 "See all" 這種
- 如果同一篇文章出現多次，只保留一次

Markdown 內容：
${trimmedContent}

只回傳 JSON 陣列，格式如下（不要有任何額外文字）：
[{"title": "文章標題", "url": "https://..."}, ...]`

  try {
    const text = await chat({
      model: resolvedModel,
      maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })

    let articles = parseAIJsonArray<{ title: string, url: string }>(text)

    // 去重
    const seen = new Set<string>()
    articles = articles.filter((a) => {
      if (!a.title || !a.url || seen.has(a.url))
        return false
      seen.add(a.url)
      return true
    })

    return { articles }
  }
  catch (error) {
    throw toApiError(error, 'AI 文章提取失敗')
  }
})
