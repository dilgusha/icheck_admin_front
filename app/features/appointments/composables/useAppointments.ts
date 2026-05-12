import type {
  Appointment, AppointmentsListResponse,
  AppointmentsQuery, AppointmentPayload
} from '@icheck/api-contracts'

const BASE_URL = 'https://icheckapi.200soft.com/api/v1/admin/appointments'

export const getRequestHeaders = () => {
  const token = useCookie('icheck_access').value
  const lang = useCookie('lang').value || 'az'
  return {
    'Accept-Language': lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// GET /api/v1/appointments/
export const useAppointments = (query?: Ref<AppointmentsQuery>) => {
  const langCookie = useCookie('lang')
  const { data, status, refresh, error } = useFetch<AppointmentsListResponse>(
    `${BASE_URL}/`,
    {
      key: 'admin-appointments-list',
      lazy: true,
      server: false,
      watch: [langCookie, query],
      query: computed(() => query?.value ?? {}),
      onRequest({ options }) {
        options.headers = { ...options.headers, ...getRequestHeaders() }
      },
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

// POST /api/v1/appointments/
export const useCreateAppointment = () => {
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
      return await $fetch<{ data: Appointment }>(`${BASE_URL}/`, {
        method: 'POST',
        headers: getRequestHeaders(),
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

// PATCH /api/v1/admin/appointments/{id}/
export const useUpdateAppointment = () => {
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
      return await $fetch<{ data: Appointment }>(`${BASE_URL}/${id}/`, {
        method: 'PATCH',
        headers: getRequestHeaders(),
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

// DELETE /api/v1/admin/appointments/{id}/
export const useDeleteAppointment = () => {
  const loading = ref(false)

  const deleteAppointment = async (id: number) => {
    loading.value = true
    try {
      await $fetch(`${BASE_URL}/${id}/`, {
        method: 'DELETE',
        headers: getRequestHeaders(),
      })
    } finally {
      loading.value = false
    }
  }

  return { deleteAppointment, loading }
}



// POST /api/v1/appointments/{id}/confirm/
// export const useConfirmAppointment = () => {
//   const loading = ref(false)

//   const confirmAppointment = async (id: number) => {
//     loading.value = true
//     try {
//       return await $fetch(`${BASE_URL}/${id}/confirm/`, {
//         method: 'POST',
//         headers: getRequestHeaders(),
//       })
//     } finally {
//       loading.value = false
//     }
//   }

//   return { confirmAppointment, loading }
// }

// // POST /api/v1/appointments/{id}/decline/
// export const useDeclineAppointment = () => {
//   const loading = ref(false)

//   const declineAppointment = async (id: number, reason: string) => {
//     loading.value = true
//     try {
//       return await $fetch(`${BASE_URL}/${id}/decline/`, {
//         method: 'POST',
//         headers: getRequestHeaders(),
//         body: { reason },
//       })
//     } finally {
//       loading.value = false
//     }
//   }

//   return { declineAppointment, loading }
// }

// // POST /api/v1/appointments/{id}/postpone/
// export const usePostponeAppointment = () => {
//   const loading = ref(false)
// // usePostponeAppointment-də də:
// const postponeAppointment = async (id: number, payload: any) => {
//   loading.value = true
//   try {
//     return await $fetch(`${BASE_URL}/${id}/postpone/`, {
//       method: 'POST',
//       headers: getRequestHeaders(),
//       body: payload,
//     })
//   } catch (err: any) {
//     console.log('Postpone error:', JSON.stringify(err?.data))  // ← əlavə et
//     throw err
//   } finally {
//     loading.value = false
//   }
// }
// //   const postponeAppointment = async (id: number, payload: {
// //     date: string
// //     start_time: string
// //     end_time: string
// //     reason: string
// //   }) => {
// //     loading.value = true
// //     try {
// //       return await $fetch(`${BASE_URL}/${id}/postpone/`, {
// //         method: 'POST',
// //         headers: getRequestHeaders(),
// //         body: payload,
// //       })
// //     } finally {
// //       loading.value = false
// //     }
// //   }

//   return { postponeAppointment, loading }
// }

// // manual appointment
// export const useCreateManualAppointment = () => {
//   const loading = ref(false)
//   const error = ref<string | null>(null)

//   const createManualAppointment = async (payload: {
//     user_id?: number
//     fullname?: string
//     date: string
//     start_time: string
//     end_time: string
//     type: 'online' | 'offline'
//     complaints?: string
//     details?: string
//     address?: string
//     file_ids?: number[]
//   }) => {
//     loading.value = true
//     error.value = null
//     try {
//       return await $fetch<{ data: Appointment }>(`${BASE_URL}/manual/`, {
//         method: 'POST',
//         headers: getRequestHeaders(),
//         body: payload,
//       })
//     } catch (err: any) {
//       error.value = err?.data?.detail || 'Xəta baş verdi'
//       throw err
//     } finally {
//       loading.value = false
//     }
//   }

//   return { createManualAppointment, loading, error }
// }