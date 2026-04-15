import type { RepoItem } from '@/types/content'
import { LANGUAGE_COLORS } from '@/constants'
import { generateId } from '@/utils/utils'

const GH_API = 'https://api.github.com'

interface GHRepo {
  id: number
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
}

interface GHSearchResult {
  items: GHRepo[]
}

/**
 * 抓取 GitHub 熱門 repos，依查詢字串（7 天內新建）
 */
export async function fetchGithubTrending(query: string, limit = 8): Promise<RepoItem[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const q = encodeURIComponent(`${query} created:>${sevenDaysAgo}`)
  const url = `${GH_API}/search/repositories?q=${q}&sort=stars&order=desc&per_page=${limit}`

  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (!res.ok)
    throw new Error(`GitHub 搜尋失敗: ${res.status}`)

  const data: GHSearchResult = await res.json()

  return data.items.map(r => ({
    id: generateId(),
    name: r.full_name,
    url: r.html_url,
    description: r.description ?? '',
    language: r.language ?? undefined,
    languageColor: r.language ? LANGUAGE_COLORS[r.language] : undefined,
    stars: r.stargazers_count,
    forks: r.forks_count,
    source: 'github' as const,
  }))
}
