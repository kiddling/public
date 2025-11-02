<template>
  <NuxtLayout>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div class="max-w-2xl w-full">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          <!-- Error Icon -->
          <div class="flex justify-center mb-6">
            <div 
              class="w-20 h-20 rounded-full flex items-center justify-center"
              :class="iconBgClass"
            >
              <Icon :name="iconName" class="w-12 h-12" :class="iconColorClass" />
            </div>
          </div>

          <!-- Error Title -->
          <h1 class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {{ title }}
          </h1>

          <!-- Error Message -->
          <p class="text-lg text-center text-gray-600 dark:text-gray-300 mb-8">
            {{ message }}
          </p>

          <!-- Error Details (Dev only) -->
          <div v-if="isDev && error?.stack" class="mb-8">
            <details class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <summary class="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2">
                错误详情 (仅开发环境)
              </summary>
              <pre class="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">{{ error.stack }}</pre>
            </details>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              v-if="showRetry"
              @click="handleRetry"
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Icon name="mdi:refresh" class="w-5 h-5 inline-block mr-2" />
              重试
            </button>
            
            <button
              @click="handleGoHome"
              class="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors duration-200"
            >
              <Icon name="mdi:home" class="w-5 h-5 inline-block mr-2" />
              返回首页
            </button>

            <button
              v-if="canGoBack"
              @click="handleGoBack"
              class="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors duration-200"
            >
              <Icon name="mdi:arrow-left" class="w-5 h-5 inline-block mr-2" />
              返回上一页
            </button>
          </div>

          <!-- Help Text -->
          <div class="mt-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              如果问题持续存在，请联系
              <a href="mailto:support@example.com" class="text-indigo-600 dark:text-indigo-400 hover:underline">
                技术支持
              </a>
            </p>
          </div>
        </div>

        <!-- Additional Info -->
        <div v-if="statusCode" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          错误代码: {{ statusCode }}
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useLogger } from '~/utils/logger'

const props = defineProps({
  error: {
    type: Object as PropType<any>,
    required: true,
  },
})

const { error } = toRefs(props)
const isDev = process.env.NODE_ENV === 'development'
const logger = useLogger()

// Log error
logger.error('Application error occurred', {
  statusCode: error.value?.statusCode,
  message: error.value?.message,
})

// Determine error type and messaging
const statusCode = computed(() => error.value?.statusCode || 500)
const isNotFound = computed(() => statusCode.value === 404)
const isServerError = computed(() => statusCode.value >= 500)
const isClientError = computed(() => statusCode.value >= 400 && statusCode.value < 500)

const title = computed(() => {
  if (isNotFound.value) return '页面未找到'
  if (isServerError.value) return '服务器错误'
  if (isClientError.value) return '请求错误'
  return '出错了'
})

const message = computed(() => {
  if (isNotFound.value) {
    return '抱歉，您访问的页面不存在或已被移除'
  }
  if (isServerError.value) {
    return '服务器遇到了一些问题，我们正在努力修复中'
  }
  if (error.value?.message) {
    return error.value.message
  }
  return '发生了意外错误，请稍后重试'
})

const iconName = computed(() => {
  if (isNotFound.value) return 'mdi:file-question-outline'
  if (isServerError.value) return 'mdi:server-network-off'
  return 'mdi:alert-circle-outline'
})

const iconBgClass = computed(() => {
  if (isNotFound.value) return 'bg-yellow-100 dark:bg-yellow-900'
  if (isServerError.value) return 'bg-red-100 dark:bg-red-900'
  return 'bg-orange-100 dark:bg-orange-900'
})

const iconColorClass = computed(() => {
  if (isNotFound.value) return 'text-yellow-600 dark:text-yellow-400'
  if (isServerError.value) return 'text-red-600 dark:text-red-400'
  return 'text-orange-600 dark:text-orange-400'
})

const showRetry = computed(() => isServerError.value)
const canGoBack = computed(() => window.history.length > 1)

const handleRetry = () => {
  logger.addBreadcrumb('User clicked retry button')
  clearError({ redirect: window.location.pathname })
}

const handleGoHome = () => {
  logger.addBreadcrumb('User clicked go home button')
  clearError({ redirect: '/' })
}

const handleGoBack = () => {
  logger.addBreadcrumb('User clicked go back button')
  window.history.back()
}
</script>
