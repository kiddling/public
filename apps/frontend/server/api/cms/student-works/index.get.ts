/**
 * API route for fetching student works collection
 */

import { defineEventHandler, getQuery } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const response = await fetchFromStrapi('/api/student-works', query)

  return response
})
