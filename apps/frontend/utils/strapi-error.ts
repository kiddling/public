import type { FetchResponse } from 'ofetch'

export interface StrapiErrorPayload {
  status?: number
  name?: string
  message?: unknown
  details?: unknown
  data?: unknown
  error?: StrapiErrorPayload
}

export class StrapiRequestError extends Error {
  public readonly statusCode: number
  public readonly url?: string
  public readonly payload?: unknown

  constructor(message: string, statusCode: number, url?: string, payload?: unknown) {
    super(message)
    this.name = 'StrapiRequestError'
    this.statusCode = statusCode
    this.url = url
    this.payload = payload
  }
}

const DEFAULT_STATUS_CODE = 500

function extractMessage(message: unknown): string {
  if (typeof message === 'string') {
    return message
  }

  if (Array.isArray(message)) {
    return message.map((item) => extractMessage(item)).filter(Boolean).join(' | ')
  }

  if (message && typeof message === 'object') {
    if ('message' in (message as Record<string, unknown>)) {
      return extractMessage((message as Record<string, unknown>).message)
    }

    try {
      return JSON.stringify(message)
    } catch (error) {
      return String(message)
    }
  }

  if (message == null) {
    return 'Strapi request failed'
  }

  return String(message)
}

function unwrapPayload(payload: StrapiErrorPayload | undefined): StrapiErrorPayload | undefined {
  if (!payload) {
    return undefined
  }

  if (payload.error && typeof payload.error === 'object') {
    return unwrapPayload(payload.error as StrapiErrorPayload)
  }

  return payload
}

export function normalizeStrapiError(
  input: unknown,
  fallbackStatus: number = DEFAULT_STATUS_CODE,
  requestUrl?: string,
  response?: FetchResponse<unknown>
): StrapiRequestError {
  if (input instanceof StrapiRequestError) {
    return input
  }

  if (input && typeof input === 'object') {
    const payload = unwrapPayload(input as StrapiErrorPayload)
    const statusFromPayload =
      typeof payload?.status === 'number' && Number.isFinite(payload.status) ? payload.status : undefined
    const statusCode = statusFromPayload ?? response?.status ?? fallbackStatus ?? DEFAULT_STATUS_CODE
    const message = extractMessage(payload?.message ?? (input as { message?: unknown }).message)

    return new StrapiRequestError(message, statusCode, requestUrl, payload ?? input)
  }

  if (input instanceof Error) {
    return new StrapiRequestError(input.message, fallbackStatus ?? DEFAULT_STATUS_CODE, requestUrl, {
      cause: input,
    })
  }

  return new StrapiRequestError('Unknown Strapi error', fallbackStatus ?? DEFAULT_STATUS_CODE, requestUrl, {
    cause: input,
  })
}

export function createStrapiError(
  input: unknown,
  requestUrl?: string,
  response?: FetchResponse<unknown>,
  fallbackStatus: number = DEFAULT_STATUS_CODE
): StrapiRequestError {
  return normalizeStrapiError(input, fallbackStatus, requestUrl, response)
}
