FROM node:18-alpine as base

# Install pnpm
RUN npm install -g pnpm

# Build stage
FROM base as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Production stage
FROM base as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Set environment variables
ENV PORT=8000
ENV HOST=0.0.0.0
ENV API_BASE_PATH=/api

# Expose port
EXPOSE 8000

# Start the server
CMD ["node", "dist/index.js"]
