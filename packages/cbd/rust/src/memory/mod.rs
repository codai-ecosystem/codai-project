// CBD Enterprise Engine - Memory Management Module
// 
// This module provides comprehensive memory management capabilities through
// MemoraiMCP integration, enabling intelligent context preservation,
// cross-session memory, and advanced knowledge management.

pub mod memorai_client;
pub mod memory_manager;
pub mod context_manager;
pub mod fallback_storage;

pub use memorai_client::*;
pub use memory_manager::*;
pub use context_manager::*;
pub use fallback_storage::*;

use crate::error::{CBDError, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

/// Memory operation types supported by the CBD Engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MemoryOperation {
    Store,
    Recall,
    Context,
    Delete,
    Search,
    Update,
}

/// Memory metadata for context tracking and categorization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetadata {
    pub entity_type: String,
    pub priority: MemoryPriority,
    pub tags: Vec<String>,
    pub session_id: Option<String>,
    pub project_id: Option<String>,
    pub agent_id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub importance: f32,
    pub context: HashMap<String, serde_json::Value>,
}

/// Memory priority levels for intelligent categorization
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MemoryPriority {
    Low,
    Medium,
    High,
    Critical,
}

impl Default for MemoryPriority {
    fn default() -> Self {
        MemoryPriority::Medium
    }
}

/// Memory entry structure for CBD Engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    pub metadata: MemoryMetadata,
    pub embedding: Option<Vec<f32>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub access_count: u64,
    pub last_accessed: Option<chrono::DateTime<chrono::Utc>>,
}

/// Memory search query parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryQuery {
    pub query: String,
    pub agent_id: String,
    pub project_id: Option<String>,
    pub session_id: Option<String>,
    pub tags: Option<Vec<String>>,
    pub entity_type: Option<String>,
    pub priority: Option<MemoryPriority>,
    pub limit: Option<usize>,
    pub min_similarity: Option<f32>,
    pub time_range: Option<(chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>)>,
}

/// Memory search results with relevance scoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySearchResult {
    pub memory: MemoryEntry,
    pub similarity_score: f32,
    pub relevance_score: f32,
    pub context_match: bool,
    pub reason: String,
}

/// Context information for current task or session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextInfo {
    pub memories: Vec<MemoryEntry>,
    pub summary: String,
    pub key_insights: Vec<String>,
    pub relevant_entities: HashMap<String, Vec<String>>,
    pub session_context: HashMap<String, serde_json::Value>,
    pub recommendations: Vec<String>,
}

/// Memory statistics and performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub total_memories: u64,
    pub memories_by_priority: HashMap<MemoryPriority, u64>,
    pub memories_by_entity_type: HashMap<String, u64>,
    pub average_access_count: f32,
    pub storage_size_bytes: u64,
    pub last_optimization: Option<chrono::DateTime<chrono::Utc>>,
    pub performance_metrics: HashMap<String, f64>,
}

/// Memory configuration for CBD Engine integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfig {
    /// MemoraiMCP server endpoint
    pub memorai_endpoint: String,
    /// Enable fallback to local storage if MemoraiMCP is unavailable
    pub enable_fallback: bool,
    /// Local fallback storage path
    pub fallback_storage_path: String,
    /// Maximum number of memories to store locally
    pub max_local_memories: usize,
    /// Memory retention period in days
    pub retention_period_days: u32,
    /// Enable automatic memory optimization
    pub auto_optimization: bool,
    /// Similarity threshold for memory matching
    pub similarity_threshold: f32,
    /// Maximum context size for context operations
    pub max_context_size: usize,
    /// Enable memory compression
    pub enable_compression: bool,
    /// Enable memory encryption
    pub enable_encryption: bool,
    /// Encryption key for memory storage
    pub encryption_key: Option<String>,
}

impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            memorai_endpoint: "http://localhost:8002".to_string(),
            enable_fallback: true,
            fallback_storage_path: "./data/memory_fallback".to_string(),
            max_local_memories: 10000,
            retention_period_days: 365,
            auto_optimization: true,
            similarity_threshold: 0.7,
            max_context_size: 50,
            enable_compression: true,
            enable_encryption: false,
            encryption_key: None,
        }
    }
}

