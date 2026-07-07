<script setup lang="ts">
import type { Topic } from '@/types/topic'
import { useGithubTrending } from '@/composables/useBriefingData'
import { useDailyBriefing } from '@/composables/useDailyBriefing'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatRelativeTime } from '@/utils/utils'

const props = defineProps<{
  topic: Topic
}>()

const topicRef = toRef(props, 'topic')

const {
  articles,
  generatedAt,
  isLoading: briefingLoading,
  error,
  stageLabel,
  hasBriefing,
  run,
} = useDailyBriefing(topicRef)

const hasJinaUrls = computed(() => (props.topic.jinaUrls?.length ?? 0) > 0)

const settingsStore = useSettingsStore()
const hasApiKey = computed(() => settingsStore.hasApiKey)

const { t } = useI18n()

const { data: repos, isLoading: repoLoading, isError: repoError, error: repoErrorMessage, cachedAt: repoCachedAt, refetch: refetchRepos } = useGithubTrending(topicRef)
</script>

<template>
  <!-- 無 API Key：SVG 插圖 -->
  <div
    v-if="!hasApiKey"
    class="d-flex flex-column align-center py-10 ga-6"
  >
    <!-- eslint-disable vue/max-attributes-per-line -->
    <svg viewBox="0 0 460 280" xmlns="http://www.w3.org/2000/svg" class="w-100" style="max-width: 440px;" aria-hidden="true">
      <!-- 每日精選 ghost items -->
      <rect x="0" y="0" width="440" height="66" rx="8" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.08" stroke-width="1" />
      <rect x="12" y="11" width="44" height="44" rx="4" fill="currentColor" fill-opacity="0.09" />
      <rect x="68" y="15" width="250" height="10" rx="5" fill="currentColor" fill-opacity="0.11" />
      <rect x="68" y="32" width="190" height="8" rx="4" fill="currentColor" fill-opacity="0.08" />
      <rect x="68" y="47" width="140" height="7" rx="3" fill="currentColor" fill-opacity="0.05" />

      <rect x="0" y="74" width="440" height="66" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.06" stroke-width="1" />
      <rect x="12" y="85" width="44" height="44" rx="4" fill="currentColor" fill-opacity="0.07" />
      <rect x="68" y="89" width="210" height="10" rx="5" fill="currentColor" fill-opacity="0.09" />
      <rect x="68" y="106" width="170" height="8" rx="4" fill="currentColor" fill-opacity="0.06" />
      <rect x="68" y="121" width="120" height="7" rx="3" fill="currentColor" fill-opacity="0.04" />

      <!-- 中央 lock 圓圈 -->
      <circle cx="220" cy="155" r="36" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" />

      <!-- lock icon (mdi-lock-outline, scale=1.4, center at 220,155) -->
      <g transform="translate(203, 138) scale(1.4)" class="text-np-accent">
        <path d="M12,17C10.89,17 10,16.1 10,15C10,13.89 10.9,13 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" fill="currentColor" fill-opacity="0.75" />
      </g>

      <!-- 趨勢 Repos ghost cards (3-column grid) -->
      <rect x="0" y="200" width="140" height="72" rx="8" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-opacity="0.08" stroke-width="1" />
      <rect x="12" y="212" width="84" height="9" rx="4" fill="currentColor" fill-opacity="0.10" />
      <rect x="12" y="228" width="112" height="7" rx="3" fill="currentColor" fill-opacity="0.07" />
      <rect x="12" y="241" width="88" height="7" rx="3" fill="currentColor" fill-opacity="0.05" />
      <rect x="12" y="256" width="40" height="7" rx="3" fill="currentColor" fill-opacity="0.08" />

      <rect x="150" y="200" width="140" height="72" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.06" stroke-width="1" />
      <rect x="162" y="212" width="72" height="9" rx="4" fill="currentColor" fill-opacity="0.08" />
      <rect x="162" y="228" width="100" height="7" rx="3" fill="currentColor" fill-opacity="0.05" />
      <rect x="162" y="241" width="78" height="7" rx="3" fill="currentColor" fill-opacity="0.04" />
      <rect x="162" y="256" width="46" height="7" rx="3" fill="currentColor" fill-opacity="0.06" />

      <rect x="300" y="200" width="140" height="72" rx="8" fill="currentColor" fill-opacity="0.03" stroke="currentColor" stroke-opacity="0.05" stroke-width="1" />
      <rect x="312" y="212" width="90" height="9" rx="4" fill="currentColor" fill-opacity="0.07" />
      <rect x="312" y="228" width="92" height="7" rx="3" fill="currentColor" fill-opacity="0.05" />
      <rect x="312" y="241" width="70" height="7" rx="3" fill="currentColor" fill-opacity="0.04" />
      <rect x="312" y="256" width="44" height="7" rx="3" fill="currentColor" fill-opacity="0.05" />
    </svg>
    <!-- eslint-enable vue/max-attributes-per-line -->

    <div class="text-center">
      <p class="text-body-1 mb-1">
        {{ t('briefingFeed.noApiKeyTitle') }}
      </p>
      <p class="text-caption text-medium-emphasis">
        {{ t('briefingFeed.noApiKeyHint') }}
      </p>
    </div>
  </div>

  <!-- 已設定 API Key：正常渲染兩個區塊 -->
  <div v-else class="d-flex flex-column ga-8">
    <!-- 每日精選新聞（Jina + AI） -->
    <ContentSection
      :title="t('briefingFeed.dailyBriefing')"
      :count="articles?.length ?? 0"
    >
      <template #actions>
        <span v-if="generatedAt" class="text-caption text-medium-emphasis">
          {{ formatRelativeTime(generatedAt) }}
        </span>
        <v-btn
          v-if="hasJinaUrls"
          icon="mdi-refresh"
          variant="text"
          size="x-small"
          :disabled="briefingLoading"
          :class="{ 'rotate-animation': briefingLoading }"
          :aria-label="t('briefingFeed.refetchNow')"
          @click.stop="run"
        />
      </template>
      <ContentNewsBriefing
        :articles="articles"
        :is-loading="briefingLoading"
        :error="error"
        :stage-label="stageLabel"
        :has-briefing="hasBriefing"
        :has-jina-urls="hasJinaUrls"
        :article-count="settingsStore.articleCount"
        :run="run"
        :topic-id="topic.id"
        :topic-name="topic.name"
      />
    </ContentSection>

    <!-- GitHub Trending -->
    <ContentSection
      :title="t('briefingFeed.trendingRepos')"
      :count="repos?.length ?? 0"
    >
      <template #actions>
        <span v-if="repoCachedAt" class="text-caption text-medium-emphasis">
          {{ formatRelativeTime(repoCachedAt) }}
        </span>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="x-small"
          :disabled="repoLoading"
          :class="{ 'rotate-animation': repoLoading }"
          :aria-label="t('briefingFeed.refetchTrending')"
          @click.stop="refetchRepos"
        />
      </template>
      <ContentGithubTrending
        :repos="repos"
        :is-loading="repoLoading"
        :is-error="repoError"
        :error="repoErrorMessage"
        :repo-count="settingsStore.repoCount"
        :topic-id="topic.id"
        :topic-name="topic.name"
      />
    </ContentSection>
  </div>
</template>
