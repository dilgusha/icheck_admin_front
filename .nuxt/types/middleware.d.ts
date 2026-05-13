import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "auth-global-client" | "language"
declare module 'nuxt/app' {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}