impl MemoryConfig {
    /// Load memory configuration from environment variables
    pub fn from_env() -> Result<Self> {
        let mut config = Self::default();
        
        if let Ok(endpoint) = std::env::var("CBD_MEMORAI_ENDPOINT") {
            config.memorai_endpoint = endpoint;
        }
        
        if let Ok(enable_fallback) = std::env::var("CBD_MEMORY_ENABLE_FALLBACK") {
            config.enable_fallback = enable_fallback.parse().unwrap_or(true);
        }
        
        if let Ok(storage_path) = std::env::var("CBD_MEMORY_FALLBACK_PATH") {
            config.fallback_storage_path = storage_path;
        }
        
        if let Ok(max_memories) = std::env::var("CBD_MEMORY_MAX_LOCAL") {
            config.max_local_memories = max_memories.parse().unwrap_or(10000);
        }
        
        if let Ok(retention_days) = std::env::var("CBD_MEMORY_RETENTION_DAYS") {
            config.retention_period_days = retention_days.parse().unwrap_or(365);
        }
        
        if let Ok(auto_opt) = std::env::var("CBD_MEMORY_AUTO_OPTIMIZATION") {
            config.auto_optimization = auto_opt.parse().unwrap_or(true);
        }
        
        if let Ok(threshold) = std::env::var("CBD_MEMORY_SIMILARITY_THRESHOLD") {
            config.similarity_threshold = threshold.parse().unwrap_or(0.7);
        }
        
        if let Ok(context_size) = std::env::var("CBD_MEMORY_MAX_CONTEXT_SIZE") {
            config.max_context_size = context_size.parse().unwrap_or(50);
        }
        
        if let Ok(enable_compression) = std::env::var("CBD_MEMORY_ENABLE_COMPRESSION") {
            config.enable_compression = enable_compression.parse().unwrap_or(true);
        }
        
        if let Ok(enable_encryption) = std::env::var("CBD_MEMORY_ENABLE_ENCRYPTION") {
            config.enable_encryption = enable_encryption.parse().unwrap_or(false);
        }
        
        if let Ok(encryption_key) = std::env::var("CBD_MEMORY_ENCRYPTION_KEY") {
            config.encryption_key = Some(encryption_key);
        }
        
        Ok(config)
    }
    
    /// Validate memory configuration
    pub fn validate(&self) -> Result<()> {
        if self.max_local_memories == 0 {
            return Err(CBDError::Config("max_local_memories cannot be zero".to_string()));
        }
        
        if self.retention_period_days == 0 {
            return Err(CBDError::Config("retention_period_days cannot be zero".to_string()));
        }
        
        if self.similarity_threshold < 0.0 || self.similarity_threshold > 1.0 {
            return Err(CBDError::Config("similarity_threshold must be between 0.0 and 1.0".to_string()));
        }
        
        if self.max_context_size == 0 {
            return Err(CBDError::Config("max_context_size cannot be zero".to_string()));
        }
        
        if self.enable_encryption && self.encryption_key.is_none() {
            return Err(CBDError::Config("encryption_key required when encryption is enabled".to_string()));
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_memory_config_default() {
        let config = MemoryConfig::default();
        assert_eq!(config.memorai_endpoint, "http://localhost:8002");
        assert!(config.enable_fallback);
        assert_eq!(config.max_local_memories, 10000);
        assert_eq!(config.similarity_threshold, 0.7);
    }
    
    #[test]
    fn test_memory_config_validation() {
        let mut config = MemoryConfig::default();
        assert!(config.validate().is_ok());
        
        config.max_local_memories = 0;
        assert!(config.validate().is_err());
        
        config.max_local_memories = 1000;
        config.similarity_threshold = 1.5;
        assert!(config.validate().is_err());
        
        config.similarity_threshold = 0.5;
        config.enable_encryption = true;
        assert!(config.validate().is_err()); // No encryption key
        
        config.encryption_key = Some("test_key".to_string());
        assert!(config.validate().is_ok());
    }
    
    #[test]
    fn test_memory_priority_default() {
        let priority = MemoryPriority::default();
        matches!(priority, MemoryPriority::Medium);
    }
    
    #[test]
    fn test_memory_entry_creation() {
        let metadata = MemoryMetadata {
            entity_type: "test".to_string(),
            priority: MemoryPriority::High,
            tags: vec!["tag1".to_string(), "tag2".to_string()],
            session_id: Some("session123".to_string()),
            project_id: Some("project456".to_string()),
            agent_id: "agent789".to_string(),
            timestamp: chrono::Utc::now(),
            importance: 0.8,
            context: HashMap::new(),
        };
        
        let memory = MemoryEntry {
            id: Uuid::new_v4().to_string(),
            content: "Test memory content".to_string(),
            metadata,
            embedding: Some(vec![0.1, 0.2, 0.3]),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            access_count: 0,
            last_accessed: None,
        };
        
        assert!(!memory.id.is_empty());
        assert_eq!(memory.content, "Test memory content");
        assert_eq!(memory.metadata.entity_type, "test");
        assert!(matches!(memory.metadata.priority, MemoryPriority::High));
    }
}
