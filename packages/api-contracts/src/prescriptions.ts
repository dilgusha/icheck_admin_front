export interface LocalizedTitle {
  az?: string
  en?: string
  ru?: string
}

export interface PrescriptionDrug {
  name: string 
  details: LocalizedTitle 
}

export interface PrescriptionService extends LocalizedTitle {}

export interface Prescription {
  id: number
  appointment_id: number
  doctor_id: number
  date: string
  diagnosis_ids: number[]
  drugs: PrescriptionDrug[]
  services: PrescriptionService[]
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
  appointment_id: number
  doctor_id: number
  date: string
  diagnosis_ids: number[]
  drugs: PrescriptionDrug[]
  services: PrescriptionService[]
}

export interface PrescriptionsQuery {
  page?: number
  per_page?: number
}