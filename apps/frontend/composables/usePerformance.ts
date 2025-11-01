/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetrics {
  fcp?: number
  lcp?: number
  cls?: number
  fid?: number
  ttfb?: number
  inp?: number
}

export function usePerformance() {
  const metrics = ref<PerformanceMetrics>({})

  /**
   * Get all performance metrics from PerformanceObserver
   */
  const getMetrics = (): PerformanceMetrics => {
    if (typeof window === 'undefined') return {}

    const perfData: PerformanceMetrics = {}

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      perfData.ttfb = navigation.responseStart - navigation.requestStart
    }

    // Get paint timing
    const paints = performance.getEntriesByType('paint')
    paints.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        perfData.fcp = entry.startTime
      }
    })

    return perfData
  }

  /**
   * Log performance metrics to console (dev only)
   */
  const logMetrics = () => {
    if (process.dev && typeof window !== 'undefined') {
      console.table(getMetrics())
    }
  }

  /**
   * Mark a custom performance point
   */
  const mark = (name: string) => {
    if (typeof window !== 'undefined' && performance.mark) {
      performance.mark(name)
    }
  }

  /**
   * Measure between two marks
   */
  const measure = (name: string, startMark: string, endMark: string) => {
    if (typeof window !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name)[0]
        if (process.dev) {
          console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`)
        }
        return measure.duration
      } catch (error) {
        console.error('[Performance] Measurement failed:', error)
      }
    }
  }

  /**
   * Debounce function for performance optimization
   */
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null
        func(...args)
      }
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * Throttle function for performance optimization
   */
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  /**
   * Check if user prefers reduced motion
   */
  const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Get connection speed
   */
  const getConnectionSpeed = () => {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
      return 'unknown'
    }
    const connection = (navigator as any).connection
    return connection?.effectiveType || 'unknown'
  }

  /**
   * Check if connection is slow
   */
  const isSlowConnection = () => {
    const speed = getConnectionSpeed()
    return speed === 'slow-2g' || speed === '2g'
  }

  /**
   * Preload a resource
   */
  const preloadResource = (href: string, as: string) => {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }

  /**
   * Prefetch a resource
   */
  const prefetchResource = (href: string) => {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
  }

  /**
   * Report long tasks (> 50ms)
   */
  const observeLongTasks = (callback: (duration: number) => void) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            callback(entry.duration)
            if (process.dev) {
              console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`)
            }
          }
        }
      })
      observer.observe({ entryTypes: ['longtask'] })
      return observer
    } catch (error) {
      console.error('[Performance] Long task observer failed:', error)
    }
  }

  // Initialize metrics on mount
  onMounted(() => {
    metrics.value = getMetrics()
  })

  return {
    metrics,
    getMetrics,
    logMetrics,
    mark,
    measure,
    debounce,
    throttle,
    prefersReducedMotion,
    getConnectionSpeed,
    isSlowConnection,
    preloadResource,
    prefetchResource,
    observeLongTasks,
  }
}
