import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMonitoring } from '~/composables/useMonitoring'

describe('useMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackMetric', () => {
    it('tracks custom metrics', () => {
      const { trackMetric, exportMetrics } = useMonitoring()

      trackMetric('test-metric', 100)

      const metrics = exportMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0].name).toBe('test-metric')
      expect(metrics[0].value).toBe(100)
    })

    it('tracks metrics with tags', () => {
      const { trackMetric, exportMetrics } = useMonitoring()

      trackMetric('test-metric', 100, { component: 'Header', action: 'click' })

      const metrics = exportMetrics()
      expect(metrics[0].tags).toEqual({ component: 'Header', action: 'click' })
    })

    it('includes timestamp in metrics', () => {
      const { trackMetric, exportMetrics } = useMonitoring()
      const before = Date.now()

      trackMetric('test-metric', 100)

      const after = Date.now()
      const metrics = exportMetrics()

      expect(metrics[0].timestamp).toBeGreaterThanOrEqual(before)
      expect(metrics[0].timestamp).toBeLessThanOrEqual(after)
    })

    it('tracks multiple metrics', () => {
      const { trackMetric, exportMetrics } = useMonitoring()

      trackMetric('metric1', 100)
      trackMetric('metric2', 200)
      trackMetric('metric3', 300)

      const metrics = exportMetrics()
      expect(metrics).toHaveLength(3)
      expect(metrics[0].value).toBe(100)
      expect(metrics[1].value).toBe(200)
      expect(metrics[2].value).toBe(300)
    })
  })

  describe('trackDataFetch', () => {
    it('tracks successful data fetch', async () => {
      const { trackDataFetch, exportMetrics } = useMonitoring()

      const fetchFn = vi.fn().mockResolvedValue({ data: 'test' })

      const result = await trackDataFetch('api-call', fetchFn)

      expect(result).toEqual({ data: 'test' })
      expect(fetchFn).toHaveBeenCalled()

      const metrics = exportMetrics()
      expect(metrics.some((m) => m.name === 'data-fetch.api-call')).toBe(true)

      const fetchMetric = metrics.find((m) => m.name === 'data-fetch.api-call')
      expect(fetchMetric?.tags?.status).toBe('success')
    })

    it('tracks failed data fetch', async () => {
      const { trackDataFetch, exportMetrics } = useMonitoring()

      const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch failed'))

      await expect(trackDataFetch('api-call', fetchFn)).rejects.toThrow('Fetch failed')

      const metrics = exportMetrics()
      const fetchMetric = metrics.find((m) => m.name === 'data-fetch.api-call')
      expect(fetchMetric?.tags?.status).toBe('error')
    })

    it('includes custom tags in data fetch tracking', async () => {
      const { trackDataFetch, exportMetrics } = useMonitoring()

      const fetchFn = vi.fn().mockResolvedValue('data')

      await trackDataFetch('api-call', fetchFn, { endpoint: '/api/test', method: 'GET' })

      const metrics = exportMetrics()
      const fetchMetric = metrics.find((m) => m.name === 'data-fetch.api-call')

      expect(fetchMetric?.tags).toMatchObject({
        endpoint: '/api/test',
        method: 'GET',
        status: 'success',
      })
    })
  })

  describe('trackInteraction', () => {
    it('tracks user interactions', () => {
      const { trackInteraction, exportMetrics } = useMonitoring()

      trackInteraction('button-click')

      const metrics = exportMetrics()
      const interaction = metrics.find((m) => m.name === 'interaction.button-click')

      expect(interaction).toBeDefined()
      expect(interaction?.timestamp).toBeDefined()
    })

    it('tracks interactions with metadata', () => {
      const { trackInteraction, exportMetrics } = useMonitoring()

      trackInteraction('form-submit', { form: 'login', success: 'true' })

      const metrics = exportMetrics()
      const interaction = metrics.find((m) => m.name === 'interaction.form-submit')

      expect(interaction?.tags).toEqual({ form: 'login', success: 'true' })
    })
  })

  describe('trackRouteChange', () => {
    it('tracks route changes', () => {
      const { trackRouteChange, exportMetrics } = useMonitoring()

      trackRouteChange('/home', '/about')

      const metrics = exportMetrics()
      const routeChange = metrics.find((m) => m.name === 'route.change')

      expect(routeChange).toBeDefined()
      expect(routeChange?.tags).toEqual({ from: '/home', to: '/about' })
    })
  })

  describe('exportMetrics', () => {
    it('exports all tracked metrics', () => {
      const { trackMetric, exportMetrics } = useMonitoring()

      trackMetric('metric1', 100)
      trackMetric('metric2', 200)

      const metrics = exportMetrics()

      expect(metrics).toHaveLength(2)
      expect(metrics[0]).toHaveProperty('name')
      expect(metrics[0]).toHaveProperty('value')
      expect(metrics[0]).toHaveProperty('timestamp')
    })

    it('returns a copy of metrics array', () => {
      const { trackMetric, exportMetrics } = useMonitoring()

      trackMetric('test', 100)

      const metrics1 = exportMetrics()
      const metrics2 = exportMetrics()

      expect(metrics1).not.toBe(metrics2)
      expect(metrics1).toEqual(metrics2)
    })
  })

  describe('clearMetrics', () => {
    it('clears all tracked metrics', () => {
      const { trackMetric, exportMetrics, clearMetrics } = useMonitoring()

      trackMetric('metric1', 100)
      trackMetric('metric2', 200)

      expect(exportMetrics()).toHaveLength(2)

      clearMetrics()

      expect(exportMetrics()).toHaveLength(0)
    })
  })

  describe('custom metric structure', () => {
    it('creates valid custom metric objects', () => {
      const { trackMetric, exportMetrics } = useMonitoring()

      trackMetric('test', 123, { key: 'value' })

      const metrics = exportMetrics()
      const metric = metrics[0]

      expect(metric).toHaveProperty('name')
      expect(metric).toHaveProperty('value')
      expect(metric).toHaveProperty('timestamp')
      expect(metric).toHaveProperty('tags')

      expect(typeof metric.name).toBe('string')
      expect(typeof metric.value).toBe('number')
      expect(typeof metric.timestamp).toBe('number')
      expect(typeof metric.tags).toBe('object')
    })

    it('handles metrics without tags', () => {
      const { trackMetric, exportMetrics } = useMonitoring()

      trackMetric('test', 100)

      const metrics = exportMetrics()
      expect(metrics[0].tags).toBeUndefined()
    })
  })
})
