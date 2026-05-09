export interface Region {
  id: number
  name: string
  code: string
  status: 'Active' | 'Inactive'
  clinics: number
  doctors: number
  createdAt?: string
  updatedAt?: string
}

export interface RegionStats {
  total: number
  active: number
  topRegion: string
  pending: number
}
