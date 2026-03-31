interface ExtractRequest {
  content: string
  apiKey?: string
  model?: string
}

const MAX_CONTENT_LENGTH = 8000

export default defineEventHandler(async (event) => {
  let body: ExtractRequest
  try {
    body = await readBody<ExtractRequest>(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '無效的請求格式' })
  }

  const { content, apiKey: clientKey, model: clientModel } = body

  if (!content) {
    throw createError({ statusCode: 400, statusMessage: '缺少 content' })
  }

  const { client, model } = createAnthropicClient(clientKey, clientModel)

  const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH)

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
    const message = await client.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'

    let articles: { title: string, url: string }[]
    try {
      articles = JSON.parse(text)
      if (!Array.isArray(articles))
        articles = []
    }
    catch {
      const match = text.match(/\[[\s\S]*\]/)
      articles = match ? JSON.parse(match[0]) : []
    }

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
    const isOverloaded
      = (error as any)?.status === 529
        || (error as any)?.error?.type === 'overloaded_error'
    if (isOverloaded)
      throw createError({ statusCode: 503, statusMessage: 'AI 服務暫時過載，請稍後重試' })
    const msg = error instanceof Error ? error.message : 'AI 文章提取失敗'
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
