<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Diagnoses
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage diagnoses in the healthcare network.
        </p>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create Diagnosis
      </n-button>
    </div>

    <!-- Table Card -->
    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <div class="mb-6 flex items-center justify-between gap-4 p-1">
        <n-input
          v-model:value="searchQuery"
          placeholder="Search diagnoses..."
          size="large"
          class="rounded-xl max-w-sm"
          clearable
        >
          <template #prefix
            ><Search :size="18" class="text-slate-400"
          /></template>
        </n-input>
        <n-button quaternary circle size="medium" @click="refresh()">
          <template #icon>
            <RefreshCw
              :size="18"
              :class="{ 'animate-spin': isLoading }"
              class="text-slate-500"
            />
          </template>
        </n-button>
      </div>

      <div v-if="isLoading" class="space-y-4">
        <div
          v-for="i in 6"
          :key="i"
          class="h-10 bg-slate-50 rounded-lg animate-pulse"
        />
      </div>
      <n-alert v-else-if="error" type="error">Məlumat yüklənmədi</n-alert>
      <n-data-table
        v-else
        :columns="columns"
        :data="diagnoses"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
      />
    </n-card>

    <!-- Create / Edit Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingDiagnosis ? 'Edit Diagnosis' : 'Create Diagnosis'"
      class="max-w-lg rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="p-2 flex flex-col gap-4">
        <n-form-item label="ICD Kodu *">
          <n-input
            v-model:value="modalForm.ic_code"
            placeholder="məs. A00, B01..."
            size="large"
            class="rounded-xl"
          />
        </n-form-item>
      </div>

      <n-tabs
        type="segment"
        animated
        v-model:value="activeTab"
        @update:value="handleTabChange"
      >
        <n-tab-pane name="az" tab="AZ">
          <n-spin :show="isLoadingLang && activeTab === 'az'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Ad (AZ)">
                <n-input
                  v-model:value="modalForm.title.az"
                  placeholder="Diaqnoz adı..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>
        <n-tab-pane name="en" tab="EN">
          <n-spin :show="isLoadingLang && activeTab === 'en'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Name (EN)">
                <n-input
                  v-model:value="modalForm.title.en"
                  placeholder="Diagnosis name..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>
        <n-tab-pane name="ru" tab="RU">
          <n-spin :show="isLoadingLang && activeTab === 'ru'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Название (RU)">
                <n-input
                  v-model:value="modalForm.title.ru"
                  placeholder="Название диагноза..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>
      </n-tabs>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showModal = false"
            >Cancel</n-button
          >
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="createLoading || updateLoading"
            @click="handleSubmit"
          >
            {{ editingDiagnosis ? "Update" : "Save" }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Diagnosis"
      content="Bu diaqnozu silmək istədiyinizə əminsiniz?"
      positive-text="Sil"
      negative-text="Ləğv et"
      :loading="deleteLoading"
      @positive-click="handleDelete"
      @negative-click="showDeleteModal = false"
    />
    <!-- View Modal -->
    <n-modal
      v-model:show="showViewModal"
      preset="card"
      title="Diagnosis Details"
      class="max-w-lg rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="viewingDiagnosis" class="p-2 flex flex-col gap-4">
        <div class="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
          <span class="font-mono font-bold text-indigo-600 text-lg">{{
            viewingDiagnosis.ic_code
          }}</span>
        </div>
        <n-descriptions bordered :column="1" size="small">
          <n-descriptions-item label="ID">
            #{{ viewingDiagnosis.id }}
          </n-descriptions-item>
          <n-descriptions-item label="ICD Kodu">
            {{ viewingDiagnosis.ic_code }}
          </n-descriptions-item>
          <n-descriptions-item label="Adı">
            {{ viewingDiagnosis.title }}
          </n-descriptions-item>
        </n-descriptions>
      </div>
      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost @click="showViewModal = false">Bağla</n-button>
          <n-button
            type="primary"
            @click="() => { showViewModal = false; openEditModal(viewingDiagnosis!) }"
          >
            Redaktə et
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, reactive } from "vue";
import {
  NButton,
  NSpace,
  NAvatar,
  NSpin,
  NDescriptions,
  NDescriptionsItem,
  useMessage,
  type DataTableColumns,
} from "naive-ui";

import { Plus, Search, RefreshCw, Edit, Trash2, Eye } from "lucide-vue-next";
import {
  useDiagnoses,
  useGetDiagnosis,
  useCreateDiagnosis,
  useUpdateDiagnosis,
  useDeleteDiagnosis,
} from "../composables/useDiagnoses";
import type { Diagnosis } from "@icheck/api-contracts";

const message = useMessage();

const searchQuery = ref("");
const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
}));

const { diagnoses, isLoading, error, refresh } = useDiagnoses(query);

