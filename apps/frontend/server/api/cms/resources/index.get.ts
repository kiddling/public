/**
 * API route for fetching resources collection
 */

import { defineEventHandler, getQuery } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const response = await fetchFromStrapi('/api/resources', query)

  return response
})
