# ⚡ CBD Engine Memory Performance Optimization Guide

## Overview

This guide provides comprehensive strategies for optimizing CBD Engine Memory Management system performance across different deployment scenarios and workload patterns.

## Table of Contents

- [Performance Architecture](#performance-architecture)
- [Configuration Optimization](#configuration-optimization)
- [Database Performance](#database-performance)
- [Network Optimization](#network-optimization)
- [Memory Management](#memory-management)
- [Caching Strategies](#caching-strategies)
- [Monitoring & Profiling](#monitoring--profiling)
- [Scaling Strategies](#scaling-strategies)

---

## Performance Architecture

### High-Performance Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Application     │    │ CBD Engine       │    │ MemoraiMCP      │
│ (Connection     │◄──►│ (Connection      │◄──►│ (Load Balanced) │
│  Pooling)       │    │  Pool + Cache)   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                         │
                              │                         │
                       ┌──────▼──────┐          ┌──────▼──────┐
                       │ SQLite FTS5 │          │ PostgreSQL  │
                       │ (Optimized) │          │ (Clustered) │
                       └─────────────┘          └─────────────┘
```

### Performance Characteristics by Component

| Component | Latency | Throughput | Scalability |
|-----------|---------|------------|-------------|
| **MemoraiMCP HTTP** | 10-50ms | 1000+ ops/sec | Horizontal |
| **SQLite Fallback** | 1-5ms | 5000+ ops/sec | Vertical |
| **Memory Cache** | 0.1ms | 50000+ ops/sec | Memory bound |
| **Context Enhancement** | 5-20ms | 500+ ops/sec | CPU bound |

---

## Configuration Optimization

### High-Performance Configuration

```rust
use cbd_engine::memory::MemoryConfig;

// Optimized for high throughput
pub fn high_throughput_config() -> MemoryConfig {
    MemoryConfig {
        // Network optimization
        memorai_timeout: 5000,              // Fast timeouts
        max_retries: 2,                     // Minimal retries
        
        // Memory optimization
        max_local_memories: 1_000_000,      // Large local storage
        similarity_threshold: 0.85,         // Selective matching
        max_context_size: 1000,             // Smaller contexts
        
        // Cache optimization
        cache_ttl_seconds: 7200,            // 2-hour cache
        enable_compression: true,            // Reduce memory usage
        enable_context_enhancement: false,   // Disable for speed
        
        // Storage optimization
        retention_period_days: 30,          // Shorter retention
        enable_fallback: true,
        
        ..Default::default()
    }
}

// Optimized for low latency
pub fn low_latency_config() -> MemoryConfig {
    MemoryConfig {
        // Aggressive timeouts
        memorai_timeout: 2000,              // 2s timeout
        max_retries: 1,                     // Single retry
        
        // Smaller working set
        max_local_memories: 100_000,        // Smaller cache
        similarity_threshold: 0.9,          // Very selective
        max_context_size: 500,              // Minimal context
        
        // Fast caching
        cache_ttl_seconds: 1800,            // 30-minute cache
        enable_compression: false,           // No compression overhead
        enable_context_enhancement: false,   // Disable for speed
        
        // Optimized fallback
        enable_fallback: true,
        
        ..Default::default()
    }
}

// Optimized for memory efficiency
pub fn memory_efficient_config() -> MemoryConfig {
    MemoryConfig {
        // Conservative memory usage
        max_local_memories: 50_000,         // Smaller local storage
        similarity_threshold: 0.8,          // Broader matching
        max_context_size: 2000,            // Larger contexts
        
        // Aggressive compression
        enable_compression: true,           // Always compress
        cache_ttl_seconds: 10800,          // 3-hour cache
        
        // Longer retention
        retention_period_days: 365,        // Full year retention
        
        ..Default::default()
    }
}
```

### Environment-Specific Optimization

#### Development Environment
```bash
# development.env
CBD_MEMORY_MAX_LOCAL=1000
CBD_MEMORY_CACHE_TTL=300
CBD_MEMORY_SIMILARITY_THRESHOLD=0.7
CBD_MEMORY_ENABLE_COMPRESSION=false
CBD_MEMORY_RETENTION_DAYS=7
RUST_LOG=cbd_engine=debug
```

#### Production Environment  
```bash
# production.env
CBD_MEMORY_MAX_LOCAL=500000
CBD_MEMORY_CACHE_TTL=3600
CBD_MEMORY_SIMILARITY_THRESHOLD=0.85
CBD_MEMORY_ENABLE_COMPRESSION=true
CBD_MEMORY_RETENTION_DAYS=90
RUST_LOG=cbd_engine=info,cbd_engine::memory=warn
```

#### High-Scale Environment
```bash
# high-scale.env
CBD_MEMORY_MAX_LOCAL=2000000
CBD_MEMORY_CACHE_TTL=7200
CBD_MEMORY_SIMILARITY_THRESHOLD=0.9
CBD_MEMORY_ENABLE_COMPRESSION=true
CBD_MEMORY_RETENTION_DAYS=30
MEMORAI_TIMEOUT=3000
MEMORAI_MAX_RETRIES=1
RUST_LOG=cbd_engine=warn
```

---

## Database Performance

### SQLite Optimization

#### 1. Database Configuration

```rust
use rusqlite::Connection;

pub fn optimize_sqlite_connection(conn: &Connection) -> Result<(), rusqlite::Error> {
    // Enable WAL mode for better concurrency
    conn.pragma_update(None, "journal_mode", "WAL")?;
    
    // Optimize for performance
    conn.pragma_update(None, "synchronous", "NORMAL")?;
    conn.pragma_update(None, "cache_size", 100000)?;          // 100MB cache
    conn.pragma_update(None, "temp_store", "MEMORY")?;        // In-memory temp
    conn.pragma_update(None, "mmap_size", 268435456)?;        // 256MB mmap
    
    // Optimize for SSD
    conn.pragma_update(None, "page_size", 4096)?;
    
    // Enable query optimizer
    conn.pragma_update(None, "optimize", ())?;
    
    Ok(())
}
```

#### 2. Index Optimization

```sql
-- Core performance indices
CREATE INDEX IF NOT EXISTS idx_memories_agent_created 
    ON memories(agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_entity_type 
    ON memories(entity_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_priority_updated 
    ON memories(priority, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_session_created 
    ON memories(session_id, created_at DESC) 
    WHERE session_id IS NOT NULL;

-- Composite indices for common queries
CREATE INDEX IF NOT EXISTS idx_memories_agent_entity_priority 
    ON memories(agent_id, entity_type, priority);

-- Partial indices for performance
CREATE INDEX IF NOT EXISTS idx_memories_high_priority 
    ON memories(agent_id, created_at DESC) 
    WHERE priority = 'high';
```

#### 3. Query Optimization

```rust
// Optimized search with prepared statements
pub struct OptimizedMemorySearch {
    search_stmt: rusqlite::Statement<'static>,
    count_stmt: rusqlite::Statement<'static>,
}

impl OptimizedMemorySearch {
    pub fn prepare_statements(conn: &Connection) -> Result<Self, rusqlite::Error> {
        let search_stmt = conn.prepare("
            SELECT m.*, 
                   bm25(memories_fts, ?) as rank
            FROM memories_fts 
            JOIN memories m ON memories_fts.rowid = m.id
            WHERE memories_fts MATCH ? 
                AND m.agent_id = ?
            ORDER BY rank, m.updated_at DESC
            LIMIT ?
        ")?;
        
        let count_stmt = conn.prepare("
            SELECT COUNT(*)
            FROM memories_fts 
            JOIN memories m ON memories_fts.rowid = m.id
            WHERE memories_fts MATCH ? 
                AND m.agent_id = ?
        ")?;
        
        Ok(Self { search_stmt, count_stmt })
    }
}
```

#### 4. Maintenance Optimization

```rust
use tokio::time::{interval, Duration};

pub async fn start_database_maintenance(storage: Arc<FallbackStorage>) {
    let mut maintenance_interval = interval(Duration::from_secs(3600)); // Hourly
    
    tokio::spawn(async move {
        loop {
            maintenance_interval.tick().await;
            
            if let Err(e) = perform_maintenance(&storage).await {
                tracing::warn!("Database maintenance failed: {}", e);
            }
        }
    });
}

async fn perform_maintenance(storage: &FallbackStorage) -> Result<(), CBDError> {
    // Optimize database
    storage.optimize().await?;
    
    // Update table statistics
    storage.analyze().await?;
    
    // Clean up old memories
    storage.cleanup_old_memories().await?;
    
    // Rebuild FTS index if needed
    storage.optimize_fts_index().await?;
    
    tracing::info!("Database maintenance completed");
    Ok(())
}
```

---

## Network Optimization

### HTTP Client Optimization

```rust
use reqwest::{Client, ClientBuilder};
use std::time::Duration;

pub fn create_optimized_http_client() -> Result<Client, reqwest::Error> {
    ClientBuilder::new()
        // Connection pooling
        .pool_max_idle_per_host(20)
        .pool_idle_timeout(Duration::from_secs(90))
        
        // Timeouts
        .connect_timeout(Duration::from_secs(5))
        .timeout(Duration::from_secs(30))
        
        // HTTP/2 optimization
        .http2_prior_knowledge()
        .http2_keep_alive_interval(Duration::from_secs(30))
        .http2_keep_alive_timeout(Duration::from_secs(10))
        .http2_keep_alive_while_idle(true)
        
        // Compression
        .gzip(true)
        .brotli(true)
        
        // Security
        .https_only(true)
        .tls_sni(true)
        
        .build()
}
```

### Connection Pooling Strategy

```rust
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct ConnectionPool {
    clients: Arc<RwLock<Vec<Client>>>,
    max_clients: usize,
    current_index: Arc<RwLock<usize>>,
}

impl ConnectionPool {
    pub fn new(max_clients: usize) -> Self {
        let mut clients = Vec::with_capacity(max_clients);
        for _ in 0..max_clients {
            if let Ok(client) = create_optimized_http_client() {
                clients.push(client);
            }
        }
        
        Self {
            clients: Arc::new(RwLock::new(clients)),
            max_clients,
            current_index: Arc::new(RwLock::new(0)),
        }
    }
    
    pub async fn get_client(&self) -> Option<Client> {
        let clients = self.clients.read().await;
        if clients.is_empty() {
            return None;
        }
        
        let mut index = self.current_index.write().await;
        let client = clients.get(*index).cloned();
        *index = (*index + 1) % clients.len();
        
        client
    }
}
```

### Retry Strategy Optimization

```rust
use backoff::{ExponentialBackoff, backoff::Backoff};

pub async fn execute_with_optimized_retry<T, F, Fut>(
    operation: F,
    max_retries: usize,
) -> Result<T, CBDError>
where
    F: Fn() -> Fut,
    Fut: std::future::Future<Output = Result<T, CBDError>>,
{
    let mut backoff = ExponentialBackoff {
        initial_interval: Duration::from_millis(100),
        max_interval: Duration::from_secs(2),
        multiplier: 1.5,
        max_elapsed_time: Some(Duration::from_secs(30)),
        ..Default::default()
    };
    
    for attempt in 0..max_retries {
        match operation().await {
            Ok(result) => return Ok(result),
            Err(e) if e.is_retriable() && attempt < max_retries - 1 => {
                if let Some(delay) = backoff.next_backoff() {
                    tokio::time::sleep(delay).await;
                } else {
                    break; // Max elapsed time reached
                }
            }
            Err(e) => return Err(e),
        }
    }
    
    Err(CBDError::TimeoutError("Max retries exceeded".to_string()))
}
```

---

## Memory Management

### Memory Pool Optimization

```rust
use std::sync::Arc;
use parking_lot::RwLock;

pub struct MemoryPool<T> {
    pool: Arc<RwLock<Vec<T>>>,
    factory: Box<dyn Fn() -> T + Send + Sync>,
    max_size: usize,
}

impl<T: Send + Sync + 'static> MemoryPool<T> {
    pub fn new<F>(factory: F, max_size: usize) -> Self 
    where
        F: Fn() -> T + Send + Sync + 'static,
    {
        Self {
            pool: Arc::new(RwLock::new(Vec::with_capacity(max_size))),
            factory: Box::new(factory),
            max_size,
        }
    }
    
    pub fn get(&self) -> T {
        let mut pool = self.pool.write();
        pool.pop().unwrap_or_else(|| (self.factory)())
    }
    
    pub fn return_object(&self, obj: T) {
        let mut pool = self.pool.write();
        if pool.len() < self.max_size {
            pool.push(obj);
        }
    }
}

// Usage example
lazy_static::lazy_static! {
    static ref BUFFER_POOL: MemoryPool<Vec<u8>> = MemoryPool::new(
        || Vec::with_capacity(8192),
        100
    );
}
```

### Smart Memory Allocation

```rust
use std::alloc::{GlobalAlloc, Layout};
use jemallocator::Jemalloc;

// Use jemalloc for better memory allocation performance
#[global_allocator]
static GLOBAL: Jemalloc = Jemalloc;

// Memory-efficient data structures
pub struct CompactMemoryEntry {
    // Use compact representations
    id: u32,                    // Instead of String UUID
    agent_id_hash: u64,         // Hash instead of full string
    content: String,            // Keep as-is for search
    metadata: SmallVec<[u8; 64]>, // Inline small metadata
    timestamp: u32,             // Unix timestamp
    priority: u8,               // Single byte
}

impl CompactMemoryEntry {
    pub fn from_memory_entry(entry: &MemoryEntry) -> Self {
        Self {
            id: entry.id.parse::<u32>().unwrap_or(0),
            agent_id_hash: hash_string(&entry.agent_id),
            content: entry.content.clone(),
            metadata: serialize_metadata_compact(&entry.metadata),
            timestamp: entry.created_at.timestamp() as u32,
            priority: match entry.priority {
                MemoryPriority::Low => 1,
                MemoryPriority::Medium => 2,
                MemoryPriority::High => 3,
                MemoryPriority::Critical => 4,
            },
        }
    }
}
```

---

## Caching Strategies

### Multi-Level Caching

```rust
use lru::LruCache;
use std::num::NonZeroUsize;

pub struct MultiLevelCache {
    // L1: In-memory LRU cache for hot data
    l1_cache: Arc<RwLock<LruCache<String, MemorySearchResult>>>,
    
    // L2: Compressed cache for warm data
    l2_cache: Arc<RwLock<LruCache<String, Vec<u8>>>>,
    
    // L3: Disk-based cache for cold data
    l3_cache: Arc<RwLock<sled::Db>>,
}

impl MultiLevelCache {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            l1_cache: Arc::new(RwLock::new(
                LruCache::new(NonZeroUsize::new(1000).unwrap())
            )),
            l2_cache: Arc::new(RwLock::new(
                LruCache::new(NonZeroUsize::new(5000).unwrap())
            )),
            l3_cache: Arc::new(RwLock::new(sled::open("cache.db")?)),
        })
    }
    
    pub async fn get(&self, key: &str) -> Option<MemorySearchResult> {
        // Try L1 cache first
        if let Some(result) = self.l1_cache.write().get(key) {
            return Some(result.clone());
        }
        
        // Try L2 cache
        if let Some(compressed) = self.l2_cache.write().get(key) {
            if let Ok(result) = decompress_and_deserialize(compressed) {
                // Promote to L1
                self.l1_cache.write().put(key.to_string(), result.clone());
                return Some(result);
            }
        }
        
        // Try L3 cache
        if let Ok(Some(data)) = self.l3_cache.read().get(key.as_bytes()) {
            if let Ok(result) = bincode::deserialize(&data) {
                // Promote to L2 and L1
                let compressed = compress_and_serialize(&result);
                self.l2_cache.write().put(key.to_string(), compressed);
                self.l1_cache.write().put(key.to_string(), result.clone());
                return Some(result);
            }
        }
        
        None
    }
    
    pub async fn put(&self, key: String, result: MemorySearchResult) {
        // Store in all levels
        self.l1_cache.write().put(key.clone(), result.clone());
        
        let compressed = compress_and_serialize(&result);
        self.l2_cache.write().put(key.clone(), compressed);
        
        let serialized = bincode::serialize(&result).unwrap_or_default();
        let _ = self.l3_cache.read().insert(key.as_bytes(), serialized);
    }
}
```

### Cache Warming Strategy

```rust
pub struct CacheWarmer {
    engine: Arc<CBDEngine>,
    cache: Arc<MultiLevelCache>,
}

impl CacheWarmer {
    pub async fn warm_popular_queries(&self) -> Result<(), CBDError> {
        // Get frequently accessed agent IDs
        let popular_agents = self.get_popular_agents().await?;
        
        for agent_id in popular_agents {
            // Get common search patterns for this agent
            let patterns = self.get_search_patterns(&agent_id).await?;
            
            for pattern in patterns {
                // Pre-warm cache with these searches
                let results = self.engine
                    .search_memories(&agent_id, &pattern, 10)
                    .await?;
                
                let cache_key = format!("{}:{}", agent_id, pattern);
                for result in results {
                    self.cache.put(cache_key.clone(), result).await;
                }
            }
        }
        
        Ok(())
    }
    
    async fn get_popular_agents(&self) -> Result<Vec<String>, CBDError> {
        // Implementation to get frequently accessed agents
        // Could be based on access logs, metrics, etc.
        Ok(vec!["agent-1".to_string(), "agent-2".to_string()])
    }
    
    async fn get_search_patterns(&self, agent_id: &str) -> Result<Vec<String>, CBDError> {
        // Get common search patterns for an agent
        // Could be based on query history, analytics, etc.
        Ok(vec!["user preference".to_string(), "recent decision".to_string()])
    }
}
```

---

## Monitoring & Profiling

### Performance Metrics Collection

```rust
use prometheus::{Counter, Histogram, Gauge, Registry};
use std::time::Instant;

pub struct PerformanceCollector {
    // Operation metrics
    operations_total: Counter,
    operation_duration: Histogram,
    operation_errors: Counter,
    
    // Cache metrics
    cache_hits: Counter,
    cache_misses: Counter,
    cache_size: Gauge,
    
    // Resource metrics
    memory_usage: Gauge,
    active_connections: Gauge,
    queue_size: Gauge,
}

impl PerformanceCollector {
    pub fn new(registry: &Registry) -> Self {
        let operations_total = Counter::new(
            "cbd_memory_operations_total",
            "Total number of memory operations"
        ).unwrap();
        
        let operation_duration = Histogram::with_opts(
            prometheus::HistogramOpts::new(
                "cbd_memory_operation_duration_seconds",
                "Duration of memory operations"
            ).buckets(vec![0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0])
        ).unwrap();
        
        // Register all metrics...
        registry.register(Box::new(operations_total.clone())).unwrap();
        registry.register(Box::new(operation_duration.clone())).unwrap();
        
        Self {
            operations_total,
            operation_duration,
            // ... initialize other metrics
        }
    }
    
    pub fn record_operation<T, F>(&self, operation_name: &str, operation: F) -> T
    where
        F: FnOnce() -> T,
    {
        let start = Instant::now();
        self.operations_total.inc();
        
        let result = operation();
        
        self.operation_duration.observe(start.elapsed().as_secs_f64());
        
        result
    }
    
    pub async fn record_async_operation<T, F, Fut>(
        &self, 
        operation_name: &str, 
        operation: F
    ) -> T
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = T>,
    {
        let start = Instant::now();
        self.operations_total.inc();
        
        let result = operation().await;
        
        self.operation_duration.observe(start.elapsed().as_secs_f64());
        
        result
    }
}
```

### Profiling Integration

```rust
#[cfg(feature = "profiling")]
use pprof::ProfilerGuard;

pub struct PerformanceProfiler {
    #[cfg(feature = "profiling")]
    guard: Option<ProfilerGuard<'static>>,
}

impl PerformanceProfiler {
    pub fn start() -> Self {
        #[cfg(feature = "profiling")]
        let guard = pprof::ProfilerGuardBuilder::default()
            .frequency(100)
            .blocklist(&["libc", "libgcc", "pthread", "vdso"])
            .build()
            .ok();
        
        Self {
            #[cfg(feature = "profiling")]
            guard,
        }
    }
    
    #[cfg(feature = "profiling")]
    pub fn generate_report(&self) -> Result<pprof::Report, Box<dyn std::error::Error>> {
        if let Some(guard) = &self.guard {
            let report = guard.report().build()?;
            Ok(report)
        } else {
            Err("Profiler not started".into())
        }
    }
    
    #[cfg(not(feature = "profiling"))]
    pub fn generate_report(&self) -> Result<(), Box<dyn std::error::Error>> {
        Err("Profiling not enabled".into())
    }
}

// Usage in benchmarks
#[cfg(test)]
mod benchmarks {
    use super::*;
    use criterion::{criterion_group, criterion_main, Criterion, BenchmarkId};
    
    fn bench_memory_operations(c: &mut Criterion) {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let engine = rt.block_on(CBDEngine::new()).unwrap();
        
        let mut group = c.benchmark_group("memory_operations");
        
        for size in [10, 100, 1000].iter() {
            group.bench_with_input(
                BenchmarkId::new("store", size),
                size,
                |b, &size| {
                    b.to_async(&rt).iter(|| async {
                        for i in 0..size {
                            let _ = engine.store_memory(
                                "bench-agent",
                                &format!("Benchmark memory {}", i),
                                None
                            ).await;
                        }
                    });
                }
            );
        }
        
        group.finish();
    }
    
    criterion_group!(benches, bench_memory_operations);
    criterion_main!(benches);
}
```

---

## Scaling Strategies

### Horizontal Scaling Architecture

```rust
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct ShardedMemoryManager {
    shards: Vec<Arc<MemoryManager>>,
    shard_count: usize,
}

impl ShardedMemoryManager {
    pub fn new(configs: Vec<MemoryConfig>) -> Result<Self, CBDError> {
        let mut shards = Vec::new();
        
        for config in configs {
            let manager = Arc::new(MemoryManager::new(config)?);
            shards.push(manager);
        }
        
        let shard_count = shards.len();
        
        Ok(Self { shards, shard_count })
    }
    
    fn get_shard_for_agent(&self, agent_id: &str) -> Arc<MemoryManager> {
        let hash = self.hash_agent_id(agent_id);
        let shard_index = hash % self.shard_count;
        self.shards[shard_index].clone()
    }
    
    fn hash_agent_id(&self, agent_id: &str) -> usize {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        agent_id.hash(&mut hasher);
        hasher.finish() as usize
    }
    
    pub async fn store_memory(
        &self,
        agent_id: &str,
        content: &str,
        metadata: Option<HashMap<String, String>>
    ) -> Result<String, CBDError> {
        let shard = self.get_shard_for_agent(agent_id);
        shard.store_memory(agent_id, content, metadata).await
    }
    
    pub async fn search_memories(
        &self,
        agent_id: &str,
        query: &str,
        limit: usize
    ) -> Result<Vec<MemorySearchResult>, CBDError> {
        let shard = self.get_shard_for_agent(agent_id);
        shard.search_memories(agent_id, query, limit).await
    }
}
```

### Load Balancing Strategy

```rust
pub struct LoadBalancedMemoryCluster {
    backends: Vec<Arc<MemoryManager>>,
    load_balancer: Arc<RwLock<LoadBalancer>>,
}

pub struct LoadBalancer {
    current_loads: Vec<f64>,
    response_times: Vec<Duration>,
    error_rates: Vec<f64>,
}

impl LoadBalancer {
    pub fn select_backend(&self) -> usize {
        // Weighted round-robin based on current load
        let mut best_score = f64::MAX;
        let mut best_index = 0;
        
        for (i, (&load, &response_time, &error_rate)) in self.current_loads
            .iter()
            .zip(&self.response_times)
            .zip(&self.error_rates)
            .enumerate()
        {
            // Calculate composite score (lower is better)
            let score = load * 0.4 + 
                       response_time.as_secs_f64() * 0.4 + 
                       error_rate * 0.2;
            
            if score < best_score {
                best_score = score;
                best_index = i;
            }
        }
        
        best_index
    }
    
    pub fn update_metrics(&mut self, backend_index: usize, metrics: BackendMetrics) {
        if backend_index < self.current_loads.len() {
            self.current_loads[backend_index] = metrics.load;
            self.response_times[backend_index] = metrics.response_time;
            self.error_rates[backend_index] = metrics.error_rate;
        }
    }
}

pub struct BackendMetrics {
    pub load: f64,
    pub response_time: Duration,
    pub error_rate: f64,
}
```

### Auto-Scaling Implementation

```rust
use tokio::time::{interval, Duration};

pub struct AutoScaler {
    current_instances: Arc<RwLock<usize>>,
    target_instances: Arc<RwLock<usize>>,
    metrics_collector: Arc<PerformanceCollector>,
    scale_up_threshold: f64,
    scale_down_threshold: f64,
    min_instances: usize,
    max_instances: usize,
}

impl AutoScaler {
    pub async fn start_monitoring(&self) {
        let mut check_interval = interval(Duration::from_secs(30));
        
        loop {
            check_interval.tick().await;
            
            let metrics = self.collect_scaling_metrics().await;
            let recommendation = self.calculate_scaling_decision(&metrics).await;
            
            match recommendation {
                ScalingDecision::ScaleUp(count) => {
                    self.scale_up(count).await;
                }
                ScalingDecision::ScaleDown(count) => {
                    self.scale_down(count).await;
                }
                ScalingDecision::NoAction => {
                    // No scaling needed
                }
            }
        }
    }
    
    async fn collect_scaling_metrics(&self) -> ScalingMetrics {
        ScalingMetrics {
            cpu_utilization: self.get_cpu_utilization().await,
            memory_utilization: self.get_memory_utilization().await,
            request_rate: self.get_request_rate().await,
            response_time: self.get_average_response_time().await,
            error_rate: self.get_error_rate().await,
        }
    }
    
    async fn calculate_scaling_decision(&self, metrics: &ScalingMetrics) -> ScalingDecision {
        let current = *self.current_instances.read().await;
        
        // Calculate scaling score
        let scale_score = metrics.cpu_utilization * 0.3 +
                         metrics.memory_utilization * 0.3 +
                         (metrics.request_rate / 1000.0) * 0.2 +
                         metrics.response_time.as_secs_f64() * 0.2;
        
        if scale_score > self.scale_up_threshold && current < self.max_instances {
            let new_instances = ((current as f64 * 1.5) as usize).min(self.max_instances);
            ScalingDecision::ScaleUp(new_instances - current)
        } else if scale_score < self.scale_down_threshold && current > self.min_instances {
            let new_instances = ((current as f64 * 0.7) as usize).max(self.min_instances);
            ScalingDecision::ScaleDown(current - new_instances)
        } else {
            ScalingDecision::NoAction
        }
    }
}

pub struct ScalingMetrics {
    pub cpu_utilization: f64,
    pub memory_utilization: f64,
    pub request_rate: f64,
    pub response_time: Duration,
    pub error_rate: f64,
}

pub enum ScalingDecision {
    ScaleUp(usize),
    ScaleDown(usize),
    NoAction,
}
```

This performance optimization guide provides comprehensive strategies for maximizing CBD Engine Memory Management system performance across various deployment scenarios and scaling requirements.
