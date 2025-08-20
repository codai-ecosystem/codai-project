# 📚 CBD Engine Memory Management API Documentation

## Overview

The CBD Engine Memory Management system provides comprehensive memory storage, retrieval, and management capabilities through a sophisticated dual-backend architecture. This system seamlessly integrates with MemoraiMCP servers while providing intelligent fallback to local SQLite storage.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)

---

## Quick Start

### Basic Usage

```rust
use cbd_engine::{CBDEngine, memory::{MemoryConfig, MemoryEntry, MemoryPriority}};

// Initialize with default configuration
let engine = CBDEngine::new().await?;

// Store a memory
let memory_id = engine.store_memory(
    "user-123",
    "Important project decision",
    Some(hashmap! {
        "project" => "cbd-engine",
        "entity_type" => "decision",
        "priority" => "high"
    })
).await?;

// Search memories
let results = engine.search_memories(
    "user-123",
    "project decision",
    10
).await?;
```

### Advanced Configuration

```rust
use cbd_engine::memory::MemoryConfig;

let config = MemoryConfig {
    memorai_url: Some("http://localhost:8002".to_string()),
    max_local_memories: 10000,
    retention_period_days: 30,
    enable_encryption: true,
    encryption_key: Some("your-encryption-key".to_string()),
    similarity_threshold: 0.7,
    max_context_size: 1000,
    enable_fallback: true,
    fallback_path: Some("./memory_fallback".to_string()),
};

let engine = CBDEngine::with_memory_config(config).await?;
```

---

## Architecture Overview

### Dual-Backend System

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CBDEngine     │    │ MemoryManager    │    │ MemoraiMCP      │
│   (Public API)  │◄──►│  (Orchestrator)  │◄──►│ (Primary)       │
└─────────────────┘    │                  │    └─────────────────┘
                       │                  │    ┌─────────────────┐
                       │                  │◄──►│ FallbackStorage │
                       │                  │    │ (SQLite + FTS5) │
                       └──────────────────┘    └─────────────────┘
```

### Key Components

1. **CBDEngine**: Public API interface for memory operations
2. **MemoryManager**: Intelligent orchestration between backends
3. **MemoraiClient**: HTTP client for MemoraiMCP communication
4. **FallbackStorage**: Local SQLite storage with full-text search
5. **ContextManager**: Session-aware context enhancement

---

## API Reference

### Core Memory Operations

#### `store_memory`

Stores a memory entry with automatic backend selection.

```rust
pub async fn store_memory(
    &self,
    agent_id: &str,
    content: &str,
    metadata: Option<HashMap<String, String>>
) -> Result<String>
```

**Parameters:**
- `agent_id`: Unique identifier for the agent/user
- `content`: Memory content to store
- `metadata`: Optional key-value metadata

**Returns:** Memory ID string

**Example:**
```rust
let memory_id = engine.store_memory(
    "agent-001", 
    "User prefers JSON responses",
    Some(hashmap! {
        "entity_type" => "preference",
        "priority" => "medium"
    })
).await?;
```

#### `search_memories`

Searches stored memories with relevance ranking.

```rust
pub async fn search_memories(
    &self,
    agent_id: &str,
    query: &str,
    limit: usize
) -> Result<Vec<MemorySearchResult>>
```

**Parameters:**
- `agent_id`: Agent identifier for scope filtering
- `query`: Search query string
- `limit`: Maximum number of results

**Returns:** Vector of `MemorySearchResult`

**Example:**
```rust
let results = engine.search_memories("agent-001", "user preferences", 10).await?;
for result in results {
    println!("Relevance: {}, Content: {}", result.relevance_score, result.memory.content);
}
```

#### `delete_memory`

Removes a memory from storage.

```rust
pub async fn delete_memory(&self, memory_id: &str) -> Result<bool>
```

**Example:**
```rust
let success = engine.delete_memory("memory-123").await?;
if success {
    println!("Memory deleted successfully");
}
```

### Advanced Operations

#### `get_memory_stats`

Retrieves memory system statistics.

```rust
pub async fn get_memory_stats(&self) -> Result<MemoryStats>
```

**Returns:** `MemoryStats` with system information

```rust
pub struct MemoryStats {
    pub total_memories: u64,
    pub memories_by_priority: HashMap<String, u64>,
    pub memories_by_entity_type: HashMap<String, u64>,
    pub average_access_frequency: f64,
    pub system_health: String,
}
```

#### `get_memory_status`

Gets current backend status information.

```rust
pub async fn get_memory_status(&self) -> Result<String>
```

**Returns:** Status string ("Connected", "Fallback", or "Disconnected")

#### `optimize_memory_storage`

Performs memory system optimization.

```rust
pub async fn optimize_memory_storage(&self) -> Result<()>
```

Triggers:
- Database optimization (VACUUM, ANALYZE)
- Index rebuilding
- Cache cleanup
- Performance tuning

---

## Configuration

### Environment Variables

```bash
# MemoraiMCP Configuration
MEMORAI_URL=http://localhost:8002
MEMORAI_TIMEOUT=30000
MEMORAI_MAX_RETRIES=3

