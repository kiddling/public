/**
 * Monitoring composable that integrates performance tracking with web vitals
 * Use this to surface custom metrics and track key application flows
 */

import { usePerformanceTracker } from '~/utils/perf'
import type { PerformanceMeasure } from '~/utils/perf'

export interface CustomMetric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

export function useMonitoring() {
  const tracker = usePerformanceTracker()
  const customMetrics = ref<CustomMetric[]>([])

  /**
   * Track a custom metric
   */
  function trackMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: CustomMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    }

    customMetrics.value.push(metric)

    if (process.dev) {
      console.log(`[Monitoring] ${name}: ${value}`, tags || '')
    }
  }

  /**
   * Track data fetch time
   */
  async function trackDataFetch<T>(
    name: string,
    fetchFn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startMark = `fetch-${name}-start`
    const endMark = `fetch-${name}-end`

    tracker.mark(startMark)

    try {
      const result = await fetchFn()
      tracker.mark(endMark)

      const duration = tracker.measure(`fetch-${name}`, startMark, endMark)
      if (duration !== null) {
        trackMetric(`data-fetch.${name}`, duration, { ...tags, status: 'success' })
      }

      return result
    } catch (error) {
      tracker.mark(endMark)

      const duration = tracker.measure(`fetch-${name}`, startMark, endMark)
      if (duration !== null) {
        trackMetric(`data-fetch.${name}`, duration, { ...tags, status: 'error' })
      }

      throw error
    }
  }

  /**
   * Track component mount time
   */
  function trackComponentMount(componentName: string) {
    const startMark = `component-${componentName}-mount-start`
    const endMark = `component-${componentName}-mount-end`

    onMounted(() => {
      tracker.mark(endMark)
      const duration = tracker.measure(`component-${componentName}-mount`, startMark, endMark)

      if (duration !== null) {
        trackMetric(`component.mount.${componentName}`, duration)
      }
    })

    tracker.mark(startMark)
  }

  /**
   * Track user interaction
   */
  function trackInteraction(actionName: string, metadata?: Record<string, string>) {
    const timestamp = Date.now()
    trackMetric(`interaction.${actionName}`, timestamp, metadata)
  }

  /**
   * Track route change time
   */
  function trackRouteChange(from: string, to: string) {
    const startMark = 'route-change-start'
    const endMark = 'route-change-end'

    tracker.mark(startMark)

    nextTick(() => {
      tracker.mark(endMark)
      const duration = tracker.measure('route-change', startMark, endMark)

      if (duration !== null) {
        trackMetric('route.change', duration, { from, to })
      }
    })
  }

  /**
   * Export all custom metrics
   */
  function exportMetrics(): CustomMetric[] {
    return [...customMetrics.value]
  }

  /**
   * Export performance measures
   */
  function exportPerformanceMeasures(): PerformanceMeasure[] {
    return tracker.exportMeasures()
  }

  /**
   * Send custom metrics to telemetry endpoint
   */
  async function sendCustomMetrics() {
    if (customMetrics.value.length === 0) return

    try {
      await $fetch('/api/observability/custom-metrics', {
        method: 'POST',
        body: {
          metrics: customMetrics.value,
          timestamp: Date.now(),
        },
      })

      customMetrics.value = []
    } catch (error) {
      console.error('[Monitoring] Failed to send custom metrics:', error)
    }
  }

  /**
   * Clear all metrics
   */
  function clearMetrics() {
    customMetrics.value = []
    tracker.clear()
  }

  return {
    trackMetric,
    trackDataFetch,
    trackComponentMount,
    trackInteraction,
    trackRouteChange,
    exportMetrics,
    exportPerformanceMeasures,
    sendCustomMetrics,
    clearMetrics,
  }
}
