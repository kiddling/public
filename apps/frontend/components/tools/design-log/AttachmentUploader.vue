<template>
  <div class="attachment-uploader">
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Attachments
        <HelpPopover v-if="tooltip" :content="tooltip" />
      </label>

      <div
        class="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400"
        :class="{
          'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20': isDragging,
        }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput?.click()"
      >
        <div class="flex flex-col items-center">
          <svg
            class="mb-3 h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-500">PNG, JPG, PDF up to 10MB</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,.pdf"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>
    </div>

    <div v-if="attachments.length > 0" class="space-y-2">
      <div
        v-for="attachment in attachments"
        :key="attachment.id"
        class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
      >
        <div class="flex min-w-0 flex-1 items-center space-x-3">
          <div class="flex-shrink-0">
            <svg
              v-if="attachment.type.startsWith('image/')"
              class="h-8 w-8 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else class="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ attachment.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatFileSize(attachment.size) }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="ml-4 text-red-500 hover:text-red-700 dark:hover:text-red-400"
          aria-label="Remove attachment"
          @click="removeAttachment(attachment.id)"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AttachmentFile } from '~/stores/designLog'

const props = defineProps<{
  attachments: AttachmentFile[]
  tooltip?: string
}>()

const emit = defineEmits<{
  add: [file: AttachmentFile]
  remove: [id: string]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    processFiles(Array.from(event.dataTransfer.files))
  }
}

function processFiles(files: File[]) {
  files.forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`)
      return
    }

    const attachment: AttachmentFile = {
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }

    emit('add', attachment)
  })
}

function removeAttachment(id: string) {
  emit('remove', id)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>
