import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  usePerformanceTracker,
  perfMark,
  perfMeasure,
  measureSync,
  measureAsync,
} from '~/utils/perf'

describe('Performance Tracker', () => {
  beforeEach(() => {
    const tracker = usePerformanceTracker()
    tracker.clear()
    vi.clearAllMocks()
  })

  describe('usePerformanceTracker', () => {
    it('creates a singleton instance', () => {
      const tracker1 = usePerformanceTracker()
      const tracker2 = usePerformanceTracker()
      expect(tracker1).toBe(tracker2)
    })

    it('marks performance points', () => {
      const tracker = usePerformanceTracker()
      tracker.mark('test-mark')

      const markTime = tracker.getMark('test-mark')
      expect(markTime).toBeDefined()
      expect(typeof markTime).toBe('number')
    })

    it('measures duration between marks', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('start')
      tracker.mark('end')

      const duration = tracker.measure('test-measure', 'start', 'end')
      expect(duration).not.toBeNull()
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('returns null for missing start mark', () => {
      const tracker = usePerformanceTracker()

      const duration = tracker.measure('test', 'missing-start', 'missing-end')
      expect(duration).toBeNull()
    })

    it('measures from mark to now when end mark is omitted', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('start')
      const duration = tracker.measure('test', 'start')

      expect(duration).not.toBeNull()
      expect(typeof duration).toBe('number')
    })

    it('stores multiple marks', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('mark1')
      tracker.mark('mark2')
      tracker.mark('mark3')

      expect(tracker.getMark('mark1')).toBeDefined()
      expect(tracker.getMark('mark2')).toBeDefined()
      expect(tracker.getMark('mark3')).toBeDefined()
    })

    it('creates multiple measures', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('start1')
      tracker.mark('end1')
      tracker.mark('start2')
      tracker.mark('end2')

      tracker.measure('measure1', 'start1', 'end1')
      tracker.measure('measure2', 'start2', 'end2')

      const measures = tracker.getMeasures()
      expect(measures).toHaveLength(2)
      expect(measures[0].name).toBe('measure1')
      expect(measures[1].name).toBe('measure2')
    })

    it('exports measures', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('start')
      tracker.mark('end')
      tracker.measure('test', 'start', 'end')

      const exported = tracker.exportMeasures()
      expect(exported).toHaveLength(1)
      expect(exported[0]).toHaveProperty('name')
      expect(exported[0]).toHaveProperty('duration')
      expect(exported[0]).toHaveProperty('startMark')
      expect(exported[0]).toHaveProperty('endMark')
    })

    it('clears all marks and measures', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('test')
      tracker.mark('start')
      tracker.mark('end')
      tracker.measure('measure', 'start', 'end')

      expect(tracker.getMark('test')).toBeDefined()
      expect(tracker.getMeasures()).toHaveLength(1)

      tracker.clear()

      expect(tracker.getMark('test')).toBeUndefined()
      expect(tracker.getMeasures()).toHaveLength(0)
    })

    it('clears specific mark', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('keep')
      tracker.mark('remove')

      tracker.clearMark('remove')

      expect(tracker.getMark('keep')).toBeDefined()
      expect(tracker.getMark('remove')).toBeUndefined()
    })
  })

  describe('convenience functions', () => {
    it('perfMark creates a mark', () => {
      perfMark('test')
      const tracker = usePerformanceTracker()
      expect(tracker.getMark('test')).toBeDefined()
    })

    it('perfMeasure measures between marks', () => {
      perfMark('start')
      perfMark('end')

      const duration = perfMeasure('test', 'start', 'end')
      expect(duration).not.toBeNull()
      expect(typeof duration).toBe('number')
    })
  })

  describe('measureSync', () => {
    it('measures synchronous function execution', () => {
      let executed = false

      const result = measureSync('sync-test', () => {
        executed = true
        return 42
      })

      expect(executed).toBe(true)
      expect(result).toBe(42)
    })

    it('creates marks for function execution', () => {
      measureSync('func-test', () => 'test')

      const tracker = usePerformanceTracker()
      expect(tracker.getMark('func-test-start')).toBeDefined()
      expect(tracker.getMark('func-test-end')).toBeDefined()
    })

    it('propagates errors', () => {
      expect(() => {
        measureSync('error-test', () => {
          throw new Error('Test error')
        })
      }).toThrow('Test error')
    })
  })

  describe('measureAsync', () => {
    it('measures asynchronous function execution', async () => {
      let executed = false

      const result = await measureAsync('async-test', async () => {
        executed = true
        return Promise.resolve(42)
      })

      expect(executed).toBe(true)
      expect(result).toBe(42)
    })

    it('creates marks for async function execution', async () => {
      await measureAsync('async-func-test', async () => 'test')

      const tracker = usePerformanceTracker()
      expect(tracker.getMark('async-func-test-start')).toBeDefined()
      expect(tracker.getMark('async-func-test-end')).toBeDefined()
    })

    it('propagates async errors', async () => {
      await expect(async () => {
        await measureAsync('async-error-test', async () => {
          throw new Error('Async test error')
        })
      }).rejects.toThrow('Async test error')
    })
  })

  describe('measure data structure', () => {
    it('creates valid measure objects', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('start')
      tracker.mark('end')
      tracker.measure('test', 'start', 'end')

      const measures = tracker.getMeasures()
      const measure = measures[0]

      expect(measure).toHaveProperty('name')
      expect(measure).toHaveProperty('startMark')
      expect(measure).toHaveProperty('endMark')
      expect(measure).toHaveProperty('duration')

      expect(typeof measure.name).toBe('string')
      expect(typeof measure.startMark).toBe('string')
      expect(typeof measure.endMark).toBe('string')
      expect(typeof measure.duration).toBe('number')
    })

    it('handles "now" as end mark', () => {
      const tracker = usePerformanceTracker()

      tracker.mark('start')
      tracker.measure('test', 'start')

      const measures = tracker.getMeasures()
      expect(measures[0].endMark).toBe('now')
    })
  })
})
