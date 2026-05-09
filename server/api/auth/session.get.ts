import { getAccessToken } from '../../utils/auth-session'

export default defineEventHandler((event) => {
  const token = getAccessToken(event)
  return { authenticated: !!token }
})