# Local Storage Configuration  
CBD_MEMORY_MAX_LOCAL=10000
CBD_MEMORY_RETENTION_DAYS=30
CBD_MEMORY_FALLBACK_PATH=./memory_data

# Performance Tuning
CBD_MEMORY_SIMILARITY_THRESHOLD=0.7
CBD_MEMORY_MAX_CONTEXT_SIZE=1000
CBD_MEMORY_ENABLE_ENCRYPTION=true
```

### Configuration Structure

```rust
pub struct MemoryConfig {
    // MemoraiMCP settings
    pub memorai_url: Option<String>,
    pub memorai_timeout: u64,
    pub max_retries: u32,
    
    // Local storage settings
    pub max_local_memories: usize,
    pub retention_period_days: u32,
    pub fallback_path: Option<String>,
    
    // Performance settings
    pub similarity_threshold: f32,
    pub max_context_size: usize,
    pub enable_compression: bool,
    pub enable_encryption: bool,
    pub encryption_key: Option<String>,
    
    // Advanced features
    pub enable_fallback: bool,
    pub enable_context_enhancement: bool,
    pub cache_ttl_seconds: u64,
}
```

### Default Values

```rust
impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            memorai_url: env::var("MEMORAI_URL").ok(),
            memorai_timeout: 30000,
            max_retries: 3,
            max_local_memories: 10000,
            retention_period_days: 90,
            fallback_path: Some("./memory_data".to_string()),
            similarity_threshold: 0.7,
            max_context_size: 1000,
            enable_compression: true,
            enable_encryption: false,
            encryption_key: None,
            enable_fallback: true,
            enable_context_enhancement: true,
            cache_ttl_seconds: 3600,
        }
    }
}
```

---

## Error Handling

### Error Types

The memory system uses comprehensive error types for precise error handling:

```rust
#[derive(Error, Debug)]
pub enum CBDError {
    #[error("Memory error: {0}")]
    MemoryError(String),
    
    #[error("Connection error: {0}")]
    ConnectionError(String),
    
    #[error("Storage error: {0}")]
    StorageError(String),
    
    #[error("Search error: {0}")]
    SearchError(String),
    
    #[error("Context error: {0}")]
    ContextError(String),
    
    // ... additional error types
}
```

### Error Handling Patterns

#### Basic Error Handling

```rust
match engine.store_memory(agent_id, content, metadata).await {
    Ok(memory_id) => println!("Stored with ID: {}", memory_id),
    Err(CBDError::ConnectionError(msg)) => {
        eprintln!("Connection failed: {}", msg);
        // Handle connection issues
    },
    Err(CBDError::StorageError(msg)) => {
        eprintln!("Storage failed: {}", msg);
        // Handle storage issues
    },
    Err(e) => eprintln!("Unexpected error: {}", e),
}
```

#### Retry Logic

```rust
use std::time::Duration;
use tokio::time::sleep;

