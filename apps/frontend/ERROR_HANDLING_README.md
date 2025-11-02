# 错误处理和日志系统

完善的错误处理机制和日志记录系统，提升应用稳定性和问题诊断能力。

## 🎯 功能特性

### ✅ 全局错误处理

- ✅ Nuxt 全局错误处理配置
- ✅ 自定义错误页面（404, 500, offline）
- ✅ 未处理的 Promise rejection 捕获
- ✅ Vue 错误边界组件实现

### ✅ API 错误处理标准化

- ✅ 统一的 API 错误响应格式
- ✅ 指数退避重试机制
- ✅ 网络超时处理
- ✅ 友好的中文错误提示

### ✅ 日志系统

- ✅ 结构化日志工具
- ✅ 日志级别（debug, info, warn, error）
- ✅ 上下文信息（用户ID、时间戳、请求ID）
- ✅ 开发和生产环境不同配置

### ✅ 错误上报

- ✅ 错误追踪服务集成层
- ✅ 收集错误信息和堆栈
- ✅ 用户操作路径记录（面包屑）
- ✅ Sourcemap 支持

### ✅ 降级和容错

- ✅ 关键功能降级策略
- ✅ 缓存 fallback 实现
- ✅ 离线模式支持
- ✅ 优雅降级提示

### ✅ 监控和告警

- ✅ 健康检查端点
- ✅ 关键指标监控（错误率、响应时间）
- ✅ 异常告警机制
- ✅ 错误趋势报告

### ✅ 文档和测试

- ✅ 完整的文档和最佳实践
- ✅ 错误场景单元测试
- ✅ 网络故障集成测试示例

## 📁 文件结构

```
apps/frontend/
├── utils/
│   ├── logger.ts                 # 结构化日志系统
│   ├── api-client.ts             # API 客户端（带重试和错误处理）
│   └── error-reporter.ts         # 错误上报服务
├── types/
│   └── error.ts                  # 错误类型和中文消息定义
├── composables/
│   ├── useErrorHandling.ts       # 错误处理可组合函数
│   ├── useCacheFallback.ts       # 缓存回退策略
│   ├── useMonitoring.ts          # 监控和指标收集
│   └── useNotification.ts        # 通知系统
├── components/
│   ├── error/
│   │   └── ErrorBoundary.vue     # Vue 错误边界组件
│   └── ui/
│       └── NotificationContainer.vue  # 通知容器
├── pages/
│   └── error/
│       ├── 404.vue               # 404 页面
│       └── offline.vue           # 离线页面
├── plugins/
│   └── error-handler.ts          # 全局错误处理插件
├── server/
│   └── api/
│       ├── health.get.ts         # 健康检查端点
│       └── error-reports.post.ts # 错误上报端点
├── tests/
│   └── unit/
│       ├── error-handling.test.ts    # 错误处理测试
│       ├── api-client.test.ts        # API 客户端测试
│       └── cache-fallback.test.ts    # 缓存回退测试
├── docs/
│   ├── ERROR_HANDLING.md         # 详细文档
│   └── examples/
│       └── error-handling-examples.md  # 使用示例
├── error.vue                     # 全局错误页面
└── nuxt.config.ts               # 已配置 sourcemap
```

## 🚀 快速开始

### 1. 在组件中使用日志

```typescript
import { useLogger } from '~/utils/logger'

const logger = useLogger()

logger.info('用户登录成功', { userId: '123' })
logger.error('数据加载失败', {}, error)
logger.addBreadcrumb('用户点击了下载按钮')
```

### 2. 使用 API 客户端

```typescript
import { useApiClient } from '~/utils/api-client'

const apiClient = useApiClient()

// 自动处理错误和重试
const data = await apiClient.get('/api/users')
```

### 3. 使用错误边界

```vue
<ErrorBoundary error-title="加载失败" :show-reset="true">
  <YourComponent />
</ErrorBoundary>
```

