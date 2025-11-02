<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="showPrompt"
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
    >
      <div class="p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <img
                src="/icons/icon-192x192.png"
                alt="App Icon"
                class="w-12 h-12 rounded-lg"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                安装学习平台
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                添加到主屏幕以便快速访问
              </p>
            </div>
          </div>
          <button
            @click="dismiss"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center space-x-2">
            <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>离线访问学习资料</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>更快的加载速度</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>类似原生应用的体验</span>
          </div>
        </div>

        <div v-if="isIOS" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
          <p class="text-sm text-blue-900 dark:text-blue-300 font-medium mb-2">
            iOS 安装步骤：
          </p>
          <ol class="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
            <li>点击 Safari 底部的"分享"按钮</li>
            <li>向下滚动并选择"添加到主屏幕"</li>
            <li>点击右上角的"添加"</li>
          </ol>
        </div>

        <div class="flex space-x-3">
          <button
            v-if="!isIOS"
            @click="install"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            立即安装
          </button>
          <button
            @click="dismiss"
            class="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
const deferredPrompt = ref<any>(null)
const isIOS = ref(false)

onMounted(() => {
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  
  if (dismissed || isStandalone) {
    return
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  isIOS.value = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream

  if (isIOS.value) {
    const notShownRecently = !localStorage.getItem('pwa-prompt-shown') ||
      Date.now() - parseInt(localStorage.getItem('pwa-prompt-shown') || '0') > 7 * 24 * 60 * 60 * 1000
    
    if (notShownRecently) {
      setTimeout(() => {
        showPrompt.value = true
        localStorage.setItem('pwa-prompt-shown', Date.now().toString())
      }, 3000)
    }
  } else {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      
      setTimeout(() => {
        showPrompt.value = true
      }, 3000)
    })
  }
})

const install = async () => {
  if (!deferredPrompt.value) return
  
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    console.log('PWA installed')
  }
  
  deferredPrompt.value = null
  showPrompt.value = false
}

const dismiss = () => {
  showPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
  localStorage.setItem('pwa-prompt-shown', Date.now().toString())
}
</script>
