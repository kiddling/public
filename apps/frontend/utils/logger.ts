/**
 * Structured logging utility with support for different log levels
 * and context information
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  url?: string
  userAgent?: string
  timestamp?: string
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error | unknown
  timestamp: string
}

class Logger {
  private static instance: Logger
  private minLevel: LogLevel = LogLevel.INFO
  private breadcrumbs: Array<{ message: string; timestamp: string }> = []
  private maxBreadcrumbs = 50

  private constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.minLevel = LogLevel.DEBUG
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  addBreadcrumb(message: string): void {
    this.breadcrumbs.push({
      message,
      timestamp: new Date().toISOString(),
    })
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift()
    }
  }

  getBreadcrumbs(): Array<{ message: string; timestamp: string }> {
    return [...this.breadcrumbs]
  }

  clearBreadcrumbs(): void {
    this.breadcrumbs = []
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level]
    const prefix = `[${entry.timestamp}] [${levelName}]`
    return `${prefix} ${entry.message}`
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error | unknown
  ): LogEntry {
    return {
      level,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
      error,
      timestamp: new Date().toISOString(),
    }
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return
    }

    const formattedMessage = this.formatMessage(entry)
    const logData = {
      ...entry,
      breadcrumbs: this.getBreadcrumbs(),
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, logData)
        break
      case LogLevel.INFO:
        console.info(formattedMessage, logData)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, logData)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage, logData)
        if (entry.error) {
          console.error('Error details:', entry.error)
        }
        break
    }

    // In production, you can send logs to a logging service here
    if (process.env.NODE_ENV === 'production' && entry.level >= LogLevel.ERROR) {
      this.sendToLoggingService(entry)
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // This is where you would integrate with a logging service
    // For example: Sentry, LogRocket, or a custom logging endpoint
    // For now, this is a placeholder
    try {
      // Example: Send to custom logging endpoint
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // })
    } catch (error) {
      // Silently fail to avoid infinite error loops
      console.error('Failed to send log to service:', error)
    }
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context)
    this.log(entry)
  }

  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context)
    this.log(entry)
  }

  warn(message: string, context?: LogContext, error?: Error | unknown): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, error)
    this.log(entry)
  }

  error(message: string, context?: LogContext, error?: Error | unknown): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error)
    this.log(entry)
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Composable for Vue components
export function useLogger() {
  // Check if we're in a component context
  let route: ReturnType<typeof useRoute> | null = null

  try {
    route = useRoute()
  } catch {
    // Not in a component context, that's ok
  }

  const createContext = (additionalContext?: LogContext): LogContext => {
    return {
      ...(route ? { url: route.fullPath } : {}),
      timestamp: new Date().toISOString(),
      ...additionalContext,
    }
  }

  return {
    debug: (message: string, context?: LogContext) => logger.debug(message, createContext(context)),
    info: (message: string, context?: LogContext) => logger.info(message, createContext(context)),
    warn: (message: string, context?: LogContext, error?: Error | unknown) =>
      logger.warn(message, createContext(context), error),
    error: (message: string, context?: LogContext, error?: Error | unknown) =>
      logger.error(message, createContext(context), error),
    addBreadcrumb: (message: string) => logger.addBreadcrumb(message),
    getBreadcrumbs: () => logger.getBreadcrumbs(),
    clearBreadcrumbs: () => logger.clearBreadcrumbs(),
  }
}
