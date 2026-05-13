import type {
  AdsListResponse,
  AdsQuery,
  AdPayload,
} from '@icheck/api-contracts'
import type { Ad } from '~~/packages/api-contracts/src/content'

const BASE_URL = '/admin/ads'

export const useAds = (query?: Ref<AdsQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<AdsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'admin-ads-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
    }
  )

  return {
    ads: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateAd = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const createAd = async (payload: AdPayload) => {
    loading.value = true

    try {
      return await $api(`${BASE_URL}/`, {
        method: 'POST',
        body: payload,
      })
    } finally {
      loading.value = false
    }
  }

  return { createAd, loading }
}

export const useAdActions = () => {
  const { $api } = useNuxtApp()

  const getAd = async (id: number, lang?: 'az' | 'en' | 'ru') => {
    return await $api<{ data: Ad }>(`${BASE_URL}/${id}/`, {
      headers: {
        ...(lang ? { 'Accept-Language': lang } : {}),
      },
    })
  }

  const updateAd = async (id: number, payload: AdPayload) => {
    return await $api(`${BASE_URL}/${id}/`, {
      method: 'PATCH',
      body: payload,
    })
  }

  const deleteAd = async (id: number) => {
    return await $api(`${BASE_URL}/${id}/`, {
      method: 'DELETE',
    })
  }

  return {
    getAd,
    updateAd,
    deleteAd,
  }
}
