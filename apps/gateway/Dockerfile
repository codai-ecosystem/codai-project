# Docker configuration for CODAI Simple Gateway
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package.json and create simplified version without local dependencies
COPY package.json ./

# Create a temporary package.json without local dependencies
RUN cat package.json | \
    sed 's/"@codai\/api-standards": "file:.*"/"@codai\/api-standards": "^1.0.0"/g' | \
    sed 's/"@codai\/security": "file:.*"/"@codai\/security": "^1.0.0"/g' > temp-package.json && \
    mv temp-package.json package.json

# Install production dependencies only (without local packages)
RUN npm install --only=production --ignore-optional express cors helmet compression

# Install TypeScript for compilation
RUN npm install --save-dev typescript @types/node @types/express @types/cors

# Copy source code
COPY src/simple-gateway.ts ./
COPY tsconfig.json ./

# Create a simple tsconfig for compilation
RUN echo '{"compilerOptions":{"target":"ES2020","module":"commonjs","outDir":"./dist","rootDir":"./","strict":true,"esModuleInterop":true,"skipLibCheck":true,"forceConsistentCasingInFileNames":true}}' > tsconfig.json

# Compile TypeScript
RUN npx tsc simple-gateway.ts --outDir dist --target ES2020 --module commonjs --esModuleInterop --strict --skipLibCheck

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S gateway -u 1001 -G nodejs

# Change ownership
RUN chown -R gateway:nodejs /app
USER gateway

# Expose port
EXPOSE 4003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4003/health || exit 1

# Start the application
CMD ["node", "dist/simple-gateway.js"]
