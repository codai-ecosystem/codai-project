# MemorAI MCP Server Dockerfile
# TypeScript/Node.js MCP server for enterprise deployment

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY types/ ./types/ 2>/dev/null || true

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S memorai-mcp -u 1001 -G nodejs

# Create app directory
WORKDIR /app

# Copy built application and production dependencies
COPY --from=builder --chown=memorai-mcp:nodejs /app/dist ./dist
COPY --from=builder --chown=memorai-mcp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=memorai-mcp:nodejs /app/package.json ./

# Create logs and data directories
RUN mkdir -p /app/logs /app/data && \
    chown -R memorai-mcp:nodejs /app/logs /app/data

# Switch to non-root user
USER memorai-mcp

# Health check for MCP server
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "
        const net = require('net');
        const client = new net.Socket();
        client.setTimeout(5000);
        client.connect(8000, 'localhost', () => {
            client.destroy();
            process.exit(0);
        });
        client.on('error', () => process.exit(1));
        client.on('timeout', () => process.exit(1));
    "

# Expose MCP server port
EXPOSE 8000

# Environment variables
ENV NODE_ENV=production
ENV MCP_PORT=8000
ENV MCP_HOST=0.0.0.0
ENV LOG_LEVEL=info

# Start MCP server
CMD ["node", "dist/index.js"]
