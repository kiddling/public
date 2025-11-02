import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useErrorHandling, useSafeAsyncData } from '~/composables/useErrorHandling'

// Mock logger
vi.mock('~/utils/logger', () => ({
  useLogger: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  })),
}))

// Mock router
const mockRouter = {
  push: vi.fn(),
}
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

// Mock useAsyncData
vi.mock('#app', () => ({
  useAsyncData: vi.fn((key, handler) => handler()),
}))

describe('useErrorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with no error state', () => {
    const { errorState } = useErrorHandling()
    
    expect(errorState.hasError).toBe(false)
    expect(errorState.error).toBeNull()
    expect(errorState.isLoading).toBe(false)
  })

  it('handles errors and updates state', () => {
    const { errorState, handleError } = useErrorHandling()
    
    const testError = new Error('Test error')
    handleError(testError, 'Test context')
    
    expect(errorState.hasError).toBe(true)
    expect(errorState.error).toBe(testError)
  })

  it('clears error state', () => {
    const { errorState, handleError, clearError } = useErrorHandling()
    
    handleError(new Error('Test error'))
    expect(errorState.hasError).toBe(true)
    
    clearError()
    expect(errorState.hasError).toBe(false)
    expect(errorState.error).toBeNull()
  })

  it('redirects on error when configured', () => {
    const { handleError } = useErrorHandling({
      redirectOnError: '/error-page',
    })
    
    handleError(new Error('Test error'))
    
    expect(mockRouter.push).toHaveBeenCalledWith('/error-page')
  })

  it('does not redirect when redirectOnError is false', () => {
    const { handleError } = useErrorHandling({
      redirectOnError: false,
    })
    
    handleError(new Error('Test error'))
    
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('withErrorHandling wraps async function', async () => {
    const { withErrorHandling, errorState } = useErrorHandling()
    
    const successFn = vi.fn().mockResolvedValue('success')
    const result = await withErrorHandling(successFn)
    
    expect(result).toBe('success')
    expect(errorState.hasError).toBe(false)
  })

  it('withErrorHandling handles errors', async () => {
    const { withErrorHandling, errorState } = useErrorHandling()
    
    const errorFn = vi.fn().mockRejectedValue(new Error('Async error'))
    const result = await withErrorHandling(errorFn)
    
    expect(result).toBeNull()
    expect(errorState.hasError).toBe(true)
  })

  it('withErrorHandling returns fallback data on error', async () => {
    const { withErrorHandling } = useErrorHandling({
      fallbackData: 'fallback',
    })
    
    const errorFn = vi.fn().mockRejectedValue(new Error('Async error'))
    const result = await withErrorHandling(errorFn)
    
    expect(result).toBe('fallback')
  })

  it('withErrorHandling sets loading state', async () => {
    const { withErrorHandling, errorState } = useErrorHandling()
    
    const slowFn = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'done'
    })
    
    const promise = withErrorHandling(slowFn)
    expect(errorState.isLoading).toBe(true)
    
    await promise
    expect(errorState.isLoading).toBe(false)
  })

  it('withErrorHandling clears error before execution', async () => {
    const { withErrorHandling, errorState, handleError } = useErrorHandling()
    
    handleError(new Error('Previous error'))
    expect(errorState.hasError).toBe(true)
    
    await withErrorHandling(async () => 'success')
    expect(errorState.hasError).toBe(false)
  })

  it('handleError returns error details', () => {
    const { handleError } = useErrorHandling()
    
    const testError = new Error('Test error')
    const result = handleError(testError, 'Test context')
    
    expect(result).toHaveProperty('message')
    expect(result).toHaveProperty('code')
  })
})

describe('useSafeAsyncData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns data on success', async () => {
    const handler = vi.fn().mockResolvedValue('success')
    
    await useSafeAsyncData('test-key', handler)
    
    expect(handler).toHaveBeenCalled()
  })

  it('returns fallback on error', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('Failed'))
    
    const result = await useSafeAsyncData('test-key', handler, {
      fallback: 'fallback-value',
    })
    
    expect(result).toBe('fallback-value')
  })

  it('retries on failure when retry is enabled', async () => {
    let callCount = 0
    const handler = vi.fn(async () => {
      callCount++
      if (callCount < 3) {
        throw new Error('Temporary failure')
      }
      return 'success'
    })
    
    await useSafeAsyncData('test-key', handler, {
      retry: true,
      retryAttempts: 3,
      retryDelay: 10,
    })
    
    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('throws error after max retries without fallback', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('Failed'))
    
    await expect(
      useSafeAsyncData('test-key', handler, {
        retry: true,
        retryAttempts: 2,
        retryDelay: 10,
      })
    ).rejects.toThrow('Failed')
    
    expect(handler).toHaveBeenCalledTimes(3) // Initial + 2 retries
  })

  it('resets retry counter on success', async () => {
    let callCount = 0
    const handler = vi.fn(async () => {
      callCount++
      if (callCount === 1) {
        throw new Error('First call fails')
      }
      return 'success'
    })
    
    // First call - will retry and succeed
    await useSafeAsyncData('test-key', handler, {
      retry: true,
      retryAttempts: 3,
      retryDelay: 10,
    })
    
    // Reset for second call
    callCount = 0
    
    // Second call - should succeed immediately
    await useSafeAsyncData('test-key2', handler, {
      retry: true,
      retryAttempts: 3,
      retryDelay: 10,
    })
    
    expect(handler).toHaveBeenCalledTimes(3) // 2 from first call, 1 from second
  })
})
