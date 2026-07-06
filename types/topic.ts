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
  violet: { vuetifyColor: 'deep-purple-lighten-2', hex: '#9575CD' },
  indigo: { vuetifyColor: 'indigo-lighten-2', hex: '#7986CB' },
  blue: { vuetifyColor: 'blue-lighten-2', hex: '#64B5F6' },
  cyan: { vuetifyColor: 'cyan-lighten-2', hex: '#4DD0E1' },
  emerald: { vuetifyColor: 'teal-lighten-2', hex: '#4DB6AC' },
  orange: { vuetifyColor: 'orange-lighten-2', hex: '#FFB74D' },
  rose: { vuetifyColor: 'pink-lighten-2', hex: '#F48FB1' },
  red: { vuetifyColor: 'red-lighten-2', hex: '#EF9A9A' },
}
