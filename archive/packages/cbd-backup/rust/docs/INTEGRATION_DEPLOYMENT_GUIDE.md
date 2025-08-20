# 🚀 CBD Engine Memory Integration & Deployment Guide

## Overview

This guide provides step-by-step instructions for integrating and deploying the CBD Engine Memory Management system in production environments. It covers everything from basic setup to advanced enterprise deployment scenarios.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start Integration](#quick-start-integration)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [MemoraiMCP Server Setup](#memoraimcp-server-setup)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Minimum Requirements:**
- Rust 1.75.0 or later
- SQLite 3.35.0 or later (with FTS5 support)
- 512 MB RAM
- 1 GB disk space

**Recommended for Production:**
- Rust 1.76.0 or later
- SQLite 3.42.0 or later
- 2 GB RAM minimum
- 10 GB disk space for memory storage
- SSD storage for optimal performance

### Dependencies

Add to your `Cargo.toml`:

```toml
[dependencies]
cbd-engine = { version = "0.1.0", features = ["memory-storage"] }
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
```

### Optional MemoraiMCP Server

The memory system can operate in two modes:
1. **Hybrid Mode** (Recommended): MemoraiMCP + Local Fallback
2. **Local-Only Mode**: SQLite fallback storage only

---

## Quick Start Integration

### 1. Basic Integration

```rust
// main.rs
use cbd_engine::{CBDEngine, memory::MemoryConfig};
use std::collections::HashMap;
use tracing::{info, error};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    // Create CBD Engine with default memory configuration
    let engine = CBDEngine::new().await?;
    
    // Test memory storage
    let memory_id = engine.store_memory(
        "test-agent",
        "This is a test memory entry",
        Some(HashMap::from([
            ("type".to_string(), "test".to_string()),
            ("priority".to_string(), "low".to_string()),
        ]))
    ).await?;
    
    info!("Stored memory with ID: {}", memory_id);
    
    // Test memory search
    let results = engine.search_memories("test-agent", "test memory", 10).await?;
    info!("Found {} memories", results.len());
    
    Ok(())
}
```

### 2. Environment Configuration

Create a `.env` file:

```bash
# MemoraiMCP Server Configuration
MEMORAI_URL=http://localhost:8002
MEMORAI_TIMEOUT=30000
MEMORAI_MAX_RETRIES=3

# Memory Storage Configuration
CBD_MEMORY_MAX_LOCAL=50000
CBD_MEMORY_RETENTION_DAYS=90
CBD_MEMORY_FALLBACK_PATH=./data/memory

# Performance Optimization
CBD_MEMORY_SIMILARITY_THRESHOLD=0.7
CBD_MEMORY_MAX_CONTEXT_SIZE=2000
CBD_MEMORY_ENABLE_ENCRYPTION=false

# Logging
RUST_LOG=cbd_engine=info,cbd_engine::memory=debug
```

---

## Development Setup

### 1. Clone and Build

```bash
# Clone the repository
git clone https://github.com/your-org/cbd-engine.git
cd cbd-engine

# Build with memory features
cargo build --features memory-storage

# Run tests
cargo test --features memory-storage

# Run with logging
RUST_LOG=debug cargo run --example memory_demo
```

### 2. Development Configuration

```rust
// config/development.rs
use cbd_engine::memory::MemoryConfig;

pub fn get_dev_memory_config() -> MemoryConfig {
    MemoryConfig {
        memorai_url: Some("http://localhost:8002".to_string()),
        max_local_memories: 1000, // Smaller for dev
        retention_period_days: 7,  // Shorter retention
        fallback_path: Some("./dev_data/memory".to_string()),
        enable_encryption: false,  // Disabled for dev
        cache_ttl_seconds: 300,   // Shorter cache for testing
        ..Default::default()
    }
}
```

### 3. Testing Setup

```rust
// tests/memory_integration_test.rs
use cbd_engine::{CBDEngine, memory::MemoryConfig};
use std::collections::HashMap;
use tempfile::TempDir;

#[tokio::test]
async fn test_memory_integration() {
    let temp_dir = TempDir::new().unwrap();
    
    let config = MemoryConfig {
        memorai_url: None, // Test in local-only mode
        fallback_path: Some(temp_dir.path().to_string_lossy().to_string()),
        max_local_memories: 100,
        retention_period_days: 1,
        ..Default::default()
    };
    
    let engine = CBDEngine::with_memory_config(config).await.unwrap();
    
    // Test storage
    let memory_id = engine.store_memory(
        "test-agent",
        "Test memory content",
        None
    ).await.unwrap();
    
    assert!(!memory_id.is_empty());
    
    // Test search
    let results = engine.search_memories("test-agent", "memory", 10).await.unwrap();
    assert_eq!(results.len(), 1);
    assert!(results[0].relevance_score > 0.0);
    
    // Test deletion
    let deleted = engine.delete_memory(&memory_id).await.unwrap();
    assert!(deleted);
}
```

---

## Production Deployment

### 1. Production Configuration

```rust
// src/config/production.rs
use cbd_engine::memory::MemoryConfig;
use std::env;

pub fn get_production_memory_config() -> MemoryConfig {
    MemoryConfig {
        memorai_url: env::var("MEMORAI_URL").ok(),
        memorai_timeout: env::var("MEMORAI_TIMEOUT")
            .unwrap_or_else(|_| "30000".to_string())
            .parse()
            .unwrap_or(30000),
        max_retries: env::var("MEMORAI_MAX_RETRIES")
            .unwrap_or_else(|_| "5".to_string())
            .parse()
            .unwrap_or(5),
        
        max_local_memories: env::var("CBD_MEMORY_MAX_LOCAL")
            .unwrap_or_else(|_| "100000".to_string())
            .parse()
            .unwrap_or(100000),
        retention_period_days: env::var("CBD_MEMORY_RETENTION_DAYS")
            .unwrap_or_else(|_| "90".to_string())
            .parse()
            .unwrap_or(90),
        fallback_path: env::var("CBD_MEMORY_FALLBACK_PATH").ok(),
        
        similarity_threshold: env::var("CBD_MEMORY_SIMILARITY_THRESHOLD")
            .unwrap_or_else(|_| "0.75".to_string())
            .parse()
            .unwrap_or(0.75),
        max_context_size: env::var("CBD_MEMORY_MAX_CONTEXT_SIZE")
            .unwrap_or_else(|_| "2000".to_string())
            .parse()
            .unwrap_or(2000),
        
        enable_encryption: env::var("CBD_MEMORY_ENABLE_ENCRYPTION")
            .unwrap_or_else(|_| "true".to_string())
            .parse()
            .unwrap_or(true),
        encryption_key: env::var("CBD_MEMORY_ENCRYPTION_KEY").ok(),
        
        enable_fallback: true,
        enable_context_enhancement: true,
        cache_ttl_seconds: 3600,
        enable_compression: true,
    }
}
```

### 2. Production Startup

```rust
// src/main.rs
use cbd_engine::CBDEngine;
use tracing::{info, error};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize structured logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer().json())
        .init();
    
    info!("Starting CBD Engine in production mode");
    
    // Load production configuration
    let memory_config = config::get_production_memory_config();
    
    // Initialize engine
    let engine = match CBDEngine::with_memory_config(memory_config).await {
        Ok(engine) => {
            info!("CBD Engine initialized successfully");
            engine
        }
        Err(e) => {
            error!("Failed to initialize CBD Engine: {}", e);
            return Err(e);
        }
    };
    
    // Verify memory system health
    match engine.get_memory_status().await {
        Ok(status) => info!("Memory system status: {}", status),
        Err(e) => error!("Memory system health check failed: {}", e),
    }
    
    // Start health monitoring
    tokio::spawn(async move {
        health_monitor(engine).await;
    });
    
    // Your application logic here
    run_application().await?;
    
    Ok(())
}

async fn health_monitor(engine: Arc<CBDEngine>) {
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60));
    
    loop {
        interval.tick().await;
        
        match engine.get_memory_status().await {
            Ok(status) => {
                match status.as_str() {
                    "Connected" => {} // All good
                    "Fallback" => tracing::warn!("Memory system using fallback storage"),
                    "Disconnected" => tracing::error!("Memory system disconnected"),
                    _ => tracing::warn!("Unknown memory status: {}", status),
                }
            }
            Err(e) => tracing::error!("Health check failed: {}", e),
        }
    }
}
```

### 3. Production Environment Variables

```bash
# production.env
MEMORAI_URL=https://memorai.your-domain.com
MEMORAI_TIMEOUT=45000
MEMORAI_MAX_RETRIES=5

CBD_MEMORY_MAX_LOCAL=500000
CBD_MEMORY_RETENTION_DAYS=365
CBD_MEMORY_FALLBACK_PATH=/data/cbd/memory

CBD_MEMORY_SIMILARITY_THRESHOLD=0.8
CBD_MEMORY_MAX_CONTEXT_SIZE=3000
CBD_MEMORY_ENABLE_ENCRYPTION=true
CBD_MEMORY_ENCRYPTION_KEY=your-secure-encryption-key-here

RUST_LOG=cbd_engine=info,cbd_engine::memory=warn
RUST_BACKTRACE=1
```

---

## MemoraiMCP Server Setup

### 1. Using Docker

```bash
# Pull MemoraiMCP server image
docker pull memorai/memorai-mcp:latest

# Run MemoraiMCP server
docker run -d \
    --name memorai-mcp \
    -p 8002:8002 \
    -v memorai_data:/app/data \
    -e MEMORAI_LOG_LEVEL=info \
    memorai/memorai-mcp:latest
```

### 2. Configuration

Create `memorai-config.yml`:

```yaml
server:
  host: "0.0.0.0"
  port: 8002
  timeout: 30s

storage:
  type: "postgresql"
  connection_string: "postgresql://user:pass@localhost/memorai"
  
memory:
  max_memories_per_agent: 100000
  default_retention_days: 90
  enable_compression: true
  
search:
  similarity_threshold: 0.7
  max_search_results: 100
  enable_full_text_search: true

logging:
  level: "info"
  format: "json"
```

### 3. Health Checks

```bash
# Check MemoraiMCP server health
curl -f http://localhost:8002/health || exit 1

# Test basic functionality
curl -X POST http://localhost:8002/remember \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "health-check",
    "content": "Health check memory",
    "metadata": {"type": "health_check"}
  }'
```

---

## Docker Deployment

### 1. Dockerfile

```dockerfile
# Dockerfile
FROM rust:1.76-slim as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy source
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build application
RUN cargo build --release --features memory-storage

# Runtime image
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libssl3 \
    libsqlite3-0 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary
COPY --from=builder /app/target/release/cbd-engine /app/

# Create data directory
RUN mkdir -p /data/memory

# Set environment variables
ENV CBD_MEMORY_FALLBACK_PATH=/data/memory
ENV RUST_LOG=cbd_engine=info

# Expose port (if running web service)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["./cbd-engine", "health-check"]

CMD ["./cbd-engine"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  memorai-mcp:
    image: memorai/memorai-mcp:latest
    ports:
      - "8002:8002"
    volumes:
      - memorai_data:/app/data
    environment:
      - MEMORAI_LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8002/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

  cbd-engine:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - cbd_data:/data
    environment:
      - MEMORAI_URL=http://memorai-mcp:8002
      - CBD_MEMORY_FALLBACK_PATH=/data/memory
      - CBD_MEMORY_MAX_LOCAL=100000
      - RUST_LOG=cbd_engine=info
    depends_on:
      memorai-mcp:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "./cbd-engine", "health-check"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s

volumes:
  memorai_data:
  cbd_data:
```

### 3. Build and Deploy

```bash
# Build and start services
docker-compose up --build -d

# Check logs
docker-compose logs -f cbd-engine

# Scale if needed
docker-compose up --scale cbd-engine=3 -d

# Monitor health
docker-compose ps
```

---

## Kubernetes Deployment

### 1. ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cbd-engine-config
data:
  MEMORAI_URL: "http://memorai-mcp-service:8002"
  CBD_MEMORY_MAX_LOCAL: "100000"
  CBD_MEMORY_RETENTION_DAYS: "90"
  CBD_MEMORY_SIMILARITY_THRESHOLD: "0.8"
  RUST_LOG: "cbd_engine=info"
```

### 2. Secret

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: cbd-engine-secret
type: Opaque
data:
  CBD_MEMORY_ENCRYPTION_KEY: <base64-encoded-key>
```

### 3. Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cbd-engine
  labels:
    app: cbd-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cbd-engine
  template:
    metadata:
      labels:
        app: cbd-engine
    spec:
      containers:
      - name: cbd-engine
        image: your-registry/cbd-engine:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: cbd-engine-config
        - secretRef:
            name: cbd-engine-secret
        volumeMounts:
        - name: memory-storage
          mountPath: /data/memory
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: memory-storage
        persistentVolumeClaim:
          claimName: cbd-memory-pvc
```

### 4. Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: cbd-engine-service
spec:
  selector:
    app: cbd-engine
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

### 5. PersistentVolumeClaim

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cbd-memory-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
```

---

## Monitoring & Observability

### 1. Health Endpoints

```rust
// src/health.rs
use axum::{http::StatusCode, response::Json, routing::get, Router};
use serde_json::json;

pub fn health_routes(engine: Arc<CBDEngine>) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/ready", get(readiness_check))
        .route("/metrics", get(metrics_endpoint))
        .with_state(engine)
}

async fn health_check(
    State(engine): State<Arc<CBDEngine>>
) -> Result<Json<serde_json::Value>, StatusCode> {
    match engine.get_memory_status().await {
        Ok(status) => Ok(Json(json!({
            "status": "healthy",
            "memory_backend": status,
            "timestamp": chrono::Utc::now().to_rfc3339()
        }))),
        Err(_) => Err(StatusCode::SERVICE_UNAVAILABLE),
    }
}

async fn readiness_check(
    State(engine): State<Arc<CBDEngine>>
) -> Result<Json<serde_json::Value>, StatusCode> {
    // Quick readiness check
    match engine.get_memory_stats().await {
        Ok(stats) => Ok(Json(json!({
            "status": "ready",
            "total_memories": stats.total_memories,
            "system_health": stats.system_health
        }))),
        Err(_) => Err(StatusCode::SERVICE_UNAVAILABLE),
    }
}

async fn metrics_endpoint(
    State(engine): State<Arc<CBDEngine>>
) -> Json<serde_json::Value> {
    let stats = engine.get_memory_stats().await.unwrap_or_default();
    
    Json(json!({
        "memory_metrics": {
            "total_memories": stats.total_memories,
            "memories_by_priority": stats.memories_by_priority,
            "average_access_frequency": stats.average_access_frequency,
            "system_health": stats.system_health
        },
        "performance_metrics": {
            // Add performance metrics here
        }
    }))
}
```

### 2. Prometheus Metrics

```rust
// Add to Cargo.toml
// prometheus = "0.13"
// axum-prometheus = "0.4"

use prometheus::{Counter, Histogram, Gauge, Registry};

pub struct MemoryMetrics {
    pub operations_total: Counter,
    pub operation_duration: Histogram,
    pub active_memories: Gauge,
    pub backend_status: Gauge,
}

impl MemoryMetrics {
    pub fn new(registry: &Registry) -> Self {
        let operations_total = Counter::new(
            "cbd_memory_operations_total",
            "Total number of memory operations"
        ).unwrap();
        
        let operation_duration = Histogram::new(
            "cbd_memory_operation_duration_seconds",
            "Duration of memory operations"
        ).unwrap();
        
        let active_memories = Gauge::new(
            "cbd_memory_active_total",
            "Number of active memories"
        ).unwrap();
        
        let backend_status = Gauge::new(
            "cbd_memory_backend_status",
            "Memory backend status (1=connected, 0.5=fallback, 0=disconnected)"
        ).unwrap();
        
        registry.register(Box::new(operations_total.clone())).unwrap();
        registry.register(Box::new(operation_duration.clone())).unwrap();
        registry.register(Box::new(active_memories.clone())).unwrap();
        registry.register(Box::new(backend_status.clone())).unwrap();
        
        Self {
            operations_total,
            operation_duration,
            active_memories,
            backend_status,
        }
    }
}
```

### 3. Logging Configuration

```rust
// src/logging.rs
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};
use tracing_appender::non_blocking::WorkerGuard;

pub fn setup_logging() -> WorkerGuard {
    let file_appender = tracing_appender::rolling::daily("./logs", "cbd-engine.log");
    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);
    
    tracing_subscriber::registry()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info"))
        )
        .with(
            tracing_subscriber::fmt::layer()
                .json()
                .with_writer(non_blocking)
        )
        .with(
            tracing_subscriber::fmt::layer()
                .compact()
                .with_writer(std::io::stdout)
        )
        .init();
    
    guard
}
```

---

## Troubleshooting

### Common Issues

#### 1. MemoraiMCP Connection Issues

**Symptoms:**
- Memory operations falling back to local storage
- Connection timeout errors
- HTTP 503 errors

**Solutions:**
```bash
# Check MemoraiMCP server status
curl -f http://localhost:8002/health

# Check network connectivity
telnet memorai-server 8002

# Verify configuration
echo $MEMORAI_URL

# Check logs for detailed error messages
tail -f ./logs/cbd-engine.log | grep -i memorai
```

#### 2. SQLite Database Issues

**Symptoms:**
- Database locked errors
- Slow query performance
- FTS5 search not working

**Solutions:**
```rust
// Database maintenance
engine.optimize_memory_storage().await?;

// Check database integrity
sqlite3 memory.db "PRAGMA integrity_check;"

// Enable WAL mode for better concurrency
sqlite3 memory.db "PRAGMA journal_mode=WAL;"
```

#### 3. Memory Performance Issues

**Symptoms:**
- Slow memory operations
- High memory usage
- Timeout errors

**Solutions:**
```rust
// Reduce cache size
let config = MemoryConfig {
    cache_ttl_seconds: 1800, // Reduce from 3600
    max_context_size: 1000,  // Reduce context size
    ..Default::default()
};

// Enable compression
let config = MemoryConfig {
    enable_compression: true,
    ..Default::default()
};

// Optimize similarity threshold
let config = MemoryConfig {
    similarity_threshold: 0.8, // Higher = more selective
    ..Default::default()
};
```

#### 4. Configuration Issues

**Symptoms:**
- Engine fails to start
- Invalid configuration errors
- Environment variable issues

**Solutions:**
```bash
# Validate configuration
cbd-engine validate-config

# Check environment variables
env | grep CBD_

# Use configuration file instead
cbd-engine --config /path/to/config.toml
```

### Debugging Commands

```bash
# Enable debug logging
export RUST_LOG=cbd_engine=debug,cbd_engine::memory=trace

# Check memory system status
curl http://localhost:8080/health

# View memory statistics
curl http://localhost:8080/metrics

# Database diagnostics
sqlite3 memory.db ".schema"
sqlite3 memory.db "SELECT COUNT(*) FROM memories;"
```

### Performance Tuning

```rust
// High-performance configuration
let config = MemoryConfig {
    memorai_timeout: 15000,        // Faster timeouts
    max_retries: 2,                // Fewer retries
    cache_ttl_seconds: 7200,       // Longer cache
    enable_compression: true,       // Reduce storage
    similarity_threshold: 0.85,     // More selective
    max_context_size: 1500,        // Optimal context
    ..Default::default()
};
```

This deployment guide provides comprehensive instructions for integrating and deploying the CBD Engine Memory Management system in various environments, from development to enterprise production deployments.
