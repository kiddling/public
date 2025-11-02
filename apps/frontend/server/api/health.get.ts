/**
 * Health check endpoint for monitoring
 */

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  // Basic health checks
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  }

  // Check external dependencies (optional)
  const dependencies: Record<string, { status: string; responseTime?: number; error?: string }> = {}

  // Check Strapi CMS connection
  try {
    const config = useRuntimeConfig()
    const strapiUrl = config.public.strapiUrl
    
    if (strapiUrl) {
      const checkStart = Date.now()
      const response = await $fetch(`${strapiUrl}/api`, {
        method: 'GET',
        timeout: 5000,
      })
      dependencies.strapi = {
        status: 'healthy',
        responseTime: Date.now() - checkStart,
      }
    }
  } catch (error: any) {
    dependencies.strapi = {
      status: 'unhealthy',
      error: error.message,
    }
    checks.status = 'degraded'
  }

  const responseTime = Date.now() - startTime

  return {
    ...checks,
    dependencies,
    responseTime,
  }
})
