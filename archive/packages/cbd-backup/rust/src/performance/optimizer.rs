//! Query Optimizer for CBD Engine
//! 
//! Advanced query optimization system that analyzes queries, generates optimal execution plans,
//! manages caching strategies, and implements intelligent indexing for maximum performance.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use uuid::Uuid;

use crate::error::CBDError;
use crate::performance::OptimizationConfig;

type Result<T> = std::result::Result<T, CBDError>;

/// Query execution plan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryPlan {
    pub plan_id: Uuid,
    pub query_hash: String,
    pub estimated_cost: f64,
    pub estimated_time_ms: f64,
    pub steps: Vec<QueryStep>,
    pub cache_strategy: CacheStrategy,
    pub parallelization: ParallelizationPlan,
}

/// Individual query execution step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryStep {
    pub step_id: usize,
    pub operation: QueryOperation,
    pub estimated_cost: f64,
    pub dependencies: Vec<usize>,
    pub can_parallelize: bool,
}

/// Query operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QueryOperation {
    VectorSearch {
        vector_dim: usize,
        k: usize,
        use_hnsw: bool,
        use_ivf: bool,
    },
    DataRetrieval {
        keys: Vec<String>,
        use_cache: bool,
    },
    Filtering {
        conditions: Vec<String>,
        use_index: bool,
    },
    Aggregation {
        operation: AggregationType,
        field: String,
    },
    Sorting {
        field: String,
        ascending: bool,
    },
    Join {
        join_type: JoinType,
        left_field: String,
        right_field: String,
    },
}

/// Aggregation types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AggregationType {
    Count,
    Sum,
    Average,
    Min,
    Max,
    Distinct,
}

/// Join types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JoinType {
    Inner,
    Left,
    Right,
    Full,
}

/// Caching strategies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CacheStrategy {
    None,
    ResultCache { ttl_seconds: u64 },
    PartialCache { steps: Vec<usize> },
    FullCache { ttl_seconds: u64 },
}

/// Parallelization plan
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelizationPlan {
    pub max_threads: usize,
    pub parallel_steps: HashMap<usize, usize>, // step_id -> thread_count
    pub data_partitioning: Option<PartitioningStrategy>,
}

/// Data partitioning strategies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PartitioningStrategy {
    HashPartition { partition_count: usize },
    RangePartition { ranges: Vec<String> },
    VectorPartition { cluster_count: usize },
}

/// Query optimization statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationStats {
    pub queries_optimized: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub avg_optimization_time_ms: f64,
    pub avg_query_improvement_percent: f64,
}

/// Query optimizer system
#[derive(Debug)]
pub struct QueryOptimizer {
    /// Optimization configuration
    config: OptimizationConfig,
    /// Cached query plans
    plan_cache: Arc<RwLock<HashMap<String, QueryPlan>>>,
    /// Query statistics
    query_stats: Arc<RwLock<HashMap<String, QueryExecutionStats>>>,
    /// Index recommendations
    index_recommendations: Arc<RwLock<HashSet<String>>>,
    /// Optimization statistics
    optimization_stats: Arc<RwLock<OptimizationStats>>,
}

/// Query execution statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryExecutionStats {
    pub query_hash: String,
    pub execution_count: u64,
    pub total_time_ms: f64,
    pub average_time_ms: f64,
    pub min_time_ms: f64,
    pub max_time_ms: f64,
    pub last_executed: chrono::DateTime<chrono::Utc>,
}

impl QueryOptimizer {
    /// Create new query optimizer
    pub async fn new(config: &OptimizationConfig) -> Result<Self> {
        Ok(Self {
            config: config.clone(),
            plan_cache: Arc::new(RwLock::new(HashMap::new())),
            query_stats: Arc::new(RwLock::new(HashMap::new())),
            index_recommendations: Arc::new(RwLock::new(HashSet::new())),
            optimization_stats: Arc::new(RwLock::new(OptimizationStats {
                queries_optimized: 0,
                cache_hits: 0,
                cache_misses: 0,
                avg_optimization_time_ms: 0.0,
                avg_query_improvement_percent: 0.0,
            })),
        })
    }

