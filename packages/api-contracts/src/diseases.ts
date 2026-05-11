export interface Disease {
  id: number
  title: string
  description: string | null
  emergency: boolean
  top: boolean
  symptom_ids: number[] | null
  service_ids: number[] | null
  specialization_ids: number[] | null
  doctor_ids: number[] | null
}

export interface DiseasePayload {
  title: { az?: string; en?: string; ru?: string }
  description?: { az?: string; en?: string; ru?: string }
  emergency?: boolean
  top?: boolean
  symptom_ids?: number[]
  service_ids?: number[]
  specialization_ids?: number[]
  doctor_ids?: number[]
}

export interface DiseasesListResponse {
  data: Disease[];
}

export interface DiseasesQuery {
  symptom_ids?: string;
  gender?: string;
  side?: string;
  body_part?: string;
  top?: boolean;
  search?: string;
}
