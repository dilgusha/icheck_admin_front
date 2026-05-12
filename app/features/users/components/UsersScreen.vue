<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Users</h2>
        <p class="text-slate-500 text-sm font-medium">Manage users in the healthcare network.</p>
      </div>
      <n-button type="primary" size="large" class="!rounded-xl font-bold px-8" @click="openCreateModal">
        <template #icon><Plus :size="20" :stroke-width="2.5" /></template>
        Create User
      </n-button>
    </div>

    <!-- Table Card -->
    <n-card :bordered="false" class="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <div class="mb-6 flex flex-wrap items-center gap-4 p-1">
        <n-input v-model:value="searchQuery" placeholder="Search users..." size="large" class="rounded-xl max-w-sm" clearable>
          <template #prefix><Search :size="18" class="text-slate-400" /></template>
        </n-input>

        <n-select v-model:value="filterScope" :options="scopeOptions" placeholder="Scope" size="large" clearable class="w-40" />

        <n-button quaternary circle size="medium" class="ml-auto" @click="refresh()">
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
        :data="users"
        :pagination="{ pageSize: 10 }"
        :bordered="false"
        :row-class-name="() => 'group h-16'"
        class="modern-table"
        striped
      />
    </n-card>

    <!-- Create Modal -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      title="Create User"
      class="max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
    >
      <div class="p-2 flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Ad *">
            <n-input v-model:value="modalForm.first_name" placeholder="Ad" size="large" class="rounded-xl" />
          </n-form-item>
          <n-form-item label="Soyad *">
            <n-input v-model:value="modalForm.last_name" placeholder="Soyad" size="large" class="rounded-xl" />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="İstifadəçi adı *">
            <n-input v-model:value="modalForm.username" placeholder="username" size="large" class="rounded-xl" />
          </n-form-item>
          <n-form-item label="Şifrə *">
            <n-input v-model:value="modalForm.password" type="password" show-password-on="click" placeholder="Şifrə" size="large" class="rounded-xl" />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Email *">
            <n-input v-model:value="modalForm.email" placeholder="email@example.com" size="large" class="rounded-xl" />
          </n-form-item>
          <n-form-item label="Telefon">
            <n-input v-model:value="modalForm.phone_number" placeholder="994..." size="large" class="rounded-xl" />
          </n-form-item>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="Cins">
            <n-select v-model:value="modalForm.sex" :options="sexOptions" size="large" clearable />
          </n-form-item>
          <n-form-item label="Rol">
            <n-select v-model:value="modalForm.role" :options="roleOptions" size="large" />
          </n-form-item>
        </div>

        <n-form-item label="Doğum tarixi">
          <n-date-picker v-model:value="modalForm.birth_date" type="date" size="large" class="w-full" />
        </n-form-item>

        <n-form-item label="Ünvan">
          <n-input v-model:value="modalForm.address" placeholder="Ünvan..." size="large" class="rounded-xl" />
        </n-form-item>

        <div class="flex items-center gap-8 border-t pt-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Aktiv</span>
            <n-switch v-model:value="modalForm.is_active" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Staff</span>
            <n-switch v-model:value="modalForm.is_staff" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Superuser</span>
            <n-switch v-model:value="modalForm.is_superuser" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">Həkim</span>
            <n-switch v-model:value="modalForm.doctor_boolean" />
          </div>
        </div>
      </div>

      <template #action>
        <div class="flex justify-end gap-3">
          <n-button ghost class="rounded-xl px-6" @click="showModal = false">Ləğv et</n-button>
          <n-button type="primary" class="rounded-xl px-8" :loading="createLoading" @click="handleCreate">
            Yarat
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Create modal-dan sonra əlavə et -->
<n-modal
  v-model:show="showEditModal"
  preset="card"
  title="Edit User"
  class="max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
