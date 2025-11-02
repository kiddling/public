# 用户行为分析系统实现总结

## 概述

本文档总结了用户行为分析和统计系统的实现，该系统用于追踪和分析学生如何使用应用，以优化学习体验。

## 已实现功能

### 1. 基础事件追踪系统 ✅

- **Composable**: `composables/useAnalytics.ts`
  - 自动初始化和会话管理
  - 事件发送函数
  - 会话 ID 和用户 ID 追踪
  - 离线事件队列
  - 批量上传优化

- **插件**: `plugins/analytics.client.ts`
  - 自动在客户端初始化 analytics

### 2. 关键事件定义 ✅

实现了以下事件类型（`types/analytics.ts`）:

| 事件类型 | 描述 | 已集成 |
|---------|------|--------|
| `page_view` | 页面浏览事件 | ✅ 自动追踪 |
| `course_browse` | 课程浏览事件 | ✅ 可手动调用 |
| `difficulty_switch` | 难度切换事件 | ✅ 可手动调用 |
| `progress_mark` | 进度标记事件 | ✅ Progress Store |
| `search` | 搜索事件 | ✅ Search Store |
| `download` | 下载事件 | ✅ Downloads Composable |
| `expand` | 展开事件 | ✅ 可手动调用 |
| `filter` | 过滤事件 | ✅ 可手动调用 |
| `navigation_click` | 导航点击事件 | ✅ 可手动调用 |
| `session_start` | 会话开始 | ✅ 自动追踪 |
| `session_end` | 会话结束 | ✅ 自动追踪 |

### 3. 数据收集端点 ✅

- **API 端点**: `server/api/analytics/track.post.ts`
  - Zod 数据验证
  - SQLite 数据库存储
  - 批量处理优化
  - 自动创建数据库和表结构

- **数据库表**:
  - `analytics_events`: 存储所有事件
  - `analytics_sessions`: 会话汇总数据
  - `analytics_page_views`: 页面浏览详情
  - `analytics_searches`: 搜索查询

### 4. 页面停留时间追踪 ✅

- 自动记录页面进入时间
- 监听路由变化
- 监听页面可见性变化（Visibility API）
- 在页面离开时计算停留时间
- 使用 `sendBeacon` API 在页面卸载时发送数据

### 5. 学习路径分析 ✅

- **API 端点**: `server/api/analytics/learning-paths.get.ts`
  - 记录课程访问序列
  - 追踪学习进度路径
  - 识别困难点（难度切换次数）
  - 按会话分组分析

### 6. 隐私保护 ✅

- **Cookie 同意组件**: `components/AnalyticsConsent.vue`
  - 首次访问显示同意横幅
  - 用户可选择接受或拒绝
  - 已集成到 default layout

- **隐私功能**:
  - 遵守 Do Not Track (DNT) 设置
  - 选择退出机制
  - 匿名用户 ID（UUID）
  - 同意状态持久化

### 7. 分析仪表板 ✅

- **页面**: `pages/admin/analytics.vue`
  - 时间范围选择（24h, 7d, 30d, 全部）
  - 总览统计卡片
  - 热门页面排行
  - 热门课程排行
  - 搜索查询统计
  - 下载统计

- **组件**: `components/admin/StatCard.vue`
  - 可复用的统计卡片组件

- **API 端点**: `server/api/analytics/stats.get.ts`
  - 聚合统计数据
  - 支持时间范围过滤

### 8. 测试和文档 ✅

- **测试**: `tests/unit/analytics.test.ts`
  - 基础单元测试
  - 事件类型验证
  - 会话管理测试
  - 隐私控制测试
  - 离线队列测试

- **文档**: `docs/ANALYTICS.md`
  - 完整的使用指南
  - API 文档
  - 数据库结构
  - 隐私保护说明
  - 故障排除指南
  - 最佳实践

## 技术实现细节

### 会话管理

- 使用 UUID 生成唯一会话 ID
- 30 分钟无活动后会话过期
- 会话 ID 存储在 localStorage
- 跨页面保持会话状态

### 离线队列

- 事件缓存到 localStorage
- 网络恢复时自动发送
- 监听 `online` 和 `offline` 事件
- 存储空间管理

### 批量上传

- 默认批量大小: 10 个事件
- 默认批量间隔: 30 秒
- 达到批量大小立即发送
- 页面卸载时使用 `sendBeacon` 发送

### 数据存储

