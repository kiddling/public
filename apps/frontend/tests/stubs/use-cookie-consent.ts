import { ref, computed } from 'vue'

export const useCookieConsent = () => {
  const hasConsented = ref(false)
  const isAccepted = ref(false)
  
  return {
    consentState: ref({ accepted: false, timestamp: null }),
    hasConsented: computed(() => hasConsented.value),
    isAccepted: computed(() => isAccepted.value),
    loadConsent: () => {
      hasConsented.value = false
    },
    acceptCookies: () => {
      hasConsented.value = true
      isAccepted.value = true
    },
    rejectCookies: () => {
      hasConsented.value = true
      isAccepted.value = false
    },
    onAnalyticsInit: () => {},
  }
}
