import { createFetch, type FetchContext, type FetchOptions, type FetchRequest } from 'ofetch'
import { createStrapiError, StrapiRequestError } from '~/utils/strapi-error'

const RETRIABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]
const MIN_TIMEOUT = 1000
const MIN_RETRY_DELAY = 200

export type StrapiFetch = <T = unknown>(request: FetchRequest, options?: FetchOptions<'json'>) => Promise<T>

function normalizeBaseUrl(baseUrl: string | undefined, apiPath: string | undefined): string {
  const base = (baseUrl ?? '').trim()
  const normalizedBase = base.replace(/\/+$/, '')
  const path = (apiPath ?? '/api').trim() || '/api'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!normalizedBase) {
    return normalizedPath
  }

  if (normalizedBase.endsWith(normalizedPath)) {
    return normalizedBase
  }

  return `${normalizedBase}${normalizedPath}`
}

function normalizeHeaders(headers?: FetchOptions<'json'>['headers']): Record<string, string> {
  if (!headers) {
    return {}
  }

  if (headers instanceof Headers) {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers.map(([key, value]) => [key, String(value)]))
  }

  return Object.fromEntries(
    Object.entries(headers as Record<string, string | number | boolean>)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  )
}

function sanitizeNumeric(value: number | undefined, minimum: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  return Math.max(value, minimum)
}

function ensureLeadingSlash(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return path.startsWith('/') ? path : `/${path}`
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const baseUrl = normalizeBaseUrl(
    config.strapi?.baseUrl || config.public?.strapiUrl || config.public?.apiBaseUrl,
    config.strapi?.apiPath || '/api'
  )

  const defaultTimeout = sanitizeNumeric(Number(config.strapi?.timeout), MIN_TIMEOUT, 8000)
  const defaultRetryDelay = sanitizeNumeric(Number(config.strapi?.retryDelay), MIN_RETRY_DELAY, 600)
  const defaultRetry = Math.max(Number(config.strapi?.retry ?? 2), 0)

  const client = createFetch({
    baseURL: baseUrl,
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
    retryStatusCodes: RETRIABLE_STATUS_CODES,
    timeout: defaultTimeout,
    onRequest: async (context: FetchContext & { options: FetchOptions<'json'> }) => {
      const headers = normalizeHeaders(context.options.headers)

      headers.Accept = headers.Accept ?? 'application/json'
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'

      if (config.strapiApiToken && !headers.Authorization) {
        headers.Authorization = `Bearer ${config.strapiApiToken}`
      }

      context.options.headers = headers
      context.options.timeout = context.options.timeout ?? defaultTimeout
      context.options.retry = context.options.retry ?? defaultRetry
      context.options.retryDelay = context.options.retryDelay ?? defaultRetryDelay

      if (nuxtApp.callHook) {
        await nuxtApp.callHook('strapi:request', context)
      }
    },
    onRequestError: async (context) => {
      const error = createStrapiError(context.error, toRequestUrl(context.request), context.response)
      if (nuxtApp.callHook) {
        await nuxtApp.callHook('strapi:request:error', error)
      }
      throw error
    },
    onResponse: async (context) => {
      const payload = context.response?._data
      if (payload && typeof payload === 'object' && 'error' in (payload as Record<string, unknown>)) {
        const error = createStrapiError(payload, toRequestUrl(context.request), context.response)
        if (nuxtApp.callHook) {
          await nuxtApp.callHook('strapi:response:error', error)
        }
        throw error
      }

      if (nuxtApp.callHook) {
        await nuxtApp.callHook('strapi:response', context)
      }
    },
    onResponseError: async (context) => {
      const error =
        context.error instanceof StrapiRequestError
          ? context.error
          : createStrapiError(
              context.error ?? context.response?._data,
              toRequestUrl(context.request),
              context.response,
              context.response?.status ?? 500
            )

      if (nuxtApp.callHook) {
        await nuxtApp.callHook('strapi:response:error', error)
      }

      throw error
    },
  })

  const strapiFetch: StrapiFetch = (request, options = {}) => {
    const normalizedRequest = typeof request === 'string' ? ensureLeadingSlash(request) : request

    return client(normalizedRequest, {
      ...options,
      timeout: options.timeout ?? defaultTimeout,
      retry: options.retry ?? defaultRetry,
      retryDelay: options.retryDelay ?? defaultRetryDelay,
    })
  }

  nuxtApp.provide('strapiFetch', strapiFetch)
})

function toRequestUrl(request?: FetchRequest): string | undefined {
  if (!request) {
    return undefined
  }

  if (typeof request === 'string') {
    return request
  }

  if ('url' in request && typeof (request as { url?: string }).url === 'string') {
    return (request as { url: string }).url
  }

  try {
    return String(request)
  } catch (error) {
    return undefined
  }
}

declare module '#app' {
  interface NuxtApp {
    $strapiFetch: StrapiFetch
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $strapiFetch: StrapiFetch
  }
}
