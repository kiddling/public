export interface CookieConsentState {
  accepted: boolean
  timestamp: number | null
}

const STORAGE_KEY = 'cookie-consent'

export const useCookieConsent = () => {
  const consentState = useState<CookieConsentState>('cookie-consent', () => ({
    accepted: false,
    timestamp: null,
  }))

  const analyticsCallbacks: (() => void)[] = []

  // Load consent from localStorage on client side
  const loadConsent = () => {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as CookieConsentState
          consentState.value = parsed
        }
      } catch (error) {
        console.error('Failed to load cookie consent:', error)
      }
    }
  }

  // Save consent to localStorage
  const saveConsent = (accepted: boolean) => {
    if (import.meta.client) {
      const state: CookieConsentState = {
        accepted,
        timestamp: Date.now(),
      }
      consentState.value = state
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save cookie consent:', error)
      }

      // Trigger analytics initialization if accepted
      if (accepted) {
        analyticsCallbacks.forEach(callback => callback())
      }
    }
  }

  // Accept cookies
  const acceptCookies = () => {
    saveConsent(true)
  }

  // Reject cookies
  const rejectCookies = () => {
    saveConsent(false)
  }

  // Register a callback to be called when analytics are initialized
  const onAnalyticsInit = (callback: () => void) => {
    analyticsCallbacks.push(callback)
    
    // If already accepted, call immediately
    if (consentState.value.accepted) {
      callback()
    }
  }

  // Check if consent has been given
  const hasConsented = computed(() => consentState.value.timestamp !== null)
  
  // Check if cookies are accepted
  const isAccepted = computed(() => consentState.value.accepted)

  return {
    consentState,
    hasConsented,
    isAccepted,
    loadConsent,
    acceptCookies,
    rejectCookies,
    onAnalyticsInit,
  }
}
