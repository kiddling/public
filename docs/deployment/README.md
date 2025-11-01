# 部署文档总览 (Deployment Documentation Overview)

本目录包含了在中国大陆云服务商（阿里云、腾讯云等）部署 Nuxt + Strapi 项目的完整文档。

## 📋 文档列表

### 1. [中国云部署指南](./china-cloud.md)
**China Cloud Deployment Guide**

涵盖内容：
- ☁️ 服务器规格建议（开发/生产环境）
- 🔒 安全组配置（入站/出站规则）
- 📝 ICP 备案完整流程
- 🌐 网络和 CDN 考虑
- 🏗️ 部署架构示例
- ✅ 部署检查清单

**适用场景**：项目初始化、服务器采购、ICP 备案

---

### 2. [Nginx 配置指南](./nginx-config.md)
**Nginx Configuration Guide**

涵盖内容：
- 🔄 反向代理配置（Nuxt + Strapi）
- 🔐 HTTPS 配置和 SSL 证书
- 🗜️ Gzip 和 Brotli 压缩
- 💾 缓存策略和规则
- 📊 性能优化建议
- 🔧 故障排查方法

**适用场景**：服务器配置、性能优化、HTTPS 配置

---

### 3. [CDN 策略](./cdn-strategy.md)
**CDN Strategy**

涵盖内容：
- 🚀 国内主流 CDN 服务商对比（阿里云、腾讯云、七牛云、又拍云）
- 🏗️ CDN 架构设计
- ⚙️ CDN 配置步骤（阿里云/腾讯云详细教程）
- 📦 对象存储 + CDN 配置（OSS/COS）
- 🔄 CDN 刷新和预热
- 💰 成本优化建议

**适用场景**：静态资源加速、性能优化、降低带宽成本

---

### 4. [监控和日志](./monitoring-logging.md)
**Monitoring & Logging Guide**

涵盖内容：
- ❤️ 健康检查端点配置
- 📈 服务可用性监控（UptimeRobot、阿里云监控、腾讯云监控、监控宝）
- 🔍 PM2 进程监控
- 📝 日志收集和分析（Grafana Loki、ELK Stack、阿里云 SLS、腾讯云 CLS）
- 🚨 告警配置（邮件、钉钉、企业微信）
- 📊 性能监控（Sentry、APM）

**适用场景**：生产环境监控、日志分析、故障排查

---

### 5. [ICP 合规检查清单](./icp-compliance-checklist.md)
**ICP Compliance Checklist**

涵盖内容：
- 📋 ICP 备案基础要求和材料
- 🌐 网站内容合规检查
- 🚓 公安备案流程
- 📜 特殊业务许可要求（新闻、医疗、教育、视频等）
- 🔒 数据安全和隐私保护（PIPL、等保）
- 🔄 变更管理和应急响应

**适用场景**：ICP 备案、合规审查、内容管理

---

### 6. [备份策略](./backup-strategy.md)
**Backup Strategy Guide**

涵盖内容：
- 💾 PostgreSQL 数据库备份（pg_dump、云数据库自动备份）
- 📁 Strapi 上传文件备份（本地存储、对象存储）
- 🔄 备份脚本和定时任务
- ✅ 备份验证和恢复测试
- 🆘 灾难恢复计划（RTO/RPO）
- 📊 备份监控

**适用场景**：数据备份、灾难恢复、数据迁移

---

## 🚀 快速开始

### 第一次部署？请按以下顺序阅读：

1. **[中国云部署指南](./china-cloud.md)** - 了解整体架构和服务器要求
2. **[ICP 合规检查清单](./icp-compliance-checklist.md)** - 准备 ICP 备案材料（提前开始，避免延误）
3. **[Nginx 配置指南](./nginx-config.md)** - 配置反向代理和 HTTPS
4. **[CDN 策略](./cdn-strategy.md)** - 配置 CDN 加速（可选但推荐）
5. **[监控和日志](./monitoring-logging.md)** - 设置监控和日志系统
6. **[备份策略](./backup-strategy.md)** - 实施备份计划

### 已有部署？根据需求查阅：

- 🐛 **性能问题** → [Nginx 配置指南](./nginx-config.md) + [CDN 策略](./cdn-strategy.md)
- 🔍 **监控告警** → [监控和日志](./monitoring-logging.md)
- 📝 **ICP 备案变更** → [ICP 合规检查清单](./icp-compliance-checklist.md)
- 💾 **数据备份恢复** → [备份策略](./backup-strategy.md)
- ☁️ **服务器扩容** → [中国云部署指南](./china-cloud.md)

---

## 🛠️ PM2 进程管理

