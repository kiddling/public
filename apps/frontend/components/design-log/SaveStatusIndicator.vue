<template>
  <div class="flex items-center gap-2">
    <div v-if="saveState.isSaving" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span>保存中...</span>
    </div>
    <div v-else-if="saveState.lastSaved" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <div v-if="!saveState.hasUnsavedChanges" class="w-4 h-4 text-green-500">✓</div>
      <span>{{ formatTime(saveState.lastSaved) }}</span>
    </div>
    <div
      v-if="saveState.hasUnsavedChanges && !saveState.isSaving"
      class="w-2 h-2 bg-yellow-500 rounded-full"
      title="有未保存的更改"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { SaveState } from '~/composables/useDesignLog'

defineProps<{
  saveState: SaveState
}>()

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 10) return '刚刚'
  if (minutes < 1) return `${seconds} 秒前`
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
