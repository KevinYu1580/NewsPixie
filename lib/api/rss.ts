import type { ContentSource, NewsItem } from '@/types/content'
import { XMLParser } from 'fast-xml-parser'
import { extractDomain, generateId } from '@/lib/utils'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
})

interface RssItem {
  'title'?: string | { '#text': string }
  'link'?: string | { '#text': string }
  'description'?: string
  'pubDate'?: string
  'dc:creator'?: string
  'author'?: string
  'guid'?: string | { '#text': string }
}

function getText(val: unknown): string {
  if (typeof val === 'string')
    return val
  if (val && typeof val === 'object' && '#text' in (val as object)) {
    return String((val as Record<string, unknown>)['#text'])
  }
  return ''
}

/**
 * 抓取並解析 RSS feed
 */
export async function fetchRss(feedUrl: string, limit = 8): Promise<NewsItem[]> {
  const res = await fetch(feedUrl, {
    headers: { 'User-Agent': 'NewsPixie/1.0' },
  })

  if (!res.ok)
    throw new Error(`RSS 抓取失敗 (${feedUrl}): ${res.status}`)

  const xml = await res.text()
  const parsed = parser.parse(xml)

  const items: RssItem[]
    = parsed?.rss?.channel?.item
      ?? parsed?.feed?.entry
      ?? []

  const itemArray = Array.isArray(items) ? items : [items]
  const source: ContentSource = 'jina'

  return itemArray.slice(0, limit).map((item) => {
    const title = getText(item.title)
    const link = getText(item.link) || getText(item.guid)
    const author = getText(item['dc:creator']) || getText(item.author)
    const pubDate = item.pubDate ?? ''

    return {
      id: generateId(),
      title,
      url: link,
      source,
      author: author || undefined,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      domain: link ? extractDomain(link) : undefined,
    }
  }).filter(item => item.title && item.url)
}
