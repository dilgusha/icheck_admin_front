import type { Region, RegionsListResponse } from "@icheck/api-contracts";

const BASE_URL = "https://icheckapi.200soft.com/api/v1/regions";

const getRequestHeaders = () => {
  const token = useCookie("icheck_access").value;
  const lang = useCookie("lang").value || "az";
  return {
    "Accept-Language": lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// GET /api/v1/regions/
export const useRegions = (search?: Ref<string>) => {
  const langCookie = useCookie("lang");
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
      onRequest({ options }) {
        options.headers = {
          ...options.headers,
          ...getRequestHeaders(),
        };
      },
      onResponse({ response }) {
        // console.log("Full response:", JSON.stringify(response._data));
      },
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

// POST /api/v1/regions/
export const useCreateRegion = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createRegion = async (payload: {title: Record<string, string>  }) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await $fetch<{ data: Region }>(`${BASE_URL}/`, {
        method: "POST",
        headers: getRequestHeaders(),
        body:payload
      });
      return result;
    } catch (err: any) {
      error.value = err?.data?.detail || "Xəta baş verdi";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { createRegion, loading, error };
};

// PATCH /api/v1/regions/{id}/
export const useUpdateRegion = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  // useRegions.ts - updateRegion
  const updateRegion = async (id: number, payload: { title: Record<string, string> }) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await $fetch<{ data: Region }>(`${BASE_URL}/${id}/`, {
        method: "PATCH",
        headers: getRequestHeaders(),
        body: payload
      });
      return result;
    } catch (err: any) {
      error.value = err?.data?.detail || "Xəta baş verdi";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { updateRegion, loading, error };
};

// DELETE /api/v1/regions/{id}/
export const useDeleteRegion = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const deleteRegion = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await $fetch(`${BASE_URL}/${id}/`, {
        method: "DELETE",
        headers: getRequestHeaders(),
      });
    } catch (err: any) {
      error.value = err?.data?.detail || "Xəta baş verdi";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { deleteRegion, loading, error };
};
