import type {
  Disease,
  DiseasesListResponse,
  DiseasePayload,
  DiseasesQuery,
} from '@icheck/api-contracts'

const BASE_URL = '/admin/diseases'

export const useDiseases = (query?: Ref<DiseasesQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<DiseasesListResponse>(
    `${BASE_URL}/`,
    {
      key: 'diseases-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
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
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createDisease = async (payload: DiseasePayload) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Disease }>(`${BASE_URL}/`, {
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

  return { createDisease, loading, error }
}

export const useUpdateDisease = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateDisease = async (id: number, payload: Partial<DiseasePayload>) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Disease }>(`${BASE_URL}/${id}/`, {
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

  return { updateDisease, loading, error }
}

export const useDeleteDisease = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteDisease = async (id: number) => {
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

  return { deleteDisease, loading, error }
}

export const useGetDisease = () => {
  const { $api } = useNuxtApp()

  const getDisease = async (id: number, lang: string): Promise<Disease> => {
    const data = await $api<{ data: Disease }>(`${BASE_URL}/${id}/`, {
      headers: {
        'Accept-Language': lang,
      },
    })

    return data.data
  }

  return { getDisease }
}
