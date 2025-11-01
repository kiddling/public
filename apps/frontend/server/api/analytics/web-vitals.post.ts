export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const logEntry = {
    timestamp: new Date().toISOString(),
    metric: body.name,
    value: body.value,
    rating: body.rating,
    delta: body.delta,
    id: body.id,
    navigationType: body.navigationType,
    url: body.url,
    userAgent: body.userAgent,
  }

  console.log('[Web Vitals]', JSON.stringify(logEntry))

  return {
    success: true,
    message: 'Web vital metric received',
  }
})
