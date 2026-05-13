<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          FAQ
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage frequently asked questions.
        </p>
      </div>

      <n-button type="primary" size="large" class="!rounded-xl font-bold px-8" @click="openCreateModal">
        <template #icon>
          <Plus :size="20" :stroke-width="2.5" />
        </template>
        Create FAQ
      </n-button>
    </div>

    <n-card :bordered="false" class="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <div class="mb-6 flex items-center gap-4 p-1">
        <n-button quaternary circle size="medium" class="ml-auto" @click="refresh()">
          <template #icon>
            <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" class="text-slate-500" />
          </template>
        </n-button>
      </div>

      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 6" :key="i" class="h-12 bg-slate-50 rounded-lg animate-pulse" />
      </div>

      <n-alert v-else-if="error" type="error">Məlumat yüklənmədi</n-alert>

      <n-data-table
        v-else
        :columns="columns"
        :data="faqItems"
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
      :title="editingFaq ? 'Edit FAQ' : 'Create FAQ'"
      class="max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
      style="width: min(720px, calc(100vw - 24px));"
    >
      <div class="p-2 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
        <n-tabs v-model:value="activeTab" type="segment" animated @update:value="handleTabChange">
          <n-tab-pane name="az" tab="AZ">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Sual (AZ)">
                <n-input v-model:value="form.question.az" size="large" placeholder="Sual..." />
              </n-form-item>
              <n-form-item label="Cavab (AZ)">
                <n-input v-model:value="form.answer.az" type="textarea" :rows="4" placeholder="Cavab..." />
              </n-form-item>
            </div>
          </n-tab-pane>

          <n-tab-pane name="en" tab="EN">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Question (EN)">
                <n-input v-model:value="form.question.en" size="large" placeholder="Question..." />
              </n-form-item>
              <n-form-item label="Answer (EN)">
                <n-input v-model:value="form.answer.en" type="textarea" :rows="4" placeholder="Answer..." />
              </n-form-item>
            </div>
          </n-tab-pane>

          <n-tab-pane name="ru" tab="RU">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Вопрос (RU)">
                <n-input v-model:value="form.question.ru" size="large" placeholder="Вопрос..." />
              </n-form-item>
              <n-form-item label="Ответ (RU)">
                <n-input v-model:value="form.answer.ru" type="textarea" :rows="4" placeholder="Ответ..." />
              </n-form-item>
            </div>
          </n-tab-pane>
        </n-tabs>

        <n-form-item label="Sort order" class="border-t pt-4">
          <n-input-number v-model:value="form.sort_order" :min="0" size="large" class="w-full" />
        </n-form-item>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showModal = false">Ləğv et</n-button>
          <n-button type="primary" class="rounded-xl px-8" :loading="submitLoading" @click="handleSubmit">
            {{ editingFaq ? "Yenilə" : "Yadda saxla" }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete FAQ"
      content="Bu sualı silmək istədiyinizə əminsiniz?"
      positive-text="Sil"
      negative-text="Ləğv et"
      :loading="deleteLoading"
      @positive-click="handleDelete"
      @negative-click="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, reactive, watch } from "vue";
import {
  NButton,
  NSpace,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { Plus, RefreshCw, Edit, Trash2 } from "lucide-vue-next";
import {
  useFaq,
  useFaqActions,
  type FaqItem,
} from "../composables/useFaq";

const message = useMessage();

const { faqItems, isLoading, error, refresh } = useFaq();
const { getFaq, createFaq, updateFaq, deleteFaq } = useFaqActions();

watch(
  () => faqItems.value,
  () => {},
  { immediate: true }
);

watch(
  () => true,
  () => {
    refresh();
  },
  { immediate: true }
);

const showModal = ref(false);
const showDeleteModal = ref(false);
const editingFaq = ref<FaqItem | null>(null);
const deletingId = ref<number | null>(null);
const activeTab = ref<"az" | "en" | "ru">("az");
const loadedLangs = ref(new Set<string>());
const isLoadingLang = ref(false);
const submitLoading = ref(false);
const deleteLoading = ref(false);

const form = reactive({
  question: { az: "", en: "", ru: "" },
  answer: { az: "", en: "", ru: "" },
  sort_order: 0,
});

const resetForm = () => {
  form.question = { az: "", en: "", ru: "" };
  form.answer = { az: "", en: "", ru: "" };
  form.sort_order = 0;
};

const fetchLangData = async (id: number, lang: "az" | "en" | "ru") => {
  if (loadedLangs.value.has(lang)) return;

  isLoadingLang.value = true;
  try {
    const response = await getFaq(id, lang);
    const faq = response.data;

    form.question[lang] = faq.question ?? "";
    form.answer[lang] = faq.answer ?? "";

    if (!loadedLangs.value.size) {
      form.sort_order = faq.sort_order ?? 0;
    }

    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} dilində məlumat yüklənmədi`);
  } finally {
    isLoadingLang.value = false;
  }
};

const openCreateModal = () => {
  editingFaq.value = null;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: FaqItem) => {
  editingFaq.value = row;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;

  await fetchLangData(row.id, "az");
  await Promise.all([
    fetchLangData(row.id, "en"),
    fetchLangData(row.id, "ru"),
  ]);
};

const handleTabChange = async (lang: string) => {
  activeTab.value = lang as "az" | "en" | "ru";

  if (editingFaq.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingFaq.value.id, lang as "az" | "en" | "ru");
  }
};

const handleSubmit = async () => {
  if (
    !form.question.az.trim() ||
    !form.question.en.trim() ||
    !form.question.ru.trim()
  ) {
    message.warning("Sual hər 3 dildə daxil edilməlidir");
    return;
  }

  if (
    !form.answer.az.trim() ||
    !form.answer.en.trim() ||
    !form.answer.ru.trim()
  ) {
    message.warning("Cavab hər 3 dildə daxil edilməlidir");
    return;
  }

  const payload = {
    question: {
      az: form.question.az.trim(),
      en: form.question.en.trim(),
      ru: form.question.ru.trim(),
    },
    answer: {
      az: form.answer.az.trim(),
      en: form.answer.en.trim(),
      ru: form.answer.ru.trim(),
    },
    sort_order: form.sort_order,
  };

  submitLoading.value = true;
  try {
    if (editingFaq.value) {
      await updateFaq(editingFaq.value.id, payload);
      message.success("FAQ yeniləndi");
    } else {
      await createFaq(payload);
      message.success("FAQ yaradıldı");
    }

    showModal.value = false;
    await refresh();
  } catch (err: any) {
    message.error(err?.data?.error || "Xəta baş verdi");
  } finally {
    submitLoading.value = false;
  }
};

const openDeleteModal = (id: number) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deletingId.value) return;

  deleteLoading.value = true;
  try {
    await deleteFaq(deletingId.value);
    message.success("FAQ silindi");
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error("Silinmə zamanı xəta baş verdi");
  } finally {
    deleteLoading.value = false;
  }
};

const columns: DataTableColumns<FaqItem> = [
  {
    title: "ID",
    key: "id",
    width: 80,
    render: (row) =>
      h("span", { class: "text-slate-400 font-mono text-xs font-bold" }, `#${row.id}`),
  },
  {
    title: "Question",
    key: "question",
    render: (row) =>
      h("div", { class: "flex flex-col" }, [
        h("span", { class: "font-bold text-slate-800 text-sm" }, row.question || "—"),
        h("span", { class: "text-xs text-slate-400 line-clamp-1" }, row.answer || "—"),
      ]),
  },
  {
    title: "Sort",
    key: "sort_order",
    width: 100,
    render: (row) =>
      h("span", { class: "text-slate-600 text-sm" }, String(row.sort_order ?? 0)),
  },
  {
    title: "Actions",
    key: "actions",
    align: "right",
    render: (row) =>
      h(NSpace, { justify: "end" }, {
        default: () => [
          h(NButton, {
            size: "small",
            quaternary: true,
            circle: true,
            class: "hover:bg-indigo-50 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all",
            onClick: () => openEditModal(row),
          }, { default: () => h(Edit, { size: 16 }) }),
          h(NButton, {
            size: "small",
            quaternary: true,
            circle: true,
            type: "error",
            class: "hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all",
            onClick: () => openDeleteModal(row.id),
          }, { default: () => h(Trash2, { size: 16 }) }),
        ],
      }),
  },
];
</script>

<style>
.modern-table .n-data-table-td {
  vertical-align: middle;
  padding: 12px 16px;
  background-color: transparent !important;
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
