import type {
  ForumPostsListResponse,
  ForumAnswersListResponse,
  ForumPostsQuery,
  ForumAnswersQuery,
} from '@icheck/api-contracts'

const POSTS_BASE_URL = '/forum-posts'
const ANSWERS_BASE_URL = '/forum-answers'

export const useForumPosts = (query?: Ref<ForumPostsQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<ForumPostsListResponse>(
    `${POSTS_BASE_URL}/`,
    {
      key: 'forum-posts-list',
      lazy: true,
      server: false,
      watch: false,
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
    }
  )

  watch([langCookie, () => query?.value], () => refresh(), { deep: true })

  return {
    posts: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useForumAnswers = (query?: Ref<ForumAnswersQuery>) => {
  const { $api } = useNuxtApp()
  const langCookie = useCookie('lang')

  const { data, status, refresh, error } = useFetch<ForumAnswersListResponse>(
    `${ANSWERS_BASE_URL}/`,
    {
      key: 'forum-answers-list',
      lazy: true,
      server: false,
      watch: false,
      query: computed(() => query?.value ?? {}),
      $fetch: $api,
    }
  )

  watch([langCookie, () => query?.value], () => refresh(), { deep: true })

  return {
    answers: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

export const useDeleteForumPost = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const deletePost = async (id: number) => {
    loading.value = true

    try {
      await $api(`${POSTS_BASE_URL}/${id}/`, {
        method: 'DELETE',
      })
    } finally {
      loading.value = false
    }
  }

  return { deletePost, loading }
}

export const useDeleteForumAnswer = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const deleteAnswer = async (id: number) => {
    loading.value = true

    try {
      await $api(`${ANSWERS_BASE_URL}/${id}/`, {
        method: 'DELETE',
      })
    } finally {
      loading.value = false
    }
  }

  return { deleteAnswer, loading }
}
