import type {
  AnalyticsEvent,
  AnalyticsConfig,
  EventType,
  PageViewEvent,
  CourseBrowseEvent,
  DifficultySwitchEvent,
  ProgressMarkEvent,
  SearchEvent,
  DownloadEvent,
  InteractionEvent,
} from '~/types/analytics'

// Generate UUID using crypto API
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const STORAGE_KEYS = {
  SESSION_ID: 'analytics_session_id',
  USER_ID: 'analytics_user_id',
  QUEUE: 'analytics_queue',
  LAST_ACTIVITY: 'analytics_last_activity',
  OPT_OUT: 'analytics_opt_out',
  CONSENT: 'analytics_consent',
} as const

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const DEFAULT_BATCH_SIZE = 10
const DEFAULT_BATCH_INTERVAL = 30000 // 30 seconds

export const useAnalytics = () => {
  const config = ref<AnalyticsConfig>({
    enabled: true,
    debug: false,
    batchSize: DEFAULT_BATCH_SIZE,
    batchInterval: DEFAULT_BATCH_INTERVAL,
    offlineStorage: true,
    respectDoNotTrack: true,
    anonymizeIp: true,
    cookieConsent: false,
  })

  const eventQueue = ref<AnalyticsEvent[]>([])
  const sessionId = ref<string>('')
  const userId = ref<string | undefined>(undefined)
  const pageEnterTime = ref<number>(0)
  const currentPagePath = ref<string>('')
  const isOnline = ref(true)
  const batchTimer = ref<NodeJS.Timeout | null>(null)

  const router = useRouter()
  const route = useRoute()

  // Initialize analytics
  const init = () => {
    if (import.meta.server) return

    // Check opt-out and consent
    if (isOptedOut() || (config.value.cookieConsent && !hasConsent())) {
      config.value.enabled = false
      return
    }

    // Respect Do Not Track
    if (config.value.respectDoNotTrack && navigator.doNotTrack === '1') {
      config.value.enabled = false
      return
    }

    // Initialize session
    initializeSession()

    // Load offline queue
    if (config.value.offlineStorage) {
      loadOfflineQueue()
    }

    // Monitor online status
    if (typeof window !== 'undefined') {
      isOnline.value = navigator.onLine
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    // Start batch timer
    startBatchTimer()

    // Track session start
    trackEvent({
      eventType: 'session_start',
      timestamp: Date.now(),
      sessionId: sessionId.value,
      userId: userId.value,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    })

    // Track page visibility for dwell time
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Handle beforeunload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    log('Analytics initialized')
  }

  // Initialize or restore session
  const initializeSession = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
    const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)

    if (stored && lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10)
      if (timeSinceLastActivity < SESSION_TIMEOUT) {
        sessionId.value = stored
      } else {
        sessionId.value = generateUUID()
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId.value)
      }
    } else {
      sessionId.value = generateUUID()
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId.value)
    }

    // Get or create user ID
    const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID)
    if (storedUserId) {
      userId.value = storedUserId
    } else {
      userId.value = generateUUID()
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId.value)
    }

    updateLastActivity()
  }

  const updateLastActivity = () => {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
  }

  // Check opt-out status
  const isOptedOut = (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.OPT_OUT) === 'true'
  }

  // Check consent status
  const hasConsent = (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.CONSENT) === 'true'
  }

  // Set opt-out
  const optOut = () => {
    localStorage.setItem(STORAGE_KEYS.OPT_OUT, 'true')
    config.value.enabled = false
    clearOfflineQueue()
    log('User opted out of analytics')
  }

  // Set consent
  const grantConsent = () => {
    localStorage.setItem(STORAGE_KEYS.CONSENT, 'true')
    if (!isOptedOut()) {
      config.value.enabled = true
      init()
    }
  }

  // Track event
  const trackEvent = (event: Partial<AnalyticsEvent> & { eventType: EventType }) => {
    if (!config.value.enabled || import.meta.server) return

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: sessionId.value,
      userId: userId.value,
      url: event.url || (typeof window !== 'undefined' ? window.location.href : ''),
      referrer: event.referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      userAgent: event.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
    } as AnalyticsEvent

    log('Tracking event:', fullEvent)

    eventQueue.value.push(fullEvent)
    updateLastActivity()

    // Send immediately if batch size is reached
    if (eventQueue.value.length >= config.value.batchSize) {
      sendBatch()
    }
  }

  // Track page view
  const trackPageView = (pagePath?: string, pageTitle?: string) => {
    if (!config.value.enabled) return

    const path = pagePath || route.path
    const title = pageTitle || (typeof document !== 'undefined' ? document.title : '')

    // Calculate dwell time for previous page
    if (pageEnterTime.value > 0 && currentPagePath.value) {
      const dwellTime = Date.now() - pageEnterTime.value
      if (dwellTime > 1000) { // Only track if more than 1 second
        trackEvent({
          eventType: 'page_view',
          pageTitle: currentPagePath.value,
          pagePath: currentPagePath.value,
          dwellTime,
          timestamp: pageEnterTime.value,
        } as PageViewEvent)
      }
    }

    // Update current page
    currentPagePath.value = path
    pageEnterTime.value = Date.now()

    log(`Page view: ${path}`)
  }

  // Track course browse
  const trackCourseBrowse = (courseId: string, courseTitle?: string, lessonId?: string, lessonTitle?: string) => {
    trackEvent({
      eventType: 'course_browse',
      courseId,
      courseTitle,
      lessonId,
      lessonTitle,
    } as CourseBrowseEvent)
  }

  // Track difficulty switch
  const trackDifficultySwitch = (lessonId: string, fromDifficulty: string, toDifficulty: string) => {
    trackEvent({
      eventType: 'difficulty_switch',
      lessonId,
      fromDifficulty,
      toDifficulty,
    } as DifficultySwitchEvent)
  }

  // Track progress mark
  const trackProgressMark = (lessonId: string, completed: boolean, lessonTitle?: string) => {
    trackEvent({
      eventType: 'progress_mark',
      lessonId,
      lessonTitle,
      completed,
    } as ProgressMarkEvent)
  }

  // Track search
  const trackSearch = (query: string, resultsCount?: number, selectedResultIndex?: number, selectedResultId?: string) => {
    trackEvent({
      eventType: 'search',
      query,
      resultsCount,
      selectedResultIndex,
      selectedResultId,
    } as SearchEvent)
  }

  // Track download
  const trackDownload = (resourceId: string, resourceName: string, resourceType: string, fileFormat?: string) => {
    trackEvent({
      eventType: 'download',
      resourceId,
      resourceName,
      resourceType,
      fileFormat,
    } as DownloadEvent)
  }

  // Track interaction
  const trackInteraction = (eventType: 'expand' | 'filter' | 'navigation_click', elementId?: string, elementType?: string, action?: string, metadata?: Record<string, any>) => {
    trackEvent({
      eventType,
      elementId,
      elementType,
      action,
      metadata,
    } as InteractionEvent)
  }

  // Send batch
  const sendBatch = async () => {
    if (eventQueue.value.length === 0) return

    const batch = [...eventQueue.value]
    eventQueue.value = []

    try {
      if (isOnline.value) {
        await $fetch('/api/analytics/track', {
          method: 'POST',
          body: {
            events: batch,
            batchId: generateUUID(),
            timestamp: Date.now(),
          },
        })
        log(`Sent batch of ${batch.length} events`)
      } else if (config.value.offlineStorage) {
        saveToOfflineQueue(batch)
      }
    } catch (error) {
      console.error('Failed to send analytics batch:', error)
      if (config.value.offlineStorage) {
        saveToOfflineQueue(batch)
      }
    }
  }

  // Offline queue management
  const loadOfflineQueue = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUEUE)
      if (stored) {
        const queue = JSON.parse(stored) as AnalyticsEvent[]
        eventQueue.value.push(...queue)
        localStorage.removeItem(STORAGE_KEYS.QUEUE)
        log(`Loaded ${queue.length} events from offline queue`)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  }

  const saveToOfflineQueue = (events: AnalyticsEvent[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUEUE)
      const existingQueue = stored ? JSON.parse(stored) : []
      const newQueue = [...existingQueue, ...events]
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(newQueue))
      log(`Saved ${events.length} events to offline queue`)
    } catch (error) {
      console.error('Failed to save to offline queue:', error)
    }
  }

  const clearOfflineQueue = () => {
    localStorage.removeItem(STORAGE_KEYS.QUEUE)
  }

  // Online/offline handlers
  const handleOnline = () => {
    isOnline.value = true
    log('Connection restored, sending offline queue')
    loadOfflineQueue()
    if (eventQueue.value.length > 0) {
      sendBatch()
    }
  }

  const handleOffline = () => {
    isOnline.value = false
    log('Connection lost')
  }

  // Visibility change handler
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Send any pending events before page becomes hidden
      if (eventQueue.value.length > 0) {
        sendBatch()
      }
    }
  }

  // Before unload handler
  const handleBeforeUnload = () => {
    // Track final page view with dwell time
    if (pageEnterTime.value > 0 && currentPagePath.value) {
      const dwellTime = Date.now() - pageEnterTime.value
      if (dwellTime > 1000) {
        trackEvent({
          eventType: 'page_view',
          pageTitle: currentPagePath.value,
          pagePath: currentPagePath.value,
          dwellTime,
          timestamp: pageEnterTime.value,
        } as PageViewEvent)
      }
    }

    // Track session end
    trackEvent({
      eventType: 'session_end',
      timestamp: Date.now(),
      sessionId: sessionId.value,
      userId: userId.value,
      url: window.location.href,
    })

    // Send immediately using sendBeacon if available
    if (eventQueue.value.length > 0 && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify({
          events: eventQueue.value,
          batchId: generateUUID(),
          timestamp: Date.now(),
        })], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/track', blob)
        eventQueue.value = []
      } catch (error) {
        console.error('Failed to send beacon:', error)
        if (config.value.offlineStorage) {
          saveToOfflineQueue(eventQueue.value)
        }
      }
    }
  }

  // Batch timer
  const startBatchTimer = () => {
    if (batchTimer.value) {
      clearInterval(batchTimer.value)
    }
    batchTimer.value = setInterval(() => {
      if (eventQueue.value.length > 0) {
        sendBatch()
      }
    }, config.value.batchInterval)
  }

  // Cleanup
  const cleanup = () => {
    if (batchTimer.value) {
      clearInterval(batchTimer.value)
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  // Logging
  const log = (...args: any[]) => {
    if (config.value.debug) {
      console.log('[Analytics]', ...args)
    }
  }

  // Watch route changes
  if (import.meta.client) {
    watch(() => route.path, () => {
      trackPageView()
    }, { immediate: false })
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    config,
    sessionId: readonly(sessionId),
    userId: readonly(userId),
    isOnline: readonly(isOnline),
    init,
    trackEvent,
    trackPageView,
    trackCourseBrowse,
    trackDifficultySwitch,
    trackProgressMark,
    trackSearch,
    trackDownload,
    trackInteraction,
    optOut,
    grantConsent,
    sendBatch,
  }
}
