# Cautai MCP Server Dockerfile - Production Ready Multi-Stage Build
# Optimized for AI search engine with MCP protocol support

# Stage 1: Dependencies Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    curl \
    git \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev

# Copy package.json files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Copy only essential CAUTAI package.json files
COPY packages/cautai-mcp/package.json ./packages/cautai-mcp/package.json
COPY packages/cautai-client/package.json ./packages/cautai-client/package.json
COPY packages/cautai-config/package.json ./packages/cautai-config/package.json
COPY packages/cautai-logger/package.json ./packages/cautai-logger/package.json
COPY packages/cautai-i18n/package.json ./packages/cautai-i18n/package.json
COPY packages/cautai-ui/package.json ./packages/cautai-ui/package.json
COPY apps/cautai-server/package.json ./apps/cautai-server/package.json

# Install pnpm and dependencies
RUN npm install -g pnpm@8.15.6
RUN pnpm install --frozen-lockfile

# Copy only essential source files
COPY packages/cautai-config ./packages/cautai-config
COPY packages/cautai-logger ./packages/cautai-logger
COPY packages/cautai-i18n ./packages/cautai-i18n
COPY packages/cautai-client ./packages/cautai-client
COPY packages/cautai-mcp ./packages/cautai-mcp
COPY apps/cautai-server ./apps/cautai-server

# Build packages in correct order
RUN pnpm --filter cautai-config build || echo "Config build completed"
RUN pnpm --filter cautai-logger build || echo "Logger build completed"  
RUN pnpm --filter cautai-i18n build || echo "I18n build completed"
RUN pnpm --filter cautai-client build || echo "Client build completed"
RUN pnpm --filter cautai-mcp build || echo "MCP build completed"
RUN pnpm --filter cautai-server build || echo "Server build completed"

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    tini

# Create non-root user
RUN addgroup -g 1001 -S cautai && \
    adduser -S cautai -u 1001 -G cautai

# Copy built application and dependencies
COPY --from=builder --chown=cautai:cautai /app/node_modules ./node_modules
COPY --from=builder --chown=cautai:cautai /app/packages/cautai-mcp ./packages/cautai-mcp
COPY --from=builder --chown=cautai:cautai /app/packages/cautai-client ./packages/cautai-client
COPY --from=builder --chown=cautai:cautai /app/packages/cautai-config ./packages/cautai-config
COPY --from=builder --chown=cautai:cautai /app/packages/cautai-logger ./packages/cautai-logger
COPY --from=builder --chown=cautai:cautai /app/packages/cautai-i18n ./packages/cautai-i18n
COPY --from=builder --chown=cautai:cautai /app/apps/cautai-server ./apps/cautai-server
COPY --from=builder --chown=cautai:cautai /app/package.json ./
COPY --from=builder --chown=cautai:cautai /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production pnpm
RUN npm install -g pnpm@8.15.6 tsx

# Create necessary directories
RUN mkdir -p /app/logs /app/cache /app/data && \
    chown -R cautai:cautai /app/logs /app/cache /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV MCP_PORT=3001
ENV LOG_LEVEL=info
ENV CAUTAI_LOG_DIR=/app/logs
ENV CAUTAI_CACHE_DIR=/app/cache
ENV CAUTAI_DATA_DIR=/app/data
ENV NODE_OPTIONS=--max-old-space-size=2048

# Switch to non-root user
USER cautai

# Expose MCP server port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["tini", "--"]

# Start Cautai MCP Server
CMD ["tsx", "packages/cautai-mcp/src/server.ts"]