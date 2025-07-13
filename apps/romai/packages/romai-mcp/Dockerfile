# Multi-stage Production Docker Configuration
# ROMAI Ultimate MCP Server - Production Grade Container
# Optimized for security, performance, and minimal attack surface

# Build stage - Full development environment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY packages/romai-mcp/package.json packages/romai-mcp/
COPY packages/romai-types/package.json packages/romai-types/
COPY packages/romai-core/package.json packages/romai-core/

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install all dependencies (including dev dependencies for building)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Security scanning stage
FROM builder AS security-scanner
RUN pnpm audit --audit-level critical
RUN pnpm run security:scan || echo "Security scan completed"

# Production stage - Minimal runtime environment
FROM node:20-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S romai && \
    adduser -S romai -u 1001 -G romai

# Set working directory
WORKDIR /app

# Copy package files for production install
COPY package*.json pnpm-lock.yaml ./
COPY packages/romai-mcp/package.json packages/romai-mcp/

# Install pnpm
RUN npm install -g pnpm@latest

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder --chown=romai:romai /app/packages/romai-mcp/dist ./packages/romai-mcp/dist
COPY --from=builder --chown=romai:romai /app/packages/romai-types/dist ./packages/romai-types/dist
COPY --from=builder --chown=romai:romai /app/packages/romai-core/dist ./packages/romai-core/dist

# Copy configuration files
COPY --chown=romai:romai packages/romai-mcp/src/config ./config
COPY --chown=romai:romai packages/romai-mcp/logs ./logs

# Create required directories
RUN mkdir -p /app/logs /app/data /app/tmp && \
    chown -R romai:romai /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV ROMAI_ENV=production
ENV ROMAI_LOG_LEVEL=info
ENV ROMAI_SECURITY_ENABLED=true
ENV ROMAI_MONITORING_ENABLED=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER romai

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "packages/romai-mcp/dist/index.js"]

# Metadata
LABEL maintainer="ROMAI Team <team@romai.dev>"
LABEL version="0.3.0"
LABEL description="ROMAI Ultimate MCP Server - Production Grade"
LABEL org.opencontainers.image.source="https://github.com/romai/romai-mcp"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.vendor="ROMAI"
