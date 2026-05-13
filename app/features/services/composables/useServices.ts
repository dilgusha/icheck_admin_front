import type { Service, ServicesListResponse, ServicePayload, ServicesQuery } from '@icheck/api-contracts'

const BASE_URL = '/admin/services'

export const useServices = (query?: Ref<ServicesQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<ServicesListResponse>(
    `${BASE_URL}/`,
    {
      key: 'services-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
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
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createService = async (payload: ServicePayload) => {
    loading.value = true
    error.value = null
    try {
      return await $api<{ data: Service }>(`${BASE_URL}/`, {
        method: 'POST',
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
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateService = async (id: number, payload: Partial<ServicePayload>) => {
    loading.value = true
    error.value = null
    try {
      return await $api<{ data: Service }>(`${BASE_URL}/${id}/`, {
        method: 'PATCH',
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
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteService = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await $api(`${BASE_URL}/${id}/`, {
        method: 'DELETE',
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