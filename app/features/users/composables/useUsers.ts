import type {
  User,
  GetUsersResponse,
  GetUsersParams,
  CreateUserRequest,
} from '@icheck/api-contracts'

export const useUsers = (query?: MaybeRefOrGetter<GetUsersParams>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<GetUsersResponse>(
    '/users/',
    {
      key: 'users-list',
      server: false,
      query,
      watch: [langCookie],
      $fetch: $api,
    }
  )

  return {
    users: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta ?? null),
    total: computed(() => data.value?.meta?.total ?? 0),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useUserActions = () => {
  const { $api } = useNuxtApp()

  const getUser = async (id: number): Promise<User> => {
    const res = await $api<{ data: User }>(`/users/${id}/`)
    return res.data
  }

  const createUser = async (payload: CreateUserRequest) => {
    return await $api<{ data: User }>('/users/', {
      method: 'POST',
      body: payload,
    })
  }

  const updateUser = async (
    id: number,
    payload: Partial<CreateUserRequest>
  ) => {
    return await $api<{ data: User }>(`/users/${id}/`, {
      method: 'PUT',
      body: payload,
    })
  }

  return { getUser, createUser, updateUser }
}
