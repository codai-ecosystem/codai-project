// CBD Enterprise Engine - Memory Manager
// 
// This module provides the main memory management interface for the CBD Engine,
// coordinating between MemoraiMCP integration and local fallback storage.

use crate::error::{CBDError, Result};
use crate::memory::{
    MemoryConfig, MemoryEntry, MemoryMetadata, MemoryOperation, MemoryPriority,
    MemoryQuery, MemorySearchResult, ContextInfo, MemoryStats,
    MemoraiClient, MemoraiClientConfig, FallbackStorage
};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, error, info, warn};

/// Memory manager status
#[derive(Debug, Clone)]
pub enum MemoryStatus {
    Connected,       // MemoraiMCP available
    Fallback,        // Using local storage
    Disconnected,    // No memory available
}

/// Memory performance metrics
#[derive(Debug, Clone)]
pub struct MemoryPerformanceMetrics {
    pub operations_total: u64,
    pub operations_successful: u64,
    pub operations_failed: u64,
    pub average_response_time_ms: f64,
    pub cache_hit_rate: f64,
    pub storage_utilization: f64,
    pub last_optimization: Option<chrono::DateTime<chrono::Utc>>,
}

impl Default for MemoryPerformanceMetrics {
    fn default() -> Self {
        Self {
            operations_total: 0,
            operations_successful: 0,
            operations_failed: 0,
            average_response_time_ms: 0.0,
            cache_hit_rate: 0.0,
            storage_utilization: 0.0,
            last_optimization: None,
        }
    }
}

/// Main memory manager for CBD Enterprise Engine
pub struct MemoryManager {
    config: MemoryConfig,
    memorai_client: Option<MemoraiClient>,
    fallback_storage: Option<FallbackStorage>,
    status: Arc<RwLock<MemoryStatus>>,
    metrics: Arc<RwLock<MemoryPerformanceMetrics>>,
    operation_log: Arc<RwLock<Vec<(MemoryOperation, chrono::DateTime<chrono::Utc>, Result<()>)>>>,
}

impl MemoryManager {
    /// Create a new memory manager
    pub async fn new(config: MemoryConfig) -> Result<Self> {
        config.validate()?;
        
        info!("Initializing CBD Memory Manager");
        debug!("Memory config: endpoint={}, fallback={}", config.memorai_endpoint, config.enable_fallback);
        
        // Initialize MemoraiMCP client
        let memorai_client = if !config.memorai_endpoint.is_empty() {
            let client_config = MemoraiClientConfig {
                endpoint: config.memorai_endpoint.clone(),
                timeout: std::time::Duration::from_secs(30),
                max_retries: 3,
                retry_delay: std::time::Duration::from_millis(500),
                connection_pool_size: 10,
                enable_compression: config.enable_compression,
                api_key: None,
            };
            
            match MemoraiClient::new(client_config) {
                Ok(client) => {
                    info!("MemoraiMCP client initialized successfully");
                    Some(client)
                }
                Err(e) => {
                    error!("Failed to initialize MemoraiMCP client: {}", e);
                    if config.enable_fallback {
                        warn!("Continuing with fallback storage only");
                        None
                    } else {
                        return Err(e);
                    }
                }
            }
        } else {
            warn!("MemoraiMCP endpoint not configured");
            None
        };
        
        // Initialize fallback storage if enabled
        let fallback_storage = if config.enable_fallback {
            match FallbackStorage::new(&config.fallback_storage_path, config.max_local_memories).await {
                Ok(storage) => {
                    info!("Fallback storage initialized at: {}", config.fallback_storage_path);
                    Some(storage)
                }
                Err(e) => {
                    error!("Failed to initialize fallback storage: {}", e);
                    if memorai_client.is_none() {
                        return Err(CBDError::Storage("No storage backend available".to_string()));
                    }
                    None
                }
            }
        } else {
            None
        };
        
        let initial_status = if memorai_client.is_some() {
            MemoryStatus::Connected
        } else if fallback_storage.is_some() {
            MemoryStatus::Fallback
        } else {
            MemoryStatus::Disconnected
        };
        
        info!("Memory Manager initialized with status: {:?}", initial_status);
        
        Ok(Self {
            config,
            memorai_client,
            fallback_storage,
            status: Arc::new(RwLock::new(initial_status)),
            metrics: Arc::new(RwLock::new(MemoryPerformanceMetrics::default())),
            operation_log: Arc::new(RwLock::new(Vec::new())),
        })
    }
    
