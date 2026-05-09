import type { QueryFilters } from '@ehekim/api-contracts'

/**
 * Read and parse a JSON response, throwing on non-ok status.
 * Shared across all resource client modules.
 */
export async function readJsonResponse<T>(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    throw new Error(`${fallbackMessage} with status ${response.status}`)
  }

  return (await response.json()) as T
}

/**
 * Build URLSearchParams from a standard QueryFilters object.
 * Shared across all resource client modules that use the common filter shape.
 */
export function buildListSearchParams(query?: QueryFilters) {
  const params = new URLSearchParams()
  if (!query) return params

  if (typeof query.page === 'number' && query.page > 0) {
    params.set('page', String(query.page))
  }
  if (typeof query.pageSize === 'number' && query.pageSize > 0) {
    params.set('page_size', String(query.pageSize))
  }
  if (typeof query.search === 'string' && query.search.trim().length > 0) {
    params.set('search', query.search.trim())
  }
  if (typeof query.ordering === 'string' && query.ordering.trim().length > 0) {
    params.set('ordering', query.ordering.trim())
  }

  return params
}