>
  <div class="p-2 flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-4">
      <n-form-item label="Ad *">
        <n-input v-model:value="editForm.first_name" placeholder="Ad" size="large" class="rounded-xl" />
      </n-form-item>
      <n-form-item label="Soyad *">
        <n-input v-model:value="editForm.last_name" placeholder="Soyad" size="large" class="rounded-xl" />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <n-form-item label="İstifadəçi adı *">
        <n-input v-model:value="editForm.username" placeholder="username" size="large" class="rounded-xl" />
      </n-form-item>
      <n-form-item label="Yeni şifrə">
        <n-input v-model:value="editForm.password" type="password" show-password-on="click" placeholder="Dəyişməmək üçün boş buraxın" size="large" class="rounded-xl" />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <n-form-item label="Email *">
        <n-input v-model:value="editForm.email" placeholder="email@example.com" size="large" class="rounded-xl" />
      </n-form-item>
      <n-form-item label="Telefon">
        <n-input v-model:value="editForm.phone_number" placeholder="994..." size="large" class="rounded-xl" />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <n-form-item label="Cins">
        <n-select v-model:value="editForm.sex" :options="sexOptions" size="large" clearable />
      </n-form-item>
      <n-form-item label="Rol">
        <n-select v-model:value="editForm.role" :options="roleOptions" size="large" />
      </n-form-item>
    </div>

    <n-form-item label="Doğum tarixi">
      <n-date-picker v-model:value="editForm.birth_date" type="date" size="large" class="w-full" />
    </n-form-item>

    <n-form-item label="Ünvan">
      <n-input v-model:value="editForm.address" placeholder="Ünvan..." size="large" class="rounded-xl" />
    </n-form-item>

    <div class="flex items-center gap-8 border-t pt-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-500">Aktiv</span>
        <n-switch v-model:value="editForm.is_active" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-500">Staff</span>
        <n-switch v-model:value="editForm.is_staff" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-500">Superuser</span>
        <n-switch v-model:value="editForm.is_superuser" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-500">Həkim</span>
        <n-switch v-model:value="editForm.doctor_boolean" />
      </div>
    </div>
  </div>

  <template #action>
    <div class="flex justify-end gap-3">
      <n-button ghost class="rounded-xl px-6" @click="showEditModal = false">Ləğv et</n-button>
      <n-button type="primary" class="rounded-xl px-8" :loading="updateLoading" @click="handleUpdate">
        Yenilə
      </n-button>
    </div>
  </template>
</n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, reactive } from 'vue'
import { NButton, NSpace, NAvatar, NTag, useMessage, type DataTableColumns } from 'naive-ui'
import { Plus, Search, RefreshCw ,Edit} from 'lucide-vue-next'
import { useUsers, useUserActions } from '../composables/useUsers'
import type { User } from '@icheck/api-contracts'

const message = useMessage()

// ---- Filters ----
const searchQuery = ref('')
const filterScope = ref<string | null>(null)

const query = computed(() => ({
  ...(searchQuery.value ? { search: searchQuery.value } : {}),
  ...(filterScope.value ? { scope: filterScope.value } : {}),
}))

const { users, isLoading, error, refresh } = useUsers(query)

const scopeOptions = [
  { label: 'Aktiv', value: 'active' },
  { label: 'Qeyri-aktiv', value: 'inactive' },
  { label: 'Lider', value: 'leader' },
]

const sexOptions = [
  { label: 'Kişi', value: 'male' },
  { label: 'Qadın', value: 'female' },
]

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
  { label: 'Doctor', value: 'doctor' },
]

const { createUser, updateUser } = useUserActions()
const updateLoading = ref(false)
const showEditModal = ref(false)
const editingUserId = ref<number | null>(null)

const editForm = reactive({
  first_name: '',
  last_name: '',
  username: '',
  password: '',
  email: '',
  phone_number: '',
  sex: null as string | null,
  role: 'user',
  birth_date: null as number | null,
  address: '',
  is_active: true,
  is_staff: false,
  is_superuser: false,
  doctor_boolean: false,
})

const openEditModal = (row: User) => {
  editingUserId.value = row.id
  editForm.first_name = row.first_name
  editForm.last_name = row.last_name
  editForm.username = row.username
  editForm.password = ''
  editForm.email = row.email
  editForm.phone_number = row.phone_number ?? ''
  editForm.sex = row.sex
  editForm.role = row.role
  editForm.birth_date = row.birth_date ? new Date(row.birth_date).getTime() : null
  editForm.address = row.address ?? ''
  editForm.is_active = row.is_active
  editForm.is_staff = false
  editForm.is_superuser = false
  editForm.doctor_boolean = row.doctor_boolean
  showEditModal.value = true
}

