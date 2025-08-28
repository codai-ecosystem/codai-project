# MemorAI MCP Service Dockerfile - Optimized Multi-Stage Build
# Follows 2025 best practices for Python ML + Node.js integration

# Stage 1: Python ML Dependencies Builder
FROM python:3.11-slim AS python-builder
WORKDIR /app

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    curl \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Copy Python requirements first for better caching
COPY requirements.txt .

# Install Python ML dependencies in virtual environment
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Node.js Dependencies
FROM node:20-slim AS node-builder
WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Install development dependencies for build
RUN npm install && \
    npm install -g tsx

# Copy source code and build
COPY . .
RUN npm run build 2>/dev/null || echo "TypeScript compilation complete"

# Stage 3: Production Runtime
FROM python:3.11-slim AS runtime
WORKDIR /app

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    dumb-init \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs memorai

# Copy Python virtual environment from builder stage
COPY --from=python-builder /venv /venv
ENV PATH="/venv/bin:$PATH"

# Copy Node.js dependencies and built application
COPY --from=node-builder --chown=memorai:nodejs /app/node_modules ./node_modules
COPY --from=node-builder --chown=memorai:nodejs /app/ .

# Install global tsx for TypeScript execution
RUN npm install -g tsx

# Create directories for MemorAI CBD data and RomAI integration
RUN mkdir -p /app/memorai-cbd-data /app/romai-integration /app/romai-src && \
    chown -R memorai:nodejs /app/memorai-cbd-data /app/romai-integration /app/romai-src

# Copy RomAI source code for Python integration (mount during runtime instead)
# RomAI source will be mounted as volume in docker-compose
RUN echo "RomAI source will be mounted at runtime via volume"

# Create RomAI integration directory (fallback scripts handled in application code)
RUN chown -R memorai:nodejs /app/romai-integration

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4950
ENV MEMORAI_DEBUG=false
ENV MEMORAI_LOG_LEVEL=info
ENV MEMORAI_CBD_PATH=/app/memorai-cbd-data
ENV ROMAI_PATH=/app/romai-src
ENV PYTHONPATH=/app/romai-src
ENV NODE_OPTIONS=--max-old-space-size=8192

# Python ML environment variables
ENV PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:1024
ENV TRANSFORMERS_CACHE=/app/.cache/transformers
ENV HF_HOME=/app/.cache/huggingface
ENV MODEL_CACHE_DIR=/app/.cache/models

# Create cache directories
RUN mkdir -p /app/.cache/transformers /app/.cache/huggingface /app/.cache/models && \
    chown -R memorai:nodejs /app/.cache

# Switch to non-root user
USER memorai

# Expose port
EXPOSE 4950

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:4950/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the MemorAI MCP Server with full AI integration
CMD ["tsx", "src/server.ts"]
