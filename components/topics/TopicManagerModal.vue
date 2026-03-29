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

watch(dialog, (open) => {
  if (open)
    mode.value = props.initialMode ?? 'list'
  else setTimeout(() => { mode.value = 'list' }, 300)
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
              v-for="topic in topics"
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
          submit-label="新增"
          @submit="(data) => { emit('add', data); closeDialog(); }"
          @cancel="initialMode === 'add' ? closeDialog() : (mode = 'list')"
        />

        <!-- 編輯表單 -->
        <TopicsTopicForm
          v-if="typeof mode === 'object' && mode.type === 'edit'"
          :initial="(mode as { type: 'edit'; topic: Topic }).topic"
          submit-label="儲存"
          @submit="(data) => { emit('update', (mode as { type: 'edit'; topic: Topic }).topic.id, data); mode = 'list'; }"
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
              @click="() => {
                const m = mode as { type: 'delete'; topic: Topic };
                emit('delete', m.topic.id);
                mode = 'list';
              }"
            >
              刪除
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
