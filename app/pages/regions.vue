<template>
  <RegionsScreen />
  
</template>

<script setup lang="ts">
import RegionsScreen from '~/features/regions/components/RegionsScreen.vue'

definePageMeta({
  layout: 'default',
  // middleware: ['auth'] // Enable later
})
</script>
