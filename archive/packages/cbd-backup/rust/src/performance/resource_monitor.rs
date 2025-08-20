//! Resource Monitor for CBD Engine
//! 
//! System resource monitoring including CPU, memory, disk I/O, network usage,
//! and hardware performance metrics with real-time alerting capabilities.

use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use tokio::time::{interval, Instant};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

use crate::error::CBDError;

type Result<T> = std::result::Result<T, CBDError>;

/// System resource usage snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub timestamp: DateTime<Utc>,
    pub cpu_usage_percent: f64,
    pub memory_total_mb: u64,
    pub memory_used_mb: u64,
    pub memory_available_mb: u64,
    pub memory_usage_percent: f64,
    pub disk_read_mbps: f64,
    pub disk_write_mbps: f64,
    pub network_in_mbps: f64,
    pub network_out_mbps: f64,
    pub disk_usage_percent: f64,
    pub active_threads: usize,
    pub file_descriptors: usize,
}

/// Resource threshold configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceThresholds {
    pub cpu_warning: f64,
    pub cpu_critical: f64,
    pub memory_warning: f64,
    pub memory_critical: f64,
    pub disk_io_warning: f64,
    pub disk_io_critical: f64,
    pub network_warning: f64,
    pub network_critical: f64,
}

impl Default for ResourceThresholds {
    fn default() -> Self {
        Self {
            cpu_warning: 70.0,
            cpu_critical: 90.0,
            memory_warning: 80.0,
            memory_critical: 95.0,
            disk_io_warning: 80.0,
            disk_io_critical: 95.0,
            network_warning: 80.0,
            network_critical: 95.0,
        }
    }
}

/// Resource alert
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceAlert {
    pub alert_id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub resource_type: ResourceType,
    pub severity: AlertSeverity,
    pub current_value: f64,
    pub threshold_value: f64,
    pub message: String,
}

/// Resource types for monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResourceType {
    CPU,
    Memory,
    DiskIO,
    NetworkIO,
    DiskSpace,
    FileDescriptors,
}

/// Alert severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
}

/// Resource monitoring system
#[derive(Debug)]
pub struct ResourceMonitor {
    /// Resource usage history
    usage_history: Arc<RwLock<VecDeque<ResourceUsage>>>,
    /// Alert thresholds
    thresholds: Arc<RwLock<ResourceThresholds>>,
    /// Active alerts
    active_alerts: Arc<RwLock<Vec<ResourceAlert>>>,
    /// Monitoring state
    is_monitoring: Arc<RwLock<bool>>,
    /// Last measurement for rate calculations
    last_measurement: Arc<RwLock<Option<ResourceUsage>>>,
    /// Resource statistics
    statistics: Arc<RwLock<ResourceStatistics>>,
}

/// Resource usage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceStatistics {
    pub avg_cpu_usage: f64,
    pub max_cpu_usage: f64,
    pub avg_memory_usage: f64,
    pub max_memory_usage: f64,
    pub peak_disk_io: f64,
    pub peak_network_io: f64,
    pub total_alerts: u64,
    pub uptime_seconds: u64,
}

impl ResourceMonitor {
    /// Create new resource monitor
    pub async fn new() -> Result<Self> {
        Ok(Self {
            usage_history: Arc::new(RwLock::new(VecDeque::with_capacity(1000))),
            thresholds: Arc::new(RwLock::new(ResourceThresholds::default())),
            active_alerts: Arc::new(RwLock::new(Vec::new())),
            is_monitoring: Arc::new(RwLock::new(false)),
            last_measurement: Arc::new(RwLock::new(None)),
            statistics: Arc::new(RwLock::new(ResourceStatistics {
                avg_cpu_usage: 0.0,
                max_cpu_usage: 0.0,
                avg_memory_usage: 0.0,
                max_memory_usage: 0.0,
                peak_disk_io: 0.0,
                peak_network_io: 0.0,
                total_alerts: 0,
                uptime_seconds: 0,
            })),
        })
    }

    /// Start resource monitoring
    pub async fn start_monitoring(&self) -> Result<()> {
        let mut is_monitoring = self.is_monitoring.write().await;
        *is_monitoring = true;
        
        // Start monitoring loop
        let monitor = self.clone();
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(5)); // Monitor every 5 seconds
            
