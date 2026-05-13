export interface Ad {
  id: number
  title: string
  body: string | null
  image_url: string | null
  link: string | null
  button_text: string | null

  placement?: string | null
  starts_at?: string | null
  ends_at?: string | null
  is_active?: boolean
  sort_order?: number
}


export interface AdsListResponse {
  data: Ad[]
}

export interface AdsQuery {
  placement?: string
}

export interface AdPayload {
  title: Record<'az' | 'en' | 'ru', string>
  body?: Partial<Record<'az' | 'en' | 'ru', string>>
  button_text?: Partial<Record<'az' | 'en' | 'ru', string>>
  link?: string | null
  placement: string
  starts_at?: string | null
  ends_at?: string | null
  is_active: boolean
  sort_order: number
}
