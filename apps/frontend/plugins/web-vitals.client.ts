import type { Metric } from 'web-vitals'
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals'

interface AnalyticsConsent {
  analytics: boolean
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const sendToAnalytics = (metric: Metric) => {
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

    const url = `${config.public.apiBaseUrl}/api/analytics/web-vitals`

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body)
    } else {
      fetch(url, {
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

  const getAnalyticsConsent = (): AnalyticsConsent => {
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

  if (typeof window !== 'undefined') {
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onFID(sendToAnalytics)
    onINP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  }

  return {
    provide: {
      webVitals: {
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
      },
    },
  }
})
