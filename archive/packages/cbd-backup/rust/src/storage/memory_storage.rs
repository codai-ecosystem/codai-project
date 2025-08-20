//! In-memory storage implementation for development and testing

use std::collections::HashMap;
use std::sync::Arc;
use async_trait::async_trait;
use tokio::sync::RwLock;
use crate::error::CBDError;
use crate::storage::StorageEngine;

/// In-memory storage engine for development and testing
/// 
/// This implementation provides the same interface as RocksDB storage
/// but keeps all data in memory for faster development iteration.
pub struct MemoryStorage {
    data: Arc<RwLock<HashMap<String, Vec<u8>>>>,
    name: String,
}

impl MemoryStorage {
    /// Create a new in-memory storage instance
    pub async fn new() -> Result<Self, CBDError> {
        Ok(MemoryStorage {
            data: Arc::new(RwLock::new(HashMap::new())),
            name: "memory".to_string(),
        })
    }
    
    /// Create named memory storage instance
    pub async fn with_name(name: &str) -> Result<Self, CBDError> {
        Ok(MemoryStorage {
            data: Arc::new(RwLock::new(HashMap::new())),
            name: name.to_string(),
        })
    }
}

#[async_trait]
impl StorageEngine for MemoryStorage {
    async fn store(&self, key: &str, value: &[u8]) -> Result<(), CBDError> {
        let mut data = self.data.write().await;
        data.insert(key.to_string(), value.to_vec());
        Ok(())
    }
    
    async fn retrieve(&self, key: &str) -> Result<Option<Vec<u8>>, CBDError> {
        let data = self.data.read().await;
        Ok(data.get(key).cloned())
    }
    
    async fn delete(&self, key: &str) -> Result<(), CBDError> {
        let mut data = self.data.write().await;
        data.remove(key);
        Ok(())
    }
    
    async fn scan_keys(&self, prefix: &str) -> Result<Vec<String>, CBDError> {
        let data = self.data.read().await;
        let keys: Vec<String> = data
            .keys()
            .filter(|k| k.starts_with(prefix))
            .cloned()
            .collect();
        Ok(keys)
    }
    
    async fn get_stats(&self) -> Result<serde_json::Value, CBDError> {
        let data = self.data.read().await;
        let total_size: usize = data.values().map(|v| v.len()).sum();
        
        Ok(serde_json::json!({
            "engine": "Memory",
            "name": self.name,
            "total_keys": data.len(),
            "total_size_bytes": total_size,
            "average_key_size": if data.is_empty() { 0 } else { total_size / data.len() }
        }))
    }
    
    async fn health_check(&self) -> Result<serde_json::Value, CBDError> {
        // Memory storage is always healthy
        Ok(serde_json::json!({
            "status": "healthy",
            "engine": "Memory",
            "name": self.name
        }))
    }
    
    async fn batch_store(&self, operations: Vec<(String, Vec<u8>)>) -> Result<(), CBDError> {
        let mut data = self.data.write().await;
        for (key, value) in operations {
            data.insert(key, value);
        }
        Ok(())
    }
    
    async fn create_backup(&self, path: &str) -> Result<(), CBDError> {
        use std::fs;
        use std::path::Path;
        
        let data = self.data.read().await;
        let backup_data = serde_json::to_string_pretty(&*data)
            .map_err(|e| CBDError::SerializationError(format!("Failed to serialize data: {}", e)))?;
            
        if let Some(parent) = Path::new(path).parent() {
            fs::create_dir_all(parent)
                .map_err(|e| CBDError::IoError(e))?;
        }
        
        fs::write(path, backup_data)
            .map_err(|e| CBDError::IoError(e))?;
            
        Ok(())
    }
    
    async fn restore_backup(&self, path: &str) -> Result<(), CBDError> {
        use std::fs;
        
        let backup_data = fs::read_to_string(path)
            .map_err(|e| CBDError::IoError(e))?;
            
        let restored_data: HashMap<String, Vec<u8>> = serde_json::from_str(&backup_data)
            .map_err(|e| CBDError::SerializationError(format!("Failed to deserialize backup: {}", e)))?;
            
        let mut data = self.data.write().await;
        *data = restored_data;
        
        Ok(())
    }
}
