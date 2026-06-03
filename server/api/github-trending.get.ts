import { fetchGithubTrending } from '@/server/utils/github'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.query || 'developer-tools')
  const limit = Number(query.limit ?? 8)

  try {
    return await fetchGithubTrending(q, limit)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub 抓取錯誤'
    throw createError({ statusCode: 500, statusMessage: message })
  }
})
