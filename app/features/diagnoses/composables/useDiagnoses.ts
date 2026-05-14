import type { Diagnosis, DiagnosesListResponse, DiagnosisPayload, DiagnosesQuery } from '@icheck/api-contracts'
import { useApiFetch } from '~/composables/useApiFetch'

const BASE_URL = '/admin/diagnoses'

export const useDiagnoses = (query?: Ref<DiagnosesQuery>) => {
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useApiFetch<DiagnosesListResponse>(
    `${BASE_URL}/`,
    {
      key: 'admin-diagnoses-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
    }
  )

  return {
    diagnoses: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useGetDiagnosis = () => {
  const { $api } = useNuxtApp()

  const getDiagnosis = async (id: number, lang?: string): Promise<Diagnosis> => {
    const res = await $api<{ data: Diagnosis }>(`${BASE_URL}/${id}/`, {
      headers: { ...(lang ? { 'Accept-Language': lang } : {}) },
    })
    return res.data
  }

  return { getDiagnosis }
}

export const useCreateDiagnosis = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createDiagnosis = async (payload: DiagnosisPayload) => {
    loading.value = true
    error.value = null
    try {
      return await $api<{ data: Diagnosis }>(`${BASE_URL}/`, {
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

  return { createDiagnosis, loading, error }
}

export const useUpdateDiagnosis = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateDiagnosis = async (id: number, payload: Partial<DiagnosisPayload>) => {
    loading.value = true
    error.value = null
    try {
      return await $api<{ data: Diagnosis }>(`${BASE_URL}/${id}/`, {
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

  return { updateDiagnosis, loading, error }
}

export const useDeleteDiagnosis = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const deleteDiagnosis = async (id: number) => {
    loading.value = true
    try {
      await $api(`${BASE_URL}/${id}/`, { method: 'DELETE' })
    } finally {
      loading.value = false
    }
  }

  return { deleteDiagnosis, loading }
}