// ---- Modal state ----
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingDiagnosis = ref<Diagnosis | null>(null);
const deletingId = ref<number | null>(null);
const activeTab = ref("az");
const isLoadingLang = ref(false);
const loadedLangs = ref(new Set<string>());

const modalForm = reactive({
  ic_code: "",
  title: { az: "", en: "", ru: "" },
});

const resetForm = () => {
  modalForm.ic_code = "";
  modalForm.title = { az: "", en: "", ru: "" };
};

// ---- Composables ----
const { getDiagnosis } = useGetDiagnosis();
const { createDiagnosis, loading: createLoading } = useCreateDiagnosis();
const { updateDiagnosis, loading: updateLoading } = useUpdateDiagnosis();
const { deleteDiagnosis, loading: deleteLoading } = useDeleteDiagnosis();
const showViewModal = ref(false);
const viewingDiagnosis = ref<Diagnosis | null>(null);

const openViewModal = (row: Diagnosis) => {
  viewingDiagnosis.value = row;
  showViewModal.value = true;
};
// ---- Lang fetch ----
const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return;
  isLoadingLang.value = true;
  try {
    const data = await getDiagnosis(id, lang);
    modalForm.title[lang as "az" | "en" | "ru"] = data.title;
    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} dilində məlumat yüklənmədi`);
  } finally {
    isLoadingLang.value = false;
  }
};

const handleTabChange = async (lang: string) => {
  activeTab.value = lang;
  if (editingDiagnosis.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingDiagnosis.value.id, lang);
  }
};

// ---- Handlers ----
const openCreateModal = () => {
  editingDiagnosis.value = null;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: Diagnosis) => {
  editingDiagnosis.value = row;
  resetForm();
  modalForm.ic_code = row.ic_code;
  loadedLangs.value = new Set();
  activeTab.value = "az";
  showModal.value = true;
  await fetchLangData(row.id, "az");
};

const openDeleteModal = (id: number) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const handleSubmit = async () => {
  if (!modalForm.ic_code.trim()) {
    message.warning("ICD kodu boş ola bilməz");
    return;
  }

  const titleObj: Record<string, string> = {};
  if (modalForm.title.az?.trim()) titleObj.az = modalForm.title.az;
  if (modalForm.title.en?.trim()) titleObj.en = modalForm.title.en;
  if (modalForm.title.ru?.trim()) titleObj.ru = modalForm.title.ru;

  if (Object.keys(titleObj).length === 0) {
    message.warning("Ən azı bir dildə ad daxil edin");
    return;
  }

  const payload = { ic_code: modalForm.ic_code, title: titleObj };

  try {
    if (editingDiagnosis.value) {
      await updateDiagnosis(editingDiagnosis.value.id, payload);
      message.success("Diaqnoz yeniləndi");
    } else {
      await createDiagnosis(payload);
      message.success("Diaqnoz yaradıldı");
    }
    showModal.value = false;
    clearNuxtData("admin-diagnoses-list");
    await refresh();
  } catch {
    message.error("Xəta baş verdi");
  }
};

const handleDelete = async () => {
  if (!deletingId.value) return;
  try {
    await deleteDiagnosis(deletingId.value);
    message.success("Diaqnoz silindi");
    showDeleteModal.value = false;
    clearNuxtData("admin-diagnoses-list");
    await refresh();
  } catch {
    message.error("Xəta baş verdi");
  }
};

// ---- Table ----
const columns: DataTableColumns<Diagnosis> = [
  {
    title: "ID",
    key: "id",
    width: 70,
    render: (row) =>
      h(
        "span",
        { class: "text-slate-400 font-mono text-xs font-bold" },
        `#${row.id}`
      ),
  },
  {
    title: "ICD Kodu",
    key: "ic_code",
    render: (row) =>
      h(
        "span",
        {
          class:
            "font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-sm",
        },
        row.ic_code
      ),
  },
  {
    title: "Diaqnoz adı",
    key: "title",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#F0F9FF",
            style: "color:#0369A1;font-weight:800;border:1px solid #BAE6FD",
          },
          { default: () => row.title[0] }
        ),
        h("span", { class: "font-bold text-slate-800" }, row.title),
      ]),
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
                class:
                  "hover:bg-blue-50 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all",
                onClick: () => openViewModal(row),
              },
              { default: () => h(Eye, { size: 16 }) }
            ),
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                circle: true,
                class:
                  "hover:bg-indigo-50 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all",
                onClick: () => openEditModal(row),
              },
              { default: () => h(Edit, { size: 16 }) }
            ),
            h(
              NButton,
              {
                size: "small",
                quaternary: true,
                circle: true,
                type: "error",
                class:
                  "hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all",
                onClick: () => openDeleteModal(row.id),
              },
              { default: () => h(Trash2, { size: 16 }) }
            ),
          ],
        }
      ),
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
  background-color: rgba(3, 105, 161, 0.02) !important;
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