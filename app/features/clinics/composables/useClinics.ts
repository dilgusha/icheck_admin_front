import type { Clinic, ClinicsListResponse, ClinicPayload, ClinicsQuery } from '@icheck/api-contracts'

const BASE_URL = 'https://icheckapi.200soft.com/api/v1/clinics'

const getRequestHeaders = () => {
  const token = useCookie('icheck_access').value
  const lang = useCookie('lang').value || 'az'
  return {
    'Accept-Language': lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

// GET /api/v1/clinics/
export const useClinics = (query?: Ref<ClinicsQuery>) => {
    const langCookie = useCookie('lang')
  const { data, status, refresh, error } = useFetch<ClinicsListResponse>(
    `${BASE_URL}/`,
    {
      lazy: true,
      server: false,
      watch: [query, langCookie],
      query: computed(() => query?.value ?? {}),
      onRequest({ options }) {
        // const token = useCookie('icheck_access').value
        // const currentLang = useCookie('lang').value || 'az'

        options.headers = { 
          ...options.headers, 
          ...getRequestHeaders() 
        }
      },
      onResponse({ response }) {
        console.log('Clinics loaded')
      }
    }
  )

  return {
    clinics: computed(() => data.value?.data ?? []),
    total: computed(() => data.value?.data?.length ?? 0),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

// POST /api/v1/clinics/
export const useCreateClinic = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createClinic = async (payload: ClinicPayload) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Clinic }>(`${BASE_URL}/`, {
        method: 'POST',
        headers: getRequestHeaders(),
        body:  payload ,
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

// PATCH /api/v1/clinics/{id}/
export const useUpdateClinic = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateClinic = async (id: number, payload: Partial<ClinicPayload>) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Clinic }>(`${BASE_URL}/${id}/`, {
        method: 'PATCH',
        headers: getRequestHeaders(),
        body: payload
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

// DELETE /api/v1/clinics/{id}/
export const useDeleteClinic = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteClinic = async (id: number) => {
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

  return { deleteClinic, loading, error }
}