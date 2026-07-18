export interface Topic {
  id: string
  name: string
  slug: string
  /** AI 精選過濾關鍵字（每日精選 pipeline 用，傳給 ai-curate） */
  keywords: string[]
  /** GitHub Search 關鍵字 + qualifier chips（implicit AND；含空白自動加引號） */
  githubKeywords: string[]
  /** 透過 Jina 抓取的任意網站 URL 列表 */
  jinaUrls: string[]
  /** 色彩名稱，e.g. 'violet' | 'emerald' | 'blue' */
  color: TopicColor
  enabled: boolean
  createdAt: number
}

export type TopicColor = 'violet' | 'indigo' | 'blue' | 'cyan' | 'emerald' | 'orange' | 'rose' | 'red'

export const TOPIC_COLORS: Record<TopicColor, { vuetifyColor: string, hex: string }> = {
  violet: { vuetifyColor: 'deep-purple-lighten-2', hex: '#8B8FE8' },
  indigo: { vuetifyColor: 'indigo-lighten-2', hex: '#7A8CE0' },
  blue: { vuetifyColor: 'blue-lighten-2', hex: '#6FA8E8' },
  cyan: { vuetifyColor: 'cyan-lighten-2', hex: '#5FC2D6' },
  emerald: { vuetifyColor: 'teal-lighten-2', hex: '#55C0A8' },
  orange: { vuetifyColor: 'orange-lighten-2', hex: '#E8A552' },
  rose: { vuetifyColor: 'pink-lighten-2', hex: '#E88BA8' },
  red: { vuetifyColor: 'red-lighten-2', hex: '#E57882' },
}
