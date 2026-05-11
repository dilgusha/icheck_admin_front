export interface Symptom {
  id: number
  title: string
  gender: 'male' | 'female' | 'both'
  side: 'front' | 'back'
  body_part: string
}

export interface SymptomPayload {
  title: { az?: string; en: string }
  gender: 'male' | 'female' | 'both'
  side: 'front' | 'back'
  body_part: string
}

export interface SymptomsListResponse {
  data: Symptom[]
}

export interface SymptomsQuery {
  gender?: string
  side?: string
  body_part?: string
  search?: string
}