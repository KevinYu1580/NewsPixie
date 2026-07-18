<script setup lang="ts">
import type { CuratedArticle } from '@/composables/useDailyBriefing'
import type { NewsItem } from '@/types/content'
import { useBookmarksStore } from '@/stores/bookmarksStore'

const props = defineProps<{
  item?: NewsItem
  article?: CuratedArticle
  topicId?: string
  topicName?: string
}>()

const bookmarksStore = useBookmarksStore()
const { t } = useI18n()

const isBookmarked = computed(() =>
  props.article ? bookmarksStore.isArticleBookmarked(props.article.url) : false,
)

const DEFAULT_NEWS_IMAGE = '/news-placeholder.svg'
const imageSrc = computed(() => props.article?.imageUrl || DEFAULT_NEWS_IMAGE)

function toggleBookmark() {
  if (!props.article || !props.topicId || !props.topicName)
    return
  bookmarksStore.toggleArticle(props.article, props.topicId, props.topicName)
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  }
  catch {
    return url
  }
}
</script>

<template>
  <v-hover>
    <template #default="{ isHovering, props: hoverProps }">
      <v-card
        v-bind="hoverProps"
        class="np-news-card"
        :href="article?.url ?? item?.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="article ? article.title : `開啟文章：${item?.title}`"
      >
        <!-- CuratedArticle 模式 -->
        <template v-if="article">
          <v-img
            :src="imageSrc"
            :alt="article.title"
            height="260"

            :image-class="[isHovering ? 'scale-up' : false, 'np-news-card_img']"

            cover
          />
          <v-card-text class="pa-4">
            <div class="d-flex align-start ga-1">
              <p class="text-body-2 font-weight-medium flex-grow-1" style="line-height: 1.5;">
                {{ article.title }}
              </p>
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

            <div class="d-flex align-center ga-1 mt-2">
              <v-icon icon="mdi-web" size="x-small" color="np-accent" />
              <span class="font-mono-label text-caption text-disabled">
                {{ getHostname(article.url) }}
              </span>
            </div>
          </v-card-text>
        </template>
      </v-card>
    </template>
  </v-hover>
</template>

<style lang="scss" scoped>
:deep(.scale-up) {
  transform: scale(1.08);
}

:deep(.np-news-card_img){
  transition: all 0.2s ease-out;
}
</style>
