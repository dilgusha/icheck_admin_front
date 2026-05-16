<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ $t("clinics.title") }}
        </h2>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        {{ $t("clinics.create") }}
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
          :placeholder="$t('common.search')"
          size="large"
          class="rounded-xl max-w-sm"
          clearable
        >
          <template #prefix
            ><Search :size="18" class="text-slate-400"
          /></template>
        </n-input>
        <n-select
          v-model:value="filterRegionId"
          :options="regionOptions"
          :loading="regionPending"
          filterable
          remote
          clearable
          :placeholder="$t('clinics.regionFilter')"
          size="large"
          class="w-48"
          :menu-props="{ onScroll: regionHandleScroll }"
          @update:value="onRegionFilterUpdate"
          @search="regionHandleSearch"
          @update:show="(show: boolean) => show && regionOnDropdownShow()"
        />

        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">{{
            $t("clinics.topFilter")
          }}</span>
          <n-switch v-model:value="filterTop" />
        </div>
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
      <n-alert v-else-if="error" type="error">{{
        $t("clinics.langLoadError")
      }}</n-alert>
      <n-data-table
        v-else
        :columns="columns"
        :data="clinics"
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
      :title="editingClinic ? $t('clinics.edit') : $t('clinics.create')"
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
              <n-form-item :label="$t('common.name')">
                <n-input
                  v-model:value="modalForm.title.az"
                  :placeholder="$t('common.name')"
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item :label="$t('clinics.description')">
                <n-input
                  v-model:value="modalForm.description.az"
                  type="textarea"
                  :placeholder="$t('clinics.description')"
                  :rows="2"
                />
              </n-form-item>
              <n-form-item :label="$t('common.address')">
                <n-input
                  v-model:value="modalForm.address.az"
                  :placeholder="$t('common.address')"
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
              <n-form-item :label="$t('common.name')">
                <n-input
                  v-model:value="modalForm.title.en"
                  :placeholder="$t('common.name')"
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item :label="$t('clinics.description')">
                <n-input
                  v-model:value="modalForm.description.en"
                  type="textarea"
                  :placeholder="$t('clinics.description')"
                  :rows="2"
                />
              </n-form-item>
              <n-form-item :label="$t('common.address')">
                <n-input
                  v-model:value="modalForm.address.en"
                  :placeholder="$t('common.address')"
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
              <n-form-item :label="$t('common.name')">
                <n-input
                  v-model:value="modalForm.title.ru"
                  :placeholder="$t('common.name')"
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item :label="$t('clinics.description')">
                <n-input
                  v-model:value="modalForm.description.ru"
                  type="textarea"
                  :placeholder="$t('clinics.description')"
                  :rows="2"
                />
              </n-form-item>
              <n-form-item :label="$t('common.address')">
                <n-input
                  v-model:value="modalForm.address.ru"
                  :placeholder="$t('common.address')"
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>
      </n-tabs>

      <!-- Dil asılı olmayan fieldlər -->
      <div class="flex flex-col gap-4 mt-4 border-t pt-4">
        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="$t('clinics.phone')">
            <n-input
              v-model:value="modalForm.phone"
              :placeholder="$t('clinics.phone')"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
          <n-form-item :label="$t('common.region')">
            <n-select
              v-model:value="modalForm.region_id"
              :options="regionOptions"
              :loading="regionPending"
              filterable
              remote
              clearable
              :placeholder="$t('common.region')"
              size="large"
              :menu-props="{ onScroll: regionHandleScroll }"
              @update:value="onRegionFormUpdate"
              @search="regionHandleSearch"
              @update:show="(show: boolean) => show && regionOnDropdownShow()"
            />
          </n-form-item>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="$t('clinics.latitude')">
            <n-input
              v-model:value="modalForm.latitude"
              :placeholder="$t('clinics.latitude')"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
          <n-form-item :label="$t('clinics.longitude')">
            <n-input
              v-model:value="modalForm.longitude"
              :placeholder="$t('clinics.longitude')"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">{{ $t("clinics.top") }}</span>
          <n-switch v-model:value="modalForm.top" />
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showModal = false">{{
            $t("common.cancel")
          }}</n-button>
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="createLoading || updateLoading"
            @click="handleSubmit"
          >
            {{ editingClinic ? $t("common.update") : $t("common.save") }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="{{ $t('common.delete') }}"
      content="{{ $t('clinics.deleteConfirmation') }}"
      positive-text="{{ $t('common.delete') }}"
      negative-text="{{ $t('common.cancel') }}"
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
      <div v-if="viewingClinic" class="flex flex-col gap-5 py-2">
        <!-- Üst hissə: Başlıq və Top statusu -->
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <p
                class="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest"
              >
                Klinika
              </p>
              <n-tag
                v-if="viewingClinic.top"
                type="warning"
                size="small"
                round
                borderless
                class="text-[9px] font-bold italic"
                >⭐ TOP</n-tag
              >
            </div>
            <h3 class="text-xl font-bold text-slate-900 leading-tight">
              {{ viewingClinic.title }}
            </h3>
          </div>
          <n-tag type="info" size="small" round strong class="font-mono italic"
            >#{{ viewingClinic.id }}</n-tag
          >
        </div>

        <!-- Təsvir (Description) -->
        <div
          v-if="viewingClinic.description"
          class="bg-slate-50 p-3 rounded-xl border border-slate-100 italic text-slate-600 text-sm"
        >
          "{{ viewingClinic.description }}"
        </div>

        <!-- Əsas Məlumatlar Paneli -->
        <div class="grid grid-cols-1 gap-3">
          <!-- Ünvan -->
          <div
            class="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm"
          >
            <div
              class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"
            >
              <MapPin :size="16" />
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-400 font-bold uppercase"
                >Ünvan</span
              >
              <span class="text-xs text-slate-700 font-medium">{{
                viewingClinic.address || "Qeyd edilməyib"
              }}</span>
            </div>
          </div>

          <!-- Telefon -->
          <div
            class="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm"
          >
            <div
              class="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"
            >
              <Phone :size="16" />
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-400 font-bold uppercase"
                >Telefon</span
              >
              <span class="text-xs text-slate-700 font-medium font-mono">{{
                viewingClinic.phone || "—"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Statistika (Həkim və Xidmət sayları) -->
        <div class="grid grid-cols-2 gap-3">
          <div
            class="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 flex flex-col items-center"
          >
            <span class="text-[10px] uppercase text-indigo-400 font-bold mb-1"
              >Həkimlər</span
            >
            <span class="text-indigo-900 font-black text-lg">{{
              viewingClinic.doctor_ids?.length || 0
            }}</span>
          </div>
          <div
            class="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/50 flex flex-col items-center"
          >
            <span class="text-[10px] uppercase text-rose-400 font-bold mb-1"
              >Xidmətlər</span
            >
            <span class="text-rose-900 font-black text-lg">{{
              viewingClinic.service_ids?.length || 0
            }}</span>
          </div>
        </div>

        <!-- Tarixlər (Alt hissə) -->
        <div class="mt-2 space-y-2 px-1">
          <div class="flex justify-between items-center text-[10px]">
            <span class="text-slate-400 uppercase font-bold tracking-tighter"
              >Yaradılma tarixi:</span
            >
            <span class="text-slate-500 font-semibold">{{
              new Date(viewingClinic.created_at).toLocaleDateString("az-AZ")
            }}</span>
          </div>
          <div class="flex justify-between items-center text-[10px]">
            <span class="text-slate-400 uppercase font-bold tracking-tighter"
              >Son düzəliş:</span
            >
            <span class="text-slate-500 font-semibold">{{
              new Date(viewingClinic.updated_at).toLocaleDateString("az-AZ")
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
          class="!rounded-2xl"
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
  NTag,
  NSpin,
  useMessage,
  type DataTableColumns,
  type SelectOption,
} from "naive-ui";
import { Plus, Search, RefreshCw, Edit, Trash2, Eye } from "lucide-vue-next";
import {
  useClinics,
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
} from "../composables/useClinics";
import { useRegions } from "../../regions/composables/useRegions";
import type { Clinic } from "@icheck/api-contracts";
import { useRemoteSelect } from "~/composables/useRemoteSelect";
const { t } = useI18n();

const { $api } = useNuxtApp();

const message = useMessage();

const searchQuery = ref("");
const filterRegionId = ref<number | null>(null);
const filterTop = ref(false);
const showViewModal = ref(false);
const viewingClinic = ref(null);

const openViewModal = (row: Clinic) => {
  viewingClinic.value = row;
  showViewModal.value = true;
};
const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
  ...(filterRegionId.value ? { region_id: filterRegionId.value } : {}),
  ...(filterTop.value ? { top: true } : {}),
}));

const { clinics, isLoading, error, refresh } = useClinics(query);
const { regions } = useRegions();
const regionInitialOption = computed<SelectOption | null>(() => {
  const id = modalForm.region_id ?? filterRegionId.value;
  if (id == null) return null;

  const region = regions.value.find((r) => r.id === id);
  return {
    value: id,
    label: region?.title ?? `{{ $t('common.region') }} #${id}`,
  };
});

const selectedRegionValues = computed(() =>
  [filterRegionId.value, modalForm.region_id].filter((v) => v != null)
);

// const regionOptions = computed(() =>
//   regions.value.map((r) => ({ label: r.title, value: r.id }))
// )

const {
  options: regionOptions,
  pending: regionPending,
  handleSearch: regionHandleSearch,
  handleScroll: regionHandleScroll,
  handleValueChange: regionHandleValueChange,
  onDropdownShow: regionOnDropdownShow,
  reset: regionReset,
} = useRemoteSelect(
  (params) =>
    $api<any>("/regions/", {
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({
    value: item.id,
    label: item.title,
  }),
  {
    key: "clinic-form-regions",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
    initialOption: regionInitialOption,
    selectedValues: selectedRegionValues,
  }
);

function onRegionFilterUpdate(value: number | null) {
  filterRegionId.value = value;
  regionHandleValueChange();
}

function onRegionFormUpdate(value: number | null) {
  modalForm.region_id = value;
  regionHandleValueChange();
}

// ---- Modal state ----
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingClinic = ref<Clinic | null>(null);
const deletingId = ref<number | null>(null);
const activeTab = ref("az");
const isLoadingLang = ref(false);
const loadedLangs = ref(new Set<string>());

const modalForm = reactive({
  title: { az: "", en: "", ru: "" },
  description: { az: "", en: "", ru: "" },
  address: { az: "", en: "", ru: "" },
  phone: "",
  latitude: "",
  longitude: "",
  region_id: null as number | null,
  top: false,
});

const resetForm = () => {
  modalForm.title = { az: "", en: "", ru: "" };
  modalForm.description = { az: "", en: "", ru: "" };
  modalForm.address = { az: "", en: "", ru: "" };
  modalForm.phone = "";
  modalForm.latitude = "";
  modalForm.longitude = "";
  modalForm.region_id = null;
  modalForm.top = false;
};

// ---- Composables ----
const { createClinic, loading: createLoading } = useCreateClinic();
const { updateClinic, loading: updateLoading } = useUpdateClinic();
const { deleteClinic, loading: deleteLoading } = useDeleteClinic();

// ---- Lang fetch ----
const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return;
  isLoadingLang.value = true;
  try {
    const token = useCookie("icheck_access").value;
    const data = await $fetch<{ data: Clinic }>(
      `https://icheckapi.200soft.com/api/v1/clinics/${id}/`,
      {
        headers: {
          "Accept-Language": lang,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    modalForm.title[lang as "az" | "en" | "ru"] = data.data.title;
    modalForm.description[lang as "az" | "en" | "ru"] =
      data.data.description ?? "";
    modalForm.address[lang as "az" | "en" | "ru"] = data.data.address ?? "";
    if (!loadedLangs.value.size) {
      modalForm.phone = data.data.phone ?? "";
      modalForm.latitude = data.data.latitude ?? "";
      modalForm.longitude = data.data.longitude ?? "";
      modalForm.region_id = data.data.region_id;
      modalForm.top = data.data.top;
    }
    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} {{$t('common.langLoadError')}}`);
  } finally {
    isLoadingLang.value = false;
  }
};

const handleTabChange = async (lang: string) => {
  activeTab.value = lang;
  if (editingClinic.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingClinic.value.id, lang);
  }
};

// ---- Handlers ----
const openCreateModal = () => {
  editingClinic.value = null;
  resetForm();
  regionReset();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: Clinic) => {
  editingClinic.value = row;
  resetForm();
  regionReset();
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
  const clean = (obj: Record<string, string>) => {
    const result: Record<string, string> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v?.trim()) result[k] = v;
    });
    return Object.keys(result).length ? result : null;
  };

  const titleData = clean(modalForm.title);
  if (!titleData) {
    message.warning("t('common.titleRequired')");
    return;
  }

  const payload: any = {
    title: titleData,
    phone: modalForm.phone || null,
    latitude: modalForm.latitude || null,
    longitude: modalForm.longitude || null,
    region_id: modalForm.region_id,
    top: modalForm.top,
  };

  const descData = clean(modalForm.description);
  if (descData) payload.description = descData;

  const addrData = clean(modalForm.address);
  if (addrData) payload.address = addrData;

  try {
    if (editingClinic.value) {
      await updateClinic(editingClinic.value.id, payload);
      message.success("{{ $t('clinics.updated') }}");
    } else {
      await createClinic(payload);
      message.success("{{ $t('clinics.created') }}");
    }
    showModal.value = false;
    clearNuxtData("clinics-list");
    await refresh();
  } catch {
    message.error("{{ $t('common.error') }}");
  }
};

const handleDelete = async () => {
  if (!deletingId.value) return;
  try {
    await deleteClinic(deletingId.value);
    message.success("{{ $t('clinics.deleted') }}");
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error("{{ $t('common.deleteError') }}");
  }
};

// ---- Table ----
const columns: DataTableColumns<Clinic> = [
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
            color: "#F0FDF4",
            style: "color:#16A34A;font-weight:800;border:1px solid #DCFCE7",
          },
          { default: () => row.title[0] }
        ),
        h("div", { class: "flex flex-col" }, [
          h("span", { class: "font-bold text-slate-800" }, row.title),
          h("span", { class: "text-xs text-slate-400" }, row.address ?? "—"),
        ]),
      ]),
  },
  {
    title: t("common.region"),
    key: "region_id",
    render: (row) => {
      const region = regions.value.find((r) => r.id === row.region_id);
      return h(
        "span",
        { class: "text-slate-600 text-sm" },
        region?.title ?? "—"
      );
    },
  },
  {
    title: t("clinics.phone"),
    key: "phone",
    render: (row) =>
      h("span", { class: "text-slate-600 text-sm" }, row.phone ?? "—"),
  },
  {
    title: t("clinics.top"),
    key: "top",
    render: (row) =>
      h(
        NTag,
        {
          type: row.top ? "success" : "default",
          round: true,
          size: "small",
          bordered: false,
          style: "font-weight:800;font-size:10px;text-transform:uppercase;",
        },
        { default: () => (row.top ? "Top" : "Standart") }
      ),
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
                quaternary: true,
                circle: true,
                type: "info",
                class:
                  "hover:bg-blue-50 hover:text-blue-600 transition-all",
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
  background-color: rgba(22, 163, 74, 0.02) !important;
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