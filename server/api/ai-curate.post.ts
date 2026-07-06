import { resolveAICredentials } from '~/server/utils/session'

interface CurateRequest {
  topicName: string
  keywords: string[]
  articles: { title: string, url: string }[]
  count: number
  model?: string
  provider?: string
}

interface CuratedArticle {
  title: string
  url: string
}

// AI 回覆非純 JSON 時，從文字中撈出數字陣列（如 [1, 3, 7]）
const INDEX_ARRAY_RE = /\[[\d,\s]+\]/

export default defineEventHandler(async (event) => {
  const body = await readJsonBody<CurateRequest>(event)

  const { topicName, keywords, articles, count } = body

  if (!articles || articles.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 articles' })
  }

  const { apiKey, provider, model } = resolveAICredentials(event, body)
  const { chat, model: resolvedModel } = createAIClient(apiKey, model, provider)

  const articleList = articles
    .map((a, i) => `${i + 1}. ${a.title}`)
    .join('\n')

  const prompt = `你是一位「${topicName}」領域的內容編輯。
主題關鍵字：${keywords.join('、')}

以下是從各來源收集到的文章標題（共 ${articles.length} 篇）：
${articleList}

請從中挑選最值得閱讀的 ${count} 篇，標準：
1. 與主題關鍵字高度相關
2. 具有新聞價值或深度洞察
3. 避免重複或過於相似的主題
4. 過濾非文章連結（如登入按鈕、廣告、佈局元件...等）

只回傳 JSON 陣列，格式如下（不要有任何額外文字）：
[1, 3, 7]（代表第幾篇文章的編號）`

  try {
    const text = await chat({
      model: resolvedModel,
      maxTokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const indices = parseAIJsonArray<number>(text, INDEX_ARRAY_RE)

    const selected: CuratedArticle[] = indices
      .filter(i => typeof i === 'number' && i >= 1 && i <= articles.length)
      .slice(0, count)
      .map(i => articles[i - 1]!)

    if (selected.length === 0) {
      return { selected: articles.slice(0, count) }
    }

    return { selected }
  }
  catch (error) {
    throw toApiError(error, 'AI 精選失敗')
  }
})
