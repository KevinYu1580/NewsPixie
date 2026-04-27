<script setup lang="ts">
import type { CuratedArticle } from '@/composables/useDailyBriefing'
import { useSettingsStore } from '@/stores/settingsStore'

const props = defineProps<{
  articles: CuratedArticle[]
  isLoading: boolean
  error: string | null
  stageLabel: string
  hasBriefing: boolean
  hasJinaUrls: boolean
  articleCount: number
  run: () => void
}>()

const settingsStore = useSettingsStore()
const { t } = useI18n()
</script>

<template>
  <div>
    <!-- Loading 進度 -->
    <div v-if="props.isLoading" class="d-flex flex-column ga-3">
      <div class="d-flex align-center ga-2 text-caption text-medium-emphasis">
        <v-progress-circular size="14" width="2" indeterminate color="np-accent" />
        {{ props.stageLabel }}
      </div>
      <div class="np-card-grid">
        <v-skeleton-loader v-for="i in props.articleCount" :key="i" type="article" class="np-news-card" />
      </div>
    </div>

    <!-- 錯誤 -->
    <v-alert
      v-else-if="props.error"
      type="error"
      variant="tonal"
      density="compact"
      :text="props.error"
    />

    <!-- 無來源提示 -->
    <v-alert
      v-else-if="!props.hasJinaUrls"
      type="info"
      variant="tonal"
      density="compact"
      :text="t('briefing.noSourceUrl')"
    />

    <!-- 精選文章清單 -->
    <div v-else-if="props.hasBriefing" class="np-card-grid">
      <ContentNewsCard
        v-for="article in props.articles"
        :key="article.url"
        :article="article"
      />
    </div>

    <!-- 空狀態（設定了來源但尚未觸發） -->
    <div v-else class="text-center py-6 text-medium-emphasis">
      <p class="text-body-2 mb-3">
        {{ t('briefing.autoFetchNote', { time: settingsStore.fetchTime }) }}
      </p>
      <v-btn
        variant="tonal"
        color="np-accent"
        size="small"
        prepend-icon="mdi-play"
        @click="props.run"
      >
        {{ t('briefing.runNow') }}
      </v-btn>
    </div>
  </div>
</template>
