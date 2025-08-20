# Production Deployment Configuration for CBD Enterprise Engine
# Multi-stage build for optimized production container

# Build stage
FROM rust:1.75-slim as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    librocksdb-dev \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy dependency files first for better layer caching
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build the application in release mode
RUN cargo build --release --features full-enterprise

# Production stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    librocksdb8.8 \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

# Create non-root user for security
RUN groupadd -r cbduser && useradd -r -g cbduser cbduser

# Create application directories
RUN mkdir -p /app/data /app/logs /app/config \
    && chown -R cbduser:cbduser /app

# Copy the binary from builder stage
COPY --from=builder /app/target/release/cbd-engine /app/cbd-engine
RUN chmod +x /app/cbd-engine

# Copy configuration files
COPY docker/config/ /app/config/

# Switch to non-root user
USER cbduser

# Set working directory
WORKDIR /app

# Expose ports
EXPOSE 8080 8443 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /app/cbd-engine --health-check || exit 1

# Environment variables
ENV RUST_LOG=info \
    CBD_DATA_DIR=/app/data \
    CBD_LOG_DIR=/app/logs \
    CBD_CONFIG_DIR=/app/config

# Volume mounts for persistent data
VOLUME ["/app/data", "/app/logs"]

# Default command
CMD ["/app/cbd-engine", "--config", "/app/config/production.toml"]
