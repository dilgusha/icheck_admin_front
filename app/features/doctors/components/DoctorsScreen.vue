<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ t("doctors.title") }}
        </h2>
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
          <span class="text-xs text-slate-400 font-bold uppercase" >{{ t("doctors.price") }}</span>
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
            >{{ t("doctors.experience") }}</span
          >
          <n-input-number
            v-model:value="filterExpMin"
            :placeholder="t('doctors.experience_min')"
            size="large"
            class="w-24"
            :min="0"
          />
          <span class="text-slate-400">—</span>
          <n-input-number
            v-model:value="filterExpMax"
            :placeholder="t('doctors.experience_max')"
            size="large"
            class="w-24"
            :min="0"
          />
        </div>

        <div class="flex items-center gap-4 ml-auto">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Top</span>
            <n-switch v-model:value="filterTop" @update:value="refresh()" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Sığorta</span>
            <n-switch
              v-model:value="filterInsurance"
              @update:value="refresh()"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Mental sağlamlıq</span>
            <n-switch
              v-model:value="filterMentalHealth"
              @update:value="refresh()"
            />
          </div>
        </div>
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
        :data="doctors"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
        :scroll-x="800"

      />
    </n-card>

    <!-- View Modal -->
    <n-modal
      v-model:show="showViewModal"
      preset="card"
      title="Doctor Details"
      class="max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="viewingDoctor" class="flex flex-col gap-6 p-2">
        <div
          class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"
        >
          <n-avatar
            :size="64"
            round
            :src="viewingDoctor.avatar_url ?? undefined"
            color="#F0F9FF"
            style="
              color: #0369a1;
              font-weight: 800;
              font-size: 28px;
              border: 2px solid #bae6fd;
            "
          >
            <template v-if="!viewingDoctor.avatar_url">
              {{ viewingDoctor.fullname[0] }}
            </template>
          </n-avatar>
          <div>
            <h3 class="text-2xl font-bold text-slate-800 tracking-tight">
              {{ viewingDoctor.fullname }}
            </h3>
            <p
              class="text-sm font-medium text-slate-500 capitalize flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
              {{ viewingDoctor.gender }}
            </p>
          </div>
        </div>

        <n-descriptions
          bordered
          :column="2"
          size="small"
          label-placement="top"
          class="modern-descriptions"
        >
          <n-descriptions-item label="Workplace">
            {{ viewingDoctor.workplace ?? "—" }}
          </n-descriptions-item>

          <n-descriptions-item label="Təcrübə">
            {{
              viewingDoctor.experience_years != null
                ? `${viewingDoctor.experience_years} il`
                : "—"
            }}
          </n-descriptions-item>

          <n-descriptions-item label="Online qiymət">
            <span class="font-bold text-indigo-600">
              {{
                viewingDoctor.price != null ? `${viewingDoctor.price} ₼` : "—"
              }}
            </span>
          </n-descriptions-item>

          <n-descriptions-item label="Offline qiymət">
            <span class="font-bold text-slate-700">
              {{
                viewingDoctor.offline_price != null
                  ? `${viewingDoctor.offline_price} ₼`
                  : "—"
              }}
            </span>
          </n-descriptions-item>

          <n-descriptions-item label="Yalnız offline">
            <n-tag
              :type="viewingDoctor.only_offline ? 'warning' : 'success'"
              size="small"
              round
              bordered
            >
              {{ viewingDoctor.only_offline ? "Bəli" : "Xeyr" }}
            </n-tag>
          </n-descriptions-item>

          <n-descriptions-item label="Sığorta">
            <n-tag
              :type="viewingDoctor.insurance_accepted ? 'success' : 'default'"
              size="small"
              round
              bordered
            >
              {{
                viewingDoctor.insurance_accepted ? "Qəbul edir" : "Qəbul etmir"
              }}
            </n-tag>
          </n-descriptions-item>

          <n-descriptions-item label="Mental sağlamlıq">
            <n-tag
              :type="viewingDoctor.mental_health ? 'success' : 'default'"
              size="small"
              round
              bordered
            >
              {{ viewingDoctor.mental_health ? "Bəli" : "Xeyr" }}
            </n-tag>
          </n-descriptions-item>

          <n-descriptions-item label="Top">
            <n-tag
              :type="viewingDoctor.top ? 'success' : 'default'"
              size="small"
              round
              bordered
            >
              {{ viewingDoctor.top ? "Bəli" : "Xeyr" }}
            </n-tag>
          </n-descriptions-item>

          <n-descriptions-item label="İxtisaslar" :span="2">
            <div class="flex flex-wrap gap-2 pt-1">
              <n-tag
                v-for="s in viewingDoctor.specializations"
                :key="s.id"
                type="info"
                round
                size="small"
                bordered
              >
                {{ s.title }}
              </n-tag>
              <span v-if="!viewingDoctor.specializations?.length">—</span>
            </div>
          </n-descriptions-item>
        </n-descriptions>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button
            strong
            secondary
            class="rounded-xl px-6"
            @click="showViewModal = false"
          >
            Bağla
          </n-button>
        </div>
      </template>
    </n-modal>
    <!-- <n-modal
      v-model:show="showViewModal"
      preset="card"
      title="Doctor Details"
      class="max-w-lg rounded-3xl overflow-hidden shadow-2xl"
    >
      <div v-if="viewingDoctor" class="flex flex-col gap-4 p-2">
        <div class="flex items-center gap-4">
          <n-avatar
            :size="52"
            round
            :src="viewingDoctor.avatar_url ?? undefined"
            color="#F0F9FF"
            style="
              color: #0369a1;
              font-weight: 800;
              font-size: 24px;
              border: 2px solid #bae6fd;
            "
          >
            <template v-if="!viewingDoctor.avatar_url">{{
              viewingDoctor.fullname[0]
            }}</template>
          </n-avatar>
          <div>
            <h3 class="text-xl font-bold text-slate-800">
              {{ viewingDoctor.fullname }}
            </h3>
            <p class="text-sm text-slate-500 capitalize">
              {{ viewingDoctor.gender }}
            </p>
          </div>
        </div>

        <n-descriptions bordered :column="1" size="small">
          <n-descriptions-item label="Workplace">{{
            viewingDoctor.workplace ?? "—"
          }}</n-descriptions-item>
          <n-descriptions-item label="Təcrübə">{{
            viewingDoctor.experience_years != null
              ? `${viewingDoctor.experience_years} il`
              : "—"
          }}</n-descriptions-item>
          <n-descriptions-item label="Online qiymət">{{
            viewingDoctor.price != null ? `${viewingDoctor.price} ₼` : "—"
          }}</n-descriptions-item>
          <n-descriptions-item label="Offline qiymət">{{
            viewingDoctor.offline_price != null
              ? `${viewingDoctor.offline_price} ₼`
              : "—"
          }}</n-descriptions-item>
          <n-descriptions-item label="Yalnız offline">
            <n-tag
              :type="viewingDoctor.only_offline ? 'warning' : 'success'"
              size="small"
              round
              bordered
            >
              {{ viewingDoctor.only_offline ? "Bəli" : "Xeyr" }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="Sığorta">
            <n-tag
              :type="viewingDoctor.insurance_accepted ? 'success' : 'default'"
              size="small"
              round
              bordered
            >
              {{
                viewingDoctor.insurance_accepted ? "Qəbul edir" : "Qəbul etmir"
              }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="Mental sağlamlıq">
            <n-tag
              :type="viewingDoctor.mental_health ? 'success' : 'default'"
              size="small"
              round
              bordered
            >
              {{ viewingDoctor.mental_health ? "Bəli" : "Xeyr" }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="Top">
            <n-tag
              :type="viewingDoctor.top ? 'success' : 'default'"
              size="small"
              round
              bordered
            >
              {{ viewingDoctor.top ? "Bəli" : "Xeyr" }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="İxtisaslar">
            <n-tag
              v-for="s in viewingDoctor.specializations"
              :key="s.id"
              type="info"
              round
              size="small"
              bordered
            >
              {{ s.title }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </div>

      <template #action>
        <div class="flex justify-end">
          <n-button ghost @click="showViewModal = false">Bağla</n-button>
        </div>
      </template>
    </n-modal> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from "vue";
import {
  NAvatar,
  NButton,
  NSpace,
  NTag,
  NDescriptions,
  NDescriptionsItem,
  type DataTableColumns,
  type SelectOption,
} from "naive-ui";
import { Search, RefreshCw, Eye } from "lucide-vue-next";
import { useDoctors } from "../composables/useDoctors";
import type { Doctor } from "@icheck/api-contracts";
import { useRemoteSelect } from "~/composables/useRemoteSelect";

const { $api } = useNuxtApp();
const { t } = useI18n();
const searchQuery = ref("");
const filterSpecializationId = ref<string | null>(null);
const filterPriceMin = ref<number | null>(null);
const filterPriceMax = ref<number | null>(null);
const filterExpMin = ref<number | null>(null);
const filterExpMax = ref<number | null>(null);
const filterTop = ref(false);
const filterInsurance = ref(false);
const filterMentalHealth = ref(false);

const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
  ...(filterSpecializationId.value
    ? { specialization_id: filterSpecializationId.value }
    : {}),
  ...(filterPriceMin.value != null ? { price_min: filterPriceMin.value } : {}),
  ...(filterPriceMax.value != null ? { price_max: filterPriceMax.value } : {}),
  ...(filterExpMin.value != null ? { experience_min: filterExpMin.value } : {}),
  ...(filterExpMax.value != null ? { experience_max: filterExpMax.value } : {}),
  ...(filterTop.value ? { top: true } : {}),
  ...(filterInsurance.value ? { insurance_accepted: true } : {}),
  ...(filterMentalHealth.value ? { mental_health: true } : {}),
}));

const { doctors, isLoading, error, refresh } = useDoctors(query);

// ---- Specialization remote select ----
const specializationInitialOption = computed<SelectOption | null>(() => {
  const id = filterSpecializationId.value;
  if (id == null) return null;
  return { value: id, label: `Specialization #${id}` };
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
  (item: any) => ({ value: String(item.id), label: item.title }),
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

// ---- View modal ----
const showViewModal = ref(false);
const viewingDoctor = ref<Doctor | null>(null);

const openViewModal = (row: Doctor) => {
  viewingDoctor.value = row;
  showViewModal.value = true;
};

// ---- Table ----
const columns: DataTableColumns<Doctor> = [
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
    title: "Doctor",
    key: "fullname",
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
    title: "İxtisaslar",
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
    title: "Status",
    key: "status",
    render: (row) =>
      h("div", { class: "flex flex-wrap gap-1" }, [
        row.top
          ? h(
              NTag,
              {
                type: "success",
                size: "small",
                round: true,
                bordered: false,
                style: "font-size:10px;font-weight:800;",
              },
              { default: () => "Top" }
            )
          : null,
        row.insurance_accepted
          ? h(
              NTag,
              {
                type: "info",
                size: "small",
                round: true,
                bordered: false,
                style: "font-size:10px;font-weight:800;",
              },
              { default: () => "Sığorta" }
            )
          : null,
        row.only_offline
          ? h(
              NTag,
              {
                type: "warning",
                size: "small",
                round: true,
                bordered: false,
                style: "font-size:10px;font-weight:800;",
              },
              { default: () => "Offline" }
            )
          : null,
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
                  "hover:bg-blue-50 hover:text-blue-600  transition-all",
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