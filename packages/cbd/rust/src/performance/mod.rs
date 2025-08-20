//! CBD Engine Performance Optimization & Monitoring Module
//! 
//! Phase 2D Implementation: Advanced performance monitoring, optimization algorithms,
//! resource management, and real-time performance analytics for enterprise-scale operations.

use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{Duration, Instant};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::error::CBDError;

type Result<T> = std::result::Result<T, CBDError>;

// Import submodules
pub mod metrics;
pub mod profiler;
pub mod optimizer;
pub mod resource_monitor;
pub mod alerting;

use metrics::MetricsCollector;
use profiler::PerformanceProfiler;
use optimizer::QueryOptimizer;
use resource_monitor::ResourceMonitor;
use alerting::AlertingSystem;

/// Performance optimization level configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OptimizationLevel {
    /// Conservative optimization for stability
    Conservative,
    /// Balanced performance and stability
    Balanced,
    /// Aggressive optimization for maximum performance
    Aggressive,
    /// Custom optimization with specific parameters
    Custom(OptimizationConfig),
}

/// Custom optimization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationConfig {
    pub enable_query_caching: bool,
    pub enable_index_optimization: bool,
    pub enable_memory_pooling: bool,
    pub enable_batch_processing: bool,
    pub max_concurrent_operations: usize,
    pub cache_size_mb: usize,
    pub gc_threshold: f32,
}

/// Performance metrics snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSnapshot {
    pub timestamp: DateTime<Utc>,
    pub cpu_usage: f64,
    pub memory_usage: f64,
    pub disk_io: f64,
    pub network_io: f64,
    pub active_connections: usize,
    pub query_latency_ms: f64,
    pub throughput_ops_sec: f64,
    pub cache_hit_rate: f64,
    pub error_rate: f64,
}

/// Performance alert configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertConfig {
    pub cpu_threshold: f64,
    pub memory_threshold: f64,
    pub latency_threshold_ms: f64,
    pub error_rate_threshold: f64,
    pub throughput_threshold: f64,
}

impl Default for AlertConfig {
    fn default() -> Self {
        Self {
            cpu_threshold: 80.0,
            memory_threshold: 85.0,
            latency_threshold_ms: 1000.0,
            error_rate_threshold: 0.05,
            throughput_threshold: 100.0,
        }
    }
}

/// Main performance management system
#[derive(Debug)]
pub struct PerformanceManager {
    /// Unique manager ID
    id: Uuid,
    /// Performance configuration
    config: OptimizationConfig,
    /// Metrics collection system
    metrics_collector: Arc<MetricsCollector>,
    /// Performance profiler
    profiler: Arc<PerformanceProfiler>,
    /// Query optimizer
    optimizer: Arc<QueryOptimizer>,
    /// Resource monitor
    resource_monitor: Arc<ResourceMonitor>,
    /// Alerting system
    alerting: Arc<AlertingSystem>,
    /// Performance snapshots history
    snapshots: Arc<RwLock<VecDeque<PerformanceSnapshot>>>,
    /// Active performance optimizations
    active_optimizations: Arc<RwLock<HashMap<String, Instant>>>,
    /// Alert configuration
    alert_config: Arc<RwLock<AlertConfig>>,
}

impl PerformanceManager {
    /// Create new performance manager with default configuration
    pub async fn new(optimization_level: OptimizationLevel) -> Result<Self> {
        let config = match optimization_level {
            OptimizationLevel::Conservative => OptimizationConfig {
                enable_query_caching: true,
                enable_index_optimization: false,
                enable_memory_pooling: true,
                enable_batch_processing: false,
                max_concurrent_operations: 50,
                cache_size_mb: 256,
                gc_threshold: 0.7,
            },
            OptimizationLevel::Balanced => OptimizationConfig {
                enable_query_caching: true,
                enable_index_optimization: true,
                enable_memory_pooling: true,
                enable_batch_processing: true,
                max_concurrent_operations: 100,
                cache_size_mb: 512,
                gc_threshold: 0.8,
            },
            OptimizationLevel::Aggressive => OptimizationConfig {
                enable_query_caching: true,
                enable_index_optimization: true,
                enable_memory_pooling: true,
                enable_batch_processing: true,
                max_concurrent_operations: 200,
                cache_size_mb: 1024,
                gc_threshold: 0.9,
            },
            OptimizationLevel::Custom(custom_config) => custom_config,
        };

        let metrics_collector = Arc::new(MetricsCollector::new().await?);
        let profiler = Arc::new(PerformanceProfiler::new().await?);
        let optimizer = Arc::new(QueryOptimizer::new(&config).await?);
        let resource_monitor = Arc::new(ResourceMonitor::new().await?);
        let alerting = Arc::new(AlertingSystem::new().await?);

        Ok(Self {
            id: Uuid::new_v4(),
            config,
            metrics_collector,
            profiler,
            optimizer,
            resource_monitor,
            alerting,
            snapshots: Arc::new(RwLock::new(VecDeque::with_capacity(1000))),
            active_optimizations: Arc::new(RwLock::new(HashMap::new())),
            alert_config: Arc::new(RwLock::new(AlertConfig::default())),
        })
    }