    /// Get current memory manager status
    pub async fn get_status(&self) -> MemoryStatus {
        self.status.read().await.clone()
    }
    
    /// Test and update connectivity status
    pub async fn refresh_status(&self) -> Result<MemoryStatus> {
        let new_status = if let Some(ref client) = self.memorai_client {
            match client.health_check().await {
                Ok(true) => {
                    debug!("MemoraiMCP health check passed");
                    MemoryStatus::Connected
                }
                Ok(false) => {
                    warn!("MemoraiMCP health check failed");
                    if self.fallback_storage.is_some() {
                        MemoryStatus::Fallback
                    } else {
                        MemoryStatus::Disconnected
                    }
                }
                Err(e) => {
                    error!("MemoraiMCP health check error: {}", e);
                    if self.fallback_storage.is_some() {
                        MemoryStatus::Fallback
                    } else {
                        MemoryStatus::Disconnected
                    }
                }
            }
        } else if self.fallback_storage.is_some() {
            MemoryStatus::Fallback
        } else {
            MemoryStatus::Disconnected
        };
        
        *self.status.write().await = new_status.clone();
        Ok(new_status)
    }
    
    /// Advanced memory search with query parameters
    pub async fn advanced_search(&self, query: &MemoryQuery) -> Result<Vec<MemorySearchResult>> {
        debug!("Advanced search requested: agent={}, query_len={}", query.agent_id, query.query.len());
        
        // Update operation tracking
        self.update_operation_stats("advanced_search", "in_progress").await;
        let start_time = std::time::Instant::now();
        
        let results = if let Some(ref fallback) = self.fallback_storage {
            fallback.advanced_search(query).await?
        } else {
            vec![]
        };
        
        // Update operation tracking
        let duration = start_time.elapsed();
        self.update_operation_stats("advanced_search", "completed").await;
        self.record_operation_duration("advanced_search", duration).await;
        
        Ok(results)
    }
    
    /// Store a memory entry
    pub async fn remember(&self, content: &str, agent_id: &str, metadata: MemoryMetadata) -> Result<String> {
        let start_time = std::time::Instant::now();
        self.log_operation(MemoryOperation::Store).await;
        
        debug!("Storing memory for agent: {} (length: {} chars)", agent_id, content.len());
        
        let result = match self.get_status().await {
            MemoryStatus::Connected => {
                if let Some(ref client) = self.memorai_client {
                    let metadata_json = serde_json::to_value(&metadata)
                        .map_err(|e| CBDError::Serialization(format!("Failed to serialize metadata: {}", e)))?;
                    
                    match client.remember(content, agent_id, Some(metadata_json)).await {
                        Ok(memory_id) => {
                            info!("Successfully stored memory via MemoraiMCP: {}", memory_id);
                            Ok(memory_id)
                        }
                        Err(e) => {
                            error!("MemoraiMCP remember failed: {}, falling back to local storage", e);
                            self.fallback_remember(content, agent_id, metadata).await
                        }
                    }
                } else {
                    self.fallback_remember(content, agent_id, metadata).await
                }
            }
            MemoryStatus::Fallback => {
                self.fallback_remember(content, agent_id, metadata).await
            }
            MemoryStatus::Disconnected => {
                Err(CBDError::Storage("No memory storage available".to_string()))
            }
        };
        
        self.update_metrics(start_time, result.is_ok()).await;
        self.log_operation_result(MemoryOperation::Store, &result).await;
        
        result
    }
    
