# NewsPixie — 架構說明文件 (arc24)

> 版本：0.3.0 | 日期：2026-04-29

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
   - 7.11 [Session 端點](#711-session-端點)
15. [安全模型](#15-安全模型)
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
13. [多語系（i18n）](#13-多語系i18n)
14. [E2E 測試](#14-e2e-測試)

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
| 國際化 | @nuxtjs/i18n v9（strategy: no_prefix，支援 zh-TW / en） |

---

## 3. 目錄結構

```
NewsPixie/
├── app.vue                  # 根元件（主題色注入）
├── pages/
│   └── index.vue            # 唯一頁面，組合 Sidebar + Header + Feed
├── i18n/
│   └── locales/
│       ├── zh-TW.json   # 繁體中文語系檔
│       └── en.json      # 英文語系檔
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
  id: string               // 唯一識別，由 generateId() 產生
  name: string             // 顯示名稱，e.g. 'AI & 機器學習'
  slug: string             // URL-friendly 識別，e.g. 'ai-ml'
  keywords: string[]       // 每日精選 AI 過濾關鍵字（傳給 ai-curate）
  githubKeywords: string[] // GitHub Search chips（implicit AND；含空白自動加引號；可輸入 qualifier 如 language:python）
  jinaUrls: string[]       // 透過 Jina Reader 抓取的網站 URL 列表
  color: TopicColor        // UI 色彩標記（見下方 TOPIC_COLORS）
  enabled: boolean         // 是否啟用
  createdAt: number        // Unix timestamp
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

API Key 不再存於 client；改由 server 加密 cookie 持有（見 [§15](#15-安全模型)）。Store 僅保留非機密設定與 server 帶回的非機密 meta。

| State | 型別 | 預設值 | 說明 |
|-------|------|--------|------|
| `provider` | `AIProvider` | `'anthropic'` | 目前選用的 AI Provider（client 端切換不需重新提交 key） |
| `themeName` | `'dark' \| 'light'` | `'dark'` | UI 主題 |
| `mobileDrawerOpen` | `boolean` | `false` | 手機側邊欄狀態 |
| `fetchTime` | `string` | `'07:00'` | 每日自動觸發時間（HH:MM） |
| `articleCount` | `number` | `5` | 每主題精選篇數（3–10） |
| `repoCount` | `number` | `8` | 每主題 Repo 數（4–10） |
| `sessionMeta` | `SessionMeta \| null` | `null` | 從 `np_session_meta` cookie 還原的非機密 meta（hasKey/providers/masked/models/currentProvider） |
| `legacyKeyDetected` | `boolean` | `false` | 一次性遷移後若偵測到舊版明文 key 即為 true，UI 顯示 snackbar 提示重設 |

| Computed | 說明 |
|----------|------|
| `hasApiKey` | `!!sessionMeta?.hasKey`，UI gate 全部依此 |
| `currentModel` | `sessionMeta.models[provider]`，給 AI 端點請求帶入 |
| `maskedCurrentKey` | `sessionMeta.masked[provider]`，UI 顯示 `••••XXXX` 用 |

| Action | 說明 |
|--------|------|
| `loadSessionMeta()` | 解析 `np_session_meta` cookie 並寫入 `sessionMeta` |
| `applyMeta(meta)` | save 端點回傳後直接套用、避免再讀 cookie |
| `clearSession()` | 呼叫 `POST /api/session/clear` 並清空 `sessionMeta` |
| `detectAndClearLegacyKeys()` | 一次性遷移：若舊版加密 localStorage 仍有明文 key 欄位則清除並設旗標 |
| `dismissLegacyKeyHint()` | 關閉舊版提示 snackbar |

持久化：`localStorage` key `newspixie-settings`，僅明文保存上表前 6 個欄位（`pick: ['provider', 'themeName', 'mobileDrawerOpen', 'fetchTime', 'articleCount', 'repoCount']`），不含任何機密。`encrypt-storage` plugin 仍註冊以供一次性遷移讀取舊資料，遷移完成（`newspixie-key-migration-v2=1` flag）後其實已無 active 用途。

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

共用 AI client 工廠位於 [server/utils/ai-client.ts](server/utils/ai-client.ts)，純 REST 呼叫（無 SDK），支援三個 provider。**API key 不再來自 client 請求 body**，改由 [resolveAICredentials()](server/utils/session.ts) 從 server-side `np_session` HttpOnly cookie 解出（見 [§15](#15-安全模型)）。

AI 業務端點（`ai-extract-articles`、`ai-curate`、`ai-summarize`、`ai-briefing`、`ai-repo-describe`）request body 僅含 `model`、`provider`（均 optional；不帶時取 session 的 `currentProvider` 與該 provider 的 model）。`apiKey` 欄位**完全不接受**。

模型由使用者透過 `POST /api/ai-models` 動態獲取（該端點需透過 RSA+AES 端對端加密上送 apiKey、見 §7.5 與 §15）。

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
{
  "provider": "anthropic | openai | gemini",
  "encrypted": { "wrappedKey": "<base64>", "iv": "<base64>", "ciphertext": "<base64>" }
}
```

`encrypted` 為 client 用 server RSA 公鑰（[GET /api/session/pubkey](#711-session-端點)）+ 隨機 AES-256-GCM 加密的 `{ apiKey }` 物件。Server 解密取出 `apiKey` 後查詢各 provider 官方 API：

```json
{ "models": [{ "id": "...", "label": "..." }] }
```

各 provider 查詢端點：
- **Gemini**：`GET /v1beta/models?key=...`，filter `supportedGenerationMethods.includes('generateContent')`
- **Anthropic**：`GET /v1/models`，filter `id.startsWith('claude')`
- **OpenAI**：`GET /v1/models`，filter `id.startsWith('gpt') || /^o[0-9]/`

不寫 cookie；cookie 寫入由 [POST /api/session/save](#711-session-端點) 統一處理。

### 7.6 POST /api/ai-extract-articles

```json
{ "content": "<jina markdown string>", "model": "...", "provider": "..." }
```

`apiKey` 由 server 從 `np_session` cookie 解出。使用 AI 從 Jina Markdown 中萃取文章標題與 URL：

```json
{ "articles": [{ "title": "...", "url": "..." }] }
```

供 [useDailyBriefing](#61-usedailybriefing) Step 2 使用。

### 7.6b POST /api/ai-curate

```json
{
  "topicName": "...",
  "keywords": ["..."],
  "articles": [{ "title": "...", "url": "..." }],
  "count": 5,
  "model": "...",
  "provider": "..."
}
```

使用 AI 從候選文章中依主題關鍵字精選 Top N 篇，AI 回傳文章索引陣列（如 `[1, 3, 7]`），端點再映射回完整文章物件：

```json
{ "selected": [{ "title": "...", "url": "..." }] }
```

供 [useDailyBriefing](#61-usedailybriefing) Step 3 使用。

### 7.7 POST /api/ai-summarize

```json
{
  "topicName": "...",
  "articles": [{ "title": "...", "url": "...", "content": "..." }],
  "model": "...",
  "provider": "..."
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
{ "topicName": "...", "headlines": ["...", "..."], "model": "...", "provider": "..." }
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
  "model": "...",
  "provider": "..."
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

### 7.11 Session 端點

#### GET /api/session/pubkey

回傳 server RSA 公鑰（PEM），供 client 加密上送 payload 使用。Client 端可 cache（記憶體）以避免每次重抓。

```json
{ "pubkey": "-----BEGIN PUBLIC KEY-----\n..." }
```

#### POST /api/session/save

```json
{ "wrappedKey": "<base64>", "iv": "<base64>", "ciphertext": "<base64>" }
```

`ciphertext` 解密後為：

```ts
{
  provider: 'anthropic' | 'openai' | 'gemini',
  anthropicKey?: string, openaiKey?: string, geminiKey?: string,
  anthropicModel?: string, openaiModel?: string, geminiModel?: string,
}
```

Server 收到後：(1) RSA-OAEP-SHA256 解 wrappedKey 取得 AES key (2) AES-256-GCM 解 ciphertext 取得 payload (3) 以 `NUXT_SESSION_SECRET` derive 出的對稱 key 重新加密為 session payload (4) 寫入 `np_session`（HttpOnly）+ `np_session_meta`（非 HttpOnly，僅含 `hasKey`/`providers`/`masked`/`models`/`currentProvider`）兩個 cookie。

Response：

```json
{ "ok": true, "meta": { "hasKey": true, "providers": ["anthropic"], "masked": {"anthropic": "••••AB12"}, "models": {...}, "currentProvider": "anthropic" } }
```

至少需有一組非空 key，否則 400。

#### POST /api/session/clear

無 body。清除 `np_session` 與 `np_session_meta` 兩個 cookie。

```json
{ "ok": true }
```

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

**AppHeader** — 含品牌名稱、日期播報標籤、語系切換器（`v-btn-toggle`：繁中 / EN，透過 `useI18n().setLocale` 切換）、`SettingsModal` 入口、深/淺色切換。aria-label 文字透過 `useI18n().t()` 對應 `header.*` key。

**AppSidebar** — 主題清單（`TopicItem` × N）、新增按鈕、管理按鈕；透過 emit 將 CRUD 操作傳至 `pages/index.vue` → `topicsStore`。文字（標題、aria-label、按鈕內文）透過 `useI18n().t()` 對應 `sidebar.*` key。注意 `@add` event handler 參數命名為 `topic` 以避免與 i18n 的 `t` 衝突。

**SettingsModal** — 以 `v-tabs` 分兩頁：**AI 設定**（Provider 切換、API Key、AI 摘要模型）與**每日精選**（自動觸發時間、精選篇數、Repo 數）；開窗時固定回到 AI 設定頁（`tab` ref）。採本地 state 暫存，點「儲存」後統一 commit 至 [settingsStore](#52-settingsstore)。API Key 為選填，不填亦可儲存（僅影響 BriefingFeed 是否顯示內容）。「AI 摘要模型」區塊在本次未輸入新 key 時，若已有儲存的 key 則顯示目前已儲存的模型（label 由 `PROVIDER_CONFIGS` 對照 model id，找不到則顯示 raw id），否則提示先輸入 key；輸入新 key 後才以動態清單呈現可選卡片。

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

**TopicForm** — 新增與編輯共用，接收可選 `initial` prop（有則為編輯模式）。版面採 v-tabs 分頁：頂部固定共通欄位（`name`、`color`），下方兩個 Tab：「每日精選」（`jinaUrls` + `keywords`）與「GitHub Trending」（`githubKeywords` chip 輸入，可輸入純關鍵字或 GitHub qualifier 如 `language:python`、`stars:>100`），對應兩條互相獨立的 pipeline。

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
│  0. composeQuery(githubQuery, githubKeywords)                   │
│     └─> implicit AND 拼接（含空白關鍵字自動加引號）              │
│                                                                 │
│  1. GET /api/github-trending?query={composed}                   │
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

`buildGithubQuery()` 範例：
- `githubKeywords: ['LLM', 'AI agent', 'language:python']`
- 最終送 GitHub：`LLM "AI agent" language:python created:>{7天前}`
- `githubKeywords` 為空 → 送空字串（GitHub 回傳全域 trending，無針對性）

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

| 變數 | 範圍 | 必填 | 說明 |
|------|------|------|------|
| `NUXT_PUBLIC_ENCRYPT_SECRET` | client+server（public） | 否 | 舊版 encrypt-storage 用，現只供一次性遷移讀取舊 localStorage；新部署可不設。≥10 字元。 |
| `NUXT_SESSION_SECRET` | server-only | ✅ | session cookie AES-256-GCM 加密 secret，scrypt derive 為 32-byte key。建議 64 hex 字元（`openssl rand -hex 32`）。 |
| `NUXT_RSA_PRIVATE_KEY` | server-only | ✅ | RSA-2048 私鑰（PEM PKCS#8），用於解密 client 上送的 hybrid payload。 |
| `NUXT_RSA_PUBLIC_KEY` | server-only | ✅ | RSA-2048 公鑰（PEM SPKI），透過 `GET /api/session/pubkey` 回傳給 client。 |

產生 RSA keypair：

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out rsa-priv.pem
openssl rsa -in rsa-priv.pem -pubout -out rsa-pub.pem
```

PEM 多行字串於 `.env` 檔以雙引號包裹即可（dotenv 支援）。私鑰**絕不入 git**（`.gitignore` 已涵蓋 `.env*` 與 `*.pem`）。

**API Key 解析**：所有 AI 業務端點（`ai-extract-articles`、`ai-curate`、`ai-summarize`、`ai-briefing`、`ai-repo-describe`）透過 [resolveAICredentials()](server/utils/session.ts) 從 `np_session` cookie 解出 `apiKey`，未設定時回 401。`/api/ai-models` 例外：因使用者尚未儲存 key 前需驗證，採 RSA+AES hybrid 加密 body 上送。

---

## 12. 持久化機制

本專案使用三種持久化方式：

**1. Server-side Session Cookie（API Key）**

| Cookie | HttpOnly | 內容 | 用途 |
|--------|----------|------|------|
| `np_session` | ✅ | AES-256-GCM 加密的完整 SessionPayload（三組 keys + models + currentProvider） | AI 端點認證、client JS 不可讀 |
| `np_session_meta` | ❌ | URL-encoded JSON，僅含 `hasKey`/`providers`/`masked`/`models`/`currentProvider` 等非機密欄位 | UI gate、顯示 masked key |

兩個 cookie 屬性：`Secure`（prod）、`SameSite=Strict`、`Path=/`、`Max-Age=2592000`（30 天）。詳見 [§15](#15-安全模型)。

**2. Pinia Persistedstate（非機密設定與主題）**

| Store | localStorage key | 持久化欄位 | 加密 |
|-------|-----------------|-----------|------|
| [settingsStore](#52-settingsstore) | `newspixie-settings` | `provider`、`themeName`、`mobileDrawerOpen`、`fetchTime`、`articleCount`、`repoCount`（透過 `pick`） | ❌ 明文（已不含機密） |
| [topicsStore](#51-topicsstore) | `newspixie-topics` | `topics`、`activeTopicId` | ❌ 明文 |

由 `@pinia-plugin-persistedstate/nuxt` 自動處理。`encrypt-storage` plugin 仍存在以供一次性舊資料遷移（讀取舊版加密 blob、清除明文 key 欄位、設旗標提示使用者重新輸入），完成後 flag `newspixie-key-migration-v2=1` 阻止重跑。

**3. 手動快取（每日內容）**

由各 composable 自行管理（見 [§10](#10-快取策略)）。

---

## 13. 多語系（i18n）

使用 **@nuxtjs/i18n v9**（vue-i18n v10）。

| 項目 | 設定 |
|------|------|
| 策略 | `no_prefix`（CSR SPA，無 URL prefix） |
| 預設語系 | `zh-TW` |
| 支援語系 | `zh-TW`（繁體中文）、`en`（英文） |
| 語系持久化 | Cookie `np_locale` |
| 語系切換器 | AppHeader 右上角 `v-btn-toggle` |

語系檔案位於 [i18n/locales/](i18n/locales/)，採 lazy 載入。`langDir: 'locales/'` 在 @nuxtjs/i18n v9 中解析為相對 `<rootDir>/i18n/` 的路徑，實際路徑為 `i18n/locales/`。只翻譯靜態 UI 文字，API 回傳的動態資料（新聞標題、Repo 描述等）維持原文不翻。

`useI18n()` 由 @nuxtjs/i18n 自動注入至所有 Vue 元件及 Nuxt composables，無需手動 import。

已套用 i18n 的內容層元件與 composable：[BriefingFeed](components/content/BriefingFeed.vue)、[Section](components/content/Section.vue)、[news/Briefing](components/content/news/Briefing.vue)、[github/Trending](components/content/github/Trending.vue)、[useDailyBriefing](composables/useDailyBriefing.ts)。Key namespace：`briefingFeed.*`、`section.*`、`briefing.*`、`trending.*`、`stage.*`、`error.*`，動態插值範例 `briefing.autoFetchNote = "精選內容將於每日 {time} 自動抓取"`。

---

## 14. E2E 測試

使用 **Playwright**（`@playwright/test`）對 i18n 功能進行 E2E 驗證。

| 項目 | 詳情 |
|------|------|
| 設定檔 | [playwright.config.ts](playwright.config.ts) |
| 測試目錄 | [e2e/](e2e/) |
| 執行指令 | `npx playwright test` |
| WebServer | `pnpm dev`（port 3000，`reuseExistingServer: true`） |

### 測試範疇（[e2e/i18n.spec.ts](e2e/i18n.spec.ts)）

- **zh-TW 預設語系**：頁面標題、v-btn-toggle 選取狀態、noTopicHint 文字、側邊欄標籤、設定彈窗標題
- **切換至 EN**：noTopicHint 切換、頁面標題切換、側邊欄新增按鈕、設定彈窗標題
- **Cookie 持久化**：切換 EN 後重新整理仍保持英文；切回 zh-TW 後重新整理仍保持繁中

### 測試注意事項

- 每個測試以 `np_locale` cookie 明確設定語系，不依賴 Playwright Chromium 的 en-US 預設瀏覽器語系（避免 `detectBrowserLanguage` 干擾）
- `topicsStore` 初始值為 `DEFAULT_TOPICS`；測試前注入空主題 `newspixie-topics: { topics: [], activeTopicId: null }` 至 localStorage，讓 noTopicHint 顯示
- 使用 `{ exact: true }` 避免 Playwright 的寬鬆 accessible name 比對誤中其他元素

---

## 15. 安全模型

NewsPixie 採「BYO API Key」模型，使用者自帶各 provider 的 key。本架構目標是讓 key **無論在 client 端記憶體、localStorage、傳輸過程、DevTools Network panel 任何環節都不以明文出現超過必要時間**。

### 兩層防護

**Layer 1：Server-side Session Cookie**
- 使用者送出 key 後立刻由 server 接管：以 `NUXT_SESSION_SECRET` derive 的 32-byte key 透過 AES-256-GCM 加密整個 SessionPayload，寫入 `np_session` HttpOnly cookie
- Client JS 無法讀取 `np_session`（HttpOnly）；任何 AI 業務 req body **完全不含 apiKey 欄位**
- AI 端點透過 [resolveAICredentials()](server/utils/session.ts) 從 cookie 解出 key 後呼叫各 provider 官方 API

**Layer 2：Application-layer Hybrid Encryption（RSA-OAEP + AES-256-GCM）**

「使用者按儲存」與「驗證 key 並列模型」這兩個必要要把 key 從 client 上送的時機，避免明文暴露於 DevTools Network。

- Server 啟動時從 env 載入 RSA-2048 keypair，公鑰透過 `GET /api/session/pubkey` 提供
- Client（[utils/crypto-payload.ts](utils/crypto-payload.ts)）：
  1. WebCrypto `subtle.generateKey` 隨機產生 AES-256-GCM key
  2. `subtle.encrypt({name:'AES-GCM', iv})` 加密 payload
  3. `subtle.exportKey('raw')` 取出 AES key 原始位元
  4. RSA-OAEP-SHA256 用 server 公鑰 wrap AES key
  5. POST `{ wrappedKey, iv, ciphertext }` 三段 base64
- Server（[server/utils/asymmetric.ts](server/utils/asymmetric.ts) `decryptEnvelope()`）：
  1. `crypto.privateDecrypt(RSA-OAEP-SHA256)` 解 wrappedKey 取 AES key
  2. `createDecipheriv('aes-256-gcm')` + `setAuthTag` 解 ciphertext
  3. 拿到明文 payload 後立即用於後續流程，不持久化

DevTools Network panel 中所見：
| 端點 | Body 內容 |
|------|----------|
| `GET /api/session/pubkey` | 無 |
| `POST /api/session/save` | `{wrappedKey, iv, ciphertext}` 全密文 |
| `POST /api/ai-models` | `{provider, encrypted: {...}}` 全密文 |
| `POST /api/ai-extract-articles` 等 5 端點 | `{content, model, provider}`（無 apiKey） |

### Threat Model

**已擋下**：
- DevTools Network 視覺暴露（螢幕分享、肩窺、錄影）
- 只能讀 Network request 的瀏覽器擴充套件
- 翻 localStorage / Cookies 看到明文 key
- TLS 中間人（依賴 HTTPS）

**不在範圍**：
- 能注入 JS 進頁面的攻擊者（XSS、惡意瀏覽器擴充套件 content script）— 可在 DOM 加密前 hook input value。屬另一層威脅，需 CSP / 套件審查 / 套件 supply chain 防護
- 取得 server `NUXT_RSA_PRIVATE_KEY` + 流量錄影者 — 可解密。私鑰需妥善存放（部署平台 secrets、不入 git）
- 能執行 server-side code 的攻擊者 — 完整存取所有資料

### Key Rotation

- `NUXT_SESSION_SECRET` 變更：所有現有 cookie 失效，使用者需重新輸入 key（`np_session` 解密失敗 → 視為無 session → 401 → UI 提示重設）
- `NUXT_RSA_PRIVATE_KEY` / `NUXT_RSA_PUBLIC_KEY` 變更：client cache 的舊 pubkey 會在下次儲存時導致 server 解密失敗回 400；建議搭配重啟即可，client `sessionStorage` 因為使用記憶體 cache（非 sessionStorage）所以重整即重抓
