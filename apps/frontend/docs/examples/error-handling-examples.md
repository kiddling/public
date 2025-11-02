# 错误处理示例

本文档提供了常见场景下的错误处理实现示例。

## 目录

1. [组件中的错误处理](#组件中的错误处理)
2. [API 调用错误处理](#api-调用错误处理)
3. [表单验证错误](#表单验证错误)
4. [文件上传错误](#文件上传错误)
5. [离线模式处理](#离线模式处理)
6. [性能监控](#性能监控)

## 组件中的错误处理

### 基础错误处理

```vue
<template>
  <div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="loading">加载中...</div>

    <div v-else>
      <!-- 内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogger } from '~/utils/logger'
import { useNotification } from '~/composables/useNotification'

const logger = useLogger()
const notification = useNotification()

const loading = ref(false)
const error = ref<string | null>(null)
const data = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    logger.addBreadcrumb('开始加载数据')
    const response = await $fetch('/api/data')
    data.value = response
    logger.info('数据加载成功')
  } catch (err: any) {
    logger.error('数据加载失败', {}, err)
    error.value = '加载失败，请重试'
    notification.error('错误', error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

### 使用 Error Boundary

```vue
<template>
  <div>
    <h1>我的页面</h1>

    <!-- 保护可能出错的组件 -->
    <ErrorBoundary
      error-title="内容加载失败"
      error-message="抱歉，此部分内容暂时无法显示"
      :show-reset="true"
      :show-report-button="true"
      @retry="handleRetry"
    >
      <ComplexComponent />
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
const handleRetry = () => {
  // 重试逻辑
  window.location.reload()
}
</script>
```

## API 调用错误处理

### 使用 API Client

```typescript
import { useApiClient } from '~/utils/api-client'
import { useLogger } from '~/utils/logger'
import { useNotification } from '~/composables/useNotification'

const apiClient = useApiClient()
const logger = useLogger()
const notification = useNotification()

// 基础调用
const fetchUsers = async () => {
  try {
    const users = await apiClient.get('/api/users')
    return users
  } catch (error) {
    logger.error('获取用户列表失败', {}, error)
    notification.error('错误', '无法加载用户列表')
    throw error
  }
}

// 带自定义配置的调用
const createUser = async (userData: any) => {
  try {
    const user = await apiClient.post('/api/users', userData, {
      retry: true,
      maxRetries: 3,
      timeout: 10000,
    })

    notification.success('成功', '用户创建成功')
    return user
  } catch (error) {
    logger.error('创建用户失败', { userData }, error)
    notification.error('创建失败', '无法创建用户，请检查输入后重试', 0, {
      label: '查看详情',
      onClick: () => console.error(error),
    })
    throw error
  }
}
```

### 使用 useSafeAsyncData

```vue
<script setup lang="ts">
import { useSafeAsyncData } from '~/composables/useErrorHandling'

const { data, error, pending } = await useSafeAsyncData(
  'lessons',
  async () => {
    const response = await $fetch('/api/lessons')
    return response
  },
  {
    fallback: [], // 失败时返回空数组
    retry: true,
    retryAttempts: 3,
    retryDelay: 1000,
  }
)

// 显示错误
watch(error, (newError) => {
  if (newError) {
    notification.error('加载失败', '无法加载课程列表')
  }
})
</script>
```

## 表单验证错误

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="email">邮箱</label>
      <input id="email" v-model="form.email" type="email" :class="{ error: errors.email }" />
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>

    <div>
      <label for="password">密码</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        :class="{ error: errors.password }"
      />
      <span v-if="errors.password" class="error-message">
        {{ errors.password }}
      </span>
    </div>

    <button type="submit" :disabled="submitting">
      {{ submitting ? '提交中...' : '提交' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { useLogger } from '~/utils/logger'
import { useNotification } from '~/composables/useNotification'
import { ErrorCode, createError } from '~/types/error'

const logger = useLogger()
const notification = useNotification()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

const validateForm = (): boolean => {
  // 清除之前的错误
  Object.keys(errors).forEach((key) => delete errors[key])

  let isValid = true

  // 验证邮箱
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = '密码长度至少为8位'
    isValid = false
  }

  if (!isValid) {
    logger.warn('表单验证失败', { errors })
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    notification.warning('验证失败', '请检查表单输入')
    return
  }

  submitting.value = true
  logger.addBreadcrumb('用户提交表单')

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form,
    })

    logger.info('登录成功', { email: form.email })
    notification.success('成功', '登录成功')

    // 跳转到首页
    await navigateTo('/')
  } catch (error: any) {
    logger.error('登录失败', { email: form.email }, error)

    if (error.statusCode === 401) {
      notification.error('登录失败', '邮箱或密码错误')
    } else if (error.statusCode === 429) {
      notification.error('请求过于频繁', '请稍后再试')
    } else {
      notification.error('登录失败', '服务器错误，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.error {
  border-color: red;
}

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
```

## 文件上传错误

```vue
<script setup lang="ts">
import { useLogger } from '~/utils/logger'
import { useNotification } from '~/composables/useNotification'

const logger = useLogger()
const notification = useNotification()

const uploading = ref(false)
const progress = ref(0)

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (file.size > maxSize) {
    logger.warn('文件过大', { size: file.size, maxSize })
    notification.error('文件过大', `文件大小超过限制（最大 ${maxSize / 1024 / 1024}MB）`, 0, {
      label: '了解更多',
      onClick: () => navigateTo('/help/file-upload'),
    })
    return
  }

  if (!allowedTypes.includes(file.type)) {
    logger.warn('文件类型不支持', { type: file.type })
    notification.error('文件类型不支持', '仅支持 JPEG、PNG 和 WebP 格式')
    return
  }

  uploading.value = true
  progress.value = 0
  logger.addBreadcrumb(`开始上传文件: ${file.name}`)

  try {
    const formData = new FormData()
    formData.append('file', file)

    // 使用 XMLHttpRequest 以支持进度跟踪
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          progress.value = (e.loaded / e.total) * 100
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })

    logger.info('文件上传成功', { filename: file.name })
    notification.success('上传成功', `${file.name} 已成功上传`)
  } catch (error: any) {
    logger.error('文件上传失败', { filename: file.name }, error)
    notification.error('上传失败', '文件上传失败，请重试', 0, {
      label: '重试',
      onClick: () => handleFileUpload(event),
    })
  } finally {
    uploading.value = false
    progress.value = 0
  }
}
</script>
```

## 离线模式处理

```vue
<script setup lang="ts">
import { useOfflineFirst } from '~/composables/useCacheFallback'
import { useOnline } from '@vueuse/core'
import { useNotification } from '~/composables/useNotification'

const isOnline = useOnline()
const notification = useNotification()

// 使用离线优先策略
const { data, error, isLoading, isStale, refresh } = useOfflineFirst(
  'lessons-data',
  async () => {
    const response = await $fetch('/api/lessons')
    return response
  },
  {
    ttl: 86400000, // 缓存24小时
    storage: 'local',
  }
)

// 监听在线状态变化
watch(isOnline, async (online) => {
  if (online && isStale.value) {
    notification.info('网络已恢复', '正在获取最新数据...')
    await refresh(true)
    notification.success('更新成功', '数据已更新')
  } else if (!online) {
    notification.warning('离线模式', '当前显示缓存数据')
  }
})

// 显示离线提示
watchEffect(() => {
  if (!isOnline.value && isStale.value) {
    notification.warning('数据可能已过期', '您正在离线模式下查看缓存数据')
  }
})
</script>
```

## 性能监控

```vue
<script setup lang="ts">
import { useMonitoring } from '~/composables/useMonitoring'
import { useLogger } from '~/utils/logger'

const monitoring = useMonitoring()
const logger = useLogger()

// 监控页面加载性能
onMounted(() => {
  // 记录页面视图
  monitoring.recordPageView(route.fullPath)

  // 监控组件挂载时间
  const mountTime = performance.now()
  monitoring.recordPerformanceMetric('component_mount', mountTime)
  logger.debug('组件挂载完成', { mountTime })
})

// 监控 API 调用
const fetchData = async () => {
  const startTime = performance.now()

  try {
    const data = await $fetch('/api/data')
    const duration = performance.now() - startTime

    monitoring.recordApiCall('/api/data', duration, true)
    logger.debug('API 调用成功', { duration })

    return data
  } catch (error) {
    const duration = performance.now() - startTime

    monitoring.recordApiCall('/api/data', duration, false)
    monitoring.recordError('API_ERROR', 'Failed to fetch data')
    logger.error('API 调用失败', { duration }, error)

    throw error
  }
}

// 监控用户操作
const handleUserAction = (action: string) => {
  monitoring.recordUserAction(action, {
    page: route.path,
    timestamp: new Date().toISOString(),
  })

  logger.addBreadcrumb(`用户操作: ${action}`)
}

// 定期检查错误率
onMounted(() => {
  const checkInterval = setInterval(() => {
    const errorRate = monitoring.getErrorRate(3600000) // 最近1小时

    if (errorRate > 100) {
      logger.warn('错误率过高', { errorRate })
      // 发送告警
    }
  }, 300000) // 每5分钟检查一次

  onUnmounted(() => {
    clearInterval(checkInterval)
  })
})
</script>
```

## 错误恢复示例

```vue
<script setup lang="ts">
import { useLogger } from '~/utils/logger'
import { useNotification } from '~/composables/useNotification'

const logger = useLogger()
const notification = useNotification()

const maxRetries = 3
const retryDelay = 2000

const fetchWithRetry = async (fetcher: () => Promise<any>, attempt = 1): Promise<any> => {
  try {
    logger.debug(`尝试获取数据 (${attempt}/${maxRetries})`)
    return await fetcher()
  } catch (error) {
    if (attempt >= maxRetries) {
      logger.error('达到最大重试次数', { attempt, maxRetries }, error)
      throw error
    }

    logger.warn(`获取失败，将在 ${retryDelay}ms 后重试`, { attempt })

    await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt))
    return fetchWithRetry(fetcher, attempt + 1)
  }
}

const loadData = async () => {
  try {
    const data = await fetchWithRetry(() => $fetch('/api/data'))
    notification.success('成功', '数据加载完成')
    return data
  } catch (error) {
    logger.error('数据加载失败', {}, error)
    notification.error('加载失败', '多次尝试后仍无法加载数据，请稍后重试', 0, {
      label: '重试',
      onClick: () => loadData(),
    })
  }
}
</script>
```

## 总结

这些示例展示了如何在不同场景下实现健壮的错误处理：

1. **组件错误处理**：使用 try-catch 和 error boundary
2. **API 错误处理**：统一的错误处理和重试机制
3. **表单验证**：前端验证和友好的错误提示
4. **文件上传**：文件验证和上传进度跟踪
5. **离线模式**：缓存回退和状态提示
6. **性能监控**：记录和分析关键指标

记住始终：

- 记录详细的日志信息
- 提供友好的中文错误消息
- 实现优雅降级
- 监控关键指标
- 测试错误场景
