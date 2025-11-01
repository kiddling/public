import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  // Validate required query parameter
  if (!query.query || typeof query.query !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Query parameter is required',
    })
  }

  // Build query string for Strapi
  const params = new URLSearchParams()
  params.append('query', query.query)

  if (query.type) {
    params.append('type', query.type as string)
  }

  if (query.difficulty) {
    params.append('difficulty', query.difficulty as string)
  }

  if (query.page) {
    params.append('page', query.page as string)
  }

  if (query.pageSize) {
    params.append('pageSize', query.pageSize as string)
  }

  try {
    // Proxy request to Strapi CMS
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    const response = await $fetch(`${strapiUrl}/api/global-search?${params.toString()}`, {
      headers: {
        // Add auth headers if needed
        ...(config.strapiApiToken && {
          Authorization: `Bearer ${config.strapiApiToken}`,
        }),
      },
    })

    return response
  } catch (error: any) {
    console.error('Global search proxy error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch search results',
    })
  }
})