    /// Optimize a query and return the execution plan
    pub async fn optimize_query(&self, query: &str) -> Result<String> {
        let query_hash = self.hash_query(query);
        
        // Check if we have a cached plan
        if self.config.enable_query_caching {
            let plan_cache = self.plan_cache.read().await;
            if let Some(cached_plan) = plan_cache.get(&query_hash) {
                self.update_cache_hit().await;
                return Ok(self.serialize_plan(cached_plan));
            }
        }
        
        self.update_cache_miss().await;
        
        // Generate optimization plan
        let plan = self.generate_query_plan(query, &query_hash).await?;
        
        // Cache the plan if caching is enabled
        if self.config.enable_query_caching {
            let mut plan_cache = self.plan_cache.write().await;
            plan_cache.insert(query_hash, plan.clone());
        }
        
        // Update optimization statistics
        self.update_optimization_stats().await;
        
        Ok(self.serialize_plan(&plan))
    }

    /// Generate optimized query plan
    async fn generate_query_plan(&self, query: &str, query_hash: &str) -> Result<QueryPlan> {
        // Parse query to understand operations needed
        let operations = self.analyze_query(query).await?;
        
        // Generate execution steps
        let mut steps = Vec::new();
        let mut step_id = 0;
        
        for operation in operations {
            let cost = self.estimate_operation_cost(&operation).await?;
            let can_parallelize = self.can_parallelize_operation(&operation);
            
            steps.push(QueryStep {
                step_id,
                operation,
                estimated_cost: cost,
                dependencies: if step_id > 0 { vec![step_id - 1] } else { vec![] },
                can_parallelize,
            });
            
            step_id += 1;
        }
        
        // Generate parallelization plan
        let parallelization = self.generate_parallelization_plan(&steps).await?;
        
        // Determine caching strategy
        let cache_strategy = self.determine_cache_strategy(&steps).await?;
        
        // Calculate total estimated cost and time
        let estimated_cost: f64 = steps.iter().map(|s| s.estimated_cost).sum();
        let estimated_time_ms = self.estimate_execution_time(&steps, &parallelization).await?;
        
        Ok(QueryPlan {
            plan_id: Uuid::new_v4(),
            query_hash: query_hash.to_string(),
            estimated_cost,
            estimated_time_ms,
            steps,
            cache_strategy,
            parallelization,
        })
    }

    /// Analyze query to identify required operations
    async fn analyze_query(&self, query: &str) -> Result<Vec<QueryOperation>> {
        let mut operations = Vec::new();
        
        // Simple query parsing (in production, would use a proper SQL/query parser)
        let query_lower = query.to_lowercase();
        
        // Check for vector operations
        if query_lower.contains("vector_search") || query_lower.contains("similarity") {
            operations.push(QueryOperation::VectorSearch {
                vector_dim: 768, // Default dimension
                k: 10,           // Default k
                use_hnsw: true,
                use_ivf: false,
            });
        }
        
        // Check for data retrieval
        if query_lower.contains("select") || query_lower.contains("get") {
            operations.push(QueryOperation::DataRetrieval {
                keys: vec!["*".to_string()],
                use_cache: self.config.enable_query_caching,
            });
        }
        
        // Check for filtering
        if query_lower.contains("where") || query_lower.contains("filter") {
            operations.push(QueryOperation::Filtering {
                conditions: vec!["condition".to_string()],
                use_index: self.config.enable_index_optimization,
            });
        }
        
        // Check for aggregations
        if query_lower.contains("count") {
            operations.push(QueryOperation::Aggregation {
                operation: AggregationType::Count,
                field: "id".to_string(),
            });
        } else if query_lower.contains("sum") {
            operations.push(QueryOperation::Aggregation {
                operation: AggregationType::Sum,
                field: "value".to_string(),
            });
        } else if query_lower.contains("avg") || query_lower.contains("average") {
            operations.push(QueryOperation::Aggregation {
                operation: AggregationType::Average,
                field: "value".to_string(),
            });
        }
        
        // Check for sorting
        if query_lower.contains("order by") || query_lower.contains("sort") {
            operations.push(QueryOperation::Sorting {
                field: "timestamp".to_string(),
                ascending: !query_lower.contains("desc"),
            });
        }
        
        // If no specific operations found, default to data retrieval
        if operations.is_empty() {
            operations.push(QueryOperation::DataRetrieval {
                keys: vec!["*".to_string()],
                use_cache: self.config.enable_query_caching,
            });
        }
        
        Ok(operations)
    }

