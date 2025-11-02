FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Build stage
FROM base AS builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/package-lock.json* ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY apps/frontend ./apps/frontend

# Build the application
WORKDIR /app/apps/frontend
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Copy built application
COPY --from=builder /app/apps/frontend/.output /app/.output

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nuxt -u 1001

# Set ownership of application files
RUN chown -R nuxt:nodejs /app

# Expose port
EXPOSE 3000

# Set environment variables
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

# Switch to non-root user
USER nuxt

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", ".output/server/index.mjs"]