    /// Start performance monitoring
    pub async fn start_monitoring(&self) -> Result<()> {
        // Start metrics collection
        self.metrics_collector.start_collection().await?;
        
        // Start resource monitoring
        self.resource_monitor.start_monitoring().await?;
        
        // Start performance profiling
        self.profiler.start_profiling().await?;
        
        // Start alerting system
        self.alerting.start_alerting().await?;
        
        println!("🚀 Performance monitoring started - Manager ID: {}", self.id);
        Ok(())
    }

    /// Stop performance monitoring
    pub async fn stop_monitoring(&self) -> Result<()> {
        self.alerting.stop_alerting().await?;
        self.profiler.stop_profiling().await?;
        self.resource_monitor.stop_monitoring().await?;
        self.metrics_collector.stop_collection().await?;
        
        println!("🛑 Performance monitoring stopped - Manager ID: {}", self.id);
        Ok(())
    }

    /// Capture current performance snapshot
    pub async fn capture_snapshot(&self) -> Result<PerformanceSnapshot> {
        let cpu_usage = self.resource_monitor.get_cpu_usage().await?;
        let memory_usage = self.resource_monitor.get_memory_usage().await?;
        let disk_io = self.resource_monitor.get_disk_io().await?;
        let network_io = self.resource_monitor.get_network_io().await?;
        
        let query_stats = self.metrics_collector.get_query_statistics().await?;
        let cache_stats = self.metrics_collector.get_cache_statistics().await?;

        let snapshot = PerformanceSnapshot {
            timestamp: Utc::now(),
            cpu_usage,
            memory_usage,
            disk_io,
            network_io,
            active_connections: self.metrics_collector.get_active_connections().await?,
            query_latency_ms: query_stats.average_latency_ms,
            throughput_ops_sec: query_stats.operations_per_second,
            cache_hit_rate: cache_stats.hit_rate,
            error_rate: query_stats.error_rate,
        };

        // Store snapshot in history
        let mut snapshots = self.snapshots.write().await;
        if snapshots.len() >= 1000 {
            snapshots.pop_front();
        }
        snapshots.push_back(snapshot.clone());

        // Check for alerts
        self.check_performance_alerts(&snapshot).await?;

        Ok(snapshot)
    }

    /// Check performance against alert thresholds
    async fn check_performance_alerts(&self, snapshot: &PerformanceSnapshot) -> Result<()> {
        let alert_config = self.alert_config.read().await;
        
        if snapshot.cpu_usage > alert_config.cpu_threshold {
            self.alerting.trigger_alert(
                "high_cpu_usage".to_string(),
                format!("CPU usage: {:.1}%", snapshot.cpu_usage),
            ).await?;
        }
        
        if snapshot.memory_usage > alert_config.memory_threshold {
            self.alerting.trigger_alert(
                "high_memory_usage".to_string(),
                format!("Memory usage: {:.1}%", snapshot.memory_usage),
            ).await?;
        }
        
        if snapshot.query_latency_ms > alert_config.latency_threshold_ms {
            self.alerting.trigger_alert(
                "high_latency".to_string(),
                format!("Query latency: {:.1}ms", snapshot.query_latency_ms),
            ).await?;
        }
        
        if snapshot.error_rate > alert_config.error_rate_threshold {
            self.alerting.trigger_alert(
                "high_error_rate".to_string(),
                format!("Error rate: {:.1}%", snapshot.error_rate * 100.0),
            ).await?;
        }
        
        Ok(())
    }

    /// Optimize query performance
    pub async fn optimize_query(&self, query_id: &str, query_params: &str) -> Result<String> {
        let optimized = self.optimizer.optimize_query(query_params).await?;
        
        // Record optimization
        let mut optimizations = self.active_optimizations.write().await;
        optimizations.insert(query_id.to_string(), Instant::now());
        
        Ok(optimized)
    }

