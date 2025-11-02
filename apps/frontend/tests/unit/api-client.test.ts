import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApiClient } from '~/utils/api-client'
import { ErrorCode } from '~/types/error'

// Mock $fetch
vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

describe('ApiClient', () => {
  let apiClient: ReturnType<typeof createApiClient>

  beforeEach(() => {
    apiClient = createApiClient('https://api.example.com')
    vi.clearAllMocks()
  })

  describe('Request methods', () => {
    it('should make GET request', async () => {
      const mockData = { id: 1, name: 'Test' }
      const { $fetch } = await import('ofetch')
      vi.mocked($fetch).mockResolvedValueOnce(mockData)

      const result = await apiClient.get('/users/1')
      expect(result).toEqual(mockData)
    })

    it('should make POST request', async () => {
      const mockData = { id: 1, name: 'Created' }
      const { $fetch } = await import('ofetch')
      vi.mocked($fetch).mockResolvedValueOnce(mockData)

      const result = await apiClient.post('/users', { name: 'New User' })
      expect(result).toEqual(mockData)
    })
  })

  describe('Error handling', () => {
    it('should throw NETWORK_ERROR on network failure', async () => {
      const { $fetch } = await import('ofetch')
      vi.mocked($fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        code: ErrorCode.NETWORK_ERROR,
      })
    })

    it('should throw TIMEOUT error on timeout', async () => {
      const { $fetch } = await import('ofetch')
      const timeoutError = new Error('timeout')
      timeoutError.name = 'AbortError'
      vi.mocked($fetch).mockRejectedValueOnce(timeoutError)

      await expect(
        apiClient.get('/test', { timeout: 1000, retry: false })
      ).rejects.toMatchObject({
        code: ErrorCode.TIMEOUT,
      })
    })

    it('should throw NOT_FOUND for 404 response', async () => {
      const { $fetch } = await import('ofetch')
      const error: any = new Error('Not found')
      error.response = { status: 404 }
      vi.mocked($fetch).mockRejectedValueOnce(error)

      await expect(apiClient.get('/test', { retry: false })).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      })
    })

    it('should throw UNAUTHORIZED for 401 response', async () => {
      const { $fetch } = await import('ofetch')
      const error: any = new Error('Unauthorized')
      error.response = { status: 401 }
      vi.mocked($fetch).mockRejectedValueOnce(error)

      await expect(apiClient.get('/test', { retry: false })).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
      })
    })

    it('should throw SERVER_ERROR for 500 response', async () => {
      const { $fetch } = await import('ofetch')
      const error: any = new Error('Server error')
      error.response = { status: 500 }
      vi.mocked($fetch).mockRejectedValueOnce(error)

      await expect(apiClient.get('/test', { retry: false })).rejects.toMatchObject({
        code: ErrorCode.SERVER_ERROR,
      })
    })
  })

  describe('Retry mechanism', () => {
    it('should retry on network error', async () => {
      const { $fetch } = await import('ofetch')
      const networkError = new Error('Network error')
      
      vi.mocked($fetch)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ success: true })

      const result = await apiClient.get('/test', { maxRetries: 2 })
      expect(result).toEqual({ success: true })
      expect($fetch).toHaveBeenCalledTimes(3)
    })

    it('should retry on 503 status', async () => {
      const { $fetch } = await import('ofetch')
      const error: any = new Error('Service unavailable')
      error.response = { status: 503 }
      
      vi.mocked($fetch)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ success: true })

      const result = await apiClient.get('/test', { maxRetries: 1 })
      expect(result).toEqual({ success: true })
      expect($fetch).toHaveBeenCalledTimes(2)
    })

    it('should not retry on 404 status', async () => {
      const { $fetch } = await import('ofetch')
      const error: any = new Error('Not found')
      error.response = { status: 404 }
      
      vi.mocked($fetch).mockRejectedValueOnce(error)

      await expect(
        apiClient.get('/test', { maxRetries: 3 })
      ).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      })
      
      expect($fetch).toHaveBeenCalledTimes(1)
    })

    it('should respect maxRetries limit', async () => {
      const { $fetch } = await import('ofetch')
      const networkError = new Error('Network error')
      
      vi.mocked($fetch).mockRejectedValue(networkError)

      await expect(
        apiClient.get('/test', { maxRetries: 2 })
      ).rejects.toThrow()
      
      expect($fetch).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
    })
  })

  describe('Timeout handling', () => {
    it('should timeout after specified duration', async () => {
      const { $fetch } = await import('ofetch')
      
      vi.mocked($fetch).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 2000))
      )

      await expect(
        apiClient.get('/test', { timeout: 100, retry: false })
      ).rejects.toMatchObject({
        code: ErrorCode.TIMEOUT,
      })
    })
  })
})
