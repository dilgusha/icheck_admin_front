import type {
  Drug,
  DrugsListResponse,
  DrugPayload,
} from '@icheck/api-contracts'

const BASE_URL = '/admin/drugs'

export const useDrugs = (search?: Ref<string>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<DrugsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'drugs-list',
      lazy: true,
      server: false,
      watch: [langCookie, search],
      query: computed(() => (search?.value ? { search: search.value } : {})),
      $fetch: $api,
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
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createDrug = async (payload: DrugPayload) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Drug }>(`${BASE_URL}/`, {
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

  return { createDrug, loading, error }
}

export const useUpdateDrug = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateDrug = async (id: number, payload: Partial<DrugPayload>) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Drug }>(`${BASE_URL}/${id}/`, {
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

  return { updateDrug, loading, error }
}

export const useDeleteDrug = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteDrug = async (id: number) => {
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

  return { deleteDrug, loading, error }
}
