# 部署指南 (Deployment Guide)

本文档提供 Nuxt 3 + Strapi CMS 单体仓库的完整部署指南。

## 📋 目录

- [系统要求](#系统要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [CI/CD 流程](#cicd-流程)
- [监控和日志](#监控和日志)
- [故障排除](#故障排除)
- [备份和恢复](#备份和恢复)

## 系统要求

### 最低配置

- **CPU**: 2 核
- **内存**: 4GB RAM
- **存储**: 20GB SSD
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### 推荐配置

- **CPU**: 4 核以上
- **内存**: 8GB+ RAM
- **存储**: 50GB+ SSD
- **操作系统**: Ubuntu 22.04 LTS

### 软件依赖

- Node.js >= 18.0.0 <= 22.x.x
- pnpm >= 8.0.0
- PostgreSQL >= 14 (生产环境推荐)
- Nginx (可选，用于反向代理)
- Docker & Docker Compose (容器化部署)

## 开发环境部署

### 1. 克隆仓库

```bash
git clone <repository-url>
cd nuxt-strapi-monorepo
```

### 2. 安装依赖

```bash
# 全局安装 pnpm
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 环境配置

#### Frontend (.env)

```bash
cd apps/frontend
cp .env.example .env
```

编辑 `.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:1337
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
NUXT_STRAPI_API_TOKEN=your-api-token
NUXT_STRAPI_URL=http://localhost:1337
```

#### CMS (.env)

```bash
cd apps/cms
cp .env.example .env
```

编辑 `.env` - 参考 `apps/cms/README.md`

### 4. 启动开发服务器

```bash
# 同时启动 Frontend 和 CMS
pnpm dev

# 或分别启动
pnpm dev:frontend  # http://localhost:3000
pnpm dev:cms       # http://localhost:1337
```

## 生产环境部署

### 方式 1: 传统部署 (PM2)

#### 1. 构建应用

```bash
pnpm build
```

#### 2. 安装 PM2

```bash
npm install -g pm2
```

#### 3. 创建 PM2 配置

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'nuxt-frontend',
      cwd: './apps/frontend',
      script: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 2,
      exec_mode: 'cluster',
    },
    {
      name: 'strapi-cms',
      cwd: './apps/cms',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 1337,
      },
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
```

#### 4. 启动应用

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 方式 2: Docker 部署

#### 1. 准备环境变量

```bash
cp .env.docker.example .env.docker
```

编辑 `.env.docker` 填入生产环境配置。

#### 2. 构建并启动容器

```bash
# 构建镜像
docker-compose build

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

#### 3. 健康检查

```bash
# 检查所有容器状态
docker-compose ps

# 检查健康状态
curl http://localhost:3000/api/health
curl http://localhost:1337/_health
```

### 方式 3: Kubernetes 部署

创建 `k8s/` 目录包含以下文件：

```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── postgres-deployment.yaml
├── postgres-service.yaml
├── strapi-deployment.yaml
├── strapi-service.yaml
├── nuxt-deployment.yaml
├── nuxt-service.yaml
└── ingress.yaml
```

应用配置:

```bash
kubectl apply -f k8s/
```

## Docker 部署

### 开发环境

```bash
# 启动开发数据库和 Redis
docker-compose -f docker-compose.dev.yml up -d

# 在本地运行应用
pnpm dev
```

### 生产环境

#### 完整栈部署

```bash
# 拉取最新镜像
docker-compose pull

# 启动所有服务
docker-compose up -d

# 查看运行状态
docker-compose ps
```

#### 仅启动部分服务

```bash
# 仅数据库
docker-compose up -d postgres

# 仅 CMS
docker-compose up -d postgres cms

# 仅 Frontend
docker-compose up -d frontend
```

#### 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f frontend
docker-compose logs -f cms
```

#### 更新服务

```bash
# 重新构建并启动
docker-compose up -d --build

# 仅更新特定服务
docker-compose up -d --build frontend
```

## CI/CD 流程

### GitHub Actions 配置

项目包含以下 CI/CD 工作流:

1. **ci.yml** - 代码质量检查、测试、构建、Lighthouse CI
2. **security.yml** - 安全审计和漏洞扫描

### 配置 Secrets

在 GitHub 仓库设置中添加以下 Secrets:

```
NUXT_PUBLIC_API_BASE_URL
CONTAINER_REGISTRY
REGISTRY_USERNAME
REGISTRY_PASSWORD
LHCI_GITHUB_APP_TOKEN
SNYK_TOKEN
```

### 部署流程

1. **开发分支** (`develop`):
   - 触发 CI 检查
   - 运行测试
   - 构建镜像 (标签: `develop-<sha>`)

2. **主分支** (`main`):
   - 完整 CI/CD 流程
   - 构建生产镜像
   - 自动部署到生产环境

## 监控和日志

### 应用监控

#### Prometheus + Grafana

1. 添加 Prometheus 指标导出:

```bash
# 安装 Prometheus 中间件
pnpm add --filter frontend prom-client
```

2. 创建监控端点:

```typescript
// apps/frontend/server/api/metrics.get.ts
import { register } from 'prom-client';

export default defineEventHandler(() => {
  return register.metrics();
});
```

#### 健康检查端点

- Frontend: `http://localhost:3000/api/health`
- CMS: `http://localhost:1337/_health`

### 日志管理

#### Docker 日志

```bash
# 查看实时日志
docker-compose logs -f

# 导出日志到文件
docker-compose logs > logs.txt

# 查看最近 100 行
docker-compose logs --tail=100
```

#### PM2 日志

```bash
# 查看所有日志
pm2 logs

# 查看特定应用日志
pm2 logs nuxt-frontend
pm2 logs strapi-cms

# 清空日志
pm2 flush
```

### 性能监控

使用 Lighthouse CI 进行持续性能监控:

```bash
# 运行 Lighthouse CI
pnpm build:frontend
lhci autorun
```

### 错误追踪

推荐集成 Sentry:

```bash
# 安装 Sentry
pnpm add --filter frontend @sentry/nuxt
```

## 故障排除

### 常见问题

#### 1. 端口冲突

```bash
# 检查端口占用
lsof -i :3000
lsof -i :1337

# 杀死进程
kill -9 <PID>
```

#### 2. 数据库连接失败

- 检查数据库是否启动
- 验证连接凭据
- 检查防火墙规则

```bash
# 测试 PostgreSQL 连接
psql -h localhost -U strapi -d strapi
```

#### 3. Docker 容器无法启动

```bash
# 检查容器日志
docker logs <container-id>

# 重新构建镜像
docker-compose build --no-cache

# 清理旧容器和镜像
docker system prune -a
```

#### 4. 内存不足

```bash
# 检查内存使用
free -h
docker stats

# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" pnpm start
```

### 调试工具

```bash
# 进入容器调试
docker-compose exec frontend sh
docker-compose exec cms sh

# 查看容器资源使用
docker stats

# 检查网络连接
docker network inspect nuxt-strapi-monorepo_app-network
```

## 备份和恢复

### 数据库备份

#### PostgreSQL

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U strapi strapi > backup.sql

# 或使用 pg_dump 直接
pg_dump -h localhost -U strapi strapi > backup_$(date +%Y%m%d).sql
```

#### 恢复数据库

```bash
# 恢复备份
docker-compose exec -T postgres psql -U strapi strapi < backup.sql

# 或
psql -h localhost -U strapi strapi < backup.sql
```

### 文件备份

```bash
# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz apps/cms/public/uploads/

# 恢复上传文件
tar -xzf uploads_backup.tar.gz -C apps/cms/public/
```

### 自动备份脚本

创建 `scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份数据库
docker-compose exec -T postgres pg_dump -U strapi strapi > $BACKUP_DIR/db_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz apps/cms/public/uploads/

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

设置 cron 任务:

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/scripts/backup.sh
```

## 性能优化

### 1. Nginx 配置

参考 `config/nginx/nginx.conf` 进行优化:
- 启用 gzip 压缩
- 配置静态资源缓存
- 设置速率限制

### 2. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_created_at ON table_name(created_at);

-- 分析查询性能
EXPLAIN ANALYZE SELECT * FROM table_name;
```

### 3. CDN 配置

将静态资源部署到 CDN:
- 上传文件
- 图片资源
- CSS/JS 文件

### 4. 缓存策略

```bash
# 配置 Redis 缓存
docker-compose up -d redis
```

## 安全建议

1. **使用 HTTPS**: 配置 SSL/TLS 证书
2. **定期更新**: 保持依赖项最新
3. **环境变量**: 不要在代码中硬编码敏感信息
4. **防火墙**: 配置适当的防火墙规则
5. **备份**: 定期备份数据库和文件
6. **监控**: 设置告警和日志监控
7. **最小权限**: 使用非 root 用户运行应用

## ICP 备案 (中国大陆)

如果在中国大陆部署，需要完成 ICP 备案:

1. 准备材料：营业执照、身份证、域名证书
2. 在云服务商平台提交备案申请
3. 等待审核（通常 7-20 个工作日）
4. 备案成功后在网站底部添加备案号

```vue
<template>
  <footer>
    <a href="https://beian.miit.gov.cn/" target="_blank">
      ICP备案号：京ICP备12345678号
    </a>
  </footer>
</template>
```

## 支持

遇到问题？

- 查看 [故障排除](#故障排除)
- 提交 [Issue](https://github.com/your-repo/issues)
- 查阅 [文档](./README.md)

---

最后更新: 2024
