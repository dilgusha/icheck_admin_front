<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{t('appointments.title')}}
        </h2>
       
      </div>
      <div class="flex items-center gap-3">
        <n-button quaternary circle size="medium" @click="refresh()">
          <template #icon>
            <RefreshCw
              :size="18"
              :class="{ 'animate-spin': isLoading }"
              class="text-slate-500"
            />
          </template>
        </n-button>
        <n-button
          type="primary"
          size="large"
          class="!rounded-xl font-bold px-8"
          @click="showCreateModal = true"
        >
          <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
          {{t('appointments.create')}}
        </n-button>
      </div>
    </div>

    <!-- Table Card -->
    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <div class="mb-6 flex flex-wrap items-center gap-4 p-1">
        <n-input
          v-model:value="searchQuery"
          placeholder="Search..."
          size="large"
          class="rounded-xl max-w-xs"
          clearable
        >
          <template #prefix
            ><Search :size="18" class="text-slate-400"
          /></template>
        </n-input>

        <n-select
          v-model:value="filterStatus"
          :options="statusOptions"
          placeholder="Status"
          size="large"
          clearable
          class="w-40"
        />

        <n-date-picker
          v-model:value="filterDateFrom"
          type="date"
          placeholder="From"
          size="large"
          clearable
          class="w-36"
        />
        <n-date-picker
          v-model:value="filterDateTo"
          type="date"
          placeholder="To"
          size="large"
          clearable
          class="w-36"
        />
      </div>

      <div v-if="isLoading" class="space-y-4">
        <div
          v-for="i in 6"
          :key="i"
          class="h-16 bg-slate-50 rounded-lg animate-pulse"
        />
      </div>
      <n-alert v-else-if="error" type="error">{{t('common.langLoadError')}}</n-alert>
      <n-data-table
        v-else
        :columns="columns"
        :data="appointments"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group'"
        class="modern-table"
        striped
      />
    </n-card>

    <!-- Create Modal -->
    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      title="Create Appointment"
      class="max-w-lg rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="flex flex-col gap-4 p-2">
        <n-form-item :label="t('appointments.doctor')">
          <n-select
            v-model:value="createForm.doctor_id"
            filterable
            remote
            clearable
            :placeholder="t('appointments.doctorSelectPlaceholder')"
            :options="doctorOptions"
            :loading="doctorPending"
            :menu-props="{ onScroll: doctorHandleScroll }"
            @update:value="doctorHandleValueChange"
            @search="doctorHandleSearch"
            @update:show="(show: boolean) => show && doctorOnDropdownShow()"
          />
        </n-form-item>
        <!-- doctor select-dən sonra əlavə et -->
        <n-form-item :label="t('appointments.patient')">
          <n-select
            v-model:value="createForm.user_id"
            filterable
            remote
            clearable
            :placeholder="t('appointments.patientSelectPlaceholder')"
            :options="patientOptions"
            :loading="patientPending"
            :menu-props="{ onScroll: patientHandleScroll }"
            @update:value="onPatientChange"
            @search="patientHandleSearch"
            @update:show="(show: boolean) => show && patientOnDropdownShow()"
          />
        </n-form-item>

        <n-form-item v-if="!createForm.user_id" :label="t('appointments.patientName')">
          <n-input
            v-model:value="createForm.fullname"
            :placeholder="t('appointments.patientNamePlaceholder')"
            size="large"
            class="rounded-xl"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="t('appointments.type_label')">
            <n-select
              v-model:value="createForm.type"
              :options="typeOptions"
              size="large"
            />
          </n-form-item>
          <n-form-item :label="t('appointments.status_label')">
            <n-select
              v-model:value="createForm.status"
              :options="statusOptions"
              size="large"
            />
          </n-form-item>
        </div>

        <n-form-item :label="t('appointments.dateAndTime')">
          <n-date-picker
            v-model:value="createForm.date"
            type="date"
            size="large"
            class="w-full"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="t('appointments.startTime')">
            <n-time-picker
              v-model:value="createForm.start_time"
              size="large"
              class="w-full"
            />
          </n-form-item>
          <n-form-item :label="t('appointments.endTime')">
            <n-time-picker
              v-model:value="createForm.end_time"
              size="large"
              class="w-full"
            />
          </n-form-item>
        </div>

        <n-form-item :label="t('appointments.complaints')">
          <n-input
            v-model:value="createForm.complaints"
            type="textarea"
            placeholder="Şikayətlər..."
            :rows="2"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="t('appointments.paymentMethod')">

            <n-select
              v-model:value="createForm.payment_method"
              :options="paymentOptions"
              size="large"
            />
          </n-form-item>
          <n-form-item :label="t('appointments.paymentStatus_label')">
            <n-select
              v-model:value="createForm.payment_status"
              :options="paymentStatusOptions"
              size="large"
            />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="t('appointments.amount')">
            <n-input
              v-model:value="createForm.amount"
              placeholder="0.00"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
          <n-form-item :label="t('appointments.paidAmount')">
            <n-input
              v-model:value="createForm.paid_amount"
              placeholder="0.00"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button
            ghost
            class="rounded-xl px-6"
            @click="showCreateModal = false"
            >Ləğv et</n-button
          >
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="createLoading"
            @click="handleCreate"
            >Yarat</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Edit Modal -->
    <n-modal
      v-model:show="showEditModal"
      preset="card"
      title="Edit Appointment"
      class="max-w-lg rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="flex flex-col gap-4 p-2">
        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="t('appointments.status')">
            <n-select
              v-model:value="editForm.status"
              :options="statusOptions"
              size="large"
            />
          </n-form-item>
          <n-form-item :label="t('appointments.paymentStatus_label')">
            <n-select
              v-model:value="editForm.payment_status"
              :options="paymentStatusOptions"
              size="large"
            />
          </n-form-item>
        </div>
        <n-form-item :label="t('appointments.paymentMethod')">
          <n-select
            v-model:value="editForm.payment_method"
            :options="paymentOptions"
            size="large"
          />
        </n-form-item>
        <n-form-item :label="t('appointments.details')">
          <n-input
            v-model:value="editForm.details"
            type="textarea"
            :placeholder="t('appointments.detailsPlaceholder')"
            :rows="2"
          />
        </n-form-item>

        <n-form-item :label="t('appointments.address')">
          <n-input
            v-model:value="editForm.address"
            :placeholder="t('appointments.addressPlaceholder')"
            size="large"
            class="rounded-xl"
          />
        </n-form-item>

        <n-form-item :label="t('appointments.postponeReason')">
          <n-input
            v-model:value="editForm.postpone_reason"
            type="textarea"
            :placeholder="t('appointments.postponeReasonPlaceholder')"
            :rows="2"
          />
        </n-form-item>

        <n-form-item :label="t('appointments.date')">
          <n-date-picker
            v-model:value="editForm.date"
            type="date"
            size="large"
            class="w-full"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="t('appointments.startTime')">

            <n-time-picker
              v-model:value="editForm.start_time"
              size="large"
              class="w-full"
            />
          </n-form-item>
          <n-form-item :label="t('appointments.endTime')">
            <n-time-picker
              v-model:value="editForm.end_time"
              size="large"
              class="w-full"
            />
          </n-form-item>
        </div>

        <n-form-item :label="t('appointments.complaints')">
          <n-input
            v-model:value="editForm.complaints"
            type="textarea"
            :placeholder="t('appointments.complaintsPlaceholder')"
            :rows="2"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item :label="t('appointments.amount')">
            <n-input
              v-model:value="editForm.amount"
              placeholder="0.00"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
          <n-form-item :label="t('appointments.paidAmount')">
            <n-input
              v-model:value="editForm.paid_amount"
              placeholder="0.00"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
        </div>

        <n-form-item :label="t('appointments.declineReason')">
          <n-input
            v-model:value="editForm.decline_reason"
            type="textarea"
            :placeholder="t('appointments.declineReasonPlaceholder')"
            :rows="2"
          />
        </n-form-item>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showEditModal = false"
            >{{ t('appointments.cancel') }}</n-button
          >
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="updateLoading"
            @click="handleUpdate"
            >{{ t('appointments.update') }}</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="{{ t('appointments.delete') }}"
      content="{{ t('appointments.deleteContent') }}"
      positive-text="{{ t('appointments.delete') }}"
      negative-text="{{ t('appointments.cancel') }}"
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
  useMessage,
  type DataTableColumns,
} from "naive-ui";
import { Search, RefreshCw, Plus, Edit, Trash2 } from "lucide-vue-next";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "../composables/useAppointments";
import { useRemoteSelect } from "~/composables/useRemoteSelect";
import type { Appointment } from "@icheck/api-contracts";
const { $api } = useNuxtApp()
const { t } = useI18n();

