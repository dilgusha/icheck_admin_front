<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Specializations
        </h2>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create Specialization
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
          placeholder="Search specializations..."
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
        :data="specializations"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
        :scroll-x="800"
      />
    </n-card>

    <!-- Create / Edit Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="
        editingSpecialization ? 'Edit Specialization' : 'Create Specialization'
      "
      class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
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
                  placeholder="İxtisas adı..."
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
                  placeholder="Specialization name..."
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
                  placeholder="Название специализации..."
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
            {{ editingSpecialization ? "Update" : "Save" }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Specialization"
      content="Bu ixtisası silmək istədiyinizə əminsiniz?"
      positive-text="Sil"
      negative-text="Ləğv et"
      :loading="deleteLoading"
      @positive-click="handleDelete"
      @negative-click="showDeleteModal = false"
    />

    <n-modal
      v-model:show="showViewModal"
      preset="card"
      title="Specialization Details"
      class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="viewingSpecialization" class="flex flex-col gap-4 py-2">
        <!-- Başlıq -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p
              class="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest"
            >
              İxtisas
            </p>
            <h3 class="text-2xl font-bold text-indigo-900">
              {{ viewingSpecialization.title }}
            </h3>
          </div>
          <n-tag type="primary" size="small" round class="font-mono">
            #{{ viewingSpecialization.id }}
          </n-tag>
        </div>

        <!-- Xəstəliklər sayı -->
        <div
          class="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-start gap-4 justify-between transition-all duration-300 hover:shadow-sm"
        >
          <!-- Sol tərəf: İkon və Başlıq -->
          <div class="flex items-start gap-3 min-w-[180px]">
            <div
              class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0"
            >
              <Activity :size="20" />
            </div>
            <div class="pt-1">
              <p
                class="text-[11px] uppercase tracking-wider text-amber-600 font-bold"
              >
                Əlaqəli xəstəliklər
              </p>
              <span
                class="text-xs text-amber-500/80 block mt-0.5"
                v-if="viewingSpecialization.disease_ids?.length"
              >
                ({{ viewingSpecialization.disease_ids.length }} xəstəlik)
              </span>
            </div>
          </div>

          <!-- Sağ tərəf: Teqlərin Siyahısı -->
          <div
            v-if="viewingSpecialization.disease_ids?.length"
            class="flex-1 w-full"
          >
            <n-spin :show="isLoadingDiseases" size="small">
              <div class="flex flex-wrap gap-1.5 justify-start sm:justify-end">
                <n-tag
                  v-for="id in viewingSpecialization.disease_ids"
                  :key="id"
                  size="medium"
                  type="warning"
                  round
                  :bordered="false"
                  class="!bg-amber-100/50 !text-amber-800 font-medium text-xs px-2.5 transition-all hover:!bg-amber-100"
                >
                  {{ diseaseMap[id] ?? `#${id}` }}
                </n-tag>
              </div>
            </n-spin>
          </div>
        </div>

        <!-- Tarixlər -->
        <div
          class="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100"
        >
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center gap-2 text-slate-400">
              <Calendar :size="14" />
              <span>Yaradılma:</span>
            </div>
            <span class="text-slate-700 font-semibold">
              {{
                new Date(viewingSpecialization.created_at).toLocaleDateString(
                  "az-AZ"
                )
              }}
            </span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center gap-2 text-slate-400">
              <Clock :size="14" />
              <span>Son yenilənmə:</span>
            </div>
            <span class="text-slate-700 font-semibold">
              {{
                new Date(viewingSpecialization.updated_at).toLocaleDateString(
                  "az-AZ"
                )
              }}
            </span>
          </div>
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost @click="showViewModal = false">Bağla</n-button>
          <n-button
            type="primary"
            @click="() => { showViewModal = false; openEditModal(viewingSpecialization!) }"
          >
            Redaktə et
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, reactive, watch } from "vue";
import {
  NButton,
  NSpace,
  NAvatar,
  NSpin,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import {
  Activity,
  Calendar,
  Clock,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
} from "lucide-vue-next";
import {
  useSpecializations,
  useCreateSpecialization,
  useUpdateSpecialization,
  useDeleteSpecialization,
} from "../composables/useSpecializations";
import type { Specialization } from "@icheck/api-contracts";
import { useDiseases } from "~/features/diseases/composables/useDiseases";
import type { SelectOption } from "naive-ui";


const message = useMessage();
const { $api } = useNuxtApp();
const { t } = useI18n();
const searchQuery = ref("");
const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
}));
const diseaseInitialOptions = computed<SelectOption[]>(() =>
  modalForm.disease_ids.map((id) => ({
    value: id,
    label: `Xəstəlik #${id}`,
  }))
);
const { diseases, isLoading: diseasesLoading } = useDiseases(ref({ per_page: 200 }));

