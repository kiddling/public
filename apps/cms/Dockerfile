# Strapi Multi-stage Dockerfile with Optimized Image Size
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /opt

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /opt

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
ENV NODE_ENV=production
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /opt/app

# Create a non-root user
RUN addgroup --system --gid 1001 strapi && \
    adduser --system --uid 1001 strapi

# Set environment variables
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337

# Copy production dependencies from deps stage
COPY --from=deps --chown=strapi:strapi /opt/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=strapi:strapi /opt/dist ./dist
COPY --from=builder --chown=strapi:strapi /opt/package.json ./package.json
COPY --from=builder --chown=strapi:strapi /opt/public ./public
COPY --from=builder --chown=strapi:strapi /opt/.strapi ./.strapi

# Create necessary directories
RUN mkdir -p ./public/uploads && chown -R strapi:strapi ./public

# Switch to non-root user
USER strapi

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/_health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
