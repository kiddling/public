# 监控和运维指南 (Monitoring and Operations Guide)

本文档提供应用监控、日志管理和运维最佳实践。

## 📊 监控体系

### 1. Web Vitals 性能监控

#### 指标说明

- **LCP (Largest Contentful Paint)**: 最大内容绘制时间
  - 良好: < 2.5s
  - 需要改进: 2.5s - 4.0s
  - 差: > 4.0s

- **FID (First Input Delay)**: 首次输入延迟
  - 良好: < 100ms
  - 需要改进: 100ms - 300ms
  - 差: > 300ms

- **CLS (Cumulative Layout Shift)**: 累积布局偏移
  - 良好: < 0.1
  - 需要改进: 0.1 - 0.25
  - 差: > 0.25

- **FCP (First Contentful Paint)**: 首次内容绘制
  - 良好: < 1.8s
  - 需要改进: 1.8s - 3.0s
  - 差: > 3.0s

- **TTFB (Time to First Byte)**: 首字节时间
  - 良好: < 0.8s
  - 需要改进: 0.8s - 1.8s
  - 差: > 1.8s

- **INP (Interaction to Next Paint)**: 交互到下次绘制
  - 良好: < 200ms
  - 需要改进: 200ms - 500ms
  - 差: > 500ms

#### 监控实现

Web Vitals 已集成到 `apps/frontend/plugins/web-vitals.client.ts`。

在浏览器控制台查看实时指标:

```javascript
// 开发模式下自动打印
[Web Vitals] LCP 1234 good
[Web Vitals] FID 45 good
[Web Vitals] CLS 0.05 good
```

### 2. Lighthouse CI

#### 配置文件

`lighthouserc.js` 配置了 Lighthouse CI:

- 性能得分 ≥ 90%
- 可访问性得分 ≥ 90%
- 最佳实践得分 ≥ 90%
- SEO 得分 ≥ 90%

#### 审计页面

Lighthouse CI 现在审计以下关键页面（桌面和移动端）：

- 首页 (`/`)
- 课程详情页 (`/lessons/1`)
- 资源中心 (`/resources`)
- 学生仪表盘 (`/students`)
- 设计日志 (`/design-log`)

#### 运行 Lighthouse

```bash
# 构建应用
pnpm build:frontend

# 运行 Lighthouse CI（桌面和移动端）
npm install -g @lhci/cli
lhci autorun

# 查看报告
open .lighthouseci/lhr-*.html
```

#### CI 集成

GitHub Actions 自动运行 Lighthouse CI:
- 每次 PR 自动检查
- 性能回归检测
- 生成详细报告
- 桌面和移动端性能评估

#### 解读 Lighthouse 预算

Lighthouse CI 设置了以下性能预算：

**桌面端目标**:
- First Contentful Paint (FCP): < 2000ms
- Largest Contentful Paint (LCP): < 2500ms
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 300ms
- Speed Index: < 3000ms
- Time to Interactive (TTI): < 3500ms

**移动端调整**:
- 移动端使用 4G 网络模拟（RTT: 150ms, 吞吐量: 1.6Mbps）
- CPU 减速 4x 倍
- 较宽松的性能预算（+30%）

**查看 CI 报告**:
1. 在 GitHub Actions 中找到 "Lighthouse CI" 作业
2. 下载 "lighthouse-results" 构件
3. 解压并在浏览器中打开 HTML 报告
4. 检查性能回归和优化建议

#### WebPageTest 集成

对于中国地区性能测试，参见 [WebPageTest 文档](./performance/WEBPAGETEST.md)。

WebPageTest 提供：
- 真实中国节点测试
- 跨境网络延迟评估
- CDN 性能验证
- 详细瀑布图分析

### 3. 健康检查端点

#### Frontend Health Check

```bash
curl http://localhost:3000/api/health
```

响应示例:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

#### Strapi Health Check

创建 `apps/cms/src/api/health/routes/health.js`:

