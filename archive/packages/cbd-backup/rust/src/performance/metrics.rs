//! Metrics Collection System for CBD Engine
//! 
//! Comprehensive metrics collection for performance monitoring, including
//! query statistics, resource utilization, cache performance, and system health.

use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use tokio::sync::RwLock;
use tokio::time::{Duration, Instant};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

use crate::error::CBDError;

type Result<T> = std::result::Result<T, CBDError>;

/// Query performance statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryStatistics {
    pub total_queries: u64,
    pub successful_queries: u64,
    pub failed_queries: u64,
    pub average_latency_ms: f64,
    pub min_latency_ms: f64,
    pub max_latency_ms: f64,
    pub operations_per_second: f64,
    pub error_rate: f64,
}

/// Cache performance statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheStatistics {
    pub total_requests: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub hit_rate: f64,
    pub miss_rate: f64,
    pub cache_size_bytes: u64,
    pub evictions: u64,
}

/// System metrics snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub timestamp: DateTime<Utc>,
    pub uptime_seconds: u64,
    pub active_connections: usize,
    pub total_data_size_bytes: u64,
    pub index_size_bytes: u64,
    pub memory_usage_bytes: u64,
}

/// Metrics time series data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricDataPoint {
    pub timestamp: DateTime<Utc>,
    pub value: f64,
}

/// Comprehensive metrics collector
#[derive(Debug)]
pub struct MetricsCollector {
    /// Query counters
    total_queries: AtomicU64,
    successful_queries: AtomicU64,
    failed_queries: AtomicU64,
    
    /// Query latency tracking
    query_latencies: Arc<RwLock<VecDeque<f64>>>,
    
    /// Cache counters
    cache_requests: AtomicU64,
    cache_hits: AtomicU64,
    cache_misses: AtomicU64,
    cache_evictions: AtomicU64,
    
    /// System counters
    active_connections: AtomicUsize,
    data_size_bytes: AtomicU64,
    index_size_bytes: AtomicU64,
    memory_usage_bytes: AtomicU64,
    
    /// Time series data
    cpu_metrics: Arc<RwLock<VecDeque<MetricDataPoint>>>,
    memory_metrics: Arc<RwLock<VecDeque<MetricDataPoint>>>,
    throughput_metrics: Arc<RwLock<VecDeque<MetricDataPoint>>>,
    
    /// Start time for uptime calculation
    start_time: Instant,
    
    /// Collection state
    is_collecting: Arc<RwLock<bool>>,
}

impl MetricsCollector {
    /// Create new metrics collector
    pub async fn new() -> Result<Self> {
        Ok(Self {
            total_queries: AtomicU64::new(0),
            successful_queries: AtomicU64::new(0),
            failed_queries: AtomicU64::new(0),
            query_latencies: Arc::new(RwLock::new(VecDeque::with_capacity(1000))),
            cache_requests: AtomicU64::new(0),
            cache_hits: AtomicU64::new(0),
            cache_misses: AtomicU64::new(0),
            cache_evictions: AtomicU64::new(0),
            active_connections: AtomicUsize::new(0),
            data_size_bytes: AtomicU64::new(0),
            index_size_bytes: AtomicU64::new(0),
            memory_usage_bytes: AtomicU64::new(0),
            cpu_metrics: Arc::new(RwLock::new(VecDeque::with_capacity(1000))),
            memory_metrics: Arc::new(RwLock::new(VecDeque::with_capacity(1000))),
            throughput_metrics: Arc::new(RwLock::new(VecDeque::with_capacity(1000))),
            start_time: Instant::now(),
            is_collecting: Arc::new(RwLock::new(false)),
        })
    }

    /// Start metrics collection
    pub async fn start_collection(&self) -> Result<()> {
        let mut is_collecting = self.is_collecting.write().await;
        *is_collecting = true;
        println!("📊 Metrics collection started");
        Ok(())
    }

    /// Stop metrics collection
    pub async fn stop_collection(&self) -> Result<()> {
        let mut is_collecting = self.is_collecting.write().await;
        *is_collecting = false;
        println!("📊 Metrics collection stopped");
        Ok(())
    }

    /// Record query execution
    pub async fn record_query(&self, latency_ms: f64, success: bool) -> Result<()> {
        self.total_queries.fetch_add(1, Ordering::Relaxed);
        
        if success {
            self.successful_queries.fetch_add(1, Ordering::Relaxed);
        } else {
            self.failed_queries.fetch_add(1, Ordering::Relaxed);
        }
        
        // Record latency
        let mut latencies = self.query_latencies.write().await;
        if latencies.len() >= 1000 {
            latencies.pop_front();
        }
        latencies.push_back(latency_ms);
        
        Ok(())
    }