const message = useMessage();

// ---- Filters ----
const searchQuery = ref("");
const filterStatus = ref<string | null>(null);
const filterDateFrom = ref<number | null>(null);
const filterDateTo = ref<number | null>(null);

const toDate = (ts: number | null) => formatDate(ts);


const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
  ...(filterStatus.value ? { status: filterStatus.value } : {}),
  ...(filterDateFrom.value ? { date_from: toDate(filterDateFrom.value) } : {}),
  ...(filterDateTo.value ? { date_to: toDate(filterDateTo.value) } : {}),
}));

const { appointments, isLoading, error, refresh } = useAppointments(query);

// ---- Options ----
const statusOptions = [
  { label: t('appointments.status.pending'), value: "pending" },
  { label: t('appointments.status.confirmed'), value: "confirmed" },
  { label: t('appointments.status.declined'), value: "declined" },
  { label: t('appointments.status.completed'), value: "completed" },
  { label: t('appointments.status.cancelled'), value: "cancelled" },
];

const typeOptions = [
  { label: t('appointments.type.online'), value: "online" },
  { label: t('appointments.type.offline'), value: "offline" },
];

const paymentOptions = [
  { label: t('appointments.payment.card'), value: "card" },
  { label: t('appointments.payment.insurance'), value: "insurance" },
];

