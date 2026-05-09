import type { LoginPayload, TokenPair } from '@icheck/api-contracts'
import { setAuthCookies } from '../../utils/auth-session'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<LoginPayload>>(event)
  const username = body.username?.trim()
  const password = body.password?.trim()

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required.',
    })
  }

  try {
    const tokens = await $fetch<TokenPair>('https://icheckapi.200soft.com/auth/login/', {
      method: 'POST',
      body: { username, password },
    })

    if (!tokens.access) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Yanlış giriş məlumatları',
      })
    }

    setAuthCookies(event, tokens.access, tokens.refresh)
    return { success: true }

  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 401,
      statusMessage: err?.data?.detail || 'Incorrect username or password.',
    })
  }
})