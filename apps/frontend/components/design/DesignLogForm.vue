<template>
  <div class="design-log-form mx-auto max-w-4xl p-6">
    <h2 class="mb-6 text-2xl font-bold">设计日志 (Design Log)</h2>

    <form @submit.prevent="submitLog" class="space-y-6">
      <!-- Project Info -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">项目信息</h3>

        <div>
          <label for="projectName" class="mb-2 block text-sm font-medium"> 项目名称 * </label>
          <input
            id="projectName"
            v-model="formData.projectName"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="输入项目名称"
          />
        </div>

        <div>
          <label for="projectType" class="mb-2 block text-sm font-medium"> 项目类型 * </label>
          <select
            id="projectType"
            v-model="formData.projectType"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择类型</option>
            <option value="web">网页设计</option>
            <option value="mobile">移动应用</option>
            <option value="graphic">平面设计</option>
            <option value="ui-ux">UI/UX设计</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div>
          <label for="date" class="mb-2 block text-sm font-medium"> 日期 * </label>
          <input
            id="date"
            v-model="formData.date"
            type="date"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Design Process -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">设计过程</h3>

        <div>
          <label for="objective" class="mb-2 block text-sm font-medium"> 设计目标 * </label>
          <textarea
            id="objective"
            v-model="formData.objective"
            required
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="描述设计目标和需求"
          />
        </div>

        <div>
          <label for="inspiration" class="mb-2 block text-sm font-medium"> 灵感来源 </label>
          <textarea
            id="inspiration"
            v-model="formData.inspiration"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="记录灵感和参考资料"
          />
        </div>

        <div>
          <label for="process" class="mb-2 block text-sm font-medium"> 设计步骤 * </label>
          <textarea
            id="process"
            v-model="formData.process"
            required
            rows="5"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="详细描述设计过程和决策"
          />
        </div>

        <div>
          <label for="challenges" class="mb-2 block text-sm font-medium"> 遇到的挑战 </label>
          <textarea
            id="challenges"
            v-model="formData.challenges"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="记录遇到的问题和解决方案"
          />
        </div>
      </div>

      <!-- Results -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">结果与反思</h3>

        <div>
          <label for="outcome" class="mb-2 block text-sm font-medium"> 最终成果 * </label>
          <textarea
            id="outcome"
            v-model="formData.outcome"
            required
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="描述最终设计成果"
          />
        </div>

        <div>
          <label for="reflection" class="mb-2 block text-sm font-medium"> 反思总结 * </label>
          <textarea
            id="reflection"
            v-model="formData.reflection"
            required
            rows="4"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="总结经验和改进方向"
          />
        </div>

        <div>
          <label for="nextSteps" class="mb-2 block text-sm font-medium"> 后续计划 </label>
          <textarea
            id="nextSteps"
            v-model="formData.nextSteps"
            rows="2"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="记录后续改进和优化计划"
          />
        </div>
      </div>

      <!-- Tags -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">标签和分类</h3>

        <div>
          <label for="tags" class="mb-2 block text-sm font-medium"> 标签 (用逗号分隔) </label>
          <input
            id="tags"
            v-model="formData.tags"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="例如: UI设计, 响应式, 极简风格"
          />
        </div>

        <div>
          <label for="tools" class="mb-2 block text-sm font-medium"> 使用工具 </label>
          <input
            id="tools"
            v-model="formData.tools"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="例如: Figma, Adobe XD, Sketch"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 pt-4">
        <button
          type="submit"
          class="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '保存中...' : '保存日志' }}
        </button>

        <button
          type="button"
          @click="saveDraft"
          class="rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          :disabled="isSubmitting"
        >
          保存草稿
        </button>

        <button
          type="button"
          @click="exportPDF"
          class="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          :disabled="isSubmitting"
        >
          导出 PDF
        </button>

        <button
          type="button"
          @click="resetForm"
          class="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          重置
        </button>
      </div>
    </form>

    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="mt-6 rounded-lg border border-green-400 bg-green-100 p-4 text-green-700"
      role="alert"
    >
      <p class="font-semibold">✓ 保存成功！</p>
      <p class="text-sm">设计日志已保存到本地存储。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface DesignLogData {
  projectName: string
  projectType: string
  date: string
  objective: string
  inspiration: string
  process: string
  challenges: string
  outcome: string
  reflection: string
  nextSteps: string
  tags: string
  tools: string
}

const formData = reactive<DesignLogData>({
  projectName: '',
  projectType: '',
  date: new Date().toISOString().split('T')[0],
  objective: '',
  inspiration: '',
  process: '',
  challenges: '',
  outcome: '',
  reflection: '',
  nextSteps: '',
  tags: '',
  tools: '',
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

const submitLog = async () => {
  isSubmitting.value = true

  try {
    // Save to IndexedDB
    const { saveDesignLog } = useDesignLogStorage()
    await saveDesignLog(formData)

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

    // Reset form after successful submission
    setTimeout(() => {
      resetForm()
    }, 1000)
  } catch (error) {
    console.error('Failed to save design log:', error)
    alert('保存失败，请重试。')
  } finally {
    isSubmitting.value = false
  }
}

const saveDraft = async () => {
  try {
    const { saveDraft } = useDesignLogStorage()
    await saveDraft(formData)
    alert('草稿已保存！')
  } catch (error) {
    console.error('Failed to save draft:', error)
    alert('保存草稿失败，请重试。')
  }
}

const exportPDF = async () => {
  try {
    const { exportToPDF } = useDesignLogPDF()
    await exportToPDF(formData)
  } catch (error) {
    console.error('Failed to export PDF:', error)
    alert('导出 PDF 失败，请重试。')
  }
}

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    if (key === 'date') {
      formData[key] = new Date().toISOString().split('T')[0]
    } else {
      formData[key] = ''
    }
  })
}
</script>

<style scoped>
.design-log-form {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
}
</style>
