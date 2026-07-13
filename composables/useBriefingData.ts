import type { RepoItem } from '@/types/content'
import type { Topic } from '@/types/topic'
import { GITHUB_CACHE_PREFIX, MAX_CACHE_DAYS } from '@/constants'
import { useSettingsStore } from '@/stores/settingsStore'
import { getErrorMessage, loadTodayCache, saveTodayCache, todayStr } from '@/utils/utils'

const CACHE_PREFIX = GITHUB_CACHE_PREFIX

interface GithubTrendingCache {
  topicId: string
  date: string
  repos: RepoItem[]
  cachedAt: string
}

const WHITESPACE_RE = /\s/

/** 把 githubKeywords chips 組成 GitHub Search query 字串（含空白自動加引號） */
function buildGithubQuery(githubKeywords: string[]): string {
  return githubKeywords
    .map(k => k.trim())
    .filter(Boolean)
    .map(k => (WHITESPACE_RE.test(k) ? `"${k}"` : k))
    .join(' ')
}

async function fetchFromApi(query: string, limit: number): Promise<RepoItem[]> {
  const res = await fetch(`/api/github-trending?query=${encodeURIComponent(query)}&limit=${limit}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { statusMessage?: string, message?: string, error?: string }).statusMessage
      ?? (err as { statusMessage?: string, message?: string, error?: string }).message
      ?? (err as { statusMessage?: string, message?: string, error?: string }).error
      ?? res.statusText
      ?? `請求失敗: ${res.status}`,
    )
  }
  return res.json() as Promise<RepoItem[]>
}

/** 抓取 GitHub Trending，結果快取於 localStorage，當日有快取則直接讀取 */
export function useGithubTrending(topic: Ref<Topic | null>) {
  const data = ref<RepoItem[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const error = ref<string | null>(null)
  const cachedAt = ref('')
  const settingsStore = useSettingsStore()

  function loadFromCache(): boolean {
    if (!topic.value)
      return false
    const cached = loadTodayCache<GithubTrendingCache>(CACHE_PREFIX, topic.value.id)
    if (cached) {
      data.value = cached.repos
      cachedAt.value = cached.cachedAt
      return true
    }
    return false
  }

  async function fetch_(forceRefresh = false) {
    if (!settingsStore.hasApiKey)
      return

    if (!topic.value)
      return
    if (!forceRefresh && loadFromCache())
      return

    isLoading.value = true
    isError.value = false
    error.value = null
    try {
      const query = buildGithubQuery(topic.value.githubKeywords ?? [])
      const repos = await fetchFromApi(query, settingsStore.repoCount)

      // AI 擴寫 description（有 API key 才執行，失敗不影響主流程）
      if (settingsStore.hasApiKey) {
        try {
          const result = await $fetch<{ descriptions: { name: string, description: string }[] }>('/api/ai-repo-describe', {
            method: 'POST',
            body: {
              topicName: topic.value.name,
              repos: repos.map(r => ({ name: r.name, description: r.description, language: r.language, stars: r.stars })),
              model: settingsStore.currentModel,
              provider: settingsStore.provider,
            },
          })
          const descMap = new Map(result.descriptions.map(d => [d.name, d.description]))
          repos.forEach((r) => {
            r.description = descMap.get(r.name) ?? r.description
          })
        }
        catch { /* 靜默失敗，保留原始 description */ }
      }

      data.value = repos
      const now = new Date().toISOString()
      const entry: GithubTrendingCache = { topicId: topic.value.id, date: todayStr(), repos, cachedAt: now }
      saveTodayCache(CACHE_PREFIX, topic.value.id, entry, MAX_CACHE_DAYS)
      cachedAt.value = now
    }
    catch (err) {
      isError.value = true
      error.value = getErrorMessage(err) ?? '抓取趨勢 Repos 失敗，請稍後再試。'
    }
    finally {
      isLoading.value = false
    }
  }

  watch(topic, () => fetch_(), { immediate: true })

  watch(() => settingsStore.hasApiKey, (hasKey) => {
    if (hasKey)
      fetch_()
  })

  return { data, isLoading, isError, error, cachedAt, refetch: () => fetch_(true) }
}
