//! Storage engine implementation for CBD

#[cfg(feature = "rocksdb")]
pub mod rocksdb_storage;
pub mod memory_storage;

use async_trait::async_trait;
use crate::error::CBDError;

#[cfg(feature = "rocksdb")]
pub use rocksdb_storage::RocksDBStorage;
pub use memory_storage::MemoryStorage;

/// Storage engine trait for CBD operations
#[async_trait]
pub trait StorageEngine {
    /// Store a key-value pair
    async fn store(&self, key: &str, value: &[u8]) -> Result<(), CBDError>;
    
    /// Retrieve a value by key
    async fn retrieve(&self, key: &str) -> Result<Option<Vec<u8>>, CBDError>;
    
    /// Delete a key-value pair
    async fn delete(&self, key: &str) -> Result<(), CBDError>;
    
    /// Scan keys with prefix
    async fn scan_keys(&self, prefix: &str) -> Result<Vec<String>, CBDError>;
    
    /// Get storage statistics
    async fn get_stats(&self) -> Result<serde_json::Value, CBDError>;
    
    /// Health check
    async fn health_check(&self) -> Result<serde_json::Value, CBDError>;
    
    /// Batch operations
    async fn batch_store(&self, operations: Vec<(String, Vec<u8>)>) -> Result<(), CBDError>;
    
    /// Create backup
    async fn create_backup(&self, path: &str) -> Result<(), CBDError>;
    
    /// Restore from backup
    async fn restore_backup(&self, path: &str) -> Result<(), CBDError>;
}
