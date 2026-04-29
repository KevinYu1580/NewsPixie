import { clearSessionCookies } from '~/server/utils/session'

export default defineEventHandler((event) => {
  clearSessionCookies(event)
  return { ok: true }
})