    /// Recall memories based on a query
    pub async fn recall(&self, query: &str, agent_id: &str, limit: Option<usize>) -> Result<Vec<MemorySearchResult>> {
        let start_time = std::time::Instant::now();
        self.log_operation(MemoryOperation::Recall).await;
        
        debug!("Recalling memories for query: '{}' (agent: {})", query, agent_id);
        
        let result = match self.get_status().await {
            MemoryStatus::Connected => {
                if let Some(ref client) = self.memorai_client {
                    match client.recall(query, agent_id, limit).await {
                        Ok(results) => {
                            info!("Successfully recalled {} memories via MemoraiMCP", results.len());
                            Ok(results)
                        }
                        Err(e) => {
                            error!("MemoraiMCP recall failed: {}, falling back to local storage", e);
                            self.fallback_recall(query, agent_id, limit).await
                        }
                    }
                } else {
                    self.fallback_recall(query, agent_id, limit).await
                }
            }
            MemoryStatus::Fallback => {
                self.fallback_recall(query, agent_id, limit).await
            }
            MemoryStatus::Disconnected => {
                Err(CBDError::Storage("No memory storage available".to_string()))
            }
        };
        
        self.update_metrics(start_time, result.is_ok()).await;
        self.log_operation_result(MemoryOperation::Recall, &result).await;
        
        result
    }
    
    /// Get contextual information for an agent
    pub async fn get_context(&self, agent_id: &str, context_size: Option<usize>) -> Result<ContextInfo> {
        let start_time = std::time::Instant::now();
        self.log_operation(MemoryOperation::Context).await;
        
        debug!("Getting context for agent: {} (size: {:?})", agent_id, context_size);
        
        let result = match self.get_status().await {
            MemoryStatus::Connected => {
                if let Some(ref client) = self.memorai_client {
                    match client.get_context(agent_id, context_size).await {
                        Ok(context) => {
                            info!("Successfully retrieved context via MemoraiMCP");
                            Ok(context)
                        }
                        Err(e) => {
                            error!("MemoraiMCP context failed: {}, falling back to local storage", e);
                            self.fallback_get_context(agent_id, context_size).await
                        }
                    }
                } else {
                    self.fallback_get_context(agent_id, context_size).await
                }
            }
            MemoryStatus::Fallback => {
                self.fallback_get_context(agent_id, context_size).await
            }
            MemoryStatus::Disconnected => {
                Err(CBDError::Storage("No memory storage available".to_string()))
            }
        };
        
        self.update_metrics(start_time, result.is_ok()).await;
        self.log_operation_result(MemoryOperation::Context, &result).await;
        
        result
    }
    
    /// Delete a memory entry
    pub async fn forget(&self, memory_id: &str, agent_id: &str) -> Result<bool> {
        let start_time = std::time::Instant::now();
        self.log_operation(MemoryOperation::Delete).await;
        
        debug!("Forgetting memory: {} (agent: {})", memory_id, agent_id);
        
        let result = match self.get_status().await {
            MemoryStatus::Connected => {
                if let Some(ref client) = self.memorai_client {
                    match client.forget(memory_id, agent_id).await {
                        Ok(success) => {
                            info!("Successfully deleted memory via MemoraiMCP: {}", success);
                            Ok(success)
                        }
                        Err(e) => {
                            error!("MemoraiMCP forget failed: {}, falling back to local storage", e);
                            self.fallback_forget(memory_id, agent_id).await
                        }
                    }
                } else {
                    self.fallback_forget(memory_id, agent_id).await
                }
            }
            MemoryStatus::Fallback => {
                self.fallback_forget(memory_id, agent_id).await
            }
            MemoryStatus::Disconnected => {
                Err(CBDError::Storage("No memory storage available".to_string()))
            }
        };
        
        self.update_metrics(start_time, result.is_ok()).await;
        self.log_operation_result(MemoryOperation::Delete, &result).await;
        
        result
    }
    
