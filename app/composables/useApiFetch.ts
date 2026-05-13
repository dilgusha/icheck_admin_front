import type { FetchError } from 'ofetch'
import type { UseFetchOptions } from 'nuxt/app'

type ApiError = {
  detail?: string
  message?: string
}

export function useApiFetch<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) {
  return useFetch<T, FetchError<ApiError>>(url, {
    ...options,
    $fetch: useNuxtApp().$api,
  })
}
