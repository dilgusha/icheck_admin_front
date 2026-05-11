export interface Region {
  id: number
  title: string      
  
  clinic_ids: number[]
}

export interface RegionPayload {
  title: string      
  
}

export interface RegionsListResponse {
  data: Region[]
}