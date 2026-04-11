<script setup lang="ts">
import type { Topic } from '@/types/topic'
import { TOPIC_COLORS } from '@/types/topic'

export type TopicModalInitialMode = 'list' | 'add'

type ModalMode = 'list' | 'add' | { type: 'edit', topic: Topic } | { type: 'delete', topic: Topic }

const props = defineProps<{
  topics: Topic[]
  initialMode?: TopicModalInitialMode
}>()

const emit = defineEmits<{
  add: [topic: Omit<Topic, 'id' | 'createdAt'>]
  update: [id: string, updates: Partial<Omit<Topic, 'id' | 'createdAt'>>]
  delete: [id: string]
}>()

const dialog = defineModel<boolean>({ default: false })
const mode = ref<ModalMode>(props.initialMode ?? 'list')
const localTopics = ref<Topic[]>([])
let localTopicCounter = 0

watch(dialog, (open) => {
  if (open) {
    localTopics.value = props.topics.map(topic => ({
      ...topic,
      keywords: [...topic.keywords],
      jinaUrls: [...topic.jinaUrls],
    }))
    mode.value = props.initialMode ?? 'list'
  }
  else {
    setTimeout(() => {
      mode.value = 'list'
    }, 300)
  }
})

const title = computed(() => {
  if (mode.value === 'list')
    return '管理主題'
  if (mode.value === 'add')
    return '新增主題'
  if (typeof mode.value === 'object' && mode.value.type === 'edit')
    return '編輯主題'
  return '刪除主題'
})

function closeDialog() {
  dialog.value = false
}

function addLocalTopic(topic: Omit<Topic, 'id' | 'createdAt'>) {
  localTopics.value.push({
    ...topic,
    id: `local-${Date.now()}-${localTopicCounter++}`,
    createdAt: Date.now(),
    keywords: [...topic.keywords],
    jinaUrls: [...topic.jinaUrls],
  })
  mode.value = props.initialMode === 'add' ? 'add' : 'list'
}

function updateLocalTopic(id: string, updates: Partial<Omit<Topic, 'id' | 'createdAt'>>) {
  const idx = localTopics.value.findIndex(topic => topic.id === id)
  if (idx === -1)
    return

  localTopics.value[idx] = {
    ...localTopics.value[idx],
    ...updates,
    keywords: updates.keywords ? [...updates.keywords] : localTopics.value[idx].keywords,
    jinaUrls: updates.jinaUrls ? [...updates.jinaUrls] : localTopics.value[idx].jinaUrls,
  }
  mode.value = 'list'
}

function deleteLocalTopic(id: string) {
  localTopics.value = localTopics.value.filter(topic => topic.id !== id)
  mode.value = 'list'
}

function hasTopicChanged(original: Topic, current: Topic) {
  return original.name !== current.name
    || original.slug !== current.slug
    || original.githubQuery !== current.githubQuery
    || original.color !== current.color
    || original.enabled !== current.enabled
    || JSON.stringify(original.keywords) !== JSON.stringify(current.keywords)
    || JSON.stringify(original.jinaUrls) !== JSON.stringify(current.jinaUrls)
}

function saveChanges() {
  const originalById = new Map(props.topics.map(topic => [topic.id, topic]))
  const currentById = new Map(localTopics.value.map(topic => [topic.id, topic]))

  props.topics.forEach((topic) => {
    if (!currentById.has(topic.id))
      emit('delete', topic.id)
  })

  localTopics.value.forEach((topic) => {
    const original = originalById.get(topic.id)

    if (!original) {
      const { id: _id, createdAt: _createdAt, ...topicData } = topic
      emit('add', {
        ...topicData,
        keywords: [...topicData.keywords],
        jinaUrls: [...topicData.jinaUrls],
      })
      return
    }

    if (hasTopicChanged(original, topic)) {
      emit('update', topic.id, {
        name: topic.name,
        slug: topic.slug,
        keywords: [...topic.keywords],
        githubQuery: topic.githubQuery,
        jinaUrls: [...topic.jinaUrls],
        color: topic.color,
        enabled: topic.enabled,
      })
    }
  })

  closeDialog()
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="448" scrollable>
    <v-card>
      <v-card-title class="font-mono-label text-sm tracking-widest text-uppercase pt-5 px-5">
        {{ title }}
      </v-card-title>

      <v-card-text class="px-5 pb-5">
        <!-- 主題列表 -->
        <div v-if="mode === 'list'" class="d-flex flex-column ga-3">
          <div class="d-flex flex-column ga-1">
            <div
              v-for="topic in localTopics"
              :key="topic.id"
              class="d-flex align-center justify-space-between rounded border pa-3 mb-3"
            >
              <div class="d-flex align-center ga-2">
                <span
                  class="np-topic-dot"
                  :style="{ backgroundColor: TOPIC_COLORS[topic.color].hex }"
                />
                <span class="text-body-2">{{ topic.name }}</span>
              </div>
              <div class="d-flex ga-1">
                <v-btn
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="x-small"
                  :aria-label="`編輯 ${topic.name}`"
                  @click="mode = { type: 'edit', topic }"
                />
                <v-btn
                  icon="mdi-trash-can-outline"
                  variant="text"
                  size="x-small"
                  color="error"
                  :aria-label="`刪除 ${topic.name}`"
                  @click="mode = { type: 'delete', topic }"
                />
              </div>
            </div>
          </div>
          <v-divider />
          <v-btn
            prepend-icon="mdi-plus"
            variant="outlined"
            size="small"
            @click="mode = 'add'"
          >
            新增主題
          </v-btn>
        </div>

        <!-- 新增表單 -->
        <TopicsTopicForm
          v-if="mode === 'add'"
          :key="`add-${localTopics.length}`"
          submit-label="新增"
          @submit="addLocalTopic"
          @cancel="initialMode === 'add' ? closeDialog() : (mode = 'list')"
        />

        <!-- 編輯表單 -->
        <TopicsTopicForm
          v-if="typeof mode === 'object' && mode.type === 'edit'"
          :key="(mode as { type: 'edit'; topic: Topic }).topic.id"
          :initial="(mode as { type: 'edit'; topic: Topic }).topic"
          submit-label="儲存"
          @submit="(data) => updateLocalTopic((mode as { type: 'edit'; topic: Topic }).topic.id, data)"
          @cancel="mode = 'list'"
        />

        <!-- 刪除確認 -->
        <div
          v-if="typeof mode === 'object' && mode.type === 'delete'"
          class="d-flex flex-column ga-4"
        >
          <p class="text-body-2 text-medium-emphasis">
            確定要刪除主題
            <span class="font-weight-medium text-high-emphasis">
              「{{ (mode as { type: 'delete'; topic: Topic }).topic.name }}」
            </span>？<br>此操作無法復原。
          </p>
          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="mode = 'list'">
              取消
            </v-btn>
            <v-btn
              variant="flat"
              color="error"
              @click="deleteLocalTopic((mode as { type: 'delete'; topic: Topic }).topic.id)"
            >
              刪除
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-card-actions v-if="mode === 'list'" class="justify-end px-5 pb-5 pt-0">
        <v-btn variant="text" @click="closeDialog">
          取消
        </v-btn>
        <v-btn variant="flat" @click="saveChanges">
          儲存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
