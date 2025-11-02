/**
 * Web Vitals telemetry endpoint
 * Receives, validates, enriches and stores web vitals metrics
 */

import { createHash } from 'crypto'

export interface VitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  navigationType?: string
  href?: string
  page?: string
}

export interface VitalsPayload {
  metrics: VitalsMetric[]
  sessionId: string
  timestamp: number
  userAgent?: string
  connectionType?: string
}

interface EnrichedMetric extends VitalsMetric {
  sessionId: string
  timestamp: number
  userAgent: string
  ip: string
  country?: string
  connectionType?: string
}

// Rate limiting store (in-memory, for simple cases)
// For production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(ip: string, sessionId: string): string {
  return createHash('sha256').update(`${ip}-${sessionId}`).digest('hex')
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

function validatePayload(payload: any): payload is VitalsPayload {
  if (!payload || typeof payload !== 'object') return false
  if (!Array.isArray(payload.metrics)) return false
  if (!payload.sessionId || typeof payload.sessionId !== 'string') return false
  if (!payload.timestamp || typeof payload.timestamp !== 'number') return false

  for (const metric of payload.metrics) {
    if (!metric.id || !metric.name || typeof metric.value !== 'number') return false
    if (!['good', 'needs-improvement', 'poor'].includes(metric.rating)) return false
  }

  return true
}

async function forwardToStrapi(metrics: EnrichedMetric[], config: RuntimeConfig) {
  if (!config.public.enableVitalsForwarding) return

  const strapiUrl = config.public.apiBaseUrl || config.public.strapiUrl
  const apiToken = config.strapiApiToken

  if (!strapiUrl || !apiToken) {
    console.warn('[Vitals] Strapi forwarding enabled but credentials missing')
    return
  }

  try {
    const endpoint = `${strapiUrl}/api/web-vitals`

    await $fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: { data: { metrics } },
    })
  } catch (error) {
    console.error('[Vitals] Failed to forward to Strapi:', error)
  }
}

function logMetrics(metrics: EnrichedMetric[]) {
  for (const metric of metrics) {
    console.log(
      JSON.stringify({
        timestamp: new Date(metric.timestamp).toISOString(),
        type: 'web-vitals',
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        page: metric.page,
        sessionId: metric.sessionId,
        userAgent: metric.userAgent,
        ip: metric.ip,
        connectionType: metric.connectionType,
      })
    )
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Check if telemetry is enabled
  const enabled = config.public.enableVitalsTelemetry !== false
  if (!enabled) {
    return { success: false, message: 'Telemetry disabled' }
  }

  try {
    const payload = await readBody<VitalsPayload>(event)

    // Validate payload
    if (!validatePayload(payload)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid payload format',
      })
    }

    // Get client info
    const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'
    const ip =
      getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
      getRequestHeader(event, 'x-real-ip') ||
      event.node.req.socket.remoteAddress ||
      'unknown'

    // Rate limiting: 100 requests per session per hour
    const rateLimitKey = getRateLimitKey(ip, payload.sessionId)
    const rateLimitWindow = 60 * 60 * 1000 // 1 hour
    const rateLimitMax = parseInt(config.public.vitalsRateLimit as string) || 100

    if (!checkRateLimit(rateLimitKey, rateLimitMax, rateLimitWindow)) {
      throw createError({
        statusCode: 429,
        message: 'Rate limit exceeded',
      })
    }

    // Apply sampling rate
    const samplingRate = parseFloat(config.public.vitalsSamplingRate as string) || 1.0
    if (Math.random() > samplingRate) {
      return { success: true, message: 'Sampled out', sampled: false }
    }

    // Enrich metrics with metadata
    const enrichedMetrics: EnrichedMetric[] = payload.metrics.map((metric) => ({
      ...metric,
      sessionId: payload.sessionId,
      timestamp: payload.timestamp,
      userAgent,
      ip,
      connectionType: payload.connectionType,
    }))

    // Log to stdout (for log shipping)
    logMetrics(enrichedMetrics)

    // Forward to Strapi if enabled
    await forwardToStrapi(enrichedMetrics, config)

    // Clean up old rate limit entries (every 100 requests)
    if (Math.random() < 0.01) {
      const now = Date.now()
      for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetAt) {
          rateLimitStore.delete(key)
        }
      }
    }

    return {
      success: true,
      message: 'Metrics received',
      count: enrichedMetrics.length,
    }
  } catch (error: any) {
    console.error('[Vitals] Error processing metrics:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to process metrics',
    })
  }
})
