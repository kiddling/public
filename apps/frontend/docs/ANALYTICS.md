# 用户行为分析系统文档

## 概述

用户行为分析系统用于追踪和分析学生如何使用应用，以优化学习体验。该系统遵守隐私规定，支持离线队列，并提供管理仪表板查看统计数据。

## 功能特性

### 1. 基础事件追踪系统

- **自动初始化**: 通过 `useAnalytics` composable 自动初始化
- **会话管理**: 自动生成和管理会话 ID 和用户 ID
- **离线支持**: 离线时事件缓存到 localStorage，上线后自动发送
- **批量上传**: 事件批量发送，减少网络请求

### 2. 关键事件类型

| 事件类型 | 描述 | 追踪位置 |
|---------|------|---------|
| `page_view` | 页面浏览事件 | 自动追踪所有路由变化 |
| `course_browse` | 课程浏览事件 | 课程和课时页面 |
| `difficulty_switch` | 难度切换事件 | 课时难度切换 |
| `progress_mark` | 进度标记事件 | Progress Store |
| `search` | 搜索事件 | Search Store |
| `download` | 下载事件 | Download Composable |
| `expand` | 展开事件 | 交互式组件 |
| `filter` | 过滤事件 | 过滤器组件 |
| `navigation_click` | 导航点击事件 | 导航组件 |
| `session_start` | 会话开始 | 自动追踪 |
| `session_end` | 会话结束 | 自动追踪 |

### 3. 页面停留时间追踪

- 自动记录页面进入时间
- 监听页面离开事件（路由变化、关闭窗口）
- 计算有效停留时间（排除非活跃时间）
- 使用 Visibility API 检测页面可见性

### 4. 隐私保护

#### Cookie 同意
- 首次访问显示同意横幅
- 用户可以选择接受或拒绝
- 拒绝后不追踪任何数据

#### 数据匿名化
- IP 地址匿名化（配置选项）
- 用户 ID 为随机生成的 UUID
- 不收集个人身份信息

#### 选择退出
- 用户可以随时选择退出追踪
- 退出后清除本地存储的队列

#### Do Not Track 支持
- 尊重浏览器的 Do Not Track 设置
- DNT=1 时自动禁用追踪

## 使用方法

### 基本使用

```typescript
// 在 Vue 组件中使用
const analytics = useAnalytics()

// 手动追踪事件
analytics.trackEvent({
  eventType: 'custom_event',
  // ... 其他属性
})
```

### 追踪页面浏览

```typescript
// 自动追踪 - 无需手动调用
// 在路由变化时自动记录

// 手动追踪特定页面
analytics.trackPageView('/custom-path', 'Custom Page Title')
```

### 追踪课程浏览

```typescript
analytics.trackCourseBrowse(
  'COURSE_001',        // courseId
  '美术基础',          // courseTitle
  'LESSON_001',        // lessonId (optional)
  '第一课：色彩理论'   // lessonTitle (optional)
)
```

### 追踪搜索

```typescript
analytics.trackSearch(
  '色彩搭配',          // query
  42,                  // resultsCount (optional)
  0,                   // selectedResultIndex (optional)
  'LESSON_005'         // selectedResultId (optional)
)
```

### 追踪下载

```typescript
analytics.trackDownload(
  'RESOURCE_123',      // resourceId
  '教学资源包.zip',    // resourceName
  'teaching-material', // resourceType
  'zip'                // fileFormat (optional)
)
```

### 追踪交互

```typescript
analytics.trackInteraction(
  'expand',            // eventType
  'accordion-item-1',  // elementId (optional)
  'accordion',         // elementType (optional)
  'toggle',            // action (optional)
  { section: 'faq' }   // metadata (optional)
)
```

### 追踪进度标记

```typescript
// 已自动集成到 Progress Store
// 当调用 markLessonComplete 或 markLessonIncomplete 时自动追踪
```

### 配置选项

```typescript
const analytics = useAnalytics()

// 访问配置
console.log(analytics.config.value)

// 配置选项：
// - enabled: boolean          - 是否启用追踪
// - debug: boolean            - 是否启用调试日志
// - batchSize: number         - 批量大小（默认 10）
// - batchInterval: number     - 批量间隔（默认 30000ms）
// - offlineStorage: boolean   - 是否启用离线存储
// - respectDoNotTrack: boolean - 是否尊重 DNT
// - anonymizeIp: boolean      - 是否匿名化 IP
// - cookieConsent: boolean    - 是否需要 Cookie 同意
```

### 隐私控制

```typescript
// 授予同意
analytics.grantConsent()

// 选择退出
analytics.optOut()

// 立即发送批量
analytics.sendBatch()
```

## 数据库结构

### analytics_events 表
存储所有原始事件数据