async fn store_with_retry(
    engine: &CBDEngine,
    agent_id: &str,
    content: &str,
    max_retries: u32
) -> Result<String> {
    let mut attempt = 0;
    
    loop {
        match engine.store_memory(agent_id, content, None).await {
            Ok(id) => return Ok(id),
            Err(e) if e.is_retriable() && attempt < max_retries => {
                attempt += 1;
                let delay = Duration::from_millis(100 * (1 << attempt));
                sleep(delay).await;
                continue;
            },
            Err(e) => return Err(e),
        }
    }
}
```

---

## Performance Optimization

### Connection Pooling

The MemoraiMCP client uses connection pooling for optimal performance:

```rust
// Connection pool is automatically managed
// Default pool size: 10 connections
// Idle timeout: 30 seconds
// Max lifetime: 60 seconds
```

### Caching Strategy

#### Memory Result Caching

```rust
// Search results are cached for performance
// Default TTL: 1 hour
// Cache size: 1000 entries
// LRU eviction policy
```

#### Query Optimization

```rust
// SQLite query optimization
- Prepared statements for all queries
- Optimized indices on frequently queried columns
- Full-text search (FTS5) for content searches
- Query plan analysis and optimization
```

### Performance Monitoring

#### Built-in Metrics

```rust
pub struct PerformanceMetrics {
    pub avg_response_time: Duration,
    pub success_rate: f64,
    pub cache_hit_rate: f64,
    pub active_connections: u32,
    pub total_operations: u64,
}

// Access metrics
let metrics = engine.get_memory_performance_metrics().await?;
println!("Success rate: {:.2}%", metrics.success_rate * 100.0);
```

#### Performance Benchmarking

```rust
use std::time::Instant;

async fn benchmark_memory_operations(engine: &CBDEngine) -> Result<()> {
    let start = Instant::now();
    
    // Perform operations
    for i in 0..1000 {
        engine.store_memory(
            "benchmark",
            &format!("Test memory {}", i),
            None
        ).await?;
    }
    
    let duration = start.elapsed();
    println!("1000 operations took: {:?}", duration);
    println!("Ops/sec: {:.2}", 1000.0 / duration.as_secs_f64());
    
    Ok(())
}
```

---

## Best Practices

### Memory Organization

#### Use Meaningful Agent IDs

```rust
// Good: descriptive and hierarchical
engine.store_memory("user-123:project-abc", content, metadata).await?;
engine.store_memory("team-marketing:campaign-2024", content, metadata).await?;

// Avoid: generic or unclear IDs  
engine.store_memory("user", content, metadata).await?;
engine.store_memory("123", content, metadata).await?;
```

#### Structure Metadata Effectively

```rust
let metadata = hashmap! {
    "entity_type" => "user_preference",    // Categorization
    "priority" => "high",                  // Importance level
    "project" => "cbd-engine",             // Project context
    "tags" => "json,api,response",         // Searchable tags
    "session_id" => "sess-456",            // Session tracking
    "created_by" => "agent-001",           // Attribution
};
```

### Search Optimization

#### Effective Query Construction

```rust
// Specific queries yield better results
let results = engine.search_memories(
    "user-123",
    "user prefers JSON format in API responses", 
    10
).await?;

// Rather than generic queries
let results = engine.search_memories("user-123", "preference", 10).await?;
```

#### Relevance Score Filtering

```rust
let results = engine.search_memories("agent-001", query, 20).await?;
let high_relevance: Vec<_> = results
    .into_iter()
    .filter(|r| r.relevance_score > 0.8)
    .collect();
