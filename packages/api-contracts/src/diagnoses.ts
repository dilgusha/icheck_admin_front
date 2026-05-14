export interface Diagnosis {
  id: number
  ic_code: string
  title: string
}

export interface DiagnosesListResponse {
  data: Diagnosis[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface DiagnosisPayload {
  ic_code: string
  title: { az?: string; en?: string; ru?: string }
}

export interface DiagnosesQuery {
  search?: string
  page?: number
  per_page?: number
}