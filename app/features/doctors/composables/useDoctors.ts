import type {
  Doctor,
  DoctorsListResponse,
  DoctorsQuery,
} from '@icheck/api-contracts'

const BASE_URL = '/doctors'

export const useDoctors = (query?: Ref<DoctorsQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<DoctorsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'doctors-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
    }
  )

  return {
    doctors: computed(() => data.value?.data ?? []),
    total: computed(() => data.value?.meta?.total ?? 0),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useGetDoctor = () => {
  const { $api } = useNuxtApp()

  const getDoctor = async (id: number): Promise<Doctor> => {
    const data = await $api<{ data: Doctor }>(`${BASE_URL}/${id}/`)
    return data.data
  }

  return { getDoctor }
}
