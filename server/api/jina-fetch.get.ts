/**
 * Jina Reader proxy
 *
 * mode=list    抓取列表頁，回傳 { content: string }（raw markdown）
 * mode=content 抓取單篇文章，回傳 { content: string }
 */

interface JinaJsonResponse {
  code: number
  data: {
    title: string
    url: string
    content: string
    links: Record<string, string>
  }
}

const JINA_BASE = 'https://r.jina.ai/'
const JINA_HEADERS = {
  'Accept': 'application/json',
  'X-No-Cache': 'true',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url ? String(query.url) : null

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: '缺少 url 參數' })
  }

  let jinaRes: Response
  try {
    jinaRes = await fetch(`${JINA_BASE}${url}`, { headers: JINA_HEADERS })
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: `無法連接 Jina Reader: ${url}` })
  }

  if (!jinaRes.ok) {
    throw createError({ statusCode: jinaRes.status, statusMessage: `Jina 回應錯誤: ${jinaRes.status}` })
  }

  let json: JinaJsonResponse
  try {
    json = await jinaRes.json() as JinaJsonResponse
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Jina 回傳非 JSON 格式' })
  }

  return { content: json.data?.content ?? '' }
})
