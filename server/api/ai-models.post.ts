import { decryptEnvelope } from '~/server/utils/asymmetric'

const OPENAI_O_SERIES = /^o\d/

type AIProvider = 'anthropic' | 'openai' | 'gemini'

interface ModelsRequestBody {
  provider: AIProvider
  encrypted: unknown
}

interface ModelOption {
  id: string
  label: string
}

export default defineEventHandler(async (event) => {
  let body: ModelsRequestBody
  try {
    body = await readBody<ModelsRequestBody>(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '無效的請求格式' })
  }

  const { provider, encrypted } = body

  const validProviders: AIProvider[] = ['anthropic', 'openai', 'gemini']
  if (!validProviders.includes(provider)) {
    throw createError({ statusCode: 400, statusMessage: '無效的 provider' })
  }

  const { apiKey: rawKey } = decryptEnvelope<{ apiKey?: string }>(encrypted)
  const apiKey = rawKey?.trim()
  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: '缺少 API Key' })
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
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    const msg = error instanceof Error ? error.message : '無法獲取模型清單'
    throw createError({ statusCode: 502, statusMessage: msg })
  }
})
