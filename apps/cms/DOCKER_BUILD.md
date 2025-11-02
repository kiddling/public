# Strapi CMS Docker Build Guide
# Strapi CMS Docker 构建指南

## 🎯 Overview | 概览

This Dockerfile implements a secure, optimized production image for Strapi CMS with the following features:

本 Dockerfile 实现了安全、优化的 Strapi CMS 生产镜像，具有以下特性：

- ✅ Node 20 Alpine base (lightweight)
- ✅ Multi-stage build for minimal final image size (≤ 450MB)
- ✅ Asia/Shanghai timezone support
- ✅ Non-root user (strapi:strapi, UID/GID 1001)
- ✅ Chinese mirror support for faster builds in China
- ✅ Proper dependency management (npm ci + prune)
- ✅ Runtime directories (uploads, logs, .cache)
- ✅ Health check endpoint (/_health)

## 📦 Build Instructions | 构建说明

### Standard Build | 标准构建

```bash
cd /path/to/project/apps/cms
docker build -t cms:latest .
```

### Build with China Mirrors | 使用中国镜像源构建

For faster builds in China (recommended for Chinese deployments):

在中国构建时推荐使用镜像源以加快构建速度：

```bash
docker build \
  --build-arg USE_CHINA_MIRROR=true \
  --build-arg NODE_MIRROR=https://registry.npmmirror.com \
  --build-arg ALPINE_MIRROR=mirrors.aliyun.com \
  -t cms:latest .
```

### Custom Registry | 自定义镜像源

```bash
docker build \
  --build-arg USE_CHINA_MIRROR=true \
  --build-arg NODE_MIRROR=https://registry.npm.taobao.org \
  --build-arg ALPINE_MIRROR=mirrors.tuna.tsinghua.edu.cn \
  -t cms:latest .
```

## 🔍 Verify Build | 验证构建

### Check Image Size | 检查镜像大小

```bash
docker images cms:latest

# Expected output | 预期输出:
# REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
# cms          latest    xxxxxxxxxxxx   X minutes ago   ~400-450MB
```

### Inspect Image Details | 检查镜像详情

```bash
# Check user | 检查运行用户
docker inspect cms:latest | grep -A 5 User

# Check environment variables | 检查环境变量
docker inspect cms:latest | grep -A 20 Env

# Check timezone | 检查时区
docker run --rm cms:latest date
# Expected: Times displayed in Asia/Shanghai timezone
# 预期：显示上海时区的时间
```

## 🏃 Running the Container | 运行容器

### Basic Run | 基本运行

```bash
docker run -d \
  --name strapi-cms \
  -p 1337:1337 \
  -e DATABASE_CLIENT=postgres \
  -e DATABASE_HOST=your-db-host \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=strapi \
  -e DATABASE_USERNAME=strapi \
  -e DATABASE_PASSWORD=your-secure-password \
  -e APP_KEYS=key1,key2,key3,key4 \
  -e API_TOKEN_SALT=your-salt \
  -e ADMIN_JWT_SECRET=your-secret \
  -e TRANSFER_TOKEN_SALT=your-salt \
  -e JWT_SECRET=your-secret \
  cms:latest
```

### With Volume Mounts | 使用数据卷

```bash
docker run -d \
  --name strapi-cms \
  -p 1337:1337 \
  -v /path/to/uploads:/opt/app/public/uploads \
  -v /path/to/logs:/opt/app/logs \
  -v /path/to/cache:/opt/app/.cache \
  -e DATABASE_CLIENT=postgres \
  # ... other env vars ...
  cms:latest
```

## 🔐 Security Features | 安全特性

### Non-root User | 非 root 用户

The container runs as user `strapi` (UID 1001, GID 1001) for security:

容器以 `strapi` 用户运行（UID 1001，GID 1001）以提高安全性：

```bash
# Verify non-root execution | 验证非 root 执行
docker run --rm cms:latest whoami
# Output: strapi
```

### File Permissions | 文件权限

