<script setup lang="ts">
import type { Topic } from '@/types/topic'
import { useGithubTrending } from '@/composables/useBriefingData'
import { useDailyBriefing } from '@/composables/useDailyBriefing'
import { formatRelativeTime } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settingsStore'

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
  fetchedToday,
  run,
} = useDailyBriefing(topicRef)

const hasJinaUrls = computed(() => (props.topic.jinaUrls?.length ?? 0) > 0)

const settingsStore = useSettingsStore()

const { data: repos, isLoading: repoLoading, isError: repoError, cachedAt: repoCachedAt, refetch: refetchRepos } = useGithubTrending(topicRef)
</script>

<template>
  <div class="d-flex flex-column ga-8">
    <!-- 每日精選（Jina + AI） -->
    <ContentSection
      title="每日精選"
      :count="articles?.length ?? 0"
      :is-loading="false"
      :is-empty="false"
      :skeleton-count="settingsStore.articleCount"
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
          aria-label="立即重新抓取"
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
      />
    </ContentSection>

    <!-- GitHub Trending -->
    <ContentSection
      title="趨勢 Repos"
      :count="repos?.length ?? 0"
      :is-loading="false"
      :is-empty="false"
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
          aria-label="重新抓取趨勢 Repos"
          @click.stop="refetchRepos"
        />
      </template>
      <ContentGithubTrending
        :repos="repos"
        :is-loading="repoLoading"
        :is-error="repoError"
        :repo-count="settingsStore.repoCount"
      />
    </ContentSection>
  </div>
</template>
