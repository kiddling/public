# 错误处理和日志系统文档

本文档介绍应用程序的错误处理和日志系统的架构、使用方法和最佳实践。

## 目录

1. [概述](#概述)
2. [核心组件](#核心组件)
3. [使用指南](#使用指南)
4. [最佳实践](#最佳实践)
5. [配置](#配置)
6. [故障排查](#故障排查)

## 概述

本应用实现了全面的错误处理和日志系统，包括：

- **全局错误处理**：捕获所有未处理的错误和 Promise rejections
- **结构化日志**：支持不同日志级别和上下文信息
- **API 错误处理**：统一的 API 错误处理和自动重试机制
- **用户友好的错误提示**：中文错误消息和优雅的错误页面
- **错误上报**：自动收集和上报错误信息
- **降级和容错**：缓存回退和离线模式支持
- **监控和告警**：实时监控错误率和性能指标

## 核心组件

### 1. Logger (日志系统)

位置：`utils/logger.ts`

结构化日志工具，支持不同日志级别和上下文信息。

```typescript
import { useLogger } from '~/utils/logger'

const logger = useLogger()

// 不同级别的日志
logger.debug('调试信息', { userId: '123' })
logger.info('信息日志', { action: 'user_login' })
logger.warn('警告信息', { message: '缓存已满' })
logger.error('错误信息', { error: 'Database connection failed' }, error)

// 添加面包屑（用于追踪用户操作路径）
logger.addBreadcrumb('用户点击了登录按钮')
```

### 2. Error Types (错误类型)

位置：`types/error.ts`

定义了应用中使用的错误类型和中文错误消息。

```typescript
import { ErrorCode, createError, getErrorMessage } from '~/types/error'

// 创建自定义错误
const error = createError(ErrorCode.NOT_FOUND, '用户不存在', originalError, { userId: '123' })

// 获取错误消息
const message = getErrorMessage(error)
```

### 3. API Client (API 客户端)

位置：`utils/api-client.ts`

带有重试机制和统一错误处理的 API 客户端。

```typescript
import { useApiClient } from '~/utils/api-client'

const apiClient = useApiClient()

// 自动处理错误和重试
const data = await apiClient.get('/api/users')

// 自定义配置
const data = await apiClient.post('/api/users', userData, {
  retry: true,
  maxRetries: 3,
  timeout: 10000,
})
```

### 4. Error Boundary (错误边界)

位置：`components/error/ErrorBoundary.vue`

Vue 错误边界组件，用于捕获子组件中的错误。

```vue
<template>
  <ErrorBoundary
    error-title="组件加载失败"
    error-message="抱歉，此功能暂时无法使用"
    :show-reset="true"
    @error="handleError"
  >
    <YourComponent />
  </ErrorBoundary>
</template>
```

### 5. Error Pages (错误页面)

- `error.vue` - 全局错误页面
- `pages/error/404.vue` - 404 页面
- `pages/error/offline.vue` - 离线页面

### 6. Composables (可组合函数)

#### useErrorHandling

```typescript
import { useErrorHandling } from '~/composables/useErrorHandling'

const { errorState, handleError, withErrorHandling } = useErrorHandling({
  showNotification: true,
  redirectOnError: false,
})

// 使用错误处理包装异步操作
const result = await withErrorHandling(async () => {
  return await fetchData()
}, '获取数据失败')
```

#### useCacheFallback

```typescript
import { useCacheFallback } from '~/composables/useCacheFallback'

const { fetchWithFallback } = useCacheFallback({
  key: 'user-data',
  ttl: 3600000, // 1小时
  storage: 'local',
})

// 使用缓存回退
const data = await fetchWithFallback(() => apiClient.get('/api/user'), {
  useCache: true,
  updateCache: true,
})
```

#### useMonitoring

```typescript
import { useMonitoring } from '~/composables/useMonitoring'

const monitoring = useMonitoring()

// 记录不同类型的指标
monitoring.recordPageView('/lessons')
monitoring.recordApiCall('/api/lessons', 150, true)
monitoring.recordError('API_ERROR', 'Failed to fetch data')
monitoring.recordUserAction('click_download', { resourceId: '123' })
```

#### useNotification

```typescript
import { useNotification } from '~/composables/useNotification'

const notification = useNotification()

// 显示不同类型的通知
notification.success('成功', '数据已保存')
notification.error('错误', '保存失败，请重试')
notification.warning('警告', '网络连接不稳定')
notification.info('提示', '有新版本可用')
```

## 使用指南

### 在 Vue 组件中处理错误

```vue
<script setup lang="ts">
import { useLogger } from '~/utils/logger'
import { useNotification } from '~/composables/useNotification'
import { useApiClient } from '~/utils/api-client'

const logger = useLogger()
const notification = useNotification()
const apiClient = useApiClient()

const fetchData = async () => {
  try {
    logger.addBreadcrumb('开始获取数据')
    const data = await apiClient.get('/api/data')
    notification.success('成功', '数据加载完成')
    return data
  } catch (error) {
    logger.error('获取数据失败', {}, error)
    notification.error('错误', '数据加载失败，请重试')
    throw error
  }
}
</script>
```

### 在 API 路由中处理错误

```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  try {
    const users = await fetchUsers()
    return users
  } catch (error) {
    console.error('Failed to fetch users:', error)

    throw createError({
      statusCode: 500,
      statusMessage: '获取用户列表失败',
      data: {
        code: ErrorCode.SERVER_ERROR,
        message: '服务器内部错误',
      },
    })
  }
})
```

### 使用错误边界保护组件

```vue
<template>
  <div>
    <h1>我的页面</h1>

    <!-- 保护可能出错的组件 -->
    <ErrorBoundary error-title="侧边栏加载失败" :show-reset="true">
      <Sidebar />
    </ErrorBoundary>

    <!-- 主要内容 -->
    <MainContent />
  </div>
</template>
```

### 实现离线优先的数据获取

```typescript
import { useOfflineFirst } from '~/composables/useCacheFallback'

const { data, error, isLoading, isStale, refresh } = useOfflineFirst(
  'lessons-data',
  () => apiClient.get('/api/lessons'),
  { ttl: 86400000, storage: 'local' } // 缓存24小时
)

// 强制刷新
const forceRefresh = () => refresh(true)
```

## 最佳实践

### 1. 始终记录上下文信息

```typescript
// ✅ 好的做法
logger.error(
  '保存用户数据失败',
  {
    userId: user.id,
    action: 'update_profile',
    timestamp: new Date().toISOString(),
  },
  error
)

// ❌ 不好的做法
logger.error('保存失败')
```

### 2. 使用适当的日志级别

- **DEBUG**: 调试信息，仅在开发环境
- **INFO**: 一般信息，如用户操作、状态变化
- **WARN**: 警告信息，如降级、缓存失效
- **ERROR**: 错误信息，需要关注和处理的问题

### 3. 捕获并处理错误，不要忽略

```typescript
// ✅ 好的做法
try {
  await dangerousOperation()
} catch (error) {
  logger.error('操作失败', {}, error)
  notification.error('错误', '操作失败，请重试')
  // 提供降级方案或用户指引
}

// ❌ 不好的做法
try {
  await dangerousOperation()
} catch (error) {
  // 什么都不做
}
```

### 4. 为用户提供清晰的错误信息

```typescript
// ✅ 好的做法
notification.error(
  '上传失败',
  '文件大小超过限制（最大 10MB），请选择较小的文件',
  0, // 不自动关闭
  {
    label: '了解更多',
    onClick: () => router.push('/help/file-upload'),
  }
)

// ❌ 不好的做法
notification.error('错误', 'Error: file too large')
```

### 5. 使用面包屑追踪用户路径

```typescript
// 在关键操作点添加面包屑
logger.addBreadcrumb('用户打开了资源列表')
logger.addBreadcrumb('用户搜索：设计思维')
logger.addBreadcrumb('用户点击下载按钮')
logger.addBreadcrumb('开始下载文件')

// 当错误发生时，可以看到完整的用户操作路径
```

### 6. 实现优雅降级

```typescript
const { data, error } = await useSafeAsyncData(
  'critical-data',
  () => apiClient.get('/api/critical'),
  {
    fallback: DEFAULT_DATA, // 提供降级数据
    retry: true,
    retryAttempts: 3,
  }
)

if (error.value) {
  notification.warning('使用缓存数据', '无法获取最新数据，正在显示缓存内容')
}
```

### 7. 监控关键指标

```typescript
const monitoring = useMonitoring()

// 监控 API 性能
const startTime = Date.now()
try {
  const result = await apiClient.get('/api/data')
  monitoring.recordApiCall('/api/data', Date.now() - startTime, true)
} catch (error) {
  monitoring.recordApiCall('/api/data', Date.now() - startTime, false)
  monitoring.recordError('API_ERROR', error.message)
}

// 定期检查错误率
const errorRate = monitoring.getErrorRate(3600000) // 最近1小时
if (errorRate > 100) {
  logger.warn('错误率过高', { errorRate })
  // 发送告警
}
```

## 配置

### 日志级别配置

在 `nuxt.config.ts` 中配置：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      logLevel: process.env.LOG_LEVEL || 'info',
    },
  },
})
```

### 错误上报配置

在应用启动时初始化：

```typescript
// plugins/error-reporter.ts
import { errorReporter } from '~/utils/error-reporter'

export default defineNuxtPlugin(() => {
  errorReporter.init({
    enabled: !process.dev,
    endpoint: '/api/error-reports',
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION,
  })
})
```

### API 客户端配置

```typescript
const apiClient = createApiClient(baseURL, {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
})
```

## 故障排查

### 问题：日志没有显示

1. 检查日志级别设置
2. 确认环境变量配置
3. 查看浏览器控制台是否有错误

### 问题：错误没有被捕获

1. 确认错误处理插件已加载
2. 检查是否在正确的位置使用了错误边界
3. 查看全局错误处理器配置

### 问题：通知不显示

1. 确认 `NotificationContainer` 组件已添加到 `app.vue`
2. 检查 z-index 层级是否被覆盖
3. 查看浏览器控制台是否有错误

### 问题：缓存回退不工作

1. 检查浏览器是否支持 localStorage/sessionStorage
2. 确认缓存 key 正确
3. 检查 TTL 设置是否过期

## 测试

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { logger } from '~/utils/logger'
import { createError, ErrorCode } from '~/types/error'

describe('Error Handling', () => {
  it('should create custom error with correct properties', () => {
    const error = createError(ErrorCode.NOT_FOUND, '资源不存在', undefined, { resourceId: '123' })

    expect(error.code).toBe(ErrorCode.NOT_FOUND)
    expect(error.message).toBe('资源不存在')
    expect(error.context?.resourceId).toBe('123')
  })

  it('should log with correct level', () => {
    const consoleSpy = vi.spyOn(console, 'info')
    logger.info('测试日志', { test: true })
    expect(consoleSpy).toHaveBeenCalled()
  })
})
```

### 集成测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { useApiClient } from '~/utils/api-client'

describe('API Error Handling', () => {
  it('should retry on network error', async () => {
    const apiClient = useApiClient()

    // 模拟网络错误
    mockNetworkError()

    try {
      await apiClient.get('/api/test', { maxRetries: 2 })
    } catch (error) {
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR)
    }
  })
})
```

## 相关资源

- [Nuxt Error Handling](https://nuxt.com/docs/getting-started/error-handling)
- [Vue Error Handling](https://vuejs.org/guide/best-practices/production-deployment.html#tracking-runtime-errors)
- [Web Vitals](https://web.dev/vitals/)

## 更新日志

- **v1.0.0** (2024-01-01): 初始版本，实现基础错误处理和日志系统
