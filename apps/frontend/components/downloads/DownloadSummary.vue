<template>
  <div class="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Download History</h3>

    <div v-if="history.length === 0" class="py-8 text-center text-gray-500 dark:text-gray-400">
      <p>No downloads yet</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="item in recentHistory"
        :key="`${item.itemId}-${item.downloadedAt}`"
        class="flex items-center justify-between gap-2 rounded-md border border-gray-200 p-2 text-sm dark:border-gray-700"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium text-gray-900 dark:text-white">
            {{ item.title }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatDate(item.downloadedAt) }}
            <span v-if="item.version" class="ml-2">v{{ item.version }}</span>
          </p>
        </div>
        <div class="flex-shrink-0">
          <span
            v-if="item.checksumValid !== undefined"
            class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs"
            :class="
              item.checksumValid
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
            "
            :title="item.checksumValid ? 'Checksum valid' : 'Checksum failed'"
          >
            <span v-if="item.checksumValid">✓</span>
            <span v-else>✗</span>
          </span>
        </div>
      </div>

      <div v-if="history.length > 5" class="pt-2 text-center">
        <button
          type="button"
          class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          @click="showAll = !showAll"
        >
          {{ showAll ? 'Show less' : `Show all (${history.length})` }}
        </button>
      </div>

      <div class="border-t border-gray-200 pt-3 dark:border-gray-700">
        <button
          type="button"
          class="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          @click="handleClearHistory"
        >
          Clear History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDownloadHistory } from '~/composables/useDownloads'

const { getHistory, clearHistory } = useDownloadHistory()
const history = ref<ReturnType<typeof getHistory>>([])
const showAll = ref(false)

const recentHistory = computed(() => {
  return showAll.value ? history.value : history.value.slice(0, 5)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
}

const handleClearHistory = () => {
  if (confirm('Are you sure you want to clear your download history?')) {
    clearHistory()
    history.value = []
  }
}

const refreshHistory = () => {
  history.value = getHistory()
}

onMounted(() => {
  refreshHistory()
})

defineExpose({
  refreshHistory,
})
</script>