    /// Record cache access
    pub async fn record_cache_access(&self, hit: bool) -> Result<()> {
        self.cache_requests.fetch_add(1, Ordering::Relaxed);
        
        if hit {
            self.cache_hits.fetch_add(1, Ordering::Relaxed);
        } else {
            self.cache_misses.fetch_add(1, Ordering::Relaxed);
        }
        
        Ok(())
    }

    /// Record cache eviction
    pub async fn record_cache_eviction(&self) -> Result<()> {
        self.cache_evictions.fetch_add(1, Ordering::Relaxed);
        Ok(())
    }

    /// Update connection count
    pub async fn update_active_connections(&self, count: usize) -> Result<()> {
        self.active_connections.store(count, Ordering::Relaxed);
        Ok(())
    }

    /// Update data size
    pub async fn update_data_size(&self, bytes: u64) -> Result<()> {
        self.data_size_bytes.store(bytes, Ordering::Relaxed);
        Ok(())
    }

    /// Update index size
    pub async fn update_index_size(&self, bytes: u64) -> Result<()> {
        self.index_size_bytes.store(bytes, Ordering::Relaxed);
        Ok(())
    }

    /// Update memory usage
    pub async fn update_memory_usage(&self, bytes: u64) -> Result<()> {
        self.memory_usage_bytes.store(bytes, Ordering::Relaxed);
        
        // Add to time series
        let data_point = MetricDataPoint {
            timestamp: Utc::now(),
            value: bytes as f64,
        };
        
        let mut metrics = self.memory_metrics.write().await;
        if metrics.len() >= 1000 {
            metrics.pop_front();
        }
        metrics.push_back(data_point);
        
        Ok(())
    }

    /// Record CPU usage
    pub async fn record_cpu_usage(&self, cpu_percent: f64) -> Result<()> {
        let data_point = MetricDataPoint {
            timestamp: Utc::now(),
            value: cpu_percent,
        };
        
        let mut metrics = self.cpu_metrics.write().await;
        if metrics.len() >= 1000 {
            metrics.pop_front();
        }
        metrics.push_back(data_point);
        
        Ok(())
    }

    /// Record throughput
    pub async fn record_throughput(&self, ops_per_second: f64) -> Result<()> {
        let data_point = MetricDataPoint {
            timestamp: Utc::now(),
            value: ops_per_second,
        };
        
        let mut metrics = self.throughput_metrics.write().await;
        if metrics.len() >= 1000 {
            metrics.pop_front();
        }
        metrics.push_back(data_point);
        
        Ok(())
    }

    /// Get query statistics
    pub async fn get_query_statistics(&self) -> Result<QueryStatistics> {
        let total = self.total_queries.load(Ordering::Relaxed);
        let successful = self.successful_queries.load(Ordering::Relaxed);
        let failed = self.failed_queries.load(Ordering::Relaxed);
        
        let latencies = self.query_latencies.read().await;
        let (avg_latency, min_latency, max_latency) = if latencies.is_empty() {
            (0.0, 0.0, 0.0)
        } else {
            let sum: f64 = latencies.iter().sum();
            let avg = sum / latencies.len() as f64;
            let min = latencies.iter().cloned().fold(f64::INFINITY, f64::min);
            let max = latencies.iter().cloned().fold(0.0, f64::max);
            (avg, min, max)
        };
        
        // Calculate operations per second (approximate)
        let uptime_seconds = self.start_time.elapsed().as_secs_f64();
        let ops_per_second = if uptime_seconds > 0.0 {
            total as f64 / uptime_seconds
        } else {
            0.0
        };
        
        let error_rate = if total > 0 {
            failed as f64 / total as f64
        } else {
            0.0
        };
        
        Ok(QueryStatistics {
            total_queries: total,
            successful_queries: successful,
            failed_queries: failed,
            average_latency_ms: avg_latency,
            min_latency_ms: min_latency,
            max_latency_ms: max_latency,
            operations_per_second: ops_per_second,
            error_rate,
        })
    }

    /// Get cache statistics
    pub async fn get_cache_statistics(&self) -> Result<CacheStatistics> {
        let total_requests = self.cache_requests.load(Ordering::Relaxed);
        let hits = self.cache_hits.load(Ordering::Relaxed);
        let misses = self.cache_misses.load(Ordering::Relaxed);
        let evictions = self.cache_evictions.load(Ordering::Relaxed);
        
        let hit_rate = if total_requests > 0 {
            hits as f64 / total_requests as f64
        } else {
            0.0
        };
        
        let miss_rate = if total_requests > 0 {
            misses as f64 / total_requests as f64
        } else {
            0.0
        };
        
        Ok(CacheStatistics {
            total_requests,
            cache_hits: hits,
            cache_misses: misses,
            hit_rate,
            miss_rate,
            cache_size_bytes: 0, // TODO: Implement cache size tracking
            evictions,
        })
    }