            loop {
                let is_monitoring = monitor.is_monitoring.read().await;
                if !*is_monitoring {
                    break;
                }
                drop(is_monitoring);
                
                interval.tick().await;
                
                if let Err(e) = monitor.collect_resource_usage().await {
                    eprintln!("Error collecting resource usage: {}", e);
                }
            }
        });
        
        println!("📊 Resource monitoring started");
        Ok(())
    }

    /// Stop resource monitoring
    pub async fn stop_monitoring(&self) -> Result<()> {
        let mut is_monitoring = self.is_monitoring.write().await;
        *is_monitoring = false;
        println!("📊 Resource monitoring stopped");
        Ok(())
    }

    /// Collect current resource usage
    async fn collect_resource_usage(&self) -> Result<()> {
        let usage = self.get_current_usage().await?;
        
        // Add to history
        let mut history = self.usage_history.write().await;
        if history.len() >= 1000 {
            history.pop_front();
        }
        history.push_back(usage.clone());
        
        // Update statistics
        self.update_statistics(&usage).await?;
        
        // Check thresholds and generate alerts
        self.check_thresholds(&usage).await?;
        
        // Update last measurement
        let mut last_measurement = self.last_measurement.write().await;
        *last_measurement = Some(usage);
        
        Ok(())
    }

    /// Get current resource usage
    async fn get_current_usage(&self) -> Result<ResourceUsage> {
        // Simulate resource collection (in production, use actual system APIs)
        let cpu_usage = self.get_cpu_usage_impl().await;
        let memory_info = self.get_memory_info_impl().await;
        let disk_io = self.get_disk_io_impl().await;
        let network_io = self.get_network_io_impl().await;
        
        Ok(ResourceUsage {
            timestamp: Utc::now(),
            cpu_usage_percent: cpu_usage,
            memory_total_mb: memory_info.0,
            memory_used_mb: memory_info.1,
            memory_available_mb: memory_info.0 - memory_info.1,
            memory_usage_percent: (memory_info.1 as f64 / memory_info.0 as f64) * 100.0,
            disk_read_mbps: disk_io.0,
            disk_write_mbps: disk_io.1,
            network_in_mbps: network_io.0,
            network_out_mbps: network_io.1,
            disk_usage_percent: 45.0, // Simulated
            active_threads: 50,       // Simulated
            file_descriptors: 128,    // Simulated
        })
    }

    /// Get CPU usage (simulated implementation)
    async fn get_cpu_usage_impl(&self) -> f64 {
        // In production, use system APIs like /proc/stat on Linux or performance counters on Windows
        use std::sync::atomic::{AtomicU64, Ordering};
        static COUNTER: AtomicU64 = AtomicU64::new(0);
        
        let count = COUNTER.fetch_add(1, Ordering::Relaxed);
        
        // Simulate varying CPU usage
        let base_usage = 25.0;
        let variation = ((count as f64 * 0.1).sin() * 20.0).abs();
        (base_usage + variation).min(100.0)
    }

    /// Get memory information (total, used)
    async fn get_memory_info_impl(&self) -> (u64, u64) {
        // In production, use system APIs
        let total_mb = 8192; // 8GB simulated
        let used_mb = (total_mb as f64 * 0.6) as u64; // 60% usage simulated
        (total_mb, used_mb)
    }

    /// Get disk I/O rates (read, write in MB/s)
    async fn get_disk_io_impl(&self) -> (f64, f64) {
        // In production, read from /proc/diskstats or use performance counters
        use std::sync::atomic::{AtomicU64, Ordering};
        static IO_COUNTER: AtomicU64 = AtomicU64::new(0);
        
        let count = IO_COUNTER.fetch_add(1, Ordering::Relaxed);
        let read_rate = ((count as f64 * 0.05).sin().abs() * 50.0).max(1.0);
        let write_rate = ((count as f64 * 0.07).cos().abs() * 30.0).max(0.5);
        
        (read_rate, write_rate)
    }

    /// Get network I/O rates (in, out in MB/s)
    async fn get_network_io_impl(&self) -> (f64, f64) {
        // In production, read from /proc/net/dev or use network performance counters
        use std::sync::atomic::{AtomicU64, Ordering};
        static NET_COUNTER: AtomicU64 = AtomicU64::new(0);
        
        let count = NET_COUNTER.fetch_add(1, Ordering::Relaxed);
        let in_rate = ((count as f64 * 0.03).sin().abs() * 20.0).max(0.1);
        let out_rate = ((count as f64 * 0.04).cos().abs() * 15.0).max(0.1);
        
        (in_rate, out_rate)
    }

    /// Update resource statistics
    async fn update_statistics(&self, usage: &ResourceUsage) -> Result<()> {
        let mut stats = self.statistics.write().await;
        
        // Update CPU statistics
        stats.max_cpu_usage = stats.max_cpu_usage.max(usage.cpu_usage_percent);
        
        // Update memory statistics
        stats.max_memory_usage = stats.max_memory_usage.max(usage.memory_usage_percent);
        
        // Update I/O statistics
        stats.peak_disk_io = stats.peak_disk_io.max(usage.disk_read_mbps + usage.disk_write_mbps);
        stats.peak_network_io = stats.peak_network_io.max(usage.network_in_mbps + usage.network_out_mbps);
        
        // Calculate running averages (simplified)
        let history = self.usage_history.read().await;
        if !history.is_empty() {
            let count = history.len() as f64;
            stats.avg_cpu_usage = history.iter().map(|u| u.cpu_usage_percent).sum::<f64>() / count;
            stats.avg_memory_usage = history.iter().map(|u| u.memory_usage_percent).sum::<f64>() / count;
        }
        
        Ok(())
    }

    /// Check resource thresholds and generate alerts
    async fn check_thresholds(&self, usage: &ResourceUsage) -> Result<()> {
        let thresholds = self.thresholds.read().await;
        let mut alerts_to_add = Vec::new();
        
        // Check CPU usage
        if usage.cpu_usage_percent >= thresholds.cpu_critical {
            alerts_to_add.push(self.create_alert(
                ResourceType::CPU,
                AlertSeverity::Critical,
                usage.cpu_usage_percent,
                thresholds.cpu_critical,
                "CPU usage critical".to_string(),
            ));
        } else if usage.cpu_usage_percent >= thresholds.cpu_warning {
            alerts_to_add.push(self.create_alert(
                ResourceType::CPU,
                AlertSeverity::Warning,
                usage.cpu_usage_percent,
                thresholds.cpu_warning,
                "CPU usage warning".to_string(),
            ));
        }
        
        // Check memory usage
        if usage.memory_usage_percent >= thresholds.memory_critical {
            alerts_to_add.push(self.create_alert(
                ResourceType::Memory,
                AlertSeverity::Critical,
                usage.memory_usage_percent,
                thresholds.memory_critical,
                "Memory usage critical".to_string(),
            ));
        } else if usage.memory_usage_percent >= thresholds.memory_warning {
            alerts_to_add.push(self.create_alert(
                ResourceType::Memory,
                AlertSeverity::Warning,
                usage.memory_usage_percent,
                thresholds.memory_warning,
                "Memory usage warning".to_string(),
            ));
        }
        
        // Check disk I/O
        let total_disk_io = usage.disk_read_mbps + usage.disk_write_mbps;
        if total_disk_io >= thresholds.disk_io_critical {
            alerts_to_add.push(self.create_alert(
                ResourceType::DiskIO,
                AlertSeverity::Critical,
                total_disk_io,
                thresholds.disk_io_critical,
                "Disk I/O critical".to_string(),
            ));
        } else if total_disk_io >= thresholds.disk_io_warning {
            alerts_to_add.push(self.create_alert(
                ResourceType::DiskIO,
                AlertSeverity::Warning,
                total_disk_io,
                thresholds.disk_io_warning,
                "Disk I/O warning".to_string(),
            ));
        }
        
        // Add alerts to active list
        if !alerts_to_add.is_empty() {
            let mut active_alerts = self.active_alerts.write().await;
            for alert in alerts_to_add {
                active_alerts.push(alert);
                
                // Update statistics
                let mut stats = self.statistics.write().await;
                stats.total_alerts += 1;
            }
            
            // Keep only recent alerts (last 100)
            if active_alerts.len() > 100 {
                let excess = active_alerts.len() - 100;
                active_alerts.drain(0..excess);
            }
        }
        
        Ok(())
    }

    /// Create a resource alert
    fn create_alert(
        &self,
        resource_type: ResourceType,
        severity: AlertSeverity,
        current_value: f64,
        threshold_value: f64,
        message: String,
    ) -> ResourceAlert {
        ResourceAlert {
            alert_id: uuid::Uuid::new_v4(),
            timestamp: Utc::now(),
            resource_type,
            severity,
            current_value,
            threshold_value,
            message,
        }
    }

    /// Public methods for getting resource information
    pub async fn get_cpu_usage(&self) -> Result<f64> {
        let usage = self.get_current_usage().await?;
        Ok(usage.cpu_usage_percent)
    }

    pub async fn get_memory_usage(&self) -> Result<f64> {
        let usage = self.get_current_usage().await?;
        Ok(usage.memory_usage_percent)
    }

    pub async fn get_disk_io(&self) -> Result<f64> {
        let usage = self.get_current_usage().await?;
        Ok(usage.disk_read_mbps + usage.disk_write_mbps)
    }

    pub async fn get_network_io(&self) -> Result<f64> {
        let usage = self.get_current_usage().await?;
        Ok(usage.network_in_mbps + usage.network_out_mbps)
    }

    /// Get resource usage history
    pub async fn get_usage_history(&self, duration_minutes: u32) -> Result<Vec<ResourceUsage>> {
        let history = self.usage_history.read().await;
        let cutoff_time = Utc::now() - chrono::Duration::minutes(duration_minutes as i64);
        
        let filtered: Vec<_> = history
            .iter()
            .filter(|usage| usage.timestamp > cutoff_time)
            .cloned()
            .collect();
            
        Ok(filtered)
    }

    /// Get active alerts
    pub async fn get_active_alerts(&self) -> Result<Vec<ResourceAlert>> {
        let alerts = self.active_alerts.read().await;
        Ok(alerts.clone())
    }

    /// Get resource statistics
    pub async fn get_statistics(&self) -> Result<ResourceStatistics> {
        let stats = self.statistics.read().await;
        Ok(stats.clone())
    }

    /// Update alert thresholds
    pub async fn update_thresholds(&self, new_thresholds: ResourceThresholds) -> Result<()> {
        let mut thresholds = self.thresholds.write().await;
        *thresholds = new_thresholds;
        println!("📊 Resource thresholds updated");
        Ok(())
    }

    /// Clear alerts
    pub async fn clear_alerts(&self) -> Result<()> {
        let mut alerts = self.active_alerts.write().await;
        alerts.clear();
        println!("📊 Resource alerts cleared");
        Ok(())
    }
}

