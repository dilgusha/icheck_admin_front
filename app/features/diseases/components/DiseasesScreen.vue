<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Diseases
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage diseases, symptoms and related services.
        </p>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create Disease
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
          placeholder="Search diseases..."
          size="large"
          class="rounded-xl max-w-sm"
          clearable
        >
          <template #prefix
            ><Search :size="18" class="text-slate-400"
          /></template>
        </n-input>

        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Top</span>
          <n-switch v-model:value="filterTop" />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Təcili</span>
          <n-switch v-model:value="filterEmergency" />
        </div>
        <div class="flex w-full gap-3">
          <n-input
            v-model:value="filterBodyPart"
            placeholder="Body part..."
            size="large"
            class="rounded-xl w-36"
            clearable
          />

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
        :data="diseases"
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
      :title="editingDisease ? 'Edit Disease' : 'Create Disease'"
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
                  placeholder="Xəstəliyin adı..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Təsvir (AZ)">
                <n-input
                  v-model:value="modalForm.description.az"
                  type="textarea"
                  placeholder="Haqqında..."
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
                  placeholder="Disease name..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Description (EN)">
                <n-input
                  v-model:value="modalForm.description.en"
                  type="textarea"
                  placeholder="Description..."
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
                  placeholder="Название болезни..."
                  size="large"
                  class="rounded-xl"
                />
              </n-form-item>
              <n-form-item label="Описание (RU)">
                <n-input
                  v-model:value="modalForm.description.ru"
                  type="textarea"
                  placeholder="Описание..."
                  :rows="3"
                />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>
      </n-tabs>
      <!-- switch-lərdən sonra əlavə et -->
      <div class="flex flex-col gap-4 mt-4 border-t pt-4">
        <n-form-item label="Simptomlar">
          <n-select
            v-model:value="modalForm.symptom_ids"
            :options="symptomOptions"
            :loading="symptomPending"
            multiple
            filterable
            remote
            clearable
            placeholder="Simptom seçin..."
            size="large"
            :menu-props="{ onScroll: symptomHandleScroll }"
            @search="symptomHandleSearch"
            @update:value="symptomHandleValueChange"
            @update:show="(show: boolean) => show && symptomOnDropdownShow()"
          />
        </n-form-item>

        <n-form-item label="Xidmətlər">
          <n-select
            v-model:value="modalForm.service_ids"
            :options="serviceOptions"
            :loading="servicePending"
            multiple
            filterable
            remote
            clearable
            placeholder="Xidmət seçin..."
            size="large"
            :menu-props="{ onScroll: serviceHandleScroll }"
            @search="serviceHandleSearch"
            @update:value="serviceHandleValueChange"
            @update:show="(show: boolean) => show && serviceOnDropdownShow()"
          />
        </n-form-item>

        <n-form-item label="İxtisaslar">
          <n-select
            v-model:value="modalForm.specialization_ids"
            :options="specializationOptions"
            :loading="specializationPending"
            multiple
            filterable
            remote
            clearable
            placeholder="İxtisas seçin..."
            size="large"
            :menu-props="{ onScroll: specializationHandleScroll }"
            @search="specializationHandleSearch"
            @update:value="specializationHandleValueChange"
            @update:show="(show: boolean) => show && specializationOnDropdownShow()"
          />
        </n-form-item>
      </div>

      <div class="flex gap-8 mt-6 border-t pt-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Top xəstəlik</span>
          <n-switch v-model:value="modalForm.top" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Təcili</span>
          <n-switch v-model:value="modalForm.emergency" />
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showModal = false"
            >Ləğv et</n-button
          >
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="createLoading || updateLoading"
            @click="handleSubmit"
          >
            {{ editingDisease ? "Yenilə" : "Yadda saxla" }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Disease"
      content="Bu xəstəliyi silmək istədiyinizə əminsiniz?"
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
  title="Disease Details"
  class="max-w-lg rounded-3xl overflow-hidden shadow-2xl"
>
  <div v-if="viewingDisease" class="flex flex-col gap-4 py-2">
    
    <!-- Başlıq -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <p class="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest">Xəstəlik</p>
        <h3 class="text-2xl font-bold text-orange-900">{{ viewingDisease.title }}</h3>
      </div>
      <div class="flex flex-col items-end gap-2">
        <n-tag type="warning" size="small" round class="font-mono">#{{ viewingDisease.id }}</n-tag>
        <div class="flex gap-1">
          <n-tag v-if="viewingDisease.top" type="success" size="small" round :bordered="false"
            style="font-weight:800;font-size:10px;text-transform:uppercase;">Top</n-tag>
          <n-tag v-if="viewingDisease.emergency" type="error" size="small" round :bordered="false"
            style="font-weight:800;font-size:10px;text-transform:uppercase;">Təcili</n-tag>
        </div>
      </div>
    </div>

    <n-spin :show="symptomsLoading || servicesLoading || specializationsLoading">
      <div class="flex flex-col gap-3">

        <!-- Simptomlar -->
        <div class="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl">
          <p class="text-[10px] uppercase text-rose-500 font-bold mb-2">
            Simptomlar ({{ viewingDisease.symptom_ids?.length ?? 0 }})
          </p>
          <div v-if="viewingDisease.symptom_ids?.length" class="flex flex-wrap gap-1.5">
            <n-tag v-for="id in viewingDisease.symptom_ids" :key="id"
              size="small" type="error" round :bordered="false"
              class="!bg-rose-100/50 !text-rose-800 font-medium text-xs">
              {{ symptomMap[id] ?? `#${id}` }}
            </n-tag>
          </div>
          <p v-else class="text-xs text-slate-400 italic">Yoxdur</p>
        </div>

        <!-- Xidmətlər -->
        <div class="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl">
          <p class="text-[10px] uppercase text-blue-500 font-bold mb-2">
            Xidmətlər ({{ viewingDisease.service_ids?.length ?? 0 }})
          </p>
          <div v-if="viewingDisease.service_ids?.length" class="flex flex-wrap gap-1.5">
            <n-tag v-for="id in viewingDisease.service_ids" :key="id"
              size="small" type="info" round :bordered="false"
              class="!bg-blue-100/50 !text-blue-800 font-medium text-xs">
              {{ serviceMap[id] ?? `#${id}` }}
            </n-tag>
          </div>
          <p v-else class="text-xs text-slate-400 italic">Yoxdur</p>
        </div>

        <!-- İxtisaslar -->
        <div class="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl">
          <p class="text-[10px] uppercase text-indigo-500 font-bold mb-2">
            İxtisaslar ({{ viewingDisease.specialization_ids?.length ?? 0 }})
          </p>
          <div v-if="viewingDisease.specialization_ids?.length" class="flex flex-wrap gap-1.5">
            <n-tag v-for="id in viewingDisease.specialization_ids" :key="id"
              size="small" type="primary" round :bordered="false"
              class="!bg-indigo-100/50 !text-indigo-800 font-medium text-xs">
              {{ specializationMap[id] ?? `#${id}` }}
            </n-tag>
          </div>
          <p v-else class="text-xs text-slate-400 italic">Yoxdur</p>
        </div>

      </div>
    </n-spin>

    <!-- Tarixlər -->
    <div class="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
      <div class="flex justify-between items-center text-xs">
        <div class="flex items-center gap-2 text-slate-400">
          <Calendar :size="14" />
          <span>Yaradılma:</span>
        </div>
        <span class="text-slate-700 font-semibold">
          {{ new Date(viewingDisease.created_at).toLocaleDateString('az-AZ') }}
        </span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <div class="flex items-center gap-2 text-slate-400">
          <Clock :size="14" />
          <span>Son yenilənmə:</span>
        </div>
        <span class="text-slate-700 font-semibold">
          {{ new Date(viewingDisease.updated_at).toLocaleDateString('az-AZ') }}
        </span>
      </div>
    </div>
  </div>

  <template #action>
    <div class="flex justify-end gap-3">
      <n-button ghost @click="showViewModal = false">Bağla</n-button>
      <n-button type="primary" @click="() => { showViewModal = false; openEditModal(viewingDisease!) }">
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
  NSpin,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { Plus, Search, RefreshCw, Edit, Trash2, Eye } from "lucide-vue-next";
import {
  useDiseases,
  useCreateDisease,
  useUpdateDisease,
  useDeleteDisease,
  useGetDisease,
} from "../composables/useDiseases";
import type { SelectOption } from "naive-ui";
import { useRemoteSelect } from "~/composables/useRemoteSelect";
import type { Disease } from "@icheck/api-contracts";
import { useSymptoms } from "~/features/symptoms/composables/useSymptoms";
import { useServices } from "~/features/services/composables/useServices";
import { useSpecializations } from "~/features/specializations/composables/useSpecializations";

const { $api } = useNuxtApp();

const showViewModal = ref(false);
const viewingDisease = ref<Disease | null>(null);


const symptomInitialOptions = computed<SelectOption[]>(() =>
  modalForm.symptom_ids.map((id) => ({
    value: id,
    label: `Simptom #${id}`,
  }))
);

const serviceInitialOptions = computed<SelectOption[]>(() =>
  modalForm.service_ids.map((id) => ({
    value: id,
    label: `Xidmət #${id}`,
  }))
);

const specializationInitialOptions = computed<SelectOption[]>(() =>
  modalForm.specialization_ids.map((id) => ({
    value: id,
    label: `İxtisas #${id}`,
  }))
);
const { symptoms, isLoading: symptomsLoading } = useSymptoms(ref({ per_page: 200 }));
const { services, isLoading: servicesLoading } = useServices(ref({ per_page: 200 }));
const { specializations, isLoading: specializationsLoading } = useSpecializations(ref({ per_page: 200 }));
const symptomMap = computed(() =>
  Object.fromEntries((symptoms.value ?? []).map((s) => [s.id, s.title]))
);
const serviceMap = computed(() =>
  Object.fromEntries((services.value ?? []).map((s) => [s.id, s.title]))
);
const specializationMap = computed(() =>
  Object.fromEntries((specializations.value ?? []).map((s) => [s.id, s.title]))
);
const {
  options: symptomOptions,
  pending: symptomPending,
  handleSearch: symptomHandleSearch,
  handleScroll: symptomHandleScroll,
  handleValueChange: symptomHandleValueChange,
  onDropdownShow: symptomOnDropdownShow,
  reset: symptomReset,
} = useRemoteSelect(
  (params) =>
    $api<any>("/admin/symptoms/", {
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
    key: "disease-form-symptoms",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
    initialOption: symptomInitialOptions,
    selectedValues: computed(() => modalForm.symptom_ids),
  }
);

const {
  options: serviceOptions,
  pending: servicePending,
  handleSearch: serviceHandleSearch,
  handleScroll: serviceHandleScroll,
  handleValueChange: serviceHandleValueChange,
  onDropdownShow: serviceOnDropdownShow,
  reset: serviceReset,
} = useRemoteSelect(
  (params) =>
    $api<any>("/admin/services/", {
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
    key: "disease-form-services",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
    initialOption: serviceInitialOptions,
    selectedValues: computed(() => modalForm.service_ids),
  }
);

const {
  options: specializationOptions,
  pending: specializationPending,
  handleSearch: specializationHandleSearch,
  handleScroll: specializationHandleScroll,
  handleValueChange: specializationHandleValueChange,
  onDropdownShow: specializationOnDropdownShow,
  reset: specializationReset,
} = useRemoteSelect(
  (params) =>
    $api<any>("/admin/specializations/", {
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
    key: "disease-form-specializations",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
    initialOption: specializationInitialOptions,
    selectedValues: computed(() => modalForm.specialization_ids),
  }
);

const openViewModal = (row: Disease) => {
  viewingDisease.value = row;
  showViewModal.value = true;
};
const message = useMessage();

// ---- Filters ----
const searchQuery = ref("");
const filterTop = ref(false);
const filterEmergency = ref(false);
const filterGender = ref<string | null>(null);
const filterSide = ref<string | null>(null);
const filterBodyPart = ref("");

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
  ...(filterTop.value ? { top: true } : {}),
  ...(filterGender.value ? { gender: filterGender.value } : {}),
  ...(filterSide.value ? { side: filterSide.value } : {}),
  ...(filterBodyPart.value ? { body_part: filterBodyPart.value } : {}),
}));

const { diseases, isLoading, error, refresh } = useDiseases(query);

// ---- Modal state ----
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingDisease = ref<Disease | null>(null);
const deletingId = ref<number | null>(null);
const activeTab = ref("az");
const isLoadingLang = ref(false);
const loadedLangs = ref(new Set<string>());

const modalForm = reactive({
  title: { az: "", en: "", ru: "" },
  description: { az: "", en: "", ru: "" },
  top: false,
  emergency: false,
  symptom_ids: [] as number[],
  service_ids: [] as number[],
  specialization_ids: [] as number[],
  doctor_ids: [] as number[],
});

const resetForm = () => {
  modalForm.title = { az: "", en: "", ru: "" };
  modalForm.description = { az: "", en: "", ru: "" };
  modalForm.top = false;
  modalForm.emergency = false;
  modalForm.symptom_ids = [];
  modalForm.service_ids = [];
  modalForm.specialization_ids = [];
  modalForm.doctor_ids = [];
};

// ---- Composables ----
const { createDisease, loading: createLoading } = useCreateDisease();
const { updateDisease, loading: updateLoading } = useUpdateDisease();
const { deleteDisease, loading: deleteLoading } = useDeleteDisease();
const { getDisease } = useGetDisease();

// ---- Lang fetch ----
const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return;
  isLoadingLang.value = true;
  try {
    const data = await getDisease(id, lang);
    modalForm.title[lang as "az" | "en" | "ru"] = data.title;
    modalForm.description[lang as "az" | "en" | "ru"] = data.description ?? "";
    modalForm.top = data.top;
    modalForm.emergency = data.emergency;
    loadedLangs.value.add(lang);
  } catch {
    message.error(`${lang.toUpperCase()} dilində məlumat yüklənmədi`);
  } finally {
    isLoadingLang.value = false;
  }
};

