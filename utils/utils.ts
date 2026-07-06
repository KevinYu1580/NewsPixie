const WWW_PREFIX_RE = /^www\./

/** 從 URL 擷取 domain（e.g. github.com） */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(WWW_PREFIX_RE, '')
  }
  catch {
    return ''
  }
}

/** 截斷文字 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength)
    return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

/** 相對時間，e.g. "3 小時前" */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)

  if (diffMins < 1)
    return '剛剛'
  if (diffMins < 60)
    return `${diffMins} 分鐘前`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24)
    return `${diffHours} 小時前`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30)
    return `${diffDays} 天前`
  return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

/** 格式化今日日期，e.g. "THU  26 MAR 2026" */
export function formatBriefingDate(): string {
  const now = new Date()
  const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const date = now.getDate().toString().padStart(2, '0')
  const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const year = now.getFullYear()
  return `${day}  ${date} ${month} ${year}`
}

/** 格式化數字：1200 → "1.2k" */
export function formatNumber(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)
    return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

/** 產生唯一 ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/** 今日日期字串，e.g. "2026-03-29" */
export function todayStr(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 清除超過 maxDays 天、以 prefix 開頭的 localStorage 快取 */
export function pruneLocalStorageCache(prefix: string, maxDays: number): void {
  if (typeof window === 'undefined')
    return
  const today = new Date()
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(prefix))
      continue
    const dateStr = key.slice(-10)
    const date = new Date(dateStr)
    if (!Number.isNaN(date.getTime())) {
      const diffDays = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays > maxDays)
        keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
}

/** 讀取當日 localStorage 快取（key：`{prefix}-{topicId}-{YYYY-MM-DD}`） */
export function loadTodayCache<T>(prefix: string, topicId: string): T | null {
  if (typeof window === 'undefined')
    return null
  try {
    const raw = localStorage.getItem(`${prefix}-${topicId}-${todayStr()}`)
    if (!raw)
      return null
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

/** 寫入當日 localStorage 快取，並清理超過 maxDays 天的舊條目 */
export function saveTodayCache(prefix: string, topicId: string, entry: unknown, maxDays: number): void {
  if (typeof window === 'undefined')
    return
  localStorage.setItem(`${prefix}-${topicId}-${todayStr()}`, JSON.stringify(entry))
  pruneLocalStorageCache(prefix, maxDays)
}

/** 從 $fetch / ofetch 錯誤物件中解析出可顯示的錯誤訊息 */
export function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object')
    return null

  const err = error as {
    statusMessage?: string
    message?: string
    data?: { statusMessage?: string, message?: string, error?: string }
    response?: { _data?: { statusMessage?: string, message?: string, error?: string } }
  }

  return err.data?.statusMessage
    ?? err.response?._data?.statusMessage
    ?? err.data?.message
    ?? err.response?._data?.message
    ?? err.statusMessage
    ?? err.data?.error
    ?? err.response?._data?.error
    ?? err.message
    ?? null
}
