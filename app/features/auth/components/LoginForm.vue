<template>
  <div>
    <!-- Logo -->
    <div class="mb-8 text-center">
      <NuxtImg src="/iCheck-logo.webp" alt="iCheck" class="mx-auto h-10" />
    </div>

    <!-- Title -->
    <h1 class="mb-6 text-center text-xl font-semibold text-gray-800">
      Admin Panelə Giriş
    </h1>

    <!-- Form -->
    <n-form ref="formRef" :model="form" :rules="rules">
      <n-form-item path="username" label="İstifadəçi adı">
        <n-input
          v-model:value="form.username"
          placeholder="İstifadəçi adınızı daxil edin"
          size="large"
          :disabled="loading"
          @keyup.enter="handleLogin"
        />
      </n-form-item>

      <n-form-item path="password" label="Şifrə">
        <n-input
          v-model:value="form.password"
          type="password"
          show-password-on="click"
          placeholder="Şifrənizi daxil edin"
          size="large"
          :disabled="loading"
          @keyup.enter="handleLogin"
        />
      </n-form-item>

      <!-- Error -->
      <n-alert v-if="error" type="error" class="mb-4" :show-icon="true">
        {{ error }}
      </n-alert>

      <!-- Submit -->
      <n-button
        type="primary"
        size="large"
        block
        :loading="loading"
        @click="handleLogin"
      >
        Daxil ol
      </n-button>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui'

const router = useRouter()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: 'İstifadəçi adı tələb olunur', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Şifrə tələb olunur', trigger: 'blur' },
    { min: 6, message: 'Şifrə minimum 6 simvol olmalıdır', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: form.username,
        password: form.password,
      },
    })

    await navigateTo('/')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Xəta baş verdi'
  } finally {
    loading.value = false
  }
}
</script>