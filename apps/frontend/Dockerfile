# Nuxt 3 Production Dockerfile - Node 20 Alpine with China Mirror Support
# 生产环境优化的 Nuxt 3 Dockerfile - 支持中国镜像加速
#
# Multi-stage build for minimal image size and security
# 多阶段构建以实现最小镜像体积和安全性
#
# Build arguments for China network optimization
# 构建参数支持中国网络优化

# ============================================
# Stage 1: Dependencies 依赖阶段
# ============================================
FROM node:20-alpine AS deps

# Build arguments for registry mirrors
# 构建参数：镜像源配置
ARG NPM_REGISTRY=https://registry.npmjs.org/
ARG PNPM_REGISTRY=https://registry.npmjs.org/
ARG ALPINE_MIRROR=""

# Configure Alpine mirror if provided
# 配置 Alpine 镜像源（如果提供）
RUN if [ -n "$ALPINE_MIRROR" ]; then \
      sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories; \
    fi

WORKDIR /app

# Install pnpm with corepack
# 使用 corepack 安装 pnpm
RUN coreutils --version || apk add --no-cache coreutils && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

# Copy registry configuration
# 复制镜像源配置
COPY .npmrc ./

# Configure pnpm registry if different from npm registry
# 配置 pnpm 镜像源
RUN if [ "$PNPM_REGISTRY" != "https://registry.npmjs.org/" ]; then \
      echo "registry=${PNPM_REGISTRY}" > .npmrc && \
      echo "auto-install-peers=true" >> .npmrc && \
      echo "strict-peer-dependencies=false" >> .npmrc && \
      echo "shamefully-hoist=false" >> .npmrc; \
    fi

# Copy package files
# 复制包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Use pnpm fetch for deterministic installs
# 使用 pnpm fetch 实现确定性安装
RUN pnpm fetch --frozen-lockfile

# Install all dependencies (including dev dependencies for build)
# 安装所有依赖（包括构建所需的开发依赖）
RUN pnpm install --frozen-lockfile --offline --prefer-offline

# ============================================
# Stage 2: Builder 构建阶段
# ============================================
FROM node:20-alpine AS builder

# Build arguments for registry mirrors
# 构建参数：镜像源配置
ARG NPM_REGISTRY=https://registry.npmjs.org/
ARG PNPM_REGISTRY=https://registry.npmjs.org/
ARG ALPINE_MIRROR=""

# Configure Alpine mirror if provided
# 配置 Alpine 镜像源（如果提供）
RUN if [ -n "$ALPINE_MIRROR" ]; then \
      sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories; \
    fi

WORKDIR /app

# Install pnpm
# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
# 从依赖阶段复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules

# Copy source files
# 复制源代码
COPY . .

# Build the Nuxt application
# 构建 Nuxt 应用
WORKDIR /app/apps/frontend
RUN pnpm build

# ============================================
# Stage 3: Runtime 运行阶段
# ============================================
FROM node:20-alpine AS runtime

# Build argument for Alpine mirror
# 构建参数：Alpine 镜像源
ARG ALPINE_MIRROR=""

# Configure Alpine mirror and install runtime dependencies
# 配置 Alpine 镜像源并安装运行时依赖
RUN if [ -n "$ALPINE_MIRROR" ]; then \
      sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories; \
    fi && \
    apk add --no-cache \
      tini \
      curl \
      tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

WORKDIR /app

# Create non-root user and group
# 创建非 root 用户和组
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Set environment variables
# 设置环境变量
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    TZ=Asia/Shanghai

# Copy only the built .output directory from builder
# 仅复制构建产物 .output 目录
COPY --from=builder --chown=nuxtjs:nodejs /app/apps/frontend/.output /app/.output

# Verify permissions
# 验证权限
RUN chmod -R 755 /app/.output && \
    chown -R nuxtjs:nodejs /app/.output

# Switch to non-root user
# 切换到非 root 用户
USER nuxtjs

# Expose port
# 暴露端口
EXPOSE 3000

# Health check using curl
# 使用 curl 进行健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini as init system for proper signal handling
# 使用 tini 作为 init 系统以正确处理信号
ENTRYPOINT ["/sbin/tini", "--"]

# Start the Nuxt application
# 启动 Nuxt 应用
CMD ["node", ".output/server/index.mjs"]
