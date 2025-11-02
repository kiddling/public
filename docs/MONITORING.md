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

#### 运行 Lighthouse

```bash
# 构建应用
pnpm build:frontend

# 运行 Lighthouse CI
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

#### Frontend 配置

```typescript
// apps/frontend/plugins/sentry.client.ts
import * as Sentry from '@sentry/nuxt';

export default defineNuxtPlugin(() => {
  Sentry.init({
    dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
});
```

#### CMS 配置

```javascript
// apps/cms/config/plugins.js
module.exports = {
  sentry: {
    enabled: true,
    config: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
    },
  },
};
```

## 🛠️ 运维工具

### 1. PM2 进程管理

#### PM2 配置

项目提供了 PM2 生态系统配置文件 `config/pm2/ecosystem.config.cjs`，用于管理 Nuxt 前端和 Strapi CMS 进程。

#### 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 或者使用项目本地 PM2
pnpm add -g pm2
```

#### 启动应用

```bash
# 启动所有服务
pm2 start config/pm2/ecosystem.config.cjs

# 仅启动前端
pm2 start config/pm2/ecosystem.config.cjs --only frontend

# 仅启动 CMS
pm2 start config/pm2/ecosystem.config.cjs --only cms

# 使用生产环境配置
pm2 start config/pm2/ecosystem.config.cjs --env production
```

#### 管理进程

```bash
# 查看进程列表
pm2 list

# 查看进程详情
pm2 show frontend
pm2 show cms

# 重启服务
pm2 restart frontend
pm2 restart cms

# 重新加载服务（零停机）
pm2 reload config/pm2/ecosystem.config.cjs

# 停止服务
pm2 stop frontend
pm2 stop cms

# 删除进程
pm2 delete frontend
pm2 delete cms

# 停止所有进程
pm2 stop all
```

#### 查看日志

```bash
# 查看所有日志
pm2 logs

# 查看特定服务日志
pm2 logs frontend
pm2 logs cms

# 清空日志
pm2 flush

# 查看实时监控
pm2 monit
```

#### 日志管理

```bash
# 设置日志轮转（每天轮转，保留 30 天）
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
```

#### 开机自启动

```bash
# 保存当前进程列表
pm2 save

# 生成启动脚本
pm2 startup

# 执行显示的命令（需要 root 权限）
# 例如: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy

# 禁用自启动
pm2 unstartup
```

#### PM2 监控

```bash
# 启用 PM2 Plus 监控（可选）
pm2 plus

# 或使用本地监控面板
pm2 web
```

### 2. 备份和恢复

#### 备份脚本

项目提供了自动化备份脚本 `scripts/ops/backup.sh`，支持：
- PostgreSQL 数据库备份（使用 `pg_dump`）
- Strapi 上传文件备份（tar 压缩）
- 自动清理过期备份
- 灵活的保留策略

#### 运行备份

```bash
# 基础备份（使用默认配置）
./scripts/ops/backup.sh

# 自定义保留期（保留 30 天）
./scripts/ops/backup.sh --retention 30

# 自定义备份目录
./scripts/ops/backup.sh --backup-dir /var/backups/strapi

# 查看帮助
./scripts/ops/backup.sh --help
```

#### 环境变量配置

在 `.env` 文件中配置数据库连接信息：

```bash
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_password

# 备份配置
UPLOADS_DIR=./apps/cms/public/uploads
BACKUP_DIR=./backups
RETENTION_DAYS=7
```

#### 定时备份（使用 cron）

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点执行备份
0 2 * * * cd /path/to/project && ./scripts/ops/backup.sh --retention 30 >> /var/log/backup.log 2>&1

# 每周一凌晨 3 点执行备份（保留 90 天）
0 3 * * 1 cd /path/to/project && ./scripts/ops/backup.sh --retention 90 --backup-dir /var/backups/weekly

# 每月 1 号凌晨 4 点执行备份（保留 365 天）
0 4 1 * * cd /path/to/project && ./scripts/ops/backup.sh --retention 365 --backup-dir /var/backups/monthly
```

#### 恢复数据

使用 `scripts/ops/restore.sh` 恢复备份：

```bash
# 列出可用备份
./scripts/ops/restore.sh --list

# 恢复数据库
./scripts/ops/restore.sh --postgres ./backups/postgres_strapi_20240101_120000.sql.gz

# 恢复上传文件
./scripts/ops/restore.sh --uploads ./backups/uploads_20240101_120000.tar.gz

# 同时恢复数据库和文件
./scripts/ops/restore.sh \
  --postgres ./backups/postgres_strapi_20240101_120000.sql.gz \
  --uploads ./backups/uploads_20240101_120000.tar.gz
```

⚠️ **注意**: 恢复操作会覆盖现有数据，请谨慎操作！

### 3. 健康检查

#### 健康检查脚本

项目提供了健康检查脚本 `scripts/ops/healthcheck.sh`，用于监控服务可用性。

#### 运行健康检查

```bash
# 检查默认端点
./scripts/ops/healthcheck.sh

# 检查自定义端点
./scripts/ops/healthcheck.sh \
  --frontend http://example.com \
  --cms http://cms.example.com

# 静默模式（仅返回退出码）
./scripts/ops/healthcheck.sh --silent

# 详细输出
./scripts/ops/healthcheck.sh --verbose

# 设置超时时间（秒）
./scripts/ops/healthcheck.sh --timeout 30
```

#### 退出码说明

- `0`: 所有健康检查通过
- `1`: 前端健康检查失败
- `2`: CMS 健康检查失败
- `3`: 所有健康检查失败

#### 定时健康检查（cron）

```bash
# 每 5 分钟检查一次
*/5 * * * * /path/to/scripts/ops/healthcheck.sh --silent || /path/to/alert.sh

# 每小时检查并记录日志
0 * * * * /path/to/scripts/ops/healthcheck.sh >> /var/log/healthcheck.log 2>&1
```

#### Webhook 告警

支持通过 webhook 发送告警通知：

```bash
# 使用 webhook 告警
./scripts/ops/healthcheck.sh --webhook https://hooks.example.com/alert

# 或通过环境变量配置
export WEBHOOK_URL=https://hooks.example.com/alert
./scripts/ops/healthcheck.sh
```

#### 集成阿里云 CloudMonitor

```bash
# 创建自定义监控脚本
#!/bin/bash
/path/to/scripts/ops/healthcheck.sh --silent
EXIT_CODE=$?

# 上报到阿里云 CloudMonitor
aliyun cms PutCustomMetric \
  --MetricName health_check \
  --Namespace custom \
  --Dimensions "{'service':'frontend','environment':'production'}" \
  --Value $EXIT_CODE
```

#### 集成腾讯云 CODING

在 CODING 持续集成中配置定时任务：

```yaml
# .coding-ci.yml
name: health-check
on:
  schedule:
    - cron: "*/5 * * * *"  # 每 5 分钟执行

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: Health Check
        run: |
          ./scripts/ops/healthcheck.sh \
            --frontend https://your-domain.com \
            --cms https://cms.your-domain.com \
            --webhook ${{ secrets.WEBHOOK_URL }}
```

### 4. Docker 日志管理

#### 日志驱动配置

在 `docker-compose.yml` 中配置日志选项：

```yaml
services:
  frontend:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"     # 单个日志文件最大 10MB
        max-file: "3"       # 保留最近 3 个日志文件
        compress: "true"    # 压缩轮转的日志
        labels: "service=frontend"
        tag: "{{.Name}}/{{.ID}}"
  
  cms:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        compress: "true"
        labels: "service=cms"
        tag: "{{.Name}}/{{.ID}}"
```

#### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 实时跟踪日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs cms

# 查看最近 100 行日志
docker-compose logs --tail=100

# 查看特定时间范围的日志
docker-compose logs --since 2024-01-01T00:00:00
docker-compose logs --until 2024-01-02T00:00:00

# 带时间戳的日志
docker-compose logs -t
```

#### 日志聚合（可选）

使用 Loki + Promtail + Grafana 进行日志聚合：

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ... 现有服务

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
      - ./config/loki:/etc/loki
    command: -config.file=/etc/loki/config.yml

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./config/promtail:/etc/promtail
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki

volumes:
  loki_data:
```

### 5. 数据库管理

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
