//! CBD Enterprise Database Engine
//! 
//! High-performance Rust core for enterprise-grade vector database operations.
//! Provides ACID transactions, clustering, and enterprise security features.

pub mod storage;
pub mod vector;
pub mod transaction;
pub mod cluster;
pub mod vector_engine;
pub mod security;
pub mod performance;
pub mod metrics;
pub mod monitoring;
pub mod compliance;
pub mod memory;
pub mod error;

// Node.js bindings
#[cfg(feature = "bindings")]
pub mod bindings;

use std::sync::Arc;
use tokio::sync::RwLock;
use anyhow::Result;

use crate::storage::StorageEngine;
use crate::vector::VectorIndex;
use crate::transaction::{TransactionManager, TransactionId, IsolationLevel};
use crate::cluster::ClusterCoordinator;
use crate::security::SecurityManager;
use crate::performance::PerformanceManager;
use crate::metrics::MetricsCollector;
use crate::memory::MemoryManager;

/// Main CBD Engine instance
/// 
/// This is the central coordination point for all CBD operations.
/// It manages storage, vector indexing, transactions, clustering, security, and performance.
pub struct CBDEngine {
    /// Storage engine for persistent data
    storage: Arc<dyn StorageEngine + Send + Sync>,
    
    /// Vector index for similarity search
    vector_index: Arc<dyn VectorIndex + Send + Sync>,
    
    /// Transaction manager for ACID compliance
    transaction_manager: Arc<RwLock<TransactionManager>>,
    
    /// Cluster coordinator for distributed operations
    cluster_coordinator: Arc<RwLock<ClusterCoordinator>>,
    
    /// Security manager for authentication and authorization
    security_manager: Arc<SecurityManager>,
    
    /// Performance manager for optimization and monitoring
    performance_manager: Arc<PerformanceManager>,
    
    /// Metrics collector for monitoring and observability
    metrics: Arc<MetricsCollector>,
    
    /// Memory manager for intelligent memory operations
    memory_manager: Arc<MemoryManager>,
}

impl CBDEngine {
    /// Create a new CBD Engine instance
    pub async fn new() -> Result<Self, CBDError> {
        // Choose storage backend based on features
        #[cfg(feature = "rocksdb")]
        let storage: Arc<dyn crate::storage::StorageEngine + Send + Sync> = Arc::new(storage::RocksDBStorage::new().await?);
        
        #[cfg(not(feature = "rocksdb"))]
        let storage: Arc<dyn crate::storage::StorageEngine + Send + Sync> = Arc::new(storage::MemoryStorage::new().await?);

        let vector_index: Arc<dyn crate::vector::VectorIndex + Send + Sync> = Arc::new(vector::HNSWIndex::new().await?);
        let transaction_manager = Arc::new(RwLock::new(TransactionManager::new("main".to_string())));
        let cluster_coordinator = Arc::new(RwLock::new(ClusterCoordinator::new()));
        let security_manager = Arc::new(SecurityManager::new(security::SecurityConfig::default()).await
            .map_err(|e| CBDError::ConfigError(e.to_string()))?);
        let performance_manager = Arc::new(PerformanceManager::new(performance::OptimizationLevel::Balanced).await
            .map_err(|e| CBDError::ConfigError(e.to_string()))?);
        let metrics = Arc::new(MetricsCollector::new());
        let memory_manager = Arc::new(MemoryManager::new(memory::MemoryConfig::default()).await?);

        Ok(CBDEngine {
            storage,
            vector_index,
            transaction_manager,
            cluster_coordinator,
            security_manager,
            performance_manager,
            metrics,
            memory_manager,
        })
    }

    /// Store a key-value pair
    pub async fn store(&self, key: &str, value: &[u8]) -> Result<(), CBDError> {
        self.metrics.increment_counter("cbd_store_requests");
        let _timer = self.metrics.start_timer("cbd_store_duration");
        
        self.storage.store(key, value).await
    }

    /// Retrieve a value by key
    pub async fn retrieve(&self, key: &str) -> Result<Option<Vec<u8>>, CBDError> {
        self.metrics.increment_counter("cbd_retrieve_requests");
        let _timer = self.metrics.start_timer("cbd_retrieve_duration");
        
        self.storage.retrieve(key).await
    }

    /// Store a vector with metadata
    pub async fn store_vector(
        &self, 
        key: &str, 
        vector: &[f32], 
        metadata: Option<serde_json::Value>
    ) -> Result<(), CBDError> {
        self.metrics.increment_counter("cbd_vector_store_requests");
        let _timer = self.metrics.start_timer("cbd_vector_store_duration");
        
        // Store vector in index
        self.vector_index.store(key, vector, metadata.clone()).await?;
        
        // Store metadata in storage if provided
        if let Some(meta) = metadata {
            let meta_key = format!("meta:{}", key);
            let meta_bytes = serde_json::to_vec(&meta)
                .map_err(|e| CBDError::SerializationError(e.to_string()))?;
            self.storage.store(&meta_key, &meta_bytes).await?;
        }
        
        Ok(())
    }

    /// Search for similar vectors
    pub async fn search_vectors(
        &self, 
        query: &[f32], 
        k: usize,
        threshold: Option<f32>
    ) -> Result<Vec<(String, f32, Option<serde_json::Value>)>, CBDError> {
        self.metrics.increment_counter("cbd_vector_search_requests");
        let _timer = self.metrics.start_timer("cbd_vector_search_duration");
        
        self.vector_index.search(query, k, threshold).await
    }

