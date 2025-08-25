# MemorAI GraphQL Server Production Dockerfile
FROM node:18-alpine

LABEL maintainer="CodeAI Team"
LABEL description="MemorAI GraphQL Server - Production"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S memorai -u 1001

# Install system dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy application files
COPY . .

# Set ownership to non-root user
RUN chown -R memorai:nodejs /app

# Switch to non-root user
USER memorai

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -X POST -H "Content-Type: application/json" \
        -d '{"query":"{ health { status } }"}' \
        http://localhost:4500 || exit 1

# Expose port
EXPOSE 4500

# Start the GraphQL server
CMD ["node", "memorai-graphql-server.js"]
