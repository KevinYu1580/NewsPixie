type AIProvider = 'anthropic' | 'openai' | 'gemini'

interface ChatParams {
  model: string
  maxTokens: number
  messages: { role: 'user' | 'assistant', content: string }[]
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-haiku-4-5-20251001',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-3-flash-preview',
}

export function createAIClient(
  clientKey: string | undefined,
  clientModel: string | undefined,
  clientProvider: string | undefined,
): { chat: (params: ChatParams) => Promise<string>, model: string } {
  const resolvedKey = clientKey?.trim()
  if (!resolvedKey) {
    throw createError({
      statusCode: 503,
      statusMessage: '未設定 API Key，請至右上角設定輸入 API Key',
    })
  }

  const provider: AIProvider = (['anthropic', 'openai', 'gemini'] as const).includes(clientProvider as AIProvider)
    ? (clientProvider as AIProvider)
    : 'anthropic'

  const model = clientModel?.trim() || DEFAULT_MODELS[provider]

  async function chat({ model: m, maxTokens, messages }: ChatParams): Promise<string> {
    if (provider === 'anthropic') {
      const res = await $fetch<{ content: { type: string, text: string }[] }>(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'x-api-key': resolvedKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: {
            model: m,
            max_tokens: maxTokens,
            messages,
          },
        },
      )
      const block = res.content.find(b => b.type === 'text')
      return block?.text.trim() ?? ''
    }

    if (provider === 'openai') {
      const res = await $fetch<{ choices: { message: { content: string } }[] }>(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resolvedKey}`,
            'content-type': 'application/json',
          },
          body: {
            model: m,
            max_tokens: maxTokens,
            messages,
          },
        },
      )
      return res.choices[0]?.message?.content?.trim() ?? ''
    }

    // gemini
    const userContent = [...messages].reverse().find(msg => msg.role === 'user')?.content ?? ''
    const res = await $fetch<{ candidates: { content: { parts: { text: string }[] } }[] }>(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
      {
        method: 'POST',
        query: { key: resolvedKey },
        headers: { 'content-type': 'application/json' },
        body: {
          contents: [{ parts: [{ text: userContent }] }],
          generationConfig: { maxOutputTokens: maxTokens },
        },
      },
    )
    return res.candidates[0]?.content?.parts[0]?.text?.trim() ?? ''
  }

  return { chat, model }
}
