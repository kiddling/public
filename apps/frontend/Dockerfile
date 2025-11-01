FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm run build

FROM base AS runner

WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]
