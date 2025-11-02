<template>
  <div>
    <slot v-if="!hasError" />

    <div v-else class="error-boundary-fallback">
      <div
        class="mx-auto my-8 max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <Icon name="mdi:alert-circle" class="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <div class="ml-4 flex-1">
            <h3 class="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">
              {{ errorTitle }}
            </h3>

            <p class="mb-4 text-sm text-red-700 dark:text-red-400">
              {{ errorMessage }}
            </p>

            <!-- Error details in dev mode -->
            <details v-if="isDev && error" class="mb-4">
              <summary
                class="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                查看错误详情
              </summary>
              <pre
                class="mt-2 overflow-x-auto rounded bg-red-100 p-3 text-xs text-red-900 dark:bg-red-950 dark:text-red-200"
                >{{ errorDetails }}</pre
              >
            </details>

            <!-- Action buttons -->
            <div class="flex flex-wrap gap-3">
              <button
                @click="handleRetry"
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
              >
                <Icon name="mdi:refresh" class="mr-1 inline-block h-4 w-4" />
                重试
              </button>

              <button
                v-if="showReset"
                @click="handleReset"
                class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                重置状态
              </button>

              <button
                v-if="showReportButton"
                @click="handleReport"
                class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <Icon name="mdi:bug" class="mr-1 inline-block h-4 w-4" />
                报告问题
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogger } from '~/utils/logger'

interface Props {
  fallback?: string | Component
  errorTitle?: string
  errorMessage?: string
  showReset?: boolean
  showReportButton?: boolean
  onError?: (error: Error, info: string) => void
  onRetry?: () => void
  onReset?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  errorTitle: '组件加载失败',
  errorMessage: '抱歉，此部分内容暂时无法显示，请稍后重试',
  showReset: false,
  showReportButton: false,
})

const hasError = ref(false)
const error = ref<Error | null>(null)
const errorInfo = ref<string>('')
const isDev = process.env.NODE_ENV === 'development'
const logger = useLogger()

const errorDetails = computed(() => {
  if (!error.value) return ''
  return `${error.value.message}\n\n${error.value.stack || ''}`
})

// Capture errors from child components
onErrorCaptured((err: Error, instance: any, info: string) => {
  hasError.value = true
  error.value = err
  errorInfo.value = info

  logger.error(
    'Error boundary caught error',
    {
      componentName: instance?.$options?.name || 'Unknown',
      info,
    },
    err
  )

  // Call custom error handler if provided
  props.onError?.(err, info)

  // Prevent error from propagating
  return false
})

const handleRetry = () => {
  logger.addBreadcrumb('User clicked retry in error boundary')

  if (props.onRetry) {
    props.onRetry()
  }

  // Reset error state
  hasError.value = false
  error.value = null
  errorInfo.value = ''
}

const handleReset = () => {
  logger.addBreadcrumb('User clicked reset in error boundary')

  if (props.onReset) {
    props.onReset()
  }

  // Reset error state
  hasError.value = false
  error.value = null
  errorInfo.value = ''
}

const handleReport = () => {
  logger.addBreadcrumb('User clicked report issue')

  // In a real app, this would open a feedback form or send to error tracking
  const errorReport = {
    message: error.value?.message,
    stack: error.value?.stack,
    info: errorInfo.value,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  }

  logger.error('User reported error', errorReport)

  // Show confirmation
  alert('错误已记录，感谢您的反馈！')
}

// Automatically retry after error in some cases
const autoRetryTimeout = ref<NodeJS.Timeout | null>(null)

watch(hasError, (newValue) => {
  if (newValue && process.env.NODE_ENV === 'production') {
    // Auto-retry after 5 seconds in production
    autoRetryTimeout.value = setTimeout(() => {
      logger.info('Auto-retrying after error')
      handleRetry()
    }, 5000)
  }
})

onUnmounted(() => {
  if (autoRetryTimeout.value) {
    clearTimeout(autoRetryTimeout.value)
  }
})
</script>
