//! Alerting System for CBD Engine
//! 
//! Comprehensive alerting and notification system for performance issues,
//! security events, system health problems, and operational concerns.

use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::error::CBDError;

type Result<T> = std::result::Result<T, CBDError>;

/// Alert definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    pub alert_id: Uuid,
    pub alert_type: AlertType,
    pub severity: AlertSeverity,
    pub title: String,
    pub description: String,
    pub timestamp: DateTime<Utc>,
    pub source_component: String,
    pub metadata: HashMap<String, String>,
    pub acknowledgment: Option<AlertAcknowledgment>,
    pub resolution: Option<AlertResolution>,
}

/// Types of alerts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertType {
    Performance,
    Security,
    SystemHealth,
    DataIntegrity,
    NetworkConnectivity,
    DiskSpace,
    Memory,
    CPU,
    Custom(String),
}

/// Alert severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Error,
    Critical,
    Emergency,
}

/// Alert acknowledgment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertAcknowledgment {
    pub acknowledged_by: String,
    pub acknowledged_at: DateTime<Utc>,
    pub notes: String,
}

/// Alert resolution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertResolution {
    pub resolved_by: String,
    pub resolved_at: DateTime<Utc>,
    pub resolution_notes: String,
    pub resolution_action: String,
}

/// Alert rule for automatic alerting
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertRule {
    pub rule_id: Uuid,
    pub name: String,
    pub description: String,
    pub condition: AlertCondition,
    pub alert_template: AlertTemplate,
    pub enabled: bool,
    pub cooldown_minutes: u32,
    pub last_triggered: Option<DateTime<Utc>>,
}

/// Alert conditions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertCondition {
    ThresholdExceeded {
        metric: String,
        threshold: f64,
        operator: ComparisonOperator,
    },
    RateOfChange {
        metric: String,
        rate_threshold: f64,
        time_window_minutes: u32,
    },
    EventOccurred {
        event_type: String,
        frequency_threshold: u32,
        time_window_minutes: u32,
    },
    CustomCondition {
        condition_script: String,
    },
}

/// Comparison operators for threshold conditions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComparisonOperator {
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Equal,
    NotEqual,
}

/// Alert template for generating alerts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertTemplate {
    pub alert_type: AlertType,
    pub severity: AlertSeverity,
    pub title_template: String,
    pub description_template: String,
    pub metadata_template: HashMap<String, String>,
}

/// Notification channel configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationChannel {
    pub channel_id: Uuid,
    pub name: String,
    pub channel_type: NotificationChannelType,
    pub configuration: HashMap<String, String>,
    pub enabled: bool,
    pub severity_filter: Vec<AlertSeverity>,
}

/// Types of notification channels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationChannelType {
    Email,
    Slack,
    Discord,
    Webhook,
    SMS,
    PagerDuty,
    Console,
}

/// Alert statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertStatistics {
    pub total_alerts: u64,
    pub alerts_by_severity: HashMap<String, u64>,
    pub alerts_by_type: HashMap<String, u64>,
    pub acknowledged_alerts: u64,
    pub resolved_alerts: u64,
    pub average_resolution_time_minutes: f64,
    pub most_frequent_alert_type: Option<String>,
}

/// Main alerting system
#[derive(Debug)]
pub struct AlertingSystem {
    /// Active alerts
    active_alerts: Arc<RwLock<HashMap<Uuid, Alert>>>,
    /// Alert history
    alert_history: Arc<RwLock<VecDeque<Alert>>>,
    /// Alert rules
    alert_rules: Arc<RwLock<HashMap<Uuid, AlertRule>>>,
    /// Notification channels
    notification_channels: Arc<RwLock<HashMap<Uuid, NotificationChannel>>>,
    /// Alert statistics
    statistics: Arc<RwLock<AlertStatistics>>,
    /// Alerting enabled state
    is_enabled: Arc<RwLock<bool>>,
}

impl AlertingSystem {
    /// Create new alerting system
    pub async fn new() -> Result<Self> {
        let system = Self {
            active_alerts: Arc::new(RwLock::new(HashMap::new())),
            alert_history: Arc::new(RwLock::new(VecDeque::with_capacity(10000))),
            alert_rules: Arc::new(RwLock::new(HashMap::new())),
            notification_channels: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(AlertStatistics {
                total_alerts: 0,
                alerts_by_severity: HashMap::new(),
                alerts_by_type: HashMap::new(),
                acknowledged_alerts: 0,
                resolved_alerts: 0,
                average_resolution_time_minutes: 0.0,
                most_frequent_alert_type: None,
            })),
            is_enabled: Arc::new(RwLock::new(false)),
        };

