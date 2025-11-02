/**
 * Lightweight performance marking helper for custom instrumentation
 * Use this to track key flows and surface custom metrics
 */

export interface PerformanceMark {
  name: string
  startTime: number
}

export interface PerformanceMeasure {
  name: string
  startMark: string
  endMark: string
  duration: number
}

class PerformanceTracker {
  private marks: Map<string, number> = new Map()
  private measures: PerformanceMeasure[] = []
  private enabled: boolean

  constructor() {
    this.enabled = typeof window !== 'undefined' && 'performance' in window
  }

  /**
   * Create a performance mark at the current time
   */
  mark(name: string): void {
    if (!this.enabled) return

    try {
      const time = performance.now()
      this.marks.set(name, time)
      
      if (performance.mark) {
        performance.mark(name)
      }
    } catch (error) {
      console.warn('[Perf] Failed to create mark:', error)
    }
  }

  /**
   * Measure duration between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (!this.enabled) return null

    try {
      const startTime = this.marks.get(startMark)
      if (!startTime) {
        console.warn(`[Perf] Start mark "${startMark}" not found`)
        return null
      }

      const endTime = endMark ? this.marks.get(endMark) : performance.now()
      if (endTime === undefined) {
        console.warn(`[Perf] End mark "${endMark}" not found`)
        return null
      }

      const duration = endTime - startTime

      this.measures.push({
        name,
        startMark,
        endMark: endMark || 'now',
        duration,
      })

      if (performance.measure && endMark) {
        try {
          performance.measure(name, startMark, endMark)
        } catch {
          // Ignore if native marks don't exist
        }
      }

      return duration
    } catch (error) {
      console.warn('[Perf] Failed to measure:', error)
      return null
    }
  }

  /**
   * Get a specific mark time
   */
  getMark(name: string): number | undefined {
    return this.marks.get(name)
  }

  /**
   * Get all measures
   */
  getMeasures(): PerformanceMeasure[] {
    return [...this.measures]
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    this.marks.clear()
    this.measures = []

    if (this.enabled && performance.clearMarks && performance.clearMeasures) {
      try {
        performance.clearMarks()
        performance.clearMeasures()
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Clear a specific mark
   */
  clearMark(name: string): void {
    this.marks.delete(name)

    if (this.enabled && performance.clearMarks) {
      try {
        performance.clearMarks(name)
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Log all measures to console (dev only)
   */
  logMeasures(): void {
    if (this.measures.length === 0) {
      console.log('[Perf] No measures recorded')
      return
    }

    console.group('[Perf] Performance Measures')
    this.measures.forEach((measure) => {
      console.log(
        `${measure.name}: ${measure.duration.toFixed(2)}ms`,
        `(${measure.startMark} → ${measure.endMark})`
      )
    })
    console.groupEnd()
  }

  /**
   * Export measures for sending to analytics
   */
  exportMeasures(): PerformanceMeasure[] {
    return this.getMeasures()
  }
}

// Singleton instance
let trackerInstance: PerformanceTracker | null = null

export function usePerformanceTracker(): PerformanceTracker {
  if (!trackerInstance) {
    trackerInstance = new PerformanceTracker()
  }
  return trackerInstance
}

/**
 * Convenience function to mark a performance point
 */
export function perfMark(name: string): void {
  usePerformanceTracker().mark(name)
}

/**
 * Convenience function to measure between marks
 */
export function perfMeasure(name: string, startMark: string, endMark?: string): number | null {
  return usePerformanceTracker().measure(name, startMark, endMark)
}

/**
 * Decorator to measure function execution time
 */
export function measurePerformance(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const measureName = label || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const startMark = `${measureName}-start`
      const endMark = `${measureName}-end`
      
      perfMark(startMark)
      
      try {
        const result = await originalMethod.apply(this, args)
        perfMark(endMark)
        
        const duration = perfMeasure(measureName, startMark, endMark)
        if (process.dev && duration !== null) {
          console.log(`[Perf] ${measureName}: ${duration.toFixed(2)}ms`)
        }
        
        return result
      } catch (error) {
        perfMark(endMark)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Async wrapper to measure function execution
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startMark = `${name}-start`
  const endMark = `${name}-end`

  perfMark(startMark)

  try {
    const result = await fn()
    perfMark(endMark)
    
    const duration = perfMeasure(name, startMark, endMark)
    if (process.dev && duration !== null) {
      console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`)
    }

    return result
  } catch (error) {
    perfMark(endMark)
    throw error
  }
}

/**
 * Sync wrapper to measure function execution
 */
export function measureSync<T>(name: string, fn: () => T): T {
  const startMark = `${name}-start`
  const endMark = `${name}-end`

  perfMark(startMark)

  try {
    const result = fn()
    perfMark(endMark)
    
    const duration = perfMeasure(name, startMark, endMark)
    if (process.dev && duration !== null) {
      console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`)
    }

    return result
  } catch (error) {
    perfMark(endMark)
    throw error
  }
}
