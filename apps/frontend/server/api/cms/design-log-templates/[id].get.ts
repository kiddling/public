import { defineEventHandler, getRouterParam, getQuery } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Template ID is required',
    })
  }

  const response = await fetchFromStrapi(`/api/design-log-templates/${id}`, query)

  return response
})
