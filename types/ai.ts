export type AIProvider = 'anthropic' | 'openai' | 'gemini'

export type AIModel = string

export interface ProviderModelOption {
  value: string
  label: string
  note?: string
}

export interface ProviderConfig {
  label: string
  keyPlaceholder: string
  defaultModel: AIModel
  models: ProviderModelOption[]
}

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  anthropic: {
    label: 'Anthropic Claude',
    keyPlaceholder: 'sk-ant-...',
    defaultModel: 'claude-haiku-4-5-20251001',
    models: [
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', note: '速度快、成本低（推薦）' },
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', note: '品質更高、速度適中' },
      { value: 'claude-opus-4-6', label: 'Claude Opus 4.6', note: '最高品質、成本較高' },
    ],
  },
  openai: {
    label: 'OpenAI',
    keyPlaceholder: 'sk-...',
    defaultModel: 'gpt-4o-mini',
    models: [
      { value: 'gpt-4o-mini', label: 'GPT-4o mini', note: '速度快、成本低（推薦）' },
      { value: 'gpt-4o', label: 'GPT-4o', note: '品質更高、速度適中' },
      { value: 'gpt-4.1', label: 'GPT-4.1', note: '最新旗艦模型' },
    ],
  },
  gemini: {
    label: 'Google Gemini',
    keyPlaceholder: 'AIza...',
    defaultModel: 'gemini-3-flash-preview',
    models: [],
  },
}