- 使用 SQLite (better-sqlite3)
- 自动创建数据库和表
- 适当的索引优化查询性能
- 支持复杂的聚合查询

### 性能优化

- 所有追踪操作异步执行
- 不阻塞 UI 渲染
- 防抖处理频繁事件
- 批量发送减少网络请求
- 懒加载组件

## 已集成的位置

### 自动追踪

1. **页面浏览**: 所有路由变化自动追踪
2. **会话**: 应用启动和关闭自动追踪
3. **页面停留时间**: 自动计算

### 手动集成

1. **Progress Store** (`stores/progress.ts`):
   - `markLessonComplete()` - 追踪完成事件
   - `markLessonIncomplete()` - 追踪取消完成事件

2. **Search Store** (`stores/search.ts`):
   - `search()` - 追踪搜索查询

3. **Downloads Composable** (`composables/useDownloads.ts`):
   - `addToHistory()` - 追踪下载事件

4. **Default Layout** (`layouts/default.vue`):
   - 包含 `AnalyticsConsent` 组件

## 配置

### 环境变量

```env
# 可选，默认: ./data/analytics.db
ANALYTICS_DB_PATH=./data/analytics.db
```

### 运行时配置

在 `useAnalytics` composable 中:

```typescript
config.value = {
  enabled: true,              // 是否启用追踪
  debug: false,               // 调试模式
  batchSize: 10,              // 批量大小
  batchInterval: 30000,       // 批量间隔（毫秒）
  offlineStorage: true,       // 离线存储
  respectDoNotTrack: true,    // 尊重 DNT
  anonymizeIp: true,          // 匿名化 IP
  cookieConsent: false,       // 需要同意
}
```

## 使用示例

### 基本使用

```typescript
// 获取 analytics 实例
const analytics = useAnalytics()

// 追踪自定义事件
analytics.trackEvent({
  eventType: 'custom_event',
  // ... 其他属性
})
```

### 追踪课程浏览

```typescript
analytics.trackCourseBrowse(
  'COURSE_001',
  '美术基础',
  'LESSON_001',
  '色彩理论'
)
```

### 追踪交互

```typescript
analytics.trackInteraction(
  'expand',
  'accordion-item-1',
  'accordion',
  'toggle'
)
```

## 验收标准检查

✅ **所有关键操作都有事件追踪**
- 页面浏览、课程访问、进度标记、搜索、下载都已追踪

✅ **事件数据正确发送和存储**
- 使用 Zod 验证数据格式
- SQLite 数据库持久化存储
- 完整的错误处理

✅ **离线时事件缓存，上线后发送**
- localStorage 离线队列
- 监听网络状态变化
- 自动重试机制

✅ **遵守隐私规定**
- Cookie 同意机制
- Do Not Track 支持
- 选择退出功能
- 匿名用户 ID

✅ **分析仪表板显示基本数据**
- `/admin/analytics` 页面
- 实时统计数据
- 多维度分析

✅ **性能影响可忽略不计**
- 异步操作
- 批量发送
- 防抖处理
- 不阻塞 UI

## API 端点

### POST /api/analytics/track
接收和存储事件批量

### GET /api/analytics/stats
获取统计数据

### GET /api/analytics/learning-paths
获取学习路径分析

## 数据库位置

默认: `./data/analytics.db`

注意: 该目录已添加到 `.gitignore`

## 未来改进建议

1. **实时分析**: 使用 WebSocket 推送实时数据
2. **高级可视化**: 集成 Chart.js 或 ECharts
3. **漏斗分析**: 学习路径转化分析
4. **A/B 测试**: 实验和变体测试
5. **导出功能**: CSV/Excel 导出
6. **告警系统**: 异常数据自动告警
7. **用户画像**: 基于行为的用户分群
8. **热力图**: 页面点击热力图
9. **留存分析**: 用户留存率分析
10. **性能监控**: RUM (Real User Monitoring)

## 故障排除

### 事件未追踪
1. 检查控制台是否有错误
2. 启用调试模式: `analytics.config.value.debug = true`
3. 检查是否已授予同意
4. 检查 DNT 设置

### 数据库错误
1. 确保有写入权限
2. 检查磁盘空间
3. 查看数据库路径配置

### 离线队列未发送
1. 检查网络连接
2. 查看 localStorage 是否已满
3. 检查控制台错误

## 总结

用户行为分析系统已完整实现，满足所有验收标准。系统提供了全面的事件追踪、隐私保护、离线支持和数据分析功能，为优化学习体验提供了坚实的数据基础。