const handleTabChange = async (lang: string) => {
  activeTab.value = lang;
  if (editingDisease.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingDisease.value.id, lang);
  }
};
const resetRemoteSelects = () => {
  symptomReset();
  serviceReset();
  specializationReset();
};
// ---- Handlers ----
const openCreateModal = () => {
  editingDisease.value = null;
  resetForm();
  resetRemoteSelects();
  activeTab.value = "az";
  loadedLangs.value = new Set();
  showModal.value = true;
};

const openEditModal = async (row: Disease) => {
  editingDisease.value = row;
  resetForm();
  resetRemoteSelects();
  modalForm.symptom_ids = [...(row.symptom_ids ?? [])];
  modalForm.service_ids = [...(row.service_ids ?? [])];
  modalForm.specialization_ids = [...(row.specialization_ids ?? [])];
  modalForm.doctor_ids = [...(row.doctor_ids ?? [])];
  modalForm.top = row.top;
  modalForm.emergency = row.emergency;
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
  if (!modalForm.title.az.trim() && !modalForm.title.en.trim()) {
    message.warning("Ən azı bir dildə ad daxil edin");
    return;
  }

  const payload = {
    title: {
      ...(modalForm.title.az ? { az: modalForm.title.az } : {}),
      ...(modalForm.title.en ? { en: modalForm.title.en } : {}),
      ...(modalForm.title.ru ? { ru: modalForm.title.ru } : {}),
    },
    description: {
      ...(modalForm.description.az ? { az: modalForm.description.az } : {}),
      ...(modalForm.description.en ? { en: modalForm.description.en } : {}),
      ...(modalForm.description.ru ? { ru: modalForm.description.ru } : {}),
    },
    top: modalForm.top,
    emergency: modalForm.emergency,
    symptom_ids: modalForm.symptom_ids,
    service_ids: modalForm.service_ids,
    specialization_ids: modalForm.specialization_ids,
    doctor_ids: modalForm.doctor_ids,
  };

  try {
    if (editingDisease.value) {
      await updateDisease(editingDisease.value.id, payload);
      message.success("Xəstəlik yeniləndi");
    } else {
      await createDisease(payload);
      message.success("Xəstəlik yaradıldı");
    }
    showModal.value = false;
    await refresh();
  } catch {
    message.error("Xəta baş verdi");
  }
};

