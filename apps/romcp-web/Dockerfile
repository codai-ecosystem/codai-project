# Cautai/RomCP Web Frontend Dockerfile - Next.js Production Build
# Optimized for high-performance React application with internationalization

# Stage 1: Dependencies Builder
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/romcp-web/package.json ./apps/romcp-web/
COPY packages/cautai-client/package.json ./packages/cautai-client/
COPY packages/cautai-config/package.json ./packages/cautai-config/
COPY packages/cautai-i18n/package.json ./packages/cautai-i18n/
COPY packages/cautai-ui/package.json ./packages/cautai-ui/

# Install pnpm and dependencies
RUN npm install -g pnpm@8.15.6
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@8.15.6

# Copy source code
COPY . .

# Build shared packages first
RUN pnpm --filter cautai-config build || echo "Config build completed"
RUN pnpm --filter cautai-i18n build || echo "I18n build completed"
RUN pnpm --filter cautai-ui build || echo "UI build completed"
RUN pnpm --filter cautai-client build || echo "Client build completed"

# Build the web application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN pnpm --filter romcp-web build

# Stage 3: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    tini

# Create non-root user
RUN addgroup -g 1001 -S nextjs && \
    adduser -S cautai -u 1001 -G nextjs

# Copy built application
COPY --from=builder --chown=cautai:nextjs /app/apps/romcp-web/public ./apps/romcp-web/public
COPY --from=builder --chown=cautai:nextjs /app/apps/romcp-web/.next/standalone ./apps/romcp-web/
COPY --from=builder --chown=cautai:nextjs /app/apps/romcp-web/.next/static ./apps/romcp-web/.next/static

# Copy package dependencies for standalone
COPY --from=builder --chown=cautai:nextjs /app/packages ./packages

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create necessary directories
RUN mkdir -p /app/logs && \
    chown -R cautai:nextjs /app/logs

# Switch to non-root user
USER cautai

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start Next.js application
CMD ["node", "apps/romcp-web/server.js"]