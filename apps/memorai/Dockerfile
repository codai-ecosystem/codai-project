# MemorAI Frontend Enterprise Dockerfile
# Next.js production build for enterprise deployment

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm for workspace compatibility
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application with optimizations
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set permissions for Next.js cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema if exists
COPY --from=builder /app/prisma ./prisma 2>/dev/null || true

# Generate Prisma client if schema exists
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi

# Switch to non-root user
USER nextjs

# Expose enterprise port
EXPOSE 4006

ENV PORT 4006
ENV HOSTNAME "0.0.0.0"

# Enhanced health check for enterprise monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD node -e "
    const http = require('http');
    const options = { 
      hostname: 'localhost', 
      port: process.env.PORT || 4006, 
      path: '/api/health', 
      method: 'GET',
      timeout: 8000
    };
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        process.exit(0);
      } else {
        console.error('Health check failed with status:', res.statusCode);
        process.exit(1);
      }
    });
    req.on('error', (err) => {
      console.error('Health check error:', err.message);
      process.exit(1);
    });
    req.on('timeout', () => {
      console.error('Health check timeout');
      process.exit(1);
    });
    req.end();
  "

# Start the Next.js server
CMD ["node", "server.js"]
