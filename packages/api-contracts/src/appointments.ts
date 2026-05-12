export interface AppointmentPayment {
  status: 'unpaid' | 'paid'
  method: 'card' | 'insurance'
  amount: number
  paid_amount: number
}

export interface AppointmentUser {
  id: number
  fullname: string
  avatar_url: string | null
  gender: string
  birthday: string
}

export interface AppointmentDoctor {
  id: number
  fullname: string
  avatar_url: string | null
  specializations: { id: number; title: string }[]
  workplace: string | null
}

export interface Appointment {
  id: number
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
  type: 'online' | 'offline'
  parent_id: number | null
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  complaints: string | null
  details: string | null
  address: string | null
  payment: AppointmentPayment
  user: AppointmentUser
  doctor: AppointmentDoctor
  files: any[]
  can_re_appointment: boolean
  can_chat: boolean
  created_at: string
}

export interface AppointmentsMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface AppointmentsListResponse {
  data: Appointment[]
  meta: AppointmentsMeta
}

export interface AppointmentsQuery {
  status?: string
  doctor_id?: number
  patient_id?: number
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
}

export interface AppointmentPayload {
  doctor_id: number
  parent_id?: number
  type: 'online' | 'offline'
  date: string
  start_time: string
  end_time: string
  complaints?: string
  details?: string
  payment_method: 'card' | 'insurance' 
  insurance?: { type: string; value: string }
  file_ids?: number[]
}