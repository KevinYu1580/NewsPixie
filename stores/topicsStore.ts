import type { Topic } from '@/types/topic'
import { defineStore } from 'pinia'
import { DEFAULT_TOPICS } from '@/lib/constants'
import { generateId } from '@/lib/utils'

export const useTopicsStore = defineStore('topics', () => {
  const topics = ref<Topic[]>(DEFAULT_TOPICS)
  const activeTopicId = ref<string | null>(DEFAULT_TOPICS[0]?.id ?? null)

  const activeTopic = computed<Topic | null>(
    () => topics.value.find(t => t.id === activeTopicId.value) ?? topics.value[0] ?? null,
  )

  function addTopic(topicData: Omit<Topic, 'id' | 'createdAt'>) {
    const newTopic: Topic = { ...topicData, id: generateId(), createdAt: Date.now() }
    topics.value.push(newTopic)
  }

  function updateTopic(id: string, updates: Partial<Omit<Topic, 'id' | 'createdAt'>>) {
    const idx = topics.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      topics.value[idx] = { ...topics.value[idx], ...updates }
    }
  }

  function deleteTopic(id: string) {
    topics.value = topics.value.filter(t => t.id !== id)
    if (activeTopicId.value === id) {
      activeTopicId.value = topics.value[0]?.id ?? null
    }
  }

  function setActiveTopic(id: string) {
    activeTopicId.value = id
  }

  return { topics, activeTopicId, activeTopic, addTopic, updateTopic, deleteTopic, setActiveTopic }
}, {
  persist: {
    key: 'newspixie-topics',
    pick: ['topics', 'activeTopicId'],
  },
})
