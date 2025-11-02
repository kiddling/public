<template>
  <Teleport to="body">
    <div
      v-if="showBanner"
      class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-lg"
    >
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex-1">
            <p class="text-gray-800 font-medium">
              我们使用分析工具来改善您的学习体验
            </p>
            <p class="text-sm text-gray-600 mt-1">
              我们收集匿名使用数据以优化应用。您可以随时选择退出。
              <a href="/privacy" class="text-blue-600 hover:underline">了解更多</a>
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="handleDecline"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              拒绝
            </button>
            <button
              @click="handleAccept"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              接受
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const CONSENT_KEY = 'analytics_consent_shown'
const CONSENT_DECISION_KEY = 'analytics_consent'

const showBanner = ref(false)
const analytics = useAnalytics()

onMounted(() => {
  // Check if consent has been shown before
  const consentShown = localStorage.getItem(CONSENT_KEY)
  const consentDecision = localStorage.getItem(CONSENT_DECISION_KEY)

  if (!consentShown && !consentDecision) {
    showBanner.value = true
  }
})

const handleAccept = () => {
  localStorage.setItem(CONSENT_KEY, 'true')
  localStorage.setItem(CONSENT_DECISION_KEY, 'true')
  analytics.grantConsent()
  showBanner.value = false
}

const handleDecline = () => {
  localStorage.setItem(CONSENT_KEY, 'true')
  localStorage.setItem(CONSENT_DECISION_KEY, 'false')
  analytics.optOut()
  showBanner.value = false
}
</script>
