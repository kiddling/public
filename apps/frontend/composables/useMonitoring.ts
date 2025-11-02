/**
 * Composable for monitoring application metrics and errors
 */

import { useLogger } from '~/utils/logger'

export interface MetricData {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
  timestamp: string
}

export interface ErrorMetric {
  code: string
  message: string
  count: number
  lastOccurred: string
}

class MonitoringService {
  private metrics: MetricData[] = []
  private errorCounts: Map<string, ErrorMetric> = new Map()
  private maxMetrics = 1000

  recordMetric(name: string, value: number, unit?: string, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      unit,
      tags,
      timestamp: new Date().toISOString(),
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(metric)
    }
  }

  recordError(code: string, message: string) {
    const existing = this.errorCounts.get(code)
    
    if (existing) {
      existing.count++
      existing.lastOccurred = new Date().toISOString()
    } else {
      this.errorCounts.set(code, {
        code,
        message,
        count: 1,
        lastOccurred: new Date().toISOString(),
      })
    }
  }

  getMetrics(name?: string): MetricData[] {
    if (name) {
      return this.metrics.filter(m => m.name === name)
    }
    return [...this.metrics]
  }

  getErrorMetrics(): ErrorMetric[] {
    return Array.from(this.errorCounts.values())
  }

  getErrorRate(timeWindow: number = 3600000): number {
    // Calculate error rate in the last hour (default)
    const cutoff = Date.now() - timeWindow
    const recentErrors = this.metrics.filter(
      m => m.name === 'error' && new Date(m.timestamp).getTime() > cutoff
    )
    return recentErrors.length
  }

  clearMetrics() {
    this.metrics = []
    this.errorCounts.clear()
  }

  private sendToMonitoringService(metric: MetricData) {
    // Placeholder for sending to external monitoring service
    // Example: DataDog, New Relic, CloudWatch, etc.
    try {
      // fetch('/api/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric),
      // })
    } catch (error) {
      console.warn('Failed to send metric:', error)
    }
  }
}

const monitoringService = new MonitoringService()

export function useMonitoring() {
  const logger = useLogger()

  const recordPageView = (path: string) => {
    monitoringService.recordMetric('page_view', 1, 'count', { path })
    logger.addBreadcrumb(`Page view: ${path}`)
  }

  const recordApiCall = (endpoint: string, duration: number, success: boolean) => {
    monitoringService.recordMetric('api_call', duration, 'ms', {
      endpoint,
      success: success.toString(),
    })
    
    if (!success) {
      monitoringService.recordError('API_ERROR', `API call failed: ${endpoint}`)
    }
  }

  const recordError = (code: string, message: string) => {
    monitoringService.recordMetric('error', 1, 'count', { code })
    monitoringService.recordError(code, message)
    logger.error('Error recorded', { code, message })
  }

  const recordUserAction = (action: string, details?: Record<string, any>) => {
    monitoringService.recordMetric('user_action', 1, 'count', {
      action,
      ...details,
    })
    logger.addBreadcrumb(`User action: ${action}`)
  }

  const recordPerformanceMetric = (name: string, duration: number) => {
    monitoringService.recordMetric(name, duration, 'ms')
    logger.debug(`Performance: ${name}`, { duration })
  }

  const getErrorRate = (timeWindow?: number) => {
    return monitoringService.getErrorRate(timeWindow)
  }

  const getMetrics = (name?: string) => {
    return monitoringService.getMetrics(name)
  }

  const getErrorMetrics = () => {
    return monitoringService.getErrorMetrics()
  }

  return {
    recordPageView,
    recordApiCall,
    recordError,
    recordUserAction,
    recordPerformanceMetric,
    getErrorRate,
    getMetrics,
    getErrorMetrics,
  }
}

// Auto-track page views
export function useAutoTracking() {
  const router = useRouter()
  const { recordPageView } = useMonitoring()

  // Track initial page view
  onMounted(() => {
    recordPageView(router.currentRoute.value.fullPath)
  })

  // Track subsequent page views
  router.afterEach((to) => {
    recordPageView(to.fullPath)
  })
}