    /// Estimate cost of an operation
    async fn estimate_operation_cost(&self, operation: &QueryOperation) -> Result<f64> {
        match operation {
            QueryOperation::VectorSearch { vector_dim, k, use_hnsw, .. } => {
                let base_cost = (*vector_dim as f64).log2() * (*k as f64);
                if *use_hnsw {
                    Ok(base_cost * 0.7) // HNSW is more efficient
                } else {
                    Ok(base_cost)
                }
            }
            QueryOperation::DataRetrieval { keys, use_cache } => {
                let base_cost = keys.len() as f64 * 10.0;
                if *use_cache {
                    Ok(base_cost * 0.3) // Cache reduces cost significantly
                } else {
                    Ok(base_cost)
                }
            }
            QueryOperation::Filtering { conditions, use_index } => {
                let base_cost = conditions.len() as f64 * 50.0;
                if *use_index {
                    Ok(base_cost * 0.2) // Indexes greatly reduce filtering cost
                } else {
                    Ok(base_cost)
                }
            }
            QueryOperation::Aggregation { operation, .. } => {
                match operation {
                    AggregationType::Count => Ok(100.0),
                    AggregationType::Sum | AggregationType::Average => Ok(200.0),
                    AggregationType::Min | AggregationType::Max => Ok(150.0),
                    AggregationType::Distinct => Ok(500.0),
                }
            }
            QueryOperation::Sorting { .. } => Ok(300.0),
            QueryOperation::Join { join_type, .. } => {
                match join_type {
                    JoinType::Inner => Ok(1000.0),
                    JoinType::Left | JoinType::Right => Ok(1200.0),
                    JoinType::Full => Ok(1500.0),
                }
            }
        }
    }

    /// Check if operation can be parallelized
    fn can_parallelize_operation(&self, operation: &QueryOperation) -> bool {
        match operation {
            QueryOperation::VectorSearch { .. } => true,
            QueryOperation::DataRetrieval { .. } => true,
            QueryOperation::Filtering { .. } => true,
            QueryOperation::Aggregation { operation, .. } => {
                matches!(operation, AggregationType::Count | AggregationType::Sum | AggregationType::Average)
            }
            QueryOperation::Sorting { .. } => false, // Sorting generally not parallelizable in simple cases
            QueryOperation::Join { .. } => true,
        }
    }

    /// Generate parallelization plan
    async fn generate_parallelization_plan(&self, steps: &[QueryStep]) -> Result<ParallelizationPlan> {
        let max_threads = if self.config.enable_batch_processing {
            self.config.max_concurrent_operations.min(16)
        } else {
            4
        };
        
        let mut parallel_steps = HashMap::new();
        
        for step in steps {
            if step.can_parallelize {
                let thread_count = match &step.operation {
                    QueryOperation::VectorSearch { .. } => max_threads.min(4),
                    QueryOperation::DataRetrieval { .. } => max_threads.min(8),
                    QueryOperation::Filtering { .. } => max_threads.min(6),
                    _ => max_threads.min(2),
                };
                parallel_steps.insert(step.step_id, thread_count);
            }
        }
        
        Ok(ParallelizationPlan {
            max_threads,
            parallel_steps,
            data_partitioning: if self.config.enable_batch_processing {
                Some(PartitioningStrategy::HashPartition { partition_count: 4 })
            } else {
                None
            },
        })
    }

    /// Determine optimal caching strategy
    async fn determine_cache_strategy(&self, steps: &[QueryStep]) -> Result<CacheStrategy> {
        if !self.config.enable_query_caching {
            return Ok(CacheStrategy::None);
        }
        
        // Check if any expensive operations that would benefit from caching
        let has_expensive_ops = steps.iter().any(|s| s.estimated_cost > 500.0);
        let has_vector_search = steps.iter().any(|s| matches!(s.operation, QueryOperation::VectorSearch { .. }));
        
        if has_vector_search || has_expensive_ops {
            Ok(CacheStrategy::FullCache { ttl_seconds: 300 }) // 5 minutes
        } else if steps.len() > 3 {
            let cacheable_steps: Vec<_> = steps.iter()
                .filter(|s| s.estimated_cost > 100.0)
                .map(|s| s.step_id)
                .collect();
            
            if !cacheable_steps.is_empty() {
                Ok(CacheStrategy::PartialCache { steps: cacheable_steps })
            } else {
                Ok(CacheStrategy::ResultCache { ttl_seconds: 60 })
            }
        } else {
            Ok(CacheStrategy::ResultCache { ttl_seconds: 60 })
        }
    }

    /// Estimate total execution time considering parallelization
    async fn estimate_execution_time(&self, steps: &[QueryStep], parallelization: &ParallelizationPlan) -> Result<f64> {
        let mut total_time = 0.0;
        
        for step in steps {
            let base_time = step.estimated_cost;
            
            if let Some(thread_count) = parallelization.parallel_steps.get(&step.step_id) {
                // Assume parallel efficiency of 70%
                let parallel_time = base_time / (*thread_count as f64 * 0.7);
                total_time += parallel_time;
            } else {
                total_time += base_time;
            }
        }
        
        Ok(total_time)
    }

