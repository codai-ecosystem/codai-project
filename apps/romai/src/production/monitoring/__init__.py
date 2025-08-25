"""
RomAI Production Monitoring Package Initialization
=================================================

This package provides comprehensive production monitoring and observability
for RomAI Multi-Domain AGI with real-time performance tracking, compliance
monitoring, alerting, and Romanian business optimization.

Monitoring Components:
- RomAIProductionMonitoring: Core monitoring orchestration
- MetricDefinition: Configurable metric specifications
- AlertRule: Intelligent alerting with severity levels
- PerformanceMetrics: Performance tracking and optimization
- ComplianceMetrics: Romanian compliance monitoring

Integration Support:
- Prometheus: Metrics collection and storage
- Grafana: Dashboard visualization and analytics
- Azure Monitor: Cloud-native monitoring integration
- Application Insights: Telemetry and user analytics
- Log Analytics: Centralized log management

Romanian Business Optimization:
- Business hours monitoring (8 AM - 8 PM EET)
- Romanian holiday calendar integration
- Localized alerting and reporting
- Cultural performance patterns recognition

Compliance Monitoring:
- GDPR data processing metrics
- ANSPDCP breach detection
- EU AI Act bias monitoring
- Automated audit trail generation

Usage:
    from romai.production.monitoring import (
        RomAIProductionMonitoring,
        MetricDefinition,
        AlertRule
    )
    
    # Initialize monitoring
    monitoring = RomAIProductionMonitoring()
    await monitoring.initialize()
    
    # Start comprehensive monitoring
    await monitoring.start_monitoring()

Author: RomAI Excellence Team
Version: 1.0.0
"""

from .romai_production_monitoring import (
    RomAIProductionMonitoring,
    MetricDefinition,
    AlertRule,
    AlertEvent, 
    PerformanceMetrics,
    ComplianceMetrics,
    AlertSeverity,
    MonitoringConfiguration,
    PrometheusConfig,
    GrafanaConfig,
    AzureMonitorConfig,
    MonitoringError,
    MonitoringAlert
)

# Package exports
__all__ = [
    "RomAIProductionMonitoring",
    "MetricDefinition",
    "AlertRule",
    "AlertEvent",
    "PerformanceMetrics", 
    "ComplianceMetrics",
    "AlertSeverity",
    "MonitoringConfiguration",
    "PrometheusConfig",
    "GrafanaConfig", 
    "AzureMonitorConfig",
    "MonitoringError",
    "MonitoringAlert"
]

__version__ = "1.0.0"
__author__ = "RomAI Excellence Team"