<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Services
        </h2>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create Service
      </n-button>
    </div>

    <!-- Table Card -->
    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <div class="mb-6 flex items-center gap-4 p-1">
        <n-input
          v-model:value="searchQuery"
          placeholder="Search services..."
          size="large"
          class="rounded-xl max-w-sm"
          clearable
        >
          <template #prefix
            ><Search :size="18" class="text-slate-400"
          /></template>
        </n-input>
        <n-select
          v-model:value="filterClinicId"
          :options="clinicOptions"
          :loading="clinicPending"
          filterable
          remote
          clearable
          placeholder="Filter by clinic"
          size="large"
          class="w-48"
          :menu-props="{ onScroll: clinicHandleScroll }"
          @update:value="onClinicFilterUpdate"
          @search="clinicHandleSearch"
          @update:show="(show: boolean) => show && clinicOnDropdownShow()"
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
        :data="services"
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
      :title="editingService ? 'Edit Service' : 'Create Service'"
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
                  placeholder="Xidmət adı..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Məzmun (AZ)">
                <n-input
                  v-model:value="modalForm.body.az"
                  type="textarea"
                  placeholder="Məzmun..."
                  :rows="3"
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
                  placeholder="Service name..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Body (EN)">
                <n-input
                  v-model:value="modalForm.body.en"
                  type="textarea"
                  placeholder="Body..."
                  :rows="3"
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
                  placeholder="Название услуги..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Содержание (RU)">
                <n-input
                  v-model:value="modalForm.body.ru"
                  type="textarea"
                  placeholder="Содержание..."
                  :rows="3"
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
            {{ editingService ? "Update" : "Save" }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Service"
      content="Bu xidməti silmək istədiyinizə əminsiniz?"
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
      title="Service Details"
      class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="viewingService" class="flex flex-col gap-4 py-2">
        <!-- Başlıq -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p
              class="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest"
            >
              Xidmət
            </p>
            <h3 class="text-2xl font-bold text-purple-900">
              {{ viewingService.title }}
            </h3>
          </div>
          <n-tag type="info" size="small" round class="font-mono"
            >#{{ viewingService.id }}</n-tag
          >
        </div>

        <!-- Body -->
        <div
          v-if="viewingService.body"
          class="bg-purple-50/60 border border-purple-100 p-4 rounded-2xl"
        >
          <p class="text-[10px] uppercase text-purple-500 font-bold mb-2">
            Məzmun
          </p>
          <p class="text-sm text-purple-900 leading-relaxed">
            {{ viewingService.body }}
          </p>
        </div>

        <!-- Şəkil -->
        <div
          v-if="viewingService.image_url"
          class="rounded-2xl overflow-hidden border border-slate-100"
        >
          <img
            :src="viewingService.image_url"
            alt="Service image"
            class="w-full object-cover max-h-48"
          />
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
                new Date(viewingService.created_at).toLocaleDateString("az-AZ")
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
                new Date(viewingService.updated_at).toLocaleDateString("az-AZ")
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
            @click="() => { showViewModal = false; openEditModal(viewingService!) }"
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
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
} from "lucide-vue-next";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "../composables/useServices";
// import { useClinics } from '../../clinics/composables/useClinics'
import type { Service } from "@icheck/api-contracts";
import type { SelectOption } from "naive-ui";
import { useRemoteSelect } from "~/composables/useRemoteSelect";
// import { getRequestHeaders } from "../composables/useServices";
const { $api } = useNuxtApp();

const message = useMessage();
const showViewModal = ref(false);
const viewingService = ref<Service | null>(null);

const openViewModal = (row: Service) => {
  viewingService.value = row;
  showViewModal.value = true;
};
const searchQuery = ref("");
const filterClinicId = ref<number | null>(null);
// const { clinics } = useClinics()

// const clinicOptions = computed(() =>
//   clinics.value.map((c) => ({ label: c.title, value: c.id }))
// )
const clinicInitialOption = computed<SelectOption | null>(() => {
  const id = filterClinicId.value;
  if (id == null) return null;

  return {
    value: id,
    label: `Clinic #${id}`,
  };
});

