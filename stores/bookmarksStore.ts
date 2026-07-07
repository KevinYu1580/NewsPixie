import type { CuratedArticle } from '@/composables/useDailyBriefing'
import type { RepoItem } from '@/types/content'
import { defineStore } from 'pinia'

export interface BookmarkedArticle extends CuratedArticle {
  topicId: string
  topicName: string
  bookmarkedAt: number
}

export interface BookmarkedRepo extends RepoItem {
  topicId: string
  topicName: string
  bookmarkedAt: number
}

export const useBookmarksStore = defineStore('bookmarks', () => {
  const articles = ref<BookmarkedArticle[]>([])
  const repos = ref<BookmarkedRepo[]>([])

  const totalCount = computed(() => articles.value.length + repos.value.length)

  function isArticleBookmarked(url: string): boolean {
    return articles.value.some(a => a.url === url)
  }

  function isRepoBookmarked(id: string): boolean {
    return repos.value.some(r => r.id === id)
  }

  function toggleArticle(article: CuratedArticle, topicId: string, topicName: string) {
    const idx = articles.value.findIndex(a => a.url === article.url)
    if (idx !== -1) {
      articles.value.splice(idx, 1)
    }
    else {
      articles.value.unshift({ ...article, topicId, topicName, bookmarkedAt: Date.now() })
    }
  }

  function toggleRepo(repo: RepoItem, topicId: string, topicName: string) {
    const idx = repos.value.findIndex(r => r.id === repo.id)
    if (idx !== -1) {
      repos.value.splice(idx, 1)
    }
    else {
      repos.value.unshift({ ...repo, topicId, topicName, bookmarkedAt: Date.now() })
    }
  }

  return { articles, repos, totalCount, isArticleBookmarked, isRepoBookmarked, toggleArticle, toggleRepo }
}, {
  persist: {
    key: 'newspixie-bookmarks',
    pick: ['articles', 'repos'],
  },
})
