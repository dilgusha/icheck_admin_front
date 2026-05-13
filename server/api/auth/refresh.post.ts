import { clearAuthCookies, getRefreshToken, setAuthCookies } from '../../utils/auth-session'

type RefreshResponse = {
  access: string
  refresh?: string
}

export default defineEventHandler(async (event) => {
  const refresh = getRefreshToken(event)

  if (!refresh) {
    throw createError({ statusCode: 401, statusMessage: 'Refresh token not found' })
  }

  try {
    const response = await $fetch<RefreshResponse>(
      'https://icheckapi.200soft.com/auth/refresh/',
      {
        method: 'POST',
        body: { refresh },
      }
    )

    setAuthCookies(event, response.access, response.refresh || refresh)
    return { ok: true }
  } catch {
    clearAuthCookies(event)
    throw createError({ statusCode: 401, statusMessage: 'Session expired' })
  }
})