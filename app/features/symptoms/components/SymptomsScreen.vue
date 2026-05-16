<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ t("symptoms.title") }}
        </h2>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create Symptom
      </n-button>
    </div>

    <!-- Table Card -->
    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <div class="mb-6 flex flex-wrap items-center gap-4 p-1">
        <n-input
          v-model:value="searchQuery"
          placeholder="Search symptoms..."
          size="large"
          class="rounded-xl max-w-sm"
          clearable
        >
          <template #prefix
            ><Search :size="18" class="text-slate-400"
          /></template>
        </n-input>

        <n-select
          v-model:value="filterGender"
          :options="genderOptions"
          placeholder="Gender"
          size="large"
          clearable
          class="w-36"
        />

        <n-select
          v-model:value="filterSide"
          :options="sideOptions"
          placeholder="Side"
          size="large"
          clearable
          class="w-36"
        />

        <n-button
          quaternary
          circle
          size="medium"
          class="ml-auto"
          @click="refresh()"
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
        :data="symptoms"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
        :scroll-x="800"
      />
    </n-card>

    <!-- Create / Edit Modal -->
    <!-- Create / Edit Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingSymptom ? 'Edit Symptom' : 'Create Symptom'"
      class="max-w-lg rounded-3xl overflow-hidden shadow-2xl"
    >
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
                  placeholder="Simptom adı..."
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
                  placeholder="Symptom name..."
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
                  placeholder="Название симптома..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>
      </n-tabs>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <n-form-item label="Gender *">
          <n-select
            v-model:value="modalForm.gender"
            :options="genderOptions"
            size="large"
          />
        </n-form-item>

        <n-form-item label="Side *">
          <n-select
            v-model:value="modalForm.side"
            :options="sideOptions"
            size="large"
          />
        </n-form-item>
      </div>

      <n-form-item label="Body Part *">
        <n-input
          v-model:value="modalForm.body_part"
          placeholder="məs. head, chest..."
          size="large"
          class="rounded-xl"
        />
      </n-form-item>

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
            {{ editingSymptom ? "Update" : "Save" }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Symptom"
      content="Bu simptomu silmək istədiyinizə əminsiniz?"
      positive-text="Sil"
      negative-text="Ləğv et"
      :loading="deleteLoading"
      @positive-click="handleDelete"
      @negative-click="showDeleteModal = false"
    />
    <n-modal
  v-model:show="showViewModal"
  preset="card"
  title="Symptom Details"
  class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
>
  <div v-if="viewingSymptom" class="flex flex-col gap-4 py-2">

    <!-- Başlıq -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <p class="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest">Simptom</p>
        <h3 class="text-2xl font-bold text-yellow-900">{{ viewingSymptom.title }}</h3>
      </div>
      <n-tag type="warning" size="small" round class="font-mono">#{{ viewingSymptom.id }}</n-tag>
    </div>

    <!-- Info grid -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-yellow-50/60 border border-yellow-100 p-4 rounded-2xl">
        <p class="text-[10px] uppercase text-yellow-500 font-bold mb-1">Gender</p>
        <n-tag
          :type="viewingSymptom.gender === 'male' ? 'info' : viewingSymptom.gender === 'female' ? 'warning' : 'default'"
          round size="small" :bordered="false"
          style="font-weight:800;font-size:10px;text-transform:uppercase;"
        >
          {{ viewingSymptom.gender }}
        </n-tag>
      </div>
      <div class="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
        <p class="text-[10px] uppercase text-slate-400 font-bold mb-1">Side</p>
        <span class="font-bold text-slate-700 capitalize">{{ viewingSymptom.side }}</span>
      </div>
    </div>

    <!-- Body Part -->
    <div class="bg-orange-50/60 border border-orange-100 p-4 rounded-2xl">
      <p class="text-[10px] uppercase text-orange-500 font-bold mb-2">Body Part</p>
      <span class="font-bold text-orange-900">{{ viewingSymptom.body_part }}</span>
    </div>

    <!-- Tarixlər -->
    <div class="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-400">Yaradılma:</span>
        <span class="text-slate-700 font-semibold">
          {{ new Date(viewingSymptom.created_at).toLocaleDateString('az-AZ') }}
        </span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-400">Son yenilənmə:</span>
        <span class="text-slate-700 font-semibold">
          {{ new Date(viewingSymptom.updated_at).toLocaleDateString('az-AZ') }}
        </span>
      </div>
    </div>
  </div>

  <template #action>
    <div class="flex justify-end gap-3">
      <n-button ghost @click="showViewModal = false">Bağla</n-button>
      <n-button type="primary"
        @click="() => { showViewModal = false; openEditModal(viewingSymptom!) }">
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
  NTag,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { Plus, Search, RefreshCw, Edit, Trash2, Eye } from "lucide-vue-next";
import {
  useSymptoms,
  useCreateSymptom,
  useUpdateSymptom,
  useDeleteSymptom,
} from "../composables/useSymptoms";
import type { Symptom } from "@icheck/api-contracts";
const { t } = useI18n();

const { $api } = useNuxtApp();

const message = useMessage();

const searchQuery = ref("");
const filterGender = ref<string | null>(null);
const filterSide = ref<string | null>(null);
const showViewModal = ref(false);
const viewingSymptom = ref<Symptom | null>(null);

const openViewModal = (row: Symptom) => {
  viewingSymptom.value = row;
  showViewModal.value = true;
};
const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Both", value: "both" },
];

