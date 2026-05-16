<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Forum
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage forum posts and answers.
        </p>
      </div>
      <n-button quaternary circle size="medium" @click="refreshPosts()">
        <template #icon>
          <RefreshCw
            :size="18"
            :class="{ 'animate-spin': postsLoading }"
            class="text-slate-500"
          />
        </template>
      </n-button>
    </div>

    <!-- Search -->
    <n-input
      v-model:value="postSearch"
      placeholder="Search posts..."
      size="large"
      class="rounded-xl max-w-sm"
      clearable
    >
      <template #prefix>
        <Search :size="18" class="text-slate-400" />
      </template>
    </n-input>

    <!-- Loading -->
    <div v-if="postsLoading" class="space-y-3">
      <div
        v-for="i in 5"
        :key="i"
        class="h-16 bg-slate-100 rounded-xl animate-pulse"
      />
    </div>

    <!-- Error -->
    <n-alert v-else-if="postsError" type="error">Məlumat yüklənmədi</n-alert>

    <!-- Accordion Table -->
    <div
      v-else
      class="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm"
    >
      <!-- Table header -->
      <div
        class="grid grid-cols-[2rem_4rem_1fr_10rem_6rem_6rem_4rem] gap-4 px-4 py-3 bg-slate-50 border-b border-slate-100"
      >
        <div />
        <div
          class="text-[11px] font-extrabold uppercase tracking-widest text-slate-400"
        >
          ID
        </div>
        <div
          class="text-[11px] font-extrabold uppercase tracking-widest text-slate-400"
        >
          Məzmun
        </div>
        <div
          class="text-[11px] font-extrabold uppercase tracking-widest text-slate-400"
        >
          Müəllif
        </div>
        <div
          class="text-[11px] font-extrabold uppercase tracking-widest text-slate-400"
        >
          Cavablar
        </div>
        <div
          class="text-[11px] font-extrabold uppercase tracking-widest text-slate-400"
        >
          Tarix
        </div>
        <div />
      </div>

      <!-- Rows -->
      <div
        v-for="(post, idx) in paginatedPosts"
        :key="post.id"
        class="border-b border-slate-100 last:border-b-0"
      >
        <!-- Post row -->
        <div
          class="grid grid-cols-[2rem_4rem_1fr_10rem_6rem_6rem_4rem] gap-4 px-4 py-4 items-center cursor-pointer transition-colors hover:bg-slate-50 group"
          :class="{ 'bg-indigo-50/40': expandedPostId === post.id }"
          @click="togglePost(post)"
        >
          <!-- Chevron -->
          <div class="flex items-center justify-center">
            <ChevronRight
              :size="16"
              class="text-slate-400 transition-transform duration-200"
              :class="{ 'rotate-90': expandedPostId === post.id }"
            />
          </div>

          <!-- ID -->
          <span class="font-mono text-xs font-bold text-slate-400"
            >#{{ post.id }}</span
          >

          <!-- Body -->
          <span class="text-sm text-slate-700 line-clamp-2">{{
            post.body
          }}</span>

          <!-- Author -->
          <div class="flex items-center gap-2" v-if="post.author">
            <div
              class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center flex-shrink-0"
            >
              {{ post.author.fullname[0] }}
            </div>
            <span class="text-sm text-slate-600 truncate">{{
              post.author.fullname
            }}</span>
          </div>
          <span v-else class="text-slate-400 text-sm">—</span>

          <!-- Answer count -->
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <MessageSquare :size="13" class="text-slate-400" />
            <span>{{ post.answer_count }}</span>
          </div>

          <!-- Date -->
          <span class="text-xs text-slate-400">
            {{ new Date(post.created_at).toLocaleDateString("az") }}
          </span>

          <!-- Delete -->
          <div class="flex justify-end">
            <n-button
              quaternary
              circle
              size="small"
              type="error"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="openDeletePost(post.id)"
            >
              <template #icon><Trash2 :size="14" /></template>
            </n-button>
          </div>
        </div>

        <!-- Expanded answers -->
        <Transition name="accordion">
          <div
            v-if="expandedPostId === post.id"
            class="bg-slate-50/80 border-t border-slate-100"
          >
            <div class="py-4 pr-6 pl-14 relative">
              <!-- Hierarchy Line: Sol tərəfdəki şaquli xətt -->
              <div
                class="absolute left-7 top-0 bottom-6 w-0.5 bg-slate-200 rounded-full"
              ></div>

              <!-- Header: Sadəcə başlıq -->
              <div class="flex items-center gap-2 mb-4">
                <MessageSquare :size="14" class="text-indigo-500" />
                <span
                  class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Müzakirə ({{ answers.length }} cavab)
                </span>
              </div>

              <!-- Answers list -->
              <div
                v-if="answersLoading"
                class="flex items-center gap-2 py-2 text-slate-400 text-sm"
              >
                <n-spin size="small" /> Yüklənir...
              </div>

              <div
                v-else-if="!answers.length"
                class="text-slate-400 text-sm italic"
              >
                Bu müzakirəyə hələ cavab yazılmayıb.
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="answer in answers"
                  :key="answer.id"
                  class="relative bg-white border border-slate-100 rounded-xl p-3 shadow-sm group/answer transition-all hover:border-indigo-200"
                >
                  <div
                    class="absolute -left-7 top-1/2 w-7 h-0.5 bg-slate-200"
                  ></div>

                  <div class="flex justify-between items-start gap-4">
                    <div class="flex gap-3">
                      <!-- Balaca Avatar -->
                      <div
                        v-if="answer.author"
                        class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0"
                      >
                        {{ answer.author.fullname[0] }}
                      </div>

                      <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-slate-900">{{
                            answer.author?.fullname || "Anonim"
                          }}</span>
                          <span class="text-[10px] text-slate-400 font-mono"
                            >#{{ answer.id }}</span
                          >
                          <span class="text-[10px] text-slate-400"
                            >•
                            {{
                              new Date(answer.created_at).toLocaleDateString(
                                "az"
                              )
                            }}</span
                          >
                        </div>
                        <p class="text-sm text-slate-600 leading-relaxed">
                          {{ answer.body }}
                        </p>
                      </div>
                    </div>

                    <!-- Delete Action -->
                    <n-button
                      quaternary
                      circle
                      size="tiny"
                      type="error"
                      class="opacity-0 group-hover/answer:opacity-100 transition-opacity"
                      @click="openDeleteAnswer(answer.id)"
                    >
                      <template #icon><Trash2 :size="14" /></template>
                    </n-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Empty -->
      <div
        v-if="!paginatedPosts.length"
        class="py-16 text-center text-slate-400 text-sm"
      >
        Post tapılmadı
      </div>

      <!-- Pagination -->
      <div
        v-if="posts.length > pageSize"
        class="flex justify-center py-4 border-t border-slate-100"
      >
        <n-pagination
          v-model:page="currentPage"
          :page-count="Math.ceil(posts.length / pageSize)"
          size="small"
        />
      </div>
    </div>

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
import { ref, computed } from "vue";
import { NButton, NSpin, NPagination, useMessage } from "naive-ui";
import {
  Search,
  RefreshCw,
  Trash2,
  MessageSquare,
  ChevronRight,
} from "lucide-vue-next";
import {
  useForumPosts,
  useForumAnswers,
  useDeleteForumPost,
  useDeleteForumAnswer,
} from "../composables/useForum";
import type { ForumPost } from "@icheck/api-contracts";

