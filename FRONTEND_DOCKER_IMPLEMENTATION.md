# Frontend Docker Implementation Summary

## 概述 | Overview

本文档总结了前端 Nuxt 3 Docker 镜像的优化实现，满足生产环境的大小、安全性和中国网络要求。

This document summarizes the optimized frontend Nuxt 3 Docker image implementation meeting production requirements for size, security, and China network needs.

---

## 实现的功能 | Implemented Features

### ✅ 1. Node 20 Alpine 多阶段构建

**位置 | Location:** `apps/frontend/Dockerfile`

**三阶段构建策略 | Three-Stage Build Strategy:**

1. **deps** - 依赖安装阶段
   - 使用 pnpm fetch 实现确定性安装
   - 支持镜像源配置
   
2. **builder** - 构建阶段
   - 复用依赖提高缓存效率
   - 执行 pnpm build
   
3. **runtime** - 运行阶段
   - 仅包含 .output 目录
   - 安装 tini 和 curl
   - 配置非 root 用户
   - 设置 Asia/Shanghai 时区

**镜像大小目标 | Image Size Target:** ≤ 200MB

### ✅ 2. 中国镜像源支持

**构建参数 | Build Arguments:**

```dockerfile
ARG NPM_REGISTRY=https://registry.npmjs.org/
ARG PNPM_REGISTRY=https://registry.npmjs.org/
ARG ALPINE_MIRROR=""
```

**使用方法 | Usage:**

```bash
# 标准构建 | Standard build
pnpm docker:build:frontend

# 中国镜像源构建 | China mirror build
pnpm docker:build:frontend:china
```

### ✅ 3. 安全配置

- **非 root 用户:** nuxtjs:nodejs (uid=1001:gid=1001)
- **tini init 系统:** 正确处理进程信号
- **最小化依赖:** 仅运行时必需包
- **权限验证:** .output 目录权限正确设置

### ✅ 4. 健康检查

**位置 | Location:** 
- Dockerfile: `HEALTHCHECK` 指令
- docker-compose.yml: `healthcheck` 配置

**实现 | Implementation:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

**端点 | Endpoint:** `/api/health` (已存在于 `apps/frontend/server/api/health.get.ts`)

### ✅ 5. 更新的配置文件

#### apps/frontend/.dockerignore

