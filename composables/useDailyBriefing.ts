import type { Topic } from '@/types/topic'
import { MAX_CACHE_DAYS } from '@/constants'
import { useSettingsStore } from '@/stores/settingsStore'
import { getErrorMessage, loadTodayCache, saveTodayCache, todayStr } from '@/utils/utils'

const CACHE_PREFIX = 'newspixie-daily'

export interface CuratedArticle {
  title: string
  url: string
  imageUrl?: string
}

export interface DailyBriefingCache {
  topicId: string
  date: string
  articles: CuratedArticle[]
  generatedAt: string
}

function loadCache(topicId: string): DailyBriefingCache | null {
  return loadTodayCache<DailyBriefingCache>(CACHE_PREFIX, topicId)
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
  const { t } = useI18n()

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

    const topicValue = topic.value
    if (!topicValue || isLoading.value)
      return
    if (!topicValue.jinaUrls || topicValue.jinaUrls.length === 0) {
      error.value = t('error.noUrls')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Step 1：Jina 抓各來源首頁 raw markdown
      stage.value = 'fetching-list'
      const listResults = await Promise.allSettled(
        topicValue.jinaUrls.map(url =>
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
        throw new Error(t('error.noContent'))
      }

      // Step 2：AI 從 markdown 提取文章
      stage.value = 'extracting'
      const extractResults = await Promise.allSettled(
        contents.map(content =>
          $fetch<{ articles: { title: string, url: string }[] }>('/api/ai-extract-articles', {
            method: 'POST',
            body: {
              content,
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

        throw new Error(extractError ?? t('error.noArticles'))
      }

      // Step 3：AI 精選 top N
      stage.value = 'curating'
      const curateResult = await $fetch<{ selected: { title: string, url: string }[] }>('/api/ai-curate', {
        method: 'POST',
        body: {
          topicName: topicValue.name,
          keywords: topicValue.keywords,
          articles: allArticles,
          count: settingsStore.articleCount,
          model: settingsStore.currentModel,
          provider: settingsStore.provider,
        },
      })

      // Step 4：平行抓各精選文章的 OG image（失敗靜默降級）
      const withImages = await Promise.all(
        curateResult.selected.map(async (article) => {
          try {
            const og = await $fetch<{ imageUrl: string | null }>('/api/og-image', {
              query: { url: article.url },
            })
            return { ...article, imageUrl: og.imageUrl ?? undefined }
          }
          catch {
            return article
          }
        }),
      )

      const now = new Date().toISOString()
      articles.value = withImages
      generatedAt.value = now
      stage.value = 'done'

      const entry: DailyBriefingCache = {
        topicId: topicValue.id,
        date: todayStr(),
        articles: withImages,
        generatedAt: now,
      }
      saveTodayCache(CACHE_PREFIX, topicValue.id, entry, MAX_CACHE_DAYS)
    }
    catch (err) {
      error.value = getErrorMessage(err) ?? t('error.briefingFailed')
      stage.value = 'idle'
    }
    finally {
      isLoading.value = false
    }
  }

  /** 自動觸發：有 API Key 且今日尚未抓取則立即執行 */
  function autoTriggerIfNeeded() {
    if (!topic.value)
      return
    if (!settingsStore.hasApiKey)
      return
    if (loadCache(topic.value.id))
      return
    if (!topic.value.jinaUrls?.length)
      return
    run()
  }

  watch(topic, () => {
    loadFromCache()
    autoTriggerIfNeeded()
  }, { immediate: true })

  watch(() => settingsStore.hasApiKey, (hasKey) => {
    if (hasKey)
      autoTriggerIfNeeded()
  })

  const stageLabel = computed(() => ({
    'idle': '',
    'fetching-list': t('stage.fetchingList'),
    'extracting': t('stage.extracting'),
    'curating': t('stage.curating'),
    'done': '',
  }[stage.value]))

  return { articles, generatedAt, isLoading, error, stage, stageLabel, hasBriefing, fetchedToday, run }
}