本项目在根目录提供了 **[pm2.config.cjs](../../pm2.config.cjs)** 配置文件，用于管理 Nuxt 和 Strapi 进程。

### 基本命令

```bash
# 构建应用
pnpm build

# 生产环境启动
pm2 start pm2.config.cjs --env prod

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart pm2.config.cjs

# 停止应用
pm2 stop pm2.config.cjs

# 监控面板
pm2 monit

# 仅启动前端（测试配置）
pm2 start pm2.config.cjs --only=nuxt-frontend --env prod
```

### 支持的环境

- `--env dev`: 开发环境
- `--env staging`: 预发布环境
- `--env prod`: 生产环境

详细说明请参考 [PM2 配置文件](../../pm2.config.cjs)。

---

## ❤️ 健康检查端点

应用提供了健康检查端点，用于监控服务状态。

### Nuxt 前端

```bash
# 基础健康检查
GET /api/health

# 完整健康检查（包含 CMS 连接测试）
GET /api/health?full=true
```

**响应示例**：
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

### Strapi CMS

```bash
# 健康检查（包含数据库和存储状态）
GET /cms/health
```

**响应示例**：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "strapi-cms",
  "version": "5.29.0",
  "uptime": 123456,
  "environment": "production",
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

### 集成监控服务

这些端点可用于：
- **UptimeRobot** 或国内监控服务（监控宝、阿里云监控、腾讯云监控）
- **负载均衡器**健康检查（ALB/SLB、CLB）
- **自动化部署**流程验证
- **Kubernetes** liveness/readiness probes

详细配置请参考 [监控和日志](./monitoring-logging.md)。

---

## 📊 部署架构图

### 生产环境推荐架构

```
                    ┌─────────────┐
                    │   用户访问   │
                    └──────┬──────┘
                           │
                    ┌──────▼───────┐
                    │  CDN (阿里云)  │
                    │  全国加速节点  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ 负载均衡 SLB  │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐       ┌─────▼────┐       ┌────▼───┐
    │ Nginx  │       │  Nginx   │       │ Nginx  │
    │ Server │       │  Server  │       │ Server │
    └───┬────┘       └─────┬────┘       └────┬───┘
        │                  │                  │
    ┌───▼────┐       ┌─────▼────┐       ┌────▼───┐
    │  Nuxt  │       │  Nuxt    │       │  Nuxt  │
    │  (PM2) │       │  (PM2)   │       │  (PM2) │
    └───┬────┘       └─────┬────┘       └────┬───┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │   Strapi CMS │
                    │     (PM2)    │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐       ┌─────▼────┐       ┌────▼───┐
    │ PostgreSQL │   │  Redis   │       │  OSS   │
    │  (RDS)     │   │  (缓存)   │       │ (对象存储)│
    └────────────┘   └──────────┘       └────────┘
```

---

## 🔗 相关资源

### 云服务商文档
- [阿里云官方文档](https://help.aliyun.com/)
- [腾讯云官方文档](https://cloud.tencent.com/document)

### 政府备案平台
- [工信部 ICP 备案管理系统](https://beian.miit.gov.cn/)
- [全国公安机关互联网站安全管理服务平台](http://www.beian.gov.cn/)

### 技术文档
- [Nuxt 3 部署文档](https://nuxt.com/docs/getting-started/deployment)
- [Strapi 部署文档](https://docs.strapi.io/dev-docs/deployment)
- [PM2 官方文档](https://pm2.keymetrics.io/docs/)
- [Nginx 官方文档](https://nginx.org/en/docs/)

---

## 💡 最佳实践

### 安全
- ✅ 始终使用 HTTPS
- ✅ 配置严格的安全组规则
- ✅ 定期更新系统和依赖
- ✅ 使用环境变量管理敏感信息
- ✅ 启用数据库访问控制

### 性能
- ✅ 使用 CDN 加速静态资源
- ✅ 启用 Gzip/Brotli 压缩
- ✅ 配置合理的缓存策略
- ✅ 使用 PM2 cluster 模式
- ✅ 数据库连接池优化

### 可靠性
- ✅ 实施自动备份策略
- ✅ 配置监控和告警
- ✅ 使用负载均衡器
- ✅ 数据库主从复制
- ✅ 定期进行灾难恢复演练

### 合规
- ✅ 完成 ICP 备案
- ✅ 完成公安备案
- ✅ 遵守个人信息保护法
- ✅ 实施数据安全等级保护
- ✅ 定期内容合规审查

---

## 🤝 贡献

如果您在部署过程中发现文档问题或有改进建议，欢迎提交 Issue 或 Pull Request。

---

## 📄 许可

本文档基于项目许可证发布。