const message = useMessage();

const postSearch = ref("");
const postQuery = computed(() => ({
  ...(postSearch.value ? { search: postSearch.value } : {}),
}));

const {
  posts,
  isLoading: postsLoading,
  error: postsError,
  refresh: refreshPosts,
} = useForumPosts(postQuery);

const currentPage = ref(1);
const pageSize = 10;
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return posts.value.slice(start, start + pageSize);
});

const expandedPostId = ref<number | null>(null);
const selectedPostId = computed(() => expandedPostId.value);

const {
  answers,
  isLoading: answersLoading,
  error: answersError,
  refresh: refreshAnswers,
} = useForumAnswers(selectedPostId);

const togglePost = (post: ForumPost) => {
  if (expandedPostId.value === post.id) {
    expandedPostId.value = null;
  } else {
    expandedPostId.value = post.id;
  }
};

const showDeletePostModal = ref(false);
const deletingPostId = ref<number | null>(null);
const { deletePost, loading: deletePostLoading } = useDeleteForumPost();

const openDeletePost = (id: number) => {
  deletingPostId.value = id;
  showDeletePostModal.value = true;
};

const handleDeletePost = async () => {
  if (!deletingPostId.value) return;
  try {
    await deletePost(deletingPostId.value);
    message.success("Post silindi");
    showDeletePostModal.value = false;
    if (expandedPostId.value === deletingPostId.value)
      expandedPostId.value = null;
    await refreshPosts();
  } catch {
    message.error("Xəta baş verdi");
  }
};

const showDeleteAnswerModal = ref(false);
const deletingAnswerId = ref<number | null>(null);
const { deleteAnswer, loading: deleteAnswerLoading } = useDeleteForumAnswer();

const openDeleteAnswer = (id: number) => {
  deletingAnswerId.value = id;
  showDeleteAnswerModal.value = true;
};

const handleDeleteAnswer = async () => {
  if (!deletingAnswerId.value || !expandedPostId.value) return;
  try {
    await deleteAnswer(expandedPostId.value, deletingAnswerId.value);
    message.success("Cavab silindi");
    showDeleteAnswerModal.value = false;
    await refreshAnswers();
  } catch {
    message.error("Xəta baş verdi");
  }
};
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  max-height: 600px;
  opacity: 1;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>