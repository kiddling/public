/**
 * API route for fetching knowledge cards collection
 */

import { defineEventHandler, getQuery } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const response = await fetchFromStrapi('/api/knowledge-cards', query)

  return response
})
