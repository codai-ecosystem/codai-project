/*!
 * CBD Enterprise Integration Test
 * Basic smoke test to validate core functionality
 */

use std::sync::Arc;
use cbd_core::{CBDConfig, StorageConfig, VectorConfig, ClusterConfig, SecurityConfig, PerformanceConfig, StorageEngine, VectorIndex, Transaction};
use cbd_vector::{HNSWVectorIndex, HNSWConfig};
use anyhow::Result;

/// Mock storage engine for testing without RocksDB dependencies
pub struct MockStorageEngine;

#[async_trait::async_trait]
impl StorageEngine for MockStorageEngine {
    async fn initialize(&self) -> Result<()> {
        Ok(())
    }

    async fn store(&self, _key: &str, _value: &[u8], _txn: Option<&Transaction>) -> Result<()> {
        Ok(())
    }
    
    async fn retrieve(&self, _key: &str, _txn: Option<&Transaction>) -> Result<Option<Vec<u8>>> {
        Ok(None)
    }
    
    async fn delete(&self, _key: &str, _txn: Option<&Transaction>) -> Result<()> {
        Ok(())
    }
    
    async fn scan_keys(&self, _prefix: &str, _limit: usize) -> Result<Vec<String>> {
        Ok(vec![])
    }
    
    async fn begin_transaction(&self) -> Result<Transaction> {
        Ok(Transaction {
            id: uuid::Uuid::new_v4(),
            started_at: std::time::SystemTime::now(),
            isolation_level: cbd_core::IsolationLevel::ReadCommitted,
            read_only: false,
        })
    }
    
    async fn commit_transaction(&self, _txn: Transaction) -> Result<()> {
        Ok(())
    }
    
    async fn rollback_transaction(&self, _txn: Transaction) -> Result<()> {
        Ok(())
    }
}

#[tokio::test]
async fn test_cbd_engine_basic_functionality() -> Result<()> {
    // Create test configuration
    let config = CBDConfig {
        node_id: None,
        storage: StorageConfig {
            engine: "mock".to_string(),
            data_path: "/tmp/cbd_test".to_string(),
            cache_size: 1024 * 1024, // 1MB
            compression: true,
            encryption_at_rest: false,
        },
        vector: VectorConfig {
            dimensions: 128,
            index_type: "hnsw".to_string(),
            distance_metric: "cosine".to_string(),
            ef_construction: 200,
            max_connections: 16,
        },
        cluster: ClusterConfig {
            enabled: false,
            nodes: vec![],
            replication_factor: 1,
            consensus_timeout_ms: 5000,
        },
        security: SecurityConfig {
            authentication: false,
            authorization: false,
            tls_enabled: false,
            audit_logging: false,
        },
        performance: PerformanceConfig {
            thread_pool_size: 4,
            max_connections: 100,
            query_timeout_ms: 30000,
            batch_size: 1000,
        },
    };

    // Create storage and vector index implementations
    let storage: Arc<dyn StorageEngine + Send + Sync> = Arc::new(MockStorageEngine);
    
    // Create HNSW config from vector config dimensions
    let hnsw_config = HNSWConfig {
        dimensions: config.vector.dimensions,
        ..Default::default()
    };
    let vector_index: Arc<dyn VectorIndex + Send + Sync> = Arc::new(HNSWVectorIndex::new(hnsw_config));

    // Create CBD engine
    let engine = cbd_core::CBDEngine::new(config, storage, vector_index);

    // Test initialization
    engine.initialize().await?;

    // Test basic vector operations
    let test_vector = vec![1.0; 128];
    let vector_index_ref = engine.get_vector_index();
    
    // Add a test vector
    vector_index_ref.add_vector("test1", &test_vector, None).await?;
    
    // Get stats
    let stats = vector_index_ref.get_stats().await?;
    assert_eq!(stats.dimensions, 128);
    
    println!("✅ Basic CBD Engine functionality test passed!");
    println!("   - Engine initialized successfully");
    println!("   - Vector index initialized with {} dimensions", stats.dimensions);
    println!("   - Test vector added successfully");
    
    Ok(())
}