All runtime directories are owned by the strapi user:

所有运行时目录由 strapi 用户拥有：

- `/opt/app/public/uploads` - Upload files | 上传文件
- `/opt/app/logs` - Application logs | 应用日志  
- `/opt/app/.cache` - Strapi cache | Strapi 缓存

## 🏥 Health Check | 健康检查

The container includes a built-in health check:

容器包含内置健康检查：

```bash
# Check container health | 检查容器健康状态
docker ps
# Look for "(healthy)" status in the STATUS column
# 在 STATUS 列查找 "(healthy)" 状态

# Manual health check | 手动健康检查
curl http://localhost:1337/_health
# Expected: {"status":"ok"} or similar
# 预期：{"status":"ok"} 或类似响应
```

Health check configuration | 健康检查配置:
- Interval: 30 seconds | 间隔：30 秒
- Timeout: 10 seconds | 超时：10 秒
- Start period: 60 seconds | 启动期：60 秒
- Retries: 3 | 重试：3 次

## 🌍 Timezone Configuration | 时区配置

The image is pre-configured with Asia/Shanghai timezone:

镜像预配置为上海时区：

```bash
# Verify timezone | 验证时区
docker run --rm cms:latest sh -c "date && echo \$TZ"
# Output should show Shanghai timezone
# 输出应显示上海时区
```

To use a different timezone | 使用不同时区:

```bash
docker run -e TZ=America/New_York cms:latest
```

## 📊 Image Layers | 镜像层分析

The multi-stage build produces two stages:

多阶段构建产生两个阶段：

1. **Builder Stage** (not in final image) | 构建阶段（不在最终镜像中）:
   - Installs build dependencies
   - Installs all npm dependencies
   - Builds Strapi application
   - Prunes dev dependencies
   - ~800MB+

2. **Runner Stage** (final image) | 运行阶段（最终镜像）:
   - Minimal Alpine base with Node 20
   - Only production dependencies
   - Built application code
   - Runtime utilities (tzdata, curl)
   - **~400-450MB**

## 🚨 Troubleshooting | 故障排除

### Image Size Too Large | 镜像过大

If the image exceeds 450MB:

如果镜像超过 450MB：

```bash
# Check layer sizes | 检查层大小
docker history cms:latest --human

# Rebuild without cache | 清除缓存重新构建
docker build --no-cache -t cms:latest .
```

### Build Fails on Alpine Packages | Alpine 包安装失败

If `apk` commands fail:

如果 `apk` 命令失败：

1. Check network connectivity | 检查网络连接
2. Try using China mirrors | 尝试使用中国镜像源
3. Wait and retry (CDN issues are temporary) | 等待并重试（CDN 问题通常是临时的）

### Container Exits Immediately | 容器立即退出

Check the logs | 检查日志:

```bash
docker logs strapi-cms

# Common issues | 常见问题:
# - Missing required environment variables
#   缺少必需的环境变量
# - Database connection failure
#   数据库连接失败
# - Permission issues on mounted volumes
#   挂载卷的权限问题
```

## 📝 Required Environment Variables | 必需的环境变量

For production deployment, you must set:

生产部署时必须设置：

```bash
# Database | 数据库
DATABASE_CLIENT=postgres
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-password

# Strapi Security Keys | Strapi 安全密钥
# Generate with: openssl rand -base64 32
# 生成命令：openssl rand -base64 32
APP_KEYS=key1,key2,key3,key4  # Comma-separated, min 4 keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret
```

See `.env.docker.example` in project root for complete list.

完整列表见项目根目录的 `.env.docker.example`。

## 📚 Additional Resources | 其他资源

- [Main Docker Documentation](../../docs/DOCKER.md)
- [Strapi Environment Variables Guide](../../docs/DOCKER.md#strapi-环境变量配置详解)
- [Production Deployment Checklist](../../docs/PRODUCTION_CHECKLIST.md)
- [Security Best Practices](../../docs/SECURITY_CN.md)
