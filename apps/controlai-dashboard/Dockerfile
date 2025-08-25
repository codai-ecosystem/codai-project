# CODAI ControlAI Dashboard - Docker Configuration
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy root package files for workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy packages directory for workspace dependencies
COPY packages ./packages

# Copy this app's package.json
COPY apps/controlai-dashboard/package.json ./apps/controlai-dashboard/

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile --prefer-offline

# Build stage
FROM base AS builder
WORKDIR /app

# Copy root workspace files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/tsconfig.base.json ./tsconfig.base.json

# Copy source code for this specific app
COPY apps/controlai-dashboard ./apps/controlai-dashboard

# Set build environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build the application
WORKDIR /app/apps/controlai-dashboard
RUN npm install -g pnpm && pnpm build

# Runtime stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/controlai-dashboard/.next/standalone ./
COPY --from=builder /app/apps/controlai-dashboard/.next/static ./.next/static

# Create public directory if it doesn't exist
RUN mkdir -p ./public

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 4200

ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4200/health || exit 1

# Start the application
CMD ["node", "server.js"]
