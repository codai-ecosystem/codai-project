// CBD Engine - Monitoring Module
// Enterprise monitoring and observability framework

pub mod observability;

pub use observability::{
    ObservabilityManager,
    ObservabilityConfig,
    MetricsConfig,
    TracingConfig,
    LoggingConfig,
    AlertingConfig,
    DashboardsConfig,
    create_default_observability_config,
    HealthStatus,
    SystemStatus,
    ComponentStatus,
};

use crate::error::Result;

/// Initialize monitoring for CBD Engine
pub async fn initialize_monitoring() -> Result<ObservabilityManager> {
    let config = create_default_observability_config();
    let manager = ObservabilityManager::new(config);
    
    // Start all monitoring components
    manager.start().await?;
    
    Ok(manager)
}

/// Standard CBD monitoring macros for consistent instrumentation
#[macro_export]
macro_rules! cbd_metric_counter {
    ($name:expr, $value:expr) => {
        // Counter metric recording
    };
    ($name:expr, $value:expr, $($label_key:expr => $label_value:expr),+) => {
        // Counter metric with labels
    };
}

#[macro_export]
macro_rules! cbd_metric_gauge {
    ($name:expr, $value:expr) => {
        // Gauge metric recording
    };
    ($name:expr, $value:expr, $($label_key:expr => $label_value:expr),+) => {
        // Gauge metric with labels
    };
}

#[macro_export]
macro_rules! cbd_metric_histogram {
    ($name:expr, $value:expr) => {
        // Histogram metric recording
    };
    ($name:expr, $value:expr, $($label_key:expr => $label_value:expr),+) => {
        // Histogram metric with labels
    };
}

#[macro_export]
macro_rules! cbd_trace_span {
    ($name:expr, $block:block) => {
        // Trace span wrapper
        $block
    };
    ($name:expr, $parent:expr, $block:block) => {
        // Trace span with parent
        $block
    };
}

#[macro_export]
macro_rules! cbd_log {
    ($level:expr, $message:expr) => {
        // Structured logging
    };
    ($level:expr, $message:expr, $($key:expr => $value:expr),+) => {
        // Structured logging with context
    };
}
