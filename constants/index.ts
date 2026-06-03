import type { Topic } from '@/types/topic'

// 快取保留天數
export const MAX_CACHE_DAYS = 1

// Jina 抓取內容截斷上限（字元數）
export const MAX_CONTENT_LENGTH = 8000

// AI 文章萃取的輸出 token 範圍
export const EXTRACT_MIN_TOKENS = 1024
export const EXTRACT_MAX_TOKENS = 8192
// 輸出 token 估算比例：輸入字元數 ÷ 此值（JSON 輸出約為 Markdown 輸入的一半）
export const EXTRACT_TOKEN_DIVISOR = 2

/** 依內容長度動態估算 AI 萃取所需的 maxTokens */
export function calcExtractMaxTokens(contentLength: number): number {
  return Math.min(EXTRACT_MAX_TOKENS, Math.max(EXTRACT_MIN_TOKENS, Math.ceil(contentLength / EXTRACT_TOKEN_DIVISOR)))
}

// ai-summarize：每篇摘要 1–5 句，保守上限 200 tokens/篇
export const SUMMARIZE_TOKENS_PER_ARTICLE = 200

// ai-repo-describe：每個 Repo 描述 1–3 句，保守上限 150 tokens/個
export const DESCRIBE_TOKENS_PER_REPO = 150

// 共用輸出 token 上下限
export const AI_OUTPUT_MIN_TOKENS = 256
export const AI_OUTPUT_MAX_TOKENS = 8192

/** 依文章篇數動態估算 ai-summarize 所需的 maxTokens */
export function calcSummarizeMaxTokens(count: number): number {
  return Math.min(AI_OUTPUT_MAX_TOKENS, Math.max(AI_OUTPUT_MIN_TOKENS, count * SUMMARIZE_TOKENS_PER_ARTICLE))
}

/** 依 Repo 數量動態估算 ai-repo-describe 所需的 maxTokens */
export function calcDescribeMaxTokens(count: number): number {
  return Math.min(AI_OUTPUT_MAX_TOKENS, Math.max(AI_OUTPUT_MIN_TOKENS, count * DESCRIBE_TOKENS_PER_REPO))
}

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'ai-ml',
    name: 'AI & 機器學習',
    slug: 'ai-ml',
    keywords: ['AI', 'LLM', 'GPT', 'machine learning', 'neural', 'artificial intelligence', 'Claude', 'ChatGPT', 'Gemini'],
    githubKeywords: ['machine-learning'],
    jinaUrls: ['https://huggingface.co/blog'],
    color: 'violet',
    enabled: true,
    createdAt: Date.now(),
  },
  {
    id: 'finance',
    name: '金融 & 投資',
    slug: 'finance',
    keywords: ['finance', 'investing', 'crypto', 'market', 'economy', 'stock', 'bitcoin', 'ETF', '金融', '投資'],
    githubKeywords: ['fintech'],
    jinaUrls: ['https://www.marketwatch.com'],
    color: 'emerald',
    enabled: true,
    createdAt: Date.now(),
  },
  {
    id: 'tech',
    name: '科技新聞',
    slug: 'tech',
    keywords: ['tech', 'technology', 'startup', 'software', 'apple', 'google', 'microsoft', 'meta'],
    githubKeywords: ['developer-tools'],
    jinaUrls: ['https://www.bnext.com.tw'],
    color: 'blue',
    enabled: true,
    createdAt: Date.now(),
  },
]

/** 各來源顯示設定 */
export const SOURCE_CONFIG = {
  github: { label: 'GH', color: 'grey' },
  jina: { label: 'WEB', color: 'np-accent' },
} as const

/** GitHub 語言對應色彩（部分常見語言） */
export const LANGUAGE_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Java': '#b07219',
  'C++': '#f34b7d',
  'C': '#555555',
  'Ruby': '#701516',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
}