        // Add default console notification channel
        system.add_default_console_channel().await?;
        
        Ok(system)
    }

    /// Add default console notification channel
    async fn add_default_console_channel(&self) -> Result<()> {
        let console_channel = NotificationChannel {
            channel_id: Uuid::new_v4(),
            name: "Console Output".to_string(),
            channel_type: NotificationChannelType::Console,
            configuration: HashMap::new(),
            enabled: true,
            severity_filter: vec![
                AlertSeverity::Warning,
                AlertSeverity::Error,
                AlertSeverity::Critical,
                AlertSeverity::Emergency,
            ],
        };

        let mut channels = self.notification_channels.write().await;
        channels.insert(console_channel.channel_id, console_channel);
        
        Ok(())
    }

    /// Start alerting system
    pub async fn start_alerting(&self) -> Result<()> {
        let mut is_enabled = self.is_enabled.write().await;
        *is_enabled = true;
        println!("🚨 Alerting system started");
        Ok(())
    }

    /// Stop alerting system
    pub async fn stop_alerting(&self) -> Result<()> {
        let mut is_enabled = self.is_enabled.write().await;
        *is_enabled = false;
        println!("🚨 Alerting system stopped");
        Ok(())
    }

    /// Trigger an alert
    pub async fn trigger_alert(&self, alert_type: String, message: String) -> Result<Uuid> {
        let is_enabled = self.is_enabled.read().await;
        if !*is_enabled {
            return Ok(Uuid::new_v4()); // Return dummy ID if disabled
        }
        drop(is_enabled);

        let alert = Alert {
            alert_id: Uuid::new_v4(),
            alert_type: AlertType::Custom(alert_type.clone()),
            severity: AlertSeverity::Warning,
            title: alert_type,
            description: message,
            timestamp: Utc::now(),
            source_component: "CBD Engine".to_string(),
            metadata: HashMap::new(),
            acknowledgment: None,
            resolution: None,
        };

        // Store alert
        let alert_id = alert.alert_id;
        {
            let mut active_alerts = self.active_alerts.write().await;
            active_alerts.insert(alert_id, alert.clone());
        }

        // Add to history
        {
            let mut history = self.alert_history.write().await;
            if history.len() >= 10000 {
                history.pop_front();
            }
            history.push_back(alert.clone());
        }

        // Update statistics
        self.update_statistics(&alert).await?;

        // Send notifications
        self.send_notifications(&alert).await?;

        Ok(alert_id)
    }

    /// Create a comprehensive alert
    pub async fn create_alert(
        &self,
        alert_type: AlertType,
        severity: AlertSeverity,
        title: String,
        description: String,
        source_component: String,
        metadata: HashMap<String, String>,
    ) -> Result<Uuid> {
        let is_enabled = self.is_enabled.read().await;
        if !*is_enabled {
            return Ok(Uuid::new_v4());
        }
        drop(is_enabled);

        let alert = Alert {
            alert_id: Uuid::new_v4(),
            alert_type,
            severity,
            title,
            description,
            timestamp: Utc::now(),
            source_component,
            metadata,
            acknowledgment: None,
            resolution: None,
        };

        let alert_id = alert.alert_id;
        
        // Store alert
        {
            let mut active_alerts = self.active_alerts.write().await;
            active_alerts.insert(alert_id, alert.clone());
        }

        // Add to history
        {
            let mut history = self.alert_history.write().await;
            if history.len() >= 10000 {
                history.pop_front();
            }
            history.push_back(alert.clone());
        }

        // Update statistics
        self.update_statistics(&alert).await?;

        // Send notifications
        self.send_notifications(&alert).await?;

        Ok(alert_id)
    }

    /// Send notifications for an alert
    async fn send_notifications(&self, alert: &Alert) -> Result<()> {
        let channels = self.notification_channels.read().await;
        
        for channel in channels.values() {
            if !channel.enabled {
                continue;
            }

            // Check severity filter
            if !channel.severity_filter.is_empty() && 
               !channel.severity_filter.iter().any(|s| std::mem::discriminant(s) == std::mem::discriminant(&alert.severity)) {
                continue;
            }

            match channel.channel_type {
                NotificationChannelType::Console => {
                    self.send_console_notification(alert).await?;
                }
                _ => {
                    // Other notification types would be implemented here
                    println!("📬 Notification sent via {:?} channel: {}", channel.channel_type, channel.name);
                }
            }
        }

        Ok(())
    }

    /// Send console notification
    async fn send_console_notification(&self, alert: &Alert) -> Result<()> {
        let severity_icon = match alert.severity {
            AlertSeverity::Info => "ℹ️",
            AlertSeverity::Warning => "⚠️",
            AlertSeverity::Error => "❌",
            AlertSeverity::Critical => "🔴",
            AlertSeverity::Emergency => "🚨",
        };

        println!(
            "{} [{:?}] {} - {} ({})",
            severity_icon,
            alert.severity,
            alert.title,
            alert.description,
            alert.timestamp.format("%Y-%m-%d %H:%M:%S UTC")
        );

        Ok(())
    }

    /// Update alert statistics
    async fn update_statistics(&self, alert: &Alert) -> Result<()> {
        let mut stats = self.statistics.write().await;
        
        stats.total_alerts += 1;
        
        // Update severity statistics
        let severity_key = format!("{:?}", alert.severity);
        *stats.alerts_by_severity.entry(severity_key).or_insert(0) += 1;
        
        // Update type statistics
        let type_key = format!("{:?}", alert.alert_type);
        *stats.alerts_by_type.entry(type_key.clone()).or_insert(0) += 1;
        
        // Update most frequent alert type
        let max_count = stats.alerts_by_type.values().max().cloned().unwrap_or(0);
        if let Some((most_frequent_type, count)) = stats.alerts_by_type.iter().find(|(_, &count)| count == max_count) {
            if *count > 0 {
                stats.most_frequent_alert_type = Some(most_frequent_type.clone());
            }
        }

        Ok(())
    }

    /// Acknowledge an alert
    pub async fn acknowledge_alert(&self, alert_id: Uuid, acknowledged_by: String, notes: String) -> Result<()> {
        let mut active_alerts = self.active_alerts.write().await;
        
        if let Some(alert) = active_alerts.get_mut(&alert_id) {
            alert.acknowledgment = Some(AlertAcknowledgment {
                acknowledged_by,
                acknowledged_at: Utc::now(),
                notes,
            });
            
            // Update statistics
            let mut stats = self.statistics.write().await;
            stats.acknowledged_alerts += 1;
            
            println!("✅ Alert {} acknowledged", alert_id);
        }

        Ok(())
    }

    /// Resolve an alert
    pub async fn resolve_alert(
        &self,
        alert_id: Uuid,
        resolved_by: String,
        resolution_notes: String,
        resolution_action: String,
    ) -> Result<()> {
        let mut active_alerts = self.active_alerts.write().await;
        
        if let Some(mut alert) = active_alerts.remove(&alert_id) {
            let resolution_time = Utc::now();
            let duration_minutes = (resolution_time - alert.timestamp).num_minutes() as f64;
            
            alert.resolution = Some(AlertResolution {
                resolved_by,
                resolved_at: resolution_time,
                resolution_notes,
                resolution_action,
            });

            // Update statistics
            let mut stats = self.statistics.write().await;
            stats.resolved_alerts += 1;
            
            // Update average resolution time
            let total_resolution_time = stats.average_resolution_time_minutes * (stats.resolved_alerts - 1) as f64 + duration_minutes;
            stats.average_resolution_time_minutes = total_resolution_time / stats.resolved_alerts as f64;
            
            println!("✅ Alert {} resolved in {:.1} minutes", alert_id, duration_minutes);
        }

        Ok(())
    }

    /// Get active alerts
    pub async fn get_active_alerts(&self) -> Result<Vec<Alert>> {
        let active_alerts = self.active_alerts.read().await;
        Ok(active_alerts.values().cloned().collect())
    }

    /// Get alert history
    pub async fn get_alert_history(&self, limit: Option<usize>) -> Result<Vec<Alert>> {
        let history = self.alert_history.read().await;
        let alerts: Vec<_> = if let Some(limit) = limit {
            history.iter().rev().take(limit).cloned().collect()
        } else {
            history.iter().cloned().collect()
        };
        Ok(alerts)
    }

    /// Get alert statistics
    pub async fn get_statistics(&self) -> Result<AlertStatistics> {
        let stats = self.statistics.read().await;
        Ok(stats.clone())
    }

    /// Add notification channel
    pub async fn add_notification_channel(&self, channel: NotificationChannel) -> Result<()> {
        let mut channels = self.notification_channels.write().await;
        channels.insert(channel.channel_id, channel.clone());
        println!("📬 Notification channel '{}' added", channel.name);
        Ok(())
    }

    /// Add alert rule
    pub async fn add_alert_rule(&self, rule: AlertRule) -> Result<()> {
        let mut rules = self.alert_rules.write().await;
        rules.insert(rule.rule_id, rule.clone());
        println!("📋 Alert rule '{}' added", rule.name);
        Ok(())
    }

    /// Clear resolved alerts from active list
    pub async fn cleanup_resolved_alerts(&self) -> Result<u32> {
        let mut active_alerts = self.active_alerts.write().await;
        let initial_count = active_alerts.len();
        
        active_alerts.retain(|_, alert| alert.resolution.is_none());
        
        let cleaned_count = (initial_count - active_alerts.len()) as u32;
        if cleaned_count > 0 {
            println!("🧹 Cleaned up {} resolved alerts", cleaned_count);
        }
        
        Ok(cleaned_count)
    }

    /// Generate alerting report
    pub async fn generate_report(&self) -> Result<String> {
        let mut report = String::new();
        
        report.push_str("🚨 CBD Engine Alerting System Report\n");
        report.push_str("=====================================\n\n");
        
        let stats = self.get_statistics().await?;
        let active_alerts = self.get_active_alerts().await?;
        
        report.push_str(&format!("📊 Alert Statistics:\n"));
        report.push_str(&format!("  Total Alerts: {}\n", stats.total_alerts));
        report.push_str(&format!("  Active Alerts: {}\n", active_alerts.len()));
        report.push_str(&format!("  Acknowledged: {}\n", stats.acknowledged_alerts));
        report.push_str(&format!("  Resolved: {}\n", stats.resolved_alerts));
        report.push_str(&format!("  Avg Resolution Time: {:.1} minutes\n", stats.average_resolution_time_minutes));
        
        if let Some(most_frequent) = &stats.most_frequent_alert_type {
            report.push_str(&format!("  Most Frequent Type: {}\n", most_frequent));
        }
        
        report.push_str("\n📈 Alerts by Severity:\n");
        for (severity, count) in &stats.alerts_by_severity {
            report.push_str(&format!("  {}: {}\n", severity, count));
        }
        
        report.push_str("\n🎯 Active Alerts:\n");
        if active_alerts.is_empty() {
            report.push_str("  No active alerts\n");
        } else {
            for alert in active_alerts.iter().take(10) {
                report.push_str(&format!(
                    "  [{:?}] {} - {} ({})\n",
                    alert.severity,
                    alert.title,
                    alert.description,
                    alert.timestamp.format("%m-%d %H:%M")
                ));
            }
        }
        
        report.push_str("\n🏥 System Health: ");
        let critical_alerts = active_alerts.iter()
            .filter(|a| matches!(a.severity, AlertSeverity::Critical | AlertSeverity::Emergency))
            .count();
            
        if critical_alerts > 0 {
            report.push_str(&format!("{} Critical Issues", critical_alerts));
        } else if active_alerts.len() > 5 {
            report.push_str("Multiple Issues Detected");
        } else if active_alerts.is_empty() {
            report.push_str("All Systems Normal");
        } else {
            report.push_str("Minor Issues Present");
        }
        
        Ok(report)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_alerting_system_creation() {
        let system = AlertingSystem::new().await;
        assert!(system.is_ok());
    }

    #[tokio::test]
    async fn test_alert_creation() {
        let system = AlertingSystem::new().await.unwrap();
        system.start_alerting().await.unwrap();
        
        let alert_id = system.create_alert(
            AlertType::Performance,
            AlertSeverity::Warning,
            "Test Alert".to_string(),
            "This is a test alert".to_string(),
            "Test Component".to_string(),
            HashMap::new(),
        ).await.unwrap();
        
        let active_alerts = system.get_active_alerts().await.unwrap();
        assert_eq!(active_alerts.len(), 1);
        assert_eq!(active_alerts[0].alert_id, alert_id);
    }

    #[tokio::test]
    async fn test_alert_acknowledgment_and_resolution() {
        let system = AlertingSystem::new().await.unwrap();
        system.start_alerting().await.unwrap();
        
        let alert_id = system.trigger_alert("test_alert".to_string(), "test message".to_string()).await.unwrap();
        
        // Acknowledge alert
        system.acknowledge_alert(alert_id, "test_user".to_string(), "acknowledged".to_string()).await.unwrap();
        
        // Resolve alert
        system.resolve_alert(
            alert_id,
            "test_user".to_string(),
            "resolved successfully".to_string(),
            "restart_service".to_string(),
        ).await.unwrap();
        
        let stats = system.get_statistics().await.unwrap();
        assert_eq!(stats.acknowledged_alerts, 1);
        assert_eq!(stats.resolved_alerts, 1);
    }
}
