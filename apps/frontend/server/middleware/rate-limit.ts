import { defineEventHandler, getRequestHeader, setResponseStatus, setResponseHeaders } from 'h3'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  // Get rate limiting configuration
  const rateLimitEnabled = config.public.securityRateLimitEnabled !== 'false'

  if (!rateLimitEnabled) {
    return
  }

  const maxRequests = parseInt(config.public.securityRateLimitMaxRequests || '100')
  const windowMs = parseInt(config.public.securityRateLimitWindowMs || '60000')
  const skipPaths = (config.public.securityRateLimitSkipPaths || '/_nuxt,/fonts,/images,/_ipx')
    .split(',')
    .map((p: string) => p.trim())

  // Skip rate limiting for static assets
  const path = event.node.req.url || ''
  if (skipPaths.some((skipPath: string) => path.startsWith(skipPath))) {
    return
  }

  // Get client identifier (IP address)
  const forwardedFor = getRequestHeader(event, 'x-forwarded-for')
  const realIp = getRequestHeader(event, 'x-real-ip')
  const remoteAddress = event.node.req.socket.remoteAddress
  const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || remoteAddress || 'unknown'

  // Generate rate limit key
  const key = `rate-limit:${clientIp}`

  // Get current rate limit entry
  const now = Date.now()
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, entry)
  } else {
    // Increment count
    entry.count++
  }

  // Calculate rate limit headers
  const remaining = Math.max(0, maxRequests - entry.count)
  const resetTime = Math.ceil(entry.resetTime / 1000)

  // Set rate limit headers
  setResponseHeaders(event, {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
  })

  // Check if rate limit exceeded
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

    setResponseHeaders(event, {
      'Retry-After': retryAfter.toString(),
    })

    setResponseStatus(event, 429)

    return {
      error: 'Too Many Requests',
      message: '请求过于频繁，请稍后再试',
      statusCode: 429,
      retryAfter,
    }
  }
})
