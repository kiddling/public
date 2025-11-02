/**
 * API client with unified error handling, retry mechanism, and timeout handling
 */

import type { FetchOptions, FetchResponse } from 'ofetch'
import { logger } from './logger'
import { ErrorCode, createError, type AppError } from '~/types/error'

export interface ApiClientOptions extends FetchOptions {
  retry?: boolean
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  skipErrorHandling?: boolean
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
}

const DEFAULT_TIMEOUT = 30000 // 30 seconds

export class ApiClient {
  private baseURL: string
  private retryConfig: RetryConfig

  constructor(baseURL: string, retryConfig?: Partial<RetryConfig>) {
    this.baseURL = baseURL
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      this.retryConfig.baseDelay * Math.pow(2, attempt),
      this.retryConfig.maxDelay
    )
    // Add jitter (±25%)
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1)
    return exponentialDelay + jitter
  }

  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.retryConfig.maxRetries) {
      return false
    }

    // Retry on network errors
    if (!error.response) {
      return true
    }

    // Retry on specific status codes
    const status = error.response?.status
    const retryableStatuses = [408, 429, 500, 502, 503, 504]
    return retryableStatuses.includes(status)
  }

  private handleError(error: any, url: string): AppError {
    logger.error('API request failed', { url }, error)

    // Check if offline
    if (!navigator.onLine) {
      return createError(ErrorCode.OFFLINE, undefined, error, { url })
    }

    // Network error (no response)
    if (!error.response) {
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        return createError(ErrorCode.TIMEOUT, undefined, error, { url })
      }
      return createError(ErrorCode.NETWORK_ERROR, undefined, error, { url })
    }

    // HTTP error responses
    const status = error.response.status
    const data = error.response._data || error.response.data

    let code: ErrorCode
    let message: string | undefined

    switch (status) {
      case 400:
        code = ErrorCode.BAD_REQUEST
        message = data?.message || data?.error?.message
        break
      case 401:
        code = ErrorCode.UNAUTHORIZED
        message = data?.message || data?.error?.message
        break
      case 403:
        code = ErrorCode.FORBIDDEN
        message = data?.message || data?.error?.message
        break
      case 404:
        code = ErrorCode.NOT_FOUND
        message = data?.message || data?.error?.message
        break
      case 422:
        code = ErrorCode.VALIDATION_ERROR
        message = data?.message || data?.error?.message
        break
      case 500:
      case 502:
      case 503:
      case 504:
        code = ErrorCode.SERVER_ERROR
        message = data?.message || data?.error?.message
        break
      default:
        code = ErrorCode.API_ERROR
        message = data?.message || data?.error?.message
    }

    return createError(code, message, error, {
      url,
      status,
      data,
    })
  }

  private async requestWithTimeout<T>(
    fetcher: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetcher()
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw createError(ErrorCode.TIMEOUT, '请求超时')
      }
      throw error
    }
  }

  async request<T = any>(
    url: string,
    options: ApiClientOptions = {}
  ): Promise<T> {
    const {
      retry = true,
      maxRetries = this.retryConfig.maxRetries,
      timeout = DEFAULT_TIMEOUT,
      skipErrorHandling = false,
      ...fetchOptions
    } = options

    let attempt = 0
    let lastError: any

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`

    logger.debug('API request', { url: fullUrl, options: fetchOptions })
    logger.addBreadcrumb(`API: ${fetchOptions.method || 'GET'} ${url}`)

    while (attempt <= maxRetries) {
      try {
        const response = await this.requestWithTimeout(
          () => $fetch<T>(fullUrl, {
            ...fetchOptions,
            retry: false, // We handle retry ourselves
          }),
          timeout
        )

        logger.debug('API request succeeded', {
          url: fullUrl,
          attempt: attempt + 1,
        })

        return response
      } catch (error: any) {
        lastError = error
        
        if (!retry || !this.shouldRetry(error, attempt)) {
          break
        }

        attempt++
        const delay = this.calculateRetryDelay(attempt - 1)
        
        logger.warn(`API request failed, retrying (${attempt}/${maxRetries})`, {
          url: fullUrl,
          attempt,
          delay,
        }, error)

        await this.sleep(delay)
      }
    }

    if (skipErrorHandling) {
      throw lastError
    }

    throw this.handleError(lastError, fullUrl)
  }

  async get<T = any>(url: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T = any>(
    url: string,
    body?: any,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body })
  }

  async put<T = any>(
    url: string,
    body?: any,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body })
  }

  async patch<T = any>(
    url: string,
    body?: any,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PATCH', body })
  }

  async delete<T = any>(url: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}

// Create default instance
let apiClient: ApiClient

export function useApiClient(): ApiClient {
  if (!apiClient) {
    const config = useRuntimeConfig()
    apiClient = new ApiClient(config.public.apiBaseUrl || config.public.strapiUrl)
  }
  return apiClient
}

// Export for direct usage
export function createApiClient(baseURL: string, retryConfig?: Partial<RetryConfig>): ApiClient {
  return new ApiClient(baseURL, retryConfig)
}
