<script setup lang="ts">
import type { Topic, TopicColor } from '@/types/topic'
import { TOPIC_COLORS } from '@/types/topic'

const props = defineProps<{
  initial?: Partial<Topic>
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [data: Omit<Topic, 'id' | 'createdAt'>]
  cancel: []
}>()

const { t } = useI18n()

const COLOR_OPTIONS: TopicColor[] = ['violet', 'emerald', 'blue', 'orange', 'rose', 'cyan']
const SLUG_WHITESPACE_RE = /\s+/g

const tab = ref<'briefing' | 'github'>('briefing')
const name = ref(props.initial?.name ?? '')
const color = ref<TopicColor>(props.initial?.color ?? 'violet')
const keywords = ref<string[]>(props.initial?.keywords ?? [])
const jinaUrls = ref<string[]>(props.initial?.jinaUrls ?? [])
const githubKeywords = ref<string[]>(props.initial?.githubKeywords ?? [])
const kwInput = ref('')
const urlInput = ref('')
const ghKwInput = ref('')

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

function addGithubKeyword() {
  const kw = ghKwInput.value.trim()
  if (kw && !githubKeywords.value.includes(kw))
    githubKeywords.value.push(kw)
  ghKwInput.value = ''
}

function removeGithubKeyword(kw: string) {
  githubKeywords.value = githubKeywords.value.filter(k => k !== kw)
}

function handleSubmit() {
  if (!name.value.trim())
    return
  emit('submit', {
    name: name.value.trim(),
    slug: name.value.trim().toLowerCase().replace(SLUG_WHITESPACE_RE, '-'),
    keywords: keywords.value,
    githubKeywords: githubKeywords.value,
    jinaUrls: jinaUrls.value,
    color: color.value,
    enabled: true,
  })
}
</script>

<template>
  <v-form @submit.prevent="handleSubmit">
    <div class="d-flex flex-column ga-4">
      <!-- 共通：主題名稱 -->
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

      <!-- 共通：顏色選擇 -->
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

      <!-- Tabs -->
      <v-tabs
        v-model="tab"
        density="compact"
        color="np-accent"
        grow
      >
        <v-tab value="briefing">
          {{ t('topicForm.tabBriefing') }}
        </v-tab>
        <v-tab value="github">
          {{ t('topicForm.tabGithub') }}
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <!-- 每日精選 Tab -->
        <v-tabs-window-item value="briefing">
          <div class="d-flex flex-column ga-4 pt-2">
            <!-- Jina 新聞來源 -->
            <div>
              <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
                {{ t('topicForm.newsSourceUrl') }}
                <v-tooltip location="top" interactive>
                  <template #activator="{ props: activatorProps }">
                    <v-btn icon="mdi-information-outline" variant="text" size="x-small" v-bind="activatorProps" />
                  </template>
                  <span>{{ t('topicForm.urlsTooltip') }}</span>
                </v-tooltip>
              </div>
              <div class="d-flex align-center ga-2 mb-2">
                <v-text-field
                  v-model="urlInput"
                  :placeholder="t('topicForm.urlPlaceholder')"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :aria-label="t('topicForm.urlPlaceholder')"
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

            <!-- 過濾關鍵字（新聞精選） -->
            <div>
              <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
                {{ t('topicForm.filterKeywords') }}
                <v-tooltip location="top" interactive>
                  <template #activator="{ props: activatorProps }">
                    <v-btn icon="mdi-information-outline" variant="text" size="x-small" v-bind="activatorProps" />
                  </template>
                  <span>{{ t('topicForm.keywordsTooltip') }}</span>
                </v-tooltip>
              </div>
              <div class="d-flex align-center ga-2 mb-2">
                <v-text-field
                  v-model="kwInput"
                  :placeholder="t('topicForm.keywordPlaceholder')"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :aria-label="t('topicForm.keywordPlaceholder')"
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
          </div>
        </v-tabs-window-item>

        <!-- GitHub Trending Tab -->
        <v-tabs-window-item value="github">
          <div class="d-flex flex-column ga-4 pt-2">
            <div>
              <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
                {{ t('topicForm.githubKeywords') }}
                <v-tooltip location="top" interactive>
                  <template #activator="{ props: activatorProps }">
                    <v-btn icon="mdi-information-outline" variant="text" size="x-small" v-bind="activatorProps" />
                  </template>
                  <span>{{ t('topicForm.githubKeywordsTooltip') }}</span>
                </v-tooltip>
              </div>
              <div class="d-flex align-center ga-2 mb-2">
                <v-text-field
                  v-model="ghKwInput"
                  :placeholder="t('topicForm.githubKeywordPlaceholder')"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :aria-label="t('topicForm.githubKeywordPlaceholder')"
                  @keydown.enter.prevent="addGithubKeyword"
                />
                <v-btn size="small" @click="addGithubKeyword">
                  {{ t('topicForm.addBtn') }}
                </v-btn>
              </div>
              <div v-if="githubKeywords.length > 0" class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="kw in githubKeywords"
                  :key="kw"
                  size="small"
                  closable
                  :aria-label="t('topicForm.removeKeywordAria', { kw })"
                  @click:close="removeGithubKeyword(kw)"
                >
                  {{ kw }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>

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
