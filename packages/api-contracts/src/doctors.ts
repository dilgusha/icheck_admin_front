export interface DoctorSpecialization {
  id: number
  title: string
}

export interface Doctor {
  id: number
  fullname: string
  avatar_url: string | null
  gender: 'male' | 'female'
  specializations: DoctorSpecialization[]
  workplace: string | null
  location_id: number | null
  experience_years: number | null
  price: number | null
  offline_price: number | null
  only_offline: boolean
}

export interface DoctorsMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface DoctorsListResponse {
  data: Doctor[]
  meta: DoctorsMeta
}

export interface DoctorsQuery {
  search?: string
  specialization_id?: string
  price_min?: number
  price_max?: number
  experience_min?: number
  experience_max?: number
  location_id?: number
  page?: number
  per_page?: number
}