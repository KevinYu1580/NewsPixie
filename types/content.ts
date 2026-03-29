export type ContentSource = 'github' | 'jina';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: ContentSource;
  author?: string;
  publishedAt: string;
  domain?: string;
  score?: number;
  commentCount?: number;
  commentUrl?: string;
}

export interface RepoItem {
  id: string;
  /** owner/repo 格式 */
  name: string;
  url: string;
  description: string;
  language?: string;
  languageColor?: string;
  stars: number;
  starsToday?: number;
  forks: number;
  source: 'github';
}
