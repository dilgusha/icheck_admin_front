<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Clinics
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage clinics across all regions in the healthcare network.
        </p>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create Clinic
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
          placeholder="Search clinics..."
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
          placeholder="Filter by region"
          size="large"
          class="w-48"
          :menu-props="{ onScroll: regionHandleScroll }"
          @update:value="onRegionFilterUpdate"
          @search="regionHandleSearch"
          @update:show="(show: boolean) => show && regionOnDropdownShow()"
        />

        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Top</span>
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
      <n-alert v-else-if="error" type="error">Məlumat yüklənmədi</n-alert>
      <n-data-table
        v-else
        :columns="columns"
        :data="clinics"
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
      :title="editingClinic ? 'Edit Clinic' : 'Create Clinic'"
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
                  placeholder="Klinika adı..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Təsvir (AZ)">
                <n-input
                  v-model:value="modalForm.description.az"
                  type="textarea"
                  placeholder="Haqqında..."
                  :rows="2"
                />
              </n-form-item>
              <n-form-item label="Ünvan (AZ)">
                <n-input
                  v-model:value="modalForm.address.az"
                  placeholder="Ünvan..."
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
                  placeholder="Clinic name..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Description (EN)">
                <n-input
                  v-model:value="modalForm.description.en"
                  type="textarea"
                  placeholder="Description..."
                  :rows="2"
                />
              </n-form-item>
              <n-form-item label="Address (EN)">
                <n-input
                  v-model:value="modalForm.address.en"
                  placeholder="Address..."
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
                  placeholder="Название клиники..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Описание (RU)">
                <n-input
                  v-model:value="modalForm.description.ru"
                  type="textarea"
                  placeholder="Описание..."
                  :rows="2"
                />
              </n-form-item>
              <n-form-item label="Адрес (RU)">
                <n-input
                  v-model:value="modalForm.address.ru"
                  placeholder="Адрес..."
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
          <n-form-item label="Telefon">
            <n-input
              v-model:value="modalForm.phone"
              placeholder="+994..."
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
          <n-form-item label="Region">
            <n-select
              v-model:value="modalForm.region_id"
              :options="regionOptions"
              :loading="regionPending"
              filterable
              remote
              clearable
              placeholder="Seçin"
              size="large"
              :menu-props="{ onScroll: regionHandleScroll }"
              @update:value="onRegionFormUpdate"
              @search="regionHandleSearch"
              @update:show="(show: boolean) => show && regionOnDropdownShow()"
            />
          </n-form-item>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Latitude">
            <n-input
              v-model:value="modalForm.latitude"
              placeholder="40.4093"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
          <n-form-item label="Longitude">
            <n-input
              v-model:value="modalForm.longitude"
              placeholder="49.8671"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Top klinika</span>
          <n-switch v-model:value="modalForm.top" />
        </div>
      </div>

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
            {{ editingClinic ? "Update" : "Save" }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Clinic"
      content="Bu klikanı silmək istədiyinizə əminsiniz?"
      positive-text="Sil"
      negative-text="Ləğv et"
      :loading="deleteLoading"
      @positive-click="handleDelete"
      @negative-click="showDeleteModal = false"
    />
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
import { Plus, Search, RefreshCw, Edit, Trash2 } from "lucide-vue-next";
import {
  useClinics,
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
} from "../composables/useClinics";
import { useRegions } from "../../regions/composables/useRegions";
import type { Clinic } from "@icheck/api-contracts";
import { useRemoteSelect } from "~/composables/useRemoteSelect";

const { $api } = useNuxtApp();

const message = useMessage();

const searchQuery = ref("");
const filterRegionId = ref<number | null>(null);
const filterTop = ref(false);

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
    label: region?.title ?? `Region #${id}`,
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
    // Dil asılı olmayan fieldləri yalnız bir dəfə doldur
    if (!loadedLangs.value.size) {
      modalForm.phone = data.data.phone ?? "";
      modalForm.latitude = data.data.latitude ?? "";
      modalForm.longitude = data.data.longitude ?? "";
      modalForm.region_id = data.data.region_id;
      modalForm.top = data.data.top;
    }
    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} dilində məlumat yüklənmədi`);
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
    message.warning("Ən azı bir dildə klinika adı daxil edin");
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
      message.success("Klinika yeniləndi");
    } else {
      await createClinic(payload);
      message.success("Klinika yaradıldı");
    }
    showModal.value = false;
    clearNuxtData("clinics-list");
    await refresh();
  } catch {
    message.error("Xəta baş verdi");
  }
};

const handleDelete = async () => {
  if (!deletingId.value) return;
  try {
    await deleteClinic(deletingId.value);
    message.success("Klinika silindi");
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error("Silinmə zamanı xəta baş verdi");
  }
};

// ---- Table ----
const columns: DataTableColumns<Clinic> = [
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
    title: "Clinic Name",
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
    title: "Region",
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
    title: "Phone",
    key: "phone",
    render: (row) =>
      h("span", { class: "text-slate-600 text-sm" }, row.phone ?? "—"),
  },
  {
    title: "Top",
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