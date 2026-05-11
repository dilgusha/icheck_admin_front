import { ref, computed, type Ref } from 'vue'
import type { Symptom, SymptomsListResponse, SymptomPayload, SymptomsQuery } from '@icheck/api-contracts'

const BASE_URL = 'https://icheckapi.200soft.com/api/v1/symptoms'

const useAuthHeaders = () => {
  const token = useCookie('icheck_access').value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useSymptoms = (query?: Ref<SymptomsQuery>) => {
  const { data, status, refresh, error } = useFetch<SymptomsListResponse>(
    `${BASE_URL}/`,
    {
      lazy: true,
      server: false,
      query: computed(() => query?.value ?? {}),
      onRequest({ options }) {
        options.headers = { ...options.headers, ...useAuthHeaders() }
      },
    }
  )

  return {
    symptoms: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useGetSymptomById = () => {
  const loading = ref(false)
  
  const getSymptom = async (id: number, lang: string) => {
    loading.value = true
    try {
      return await $fetch<{ data: Symptom }>(`${BASE_URL}/${id}/`, {
        method: 'GET',
        headers: useAuthHeaders(),
        query: { lang }
        
      })
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  return { getSymptom, loading }
}

export const useCreateSymptom = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createSymptom = async (payload: SymptomPayload) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Symptom }>(`${BASE_URL}/`, {
        method: 'POST',
        headers: useAuthHeaders(),
        body: payload,
      })
    } catch (err: any) {
      error.value = err?.data?.detail || 'Xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { createSymptom, loading, error }
}

export const useUpdateSymptom = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateSymptom = async (id: number, payload: any) => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<{ data: Symptom }>(`${BASE_URL}/${id}/`, {
        method: 'PATCH',
        headers: useAuthHeaders(),
        body: payload,
      })
    } catch (err: any) {
      error.value = err?.data?.detail || 'Xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { updateSymptom, loading, error }
}

export const useDeleteSymptom = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteSymptom = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`${BASE_URL}/${id}/`, {
        method: 'DELETE',
        headers: useAuthHeaders(),
      })
    } catch (err: any) {
      error.value = err?.data?.detail || 'Xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { deleteSymptom, loading, error }
}