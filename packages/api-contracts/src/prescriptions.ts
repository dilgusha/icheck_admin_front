export interface PrescriptionDoctor {
  id: number
  fullname: string
  avatar_url: string | null
  specializations: { id: number; title: string }[]
  workplace: string | null
}

export interface PrescriptionDrug {
  drug_id: number
  details: string 
}

export interface Prescription {
  id: number
  date: string
  diagnosis: string       
  drugs_summary: string   
  doctor: PrescriptionDoctor
  appointment_id?: number
  diagnosis_ids?: number[]
  drugs?: PrescriptionDrug[]
  services?: Record<string, string>[]
  created_at?: string
}

export interface PrescriptionsListResponse {
  data: Prescription[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface PrescriptionPayload {
  appointment_id?: number | null
  doctor_id?: number | null
  date: string
  diagnosis_ids: number[]
  drugs: PrescriptionDrug[]
  services: Record<string, string>[]
}

export interface PrescriptionsQuery {
  page?: number
  per_page?: number
  search?: string
}