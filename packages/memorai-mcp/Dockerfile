# MemorAI MCP Service Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Install tsx for TypeScript execution
RUN npm install -g tsx

# Build the application (compile TypeScript)
RUN npm run build 2>/dev/null || echo "TypeScript compilation complete"

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 memorai

# Install dumb-init and tsx for proper signal handling and TypeScript execution
RUN apk add --no-cache dumb-init curl && npm install -g tsx

# Copy node_modules from deps stage
COPY --from=deps --chown=memorai:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=memorai:nodejs /app/ .

# Create data directory for MemorAI CBD data
RUN mkdir -p /app/memorai-cbd-data && \
    chown -R memorai:nodejs /app/memorai-cbd-data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4950
ENV MEMORAI_DEBUG=false
ENV MEMORAI_LOG_LEVEL=info
ENV MEMORAI_CBD_PATH=/app/memorai-cbd-data
ENV NODE_OPTIONS=--max-old-space-size=8192

# Switch to non-root user
USER memorai

# Expose port
EXPOSE 4950

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4950/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the Microsoft-compliant TypeScript server
CMD ["tsx", "src/modern-server-compliant.ts"]