    /// Search memories with advanced parameters
    pub async fn search_memories(&self, query: &MemoryQuery) -> Result<Vec<MemorySearchResult>> {
        let start_time = std::time::Instant::now();
        self.log_operation(MemoryOperation::Search).await;
        
        debug!("Searching memories with advanced query for agent: {}", query.agent_id);
        
        let result = match self.get_status().await {
            MemoryStatus::Connected => {
                if let Some(ref client) = self.memorai_client {
                    match client.search_memories(query).await {
                        Ok(results) => {
                            info!("Successfully searched {} memories via MemoraiMCP", results.len());
                            Ok(results)
                        }
                        Err(e) => {
                            error!("MemoraiMCP search failed: {}, falling back to local storage", e);
                            self.fallback_search_memories(query).await
                        }
                    }
                } else {
                    self.fallback_search_memories(query).await
                }
            }
            MemoryStatus::Fallback => {
                self.fallback_search_memories(query).await
            }
            MemoryStatus::Disconnected => {
                Err(CBDError::Storage("No memory storage available".to_string()))
            }
        };
        
        self.update_metrics(start_time, result.is_ok()).await;
        self.log_operation_result(MemoryOperation::Search, &result).await;
        
        result
    }
    
    /// Get memory statistics
    pub async fn get_stats(&self, agent_id: &str) -> Result<MemoryStats> {
        debug!("Getting memory statistics for agent: {}", agent_id);
        
        match self.get_status().await {
            MemoryStatus::Connected => {
                if let Some(ref client) = self.memorai_client {
                    client.get_stats(agent_id).await
                } else {
                    self.fallback_get_stats(agent_id).await
                }
            }
            MemoryStatus::Fallback => {
                self.fallback_get_stats(agent_id).await
            }
            MemoryStatus::Disconnected => {
                Err(CBDError::Storage("No memory storage available".to_string()))
            }
        }
    }
    
    /// Get performance metrics
    pub async fn get_performance_metrics(&self) -> MemoryPerformanceMetrics {
        self.metrics.read().await.clone()
    }
    
    /// Optimize memory storage
    pub async fn optimize(&self) -> Result<()> {
        info!("Starting memory optimization");
        
        if let Some(ref storage) = self.fallback_storage {
            storage.optimize().await?;
        }
        
        // Update optimization timestamp
        let mut metrics = self.metrics.write().await;
        metrics.last_optimization = Some(chrono::Utc::now());
        
        info!("Memory optimization completed");
        Ok(())
    }
    
    /// Fallback methods for local storage
    async fn fallback_remember(&self, content: &str, agent_id: &str, metadata: MemoryMetadata) -> Result<String> {
        if let Some(ref storage) = self.fallback_storage {
            storage.store_memory(content, agent_id, metadata).await
        } else {
            Err(CBDError::Storage("No fallback storage available".to_string()))
        }
    }
    
    async fn fallback_recall(&self, query: &str, agent_id: &str, limit: Option<usize>) -> Result<Vec<MemorySearchResult>> {
        if let Some(ref storage) = self.fallback_storage {
            storage.search_memories(query, agent_id, limit).await
        } else {
            Err(CBDError::Storage("No fallback storage available".to_string()))
        }
    }
    
    async fn fallback_get_context(&self, agent_id: &str, context_size: Option<usize>) -> Result<ContextInfo> {
        if let Some(ref storage) = self.fallback_storage {
            storage.get_context(agent_id, context_size).await
        } else {
            Err(CBDError::Storage("No fallback storage available".to_string()))
        }
    }
    
    async fn fallback_forget(&self, memory_id: &str, agent_id: &str) -> Result<bool> {
        if let Some(ref storage) = self.fallback_storage {
            storage.delete_memory(memory_id, agent_id).await
        } else {
            Err(CBDError::Storage("No fallback storage available".to_string()))
        }
    }
    
