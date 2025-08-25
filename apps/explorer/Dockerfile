# CODAI Explorer Application - Optimized Build
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl

# Install dependencies and build
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy necessary packages
COPY packages/shared-ui ./packages/shared-ui/
COPY packages/testing-utils ./packages/testing-utils/
COPY packages/api-utils ./packages/api-utils/

# Copy explorer app
COPY apps/explorer ./apps/explorer/

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Install dependencies for the whole workspace
RUN pnpm install --filter=explorer --prod=false

# Build the explorer app
WORKDIR /app/apps/explorer
RUN pnpm build

# Runtime stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/apps/explorer/.next/standalone ./
COPY --from=builder /app/apps/explorer/.next/static ./.next/static
COPY --from=builder /app/apps/explorer/public ./public

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 4400

ENV PORT=4400
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4400/health || exit 1

# Start the application
CMD ["node", "server.js"]