```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/_health',
      handler: 'health.check',
      config: {
        auth: false,
      },
    },
  ],
};
```

创建 `apps/cms/src/api/health/controllers/health.js`:

```javascript
module.exports = {
  async check(ctx) {
    ctx.body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  },
};
```

### 4. Docker 健康检查

Docker Compose 配置包含健康检查:

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

查看健康状态:

```bash
docker-compose ps
```

## 📝 日志管理

### 1. 应用日志

#### Frontend (Nuxt)

开发环境:

```typescript
// 使用 console
console.log('Info message');
console.error('Error message');

// 使用 Nuxt logger
const logger = useLogger();
logger.info('Info message');
logger.error('Error message');
```

生产环境:

```typescript
// 集成 Winston 或 Pino
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

#### CMS (Strapi)

Strapi 内置日志配置在 `apps/cms/config/logger.ts`:

```typescript
export default {
  transports: [
    {
      type: 'file',
      options: {
        filename: 'logs/strapi.log',
        level: 'info',
      },
    },
  ],
};
```

### 2. Docker 日志

#### 查看日志

```bash
# 所有服务
docker-compose logs

# 实时日志
docker-compose logs -f

# 特定服务
docker-compose logs frontend
docker-compose logs cms

# 最近 100 行
docker-compose logs --tail=100

# 带时间戳
docker-compose logs -t
```

#### 日志驱动配置

在 `docker-compose.yml` 中配置:

```yaml
services:
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. Nginx 日志

访问日志:

```bash
tail -f /var/log/nginx/access.log
```

错误日志:

```bash
tail -f /var/log/nginx/error.log
```

自定义日志格式:

```nginx
log_format custom '$remote_addr - $remote_user [$time_local] '
                  '"$request" $status $body_bytes_sent '
                  '"$http_referer" "$http_user_agent" '
                  '$request_time';

access_log /var/log/nginx/access.log custom;
```

### 4. 日志聚合

#### ELK Stack (Elasticsearch + Logstash + Kibana)

添加到 `docker-compose.yml`:

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
  ports:
    - "9200:9200"

kibana:
  image: docker.elastic.co/kibana/kibana:8.11.0
  ports:
    - "5601:5601"
  depends_on:
    - elasticsearch

logstash:
  image: docker.elastic.co/logstash/logstash:8.11.0
  volumes:
    - ./config/logstash:/usr/share/logstash/pipeline
  depends_on:
    - elasticsearch
```

## 📈 性能监控

### 1. Prometheus + Grafana

#### Prometheus 配置

创建 `config/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'

  - job_name: 'cms'
    static_configs:
      - targets: ['cms:1337']
    metrics_path: '/_metrics'
```

#### 添加到 Docker Compose

```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./config/prometheus:/etc/prometheus
    - prometheus_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  volumes:
    - grafana_data:/var/lib/grafana
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 2. 自定义指标

#### Frontend 指标

```typescript
// apps/frontend/server/api/metrics.get.ts
import { register, Counter, Histogram } from 'prom-client';

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
});

export default defineEventHandler(() => {
  return register.metrics();
});
```

## 🔔 告警配置

### 1. Prometheus Alertmanager

创建 `config/prometheus/alerts.yml`:

```yaml
groups:
  - name: application
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"

      - alert: HighResponseTime
        expr: http_request_duration_seconds > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"

      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
```

### 2. 邮件告警

配置 `config/prometheus/alertmanager.yml`:

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@yourdomain.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-app-password'

route:
  receiver: 'email-notifications'
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h

receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'team@yourdomain.com'
        send_resolved: true
