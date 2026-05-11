import type { Service, ServicesListResponse, ServicePayload, ServicesQuery } from '@icheck/api-contracts'

const BASE_URL = 'https://icheckapi.200soft.com/api/v1/services'

const getRequestHeaders = () => {
  const token = useCookie('icheck_access').value
  const lang = useCookie('lang').value || 'az'
  return {
    'Accept-Language': lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useServices = (query?: Ref<ServicesQuery>) => {
  const langCookie = useCookie('lang')
  const { data, status, refresh, error } = useFetch<ServicesListResponse>(
    `${BASE_URL}/`,
    {
      key: 'services-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      onRequest({ options }) {
        options.headers = { ...options.headers, ...getRequestHeaders() }
      },
    }
  )

  return {
    services: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createService = async (payload: ServicePayload) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Service }>(`${BASE_URL}/`, {
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

  return { createService, loading, error }
}

export const useUpdateService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateService = async (id: number, payload: Partial<ServicePayload>) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Service }>(`${BASE_URL}/${id}/`, {
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

  return { updateService, loading, error }
}

export const useDeleteService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteService = async (id: number) => {
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

  return { deleteService, loading, error }
}