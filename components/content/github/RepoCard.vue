<script setup lang="ts">
import type { RepoItem } from '@/types/content'
import { formatNumber, truncate } from '@/utils/utils'

const props = defineProps<{
  repo: RepoItem
}>()

const [owner, name] = computed(() => props.repo.name.split('/')).value
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
        <v-icon
          icon="mdi-open-in-new"
          size="14"
          class="np-external-icon text-medium-emphasis flex-shrink-0"
        />
      </div>

      <!-- 說明 -->
      <p v-if="repo.description" class="text-caption text-medium-emphasis mb-3">
        {{ truncate(repo.description, 100) }}
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
