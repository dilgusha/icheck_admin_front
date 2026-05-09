export const useRegions = (search?: Ref<string>) => {
  const { data, status, refresh, error } = useFetch<RegionsListResponse>(
    "https://icheckapi.200soft.com/api/v1/regions/",
    {
      lazy: true,
      server: false,
      query: computed(() => ({
        ...(search?.value ? { search: search.value } : {}),
      })),
      onRequest({ options }) {
        const token = useCookie("icheck_access").value;
        console.log("🔑 Token:", token);
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      },
      // onResponse({ response }) {
      //   console.log("Response:", response.status, response._data);
      // },
      // onResponseError({ response }) {
      //   console.log("Error:", response.status, response._data);
      // },
    },
  );

  return {
    regions: computed(() => data.value?.data ?? []), 
    total: computed(() => data.value?.data?.length ?? 0), 
    isLoading: computed(() => status.value === "pending"),
    error,
    refresh,
  };
};
