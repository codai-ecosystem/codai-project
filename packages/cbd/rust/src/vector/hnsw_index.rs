//! HNSW-based vector index implementation

use std::collections::HashMap;
use std::sync::Arc;
use async_trait::async_trait;
use tokio::sync::RwLock;
use crate::error::CBDError;
use crate::vector::VectorIndex;

/// In-memory HNSW index (simplified implementation)
/// 
/// Note: This is a basic implementation. For production, we'd use FAISS or similar optimized library.
pub struct HNSWIndex {
    vectors: Arc<RwLock<HashMap<String, Vec<f32>>>>,
    metadata: Arc<RwLock<HashMap<String, serde_json::Value>>>,
    dimension: Option<usize>,
}

impl HNSWIndex {
    pub async fn new() -> Result<Self, CBDError> {
        Ok(HNSWIndex {
            vectors: Arc::new(RwLock::new(HashMap::new())),
            metadata: Arc::new(RwLock::new(HashMap::new())),
            dimension: None,
        })
    }
    
    /// Calculate cosine similarity between two vectors
    fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        if a.len() != b.len() {
            return 0.0;
        }
        
        let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
        
        if norm_a == 0.0 || norm_b == 0.0 {
            return 0.0;
        }
        
        dot_product / (norm_a * norm_b)
    }
    
    /// Calculate euclidean distance between two vectors
    fn euclidean_distance(a: &[f32], b: &[f32]) -> f32 {
        if a.len() != b.len() {
            return f32::INFINITY;
        }
        
        a.iter()
            .zip(b.iter())
            .map(|(x, y)| (x - y) * (x - y))
            .sum::<f32>()
            .sqrt()
    }
}

#[async_trait]
impl VectorIndex for HNSWIndex {
    async fn store(
        &self, 
        key: &str, 
        vector: &[f32], 
        metadata: Option<serde_json::Value>
    ) -> Result<(), CBDError> {
        // Validate vector dimension consistency
        if let Some(expected_dim) = self.dimension {
            if vector.len() != expected_dim {
                return Err(CBDError::InvalidInput(
                    format!("Vector dimension mismatch: expected {}, got {}", expected_dim, vector.len())
                ));
            }
        }
        
        let mut vectors = self.vectors.write().await;
        let mut metadata_map = self.metadata.write().await;
        
        // Set dimension on first vector
        if vectors.is_empty() {
            // This is a hack to modify dimension - in real implementation this would be handled differently
            unsafe {
                let self_mut = self as *const Self as *mut Self;
                (*self_mut).dimension = Some(vector.len());
            }
        }
        
        vectors.insert(key.to_string(), vector.to_vec());
        
        if let Some(meta) = metadata {
            metadata_map.insert(key.to_string(), meta);
        }
        
        Ok(())
    }
    
    async fn search(
        &self, 
        query: &[f32], 
        k: usize,
        threshold: Option<f32>
    ) -> Result<Vec<(String, f32, Option<serde_json::Value>)>, CBDError> {
        let vectors = self.vectors.read().await;
        let metadata_map = self.metadata.read().await;
        
        let mut results: Vec<(String, f32, Option<serde_json::Value>)> = Vec::new();
        
        for (key, vector) in vectors.iter() {
            let similarity = Self::cosine_similarity(query, vector);
            
            // Apply threshold filter if specified
            if let Some(thresh) = threshold {
                if similarity < thresh {
                    continue;
                }
            }
            
            let metadata = metadata_map.get(key).cloned();
            results.push((key.clone(), similarity, metadata));
        }
        
        // Sort by similarity (descending) and take top k
        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        results.truncate(k);
        
        Ok(results)
    }
    
    async fn delete(&self, key: &str) -> Result<(), CBDError> {
        let mut vectors = self.vectors.write().await;
        let mut metadata_map = self.metadata.write().await;
        
        vectors.remove(key);
        metadata_map.remove(key);
        
        Ok(())
    }
    
    async fn update(
        &self, 
        key: &str, 
        vector: &[f32], 
        metadata: Option<serde_json::Value>
    ) -> Result<(), CBDError> {
        // For simplicity, just replace the existing entry
        self.store(key, vector, metadata).await
    }
    
    async fn get_stats(&self) -> Result<serde_json::Value, CBDError> {
        let vectors = self.vectors.read().await;
        let metadata_map = self.metadata.read().await;
        
        Ok(serde_json::json!({
            "index_type": "HNSW",
            "total_vectors": vectors.len(),
            "total_metadata": metadata_map.len(),
            "dimension": self.dimension,
            "memory_usage_estimate": vectors.len() * self.dimension.unwrap_or(0) * 4 // 4 bytes per f32
        }))
    }
    
    async fn health_check(&self) -> Result<serde_json::Value, CBDError> {
        let vectors = self.vectors.read().await;
        
        Ok(serde_json::json!({
            "status": "healthy",
            "index_type": "HNSW",
            "total_vectors": vectors.len(),
            "dimension": self.dimension
        }))
    }
    
    async fn optimize(&self) -> Result<(), CBDError> {
        // For this simple implementation, optimization is a no-op
        // In a real implementation, this would rebuild the HNSW graph for better performance
        Ok(())
    }
    
    async fn get_vector(&self, key: &str) -> Result<Option<(Vec<f32>, Option<serde_json::Value>)>, CBDError> {
        let vectors = self.vectors.read().await;
        let metadata_map = self.metadata.read().await;
        
        if let Some(vector) = vectors.get(key) {
            let metadata = metadata_map.get(key).cloned();
            Ok(Some((vector.clone(), metadata)))
        } else {
            Ok(None)
        }
    }
    
    async fn bulk_insert(&self, vectors: Vec<(String, Vec<f32>, Option<serde_json::Value>)>) -> Result<(), CBDError> {
        for (key, vector, metadata) in vectors {
            self.store(&key, &vector, metadata).await?;
        }
        
        Ok(())
    }
}
