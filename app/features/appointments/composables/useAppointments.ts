import type {
  Appointment, AppointmentsListResponse, AppointmentsQuery
} from '@icheck/api-contracts'
import { useApiFetch } from '~/composables/useApiFetch'

const BASE_URL = '/admin/appointments'

export const useAppointments = (query?: Ref<AppointmentsQuery>) => {
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useApiFetch<AppointmentsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'admin-appointments-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
    }
  )

  return {
    appointments: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useCreateAppointment = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createAppointment = async (payload: {
    doctor_id: number
    user_id?: number
    fullname?: string
    type: 'online' | 'offline'
    date: string
    start_time: string
    end_time: string
    complaints?: string
    details?: string
    address?: string
    status?: string
    payment_method: 'card' | 'insurance'
    payment_status?: string
    amount?: string
    paid_amount?: string
  }) => {
    loading.value = true
    error.value = null
    try {
      return await $api<{ data: Appointment }>(`${BASE_URL}/`, {
        method: 'POST',
        body: payload,
      })
    } catch (err: any) {
      error.value = err?.data?.error || 'Xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { createAppointment, loading, error }
}

export const useUpdateAppointment = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateAppointment = async (id: number, payload: {
    status?: string
    date?: string
    start_time?: string
    end_time?: string
    complaints?: string
    details?: string
    address?: string
    decline_reason?: string
    postpone_reason?: string
    payment_method?: string
    payment_status?: string
    amount?: string
    paid_amount?: string
  }) => {
    loading.value = true
    error.value = null
    try {
      return await $api<{ data: Appointment }>(`${BASE_URL}/${id}/`, {
        method: 'PATCH',
        body: payload,
      })
    } catch (err: any) {
      error.value = err?.data?.error || 'Xəta baş verdi'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { updateAppointment, loading, error }
}

export const useDeleteAppointment = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const deleteAppointment = async (id: number) => {
    loading.value = true
    try {
      await $api(`${BASE_URL}/${id}/`, { method: 'DELETE' })
    } finally {
      loading.value = false
    }
  }

  return { deleteAppointment, loading }
}