import type { Specialization, SpecializationsListResponse, SpecializationPayload, SpecializationsQuery } from '@icheck/api-contracts'

const BASE_URL = 'https://icheckapi.200soft.com/api/v1/specializations'

const getRequestHeaders = () => {
  const token = useCookie('icheck_access').value
  const lang = useCookie('lang').value || 'az'
  return {
    'Accept-Language': lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useSpecializations = (query?: Ref<SpecializationsQuery>) => {
  const langCookie = useCookie('lang')
  const { data, status, refresh, error } = useFetch<SpecializationsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'specializations-list',
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
    specializations: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateSpecialization = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createSpecialization = async (payload: SpecializationPayload) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Specialization }>(`${BASE_URL}/`, {
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

  return { createSpecialization, loading, error }
}

export const useUpdateSpecialization = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateSpecialization = async (id: number, payload: Partial<SpecializationPayload>) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Specialization }>(`${BASE_URL}/${id}/`, {
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

  return { updateSpecialization, loading, error }
}

export const useDeleteSpecialization = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteSpecialization = async (id: number) => {
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

  return { deleteSpecialization, loading, error }
}