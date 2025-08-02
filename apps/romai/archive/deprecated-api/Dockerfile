# RomAI API Gateway Dockerfile
# Multi-stage build for production deployment

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@latest

# Copy workspace dependencies
COPY ../../packages ./packages
COPY ../../apps/romai/api ./api

# Install dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

# Build the API
WORKDIR /app/api
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S romai-api -u 1001

# Set working directory
WORKDIR /app

# Install production dependencies
COPY --from=builder /app/api/package*.json ./
COPY --from=builder /app/api/pnpm-lock.yaml ./
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile --prefer-offline --prod

# Copy built application
COPY --from=builder --chown=romai-api:nodejs /app/api/dist ./dist
COPY --from=builder --chown=romai-api:nodejs /app/api/public ./public

# Create necessary directories
RUN mkdir -p /app/logs /app/tmp
RUN chown -R romai-api:nodejs /app

# Security enhancements
RUN apk add --no-cache dumb-init
RUN apk update && apk upgrade

# Switch to non-root user
USER romai-api

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 8000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    });
    req.on('error', () => process.exit(1));
    req.on('timeout', () => process.exit(1));
    req.end();
  "

# Environment variables
ENV NODE_ENV=production
ENV PORT=8000
ENV LOG_LEVEL=info

# Expose port
EXPOSE 8000

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

# Labels
LABEL maintainer="RomAI Team <team@codai.ro>"
LABEL version="1.0.0"
LABEL description="RomAI API Gateway - Romanian AI Intelligence Service"
LABEL org.opencontainers.image.title="RomAI API Gateway"
LABEL org.opencontainers.image.description="Production-ready API gateway for Romanian AI services"
LABEL org.opencontainers.image.vendor="CODAI"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.created="2025-01-02"
LABEL org.opencontainers.image.source="https://github.com/codai-project/romai"
LABEL org.opencontainers.image.documentation="https://romcp.ro/docs"
