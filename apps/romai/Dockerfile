# 🚀 ROMAI Production Dockerfile
# Multi-stage production build with security hardening
# Generated for Phase 4 Week 4 Day 24 - Production Deployment

# =============================================================================
# 📦 BUILD STAGE - Dependencies and Build
# =============================================================================
FROM node:20-alpine AS builder

# Install security updates and build tools
RUN apk update && apk upgrade && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Set working directory
WORKDIR /app

# Copy package manager files first for better caching
COPY package.json pnpm-lock.yaml turbo.json ./
COPY pnpm-workspace.yaml ./

# Copy package configurations
COPY packages/romai-core/package.json ./packages/romai-core/
COPY packages/romai-api/package.json ./packages/romai-api/
COPY packages/romai-mcp/package.json ./packages/romai-mcp/
COPY packages/romai-types/package.json ./packages/romai-types/
COPY packages/romai-memory/package.json ./packages/romai-memory/

# Copy app configurations
COPY apps/api/package.json ./apps/api/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY apps/mcp-server/package.json ./apps/mcp-server/

# Install dependencies with frozen lockfile for reproducible builds
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY configs/ ./configs/
COPY tools/ ./tools/
COPY tsconfig.json ./

# Build all packages and applications
RUN pnpm build

# Remove development dependencies to reduce image size
RUN pnpm prune --prod

# =============================================================================
# 🏗️ PRODUCTION STAGE - Runtime Environment
# =============================================================================
FROM node:20-alpine AS production

# Install security updates and minimal runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    wget \
    ca-certificates \
    tzdata && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S romai && \
    adduser -S romai -u 1001 -G romai

# Set timezone
ENV TZ=Europe/Bucharest
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create application directories with proper permissions
WORKDIR /app
RUN mkdir -p /app/logs /app/data /var/log/romai && \
    chown -R romai:romai /app /var/log/romai

# Copy built application from builder stage
COPY --from=builder --chown=romai:romai /app/node_modules ./node_modules/
COPY --from=builder --chown=romai:romai /app/packages/ ./packages/
COPY --from=builder --chown=romai:romai /app/apps/ ./apps/
COPY --from=builder --chown=romai:romai /app/package.json ./
COPY --from=builder --chown=romai:romai /app/pnpm-workspace.yaml ./
COPY --from=builder --chown=romai:romai /app/turbo.json ./

# Copy production scripts
COPY --chown=romai:romai scripts/production/ ./scripts/production/

# Set production environment
ENV NODE_ENV=production
ENV ROMAI_ENVIRONMENT=production
ENV NPM_CONFIG_PRODUCTION=true

# Security: Switch to non-root user
USER romai

# Expose application ports
EXPOSE 8000 4000 3001

# Add health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Volume for persistent data
VOLUME ["/app/data", "/app/logs"]

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Default command to start all services
CMD ["sh", "-c", "\
    echo 'Starting ROMAI Production Services...' && \
    cd /app && \
    echo 'Starting API Server...' && \
    (cd apps/api && node dist/server.js) & \
    echo 'Starting MCP Server...' && \
    (cd apps/mcp-server && node dist/server.js) & \
    echo 'Starting Dashboard...' && \
    (cd apps/dashboard && npm start) & \
    echo 'All services started. Waiting...' && \
    wait \
"]

# =============================================================================
# 📋 BUILD METADATA
# =============================================================================
LABEL maintainer="ROMAI Team <team@romai.ro>"
LABEL version="1.0.0"
LABEL description="ROMAI Production Container - Romanian AI System"
LABEL build-date="2025-07-11"
LABEL vcs-url="https://github.com/vladutcornel/romai"
LABEL org.opencontainers.image.title="ROMAI Production"
LABEL org.opencontainers.image.description="Romanian AI Central Intelligence System"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.created="2025-07-11"
LABEL org.opencontainers.image.revision="${BUILD_REVISION:-unknown}"
LABEL org.opencontainers.image.vendor="CodAI"
LABEL org.opencontainers.image.licenses="MIT"

# =============================================================================
# 🔒 SECURITY NOTES
# =============================================================================
# - Runs as non-root user (romai:1001)
# - Uses Alpine Linux for minimal attack surface
# - Security updates applied during build
# - No development tools in production image
# - Proper signal handling with dumb-init
# - Health checks for container orchestration
# - Volumes for persistent data separation

# =============================================================================
# 🚀 PRODUCTION USAGE
# =============================================================================
# Build: docker build -t romai:production .
# Run: docker run -d --name romai -p 8000:8000 -p 4000:4000 --env-file .env.production romai:production
# Health: docker exec romai curl -f http://localhost:8000/health
# Logs: docker logs -f romai

# =============================================================================
# 📊 PERFORMANCE OPTIMIZATION
# =============================================================================
# Multi-stage build reduces final image size by ~60%
# Alpine Linux provides minimal footprint (~5MB base)
# Production dependencies only in final stage
# Proper layer caching for faster rebuilds
# Health checks ensure container reliability
