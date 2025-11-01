<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">教学设计日志</h1>
          <button
            @click="createNew"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            创建新日志
          </button>
        </div>

        <div v-if="loading" class="text-center py-8 text-gray-500 dark:text-gray-400">
          加载中...
        </div>

        <div v-else-if="logs.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          暂无日志，点击"创建新日志"开始
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="log in logs"
            :key="log.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            @click="openLog(log.id)"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ log.title || '未命名' }}
            </h3>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p v-if="log.schoolName">学校: {{ log.schoolName }}</p>
              <p v-if="log.courseName">课程: {{ log.courseName }}</p>
              <p v-if="log.teacherName">教师: {{ log.teacherName }}</p>
              <p v-if="log.date">日期: {{ log.date }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
                更新于: {{ new Date(log.updatedAt).toLocaleString('zh-CN') }}
              </p>
            </div>
            <div class="mt-4 flex justify-end gap-2">
              <button
                @click.stop="deleteLog(log.id)"
                class="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllDesignLogs, deleteDesignLog as deleteLogFromStorage, generateId } from '~/utils/design-log-storage'
import type { DesignLogData } from '~/utils/design-log-storage'

const router = useRouter()
const logs = ref<DesignLogData[]>([])
const loading = ref(true)

const loadLogs = async () => {
  loading.value = true
  try {
    logs.value = await getAllDesignLogs()
    logs.value.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error('Failed to load logs:', error)
  } finally {
    loading.value = false
  }
}

const createNew = () => {
  const id = generateId()
  router.push(`/design-logs/${id}`)
}

const openLog = (id: string) => {
  router.push(`/design-logs/${id}`)
}

const deleteLog = async (id: string) => {
  if (!confirm('确定要删除这个日志吗？')) return

  try {
    await deleteLogFromStorage(id)
    await loadLogs()
  } catch (error) {
    console.error('Failed to delete log:', error)
    alert('删除失败')
  }
}

onMounted(async () => {
  await loadLogs()
})
</script>
