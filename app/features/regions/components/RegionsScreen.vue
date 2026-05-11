<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Geographical Regions</h2>
        <p class="text-slate-500 text-sm font-medium">
          Configure and manage service deployment regions across the global healthcare network.
        </p>
      </div>
      <n-button type="primary" size="large" class="!rounded-xl font-bold px-8" @click="openCreateModal">
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create New Region
      </n-button>
    </div>

    <!-- Table Card -->
    <n-card :bordered="false" class="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <div class="mb-6 flex items-center justify-between gap-6 p-1">
        <n-input v-model:value="searchQuery" placeholder="Search regions..." size="large" class="rounded-xl max-w-sm">
          <template #prefix><Search :size="18" class="text-slate-400" /></template>
        </n-input>
        <n-button quaternary circle size="medium" @click="refresh()">
          <template #icon>
            <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" class="text-slate-500" />
          </template>
        </n-button>
      </div>

      <div v-if="isLoading" class="space-y-4">
        <div v-for="i in 6" :key="i" class="h-10 bg-slate-50 rounded-lg animate-pulse" />
      </div>
      <n-alert v-else-if="error" type="error">Məlumat yüklənmədi</n-alert>
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

    <!-- Create / Edit Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingRegion ? 'Edit Region' : 'Create Region'"
      class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
    >
      <n-tabs type="segment" animated v-model:value="activeTab" @update:value="handleTabChange">
        <n-tab-pane name="az" tab="AZ">
          <n-spin :show="isLoadingLang && activeTab === 'az'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Ad (AZ)">
                <n-input v-model:value="modalForm.title.az" placeholder="Region adı..." size="large" class="rounded-xl" />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>

        <n-tab-pane name="en" tab="EN">
          <n-spin :show="isLoadingLang && activeTab === 'en'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Name (EN)">
                <n-input v-model:value="modalForm.title.en" placeholder="Region name..." size="large" class="rounded-xl" />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>

        <n-tab-pane name="ru" tab="RU">
          <n-spin :show="isLoadingLang && activeTab === 'ru'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Название (RU)">
                <n-input v-model:value="modalForm.title.ru" placeholder="Название региона..." size="large" class="rounded-xl" />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>
      </n-tabs>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showModal = false">Cancel</n-button>
          <n-button
            type="primary"
            class="rounded-xl px-8"
            :loading="createLoading || updateLoading"
            @click="handleSubmit"
          >
            {{ editingRegion ? 'Update' : 'Save' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Region"
      content="Bu regionu silmək istədiyinizə əminsiniz?"
      positive-text="Sil"
      negative-text="Ləğv et"
      :loading="deleteLoading"
      @positive-click="handleDelete"
      @negative-click="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, reactive } from 'vue'
import { NButton, NSpace, NAvatar, NSpin, useMessage, type DataTableColumns } from 'naive-ui'
import { Plus, Search, RefreshCw, Edit, Trash2 } from 'lucide-vue-next'
import { useRegions, useCreateRegion, useUpdateRegion, useDeleteRegion } from '../composables/useRegions'
import type { Region } from '@icheck/api-contracts'

const message = useMessage()

const searchQuery = ref('')
const { regions, isLoading, error, refresh } = useRegions(searchQuery)

// ---- Modal state ----
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingRegion = ref<Region | null>(null)
const deletingId = ref<number | null>(null)
const activeTab = ref('az')
const isLoadingLang = ref(false)
const loadedLangs = ref(new Set<string>())

const modalForm = reactive({
  title: { az: '', en: '', ru: '' },
})

const resetForm = () => {
  modalForm.title = { az: '', en: '', ru: '' }
}

// ---- Composables ----
const { createRegion, loading: createLoading } = useCreateRegion()
const { updateRegion, loading: updateLoading } = useUpdateRegion()
const { deleteRegion, loading: deleteLoading } = useDeleteRegion()

// ---- Lang fetch ----
const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return
  isLoadingLang.value = true
  try {
    const token = useCookie('icheck_access').value
    const data = await $fetch<{ data: Region }>(`https://icheckapi.200soft.com/api/v1/regions/${id}/`, {
      headers: {
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    modalForm.title[lang as 'az' | 'en' | 'ru'] = data.data.title
    loadedLangs.value.add(lang)
  } catch {
    message.error(`${lang.toUpperCase()} dilində məlumat yüklənmədi`)
  } finally {
    isLoadingLang.value = false
  }
}

const handleTabChange = async (lang: string) => {
  activeTab.value = lang
  if (editingRegion.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingRegion.value.id, lang)
  }
}

// ---- Handlers ----
const openCreateModal = () => {
  editingRegion.value = null
  resetForm()
  activeTab.value = 'az'
  loadedLangs.value = new Set()
  showModal.value = true
}

const openEditModal = async (row: Region) => {
  editingRegion.value = row
  resetForm()
  loadedLangs.value = new Set()
  activeTab.value = 'az'
  showModal.value = true
  await fetchLangData(row.id, 'az')
}

const openDeleteModal = (id: number) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const handleSubmit = async () => {
  const titleObj: Record<string, string> = {}
  if (modalForm.title.az) titleObj.az = modalForm.title.az
  if (modalForm.title.en) titleObj.en = modalForm.title.en
  if (modalForm.title.ru) titleObj.ru = modalForm.title.ru

  if (Object.keys(titleObj).length === 0) {
    message.warning('Ən azı bir dildə ad daxil edin')
    return
  }

  try {
    if (editingRegion.value) {
      await updateRegion(editingRegion.value.id, { title: titleObj })
      message.success('Region yeniləndi')
    } else {
      await createRegion({ title: titleObj })
      message.success('Region yaradıldı')
    }
    showModal.value = false
    clearNuxtData('regions-list')
    await refresh()
  } catch {
    message.error('Xəta baş verdi')
  }
}

const handleDelete = async () => {
  if (!deletingId.value) return
  try {
    await deleteRegion(deletingId.value)
    message.success('Region silindi')
    showDeleteModal.value = false
    await refresh()
  } catch {
    message.error('Silinmə zamanı xəta baş verdi')
  }
}

// ---- Table ----
const columns: DataTableColumns<Region> = [
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
    render: (row) => h('span', { class: 'font-bold text-slate-700' }, `${row.clinic_ids.length} klinika`),
  },
  {
    title: 'Actions',
    key: 'actions',
    align: 'right',
    render: (row) =>
      h(NSpace, { justify: 'end' }, {
        default: () => [
          h(NButton, {
            size: 'small', quaternary: true, circle: true,
            class: 'hover:bg-indigo-50 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all',
            onClick: () => openEditModal(row),
          }, { default: () => h(Edit, { size: 16 }) }),
          h(NButton, {
            size: 'small', quaternary: true, circle: true, type: 'error',
            class: 'hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all',
            onClick: () => openDeleteModal(row.id),
          }, { default: () => h(Trash2, { size: 16 }) }),
        ],
      }),
  },
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