impl Clone for ResourceMonitor {
    fn clone(&self) -> Self {
        Self {
            usage_history: Arc::clone(&self.usage_history),
            thresholds: Arc::clone(&self.thresholds),
            active_alerts: Arc::clone(&self.active_alerts),
            is_monitoring: Arc::clone(&self.is_monitoring),
            last_measurement: Arc::clone(&self.last_measurement),
            statistics: Arc::clone(&self.statistics),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_resource_monitor_creation() {
        let monitor = ResourceMonitor::new().await;
        assert!(monitor.is_ok());
    }

    #[tokio::test]
    async fn test_resource_usage_collection() {
        let monitor = ResourceMonitor::new().await.unwrap();
        let usage = monitor.get_current_usage().await;
        assert!(usage.is_ok());
        
        let usage = usage.unwrap();
        assert!(usage.cpu_usage_percent >= 0.0 && usage.cpu_usage_percent <= 100.0);
        assert!(usage.memory_usage_percent >= 0.0 && usage.memory_usage_percent <= 100.0);
    }

    #[tokio::test]
    async fn test_threshold_checking() {
        let monitor = ResourceMonitor::new().await.unwrap();
        
        // Set low thresholds to trigger alerts
        let thresholds = ResourceThresholds {
            cpu_warning: 1.0,
            cpu_critical: 2.0,
            memory_warning: 1.0,
            memory_critical: 2.0,
            disk_io_warning: 1.0,
            disk_io_critical: 2.0,
            network_warning: 1.0,
            network_critical: 2.0,
        };
        
        monitor.update_thresholds(thresholds).await.unwrap();
        monitor.collect_resource_usage().await.unwrap();
        
        let alerts = monitor.get_active_alerts().await.unwrap();
        assert!(!alerts.is_empty());
    }
}
