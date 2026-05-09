export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/login']

  if (publicRoutes.includes(to.path)) {
    return
  }

  try {
    const { authenticated } = await $fetch<{ authenticated: boolean }>('/api/auth/session')
    if (!authenticated) {
      return navigateTo('/login')
    }
  } catch {
    return navigateTo('/login')
  }
})