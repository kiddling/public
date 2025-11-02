import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logger, LogLevel } from '~/utils/logger'
import { ErrorCode, createError, getErrorMessage, getErrorCode, isAppError } from '~/types/error'

describe('Logger', () => {
  beforeEach(() => {
    logger.clearBreadcrumbs()
  })

  it('should add breadcrumbs correctly', () => {
    logger.addBreadcrumb('Test breadcrumb 1')
    logger.addBreadcrumb('Test breadcrumb 2')

    const breadcrumbs = logger.getBreadcrumbs()
    expect(breadcrumbs).toHaveLength(2)
    expect(breadcrumbs[0].message).toBe('Test breadcrumb 1')
    expect(breadcrumbs[1].message).toBe('Test breadcrumb 2')
  })

  it('should clear breadcrumbs', () => {
    logger.addBreadcrumb('Test')
    logger.clearBreadcrumbs()

    const breadcrumbs = logger.getBreadcrumbs()
    expect(breadcrumbs).toHaveLength(0)
  })

  it('should limit breadcrumbs to max count', () => {
    // Add more than max breadcrumbs
    for (let i = 0; i < 60; i++) {
      logger.addBreadcrumb(`Breadcrumb ${i}`)
    }

    const breadcrumbs = logger.getBreadcrumbs()
    expect(breadcrumbs.length).toBeLessThanOrEqual(50)
  })

  it('should set minimum log level', () => {
    logger.setMinLevel(LogLevel.ERROR)

    const consoleSpy = vi.spyOn(console, 'debug')
    logger.debug('Debug message')

    expect(consoleSpy).not.toHaveBeenCalled()
  })
})

describe('Error Types', () => {
  it('should create custom error with all properties', () => {
    const originalError = new Error('Original error')
    const context = { userId: '123', action: 'test' }

    const error = createError(ErrorCode.NOT_FOUND, 'Custom message', originalError, context)

    expect(error.code).toBe(ErrorCode.NOT_FOUND)
    expect(error.message).toBe('Custom message')
    expect(error.originalError).toBe(originalError)
    expect(error.context).toEqual(context)
    expect(error.timestamp).toBeDefined()
  })

  it('should use default message if not provided', () => {
    const error = createError(ErrorCode.NETWORK_ERROR)
    expect(error.message).toBe('网络连接失败，请检查您的网络设置')
  })

  it('should correctly identify AppError', () => {
    const appError = createError(ErrorCode.API_ERROR)
    const normalError = new Error('Normal error')

    expect(isAppError(appError)).toBe(true)
    expect(isAppError(normalError)).toBe(false)
    expect(isAppError(null)).toBe(false)
    expect(isAppError('string')).toBe(false)
  })

  it('should get error message from different error types', () => {
    const appError = createError(ErrorCode.NOT_FOUND, 'Custom message')
    const normalError = new Error('Normal error message')
    const stringError = 'String error'

    expect(getErrorMessage(appError)).toBe('Custom message')
    expect(getErrorMessage(normalError)).toBe('Normal error message')
    expect(getErrorMessage(stringError)).toBe('String error')
  })

  it('should get error code correctly', () => {
    const appError = createError(ErrorCode.TIMEOUT)
    const normalError = new Error('Normal error')

    expect(getErrorCode(appError)).toBe(ErrorCode.TIMEOUT)
    expect(getErrorCode(normalError)).toBe(ErrorCode.UNKNOWN_ERROR)
  })
})

describe('Error Messages', () => {
  it('should have Chinese error messages for all error codes', () => {
    const errorCodes = Object.values(ErrorCode)

    errorCodes.forEach((code) => {
      const error = createError(code)
      expect(error.message).toBeTruthy()
      expect(error.message.length).toBeGreaterThan(0)
      // Check if message contains Chinese characters
      expect(/[\u4e00-\u9fa5]/.test(error.message)).toBe(true)
    })
  })
})
