//! Performance Profiler for CBD Engine
//! 
//! Advanced performance profiling system that tracks CPU usage, memory allocation patterns,
//! I/O operations, and identifies performance bottlenecks in real-time.

use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

use crate::error::CBDError;

type Result<T> = std::result::Result<T, CBDError>;

/// Profiling sample containing performance data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfilingSample {
    pub timestamp: DateTime<Utc>,
    pub function_name: String,
    pub execution_time_ns: u64,
    pub cpu_cycles: u64,
    pub memory_allocated: u64,
    pub memory_deallocated: u64,
    pub io_reads: u64,
    pub io_writes: u64,
}

/// Function call profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionProfile {
    pub function_name: String,
    pub call_count: u64,
    pub total_time_ns: u64,
    pub average_time_ns: u64,
    pub min_time_ns: u64,
    pub max_time_ns: u64,
    pub total_memory_allocated: u64,
    pub total_memory_deallocated: u64,
}

/// Performance bottleneck identification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceBottleneck {
    pub bottleneck_type: BottleneckType,
    pub severity: BottleneckSeverity,
    pub description: String,
    pub function_name: Option<String>,
    pub impact_score: f64,
    pub recommendations: Vec<String>,
}

/// Types of performance bottlenecks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BottleneckType {
    CPU,
    Memory,
    IO,
    Lock,
    Network,
    Database,
    Algorithm,
}

/// Severity levels for bottlenecks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BottleneckSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Resource usage snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceSnapshot {
    pub timestamp: DateTime<Utc>,
    pub cpu_usage_percent: f64,
    pub memory_usage_mb: f64,
    pub memory_allocated_mb: f64,
    pub memory_freed_mb: f64,
    pub disk_read_mb: f64,
    pub disk_write_mb: f64,
    pub network_in_mb: f64,
    pub network_out_mb: f64,
}

/// Performance profiler system
#[derive(Debug)]
pub struct PerformanceProfiler {
    /// Profiling samples buffer
    samples: Arc<RwLock<VecDeque<ProfilingSample>>>,
    /// Function profiles
    function_profiles: Arc<RwLock<HashMap<String, FunctionProfile>>>,
    /// Resource usage history
    resource_snapshots: Arc<RwLock<VecDeque<ResourceSnapshot>>>,
    /// Identified bottlenecks
    bottlenecks: Arc<RwLock<Vec<PerformanceBottleneck>>>,
    /// Profiling state
    is_profiling: Arc<RwLock<bool>>,
    /// Profiling start time
    start_time: Instant,
}

impl PerformanceProfiler {
    /// Create new performance profiler
    pub async fn new() -> Result<Self> {
        Ok(Self {
            samples: Arc::new(RwLock::new(VecDeque::with_capacity(10000))),
            function_profiles: Arc::new(RwLock::new(HashMap::new())),
            resource_snapshots: Arc::new(RwLock::new(VecDeque::with_capacity(1000))),
            bottlenecks: Arc::new(RwLock::new(Vec::new())),
            is_profiling: Arc::new(RwLock::new(false)),
            start_time: Instant::now(),
        })
    }

    /// Start performance profiling
    pub async fn start_profiling(&self) -> Result<()> {
        let mut is_profiling = self.is_profiling.write().await;
        *is_profiling = true;
        println!("🔍 Performance profiling started");
        Ok(())
    }

    /// Stop performance profiling
    pub async fn stop_profiling(&self) -> Result<()> {
        let mut is_profiling = self.is_profiling.write().await;
        *is_profiling = false;
        println!("🔍 Performance profiling stopped");
        Ok(())
    }

    /// Record a profiling sample
    pub async fn record_sample(&self, sample: ProfilingSample) -> Result<()> {
        let is_profiling = self.is_profiling.read().await;
        if !*is_profiling {
            return Ok(());
        }

        // Add to samples buffer
        let mut samples = self.samples.write().await;
        if samples.len() >= 10000 {
            samples.pop_front();
        }
        samples.push_back(sample.clone());

        // Update function profile
        self.update_function_profile(&sample).await?;

        Ok(())
    }

