export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const publicRoutes = ['/login']

  if (publicRoutes.includes(to.path)) {
    return
  }

  const isAuthenticated = async () => {
    try {
      const { authenticated } = await $fetch<{ authenticated: boolean }>(
        '/api/auth/session'
      )

      return authenticated
    } catch {
      return false
    }
  }

  if (await isAuthenticated()) {
    return
  }

  try {
    await $fetch('/api/auth/refresh', {
      method: 'POST',
    })
  } catch {
    return navigateTo('/login')
  }

  if (!(await isAuthenticated())) {
    return navigateTo('/login')
  }
})
