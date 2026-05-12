import type { SelectOption } from 'naive-ui'
import { computed, onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

export interface RemoteSelectParams {
  page: number
  per_page: number
  search?: string
}

export interface ICheckPaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface UseRemoteSelectOptions {
  key: string
  per_page?: number
  debounceMs?: number
  loadOnOpen?: boolean
  initialOption?: MaybeRefOrGetter<SelectOption | SelectOption[] | null | undefined>
  selectedValues?: MaybeRefOrGetter<unknown | unknown[] | null | undefined>
}

export function useRemoteSelect<T>(
  fetcher: (params: RemoteSelectParams) => Promise<ICheckPaginatedResponse<T>>,
  mapOption: (item: T) => SelectOption,
  options: UseRemoteSelectOptions,
) {
  const currentPage = ref(1)
  const searchInput = ref('')
  const debouncedSearch = ref('')
  const queryEnabled = ref(!options.loadOnOpen)
  const accumulatedOptions = ref<SelectOption[]>([])
  const totalCount = ref(0)
  const optionCache = new Map<unknown, SelectOption>()
  const isLoadingMore = ref(false)

  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  watch(searchInput, (value) => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)

    if (!value.trim()) {
      debouncedSearch.value = ''
      currentPage.value = 1
      return
    }

    searchDebounceTimer = setTimeout(() => {
      debouncedSearch.value = value.trim()
      currentPage.value = 1
    }, options.debounceMs ?? 300)
  })

  onBeforeUnmount(() => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  })

  const { data, pending } = useAsyncData<ICheckPaginatedResponse<T>>(
    options.key,
    async () => {
      if (!queryEnabled.value) {
        return { data: [], meta: { page: 1, per_page: 10, total: 0, total_pages: 0 } }
      }

      return await fetcher({
        page: currentPage.value,
        per_page: options.per_page ?? 10,
        search: debouncedSearch.value || undefined,
      })
    },
    {
      server: false,
      watch: [queryEnabled, currentPage, debouncedSearch],
    },
  )

  watch(
    () => data.value,
    (pageData) => {
      totalCount.value = pageData?.meta?.total ?? 0

      const nextOptions = (pageData?.data ?? []).map(mapOption)
      nextOptions.forEach((option) => {
        optionCache.set(option.value, option)
      })

      if (currentPage.value === 1) {
        accumulatedOptions.value = nextOptions
        return
      }

      const existingValues = new Set(accumulatedOptions.value.map((o) => o.value))
      const unique = nextOptions.filter((o) => !existingValues.has(o.value))
      accumulatedOptions.value = [...accumulatedOptions.value, ...unique]
    },
    { immediate: true },
  )

  watch(pending, (value) => {
    if (!value) isLoadingMore.value = false
  })

  const hasMore = computed(() => {
    if (!queryEnabled.value) return false
    return currentPage.value < (data.value?.meta?.total_pages ?? 0)
  })

  const mergedOptions = computed(() => {
    const merged = [...accumulatedOptions.value]
    const seenValues = new Set(merged.map((o) => o.value))

    const initialOption = toValue(options.initialOption)
    const initialOptions = Array.isArray(initialOption)
      ? initialOption
      : initialOption ? [initialOption] : []

    for (const option of initialOptions) {
      if (!seenValues.has(option.value)) {
        merged.unshift(option)
        seenValues.add(option.value)
      }
    }

    const selectedValues = toValue(options.selectedValues)
    const selectedList = Array.isArray(selectedValues)
      ? selectedValues
      : selectedValues == null ? [] : [selectedValues]

    for (const val of selectedList) {
      if (!seenValues.has(val) && optionCache.has(val)) {
        const cached = optionCache.get(val)
        if (cached) {
          merged.push(cached)
          seenValues.add(val)
        }
      }
    }

    return merged
  })

  const isPending = computed(() => pending.value || isLoadingMore.value)

  function onDropdownShow() {
    if (options.loadOnOpen) queryEnabled.value = true
  }

  function handleSearch(query: string) {
    if (query === searchInput.value) return
    searchInput.value = query
  }

  function handleValueChange() {
    if (!searchInput.value && !debouncedSearch.value) return
    searchInput.value = ''
    debouncedSearch.value = ''
    currentPage.value = 1
  }

  function handleScroll(event: Event) {
    if (!queryEnabled.value || !hasMore.value || pending.value || isLoadingMore.value) return
    const el = event.currentTarget as HTMLElement | null
    if (!el) return
    const isNearBottom = el.scrollTop + el.offsetHeight >= el.scrollHeight - 10
    if (!isNearBottom) return
    isLoadingMore.value = true
    currentPage.value += 1
  }

  function reset() {
    searchInput.value = ''
    debouncedSearch.value = ''
    currentPage.value = 1
  }

  return {
    options: mergedOptions,
    pending: isPending,
    handleSearch,
    handleScroll,
    handleValueChange,
    reset,
    onDropdownShow,
    searchInput,
    currentPage,
    hasMore,
  }
}