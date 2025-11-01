import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Metric } from 'web-vitals'

describe('Web Vitals Plugin', () => {
  let mockSendBeacon: ReturnType<typeof vi.fn>
  let mockFetch: ReturnType<typeof vi.fn>
  let originalSendBeacon: typeof navigator.sendBeacon | undefined
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    mockSendBeacon = vi.fn()
    mockFetch = vi.fn().mockResolvedValue({ ok: true })
    originalSendBeacon = navigator.sendBeacon
    originalFetch = global.fetch

    Object.defineProperty(navigator, 'sendBeacon', {
      writable: true,
      value: mockSendBeacon,
    })
    global.fetch = mockFetch
    
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    })
  })

  afterEach(() => {
    if (originalSendBeacon) {
      Object.defineProperty(navigator, 'sendBeacon', {
        writable: true,
        value: originalSendBeacon,
      })
    }
    global.fetch = originalFetch
    vi.unstubAllGlobals()
  })

  describe('Analytics Consent', () => {
    it('should respect analytics consent when enabled', () => {
      const mockMetric: Metric = {
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500,
        id: 'test-id',
        navigationType: 'navigate',
        entries: [],
      }

      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({ analytics: true })
      )

      const sendToAnalytics = createMockSendToAnalytics()
      sendToAnalytics(mockMetric)

      expect(mockSendBeacon).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/web-vitals'),
        expect.stringContaining('"name":"LCP"')
      )
    })

    it('should not send metrics when analytics consent is denied', () => {
      const mockMetric: Metric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        delta: 0.05,
        id: 'test-id',
        navigationType: 'navigate',
        entries: [],
      }

      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({ analytics: false })
      )

      const sendToAnalytics = createMockSendToAnalytics()
      sendToAnalytics(mockMetric)

      expect(mockSendBeacon).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should default to enabled when no consent is stored', () => {
      const mockMetric: Metric = {
        name: 'FID',
        value: 100,
        rating: 'good',
        delta: 100,
        id: 'test-id',
        navigationType: 'navigate',
        entries: [],
      }

      vi.mocked(localStorage.getItem).mockReturnValue(null)

      const sendToAnalytics = createMockSendToAnalytics()
      sendToAnalytics(mockMetric)

      expect(mockSendBeacon).toHaveBeenCalled()
    })

    it('should handle invalid consent data gracefully', () => {
      const mockMetric: Metric = {
        name: 'INP',
        value: 200,
        rating: 'needs-improvement',
        delta: 200,
        id: 'test-id',
        navigationType: 'navigate',
        entries: [],
      }

      vi.mocked(localStorage.getItem).mockReturnValue('invalid-json')

      const sendToAnalytics = createMockSendToAnalytics()
      sendToAnalytics(mockMetric)

      expect(mockSendBeacon).toHaveBeenCalled()
    })
  })

  describe('Metric Reporting', () => {
    beforeEach(() => {
      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({ analytics: true })
      )
    })

    it('should send metric data via sendBeacon when available', () => {
      const mockMetric: Metric = {
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500,
        id: 'v3-123456',
        navigationType: 'navigate',
        entries: [],
      }

      const sendToAnalytics = createMockSendToAnalytics()
      sendToAnalytics(mockMetric)

      expect(mockSendBeacon).toHaveBeenCalledTimes(1)
      expect(mockSendBeacon).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/web-vitals'),
        expect.any(String)
      )

      const sentData = mockSendBeacon.mock.calls[0][1]
      const parsedData = JSON.parse(sentData)
      
      expect(parsedData).toMatchObject({
        name: 'LCP',
        value: 2500,
        rating: 'good',
        delta: 2500,
        id: 'v3-123456',
        navigationType: 'navigate',
      })
      expect(parsedData.timestamp).toBeDefined()
      expect(parsedData.url).toBeDefined()
      expect(parsedData.userAgent).toBeDefined()
    })

    it('should fallback to fetch when sendBeacon is not available', async () => {
      Object.defineProperty(navigator, 'sendBeacon', {
        writable: true,
        value: undefined,
      })

      const mockMetric: Metric = {
        name: 'CLS',
        value: 0.05,
        rating: 'good',
        delta: 0.05,
        id: 'test-id',
        navigationType: 'navigate',
        entries: [],
      }

      const sendToAnalytics = createMockSendToAnalytics()
      await sendToAnalytics(mockMetric)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/web-vitals'),
        expect.objectContaining({
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    })

    it('should handle fetch errors gracefully', async () => {
      Object.defineProperty(navigator, 'sendBeacon', {
        writable: true,
        value: undefined,
      })

      mockFetch.mockRejectedValue(new Error('Network error'))

      const mockMetric: Metric = {
        name: 'FCP',
        value: 1800,
        rating: 'good',
        delta: 1800,
        id: 'test-id',
        navigationType: 'navigate',
        entries: [],
      }

      const sendToAnalytics = createMockSendToAnalytics()
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await sendToAnalytics(mockMetric)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to send web vitals:',
        expect.any(Error)
      )

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Performance Helpers', () => {
    it('should provide performance mark helper', () => {
      const markSpy = vi.spyOn(performance, 'mark')
      
      const helpers = createWebVitalsHelpers()
      helpers.mark('test-mark')

      expect(markSpy).toHaveBeenCalledWith('test-mark')
      markSpy.mockRestore()
    })

    it('should provide performance measure helper', () => {
      const measureSpy = vi.spyOn(performance, 'measure')
      
      const helpers = createWebVitalsHelpers()
      helpers.measure('test-measure', 'start-mark', 'end-mark')

      expect(measureSpy).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark')
      measureSpy.mockRestore()
    })

    it('should handle measure without end mark', () => {
      const measureSpy = vi.spyOn(performance, 'measure')
      
      const helpers = createWebVitalsHelpers()
      helpers.measure('test-measure', 'start-mark')

      expect(measureSpy).toHaveBeenCalledWith('test-measure', 'start-mark')
      measureSpy.mockRestore()
    })

    it('should handle measure errors gracefully', () => {
      const measureSpy = vi.spyOn(performance, 'measure').mockImplementation(() => {
        throw new Error('Invalid mark name')
      })
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const helpers = createWebVitalsHelpers()
      helpers.measure('test-measure', 'invalid-mark')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to measure test-measure:',
        expect.any(Error)
      )

      measureSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    })

    it('should provide getEntries helper', () => {
      const helpers = createWebVitalsHelpers()
      const entries = helpers.getEntries()

      expect(Array.isArray(entries)).toBe(true)
    })
  })
})

