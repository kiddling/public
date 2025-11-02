/**
 * Composable for consistent error handling across the application
 */

import { useLogger } from '~/utils/logger'
import { getErrorMessage, getErrorCode, type AppError } from '~/types/error'

export interface ErrorState {
  hasError: boolean
  error: AppError | null
  isLoading: boolean
}

export interface UseErrorHandlingOptions {
  showNotification?: boolean
  redirectOnError?: string | false
  retryable?: boolean
  fallbackData?: any
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const logger = useLogger()
  const router = useRouter()

  const errorState = reactive<ErrorState>({
    hasError: false,
    error: null,
    isLoading: false,
  })

  const clearError = () => {
    errorState.hasError = false
    errorState.error = null
  }

  const handleError = (error: any, context?: string) => {
    errorState.hasError = true
    errorState.error = error
    errorState.isLoading = false

    const errorMessage = getErrorMessage(error)
    const errorCode = getErrorCode(error)

    logger.error(context || 'Error occurred', {
      code: errorCode,
      message: errorMessage,
    }, error)

    // Show notification if enabled
    if (options.showNotification !== false) {
      // Here you would integrate with your notification system
      console.error(errorMessage)
    }

    // Redirect if configured
    if (options.redirectOnError) {
      router.push(options.redirectOnError)
    }

    return {
      message: errorMessage,
      code: errorCode,
    }
  }

  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    clearError()
    errorState.isLoading = true

    try {
      const result = await fn()
      errorState.isLoading = false
      return result
    } catch (error) {
      handleError(error, context)
      
      // Return fallback data if provided
      if (options.fallbackData !== undefined) {
        return options.fallbackData
      }
      
      return null
    }
  }

  return {
    errorState: readonly(errorState),
    handleError,
    clearError,
    withErrorHandling,
  }
}

// Composable for async data with error handling
export function useSafeAsyncData<T>(
  key: string,
  handler: () => Promise<T>,
  options: {
    fallback?: T
    retry?: boolean
    retryAttempts?: number
    retryDelay?: number
  } = {}
) {
  const logger = useLogger()
  const { fallback, retry = false, retryAttempts = 3, retryDelay = 1000 } = options

  let attempts = 0

  const wrappedHandler = async (): Promise<T> => {
    try {
      const result = await handler()
      attempts = 0 // Reset on success
      return result
    } catch (error) {
      logger.error(`Async data fetch failed for key: ${key}`, { attempts }, error)

      if (retry && attempts < retryAttempts) {
        attempts++
        logger.info(`Retrying async data fetch (${attempts}/${retryAttempts})`)
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts))
        return wrappedHandler()
      }

      if (fallback !== undefined) {
        logger.info('Returning fallback data', { key })
        return fallback
      }

      throw error
    }
  }

  return useAsyncData(key, wrappedHandler)
}
