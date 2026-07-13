import type { AIProvider } from '~/types/ai'
import { decryptEnvelope } from '~/server/utils/asymmetric'
import { readSession } from '~/server/utils/session'
import { AI_PROVIDERS } from '~/types/ai'

const OPENAI_O_SERIES = /^o\d/

interface ModelsRequestBody {
  provider: AIProvider
  encrypted?: unknown
}

interface ModelOption {
  id: string
  label: string
}

export default defineEventHandler(async (event) => {
  const body = await readJsonBody<ModelsRequestBody>(event)

  const { provider, encrypted } = body

  if (!AI_PROVIDERS.includes(provider)) {
    throw createError({ statusCode: 400, statusMessage: '無效的 provider' })
  }

  // 優先使用 client 加密上傳的新 key；未附帶時退回 session 已儲存的 key，
  // 讓已存 key 的使用者不必重新輸入即可載入模型清單
  let apiKey = encrypted
    ? decryptEnvelope<{ apiKey?: string }>(encrypted).apiKey?.trim()
    : undefined
  if (!apiKey) {
    apiKey = readSession(event)?.keys[provider]?.trim()
  }
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: '尚未設定 API Key' })
  }

  try {
    if (provider === 'anthropic') {
      const res = await $fetch<{ data: { id: string, display_name?: string }[] }>(
        'https://api.anthropic.com/v1/models',
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
        },
      )
      const models: ModelOption[] = res.data
        .filter(m => m.id.startsWith('claude'))
        .map(m => ({ id: m.id, label: m.display_name || m.id }))
      return { models }
    }

    if (provider === 'openai') {
      const res = await $fetch<{ data: { id: string }[] }>(
        'https://api.openai.com/v1/models',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )
      const models: ModelOption[] = res.data
        .filter(m =>
          (m.id.startsWith('gpt') || OPENAI_O_SERIES.test(m.id))
          && !m.id.includes('instruct'),
        )
        .sort((a, b) => b.id.localeCompare(a.id))
        .map(m => ({ id: m.id, label: m.id }))
      return { models }
    }

    // gemini
    const res = await $fetch<{
      models: {
        name: string
        displayName?: string
        supportedGenerationMethods: string[]
      }[]
    }>(
      'https://generativelanguage.googleapis.com/v1beta/models',
      {
        method: 'GET',
        query: { key: apiKey },
      },
    )
    const models: ModelOption[] = res.models
      .filter((m) => {
        const id = m.name.replace('models/', '')
        return (
          m.supportedGenerationMethods.includes('generateContent')
          && id.startsWith('gemini-')
          && !id.includes('embedding')
          && !id.includes('nano')
          && !id.includes('tts')
          && !id.includes('banana')
          && !id.includes('image')
          && !id.includes('robotics')
          && !id.includes('computer-use')
        )
      })
      .map(m => ({
        id: m.name.replace('models/', ''),
        label: m.displayName || m.name.replace('models/', ''),
      }))
    return { models }
  }
  catch (error: unknown) {
    throw toApiError(error, '無法獲取模型清單', 502)
  }
})
