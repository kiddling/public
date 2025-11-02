import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals'
import type { VitalsMetric } from '~/server/api/observability/vitals.post'

// Performance budgets (target thresholds)
const PERFORMANCE_BUDGETS = {
  LCP: 2500,  // Largest Contentful Paint
  FCP: 1500,  // First Contentful Paint
  CLS: 0.1,   // Cumulative Layout Shift
  FID: 100,   // First Input Delay
  INP: 200,   // Interaction to Next Paint
  TTFB: 600,  // Time to First Byte
}

// Batching configuration
const BATCH_SIZE = 5 // Send after collecting 5 metrics
const BATCH_TIMEOUT = 10000 // Or send after 10 seconds
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const enabled = config.public.enableVitalsTelemetry !== false

  if (!enabled) {
    if (process.dev) {
      console.log('[Web Vitals] Telemetry disabled')
    }
    return
  }

  const vitalsUrl = '/api/observability/vitals'
  const metricsStore: Record<string, number> = {}
  const metricsQueue: VitalsMetric[] = []
  const offlineQueue: VitalsMetric[] = []
  
  let batchTimer: ReturnType<typeof setTimeout> | null = null
  let sessionId = ''
  let isOnline = true

  // Generate or retrieve session ID
  function getSessionId(): string {
    if (sessionId) return sessionId

    try {
      const stored = sessionStorage.getItem('vitals-session-id')
      if (stored) {
        sessionId = stored
        return sessionId
      }
    } catch {
      // SessionStorage not available
    }

    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    
    try {
      sessionStorage.setItem('vitals-session-id', sessionId)
    } catch {
      // Ignore storage errors
    }

    return sessionId
  }

  // Check connection type
  function getConnectionType(): string | undefined {
    if (!('connection' in navigator)) return undefined
    const connection = (navigator as any).connection
    return connection?.effectiveType
  }

  // Check performance budget
  function checkPerformanceBudget(metric: Metric) {
    const budget = PERFORMANCE_BUDGETS[metric.name as keyof typeof PERFORMANCE_BUDGETS]
    if (budget && metric.value > budget) {
      console.warn(
        `[Performance Budget] ${metric.name} exceeded budget:`,
        `${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'} > ${budget}${metric.name === 'CLS' ? '' : 'ms'}`,
        `(${metric.rating})`
      )
    }
  }

  // Convert web-vitals Metric to our format
  function convertMetric(metric: Metric): VitalsMetric {
    return {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      href: window.location.href,
      page: window.location.pathname,
    }
  }

  // Send batch to server
  async function sendBatch(metrics: VitalsMetric[], retryCount = 0): Promise<void> {
    if (metrics.length === 0) return

    const payload = {
      metrics,
      sessionId: getSessionId(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: getConnectionType(),
    }

    try {
      const response = await fetch(vitalsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      if (process.dev) {
        console.log(`[Web Vitals] Sent batch of ${metrics.length} metrics`)
      }
    } catch (error) {
      console.error('[Web Vitals] Failed to send batch:', error)

      // Retry logic
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setTimeout(() => {
          sendBatch(metrics, retryCount + 1)
        }, RETRY_DELAY * (retryCount + 1))
      } else {
        // Move to offline queue if all retries failed
        offlineQueue.push(...metrics)
        saveOfflineQueue()
      }
    }
  }

  // Flush current batch
  function flushBatch(): void {
    if (batchTimer) {
      clearTimeout(batchTimer)
      batchTimer = null
    }

    if (metricsQueue.length > 0) {
      const batch = [...metricsQueue]
      metricsQueue.length = 0
      sendBatch(batch)
    }
  }

  // Schedule batch flush
  function scheduleBatchFlush(): void {
    if (batchTimer) return

    batchTimer = setTimeout(() => {
      flushBatch()
    }, BATCH_TIMEOUT)
  }

  // Add metric to queue
  function queueMetric(metric: VitalsMetric): void {
    metricsQueue.push(metric)

    // Send immediately if batch is full
    if (metricsQueue.length >= BATCH_SIZE) {
      flushBatch()
    } else {
      scheduleBatchFlush()
    }
  }

  // Save offline queue to localStorage
  function saveOfflineQueue(): void {
    try {
      localStorage.setItem('vitals-offline-queue', JSON.stringify(offlineQueue))
    } catch {
      // Ignore storage errors
    }
  }

  // Load offline queue from localStorage
  function loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem('vitals-offline-queue')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          offlineQueue.push(...parsed)
          localStorage.removeItem('vitals-offline-queue')
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  // Process offline queue when back online
  function processOfflineQueue(): void {
    if (offlineQueue.length === 0) return

    if (process.dev) {
      console.log(`[Web Vitals] Processing ${offlineQueue.length} offline metrics`)
    }

    const batch = [...offlineQueue]
    offlineQueue.length = 0
    sendBatch(batch)
  }

  // Handle metric from web-vitals
  function handleMetric(metric: Metric): void {
    // Store metric for summary
    metricsStore[metric.name] = metric.value

    // Check performance budgets
    checkPerformanceBudget(metric)

    if (process.dev) {
      console.log(
        `[Web Vitals] ${metric.name}:`,
        `${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`,
        `(${metric.rating})`
      )
    }

    // Convert and queue metric
    const vitalsMetric = convertMetric(metric)

    if (isOnline) {
      queueMetric(vitalsMetric)
    } else {
      offlineQueue.push(vitalsMetric)
      saveOfflineQueue()
    }
  }

  // Register all Web Vitals metrics
  onCLS(handleMetric)
  onFID(handleMetric)
  onLCP(handleMetric)
  onFCP(handleMetric)
  onTTFB(handleMetric)
  onINP(handleMetric)

  // Handle online/offline events
  window.addEventListener('online', () => {
    isOnline = true
    if (process.dev) {
      console.log('[Web Vitals] Back online, processing queue')
    }
    processOfflineQueue()
  })

  window.addEventListener('offline', () => {
    isOnline = false
    if (process.dev) {
      console.log('[Web Vitals] Offline, queuing metrics')
    }
  })

  // Load offline queue on startup
  loadOfflineQueue()
  if (offlineQueue.length > 0 && navigator.onLine) {
    processOfflineQueue()
  }

  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    flushBatch()
  })

  // Flush on visibility change (when page becomes hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushBatch()
    }
  })

  // Log summary on page unload (development only)
  if (process.dev) {
    window.addEventListener('beforeunload', () => {
      console.log('[Web Vitals Summary]', metricsStore)
    })
  }

  // Expose metrics for debugging
  if (process.dev) {
    (window as any).__webVitals = metricsStore
    (window as any).__webVitalsQueue = metricsQueue
    (window as any).__webVitalsOffline = offlineQueue
  }
})
