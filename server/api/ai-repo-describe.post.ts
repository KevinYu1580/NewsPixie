import Anthropic from '@anthropic-ai/sdk'

interface RepoInput {
  name: string
  description: string
  language?: string
  stars: number
}

interface DescribeRequest {
  topicName: string
  repos: RepoInput[]
  apiKey?: string
  model?: string
}

const ALLOWED_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
]

export default defineEventHandler(async (event) => {
  let body: DescribeRequest
  try {
    body = await readBody<DescribeRequest>(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '無效的請求格式' })
  }

  const { topicName, repos, apiKey: clientKey, model: clientModel } = body

  if (!repos || repos.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 repos' })
  }

  const config = useRuntimeConfig()
  const resolvedKey = clientKey?.trim() || config.anthropicApiKey

  if (!resolvedKey) {
    throw createError({
      statusCode: 503,
      statusMessage: '未設定 ANTHROPIC_API_KEY，請至右上角設定輸入 API Key',
    })
  }

  const model = clientModel && ALLOWED_MODELS.includes(clientModel)
    ? clientModel
    : 'claude-haiku-4-5-20251001'

  const client = new Anthropic({ apiKey: resolvedKey })

  const reposText = repos.map((r, i) => {
    const lang = r.language ? `語言：${r.language}，` : ''
    return `${i + 1}. ${r.name}（${lang}⭐ ${r.stars}）\n原始說明：${r.description || '（無）'}`
  }).join('\n\n')

  const prompt = `你是「${topicName}」領域的技術編輯，請為以下 ${repos.length} 個 GitHub 專案各寫 1 至 3 句**繁體中文**說明，涵蓋：這個專案是什麼、解決什麼問題、有什麼亮點。語氣簡潔專業。

${reposText}

只回傳 JSON 陣列，格式如下（不要有任何額外文字）：
["專案1說明", "專案2說明", ...]`

  try {
    const message = await client.messages.create({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'

    let descriptions: string[]
    try {
      descriptions = JSON.parse(text)
      if (!Array.isArray(descriptions)) descriptions = []
    }
    catch {
      const match = text.match(/\[[\s\S]*\]/)
      descriptions = match ? JSON.parse(match[0]) : []
    }

    return {
      descriptions: repos.map((r, i) => ({
        name: r.name,
        description: descriptions[i] ?? r.description,
      })),
    }
  }
  catch (error) {
    const msg = error instanceof Error ? error.message : 'AI 說明生成失敗'
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
