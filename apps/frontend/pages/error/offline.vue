<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="w-full max-w-2xl">
      <div class="rounded-2xl bg-white p-8 shadow-2xl md:p-12 dark:bg-gray-800">
        <!-- Offline Icon with Animation -->
        <div class="mb-6 flex justify-center">
          <div class="relative">
            <Icon
              name="mdi:wifi-off"
              class="h-24 w-24 text-gray-400 dark:text-gray-500"
              :class="{ 'animate-pulse': !isOnline }"
            />
            <div
              v-if="isOnline"
              class="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500"
            >
              <Icon name="mdi:check" class="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="mb-8 text-center">
          <h1 class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            {{ isOnline ? '网络已恢复' : '您当前处于离线状态' }}
          </h1>

          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ statusMessage }}
          </p>
        </div>

        <!-- Connection Status -->
        <div class="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300"> 网络状态 </span>
            <span
              class="rounded-full px-3 py-1 text-sm font-semibold"
              :class="
                isOnline
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              "
            >
              {{ isOnline ? '在线' : '离线' }}
            </span>
          </div>

          <!-- Cached Content Info -->
          <div v-if="!isOnline" class="text-sm text-gray-600 dark:text-gray-400">
            <p class="mb-2">离线模式下可用功能：</p>
            <ul class="space-y-2">
              <li class="flex items-start">
                <Icon
                  name="mdi:check-circle"
                  class="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                />
                <span>查看已缓存的页面</span>
              </li>
              <li class="flex items-start">
                <Icon
                  name="mdi:check-circle"
                  class="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                />
                <span>浏览已下载的资源</span>
              </li>
              <li class="flex items-start">
                <Icon
                  name="mdi:close-circle"
                  class="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                />
                <span>获取最新内容（需要网络）</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Troubleshooting Tips -->
        <div v-if="!isOnline" class="mb-8">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">故障排查建议</h3>
          <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div class="flex items-start">
              <span
                class="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
                >1</span
              >
              <span>检查设备的网络连接开关是否开启</span>
            </div>
            <div class="flex items-start">
              <span
                class="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
                >2</span
              >
              <span>尝试切换到其他网络（如WiFi/移动数据）</span>
            </div>
            <div class="flex items-start">
              <span
                class="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
                >3</span
              >
              <span>重启路由器或网络设备</span>
            </div>
            <div class="flex items-start">
              <span
                class="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
                >4</span
              >
              <span>检查防火墙或代理设置</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-4 sm:flex-row">
          <button
            @click="handleRetry"
            class="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-indigo-700 hover:shadow-xl disabled:bg-gray-400"
            :disabled="checking"
          >
            <Icon name="mdi:refresh" class="mr-2 h-5 w-5" :class="{ 'animate-spin': checking }" />
            {{ checking ? '检查中...' : '重新检查连接' }}
          </button>

          <button
            @click="handleGoHome"
            class="inline-flex flex-1 items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <Icon name="mdi:home" class="mr-2 h-5 w-5" />
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOnline } from '@vueuse/core'
import { useLogger } from '~/utils/logger'

const logger = useLogger()
const router = useRouter()
const isOnline = useOnline()
const checking = ref(false)

const statusMessage = computed(() => {
  return isOnline.value
    ? '网络连接已恢复，您可以继续使用所有功能'
    : '无法连接到互联网，请检查您的网络设置'
})

// Watch for online status changes
watch(isOnline, (online) => {
  if (online) {
    logger.info('Network connection restored')
    // Automatically redirect after a short delay
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } else {
    logger.warn('Network connection lost')
  }
})

const handleRetry = async () => {
  checking.value = true
  logger.addBreadcrumb('User clicked retry connection')

  // Simulate checking
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (isOnline.value) {
    router.push('/')
  }

  checking.value = false
}

const handleGoHome = () => {
  router.push('/')
}

// SEO
useHead({
  title: '网络离线',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>
