# CODAI RomAI Application - Multi-Service Docker Configuration
FROM node:20-alpine as frontend-builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl python3 py3-pip

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --prefer-offline --legacy-peer-deps

# Copy source code
COPY . .

# Build the frontend application
RUN npm run build

# Python runtime stage
FROM python:3.11-slim as python-runtime

# Install system dependencies for Python
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY src/ml/requirements.txt /app/python/requirements.txt
WORKDIR /app/python
RUN pip install -r requirements.txt

# Final stage combining both
FROM node:20-alpine

# Install system dependencies including Python
RUN apk add --no-cache curl python3 py3-pip

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S romai -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json
COPY --from=frontend-builder /app/node_modules ./node_modules

# Copy Python components
COPY --chown=romai:nodejs src/ ./src/

# Install Python requirements
RUN pip3 install --break-system-packages fastapi uvicorn pydantic python-multipart httpx

# Switch to non-root user
USER romai

# Expose ports
EXPOSE 6100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:6100/api/health || exit 1

# Start the frontend service
CMD ["npm", "start"]
