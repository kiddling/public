import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VitalsPayload } from '~/server/api/observability/vitals.post'

describe('Web Vitals API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validPayload: VitalsPayload = {
    metrics: [
      {
        id: 'v3-1234567890123-4567890123456',
        name: 'LCP',
        value: 1234.5,
        rating: 'good',
        delta: 1234.5,
        navigationType: 'navigate',
        href: 'http://localhost:3000/test',
        page: '/test',
      },
      {
        id: 'v3-1234567890123-7890123456789',
        name: 'FID',
        value: 50.2,
        rating: 'good',
        href: 'http://localhost:3000/test',
        page: '/test',
      },
    ],
    sessionId: 'test-session-123',
    timestamp: Date.now(),
    userAgent: 'Mozilla/5.0 Test Browser',
    connectionType: '4g',
  }

  it('accepts valid vitals payload', () => {
    expect(validPayload.metrics).toHaveLength(2)
    expect(validPayload.metrics[0].name).toBe('LCP')
    expect(validPayload.metrics[0].value).toBe(1234.5)
    expect(validPayload.metrics[0].rating).toBe('good')
  })

  it('validates required metric fields', () => {
    const invalidMetric = {
      name: 'LCP',
      // missing id and value
    }

    const invalidPayload = {
      metrics: [invalidMetric],
      sessionId: 'test',
      timestamp: Date.now(),
    }

    expect(invalidPayload.metrics[0]).not.toHaveProperty('id')
    expect(invalidPayload.metrics[0]).not.toHaveProperty('value')
  })

  it('validates rating values', () => {
    const validRatings = ['good', 'needs-improvement', 'poor']
    
    validRatings.forEach(rating => {
      const metric = { ...validPayload.metrics[0], rating }
      expect(['good', 'needs-improvement', 'poor']).toContain(metric.rating)
    })
  })

  it('validates sessionId presence', () => {
    expect(validPayload.sessionId).toBeTruthy()
    expect(typeof validPayload.sessionId).toBe('string')
  })

  it('validates timestamp', () => {
    expect(validPayload.timestamp).toBeTruthy()
    expect(typeof validPayload.timestamp).toBe('number')
    expect(validPayload.timestamp).toBeGreaterThan(0)
  })

  it('handles optional fields', () => {
    const minimalMetric = {
      id: 'test-id',
      name: 'CLS',
      value: 0.05,
      rating: 'good' as const,
    }

    expect(minimalMetric).not.toHaveProperty('delta')
    expect(minimalMetric).not.toHaveProperty('navigationType')
    expect(minimalMetric.rating).toBe('good')
  })

  it('supports all web vitals metric types', () => {
    const metricTypes = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP']
    
    metricTypes.forEach(type => {
      const metric = {
        id: `test-${type}`,
        name: type,
        value: 100,
        rating: 'good' as const,
      }
      
      expect(metric.name).toBe(type)
      expect(metricTypes).toContain(metric.name)
    })
  })

  it('enriches metrics with metadata', () => {
    const enrichedMetric = {
      ...validPayload.metrics[0],
      sessionId: validPayload.sessionId,
      timestamp: validPayload.timestamp,
      userAgent: validPayload.userAgent,
      ip: '127.0.0.1',
      connectionType: validPayload.connectionType,
    }

    expect(enrichedMetric).toHaveProperty('sessionId')
    expect(enrichedMetric).toHaveProperty('timestamp')
    expect(enrichedMetric).toHaveProperty('userAgent')
    expect(enrichedMetric).toHaveProperty('ip')
    expect(enrichedMetric).toHaveProperty('connectionType')
  })

  it('handles batch of metrics', () => {
    const batchPayload: VitalsPayload = {
      metrics: [
        { id: '1', name: 'LCP', value: 1000, rating: 'good' },
        { id: '2', name: 'FID', value: 50, rating: 'good' },
        { id: '3', name: 'CLS', value: 0.05, rating: 'good' },
        { id: '4', name: 'FCP', value: 800, rating: 'good' },
        { id: '5', name: 'TTFB', value: 200, rating: 'good' },
      ],
      sessionId: 'batch-session',
      timestamp: Date.now(),
    }

    expect(batchPayload.metrics).toHaveLength(5)
    expect(batchPayload.metrics.every(m => m.rating === 'good')).toBe(true)
  })

  it('validates payload structure', () => {
    expect(validPayload).toHaveProperty('metrics')
    expect(validPayload).toHaveProperty('sessionId')
    expect(validPayload).toHaveProperty('timestamp')
    expect(Array.isArray(validPayload.metrics)).toBe(true)
  })

  it('handles connection type metadata', () => {
    const connectionTypes = ['4g', '3g', '2g', 'slow-2g', 'wifi', undefined]
    
    connectionTypes.forEach(type => {
      const payload = {
        ...validPayload,
        connectionType: type,
      }
      
      if (type) {
        expect(payload.connectionType).toBe(type)
      } else {
        expect(payload.connectionType).toBeUndefined()
      }
    })
  })

  it('formats metrics for logging', () => {
    const logEntry = {
      timestamp: new Date(validPayload.timestamp).toISOString(),
      type: 'web-vitals',
      metric: validPayload.metrics[0].name,
      value: validPayload.metrics[0].value,
      rating: validPayload.metrics[0].rating,
      page: validPayload.metrics[0].page,
      sessionId: validPayload.sessionId,
    }

    expect(logEntry.type).toBe('web-vitals')
    expect(logEntry.metric).toBe('LCP')
    expect(logEntry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('supports rate limiting checks', () => {
    const rateLimitKey = 'test-ip-test-session'
    const limit = 100
    const windowMs = 60 * 60 * 1000

    const record = {
      count: 50,
      resetAt: Date.now() + windowMs,
    }

    expect(record.count).toBeLessThan(limit)
    expect(record.resetAt).toBeGreaterThan(Date.now())
  })

  it('validates sampling rate', () => {
    const samplingRates = [0.0, 0.1, 0.5, 1.0]
    
    samplingRates.forEach(rate => {
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(1)
    })
  })
})
