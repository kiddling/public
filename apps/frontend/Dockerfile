# Multi-stage Dockerfile for Nuxt 3 application optimized for China servers
# Target: <200MB compressed image size
# Note: This Dockerfile builds the frontend app from a pnpm monorepo

# ============================================
# Stage 1: Builder - Install dependencies and build
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install wget if not available (for pnpm installation)
RUN apk add --no-cache wget

# Install pnpm globally using standalone installer
# For China: Replace with https://npmmirror.com/mirrors/pnpm/ if needed
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

# Add pnpm to PATH
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copy workspace root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend app package.json
COPY apps/frontend/package.json ./apps/frontend/

# For China servers: Optionally use Taobao registry mirror
# Uncomment the following line for faster builds in China:
# RUN pnpm config set registry https://registry.npmmirror.com

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy frontend application source
COPY apps/frontend ./apps/frontend

# Build argument for git commit hash
ARG GIT_COMMIT_HASH=unknown
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

# Build the Nuxt application for production
WORKDIR /app/apps/frontend
RUN pnpm build

# ============================================
# Stage 2: Runtime - Minimal production image
# ============================================
FROM node:20-alpine AS runtime

# Set working directory
WORKDIR /app

# Install wget if not available (for pnpm installation)
RUN apk add --no-cache wget

# Install pnpm globally using standalone installer
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

# Add pnpm to PATH
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copy workspace root files for dependency resolution
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/

# For China servers: Optionally use Taobao registry mirror
# Uncomment the following line for faster builds in China:
# RUN pnpm config set registry https://registry.npmmirror.com

# Install only production dependencies for the frontend workspace
RUN pnpm install --prod --frozen-lockfile --filter frontend

# Copy built application from builder stage
COPY --from=builder /app/apps/frontend/.output ./apps/frontend/.output

# Build argument for git commit hash (pass to runtime)
ARG GIT_COMMIT_HASH=unknown
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nuxtuser && \
    adduser -S nuxtuser -u 1001 && \
    chown -R nuxtuser:nuxtuser /app

# Switch to non-root user
USER nuxtuser

# Set working directory to frontend app
WORKDIR /app/apps/frontend

# Expose port 3000 for the application
EXPOSE 3000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the Nuxt application
CMD ["node", ".output/server/index.mjs"]
