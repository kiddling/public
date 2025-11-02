import type { Core } from '@strapi/strapi'
import rateLimit from 'koa2-ratelimit'

interface RateLimitConfig {
  enabled?: boolean
  max?: number
  duration?: number
  skipPaths?: string[]
}

export default (config: RateLimitConfig, { strapi }: { strapi: Core.Strapi }) => {
  if (config.enabled === false) {
    return async (ctx: any, next: any) => {
      await next()
    }
  }

  const { max = 100, duration = 60000, skipPaths = [] } = config

  return async (ctx: any, next: any) => {
    // Skip rate limiting for certain paths
    const shouldSkip = skipPaths.some((path) => ctx.path.startsWith(path))

    if (shouldSkip) {
      await next()
      return
    }

    // Use koa2-ratelimit middleware
    const limiter = rateLimit.RateLimit.middleware({
      interval: { min: duration / 60000 },
      max,
      prefixKey: 'rate-limit',
      getUserId: (ctx: any) => {
        // Use IP address as identifier
        return ctx.request.ip || ctx.ip || 'unknown'
      },
      handler: async (ctx: any) => {
        ctx.status = 429
        ctx.body = {
          error: 'Too Many Requests',
          message: '请求过于频繁，请稍后再试',
          statusCode: 429,
        }
      },
    })

    await limiter(ctx, next)
  }
}