    /// Generate recommendations for query optimization
    pub async fn generate_recommendations(&self, query: &str) -> Result<Vec<String>> {
        let mut recommendations = Vec::new();
        let query_lower = query.to_lowercase();
        
        // Check for missing indexes
        if query_lower.contains("where") && !self.config.enable_index_optimization {
            recommendations.push("Consider enabling index optimization for better filtering performance".to_string());
        }
        
        // Check for caching opportunities
        if !self.config.enable_query_caching {
            recommendations.push("Enable query caching to improve repeated query performance".to_string());
        }
        
        // Check for batch processing opportunities
        if !self.config.enable_batch_processing {
            recommendations.push("Enable batch processing for better throughput on large datasets".to_string());
        }
        
        // Check for vector search optimization
        if query_lower.contains("vector") || query_lower.contains("similarity") {
            recommendations.push("Consider using HNSW index for faster vector searches".to_string());
        }
        
        Ok(recommendations)
    }

    /// Record query execution statistics
    pub async fn record_execution(&self, query_hash: &str, execution_time_ms: f64) -> Result<()> {
        let mut stats = self.query_stats.write().await;
        let query_stats = stats.entry(query_hash.to_string()).or_insert(QueryExecutionStats {
            query_hash: query_hash.to_string(),
            execution_count: 0,
            total_time_ms: 0.0,
            average_time_ms: 0.0,
            min_time_ms: f64::INFINITY,
            max_time_ms: 0.0,
            last_executed: chrono::Utc::now(),
        });
        
        query_stats.execution_count += 1;
        query_stats.total_time_ms += execution_time_ms;
        query_stats.average_time_ms = query_stats.total_time_ms / query_stats.execution_count as f64;
        query_stats.min_time_ms = query_stats.min_time_ms.min(execution_time_ms);
        query_stats.max_time_ms = query_stats.max_time_ms.max(execution_time_ms);
        query_stats.last_executed = chrono::Utc::now();
        
        Ok(())
    }

    /// Get optimization statistics
    pub async fn get_optimization_stats(&self) -> Result<OptimizationStats> {
        let stats = self.optimization_stats.read().await;
        Ok(stats.clone())
    }

    // Helper methods
    fn hash_query(&self, query: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        query.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }

    fn serialize_plan(&self, plan: &QueryPlan) -> String {
        serde_json::to_string_pretty(plan).unwrap_or_else(|_| "Error serializing plan".to_string())
    }

    async fn update_cache_hit(&self) {
        let mut stats = self.optimization_stats.write().await;
        stats.cache_hits += 1;
    }

    async fn update_cache_miss(&self) {
        let mut stats = self.optimization_stats.write().await;
        stats.cache_misses += 1;
    }

    async fn update_optimization_stats(&self) {
        let mut stats = self.optimization_stats.write().await;
        stats.queries_optimized += 1;
        // Update other stats as needed
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::performance::OptimizationConfig;

    #[tokio::test]
    async fn test_optimizer_creation() {
        let config = OptimizationConfig {
            enable_query_caching: true,
            enable_index_optimization: true,
            enable_memory_pooling: true,
            enable_batch_processing: true,
            max_concurrent_operations: 100,
            cache_size_mb: 512,
            gc_threshold: 0.8,
        };
        
        let optimizer = QueryOptimizer::new(&config).await;
        assert!(optimizer.is_ok());
    }

    #[tokio::test]
    async fn test_query_optimization() {
        let config = OptimizationConfig {
            enable_query_caching: true,
            enable_index_optimization: true,
            enable_memory_pooling: true,
            enable_batch_processing: true,
            max_concurrent_operations: 100,
            cache_size_mb: 512,
            gc_threshold: 0.8,
        };
        
        let optimizer = QueryOptimizer::new(&config).await.unwrap();
        let result = optimizer.optimize_query("SELECT * FROM vectors WHERE similarity > 0.8").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_recommendations() {
        let config = OptimizationConfig {
            enable_query_caching: false,
            enable_index_optimization: false,
            enable_memory_pooling: true,
            enable_batch_processing: false,
            max_concurrent_operations: 100,
            cache_size_mb: 512,
            gc_threshold: 0.8,
        };
        
        let optimizer = QueryOptimizer::new(&config).await.unwrap();
        let recommendations = optimizer.generate_recommendations("SELECT * FROM data WHERE field = value").await.unwrap();
        assert!(!recommendations.is_empty());
    }
}
