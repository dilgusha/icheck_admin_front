const BASE_URL = '/admin/faq'

export interface FaqItem {
  id: number
  question: string
  answer: string
  sort_order?: number
}

export interface FaqListResponse {
  data: FaqItem[]
}

export interface FaqPayload {
  question: Record<'az' | 'en' | 'ru', string>
  answer: Record<'az' | 'en' | 'ru', string>
  sort_order: number
}

export const useFaq = () => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<FaqListResponse>(
    `${BASE_URL}/`,
    {
      key: 'admin-faq-list',
      lazy: true,
      server: false,
      watch: [langCookie],
      $fetch: $api,
    }
  )

  return {
    faqItems: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useFaqActions = () => {
  const { $api } = useNuxtApp()

  const getFaq = async (id: number, lang?: 'az' | 'en' | 'ru') => {
    return await $api<{ data: FaqItem }>(`${BASE_URL}/${id}/`, {
      headers: {
        ...(lang ? { 'Accept-Language': lang } : {}),
      },
    })
  }

  const createFaq = async (payload: FaqPayload) => {
    return await $api(`${BASE_URL}/`, {
      method: 'POST',
      body: payload,
    })
  }

  const updateFaq = async (id: number, payload: FaqPayload) => {
    return await $api(`${BASE_URL}/${id}/`, {
      method: 'PATCH',
      body: payload,
    })
  }

  const deleteFaq = async (id: number) => {
    return await $api(`${BASE_URL}/${id}/`, {
      method: 'DELETE',
    })
  }

  return {
    getFaq,
    createFaq,
    updateFaq,
    deleteFaq,
  }
}