const paymentStatusOptions = [
  { label: t('appointments.paymentStatus.unpaid'), value: "unpaid" },
  { label: t('appointments.paymentStatus.paid'), value: "paid" },
];

// ---- Doctor remote select ----

const {
  options: doctorOptions,
  pending: doctorPending,
  handleSearch: doctorHandleSearch,
  handleScroll: doctorHandleScroll,
  handleValueChange: doctorHandleValueChange,
  onDropdownShow: doctorOnDropdownShow,
} = useRemoteSelect(
  (params) => $api<any>('/doctors/', {
    query: { page: params.page, per_page: params.per_page, search: params.search },
  }),
  (item: any) => ({ value: item.id, label: item.fullname }),
  { key: 'appointment-create-doctors', per_page: 10, debounceMs: 300, loadOnOpen: true }
)

const {
  options: patientOptions,
  pending: patientPending,
  handleSearch: patientHandleSearch,
  handleScroll: patientHandleScroll,
  onDropdownShow: patientOnDropdownShow,
} = useRemoteSelect(
  (params) => $api<any>('/users/', {
    query: { page: params.page, per_page: params.per_page, search: params.search },
  }),
  (item: any) => {
    const fullName =
      item.fullname ||
      [item.first_name, item.last_name].filter(Boolean).join(' ') ||
      item.username ||
      `${t('appointments.patient')} #${item.id}`
    return { value: item.id, label: fullName }
  },
  { key: 'appointment-create-patients', per_page: 10, debounceMs: 300, loadOnOpen: true }
)

