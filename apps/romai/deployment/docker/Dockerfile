# Multi-stage Dockerfile for RomAI Production Deployment
# Optimized for Romanian AI cultural consciousness and performance

# Stage 1: Base Python environment with Romanian language support
FROM python:3.11-slim as base

# Set environment variables for Romanian locale and UTF-8 support
ENV LANG=ro_RO.UTF-8 \
    LC_ALL=ro_RO.UTF-8 \
    LANGUAGE=ro_RO.UTF-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src \
    ROMAI_ENV=production \
    ROMAI_LOG_LEVEL=INFO

# Install system dependencies including Romanian language support
RUN apt-get update && apt-get install -y \
    locales \
    build-essential \
    git \
    curl \
    && locale-gen ro_RO.UTF-8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Stage 2: Dependencies installation
FROM base as dependencies

# Copy requirements files
COPY requirements.txt requirements-prod.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt -r requirements-prod.txt

# Stage 3: Model preparation
FROM dependencies as models

# Create model cache directories
RUN mkdir -p /app/.cache/models \
             /app/.cache/transformers \
             /app/.cache/huggingface \
             /app/models/romanian

# Copy model downloading script
COPY deployment/scripts/download-models.py ./scripts/
RUN python scripts/download-models.py --cache-dir /app/.cache/models

# Stage 4: Application build
FROM models as application

# Copy application source code
COPY src/ ./src/
COPY config/ ./config/
COPY deployment/config/ ./deployment/config/

# Create necessary directories
RUN mkdir -p /app/logs \
             /app/data \
             /app/temp \
             /app/exports

# Set proper permissions
RUN chmod +x src/main.py && \
    chown -R nobody:nobody /app

# Stage 5: Production runtime
FROM application as production

# Switch to non-root user for security
USER nobody

# Expose ports for different services
EXPOSE 6101 6102 8001 8002 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:6101/health || exit 1

# Default command - runs the main RomAI server
CMD ["python", "src/main.py", "--config", "deployment/config/production.yaml"]