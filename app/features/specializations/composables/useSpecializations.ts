import type {
  Specialization,
  SpecializationsListResponse,
  SpecializationPayload,
  SpecializationsQuery,
} from '@icheck/api-contracts'

const BASE_URL = '/admin/specializations'

export const useSpecializations = (query?: Ref<SpecializationsQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } =
    useFetch<SpecializationsListResponse>(`${BASE_URL}/`, {
      key: 'specializations-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
    })

  return {
    specializations: computed(() => data.value?.data ?? []),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateSpecialization = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createSpecialization = async (payload: SpecializationPayload) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Specialization }>(`${BASE_URL}/`, {
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

  return { createSpecialization, loading, error }
}

export const useUpdateSpecialization = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateSpecialization = async (
    id: number,
    payload: Partial<SpecializationPayload>
  ) => {
    loading.value = true
    error.value = null

    try {
      return await $api<{ data: Specialization }>(`${BASE_URL}/${id}/`, {
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

  return { updateSpecialization, loading, error }
}

export const useDeleteSpecialization = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteSpecialization = async (id: number) => {
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

  return { deleteSpecialization, loading, error }
}
