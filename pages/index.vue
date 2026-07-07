<script setup lang="ts">
import { useBookmarksStore } from '@/stores/bookmarksStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTopicsStore } from '@/stores/topicsStore'
import { TOPIC_COLORS } from '@/types/topic'

const topicsStore = useTopicsStore()
const settingsStore = useSettingsStore()
const bookmarksStore = useBookmarksStore()

const { t } = useI18n()
useHead({ title: () => t('index.pageTitle') })

const viewMode = ref<'topic' | 'bookmarks'>('topic')

const topics = computed(() => topicsStore.topics)
const activeTopic = computed(() => topicsStore.activeTopic)
const activeTopicId = computed(() => topicsStore.activeTopicId)
const activeTopicColor = computed(() =>
  activeTopic.value ? TOPIC_COLORS[activeTopic.value.color] : null,
)

const mobileDrawer = computed({
  get: () => settingsStore.mobileDrawerOpen,
  set: v => settingsStore.setMobileDrawer(v),
})
</script>

<template>
  <!-- 手機：temporary drawer -->
  <v-navigation-drawer
    v-model="mobileDrawer"
    temporary
    width="256"
    color="np-surface"
    class="d-flex  flex-column"
  >
    <LayoutAppSidebar
      :topics="topics"
      :active-topic-id="activeTopicId"
      :is-bookmarks-view="viewMode === 'bookmarks'"
      :bookmarks-count="bookmarksStore.totalCount"
      @select-topic="(id) => { topicsStore.setActiveTopic(id); viewMode = 'topic'; mobileDrawer = false; }"
      @select-bookmarks="() => { viewMode = 'bookmarks'; mobileDrawer = false; }"
      @add-topic="topicsStore.addTopic"
      @update-topic="topicsStore.updateTopic"
      @delete-topic="topicsStore.deleteTopic"
    />
  </v-navigation-drawer>

  <LayoutAppHeader />

  <v-main>
    <!-- Feed 區域 -->
    <v-container
      fluid
    >
      <div
        class="mx-auto px-4 py-6 px-md-6"
        style="max-width: 896px;"
      >
        <div
          v-if="viewMode === 'bookmarks'"
          class="mb-6"
        >
          <h1 class="font-mono-label text-xs text-uppercase tracking-widest">
            {{ t('sidebar.myBookmarks') }}
          </h1>
        </div>
        <div
          v-else-if="activeTopic"
          class="mb-6"
        >
          <h1
            class="font-mono-label text-xs text-uppercase tracking-widest"
            :style="{ color: activeTopicColor?.hex }"
          >
            {{ activeTopic.name }}
          </h1>
        </div>

        <ContentBookmarksView v-if="viewMode === 'bookmarks'" />

        <ContentBriefingFeed
          v-else-if="activeTopic"
          :key="activeTopic.id"
          :topic="activeTopic"
        />

        <div
          v-else
          class="d-flex flex-column align-center justify-center text-center py-20"
        >
          <p class="text-medium-emphasis">
            {{ t('index.noTopicHint') }}
          </p>
        </div>
      </div>
    </v-container>
  </v-main>
</template>
