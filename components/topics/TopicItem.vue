<script setup lang="ts">
import type { Topic } from '@/types/topic'
import { TOPIC_COLORS } from '@/types/topic'

const props = defineProps<{
  topic: Topic
  isActive: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const color = computed(() => TOPIC_COLORS[props.topic.color])
</script>

<template>
  <v-list-item
    :active="isActive"
    :aria-current="isActive ? 'page' : undefined"
    class="np-topic-item rounded"
    @click="emit('click')"
  >
    <template #prepend>
      <span
        class="np-topic-dot mr-2"
        :style="{ backgroundColor: isActive ? color.hex : 'rgba(var(--v-theme-on-surface), 0.3)' }"
        aria-hidden="true"
      />
    </template>
    <v-list-item-title class="text-body-2">
      {{ topic.name }}
    </v-list-item-title>
  </v-list-item>
</template>
