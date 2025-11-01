# 监控和日志指南 (Monitoring & Logging Guide)

本文档详细介绍如何为 Nuxt + Strapi 项目配置监控、日志收集和告警系统，确保生产环境的稳定性和可观测性。

## 监控架构概览

```
[应用服务器]
    ↓
[健康检查端点] → [UptimeRobot / 云监控]
    ↓
[PM2 日志] → [日志收集器] → [日志聚合系统 (Loki/ELK)]
    ↓
[Grafana 可视化仪表板]
    ↓
[告警通知] (Email/钉钉/企业微信)
```

## 健康检查端点

### Nuxt 前端健康检查

已在项目中配置：`apps/frontend/server/api/health.get.ts`

响应格式：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "nuxt-frontend",
  "version": "1.0.0",
  "uptime": 123456,
  "environment": "production"
}
```

### Strapi CMS 健康检查

已在项目中配置：`apps/cms/src/api/health/routes/health.ts`

响应格式：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "strapi-cms",
  "version": "5.29.0",
  "database": {
    "status": "connected",
    "responseTime": 5
  },
  "storage": {
    "status": "ok",
    "provider": "ali-oss"
  }
}
```

### 配置健康检查

在 Nginx 中配置健康检查端点（不缓存）：

```nginx
location /api/health {
    proxy_pass http://nuxt_upstream;
    proxy_cache_bypass 1;
    proxy_no_cache 1;
    access_log off;
}

location /cms/health {
    proxy_pass http://strapi_upstream;
    proxy_cache_bypass 1;
    proxy_no_cache 1;
    access_log off;
}
```

## 服务可用性监控

### UptimeRobot (国际)

#### 优势
- 免费计划支持 50 个监控
- 支持 HTTP(S)、Ping、Port、Keyword 监控
- 支持多种告警方式
- 提供公开状态页面

#### 配置步骤