**新增排除项 | New Exclusions:**
- tests/**
- *.test.ts, *.spec.ts
- *.stories.ts
- .cache, .turbo, .nuxt
- playwright-report/, test-results/

#### docker-compose.yml

**更新点 | Updates:**
- 启用 build args（NPM_REGISTRY, PNPM_REGISTRY, ALPINE_MIRROR）
- 健康检查改用 curl

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
```

#### .env.docker.example

**新增部分 | New Sections:**
- 详细的 Nuxt 环境变量说明
- Docker 构建参数配置
- NPM_REGISTRY, PNPM_REGISTRY, ALPINE_MIRROR 变量

#### package.json

**新增脚本 | New Scripts:**
```json
"docker:build:frontend": "docker build -f apps/frontend/Dockerfile -t nuxt-strapi-frontend:latest .",
"docker:build:frontend:china": "docker build --build-arg NPM_REGISTRY=https://registry.npmmirror.com --build-arg PNPM_REGISTRY=https://registry.npmmirror.com --build-arg ALPINE_MIRROR=mirrors.ustc.edu.cn -f apps/frontend/Dockerfile -t nuxt-strapi-frontend:latest ."
```

### ✅ 6. 文档更新

#### docs/DOCKER.md

**新增/更新章节 | New/Updated Sections:**

1. **Frontend Dockerfile 详解**
   - 三阶段构建说明
   - 构建参数表格
   - 镜像大小对比
   - 使用示例

2. **Nuxt 环境变量配置详解**
   - 必需的环境变量
   - 可选的环境变量
   - 安全、合规、CDN 配置
   - 环境变量优先级和命名规范
   - Docker 构建参数说明

3. **健康检查详解**
   - Docker Compose 和 Dockerfile 配置
   - 测试方法
   - 健康检查说明
   - 故障排查

4. **测试与验证**
   - 镜像构建测试
   - 镜像大小验证
   - 安全性验证
   - 运行时测试
   - 性能测试
   - 完整部署测试
   - 验证清单

### ✅ 7. 自动化测试脚本

**位置 | Location:** `scripts/test-docker-frontend.sh`

**功能 | Features:**
- 自动构建并测试镜像
- 验证镜像大小 (≤ 200MB)
- 验证非 root 用户
- 验证 tini 和 curl
- 测试健康检查端点
- 彩色输出和详细报告

**使用方法 | Usage:**

```bash
chmod +x scripts/test-docker-frontend.sh
./scripts/test-docker-frontend.sh
```

---

## 验证结果 | Verification Results

### 构建命令 | Build Commands

```bash
# 标准构建 | Standard build
docker build -f apps/frontend/Dockerfile -t frontend:latest .

# 验证镜像大小 | Verify image size
docker images frontend:latest
# 预期 | Expected: ≤ 200MB

# 中国镜像源构建 | China mirror build
docker build \
  --build-arg NPM_REGISTRY=https://registry.npmmirror.com \
  --build-arg PNPM_REGISTRY=https://registry.npmmirror.com \
  --build-arg ALPINE_MIRROR=mirrors.ustc.edu.cn \
  -f apps/frontend/Dockerfile \
  -t frontend:latest .
```

### 运行测试 | Run Tests

```bash
# 使用 Docker Compose 启动 | Start with Docker Compose
docker-compose build frontend
docker-compose up -d frontend

# 等待健康检查 | Wait for health check
sleep 40

# 测试健康端点 | Test health endpoint
curl http://localhost:3000/api/health

# 检查健康状态 | Check health status
docker-compose ps
```

### 验证清单 | Verification Checklist

- [x] Dockerfile 使用 Node 20 Alpine
- [x] 三阶段构建 (deps → builder → runtime)
- [x] 支持中国镜像源构建参数
- [x] 使用 pnpm fetch/install 确定性安装
- [x] 运行时安装 tini 和 curl
- [x] 非 root 用户 (nuxtjs:nodejs)
- [x] 仅复制 .output 到运行阶段
- [x] 时区设置为 Asia/Shanghai
- [x] 健康检查使用 curl
- [x] .dockerignore 排除测试和故事文件
- [x] docker-compose.yml 配置构建参数
- [x] .env.docker.example 包含构建参数文档
- [x] docs/DOCKER.md 包含完整中文文档
- [x] 创建自动化测试脚本
- [x] package.json 包含构建脚本

---

## 使用指南 | Usage Guide

### 开发环境 | Development

```bash
# 本地开发（不使用 Docker）
pnpm dev:frontend

# 使用 Docker 开发环境
docker-compose -f docker-compose.dev.yml up -d
```

### 生产环境（国际）| Production (International)

```bash
# 构建镜像 | Build image
pnpm docker:build:frontend

# 或使用 Docker Compose
docker-compose build frontend

# 启动服务 | Start service
docker-compose up -d
```

### 生产环境（中国）| Production (China)

```bash
# 方法 1: 使用 pnpm 脚本
pnpm docker:build:frontend:china

# 方法 2: 使用 Docker Compose China 覆盖
docker-compose -f docker-compose.yml -f docker-compose.china.yml build frontend
docker-compose -f docker-compose.yml -f docker-compose.china.yml up -d

# 方法 3: 通过环境变量配置
# 在 .env.docker 中设置:
NPM_REGISTRY=https://registry.npmmirror.com
PNPM_REGISTRY=https://registry.npmmirror.com
ALPINE_MIRROR=mirrors.ustc.edu.cn

# 然后构建
docker-compose build frontend
```

---

## 镜像规格 | Image Specifications

| 特性 | 规格 |
|------|------|
| 基础镜像 | node:20-alpine |
| 目标大小 | ≤ 200MB |
| 构建阶段 | 3 (deps → builder → runtime) |
| Init 系统 | tini |
| 运行用户 | nuxtjs:nodejs (1001:1001) |
| 健康检查 | curl /api/health |
| 时区 | Asia/Shanghai |
| 包管理器 | pnpm |

---

## 相关文件 | Related Files

- `apps/frontend/Dockerfile` - Dockerfile 主文件
- `apps/frontend/.dockerignore` - Docker 忽略文件
- `docker-compose.yml` - Docker Compose 配置
- `docker-compose.china.yml` - 中国网络优化覆盖
- `.env.docker.example` - 环境变量模板
- `docs/DOCKER.md` - 完整 Docker 文档（中文）
- `scripts/test-docker-frontend.sh` - 自动化测试脚本
- `package.json` - 构建脚本

---

## 问题排查 | Troubleshooting

### 镜像大小超过 200MB

1. 检查是否使用了多阶段构建
2. 确认只复制了 .output 目录到 runtime 阶段
3. 验证 .dockerignore 正确配置
4. 检查是否清理了构建缓存

### 健康检查失败

1. 确认 curl 已安装
2. 检查容器日志：`docker logs <container-name>`
3. 手动测试健康端点：`docker exec <container> curl http://localhost:3000/api/health`
4. 增加 start_period 时间

### 中国镜像源构建慢

1. 验证构建参数是否正确传递
2. 检查 .npmrc 配置
3. 尝试不同的镜像源（mirrors.ustc.edu.cn vs mirrors.aliyun.com）
4. 使用 docker-compose.china.yml 覆盖文件

---

## 参考资源 | References

- [Node.js Docker 最佳实践](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Nuxt 部署文档](https://nuxt.com/docs/getting-started/deployment)
- [Docker 多阶段构建](https://docs.docker.com/build/building/multi-stage/)
- [Docker 健康检查](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [pnpm 文档](https://pnpm.io/cli/fetch)

---

**实现日期 | Implementation Date:** 2024-11-02

**版本 | Version:** 1.0.0

**状态 | Status:** ✅ 完成 | Complete
