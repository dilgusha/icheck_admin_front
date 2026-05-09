import { getAccessToken } from '../utils/auth-session'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const token = getAccessToken(event)
    if (token) {
      event.context.accessToken = token
    }
  })
})