<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Pages
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage static content pages.
        </p>
      </div>

      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        Create Page
      </n-button>
    </div>

    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <div class="mb-6 flex items-center gap-4 p-1">
        <n-input
          v-model:value="slugInput"
          placeholder="Search by slug..."
          size="large"
          class="rounded-xl max-w-sm"
          clearable
          @update:value="onSlugInputChange"
          @clear="clearSlugSearch"
        >
          <template #prefix>
            <Search :size="18" class="text-slate-400" />
          </template>
        </n-input>

        <n-button
          quaternary
          circle
          size="medium"
          class="ml-auto"
          @click="handleRefresh"
        >
          <template #icon>
            <RefreshCw
              :size="18"
              :class="{ 'animate-spin': isLoading }"
              class="text-slate-500"
            />
          </template>
        </n-button>
      </div>

      <div v-if="isLoading" class="space-y-3">
        <div
          v-for="i in 6"
          :key="i"
          class="h-12 bg-slate-50 rounded-lg animate-pulse"
        />
      </div>

      <n-alert v-else-if="error" type="error">Məlumat yüklənmədi</n-alert>

      <n-data-table
        v-else
        :columns="columns"
        :data="tableData"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
      />
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingSlug ? 'Edit Page' : 'Create Page'"
      class="max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="p-2 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <n-form-item label="Slug *">
          <n-input
            v-model:value="form.slug"
            :disabled="!!editingSlug"
            placeholder="about"
            size="large"
          />
        </n-form-item>

        <n-tabs type="segment" animated>
          <n-tab-pane name="az" tab="AZ">
            <n-form-item label="Başlıq *">
              <n-input v-model:value="form.title.az" size="large" />
            </n-form-item>
            <n-form-item label="Mətn *">
              <n-input v-model:value="form.body.az" type="textarea" :rows="8" />
            </n-form-item>
          </n-tab-pane>

          <n-tab-pane name="en" tab="EN">
            <n-form-item label="Title *">
              <n-input v-model:value="form.title.en" size="large" />
            </n-form-item>
            <n-form-item label="Body *">
              <n-input v-model:value="form.body.en" type="textarea" :rows="8" />
            </n-form-item>
          </n-tab-pane>

          <n-tab-pane name="ru" tab="RU">
            <n-form-item label="Заголовок *">
              <n-input v-model:value="form.title.ru" size="large" />
            </n-form-item>
            <n-form-item label="Текст *">
              <n-input v-model:value="form.body.ru" type="textarea" :rows="8" />
            </n-form-item>
          </n-tab-pane>
        </n-tabs>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost @click="showModal = false">Ləğv et</n-button>
          <n-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            {{ editingSlug ? "Yenilə" : "Yarat" }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from "vue";
import {
  NButton,
  NSpace,
  NTag,
  useDialog,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { Edit, RefreshCw, Search, Trash2 } from "lucide-vue-next";
import {
  usePageActions,
  usePages,
  type PageItem,
  type PagePayload,
} from "../composables/usePages";

const message = useMessage();
const dialog = useDialog();

const { pages, isLoading, error, refresh } = usePages();
const { getPage, createPage, updatePage, deletePage } = usePageActions();

const showModal = ref(false);
const submitLoading = ref(false);
const editingSlug = ref<string | null>(null);
const slugInput = ref("");

let slugSearchTimer: ReturnType<typeof setTimeout> | null = null;

const filteredPages = computed(() => {
  if (!slugInput.value.trim()) return pages.value;
  return pages.value.filter((p) =>
    p.slug.toLowerCase().includes(slugInput.value.toLowerCase())
  );
});

const tableData = computed(() => filteredPages.value);

const onSlugInputChange = () => {
  if (slugSearchTimer) clearTimeout(slugSearchTimer);
  slugSearchTimer = setTimeout(() => {}, 300);
};

const clearSlugSearch = () => {
  slugInput.value = "";
};

const handleRefresh = async () => {
  slugInput.value = "";
  await refresh();
};

const form = reactive<PagePayload>({
  slug: "",
  title: { az: "", en: "", ru: "" },
  body: { az: "", en: "", ru: "" },
});

const resetForm = () => {
  form.slug = "";
  form.title = { az: "", en: "", ru: "" };
  form.body = { az: "", en: "", ru: "" };
};

const openCreateModal = () => {
  editingSlug.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = async (row: PageItem) => {
  editingSlug.value = row.slug;
  resetForm();
  form.slug = row.slug;
  showModal.value = true;

  try {
    const langs = ["az", "en", "ru"] as const;

    await Promise.all(
      langs.map(async (lang) => {
        const res = await getPage(row.slug, lang);
        form.title[lang] = res.data.title;
        form.body[lang] = res.data.body;
      })
    );
  } catch {
    message.error("Səhifə məlumatları yüklənmədi");
  }
};

const handleSubmit = async () => {
  if (!form.slug || !form.title.az || !form.body.az) {
    message.warning("Məcburi xanaları doldurun");
    return;
  }

  submitLoading.value = true;

  try {
    if (editingSlug.value) {
      await updatePage(editingSlug.value, {
        title: form.title,
        body: form.body,
      });
      message.success("Səhifə yeniləndi");
    } else {
      await createPage(form);
      message.success("Səhifə yaradıldı");
    }

    showModal.value = false;
    await refresh();
  } catch (err: any) {
    message.error(err?.data?.detail || err?.data?.error || "Xəta baş verdi");
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = (row: PageItem) => {
  dialog.warning({
    title: "Silmək istədiyinizə əminsiniz?",
    content: row.slug,
    positiveText: "Sil",
    negativeText: "Ləğv et",
    onPositiveClick: async () => {
      try {
        await deletePage(row.slug);
        message.success("Səhifə silindi");
        await refresh();
      } catch (err: any) {
        message.error(err?.data?.detail || "Xəta baş verdi");
      }
    },
  });
};

const columns: DataTableColumns<PageItem> = [
  {
    title: "Slug",
    key: "slug",
    render: (row) =>
      h(
        NTag,
        { round: true, bordered: false, type: "info" },
        { default: () => row.slug }
      ),
  },
  {
    title: "Title",
    key: "title",
    render: (row) =>
      h(
        "span",
        { class: "font-bold text-slate-800 text-sm" },
        row.title || "—"
      ),
  },
  {
    title: "Actions",
    key: "actions",
    align: "right",
    render: (row) =>
      h(
        NSpace,
        { justify: "end" },
        {
          default: () => [
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                circle: true,
                onClick: () => openEditModal(row),
              },
              {
                default: () => h(Edit, { size: 16 }),
              }
            ),
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                circle: true,
                type: "error",
                onClick: () => handleDelete(row),
              },
              {
                default: () => h(Trash2, { size: 16 }),
              }
            ),
          ],
        }
      ),
  },
];
</script>
