#!/usr/bin/env python3
"""
🚨 RomAI AGI - Week 3 Day 4: Enterprise-Grade Monitoring & Alerting
Comprehensive monitoring, alerting, and observability system for production deployment

This system provides real-time monitoring, intelligent alerting, performance tracking,
and comprehensive observability for all RomAI system components.
"""

import asyncio
import time
import json
import logging
import uuid
import smtplib
import ssl
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Callable, Union
from dataclasses import dataclass, asdict, field
from collections import defaultdict, deque
from enum import Enum, auto
import aiohttp
import psutil
import threading
from concurrent.futures import ThreadPoolExecutor
import socket
import platform

# Enhanced logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Email imports - using try/except for compatibility
try:
    from email.mime.text import MimeText
    from email.mime.multipart import MimeMultipart
    EMAIL_AVAILABLE = True
except ImportError:
    EMAIL_AVAILABLE = False
    # Create a simple logger for this warning since main logger might not be ready
    import logging
    temp_logger = logging.getLogger(__name__)
    temp_logger.warning("Email functionality not available - missing email.mime modules")

class AlertSeverity(Enum):
    """Alert severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class AlertType(Enum):
    """Types of alerts"""
    SYSTEM_DOWN = "system_down"
    HIGH_CPU = "high_cpu"
    HIGH_MEMORY = "high_memory"
    HIGH_LATENCY = "high_latency"
    ERROR_RATE = "error_rate"
    DISK_SPACE = "disk_space"
    NETWORK_ISSUE = "network_issue"
    SECURITY_BREACH = "security_breach"
    PERFORMANCE_DEGRADATION = "performance_degradation"
    CULTURAL_PROCESSING_ERROR = "cultural_processing_error"

class MetricType(Enum):
    """Types of metrics"""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"

class ComponentStatus(Enum):
    """Component status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    DOWN = "down"
    UNKNOWN = "unknown"

@dataclass
class MetricValue:
    """Individual metric value"""
    timestamp: float
    value: float
    labels: Dict[str, str] = field(default_factory=dict)

@dataclass
class Metric:
    """Metric definition and values"""
    name: str
    metric_type: MetricType
    description: str
    values: deque = field(default_factory=lambda: deque(maxlen=1000))
    labels: Dict[str, str] = field(default_factory=dict)

@dataclass
class Alert:
    """Alert definition"""
    alert_id: str
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: str
    component: str
    metric_name: str
    threshold: float
    comparison: str  # >, <, >=, <=, ==, !=
    duration_seconds: float = 0  # Alert only after condition persists
    created_at: float = field(default_factory=time.time)
    resolved_at: Optional[float] = None
    is_active: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AlertRule:
    """Alert rule configuration"""
    rule_id: str
    metric_name: str
    alert_type: AlertType
    severity: AlertSeverity
    threshold: float
    comparison: str
    duration_seconds: float = 60.0
    enabled: bool = True
    component: str = "system"
    title_template: str = "Alert: {metric_name} {comparison} {threshold}"
    description_template: str = "Metric {metric_name} has value {value} which is {comparison} threshold {threshold}"

@dataclass
class ComponentHealth:
    """Component health status"""
    component_name: str
    status: ComponentStatus
    last_check: float
    response_time: float
    error_count: int = 0
    uptime_percentage: float = 100.0
    metadata: Dict[str, Any] = field(default_factory=dict)

class NotificationChannel:
    """Base notification channel"""
    
    def __init__(self, channel_id: str, enabled: bool = True):
        self.channel_id = channel_id
        self.enabled = enabled
    
    async def send_alert(self, alert: Alert) -> bool:
        """Send alert notification"""
        raise NotImplementedError

