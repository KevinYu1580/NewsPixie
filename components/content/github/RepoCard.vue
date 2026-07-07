<script setup lang="ts">
import type { RepoItem } from '@/types/content'
import { useBookmarksStore } from '@/stores/bookmarksStore'
import { formatNumber } from '@/utils/utils'

const props = defineProps<{
  repo: RepoItem
  topicId?: string
  topicName?: string
}>()

const [owner, name] = props.repo.name.split('/')

const bookmarksStore = useBookmarksStore()
const { t } = useI18n()

const isBookmarked = computed(() => bookmarksStore.isRepoBookmarked(props.repo.id))

function toggleBookmark() {
  if (!props.topicId || !props.topicName)
    return
  bookmarksStore.toggleRepo(props.repo, props.topicId, props.topicName)
}
</script>

<template>
  <v-card
    variant="elevated"
    class="np-news-card"
    :href="repo.url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`開啟 ${repo.name}`"
  >
    <v-card-text class="pa-4">
      <!-- 標頭 -->
      <div class="d-flex align-start justify-space-between ga-2 mb-2">
        <div class="min-w-0">
          <p class="text-caption text-medium-emphasis">
            {{ owner }}
          </p>
          <p class="text-body-2 font-weight-semibold  text-truncate">
            {{ name }}
          </p>
        </div>
        <v-btn
          icon
          size="x-small"
          variant="text"
          class="flex-shrink-0"
          :aria-label="isBookmarked ? t('bookmarks.removeAria') : t('bookmarks.addAria')"
          @click.stop.prevent="toggleBookmark"
        >
          <v-icon
            :icon="isBookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
            size="16"
            :color="isBookmarked ? 'np-accent' : undefined"
          />
        </v-btn>
      </div>

      <!-- 說明 -->
      <p v-if="repo.description" class="np-repo-desc text-caption text-medium-emphasis mb-3">
        {{ repo.description }}
      </p>

      <!-- 統計 -->
      <div class="d-flex align-center ga-3 text-caption text-medium-emphasis">
        <div v-if="repo.language" class="d-flex align-center ga-1 flex-shrink-0">
          <span
            class="np-lang-dot"
            :style="{ backgroundColor: repo.languageColor ?? '#8b8b8b' }"
            aria-hidden="true"
          />
          <span>{{ repo.language }}</span>
        </div>
        <div class="d-flex align-center ga-1 flex-shrink-0">
          <v-icon icon="mdi-star-outline" size="12" />
          <span>{{ formatNumber(repo.stars) }}</span>
        </div>
        <div class="d-flex align-center ga-1 flex-shrink-0">
          <v-icon icon="mdi-source-fork" size="12" />
          <span>{{ formatNumber(repo.forks) }}</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
.np-repo-desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  overflow: hidden;
}
</style>
