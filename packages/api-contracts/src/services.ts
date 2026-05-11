export interface Service {
  id: number
  title: string
  body: string | null
}

export interface ServicePayload {
  title: { az?: string; en: string }
  body?: { az?: string; en?: string }
}

export interface ServicesListResponse {
  data: Service[]
}

export interface ServicesQuery {
  search?: string
  clinic_id?: number
}