```

## 🔍 错误追踪

### Sentry 集成

#### 安装

```bash
pnpm add --filter frontend @sentry/nuxt
pnpm add --filter cms @sentry/node
```

#### 配置模板

参考配置模板: `config/monitoring/sentry.example.json`

该模板包含：
- Frontend 和 CMS DSN 配置
- 环境和发布版本设置
- 采样率配置
- 错误过滤规则
- 告警阈值设置

#### Frontend 配置

```typescript
// apps/frontend/plugins/sentry.client.ts
import * as Sentry from '@sentry/nuxt';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  
  Sentry.init({
    dsn: config.public.sentryDsn,
    environment: config.public.environment || 'production',
    release: `frontend@${config.public.version || '1.0.0'}`,
    
    // Performance Monitoring
    tracesSampleRate: 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network Error',
    ],
    
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
});
```

#### CMS 配置

```javascript
// apps/cms/config/plugins.js
module.exports = {
  sentry: {
    enabled: process.env.NODE_ENV === 'production',
    config: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: `cms@${process.env.npm_package_version || '1.0.0'}`,
      tracesSampleRate: 0.5,
      
      // Enhanced error context
      attachStacktrace: true,
      normalizeDepth: 6,
      maxBreadcrumbs: 50,
      
      // Filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request) {
          delete event.request.headers?.authorization;
          delete event.request.headers?.cookie;
        }
        return event;
      },
    },
  },
};
```

#### 启用步骤

1. **获取 Sentry DSN**:
   - 在 [sentry.io](https://sentry.io) 创建项目
   - 复制 DSN（Data Source Name）

2. **设置环境变量**:
   ```bash
   # Frontend
   NUXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
   
   # CMS
   SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
   ```

3. **配置告警规则**:
   - 访问 Sentry 项目设置
   - 配置告警条件（错误率、性能阈值）
   - 设置通知渠道（邮件、Slack）

4. **验证集成**:
   ```bash
   # 手动触发测试错误
   curl https://your-domain.com/api/test-error
   
   # 检查 Sentry 控制台是否收到错误
   ```

### Uptime 监控

#### Uptime Robot 配置

参考配置模板: `config/monitoring/uptime-robot.example.json`

该模板包含：
- 前端和 API 健康检查
- 数据库连接监控
- 告警联系人配置
- 状态页面设置

#### 监控端点

应配置以下端点进行监控：

1. **Frontend 健康检查**: `https://your-domain.com/api/health`
2. **CMS 健康检查**: `https://api.your-domain.com/_health`
3. **CMS 管理面板**: `https://api.your-domain.com/admin`
4. **数据库连接**: 通过健康检查端点验证

#### 启用步骤