const sideOptions = [
  { label: "Front", value: "front" },
  { label: "Back", value: "back" },
];

const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
  ...(filterGender.value ? { gender: filterGender.value } : {}),
  ...(filterSide.value ? { side: filterSide.value } : {}),
}));

const { symptoms, isLoading, error, refresh } = useSymptoms(query);

const showModal = ref(false);
const showDeleteModal = ref(false);
const editingSymptom = ref<Symptom | null>(null);
const deletingId = ref<number | null>(null);
const activeTab = ref("az");
const isLoadingLang = ref(false);
const loadedLangs = ref(new Set<string>());

const modalForm = reactive({
  title: { az: "", en: "", ru: "" },
  gender: "male" as "male" | "female" | "both",
  side: "front" as "front" | "back",
  body_part: "",
});

const resetForm = () => {
  modalForm.title = { az: "", en: "", ru: "" };
  modalForm.gender = "male";
  modalForm.side = "front";
  modalForm.body_part = "";
};

const { createSymptom, loading: createLoading } = useCreateSymptom();
const { updateSymptom, loading: updateLoading } = useUpdateSymptom();
const { deleteSymptom, loading: deleteLoading } = useDeleteSymptom();

const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return;

  isLoadingLang.value = true;

  try {
    const data = await $api<{ data: Symptom }>(`/admin/symptoms/${id}/`, {
      headers: {
        "Accept-Language": lang,
      },
    });

    modalForm.title[lang as "az" | "en" | "ru"] = data.data.title;
    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} dilində məlumat yüklənmədi`);
  } finally {
    isLoadingLang.value = false;
  }
};
const handleTabChange = async (lang: string) => {
  activeTab.value = lang;

  if (editingSymptom.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingSymptom.value.id, lang);
  }
};

const openCreateModal = () => {
  editingSymptom.value = null;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: Symptom) => {
  editingSymptom.value = row;
  resetForm();
  loadedLangs.value = new Set();
  activeTab.value = "az";

  modalForm.gender = row.gender;
  modalForm.side = row.side;
  modalForm.body_part = row.body_part;

  showModal.value = true;
  await fetchLangData(row.id, "az");
};

const openDeleteModal = (id: number) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const handleSubmit = async () => {
  const clean = (obj: Record<string, string>) => {
    const result: Record<string, string> = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (value?.trim()) result[key] = value.trim();
    });

    return Object.keys(result).length ? result : null;
  };

  const titleData = clean(modalForm.title);

  if (!titleData) {
    message.warning("Ən azı bir dildə simptom adı daxil edin");
    return;
  }

  if (!modalForm.body_part.trim()) {
    message.warning("Body part boş ola bilməz");
    return;
  }

  const payload = {
    title: titleData,
    gender: modalForm.gender,
    side: modalForm.side,
    body_part: modalForm.body_part.trim(),
  };

  try {
    if (editingSymptom.value) {
      await updateSymptom(editingSymptom.value.id, payload);
      message.success("Simptom yeniləndi");
    } else {
      await createSymptom(payload);
      message.success("Simptom yaradıldı");
    }

    showModal.value = false;
    clearNuxtData("symptoms-list");
    await refresh();
  } catch {
    message.error("Xəta baş verdi");
  }
};

const handleDelete = async () => {
  if (!deletingId.value) return;

  try {
    await deleteSymptom(deletingId.value);
    message.success("Simptom silindi");
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error("Silinmə zamanı xəta baş verdi");
  }
};

const columns: DataTableColumns<Symptom> = [
  {
    title: "ID",
    key: "id",
    width: 80,
    render: (row) =>
      h(
        "span",
        { class: "text-slate-400 font-mono text-xs font-bold" },
        `#${row.id}`
      ),
  },
  {
    title: "Symptom Name",
    key: "title",
    sorter: "default",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#FEFCE8",
            style: "color:#CA8A04;font-weight:800;border:1px solid #FEF9C3",
          },
          { default: () => row.title[0] }
        ),
        h("span", { class: "font-bold text-slate-800" }, row.title),
      ]),
  },
  {
    title: "Gender",
    key: "gender",
    render: (row) =>
      h(
        NTag,
        {
          type:
            row.gender === "male"
              ? "info"
              : row.gender === "female"
              ? "warning"
              : "default",
          round: true,
          size: "small",
          bordered: false,
          style: "font-weight:800;font-size:10px;text-transform:uppercase;",
        },
        { default: () => row.gender }
      ),
  },
  {
    title: "Side",
    key: "side",
    render: (row) =>
      h("span", { class: "text-slate-600 text-sm capitalize" }, row.side),
  },
  {
    title: "Body Part",
    key: "body_part",
    render: (row) =>
      h("span", { class: "text-slate-600 text-sm" }, row.body_part),
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
  background-color: rgba(202, 138, 4, 0.02) !important;
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