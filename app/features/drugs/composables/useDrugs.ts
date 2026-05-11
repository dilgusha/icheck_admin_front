import type { Drug, DrugsListResponse, DrugPayload } from '@icheck/api-contracts'

const BASE_URL = 'https://icheckapi.200soft.com/api/v1/drugs'

const getRequestHeaders = () => {
  const token = useCookie('icheck_access').value
  const lang = useCookie('lang').value || 'az'
  return {
    'Accept-Language': lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useDrugs = (search?: Ref<string>) => {
  const langCookie = useCookie('lang')
  const { data, status, refresh, error } = useFetch<DrugsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'drugs-list',
      lazy: true,
      server: false,
      watch: [langCookie, search],
      query: computed(() => search?.value ? { search: search.value } : {}),
      onRequest({ options }) {
        options.headers = { ...options.headers, ...getRequestHeaders() }
      },
    }
  )

  return {
    drugs: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateDrug = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createDrug = async (payload: DrugPayload) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Drug }>(`${BASE_URL}/`, {
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

  return { createDrug, loading, error }
}

export const useUpdateDrug = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateDrug = async (id: number, payload: Partial<DrugPayload>) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Drug }>(`${BASE_URL}/${id}/`, {
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

  return { updateDrug, loading, error }
}

export const useDeleteDrug = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteDrug = async (id: number) => {
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

  return { deleteDrug, loading, error }
}