<template>
  <NuxtLayout>
    <div
      class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 dark:from-gray-900 dark:to-gray-800"
    >
      <div class="w-full max-w-2xl">
        <div class="rounded-2xl bg-white p-8 shadow-2xl md:p-12 dark:bg-gray-800">
          <!-- Error Icon -->
          <div class="mb-6 flex justify-center">
            <div
              class="flex h-20 w-20 items-center justify-center rounded-full"
              :class="iconBgClass"
            >
              <Icon :name="iconName" class="h-12 w-12" :class="iconColorClass" />
            </div>
          </div>

          <!-- Error Title -->
          <h1 class="mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            {{ title }}
          </h1>

          <!-- Error Message -->
          <p class="mb-8 text-center text-lg text-gray-600 dark:text-gray-300">
            {{ message }}
          </p>

          <!-- Error Details (Dev only) -->
          <div v-if="isDev && error?.stack" class="mb-8">
            <details class="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <summary class="mb-2 cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
                错误详情 (仅开发环境)
              </summary>
              <pre class="overflow-x-auto text-xs text-gray-600 dark:text-gray-400">{{
                error.stack
              }}</pre>
            </details>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              v-if="showRetry"
              @click="handleRetry"
              class="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-indigo-700 hover:shadow-xl"
            >
              <Icon name="mdi:refresh" class="mr-2 inline-block h-5 w-5" />
              重试
            </button>

            <button
              @click="handleGoHome"
              class="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Icon name="mdi:home" class="mr-2 inline-block h-5 w-5" />
              返回首页
            </button>

            <button
              v-if="canGoBack"
              @click="handleGoBack"
              class="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Icon name="mdi:arrow-left" class="mr-2 inline-block h-5 w-5" />
              返回上一页
            </button>
          </div>

          <!-- Help Text -->
          <div class="mt-8 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              如果问题持续存在，请联系
              <a
                href="mailto:support@example.com"
                class="text-indigo-600 hover:underline dark:text-indigo-400"
              >
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
