<template>
  <div class="design-log-page min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Design Log
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Document your design process, decisions, and iterations
        </p>
        <div v-if="template?.guidance" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex">
            <svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <p class="ml-3 text-sm text-blue-700 dark:text-blue-300">
              {{ template.guidance }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="pending" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>

      <div v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="ml-3 text-sm text-red-700 dark:text-red-300">
            Failed to load template. Using default template instead.
          </p>
        </div>
      </div>

      <DesignLogForm :tooltips="template?.tooltips" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useDefaultDesignLogTemplate } from '~/composables/useDesignLogTemplate'
import { useDesignLogStore } from '~/stores/designLog'

const store = useDesignLogStore()

const { data: template, pending, error } = useDefaultDesignLogTemplate()

watch(template, (newTemplate) => {
  if (newTemplate && !store.state.isDirty) {
    store.loadFromTemplate(newTemplate)
  }
}, { immediate: true })

useHead({
  title: 'Design Log - Document Your Design Process',
  meta: [
    {
      name: 'description',
      content: 'Document your design process with our interactive design log tool. Track decisions, iterations, and reflections.',
    },
  ],
})
</script>
