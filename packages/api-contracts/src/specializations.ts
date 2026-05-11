export interface Specialization {
  id: number
  title: string
}

export interface SpecializationPayload {
  title: { az?: string; en: string }
}

export interface SpecializationsListResponse {
  data: Specialization[]
  count?: number
}

export interface SpecializationsQuery {
  search?: string
  page?: number
  per_page?: number
}