    /// Update function profile statistics
    async fn update_function_profile(&self, sample: &ProfilingSample) -> Result<()> {
        let mut profiles = self.function_profiles.write().await;
        
        let profile = profiles.entry(sample.function_name.clone()).or_insert(FunctionProfile {
            function_name: sample.function_name.clone(),
            call_count: 0,
            total_time_ns: 0,
            average_time_ns: 0,
            min_time_ns: u64::MAX,
            max_time_ns: 0,
            total_memory_allocated: 0,
            total_memory_deallocated: 0,
        });

        profile.call_count += 1;
        profile.total_time_ns += sample.execution_time_ns;
        profile.average_time_ns = profile.total_time_ns / profile.call_count;
        profile.min_time_ns = profile.min_time_ns.min(sample.execution_time_ns);
        profile.max_time_ns = profile.max_time_ns.max(sample.execution_time_ns);
        profile.total_memory_allocated += sample.memory_allocated;
        profile.total_memory_deallocated += sample.memory_deallocated;

        Ok(())
    }

    /// Record resource usage snapshot
    pub async fn record_resource_snapshot(&self, snapshot: ResourceSnapshot) -> Result<()> {
        let mut snapshots = self.resource_snapshots.write().await;
        if snapshots.len() >= 1000 {
            snapshots.pop_front();
        }
        snapshots.push_back(snapshot);
        Ok(())
    }

    /// Analyze performance and identify bottlenecks
    pub async fn analyze_bottlenecks(&self) -> Result<Vec<PerformanceBottleneck>> {
        let mut bottlenecks = Vec::new();

        // Analyze function performance
        let profiles = self.function_profiles.read().await;
        for profile in profiles.values() {
            // Check for slow functions
            if profile.average_time_ns > 10_000_000 { // 10ms
                bottlenecks.push(PerformanceBottleneck {
                    bottleneck_type: BottleneckType::CPU,
                    severity: if profile.average_time_ns > 100_000_000 { // 100ms
                        BottleneckSeverity::High
                    } else if profile.average_time_ns > 50_000_000 { // 50ms
                        BottleneckSeverity::Medium
                    } else {
                        BottleneckSeverity::Low
                    },
                    description: format!("Slow function execution: {} (avg: {:.2}ms)", 
                                       profile.function_name, 
                                       profile.average_time_ns as f64 / 1_000_000.0),
                    function_name: Some(profile.function_name.clone()),
                    impact_score: (profile.average_time_ns as f64 / 1_000_000.0) * profile.call_count as f64,
                    recommendations: vec![
                        "Consider algorithmic optimization".to_string(),
                        "Review for unnecessary computations".to_string(),
                        "Consider caching results".to_string(),
                    ],
                });
            }

            // Check for memory leaks
            if profile.total_memory_allocated > profile.total_memory_deallocated {
                let leak_size = profile.total_memory_allocated - profile.total_memory_deallocated;
                if leak_size > 1024 * 1024 { // 1MB
                    bottlenecks.push(PerformanceBottleneck {
                        bottleneck_type: BottleneckType::Memory,
                        severity: if leak_size > 100 * 1024 * 1024 { // 100MB
                            BottleneckSeverity::Critical
                        } else if leak_size > 10 * 1024 * 1024 { // 10MB
                            BottleneckSeverity::High
                        } else {
                            BottleneckSeverity::Medium
                        },
                        description: format!("Potential memory leak in {}: {:.2}MB not freed", 
                                           profile.function_name, 
                                           leak_size as f64 / (1024.0 * 1024.0)),
                        function_name: Some(profile.function_name.clone()),
                        impact_score: leak_size as f64 / (1024.0 * 1024.0),
                        recommendations: vec![
                            "Review memory allocation patterns".to_string(),
                            "Check for proper resource cleanup".to_string(),
                            "Consider using RAII patterns".to_string(),
                        ],
                    });
                }
            }
        }

        // Analyze resource usage patterns
        let snapshots = self.resource_snapshots.read().await;
        if snapshots.len() > 10 {
            let recent_snapshots: Vec<_> = snapshots.iter().rev().take(10).collect();
            let avg_cpu = recent_snapshots.iter().map(|s| s.cpu_usage_percent).sum::<f64>() / recent_snapshots.len() as f64;
            let avg_memory = recent_snapshots.iter().map(|s| s.memory_usage_mb).sum::<f64>() / recent_snapshots.len() as f64;

            // High CPU usage
            if avg_cpu > 80.0 {
                bottlenecks.push(PerformanceBottleneck {
                    bottleneck_type: BottleneckType::CPU,
                    severity: if avg_cpu > 95.0 {
                        BottleneckSeverity::Critical
                    } else if avg_cpu > 90.0 {
                        BottleneckSeverity::High
                    } else {
                        BottleneckSeverity::Medium
                    },
                    description: format!("High CPU usage: {:.1}%", avg_cpu),
                    function_name: None,
                    impact_score: avg_cpu,
                    recommendations: vec![
                        "Scale out to additional nodes".to_string(),
                        "Optimize CPU-intensive operations".to_string(),
                        "Consider asynchronous processing".to_string(),
                    ],
                });
            }

            // High memory usage
            if avg_memory > 1000.0 { // 1GB
                bottlenecks.push(PerformanceBottleneck {
                    bottleneck_type: BottleneckType::Memory,
                    severity: if avg_memory > 8000.0 { // 8GB
                        BottleneckSeverity::Critical
                    } else if avg_memory > 4000.0 { // 4GB
                        BottleneckSeverity::High
                    } else {
                        BottleneckSeverity::Medium
                    },
                    description: format!("High memory usage: {:.1}MB", avg_memory),
                    function_name: None,
                    impact_score: avg_memory / 1000.0,
                    recommendations: vec![
                        "Increase available memory".to_string(),
                        "Optimize data structures".to_string(),
                        "Implement memory pooling".to_string(),
                    ],
                });
            }
        }

        // Store bottlenecks
        let mut stored_bottlenecks = self.bottlenecks.write().await;
        *stored_bottlenecks = bottlenecks.clone();

        Ok(bottlenecks)
    }

