export interface Topic {
  id: string;
  name: string;
  slug: string;
  /** AI 精選過濾關鍵字 */
  keywords: string[];
  /** GitHub Search API 查詢字串 */
  githubQuery: string;
  /** 透過 Jina 抓取的任意網站 URL 列表 */
  jinaUrls: string[];
  /** 色彩名稱，e.g. 'violet' | 'emerald' | 'blue' */
  color: TopicColor;
  enabled: boolean;
  createdAt: number;
}

export type TopicColor = 'violet' | 'emerald' | 'blue' | 'orange' | 'rose' | 'cyan';

export const TOPIC_COLORS: Record<TopicColor, { vuetifyColor: string; hex: string }> = {
  violet: { vuetifyColor: 'deep-purple-lighten-2', hex: '#9575CD' },
  emerald: { vuetifyColor: 'teal-lighten-2', hex: '#4DB6AC' },
  blue: { vuetifyColor: 'blue-lighten-2', hex: '#64B5F6' },
  orange: { vuetifyColor: 'orange-lighten-2', hex: '#FFB74D' },
  rose: { vuetifyColor: 'pink-lighten-2', hex: '#F48FB1' },
  cyan: { vuetifyColor: 'cyan-lighten-2', hex: '#4DD0E1' },
};
