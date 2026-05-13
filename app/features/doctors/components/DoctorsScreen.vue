<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Doctors
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          View doctors across the healthcare network.
        </p>
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

    <!-- Table Card -->
    <n-card
      :bordered="false"
      class="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
    >
      <!-- Toolbar -->
      <div class="mb-6 flex flex-wrap items-center gap-4 p-1">
        <n-input
          v-model:value="searchQuery"
          placeholder="Search doctors..."
          size="large"
          class="rounded-xl max-w-sm"
          clearable
        >
          <template #prefix
            ><Search :size="18" class="text-slate-400"
          /></template>
        </n-input>

        <n-select
          v-model:value="filterSpecializationId"
          :options="specializationOptions"
          :loading="specializationPending"
          filterable
          remote
          clearable
          placeholder="Specialization"
          size="large"
          class="w-48"
          :menu-props="{ onScroll: specializationHandleScroll }"
          @update:value="onSpecializationUpdate"
          @search="specializationHandleSearch"
          @update:show="(show: boolean) => show && specializationOnDropdownShow()"
        />

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400 font-bold uppercase"
            >Qiymət:</span
          >
          <n-input-number
            v-model:value="filterPriceMin"
            placeholder="Min"
            size="large"
            class="w-28"
            :min="0"
          />
          <span class="text-slate-400">—</span>
          <n-input-number
            v-model:value="filterPriceMax"
            placeholder="Max"
            size="large"
            class="w-28"
            :min="0"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400 font-bold uppercase"
            >Təcrübə:</span
          >
          <n-input-number
            v-model:value="filterExpMin"
            placeholder="Min"
            size="large"
            class="w-24"
            :min="0"
          />
          <span class="text-slate-400">—</span>
          <n-input-number
            v-model:value="filterExpMax"
            placeholder="Max"
            size="large"
            class="w-24"
            :min="0"
          />
        </div>
      </div>

      <!-- Skeleton -->
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
        :data="doctors"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from "vue";
import {
  NAvatar,
  NButton,
  type DataTableColumns,
  type SelectOption,
} from "naive-ui";
import { Search, RefreshCw } from "lucide-vue-next";
import { useDoctors } from "../composables/useDoctors";
// import { useSpecializations } from '../../specializations/composables/useSpecializations'
import type { Doctor } from "@icheck/api-contracts";
import { useRemoteSelect } from "~/composables/useRemoteSelect";
const { $api } = useNuxtApp();

const searchQuery = ref("");
const filterSpecializationId = ref<string | null>(null);
const filterPriceMin = ref<number | null>(null);
const filterPriceMax = ref<number | null>(null);
const filterExpMin = ref<number | null>(null);
const filterExpMax = ref<number | null>(null);

const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
  ...(filterSpecializationId.value
    ? { specialization_id: filterSpecializationId.value }
    : {}),
  ...(filterPriceMin.value != null ? { price_min: filterPriceMin.value } : {}),
  ...(filterPriceMax.value != null ? { price_max: filterPriceMax.value } : {}),
  ...(filterExpMin.value != null ? { experience_min: filterExpMin.value } : {}),
  ...(filterExpMax.value != null ? { experience_max: filterExpMax.value } : {}),
}));

const { doctors, isLoading, error, refresh } = useDoctors(query);
// const { specializations } = useSpecializations()

// const specializationOptions = computed(() =>
//   specializations.value.map((s) => ({ label: s.title, value: String(s.id) }))
// )

const specializationInitialOption = computed<SelectOption | null>(() => {
  const id = filterSpecializationId.value;
  if (id == null) return null;

  return {
    value: id,
    label: `Specialization #${id}`,
  };
});

const {
  options: specializationOptions,
  pending: specializationPending,
  handleSearch: specializationHandleSearch,
  handleScroll: specializationHandleScroll,
  handleValueChange: specializationHandleValueChange,
  onDropdownShow: specializationOnDropdownShow,
} = useRemoteSelect(
  (params) =>
    $api<any>("/specializations/", {
      query: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
      },
    }),
  (item: any) => ({
    value: String(item.id),
    label: item.title,
  }),
  {
    key: "doctors-filter-specializations",
    per_page: 10,
    debounceMs: 300,
    loadOnOpen: true,
    initialOption: specializationInitialOption,
    selectedValues: computed(() => filterSpecializationId.value),
  }
);

function onSpecializationUpdate(value: string | null) {
  filterSpecializationId.value = value;
  specializationHandleValueChange();
}

const columns: DataTableColumns<Doctor> = [
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
    title: "Doctor",
    key: "fullname",
    sorter: "default",
    render: (row) =>
      h("div", { class: "flex items-center gap-3" }, [
        h(
          NAvatar,
          {
            round: true,
            size: 32,
            src: row.avatar_url ?? undefined,
            color: "#F0F9FF",
            style: "color:#0369A1;font-weight:800;border:1px solid #BAE6FD",
          },
          { default: () => row.fullname[0] }
        ),
        h("div", { class: "flex flex-col" }, [
          h("span", { class: "font-bold text-slate-800" }, row.fullname),
          h("span", { class: "text-xs text-slate-400" }, row.workplace ?? "—"),
        ]),
      ]),
  },
  {
    title: "Specializations",
    key: "specializations",
    render: (row) =>
      h(
        "div",
        { class: "flex flex-wrap gap-1" },
        row.specializations.map((s) =>
          h(
            "span",
            {
              class:
                "text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-md",
            },
            s.title
          )
        )
      ),
  },
  {
    title: "Təcrübə",
    key: "experience_years",
    render: (row) =>
      h(
        "span",
        { class: "text-slate-600 text-sm" },
        row.experience_years != null ? `${row.experience_years} il` : "—"
      ),
  },
  {
    title: "Qiymət",
    key: "price",
    render: (row) =>
      h("div", { class: "flex flex-col" }, [
        h(
          "span",
          { class: "text-slate-700 font-bold text-sm" },
          row.price != null ? `${row.price} ₼` : "—"
        ),
        row.offline_price
          ? h(
              "span",
              { class: "text-xs text-slate-400" },
              `Offline: ${row.offline_price} ₼`
            )
          : null,
      ]),
  },
  {
    title: "Gender",
    key: "gender",
    render: (row) =>
      h("span", { class: "text-slate-600 text-sm capitalize" }, row.gender),
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
  background-color: rgba(3, 105, 161, 0.02) !important;
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