<script setup lang="ts">
const props = defineProps<{
  title: string
  count?: number
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  defaultCollapsed?: boolean
  skeletonCount?: number
}>()

const collapsed = ref(props.defaultCollapsed ?? false)

const { t } = useI18n()
</script>

<template>
  <section>
    <!-- 標題列 -->
    <div class="d-flex align-center ga-2 w-100 mb-3">
      <button
        class="np-section-toggle d-flex align-center ga-2 flex-grow-1 text-left"
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      >
        <span class="font-mono-label text-xs text-uppercase tracking-widest text-medium-emphasis">
          {{ title }}
        </span>
        <v-chip
          v-if="count !== undefined && count > 0"
          size="x-small"
          variant="tonal"
          class="font-mono"
        >
          {{ count }}
        </v-chip>
        <v-spacer />
        <v-icon
          :icon="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'"
          size="14"
          class="text-medium-emphasis"
        />
      </button>
    </div>
    <div class="d-flex justify-end">
      <slot name="actions" />
    </div>

    <!-- 內容 -->
    <div v-if="!collapsed">
      <div v-if="isLoading" class="d-grid np-card-grid ga-3">
        <v-skeleton-loader
          v-for="i in (skeletonCount ?? 4)"
          :key="i"
          type="card"
          height="100"
        />
      </div>
      <p
        v-else-if="isEmpty"
        class="text-center text-caption text-medium-emphasis py-6"
      >
        {{ emptyMessage ?? t('section.emptyDefault') }}
      </p>
      <slot v-else />
    </div>
  </section>
</template>
