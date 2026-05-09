export function normalizeSearchValue(value: unknown, locale = 'az') {
  return String(value ?? '').trim().toLocaleLowerCase(locale)
}

/** Azerbaijani / Turkish Latin letters → ASCII (input should already be lowercased). */
const AZ_TR_LATIN_MAP: Record<string, string> = {
  ə: 'e',
  ı: 'i',
  ü: 'u',
  ö: 'o',
  ğ: 'g',
  ş: 's',
  ç: 'c',
}

/** Russian + common East Slavic Cyrillic → Latin (input should already be lowercased). */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  і: 'i',
  ї: 'yi',
  є: 'ye',
  ґ: 'g',
}

/**
 * URL-style slug: lowercase ASCII `[a-z0-9]` segments separated by `-`.
 * Folds Azerbaijani Latin and transliterates Cyrillic; strips other characters.
 */
export function slugify(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  let s = trimmed.toLowerCase()
  let out = ''
  for (const ch of s) {
    if (AZ_TR_LATIN_MAP[ch] !== undefined) {
      out += AZ_TR_LATIN_MAP[ch]
      continue
    }
    if (CYRILLIC_TO_LATIN[ch] !== undefined) {
      out += CYRILLIC_TO_LATIN[ch]
      continue
    }
    out += ch
  }

  out = out.normalize('NFKD').replace(/\p{M}/gu, '')

  out = out
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return out
}
