//! RocksDB storage implementation

use std::path::Path;
use std::sync::Arc;
use async_trait::async_trait;
use rocksdb::{DB, Options, ColumnFamily, WriteBatch, IteratorMode};
use tokio::sync::Mutex;
use crate::error::CBDError;
use crate::storage::StorageEngine;

/// RocksDB-based storage engine
pub struct RocksDBStorage {
    db: Arc<Mutex<DB>>,
    db_path: String,
}

impl RocksDBStorage {
    /// Create a new RocksDB storage instance
    pub async fn new() -> Result<Self, CBDError> {
        Self::with_path("./cbd_data").await
    }
    
    /// Create RocksDB storage with custom path
    pub async fn with_path<P: AsRef<Path>>(path: P) -> Result<Self, CBDError> {
        let db_path = path.as_ref().to_string_lossy().to_string();
        
        let mut opts = Options::default();
        opts.create_if_missing(true);
        opts.set_max_open_files(10000);
        opts.set_use_fsync(false);
        opts.set_bytes_per_sync(1048576);
        opts.set_disable_auto_compactions(false);
        opts.set_compression_type(rocksdb::DBCompressionType::Lz4);
        
        // Create column families for different data types
        let cf_names = vec!["default", "vectors", "metadata", "transactions"];
        
        let db = DB::open_cf(&opts, &db_path, &cf_names)
            .or_else(|_| {
                // If CFs don't exist, create them
                let db = DB::open(&opts, &db_path)?;
                for cf_name in &cf_names[1..] { // Skip default CF
                    db.create_cf(cf_name, &opts)?;
                }
                Ok(db)
            })
            .map_err(|e| CBDError::StorageError(format!("Failed to open RocksDB: {}", e)))?;
            
        Ok(RocksDBStorage {
            db: Arc::new(Mutex::new(db)),
            db_path,
        })
    }
    
    /// Get column family handle
    async fn get_cf(&self, cf_name: &str) -> Result<Arc<ColumnFamily>, CBDError> {
        let db = self.db.lock().await;
        db.cf_handle(cf_name)
            .map(Arc::new)
            .ok_or_else(|| CBDError::StorageError(format!("Column family '{}' not found", cf_name)))
    }
}

#[async_trait]
impl StorageEngine for RocksDBStorage {
    async fn store(&self, key: &str, value: &[u8]) -> Result<(), CBDError> {
        let db = self.db.lock().await;
        let cf = db.cf_handle("default")
            .ok_or_else(|| CBDError::StorageError("Default column family not found".to_string()))?;
            
        db.put_cf(&cf, key.as_bytes(), value)
            .map_err(|e| CBDError::StorageError(format!("Failed to store key '{}': {}", key, e)))
    }
    
    async fn retrieve(&self, key: &str) -> Result<Option<Vec<u8>>, CBDError> {
        let db = self.db.lock().await;
        let cf = db.cf_handle("default")
            .ok_or_else(|| CBDError::StorageError("Default column family not found".to_string()))?;
            
        db.get_cf(&cf, key.as_bytes())
            .map_err(|e| CBDError::StorageError(format!("Failed to retrieve key '{}': {}", key, e)))
    }
    
    async fn delete(&self, key: &str) -> Result<(), CBDError> {
        let db = self.db.lock().await;
        let cf = db.cf_handle("default")
            .ok_or_else(|| CBDError::StorageError("Default column family not found".to_string()))?;
            
        db.delete_cf(&cf, key.as_bytes())
            .map_err(|e| CBDError::StorageError(format!("Failed to delete key '{}': {}", key, e)))
    }
    
    async fn scan_keys(&self, prefix: &str) -> Result<Vec<String>, CBDError> {
        let db = self.db.lock().await;
        let cf = db.cf_handle("default")
            .ok_or_else(|| CBDError::StorageError("Default column family not found".to_string()))?;
            
        let mut keys = Vec::new();
        let iter = db.iterator_cf(&cf, IteratorMode::From(prefix.as_bytes(), rocksdb::Direction::Forward));
        
        for item in iter {
            let (key, _) = item.map_err(|e| CBDError::StorageError(format!("Iterator error: {}", e)))?;
            let key_str = String::from_utf8_lossy(&key);
            
            if !key_str.starts_with(prefix) {
                break;
            }
            
            keys.push(key_str.to_string());
        }
        
        Ok(keys)
    }
    
    async fn get_stats(&self) -> Result<serde_json::Value, CBDError> {
        let db = self.db.lock().await;
        
        // Get basic stats
        let stats = db.property_value(rocksdb::properties::STATS)
            .map_err(|e| CBDError::StorageError(format!("Failed to get stats: {}", e)))?
            .unwrap_or_default();
            
        // Get memory usage
        let mem_usage = db.property_int_value(rocksdb::properties::CUR_SIZE_ALL_MEM_TABLES)
            .map_err(|e| CBDError::StorageError(format!("Failed to get memory usage: {}", e)))?
            .unwrap_or(0);
            
        // Get approximate number of keys
        let num_keys = db.property_int_value(rocksdb::properties::ESTIMATE_NUM_KEYS)
            .map_err(|e| CBDError::StorageError(format!("Failed to get key count: {}", e)))?
            .unwrap_or(0);
            
        Ok(serde_json::json!({
            "engine": "RocksDB",
            "path": self.db_path,
            "memory_usage_bytes": mem_usage,
            "estimated_keys": num_keys,
            "detailed_stats": stats
        }))
    }
    
    async fn health_check(&self) -> Result<serde_json::Value, CBDError> {
        // Try a simple operation to verify health
        let test_key = "__cbd_health_check__";
        let test_value = b"healthy";
        
        self.store(test_key, test_value).await?;
        let retrieved = self.retrieve(test_key).await?;
        self.delete(test_key).await?;
        
        let is_healthy = retrieved.as_ref().map(|v| v.as_slice()) == Some(test_value);
        
        Ok(serde_json::json!({
            "status": if is_healthy { "healthy" } else { "unhealthy" },
            "engine": "RocksDB",
            "path": self.db_path
        }))
    }
    
    async fn batch_store(&self, operations: Vec<(String, Vec<u8>)>) -> Result<(), CBDError> {
        let db = self.db.lock().await;
        let cf = db.cf_handle("default")
            .ok_or_else(|| CBDError::StorageError("Default column family not found".to_string()))?;
            
        let mut batch = WriteBatch::default();
        for (key, value) in operations {
            batch.put_cf(&cf, key.as_bytes(), &value);
        }
        
        db.write(batch)
            .map_err(|e| CBDError::StorageError(format!("Batch write failed: {}", e)))
    }
    
    async fn create_backup(&self, path: &str) -> Result<(), CBDError> {
        // Implementation would use RocksDB backup functionality
        Err(CBDError::StorageError("Backup not yet implemented".to_string()))
    }
    
    async fn restore_backup(&self, path: &str) -> Result<(), CBDError> {
        // Implementation would use RocksDB restore functionality
        Err(CBDError::StorageError("Restore not yet implemented".to_string()))
    }
}
