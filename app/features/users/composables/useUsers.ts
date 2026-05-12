import type {
  User,
  GetUsersResponse,
  GetUsersParams,
  CreateUserRequest
} from "@icheck/api-contracts";

const BASE_URL = "https://icheckapi.200soft.com/api/v1/users";

const getRequestHeaders = () => {
  const token = useCookie("icheck_access").value;
  const lang = useCookie("lang").value || "az";
  return {
    "Accept-Language": lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const useUsers = (query?: Ref<GetUsersParams>) => {
  const langCookie = useCookie("lang");
  
  const { data, status, refresh, error } = useFetch<GetUsersResponse>(
    `${BASE_URL}/`,
    {
      key: "users-list",
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      onRequest({ options }) {
        options.headers = { ...options.headers, ...getRequestHeaders() };
      },
    }
  );

  return {
    users: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta ?? null),
    total: computed(() => data.value?.meta?.total ?? 0),
    isLoading: computed(() => status.value === "pending"),
    error,
    refresh,
  };
};

export const useUserActions = () => {
  const getUserId = async (id: number): Promise<User> => {
    const data = await $fetch<{ data: User }>(`${BASE_URL}/${id}/`, {
      headers: getRequestHeaders(),
    });
    return data.data;
  };

  const createUser = async (payload: CreateUserRequest) => {
    return await $fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: getRequestHeaders(),
      body: payload,
    });
  };

   const updateUser = async (id: number, payload: Partial<CreateUserRequest>) => {
    return await $fetch(`${BASE_URL}/${id}/`, {
      method: 'PUT',
      headers: getRequestHeaders(),
      body: payload,
    })
  }
  return { getUserId, createUser ,updateUser};
};

