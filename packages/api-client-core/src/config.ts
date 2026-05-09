export interface ApiClientConfig {
  baseURL: string
  fetch?: typeof fetch
}

export function withTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}
