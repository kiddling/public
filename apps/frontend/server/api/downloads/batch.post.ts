import { defineEventHandler, readBody, createError, setResponseHeaders } from 'h3'
import { fetchFromStrapi, getStrapiConfig } from '~/server/utils/strapi'
import archiver from 'archiver'
import { $fetch } from 'ofetch'
import { Readable } from 'stream'

interface BatchDownloadRequest {
  itemIds: number[]
}

interface DownloadItem {
  id: number
  attributes: {
    title: string
    slug: string
    file: {
      data: {
        id: number
        attributes: {
          name: string
          url: string
          size: number
          mime: string
        }
      }
    }
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<BatchDownloadRequest>(event)
  
  if (!body.itemIds || !Array.isArray(body.itemIds) || body.itemIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request: itemIds array is required',
    })
  }

  if (body.itemIds.length > 50) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Too many items: maximum 50 items per batch',
    })
  }

  try {
    const { baseUrl, strapiToken } = getStrapiConfig()
    
    const response = await fetchFromStrapi<{ data: DownloadItem[] }>(
      '/api/download-items',
      {
        filters: {
          id: { $in: body.itemIds },
        },
        populate: {
          file: '*',
        },
        publicationState: 'live',
      },
    )

    if (!response.data || response.data.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No download items found',
      })
    }

    const archive = archiver('zip', {
      zlib: { level: 9 },
    })

    archive.on('error', (err) => {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error creating archive',
        data: { error: err.message },
      })
    })

    setResponseHeaders(event, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="downloads-${Date.now()}.zip"`,
      'Cache-Control': 'no-cache',
    })

    for (const item of response.data) {
      try {
        const fileData = item.attributes.file?.data
        if (!fileData) {
          continue
        }

        const fileUrl = fileData.attributes.url.startsWith('http')
          ? fileData.attributes.url
          : `${baseUrl}${fileData.attributes.url}`

        const fileBuffer = await $fetch<ArrayBuffer>(fileUrl, {
          responseType: 'arrayBuffer',
          headers: strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {},
        })

        const fileName = `${item.attributes.slug}_${fileData.attributes.name}`
        archive.append(Buffer.from(fileBuffer), { name: fileName })
      } catch (fileError) {
        console.error(`Error fetching file for item ${item.id}:`, fileError)
      }
    }

    archive.finalize()

    return archive
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Failed to create batch download',
      data: {
        error: error instanceof Error ? error.message : String(error),
      },
    })
  }
})