    /// Get function profiles sorted by impact
    pub async fn get_function_profiles(&self, top_n: usize) -> Result<Vec<FunctionProfile>> {
        let profiles = self.function_profiles.read().await;
        let mut profile_list: Vec<_> = profiles.values().cloned().collect();
        
        // Sort by total time descending (highest impact first)
        profile_list.sort_by(|a, b| b.total_time_ns.cmp(&a.total_time_ns));
        
        Ok(profile_list.into_iter().take(top_n).collect())
    }

    /// Get resource usage history
    pub async fn get_resource_history(&self, duration_minutes: u32) -> Result<Vec<ResourceSnapshot>> {
        let snapshots = self.resource_snapshots.read().await;
        let cutoff_time = Utc::now() - chrono::Duration::minutes(duration_minutes as i64);
        
        let filtered: Vec<_> = snapshots
            .iter()
            .filter(|snapshot| snapshot.timestamp > cutoff_time)
            .cloned()
            .collect();
            
        Ok(filtered)
    }

    /// Get current bottlenecks
    pub async fn get_current_bottlenecks(&self) -> Result<Vec<PerformanceBottleneck>> {
        let bottlenecks = self.bottlenecks.read().await;
        Ok(bottlenecks.clone())
    }

    /// Generate performance report
    pub async fn generate_performance_report(&self) -> Result<String> {
        let mut report = String::new();
        
        report.push_str("🔍 CBD Engine Performance Report\n");
        report.push_str("================================\n\n");
        
        // Profiling duration
        let duration = self.start_time.elapsed();
        report.push_str(&format!("Profiling Duration: {:.2} seconds\n\n", duration.as_secs_f64()));
        
        // Top functions by execution time
        let top_functions = self.get_function_profiles(10).await?;
        report.push_str("📊 Top Functions by Execution Time:\n");
        for (i, profile) in top_functions.iter().enumerate() {
            report.push_str(&format!(
                "{}. {} - {} calls, avg: {:.2}ms, total: {:.2}ms\n",
                i + 1,
                profile.function_name,
                profile.call_count,
                profile.average_time_ns as f64 / 1_000_000.0,
                profile.total_time_ns as f64 / 1_000_000.0
            ));
        }
        
        // Current bottlenecks
        let bottlenecks = self.analyze_bottlenecks().await?;
        report.push_str("\n⚠️  Performance Bottlenecks:\n");
        for bottleneck in &bottlenecks {
            let severity_emoji = match bottleneck.severity {
                BottleneckSeverity::Critical => "🔴",
                BottleneckSeverity::High => "🟠",
                BottleneckSeverity::Medium => "🟡",
                BottleneckSeverity::Low => "🟢",
            };
            
            report.push_str(&format!(
                "{} {:?}: {}\n",
                severity_emoji,
                bottleneck.bottleneck_type,
                bottleneck.description
            ));
        }
        
        if bottlenecks.is_empty() {
            report.push_str("✅ No performance bottlenecks detected\n");
        }
        
        report.push_str("\n📈 Performance Status: ");
        if bottlenecks.iter().any(|b| matches!(b.severity, BottleneckSeverity::Critical)) {
            report.push_str("Critical Issues Detected");
        } else if bottlenecks.iter().any(|b| matches!(b.severity, BottleneckSeverity::High)) {
            report.push_str("High Priority Issues Detected");
        } else if bottlenecks.iter().any(|b| matches!(b.severity, BottleneckSeverity::Medium)) {
            report.push_str("Medium Priority Issues Detected");
        } else {
            report.push_str("Optimal Performance");
        }
        
        Ok(report)
    }

