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
  provider?: string
}

export default defineEventHandler(async (event) => {
  let body: DescribeRequest
  try {
    body = await readBody<DescribeRequest>(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '無效的請求格式' })
  }

  const { topicName, repos, apiKey: clientKey, model: clientModel, provider: clientProvider } = body

  if (!repos || repos.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少 repos' })
  }

  const { chat, model } = createAIClient(clientKey, clientModel, clientProvider)

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
      model,
      maxTokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

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
