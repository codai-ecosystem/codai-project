# CODAI Dash Application - Production Docker Container
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl git

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./

# Debug: List available packages first
RUN echo "=== DEBUG: Available packages ===" && ls -la packages/ || echo "packages/ not found"

# Copy shared packages (with build artifacts)
COPY packages/ ./packages/

# Copy dash app
COPY apps/dash ./apps/dash/

# Copy specific API utils source to dash app for direct access  
COPY packages/api-utils/src/health.ts ./apps/dash/lib/health.ts

# Debug: Check what's in the lib directory
RUN echo "=== DEBUG: Contents of lib directory ===" && ls -la apps/dash/lib/ && echo "=== Working directory during build ===" && pwd && echo "=== Contents of current directory ===" && ls -la

# Install dependencies (without workspace builds since we copied dist)
RUN pnpm install --no-frozen-lockfile

# Debug: Check workspace package resolution
RUN echo "=== DEBUG: Checking @codai/api-utils resolution ===" && ls -la node_modules/@codai/ || echo "@codai not found"
RUN echo "=== DEBUG: api-utils package.json ===" && cat packages/api-utils/package.json || echo "api-utils package.json not found"

# Build the dash application
RUN cd apps/dash && pnpm run build

# Set working directory to dash app
WORKDIR /app/apps/dash

# Expose port
EXPOSE 4009

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4009/api/health || exit 1

# Start the application
CMD ["pnpm", "start"]