<script setup lang="ts">
import type { Topic, TopicColor } from '@/types/topic'
import { TOPIC_COLORS } from '@/types/topic'

const { t } = useI18n()

const props = defineProps<{
  initial?: Partial<Topic>
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [data: Omit<Topic, 'id' | 'createdAt'>]
  cancel: []
}>()

const COLOR_OPTIONS: TopicColor[] = ['violet', 'emerald', 'blue', 'orange', 'rose', 'cyan']

const name = ref(props.initial?.name ?? '')
const githubQuery = ref(props.initial?.githubQuery ?? '')
const color = ref<TopicColor>(props.initial?.color ?? 'violet')
const keywords = ref<string[]>(props.initial?.keywords ?? [])
const jinaUrls = ref<string[]>(props.initial?.jinaUrls ?? [])
const kwInput = ref('')
const urlInput = ref('')

function addKeyword() {
  const kw = kwInput.value.trim()
  if (kw && !keywords.value.includes(kw))
    keywords.value.push(kw)
  kwInput.value = ''
}

function removeKeyword(kw: string) {
  keywords.value = keywords.value.filter(k => k !== kw)
}

function addJinaUrl() {
  const url = urlInput.value.trim()
  if (url && !jinaUrls.value.includes(url))
    jinaUrls.value.push(url)
  urlInput.value = ''
}

function removeJinaUrl(url: string) {
  jinaUrls.value = jinaUrls.value.filter(u => u !== url)
}

function handleSubmit() {
  if (!name.value.trim())
    return
  emit('submit', {
    name: name.value.trim(),
    slug: name.value.trim().toLowerCase().replace(/\s+/g, '-'),
    keywords: keywords.value,
    githubQuery: githubQuery.value.trim() || name.value.trim().toLowerCase(),
    jinaUrls: jinaUrls.value,
    color: color.value,
    enabled: true,
  })
}
</script>

<template>
  <v-form @submit.prevent="handleSubmit">
    <div class="d-flex flex-column ga-4">
      <!-- 主題名稱 -->
      <div>
        <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
          {{ t('topicForm.topicName') }}
        </div>
        <v-text-field
          v-model="name"
          placeholder="e.g. AI & 機器學習"
          density="compact"
          variant="outlined"
          hide-details
          required
          :aria-label="t('topicForm.topicName')"
        />
      </div>

      <!-- 顏色選擇 -->
      <div>
        <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
          {{ t('topicForm.color') }}
        </div>
        <div class="d-flex ga-2">
          <button
            v-for="c in COLOR_OPTIONS"
            :key="c"
            type="button"
            :aria-label="t('topicForm.colorSelectAria', { color: c })"
            class="np-color-btn"
            :class="{ 'np-color-btn--active': color === c }"
            :style="{ backgroundColor: TOPIC_COLORS[c].hex }"
            @click="color = c"
          />
        </div>
      </div>

      <!-- 關鍵字 -->
      <div>
        <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
          {{ t('topicForm.filterKeywords') }}
          <v-tooltip
            location="top"
            interactive
          >
            <template #activator="{ props: activatorProps }">
              <v-btn icon="mdi-information-outline" variant="text" size="x-small" v-bind="activatorProps" />
            </template>

            <span>
              {{ t('topicForm.keywordsTooltip') }}
            </span>
          </v-tooltip>
        </div>
        <div class="d-flex align-center ga-2 mb-2">
          <v-text-field
            v-model="kwInput"
            :placeholder="t('topicForm.keywordPlaceholder')"
            density="compact"
            variant="outlined"
            hide-details
            aria-label="新增關鍵字"
            @keydown.enter.prevent="addKeyword"
          />
          <v-btn size="small" @click="addKeyword">
            {{ t('topicForm.addBtn') }}
          </v-btn>
        </div>
        <div v-if="keywords.length > 0" class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="kw in keywords"
            :key="kw"
            size="small"
            closable
            :aria-label="t('topicForm.removeKeywordAria', { kw })"
            @click:close="removeKeyword(kw)"
          >
            {{ kw }}
          </v-chip>
        </div>
      </div>

      <!-- GitHub 查詢 -->
      <div>
        <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
          {{ t('topicForm.githubQuery') }}
        </div>
        <v-text-field
          v-model="githubQuery"
          placeholder="e.g. machine-learning, fintech"
          density="compact"
          variant="outlined"
          hide-details
          :aria-label="t('topicForm.githubQuery')"
        />
      </div>

      <!-- Jina 新聞來源 -->
      <div>
        <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
          {{ t('topicForm.newsSourceUrl') }}
          <v-tooltip
            location="top"
            interactive
          >
            <template #activator="{ props: activatorProps }">
              <v-btn icon="mdi-information-outline" variant="text" size="x-small" v-bind="activatorProps" />
            </template>

            <span>
              {{ t('topicForm.urlsTooltip') }}
            </span>
          </v-tooltip>
        </div>
        <div class="d-flex align-center ga-2 mb-2">
          <v-text-field
            v-model="urlInput"
            placeholder="輸入任一新聞來源網址"
            density="compact"
            variant="outlined"
            hide-details
            aria-label="新增新聞來源網址"
            @keydown.enter.prevent="addJinaUrl"
          />
          <v-btn size="small" @click="addJinaUrl">
            {{ t('topicForm.joinBtn') }}
          </v-btn>
        </div>
        <div v-if="jinaUrls.length > 0" class="d-flex flex-column ga-1">
          <div
            v-for="url in jinaUrls"
            :key="url"
            class="d-flex align-center ga-2 text-caption text-medium-emphasis"
          >
            <v-icon icon="mdi-web" size="x-small" color="np-accent" />
            <span class="text-truncate flex-grow-1">{{ url }}</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="x-small"
              :aria-label="t('topicForm.removeUrlAria', { url })"
              @click="removeJinaUrl(url)"
            />
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="d-flex justify-end ga-2 pt-2">
        <v-btn variant="text" @click="emit('cancel')">
          {{ t('topicForm.cancel') }}
        </v-btn>
        <v-btn
          type="submit"
          variant="flat"
          :disabled="!name.trim()"
        >
          {{ submitLabel ?? t('topicForm.save') }}
        </v-btn>
      </div>
    </div>
  </v-form>
</template>