### 4. 显示通知

```typescript
import { useNotification } from '~/composables/useNotification'

const notification = useNotification()

notification.success('成功', '操作完成')
notification.error('错误', '操作失败')
```

### 5. 缓存回退

```typescript
import { useCacheFallback } from '~/composables/useCacheFallback'

const { fetchWithFallback } = useCacheFallback({
  key: 'data',
  ttl: 3600000,
  storage: 'local',
})

const data = await fetchWithFallback(() => $fetch('/api/data'))
```

## 📊 核心功能

### 日志级别

- **DEBUG**: 调试信息（仅开发环境）
- **INFO**: 一般信息日志
- **WARN**: 警告信息
- **ERROR**: 错误信息

### 错误类型

所有错误类型都有对应的中文错误消息：

- `NETWORK_ERROR`: 网络连接失败
- `TIMEOUT`: 请求超时
- `OFFLINE`: 离线状态
- `NOT_FOUND`: 资源不存在
- `UNAUTHORIZED`: 未授权访问
- `FORBIDDEN`: 无权限访问
- `SERVER_ERROR`: 服务器错误
- 等等...

### 重试机制

API 客户端支持智能重试：

- 指数退避算法
- 可配置的最大重试次数
- 自动重试网络错误和特定状态码（5xx, 429, 408）
- 不重试客户端错误（4xx，除了 408）

### 错误页面

- **404 页面**: 美观的找不到页面提示，带快速导航链接
- **离线页面**: 离线状态提示和故障排查指南
- **全局错误页面**: 统一的错误展示，根据错误类型自动调整

## 🧪 测试

运行测试：

```bash
# 单元测试
pnpm test:unit

# 特定测试文件
pnpm test:unit tests/unit/error-handling.test.ts
```

## 📖 文档

详细文档请查看：

- [完整文档](./docs/ERROR_HANDLING.md)
- [使用示例](./docs/examples/error-handling-examples.md)

## 🔧 配置

### 环境变量

```bash
# 日志级别
LOG_LEVEL=info  # debug, info, warn, error

# 错误上报
ERROR_REPORTING_ENABLED=true
ERROR_REPORTING_ENDPOINT=/api/error-reports
```

### Nuxt 配置

在 `nuxt.config.ts` 中已配置：

- Sourcemap 支持（生产环境使用 hidden）
- 健康检查路由规则
- 错误处理中间件

## 🎨 最佳实践

1. **始终记录上下文信息**

   ```typescript
   logger.error('操作失败', { userId, action, timestamp }, error)
   ```

2. **使用适当的日志级别**
   - 避免在生产环境使用 DEBUG
   - ERROR 级别用于需要关注的问题

3. **提供清晰的错误信息**
   - 使用中文消息
   - 提供具体的操作建议
   - 包含帮助链接

4. **实现优雅降级**
   - 提供 fallback 数据
   - 显示缓存内容
   - 保持核心功能可用

5. **监控关键指标**
   - 错误率
   - API 响应时间
   - 用户操作路径

## 🐛 故障排查

### 日志不显示

- 检查日志级别设置
- 确认浏览器控制台
- 查看环境变量

### 通知不显示

- 确认 `NotificationContainer` 已添加到 `app.vue`
- 检查 CSS z-index
- 查看控制台错误

### 错误未捕获

- 确认错误处理插件已加载
- 检查错误边界使用
- 查看全局错误处理器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 License

MIT

## 🔗 相关资源

- [Nuxt Error Handling](https://nuxt.com/docs/getting-started/error-handling)
- [Vue Error Handling](https://vuejs.org/guide/best-practices/production-deployment.html)
- [Web Vitals](https://web.dev/vitals/)

---

**注意**: 这是一个生产就绪的错误处理系统，包含了完整的日志记录、错误追踪、监控和容错机制。请根据项目需求进行配置和扩展。
