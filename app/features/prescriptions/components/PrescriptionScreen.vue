<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Prescriptions
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage patient prescriptions and drugs.
        </p>
      </div>
      <n-button
        type="primary"
        size="large"
        class="!rounded-xl font-bold px-8"
        @click="openCreateModal"
      >
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create Prescription
      </n-button>
    </div>

    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <div class="mb-6 flex items-center justify-between gap-4 p-1">
        <div class="flex items-center gap-4 flex-1">
          <n-input
            v-model:value="searchQuery"
            placeholder="Search prescriptions..."
            size="large"
            class="rounded-xl max-w-sm"
            clearable
          >
            <template #prefix
              ><Search :size="18" class="text-slate-400"
            /></template>
          </n-input>
        </div>
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

      <n-data-table
        :loading="isLoading"
        :columns="columns"
        :data="prescriptions"
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
      title="Prescription Details"
      class="max-w-2xl rounded-3xl shadow-2xl"
    >
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Görüş Seçin (Appointment)">
            <n-select
              v-model:value="modalForm.appointment_id"
              :options="appointmentOptions"
              :loading="appointmentPending"
              placeholder="Görüş ID axtar..."
              filterable
              remote
              clearable
              @search="appointmentHandleSearch"
              @scroll="appointmentHandleScroll"
              @focus="appointmentOnDropdownShow"
            />
          </n-form-item>
          <n-form-item label="Həkim Seçin">
            <n-select
              v-model:value="modalForm.doctor_id"
              :options="doctorOptions"
              :loading="doctorPending"
              placeholder="Həkim axtar..."
              filterable
              remote
              clearable
              class="rounded-xl"
              @search="doctorHandleSearch"
              @scroll="doctorHandleScroll"
              @focus="doctorOnDropdownShow"
            />
          </n-form-item>
        </div>
        <div class="mt-4">
          <n-form-item label="Diaqnozlar">
            <n-select
              v-model:value="modalForm.diagnosis_ids"
              multiple
              :options="diagnosisOptions"
              :loading="diagnosisPending"
              placeholder="Diaqnoz seçin..."
              filterable
              remote
              clearable
              max-tag-count="responsive"
              @search="diagnosisHandleSearch"
              @scroll="diagnosisHandleScroll"
              @update:value="diagnosisHandleValueChange"
              @update:show="(show: boolean) => show && diagnosisOnDropdownShow()"
            />
          </n-form-item>
        </div>

        <div class="space-y-6">
          <div class="flex justify-between items-center border-b pb-2">
            <h3 class="font-bold text-slate-800">Dərmanlar</h3>
            <n-button size="small" secondary type="primary" @click="addDrug">
              <template #icon><Plus :size="14" /></template>
              Dərman əlavə et
            </n-button>
          </div>

          <div
            v-for="(drug, index) in modalForm.drugs"
            :key="index"
            class="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative"
          >
            <n-button
              circle
              type="error"
              quaternary
              size="small"
              class="absolute -top-2 -right-2 bg-white shadow-md"
              @click="removeDrug(index)"
            >
              <template #icon><Trash2 :size="14" /></template>
            </n-button>

            <div class="flex flex-col gap-4">
              <n-form-item label="Dərman seçin" :show-feedback="false">
                <n-select
                  v-model:value="drug.drug_id"
                  :options="drugOptions"
                  :loading="drugPending"
                  placeholder="Dərman adını axtarın..."
                  filterable
                  remote
                  clearable
                  @search="drugHandleSearch"
                  @scroll="drugHandleScroll"
                  @focus="drugOnDropdownShow"
                />
              </n-form-item>

              <n-tabs type="segment" animated size="small">
                <n-tab-pane name="az" tab="AZ">
                  <n-form-item
                    label="Təlimat (AZ)"
                    :show-feedback="false"
                    class="pt-2"
                  >
                    <n-input
                      v-model:value="drug.details.az"
                      type="textarea"
                      placeholder="Gündə 2 dəfə..."
                    />
                  </n-form-item>
                </n-tab-pane>
                <n-tab-pane name="en" tab="EN">
                  <n-form-item
                    label="Details (EN)"
                    :show-feedback="false"
                    class="pt-2"
                  >
                    <n-input
                      v-model:value="drug.details.en"
                      type="textarea"
                      placeholder="Twice a day..."
                    />
                  </n-form-item>
                </n-tab-pane>
                <n-tab-pane name="ru" tab="RU">
                  <n-form-item
                    label="Описание (RU)"
                    :show-feedback="false"
                    class="pt-2"
                  >
                    <n-input
                      v-model:value="drug.details.ru"
                      type="textarea"
                      placeholder="2 раза в день..."
                    />
                  </n-form-item>
                </n-tab-pane>
              </n-tabs>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost @click="showModal = false">Cancel</n-button>
          <n-button
            type="primary"
            :loading="createLoading"
            @click="handleSubmit"
            >Save Prescription</n-button
          >
        </div>
      </template>
    </n-modal>
    <!-- Delete modal-dan sonra -->
    <n-modal
      v-model:show="showViewModal"
      preset="card"
      title="Prescription Details"
      class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="viewingPrescription" class="flex flex-col gap-4 py-2">
        <div class="flex items-center justify-between">
          <n-tag type="info" size="small" round class="font-mono"
            >#{{ viewingPrescription.id }}</n-tag
          >
          <span class="text-xs text-slate-400">{{
            new Date(viewingPrescription.date).toLocaleDateString("az-AZ")
          }}</span>
        </div>

        <!-- Həkim -->
        <div class="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl">
          <p class="text-[10px] uppercase text-blue-500 font-bold mb-2">
            Həkim
          </p>
          <div class="flex items-center gap-3">
            <n-avatar
              round
              :size="36"
              color="#F0F9FF"
              style="color: #0369a1; font-weight: 800"
            >
              {{ viewingPrescription.doctor?.fullname?.[0] }}
            </n-avatar>
            <div>
              <p class="font-bold text-blue-900">
                {{ viewingPrescription.doctor?.fullname }}
              </p>
              <p class="text-xs text-blue-600">
                {{ viewingPrescription.doctor?.workplace }}
              </p>
              <div class="flex flex-wrap gap-1 mt-1">
                <n-tag
                  v-for="s in viewingPrescription.doctor?.specializations"
                  :key="s.id"
                  size="small"
                  type="info"
                  round
                  :bordered="false"
                  class="!bg-blue-100/50 !text-blue-800 text-[10px]"
                >
                  {{ s.title }}
                </n-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- Diaqnoz -->
        <div class="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
          <p class="text-[10px] uppercase text-amber-500 font-bold mb-2">
            Diaqnoz
          </p>
          <p class="text-sm text-amber-900 font-medium">
            {{ viewingPrescription.diagnosis || "—" }}
          </p>
        </div>

        <!-- Dərmanlar -->
        <div class="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl">
          <p class="text-[10px] uppercase text-rose-500 font-bold mb-2">
            Dərmanlar
          </p>
          <p class="text-sm text-rose-900">
            {{ viewingPrescription.drugs_summary || "—" }}
          </p>
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost @click="showViewModal = false">Bağla</n-button>
          <n-button
            type="primary"
            @click="() => { showViewModal = false; openEditModal(viewingPrescription!) }"
          >
            Redaktə et
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, computed, watch } from "vue";
import {
  NButton,
  NSpace,
  NAvatar,
  NTag,
  useMessage,
  type DataTableColumns,
  type SelectOption,
} from "naive-ui";
import { Plus, Search, RefreshCw, Edit, Trash2, Eye } from "lucide-vue-next";
import {
  usePrescriptions,
  useCreatePrescription,
  useDeletePrescription,
  useUpdatePrescription,
  useGetPrescription,
} from "../composables/usePrescriptions";
import type { Prescription } from "@icheck/api-contracts";
import { useRemoteSelect } from "~/composables/useRemoteSelect";

