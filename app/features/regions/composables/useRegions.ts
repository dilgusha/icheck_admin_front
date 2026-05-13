import type { Region, RegionsListResponse } from '@icheck/api-contracts'

const BASE_URL = '/admin/regions'

type RegionPayload = {
  title: Record<string, string>
}

export const useRegions = (search?: Ref<string>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<RegionsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'regions-list',
      lazy: true,
      server: false,
      watch: [langCookie, search],
      query: computed(() => ({
        ...(search?.value ? { search: search.value } : {}),
      })),
      $fetch: $api,
    }
  )

  return {
    regions: computed(() => data.value?.data ?? []),
    total: computed(() => data.value?.data?.length ?? 0),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateRegion = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createRegion = async (payload: RegionPayload) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Region }>(`${BASE_URL}/`, {
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

  return { createRegion, loading, error }
}

export const useUpdateRegion = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateRegion = async (id: number, payload: RegionPayload) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Region }>(`${BASE_URL}/${id}/`, {
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

  return { updateRegion, loading, error }
}

export const useDeleteRegion = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteRegion = async (id: number) => {
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

  return { deleteRegion, loading, error }
}
