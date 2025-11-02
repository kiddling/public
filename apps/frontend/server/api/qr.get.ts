/**
 * API endpoint for generating QR codes
 * GET /api/qr?data=<url>&size=<width>
 */

import { defineEventHandler, getQuery, createError } from 'h3'
import { generateQRCodeDataURI } from '~/server/utils/qr'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const data = query.data as string
  const size = query.size ? parseInt(query.size as string, 10) : 200

  if (!data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: data',
    })
  }

  if (size < 50 || size > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Size must be between 50 and 1000 pixels',
    })
  }

  try {
    const dataURI = await generateQRCodeDataURI(data, { width: size })

    return {
      dataURI,
      url: data,
      size,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
