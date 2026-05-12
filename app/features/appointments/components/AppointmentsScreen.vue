<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Appointments
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Manage patient appointments across the network.
        </p>
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
          Create Appointment
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
      <n-alert v-else-if="error" type="error">Məlumat yüklənmədi</n-alert>
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
        <n-form-item label="Həkim *">
          <n-select
            v-model:value="createForm.doctor_id"
            filterable
            remote
            clearable
            placeholder="Həkim seçin"
            :options="doctorOptions"
            :loading="doctorPending"
            :menu-props="{ onScroll: doctorHandleScroll }"
            @update:value="doctorHandleValueChange"
            @search="doctorHandleSearch"
            @update:show="(show: boolean) => show && doctorOnDropdownShow()"
          />
        </n-form-item>
        <!-- doctor select-dən sonra əlavə et -->
        <n-form-item label="Pasiyent (seçin və ya ad yazın)">
          <n-select
            v-model:value="createForm.user_id"
            filterable
            remote
            clearable
            placeholder="Pasiyent seçin"
            :options="patientOptions"
            :loading="patientPending"
            :menu-props="{ onScroll: patientHandleScroll }"
            @update:value="onPatientChange"
            @search="patientHandleSearch"
            @update:show="(show: boolean) => show && patientOnDropdownShow()"
          />
        </n-form-item>

        <!-- user_id seçilməyibsə fullname məcburidir -->
        <n-form-item v-if="!createForm.user_id" label="Pasiyent adı *">
          <n-input
            v-model:value="createForm.fullname"
            placeholder="Ad Soyad..."
            size="large"
            class="rounded-xl"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Növ">
            <n-select
              v-model:value="createForm.type"
              :options="typeOptions"
              size="large"
            />
          </n-form-item>
          <n-form-item label="Status">
            <n-select
              v-model:value="createForm.status"
              :options="statusOptions"
              size="large"
            />
          </n-form-item>
        </div>

        <n-form-item label="Tarix *">
          <n-date-picker
            v-model:value="createForm.date"
            type="date"
            size="large"
            class="w-full"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Başlama *">
            <n-time-picker
              v-model:value="createForm.start_time"
              size="large"
              class="w-full"
            />
          </n-form-item>
          <n-form-item label="Bitmə *">
            <n-time-picker
              v-model:value="createForm.end_time"
              size="large"
              class="w-full"
            />
          </n-form-item>
        </div>

        <n-form-item label="Şikayətlər">
          <n-input
            v-model:value="createForm.complaints"
            type="textarea"
            placeholder="Şikayətlər..."
            :rows="2"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Ödəniş metodu">
            <n-select
              v-model:value="createForm.payment_method"
              :options="paymentOptions"
              size="large"
            />
          </n-form-item>
          <n-form-item label="Ödəniş statusu">
            <n-select
              v-model:value="createForm.payment_status"
              :options="paymentStatusOptions"
              size="large"
            />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Məbləğ">
            <n-input
              v-model:value="createForm.amount"
              placeholder="0.00"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
          <n-form-item label="Ödənilmiş">
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
          <n-form-item label="Status">
            <n-select
              v-model:value="editForm.status"
              :options="statusOptions"
              size="large"
            />
          </n-form-item>
          <n-form-item label="Ödəniş statusu">
            <n-select
              v-model:value="editForm.payment_status"
              :options="paymentStatusOptions"
              size="large"
            />
          </n-form-item>
        </div>
        <n-form-item label="Ödəniş metodu">
          <n-select
            v-model:value="editForm.payment_method"
            :options="paymentOptions"
            size="large"
          />
        </n-form-item>
        <n-form-item label="Əlavə məlumat">
          <n-input
            v-model:value="editForm.details"
            type="textarea"
            placeholder="Əlavə məlumat..."
            :rows="2"
          />
        </n-form-item>

        <n-form-item label="Ünvan">
          <n-input
            v-model:value="editForm.address"
            placeholder="Ünvan..."
            size="large"
            class="rounded-xl"
          />
        </n-form-item>

        <n-form-item label="Təxirə salma səbəbi">
          <n-input
            v-model:value="editForm.postpone_reason"
            type="textarea"
            placeholder="Səbəb..."
            :rows="2"
          />
        </n-form-item>

        <n-form-item label="Tarix">
          <n-date-picker
            v-model:value="editForm.date"
            type="date"
            size="large"
            class="w-full"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Başlama">
            <n-time-picker
              v-model:value="editForm.start_time"
              size="large"
              class="w-full"
            />
          </n-form-item>
          <n-form-item label="Bitmə">
            <n-time-picker
              v-model:value="editForm.end_time"
              size="large"
              class="w-full"
            />
          </n-form-item>
        </div>

        <n-form-item label="Şikayətlər">
          <n-input
            v-model:value="editForm.complaints"
            type="textarea"
            placeholder="Şikayətlər..."
            :rows="2"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Məbləğ">
            <n-input
              v-model:value="editForm.amount"
              placeholder="0.00"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
          <n-form-item label="Ödənilmiş">
            <n-input
              v-model:value="editForm.paid_amount"
              placeholder="0.00"
              size="large"
              class="rounded-xl"
            />
          </n-form-item>
        </div>

        <n-form-item label="Rədd etmə səbəbi">
          <n-input
            v-model:value="editForm.decline_reason"
            type="textarea"
            placeholder="Səbəb..."
            :rows="2"
          />
        </n-form-item>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showEditModal = false"
            >Ləğv et</n-button
          >
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="updateLoading"
            @click="handleUpdate"
            >Yenilə</n-button
          >
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Appointment"
      content="Bu görüşü silmək istədiyinizə əminsiniz?"
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
import { getRequestHeaders } from "../composables/useAppointments";

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
  { label: "Gözləyir", value: "pending" },
  { label: "Təsdiqlənib", value: "confirmed" },
  { label: "Rədd edilib", value: "declined" },
  { label: "Tamamlandı", value: "completed" },
  { label: "Ləğv edilib", value: "cancelled" },
];

