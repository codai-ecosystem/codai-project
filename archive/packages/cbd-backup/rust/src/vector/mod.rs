//! Vector indexing implementation for CBD

pub mod hnsw_index;

use async_trait::async_trait;
use crate::error::CBDError;

pub use hnsw_index::HNSWIndex;

/// Vector index trait for similarity search
#[async_trait]
pub trait VectorIndex {
    /// Store a vector with optional metadata
    async fn store(
        &self, 
        key: &str, 
        vector: &[f32], 
        metadata: Option<serde_json::Value>
    ) -> Result<(), CBDError>;
    
    /// Search for similar vectors
    async fn search(
        &self, 
        query: &[f32], 
        k: usize,
        threshold: Option<f32>
    ) -> Result<Vec<(String, f32, Option<serde_json::Value>)>, CBDError>;
    
    /// Delete a vector
    async fn delete(&self, key: &str) -> Result<(), CBDError>;
    
    /// Update a vector
    async fn update(
        &self, 
        key: &str, 
        vector: &[f32], 
        metadata: Option<serde_json::Value>
    ) -> Result<(), CBDError>;
    
    /// Get index statistics
    async fn get_stats(&self) -> Result<serde_json::Value, CBDError>;
    
    /// Health check
    async fn health_check(&self) -> Result<serde_json::Value, CBDError>;
    
    /// Optimize index (rebuild/compact)
    async fn optimize(&self) -> Result<(), CBDError>;
    
    /// Get vector by key
    async fn get_vector(&self, key: &str) -> Result<Option<(Vec<f32>, Option<serde_json::Value>)>, CBDError>;
    
    /// Bulk insert vectors
    async fn bulk_insert(&self, vectors: Vec<(String, Vec<f32>, Option<serde_json::Value>)>) -> Result<(), CBDError>;
}
