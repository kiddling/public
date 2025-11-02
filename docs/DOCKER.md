# Docker 部署指南

本文档详细介绍如何使用 Docker 和 Docker Compose 部署 Nuxt 3 + Strapi CMS 应用。

## 🐳 Docker 架构

项目包含以下 Docker 组件：

1. **Frontend (Nuxt 3)** - Multi-stage build, 健康检查, 非 root 用户
2. **CMS (Strapi)** - 优化镜像大小, 安全配置
3. **PostgreSQL** - 数据库服务
4. **Redis** - 缓存服务 (可选)
5. **Nginx** - 反向代理 (可选)

## 📁 Docker 文件结构

```
.
├── docker-compose.yml              # 生产环境编排
├── docker-compose.dev.yml          # 开发环境编排
├── .env.docker.example             # 环境变量模板
├── apps/
│   ├── frontend/
│   │   ├── Dockerfile              # Nuxt 多阶段构建
│   │   └── .dockerignore
│   └── cms/
│       ├── Dockerfile              # Strapi 优化镜像
│       └── .dockerignore
└── config/
    └── nginx/
        └── nginx.conf              # Nginx 配置
```

## 🚀 快速开始

### 1. 准备环境变量

```bash
cp .env.docker.example .env.docker
```

编辑 `.env.docker` 填入配置：

```env
# 数据库配置
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your_secure_password

# Strapi 密钥 (使用命令生成: openssl rand -base64 32)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

# Nuxt 配置
NUXT_STRAPI_API_TOKEN=your_strapi_api_token
```

### 2. 构建并启动服务

```bash
# 构建镜像
pnpm docker:build

# 启动所有服务
pnpm docker:up

# 查看日志
pnpm docker:logs

# 停止服务
pnpm docker:down
```

### 3. 访问应用

- **Frontend**: http://localhost:3000
- **CMS Admin**: http://localhost:1337/admin
- **Nginx (可选)**: http://localhost:80

## 📦 多阶段构建详解

### Frontend Dockerfile

```dockerfile
# 阶段 1: 依赖安装
FROM node:22-alpine AS deps
# 只安装生产依赖

# 阶段 2: 构建
FROM node:22-alpine AS builder
# 安装所有依赖并构建应用

# 阶段 3: 运行
FROM node:22-alpine AS runner
# 只复制必要的文件，使用非 root 用户
```

**优势:**

- 大幅减小最终镜像大小
- 提高安全性（非 root 用户）
- 构建缓存优化

### CMS Dockerfile

类似的多阶段构建策略：

- 生产依赖与开发依赖分离
- 最小化最终镜像
- 健康检查集成

## 🔍 健康检查

### Frontend 健康检查

```yaml
healthcheck:
  test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:3000/api/health']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

测试健康端点：

```bash
curl http://localhost:3000/api/health
```

响应：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

### CMS 健康检查

```bash
curl http://localhost:1337/_health
```

## 🔧 Docker Compose 配置

### 完整栈 (docker-compose.yml)

包含所有服务：

- PostgreSQL (数据库)
- Strapi CMS
- Nuxt Frontend
- Redis (缓存)
- Nginx (反向代理)

### 开发栈 (docker-compose.dev.yml)

仅包含支持服务：

- PostgreSQL
- Redis

本地运行应用代码，数据库使用 Docker。

## 🎯 使用场景

### 场景 1: 完全容器化开发

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f frontend

# 重启特定服务
docker-compose restart cms
```

### 场景 2: 混合开发

```bash
# 仅启动数据库和 Redis
docker-compose -f docker-compose.dev.yml up -d

# 本地运行应用
pnpm dev
```

### 场景 3: 生产部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build --no-cache

# 滚动更新
docker-compose up -d --force-recreate
```

## 🔐 安全最佳实践

### 1. 非 Root 用户

所有容器都使用非 root 用户运行：

```dockerfile
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

USER nuxtjs
```

### 2. 最小化镜像

使用 Alpine Linux 基础镜像：

- Frontend: ~150MB (相比 ~1GB 的标准镜像)
- CMS: ~180MB

### 3. 环境变量管理

- 使用 `.env.docker` 文件
- 不要提交敏感信息到 Git
- 生产环境使用 secrets 管理工具

### 4. 网络隔离

```yaml
networks:
  app-network:
    driver: bridge
```

服务之间通过专用网络通信。

## 📊 资源限制

在生产环境中添加资源限制：

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 🐛 故障排除

### 容器无法启动

```bash
# 查看容器日志
docker-compose logs <service-name>

# 检查容器状态
docker-compose ps

# 进入容器调试
docker-compose exec frontend sh
```

### 健康检查失败

```bash
# 手动测试健康端点
docker-compose exec frontend wget -O- http://localhost:3000/api/health

# 检查端口
docker-compose exec frontend netstat -tulpn
```

### 数据库连接问题

```bash
# 检查数据库容器
docker-compose exec postgres pg_isready -U strapi

# 测试连接
docker-compose exec cms psql -h postgres -U strapi -d strapi
```

### 镜像构建缓慢

```bash
# 清理构建缓存
docker builder prune

# 无缓存构建
docker-compose build --no-cache

# 使用国内镜像
# 编辑 /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

## 🔄 数据持久化

### 卷管理

```bash
# 查看卷
docker volume ls

# 备份卷
docker run --rm -v nuxt-strapi-monorepo_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# 恢复卷
docker run --rm -v nuxt-strapi-monorepo_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

### 数据库备份

参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 的备份和恢复章节。

## 🚀 CI/CD 集成

GitHub Actions 自动构建和推送镜像：

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./apps/frontend/Dockerfile
    push: true
    tags: ${{ secrets.CONTAINER_REGISTRY }}/frontend:latest
```

## 📈 监控和日志

### 日志聚合

使用日志驱动：

```yaml
logging:
  driver: 'json-file'
  options:
    max-size: '10m'
    max-file: '3'
```

### Prometheus 监控

添加 Prometheus 和 Grafana：

```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - '9090:9090'
  volumes:
    - ./config/prometheus:/etc/prometheus

grafana:
  image: grafana/grafana:latest
  ports:
    - '3001:3000'
```

## 🌍 中国大陆优化

### 使用国内镜像源

1. **Docker Hub 镜像**

编辑 `/etc/docker/daemon.json`:

```json
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn", "https://hub-mirror.c.163.com"]
}
```

2. **Alpine 镜像源**

在 Dockerfile 中：

```dockerfile
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
```

3. **npm 镜像**

```dockerfile
RUN npm config set registry https://registry.npmmirror.com
```

## 🔗 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)

---

最后更新: 2024