// ---- Create ----
const showCreateModal = ref(false);
const createForm = reactive({
  doctor_id: null as number | null,
  user_id: null as number | null,
  fullname: "",
  type: "online" as "online" | "offline",
  date: null as number | null,
  start_time: null as number | null,
  end_time: null as number | null,
  complaints: "",
  status: "confirmed",
  payment_method: "card" as "card" | "insurance",
  payment_status: "unpaid",
  amount: "0.00",
  paid_amount: "0.00",
});

const onPatientChange = (value: number | null) => {
  createForm.user_id = value;
  if (value) createForm.fullname = "";
};

const { createAppointment, loading: createLoading } = useCreateAppointment();
const formatDate = (ts: number | null) => {
  if (!ts) return undefined;
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatTime = (ts: number | null) => {
  if (!ts) return undefined;
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};
const handleCreate = async () => {
  if (
    !createForm.doctor_id ||
    !createForm.date ||
    !createForm.start_time ||
    !createForm.end_time
  ) {
    message.warning(t('appointments.create.validation.requiredFields'));
    return;
  }

  if (!createForm.user_id && !createForm.fullname.trim()) {
    message.warning(t('appointments.create.validation.patientRequired'));
    return;
  }

  try {
    await createAppointment({
      doctor_id: createForm.doctor_id!,
      ...(createForm.user_id
        ? { user_id: createForm.user_id }
        : { fullname: createForm.fullname }),
      type: createForm.type,
      date: formatDate(createForm.date)!,
      start_time: formatTime(createForm.start_time)!,
      end_time: formatTime(createForm.end_time)!,
      complaints: createForm.complaints || undefined,
      status: createForm.status,
      payment_method: createForm.payment_method,
      payment_status: createForm.payment_status,
      amount: createForm.amount,
      paid_amount: createForm.paid_amount,
    });
    message.success(t('appointments.create.success'));
    showCreateModal.value = false;
    clearNuxtData("admin-appointments-list");
    await refresh();
  } catch (err: any) {
    console.log("Create error:", JSON.stringify(err?.data));
    message.error(err?.data?.error || t('appointments.create.error'));
  }
};

// ---- Edit ----
const showEditModal = ref(false);
const editingId = ref<number | null>(null);
const editForm = reactive({
  status: "" as Appointment["status"] | "",
  date: null as number | null,
  start_time: null as number | null,
  end_time: null as number | null,
  complaints: "",
  details: "",
  address: "",
  decline_reason: "",
  postpone_reason: "",
  payment_method: "card" as "card" | "insurance",
  payment_status: "unpaid" as "unpaid" | "paid",
  amount: "",
  paid_amount: "",
});

const { updateAppointment, loading: updateLoading } = useUpdateAppointment();
const parseTime = (time: string) => {
  const [h, m, s = "0"] = time.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m), Number(s), 0);
  return d.getTime();
};

const openEditModal = (row: Appointment) => {
  editingId.value = row.id;
  editForm.status = row.status;
  editForm.date = new Date(row.date).getTime();
  editForm.start_time = row.start_time ? parseTime(row.start_time) : null;
  editForm.end_time = row.end_time ? parseTime(row.end_time) : null;
  editForm.complaints = row.complaints ?? "";
  editForm.details = row.details ?? "";
  editForm.address = row.address ?? "";
  editForm.decline_reason = "";
  editForm.postpone_reason = "";
  editForm.payment_status = row.payment.status;
  editForm.payment_method = row.payment.method as "card" | "insurance";
  editForm.amount = String(row.payment.amount);
  editForm.paid_amount = String(row.payment.paid_amount);
  showEditModal.value = true;
};

const handleUpdate = async () => {
  if (!editingId.value) return;

  try {
    await updateAppointment(editingId.value, {
      status: editForm.status,
      date: formatDate(editForm.date),
      start_time: formatTime(editForm.start_time),
      end_time: formatTime(editForm.end_time),
      complaints: editForm.complaints || undefined,
      details: editForm.details || undefined,
      address: editForm.address || undefined,
      decline_reason: editForm.decline_reason || undefined,
      postpone_reason: editForm.postpone_reason || undefined,
      payment_status: editForm.payment_status,
      payment_method: editForm.payment_method,
      amount: editForm.amount || undefined,
      paid_amount: editForm.paid_amount || undefined,
    });

    message.success(t('appointments.edit.success'));
    showEditModal.value = false;
    clearNuxtData("admin-appointments-list");

    await refresh();
  } catch (err: any) {
    message.error(err?.data?.error || "Xəta baş verdi");
  }
};

