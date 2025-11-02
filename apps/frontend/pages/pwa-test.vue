<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-6 py-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PWA 功能测试
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            测试和查看 Progressive Web App 功能状态
          </p>

          <div class="space-y-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                连接状态
              </h2>
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    'w-4 h-4 rounded-full',
                    isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500',
                  ]"
                />
                <span class="text-lg text-gray-700 dark:text-gray-300">
                  {{ isOnline ? '在线' : '离线' }}
                </span>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                PWA 功能支持
              </h2>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Service Worker 支持</span>
                  <StatusBadge :supported="'serviceWorker' in navigator" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Push 通知支持</span>
                  <StatusBadge :supported="'PushManager' in window" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Cache API 支持</span>
                  <StatusBadge :supported="'caches' in window" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">PWA 能力</span>
                  <StatusBadge :supported="isPWACapable" />
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                安装状态
              </h2>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">已安装</span>
                  <StatusBadge :supported="isInstalled" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">可安装</span>
                  <StatusBadge :supported="canInstall" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">iOS 设备</span>
                  <StatusBadge :supported="isIOSDevice" />
                </div>
              </div>

              <div v-if="!isInstalled" class="mt-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  安装指引 ({{ installInstructions.platform }})
                </h3>
                <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li v-for="(step, index) in installInstructions.steps" :key="index">
                    {{ step }}
                  </li>
                </ol>
              </div>
            </div>

            <div v-if="cacheInfo" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                缓存信息
              </h2>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">已使用空间</span>
                  <span class="text-gray-900 dark:text-white font-medium">
                    {{ cacheInfo.usageInMB }} MB
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">总配额</span>
                  <span class="text-gray-900 dark:text-white font-medium">
                    {{ cacheInfo.quotaInMB }} MB
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">使用率</span>
                  <span class="text-gray-900 dark:text-white font-medium">
                    {{ cacheInfo.percentage }}%
                  </span>
                </div>
              </div>
              
              <div class="mt-4">
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${cacheInfo.percentage}%` }"
                  />
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                维护操作
              </h2>
              <div class="space-y-3">
                <button
                  @click="handleClearCache"
                  class="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  清除所有缓存
                </button>
                <button
                  @click="handleUnregisterSW"
                  class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  注销 Service Worker
                </button>
                <button
                  @click="refreshCacheInfo"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  刷新缓存信息
                </button>
              </div>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h2 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                测试建议
              </h2>
              <ul class="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                <li class="flex items-start">
                  <svg class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  打开 Chrome DevTools → Application → Service Workers 查看详细状态
                </li>
                <li class="flex items-start">
                  <svg class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  使用 Lighthouse 运行 PWA 审计以获取完整报告
                </li>
                <li class="flex items-start">
                  <svg class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  切换到离线模式测试离线功能
                </li>
                <li class="flex items-start">
                  <svg class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  在不同设备（iOS Safari、Android Chrome）上测试
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  isOnline,
  isInstalled,
  canInstall,
  isPWACapable,
  isIOSDevice,
  getInstallInstructions,
  clearCache,
  getCacheSize,
  unregisterServiceWorker,
} = usePWA()

const cacheInfo = ref<any>(null)
const installInstructions = getInstallInstructions()

const refreshCacheInfo = async () => {
  cacheInfo.value = await getCacheSize()
}

const handleClearCache = async () => {
  if (confirm('确定要清除所有缓存吗？这将删除所有离线数据。')) {
    await clearCache()
    await refreshCacheInfo()
    alert('缓存已清除')
  }
}

const handleUnregisterSW = async () => {
  if (confirm('确定要注销 Service Worker 吗？这将禁用 PWA 功能，需要刷新页面。')) {
    await unregisterServiceWorker()
    alert('Service Worker 已注销。页面将在 3 秒后刷新...')
    setTimeout(() => {
      window.location.reload()
    }, 3000)
  }
}

onMounted(() => {
  refreshCacheInfo()
})
</script>

<script lang="ts">
const StatusBadge = defineComponent({
  props: {
    supported: {
      type: Boolean,
      required: true,
    },
  },
  template: `
    <span
      :class="[
        'px-3 py-1 rounded-full text-sm font-medium',
        supported
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      ]"
    >
      {{ supported ? '支持' : '不支持' }}
    </span>
  `,
})

export { StatusBadge }
</script>
