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
          主題名稱
        </div>
        <v-text-field
          v-model="name"
          placeholder="e.g. AI & 機器學習"
          density="compact"
          variant="outlined"
          hide-details
          required
          aria-label="主題名稱"
        />
      </div>

      <!-- 顏色選擇 -->
      <div>
        <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
          顏色
        </div>
        <div class="d-flex ga-2">
          <button
            v-for="c in COLOR_OPTIONS"
            :key="c"
            type="button"
            :aria-label="`選擇 ${c} 顏色`"
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
          過濾關鍵字
          <v-tooltip
            location="top"
            interactive
          >
            <template #activator="{ props: activatorProps }">
              <v-btn icon="mdi-information-outline" variant="text" size="x-small" v-bind="activatorProps" />
            </template>

            <span>
              Ai引擎會優先分析包含這些關鍵字的文章<br>建議輸入與主題相關的詞彙
            </span>
          </v-tooltip>
        </div>
        <div class="d-flex align-center ga-2 mb-2">
          <v-text-field
            v-model="kwInput"
            placeholder="輸入關鍵字後按 Enter"
            density="compact"
            variant="outlined"
            hide-details
            aria-label="新增關鍵字"
            @keydown.enter.prevent="addKeyword"
          />
          <v-btn size="small" @click="addKeyword">
            新增
          </v-btn>
        </div>
        <div v-if="keywords.length > 0" class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="kw in keywords"
            :key="kw"
            size="small"
            closable
            :aria-label="`移除關鍵字 ${kw}`"
            @click:close="removeKeyword(kw)"
          >
            {{ kw }}
          </v-chip>
        </div>
      </div>

      <!-- GitHub 查詢 -->
      <div>
        <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
          GitHub 搜尋詞
        </div>
        <v-text-field
          v-model="githubQuery"
          placeholder="e.g. machine-learning, fintech"
          density="compact"
          variant="outlined"
          hide-details
          aria-label="GitHub 搜尋詞"
        />
      </div>

      <!-- Jina 新聞來源 -->
      <div>
        <div class="text-caption font-weight-medium text-uppercase tracking-widest text-medium-emphasis mb-2">
          新聞來源網址
          <v-tooltip
            location="top"
            interactive
          >
            <template #activator="{ props: activatorProps }">
              <v-btn icon="mdi-information-outline" variant="text" size="x-small" v-bind="activatorProps" />
            </template>

            <span>
              為新聞資料來源，建議輸入包文章列表的網站以便最佳化Ai摘要效果<br>例：<a class="text-blue" href="https://www.bnext.com.tw/" target="_blank" rel="noopener noreferrer">https://www.bnext.com.tw/</a>
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
            加入
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
              :aria-label="`移除 ${url}`"
              @click="removeJinaUrl(url)"
            />
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="d-flex justify-end ga-2 pt-2">
        <v-btn variant="text" @click="emit('cancel')">
          取消
        </v-btn>
        <v-btn
          type="submit"
          variant="flat"
          :disabled="!name.trim()"
        >
          {{ submitLabel ?? '儲存' }}
        </v-btn>
      </div>
    </div>
  </v-form>
</template>
