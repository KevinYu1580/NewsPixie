<script setup lang="ts">
import type { RepoItem } from '@/types/content'

const props = defineProps<{
  repos: RepoItem[]
  isLoading: boolean
  isError: boolean
  repoCount: number
}>()
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="props.isLoading" class="d-grid np-card-grid ga-3">
      <v-skeleton-loader
        v-for="i in props.repoCount"
        :key="i"
        type="card"
        height="100"
      />
    </div>

    <!-- 錯誤 -->
    <v-alert
      v-else-if="props.isError"
      type="error"
      variant="tonal"
      density="compact"
      text="抓取趨勢 Repos 失敗，請稍後再試。"
    />

    <!-- 空狀態 -->
    <p
      v-else-if="!props.repos?.length"
      class="text-center text-caption text-medium-emphasis py-6"
    >
      暫無趨勢 Repo
    </p>

    <!-- 卡片清單 -->
    <div v-else class="np-card-grid">
      <ContentGithubRepoCard v-for="repo in props.repos" :key="repo.id" :repo="repo" />
    </div>
  </div>
</template>
