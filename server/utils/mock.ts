import type { RepoItem } from '@/types/content'
import { LANGUAGE_COLORS } from '@/constants'

/**
 * Mock 模式（測試資料機制）
 *
 * 設定 NUXT_PUBLIC_MOCK_MODE=1 啟用；嚴格比對 '1'，設 0、留空、不設均為關閉。
 * 啟用時各端點於 resolveAICredentials() 之前直接回傳靜態 fixture，
 * 不需 session、不連外部網路。詳見 docs/superpowers/specs/2026-07-07-mock-mode-design.md。
 */
export function isMockMode(): boolean {
  // Nitro 以 destr 解析 env 覆寫值，NUXT_PUBLIC_MOCK_MODE=1 會變成 number 1，故先轉字串再比對
  return String(useRuntimeConfig().public.mockMode) === '1'
}

/** jina-fetch 固定回應（內容不會被實際使用，僅讓 pipeline 流動） */
export const MOCK_JINA_CONTENT = `# Mock News Site

- [Mock 文章一](https://example.com/article-1)
- [Mock 文章二](https://example.com/article-2)

（mock 模式固定內容，實際文章清單由 ai-extract-articles 的 mock 分支提供）`

/** ai-extract-articles 固定回應：16 篇繁中科技／AI／財經標題，URL 為真實網站形狀 */
export const MOCK_ARTICLES: { title: string, url: string }[] = [
  { title: 'OpenAI 發表新一代推理模型，數學能力大幅躍進', url: 'https://openai.com/blog/mock-next-gen-reasoning' },
  { title: 'Anthropic 公布 Claude 最新安全性研究成果', url: 'https://www.anthropic.com/news/mock-safety-research' },
  { title: 'Google DeepMind 以 AI 加速新材料發現', url: 'https://deepmind.google/blog/mock-materials-discovery' },
  { title: 'Meta 開源多模態模型，挑戰閉源巨頭', url: 'https://ai.meta.com/blog/mock-multimodal-release' },
  { title: 'NVIDIA 新一代 GPU 架構鎖定推理成本', url: 'https://blogs.nvidia.com/blog/mock-inference-gpu' },
  { title: '台積電先進製程產能滿載，AI 晶片需求續強', url: 'https://www.bnext.com.tw/article/mock-tsmc-capacity' },
  { title: '蘋果傳將在下一代系統深度整合生成式 AI', url: 'https://www.theverge.com/mock-apple-genai' },
  { title: '微軟 Azure 推出企業級 AI Agent 平台', url: 'https://techcrunch.com/mock-azure-agents' },
  { title: '新創以 RAG 技術重塑企業知識管理', url: 'https://www.ithome.com.tw/news/mock-rag-startup' },
  { title: '開源社群熱議：小模型在邊緣裝置的逆襲', url: 'https://huggingface.co/blog/mock-edge-models' },
  { title: '美股 AI 概念股財報亮眼，帶動科技板塊上攻', url: 'https://www.cnbc.com/mock-ai-earnings' },
  { title: '聯準會利率決策前瞻：市場押注下半年降息', url: 'https://www.bloomberg.com/news/mock-fed-outlook' },
  { title: '比特幣 ETF 資金流入創新高，機構加碼布局', url: 'https://www.coindesk.com/mock-btc-etf-inflows' },
  { title: '台股 AI 供應鏈成長動能分析', url: 'https://www.marketwatch.com/story/mock-taiwan-supply-chain' },
  { title: '雲端資安支出攀升，零信任架構成主流', url: 'https://www.wsj.com/articles/mock-zero-trust' },
  { title: '量子運算商用化進程：從實驗室走向資料中心', url: 'https://arstechnica.com/mock-quantum-commercial' },
]

/** github-trending 固定回應：10 筆（真實知名 repo 的樣子；id 靜態以維持確定性） */
export const MOCK_REPOS: RepoItem[] = [
  { id: 'mock-repo-01', name: 'agentic-ai/deep-researcher', url: 'https://github.com/agentic-ai/deep-researcher', description: 'Autonomous research agent with multi-step planning, tool use and citation tracking.', language: 'Python', languageColor: LANGUAGE_COLORS.Python, stars: 4820, forks: 361, source: 'github' },
  { id: 'mock-repo-02', name: 'fastui/fastui', url: 'https://github.com/fastui/fastui', description: 'Build declarative web UIs in pure TypeScript with zero build step.', language: 'TypeScript', languageColor: LANGUAGE_COLORS.TypeScript, stars: 3975, forks: 214, source: 'github' },
  { id: 'mock-repo-03', name: 'rustify/blazedb', url: 'https://github.com/rustify/blazedb', description: 'Embedded vector database written in Rust, optimized for on-device RAG.', language: 'Rust', languageColor: LANGUAGE_COLORS.Rust, stars: 3512, forks: 178, source: 'github' },
  { id: 'mock-repo-04', name: 'cloudnative/kubelens', url: 'https://github.com/cloudnative/kubelens', description: 'A lightweight terminal UI for inspecting Kubernetes clusters in real time.', language: 'Go', languageColor: LANGUAGE_COLORS.Go, stars: 2984, forks: 143, source: 'github' },
  { id: 'mock-repo-05', name: 'llm-tools/promptbench', url: 'https://github.com/llm-tools/promptbench', description: 'Benchmark and regression-test your LLM prompts across providers.', language: 'Python', languageColor: LANGUAGE_COLORS.Python, stars: 2461, forks: 129, source: 'github' },
  { id: 'mock-repo-06', name: 'webperf/quicksnap', url: 'https://github.com/webperf/quicksnap', description: 'Instant visual regression testing for modern frontend frameworks.', language: 'TypeScript', languageColor: LANGUAGE_COLORS.TypeScript, stars: 1937, forks: 96, source: 'github' },
  { id: 'mock-repo-07', name: 'edge-ml/tinyinfer', url: 'https://github.com/edge-ml/tinyinfer', description: 'Run quantized transformer models on microcontrollers and edge devices.', language: 'C++', languageColor: LANGUAGE_COLORS['C++'], stars: 1608, forks: 88, source: 'github' },
  { id: 'mock-repo-08', name: 'fin-lab/quantflow', url: 'https://github.com/fin-lab/quantflow', description: 'Open-source quantitative trading research framework with backtesting engine.', language: 'Python', languageColor: LANGUAGE_COLORS.Python, stars: 1355, forks: 102, source: 'github' },
  { id: 'mock-repo-09', name: 'devxp/shellpilot', url: 'https://github.com/devxp/shellpilot', description: 'AI-powered shell that explains, suggests and audits your commands.', language: 'Rust', languageColor: LANGUAGE_COLORS.Rust, stars: 1124, forks: 57, source: 'github' },
  { id: 'mock-repo-10', name: 'opensecurity/zerotrust-kit', url: 'https://github.com/opensecurity/zerotrust-kit', description: 'Batteries-included zero-trust networking toolkit for self-hosted services.', language: 'Go', languageColor: LANGUAGE_COLORS.Go, stars: 987, forks: 64, source: 'github' },
]

const MOCK_OG_COUNT = 4

/** og-image mock：依 URL 內容 hash 確定性輪替 /public/mock-og/ 下的 4 張佔位圖 */
export function mockOgImagePath(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++)
    hash = (hash * 31 + url.charCodeAt(i)) | 0
  return `/mock-og/${(Math.abs(hash) % MOCK_OG_COUNT) + 1}.svg`
}
