import type { Topic } from '@/types/topic'

// 快取保留天數
export const MAX_CACHE_DAYS = 1

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'ai-ml',
    name: 'AI & 機器學習',
    slug: 'ai-ml',
    keywords: ['AI', 'LLM', 'GPT', 'machine learning', 'neural', 'artificial intelligence', 'Claude', 'ChatGPT', 'Gemini'],
    githubQuery: 'machine-learning',
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
    githubQuery: 'fintech',
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
    githubQuery: 'developer-tools',
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
