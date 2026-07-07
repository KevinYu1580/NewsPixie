<script setup lang="ts">
import { useBookmarksStore } from '@/stores/bookmarksStore'

const bookmarksStore = useBookmarksStore()
const { t } = useI18n()

const filter = ref<'all' | 'articles' | 'repos'>('all')

const sortedArticles = computed(() =>
  [...bookmarksStore.articles].sort((a, b) => b.bookmarkedAt - a.bookmarkedAt),
)
const sortedRepos = computed(() =>
  [...bookmarksStore.repos].sort((a, b) => b.bookmarkedAt - a.bookmarkedAt),
)

const showArticles = computed(() => filter.value !== 'repos' && sortedArticles.value.length > 0)
const showRepos = computed(() => filter.value !== 'articles' && sortedRepos.value.length > 0)
const isEmpty = computed(() => bookmarksStore.totalCount === 0)
</script>

<template>
  <div>
    <v-btn-toggle
      v-model="filter"
      mandatory
      density="compact"
      variant="outlined"
      color="np-accent"
      class="mb-4"
    >
      <v-btn value="all" size="small">
        {{ t('bookmarks.filterAll') }}
      </v-btn>
      <v-btn value="articles" size="small">
        {{ t('bookmarks.filterArticles') }}
      </v-btn>
      <v-btn value="repos" size="small">
        {{ t('bookmarks.filterRepos') }}
      </v-btn>
    </v-btn-toggle>

    <p
      v-if="isEmpty"
      class="text-center text-caption text-medium-emphasis py-6"
    >
      {{ t('bookmarks.empty') }}
    </p>

    <div v-else class="d-flex flex-column ga-8">
      <div v-if="showArticles" class="np-card-grid">
        <div v-for="article in sortedArticles" :key="article.url" class="d-flex flex-column ga-1">
          <ContentNewsCard :article="article" :topic-id="article.topicId" :topic-name="article.topicName" />
          <span class="text-caption text-medium-emphasis pl-1">
            {{ t('bookmarks.fromTopic', { name: article.topicName }) }}
          </span>
        </div>
      </div>

      <div v-if="showRepos" class="np-card-grid">
        <div v-for="repo in sortedRepos" :key="repo.id" class="d-flex flex-column ga-1">
          <ContentGithubRepoCard :repo="repo" :topic-id="repo.topicId" :topic-name="repo.topicName" />
          <span class="text-caption text-medium-emphasis pl-1">
            {{ t('bookmarks.fromTopic', { name: repo.topicName }) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