```

### Resource Management

#### Memory Lifecycle Management

```rust
// Regularly clean up old memories
tokio::spawn(async move {
    loop {
        // Clean up memories older than retention period
        if let Err(e) = engine.optimize_memory_storage().await {
            eprintln!("Optimization failed: {}", e);
        }
        
        // Run daily
        tokio::time::sleep(Duration::from_secs(86400)).await;
    }
});
```

#### Batch Operations

```rust
// Batch memory operations for efficiency
let memories = vec![
    ("agent-001", "Memory 1", metadata1),
    ("agent-001", "Memory 2", metadata2),
    ("agent-001", "Memory 3", metadata3),
];

// Use transaction-like batching when possible
for (agent_id, content, metadata) in memories {
    if let Err(e) = engine.store_memory(agent_id, content, metadata).await {
        eprintln!("Failed to store memory: {}", e);
        // Implement appropriate error handling
    }
}
```

### Error Recovery

#### Graceful Degradation

```rust
async fn robust_memory_search(
    engine: &CBDEngine, 
    agent_id: &str, 
    query: &str
) -> Vec<MemorySearchResult> {
    match engine.search_memories(agent_id, query, 10).await {
        Ok(results) => results,
        Err(CBDError::ConnectionError(_)) => {
            // Fallback to local search only
            warn!("MemoraiMCP unavailable, using local fallback");
            engine.search_local_memories(agent_id, query, 10)
                .await
                .unwrap_or_default()
        },
        Err(e) => {
            error!("Memory search failed: {}", e);
            Vec::new() // Return empty results rather than failing
        }
    }
}
```

#### Health Monitoring

```rust
// Monitor memory system health
async fn monitor_memory_health(engine: &CBDEngine) {
    match engine.get_memory_status().await {
        Ok(status) => {
            match status.as_str() {
                "Connected" => info!("Memory system healthy"),
                "Fallback" => warn!("Using fallback storage only"),
                "Disconnected" => error!("Memory system unavailable"),
                _ => warn!("Unknown memory system status: {}", status),
            }
        },
        Err(e) => error!("Failed to check memory health: {}", e),
    }
}
```

---

## Integration Examples

### Web Application Integration

```rust
use axum::{extract::Query, response::Json, routing::post, Router};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct StoreRequest {
    agent_id: String,
    content: String,
    metadata: Option<HashMap<String, String>>,
}

#[derive(Serialize)]
struct StoreResponse {
    memory_id: String,
    status: String,
}

async fn store_memory_handler(
    engine: Arc<CBDEngine>,
    Json(request): Json<StoreRequest>
) -> Result<Json<StoreResponse>, String> {
    let memory_id = engine
        .store_memory(&request.agent_id, &request.content, request.metadata)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(Json(StoreResponse {
        memory_id,
        status: "success".to_string(),
    }))
}
```

### Background Processing Integration

```rust
use tokio::sync::mpsc;

pub struct MemoryProcessor {
    engine: Arc<CBDEngine>,
    receiver: mpsc::Receiver<MemoryTask>,
}

pub enum MemoryTask {
    Store { agent_id: String, content: String, metadata: Option<HashMap<String, String>> },
    Search { agent_id: String, query: String, limit: usize },
    Cleanup,
}

impl MemoryProcessor {
    pub async fn run(&mut self) {
        while let Some(task) = self.receiver.recv().await {
            match task {
                MemoryTask::Store { agent_id, content, metadata } => {
                    if let Err(e) = self.engine.store_memory(&agent_id, &content, metadata).await {
                        error!("Failed to store memory: {}", e);
                    }
                },
                MemoryTask::Search { agent_id, query, limit } => {
                    match self.engine.search_memories(&agent_id, &query, limit).await {
                        Ok(results) => info!("Found {} results", results.len()),
                        Err(e) => error!("Search failed: {}", e),
                    }
                },
                MemoryTask::Cleanup => {
                    if let Err(e) = self.engine.optimize_memory_storage().await {
                        error!("Cleanup failed: {}", e);
                    }
                }
            }
        }
    }
}
```

This documentation provides comprehensive guidance for using the CBD Engine Memory Management system effectively in production environments.
