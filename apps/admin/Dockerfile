# CODAI Admin Dashboard - Docker Configuration
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat curl

FROM base AS deps
WORKDIR /app

# Copy package files (using npm)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production --prefer-offline

FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build the application
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 admin

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
RUN chown -R admin:nodejs /app

# Switch to non-root user
USER admin

# Expose port
EXPOSE 4007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4007/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
