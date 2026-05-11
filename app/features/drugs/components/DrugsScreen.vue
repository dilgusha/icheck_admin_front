<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Drugs</h2>
        <p class="text-slate-500 text-sm font-medium">Manage drugs in the healthcare network.</p>
      </div>
      <n-button type="primary" size="large" class="!rounded-xl font-bold px-8" @click="openCreateModal">
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create Drug
      </n-button>
    </div>

    <!-- Table Card -->
    <n-card :bordered="false" class="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <div class="mb-6 flex items-center justify-between gap-4 p-1">
        <n-input v-model:value="searchQuery" placeholder="Search drugs..." size="large" class="rounded-xl max-w-sm" clearable>
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
        :data="drugs"
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
      :title="editingDrug ? 'Edit Drug' : 'Create Drug'"
      class="max-w-md rounded-3xl overflow-hidden shadow-2xl"
    >
      <n-tabs type="segment" animated v-model:value="activeTab" @update:value="handleTabChange">
        <n-tab-pane name="az" tab="AZ">
          <n-spin :show="isLoadingLang && activeTab === 'az'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Ad (AZ)">
                <n-input v-model:value="modalForm.title.az" placeholder="Dərman adı..." size="large" class="rounded-xl" />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>

        <n-tab-pane name="en" tab="EN">
          <n-spin :show="isLoadingLang && activeTab === 'en'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Name (EN)">
                <n-input v-model:value="modalForm.title.en" placeholder="Drug name..." size="large" class="rounded-xl" />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>

        <n-tab-pane name="ru" tab="RU">
          <n-spin :show="isLoadingLang && activeTab === 'ru'">
            <div class="flex flex-col gap-4 pt-4">
              <n-form-item label="Название (RU)">
                <n-input v-model:value="modalForm.title.ru" placeholder="Название препарата..." size="large" class="rounded-xl" />
              </n-form-item>
            </div>
          </n-spin>
        </n-tab-pane>
      </n-tabs>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showModal = false">Cancel</n-button>
          <n-button type="primary" class="rounded-xl px-8" :loading="createLoading || updateLoading" @click="handleSubmit">
            {{ editingDrug ? 'Update' : 'Save' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Delete Modal -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="Delete Drug"
      content="Bu dərmanı silmək istədiyinizə əminsiniz?"
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
import { useDrugs, useCreateDrug, useUpdateDrug, useDeleteDrug } from '../composables/useDrugs'
import type { Drug } from '@icheck/api-contracts'

const message = useMessage()

const searchQuery = ref('')
const { drugs, isLoading, error, refresh } = useDrugs(searchQuery)

// ---- Modal state ----
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingDrug = ref<Drug | null>(null)
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
const { createDrug, loading: createLoading } = useCreateDrug()
const { updateDrug, loading: updateLoading } = useUpdateDrug()
const { deleteDrug, loading: deleteLoading } = useDeleteDrug()

// ---- Lang fetch ----
const fetchLangData = async (id: number, lang: string) => {
  if (loadedLangs.value.has(lang)) return
  isLoadingLang.value = true
  try {
    const token = useCookie('icheck_access').value
    const data = await $fetch<{ data: Drug }>(`${BASE_URL}/${id}/`, {
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
  if (editingDrug.value && !loadedLangs.value.has(lang)) {
    await fetchLangData(editingDrug.value.id, lang)
  }
}

// ---- Handlers ----
const openCreateModal = () => {
  editingDrug.value = null
  resetForm()
  activeTab.value = 'az'
  loadedLangs.value = new Set()
  showModal.value = true
}

const openEditModal = async (row: Drug) => {
  editingDrug.value = row
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
  if (modalForm.title.az?.trim()) titleObj.az = modalForm.title.az
  if (modalForm.title.en?.trim()) titleObj.en = modalForm.title.en
  if (modalForm.title.ru?.trim()) titleObj.ru = modalForm.title.ru

  if (Object.keys(titleObj).length === 0) {
    message.warning('Ən azı bir dildə ad daxil edin')
    return
  }

  try {
    if (editingDrug.value) {
      await updateDrug(editingDrug.value.id, { title: titleObj })
      message.success('Dərman yeniləndi')
    } else {
      await createDrug({ title: titleObj })
      message.success('Dərman yaradıldı')
    }
    showModal.value = false
    clearNuxtData('drugs-list')
    await refresh()
  } catch {
    message.error('Xəta baş verdi')
  }
}

const handleDelete = async () => {
  if (!deletingId.value) return
  try {
    await deleteDrug(deletingId.value)
    message.success('Dərman silindi')
    showDeleteModal.value = false
    await refresh()
  } catch {
    message.error('Silinmə zamanı xəta baş verdi')
  }
}

const BASE_URL = 'https://icheckapi.200soft.com/api/v1/drugs'

const columns: DataTableColumns<Drug> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    render: (row) => h('span', { class: 'text-slate-400 font-mono text-xs font-bold' }, `#${row.id}`),
  },
  {
    title: 'Drug Name',
    key: 'title',
    sorter: 'default',
    render: (row) =>
      h('div', { class: 'flex items-center gap-3' }, [
        h(NAvatar, { round: true, size: 32, color: '#F0F9FF', style: 'color:#0284C7;font-weight:800;border:1px solid #E0F2FE' },
          { default: () => row.title[0] }),
        h('span', { class: 'font-bold text-slate-800' }, row.title),
      ]),
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
  background-color: rgba(2, 132, 199, 0.02) !important;
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