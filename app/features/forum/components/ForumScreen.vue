<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Forum</h2>
        <p class="text-slate-500 text-sm font-medium">Manage forum posts and answers.</p>
      </div>
      <n-button quaternary circle size="medium" @click="refreshPosts()">
        <template #icon>
          <RefreshCw :size="18" :class="{ 'animate-spin': postsLoading }" class="text-slate-500" />
        </template>
      </n-button>
    </div>

    <!-- Posts Table -->
    <n-card :bordered="false" class="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <div class="mb-4 flex items-center justify-between gap-4 p-1">
        <!-- <h3 class="text-lg font-bold text-slate-800">Forum Posts</h3> -->
        <n-input
          v-model:value="postSearch"
          placeholder="Search posts..."
          size="large"
          class="rounded-xl max-w-sm"
          clearable
        >
          <template #prefix><Search :size="18" class="text-slate-400" /></template>
        </n-input>
      </div>

      <div v-if="postsLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 bg-slate-50 rounded-lg animate-pulse" />
      </div>
      <n-alert v-else-if="postsError" type="error">Məlumat yüklənmədi</n-alert>
      <n-data-table
        v-else
        :columns="postColumns"
        :data="posts"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
        @row-click="onPostClick"
      />
    </n-card>

    <!-- Answers Table (post seçiləndə görünür) -->
    <n-card v-if="selectedPost" :bordered="false" class="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <div class="mb-4 flex items-center justify-between gap-4 p-1">
        <div class="flex items-center gap-3">
          <n-button quaternary circle @click="selectedPost = null">
            <template #icon><ArrowLeft :size="18" /></template>
          </n-button>
          <h3 class="text-lg font-bold text-slate-800">Answers — {{ selectedPost.title }}</h3>
        </div>
        <n-button quaternary circle @click="refreshAnswers()">
          <template #icon>
            <RefreshCw :size="18" :class="{ 'animate-spin': answersLoading }" class="text-slate-500" />
          </template>
        </n-button>
      </div>

      <div v-if="answersLoading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-12 bg-slate-50 rounded-lg animate-pulse" />
      </div>
      <n-alert v-else-if="answersError" type="error">Cavablar yüklənmədi</n-alert>
      <n-data-table
        v-else
        :columns="answerColumns"
        :data="answers"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-14'"
        class="modern-table"
        striped
      />
    </n-card>

    <!-- Delete Post Modal -->
    <n-modal
      v-model:show="showDeletePostModal"
      preset="dialog"
      type="error"
      title="Delete Post"
      content="Bu postu silmək istədiyinizə əminsiniz?"
      positive-text="Sil"
      negative-text="Ləğv et"
      :loading="deletePostLoading"
      @positive-click="handleDeletePost"
      @negative-click="showDeletePostModal = false"
    />

    <!-- Delete Answer Modal -->
    <n-modal
      v-model:show="showDeleteAnswerModal"
      preset="dialog"
      type="error"
      title="Delete Answer"
      content="Bu cavabı silmək istədiyinizə əminsiniz?"
      positive-text="Sil"
      negative-text="Ləğv et"
      :loading="deleteAnswerLoading"
      @positive-click="handleDeleteAnswer"
      @negative-click="showDeleteAnswerModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { NButton, NSpace, NAvatar, NTag, useMessage, type DataTableColumns } from 'naive-ui'
import { Search, RefreshCw, Trash2, ArrowLeft, MessageSquare } from 'lucide-vue-next'
import {
  useForumPosts, useForumAnswers,
  useDeleteForumPost, useDeleteForumAnswer
} from '../composables/useForum'
import type { ForumPost, ForumAnswer } from '@icheck/api-contracts'

const message = useMessage()

// ---- Posts ----
const postSearch = ref('')
const postQuery = computed(() => ({
  ...(postSearch.value ? { search: postSearch.value } : {}),
}))

const { posts, isLoading: postsLoading, error: postsError, refresh: refreshPosts } = useForumPosts(postQuery)

// ---- Selected post → answers ----
const selectedPost = ref<ForumPost | null>(null)

const answerQuery = computed(() => ({
  ...(selectedPost.value ? { post_id: selectedPost.value.id } : {}),
}))

const { answers, isLoading: answersLoading, error: answersError, refresh: refreshAnswers } = useForumAnswers(answerQuery)

watch(selectedPost, () => {
  if (selectedPost.value) refreshAnswers()
})

const onPostClick = (row: ForumPost) => {
  selectedPost.value = row
}

// ---- Delete post ----
const showDeletePostModal = ref(false)
const deletingPostId = ref<number | null>(null)
const { deletePost, loading: deletePostLoading } = useDeleteForumPost()

const openDeletePost = (id: number) => {
  deletingPostId.value = id
  showDeletePostModal.value = true
}

const handleDeletePost = async () => {
  if (!deletingPostId.value) return
  try {
    await deletePost(deletingPostId.value)
    message.success('Post silindi')
    showDeletePostModal.value = false
    if (selectedPost.value?.id === deletingPostId.value) selectedPost.value = null
    await refreshPosts()
  } catch {
    message.error('Xəta baş verdi')
  }
}

