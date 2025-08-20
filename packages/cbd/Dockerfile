# 🐳 CBD Universal Database - Docker Configuration

# Production-ready Docker build for CBD Core Database Service
FROM node:24.1.0-alpine AS production

# Install security updates and curl for health checks
RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S cbd -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies and tsx for TypeScript execution
RUN npm install --only=production && npm install tsx

# Copy application files (using existing JS files)
COPY --chown=cbd:nodejs src/ ./src/
COPY --chown=cbd:nodejs *.cjs ./
COPY --chown=cbd:nodejs *.js ./

# Set ownership
RUN chown -R cbd:nodejs /app

# Switch to non-root user
USER cbd

# Health check with curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4180/health || exit 1

# Expose port
EXPOSE 4180

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application using tsx for TypeScript
CMD ["npx", "tsx", "src/start.ts"]
