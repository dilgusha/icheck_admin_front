import type { 
  Prescription, 
  PrescriptionsListResponse, 
  PrescriptionPayload, 
  PrescriptionsQuery 
} from '@icheck/api-contracts'
import { useApiFetch } from '~/composables/useApiFetch'

const BASE_URL = '/admin/prescriptions'

// 1. Siyahını gətirmək (GET)
export const usePrescriptions = (query?: Ref<PrescriptionsQuery>) => {
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useApiFetch<PrescriptionsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'admin-prescriptions-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
    }
  )

  return {
    prescriptions: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

// 2. Tək bir resepti gətirmək (GET by ID)
export const useGetPrescription = () => {
  const { $api } = useNuxtApp()

  const getPrescription = async (id: number, lang?: string): Promise<Prescription> => {
    const res = await $api<{ data: Prescription }>(`${BASE_URL}/${id}/`, {
      headers: { ...(lang ? { 'Accept-Language': lang } : {}) },
    })
    return res.data
  }

  return { getPrescription }
}

// 3. Yeni resept yaratmaq (POST)
export const useCreatePrescription = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createPrescription = async (payload: PrescriptionPayload) => {
    loading.value = true
    error.value = null
    try {
      return await $api<{ data: Prescription }>(`${BASE_URL}/`, {
        method: 'POST',
        body: payload,
      })
    } catch (err: any) {
      error.value = err?.data?.detail || 'Resept yaradılarkən xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { createCreatePrescription: createPrescription, loading, error }
}

// 4. Resepti silmək (DELETE)
export const useDeletePrescription = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const deletePrescription = async (id: number) => {
    loading.value = true
    try {
      await $api(`${BASE_URL}/${id}/`, { method: 'DELETE' })
    } catch (err: any) {
       console.error('Silinmə xətası:', err)
       throw err
    } finally {
      loading.value = false
    }
  }

  return { deletePrescription, loading }
}