// ---- Delete ----
const showDeleteModal = ref(false);
const deletingId = ref<number | null>(null);
const { deleteAppointment, loading: deleteLoading } = useDeleteAppointment();

const openDeleteModal = (id: number) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deletingId.value) return;
  try {
    await deleteAppointment(deletingId.value);
    message.success("Görüş silindi");
    showDeleteModal.value = false;
    clearNuxtData("admin-appointments-list");
    await refresh();
  } catch {
    message.error(t('common.error'));
  }
};

// ---- Status config ----
const statusConfig: Record<
  string,
  { type: "success" | "error" | "warning" | "default" | "info"; label: string }
> = {
  pending: { type: "warning", label: t('appointments.status.pending') },
  confirmed: { type: "success", label: t('appointments.status.confirmed') },
  declined: { type: "error", label: t('appointments.status.declined') },
  completed: { type: "info", label: t('appointments.status.completed') },
  cancelled: { type: "default", label: t('appointments.status.cancelled') },
};

// ---- Table ----
const columns: DataTableColumns<Appointment> = [
  {
    title: t('common.id'),
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
    title: t('appointments.patient'),
    key: "user",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#F0FDF4",
            style: "color:#16A34A;font-weight:800",
          },
          { default: () => row.user.fullname[0] }
        ),
        h(
          "span",
          { class: "font-bold text-slate-800 text-sm" },
          row.user.fullname
        ),
      ]),
  },
  {
    title: t('appointments.doctor'),
    key: "doctor",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            color: "#F0F9FF",
            style: "color:#0369A1;font-weight:800",
          },
          { default: () => row.doctor.fullname[0] }
        ),
        h("div", { class: "flex flex-col" }, [
          h(
            "span",
            { class: "font-bold text-slate-800 text-sm" },
            row.doctor.fullname
          ),
          h(
            "span",
            { class: "text-xs text-slate-400" },
            row.doctor.workplace ?? "—"
          ),
        ]),
      ]),
  },
  {
    title: t('appointments.dateAndTime'),
    key: "date",
    render: (row) =>
      h("div", { class: "flex flex-col" }, [
        h("span", { class: "font-bold text-slate-700 text-sm" }, row.date),
        h(
          "span",
          { class: "text-xs text-slate-400" },
          `${row.start_time.slice(0, 5)} — ${row.end_time.slice(0, 5)}`
        ),
      ]),
  },
  {
    title: t('appointments.type_label'),
    key: "type",
    render: (row) =>
      h(
        NTag,
        {
          type: row.type === "online" ? "info" : "default",
          round: true,
          size: "small",
          bordered: false,
          style: "font-weight:800;font-size:10px;text-transform:uppercase;",
        },
        { default: () => row.type }
      ),
  },
  {
    title: t('appointments.status_label'),
    key: "status",
    render: (row) => {
      const cfg = statusConfig[row.status] ?? {
        type: "default",
        label: row.status,
      };
      return h(
        NTag,
        {
          type: cfg.type,
          round: true,
          size: "small",
          bordered: false,
          style: "font-weight:800;font-size:10px;text-transform:uppercase;",
        },
        { default: () => cfg.label }
      );
    },
  },
  {
    title: t('appointments.payment_label'),
    key: "payment",
    render: (row) =>
      h("div", { class: "flex flex-col" }, [
        h(
          "span",
          { class: "font-bold text-slate-700 text-sm" },
          `${row.payment.amount} ₼`
        ),
        h(
          "span",
          { class: "text-xs text-slate-400 capitalize" },
          row.payment.status
        ),
      ]),
  },
  {
    title: t('common.actions'),
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