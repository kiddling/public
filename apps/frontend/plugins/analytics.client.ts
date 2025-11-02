export default defineNuxtPlugin(() => {
  const analytics = useAnalytics()

  // Analytics is auto-initialized in the composable via onMounted
  // This plugin just ensures the composable is available globally

  return {
    provide: {
      analytics,
    },
  }
})
