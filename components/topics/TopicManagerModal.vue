<script setup lang="ts">
import type { Topic } from '@/types/topic'
import { TOPIC_COLORS } from '@/types/topic'

const props = defineProps<{
  topics: Topic[]
  initialMode?: TopicModalInitialMode
}>()

const emit = defineEmits<{
  add: [topic: Omit<Topic, 'id' | 'createdAt'>]
  update: [id: string, updates: Partial<Omit<Topic, 'id' | 'createdAt'>>]
  delete: [id: string]
}>()

const { t } = useI18n()

export type TopicModalInitialMode = 'list' | 'add'

type ModalMode = 'list' | 'add' | { type: 'edit', topic: Topic } | { type: 'delete', topic: Topic }

const dialog = defineModel<boolean>({ default: false })
const mode = ref<ModalMode>(props.initialMode ?? 'list')
const localTopics = ref<Topic[]>([])
let localTopicCounter = 0

watch(dialog, (open) => {
  if (open) {
    localTopics.value = props.topics.map(topic => ({
      ...topic,
      keywords: [...topic.keywords],
      githubKeywords: [...(topic.githubKeywords ?? [])],
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

const editingTopic = computed(() =>
  typeof mode.value === 'object' && mode.value.type === 'edit' ? mode.value.topic : null,
)
const deletingTopic = computed(() =>
  typeof mode.value === 'object' && mode.value.type === 'delete' ? mode.value.topic : null,
)

const title = computed(() => {
  if (mode.value === 'list')
    return t('topicManager.manage')
  if (mode.value === 'add')
    return t('topicManager.add')
  if (editingTopic.value)
    return t('topicManager.edit')
  return t('topicManager.delete')
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
    githubKeywords: [...(topic.githubKeywords ?? [])],
    jinaUrls: [...topic.jinaUrls],
  })
  mode.value = props.initialMode === 'add' ? 'add' : 'list'
}

function updateLocalTopic(id: string, updates: Partial<Omit<Topic, 'id' | 'createdAt'>>) {
  const idx = localTopics.value.findIndex(topic => topic.id === id)
  if (idx === -1)
    return
  const current = localTopics.value[idx]
  if (!current)
    return

  localTopics.value[idx] = {
    ...current,
    ...updates,
    keywords: updates.keywords ? [...updates.keywords] : current.keywords,
    githubKeywords: updates.githubKeywords ? [...updates.githubKeywords] : (current.githubKeywords ?? []),
    jinaUrls: updates.jinaUrls ? [...updates.jinaUrls] : current.jinaUrls,
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
    || original.color !== current.color
    || original.enabled !== current.enabled
    || JSON.stringify(original.keywords) !== JSON.stringify(current.keywords)
    || JSON.stringify(original.githubKeywords ?? []) !== JSON.stringify(current.githubKeywords ?? [])
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
        githubKeywords: [...(topicData.githubKeywords ?? [])],
        jinaUrls: [...topicData.jinaUrls],
      })
      return
    }

    if (hasTopicChanged(original, topic)) {
      emit('update', topic.id, {
        name: topic.name,
        slug: topic.slug,
        keywords: [...topic.keywords],
        githubKeywords: [...(topic.githubKeywords ?? [])],
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
                  :aria-label="t('topicManager.editTopicAria', { name: topic.name })"
                  @click="mode = { type: 'edit', topic }"
                />
                <v-btn
                  icon="mdi-trash-can-outline"
                  variant="text"
                  size="x-small"
                  color="error"
                  :aria-label="t('topicManager.deleteTopicAria', { name: topic.name })"
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
            {{ t('topicManager.add') }}
          </v-btn>
        </div>

        <!-- 新增表單 -->
        <TopicsTopicForm
          v-if="mode === 'add'"
          :key="`add-${localTopics.length}`"
          :submit-label="t('topicManager.addBtn')"
          @submit="addLocalTopic"
          @cancel="initialMode === 'add' ? closeDialog() : (mode = 'list')"
        />

        <!-- 編輯表單 -->
        <TopicsTopicForm
          v-if="editingTopic"
          :key="editingTopic.id"
          :initial="editingTopic"
          :submit-label="t('topicManager.save')"
          @submit="(data) => updateLocalTopic(editingTopic!.id, data)"
          @cancel="mode = 'list'"
        />

        <!-- 刪除確認 -->
        <div
          v-if="deletingTopic"
          class="d-flex flex-column ga-4"
        >
          <p class="text-body-2 text-medium-emphasis">
            {{ t('topicManager.deleteConfirm') }}
            <span class="font-weight-medium text-high-emphasis">
              「{{ deletingTopic.name }}」
            </span>？<br>{{ t('topicManager.deleteWarning') }}
          </p>
          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="mode = 'list'">
              {{ t('topicManager.cancel') }}
            </v-btn>
            <v-btn
              variant="flat"
              color="error"
              @click="deleteLocalTopic(deletingTopic!.id)"
            >
              {{ t('topicManager.deleteBtn') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-card-actions v-if="mode === 'list'" class="justify-end px-5 pb-5 pt-0">
        <v-btn variant="text" @click="closeDialog">
          {{ t('topicManager.cancel') }}
        </v-btn>
        <v-btn variant="flat" color="primary" @click="saveChanges">
          {{ t('topicManager.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
