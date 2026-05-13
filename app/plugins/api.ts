export default defineNuxtPlugin((nuxtApp) => {
  const langCookie = useCookie('lang', { default: () => 'az' })
  const accessCookie = useCookie('icheck_access')
  const refreshCookie = useCookie('icheck_refresh')

  const getAccess = () => accessCookie.value
  const setAccess = (token: string) => { accessCookie.value = token }
  const clearAuth = () => {
    accessCookie.value = null
    refreshCookie.value = null
  }

  let refreshPromise: Promise<void> | null = null

  const refreshAccessToken = async () => {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        await $fetch('/api/auth/refresh', { method: 'POST' })
      } catch {
        clearAuth()
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    })().finally(() => { refreshPromise = null })

    return refreshPromise
  }

  const api = $fetch.create({
    baseURL: 'https://icheckapi.200soft.com/api/v1',
    onRequest({ options }) {
      const token = getAccess()
      const lang = langCookie.value || 'az'
      options.headers = {
        ...options.headers,
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    },
    async onResponseError({ response, request, options }) {
      if (response.status !== 401) return

      await refreshAccessToken()

      const newToken = getAccess()
      if (!newToken) return

      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      }
      return $fetch(request as string, options)
    },
  })

  return { provide: { api } }
})