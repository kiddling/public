# ==========================================
# Builder Stage - Install dependencies and build admin
# ==========================================
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files (pnpm-lock.yaml is optional since this can run standalone)
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install all dependencies (including devDependencies for building)
ARG NPM_REGISTRY=https://registry.npmjs.org
RUN pnpm config set registry ${NPM_REGISTRY} && \
    pnpm install --no-frozen-lockfile

# Copy application source
COPY . .

# Build Strapi admin panel
RUN NODE_ENV=production pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# ==========================================
# Runtime Stage - Minimal production image
# ==========================================
FROM node:20-alpine AS runtime

# Install runtime dependencies and set timezone for China
RUN apk add --no-cache \
    tzdata \
    tini \
    wget && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

# Create non-root user for security
RUN addgroup -g 1001 -S strapi && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G strapi -g strapi strapi

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files for production install
COPY --chown=strapi:strapi package.json pnpm-lock.yaml* ./

# Copy production dependencies from builder
COPY --from=builder --chown=strapi:strapi /app/node_modules ./node_modules

# Copy application code and built admin panel
COPY --chown=strapi:strapi . .
COPY --from=builder --chown=strapi:strapi /app/build ./build
COPY --from=builder --chown=strapi:strapi /app/.strapi ./.strapi

# Copy entrypoint script
COPY --chown=strapi:strapi docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create necessary directories with correct permissions
RUN mkdir -p /app/.tmp /app/public/uploads /app/database && \
    chown -R strapi:strapi /app

# Switch to non-root user
USER strapi

# Set environment variables
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337 \
    TZ=Asia/Shanghai

# Expose port
EXPOSE 1337

# Health check - Strapi should respond within 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:1337/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use tini as PID 1 to handle signals properly
ENTRYPOINT ["/sbin/tini", "--", "docker-entrypoint.sh"]

# Start Strapi
CMD ["pnpm", "start"]