const typeOptions = [
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
];

const paymentOptions = [
  { label: "Kart", value: "card" },
  { label: "Sığorta", value: "insurance" },
];

const paymentStatusOptions = [
  { label: "Ödənilməyib", value: "unpaid" },
  { label: "Ödənilib", value: "paid" },
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
  (params) =>
    $fetch<any>("https://icheckapi.200soft.com/api/v1/doctors/", {
      headers: getRequestHeaders(),
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({ value: item.id, label: item.fullname }),
  {
    key: "appointment-create-doctors",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
  }
);

const {
  options: patientOptions,
  pending: patientPending,
  handleSearch: patientHandleSearch,
  handleScroll: patientHandleScroll,
  onDropdownShow: patientOnDropdownShow,
} = useRemoteSelect(
  (params) =>
    $fetch<any>("https://icheckapi.200soft.com/api/v1/users/", {
      headers: getRequestHeaders(),
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => {
    const fullName =
      item.fullname ||
      [item.first_name, item.last_name].filter(Boolean).join(" ") ||
      item.name ||
      item.username ||
      item.email ||
      `Pasiyent #${item.id}`;

    return {
      value: item.id,
      label: fullName,
    };
  },
  {
    key: "appointment-create-patients",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
  }
);

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
    message.warning("Məcburi xanaları doldurun");
    return;
  }

  if (!createForm.user_id && !createForm.fullname.trim()) {
    message.warning("Pasiyent seçin və ya adını daxil edin");
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
    message.success("Görüş yaradıldı");
    showCreateModal.value = false;
    clearNuxtData("admin-appointments-list");
    await refresh();
  } catch (err: any) {
    console.log("Create error:", JSON.stringify(err?.data));
    message.error(err?.data?.error || "Xəta baş verdi");
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

    message.success("Görüş yeniləndi");
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
    message.error("Xəta baş verdi");
  }
};

// ---- Status config ----
const statusConfig: Record<
  string,
  { type: "success" | "error" | "warning" | "default" | "info"; label: string }
> = {
  pending: { type: "warning", label: "Gözləyir" },
  confirmed: { type: "success", label: "Təsdiqlənib" },
  declined: { type: "error", label: "Rədd edilib" },
  completed: { type: "info", label: "Tamamlandı" },
  cancelled: { type: "default", label: "Ləğv edilib" },
};

// ---- Table ----
const columns: DataTableColumns<Appointment> = [
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
    title: "Pasiyent",
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
    title: "Tarix & Vaxt",
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
    title: "Növ",
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
    title: "Status",
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
    title: "Ödəniş",
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