class EmailNotificationChannel(NotificationChannel):
    """Email notification channel"""
    
    def __init__(self, channel_id: str, smtp_server: str, smtp_port: int, 
                 username: str, password: str, recipients: List[str], enabled: bool = True):
        super().__init__(channel_id, enabled)
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.recipients = recipients
    
    async def send_alert(self, alert: Alert) -> bool:
        """Send alert via email"""
        if not self.enabled or not EMAIL_AVAILABLE:
            logger.warning("Email alerts disabled - email modules not available")
            return False
        
        try:
            # Create message
            msg = MimeMultipart()
            msg['From'] = self.username
            msg['To'] = ", ".join(self.recipients)
            msg['Subject'] = f"[RomAI Alert] {alert.severity.value.upper()}: {alert.title}"
            
            # Email body
            body = f"""
RomAI System Alert

Severity: {alert.severity.value.upper()}
Component: {alert.component}
Alert Type: {alert.alert_type.value}
Time: {datetime.fromtimestamp(alert.created_at).strftime('%Y-%m-%d %H:%M:%S')}

Description:
{alert.description}

Metadata:
{json.dumps(alert.metadata, indent=2)}

Please investigate this issue promptly.

--
RomAI Monitoring System
            """
            
            msg.attach(MimeText(body, 'plain'))
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.username, self.password)
                server.sendmail(self.username, self.recipients, msg.as_string())
            
            logger.info(f"Alert email sent for {alert.alert_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email alert {alert.alert_id}: {e}")
            return False

