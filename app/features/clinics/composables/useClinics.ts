import type {
  Clinic,
  ClinicsListResponse,
  ClinicPayload,
  ClinicsQuery,
} from '@icheck/api-contracts'

const BASE_URL = '/admin/clinics'

export const useClinics = (query?: Ref<ClinicsQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<ClinicsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'clinics-list',
      lazy: true,
      server: false,
      watch: [query, langCookie],
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
    }
  )

  return {
    clinics: computed(() => data.value?.data ?? []),
    total: computed(() => data.value?.meta?.total ?? data.value?.data?.length ?? 0),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateClinic = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createClinic = async (payload: ClinicPayload) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Clinic }>(`${BASE_URL}/`, {
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

  return { createClinic, loading, error }
}

export const useUpdateClinic = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateClinic = async (id: number, payload: Partial<ClinicPayload>) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Clinic }>(`${BASE_URL}/${id}/`, {
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

  return { updateClinic, loading, error }
}

export const useDeleteClinic = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteClinic = async (id: number) => {
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

  return { deleteClinic, loading, error }
}