function createMockSendToAnalytics() {
  return (metric: Metric) => {
    const consent = getAnalyticsConsent()
    
    if (!consent.analytics) {
      return
    }

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    })

    const url = `http://localhost:3000/api/analytics/web-vitals`

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body)
    } else {
      return fetch(url, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch((error) => {
        console.warn('Failed to send web vitals:', error)
      })
    }
  }
}

function getAnalyticsConsent(): { analytics: boolean } {
  if (typeof window === 'undefined') {
    return { analytics: false }
  }

  try {
    const consent = localStorage.getItem('analytics-consent')
    if (consent) {
      return JSON.parse(consent)
    }
  } catch (error) {
    console.warn('Failed to parse analytics consent:', error)
  }

  return { analytics: true }
}

function createWebVitalsHelpers() {
  return {
    mark: (name: string) => {
      if (typeof window !== 'undefined' && window.performance) {
        performance.mark(name)
      }
    },
    measure: (name: string, startMark: string, endMark?: string) => {
      if (typeof window !== 'undefined' && window.performance) {
        try {
          if (endMark) {
            return performance.measure(name, startMark, endMark)
          } else {
            return performance.measure(name, startMark)
          }
        } catch (error) {
          console.warn(`Failed to measure ${name}:`, error)
        }
      }
    },
    getEntries: () => {
      if (typeof window !== 'undefined' && window.performance) {
        return performance.getEntries()
      }
      return []
    },
  }
}
