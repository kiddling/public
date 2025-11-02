import { defineEventHandler, getQuery, createError } from 'h3'
import { fetchFromStrapi } from '~/server/utils/strapi'
import type { StrapiQueryOptions } from '~/server/utils/strapi'

interface DownloadItem {
  id: number
  attributes: {
    title: string
    slug: string
    category: string
    description?: string
    version?: string
    tag?: string
    checksum: string
    fileSize: number
    mimeType: string
    file: any
    relatedLessons?: any
    relatedResources?: any
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

interface StrapiResponse {
  data: DownloadItem[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 25
  const category = query.category as string | undefined
  const search = query.search as string | undefined
  const lessonId = query.lessonId as string | undefined

  const strapiOptions: StrapiQueryOptions = {
    pagination: {
      page,
      pageSize,
    },
    populate: {
      file: '*',
      relatedLessons: {
        fields: ['id', 'title', 'code'],
      },
      relatedResources: {
        fields: ['id', 'title'],
      },
    },
    sort: ['createdAt:desc'],
    publicationState: 'live',
  }

  const filters: Record<string, any> = {}

  if (category) {
    filters.category = { $eq: category }
  }

  if (search) {
    filters.$or = [{ title: { $containsi: search } }, { description: { $containsi: search } }]
  }

  if (lessonId) {
    filters.relatedLessons = {
      id: { $eq: lessonId },
    }
  }

  if (Object.keys(filters).length > 0) {
    strapiOptions.filters = filters
  }

  try {
    const response = await fetchFromStrapi<StrapiResponse>('/api/download-items', strapiOptions)

    return {
      data: response.data,
      meta: response.meta,
    }
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Failed to fetch download items',
      data: {
        error: error instanceof Error ? error.message : String(error),
      },
    })
  }
})