    /// Get engine health status
    pub async fn health_check(&self) -> Result<serde_json::Value, CBDError> {
        let storage_health = self.storage.health_check().await?;
        let vector_health = self.vector_index.health_check().await?;
        
        Ok(serde_json::json!({
            "status": "healthy",
            "storage": storage_health,
            "vector_index": vector_health,
            "timestamp": chrono::Utc::now().to_rfc3339()
        }))
    }

    /// Get engine statistics
    pub async fn get_stats(&self) -> Result<serde_json::Value, CBDError> {
        let metrics = self.metrics.collect().await;
        let storage_stats = self.storage.get_stats().await?;
        let vector_stats = self.vector_index.get_stats().await?;
        
        Ok(serde_json::json!({
            "metrics": metrics,
            "storage": storage_stats,
            "vector_index": vector_stats,
            "timestamp": chrono::Utc::now().to_rfc3339()
        }))
    }

    /// Begin a new transaction with specified isolation level
    pub async fn begin_transaction(&self, isolation_level: IsolationLevel) -> Result<TransactionId, CBDError> {
        let transaction_manager = self.transaction_manager.read().await;
        transaction_manager.begin_transaction(isolation_level).await
    }

    /// Commit a transaction
    pub async fn commit_transaction(&self, transaction_id: TransactionId) -> Result<(), CBDError> {
        let transaction_manager = self.transaction_manager.read().await;
        transaction_manager.commit_transaction(transaction_id).await
    }

    /// Abort a transaction
    pub async fn abort_transaction(&self, transaction_id: TransactionId) -> Result<(), CBDError> {
        let transaction_manager = self.transaction_manager.read().await;
        transaction_manager.abort_transaction(transaction_id).await
    }

    /// Read within a transaction
    pub async fn transaction_read(&self, transaction_id: TransactionId, key: &str) -> Result<Option<Vec<u8>>, CBDError> {
        let transaction_manager = self.transaction_manager.read().await;
        transaction_manager.read(transaction_id, key).await
    }

    /// Write within a transaction
    pub async fn transaction_write(&self, transaction_id: TransactionId, key: String, value: Vec<u8>) -> Result<(), CBDError> {
        let transaction_manager = self.transaction_manager.read().await;
        transaction_manager.write(transaction_id, key, value).await
    }

    /// Get transaction statistics
    pub async fn get_transaction_stats(&self) -> Result<serde_json::Value, CBDError> {
        let transaction_manager = self.transaction_manager.read().await;
        let stats = transaction_manager.get_transaction_statistics().await;
        
        Ok(serde_json::json!({
            "active_transactions": stats.active_transactions,
            "total_committed": stats.total_committed,
            "total_aborted": stats.total_aborted,
            "average_duration_ms": stats.average_duration.as_millis()
        }))
    }

    /// Cleanup expired transactions
    pub async fn cleanup_expired_transactions(&self) -> Result<usize, CBDError> {
        let transaction_manager = self.transaction_manager.read().await;
        transaction_manager.cleanup_expired_transactions().await
    }

    // Memory operations
    
    /// Store a memory entry
    pub async fn store_memory(&self, content: &str, agent_id: &str, metadata: memory::MemoryMetadata) -> Result<String, CBDError> {
        self.memory_manager.remember(content, agent_id, metadata).await
    }
    
    /// Search memories by content
    pub async fn search_memories(&self, query: &str, agent_id: &str, limit: Option<usize>) -> Result<Vec<memory::MemorySearchResult>, CBDError> {
        self.memory_manager.recall(query, agent_id, limit).await
    }
    
    /// Advanced memory search with query parameters
    pub async fn advanced_memory_search(&self, query: &memory::MemoryQuery) -> Result<Vec<memory::MemorySearchResult>, CBDError> {
        self.memory_manager.advanced_search(query).await
    }
    
    /// Get context information for an agent
    pub async fn get_memory_context(&self, agent_id: &str, context_size: Option<usize>) -> Result<memory::ContextInfo, CBDError> {
        self.memory_manager.get_context(agent_id, context_size).await
    }
    
    /// Delete a memory entry
    pub async fn delete_memory(&self, memory_id: &str, agent_id: &str) -> Result<bool, CBDError> {
        self.memory_manager.forget(memory_id, agent_id).await
    }
    
    /// Get memory statistics for an agent
    pub async fn get_memory_stats(&self, agent_id: &str) -> Result<memory::MemoryStats, CBDError> {
        self.memory_manager.get_stats(agent_id).await
    }
    
    /// Get overall memory manager status
    pub async fn get_memory_status(&self) -> Result<memory::MemoryStatus, CBDError> {
        Ok(self.memory_manager.get_status().await)
    }
    
    /// Optimize memory storage
    pub async fn optimize_memory(&self) -> Result<(), CBDError> {
        self.memory_manager.optimize().await
    }
}

// Re-export key types for easier access
pub use crate::error::CBDError;
pub use crate::storage::MemoryStorage;
#[cfg(feature = "rocksdb")]
pub use crate::storage::RocksDBStorage;
pub use crate::vector_engine::{AdvancedVectorEngine, VectorMetadata, VectorQuery, SearchResult};
pub use crate::security::enterprise_security::{AdvancedSecurityManager, ComplianceManager};
pub use crate::monitoring::observability::ObservabilityManager;

// Re-export common database types
pub type CBDDatabase = CBDEngine;
pub type VectorEngine = AdvancedVectorEngine<'static>;
