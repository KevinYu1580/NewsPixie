import type { Topic } from '@/types/topic'
import { MAX_CACHE_DAYS } from '@/constants'
import { pruneLocalStorageCache, todayStr } from '@/utils/utils'
import { useSettingsStore } from '@/stores/settingsStore'

const CACHE_PREFIX = 'newspixie-daily'

export interface CuratedArticle {
  title: string
  url: string
}

export interface DailyBriefingCache {
  topicId: string
  date: string
  articles: CuratedArticle[]
  generatedAt: string
}

function cacheKey(topicId: string, date: string): string {
  return `${CACHE_PREFIX}-${topicId}-${date}`
}

function loadCache(topicId: string): DailyBriefingCache | null {
  if (typeof window === 'undefined')
    return null
  try {
    const raw = localStorage.getItem(cacheKey(topicId, todayStr()))
    if (!raw)
      return null
    return JSON.parse(raw) as DailyBriefingCache
  }
  catch {
    return null
  }
}

function saveCache(data: DailyBriefingCache): void {
  if (typeof window === 'undefined')
    return
  localStorage.setItem(cacheKey(data.topicId, data.date), JSON.stringify(data))
  pruneLocalStorageCache(CACHE_PREFIX, MAX_CACHE_DAYS)
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

/**
 * 完整 Daily Briefing pipeline：
 * 1. Jina 抓各來源首頁取得 raw markdown
 * 2. AI 從 markdown 提取文章標題 + URL
 * 3. AI 精選 top N
 * 結果快取於 localStorage，每日最多觸發一次
 */
export function useDailyBriefing(topic: Ref<Topic | null>) {
  const settingsStore = useSettingsStore()

  const articles = ref<CuratedArticle[]>([])
  const generatedAt = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const stage = ref<'idle' | 'fetching-list' | 'extracting' | 'curating' | 'done'>('idle')

  const hasBriefing = computed(() => articles.value.length > 0)
  const fetchedToday = computed(() => {
    if (!topic.value)
      return false
    return !!loadCache(topic.value.id)
  })

  function loadFromCache() {
    if (!topic.value)
      return
    const cached = loadCache(topic.value.id)
    if (cached) {
      articles.value = cached.articles
      generatedAt.value = cached.generatedAt
      stage.value = 'done'
    }
    else {
      articles.value = []
      generatedAt.value = ''
      stage.value = 'idle'
    }
  }

  async function run() {
    if (!settingsStore.hasApiKey)
      return

    const t = topic.value
    if (!t || isLoading.value)
      return
    if (!t.jinaUrls || t.jinaUrls.length === 0) {
      error.value = '此主題尚未設定任何網站來源（Jina URL）'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Step 1：Jina 抓各來源首頁 raw markdown
      stage.value = 'fetching-list'
      const listResults = await Promise.allSettled(
        t.jinaUrls.map(url =>
          $fetch<{ content: string }>('/api/jina-fetch', {
            query: { url },
          }),
        ),
      )

      const contents = listResults
        .filter((r): r is PromiseFulfilledResult<{ content: string }> =>
          r.status === 'fulfilled' && !!r.value.content,
        )
        .map(r => r.value.content)

      if (contents.length === 0) {
        throw new Error('所有來源均無法取得頁面內容，請確認 URL 是否正確')
      }

      // Step 2：AI 從 markdown 提取文章
      stage.value = 'extracting'
      const extractResults = await Promise.allSettled(
        contents.map(content =>
          $fetch<{ articles: { title: string, url: string }[] }>('/api/ai-extract-articles', {
            method: 'POST',
            body: {
              content,
              apiKey: settingsStore.currentApiKey,
              model: settingsStore.currentModel,
              provider: settingsStore.provider,
            },
          }),
        ),
      )

      const seen = new Set<string>()
      const allArticles = extractResults
        .filter((r): r is PromiseFulfilledResult<{ articles: { title: string, url: string }[] }> =>
          r.status === 'fulfilled',
        )
        .flatMap(r => r.value.articles)
        .filter((a) => {
          if (seen.has(a.url))
            return false
          seen.add(a.url)
          return true
        })

      if (allArticles.length === 0) {
        const extractError = extractResults
          .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
          .map(r => getErrorMessage(r.reason))
          .find(Boolean)

        throw new Error(extractError ?? 'AI 未能從頁面內容中辨識出任何文章')
      }

      // Step 3：AI 精選 top N
      stage.value = 'curating'
      const curateResult = await $fetch<{ selected: { title: string, url: string }[] }>('/api/ai-curate', {
        method: 'POST',
        body: {
          topicName: t.name,
          keywords: t.keywords,
          articles: allArticles,
          count: settingsStore.articleCount,
          apiKey: settingsStore.currentApiKey,
          model: settingsStore.currentModel,
          provider: settingsStore.provider,
        },
      })

      const now = new Date().toISOString()
      articles.value = curateResult.selected
      generatedAt.value = now
      stage.value = 'done'

      saveCache({
        topicId: t.id,
        date: todayStr(),
        articles: curateResult.selected,
        generatedAt: now,
      })
    }
    catch (err) {
      error.value = getErrorMessage(err) ?? '每日精選生成失敗'
      stage.value = 'idle'
    }
    finally {
      isLoading.value = false
    }
  }

  /** App 開啟時自動觸發：今日尚未抓取 且 已過設定時間 */
  function autoTriggerIfNeeded() {
    if (!topic.value)
      return
    if (loadCache(topic.value.id))
      return
    if (!topic.value.jinaUrls?.length)
      return

    const [h = 7, m = 0] = settingsStore.fetchTime.split(':').map(Number)
    const now = new Date()
    const triggerTime = new Date()
    triggerTime.setHours(h, m, 0, 0)

    if (now >= triggerTime) {
      run()
    }
  }

  watch(topic, () => {
    loadFromCache()
    autoTriggerIfNeeded()
  }, { immediate: true })

  const stageLabel = computed(() => ({
    'idle': '',
    'fetching-list': '正在抓取頁面內容…',
    'extracting': 'AI 正在辨識文章…',
    'curating': 'AI 精選中…',
    'done': '',
  }[stage.value]))

  return { articles, generatedAt, isLoading, error, stage, stageLabel, hasBriefing, fetchedToday, run }
}
