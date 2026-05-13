import type {
  Symptom,
  SymptomsListResponse,
  SymptomPayload,
  SymptomsQuery,
} from '@icheck/api-contracts'

const BASE_URL = '/admin/symptoms'

export const useSymptoms = (query?: Ref<SymptomsQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<SymptomsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'symptoms-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
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
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const getSymptom = async (id: number, lang: string) => {
    loading.value = true

    try {
      return await $api<{ data: Symptom }>(`${BASE_URL}/${id}/`, {
        method: 'GET',
        headers: {
          'Accept-Language': lang,
        },
      })
    } finally {
      loading.value = false
    }
  }

  return { getSymptom, loading }
}

export const useCreateSymptom = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createSymptom = async (payload: SymptomPayload) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Symptom }>(`${BASE_URL}/`, {
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

  return { createSymptom, loading, error }
}

export const useUpdateSymptom = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateSymptom = async (
    id: number,
    payload: Partial<SymptomPayload>
  ) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Symptom }>(`${BASE_URL}/${id}/`, {
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

  return { updateSymptom, loading, error }
}

export const useDeleteSymptom = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteSymptom = async (id: number) => {
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

  return { deleteSymptom, loading, error }
}
