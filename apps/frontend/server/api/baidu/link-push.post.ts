import { defineEventHandler, readBody, createError } from 'h3'

interface LinkPushRequest {
  urls: string[]
}

interface LinkPushResponse {
  success: boolean
  submitted?: number
  errors?: string[]
  message?: string
}

export default defineEventHandler(async (event): Promise<LinkPushResponse> => {
  const config = useRuntimeConfig()
  const token = config.baiduLinkPushToken
  const siteUrl = config.public.siteUrl

  // Check if Baidu link push is configured
  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Baidu link push token is not configured',
    })
  }

  const body = await readBody<LinkPushRequest>(event)
  const { urls } = body

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'URLs array is required and must not be empty',
    })
  }

  // Validate URLs
  const validUrls = urls.filter(url => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  })

  if (validUrls.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No valid URLs provided',
    })
  }

  // Baidu Link Submit API endpoint
  const baiduApiUrl = `http://data.zz.baidu.com/urls?site=${siteUrl}&token=${token}`

  const errors: string[] = []
  let totalSubmitted = 0

  // Submit URLs in batches (Baidu recommends max 2000 URLs per request, but we'll use smaller batches)
  const batchSize = 100
  for (let i = 0; i < validUrls.length; i += batchSize) {
    const batch = validUrls.slice(i, i + batchSize)
    
    try {
      const response = await $fetch<any>(baiduApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: batch.join('\n'),
        retry: 3,
        retryDelay: 1000,
      })

      if (response.success !== undefined) {
        totalSubmitted += response.success
      }

      console.log(`Baidu Link Push batch ${Math.floor(i / batchSize) + 1}: ${response.success || 0} URLs submitted`)
      
      if (response.error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${response.message || 'Unknown error'}`)
      }
    } catch (error: any) {
      const errorMessage = `Batch ${Math.floor(i / batchSize) + 1}: ${error.message || 'Request failed'}`
      console.error('Baidu Link Push error:', errorMessage)
      errors.push(errorMessage)
    }
  }

  return {
    success: errors.length === 0,
    submitted: totalSubmitted,
    errors: errors.length > 0 ? errors : undefined,
    message: errors.length === 0 
      ? `Successfully submitted ${totalSubmitted} URLs to Baidu` 
      : `Submitted ${totalSubmitted} URLs with ${errors.length} error(s)`,
  }
})
