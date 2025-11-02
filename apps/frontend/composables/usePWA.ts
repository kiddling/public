import { ref, computed } from 'vue'
import { useOnline } from '@vueuse/core'

export const usePWA = () => {
  const isOnline = useOnline()
  const isInstalled = ref(false)
  const canInstall = ref(false)
  const updateAvailable = ref(false)

  if (process.client) {
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
  }

  const checkInstallability = () => {
    if (process.client) {
      window.addEventListener('beforeinstallprompt', () => {
        canInstall.value = true
      })

      window.addEventListener('appinstalled', () => {
        isInstalled.value = true
        canInstall.value = false
      })
    }
  }

  const isPWACapable = computed(() => {
    if (!process.client) return false
    return 'serviceWorker' in navigator && 'PushManager' in window
  })

  const isIOSDevice = computed(() => {
    if (!process.client) return false
    const userAgent = window.navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
  })

  const getInstallInstructions = () => {
    if (isIOSDevice.value) {
      return {
        platform: 'iOS',
        steps: [
          '点击 Safari 底部的"分享"按钮',
          '向下滚动并选择"添加到主屏幕"',
          '点击右上角的"添加"',
        ],
      }
    }
    return {
      platform: 'Android/Desktop',
      steps: [
        '点击地址栏右侧的安装图标',
        '或点击页面上的"安装"按钮',
        '确认安装提示',
      ],
    }
  }

  const clearCache = async () => {
    if (process.client && 'caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
      console.log('All caches cleared')
    }
  }

  const getCacheSize = async () => {
    if (process.client && 'caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usageInMB: ((estimate.usage || 0) / 1024 / 1024).toFixed(2),
        quotaInMB: ((estimate.quota || 0) / 1024 / 1024).toFixed(2),
        percentage: estimate.quota
          ? ((estimate.usage || 0) / estimate.quota * 100).toFixed(2)
          : 0,
      }
    }
    return null
  }

  const unregisterServiceWorker = async () => {
    if (process.client && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
      console.log('Service worker unregistered')
    }
  }

  onMounted(() => {
    checkInstallability()
  })

  return {
    isOnline,
    isInstalled,
    canInstall,
    updateAvailable,
    isPWACapable,
    isIOSDevice,
    getInstallInstructions,
    clearCache,
    getCacheSize,
    unregisterServiceWorker,
  }
}
