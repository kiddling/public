/**
 * API route for fetching a single student work by ID
 */

import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Student work ID is required',
    })
  }

  // Fetch single student work by ID
  const response = await fetchFromStrapi(`/api/student-works/${id}`, query)

  return response
})
