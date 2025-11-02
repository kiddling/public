import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { $fetch } from 'ofetch'
import type { StrapiNavigationResponse } from '~/types/navigation'

const DEFAULT_LESSON_ENDPOINT = '/api/lessons'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const baseUrl = normalizeBaseUrl(config.public?.strapiUrl || config.public?.apiBaseUrl)

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Strapi URL is not configured',
    })
  }

  const strapiToken = config.strapiApiToken
  const endpoint = buildLessonsEndpoint(baseUrl)

  try {
    const response = await $fetch<StrapiNavigationResponse>(endpoint, {
      headers: {
        ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
      },
    })

    return response
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch course navigation from Strapi',
      data: {
        error: error instanceof Error ? error.message : String(error),
      },
    })
  }
})

function buildLessonsEndpoint(baseUrl: string): string {
  const url = new URL(DEFAULT_LESSON_ENDPOINT, baseUrl)
  url.searchParams.set('populate[part]', '*')
  url.searchParams.set('populate[loop]', '*')
  url.searchParams.set('pagination[pageSize]', '500')
  url.searchParams.set('sort[0]', 'partOrder:asc')
  url.searchParams.set('sort[1]', 'loopOrder:asc')
  url.searchParams.set('sort[2]', 'order:asc')
  return url.toString()
}

function normalizeBaseUrl(value?: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}