1. 访问 [UptimeRobot](https://uptimerobot.com/) 并注册

2. 添加监控：
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Nuxt Frontend
   URL: https://example.com/api/health
   Monitoring Interval: 5 minutes (免费) / 1 minute (付费)
   ```

3. 配置告警：
   ```
   Alert Contacts: Email, SMS, Webhook
   ```

4. 配置关键词检查：
   ```
   Keyword Type: Keyword Exists
   Keyword Value: "ok"
   ```

### 国内替代方案

#### 1. 阿里云云监控

**优势**：
- 与阿里云深度集成
- 免费额度充足
- 支持自定义监控指标

**配置步骤**：

```bash
# 登录阿里云控制台 -> 云监控 -> 站点监控

创建监控任务:
  - 任务名称: Nuxt Frontend Health
  - 监控地址: https://example.com/api/health
  - 监控频率: 1 分钟
  - 监控点: 选择多个省份/运营商
  - 高级设置:
    * 匹配响应内容: "ok"
    * 状态码: 200

设置报警规则:
  - 可用性 < 100%，持续 3 次，发送告警
  - 平均响应时间 > 3000ms，持续 3 次，发送告警
```

**告警通知**：
- 邮件
- 短信
- 钉钉机器人
- 企业微信

#### 2. 腾讯云云监控

**配置步骤**：

```bash
# 登录腾讯云控制台 -> 云监控 -> 云拨测

新建任务:
  - 任务名称: Nuxt Frontend
  - 拨测地址: https://example.com/api/health
  - 拨测类型: HTTPS
  - 拨测周期: 5 分钟
  - 拨测点: 多个城市

配置告警:
  - 可用率 < 100%
  - 响应时间 > 3000ms
  - 连续 3 次触发
```

#### 3. 监控宝 (jiankongbao.com)

**优势**：
- 国内服务，速度快
- 免费版支持 5 个监控
- 提供 7*24 小时监控

**配置**：
```
监控类型: HTTP
URL: https://example.com/api/health
检测频率: 5 分钟
检测内容: 包含 "ok"
```

## PM2 进程监控

### PM2 内置监控

PM2 提供了基础的进程监控功能：

```bash
# 查看所有进程状态
pm2 status

# 查看详细信息
pm2 show <app-name>

# 查看实时日志
pm2 logs

# 查看实时监控
pm2 monit
```

### PM2 Plus (推荐用于生产)

PM2 Plus 是 PM2 的企业版监控服务。

#### 配置步骤

1. 注册 [PM2 Plus](https://app.pm2.io/)

2. 链接服务器：
   ```bash
   pm2 link <secret-key> <public-key>
   ```

3. 在 `pm2.config.cjs` 中启用监控：
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'nuxt-frontend',
         // ... 其他配置
         env: {
           PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY,
           PM2_SECRET_KEY: process.env.PM2_SECRET_KEY,
         }
       }
     ]
   };
   ```

4. 配置告警规则（在 PM2 Plus 控制台）：
   - CPU 使用率 > 80%
   - 内存使用率 > 90%
   - 进程重启次数 > 10
   - 错误率 > 1%

### 免费替代方案：Prometheus + Grafana

对于预算有限的项目，可以自建监控系统。

#### 安装 Prometheus

```bash
# 下载 Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar -xzf prometheus-2.40.0.linux-amd64.tar.gz
cd prometheus-2.40.0.linux-amd64

# 创建配置文件
cat > prometheus.yml <<EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nuxt-frontend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'

  - job_name: 'strapi-cms'
    static_configs:
      - targets: ['localhost:1337']
    metrics_path: '/cms/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
EOF

# 启动 Prometheus
./prometheus --config.file=prometheus.yml
```

#### 安装 Grafana

```bash
# Ubuntu/Debian
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana

# 启动 Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# 访问 Grafana: http://localhost:3000
# 默认用户名/密码: admin/admin
```

#### 配置 Grafana

1. 添加 Prometheus 数据源：
   ```
   Configuration -> Data Sources -> Add data source
   Type: Prometheus
   URL: http://localhost:9090
   ```

2. 导入仪表板模板：
   - Node Exporter Full (ID: 1860)
   - PM2 Dashboard (自定义)

## 日志收集和分析

### 日志架构选择

#### 方案 A: Grafana Loki (推荐)

**优势**：
- 轻量级，资源占用少
- 与 Grafana 深度集成
- 适合中小型项目

**架构**：
```
[PM2 日志文件] → [Promtail] → [Loki] → [Grafana]
```

**部署步骤**：

1. 安装 Loki：
   ```bash
   wget https://github.com/grafana/loki/releases/download/v2.9.0/loki-linux-amd64.zip
   unzip loki-linux-amd64.zip
   chmod +x loki-linux-amd64
   
   # 创建配置文件
   wget https://raw.githubusercontent.com/grafana/loki/main/cmd/loki/loki-local-config.yaml
   
   # 启动 Loki
   ./loki-linux-amd64 -config.file=loki-local-config.yaml
   ```

2. 安装 Promtail：
   ```bash
   wget https://github.com/grafana/loki/releases/download/v2.9.0/promtail-linux-amd64.zip
   unzip promtail-linux-amd64.zip
   chmod +x promtail-linux-amd64
   
   # 创建配置文件
   cat > promtail-config.yml <<EOF
   server:
     http_listen_port: 9080
     grpc_listen_port: 0
   
   positions:
     filename: /tmp/positions.yaml
   
   clients:
     - url: http://localhost:3100/loki/api/v1/push
   
   scrape_configs:
     - job_name: nuxt-frontend
       static_configs:
         - targets:
             - localhost
           labels:
             job: nuxt-frontend
             __path__: /home/user/.pm2/logs/nuxt-frontend-*.log
     
     - job_name: strapi-cms
       static_configs:
         - targets:
             - localhost
           labels:
             job: strapi-cms
             __path__: /home/user/.pm2/logs/strapi-cms-*.log
   EOF
   
   # 启动 Promtail
   ./promtail-linux-amd64 -config.file=promtail-config.yml
   ```

3. 在 Grafana 中添加 Loki 数据源：
   ```
   URL: http://localhost:3100
   ```

4. 查询日志：
   ```
   {job="nuxt-frontend"} |= "error"
   {job="strapi-cms"} |= "ERROR"
   ```

#### 方案 B: ELK Stack (适合大型项目)

**架构**：
```
[PM2 日志] → [Filebeat] → [Logstash] → [Elasticsearch] → [Kibana]
```

**优势**：
- 功能强大，适合大规模日志
- 丰富的分析和可视化功能

**劣势**：
- 资源占用大（建议 8GB+ 内存）
- 配置复杂

**部署步骤**（简化版）：

1. 安装 Elasticsearch：
   ```bash
   wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.10.0-linux-x86_64.tar.gz
   tar -xzf elasticsearch-8.10.0-linux-x86_64.tar.gz
   cd elasticsearch-8.10.0
   ./bin/elasticsearch
   ```

2. 安装 Kibana：
   ```bash
   wget https://artifacts.elastic.co/downloads/kibana/kibana-8.10.0-linux-x86_64.tar.gz
   tar -xzf kibana-8.10.0-linux-x86_64.tar.gz
   cd kibana-8.10.0
   ./bin/kibana
   ```

3. 安装 Filebeat：
   ```bash
   wget https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.10.0-linux-x86_64.tar.gz
   tar -xzf filebeat-8.10.0-linux-x86_64.tar.gz
   cd filebeat-8.10.0
   
   # 配置 filebeat.yml
   ./filebeat -e -c filebeat.yml
   ```

#### 方案 C: 云服务日志（推荐用于生产）

##### 阿里云日志服务 (SLS)

**优势**：
- 完全托管，无需维护
- 强大的查询和分析能力
- 按量付费，成本可控

**配置步骤**：

1. 登录阿里云控制台 -> 日志服务

2. 创建 Project：
   ```
   Project 名称: my-app-logs
   地域: 华东 1（杭州）
   ```

3. 创建 Logstore：
   ```
   Logstore 名称: app-logs
   数据保存时间: 30 天
   ```

4. 安装 Logtail：
   ```bash
   wget http://logtail-release-cn-hangzhou.oss-cn-hangzhou.aliyuncs.com/linux64/logtail.sh -O logtail.sh
   sudo sh logtail.sh install cn-hangzhou
   ```

5. 配置日志采集：
   ```
   数据源: 文本文件
   日志路径: /home/user/.pm2/logs/
   文件名称: *.log
   日志解析方式: 正则表达式或 JSON
   ```

6. 查询日志：
   ```
   * | where level = 'error'
   * | select count(*) as error_count group by app
   ```

##### 腾讯云日志服务 (CLS)

配置流程类似阿里云 SLS，具体参考 [腾讯云 CLS 文档](https://cloud.tencent.com/document/product/614)。

### PM2 日志管理

#### 日志配置

在 `pm2.config.cjs` 中已配置：

```javascript
{
  error_file: '/var/log/pm2/nuxt-frontend-error.log',
  out_file: '/var/log/pm2/nuxt-frontend-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  merge_logs: true,
}
```

#### 日志轮转

PM2 内置日志轮转功能：

```bash
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

#### 手动日志管理

创建 `logrotate` 配置 `/etc/logrotate.d/pm2`:

```
/var/log/pm2/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
    create 0644 deploy deploy
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 告警配置

### 告警规则示例

#### 1. 服务可用性告警

```yaml
# Prometheus Alert Rules
groups:
  - name: service_availability
    interval: 30s
    rules:
      - alert: ServiceDown
        expr: up{job="nuxt-frontend"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Nuxt frontend is down"
          description: "{{ $labels.instance }} has been down for more than 2 minutes."
```

#### 2. 高错误率告警

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High error rate detected"
    description: "Error rate is {{ $value }} (threshold: 0.05)"
```

#### 3. 高内存使用率告警

```yaml
- alert: HighMemoryUsage
  expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High memory usage"
    description: "Memory usage is {{ $value }}%"
```

### 告警通知渠道

#### 1. 邮件通知

在 Prometheus Alertmanager 中配置：

```yaml
global:
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'password'

route:
  receiver: 'email-notifications'

receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'devops@example.com'
```

#### 2. 钉钉通知

使用钉钉机器人：

```yaml
receivers:
  - name: 'dingtalk-notifications'
    webhook_configs:
      - url: 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN'
```

#### 3. 企业微信通知

```yaml
receivers:
  - name: 'wechat-notifications'
    wechat_configs:
      - corp_id: 'YOUR_CORP_ID'
        agent_id: 'YOUR_AGENT_ID'
        api_secret: 'YOUR_API_SECRET'
        to_party: '1'
```

## 性能监控

### 应用性能监控 (APM)

#### 推荐工具

1. **Sentry** - 错误跟踪和性能监控
2. **New Relic** - 全栈 APM
3. **DataDog** - 全栈监控和日志

#### Sentry 集成（推荐）

安装 Sentry：

```bash
# Nuxt
cd apps/frontend
pnpm install @sentry/nuxt

# Strapi
cd apps/cms
pnpm install @sentry/node
```

配置 Nuxt Sentry：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@sentry/nuxt/module'],
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  },
});
```

配置 Strapi Sentry：

```typescript
// apps/cms/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 监控最佳实践

### 1. 四个黄金信号

- **延迟 (Latency)**: 请求响应时间
- **流量 (Traffic)**: 请求速率
- **错误 (Errors)**: 错误率
- **饱和度 (Saturation)**: CPU/内存/磁盘使用率

### 2. 设置合理的告警阈值

- 避免告警疲劳
- 根据历史数据设置阈值
- 使用百分位数（P95, P99）而非平均值

### 3. 定期检查和优化

- 每周查看监控面板
- 每月审查告警规则
- 季度性能优化

### 4. 监控文档化

- 记录所有监控指标的含义
- 记录告警处理流程
- 维护监控配置的版本控制

## 故障排查流程

1. **接收告警** → 查看告警详情
2. **检查健康端点** → 确认服务状态
3. **查看日志** → 定位具体错误
4. **检查资源使用** → CPU/内存/磁盘
5. **回滚或修复** → 采取恢复措施
6. **事后分析** → 记录问题和解决方案

## 相关文档

- [中国云部署指南](./china-cloud.md)
- [Nginx 配置指南](./nginx-config.md)
- [备份策略](./backup-strategy.md)

## 参考资源

- [Prometheus 官方文档](https://prometheus.io/docs/)
- [Grafana 官方文档](https://grafana.com/docs/)
- [Loki 官方文档](https://grafana.com/docs/loki/)
- [PM2 官方文档](https://pm2.keymetrics.io/docs/)