    /// Clear profiling data
    pub async fn clear_profiling_data(&self) -> Result<()> {
        self.samples.write().await.clear();
        self.function_profiles.write().await.clear();
        self.resource_snapshots.write().await.clear();
        self.bottlenecks.write().await.clear();
        
        println!("🔍 Profiling data cleared");
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_profiler_creation() {
        let profiler = PerformanceProfiler::new().await;
        assert!(profiler.is_ok());
    }

    #[tokio::test]
    async fn test_sample_recording() {
        let profiler = PerformanceProfiler::new().await.unwrap();
        profiler.start_profiling().await.unwrap();
        
        let sample = ProfilingSample {
            timestamp: Utc::now(),
            function_name: "test_function".to_string(),
            execution_time_ns: 1_000_000,
            cpu_cycles: 1000,
            memory_allocated: 1024,
            memory_deallocated: 0,
            io_reads: 0,
            io_writes: 0,
        };
        
        profiler.record_sample(sample).await.unwrap();
        let profiles = profiler.get_function_profiles(10).await.unwrap();
        assert_eq!(profiles.len(), 1);
        assert_eq!(profiles[0].function_name, "test_function");
    }

    #[tokio::test]
    async fn test_bottleneck_analysis() {
        let profiler = PerformanceProfiler::new().await.unwrap();
        profiler.start_profiling().await.unwrap();
        
        // Record a slow function
        let sample = ProfilingSample {
            timestamp: Utc::now(),
            function_name: "slow_function".to_string(),
            execution_time_ns: 50_000_000, // 50ms
            cpu_cycles: 50000,
            memory_allocated: 0,
            memory_deallocated: 0,
            io_reads: 0,
            io_writes: 0,
        };
        
        profiler.record_sample(sample).await.unwrap();
        let bottlenecks = profiler.analyze_bottlenecks().await.unwrap();
        assert!(!bottlenecks.is_empty());
    }
}
