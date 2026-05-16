<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ t("regions.title") }}
        </h2>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        {{ t("regions.create") }}
      </n-button>
    </div>

    <!-- Table Card -->
    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <div class="mb-6 flex items-center justify-between gap-6 p-1">
        <n-input
          v-model:value="searchQuery"
          :placeholder="t('common.search')"
          size="large"
          class="rounded-xl max-w-sm"
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
      <n-alert v-else-if="error" type="error">{{ t("regions.error") }}</n-alert>
      <n-data-table
        v-else
        :columns="columns"
        :data="regions"
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
      :title="editingRegion ? t('regions.edit') : t('regions.create')"
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
              <n-form-item :label="t('common.name')">
                <n-input
                  v-model:value="modalForm.title.az"
                  :placeholder="t('common.name')"
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
              <n-form-item :label="t('common.name')">
                <n-input
                  v-model:value="modalForm.title.en"
                  :placeholder="t('common.name')"
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
              <n-form-item :label="t('common.name')">
                <n-input
                  v-model:value="modalForm.title.ru"
                  :placeholder="t('common.name')"
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
          <n-button ghost class="rounded-xl px-6" @click="showModal = false">{{
            t("common.cancel")
          }}</n-button>
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="createLoading || updateLoading"
            @click="handleSubmit"
          >
            {{ editingRegion ? t("regions.update") : t("common.save") }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="{{ t('regions.deleteTitle') }}"
      content="{{ t('regions.deleteContent') }}"
      positive-text="{{ t('regions.delete') }}"
      negative-text="{{ t('common.cancel') }}"
      :loading="deleteLoading"
      @positive-click="handleDelete"
      @negative-click="showDeleteModal = false"
    />
    <!-- Readonly Info Modal -->
    <n-modal
      v-model:show="showViewModal"
      preset="card"
      :title="t('common.details')"
      class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="viewingRegion" class="flex flex-col gap-6 py-2">
        <!-- Header: Ad və ID -->
        <div class="flex items-center justify-between items-start">
          <div>
            <p
              class="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest mb-1"
            >
              Region Adı
            </p>
            <h3 class="text-2xl font-bold text-slate-900 leading-tight">
              {{ viewingRegion.title }}
            </h3>
          </div>
          <div class="text-right">
            <n-tag type="info" size="small" round strong class="font-mono"
              >#{{ viewingRegion.id }}</n-tag
            >
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div
            class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50"
          >
            <span
              class="text-[10px] uppercase text-indigo-400 font-bold block mb-2"
              >Klinikalar</span
            >
            <n-spin :show="isLoadingClinics" size="small">
              <div
                v-if="viewingRegion.clinic_ids?.length"
                class="flex flex-wrap gap-1.5 mt-1"
              >
                <n-tag
                  v-for="id in viewingRegion.clinic_ids"
                  :key="id"
                  size="small"
                  type="info"
                  round
                  :bordered="false"
                  class="!bg-indigo-100/50 !text-indigo-800 font-medium text-xs"
                >
                  {{ clinicMap[id] ?? `#${id}` }}
                </n-tag>
              </div>
              <span v-else class="text-indigo-900 font-bold text-lg">0</span>
            </n-spin>
          </div>
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span
              class="text-[10px] uppercase text-slate-400 font-bold block mb-1"
              >Status</span
            >
            <span
              class="text-emerald-600 font-bold text-sm flex items-center gap-1"
            >
              <span
                class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
              ></span>
              Aktiv
            </span>
          </div>
        </div>

        <!-- Tarixlər -->
        <div
          class="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200"
        >
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-500 font-medium italic"
              >Yaradılma tarixi:</span
            >
            <span class="text-slate-700 font-semibold">{{
              new Date(viewingRegion.created_at).toLocaleDateString("az-AZ")
            }}</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-500 font-medium italic">Son düzəliş:</span>
            <span class="text-slate-700 font-semibold">{{
              new Date(viewingRegion.updated_at).toLocaleDateString("az-AZ")
            }}</span>
          </div>
        </div>
      </div>

      <template #action>
        <n-button
          block
          secondary
          strong
          size="large"
          class="!rounded-xl"
          @click="showViewModal = false"
        >
          {{ t("common.close") }}
        </n-button>
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
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { Plus, Search, RefreshCw, Edit, Trash2, Eye } from "lucide-vue-next";
import {
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
} from "../composables/useRegions";
import type { Region } from "@icheck/api-contracts";
const { t } = useI18n();
const { $api } = useNuxtApp();
const clinicMap = ref<Record<number, string>>({});
const isLoadingClinics = ref(false);
const message = useMessage();

const searchQuery = ref("");
const { regions, isLoading, error, refresh } = useRegions(searchQuery);

// ---- Modal state ----
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingRegion = ref<Region | null>(null);
const deletingId = ref<number | null>(null);
const activeTab = ref("az");
const isLoadingLang = ref(false);
const loadedLangs = ref(new Set<string>());
const showViewModal = ref(false);
const viewingRegion = ref(null);

const openViewModal = (row: Region) => {
  viewingRegion.value = row;
  showViewModal.value = true;
};
const modalForm = reactive({
  title: { az: "", en: "", ru: "" },
});

const resetForm = () => {
  modalForm.title = { az: "", en: "", ru: "" };
};

// ---- Composables ----
const { createRegion, loading: createLoading } = useCreateRegion();
const { updateRegion, loading: updateLoading } = useUpdateRegion();
const { deleteRegion, loading: deleteLoading } = useDeleteRegion();

// ---- Lang fetch ----
const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return;
  isLoadingLang.value = true;
  try {
    const token = useCookie("icheck_access").value;
    const data = await $fetch<{ data: Region }>(
      `https://icheckapi.200soft.com/api/v1/regions/${id}/`,
      {
        headers: {
          "Accept-Language": lang,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    modalForm.title[lang as "az" | "en" | "ru"] = data.data.title;
    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} ${t("regions.langLoadError")}`);
  } finally {
    isLoadingLang.value = false;
  }
};

const handleTabChange = async (lang: string) => {
  activeTab.value = lang;
  if (editingRegion.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingRegion.value.id, lang);
  }
};

// ---- Handlers ----
const openCreateModal = () => {
  editingRegion.value = null;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: Region) => {
  editingRegion.value = row;
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
const fetchClinicNames = async (ids: number[]) => {
  if (!ids?.length) return;

  const unfetched = ids.filter((id) => !(id in clinicMap.value));
  if (!unfetched.length) return;

  isLoadingClinics.value = true;
  try {
    const results = await Promise.all(
      unfetched.map((id) =>
        $api<{ data: { id: number; title: string } }>(`/admin/clinics/${id}/`)
      )
    );
    for (const res of results) {
      clinicMap.value[res.data.id] = res.data.title;
    }
  } catch {
    message.error("Klinika məlumatları yüklənmədi");
  } finally {
    isLoadingClinics.value = false;
  }
};
const handleSubmit = async () => {
  const titleObj: Record<string, string> = {};
  if (modalForm.title.az) titleObj.az = modalForm.title.az;
  if (modalForm.title.en) titleObj.en = modalForm.title.en;
  if (modalForm.title.ru) titleObj.ru = modalForm.title.ru;

  if (Object.keys(titleObj).length === 0) {
    message.warning(t("common.titleRequired"));
    return;
  }

  try {
    if (editingRegion.value) {
      await updateRegion(editingRegion.value.id, { title: titleObj });
      message.success(t("regions.updated"));
    } else {
      await createRegion({ title: titleObj });
      message.success(t("common.created"));
    }
    showModal.value = false;
    clearNuxtData("regions-list");
    await refresh();
  } catch {
    message.error(t("regions.error"));
  }
};

const handleDelete = async () => {
  if (!deletingId.value) return;
  try {
    await deleteRegion(deletingId.value);
    message.success(t("regions.deleted"));
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error(t("regions.deleteError"));
  }
};
watch(
  () => regions.value,
  async (regs) => {
    if (!regs?.length) return;
    const allIds = [...new Set(regs.flatMap((r) => r.clinic_ids ?? []))];
    await fetchClinicNames(allIds);
  },
  { immediate: true }
);
// ---- Table ----
const columns: DataTableColumns<Region> = [
  {
    title: t("common.id"),
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
    title: t("common.name"),
    key: "title",
    sorter: "default",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#EEF2FF",
            style: "color:#4F46E5;font-weight:800;border:1px solid #E0E7FF",
          },
          { default: () => row.title[0] }
        ),
        h("span", { class: "font-bold text-slate-800" }, row.title),
      ]),
  },
  {
    title: t("regions.clinics"),
    key: "clinic_ids",
    render: (row) => {
      const ids = row.clinic_ids ?? [];
      if (!ids.length)
        return h("span", { class: "text-xs text-slate-400 italic" }, "Yoxdur");

      return h(
        "div",
        { class: "flex flex-wrap gap-1" },
        ids
          .slice(0, 2)
          .map((id) =>
            h(
              "span",
              {
                class:
                  "inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium",
              },
              clinicMap.value[id] ?? `#${id}`
            )
          )
          .concat(
            ids.length > 2
              ? [
                  h(
                    "span",
                    { class: "text-xs text-slate-400" },
                    `+${ids.length - 2}`
                  ),
                ]
              : []
          )
      );
    },
  },
  {
    title: t("common.actions"),
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
                  "hover:bg-indigo-50 hover:text-indigo-600  transition-all",
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
                  "hover:bg-rose-50  transition-all",
                onClick: () => openDeleteModal(row.id),
              },
              { default: () => h(Trash2, { size: 16 }) }
            ),
            h(
              NButton,
              {
                quaternary: true,
                circle: true,
                type: "info",
                class:
                  "hover:bg-blue-50 hover:text-blue-600  transition-all",
                onClick: () => openViewModal(row),
              },
              { icon: () => h(Eye, { size: 18 }) }
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