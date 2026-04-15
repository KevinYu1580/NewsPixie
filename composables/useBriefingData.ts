import type { RepoItem } from '@/types/content'
import type { Topic } from '@/types/topic'
import { MAX_CACHE_DAYS } from '@/constants'
import { useSettingsStore } from '@/stores/settingsStore'

const CACHE_PREFIX = 'newspixie-github'

interface GithubTrendingCache {
  topicId: string
  date: string
  repos: RepoItem[]
  cachedAt: string
}

function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object')
    return null

  const err = error as {
    statusMessage?: string
    message?: string
    data?: { statusMessage?: string, message?: string, error?: string }
    response?: { _data?: { statusMessage?: string, message?: string, error?: string } }
  }

  return err.data?.statusMessage
    ?? err.response?._data?.statusMessage
    ?? err.data?.message
    ?? err.response?._data?.message
    ?? err.statusMessage
    ?? err.data?.error
    ?? err.response?._data?.error
    ?? err.message
    ?? null
}

function todayStr(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function cacheKey(topicId: string): string {
  return `${CACHE_PREFIX}-${topicId}-${todayStr()}`
}

function loadCache(topicId: string): GithubTrendingCache | null {
  if (typeof window === 'undefined')
    return null
  try {
    const raw = localStorage.getItem(cacheKey(topicId))
    if (!raw)
      return null
    return JSON.parse(raw) as GithubTrendingCache
  }
  catch {
    return null
  }
}

function saveCache(topicId: string, repos: RepoItem[]): void {
  if (typeof window === 'undefined')
    return
  const entry: GithubTrendingCache = { topicId, date: todayStr(), repos, cachedAt: new Date().toISOString() }
  localStorage.setItem(cacheKey(topicId), JSON.stringify(entry))
  pruneOldCache()
}

function pruneOldCache(): void {
  const today = new Date()
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(CACHE_PREFIX))
      continue
    const dateStr = key.slice(-10)
    const date = new Date(dateStr!)
    if (!Number.isNaN(date.getTime())) {
      const diffDays = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays > MAX_CACHE_DAYS)
        keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
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
    const cached = loadCache(topic.value.id)
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
      const repos = await fetchFromApi(topic.value.githubQuery, settingsStore.repoCount)

      // AI 擴寫 description（有 API key 才執行，失敗不影響主流程）
      if (settingsStore.currentApiKey) {
        try {
          const result = await $fetch<{ descriptions: { name: string, description: string }[] }>('/api/ai-repo-describe', {
            method: 'POST',
            body: {
              topicName: topic.value.name,
              repos: repos.map(r => ({ name: r.name, description: r.description, language: r.language, stars: r.stars })),
              apiKey: settingsStore.currentApiKey,
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
      saveCache(topic.value.id, repos)
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

  return { data, isLoading, isError, error, cachedAt, refetch: () => fetch_(true) }
}
