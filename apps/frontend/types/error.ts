/**
 * Error types and Chinese error messages
 */

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  OFFLINE = 'OFFLINE',

  // API errors
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // Client errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode
  message: string
  originalError?: Error | unknown
  statusCode?: number
  context?: Record<string, any>
  timestamp: string
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查您的网络设置',
  [ErrorCode.TIMEOUT]: '请求超时，请稍后重试',
  [ErrorCode.OFFLINE]: '您当前处于离线状态，请检查网络连接',
  [ErrorCode.API_ERROR]: '服务器响应错误，请稍后重试',
  [ErrorCode.UNAUTHORIZED]: '未授权访问，请先登录',
  [ErrorCode.FORBIDDEN]: '您没有权限访问此资源',
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.SERVER_ERROR]: '服务器内部错误，请稍后重试',
  [ErrorCode.BAD_REQUEST]: '请求参数错误，请检查后重试',
  [ErrorCode.VALIDATION_ERROR]: '数据验证失败，请检查输入',
  [ErrorCode.PARSE_ERROR]: '数据解析失败',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误，请稍后重试',
}

export class CustomError extends Error implements AppError {
  code: ErrorCode
  originalError?: Error | unknown
  statusCode?: number
  context?: Record<string, any>
  timestamp: string

  constructor(
    code: ErrorCode,
    message?: string,
    originalError?: Error | unknown,
    context?: Record<string, any>
  ) {
    super(message || ERROR_MESSAGES[code])
    this.name = 'CustomError'
    this.code = code
    this.originalError = originalError
    this.context = context
    this.timestamp = new Date().toISOString()

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }
  }
}

export function createError(
  code: ErrorCode,
  message?: string,
  originalError?: Error | unknown,
  context?: Record<string, any>
): CustomError {
  return new CustomError(code, message, originalError, context)
}

export function isAppError(error: any): error is AppError {
  return error && typeof error === 'object' && 'code' in error && 'timestamp' in error
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR]
}

export function getErrorCode(error: unknown): ErrorCode {
  if (isAppError(error)) {
    return error.code
  }

  return ErrorCode.UNKNOWN_ERROR
}
