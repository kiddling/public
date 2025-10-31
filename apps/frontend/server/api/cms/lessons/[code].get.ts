/**
 * API route for fetching a single lesson by code
 */

import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  const query = getQuery(event)

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Lesson code is required',
    })
  }

  // Fetch lessons filtered by code
  const response = await fetchFromStrapi('/api/lessons', {
    ...query,
    filters: {
      code: { $eq: code },
    },
  })

  // Extract the first lesson from the response
  const data = response as any
  if (!data.data || data.data.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: `Lesson with code '${code}' not found`,
    })
  }

  // Return single item response
  return {
    data: data.data[0],
    meta: data.meta,
  }
})
