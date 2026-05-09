<template>
  <div class="flex flex-col gap-8">
    <!-- Header Section -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          Geographical Regions
        </h2>
        <p class="text-slate-500 text-sm font-medium">
          Configure and manage service deployment regions across the global
          healthcare network.
        </p>
      </div>

      <div class="flex items-center gap-4">
        <n-button quaternary size="large" class="!rounded-xl font-semibold text-slate-600">
          <template #icon><Download :size="18" /></template>
          Export
        </n-button>
        <n-button
          type="primary"
          size="large"
          class="!rounded-xl font-bold px-8"
          @click="showAddModal = true"
        >
          <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
          Create New Region
        </n-button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <n-card
        v-for="stat in stats"
        :key="stat.label"
        size="small"
        class="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white"
      >
        <div class="flex items-center p-2 gap-5">
          <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center', stat.colorClass.replace('text-', 'bg-')]">
            <component :is="stat.icon" :class="stat.colorClass" :size="28" />
          </div>
          <div class="flex flex-col gap-0.5">
            <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{{ stat.label }}</p>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-800">{{ stat.value }}</span>
              <span v-if="stat.trend" class="text-[10px] font-bold text-green-500 flex items-center gap-0.5">
                <ArrowUp :size="10" /> {{ stat.trend }}
              </span>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Main Table Card -->
    <n-card :bordered="false" class="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <!-- Toolbar -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-6 p-1">
        <div class="flex items-center gap-3 flex-1 min-w-[300px]">
          <div class="relative flex-1 group">
            <n-input
              v-model:value="searchQuery"
              placeholder="Quick search regions..."
              size="large"
              class="rounded-xl"
            >
              <template #prefix>
                <Search :size="18" class="text-slate-400" />
              </template>
            </n-input>
          </div>
        </div>

        <div class="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <n-button quaternary circle size="medium" @click="refresh()">
            <template #icon>
              <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" class="text-slate-500" />
            </template>
          </n-button>
          <div class="w-px h-4 bg-slate-300 mx-1"></div>
          <n-button quaternary class="rounded-lg text-slate-600 font-bold px-4">
            <template #icon><Filter :size="16" class="mr-1" /></template>
            Advanced Filtering
          </n-button>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="isLoading" class="space-y-4">
        <div class="h-10 bg-slate-50 rounded-lg animate-pulse" v-for="i in 6" :key="i" />
      </div>

      <!-- Error -->
      <n-alert v-else-if="error" type="error">
        Məlumat yüklənmədi: {{ error }}
      </n-alert>

      <!-- Table -->
      <n-data-table
        v-else
        :columns="columns"
        :data="regions"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
      />
    </n-card>

    <!-- Modal -->
    <n-modal
      v-model:show="showAddModal"
      preset="card"
      title="Create Deployment Region"
      class="max-w-xl rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="space-y-6 p-4">
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Region Name" class="col-span-2">
            <n-input placeholder="e.g. Western European Hub" size="large" class="rounded-xl" />
          </n-form-item>
        </div>
      </div>
      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showAddModal = false">Cancel</n-button>
          <n-button type="primary" class="rounded-xl px-8" @click="showAddModal = false">Save</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { NButton, NTag, NSpace, NAvatar, type DataTableColumns } from 'naive-ui'
import {
  Plus, Search, Filter, RefreshCw, Globe,
  Activity, MoreHorizontal, Edit, Trash2,
  Download, ArrowUp, Users,
} from 'lucide-vue-next'
import { useRegions } from '../composables/useRegions'

// ---- Data ----
const searchQuery = ref('')
const showAddModal = ref(false)
const { regions, isLoading, error, refresh } = useRegions(searchQuery)

// ---- Stats ----
const stats = [
  { label: 'Total Network Nodes', value: '1,248', icon: Globe, colorClass: 'text-indigo-500', trend: '12%' },
  { label: 'Active Facilities', value: '982', icon: Activity, colorClass: 'text-emerald-500', trend: '4%' },
  { label: 'Staff Registered', value: '14,2k', icon: Users, colorClass: 'text-amber-500', trend: '18%' },
  { label: 'System Uptime', value: '99.9%', icon: Activity, colorClass: 'text-blue-500' },
]

// ---- Table ----
type RegionRow = { id: number; title: string; clinic_ids: number[] }

const columns: DataTableColumns<RegionRow> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    render: (row) => h('span', { class: 'text-slate-400 font-mono text-xs font-bold' }, `#${row.id}`),
  },
  {
    title: 'Region Name',
    key: 'title',             
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'flex items-center gap-3' }, [
        h(NAvatar, { round: true, size: 32, color: '#EEF2FF', style: 'color:#4F46E5;font-weight:800;border:1px solid #E0E7FF' },
          { default: () => row.title[0] }),
        h('span', { class: 'font-bold text-slate-800' }, row.title),
      ]),
  },
  {
    title: 'Clinics',
    key: 'clinic_ids',
    render: (row) => h('span', { class: 'font-bold text-slate-700' }, row.clinic_ids.length),
  },
  // ... actions
]
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