1. **注册 Uptime Robot**:
   - 访问 [uptimerobot.com](https://uptimerobot.com)
   - 创建免费账号（最多 50 个监控器）

2. **添加监控**:
   - 使用配置模板中的设置
   - 设置检查间隔（推荐 5 分钟）
   - 配置告警阈值（连续失败 2 次）

3. **设置告警**:
   - 添加邮件联系人
   - 集成 Slack webhook
   - 配置短信通知（可选）

4. **创建状态页**:
   - 创建公开状态页面
   - 自定义域名: `status.your-domain.com`
   - 选择要显示的监控器

### APM (Application Performance Monitoring)

#### 选项 1: Sentry Performance

已包含在 Sentry 集成中：
- 自动事务追踪
- 慢查询检测
- API 端点性能
- 前端性能监控

配置采样率:
```javascript
tracesSampleRate: 1.0  // 生产环境建议 0.1-0.3
```

#### 选项 2: New Relic

```bash
# 安装
pnpm add newrelic

# 配置 newrelic.js
cp node_modules/newrelic/newrelic.js .
```

#### 选项 3: Datadog

```bash
# 安装 Datadog Agent
DD_API_KEY=<YOUR_KEY> bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

### 日志聚合 (Log Aggregation)

#### Fluent Bit 配置

参考配置: `config/monitoring/fluent-bit.conf`

Fluent Bit 收集以下日志：
- Docker 容器日志
- Frontend (Nuxt) 应用日志
- CMS (Strapi) 应用日志
- Nginx 访问和错误日志

#### 在 Docker Compose 中启用

添加到 `docker-compose.yml`:

```yaml
fluent-bit:
  image: fluent/fluent-bit:latest
  container_name: fluent-bit
  volumes:
    - ./config/monitoring/fluent-bit.conf:/fluent-bit/etc/fluent-bit.conf
    - /var/log:/var/log:ro
    - /var/lib/docker/containers:/var/lib/docker/containers:ro
  ports:
    - "2020:2020"  # HTTP monitoring
    - "24224:24224"  # Forward protocol
  networks:
    - app-network
  depends_on:
    - frontend
    - cms
```

#### 日志输出选项

Fluent Bit 可以将日志转发到：

1. **Elasticsearch + Kibana** (推荐):
   ```bash
   # 在 fluent-bit.conf 中取消注释 Elasticsearch 输出
   # 启动 ELK 栈
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

2. **Grafana Loki**:
   - 轻量级日志聚合
   - 与 Grafana 完美集成
   - 低资源消耗

3. **CloudWatch Logs** (AWS):
   - 适合 AWS 部署
   - 与其他 AWS 服务集成

4. **本地文件**:
   - 临时开发使用
   - 位置: `/var/log/fluentbit/`

#### 查看聚合日志

使用 Kibana:
```
http://localhost:5601
```

使用 Grafana Loki:
```
http://localhost:3001
```

#### 日志查询示例

```
# 查询错误日志
level: error

# 查询特定服务
service: frontend

# 查询特定时间范围
@timestamp: [now-1h TO now]

# 组合查询
level: error AND service: cms AND @timestamp: [now-24h TO now]
```

## 🛠️ 运维工具

### 1. 数据库管理

#### PgAdmin (PostgreSQL)

```yaml
# docker-compose.yml
pgadmin:
  image: dpage/pgadmin4:latest
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@yourdomain.com
    PGADMIN_DEFAULT_PASSWORD: admin
  ports:
    - "5050:80"
```

### 2. Redis 管理

#### RedisInsight

```yaml
# docker-compose.yml
redis-insight:
  image: redislabs/redisinsight:latest
  ports:
    - "8001:8001"
```

### 3. 容器管理

#### Portainer

```yaml
# docker-compose.yml
portainer:
  image: portainer/portainer-ce:latest
  ports:
    - "9000:9000"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - portainer_data:/data
```

## 📊 仪表板

### Grafana 仪表板

推荐仪表板:

1. **Node.js Application Dashboard** (ID: 11159)
2. **Docker Container & Host Metrics** (ID: 10619)
3. **Nginx Dashboard** (ID: 12708)

导入仪表板:

1. 访问 Grafana: `http://localhost:3001`
2. 配置 → Dashboards → Import
3. 输入仪表板 ID

### 自定义仪表板

创建自定义面板监控:
- 请求速率
- 响应时间
- 错误率
- 资源使用
- 业务指标

## 🔐 安全监控

### 1. 安全审计

```bash
# npm 审计
pnpm audit

# 修复漏洞
pnpm audit --fix
```

### 2. 漏洞扫描

GitHub Actions 自动运行:
- npm audit
- Snyk 扫描
- CodeQL 分析

### 3. 访问日志分析

使用 fail2ban 防止暴力攻击:

```bash
# 安装 fail2ban
sudo apt-get install fail2ban

# 配置 Nginx jail
sudo vim /etc/fail2ban/jail.local
```

## 📱 移动监控

### 移动端应用

推荐工具:
- Grafana Mobile App
- Prometheus Alertmanager App

### 通知渠道

- 邮件
- Slack
- 钉钉
- 企业微信
- 短信

## 📖 最佳实践

1. **定期检查**: 每日检查监控面板
2. **设置告警**: 关键指标设置合理阈值
3. **日志保留**: 配置合适的日志保留策略
4. **性能基线**: 建立性能基线，跟踪变化
5. **文档更新**: 保持运维文档最新
6. **定期演练**: 定期进行故障演练
7. **自动化**: 尽可能自动化运维任务

## 🔗 相关资源

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [Sentry](https://sentry.io/)

---

最后更新: 2024
