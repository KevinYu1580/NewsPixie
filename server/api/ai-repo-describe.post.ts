import { calcDescribeMaxTokens } from '~/constants'
import { resolveAICredentials } from '~/server/utils/session'

interface RepoInput {
  name: string
  description: string
  language?: string
  stars: number
}

interface DescribeRequest {
  topicName: string
  repos: RepoInput[]
  model?: string
  provider?: string
}

export default defineEventHandler(async (event) => {
  const body = await readJsonBody<DescribeRequest>(event)

  const { topicName, repos } = body

  if (!repos || repos.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 repos' })
  }

  if (isMockMode()) {
    return { descriptions: repos.map(r => ({ name: r.name, description: r.description })) }
  }

  const { apiKey, provider, model } = resolveAICredentials(event, body)
  const { chat, model: resolvedModel } = createAIClient(apiKey, model, provider)
  const maxTokens = calcDescribeMaxTokens(repos.length)

  const reposText = repos.map((r, i) => {
    const lang = r.language ? `語言：${r.language}，` : ''
    return `${i + 1}. ${r.name}（${lang}⭐ ${r.stars}）\n原始說明：${r.description || '（無）'}`
  }).join('\n\n')

  const prompt = `你是「${topicName}」領域的技術編輯，請為以下 ${repos.length} 個 GitHub 專案各寫 1 至 3 句**繁體中文**說明，涵蓋：這個專案是什麼、解決什麼問題、有什麼亮點。語氣簡潔專業。

${reposText}

只回傳 JSON 陣列，格式如下（不要有任何額外文字）：
["專案1說明", "專案2說明", ...]`

  try {
    const text = await chat({
      model: resolvedModel,
      maxTokens,
      messages: [{ role: 'user', content: prompt }],
    })

    const descriptions = parseAIJsonArray<string>(text)

    return {
      descriptions: repos.map((r, i) => ({
        name: r.name,
        description: descriptions[i] ?? r.description,
      })),
    }
  }
  catch (error) {
    throw toApiError(error, 'AI 說明生成失敗')
  }
})
