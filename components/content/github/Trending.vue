<script setup lang="ts">
import type { RepoItem } from '@/types/content'

const props = defineProps<{
  repos: RepoItem[]
  isLoading: boolean
  isError: boolean
  error: string | null
  repoCount: number
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="props.isLoading" class="d-grid np-card-grid ga-3">
      <v-skeleton-loader
        v-for="i in props.repoCount"
        :key="i"
        type="card"
      />
    </div>

    <!-- 錯誤 -->
    <v-alert
      v-else-if="props.isError"
      type="error"
      variant="tonal"
      density="compact"
      :text="props.error ?? t('trending.fetchError')"
    />

    <!-- 空狀態 -->
    <p
      v-else-if="!props.repos?.length"
      class="text-center text-caption text-medium-emphasis py-6"
    >
      {{ t('trending.noRepos') }}
    </p>

    <!-- 卡片清單 -->
    <div v-else class="np-card-grid">
      <ContentGithubRepoCard v-for="repo in props.repos" :key="repo.id" :repo="repo" />
    </div>
  </div>
</template>
