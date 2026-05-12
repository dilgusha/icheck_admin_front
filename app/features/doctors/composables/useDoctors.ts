import type {
  Doctor,
  DoctorsListResponse,
  DoctorsQuery,
} from "@icheck/api-contracts";

const BASE_URL = "https://icheckapi.200soft.com/api/v1/doctors";

export const getRequestHeaders = () => {
  const token = useCookie("icheck_access").value;
  const lang = useCookie("lang").value || "az";
  return {
    "Accept-Language": lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const useDoctors = (query?: Ref<DoctorsQuery>) => {
  const langCookie = useCookie("lang");
  const { data, status, refresh, error } = useFetch<DoctorsListResponse>(
    `${BASE_URL}/`,
    {
      key: "doctors-list",
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      onRequest({ options }) {
        options.headers = { ...options.headers, ...getRequestHeaders() };
      },
    },
  );

  return {
    doctors: computed(() => data.value?.data ?? []),
    total: computed(() => data.value?.meta?.total ?? 0),
    isLoading: computed(() => status.value === "pending"),
    error,
    refresh,
  };
};

export const useGetDoctor = () => {
  const getDoctor = async (id: number): Promise<Doctor> => {
    const token = useCookie('icheck_access').value
    const lang = useCookie('lang').value || 'az'
    const data = await $fetch<{ data: Doctor }>(`${BASE_URL}/${id}/`, {
      headers: {
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    return data.data
  }

  return { getDoctor }
}