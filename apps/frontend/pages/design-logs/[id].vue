<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-5xl mx-auto px-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">教学设计日志</h1>
          <div class="flex items-center gap-2">
            <div v-if="saveState.isSaving" class="text-sm text-gray-500 dark:text-gray-400">
              保存中...
            </div>
            <div v-else-if="saveState.lastSaved" class="text-sm text-gray-500 dark:text-gray-400">
              上次保存: {{ formatTime(saveState.lastSaved) }}
            </div>
            <div v-if="saveState.hasUnsavedChanges" class="w-2 h-2 bg-yellow-500 rounded-full" title="有未保存的更改"></div>
          </div>
        </div>

        <div v-if="saveState.error" class="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
          {{ saveState.error }}
        </div>

        <div class="mb-6 flex gap-2 flex-wrap">
          <button
            @click="handleManualSave"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            :disabled="saveState.isSaving"
          >
            手动保存
          </button>
          <button
            @click="handleExport"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            导出 JSON
          </button>
          <label class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer">
            导入 JSON
            <input
              type="file"
              accept=".json"
              class="hidden"
              @change="handleImport"
            />
          </label>
          <button
            @click="handlePDFExport"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            导出 PDF
          </button>
          <button
            @click="showVersions = !showVersions"
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            版本历史 ({{ versions.length }})
          </button>
        </div>

        <div v-if="showVersions && versions.length > 0" class="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">版本历史</h3>
          <div class="space-y-2">
            <div
              v-for="version in versions"
              :key="version.id"
              class="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded"
            >
              <div class="text-sm text-gray-700 dark:text-gray-300">
                {{ new Date(version.timestamp).toLocaleString('zh-CN') }}
                <span v-if="version.description" class="text-gray-500 dark:text-gray-400">
                  - {{ version.description }}
                </span>
              </div>
              <button
                @click="handleRevert(version.id)"
                class="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                恢复此版本
              </button>
            </div>
          </div>
        </div>

        <form v-if="currentLog" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题 *
            </label>
            <input
              v-model="currentLog.title"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="输入标题"
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                学校名称
              </label>
              <input
                v-model="currentLog.schoolName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="输入学校名称"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                课程名称
              </label>
              <input
                v-model="currentLog.courseName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="输入课程名称"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                教师姓名
              </label>
              <input
                v-model="currentLog.teacherName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="输入教师姓名"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                日期
              </label>
              <input
                v-model="currentLog.date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              教学目标
            </label>
            <textarea
              v-model="currentLog.objective"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="输入教学目标"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              教学内容
            </label>
            <textarea
              v-model="currentLog.content"
              rows="8"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="输入教学内容"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              教学反思
            </label>
            <textarea
              v-model="currentLog.reflection"
              rows="6"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="输入教学反思"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              附件
            </label>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-4">
              <input
                type="file"
                multiple
                @change="handleFileUpload"
                class="hidden"
                ref="fileInput"
              />
              <button
                type="button"
                @click="$refs.fileInput?.click()"
                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                选择文件
              </button>
              <div v-if="currentLog.attachments && currentLog.attachments.length > 0" class="mt-4 space-y-2">
                <div
                  v-for="(attachment, index) in currentLog.attachments"
                  :key="attachment.id"
                  class="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    {{ attachment.name }} ({{ formatBytes(attachment.size) }})
                  </span>
                  <button
                    type="button"
                    @click="removeAttachment(index)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDesignLog } from '~/composables/useDesignLog'
import { generatePDF, downloadPDF } from '~/utils/design-log-pdf'

const route = useRoute()
const logId = route.params.id as string

const { currentLog, versions, saveState, manualSave, revertToVersion, exportLog, importLog, mergeImport } = useDesignLog(logId)

const showVersions = ref(false)
const fileInput = ref<HTMLInputElement>()

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const handleManualSave = async () => {
  try {
    await manualSave()
  } catch (error) {
    console.error('Failed to save:', error)
  }
}

const handleExport = async () => {
  try {
    const json = await exportLog()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `design-log-${currentLog.value?.title || 'export'}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export:', error)
    alert('导出失败')
  }
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    if (currentLog.value && currentLog.value.title) {
      const merge = confirm('是否与当前内容合并？点击"确定"合并，点击"取消"替换')
      if (merge) {
        await mergeImport(text)
      } else {
        await importLog(text)
      }
    } else {
      await importLog(text)
    }
    alert('导入成功')
  } catch (error) {
    console.error('Failed to import:', error)
    alert('导入失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    target.value = ''
  }
}

const handlePDFExport = async () => {
  if (!currentLog.value) return

  try {
    const blob = await generatePDF(currentLog.value, {
      includeCoverPage: true,
      schoolName: currentLog.value.schoolName,
      courseName: currentLog.value.courseName,
      teacherName: currentLog.value.teacherName,
    })
    downloadPDF(blob, `design-log-${currentLog.value.title || 'export'}-${Date.now()}.pdf`)
  } catch (error) {
    console.error('Failed to export PDF:', error)
    alert('PDF 导出失败')
  }
}

const handleRevert = async (versionId: string) => {
  if (!confirm('确定要恢复到此版本吗？')) return

  try {
    await revertToVersion(versionId)
    showVersions.value = false
  } catch (error) {
    console.error('Failed to revert:', error)
    alert('恢复版本失败')
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || !currentLog.value) return

  const newAttachments = []
  for (const file of Array.from(files)) {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      newAttachments.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      })
    } catch (error) {
      console.error('Failed to read file:', error)
    }
  }

  if (!currentLog.value.attachments) {
    currentLog.value.attachments = []
  }
  currentLog.value.attachments.push(...newAttachments)
  target.value = ''
}

const removeAttachment = (index: number) => {
  if (!currentLog.value?.attachments) return
  currentLog.value.attachments.splice(index, 1)
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none;
  }

  body {
    background: white;
  }

  .bg-gray-50,
  .dark\:bg-gray-900 {
    background: white !important;
  }

  .bg-white,
  .dark\:bg-gray-800 {
    background: white !important;
    box-shadow: none !important;
  }

  textarea,
  input {
    border: none !important;
    padding: 0 !important;
  }

  button {
    display: none !important;
  }
}
</style>