const {
  options: clinicOptions,
  pending: clinicPending,
  handleSearch: clinicHandleSearch,
  handleScroll: clinicHandleScroll,
  handleValueChange: clinicHandleValueChange,
  onDropdownShow: clinicOnDropdownShow,
} = useRemoteSelect(
  (params) =>
    $api("/clinics/", {
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
    key: "services-filter-clinics",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
    initialOption: clinicInitialOption,
    selectedValues: computed(() => filterClinicId.value),
  }
);

function onClinicFilterUpdate(value: number | null) {
  filterClinicId.value = value;
  clinicHandleValueChange();
}
const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
  ...(filterClinicId.value ? { clinic_id: filterClinicId.value } : {}),
}));

const { services, isLoading, error, refresh } = useServices(query);

// ---- Modal state ----
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingService = ref<Service | null>(null);
const deletingId = ref<number | null>(null);
const activeTab = ref("az");
const isLoadingLang = ref(false);
const loadedLangs = ref(new Set<string>());

const modalForm = reactive({
  title: { az: "", en: "", ru: "" },
  body: { az: "", en: "", ru: "" },
});

const resetForm = () => {
  modalForm.title = { az: "", en: "", ru: "" };
  modalForm.body = { az: "", en: "", ru: "" };
};

// ---- Composables ----
const { createService, loading: createLoading } = useCreateService();
const { updateService, loading: updateLoading } = useUpdateService();
const { deleteService, loading: deleteLoading } = useDeleteService();

// ---- Lang fetch ----
const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return;
  isLoadingLang.value = true;
  try {
    const token = useCookie("icheck_access").value;
    const data = await $api<{ data: Service }>(`/services/${id}/`, {
      headers: {
        "Accept-Language": lang,
      },
    });

    modalForm.title[lang as "az" | "en" | "ru"] = data.data.title;
    modalForm.body[lang as "az" | "en" | "ru"] = data.data.body ?? "";
    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} dilində məlumat yüklənmədi`);
  } finally {
    isLoadingLang.value = false;
  }
};

const handleTabChange = async (lang: string) => {
  activeTab.value = lang;
  if (editingService.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingService.value.id, lang);
  }
};

// ---- Handlers ----
const openCreateModal = () => {
  editingService.value = null;
  resetForm();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: Service) => {
  editingService.value = row;
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
  const clean = (obj: Record<string, string>) => {
    const result: Record<string, string> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v?.trim()) result[k] = v;
    });
    return Object.keys(result).length ? result : null;
  };

  const titleData = clean(modalForm.title);
  if (!titleData) {
    message.warning("Ən azı bir dildə xidmət adı daxil edin");
    return;
  }

  const payload: any = { title: titleData };
  const bodyData = clean(modalForm.body);
  if (bodyData) payload.body = bodyData;

  try {
    if (editingService.value) {
      await updateService(editingService.value.id, payload);
      message.success("Xidmət yeniləndi");
    } else {
      await createService(payload);
      message.success("Xidmət yaradıldı");
    }
    showModal.value = false;
    clearNuxtData("services-list");
    await refresh();
  } catch {
    message.error("Xəta baş verdi");
  }
};

const handleDelete = async () => {
  if (!deletingId.value) return;
  try {
    await deleteService(deletingId.value);
    message.success("Xidmət silindi");
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error("Silinmə zamanı xəta baş verdi");
  }
};

const columns: DataTableColumns<Service> = [
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
    title: "Service Name",
    key: "title",
    sorter: "default",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#FDF4FF",
            style: "color:#9333EA;font-weight:800;border:1px solid #F3E8FF",
          },
          { default: () => row.title[0] }
        ),
        h("div", { class: "flex flex-col" }, [
          h("span", { class: "font-bold text-slate-800" }, row.title),
          h(
            "span",
            { class: "text-xs text-slate-400 line-clamp-1" },
            row.body ?? "—"
          ),
        ]),
      ]),
  },
  {
    title: "Məzmun",
    key: "body",
    render: (row) =>
      h(
        "span",
        { class: "text-xs text-slate-500 line-clamp-1 max-w-xs block" },
        row.body ?? "—"
      ),
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
onMounted(async () => {
  const test = await $api("/services/");
  console.log("services test", test);
});
</script>

<style>
.modern-table .n-data-table-td {
  vertical-align: middle;
  padding: 12px 16px;
  background-color: transparent !important;
}
.modern-table .n-data-table-tr:hover .n-data-table-td {
  background-color: rgba(147, 51, 234, 0.02) !important;
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