export interface Drug {
  id: number
  title: string
}

export interface DrugPayload {
  title: { az?: string; en: string }
}

export interface DrugsListResponse {
  data: Drug[]
}