    async fn fallback_search_memories(&self, query: &MemoryQuery) -> Result<Vec<MemorySearchResult>> {
        if let Some(ref storage) = self.fallback_storage {
            storage.advanced_search(query).await
        } else {
            Err(CBDError::Storage("No fallback storage available".to_string()))
        }
    }
    
    async fn fallback_get_stats(&self, agent_id: &str) -> Result<MemoryStats> {
        if let Some(ref storage) = self.fallback_storage {
            storage.get_statistics(agent_id).await
        } else {
            Err(CBDError::Storage("No fallback storage available".to_string()))
        }
    }
    
    /// Internal metrics tracking
    async fn update_metrics(&self, start_time: std::time::Instant, success: bool) {
        let duration_ms = start_time.elapsed().as_millis() as f64;
        let mut metrics = self.metrics.write().await;
        
        metrics.operations_total += 1;
        if success {
            metrics.operations_successful += 1;
        } else {
            metrics.operations_failed += 1;
        }
        
        // Update rolling average response time
        let alpha = 0.1; // Smoothing factor
        if metrics.average_response_time_ms == 0.0 {
            metrics.average_response_time_ms = duration_ms;
        } else {
            metrics.average_response_time_ms = alpha * duration_ms + (1.0 - alpha) * metrics.average_response_time_ms;
        }
    }
    
    /// Log memory operations for debugging
    async fn log_operation(&self, operation: MemoryOperation) {
        let mut log = self.operation_log.write().await;
        log.push((operation, chrono::Utc::now(), Ok(())));
        
        // Keep only last 1000 operations
        if log.len() > 1000 {
            log.drain(0..500);
        }
    }
    
    async fn log_operation_result<T>(&self, _operation: MemoryOperation, result: &Result<T>) {
        let mut log = self.operation_log.write().await;
        if let Some(last) = log.last_mut() {
            // Update the operation result
            last.2 = match result {
                Ok(_) => Ok(()),
                Err(e) => Err(CBDError::Api(e.to_string())),
            };
        }
    }
    
    async fn update_operation_stats(&self, operation: &str, status: &str) {
        debug!("Operation {} status: {}", operation, status);
        // In a full implementation, this would update metrics
    }
    
    async fn record_operation_duration(&self, operation: &str, duration: std::time::Duration) {
        debug!("Operation {} completed in {:?}", operation, duration);
        // In a full implementation, this would record performance metrics
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    
    async fn create_test_memory_manager() -> (MemoryManager, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let mut config = MemoryConfig::default();
        config.memorai_endpoint = "".to_string(); // Disable MemoraiMCP for tests
        config.enable_fallback = true;
        config.fallback_storage_path = temp_dir.path().to_string_lossy().to_string();
        
        let manager = MemoryManager::new(config).await.unwrap();
        (manager, temp_dir)
    }
    
    #[tokio::test]
    async fn test_memory_manager_creation() {
        let (manager, _temp_dir) = create_test_memory_manager().await;
        assert!(matches!(manager.get_status().await, MemoryStatus::Fallback));
    }
    
    #[tokio::test]
    async fn test_memory_operations() {
        let (manager, _temp_dir) = create_test_memory_manager().await;
        
        // Test remember
        let metadata = MemoryMetadata {
            entity_type: "test".to_string(),
            priority: MemoryPriority::Medium,
            tags: vec!["test".to_string()],
            session_id: None,
            project_id: None,
            agent_id: "test_agent".to_string(),
            timestamp: chrono::Utc::now(),
            importance: 0.5,
            context: std::collections::HashMap::new(),
        };
        
        let memory_id = manager.remember("Test content", "test_agent", metadata).await.unwrap();
        assert!(!memory_id.is_empty());
        
        // Test recall
        let results = manager.recall("test", "test_agent", None).await.unwrap();
        assert!(!results.is_empty());
        
        // Test forget
        let deleted = manager.forget(&memory_id, "test_agent").await.unwrap();
        assert!(deleted);
    }
}
