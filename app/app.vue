<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { type GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#007bff',
    primaryColorHover: '#0069d9',
    primaryColorPressed: '#0056b3',
    borderRadius: '12px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
  },
  DataTable: {
    borderRadius: '12px',
  },
  Card: {
    borderRadius: '12px',
  }
}
</script>

<style>
body {
  margin: 0;
  background-color: #f8f9fa;
}
</style>
