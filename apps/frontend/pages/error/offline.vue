<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="max-w-2xl w-full">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
        <!-- Offline Icon with Animation -->
        <div class="flex justify-center mb-6">
          <div class="relative">
            <Icon 
              name="mdi:wifi-off" 
              class="w-24 h-24 text-gray-400 dark:text-gray-500"
              :class="{ 'animate-pulse': !isOnline }"
            />
            <div 
              v-if="isOnline" 
              class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Icon name="mdi:check" class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ isOnline ? '网络已恢复' : '您当前处于离线状态' }}
          </h1>

          <p class="text-lg text-gray-600 dark:text-gray-300">
            {{ statusMessage }}
          </p>
        </div>

        <!-- Connection Status -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              网络状态
            </span>
            <span 
              class="px-3 py-1 rounded-full text-sm font-semibold"
              :class="isOnline 
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
                <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>查看已缓存的页面</span>
              </li>
              <li class="flex items-start">
                <Icon name="mdi:check-circle" class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>浏览已下载的资源</span>
              </li>
              <li class="flex items-start">
                <Icon name="mdi:close-circle" class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>获取最新内容（需要网络）</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Troubleshooting Tips -->
        <div v-if="!isOnline" class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            故障排查建议
          </h3>
          <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
              <span>检查设备的网络连接开关是否开启</span>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
              <span>尝试切换到其他网络（如WiFi/移动数据）</span>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
              <span>重启路由器或网络设备</span>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
              <span>检查防火墙或代理设置</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            @click="handleRetry"
            class="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
            :disabled="checking"
          >
            <Icon 
              name="mdi:refresh" 
              class="w-5 h-5 mr-2"
              :class="{ 'animate-spin': checking }"
            />
            {{ checking ? '检查中...' : '重新检查连接' }}
          </button>
          
          <button
            @click="handleGoHome"
            class="flex-1 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
          >
            <Icon name="mdi:home" class="w-5 h-5 mr-2" />
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
  await new Promise(resolve => setTimeout(resolve, 1000))
  
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
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>
