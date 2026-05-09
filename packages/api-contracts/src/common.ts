export type AppLocaleCode = 'az' | 'ru'

export interface TranslatableIdName {
  id: number
  name: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface QueryFilters {
  page?: number
  pageSize?: number
  search?: string
  ordering?: string
}