```sql
CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT,
  timestamp INTEGER NOT NULL,
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

### analytics_sessions 表
存储会话汇总数据

```sql
CREATE TABLE analytics_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  duration INTEGER,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### analytics_page_views 表
存储页面浏览详情

```sql
CREATE TABLE analytics_page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id TEXT,
  page_path TEXT NOT NULL,
  page_title TEXT,
  dwell_time INTEGER,
  timestamp INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
```

### analytics_searches 表
存储搜索查询

```sql
CREATE TABLE analytics_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id TEXT,
  query TEXT NOT NULL,
  results_count INTEGER,
  selected_result_id TEXT,
  timestamp INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
```

## API 端点

### POST /api/analytics/track
接收事件批量数据

**请求体:**
```json
{
  "events": [
    {
      "eventType": "page_view",
      "timestamp": 1234567890,
      "sessionId": "uuid",
      "userId": "uuid",
      "url": "https://example.com/page",
      "pagePath": "/page",
      "pageTitle": "Page Title"
    }
  ],
  "batchId": "uuid",
  "timestamp": 1234567890
}
```

**响应:**
```json
{
  "success": true,
  "eventsProcessed": 1
}
```

### GET /api/analytics/stats
获取统计数据

**查询参数:**
- `timeRange`: `24h` | `7d` | `30d` | `all` (默认: `7d`)

**响应:**
```json
{
  "totalEvents": 1000,
  "totalSessions": 50,
  "uniqueUsers": 30,
  "avgSessionDuration": 300000,
  "popularPages": [
    {
      "path": "/lessons/1",
      "views": 100,
      "avgDwellTime": 60000
    }
  ],
  "popularCourses": [
    {
      "id": "COURSE_001",
      "title": "美术基础",
      "views": 50
    }
  ],
  "searchQueries": [
    {
      "query": "色彩",
      "count": 20
    }
  ],
  "downloads": [
    {
      "resourceName": "资源包.zip",
      "count": 10
    }
  ]
}
```

## 管理仪表板

访问 `/admin/analytics` 查看分析仪表板

### 功能
- 实时统计数据概览
- 时间范围选择（24小时、7天、30天、全部）
- 热门页面排行
- 热门课程排行
- 搜索查询统计
- 下载统计

## 性能优化

1. **批量发送**: 事件批量发送，减少网络请求
2. **防抖处理**: 搜索等事件使用防抖，避免频繁追踪
3. **离线队列**: 离线时缓存事件，上线后发送
4. **异步处理**: 所有追踪操作异步执行，不阻塞 UI
5. **索引优化**: 数据库表添加适当索引，提高查询性能

## 测试

### 手动测试

1. 启用调试模式:
   ```typescript
   analytics.config.value.debug = true
   ```

2. 浏览应用，观察控制台日志

3. 检查 localStorage 中的队列:
   ```javascript
   localStorage.getItem('analytics_queue')
   ```

4. 访问仪表板验证数据: `/admin/analytics`

### 离线测试

1. 断开网络连接
2. 执行一些操作（浏览、搜索、下载等）
3. 检查 localStorage 中的队列
4. 恢复网络连接
5. 验证队列是否自动发送

## 故障排除

### 事件未被追踪

1. 检查是否已授予同意
2. 检查 DNT 设置
3. 检查是否已选择退出
4. 启用调试模式查看日志

### 数据未显示在仪表板

1. 检查数据库文件是否存在
2. 检查 API 端点是否正常
3. 查看浏览器控制台错误
4. 检查时间范围选择

### 离线队列未发送

1. 检查网络连接
2. 检查 localStorage 容量
3. 查看控制台错误日志

## 环境变量

```env
# 分析数据库路径（可选，默认: ./data/analytics.db）
ANALYTICS_DB_PATH=./data/analytics.db
```

## 隐私声明示例

建议在应用中添加隐私政策页面，说明：

1. 收集的数据类型
2. 数据使用目的
3. 数据保留期限
4. 用户权利（访问、删除、选择退出）
5. 数据安全措施

## 最佳实践

1. **尊重用户隐私**: 始终提供清晰的同意选项
2. **匿名化数据**: 不要收集个人身份信息
3. **定期清理**: 定期删除旧数据
4. **安全存储**: 确保数据库文件安全
5. **性能监控**: 监控追踪系统对应用性能的影响
6. **文档维护**: 保持事件类型和数据结构文档更新

## 未来改进

1. **实时分析**: WebSocket 实时数据推送
2. **高级可视化**: 添加图表库（Chart.js、ECharts）
3. **漏斗分析**: 学习路径转化分析
4. **A/B 测试**: 集成 A/B 测试功能
5. **导出功能**: 支持导出统计报告
6. **告警系统**: 异常数据自动告警
