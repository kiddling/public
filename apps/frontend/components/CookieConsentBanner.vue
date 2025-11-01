<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="showBanner"
      class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl"
    >
      <div class="container mx-auto px-4 py-6 max-w-7xl">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex-1 text-sm text-gray-700 dark:text-gray-300">
            <p class="font-medium mb-2">
              {{ title }}
            </p>
            <p class="text-gray-600 dark:text-gray-400">
              {{ message }}
            </p>
          </div>
          <div class="flex gap-3 flex-shrink-0">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              @click="handleReject"
            >
              {{ rejectText }}
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              @click="handleAccept"
            >
              {{ acceptText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const {
  hasConsented,
  acceptCookies,
  rejectCookies,
  loadConsent,
} = useCookieConsent()

interface Props {
  title?: string
  message?: string
  acceptText?: string
  rejectText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '我们使用 Cookie',
  message: '我们使用 Cookie 和类似技术来改善您的浏览体验、分析网站流量，并为您提供个性化内容。点击"接受"即表示您同意使用这些技术。',
  acceptText: '接受',
  rejectText: '拒绝',
})

const showBanner = ref(false)

const handleAccept = () => {
  acceptCookies()
  showBanner.value = false
}

const handleReject = () => {
  rejectCookies()
  showBanner.value = false
}

onMounted(() => {
  loadConsent()
  // Show banner if user hasn't consented yet
  showBanner.value = !hasConsented.value
})
</script>
