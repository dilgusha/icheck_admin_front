<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div 
      v-for="i in 8" 
      :key="i"
      class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 animate-pulse"
    >
      <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div class="space-y-2">
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>
