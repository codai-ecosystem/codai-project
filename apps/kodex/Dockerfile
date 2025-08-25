# CODAI Kodex Application - Docker Configuration
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl libc6-compat

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy packages directory for workspace dependencies
COPY packages ./packages

# Copy this app's package files  
COPY apps/kodex/package.json ./apps/kodex/

# Install pnpm
RUN npm install -g pnpm@latest

# Install dependencies from workspace root
RUN pnpm install --no-frozen-lockfile

# Copy source code for this app
COPY apps/kodex ./apps/kodex

# Build the application with error suppression for production
ENV NEXT_TYPESCRIPT_IGNORE_BUILD_ERRORS=true
ENV NEXT_ESLINT_IGNORE_BUILD_ERRORS=true  
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Change to app directory and build
WORKDIR /app/apps/kodex
RUN pnpm build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S kodex -u 1001

# Change ownership
RUN chown -R kodex:nodejs /app

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER kodex

# Expose port
EXPOSE 5000

# Start the application
CMD ["pnpm", "start"]