class WebhookNotificationChannel(NotificationChannel):
    """Webhook notification channel"""
    
    def __init__(self, channel_id: str, webhook_url: str, enabled: bool = True):
        super().__init__(channel_id, enabled)
        self.webhook_url = webhook_url
        self.session = None
    
    async def initialize(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
    
    async def cleanup(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
    
    async def send_alert(self, alert: Alert) -> bool:
        """Send alert via webhook"""
        if not self.enabled or not self.session:
            return False
        
        try:
            payload = {
                'alert_id': alert.alert_id,
                'alert_type': alert.alert_type.value,
                'severity': alert.severity.value,
                'title': alert.title,
                'description': alert.description,
                'component': alert.component,
                'created_at': alert.created_at,
                'metadata': alert.metadata
            }
            
            async with self.session.post(self.webhook_url, json=payload) as response:
                if response.status == 200:
                    logger.info(f"Alert webhook sent for {alert.alert_id}")
                    return True
                else:
                    logger.error(f"Webhook failed with status {response.status} for alert {alert.alert_id}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to send webhook alert {alert.alert_id}: {e}")
            return False

class MetricsCollector:
    """System metrics collector"""
    
    def __init__(self):
        self.metrics: Dict[str, Metric] = {}
        self.collection_interval = 5.0  # seconds
        self.is_collecting = False
        
        # Initialize default metrics
        self._initialize_default_metrics()
    
    def _initialize_default_metrics(self):
        """Initialize default system metrics"""
        default_metrics = [
            ("cpu_usage_percent", MetricType.GAUGE, "CPU usage percentage"),
            ("memory_usage_percent", MetricType.GAUGE, "Memory usage percentage"),
            ("disk_usage_percent", MetricType.GAUGE, "Disk usage percentage"),
            ("network_bytes_sent", MetricType.COUNTER, "Network bytes sent"),
            ("network_bytes_received", MetricType.COUNTER, "Network bytes received"),
            ("request_count", MetricType.COUNTER, "Total request count"),
            ("request_duration", MetricType.HISTOGRAM, "Request duration in seconds"),
            ("error_count", MetricType.COUNTER, "Total error count"),
            ("active_connections", MetricType.GAUGE, "Active connections"),
            ("romanian_text_processed", MetricType.COUNTER, "Romanian text processing count"),
            ("cultural_entities_detected", MetricType.COUNTER, "Cultural entities detected"),
            ("sentiment_analysis_count", MetricType.COUNTER, "Sentiment analysis performed"),
        ]
        
        for name, metric_type, description in default_metrics:
            self.metrics[name] = Metric(
                name=name,
                metric_type=metric_type,
                description=description
            )
    
    def add_metric(self, name: str, metric_type: MetricType, description: str, labels: Dict[str, str] = None):
        """Add custom metric"""
        self.metrics[name] = Metric(
            name=name,
            metric_type=metric_type,
            description=description,
            labels=labels or {}
        )
    
    def record_metric(self, name: str, value: float, labels: Dict[str, str] = None):
        """Record metric value"""
        if name not in self.metrics:
            logger.warning(f"Metric {name} not found, creating as gauge")
            self.add_metric(name, MetricType.GAUGE, f"Auto-created metric: {name}")
        
        metric_value = MetricValue(
            timestamp=time.time(),
            value=value,
            labels=labels or {}
        )
        
        self.metrics[name].values.append(metric_value)
    
    async def start_collection(self):
        """Start automated metrics collection"""
        self.is_collecting = True
        asyncio.create_task(self._collect_system_metrics())
        logger.info("Metrics collection started")
    
    def stop_collection(self):
        """Stop metrics collection"""
        self.is_collecting = False
        logger.info("Metrics collection stopped")
    
    async def _collect_system_metrics(self):
        """Collect system metrics periodically"""
        while self.is_collecting:
            try:
                # CPU usage
                cpu_percent = psutil.cpu_percent(interval=1)
                self.record_metric("cpu_usage_percent", cpu_percent)
                
                # Memory usage
                memory = psutil.virtual_memory()
                self.record_metric("memory_usage_percent", memory.percent)
                
                # Disk usage
                disk = psutil.disk_usage('/')
                disk_percent = (disk.used / disk.total) * 100
                self.record_metric("disk_usage_percent", disk_percent)
                
                # Network statistics
                network = psutil.net_io_counters()
                self.record_metric("network_bytes_sent", network.bytes_sent)
                self.record_metric("network_bytes_received", network.bytes_recv)
                
                await asyncio.sleep(self.collection_interval)
                
            except Exception as e:
                logger.error(f"Error collecting system metrics: {e}")
                await asyncio.sleep(self.collection_interval)
    
    def get_metric_values(self, name: str, start_time: float = None, end_time: float = None) -> List[MetricValue]:
        """Get metric values within time range"""
        if name not in self.metrics:
            return []
        
        values = list(self.metrics[name].values)
        
        if start_time is not None:
            values = [v for v in values if v.timestamp >= start_time]
        
        if end_time is not None:
            values = [v for v in values if v.timestamp <= end_time]
        
        return values
    
    def get_latest_value(self, name: str) -> Optional[float]:
        """Get latest metric value"""
        if name not in self.metrics or not self.metrics[name].values:
            return None
        
        return self.metrics[name].values[-1].value

class AlertManager:
    """Alert management system"""
    
    def __init__(self):
        self.alert_rules: Dict[str, AlertRule] = {}
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.notification_channels: Dict[str, NotificationChannel] = {}
        self.is_monitoring = False
        
        # Alert state tracking
        self.condition_start_times: Dict[str, float] = {}
        
        logger.info("Alert Manager initialized")
    
    def add_alert_rule(self, rule: AlertRule):
        """Add alert rule"""
        self.alert_rules[rule.rule_id] = rule
        logger.info(f"Alert rule added: {rule.rule_id}")
    
    def add_notification_channel(self, channel: NotificationChannel):
        """Add notification channel"""
        self.notification_channels[channel.channel_id] = channel
        logger.info(f"Notification channel added: {channel.channel_id}")
    
    async def start_monitoring(self, metrics_collector: MetricsCollector):
        """Start alert monitoring"""
        self.is_monitoring = True
        asyncio.create_task(self._monitor_alerts(metrics_collector))
        logger.info("Alert monitoring started")
    
    def stop_monitoring(self):
        """Stop alert monitoring"""
        self.is_monitoring = False
        logger.info("Alert monitoring stopped")
    
    async def _monitor_alerts(self, metrics_collector: MetricsCollector):
        """Monitor metrics and trigger alerts"""
        while self.is_monitoring:
            try:
                for rule in self.alert_rules.values():
                    if not rule.enabled:
                        continue
                    
                    await self._check_alert_rule(rule, metrics_collector)
                
                await asyncio.sleep(5)  # Check every 5 seconds
                
            except Exception as e:
                logger.error(f"Error in alert monitoring: {e}")
                await asyncio.sleep(5)
    
    async def _check_alert_rule(self, rule: AlertRule, metrics_collector: MetricsCollector):
        """Check individual alert rule"""
        current_value = metrics_collector.get_latest_value(rule.metric_name)
        if current_value is None:
            return
        
        # Evaluate condition
        condition_met = self._evaluate_condition(current_value, rule.threshold, rule.comparison)
        current_time = time.time()
        
        if condition_met:
            # Track when condition started
            if rule.rule_id not in self.condition_start_times:
                self.condition_start_times[rule.rule_id] = current_time
            
            # Check if condition has persisted long enough
            condition_duration = current_time - self.condition_start_times[rule.rule_id]
            if condition_duration >= rule.duration_seconds:
                # Trigger alert if not already active
                if rule.rule_id not in self.active_alerts:
                    await self._trigger_alert(rule, current_value)
        else:
            # Condition not met, reset tracking and resolve alert if active
            if rule.rule_id in self.condition_start_times:
                del self.condition_start_times[rule.rule_id]
            
            if rule.rule_id in self.active_alerts:
                await self._resolve_alert(rule.rule_id)
    
    def _evaluate_condition(self, value: float, threshold: float, comparison: str) -> bool:
        """Evaluate alert condition"""
        if comparison == ">":
            return value > threshold
        elif comparison == ">=":
            return value >= threshold
        elif comparison == "<":
            return value < threshold
        elif comparison == "<=":
            return value <= threshold
        elif comparison == "==":
            return value == threshold
        elif comparison == "!=":
            return value != threshold
        else:
            logger.error(f"Unknown comparison operator: {comparison}")
            return False
    
    async def _trigger_alert(self, rule: AlertRule, current_value: float):
        """Trigger new alert"""
        alert_id = f"{rule.rule_id}_{int(time.time())}"
        
        alert = Alert(
            alert_id=alert_id,
            alert_type=rule.alert_type,
            severity=rule.severity,
            title=rule.title_template.format(
                metric_name=rule.metric_name,
                comparison=rule.comparison,
                threshold=rule.threshold
            ),
            description=rule.description_template.format(
                metric_name=rule.metric_name,
                comparison=rule.comparison,
                threshold=rule.threshold,
                value=current_value
            ),
            component=rule.component,
            metric_name=rule.metric_name,
            threshold=rule.threshold,
            comparison=rule.comparison,
            metadata={
                'current_value': current_value,
                'rule_id': rule.rule_id
            }
        )
        
        self.active_alerts[rule.rule_id] = alert
        self.alert_history.append(alert)
        
        # Send notifications
        await self._send_alert_notifications(alert)
        
        logger.warning(f"Alert triggered: {alert.title}")
    
    async def _resolve_alert(self, rule_id: str):
        """Resolve active alert"""
        if rule_id in self.active_alerts:
            alert = self.active_alerts[rule_id]
            alert.is_active = False
            alert.resolved_at = time.time()
            
            del self.active_alerts[rule_id]
            
            logger.info(f"Alert resolved: {alert.title}")
    
    async def _send_alert_notifications(self, alert: Alert):
        """Send alert to all notification channels"""
        for channel in self.notification_channels.values():
            try:
                await channel.send_alert(alert)
            except Exception as e:
                logger.error(f"Failed to send alert via {channel.channel_id}: {e}")
    
    def get_active_alerts(self) -> List[Alert]:
        """Get all active alerts"""
        return list(self.active_alerts.values())
    
    def get_alert_history(self, limit: int = 100) -> List[Alert]:
        """Get alert history"""
        return self.alert_history[-limit:]

class ComponentMonitor:
    """Component health monitoring"""
    
    def __init__(self):
        self.components: Dict[str, ComponentHealth] = {}
        self.check_interval = 30.0  # seconds
        self.is_monitoring = False
        
        # Component endpoints
        self.component_endpoints = {
            'websocket_hub': 'http://localhost:8080/health',
            'streaming_analytics': 'http://localhost:8081/health',
            'live_dashboard': 'http://localhost:8082/health',
            'event_orchestrator': 'http://localhost:8083/health',
            'collaboration_manager': 'http://localhost:8084/health',
            'cbd_database': 'http://localhost:4180/health',
            'gateway': 'http://localhost:4000/health'
        }
        
        # Initialize components
        for component_name in self.component_endpoints.keys():
            self.components[component_name] = ComponentHealth(
                component_name=component_name,
                status=ComponentStatus.UNKNOWN,
                last_check=0,
                response_time=0
            )
    
    async def start_monitoring(self):
        """Start component health monitoring"""
        self.is_monitoring = True
        asyncio.create_task(self._monitor_components())
        logger.info("Component health monitoring started")
    
    def stop_monitoring(self):
        """Stop component monitoring"""
        self.is_monitoring = False
        logger.info("Component health monitoring stopped")
    
    async def _monitor_components(self):
        """Monitor component health"""
        async with aiohttp.ClientSession() as session:
            while self.is_monitoring:
                try:
                    # Check all components in parallel
                    tasks = []
                    for component_name, endpoint in self.component_endpoints.items():
                        task = asyncio.create_task(
                            self._check_component_health(session, component_name, endpoint)
                        )
                        tasks.append(task)
                    
                    await asyncio.gather(*tasks, return_exceptions=True)
                    await asyncio.sleep(self.check_interval)
                    
                except Exception as e:
                    logger.error(f"Error in component monitoring: {e}")
                    await asyncio.sleep(self.check_interval)
    
    async def _check_component_health(self, session: aiohttp.ClientSession, component_name: str, endpoint: str):
        """Check individual component health"""
        start_time = time.time()
        
        try:
            async with session.get(endpoint, timeout=aiohttp.ClientTimeout(total=10)) as response:
                response_time = time.time() - start_time
                
                if response.status == 200:
                    status = ComponentStatus.HEALTHY
                    error_count = 0
                else:
                    status = ComponentStatus.WARNING
                    error_count = self.components[component_name].error_count + 1
                
                self.components[component_name] = ComponentHealth(
                    component_name=component_name,
                    status=status,
                    last_check=time.time(),
                    response_time=response_time,
                    error_count=error_count
                )
                
        except asyncio.TimeoutError:
            self.components[component_name] = ComponentHealth(
                component_name=component_name,
                status=ComponentStatus.CRITICAL,
                last_check=time.time(),
                response_time=10.0,  # Timeout duration
                error_count=self.components[component_name].error_count + 1
            )
            
        except Exception as e:
            self.components[component_name] = ComponentHealth(
                component_name=component_name,
                status=ComponentStatus.DOWN,
                last_check=time.time(),
                response_time=0,
                error_count=self.components[component_name].error_count + 1
            )
    
    def get_component_status(self, component_name: str) -> Optional[ComponentHealth]:
        """Get component health status"""
        return self.components.get(component_name)
    
    def get_all_components_status(self) -> Dict[str, ComponentHealth]:
        """Get all components health status"""
        return self.components.copy()

class EnterpriseMonitoringAlerting:
    """
    Enterprise-Grade Monitoring & Alerting System for RomAI
    
    Features:
    - Real-time metrics collection
    - Intelligent alerting with thresholds
    - Component health monitoring
    - Multiple notification channels
    - Romanian cultural processing monitoring
    - Performance tracking and optimization
    """
    
    def __init__(self):
        self.metrics_collector = MetricsCollector()
        self.alert_manager = AlertManager()
        self.component_monitor = ComponentMonitor()
        self.start_time = time.time()
        
        # System information
        self.system_info = {
            'hostname': socket.gethostname(),
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'cpu_count': psutil.cpu_count(),
            'memory_total': psutil.virtual_memory().total
        }
        
        logger.info("Enterprise Monitoring & Alerting initialized")
    
    async def initialize(self):
        """Initialize the monitoring system"""
        # Start metrics collection
        await self.metrics_collector.start_collection()
        
        # Setup default alert rules
        await self._setup_default_alert_rules()
        
        # Setup notification channels
        await self._setup_notification_channels()
        
        # Start alert monitoring
        await self.alert_manager.start_monitoring(self.metrics_collector)
        
        # Start component monitoring
        await self.component_monitor.start_monitoring()
        
        logger.info("Enterprise Monitoring & Alerting started")
    
    async def cleanup(self):
        """Cleanup monitoring system"""
        self.metrics_collector.stop_collection()
        self.alert_manager.stop_monitoring()
        self.component_monitor.stop_monitoring()
        
        # Cleanup notification channels
        for channel in self.alert_manager.notification_channels.values():
            if hasattr(channel, 'cleanup'):
                await channel.cleanup()
        
        logger.info("Enterprise Monitoring & Alerting cleaned up")
    
    async def _setup_default_alert_rules(self):
        """Setup default alert rules"""
        default_rules = [
            AlertRule(
                rule_id="high_cpu_usage",
                metric_name="cpu_usage_percent",
                alert_type=AlertType.HIGH_CPU,
                severity=AlertSeverity.HIGH,
                threshold=80.0,
                comparison=">",
                duration_seconds=60.0,
                component="system",
                title_template="High CPU Usage: {value}%",
                description_template="CPU usage is {value}% which exceeds threshold of {threshold}%"
            ),
            AlertRule(
                rule_id="high_memory_usage",
                metric_name="memory_usage_percent",
                alert_type=AlertType.HIGH_MEMORY,
                severity=AlertSeverity.HIGH,
                threshold=85.0,
                comparison=">",
                duration_seconds=60.0,
                component="system",
                title_template="High Memory Usage: {value}%",
                description_template="Memory usage is {value}% which exceeds threshold of {threshold}%"
            ),
            AlertRule(
                rule_id="high_disk_usage",
                metric_name="disk_usage_percent",
                alert_type=AlertType.DISK_SPACE,
                severity=AlertSeverity.MEDIUM,
                threshold=90.0,
                comparison=">",
                duration_seconds=300.0,
                component="system",
                title_template="High Disk Usage: {value}%",
                description_template="Disk usage is {value}% which exceeds threshold of {threshold}%"
            ),
            AlertRule(
                rule_id="high_error_rate",
                metric_name="error_count",
                alert_type=AlertType.ERROR_RATE,
                severity=AlertSeverity.CRITICAL,
                threshold=100.0,
                comparison=">",
                duration_seconds=30.0,
                component="application",
                title_template="High Error Rate: {value} errors",
                description_template="Error count is {value} which exceeds threshold of {threshold}"
            )
        ]
        
        for rule in default_rules:
            self.alert_manager.add_alert_rule(rule)
        
        logger.info(f"Setup {len(default_rules)} default alert rules")
    
    async def _setup_notification_channels(self):
        """Setup notification channels"""
        # Webhook channel (for testing)
        webhook_channel = WebhookNotificationChannel(
            channel_id="test_webhook",
            webhook_url="http://localhost:8080/alerts",  # Mock webhook
            enabled=False  # Disabled by default
        )
        await webhook_channel.initialize()
        self.alert_manager.add_notification_channel(webhook_channel)
        
        # Email channel would be configured with real SMTP settings
        # email_channel = EmailNotificationChannel(
        #     channel_id="email_alerts",
        #     smtp_server="smtp.gmail.com",
        #     smtp_port=587,
        #     username="alerts@romai.com",
        #     password="password",
        #     recipients=["admin@romai.com"],
        #     enabled=False
        # )
        # self.alert_manager.add_notification_channel(email_channel)
        
        logger.info("Notification channels configured")
    
    def record_custom_metric(self, name: str, value: float, labels: Dict[str, str] = None):
        """Record custom application metric"""
        self.metrics_collector.record_metric(name, value, labels)
    
    def record_romanian_processing_metric(self, text_length: int, entities_found: int, processing_time: float):
        """Record Romanian text processing metrics"""
        self.metrics_collector.record_metric("romanian_text_processed", 1)
        self.metrics_collector.record_metric("cultural_entities_detected", entities_found)
        self.metrics_collector.record_metric("processing_time_ms", processing_time * 1000)
        self.metrics_collector.record_metric("text_length_chars", text_length)
    
    def record_request_metric(self, endpoint: str, duration: float, status_code: int):
        """Record HTTP request metrics"""
        labels = {"endpoint": endpoint, "status": str(status_code)}
        self.metrics_collector.record_metric("request_count", 1, labels)
        self.metrics_collector.record_metric("request_duration", duration, labels)
        
        if status_code >= 400:
            self.metrics_collector.record_metric("error_count", 1, labels)
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        metrics = {}
        
        for metric_name, metric in self.metrics_collector.metrics.items():
            latest_value = self.metrics_collector.get_latest_value(metric_name)
            metrics[metric_name] = {
                'current_value': latest_value,
                'type': metric.metric_type.value,
                'description': metric.description,
                'sample_count': len(metric.values)
            }
        
        return metrics
    
    def get_component_health(self) -> Dict[str, Any]:
        """Get component health status"""
        health_status = {}
        
        for component_name, health in self.component_monitor.get_all_components_status().items():
            health_status[component_name] = {
                'status': health.status.value,
                'last_check': health.last_check,
                'response_time': health.response_time,
                'error_count': health.error_count,
                'uptime_percentage': health.uptime_percentage
            }
        
        return health_status
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get alert summary"""
        active_alerts = self.alert_manager.get_active_alerts()
        alert_history = self.alert_manager.get_alert_history(50)
        
        # Count alerts by severity
        severity_counts = defaultdict(int)
        for alert in active_alerts:
            severity_counts[alert.severity.value] += 1
        
        return {
            'active_alerts_count': len(active_alerts),
            'active_alerts': [asdict(alert) for alert in active_alerts],
            'severity_breakdown': dict(severity_counts),
            'recent_history': [asdict(alert) for alert in alert_history[-10:]]
        }
    
    def get_comprehensive_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        uptime = time.time() - self.start_time
        
        return {
            'system_info': self.system_info,
            'monitoring_status': {
                'uptime_seconds': uptime,
                'metrics_collected': len(self.metrics_collector.metrics),
                'alert_rules_configured': len(self.alert_manager.alert_rules),
                'notification_channels': len(self.alert_manager.notification_channels),
                'components_monitored': len(self.component_monitor.components)
            },
            'current_metrics': self.get_system_metrics(),
            'component_health': self.get_component_health(),
            'alert_summary': self.get_alert_summary()
        }

# Test and demonstration functions
async def test_monitoring_alerting():
    """Test the enterprise monitoring and alerting system"""
    print("🚨 Testing Enterprise-Grade Monitoring & Alerting")
    print("=" * 60)
    
    # Create monitoring system
    monitoring = EnterpriseMonitoringAlerting()
    await monitoring.initialize()
    
    # Wait for initial metrics collection
    print("📊 Collecting initial metrics...")
    await asyncio.sleep(3)
    
    # Get system metrics
    print("\n📈 Current System Metrics:")
    metrics = monitoring.get_system_metrics()
    for metric_name, metric_data in list(metrics.items())[:8]:  # Show first 8 metrics
        current_value = metric_data['current_value']
        if current_value is not None:
            if 'percent' in metric_name:
                print(f"   • {metric_name}: {current_value:.1f}%")
            elif 'bytes' in metric_name:
                print(f"   • {metric_name}: {current_value:,.0f} bytes")
            else:
                print(f"   • {metric_name}: {current_value:.2f}")
    
    # Test custom metrics
    print("\n🇷🇴 Recording Romanian Processing Metrics...")
    monitoring.record_romanian_processing_metric(
        text_length=150,
        entities_found=5,
        processing_time=0.25
    )
    
    monitoring.record_request_metric(
        endpoint="/api/romanian/analyze",
        duration=0.18,
        status_code=200
    )
    
    # Simulate high CPU usage to test alerting
    print("\n🚨 Simulating high CPU usage for alert testing...")
    monitoring.record_custom_metric("cpu_usage_percent", 85.0)
    await asyncio.sleep(2)
    
    # Check component health
    print("\n🏥 Component Health Status:")
    component_health = monitoring.get_component_health()
    for component, health in component_health.items():
        status_emoji = {
            'healthy': '✅',
            'warning': '⚠️',
            'critical': '❌',
            'down': '🔴',
            'unknown': '❓'
        }.get(health['status'], '❓')
        
        print(f"   {status_emoji} {component}: {health['status'].upper()}")
        if health['response_time'] > 0:
            print(f"      Response Time: {health['response_time']:.2f}s")
        if health['error_count'] > 0:
            print(f"      Errors: {health['error_count']}")
    
    # Get alert summary
    print("\n🚨 Alert Summary:")
    alert_summary = monitoring.get_alert_summary()
    print(f"   Active Alerts: {alert_summary['active_alerts_count']}")
    
    if alert_summary['severity_breakdown']:
        print("   Severity Breakdown:")
        for severity, count in alert_summary['severity_breakdown'].items():
            print(f"      • {severity.upper()}: {count}")
    
    # Show recent alerts
    if alert_summary['recent_history']:
        print("\n📝 Recent Alert History:")
        for alert in alert_summary['recent_history'][-3:]:  # Show last 3
            print(f"   • {alert['title']} ({alert['severity']})")
            print(f"     Created: {datetime.fromtimestamp(alert['created_at']).strftime('%H:%M:%S')}")
    
    # Get comprehensive status
    print("\n📋 System Overview:")
    status = monitoring.get_comprehensive_status()
    
    print(f"   🖥️  Hostname: {status['system_info']['hostname']}")
    print(f"   🐍 Python: {status['system_info']['python_version']}")
    print(f"   💾 Memory: {status['system_info']['memory_total'] / (1024**3):.1f} GB")
    print(f"   ⏱️  Uptime: {status['monitoring_status']['uptime_seconds']:.1f} seconds")
    print(f"   📊 Metrics: {status['monitoring_status']['metrics_collected']}")
    print(f"   🚨 Alert Rules: {status['monitoring_status']['alert_rules_configured']}")
    print(f"   📢 Notification Channels: {status['monitoring_status']['notification_channels']}")
    
    # Test metric history
    print("\n📈 Testing Metric History...")
    cpu_history = monitoring.metrics_collector.get_metric_values("cpu_usage_percent")
    if cpu_history:
        print(f"   CPU Usage History: {len(cpu_history)} data points")
        if len(cpu_history) >= 2:
            latest = cpu_history[-1]
            previous = cpu_history[-2]
            print(f"   Latest: {latest.value:.1f}% at {datetime.fromtimestamp(latest.timestamp).strftime('%H:%M:%S')}")
            print(f"   Previous: {previous.value:.1f}% at {datetime.fromtimestamp(previous.timestamp).strftime('%H:%M:%S')}")
    
    # Cleanup
    await monitoring.cleanup()
    
    print("\n✅ Enterprise Monitoring & Alerting test completed!")
    return True

if __name__ == "__main__":
    asyncio.run(test_monitoring_alerting())