    /// Get performance recommendations
    pub async fn get_performance_recommendations(&self) -> Result<Vec<String>> {
        let mut recommendations = Vec::new();
        
        // Analyze recent snapshots
        let snapshots = self.snapshots.read().await;
        if snapshots.len() < 10 {
            return Ok(recommendations);
        }
        
        let recent_snapshots: Vec<_> = snapshots.iter().rev().take(10).collect();
        
        // Calculate averages
        let avg_cpu = recent_snapshots.iter().map(|s| s.cpu_usage).sum::<f64>() / recent_snapshots.len() as f64;
        let avg_memory = recent_snapshots.iter().map(|s| s.memory_usage).sum::<f64>() / recent_snapshots.len() as f64;
        let avg_latency = recent_snapshots.iter().map(|s| s.query_latency_ms).sum::<f64>() / recent_snapshots.len() as f64;
        let avg_cache_hit_rate = recent_snapshots.iter().map(|s| s.cache_hit_rate).sum::<f64>() / recent_snapshots.len() as f64;
        
        // Generate recommendations
        if avg_cpu > 70.0 {
            recommendations.push("Consider scaling out to additional nodes to reduce CPU load".to_string());
        }
        
        if avg_memory > 80.0 {
            recommendations.push("Increase memory allocation or optimize memory usage patterns".to_string());
        }
        
        if avg_latency > 500.0 {
            recommendations.push("Enable more aggressive query caching and index optimization".to_string());
        }
        
        if avg_cache_hit_rate < 0.8 {
            recommendations.push("Increase cache size or review cache eviction policies".to_string());
        }
        
        if recommendations.is_empty() {
            recommendations.push("System performance is optimal - no immediate optimizations needed".to_string());
        }
        
        Ok(recommendations)
    }

    /// Get performance history
    pub async fn get_performance_history(&self, duration_minutes: u32) -> Result<Vec<PerformanceSnapshot>> {
        let snapshots = self.snapshots.read().await;
        let cutoff_time = Utc::now() - chrono::Duration::minutes(duration_minutes as i64);
        
        let filtered: Vec<_> = snapshots
            .iter()
            .filter(|snapshot| snapshot.timestamp > cutoff_time)
            .cloned()
            .collect();
            
        Ok(filtered)
    }

    /// Update alert configuration
    pub async fn update_alert_config(&self, new_config: AlertConfig) -> Result<()> {
        let mut config = self.alert_config.write().await;
        *config = new_config;
        println!("📊 Alert configuration updated");
        Ok(())
    }

    /// Get current performance statistics
    pub async fn get_performance_statistics(&self) -> Result<HashMap<String, f64>> {
        let mut stats = HashMap::new();
        
        let snapshots = self.snapshots.read().await;
        if snapshots.is_empty() {
            return Ok(stats);
        }
        
        let recent_snapshots: Vec<_> = snapshots.iter().rev().take(60).collect(); // Last hour
        
        // Calculate statistics
        let cpu_values: Vec<f64> = recent_snapshots.iter().map(|s| s.cpu_usage).collect();
        let memory_values: Vec<f64> = recent_snapshots.iter().map(|s| s.memory_usage).collect();
        let latency_values: Vec<f64> = recent_snapshots.iter().map(|s| s.query_latency_ms).collect();
        
        stats.insert("avg_cpu_usage".to_string(), cpu_values.iter().sum::<f64>() / cpu_values.len() as f64);
        stats.insert("max_cpu_usage".to_string(), cpu_values.iter().cloned().fold(0.0, f64::max));
        
        stats.insert("avg_memory_usage".to_string(), memory_values.iter().sum::<f64>() / memory_values.len() as f64);
        stats.insert("max_memory_usage".to_string(), memory_values.iter().cloned().fold(0.0, f64::max));
        
        stats.insert("avg_query_latency_ms".to_string(), latency_values.iter().sum::<f64>() / latency_values.len() as f64);
        stats.insert("max_query_latency_ms".to_string(), latency_values.iter().cloned().fold(0.0, f64::max));
        
        stats.insert("total_snapshots".to_string(), snapshots.len() as f64);
        
        Ok(stats)
    }
}

impl Clone for PerformanceManager {
    fn clone(&self) -> Self {
        Self {
            id: self.id,
            config: self.config.clone(),
            metrics_collector: Arc::clone(&self.metrics_collector),
            profiler: Arc::clone(&self.profiler),
            optimizer: Arc::clone(&self.optimizer),
            resource_monitor: Arc::clone(&self.resource_monitor),
            alerting: Arc::clone(&self.alerting),
            snapshots: Arc::clone(&self.snapshots),
            active_optimizations: Arc::clone(&self.active_optimizations),
            alert_config: Arc::clone(&self.alert_config),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_performance_manager_creation() {
        let manager = PerformanceManager::new(OptimizationLevel::Balanced).await;
        assert!(manager.is_ok());
    }

    #[tokio::test]
    async fn test_performance_snapshot() {
        let manager = PerformanceManager::new(OptimizationLevel::Conservative).await.unwrap();
        let snapshot = manager.capture_snapshot().await;
        assert!(snapshot.is_ok());
    }
}