const { $api } = useNuxtApp();
const message = useMessage();

// ---- Data ----
const searchQuery = ref("");
const { prescriptions, isLoading, refresh } = usePrescriptions();
const { createCreatePrescription, loading: createLoading } =
  useCreatePrescription();
const { updatePrescription } = useUpdatePrescription();
const { deletePrescription } = useDeletePrescription();
const { getPrescription } = useGetPrescription();

// ---- Modal state ----
const showModal = ref(false);
const showViewModal = ref(false);
const editingId = ref<number | null>(null);
const viewingPrescription = ref<Prescription | null>(null);

// ---- Form ----
const modalForm = reactive({
  appointment_id: null as number | null,
  doctor_id: null as number | null,
  date: new Date().toISOString().split("T")[0],
  diagnosis_ids: [] as number[],
  drugs: [] as Array<{
    drug_id: number | null;
    details: { az: string; en: string; ru: string };
  }>,
  services: [] as Record<string, string>[],
});

// ---- Remote selects ----
// Diagnosis — initialOption modalForm-dan sonra declare olunur
const diagnosisInitialOptions = computed<SelectOption[]>(() =>
  modalForm.diagnosis_ids.map((id) => ({ value: id, label: `Diaqnoz #${id}` }))
);

const {
  options: diagnosisOptions,
  pending: diagnosisPending,
  handleSearch: diagnosisHandleSearch,
  handleScroll: diagnosisHandleScroll,
  handleValueChange: diagnosisHandleValueChange,
  onDropdownShow: diagnosisOnDropdownShow,
  reset: diagnosisReset,
} = useRemoteSelect(
  (params) =>
    $api<any>("/admin/diagnoses/", {
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({ value: item.id, label: `${item.ic_code} - ${item.title}` }),
  {
    key: "prescription-diagnoses",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
    initialOption: diagnosisInitialOptions,
    selectedValues: computed(() => modalForm.diagnosis_ids),
  }
);

const {
  options: doctorOptions,
  pending: doctorPending,
  handleSearch: doctorHandleSearch,
  handleScroll: doctorHandleScroll,
  onDropdownShow: doctorOnDropdownShow,
} = useRemoteSelect(
  (params) =>
    $api<any>("/doctors/", {
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({ value: item.id, label: item.fullname }),
  {
    key: "prescription-doctors",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
  }
);

const {
  options: drugOptions,
  pending: drugPending,
  handleSearch: drugHandleSearch,
  handleScroll: drugHandleScroll,
  onDropdownShow: drugOnDropdownShow,
} = useRemoteSelect(
  (params) =>
    $api<any>("/drugs/", {
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({ value: item.id, label: item.title ?? `Drug #${item.id}` }),
  { key: "prescription-drugs", per_page: 10, debounceMs: 300, loadOnOpen: true }
);

const {
  options: appointmentOptions,
  pending: appointmentPending,
  handleSearch: appointmentHandleSearch,
  handleScroll: appointmentHandleScroll,
  onDropdownShow: appointmentOnDropdownShow,
} = useRemoteSelect(
  (params) =>
    $api<any>("/admin/appointments/", {
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({
    value: item.id,
    label: `Görüş #${item.id} - ${
      item.user?.fullname || item.doctor?.fullname || "—"
    }`,
  }),
  {
    key: "prescription-appointments",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
  }
);

// ---- Handlers ----
const resetForm = () => {
  Object.assign(modalForm, {
    appointment_id: null,
    doctor_id: null,
    date: new Date().toISOString().split("T")[0],
    diagnosis_ids: [],
    drugs: [],
    services: [],
  });
  diagnosisReset();
};

const openCreateModal = () => {
  editingId.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = async (row: Prescription) => {
  editingId.value = row.id;
  resetForm();
  showModal.value = true;
  try {
    const detail = await getPrescription(row.id);
    Object.assign(modalForm, {
      appointment_id: detail.appointment_id ?? null,
      doctor_id: detail.doctor?.id ?? null,
      date: detail.date,
      diagnosis_ids: detail.diagnosis_ids ?? [],
      drugs:
        detail.drugs?.map((d: any) => ({
          drug_id: d.drug_id,
          details: { az: d.details ?? "", en: "", ru: "" },
        })) ?? [],
      services: detail.services ?? [],
    });
  } catch {
    message.error("Məlumat yüklənmədi");
  }
};

const openViewModal = (row: Prescription) => {
  viewingPrescription.value = row;
  showViewModal.value = true;
};

const addDrug = () =>
  modalForm.drugs.push({ drug_id: null, details: { az: "", en: "", ru: "" } });

const removeDrug = (index: number) => modalForm.drugs.splice(index, 1);

const handleSubmit = async () => {
  const payload = {
    appointment_id: modalForm.appointment_id,
    doctor_id: modalForm.doctor_id,
    date: modalForm.date,
    diagnosis_ids: modalForm.diagnosis_ids,
    drugs: modalForm.drugs
      .filter((d) => d.drug_id)
      .map((d) => ({
        drug_id: d.drug_id!,
        details: d.details.az || d.details.en || d.details.ru || "",
      })),
    services: modalForm.services,
  };

  try {
    if (editingId.value) {
      await updatePrescription(editingId.value, payload);
      message.success("Resept yeniləndi");
    } else {
      await createCreatePrescription(payload as any);
      message.success("Resept yaradıldı");
    }
    showModal.value = false;
    editingId.value = null;
    refresh();
  } catch (err: any) {
    message.error(err?.data?.error || "Xəta baş verdi");
  }
};

const handleDelete = async (id: number) => {
  if (!confirm("Silmək istəyirsiniz?")) return;
  try {
    await deletePrescription(id);
    message.success("Resept silindi");
    refresh();
  } catch {
    message.error("Xəta baş verdi");
  }
};

// ---- Table ----
const columns: DataTableColumns<Prescription> = [
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
    title: "Həkim",
    key: "doctor",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#F0F9FF",
            style: "color:#0369A1;font-weight:800;",
          },
          { default: () => row.doctor?.fullname?.[0] ?? "H" }
        ),
        h("div", { class: "flex flex-col" }, [
          h(
            "span",
            { class: "font-bold text-slate-800 text-sm" },
            row.doctor?.fullname ?? "—"
          ),
          h(
            "span",
            { class: "text-xs text-slate-400" },
            row.doctor?.workplace ?? ""
          ),
        ]),
      ]),
  },
  {
    title: "Diaqnoz",
    key: "diagnosis",
    render: (row) =>
      h("span", { class: "text-slate-600 text-sm" }, row.diagnosis || "—"),
  },
  {
    title: "Dərmanlar",
    key: "drugs_summary",
    render: (row) =>
      h(
        "span",
        { class: "text-slate-500 text-xs line-clamp-1 max-w-xs block" },
        row.drugs_summary || "—"
      ),
  },
  {
    title: "Tarix",
    key: "date",
    render: (row) =>
      h(
        "span",
        { class: "text-slate-500 text-xs" },
        new Date(row.date).toLocaleDateString("az-AZ")
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
                onClick: () => handleDelete(row.id),
              },
              { default: () => h(Trash2, { size: 16 }) }
            ),
          ],
        }
      ),
  },
];
</script>