const handleUpdate = async () => {
  if (!editingUserId.value) return
  updateLoading.value = true
  try {
    await updateUser(editingUserId.value, {
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      username: editForm.username,
      ...(editForm.password ? { password: editForm.password } : {}),
      email: editForm.email,
      phone_number: editForm.phone_number || '',
      sex: editForm.sex || '',
      role: editForm.role,
      birth_date: editForm.birth_date
        ? new Date(editForm.birth_date).toISOString().split('T')[0]
        : '',
      address: editForm.address || '',
      is_active: editForm.is_active,
      is_staff: editForm.is_staff,
      is_superuser: editForm.is_superuser,
      doctor_boolean: editForm.doctor_boolean,
      groups: [],
      user_permissions: [],
    })
    message.success('İstifadəçi yeniləndi')
    showEditModal.value = false
    clearNuxtData('users-list')
    await refresh()
  } catch (err: any) {
    console.log('Update error:', JSON.stringify(err?.data))
    message.error(err?.data?.error || 'Xəta baş verdi')
  } finally {
    updateLoading.value = false
  }
}
// ---- Modal ----
const showModal = ref(false)
const modalForm = reactive({
  first_name: '',
  last_name: '',
  username: '',
  password: '',
  email: '',
  phone_number: '',
  sex: null as string | null,
  role: 'user',
  birth_date: null as number | null,
  address: '',
  is_active: true,
  is_staff: false,
  is_superuser: false,
  doctor_boolean: false,
})

const resetForm = () => {
  modalForm.first_name = ''
  modalForm.last_name = ''
  modalForm.username = ''
  modalForm.password = ''
  modalForm.email = ''
  modalForm.phone_number = ''
  modalForm.sex = null
  modalForm.role = 'user'
  modalForm.birth_date = null
  modalForm.address = ''
  modalForm.is_active = true
  modalForm.is_staff = false
  modalForm.is_superuser = false
  modalForm.doctor_boolean = false
}

const openCreateModal = () => {
  resetForm()
  showModal.value = true
}

const createLoading = ref(false)

const handleCreate = async () => {
  if (!modalForm.first_name || !modalForm.last_name || !modalForm.username || !modalForm.password || !modalForm.email) {
    message.warning('Məcburi xanaları doldurun')
    return
  }

  createLoading.value = true
  try {
    await createUser({
      first_name: modalForm.first_name,
      last_name: modalForm.last_name,
      username: modalForm.username,
      password: modalForm.password,
      email: modalForm.email,
      phone_number: modalForm.phone_number || '',
      sex: modalForm.sex || '',
      role: modalForm.role,
      birth_date: modalForm.birth_date
        ? new Date(modalForm.birth_date).toISOString().split('T')[0]
        : '',
      address: modalForm.address || '',
      is_active: modalForm.is_active,
      is_staff: modalForm.is_staff,
      is_superuser: modalForm.is_superuser,
      doctor_boolean: modalForm.doctor_boolean,
      groups: [],
      user_permissions: [],
    })
    message.success('İstifadəçi yaradıldı')
    showModal.value = false
    clearNuxtData('users-list')
    await refresh()
  } catch (err: any) {
    console.log('Create user error:', JSON.stringify(err?.data))
    message.error(err?.data?.error || 'Xəta baş verdi')
  } finally {
    createLoading.value = false
  }
}

// ---- Table ----
const columns: DataTableColumns<User> = [
  {
    title: 'İstifadəçi',
    key: 'username',
    render: (row) =>
      h('div', { class: 'flex items-center gap-3' }, [
        h(NAvatar, {
          round: true, size: 32,
          src: row.photo ?? undefined,
          color: '#EEF2FF',
          style: 'color:#4F46E5;font-weight:800;border:1px solid #E0E7FF',
        }, { default: () => (row.first_name?.[0] ?? row.username[0]).toUpperCase() }),
        h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'font-bold text-slate-800 text-sm' },
            `${row.first_name} ${row.last_name}`.trim() || row.username),
          h('span', { class: 'text-xs text-slate-400' }, row.email),
        ]),
      ]),
  },
  {
    title: 'Telefon',
    key: 'phone_number',
    render: (row) => h('span', { class: 'text-slate-600 text-sm' }, row.phone_number ?? '—'),
  },
  {
    title: 'Rol',
    key: 'role',
    render: (row) =>
      h(NTag, {
        type: row.role === 'admin' ? 'error' : row.role === 'doctor' ? 'info' : 'default',
        round: true, size: 'small', bordered: false,
        style: 'font-weight:800;font-size:10px;text-transform:uppercase;',
      }, { default: () => row.role }),
  },
  {
    title: 'Status',
    key: 'is_active',
    render: (row) =>
      h(NTag, {
        type: row.is_active ? 'success' : 'default',
        round: true, size: 'small', bordered: false,
        style: 'font-weight:800;font-size:10px;text-transform:uppercase;',
      }, { default: () => row.is_active ? 'Aktiv' : 'Qeyri-aktiv' }),
  },
  {
    title: 'Cins',
    key: 'sex',
    render: (row) => h('span', { class: 'text-slate-600 text-sm capitalize' }, row.sex ?? '—'),
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