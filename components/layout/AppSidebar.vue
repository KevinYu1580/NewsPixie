<script setup lang="ts">
import type { Topic } from '@/types/topic'

defineProps<{
  topics: Topic[]
  activeTopicId: string | null
  isBookmarksView: boolean
  bookmarksCount: number
}>()

const emit = defineEmits<{
  selectTopic: [id: string]
  selectBookmarks: []
  addTopic: [topic: Omit<Topic, 'id' | 'createdAt'>]
  updateTopic: [id: string, updates: Partial<Omit<Topic, 'id' | 'createdAt'>>]
  deleteTopic: [id: string]
}>()

const { t } = useI18n()

const managerModal = ref(false)
const managerInitialMode = ref<'list' | 'add'>('list')

function openManage() {
  managerInitialMode.value = 'list'
  managerModal.value = true
}

function openAdd() {
  managerInitialMode.value = 'add'
  managerModal.value = true
}
</script>

<template>
  <!-- 我的收藏 -->
  <v-list density="compact" nav class="py-2">
    <v-list-item
      :active="isBookmarksView"
      :aria-current="isBookmarksView ? 'page' : undefined"
      class="np-topic-item rounded"
      @click="emit('selectBookmarks')"
    >
      <template #prepend>
        <v-icon icon="mdi-bookmark" size="18" class="mr-2" />
      </template>
      <v-list-item-title class="text-body-2">
        {{ t('sidebar.myBookmarks') }}
      </v-list-item-title>
      <template #append>
        <v-chip v-if="bookmarksCount > 0" size="x-small" variant="tonal" class="font-mono">
          {{ bookmarksCount }}
        </v-chip>
      </template>
    </v-list-item>
  </v-list>

  <v-divider />

  <!-- 標題列 -->
  <div class="d-flex align-center justify-space-between px-4" style="height: 40px;">
    <span class="font-mono-label text-xs font-weight-bold text-uppercase tracking-widest text-medium-emphasis">
      {{ t('sidebar.topicsLabel') }}
    </span>
    <v-btn
      icon="mdi-tune"
      variant="text"
      size="x-small"
      :aria-label="t('sidebar.manageTopics')"
      @click="openManage"
    />
  </div>

  <v-divider />

  <!-- 主題列表 -->
  <v-list density="compact" nav class="py-2 flex-grow-1 overflow-y-auto">
    <TopicsTopicItem
      v-for="topic in topics"
      :key="topic.id"
      :topic="topic"
      :is-active="!isBookmarksView && topic.id === activeTopicId"
      @click="emit('selectTopic', topic.id)"
    />
  </v-list>

  <v-divider />

  <!-- 新增主題 -->
  <div class="pa-2">
    <v-btn
      prepend-icon="mdi-plus"
      variant="text"
      size="small"
      class="w-100 justify-start text-medium-emphasis"
      :aria-label="t('sidebar.addTopic')"
      @click="openAdd"
    >
      {{ t('sidebar.addTopic') }}
    </v-btn>
  </div>

  <TopicsTopicManagerModal
    v-model="managerModal"
    :topics="topics"
    :initial-mode="managerInitialMode"
    @add="(topic) => emit('addTopic', topic)"
    @update="(id, u) => emit('updateTopic', id, u)"
    @delete="(id) => emit('deleteTopic', id)"
  />
</template>
