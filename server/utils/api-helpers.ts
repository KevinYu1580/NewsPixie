import type { H3Event } from 'h3'

/** 讀取 JSON body，解析失敗統一回 400 */
export async function readJsonBody<T>(event: H3Event): Promise<T> {
  try {
    return await readBody<T>(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: '無效的請求格式' })
  }
}

// AI 回覆非純 JSON 時，從文字中撈出 JSON 陣列
const JSON_ARRAY_RE = /\[[\s\S]*\]/

/** 解析 AI 回覆的 JSON 陣列；非純 JSON 時以 fallbackRe 從文字中擷取後再解析 */
export function parseAIJsonArray<T>(text: string, fallbackRe: RegExp = JSON_ARRAY_RE): T[] {
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    const match = text.match(fallbackRe)
    return match ? JSON.parse(match[0]) as T[] : []
  }
}

/** 將未知錯誤轉為 API 錯誤：H3 錯誤（帶 statusCode）原樣拋出，其餘包成指定 statusCode */
export function toApiError(error: unknown, fallbackMessage: string, statusCode = 500): never {
  if (error && typeof error === 'object' && 'statusCode' in error)
    throw error
  const msg = error instanceof Error ? error.message : fallbackMessage
  throw createError({ statusCode, statusMessage: msg })
}
