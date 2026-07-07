/**
 * OG Image proxy
 *
 * GET /api/og-image?url=<article URL>
 * 只抓前 16KB HTML，解析 og:image / twitter:image meta tag
 * 回傳 { imageUrl: string | null }
 */

const MAX_HTML_BYTES = 16 * 1024

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url ? String(query.url) : null

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: '缺少 url 參數' })
  }

  if (isMockMode()) {
    return { imageUrl: mockOgImagePath(url) }
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsPixie/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return { imageUrl: null }
    }

    // 只讀前 MAX_HTML_BYTES，避免下載整頁
    const reader = res.body?.getReader()
    if (!reader) {
      return { imageUrl: null }
    }

    let html = ''
    let received = 0
    const decoder = new TextDecoder()

    while (received < MAX_HTML_BYTES) {
      const { done, value } = await reader.read()
      if (done)
        break
      html += decoder.decode(value, { stream: true })
      received += value.byteLength
      // 找到 </head> 就停
      if (html.includes('</head>'))
        break
    }
    reader.cancel()

    const imageUrl = parseOgImage(html)
    return { imageUrl }
  }
  catch {
    return { imageUrl: null }
  }
})

// og:image / twitter:image meta tag（各含屬性正序與反序兩種寫法）
const OG_IMAGE_RE = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
const OG_IMAGE_REVERSED_RE = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
const TWITTER_IMAGE_RE = /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
const TWITTER_IMAGE_REVERSED_RE = /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i

function parseOgImage(html: string): string | null {
  const ogMatch = html.match(OG_IMAGE_RE) ?? html.match(OG_IMAGE_REVERSED_RE)

  if (ogMatch?.[1])
    return ogMatch[1]

  const twMatch = html.match(TWITTER_IMAGE_RE) ?? html.match(TWITTER_IMAGE_REVERSED_RE)

  if (twMatch?.[1])
    return twMatch[1]

  return null
}
