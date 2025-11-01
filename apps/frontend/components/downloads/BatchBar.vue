<template>
  <div
    v-if="selectedCount > 0"
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ selectedCount }} item{{ selectedCount > 1 ? 's' : '' }} selected
          </div>
          <button
            type="button"
            class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            @click="$emit('clear-selection')"
          >
            Clear selection
          </button>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="downloading" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span>{{ progress.current }} of {{ progress.total }} files</span>
          </div>

          <button
            type="button"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="downloading || selectedCount === 0"
            @click="handleBatchDownload"
          >
            {{ downloading ? 'Downloading...' : 'Download All' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="mt-3 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
        <p class="text-sm text-red-800 dark:text-red-400">
          {{ error }}
        </p>
      </div>

      <div v-if="success" class="mt-3 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
        <p class="text-sm text-green-800 dark:text-green-400">
          Successfully downloaded {{ selectedCount }} file{{ selectedCount > 1 ? 's' : '' }}!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  selectedCount: number
  selectedIds: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'clear-selection': []
}>()

const downloading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const progress = ref({ current: 0, total: 0 })

const handleBatchDownload = async () => {
  if (downloading.value || props.selectedCount === 0) return

  downloading.value = true
  error.value = null
  success.value = false
  progress.value = { current: 0, total: props.selectedCount }

  try {
    const response = await fetch('/api/downloads/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemIds: props.selectedIds,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ statusMessage: 'Unknown error' }))
      throw new Error(errorData.statusMessage || 'Failed to download files')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `downloads-${Date.now()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    progress.value.current = props.selectedCount
    success.value = true

    setTimeout(() => {
      success.value = false
      emit('clear-selection')
    }, 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to download files'
    console.error('Batch download failed:', e)
  } finally {
    downloading.value = false
  }
}
</script>
