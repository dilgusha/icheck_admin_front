export interface Region {
  id: number
  title: string
  clinic_ids: number[]
}

export interface RegionsListResponse {
  data: Region[]   
}