/**
 * API route for fetching a single knowledge card by slug
 */

import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Knowledge card slug is required',
    })
  }

  // Fetch knowledge cards filtered by slug
  const response = await fetchFromStrapi('/api/knowledge-cards', {
    ...query,
    filters: {
      slug: { $eq: slug },
    },
  })

  // Extract the first item from the response
  const data = response as any
  if (!data.data || data.data.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: `Knowledge card with slug '${slug}' not found`,
    })
  }

  // Return single item response
  return {
    data: data.data[0],
    meta: data.meta,
  }
})