const diseaseMap = computed(() =>
  Object.fromEntries((diseases.value ?? []).map((d) => [d.id, d.title]))
);
const { specializations, isLoading, error, refresh } =
  useSpecializations(query);

// ---- Modal state ----
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingSpecialization = ref<Specialization | null>(null);
const deletingId = ref<number | null>(null);
const activeTab = ref("az");
const isLoadingLang = ref(false);
const loadedLangs = ref(new Set<string>());
const showViewModal = ref(false);
const viewingSpecialization = ref(null);
const isLoadingDiseases = ref(false);

const openViewModal = async (row: Specialization) => {
  viewingSpecialization.value = row;
  showViewModal.value = true;
};

const modalForm = reactive({
  title: { az: "", en: "", ru: "" },
});

const resetForm = () => {
  modalForm.title = { az: "", en: "", ru: "" };
};

// ---- Composables ----
const { createSpecialization, loading: createLoading } =
  useCreateSpecialization();
const { updateSpecialization, loading: updateLoading } =
  useUpdateSpecialization();
const { deleteSpecialization, loading: deleteLoading } =
  useDeleteSpecialization();

// ---- Lang fetch ----
const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return;

  isLoadingLang.value = true;

  try {
    const data = await $api<{ data: Specialization }>(
      `/admin/specializations/${id}/`,
      {
        headers: {
          "Accept-Language": lang,
        },
      }
    );

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
  if (editingSpecialization.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingSpecialization.value.id, lang);
  }
};

// ---- Handlers ----
const openCreateModal = () => {
  editingSpecialization.value = null;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: Specialization) => {
  editingSpecialization.value = row;
  resetForm();
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
  const titleObj: Record<string, string> = {};
  if (modalForm.title.az?.trim()) titleObj.az = modalForm.title.az;
  if (modalForm.title.en?.trim()) titleObj.en = modalForm.title.en;
  if (modalForm.title.ru?.trim()) titleObj.ru = modalForm.title.ru;

  if (Object.keys(titleObj).length === 0) {
    message.warning("Ən azı bir dildə ad daxil edin");
    return;
  }

  try {
    if (editingSpecialization.value) {
      await updateSpecialization(editingSpecialization.value.id, {
        title: titleObj,
      });
      message.success("İxtisas yeniləndi");
    } else {
      await createSpecialization({ title: titleObj });
      message.success("İxtisas yaradıldı");
    }
    showModal.value = false;
    clearNuxtData("specializations-list");
    await refresh();
  } catch {
    message.error("Xəta baş verdi");
  }
};

const handleDelete = async () => {
  if (!deletingId.value) return;
  try {
    await deleteSpecialization(deletingId.value);
    message.success("İxtisas silindi");
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error("Silinmə zamanı xəta baş verdi");
  }
};

const columns: DataTableColumns<Specialization> = [
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
    title: "Specialization Name",
    key: "title",
    sorter: "default",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#FFF1F2",
            style: "color:#E11D48;font-weight:800;border:1px solid #FFE4E6",
          },
          { default: () => row.title[0] }
        ),
        h("span", { class: "font-bold text-slate-800" }, row.title),
      ]),
  },
  {
    title: "Xəstəliklər",
    key: "disease_ids",
    render: (row) => {
      const ids = row.disease_ids ?? [];
      if (!ids.length)
        return h("span", { class: "text-xs text-slate-400 italic" }, "Yoxdur");

      return h(
        "div",
        { class: "flex flex-wrap gap-1" },
        ids
          .slice(0, 3)
          .map((id) =>
            h(
              "span",
              {
                class:
                  "inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium",
              },
              diseaseMap.value[id] ?? `#${id}`
            )
          )
          .concat(
            ids.length > 3
              ? [
                  h(
                    "span",
                    { class: "text-xs text-slate-400" },
                    `+${ids.length - 3}`
                  ),
                ]
              : []
          )
      );
    },
  },
  {
    title: "Yaradılma",
    key: "created_at",
    render: (row) =>
      h(
        "span",
        { class: "text-slate-500 text-xs" },
        new Date(row.created_at).toLocaleDateString("az-AZ")
      ),
  },
  {
    title: "Yenilənmə",
    key: "updated_at",
    render: (row) =>
      h(
        "span",
        { class: "text-slate-500 text-xs" },
        new Date(row.updated_at).toLocaleDateString("az-AZ")
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
                class:
                  "hover:bg-indigo-50 hover:text-indigo-600 transition-all",
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
                  "hover:bg-rose-50 transition-all",
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
                  "hover:bg-blue-50 hover:text-blue-600 transition-all",
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
  background-color: rgba(225, 29, 72, 0.02) !important;
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