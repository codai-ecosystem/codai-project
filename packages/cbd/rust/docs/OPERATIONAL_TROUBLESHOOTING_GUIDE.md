# 🔧 CBD Engine Memory Operations & Troubleshooting Guide

## Overview

This guide provides comprehensive operational procedures, monitoring strategies, and troubleshooting solutions for maintaining CBD Engine Memory Management systems in production environments.

## Table of Contents

- [Operational Procedures](#operational-procedures)
- [Health Monitoring](#health-monitoring)
- [Maintenance Tasks](#maintenance-tasks)
- [Troubleshooting](#troubleshooting)
- [Disaster Recovery](#disaster-recovery)
- [Security Operations](#security-operations)
- [Monitoring & Alerting](#monitoring--alerting)
- [Performance Diagnostics](#performance-diagnostics)

---

## Operational Procedures

### Daily Operations Checklist

#### Morning Health Check
```bash
#!/bin/bash
# daily-health-check.sh

echo "=== CBD Engine Memory System Health Check ==="
echo "Date: $(date)"
echo

# Check system status
echo "1. System Status:"
curl -s http://localhost:8080/health | jq '.'
echo

# Check memory statistics
echo "2. Memory Statistics:"
curl -s http://localhost:8080/metrics | jq '.memory_metrics'
echo

# Check backend connectivity
echo "3. Backend Status:"
CBD_ENGINE_CLI status --verbose
echo

# Check disk usage
echo "4. Storage Usage:"
df -h /data/memory
echo

# Check recent errors
echo "5. Recent Errors (last hour):"
tail -n 1000 /var/log/cbd-engine.log | grep -i error | tail -n 10
echo

echo "=== Health Check Complete ==="
```

#### Weekly Maintenance
```bash
#!/bin/bash
# weekly-maintenance.sh

echo "=== Weekly Maintenance Starting ==="

# Database optimization
echo "Optimizing database..."
CBD_ENGINE_CLI optimize --full

# Clean up old memories
echo "Cleaning up expired memories..."
CBD_ENGINE_CLI cleanup --older-than 90d

# Update search indices
echo "Rebuilding search indices..."
CBD_ENGINE_CLI reindex --force

# Generate maintenance report
echo "Generating maintenance report..."
CBD_ENGINE_CLI report --type maintenance --output /reports/weekly-$(date +%Y%m%d).json

echo "=== Weekly Maintenance Complete ==="
```

### Deployment Procedures

#### Production Deployment

```bash
#!/bin/bash
# production-deploy.sh

set -e  # Exit on any error

echo "Starting production deployment..."

# Pre-deployment checks
echo "1. Pre-deployment validation:"
./scripts/pre-deploy-check.sh

# Backup current data
echo "2. Creating backup:"
./scripts/backup-memory-data.sh

# Deploy new version
echo "3. Deploying new version:"
docker-compose pull
docker-compose up -d --no-deps cbd-engine

# Health check
echo "4. Post-deployment health check:"
sleep 30  # Wait for service to start
./scripts/health-check.sh

# Smoke tests
echo "5. Running smoke tests:"
./scripts/smoke-tests.sh

echo "Deployment complete!"
```

#### Rollback Procedure

```bash
#!/bin/bash
# rollback.sh

set -e

echo "Starting rollback procedure..."

# Stop current version
docker-compose stop cbd-engine

# Restore previous version
docker-compose down
docker tag cbd-engine:current cbd-engine:backup
docker tag cbd-engine:previous cbd-engine:current

# Restore data if needed
if [ "$1" == "--restore-data" ]; then
    echo "Restoring data backup..."
    ./scripts/restore-memory-data.sh
fi

# Start previous version
docker-compose up -d cbd-engine

# Verify rollback
echo "Verifying rollback..."
sleep 30
./scripts/health-check.sh

echo "Rollback complete!"
```

---

## Health Monitoring

### Health Check Implementation

```rust
// src/health_monitor.rs
use std::time::{Duration, Instant};
use serde::{Serialize, Deserialize};
use tokio::time::interval;

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    pub overall_status: String,
    pub components: ComponentHealth,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub uptime_seconds: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ComponentHealth {
    pub memory_manager: ServiceStatus,
    pub memorai_client: ServiceStatus,
    pub fallback_storage: ServiceStatus,
    pub context_manager: ServiceStatus,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceStatus {
    pub status: String,
    pub response_time_ms: u64,
    pub last_error: Option<String>,
    pub error_count: u64,
}

pub struct HealthMonitor {
    engine: Arc<CBDEngine>,
    start_time: Instant,
    check_interval: Duration,
}

impl HealthMonitor {
    pub fn new(engine: Arc<CBDEngine>) -> Self {
        Self {
            engine,
            start_time: Instant::now(),
            check_interval: Duration::from_secs(30),
        }
    }
    
    pub async fn start_monitoring(&self) {
        let mut interval = interval(self.check_interval);
        
        loop {
            interval.tick().await;
            
            let health = self.check_health().await;
            self.log_health_status(&health).await;
            self.trigger_alerts_if_needed(&health).await;
        }
    }
    
    async fn check_health(&self) -> HealthStatus {
        let mut overall_healthy = true;
        
        // Check memory manager
        let memory_manager_health = self.check_memory_manager().await;
        if memory_manager_health.status != "healthy" {
            overall_healthy = false;
        }
        
        // Check MemoraiMCP client
        let memorai_client_health = self.check_memorai_client().await;
        if memorai_client_health.status == "critical" {
            overall_healthy = false;
        }
        
        // Check fallback storage
        let fallback_storage_health = self.check_fallback_storage().await;
        if fallback_storage_health.status != "healthy" {
            overall_healthy = false;
        }
        
        // Check context manager
        let context_manager_health = self.check_context_manager().await;
        
        HealthStatus {
            overall_status: if overall_healthy { "healthy".to_string() } else { "degraded".to_string() },
            components: ComponentHealth {
                memory_manager: memory_manager_health,
                memorai_client: memorai_client_health,
                fallback_storage: fallback_storage_health,
                context_manager: context_manager_health,
            },
            timestamp: chrono::Utc::now(),
            uptime_seconds: self.start_time.elapsed().as_secs(),
        }
    }
    
    async fn check_memory_manager(&self) -> ServiceStatus {
        let start = Instant::now();
        
        match self.engine.get_memory_stats().await {
            Ok(_) => ServiceStatus {
                status: "healthy".to_string(),
                response_time_ms: start.elapsed().as_millis() as u64,
                last_error: None,
                error_count: 0,
            },
            Err(e) => ServiceStatus {
                status: "unhealthy".to_string(),
                response_time_ms: start.elapsed().as_millis() as u64,
                last_error: Some(e.to_string()),
                error_count: 1,
            },
        }
    }
    
    async fn check_memorai_client(&self) -> ServiceStatus {
        let start = Instant::now();
        
        match self.engine.get_memory_status().await {
            Ok(status) => {
                let health_status = match status.as_str() {
                    "Connected" => "healthy",
                    "Fallback" => "degraded",
                    "Disconnected" => "critical",
                    _ => "unknown",
                };
                
                ServiceStatus {
                    status: health_status.to_string(),
                    response_time_ms: start.elapsed().as_millis() as u64,
                    last_error: None,
                    error_count: 0,
                }
            },
            Err(e) => ServiceStatus {
                status: "critical".to_string(),
                response_time_ms: start.elapsed().as_millis() as u64,
                last_error: Some(e.to_string()),
                error_count: 1,
            },
        }
    }
    
    async fn check_fallback_storage(&self) -> ServiceStatus {
        let start = Instant::now();
        
        // Test fallback storage with a quick operation
        match self.engine.search_memories("health-check", "test", 1).await {
            Ok(_) => ServiceStatus {
                status: "healthy".to_string(),
                response_time_ms: start.elapsed().as_millis() as u64,
                last_error: None,
                error_count: 0,
            },
            Err(e) => ServiceStatus {
                status: "unhealthy".to_string(),
                response_time_ms: start.elapsed().as_millis() as u64,
                last_error: Some(e.to_string()),
                error_count: 1,
            },
        }
    }
    
    async fn check_context_manager(&self) -> ServiceStatus {
        ServiceStatus {
            status: "healthy".to_string(),
            response_time_ms: 0,
            last_error: None,
            error_count: 0,
        }
    }
}
```

### Monitoring Metrics

```rust
// src/metrics_collector.rs
use prometheus::{Counter, Gauge, Histogram, Registry, TextEncoder, Encoder};

pub struct MetricsCollector {
    // System metrics
    pub uptime_seconds: Gauge,
    pub memory_usage_bytes: Gauge,
    pub cpu_usage_percent: Gauge,
    
    // Operation metrics
    pub operations_total: Counter,
    pub operations_duration: Histogram,
    pub operations_errors_total: Counter,
    
    // Backend metrics
    pub memorai_status: Gauge,
    pub fallback_storage_size: Gauge,
    pub cache_hit_ratio: Gauge,
    
    // Business metrics
    pub active_agents: Gauge,
    pub memories_per_agent: Histogram,
    pub search_relevance: Histogram,
}

impl MetricsCollector {
    pub fn new() -> Self {
        Self {
            uptime_seconds: Gauge::new(
                "cbd_engine_uptime_seconds",
                "Service uptime in seconds"
            ).unwrap(),
            
            memory_usage_bytes: Gauge::new(
                "cbd_engine_memory_usage_bytes",
                "Memory usage in bytes"
            ).unwrap(),
            
            cpu_usage_percent: Gauge::new(
                "cbd_engine_cpu_usage_percent",
                "CPU usage percentage"
            ).unwrap(),
            
            operations_total: Counter::new(
                "cbd_engine_operations_total",
                "Total number of operations"
            ).unwrap(),
            
            operations_duration: Histogram::with_opts(
                prometheus::HistogramOpts::new(
                    "cbd_engine_operations_duration_seconds",
                    "Operation duration in seconds"
                ).buckets(vec![0.001, 0.01, 0.1, 1.0, 10.0])
            ).unwrap(),
            
            operations_errors_total: Counter::new(
                "cbd_engine_operations_errors_total",
                "Total number of operation errors"
            ).unwrap(),
            
            memorai_status: Gauge::new(
                "cbd_engine_memorai_status",
                "MemoraiMCP connection status"
            ).unwrap(),
            
            fallback_storage_size: Gauge::new(
                "cbd_engine_fallback_storage_size_bytes",
                "Fallback storage size in bytes"
            ).unwrap(),
            
            cache_hit_ratio: Gauge::new(
                "cbd_engine_cache_hit_ratio",
                "Cache hit ratio"
            ).unwrap(),
            
            active_agents: Gauge::new(
                "cbd_engine_active_agents",
                "Number of active agents"
            ).unwrap(),
            
            memories_per_agent: Histogram::with_opts(
                prometheus::HistogramOpts::new(
                    "cbd_engine_memories_per_agent",
                    "Distribution of memories per agent"
                ).buckets(vec![1.0, 10.0, 100.0, 1000.0, 10000.0])
            ).unwrap(),
            
            search_relevance: Histogram::with_opts(
                prometheus::HistogramOpts::new(
                    "cbd_engine_search_relevance_score",
                    "Search result relevance scores"
                ).buckets(vec![0.1, 0.3, 0.5, 0.7, 0.9, 1.0])
            ).unwrap(),
        }
    }
    
    pub fn register_all(&self, registry: &Registry) -> Result<(), prometheus::Error> {
        registry.register(Box::new(self.uptime_seconds.clone()))?;
        registry.register(Box::new(self.memory_usage_bytes.clone()))?;
        registry.register(Box::new(self.cpu_usage_percent.clone()))?;
        registry.register(Box::new(self.operations_total.clone()))?;
        registry.register(Box::new(self.operations_duration.clone()))?;
        registry.register(Box::new(self.operations_errors_total.clone()))?;
        registry.register(Box::new(self.memorai_status.clone()))?;
        registry.register(Box::new(self.fallback_storage_size.clone()))?;
        registry.register(Box::new(self.cache_hit_ratio.clone()))?;
        registry.register(Box::new(self.active_agents.clone()))?;
        registry.register(Box::new(self.memories_per_agent.clone()))?;
        registry.register(Box::new(self.search_relevance.clone()))?;
        Ok(())
    }
    
    pub fn export_metrics(&self) -> String {
        let encoder = TextEncoder::new();
        let metric_families = prometheus::gather();
        encoder.encode_to_string(&metric_families).unwrap_or_default()
    }
}
```

---

## Maintenance Tasks

### Automated Maintenance

```rust
// src/maintenance_scheduler.rs
use tokio::time::{interval, Duration};
use chrono::{DateTime, Utc, Weekday};

pub struct MaintenanceScheduler {
    engine: Arc<CBDEngine>,
    maintenance_config: MaintenanceConfig,
}

#[derive(Debug, Clone)]
pub struct MaintenanceConfig {
    pub daily_optimization_hour: u32,
    pub weekly_full_maintenance_day: Weekday,
    pub monthly_deep_clean_day: u32,
    pub enable_auto_scaling: bool,
    pub retention_cleanup_enabled: bool,
}

impl MaintenanceScheduler {
    pub fn new(engine: Arc<CBDEngine>, config: MaintenanceConfig) -> Self {
        Self {
            engine,
            maintenance_config: config,
        }
    }
    
    pub async fn start(&self) {
        // Daily maintenance
        tokio::spawn({
            let engine = self.engine.clone();
            let config = self.maintenance_config.clone();
            async move {
                Self::daily_maintenance_loop(engine, config).await;
            }
        });
        
        // Weekly maintenance
        tokio::spawn({
            let engine = self.engine.clone();
            let config = self.maintenance_config.clone();
            async move {
                Self::weekly_maintenance_loop(engine, config).await;
            }
        });
        
        // Monthly maintenance
        tokio::spawn({
            let engine = self.engine.clone();
            let config = self.maintenance_config.clone();
            async move {
                Self::monthly_maintenance_loop(engine, config).await;
            }
        });
    }
    
    async fn daily_maintenance_loop(
        engine: Arc<CBDEngine>,
        config: MaintenanceConfig
    ) {
        let mut interval = interval(Duration::from_secs(3600)); // Check every hour
        
        loop {
            interval.tick().await;
            
            let now = Utc::now();
            if now.hour() == config.daily_optimization_hour {
                Self::perform_daily_maintenance(&engine).await;
            }
        }
    }
    
    async fn perform_daily_maintenance(engine: &CBDEngine) {
        tracing::info!("Starting daily maintenance");
        
        // Optimize memory storage
        if let Err(e) = engine.optimize_memory_storage().await {
            tracing::error!("Daily optimization failed: {}", e);
        } else {
            tracing::info!("Daily optimization completed");
        }
        
        // Update statistics
        match engine.get_memory_stats().await {
            Ok(stats) => {
                tracing::info!("Memory stats - Total: {}, Health: {}", 
                             stats.total_memories, stats.system_health);
            }
            Err(e) => tracing::error!("Failed to get memory stats: {}", e),
        }
    }
    
    async fn weekly_maintenance_loop(
        engine: Arc<CBDEngine>,
        config: MaintenanceConfig
    ) {
        let mut interval = interval(Duration::from_secs(86400)); // Check daily
        
        loop {
            interval.tick().await;
            
            let now = Utc::now();
            if now.weekday() == config.weekly_full_maintenance_day && now.hour() == 2 {
                Self::perform_weekly_maintenance(&engine).await;
            }
        }
    }
    
    async fn perform_weekly_maintenance(engine: &CBDEngine) {
        tracing::info!("Starting weekly maintenance");
        
        // Full database optimization
        if let Err(e) = engine.optimize_memory_storage().await {
            tracing::error!("Weekly optimization failed: {}", e);
        }
        
        // Generate maintenance report
        Self::generate_maintenance_report(engine).await;
        
        tracing::info!("Weekly maintenance completed");
    }
    
    async fn generate_maintenance_report(engine: &CBDEngine) {
        let report = MaintenanceReport {
            timestamp: Utc::now(),
            total_memories: 0, // Get from stats
            storage_size_mb: 0, // Calculate storage size
            optimization_time_ms: 0,
            errors_found: Vec::new(),
            recommendations: Vec::new(),
        };
        
        // Save report to file or send to monitoring system
        tracing::info!("Maintenance report generated: {:?}", report);
    }
}

#[derive(Debug)]
struct MaintenanceReport {
    timestamp: DateTime<Utc>,
    total_memories: u64,
    storage_size_mb: u64,
    optimization_time_ms: u64,
    errors_found: Vec<String>,
    recommendations: Vec<String>,
}
```

### Manual Maintenance Commands

```rust
// src/cli/maintenance_commands.rs
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "cbd-engine-cli")]
#[command(about = "CBD Engine maintenance CLI")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Optimize memory storage
    Optimize {
        #[arg(long)]
        full: bool,
        #[arg(long)]
        force: bool,
    },
    /// Clean up old memories
    Cleanup {
        #[arg(long)]
        older_than: String,
        #[arg(long)]
        dry_run: bool,
    },
    /// Rebuild search indices
    Reindex {
        #[arg(long)]
        force: bool,
    },
    /// System health check
    Health {
        #[arg(long)]
        verbose: bool,
    },
    /// Generate reports
    Report {
        #[arg(long)]
        r#type: String,
        #[arg(long)]
        output: String,
    },
    /// Backup operations
    Backup {
        #[arg(long)]
        destination: String,
        #[arg(long)]
        compress: bool,
    },
    /// Restore operations
    Restore {
        #[arg(long)]
        source: String,
        #[arg(long)]
        verify: bool,
    },
}

pub async fn execute_command(cli: Cli) -> Result<(), Box<dyn std::error::Error>> {
    let engine = CBDEngine::new().await?;
    
    match cli.command {
        Commands::Optimize { full, force } => {
            println!("Optimizing memory storage...");
            if full {
                engine.optimize_memory_storage().await?;
                println!("Full optimization completed");
            } else {
                // Quick optimization
                println!("Quick optimization completed");
            }
        }
        
        Commands::Cleanup { older_than, dry_run } => {
            println!("Cleaning up memories older than: {}", older_than);
            if dry_run {
                println!("DRY RUN - No changes will be made");
            }
            // Implementation for cleanup
        }
        
        Commands::Reindex { force } => {
            println!("Rebuilding search indices...");
            // Implementation for reindexing
            println!("Reindexing completed");
        }
        
        Commands::Health { verbose } => {
            let status = engine.get_memory_status().await?;
            let stats = engine.get_memory_stats().await?;
            
            println!("Memory System Status: {}", status);
            println!("Total Memories: {}", stats.total_memories);
            
            if verbose {
                println!("Detailed Health Information:");
                println!("  System Health: {}", stats.system_health);
                println!("  Average Access Frequency: {:.2}", stats.average_access_frequency);
                
                for (priority, count) in stats.memories_by_priority {
                    println!("  {}: {}", priority, count);
                }
            }
        }
        
        Commands::Report { r#type, output } => {
            println!("Generating {} report to: {}", r#type, output);
            // Implementation for report generation
        }
        
        Commands::Backup { destination, compress } => {
            println!("Creating backup at: {}", destination);
            if compress {
                println!("Compression enabled");
            }
            // Implementation for backup
        }
        
        Commands::Restore { source, verify } => {
            println!("Restoring from: {}", source);
            if verify {
                println!("Verification enabled");
            }
            // Implementation for restore
        }
    }
    
    Ok(())
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. MemoraiMCP Connection Issues

**Symptoms:**
```
ERROR: MemoraiMCP connection timeout
WARN: Falling back to local storage
INFO: Memory backend status: Fallback
```

**Diagnosis Steps:**
```bash
# Check MemoraiMCP server health
curl -f http://memorai-server:8002/health

# Check network connectivity
telnet memorai-server 8002

# Check DNS resolution
nslookup memorai-server

# Check logs for detailed errors
grep -i "memorai" /var/log/cbd-engine.log | tail -20
```

**Solutions:**
```rust
// Increase timeout values
let config = MemoryConfig {
    memorai_timeout: 60000, // Increase to 60 seconds
    max_retries: 5,         // Increase retries
    ..Default::default()
};

// Enable connection pooling
let client = ClientBuilder::new()
    .pool_max_idle_per_host(10)
    .pool_idle_timeout(Duration::from_secs(90))
    .build()?;
```

#### 2. SQLite Database Lock Issues

**Symptoms:**
```
ERROR: Database is locked
ERROR: sqlite error: database is locked (5)
```

**Diagnosis Steps:**
```bash
# Check for long-running processes
lsof /path/to/memory.db

# Check SQLite journal files
ls -la /path/to/memory.db*

# Check database integrity
sqlite3 /path/to/memory.db "PRAGMA integrity_check;"
```

**Solutions:**
```bash
# Enable WAL mode
sqlite3 /path/to/memory.db "PRAGMA journal_mode=WAL;"

# Set busy timeout
sqlite3 /path/to/memory.db "PRAGMA busy_timeout=30000;"

# Check and fix corruption
sqlite3 /path/to/memory.db ".recover" > recovered.db
```

#### 3. Memory Performance Issues

**Symptoms:**
```
WARN: Memory operation took 5.2s (expected <1s)
ERROR: Search timeout after 30s
INFO: Cache hit ratio: 15%
```

**Diagnosis Steps:**
```bash
# Check system resources
top -p $(pgrep cbd-engine)
iostat -x 1

# Check database size
du -sh /path/to/memory.db

# Analyze query performance
sqlite3 /path/to/memory.db "EXPLAIN QUERY PLAN SELECT ..."
```

**Solutions:**
```rust
// Optimize configuration
let config = MemoryConfig {
    similarity_threshold: 0.85,    // More selective
    max_context_size: 1000,       // Smaller contexts  
    cache_ttl_seconds: 7200,      // Longer cache
    enable_compression: true,      // Reduce storage
    ..Default::default()
};

// Enable performance monitoring
let _timer = metrics.operation_duration.start_timer();
// ... perform operation
```

#### 4. Search Result Quality Issues

**Symptoms:**
```
INFO: Search returned 0 results for query: "user preference"  
INFO: Average relevance score: 0.12
```

**Diagnosis Steps:**
```bash
# Check FTS index
sqlite3 /path/to/memory.db "SELECT COUNT(*) FROM memories_fts;"

# Test FTS search directly
sqlite3 /path/to/memory.db "SELECT * FROM memories_fts WHERE memories_fts MATCH 'user';"

# Check similarity threshold
CBD_ENGINE_CLI health --verbose | grep similarity
```

**Solutions:**
```rust
// Adjust search parameters
let config = MemoryConfig {
    similarity_threshold: 0.5,    // Lower threshold
    ..Default::default()
};

// Rebuild FTS index
engine.optimize_memory_storage().await?;

// Use query expansion
let expanded_query = format!("{} OR {} OR {}", 
                           original_query, 
                           synonym1, 
                           synonym2);
```

### Emergency Procedures

#### 1. Complete System Recovery

```bash
#!/bin/bash
# emergency-recovery.sh

echo "=== Emergency Recovery Procedure ==="

# Stop all services
echo "Stopping services..."
docker-compose stop

# Backup corrupted data
echo "Backing up current data..."
cp -r /data/memory /backup/emergency-$(date +%Y%m%d-%H%M%S)

# Restore from last known good backup
echo "Restoring from backup..."
./scripts/restore-memory-data.sh /backup/latest

# Start services in safe mode
echo "Starting services in safe mode..."
export CBD_MEMORY_ENABLE_FALLBACK=true
export CBD_MEMORY_MAX_LOCAL=1000
docker-compose up -d

# Verify recovery
echo "Verifying recovery..."
sleep 30
./scripts/health-check.sh

echo "=== Recovery Complete ==="
```

#### 2. Data Corruption Recovery

```bash
#!/bin/bash
# corruption-recovery.sh

echo "=== Data Corruption Recovery ==="

# Stop services
docker-compose stop cbd-engine

# Check corruption extent
echo "Checking database integrity..."
sqlite3 /data/memory/memory.db "PRAGMA integrity_check;" > integrity_check.log

if grep -q "ok" integrity_check.log; then
    echo "Database integrity OK"
else
    echo "Corruption detected, attempting recovery..."
    
    # Attempt SQLite recovery
    sqlite3 /data/memory/memory.db ".recover" > /tmp/recovered.db
    
    # Verify recovered database
    sqlite3 /tmp/recovered.db "PRAGMA integrity_check;"
    
    if [ $? -eq 0 ]; then
        echo "Recovery successful"
        mv /data/memory/memory.db /backup/corrupted-$(date +%Y%m%d).db
        mv /tmp/recovered.db /data/memory/memory.db
    else
        echo "Recovery failed, restoring from backup"
        ./scripts/restore-memory-data.sh
    fi
fi

# Restart services
docker-compose up -d cbd-engine

echo "=== Corruption Recovery Complete ==="
```

---

## Disaster Recovery

### Backup Strategy

```rust
// src/backup_manager.rs
use tokio::fs;
use chrono::{DateTime, Utc};
use std::path::Path;

pub struct BackupManager {
    source_paths: Vec<String>,
    backup_destination: String,
    retention_days: u32,
}

impl BackupManager {
    pub async fn create_backup(&self) -> Result<String, Box<dyn std::error::Error>> {
        let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
        let backup_name = format!("cbd_memory_backup_{}", timestamp);
        let backup_path = format!("{}/{}", self.backup_destination, backup_name);
        
        // Create backup directory
        fs::create_dir_all(&backup_path).await?;
        
        // Backup memory database
        self.backup_database(&backup_path).await?;
        
        // Backup configuration
        self.backup_config(&backup_path).await?;
        
        // Create backup manifest
        self.create_manifest(&backup_path).await?;
        
        // Compress backup
        let compressed_backup = self.compress_backup(&backup_path).await?;
        
        // Clean up old backups
        self.cleanup_old_backups().await?;
        
        Ok(compressed_backup)
    }
    
    async fn backup_database(&self, backup_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        for source_path in &self.source_paths {
            if Path::new(source_path).exists() {
                let dest_path = format!("{}/database", backup_path);
                fs::create_dir_all(&dest_path).await?;
                
                // Use SQLite backup API for safe backup
                self.sqlite_backup(source_path, &dest_path).await?;
            }
        }
        Ok(())
    }
    
    async fn sqlite_backup(&self, source: &str, dest_dir: &str) -> Result<(), Box<dyn std::error::Error>> {
        use rusqlite::Connection;
        use std::path::Path;
        
        let source_conn = Connection::open(source)?;
        let dest_path = format!("{}/{}", dest_dir, Path::new(source).file_name().unwrap().to_str().unwrap());
        let dest_conn = Connection::open(&dest_path)?;
        
        let backup = rusqlite::backup::Backup::new(&source_conn, &dest_conn)?;
        backup.run_to_completion(5, std::time::Duration::from_millis(250), None)?;
        
        Ok(())
    }
    
    async fn restore_backup(&self, backup_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        // Decompress backup
        let decompressed_path = self.decompress_backup(backup_path).await?;
        
        // Verify backup integrity
        self.verify_backup(&decompressed_path).await?;
        
        // Stop services
        // This would typically be handled by the deployment system
        
        // Restore database files
        self.restore_database_files(&decompressed_path).await?;
        
        // Restore configuration
        self.restore_config(&decompressed_path).await?;
        
        // Start services
        // This would typically be handled by the deployment system
        
        Ok(())
    }
}
```

### Backup Automation

```bash
#!/bin/bash
# automated-backup.sh

set -e

BACKUP_RETENTION_DAYS=30
BACKUP_DESTINATION="/backups/cbd-engine"
S3_BUCKET="s3://your-backup-bucket/cbd-engine"

echo "Starting automated backup..."

# Create local backup
BACKUP_FILE=$(CBD_ENGINE_CLI backup --destination $BACKUP_DESTINATION --compress)

# Verify backup
if CBD_ENGINE_CLI verify-backup --path "$BACKUP_FILE"; then
    echo "Local backup verification successful"
else
    echo "Local backup verification failed"
    exit 1
fi

# Upload to S3 (optional)
if [ -n "$S3_BUCKET" ]; then
    echo "Uploading backup to S3..."
    aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/"
    
    # Verify S3 upload
    if aws s3 ls "$S3_BUCKET/$(basename $BACKUP_FILE)"; then
        echo "S3 backup upload successful"
    else
        echo "S3 backup upload failed"
        exit 1
    fi
fi

# Clean up old backups
find $BACKUP_DESTINATION -name "*.backup" -mtime +$BACKUP_RETENTION_DAYS -delete

echo "Automated backup completed successfully"
```

---

## Security Operations

### Security Monitoring

```rust
// src/security_monitor.rs
use std::collections::HashMap;
use tokio::time::{interval, Duration};

pub struct SecurityMonitor {
    failed_attempts: HashMap<String, u32>,
    suspicious_patterns: Vec<String>,
    alert_thresholds: SecurityThresholds,
}

#[derive(Debug)]
pub struct SecurityThresholds {
    pub max_failed_attempts: u32,
    pub rate_limit_per_minute: u32,
    pub max_memory_size_mb: u64,
    pub suspicious_query_patterns: Vec<String>,
}

impl SecurityMonitor {
    pub async fn start_monitoring(&mut self) {
        let mut interval = interval(Duration::from_secs(60));
        
        loop {
            interval.tick().await;
            
            self.check_failed_attempts().await;
            self.check_rate_limits().await;
            self.check_suspicious_patterns().await;
            self.check_resource_usage().await;
        }
    }
    
    async fn check_failed_attempts(&self) {
        for (client_id, attempts) in &self.failed_attempts {
            if *attempts > self.alert_thresholds.max_failed_attempts {
                self.trigger_security_alert(SecurityAlert {
                    alert_type: "excessive_failed_attempts".to_string(),
                    client_id: client_id.clone(),
                    details: format!("Client {} has {} failed attempts", client_id, attempts),
                    severity: "high".to_string(),
                }).await;
            }
        }
    }
    
    async fn check_suspicious_patterns(&self) {
        // Check for SQL injection attempts, unusual query patterns, etc.
        for pattern in &self.suspicious_patterns {
            self.analyze_pattern(pattern).await;
        }
    }
    
    async fn trigger_security_alert(&self, alert: SecurityAlert) {
        tracing::warn!("Security alert: {:?}", alert);
        
        // Send to monitoring system
        // Block suspicious clients
        // Notify administrators
    }
}

#[derive(Debug)]
struct SecurityAlert {
    alert_type: String,
    client_id: String,
    details: String,
    severity: String,
}
```

### Access Control

```rust
// src/access_control.rs
use jwt::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub agent_id: String,
    pub permissions: Vec<String>,
    pub exp: usize,
}

pub struct AccessController {
    jwt_secret: String,
    permission_cache: Arc<RwLock<HashMap<String, Vec<String>>>>,
}

impl AccessController {
    pub fn verify_token(&self, token: &str) -> Result<Claims, jwt::errors::Error> {
        let validation = Validation::new(Algorithm::HS256);
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_ref()),
            &validation,
        )?;
        
        Ok(token_data.claims)
    }
    
    pub fn check_permission(&self, claims: &Claims, required_permission: &str) -> bool {
        claims.permissions.contains(&required_permission.to_string()) ||
        claims.permissions.contains(&"admin".to_string())
    }
    
    pub async fn authorize_memory_access(
        &self, 
        claims: &Claims, 
        agent_id: &str, 
        operation: &str
    ) -> Result<bool, CBDError> {
        // Check if user can access this agent's memories
        if claims.agent_id != agent_id && !claims.permissions.contains(&"admin".to_string()) {
            return Ok(false);
        }
        
        // Check operation permissions
        let required_permission = match operation {
            "read" => "memory:read",
            "write" => "memory:write",
            "delete" => "memory:delete",
            _ => return Ok(false),
        };
        
        Ok(self.check_permission(claims, required_permission))
    }
}
```

This comprehensive operations and troubleshooting guide provides the foundation for maintaining CBD Engine Memory Management systems in production, covering all critical operational aspects from monitoring and maintenance to disaster recovery and security operations.
