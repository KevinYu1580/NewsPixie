# NewsPixie — 架構說明文件 (arc24)

> 版本：0.1.0 | 日期：2026-04-14

---

## 目錄

1. [專案概覽](#1-專案概覽)
2. [技術堆疊](#2-技術堆疊)
3. [目錄結構](#3-目錄結構)
4. [資料模型](#4-資料模型)
   - 4.1 [Topic](#41-topic)
   - 4.2 [NewsItem / RepoItem](#42-newsitem--repoitem)
   - 4.3 [CuratedArticle / DailyBriefingCache](#43-curatedarticle--dailybriefingcache)
5. [狀態管理（Pinia Stores）](#5-狀態管理pinia-stores)
   - 5.1 [topicsStore](#51-topicsstore)
   - 5.2 [settingsStore](#52-settingsstore)
6. [Composables](#6-composables)
   - 6.1 [useDailyBriefing](#61-usedailybriefing)
   - 6.2 [useGithubTrending](#62-usegithubtrending)
7. [Server API 端點](#7-server-api-端點)
   - 7.1 [GET /api/rss](#71-get-apirss)
   - 7.2 [GET /api/github-trending](#72-get-apigithub-trending)
   - 7.3 [GET /api/jina-fetch](#73-get-apijina-fetch)
   - 7.4 [GET /api/discover-feed](#74-get-apidiscover-feed)
   - 7.5 [POST /api/ai-extract-articles](#75-post-apiai-extract-articles)
   - 7.6 [POST /api/ai-curate](#76-post-apiai-curate)
   - 7.7 [POST /api/ai-summarize](#77-post-apiai-summarize)
   - 7.8 [POST /api/ai-briefing](#78-post-apiai-briefing)
   - 7.9 [POST /api/ai-repo-describe](#79-post-apiai-repo-describe)
   - 7.10 [GET /api/og-image](#710-get-apiog-image)
8. [UI 組件樹](#8-ui-組件樹)
   - 8.1 [Layout 層](#81-layout-層)
   - 8.2 [Content 層](#82-content-層)
   - 8.3 [Topics 層](#83-topics-層)
9. [核心資料流](#9-核心資料流)
   - 9.1 [每日精選 Pipeline](#91-每日精選-pipeline)
   - 9.2 [GitHub Trending Pipeline](#92-github-trending-pipeline)
10. [快取策略](#10-快取策略)
11. [設定與環境變數](#11-設定與環境變數)
12. [持久化機制](#12-持久化機制)

---

## 1. 專案概覽

**NewsPixie** 是一個純前端 SPA（搭配 Nuxt server-side API proxy），以「主題」為核心組織個人化每日新聞看板。使用者自訂主題（關鍵字、GitHub 查詢、網站來源），App 於每日指定時間自動：

1. 透過 **Jina Reader** 抓取各來源首頁 Markdown
2. 使用 **Claude AI** 從 Markdown 中萃取文章清單
3. 再次透過 **Claude AI** 依主題關鍵字精選 Top N 篇文章
4. 平行拉取 **GitHub Search API** 的近 7 天熱門 Repos，並以 AI 擴寫描述

所有結果快取於瀏覽器 **localStorage**，當日有快取則直接讀取，不重複呼叫 API。

---

## 2. 技術堆疊

| 層次 | 技術 |
|------|------|
| 框架 | Nuxt 4 (ssr: false — 純 CSR) |
| UI 元件庫 | Vuetify 4 |
| 狀態管理 | Pinia 3 + pinia-plugin-persistedstate（settingsStore 透過 encrypt-storage 以 AES 加密） |
| AI 模型 | Anthropic Claude / OpenAI GPT / Google Gemini（可切換） |
| AI 呼叫方式 | 純 REST（無 SDK），統一透過 `server/utils/ai-client.ts` |
| 網頁擷取 | Jina Reader (`r.jina.ai`) |
| RSS 解析 | fast-xml-parser |
| GitHub 資料 | GitHub Search API (`api.github.com`) |
| 語言 | TypeScript（strict mode） |
| Linting | ESLint + @antfu/eslint-config |
| 測試 | Vitest |
| 套件管理 | pnpm |

---

## 3. 目錄結構

```
NewsPixie/
├── app.vue                  # 根元件（主題色注入）
├── pages/
│   └── index.vue            # 唯一頁面，組合 Sidebar + Header + Feed
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue    # 頂部 AppBar（標題、主題切換、設定入口）
│   │   ├── AppSidebar.vue   # 側邊欄（主題列表、新增、管理）
│   │   └── SettingsModal.vue# 全域設定對話框
│   ├── content/
│   │   ├── BriefingFeed.vue # 主 Feed（每日精選 + Trending Repos）
│   │   ├── Section.vue      # 通用卡片容器（標題、計數、動作列）
│   │   ├── news/
│   │   │   ├── Briefing.vue # 每日精選渲染邏輯（loading / error / empty）
│   │   │   └── Card.vue     # 單篇文章卡片
│   │   └── github/
│   │       ├── Trending.vue # GitHub Trending 渲染邏輯
│   │       └── RepoCard.vue # 單個 Repo 卡片
│   └── topics/
│       ├── TopicManagerModal.vue # 主題管理對話框（列表/新增/編輯/刪除）
│       ├── TopicForm.vue    # 主題表單（新增 & 編輯共用）
│       └── TopicItem.vue    # 側邊欄主題列表項目
├── composables/
│   ├── useDailyBriefing.ts  # 每日精選完整 pipeline（見 §6.1）
│   └── useBriefingData.ts   # GitHub Trending 快取與抓取（見 §6.2）
├── stores/
│   ├── topicsStore.ts       # 主題 CRUD 狀態（見 §5.1）
│   └── settingsStore.ts     # 全域設定狀態（見 §5.2）
├── server/
│   ├── api/                 # Nuxt server routes（見 §7）
│   │   ├── rss.get.ts
│   │   ├── github-trending.get.ts
│   │   ├── jina-fetch.get.ts
│   │   ├── discover-feed.get.ts
│   │   ├── ai-extract-articles.post.ts
│   │   ├── ai-curate.post.ts
│   │   ├── ai-summarize.post.ts
│   │   ├── ai-briefing.post.ts
│   │   └── ai-repo-describe.post.ts
│   └── utils/
│       ├── anthropic.ts     # 共用 Anthropic client 工廠
│       ├── github.ts        # GitHub Search API 呼叫（server auto-import）
│       └── rss.ts           # RSS 解析邏輯（server auto-import）
├── constants/
│   └── index.ts             # DEFAULT_TOPICS、SOURCE_CONFIG、LANGUAGE_COLORS、MAX_CACHE_DAYS
├── utils/
│   └── utils.ts             # generateId、todayStr、formatRelativeTime 等（auto-import）
├── types/
│   ├── topic.ts             # Topic、TopicColor、TOPIC_COLORS（見 §4.1）
│   └── content.ts           # NewsItem、RepoItem（見 §4.2）
├── assets/
│   └── globals.css          # 全域樣式、自訂 token
├── plugins/
│   └── vuetify.ts           # Vuetify 主題設定（dark/light、自訂色彩）
└── nuxt.config.ts           # Nuxt 設定（ssr、runtimeConfig、css）
```

---

## 4. 資料模型

### 4.1 Topic

定義於 [types/topic.ts](types/topic.ts)。

```ts
interface Topic {
  id: string           // 唯一識別，由 generateId() 產生
  name: string         // 顯示名稱，e.g. 'AI & 機器學習'
  slug: string         // URL-friendly 識別，e.g. 'ai-ml'
  keywords: string[]   // AI 精選時的過濾關鍵字
  githubQuery: string  // 傳入 GitHub Search API 的查詢字串
  jinaUrls: string[]   // 透過 Jina Reader 抓取的網站 URL 列表
  color: TopicColor    // UI 色彩標記（見下方 TOPIC_COLORS）
  enabled: boolean     // 是否啟用
  createdAt: number    // Unix timestamp
}

type TopicColor = 'violet' | 'emerald' | 'blue' | 'orange' | 'rose' | 'cyan'
```

`TOPIC_COLORS` 將 `TopicColor` 映射至 Vuetify 色彩名稱與 HEX 值，用於 UI 渲染（側邊欄標記、頁面標題色彩等）。

預設主題（[constants/index.ts](constants/index.ts) `DEFAULT_TOPICS`）：`ai-ml`、`finance`、`tech`。

### 4.2 NewsItem / RepoItem

定義於 [types/content.ts](types/content.ts)。

```ts
interface NewsItem {
  id: string
  title: string
  url: string
  source: 'github' | 'jina'
  author?: string
  publishedAt: string  // ISO 8601
  domain?: string
  score?: number
  commentCount?: number
  commentUrl?: string
}

interface RepoItem {
  id: string
  name: string          // 'owner/repo' 格式
  url: string
  description: string
  language?: string
  languageColor?: string
  stars: number
  starsToday?: number
  forks: number
  source: 'github'
}
```

### 4.3 CuratedArticle / DailyBriefingCache

定義於 [composables/useDailyBriefing.ts](composables/useDailyBriefing.ts)。

```ts
interface CuratedArticle {
  title: string
  url: string
  imageUrl?: string  // OG image，Step 4 平行抓取，可能為 undefined
}

interface DailyBriefingCache {
  topicId: string
  date: string       // 'YYYY-MM-DD'
  articles: CuratedArticle[]
  generatedAt: string  // ISO 8601
}
```

快取 key 格式：`newspixie-daily-{topicId}-{YYYY-MM-DD}`

---

## 5. 狀態管理（Pinia Stores）

### 5.1 topicsStore

檔案：[stores/topicsStore.ts](stores/topicsStore.ts)

| State | 型別 | 說明 |
|-------|------|------|
| `topics` | `Topic[]` | 所有主題，初始值為 `DEFAULT_TOPICS` |
| `activeTopicId` | `string \| null` | 目前選中的主題 ID |

| Computed | 說明 |
|----------|------|
| `activeTopic` | 依 `activeTopicId` 查找，找不到則 fallback 至第一個 |

| Action | 說明 |
|--------|------|
| `addTopic(data)` | 新增主題，自動注入 `id`（`generateId()`）與 `createdAt` |
| `updateTopic(id, updates)` | 部分更新主題 |
| `deleteTopic(id)` | 刪除主題，若刪除的是 active 則切換至第一個 |
| `setActiveTopic(id)` | 切換 active 主題 |

持久化：`localStorage` key `newspixie-topics`，pickle `topics` + `activeTopicId`。

### 5.2 settingsStore

檔案：[stores/settingsStore.ts](stores/settingsStore.ts)

| State | 型別 | 預設值 | 說明 |
|-------|------|--------|------|
| `provider` | `AIProvider` | `'anthropic'` | 目前選用的 AI Provider |
| `anthropicKey` | `string` | `''` | Anthropic API Key |
| `openaiKey` | `string` | `''` | OpenAI API Key |
| `geminiKey` | `string` | `''` | Google Gemini API Key |
| `anthropicModel` | `AnthropicModel` | `'claude-haiku-4-5-20251001'` | Anthropic 模型選擇 |
| `openaiModel` | `OpenAIModel` | `'gpt-4o-mini'` | OpenAI 模型選擇 |
| `geminiModel` | `GeminiModel` | `'gemini-2.0-flash'` | Gemini 模型選擇 |
| `themeName` | `'dark' \| 'light'` | `'dark'` | UI 主題 |
| `mobileDrawerOpen` | `boolean` | `false` | 手機側邊欄狀態 |
| `fetchTime` | `string` | `'07:00'` | 每日自動觸發時間（HH:MM） |
| `articleCount` | `number` | `5` | 每主題精選篇數（3–10） |
| `repoCount` | `number` | `8` | 每主題 Repo 數（4–10） |

| Computed | 說明 |
|----------|------|
| `currentApiKey` | 目前選中 provider 的 API Key |
| `currentModel` | 目前選中 provider 的模型 |
| `hasApiKey` | 是否已設定有效 API Key（依 currentApiKey 判斷） |

持久化：`localStorage` key `newspixie-settings`，全欄位持久化。

Provider 及模型清單由 `PROVIDER_CONFIGS`（[types/ai.ts](types/ai.ts)）定義，在 [SettingsModal](components/layout/SettingsModal.vue) 中渲染為 provider 切換器 + 卡片式模型選擇器。

---

## 6. Composables

### 6.1 useDailyBriefing

檔案：[composables/useDailyBriefing.ts](composables/useDailyBriefing.ts)

接收 `Ref<Topic | null>`，管理每日精選完整 pipeline（見 [§9.1](#91-每日精選-pipeline)）。

| 回傳值 | 型別 | 說明 |
|--------|------|------|
| `articles` | `Ref<CuratedArticle[]>` | 精選文章清單 |
| `generatedAt` | `Ref<string>` | 最後生成時間（ISO 8601） |
| `isLoading` | `Ref<boolean>` | 是否正在載入 |
| `error` | `Ref<string \| null>` | 錯誤訊息 |
| `stage` | `Ref<'idle' \| 'fetching-list' \| 'extracting' \| 'curating' \| 'done'>` | 目前執行階段 |
| `stageLabel` | `ComputedRef<string>` | 給 UI 顯示的階段文字 |
| `hasBriefing` | `ComputedRef<boolean>` | 是否已有精選內容 |
| `fetchedToday` | `ComputedRef<boolean>` | 今日是否已抓取過 |
| `run()` | `() => Promise<void>` | 手動觸發（強制重新執行） |

**自動觸發邏輯**（`autoTriggerIfNeeded`）：
- Watch `topic` 變更時呼叫；Watch `settingsStore.hasApiKey` 由 false → true 時也會呼叫
- 若今日已有快取 → 直接讀取，不呼叫 API
- 若有 API Key 且今日尚未抓取且 topic 有 jinaUrls → 立即執行（不再以 `settingsStore.fetchTime` 作閘門）

快取 key：`newspixie-daily-{topicId}-{YYYY-MM-DD}`（詳見 [§10](#10-快取策略)）

### 6.2 useGithubTrending

檔案：[composables/useBriefingData.ts](composables/useBriefingData.ts)

接收 `Ref<Topic | null>`，管理 GitHub Trending 資料的抓取與快取。

| 回傳值 | 型別 | 說明 |
|--------|------|------|
| `data` | `Ref<RepoItem[]>` | Trending Repo 清單 |
| `isLoading` | `Ref<boolean>` | 是否正在載入 |
| `isError` | `Ref<boolean>` | 是否發生錯誤 |
| `error` | `Ref<string \| null>` | 錯誤訊息 |
| `cachedAt` | `Ref<string>` | 快取時間（ISO 8601） |
| `refetch()` | `() => Promise<void>` | 強制重新抓取（忽略快取） |

**自動觸發**：watch `topic` 變更時呼叫；watch `settingsStore.hasApiKey` 由 false → true 時也會呼叫。有快取則直接讀取。

抓取後若有 `apiKey`，會額外呼叫 [POST /api/ai-repo-describe](#79-post-apiai-repo-describe) 以 AI 擴寫 Repo description；失敗時靜默降級，保留原始 description。

快取 key：`newspixie-github-{topicId}-{YYYY-MM-DD}`（詳見 [§10](#10-快取策略)）

---

## 7. Server API 端點

所有端點定義於 [server/api/](server/api/)，由 Nuxt Server Routes 自動掛載。

共用 AI client 工廠位於 [server/utils/ai-client.ts](server/utils/ai-client.ts)，純 REST 呼叫（無 SDK），支援三個 provider。API key 及 provider 僅來自 client 端請求 body，不使用 server-side env。

各端點 request body 包含 `apiKey`、`model`、`provider`（均為 optional，`provider` 不傳預設 `'anthropic'`）。

模型由使用者透過 `POST /api/ai-models` 動態獲取，不再使用靜態白名單。`server/utils/ai-client.ts` 僅驗證 model 為非空字串，無效 model ID 由 provider 端自行回傳 4xx 錯誤。

### 7.1 GET /api/rss

```
?feed=<RSS feed URL>&limit=<number>
```

透過 [server/utils/rss.ts](server/utils/rss.ts) 的 `fetchRss()` 抓取並解析 RSS/Atom feed。使用 `fast-xml-parser` 解析，回傳 `NewsItem[]`。

### 7.2 GET /api/github-trending

```
?query=<search string>&limit=<number>
```

透過 [server/utils/github.ts](server/utils/github.ts) 的 `fetchGithubTrending()` 呼叫 GitHub Search API，查詢條件限定 `created:>{7天前}` 並依星數排序。回傳 `RepoItem[]`。

### 7.3 GET /api/jina-fetch

```
?url=<target URL>
```

Proxy 至 Jina Reader (`https://r.jina.ai/{url}`)，要求 JSON 格式回應，回傳 `{ content: string }`（raw Markdown）。供 [useDailyBriefing](#61-usedailybriefing) Step 1 使用。

### 7.4 GET /api/discover-feed

RSS feed 來源探索端點（預留功能）。

### 7.5 POST /api/ai-models

```json
{ "provider": "anthropic | openai | gemini", "apiKey": "..." }
```

向各 provider 官方 API 查詢可用模型清單，回傳：

```json
{ "models": [{ "id": "...", "label": "..." }] }
```

各 provider 查詢端點：
- **Gemini**：`GET /v1beta/models?key=...`，filter `supportedGenerationMethods.includes('generateContent')`
- **Anthropic**：`GET /v1/models`，filter `id.startsWith('claude')`
- **OpenAI**：`GET /v1/models`，filter `id.startsWith('gpt') || /^o[0-9]/`

供 [SettingsModal](components/layout/SettingsModal.vue) 在使用者輸入 API Key 後動態載入模型選項。

### 7.6 POST /api/ai-extract-articles

```json
{
  "content": "<jina markdown string>",
  "apiKey": "...",
  "model": "..."
}
```

使用 Claude AI 從 Jina Markdown 中萃取文章標題與 URL，回傳：

```json
{ "articles": [{ "title": "...", "url": "..." }] }
```

供 [useDailyBriefing](#61-usedailybriefing) Step 2 使用。

### 7.6 POST /api/ai-curate

```json
{
  "topicName": "...",
  "keywords": ["..."],
  "articles": [{ "title": "...", "url": "..." }],
  "count": 5,
  "apiKey": "...",
  "model": "..."
}
```

使用 Claude AI 從候選文章中依主題關鍵字精選 Top N 篇，AI 回傳文章索引陣列（如 `[1, 3, 7]`），端點再映射回完整文章物件：

```json
{ "selected": [{ "title": "...", "url": "..." }] }
```

供 [useDailyBriefing](#61-usedailybriefing) Step 3 使用。

### 7.7 POST /api/ai-summarize

```json
{
  "topicName": "...",
  "articles": [{ "title": "...", "url": "...", "content": "..." }],
  "apiKey": "...",
  "model": "..."
}
```

批次為多篇文章各自生成繁體中文摘要（1–5 句）：

```json
{
  "articles": [{ "title": "...", "url": "...", "summary": "..." }],
  "generatedAt": "..."
}
```

### 7.8 POST /api/ai-briefing

```json
{
  "topicName": "...",
  "headlines": ["...", "..."],
  "apiKey": "...",
  "model": "..."
}
```

以播報員風格將 headlines 濃縮為 3 句繁體中文晨間播報摘要：

```json
{ "summary": "第一句。\n第二句。\n第三句。", "generatedAt": "..." }
```

### 7.9 POST /api/ai-repo-describe

```json
{
  "topicName": "...",
  "repos": [{ "name": "...", "description": "...", "language": "...", "stars": 0 }],
  "apiKey": "...",
  "model": "..."
}
```

以主題視角批次擴寫 GitHub Repo 的描述：

```json
{ "descriptions": [{ "name": "owner/repo", "description": "..." }] }
```

由 [useGithubTrending](#62-usegithubtrending) 在資料抓取後以靜默方式呼叫，失敗不影響主流程。

### 7.10 GET /api/og-image

```
?url=<article URL>
```

只抓前 16KB HTML，解析 `og:image` / `twitter:image` meta tag，回傳：

```json
{ "imageUrl": "https://..." }
```

`imageUrl` 可為 `null`（找不到時）。由 [useDailyBriefing](#61-usedailybriefing) Step 4 對每篇精選文章平行呼叫，失敗靜默降級（article 仍保留，只是無圖）。

---

## 8. UI 組件樹

### 8.1 Layout 層

```
pages/index.vue
├── v-navigation-drawer (手機用 temporary drawer)
│   └── LayoutAppSidebar
│       └── TopicsTopicManagerModal
│           ├── TopicsTopicForm (add mode)
│           ├── TopicsTopicForm (edit mode)
│           └── delete confirm
├── LayoutAppHeader
│   └── LayoutSettingsModal (齒輪按鈕)
└── v-main
    └── ContentBriefingFeed
```

**AppHeader** — 含品牌名稱、日期播報標籤、`SettingsModal` 入口、深/淺色切換。

**AppSidebar** — 主題清單（`TopicItem` × N）、新增按鈕、管理按鈕；透過 emit 將 CRUD 操作傳至 `pages/index.vue` → `topicsStore`。

**SettingsModal** — 負責 API Key 輸入、每日觸發時間、精選篇數、Repo 數、模型選擇。採本地 state 暫存，點「儲存」後統一 commit 至 [settingsStore](#52-settingsstore)。API Key 為選填，不填亦可儲存（僅影響 BriefingFeed 是否顯示內容）。

### 8.2 Content 層

```
ContentBriefingFeed (topic prop)
├── ContentSection (title="每日精選")
│   └── ContentNewsBriefing
│       └── ContentNewsCard × N
└── ContentSection (title="趨勢 Repos")
    └── ContentGithubTrending
        └── ContentGithubRepoCard × N
```

**BriefingFeed** — 組合 [useDailyBriefing](#61-usedailybriefing) 與 [useGithubTrending](#62-usegithubtrending)，以 `topic` prop 的 `id` 為 key 讓 Vue 在切換主題時完整重建。當 `settingsStore.hasApiKey` 為 false 時，兩個 Section 整體以一張 SVG 插圖（幽靈內容 + 鎖頭圖示）取代，提示使用者輸入 API Key；設定完成後自動切回正常兩區塊並立即觸發抓取。首次進入不再強制彈出 SettingsModal。

**Section** — 通用容器，提供標題、數量 badge、右側 `#actions` slot（通常放刷新按鈕 + 時間戳）。

**Briefing** — 處理四種狀態：loading（skeleton + 進度文字）、error（v-alert）、無來源提示、文章清單。

### 8.3 Topics 層

```
TopicsTopicManagerModal
├── list mode
│   └── TopicsTopicItem × N (read-only, with edit/delete actions)
├── add mode
│   └── TopicsTopicForm
├── edit mode
│   └── TopicsTopicForm (prefilled)
└── delete mode
    └── confirm dialog
```

**TopicManagerModal** 採「本地編輯後統一儲存」模式：開啟 dialog 時 deep clone `topics` 到 `localTopics`，所有 CRUD 操作在 local state 完成，點「儲存」才 diff 並批次 emit `add`/`update`/`delete` 事件。

**TopicForm** — 新增與編輯共用，接收可選 `initial` prop（有則為編輯模式）。

---

## 9. 核心資料流

### 9.1 每日精選 Pipeline

由 [useDailyBriefing](#61-usedailybriefing) 驅動，依序呼叫以下端點：

```
┌─────────────────────────────────────────────────────────────────┐
│  useDailyBriefing.run()                                         │
│                                                                 │
│  Stage 1: fetching-list                                         │
│  ┌─────────────────────────────────────────┐                   │
│  │ topic.jinaUrls (parallel)               │                   │
│  │   └─> GET /api/jina-fetch?url=...       │                   │
│  │       └─> Jina Reader r.jina.ai/{url}   │                   │
│  │           └─> { content: markdown }     │                   │
│  └─────────────────────────────────────────┘                   │
│                     │ contents[]                                │
│  Stage 2: extracting                                            │
│  ┌─────────────────────────────────────────┐                   │
│  │ contents (parallel)                     │                   │
│  │   └─> POST /api/ai-extract-articles     │                   │
│  │       └─> Claude: markdown → articles   │                   │
│  │           └─> { articles: [{title,url}] }                   │
│  └─────────────────────────────────────────┘                   │
│                     │ allArticles[] (去重)                      │
│  Stage 3: curating                                              │
│  ┌─────────────────────────────────────────┐                   │
│  │ POST /api/ai-curate                     │                   │
│  │   └─> Claude: filter by keywords → top N                    │
│  │       └─> { selected: [{title,url}] }   │                   │
│  └─────────────────────────────────────────┘                   │
│                     │                                           │
│  Stage 4: fetching OG images                                    │
│  ┌─────────────────────────────────────────┐                   │
│  │ selected (parallel)                     │                   │
│  │   └─> GET /api/og-image?url=...         │                   │
│  │       └─> fetch HTML head → og:image    │                   │
│  │           └─> { imageUrl: string|null } │                   │
│  │ 失敗靜默降級，保留 article 但無 imageUrl  │                   │
│  └─────────────────────────────────────────┘                   │
│                     │ withImages[]                              │
│  saveCache() → localStorage                                     │
└─────────────────────────────────────────────────────────────────┘
```

若快取已存在（key：`newspixie-daily-{topicId}-{today}`），整個 pipeline 略過，直接從快取載入。

### 9.2 GitHub Trending Pipeline

由 [useGithubTrending](#62-usegithubtrending) 驅動：

```
┌─────────────────────────────────────────────────────────────────┐
│  useGithubTrending.fetch_()                                     │
│                                                                 │
│  1. GET /api/github-trending?query={topic.githubQuery}          │
│     └─> GitHub Search API (created:>7天前, sort:stars)          │
│         └─> RepoItem[]                                          │
│                                                                 │
│  2. (若有 apiKey) POST /api/ai-repo-describe  [靜默]            │
│     └─> Claude: 擴寫 description                                │
│         └─> { descriptions: [{name, description}] }            │
│                                                                 │
│  3. saveCache() → localStorage                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. 快取策略

所有快取存於 **localStorage**，以日期為 key 的一部分，每日最多抓取一次。

| 快取 | Key 格式 | Prefix 常數 | 保留天數 |
|------|----------|-------------|----------|
| 每日精選 | `newspixie-daily-{topicId}-{YYYY-MM-DD}` | `newspixie-daily` | `MAX_CACHE_DAYS = 1` |
| GitHub Trending | `newspixie-github-{topicId}-{YYYY-MM-DD}` | `newspixie-github` | `MAX_CACHE_DAYS = 1` |

**清理機制**：每次寫入快取後呼叫 `pruneOldCache()` / `pruneLocalStorageCache()`，掃描所有符合 prefix 的 key，比對日期後移除超過 `MAX_CACHE_DAYS` 天的條目。

`MAX_CACHE_DAYS` 定義於 [constants/index.ts](constants/index.ts)。

---

## 11. 設定與環境變數

**`runtimeConfig.public.encryptSecret`**（必填，對應環境變數 `NUXT_PUBLIC_ENCRYPT_SECRET`）：供 [encrypt-storage](plugins/encrypt-storage.ts) 加密 `settingsStore` 持久化內容使用的 AES secret，至少 10 字元。未設定時 plugin 會在 client 端 throw。侷限：因為 secret 會進入前端 bundle，僅能提高 localStorage 被肉眼偷窺的門檻，無法抵擋反編譯 bundle 的攻擊者。

**API Key 解析**（所有 AI 端點）：Anthropic API Key 僅接受來自請求 body 的 `apiKey` 欄位（由前端從 `settingsStore.apiKey` 帶入），未設定時回傳 503 錯誤。

---

## 12. 持久化機制

本專案使用兩種持久化方式：

**Pinia Persistedstate（設定與主題）**

| Store | localStorage key | 持久化欄位 | 加密 |
|-------|-----------------|-----------|------|
| [settingsStore](#52-settingsstore) | `newspixie-settings` | 全部欄位 | ✅ AES（encrypt-storage） |
| [topicsStore](#51-topicsstore) | `newspixie-topics` | `topics`、`activeTopicId` | ❌ 明文 |

由 `@pinia-plugin-persistedstate/nuxt` 自動處理，在 [nuxt.config.ts](nuxt.config.ts) 中設定 `storage: 'localStorage'`。`settingsStore` 額外覆寫 `persist.storage` 指向 [plugins/encrypt-storage.ts](plugins/encrypt-storage.ts) 中建立的 `EncryptStorage`（`stateManagementUse: true`），secret 來自 `runtimeConfig.public.encryptSecret`。

**手動快取（每日內容）**

由各 composable 自行管理（見 [§10](#10-快取策略)）。
