import { defineEventHandler, getQuery } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const response = await fetchFromStrapi('/api/design-log-templates', query)

  return response
})
