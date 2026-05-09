export function toOptionalNumber(value: string | number | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}
