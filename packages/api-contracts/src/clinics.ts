export interface Clinic {
  id: number
  title: string
  description: string | null
  address: string | null
  phone: string | null
  latitude: string | null
  longitude: string | null
  region_id: number | null
  top: boolean
  doctor_ids: number[]
  service_ids: number[]
}

export interface ClinicPayload {
  title: string
  description?: string | null
  address?: string | null
  phone?: string | null
  latitude?: string | null
  longitude?: string | null
  region_id?: number | null
  top?: boolean
  doctor_ids?: number[]
  service_ids?: number[]
}

export interface ClinicsListResponse {
  data: Clinic[]
}

export interface ClinicsQuery {
  search?: string
  region_id?: number
  service_id?: number
  top?: boolean
  page?: number
  per_page?: number
}