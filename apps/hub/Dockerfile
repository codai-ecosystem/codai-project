# Multi-stage build for Hub Next.js app
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Install dependencies without lockfile
COPY package.json ./
RUN corepack enable pnpm && pnpm install

# Build the source code
FROM base AS builder
WORKDIR /app

# Copy package.json and install again
COPY package.json ./
RUN corepack enable pnpm && pnpm install

# Copy all source files
COPY . .

# Build the Next.js application
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install necessary packages for bcrypt compilation
RUN apk add --no-cache curl python3 make g++ libc6-compat

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install bcrypt natively in production container
RUN corepack enable pnpm && pnpm add bcrypt@5.1.1 jsonwebtoken@9.0.2

USER nextjs

EXPOSE 4008

ENV PORT=4008
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4008/api/health || exit 1

CMD ["node", "server.js"]