const handleDelete = async () => {
  if (!deletingId.value) return;
  try {
    await deleteDisease(deletingId.value);
    message.success("Xəstəlik silindi");
    showDeleteModal.value = false;
    await refresh();
  } catch {
    message.error("Silinmə zamanı xəta baş verdi");
  }
};

// ---- Table ----
const columns: DataTableColumns<Disease> = [
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
    title: "Disease Name",
    key: "title",
    sorter: "default",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#FFF7ED",
            style: "color:#EA580C;font-weight:800;border:1px solid #FFEDD5",
          },
          { default: () => row.title[0] }
        ),
        h("span", { class: "font-bold text-slate-800" }, row.title),
      ]),
  },
  {
    title: "Status",
    key: "status",
    render: (row) =>
      h("div", { class: "flex gap-2" }, [
        row.top
          ? h(
              NTag,
              {
                type: "success",
                round: true,
                size: "small",
                bordered: false,
                style:
                  "font-weight:800;font-size:10px;text-transform:uppercase;",
              },
              { default: () => "Top" }
            )
          : null,
        row.emergency
          ? h(
              NTag,
              {
                type: "error",
                round: true,
                size: "small",
                bordered: false,
                style:
                  "font-weight:800;font-size:10px;text-transform:uppercase;",
              },
              { default: () => "Təcili" }
            )
          : null,
      ]),
  },
  {
    title: "Simptomlar",
    key: "symptom_ids",
    render: (row) => {
      const ids = row.symptom_ids ?? [];
      if (!ids.length)
        return h("span", { class: "text-xs text-slate-400 italic" }, "—");
      return h("div", { class: "flex flex-wrap gap-1" }, [
        ...ids.slice(0, 2).map((id) =>
          h("span", {
            class: "inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium",
          }, symptomMap.value[id] ?? `#${id}`)
        ),
        ...(ids.length > 2
          ? [h("span", { class: "text-xs text-slate-400 ml-1" }, `+${ids.length - 2}`)]
          : []),
      ]);
    },
  },
  {
    title: "Xidmətlər",
    key: "service_ids",
    render: (row) => {
      const ids = row.service_ids ?? [];
      if (!ids.length)
        return h("span", { class: "text-xs text-slate-400 italic" }, "—");
      return h("div", { class: "flex flex-wrap gap-1" }, [
        ...ids.slice(0, 2).map((id) =>
          h("span", {
            class: "inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium",
          }, serviceMap.value[id] ?? `#${id}`)
        ),
        ...(ids.length > 2
          ? [h("span", { class: "text-xs text-slate-400 ml-1" }, `+${ids.length - 2}`)]
          : []),
      ]);
    },
  },
  {
    title: "İxtisaslar",
    key: "specialization_ids",
    render: (row) => {
      const ids = row.specialization_ids ?? [];
      if (!ids.length)
        return h("span", { class: "text-xs text-slate-400 italic" }, "—");
      return h("div", { class: "flex flex-wrap gap-1" }, [
        ...ids.slice(0, 2).map((id) =>
          h("span", {
            class: "inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium",
          }, specializationMap.value[id] ?? `#${id}`)
        ),
        ...(ids.length > 2
          ? [h("span", { class: "text-xs text-slate-400 ml-1" }, `+${ids.length - 2}`)]
          : []),
      ]);
    },
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
  background-color: rgba(234, 88, 12, 0.02) !important;
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