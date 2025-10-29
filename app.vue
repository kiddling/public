<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  charset: 'utf-8',
  viewport: 'width=device-width, initial-scale=1'
})

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${useRuntimeConfig().public.siteName}` : useRuntimeConfig().public.siteName
  }
})
</script>
