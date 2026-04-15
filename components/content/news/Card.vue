<script setup lang="ts">
import type { CuratedArticle } from '@/composables/useDailyBriefing'
import type { NewsItem } from '@/types/content'
import { SOURCE_CONFIG } from '@/constants'

const props = defineProps<{
  item?: NewsItem
  article?: CuratedArticle
}>()

const source = computed(() => props.item ? SOURCE_CONFIG[props.item.source] : null)

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
  <v-card
    variant="elevated"
    class="np-news-card"
    :href="article?.url ?? item?.url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="article ? article.title : `開啟文章：${item?.title}`"
  >
    <!-- CuratedArticle 模式 -->
    <v-card-text v-if="article" class="pa-4">
      <div class="d-flex ">
        <p class="text-body-2 font-weight-medium" style="line-height: 1.5;">
          {{ article.title }}
        </p>
        <v-icon
          icon="mdi-open-in-new"
          size="14"
          class="np-external-icon text-medium-emphasis flex-shrink-0 ml-auto"
        />
      </div>

      <div class="d-flex align-center ga-1 mt-2">
        <v-icon icon="mdi-web" size="x-small" color="np-accent" />
        <span class="font-mono-label text-caption text-disabled">
          {{ getHostname(article.url) }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>
