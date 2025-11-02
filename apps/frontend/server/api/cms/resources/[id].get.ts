/**
 * API route for fetching a single resource by ID
 */

import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Resource ID is required',
    })
  }

  // Fetch single resource by ID
  const response = await fetchFromStrapi(`/api/resources/${id}`, query)

  return response
})
