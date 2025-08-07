# CODAI MemorAI Application - Docker Configuration
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --no-audit

# Copy source code
COPY . .

    # Build the application
    ENV NEXT_TYPESCRIPT_IGNORE_BUILD_ERRORS=true
    ENV NEXT_ESLINT_IGNORE_BUILD_ERRORS=true
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV NODE_OPTIONS="--max-old-space-size=4096"
    RUN npm run build

    # Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S memorai -u 1001

# Change ownership of the app directory
RUN chown -R memorai:nodejs /app

# Switch to non-root user
USER memorai

# Expose port
EXPOSE 4006

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4006/health || exit 1

# Start the application
CMD ["npm", "start"]
