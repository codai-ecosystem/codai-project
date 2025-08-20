# CODAI WebSocket Service - Docker Configuration
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --only=production

# Copy built files
COPY dist/ ./dist/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S websocket -u 1001

# Change ownership of the app directory
RUN chown -R websocket:nodejs /app

# Switch to non-root user
USER websocket

# Expose port
EXPOSE 4900

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4900/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
