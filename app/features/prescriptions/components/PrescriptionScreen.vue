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
              placeholder="Diaqnoz seçin və ya axtarın (məs: A00)..."
              filterable
              remote
              clearable
              max-tag-count="responsive"
              class="rounded-xl"
              @search="diagnosisHandleSearch"
              @scroll="diagnosisHandleScroll"
              @focus="diagnosisOnDropdownShow"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from "vue";
import {
  NButton,
  NSpace,
  NAvatar,
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { Plus, Search, RefreshCw, Edit, Trash2, Eye } from "lucide-vue-next";
import {
  usePrescriptions,
  useCreatePrescription,
  useDeletePrescription,
} from "../composables/usePrescriptions";
import type { Prescription } from "@icheck/api-contracts";
import { useRemoteSelect } from "~/composables/useRemoteSelect"; // yolunu dəqiqləşdir

const { $api } = useNuxtApp();
const message = useMessage();
const searchQuery = ref("");
const { prescriptions, isLoading, refresh } = usePrescriptions();
const { createCreatePrescription, loading: createLoading } =
  useCreatePrescription();
const { deletePrescription } = useDeletePrescription();

const showModal = ref(false);
const {
  options: diagnosisOptions,
  pending: diagnosisPending,
  handleSearch: diagnosisHandleSearch,
  handleScroll: diagnosisHandleScroll,
  onDropdownShow: diagnosisOnDropdownShow,
} = useRemoteSelect(
  (params) =>
    $api<any>("/admin/diagnoses/", {
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({
    value: item.id,
    label: `${item.ic_code} - ${item.title}`,
  }),
  {
    key: "prescription-create-diagnoses",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
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
    key: "prescription-create-doctors",
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
  (item: any) => ({
    value: item.id,
    label: item.title ?? item.name ?? `Drug #${item.id}`,
  }), 
  {
    key: "prescription-create-drugs-list",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
  }
);
const {
  options: appointmentOptions,
  pending: appointmentPending,
  handleSearch: appointmentHandleSearch,
  handleScroll: appointmentHandleScroll,
  onDropdownShow: appointmentOnDropdownShow,
} = useRemoteSelect(
  (params) =>
    $api<any>("/appointments/", {
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({
    value: item.id,
    label: `Görüş #${item.id} - ${
      item.patient?.fullname || "Xəstə adı yoxdur"
    }`,
  }),
  {
    key: "prescription-create-appointments",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
  }
);
const modalForm = reactive({
  appointment_id: null as number | null,
  doctor_id: null as number | null,
  date: new Date().toISOString().split("T")[0],
  diagnosis_ids: [] as number[],
  drugs: [] as Array<{
    drug_id: number | null;
    details: { az: string; en: string; ru: string };
  }>,
  services: [],
});

const openCreateModal = () => {
  Object.assign(modalForm, {
    appointment_id: null,
    doctor_id: null,
    drugs: [],
    services: [],
  });
  showModal.value = true;
};

const addDrug = () => {
  modalForm.drugs.push({
    drug_id: null,
    details: { az: "", en: "", ru: "" },
  });
};

const removeDrug = (index: number) => {
  modalForm.drugs.splice(index, 1);
};

const handleSubmit = async () => {
  const payload = {
    appointment_id: modalForm.appointment_id,
    doctor_id: modalForm.doctor_id,
    date: modalForm.date,
    diagnosis_ids: modalForm.diagnosis_ids,
    drugs: modalForm.drugs.map((d) => ({
      drug_id: d.drug_id,
      details: d.details.az,
    })),
    services: modalForm.services.length > 0 ? modalForm.services : [],
  };

  try {
    await createCreatePrescription(payload as any);
    message.success("Resept yaradıldı");
    showModal.value = false;
    refresh();
  } catch (err: any) {
    message.error(err?.data?.error || "Xəta baş verdi");
  }
};

const columns: DataTableColumns<Prescription> = [
  { title: "ID", key: "id", width: 70 },
  { title: "Doc ID", key: "doctor_id" },
  { title: "Date", key: "date" },
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
              { quaternary: true, circle: true, onClick: () => {} },
              { default: () => h(Eye, { size: 16 }) }
            ),
            h(
              NButton,
              {
                quaternary: true,
                circle: true,
                type: "error",
                onClick: () => handleDelete(row.id),
              },
              { default: () => h(Trash2, { size: 16 }) }
            ),
          ],
        }
      ),
  },
];

const handleDelete = async (id: number) => {
  if (confirm("Silmək istəyirsiniz?")) {
    await deletePrescription(id);
    refresh();
  }
};
</script>