# Docker 部署指南 | Docker Deployment Guide

本文档详细介绍如何使用 Docker 和 Docker Compose 部署 Nuxt 3 + Strapi CMS 应用，包括生产环境配置、健康检查、网络优化和中国大陆特定的部署建议。

This document provides detailed instructions for deploying the Nuxt 3 + Strapi CMS application using Docker and Docker Compose, including production configurations, health checks, networking optimizations, and China-specific deployment guidance.

---

## 📋 目录 | Table of Contents

- [Docker 架构](#-docker-架构)
- [文件结构](#-docker-文件结构)
- [快速开始](#-快速开始)
- [生产环境部署](#-生产环境部署)
- [中国网络优化](#-中国大陆网络优化)
- [健康检查](#-健康检查)
- [资源限制与日志](#-资源限制与日志管理)
- [数据持久化](#-数据持久化与备份)
- [故障排除](#-故障排除)
- [安全最佳实践](#-安全最佳实践)

---

## 🐳 Docker 架构

项目包含以下 Docker 组件 | The project includes the following Docker components:

1. **Frontend (Nuxt 3)** - Multi-stage build, 健康检查, 非 root 用户 | Health checks, non-root user
2. **CMS (Strapi)** - 优化镜像大小, 安全配置 | Optimized image size, secure configuration
3. **PostgreSQL 16** - 数据库服务，带健康检查 | Database service with health checks
4. **Redis 7** - 缓存服务 (可选) | Cache service (optional)
5. **Nginx** - 反向代理，SSL终端 (可选) | Reverse proxy, SSL termination (optional)

### 架构特点 | Architecture Features

- ✅ **多阶段构建** | Multi-stage builds for minimal image size
- ✅ **健康检查** | Comprehensive health checks for all services
- ✅ **资源限制** | CPU and memory limits for stability
- ✅ **日志轮转** | Automatic log rotation with retention
- ✅ **数据持久化** | Persistent volumes for data and uploads
- ✅ **网络隔离** | Isolated bridge network
- ✅ **非 root 用户** | All containers run as non-root users
- ✅ **环境变量管理** | Centralized environment configuration
- ✅ **中国优化** | China network optimization support

## 📁 Docker 文件结构

```
.
├── docker-compose.yml              # 生产环境编排配置 | Production orchestration
├── docker-compose.china.yml        # 中国网络优化覆盖 | China network optimization overlay
├── docker-compose.dev.yml          # 开发环境编排 | Development orchestration
├── .env.docker.example             # 环境变量模板 | Environment variables template
├── .env.production                 # 生产环境变量示例 | Production env example
├── apps/
│   ├── frontend/
│   │   ├── Dockerfile              # Nuxt 多阶段构建 | Multi-stage build
│   │   └── .dockerignore
│   └── cms/
│       ├── Dockerfile              # Strapi 优化镜像 | Optimized image
│       └── .dockerignore
├── config/
│   └── nginx/
│       ├── nginx.conf              # Nginx 主配置 | Main configuration
│       ├── blue.conf               # 蓝绿部署配置 | Blue deployment
│       └── green.conf              # 蓝绿部署配置 | Green deployment
└── data/                           # 数据卷挂载目录 | Volume mount directory
    ├── postgres/                   # 数据库数据 | Database data
    ├── cms_uploads/                # CMS 上传文件 | CMS uploads
    ├── redis/                      # Redis 数据 | Redis data
    └── nginx_logs/                 # Nginx 日志 | Nginx logs
```

## 🚀 快速开始

### 1. 准备环境变量 | Prepare Environment Variables

```bash
# 复制环境变量模板 | Copy environment template
cp .env.docker.example .env.docker

# 编辑配置文件 | Edit configuration file
nano .env.docker  # 或使用你喜欢的编辑器 | or use your preferred editor
```

**必须修改的配置项 | Required Configuration Changes:**

```env
# 数据库配置 | Database Configuration
DATABASE_NAME=strapi_production
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=CHANGE_ME_STRONG_PASSWORD  # ⚠️ 必须修改 | Must change

# Strapi 密钥 | Strapi Security Keys
# ⚠️ 使用命令生成: openssl rand -base64 32
# Generate with: openssl rand -base64 32
APP_KEYS=CHANGE_ME_KEY1,CHANGE_ME_KEY2,CHANGE_ME_KEY3,CHANGE_ME_KEY4
API_TOKEN_SALT=CHANGE_ME_API_TOKEN_SALT
ADMIN_JWT_SECRET=CHANGE_ME_ADMIN_JWT_SECRET
TRANSFER_TOKEN_SALT=CHANGE_ME_TRANSFER_TOKEN_SALT
JWT_SECRET=CHANGE_ME_JWT_SECRET
ENCRYPTION_KEY=CHANGE_ME_ENCRYPTION_KEY

# Nuxt 配置 | Nuxt Configuration
NUXT_STRAPI_API_TOKEN=CHANGE_ME_STRAPI_API_TOKEN
```

**生成安全密钥示例 | Generate Secure Keys Example:**

```bash
# 生成所有需要的密钥 | Generate all required keys
echo "APP_KEY_1=$(openssl rand -base64 32)"
echo "APP_KEY_2=$(openssl rand -base64 32)"
echo "APP_KEY_3=$(openssl rand -base64 32)"
echo "APP_KEY_4=$(openssl rand -base64 32)"
echo "API_TOKEN_SALT=$(openssl rand -base64 32)"
echo "ADMIN_JWT_SECRET=$(openssl rand -base64 32)"
echo "TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo "NUXT_STRAPI_API_TOKEN=$(openssl rand -base64 32)"
```

### 2. 创建数据目录 | Create Data Directories

```bash
# 创建必要的数据目录 | Create necessary data directories
mkdir -p data/{postgres,cms_uploads,redis,nginx_logs}
mkdir -p database/backups

# 设置正确的权限 | Set correct permissions
chmod 755 data
chmod 700 data/postgres
chmod 755 data/cms_uploads
```

### 3. 验证配置 | Validate Configuration

```bash
# 验证 docker-compose 配置 | Validate docker-compose configuration
docker compose config

# 检查配置是否有错误 | Check for configuration errors
# 成功则不会有错误输出 | Success means no error output
```

### 4. 构建并启动服务 | Build and Start Services

```bash
# 构建镜像 | Build images
docker compose build

# 或使用 pnpm 脚本 | Or use pnpm scripts
pnpm docker:build

# 启动所有服务 | Start all services
docker compose up -d

# 或使用 pnpm 脚本 | Or use pnpm scripts
pnpm docker:up

# 查看服务状态 | Check service status
docker compose ps

# 查看日志 | View logs
docker compose logs -f

# 查看特定服务日志 | View specific service logs
docker compose logs -f frontend
docker compose logs -f cms
docker compose logs -f postgres
```

### 5. 验证部署 | Verify Deployment

```bash
# 等待所有服务启动完成 | Wait for all services to start
# 通常需要 1-2 分钟 | Usually takes 1-2 minutes
sleep 120

# 检查健康状态 | Check health status
docker compose ps

# 测试健康检查端点 | Test health check endpoints
curl http://localhost:3000/api/health
curl http://localhost:1337/_health

# 预期响应 | Expected responses:
# Frontend: {"status":"ok","timestamp":"...","uptime":...}
# CMS: {"status":"ok"}
```

### 6. 访问应用 | Access Application

- **Frontend**: http://localhost:3000
- **CMS Admin**: http://localhost:1337/admin
- **CMS API**: http://localhost:1337/api
- **Nginx (可选)**: http://localhost (if nginx service is enabled)

### 7. 停止服务 | Stop Services

```bash
# 停止所有服务 | Stop all services (keeps data)
docker compose stop

# 停止并删除容器 | Stop and remove containers (keeps data)
docker compose down

# 停止并删除容器和数据卷 | Stop and remove containers and volumes (⚠️ deletes data)
docker compose down -v

# 使用 pnpm 脚本 | Using pnpm scripts
pnpm docker:down
```

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

Strapi CMS 使用优化的两阶段构建策略：

#### 阶段 1: Builder（构建器）

```dockerfile
FROM node:20-alpine AS builder
# 安装构建依赖和时区数据
# 使用 npm ci 安装依赖（确保一致性）
# 构建应用
# 清理开发依赖（npm prune --production）
# 清理 npm 缓存以减小镜像大小
```

#### 阶段 2: Runner（运行时）

```dockerfile
FROM node:20-alpine AS runner
# 仅安装运行时依赖和时区数据
# 设置时区为 Asia/Shanghai
# 创建非 root 用户（strapi）
# 复制生产依赖和构建产物
# 创建运行时目录（uploads, logs, .cache）
```

**CMS 镜像优化特性 | CMS Image Optimization Features:**

- ✅ **轻量级基础镜像** | Lightweight base: Node 20 Alpine
- ✅ **时区支持** | Timezone support: Asia/Shanghai
- ✅ **依赖优化** | Dependency optimization: npm ci + prune production
- ✅ **中国镜像源支持** | China mirror support: Build args for faster builds
- ✅ **最小化层数** | Minimized layers: Efficient caching strategy
- ✅ **安全配置** | Security: Non-root strapi user
- ✅ **缓存清理** | Cache cleanup: npm cache clean
- ✅ **目标大小** | Target size: ≤ 450MB

**构建 CMS 镜像 | Build CMS Image:**

```bash
# 标准构建 | Standard build
docker build -t cms:latest apps/cms

# 使用中国镜像源构建（推荐用于中国部署）| Build with China mirrors (recommended for China deployment)
docker build \
  --build-arg USE_CHINA_MIRROR=true \
  --build-arg NODE_MIRROR=https://registry.npmmirror.com \
  --build-arg ALPINE_MIRROR=mirrors.aliyun.com \
  -t cms:latest apps/cms

# 验证镜像大小 | Check image size
docker images cms:latest
```

**镜像大小对比 | Image Size Comparison:**

| 构建方式 Build Method | 镜像大小 Image Size | 备注 Notes |
|---------------------|------------------|-----------|
| 标准 Node 镜像 Standard Node | ~1.2GB | 未优化 Unoptimized |
| Alpine + 单阶段 Alpine + Single-stage | ~600MB | 基础优化 Basic optimization |
| **Alpine + 多阶段 + 优化 Alpine + Multi-stage + Optimized** | **≤450MB** | **推荐 Recommended** |

## 🎛️ Strapi 环境变量配置详解

### 必需的环境变量 | Required Environment Variables

#### 数据库配置 | Database Configuration

```bash
# 数据库类型（postgres/mysql/sqlite）
# Database type (postgres/mysql/sqlite)
DATABASE_CLIENT=postgres

# 数据库主机（在 Docker 网络中使用服务名）
# Database host (use service name in Docker network)
DATABASE_HOST=postgres

# 数据库端口
# Database port
DATABASE_PORT=5432

# 数据库名称
# Database name
DATABASE_NAME=strapi

# 数据库用户名
# Database username
DATABASE_USERNAME=strapi

# 数据库密码（⚠️ 生产环境必须修改）
# Database password (⚠️ must change in production)
DATABASE_PASSWORD=change_me_in_production

# 是否使用 SSL 连接数据库
# Whether to use SSL for database connection
DATABASE_SSL=false
```

#### 安全密钥配置 | Security Keys Configuration

**重要提示 | Important Notes:**
- 🔒 所有密钥必须在生产环境中生成唯一值
- 🔒 All keys must be generated with unique values in production
- 🔒 切勿在代码仓库中提交真实密钥
- 🔒 Never commit real keys to code repository
- 🔒 使用至少 32 字节的强随机密钥
- 🔒 Use strong random keys of at least 32 bytes

```bash
# 应用密钥数组（至少 4 个，用于会话加密）
# Application keys array (at least 4, for session encryption)
# 生成命令 | Generate command: 
# echo "$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
APP_KEYS=key1,key2,key3,key4

# API 令牌加密盐值
# Salt for API token encryption
# 生成命令 | Generate command: openssl rand -base64 32
API_TOKEN_SALT=your_api_token_salt

# 管理员 JWT 密钥
# Admin JWT secret
# 生成命令 | Generate command: openssl rand -base64 32
ADMIN_JWT_SECRET=your_admin_jwt_secret

# 传输令牌加密盐值
# Transfer token salt
# 生成命令 | Generate command: openssl rand -base64 32
TRANSFER_TOKEN_SALT=your_transfer_token_salt

# 用户 JWT 密钥
# User JWT secret
# 生成命令 | Generate command: openssl rand -base64 32
JWT_SECRET=your_jwt_secret

# 数据加密密钥
# Data encryption key
# 生成命令 | Generate command: openssl rand -base64 32
ENCRYPTION_KEY=your_encryption_key
```

**快速生成所有密钥脚本 | Quick Generate All Keys Script:**

```bash
#!/bin/bash
# 快速生成 Strapi 所有必需密钥 | Quick generate all required Strapi keys

echo "# Strapi Security Keys - Generated $(date)"
echo "# 将以下内容复制到 .env.docker 文件中 | Copy the following to your .env.docker file"
echo ""
echo "APP_KEYS=$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
echo "API_TOKEN_SALT=$(openssl rand -base64 32)"
echo "ADMIN_JWT_SECRET=$(openssl rand -base64 32)"
echo "TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"
```

#### 服务器配置 | Server Configuration

```bash
# 监听主机（0.0.0.0 允许外部访问）
# Listen host (0.0.0.0 allows external access)
HOST=0.0.0.0

# 监听端口
# Listen port
PORT=1337

# 节点环境
# Node environment
NODE_ENV=production

# 时区配置（Docker 镜像默认已设置）
# Timezone configuration (default in Docker image)
TZ=Asia/Shanghai
```

### 可选的环境变量 | Optional Environment Variables

#### URL 配置 | URL Configuration

```bash
# Strapi 公开访问 URL
# Strapi public URL
STRAPI_URL=http://localhost:1337

# 管理面板 URL
# Admin panel URL
STRAPI_ADMIN_CLIENT_URL=http://localhost:1337/admin

# 预览 URL
# Preview URL
STRAPI_ADMIN_CLIENT_PREVIEW_URL=http://localhost:3000
```

#### 文件上传配置 | File Upload Configuration

```bash
# 上传文件存储路径
# Upload file storage path
UPLOADS_PATH=/opt/app/public/uploads

# 最大文件大小（字节）
# Maximum file size (bytes)
MAX_FILE_SIZE=52428800  # 50MB
```

#### 日志配置 | Logging Configuration

```bash
# 日志级别（fatal/error/warn/info/debug/trace）
# Log level (fatal/error/warn/info/debug/trace)
LOG_LEVEL=info

# 日志输出目录
# Log output directory
LOG_DIR=/opt/app/logs
```

### 环境变量验证清单 | Environment Variables Checklist

在部署前，请确保以下配置已完成 | Before deployment, ensure the following configurations are complete:

- [ ] 已修改所有默认密钥为唯一的强随机值
- [ ] Changed all default keys to unique strong random values
- [ ] 已设置正确的数据库连接信息
- [ ] Set correct database connection information
- [ ] 已配置时区为 Asia/Shanghai
- [ ] Configured timezone to Asia/Shanghai
- [ ] 已设置正确的 HOST 和 PORT
- [ ] Set correct HOST and PORT
- [ ] 已配置生产环境的公开 URL
- [ ] Configured production public URLs
- [ ] 已准备数据持久化目录
- [ ] Prepared data persistence directories

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

## 📊 资源限制与日志管理

### 资源限制配置 | Resource Limits Configuration

生产环境的 docker-compose.yml 已包含资源限制配置 | Production docker-compose.yml includes resource limits:

#### 服务资源分配 | Service Resource Allocation

| 服务 Service | CPU 限制 Limit | 内存限制 Memory Limit | CPU 预留 Reserved | 内存预留 Memory Reserved |
|--------------|----------------|----------------------|-------------------|-------------------------|
| PostgreSQL   | 1.0 核         | 1GB                  | 0.5 核             | 512MB                   |
| CMS (Strapi) | 2.0 核         | 2GB                  | 0.5 核             | 512MB                   |
| Frontend     | 2.0 核         | 1GB                  | 0.5 核             | 256MB                   |
| Redis        | 0.5 核         | 512MB                | 0.25 核            | 256MB                   |
| Nginx        | 1.0 核         | 512MB                | 0.25 核            | 128MB                   |

#### 自定义资源限制 | Customize Resource Limits

根据服务器规格调整资源限制 | Adjust resource limits based on your server specifications:

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '2.0'        # 最大使用 2 个 CPU 核心 | Max 2 CPU cores
          memory: 1G         # 最大使用 1GB 内存 | Max 1GB memory
        reservations:
          cpus: '0.5'        # 保证至少 0.5 核 | Guarantee at least 0.5 cores
          memory: 256M       # 保证至少 256MB | Guarantee at least 256MB
```

#### 监控资源使用 | Monitor Resource Usage

```bash
# 实时监控所有容器资源使用 | Real-time monitoring of all containers
docker stats

# 监控特定容器 | Monitor specific container
docker stats nuxt-strapi-frontend

# 导出资源使用报告 | Export resource usage report
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" > resource_usage.txt
```

### 日志管理 | Log Management

#### 日志轮转配置 | Log Rotation Configuration

所有服务已配置日志轮转 | All services have log rotation configured:

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"      # 单个日志文件最大 10MB | Max 10MB per log file
    max-file: "5"        # 保留最近 5 个日志文件 | Keep latest 5 log files
    labels: "service=frontend"  # 添加标签便于识别 | Add labels for identification
```

**日志存储说明 | Log Storage Explanation:**

- 每个服务最多保留 5 个日志文件 | Each service keeps max 5 log files
- 每个文件最大 10MB（Nginx 为 20MB）| Each file max 10MB (Nginx: 20MB)
- 总日志大小：约 50-100MB/服务 | Total log size: ~50-100MB per service
- 日志自动轮转，不需手动清理 | Logs auto-rotate, no manual cleanup needed

#### 查看日志 | View Logs

```bash
# 查看所有服务日志 | View all service logs
docker compose logs

# 实时跟踪日志 | Follow logs in real-time
docker compose logs -f

# 查看特定服务日志 | View specific service logs
docker compose logs frontend
docker compose logs cms
docker compose logs postgres

# 查看最近 100 行日志 | View last 100 lines
docker compose logs --tail=100 frontend

# 查看带时间戳的日志 | View logs with timestamps
docker compose logs -t frontend

# 过滤错误日志 | Filter error logs
docker compose logs frontend | grep -i error
docker compose logs cms | grep -i "ERROR\|WARN"
```

#### 日志位置 | Log Locations

**容器日志 | Container Logs:**
```bash
# Docker 管理的日志 | Docker-managed logs
/var/lib/docker/containers/<container-id>/<container-id>-json.log
```

**持久化日志 | Persistent Logs:**
```bash
# Nginx 日志（挂载到主机）| Nginx logs (mounted to host)
./data/nginx_logs/access.log
./data/nginx_logs/error.log

# 应用日志（容器内部）| Application logs (inside containers)
# Frontend: /app/logs
# CMS: /opt/app/logs
```

#### 导出和备份日志 | Export and Backup Logs

```bash
# 导出特定时间段的日志 | Export logs for specific time period
docker compose logs --since "2024-01-01T00:00:00" --until "2024-01-02T00:00:00" > logs_backup.txt

# 导出所有服务日志 | Export all service logs
docker compose logs --no-color > all_services_$(date +%Y%m%d_%H%M%S).log

# 备份 Nginx 日志 | Backup Nginx logs
tar -czf nginx_logs_$(date +%Y%m%d).tar.gz data/nginx_logs/

# 清理旧日志（谨慎使用）| Clean old logs (use with caution)
docker compose exec frontend sh -c "rm -f /app/logs/*.log.old"
```

#### 日志分析 | Log Analysis

```bash
# 统计错误数量 | Count errors
docker compose logs frontend | grep -c "ERROR"

# 查找特定模式 | Search for patterns
docker compose logs cms | grep "database"

# 分析访问日志 | Analyze access logs
cat data/nginx_logs/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# 查看响应时间 | View response times
cat data/nginx_logs/access.log | awk '{print $NF}' | sort -n | tail -20
```

#### 日志聚合（高级）| Log Aggregation (Advanced)

对于生产环境，建议使用日志聚合工具 | For production, consider using log aggregation tools:

**选项 1: ELK Stack (Elasticsearch, Logstash, Kibana)**

```yaml
# 添加到 docker-compose.yml
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
    volumes:
      - es_data:/usr/share/elasticsearch/data
      
  logstash:
    image: logstash:8.11.0
    volumes:
      - ./config/logstash:/usr/share/logstash/pipeline
      
  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
```

**选项 2: Loki + Grafana**

```yaml
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
      
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers
```

**选项 3: 阿里云日志服务 (SLS) | Alibaba Cloud Log Service**

配置 Docker 日志驱动 | Configure Docker logging driver:

```json
{
  "log-driver": "syslog",
  "log-opts": {
    "syslog-address": "tcp://your-sls-endpoint:514",
    "tag": "{{.Name}}"
  }
}
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

## 🔄 数据持久化与备份

### 数据卷概览 | Volume Overview

项目配置了以下持久化存储卷 | The project configures the following persistent storage volumes:

| 卷名称 Volume | 用途 Purpose | 挂载路径 Mount Path | 备份优先级 Backup Priority |
|--------------|--------------|---------------------|---------------------------|
| `postgres_data` | 数据库数据 Database | `./data/postgres` | ⚠️ 高 High |
| `cms_uploads` | CMS上传文件 Uploads | `./data/cms_uploads` | ⚠️ 高 High |
| `redis_data` | Redis持久化 Persistence | `./data/redis` | 中 Medium |
| `nginx_logs` | Nginx日志 Logs | `./data/nginx_logs` | 低 Low |
| `cms_logs` | CMS日志 Logs | (Docker managed) | 低 Low |
| `frontend_logs` | 前端日志 Logs | (Docker managed) | 低 Low |

### 卷管理命令 | Volume Management Commands

```bash
# 查看所有卷 | List all volumes
docker volume ls

# 查看卷详细信息 | Inspect volume details
docker volume inspect nuxt-strapi-monorepo_postgres_data

# 检查卷使用情况 | Check volume usage
docker system df -v

# 查看挂载点 | View mount points
docker compose ps -q | xargs docker inspect -f '{{ .Name }}: {{ range .Mounts }}{{ .Source }}->{{ .Destination }} {{ end }}'
```

### 数据库备份 | Database Backup

#### 自动备份脚本 | Automated Backup Script

创建备份脚本 `scripts/backup-database.sh` | Create backup script:

```bash
#!/bin/bash
# 数据库自动备份脚本 | Automated database backup script

BACKUP_DIR="./database/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="postgres_backup_${DATE}.sql.gz"

# 创建备份目录 | Create backup directory
mkdir -p ${BACKUP_DIR}

# 备份数据库 | Backup database
docker compose exec -T postgres pg_dump -U strapi strapi | gzip > ${BACKUP_DIR}/${BACKUP_FILE}

# 检查备份结果 | Check backup result
if [ $? -eq 0 ]; then
    echo "✅ 备份成功 | Backup successful: ${BACKUP_FILE}"
    
    # 删除7天前的备份 | Delete backups older than 7 days
    find ${BACKUP_DIR} -name "postgres_backup_*.sql.gz" -mtime +7 -delete
    echo "🗑️  已清理旧备份 | Old backups cleaned"
else
    echo "❌ 备份失败 | Backup failed"
    exit 1
fi

# 显示备份文件大小 | Show backup file size
ls -lh ${BACKUP_DIR}/${BACKUP_FILE}
```

**设置执行权限 | Set execute permission:**

```bash
chmod +x scripts/backup-database.sh
```

**手动执行备份 | Manual backup execution:**

```bash
./scripts/backup-database.sh
```

**设置定时备份 | Setup scheduled backup:**

```bash
# 编辑 crontab | Edit crontab
crontab -e

# 添加每天凌晨2点自动备份 | Add daily backup at 2 AM
0 2 * * * cd /path/to/project && ./scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

#### 手动备份命令 | Manual Backup Commands

```bash
# 完整数据库备份 | Full database backup
docker compose exec postgres pg_dump -U strapi strapi > database/backups/backup_$(date +%Y%m%d).sql

# 压缩备份 | Compressed backup
docker compose exec postgres pg_dump -U strapi strapi | gzip > database/backups/backup_$(date +%Y%m%d).sql.gz

# 仅备份数据（不含结构）| Data only backup
docker compose exec postgres pg_dump -U strapi --data-only strapi > database/backups/data_only_$(date +%Y%m%d).sql

# 仅备份结构（不含数据）| Schema only backup
docker compose exec postgres pg_dump -U strapi --schema-only strapi > database/backups/schema_only_$(date +%Y%m%d).sql
```

#### 数据库恢复 | Database Restore

```bash
# 从备份恢复 | Restore from backup
docker compose exec -T postgres psql -U strapi strapi < database/backups/backup_20240101.sql

# 从压缩备份恢复 | Restore from compressed backup
gunzip -c database/backups/backup_20240101.sql.gz | docker compose exec -T postgres psql -U strapi strapi

# 恢复前先删除现有数据库 | Drop existing database before restore
docker compose exec postgres psql -U strapi -c "DROP DATABASE IF EXISTS strapi;"
docker compose exec postgres psql -U strapi -c "CREATE DATABASE strapi;"
docker compose exec -T postgres psql -U strapi strapi < database/backups/backup_20240101.sql
```

### 文件上传备份 | File Upload Backup

```bash
# 备份 CMS 上传文件 | Backup CMS uploads
tar -czf backups/cms_uploads_$(date +%Y%m%d).tar.gz data/cms_uploads/

# 恢复 CMS 上传文件 | Restore CMS uploads
tar -xzf backups/cms_uploads_20240101.tar.gz -C ./

# 使用 rsync 增量备份 | Incremental backup with rsync
rsync -avz --delete data/cms_uploads/ /backup/location/cms_uploads/
```

### 完整系统备份 | Full System Backup

```bash
# 备份所有数据卷和配置 | Backup all volumes and configuration
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/full_backup_${BACKUP_DATE}"

mkdir -p ${BACKUP_DIR}

# 备份数据库 | Backup database
docker compose exec -T postgres pg_dump -U strapi strapi | gzip > ${BACKUP_DIR}/database.sql.gz

# 备份数据卷 | Backup data volumes
tar -czf ${BACKUP_DIR}/postgres_data.tar.gz data/postgres/
tar -czf ${BACKUP_DIR}/cms_uploads.tar.gz data/cms_uploads/
tar -czf ${BACKUP_DIR}/redis_data.tar.gz data/redis/

# 备份配置文件 | Backup configuration files
cp .env.docker ${BACKUP_DIR}/
cp docker-compose.yml ${BACKUP_DIR}/

echo "✅ 完整备份已保存到 | Full backup saved to: ${BACKUP_DIR}"
```

### 卷迁移 | Volume Migration

**从一台服务器迁移到另一台 | Migrate from one server to another:**

```bash
# 源服务器 | Source server
# 1. 停止服务 | Stop services
docker compose down

# 2. 打包数据 | Package data
tar -czf data_backup.tar.gz data/

# 3. 传输到目标服务器 | Transfer to target server
scp data_backup.tar.gz user@target-server:/path/to/project/

# 目标服务器 | Target server
# 4. 解压数据 | Extract data
tar -xzf data_backup.tar.gz

# 5. 启动服务 | Start services
docker compose up -d
```

### 灾难恢复计划 | Disaster Recovery Plan

#### 恢复步骤 | Recovery Steps

1. **准备环境 | Prepare Environment**
   ```bash
   # 安装 Docker 和必要工具 | Install Docker and required tools
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt install docker-compose-plugin -y
   ```

2. **恢复代码和配置 | Restore Code and Configuration**
   ```bash
   git clone <repository-url>
   cd <project>
   cp backup/.env.docker .env.docker
   ```

3. **恢复数据卷 | Restore Data Volumes**
   ```bash
   tar -xzf backups/postgres_data.tar.gz
   tar -xzf backups/cms_uploads.tar.gz
   tar -xzf backups/redis_data.tar.gz
   ```

4. **启动服务 | Start Services**
   ```bash
   docker compose up -d
   ```

5. **验证恢复 | Verify Recovery**
   ```bash
   # 测试健康检查 | Test health checks
   curl http://localhost:3000/api/health
   curl http://localhost:1337/_health
   
   # 验证数据 | Verify data
   docker compose exec postgres psql -U strapi strapi -c "SELECT COUNT(*) FROM users;"
   ```

### 备份到云存储 | Backup to Cloud Storage

#### 阿里云 OSS | Alibaba Cloud OSS

```bash
# 安装 ossutil | Install ossutil
wget http://gosspublic.alicdn.com/ossutil/1.7.15/ossutil64
chmod 755 ossutil64

# 配置 OSS | Configure OSS
./ossutil64 config

# 上传备份 | Upload backup
./ossutil64 cp -r database/backups/ oss://your-bucket/backups/
./ossutil64 cp -r data/cms_uploads/ oss://your-bucket/cms_uploads/
```

#### 腾讯云 COS | Tencent Cloud COS

```bash
# 安装 COSCMD | Install COSCMD
pip install coscmd

# 配置 COS | Configure COS
coscmd config -a <SecretId> -s <SecretKey> -b <BucketName> -r <Region>

# 上传备份 | Upload backup
coscmd upload -r database/backups/ /backups/
coscmd upload -r data/cms_uploads/ /cms_uploads/
```

### 备份验证 | Backup Verification

**定期测试备份恢复 | Regularly test backup restoration:**

```bash
#!/bin/bash
# 备份验证脚本 | Backup verification script

echo "🔍 开始备份验证 | Starting backup verification..."

# 创建测试环境 | Create test environment
docker compose -f docker-compose.test.yml up -d

# 恢复备份到测试环境 | Restore backup to test environment
gunzip -c database/backups/latest_backup.sql.gz | docker compose -f docker-compose.test.yml exec -T postgres psql -U strapi strapi

# 验证数据完整性 | Verify data integrity
TEST_COUNT=$(docker compose -f docker-compose.test.yml exec -T postgres psql -U strapi strapi -tAc "SELECT COUNT(*) FROM users;")

if [ "$TEST_COUNT" -gt 0 ]; then
    echo "✅ 备份验证成功 | Backup verification successful: $TEST_COUNT users found"
else
    echo "❌ 备份验证失败 | Backup verification failed"
    exit 1
fi

# 清理测试环境 | Clean up test environment
docker compose -f docker-compose.test.yml down -v
```

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

## 🏭 生产环境部署

### 生产环境检查清单 | Production Checklist

在生产环境部署前，请确认以下事项 | Before deploying to production, confirm the following:

- [ ] ✅ 已生成强密码和唯一密钥 | Strong passwords and unique keys generated
- [ ] ✅ 已配置 HTTPS/SSL 证书 | HTTPS/SSL certificates configured
- [ ] ✅ 已设置防火墙规则 | Firewall rules configured
- [ ] ✅ 已配置备份策略 | Backup strategy configured
- [ ] ✅ 已设置监控和告警 | Monitoring and alerting set up
- [ ] ✅ 已完成 ICP 备案（中国）| ICP filing completed (China)
- [ ] ✅ 已测试健康检查端点 | Health check endpoints tested
- [ ] ✅ 已配置日志轮转 | Log rotation configured
- [ ] ✅ 已设置资源限制 | Resource limits set

### 生产环境部署步骤 | Production Deployment Steps

#### 1. 准备服务器 | Prepare Server

```bash
# 更新系统 | Update system
sudo apt update && sudo apt upgrade -y

# 安装 Docker | Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose | Install Docker Compose
sudo apt install docker-compose-plugin -y

# 配置 Docker 用户组 | Configure Docker user group
sudo usermod -aG docker $USER
newgrp docker

# 验证安装 | Verify installation
docker --version
docker compose version
```

#### 2. 配置生产环境 | Configure Production Environment

```bash
# 克隆代码 | Clone repository
git clone <your-repository-url>
cd <your-project>

# 创建生产环境配置 | Create production configuration
cp .env.production .env.docker

# 编辑配置（使用强密码）| Edit configuration (use strong passwords)
nano .env.docker

# 创建数据目录 | Create data directories
mkdir -p data/{postgres,cms_uploads,redis,nginx_logs}
mkdir -p database/backups

# 设置权限 | Set permissions
chmod 700 data/postgres
chmod 755 data/cms_uploads
```

#### 3. 配置 SSL 证书 | Configure SSL Certificates

```bash
# 创建 SSL 目录 | Create SSL directory
mkdir -p config/nginx/ssl

# 使用 Let's Encrypt (推荐) | Using Let's Encrypt (recommended)
sudo apt install certbot -y
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 复制证书到项目 | Copy certificates to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem config/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem config/nginx/ssl/key.pem
sudo chown $USER:$USER config/nginx/ssl/*.pem
chmod 600 config/nginx/ssl/*.pem
```

#### 4. 配置防火墙 | Configure Firewall

```bash
# 启用防火墙 | Enable firewall
sudo ufw enable

# 允许 SSH | Allow SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS | Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 检查状态 | Check status
sudo ufw status
```

#### 5. 启动生产服务 | Start Production Services

```bash
# 验证配置 | Validate configuration
docker compose config

# 拉取镜像 | Pull images
docker compose pull

# 构建自定义镜像 | Build custom images
docker compose build

# 启动服务 | Start services
docker compose up -d

# 检查状态 | Check status
docker compose ps

# 查看日志 | View logs
docker compose logs -f
```

#### 6. 验证部署 | Verify Deployment

```bash
# 等待服务启动 | Wait for services to start
sleep 120

# 测试健康检查 | Test health checks
curl -k https://yourdomain.com/api/health
curl -k https://api.yourdomain.com/_health

# 检查容器状态 | Check container status
docker compose ps

# 查看资源使用 | View resource usage
docker stats --no-stream
```

### 滚动更新 | Rolling Updates

```bash
# 拉取最新代码 | Pull latest code
git pull origin main

# 重新构建镜像 | Rebuild images
docker compose build

# 滚动更新服务 | Rolling update services
docker compose up -d --no-deps --build frontend
docker compose up -d --no-deps --build cms

# 清理旧镜像 | Clean up old images
docker image prune -f
```

## 🌍 中国大陆网络优化

### 方案一：使用 docker-compose.china.yml 覆盖文件

**推荐用于中国大陆部署 | Recommended for China deployment**

```bash
# 使用中国优化配置启动 | Start with China optimization
docker-compose -f docker-compose.yml -f docker-compose.china.yml up -d

# 查看合并后的配置 | View merged configuration
docker-compose -f docker-compose.yml -f docker-compose.china.yml config
```

**docker-compose.china.yml 提供的优化 | Optimizations provided:**

- ✅ 使用阿里云容器镜像服务 | Alibaba Cloud Container Registry
- ✅ npm/pnpm 使用淘宝镜像源 | npm/pnpm use Taobao mirror
- ✅ Alpine 使用中科大镜像源 | Alpine use USTC mirror
- ✅ 自定义 hosts 映射 | Custom hosts mapping
- ✅ 中国时区和语言环境 | China timezone and locale

### 方案二：配置 Docker 守护进程镜像加速

**配置系统级镜像加速 | Configure system-wide mirror acceleration**

1. **编辑 Docker 配置 | Edit Docker configuration:**

```bash
sudo nano /etc/docker/daemon.json
```

2. **添加镜像配置 | Add mirror configuration:**

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://registry.cn-hangzhou.aliyuncs.com"
  ],
  "dns": ["223.5.5.5", "119.29.29.29"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

3. **重启 Docker 服务 | Restart Docker service:**

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置 | Verify configuration
docker info | grep -A 5 "Registry Mirrors"
```

### 方案三：构建时使用国内镜像源

**在 Dockerfile 中添加镜像源配置 | Add mirror configuration in Dockerfile:**

```dockerfile
# 使用阿里云镜像 | Use Alibaba Cloud mirror
FROM registry.cn-hangzhou.aliyuncs.com/library/node:22-alpine

# 配置 Alpine 镜像源 | Configure Alpine mirror
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

# 配置 npm 镜像源 | Configure npm mirror
RUN npm config set registry https://registry.npmmirror.com

# 配置 pnpm 镜像源 | Configure pnpm mirror
RUN corepack enable && \
    pnpm config set registry https://registry.npmmirror.com
```

### 中国云服务商推荐配置 | China Cloud Provider Recommendations

#### 阿里云 (Alibaba Cloud)

```bash
# 使用阿里云容器镜像服务 | Use Alibaba Cloud Container Registry
CMS_IMAGE=registry.cn-hangzhou.aliyuncs.com/your-namespace/cms:latest
FRONTEND_IMAGE=registry.cn-hangzhou.aliyuncs.com/your-namespace/frontend:latest

# 使用阿里云 DNS | Use Alibaba Cloud DNS
# 在 /etc/docker/daemon.json 中配置
"dns": ["223.5.5.5", "223.6.6.6"]
```

#### 腾讯云 (Tencent Cloud)

```bash
# 使用腾讯云容器镜像服务 | Use Tencent Cloud Container Registry
CMS_IMAGE=ccr.ccs.tencentyun.com/your-namespace/cms:latest
FRONTEND_IMAGE=ccr.ccs.tencentyun.com/your-namespace/frontend:latest

# 使用腾讯云 DNS | Use Tencent Cloud DNS
# 在 /etc/docker/daemon.json 中配置
"dns": ["119.29.29.29", "182.254.116.116"]
```

### 网络优化技巧 | Network Optimization Tips

1. **使用 CDN 加速静态资源 | Use CDN for static assets**

```bash
# 在 .env.docker 中配置 | Configure in .env.docker
CDN_URL_CN=https://cdn.yourdomain.com
```

2. **配置本地 DNS 缓存 | Configure local DNS cache**

```bash
# 安装 dnsmasq | Install dnsmasq
sudo apt install dnsmasq -y

# 配置上游 DNS | Configure upstream DNS
echo "server=223.5.5.5" | sudo tee -a /etc/dnsmasq.conf
echo "server=119.29.29.29" | sudo tee -a /etc/dnsmasq.conf
sudo systemctl restart dnsmasq
```

3. **使用 HTTP/2 和压缩 | Use HTTP/2 and compression**

Nginx 配置已包含 gzip 压缩和 HTTP/2 支持 | Nginx configuration already includes gzip compression and HTTP/2 support.

### 防火墙和 CDN 配置 | Firewall and CDN Configuration

#### ICP 备案要求 | ICP Filing Requirements

```bash
# 在 .env.docker 中配置 ICP 备案信息 | Configure ICP filing in .env.docker
ICP_FILING_NUMBER=京ICP备XXXXXXXX号
PUBLIC_SECURITY_FILING_NUMBER=京公网安备XXXXXXXXXXXXX号
```

#### 配置 CDN 回源 | Configure CDN Origin

对于阿里云 CDN | For Alibaba Cloud CDN:

1. 在阿里云控制台添加 CDN 域名 | Add CDN domain in Alibaba Cloud console
2. 配置回源地址为服务器公网 IP | Configure origin to server public IP
3. 启用 HTTPS 和 HTTP/2 | Enable HTTPS and HTTP/2
4. 配置缓存规则 | Configure cache rules:
   - 静态文件（js, css, images）缓存 1 天 | Static files cache 1 day
   - HTML 文件缓存 5 分钟 | HTML files cache 5 minutes
   - API 不缓存 | API no cache

## 🔗 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)

---

## 📝 生产就绪特性总结 | Production-Ready Features Summary

本 Docker Compose 配置现在包含以下生产就绪特性 | This Docker Compose configuration now includes the following production-ready features:

### ✅ 已实现的功能 | Implemented Features

1. **健康检查 | Health Checks**
   - 所有服务都配置了健康检查端点
   - 依赖关系基于健康状态（condition: service_healthy）
   - 自定义重试策略和启动延迟

2. **资源管理 | Resource Management**
   - CPU 和内存限制防止资源耗尽
   - 资源预留保证最小可用资源
   - 可根据服务器规格自定义配置

3. **日志管理 | Log Management**
   - JSON 文件日志驱动器
   - 自动日志轮转（10MB/文件，保留3-5个文件）
   - 持久化日志卷用于 Nginx
   - 服务标签便于日志识别

4. **网络配置 | Network Configuration**
   - 隔离的桥接网络
   - 自定义子网和网关
   - 明确的服务间通信路径
   - 可选的 extra_hosts 用于中国网络

5. **数据持久化 | Data Persistence**
   - PostgreSQL 数据持久化
   - CMS 上传文件持久化
   - Redis AOF 持久化
   - 命名卷便于管理和备份

6. **安全配置 | Security Configuration**
   - 所有服务使用非 root 用户运行
   - 环境变量外部化管理
   - 安全标头配置
   - 访问频率限制配置

7. **环境管理 | Environment Management**
   - 集中式 .env.docker 文件
   - 生产环境模板 (.env.production)
   - 默认值回退机制
   - 中国特定配置选项

8. **中国网络优化 | China Network Optimization**
   - 专用 docker-compose.china.yml 覆盖文件
   - 阿里云/腾讯云镜像源支持
   - npm/pnpm 淘宝镜像配置
   - CDN 和 DNS 优化建议

9. **可观测性 | Observability**
   - 详细的日志配置
   - 资源使用监控支持
   - 健康检查端点
   - 准备集成 Prometheus/Grafana

10. **备份和恢复 | Backup and Recovery**
    - 数据库备份脚本
    - 完整系统备份流程
    - 灾难恢复计划
    - 云存储集成指南

### 🚀 快速命令参考 | Quick Command Reference

```bash
# 验证配置 | Validate configuration
docker compose config

# 启动服务 | Start services
docker compose up -d

# 中国优化启动 | Start with China optimization
docker compose -f docker-compose.yml -f docker-compose.china.yml up -d

# 查看状态 | Check status
docker compose ps

# 查看日志 | View logs
docker compose logs -f

# 资源监控 | Monitor resources
docker stats

# 健康检查 | Health check
curl http://localhost:3000/api/health
curl http://localhost:1337/_health

# 备份数据库 | Backup database
docker compose exec postgres pg_dump -U strapi strapi | gzip > backup_$(date +%Y%m%d).sql.gz

# 停止服务 | Stop services
docker compose down
```

### 📋 部署检查清单 | Deployment Checklist

部署前请确认 | Before deployment, confirm:

- [ ] ✅ 已复制并配置 .env.docker 文件
- [ ] ✅ 已生成强密码和唯一密钥
- [ ] ✅ 已配置正确的域名和 URL
- [ ] ✅ 已设置 ICP 备案信息（中国部署）
- [ ] ✅ 已验证 docker compose config 无错误
- [ ] ✅ 已配置 SSL 证书（生产环境）
- [ ] ✅ 已设置防火墙规则
- [ ] ✅ 已配置备份策略
- [ ] ✅ 已测试健康检查端点
- [ ] ✅ 已设置监控和告警

### 🔗 相关文档 | Related Documentation

- [生产环境部署指南](./PRODUCTION_DEPLOYMENT_CN.md) - 完整的生产部署流程
- [中国合规检查清单](./COMPLIANCE_CHECKLIST_CN.md) - ICP备案和合规要求
- [安全配置指南](./SECURITY_CN.md) - 安全最佳实践
- [部署策略](./DEPLOYMENT_STRATEGY.md) - 蓝绿部署和零停机时间
- [监控运维指南](./MONITORING.md) - 监控、日志和告警

### 💡 故障排除提示 | Troubleshooting Tips

**问题：容器无法启动**
```bash
# 查看详细错误日志
docker compose logs <service-name>
# 检查资源使用
docker stats
# 检查端口冲突
sudo netstat -tulpn | grep -E "3000|1337|5432"
```

**问题：健康检查失败**
```bash
# 手动测试健康端点
docker compose exec frontend wget -O- http://localhost:3000/api/health
# 检查容器内部网络
docker compose exec frontend ping cms
```

**问题：数据库连接失败**
```bash
# 检查数据库状态
docker compose exec postgres pg_isready -U strapi
# 查看数据库日志
docker compose logs postgres
```

---

最后更新: 2024-11-02
