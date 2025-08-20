# Enhanced API Gateway with Security - Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install security dependencies
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S codai && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G codai -g codai codai

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV JWT_SECRET=${JWT_SECRET}
ENV MASTER_API_KEY=${MASTER_API_KEY}

# Security settings
USER codai
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
