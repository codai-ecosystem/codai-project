# MemorAI Backend Dockerfile
# Node.js production build

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S memorai -u 1001 -G nodejs

# Create app directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=memorai:nodejs /app/dist ./dist
COPY --from=builder --chown=memorai:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=memorai:nodejs /app/package.json ./

# Create logs directory
RUN mkdir -p /app/logs && \
    chown memorai:nodejs /app/logs

# Switch to non-root user
USER memorai

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4007/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Expose port
EXPOSE 4007

# Environment variables
ENV NODE_ENV=production
ENV PORT=4007
ENV HOST=0.0.0.0

# Start application
CMD ["node", "dist/index.js"]
