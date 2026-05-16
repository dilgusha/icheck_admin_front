import { ref, computed, watch, type Ref } from 'vue'
import type {
  ForumPostsListResponse,
  ForumAnswersListResponse,
  ForumPostsQuery,
} from '@icheck/api-contracts'

const POSTS_BASE_URL = '/admin/forum-posts'

// ── Posts ──────────────────────────────────────────────────────────────────
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

// ── Answers ────────────────────────────────────────────────────────────────
// Answers endpoint: GET /forum-posts/{postId}/answers/
export const useForumAnswers = (postId: Ref<number | null>) => {
  const { $api } = useNuxtApp()

  const data = ref<ForumAnswersListResponse | null>(null)
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const error = ref<Error | null>(null)

  const fetchAnswers = async (id: number) => {
    status.value = 'pending'
    error.value = null
    try {
      const result = await $api<ForumAnswersListResponse>(
        `${POSTS_BASE_URL}/${id}/answers/`
      )
      data.value = result
      status.value = 'success'
    } catch (e) {
      error.value = e as Error
      status.value = 'error'
    }
  }

  watch(
    postId,
    (id) => {
      if (id) {
        fetchAnswers(id)
      } else {
        data.value = null
        status.value = 'idle'
      }
    },
    { immediate: true }
  )

  const refresh = () => {
    if (postId.value) fetchAnswers(postId.value)
  }

  return {
    answers: computed(() => data.value?.data ?? []),
    meta: computed(() => data.value?.meta),
    isLoading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}

// ── Delete post ────────────────────────────────────────────────────────────
export const useDeleteForumPost = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const deletePost = async (id: number) => {
    loading.value = true
    try {
      await $api(`${POSTS_BASE_URL}/${id}/`, { method: 'DELETE' })
    } finally {
      loading.value = false
    }
  }

  return { deletePost, loading }
}

// ── Delete answer ──────────────────────────────────────────────────────────
export const useDeleteForumAnswer = () => {
  const { $api } = useNuxtApp()
  const loading = ref(false)

  const deleteAnswer = async (postId: number, answerId: number) => {
    loading.value = true
    try {
      await $api(`${POSTS_BASE_URL}/${postId}/answers/${answerId}/`, {
        method: 'DELETE',
      })
    } finally {
      loading.value = false
    }
  }

  return { deleteAnswer, loading }
}