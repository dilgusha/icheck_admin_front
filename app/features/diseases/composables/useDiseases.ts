import type { Disease, DiseasesListResponse, DiseasePayload, DiseasesQuery } from '@icheck/api-contracts'

const BASE_URL = 'https://icheckapi.200soft.com/api/v1/diseases'

const getRequestHeaders = () => {
  const token = useCookie('icheck_access').value
  const lang = useCookie('lang').value || 'az'
  return {
    'Accept-Language': lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useDiseases = (query?: Ref<DiseasesQuery>) => {
    const langCookie = useCookie('lang')
  const { data, status, refresh, error } = useFetch<DiseasesListResponse>(
    `${BASE_URL}/`,
    {
      key: 'diseases-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      onRequest({ options }) {
        options.headers = getRequestHeaders()
      },
    }
  )

  return {
    diseases: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateDisease = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createDisease = async (payload: DiseasePayload) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Disease }>(`${BASE_URL}/`, {
        method: 'POST',
        headers: getRequestHeaders(),
        body: payload,
      })
    } catch (err: any) {
      error.value = err?.data?.detail || 'Xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { createDisease, loading, error }
}

export const useUpdateDisease = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateDisease = async (id: number, payload: Partial<DiseasePayload>) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Disease }>(`${BASE_URL}/${id}/`, {
        method: 'PATCH',
        headers: getRequestHeaders(),
        body: payload,
      })
    } catch (err: any) {
      error.value = err?.data?.detail || 'Xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { updateDisease, loading, error }
}

export const useDeleteDisease = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteDisease = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`${BASE_URL}/${id}/`, {
        method: 'DELETE',
        headers: getRequestHeaders(),
      })
    } catch (err: any) {
      error.value = err?.data?.detail || 'Xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { deleteDisease, loading, error }
  
}
export const useGetDisease = () => {
  const getDisease = async (id: number, lang: string): Promise<Disease> => {
    const token = useCookie('icheck_access').value
    const data = await $fetch<{ data: Disease }>(`${BASE_URL}/${id}/`, {
      headers: {
        'Accept-Language': lang,         
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    return data.data
  }

  return { getDisease }
}