    /// Get system metrics
    pub async fn get_system_metrics(&self) -> Result<SystemMetrics> {
        Ok(SystemMetrics {
            timestamp: Utc::now(),
            uptime_seconds: self.start_time.elapsed().as_secs(),
            active_connections: self.active_connections.load(Ordering::Relaxed),
            total_data_size_bytes: self.data_size_bytes.load(Ordering::Relaxed),
            index_size_bytes: self.index_size_bytes.load(Ordering::Relaxed),
            memory_usage_bytes: self.memory_usage_bytes.load(Ordering::Relaxed),
        })
    }

    /// Get active connections count
    pub async fn get_active_connections(&self) -> Result<usize> {
        Ok(self.active_connections.load(Ordering::Relaxed))
    }

    /// Get time series data for a metric
    pub async fn get_time_series(&self, metric_name: &str) -> Result<Vec<MetricDataPoint>> {
        match metric_name {
            "cpu" => {
                let metrics = self.cpu_metrics.read().await;
                Ok(metrics.clone().into())
            }
            "memory" => {
                let metrics = self.memory_metrics.read().await;
                Ok(metrics.clone().into())
            }
            "throughput" => {
                let metrics = self.throughput_metrics.read().await;
                Ok(metrics.clone().into())
            }
            _ => Ok(Vec::new()),
        }
    }

    /// Get metrics summary
    pub async fn get_metrics_summary(&self) -> Result<HashMap<String, f64>> {
        let mut summary = HashMap::new();
        
        let query_stats = self.get_query_statistics().await?;
        let cache_stats = self.get_cache_statistics().await?;
        let system_metrics = self.get_system_metrics().await?;
        
        summary.insert("total_queries".to_string(), query_stats.total_queries as f64);
        summary.insert("average_latency_ms".to_string(), query_stats.average_latency_ms);
        summary.insert("operations_per_second".to_string(), query_stats.operations_per_second);
        summary.insert("error_rate".to_string(), query_stats.error_rate);
        summary.insert("cache_hit_rate".to_string(), cache_stats.hit_rate);
        summary.insert("active_connections".to_string(), system_metrics.active_connections as f64);
        summary.insert("uptime_seconds".to_string(), system_metrics.uptime_seconds as f64);
        summary.insert("data_size_mb".to_string(), system_metrics.total_data_size_bytes as f64 / (1024.0 * 1024.0));
        
        Ok(summary)
    }

    /// Reset all metrics
    pub async fn reset_metrics(&self) -> Result<()> {
        self.total_queries.store(0, Ordering::Relaxed);
        self.successful_queries.store(0, Ordering::Relaxed);
        self.failed_queries.store(0, Ordering::Relaxed);
        self.cache_requests.store(0, Ordering::Relaxed);
        self.cache_hits.store(0, Ordering::Relaxed);
        self.cache_misses.store(0, Ordering::Relaxed);
        self.cache_evictions.store(0, Ordering::Relaxed);
        
        self.query_latencies.write().await.clear();
        self.cpu_metrics.write().await.clear();
        self.memory_metrics.write().await.clear();
        self.throughput_metrics.write().await.clear();
        
        println!("📊 All metrics reset");
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_metrics_collector_creation() {
        let collector = MetricsCollector::new().await;
        assert!(collector.is_ok());
    }

    #[tokio::test]
    async fn test_query_recording() {
        let collector = MetricsCollector::new().await.unwrap();
        collector.record_query(100.0, true).await.unwrap();
        
        let stats = collector.get_query_statistics().await.unwrap();
        assert_eq!(stats.total_queries, 1);
        assert_eq!(stats.successful_queries, 1);
        assert_eq!(stats.average_latency_ms, 100.0);
    }

    #[tokio::test]
    async fn test_cache_recording() {
        let collector = MetricsCollector::new().await.unwrap();
        collector.record_cache_access(true).await.unwrap();
        collector.record_cache_access(false).await.unwrap();
        
        let stats = collector.get_cache_statistics().await.unwrap();
        assert_eq!(stats.total_requests, 2);
        assert_eq!(stats.cache_hits, 1);
        assert_eq!(stats.hit_rate, 0.5);
    }
}
