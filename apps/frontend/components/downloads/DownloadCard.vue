<template>
  <div
    class="group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    :class="{ 'ring-2 ring-blue-500': selected }"
  >
    <div class="flex gap-4">
      <div class="flex-shrink-0">
        <input
          :id="`download-${item.id}`"
          type="checkbox"
          :checked="selected"
          :aria-label="`Select ${item.attributes.title}`"
          class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          @change="$emit('toggle-selection', item.id)"
        />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-lg font-semibold text-gray-900 dark:text-white">
              {{ item.attributes.title }}
            </h3>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="categoryClass"
              >
                {{ item.attributes.category }}
              </span>
              <span v-if="item.attributes.version" class="text-xs text-gray-500 dark:text-gray-400">
                v{{ item.attributes.version }}
              </span>
              <span v-if="item.attributes.tag" class="text-xs text-gray-500 dark:text-gray-400">
                {{ item.attributes.tag }}
              </span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-1">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatFileSize(item.attributes.fileSize) }}
            </span>
            <button
              type="button"
              class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              :disabled="downloading"
              @click="handleDownload"
            >
              {{ downloading ? 'Downloading...' : 'Download' }}
            </button>
          </div>
        </div>

        <p
          v-if="item.attributes.description"
          class="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300"
        >
          {{ item.attributes.description }}
        </p>

        <div
          class="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400"
        >
          <div v-if="checksumValid !== null" class="flex items-center gap-1">
            <span
              class="inline-flex h-4 w-4 items-center justify-center rounded-full"
              :class="checksumValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
            >
              <span v-if="checksumValid">✓</span>
              <span v-else>✗</span>
            </span>
            <span>{{ checksumValid ? 'Checksum valid' : 'Checksum failed' }}</span>
          </div>

          <div v-if="isInHistory" class="flex items-center gap-1">
            <span class="text-gray-400">📁</span>
            <span>Downloaded before</span>
          </div>

          <div v-if="item.attributes.relatedLessons?.data?.length" class="flex items-center gap-1">
            <span class="text-gray-400">📚</span>
            <span>{{ item.attributes.relatedLessons.data.length }} lesson(s)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DownloadItem } from '~/composables/useDownloads'
import { formatFileSize, verifyChecksum, useDownloadHistory } from '~/composables/useDownloads'

interface Props {
  item: DownloadItem
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
})

const emit = defineEmits<{
  'toggle-selection': [id: number]
}>()

const downloading = ref(false)
const checksumValid = ref<boolean | null>(null)
const { addToHistory, getHistory } = useDownloadHistory()

const isInHistory = computed(() => {
  return getHistory().some((h) => h.itemId === props.item.id)
})

const categoryClass = computed(() => {
  const category = props.item.attributes.category
  const classes = {
    Template: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Worksheet: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Case: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }
  return classes[category] || classes.Other
})

const handleDownload = async () => {
  if (downloading.value) return

  downloading.value = true
  checksumValid.value = null

  try {
    const fileUrl = props.item.attributes.file.data.attributes.url
    const fileName = props.item.attributes.file.data.attributes.name

    const response = await fetch(
      fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`
    )
    const blob = await response.blob()
    const file = new File([blob], fileName, { type: blob.type })

    const isValid = await verifyChecksum(file, props.item.attributes.checksum)
    checksumValid.value = isValid

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    addToHistory({
      itemId: props.item.id,
      title: props.item.attributes.title,
      version: props.item.attributes.version,
      checksumValid: isValid,
    })
  } catch (error) {
    console.error('Download failed:', error)
    checksumValid.value = false
  } finally {
    downloading.value = false
  }
}
</script>
