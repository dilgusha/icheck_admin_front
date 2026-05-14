import type {
  PagePayload,
  PageResponse,
  PagesListResponse,
} from "~~/packages/api-contracts/src/pages"

const BASE_URL = "/admin/pages"

export type PageItem = {
  slug: string
  title: string
  body: string
  updated_at: string
}

export { PagePayload, PageResponse }

export const usePages = () => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie("lang")

  const { data, status, refresh, error } = useFetch<PagesListResponse>(
    `${BASE_URL}/`,
    {
      key: "admin-pages-list",
      lazy: true,
      server: false,
      watch: [langCookie],
      $fetch: $api,
    }
  )

  return {
    pages: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === "pending"),
    error,
    refresh,
  }
}

export const usePageActions = () => {
  const { $api } = useNuxtApp()

  const getPage = async (slug: string, lang?: "az" | "en" | "ru") => {
    return await $api<PageResponse>(`${BASE_URL}/${encodeURIComponent(slug)}/`, {
      headers: {
        ...(lang ? { "Accept-Language": lang } : {}),
      },
    })
  }

  const createPage = async (payload: PagePayload) => {
    return await $api<PageResponse>(`${BASE_URL}/`, {
      method: "POST",
      body: payload,
    })
  }

  const updatePage = async (slug: string, payload: Partial<PagePayload>) => {
    return await $api<PageResponse>(`${BASE_URL}/${encodeURIComponent(slug)}/`, {
      method: "PATCH",
      body: payload,
    })
  }

  const deletePage = async (slug: string) => {
    return await $api(`${BASE_URL}/${encodeURIComponent(slug)}/`, {
      method: "DELETE",
    })
  }

  return { getPage, createPage, updatePage, deletePage }
}