// ---- Delete answer ----
const showDeleteAnswerModal = ref(false)
const deletingAnswerId = ref<number | null>(null)
const { deleteAnswer, loading: deleteAnswerLoading } = useDeleteForumAnswer()

const openDeleteAnswer = (id: number) => {
  deletingAnswerId.value = id
  showDeleteAnswerModal.value = true
}

const handleDeleteAnswer = async () => {
  if (!deletingAnswerId.value) return
  try {
    await deleteAnswer(deletingAnswerId.value)
    message.success('Cavab silindi')
    showDeleteAnswerModal.value = false
    await refreshAnswers()
  } catch {
    message.error('Xəta baş verdi')
  }
}

// ---- Post columns ----
const postColumns: DataTableColumns<ForumPost> = [
  {
    title: 'ID', key: 'id', width: 70,
    render: (row) => h('span', { class: 'text-slate-400 font-mono text-xs font-bold' }, `#${row.id}`),
  },
  {
    title: 'Başlıq', key: 'title',
    render: (row) =>
      h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-bold text-slate-800 text-sm' }, row.title),
        h('span', { class: 'text-xs text-slate-400 line-clamp-1' }, row.body),
      ]),
  },
  {
    title: 'Müəllif', key: 'author',
    render: (row) =>
      row.author
        ? h('div', { class: 'flex items-center gap-2' }, [
            h(NAvatar, { round: true, size: 28, color: '#EEF2FF', style: 'color:#4F46E5;font-weight:800' },
              { default: () => row.author!.fullname[0] }),
            h('span', { class: 'text-sm text-slate-700' }, row.author.fullname),
          ])
        : h('span', { class: 'text-slate-400 text-sm' }, '—'),
  },
  {
    title: 'Statistika', key: 'stats',
    render: (row) =>
      h('div', { class: 'flex items-center gap-3' }, [
        h('span', { class: 'text-xs text-slate-500 flex items-center gap-1' }, [
          h(MessageSquare, { size: 12 }),
          ` ${row.answer_count}`,
        ]),
      ]),
  },
  {
    title: 'Tarix', key: 'created_at',
    render: (row) =>
      h('span', { class: 'text-slate-500 text-xs' }, new Date(row.created_at).toLocaleDateString('az')),
  },
  {
    title: 'Actions', key: 'actions', align: 'right',
    render: (row) =>
      h(NSpace, { justify: 'end' }, {
        default: () => [
          h(NButton, {
            size: 'small', quaternary: true, circle: true, type: 'error',
            class: 'opacity-0 group-hover:opacity-100 transition-all',
            onClick: (e: Event) => { e.stopPropagation(); openDeletePost(row.id) },
          }, { default: () => h(Trash2, { size: 16 }) }),
        ],
      }),
  },
]

// ---- Answer columns ----
const answerColumns: DataTableColumns<ForumAnswer> = [
  {
    title: 'ID', key: 'id', width: 70,
    render: (row) => h('span', { class: 'text-slate-400 font-mono text-xs font-bold' }, `#${row.id}`),
  },
  {
    title: 'Cavab', key: 'body',
    render: (row) => h('span', { class: 'text-slate-700 text-sm line-clamp-2' }, row.body),
  },
  {
    title: 'Müəllif', key: 'author',
    render: (row) =>
      row.author
        ? h('div', { class: 'flex items-center gap-2' }, [
            h(NAvatar, { round: true, size: 28, color: '#F0FDF4', style: 'color:#16A34A;font-weight:800' },
              { default: () => row.author!.fullname[0] }),
            h('span', { class: 'text-sm text-slate-700' }, row.author.fullname),
          ])
        : h('span', { class: 'text-slate-400 text-sm' }, '—'),
  },
  {
    title: 'Tarix', key: 'created_at',
    render: (row) =>
      h('span', { class: 'text-slate-500 text-xs' }, new Date(row.created_at).toLocaleDateString('az')),
  },
  {
    title: 'Actions', key: 'actions', align: 'right',
    render: (row) =>
      h(NSpace, { justify: 'end' }, {
        default: () => [
          h(NButton, {
            size: 'small', quaternary: true, circle: true, type: 'error',
            class: 'opacity-0 group-hover:opacity-100 transition-all',
            onClick: () => openDeleteAnswer(row.id),
          }, { default: () => h(Trash2, { size: 16 }) }),
        ],
      }),
  },
]
</script>

<style>
.modern-table .n-data-table-td {
  vertical-align: middle;
  padding: 12px 16px;
  background-color: transparent !important;
  cursor: pointer;
}
.modern-table .n-data-table-tr:hover .n-data-table-td {
  background-color: rgba(79, 70, 229, 0.02) !important;
}
.modern-table .n-data-table-thead .n-data-table-th {
  background-color: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 16px;
  border-bottom: 2px solid #f1f5f9;
}
</style>