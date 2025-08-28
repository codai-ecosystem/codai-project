# CAUTAI MCP HTTP Server Dockerfile
# Optimized for HTTP-based MCP server with SSE transport

FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

# Create non-root user
RUN addgroup -g 1001 -S cautai && \
    adduser -S cautai -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm install --only=production --no-audit --no-fund

# Copy source code
COPY src ./src

# Create necessary directories and set permissions
RUN mkdir -p /app/logs /app/cache && \
    chown -R cautai:cautai /app

# Switch to non-root user
USER cautai

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4952/health || exit 1

# Expose MCP HTTP port
EXPOSE 4952

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=4952
ENV HOST=0.0.0.0

# Start the HTTP MCP server
CMD ["npx", "tsx", "src/mcp-http-server.ts"]