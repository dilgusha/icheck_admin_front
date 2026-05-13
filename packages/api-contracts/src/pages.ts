export interface PageItem {
  slug: string
  title: string
  body: string
}

export interface PagesListResponse {
  data: PageItem[]
}

export interface PageResponse {
  data: PageItem
}

export interface PagePayload {
  slug: string
  title: Record<'az' | 'en' | 'ru', string>
  body: Record<'az' | 'en' | 'ru', string>
}