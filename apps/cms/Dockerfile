# Strapi Production Dockerfile - Optimized & Secure
# 多阶段构建，优化镜像大小，支持中国镜像源

# Build arguments for Chinese registry support
ARG USE_CHINA_MIRROR=false
ARG NODE_MIRROR=https://registry.npmmirror.com
ARG ALPINE_MIRROR=mirrors.aliyun.com

# Stage 1: Builder - Install dependencies and build
FROM node:20-alpine AS builder
WORKDIR /opt

# Configure Alpine mirrors for faster package installation in China
ARG ALPINE_MIRROR
ARG USE_CHINA_MIRROR
RUN if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories; \
    fi

# Update apk repositories and install build dependencies
RUN apk update && apk add --no-cache \
      libc6-compat \
      python3 \
      make \
      g++ \
      tzdata

# Configure npm registry for China
ARG NODE_MIRROR
RUN if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      npm config set registry $NODE_MIRROR; \
    fi

# Copy package files for efficient caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build application
ENV NODE_ENV=production
RUN npm run build

# Remove devDependencies and clean npm cache
RUN npm prune --production \
    && npm cache clean --force \
    && rm -rf /root/.npm /tmp/*

# Stage 2: Runner - Production runtime
FROM node:20-alpine AS runner
WORKDIR /opt/app

# Configure Alpine mirrors for faster package installation in China
ARG ALPINE_MIRROR
ARG USE_CHINA_MIRROR
RUN if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_MIRROR}/g" /etc/apk/repositories; \
    fi

# Update apk repositories and install runtime dependencies
RUN apk update && apk add --no-cache \
      tzdata \
      curl

# Set timezone to Asia/Shanghai
ENV TZ=Asia/Shanghai
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

# Create non-root strapi user
RUN addgroup --system --gid 1001 strapi && \
    adduser --system --uid 1001 strapi

# Set production environment variables
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337 \
    TZ=Asia/Shanghai

# Copy production dependencies and built application
COPY --from=builder --chown=strapi:strapi /opt/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /opt/dist ./dist
COPY --from=builder --chown=strapi:strapi /opt/package.json ./package.json
COPY --from=builder --chown=strapi:strapi /opt/public ./public
COPY --from=builder --chown=strapi:strapi /opt/favicon.png ./favicon.png

# Create runtime directories with proper ownership
RUN mkdir -p ./public/uploads ./logs ./.cache && \
    chown -R strapi:strapi ./public ./logs ./.cache

# Switch to non-root user
USER strapi

# Expose Strapi port
EXPOSE 1337

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/_health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Strapi
CMD ["node", "dist/server.js"]
