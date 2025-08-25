"""
Production Monitoring and Alerting System for RomAI
Real-time performance monitoring, alerting, and health checking
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import psutil
import GPUtil
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class MetricType(Enum):
    """Types of metrics we monitor"""
    LATENCY = "latency"
    THROUGHPUT = "throughput" 
    ERROR_RATE = "error_rate"
    ACCURACY = "accuracy"
    MEMORY = "memory"
    CPU = "cpu"
    GPU = "gpu"
    DISK = "disk"
    CULTURAL_ACCURACY = "cultural_accuracy"

@dataclass
class Alert:
    """Alert data structure"""
    alert_id: str
    severity: AlertSeverity
    metric_type: MetricType
    message: str
    current_value: float
    threshold_value: float
    timestamp: datetime
    resolved: bool = False
    resolved_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['severity'] = self.severity.value
        data['metric_type'] = self.metric_type.value
        data['timestamp'] = self.timestamp.isoformat()
        data['resolved_at'] = self.resolved_at.isoformat() if self.resolved_at else None
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Alert':
        data['severity'] = AlertSeverity(data['severity'])
        data['metric_type'] = MetricType(data['metric_type'])
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        data['resolved_at'] = datetime.fromisoformat(data['resolved_at']) if data['resolved_at'] else None
        return cls(**data)

@dataclass
class MetricThreshold:
    """Monitoring threshold configuration"""
    metric_type: MetricType
    warning_threshold: float
    error_threshold: float
    critical_threshold: float
    comparison: str  # 'greater', 'less', 'equal'
    window_minutes: int = 5
    enabled: bool = True

@dataclass
class SystemMetrics:
    """System performance metrics"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    memory_available_gb: float
    disk_percent: float
    disk_used_gb: float
    disk_free_gb: float
    gpu_percent: List[float]
    gpu_memory_percent: List[float]
    gpu_temperature: List[float]
    network_sent_mbps: float
    network_recv_mbps: float
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SystemMetrics':
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)

@dataclass
class ModelMetrics:
    """Model-specific performance metrics"""
    model_version: str
    timestamp: datetime
    requests_per_second: float
    avg_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    error_rate: float
    accuracy: float
    confidence_score: float
    cultural_accuracy: float
    memory_usage_mb: float
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ModelMetrics':
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)

class MetricsCollector:
    """Collects system and model metrics"""
    
    def __init__(self, collection_interval: float = 30.0):
        self.collection_interval = collection_interval
        self.is_running = False
        self.metrics_history: List[SystemMetrics] = []
        self.model_metrics_history: Dict[str, List[ModelMetrics]] = {}
        self.max_history_size = 1000
        
        # Network baseline for calculating throughput
        self.network_stats_baseline = None
        
    def collect_system_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        try:
            # CPU and Memory
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            # Disk
            disk = psutil.disk_usage('/')
            
            # GPU metrics
            gpu_percent = []
            gpu_memory_percent = []
            gpu_temperature = []
            
            try:
                gpus = GPUtil.getGPUs()
                for gpu in gpus:
                    gpu_percent.append(gpu.load * 100)
                    gpu_memory_percent.append(gpu.memoryUtil * 100)
                    gpu_temperature.append(gpu.temperature)
            except Exception as e:
                logger.debug(f"GPU metrics unavailable: {e}")
                gpu_percent = [0.0]
                gpu_memory_percent = [0.0]
                gpu_temperature = [0.0]
            
            # Network
            net_io = psutil.net_io_counters()
            network_sent_mbps = 0.0
            network_recv_mbps = 0.0
            
            if self.network_stats_baseline:
                time_diff = time.time() - self.network_stats_baseline['timestamp']
                if time_diff > 0:
                    sent_diff = net_io.bytes_sent - self.network_stats_baseline['bytes_sent']
                    recv_diff = net_io.bytes_recv - self.network_stats_baseline['bytes_recv']
                    network_sent_mbps = (sent_diff / time_diff) / (1024 * 1024) * 8
                    network_recv_mbps = (recv_diff / time_diff) / (1024 * 1024) * 8
            
            self.network_stats_baseline = {
                'timestamp': time.time(),
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv
            }
            
            return SystemMetrics(
                timestamp=datetime.now(timezone.utc),
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                memory_used_gb=memory.used / (1024**3),
                memory_available_gb=memory.available / (1024**3),
                disk_percent=disk.percent,
                disk_used_gb=disk.used / (1024**3),
                disk_free_gb=disk.free / (1024**3),
                gpu_percent=gpu_percent,
                gpu_memory_percent=gpu_memory_percent,
                gpu_temperature=gpu_temperature,
                network_sent_mbps=network_sent_mbps,
                network_recv_mbps=network_recv_mbps
            )
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            # Return default metrics on error
            return SystemMetrics(
                timestamp=datetime.now(timezone.utc),
                cpu_percent=0.0,
                memory_percent=0.0,
                memory_used_gb=0.0,
                memory_available_gb=0.0,
                disk_percent=0.0,
                disk_used_gb=0.0,
                disk_free_gb=0.0,
                gpu_percent=[0.0],
                gpu_memory_percent=[0.0],
                gpu_temperature=[0.0],
                network_sent_mbps=0.0,
                network_recv_mbps=0.0
            )
    
    def record_model_metrics(self, model_version: str, metrics: ModelMetrics):
        """Record model-specific metrics"""
        if model_version not in self.model_metrics_history:
            self.model_metrics_history[model_version] = []
        
        self.model_metrics_history[model_version].append(metrics)
        
        # Trim history if needed
        if len(self.model_metrics_history[model_version]) > self.max_history_size:
            self.model_metrics_history[model_version] = self.model_metrics_history[model_version][-self.max_history_size:]
    
    async def start_collection(self):
        """Start collecting metrics periodically"""
        self.is_running = True
        logger.info(f"Starting metrics collection every {self.collection_interval} seconds")
        
        while self.is_running:
            try:
                metrics = self.collect_system_metrics()
                self.metrics_history.append(metrics)
                
                # Trim history if needed
                if len(self.metrics_history) > self.max_history_size:
                    self.metrics_history = self.metrics_history[-self.max_history_size:]
                
                await asyncio.sleep(self.collection_interval)
                
            except Exception as e:
                logger.error(f"Error in metrics collection loop: {e}")
                await asyncio.sleep(self.collection_interval)
    
    def stop_collection(self):
        """Stop collecting metrics"""
        self.is_running = False
        logger.info("Stopping metrics collection")
    
    def get_recent_metrics(self, minutes: int = 10) -> List[SystemMetrics]:
        """Get metrics from the last N minutes"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        return [m for m in self.metrics_history if m.timestamp >= cutoff_time]
    
    def get_model_metrics(self, model_version: str, minutes: int = 10) -> List[ModelMetrics]:
        """Get model metrics from the last N minutes"""
        if model_version not in self.model_metrics_history:
            return []
        
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        return [m for m in self.model_metrics_history[model_version] if m.timestamp >= cutoff_time]

class AlertManager:
    """Manages alerts and notifications"""
    
    def __init__(self, alerts_file: str = "alerts.json"):
        self.alerts_file = Path(alerts_file)
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.alert_handlers: Dict[AlertSeverity, List[Callable]] = {
            AlertSeverity.INFO: [],
            AlertSeverity.WARNING: [],
            AlertSeverity.ERROR: [],
            AlertSeverity.CRITICAL: []
        }
        self.load_alerts()
    
    def load_alerts(self):
        """Load alerts from disk"""
        try:
            if self.alerts_file.exists():
                with open(self.alerts_file, 'r') as f:
                    data = json.load(f)
                
                # Load active alerts
                for alert_id, alert_data in data.get('active_alerts', {}).items():
                    self.active_alerts[alert_id] = Alert.from_dict(alert_data)
                
                # Load alert history
                for alert_data in data.get('alert_history', []):
                    self.alert_history.append(Alert.from_dict(alert_data))
                
                logger.info(f"Loaded {len(self.active_alerts)} active alerts")
        except Exception as e:
            logger.error(f"Error loading alerts: {e}")
    
    def save_alerts(self):
        """Save alerts to disk"""
        try:
            data = {
                'active_alerts': {
                    alert_id: alert.to_dict()
                    for alert_id, alert in self.active_alerts.items()
                },
                'alert_history': [alert.to_dict() for alert in self.alert_history[-100:]],  # Keep last 100
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            with open(self.alerts_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving alerts: {e}")
    
    def add_alert_handler(self, severity: AlertSeverity, handler: Callable[[Alert], None]):
        """Add an alert handler function"""
        self.alert_handlers[severity].append(handler)
    
    def create_alert(self, severity: AlertSeverity, metric_type: MetricType,
                    message: str, current_value: float, threshold_value: float) -> str:
        """Create a new alert"""
        alert_id = f"{metric_type.value}_{severity.value}_{int(time.time())}"
        
        alert = Alert(
            alert_id=alert_id,
            severity=severity,
            metric_type=metric_type,
            message=message,
            current_value=current_value,
            threshold_value=threshold_value,
            timestamp=datetime.now(timezone.utc)
        )
        
        self.active_alerts[alert_id] = alert
        self.alert_history.append(alert)
        
        # Call alert handlers
        for handler in self.alert_handlers[severity]:
            try:
                handler(alert)
            except Exception as e:
                logger.error(f"Error in alert handler: {e}")
        
        logger.warning(f"Alert created: {alert.message} (Value: {current_value}, Threshold: {threshold_value})")
        self.save_alerts()
        
        return alert_id
    
    def resolve_alert(self, alert_id: str):
        """Mark an alert as resolved"""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert.resolved = True
            alert.resolved_at = datetime.now(timezone.utc)
            
            # Move to history (keep in active_alerts for reference)
            logger.info(f"Alert resolved: {alert.message}")
            self.save_alerts()
    
    def get_active_alerts(self, severity: Optional[AlertSeverity] = None) -> List[Alert]:
        """Get active alerts, optionally filtered by severity"""
        alerts = [alert for alert in self.active_alerts.values() if not alert.resolved]
        if severity:
            alerts = [alert for alert in alerts if alert.severity == severity]
        return alerts
    
    def cleanup_old_alerts(self, hours: int = 24):
        """Clean up old resolved alerts"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        # Remove old resolved alerts from active_alerts
        to_remove = []
        for alert_id, alert in self.active_alerts.items():
            if alert.resolved and alert.resolved_at and alert.resolved_at < cutoff_time:
                to_remove.append(alert_id)
        
        for alert_id in to_remove:
            del self.active_alerts[alert_id]
        
        # Trim alert history
        self.alert_history = [
            alert for alert in self.alert_history
            if alert.timestamp >= cutoff_time
        ]
        
        if to_remove:
            logger.info(f"Cleaned up {len(to_remove)} old alerts")
            self.save_alerts()

class ProductionMonitor:
    """Main production monitoring system for RomAI"""
    
    def __init__(self, config_path: str = "monitoring_config.json"):
        self.config_path = Path(config_path)
        self.metrics_collector = MetricsCollector()
        self.alert_manager = AlertManager()
        self.thresholds: Dict[MetricType, MetricThreshold] = {}
        self.is_monitoring = False
        
        # Load configuration
        self.load_config()
        
        # Set up default alert handlers
        self.setup_default_alert_handlers()
    
    def load_config(self):
        """Load monitoring configuration"""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                
                # Load thresholds
                for metric_name, threshold_config in config.get('thresholds', {}).items():
                    metric_type = MetricType(metric_name)
                    self.thresholds[metric_type] = MetricThreshold(
                        metric_type=metric_type,
                        warning_threshold=threshold_config['warning'],
                        error_threshold=threshold_config['error'],
                        critical_threshold=threshold_config['critical'],
                        comparison=threshold_config['comparison'],
                        window_minutes=threshold_config.get('window_minutes', 5),
                        enabled=threshold_config.get('enabled', True)
                    )
                
                logger.info(f"Loaded {len(self.thresholds)} monitoring thresholds")
            else:
                # Create default configuration
                self.create_default_config()
        except Exception as e:
            logger.error(f"Error loading monitoring config: {e}")
            self.create_default_config()
    
    def create_default_config(self):
        """Create default monitoring configuration"""
        default_thresholds = {
            MetricType.LATENCY: MetricThreshold(
                MetricType.LATENCY, 500.0, 1000.0, 2000.0, 'greater'
            ),
            MetricType.ERROR_RATE: MetricThreshold(
                MetricType.ERROR_RATE, 0.05, 0.1, 0.2, 'greater'
            ),
            MetricType.ACCURACY: MetricThreshold(
                MetricType.ACCURACY, 0.85, 0.8, 0.7, 'less'
            ),
            MetricType.MEMORY: MetricThreshold(
                MetricType.MEMORY, 80.0, 90.0, 95.0, 'greater'
            ),
            MetricType.CPU: MetricThreshold(
                MetricType.CPU, 80.0, 90.0, 95.0, 'greater'
            ),
            MetricType.GPU: MetricThreshold(
                MetricType.GPU, 85.0, 95.0, 98.0, 'greater'
            )
        }
        
        self.thresholds = default_thresholds
        self.save_config()
    
    def save_config(self):
        """Save monitoring configuration"""
        try:
            config = {
                'thresholds': {}
            }
            
            for metric_type, threshold in self.thresholds.items():
                config['thresholds'][metric_type.value] = {
                    'warning': threshold.warning_threshold,
                    'error': threshold.error_threshold,
                    'critical': threshold.critical_threshold,
                    'comparison': threshold.comparison,
                    'window_minutes': threshold.window_minutes,
                    'enabled': threshold.enabled
                }
            
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving monitoring config: {e}")
    
    def setup_default_alert_handlers(self):
        """Set up default alert handlers"""
        def log_alert(alert: Alert):
            level = logging.WARNING if alert.severity in [AlertSeverity.WARNING, AlertSeverity.ERROR] else logging.CRITICAL
            logger.log(level, f"ALERT [{alert.severity.value.upper()}]: {alert.message}")
        
        # Add logging handler for all severities
        for severity in AlertSeverity:
            self.alert_manager.add_alert_handler(severity, log_alert)
    
    def check_thresholds(self, metrics: SystemMetrics):
        """Check metrics against thresholds and create alerts"""
        try:
            # Check CPU
            if MetricType.CPU in self.thresholds:
                threshold = self.thresholds[MetricType.CPU]
                if threshold.enabled:
                    self._check_threshold(
                        MetricType.CPU, metrics.cpu_percent, threshold,
                        f"CPU usage is {metrics.cpu_percent:.1f}%"
                    )
            
            # Check Memory
            if MetricType.MEMORY in self.thresholds:
                threshold = self.thresholds[MetricType.MEMORY]
                if threshold.enabled:
                    self._check_threshold(
                        MetricType.MEMORY, metrics.memory_percent, threshold,
                        f"Memory usage is {metrics.memory_percent:.1f}%"
                    )
            
            # Check GPU
            if MetricType.GPU in self.thresholds and metrics.gpu_percent:
                threshold = self.thresholds[MetricType.GPU]
                if threshold.enabled:
                    max_gpu_usage = max(metrics.gpu_percent)
                    self._check_threshold(
                        MetricType.GPU, max_gpu_usage, threshold,
                        f"GPU usage is {max_gpu_usage:.1f}%"
                    )
                    
        except Exception as e:
            logger.error(f"Error checking thresholds: {e}")
    
    def check_model_thresholds(self, model_version: str, metrics: ModelMetrics):
        """Check model metrics against thresholds"""
        try:
            # Check Latency
            if MetricType.LATENCY in self.thresholds:
                threshold = self.thresholds[MetricType.LATENCY]
                if threshold.enabled:
                    self._check_threshold(
                        MetricType.LATENCY, metrics.avg_latency_ms, threshold,
                        f"Model {model_version} latency is {metrics.avg_latency_ms:.1f}ms"
                    )
            
            # Check Error Rate
            if MetricType.ERROR_RATE in self.thresholds:
                threshold = self.thresholds[MetricType.ERROR_RATE]
                if threshold.enabled:
                    self._check_threshold(
                        MetricType.ERROR_RATE, metrics.error_rate, threshold,
                        f"Model {model_version} error rate is {metrics.error_rate:.3f}"
                    )
            
            # Check Accuracy
            if MetricType.ACCURACY in self.thresholds:
                threshold = self.thresholds[MetricType.ACCURACY]
                if threshold.enabled:
                    self._check_threshold(
                        MetricType.ACCURACY, metrics.accuracy, threshold,
                        f"Model {model_version} accuracy is {metrics.accuracy:.3f}"
                    )
                    
        except Exception as e:
            logger.error(f"Error checking model thresholds: {e}")
    
    def _check_threshold(self, metric_type: MetricType, value: float, 
                        threshold: MetricThreshold, message: str):
        """Check a single threshold and create alerts if needed"""
        try:
            if threshold.comparison == 'greater':
                if value >= threshold.critical_threshold:
                    self.alert_manager.create_alert(
                        AlertSeverity.CRITICAL, metric_type, message, 
                        value, threshold.critical_threshold
                    )
                elif value >= threshold.error_threshold:
                    self.alert_manager.create_alert(
                        AlertSeverity.ERROR, metric_type, message, 
                        value, threshold.error_threshold
                    )
                elif value >= threshold.warning_threshold:
                    self.alert_manager.create_alert(
                        AlertSeverity.WARNING, metric_type, message, 
                        value, threshold.warning_threshold
                    )
            elif threshold.comparison == 'less':
                if value <= threshold.critical_threshold:
                    self.alert_manager.create_alert(
                        AlertSeverity.CRITICAL, metric_type, message, 
                        value, threshold.critical_threshold
                    )
                elif value <= threshold.error_threshold:
                    self.alert_manager.create_alert(
                        AlertSeverity.ERROR, metric_type, message, 
                        value, threshold.error_threshold
                    )
                elif value <= threshold.warning_threshold:
                    self.alert_manager.create_alert(
                        AlertSeverity.WARNING, metric_type, message, 
                        value, threshold.warning_threshold
                    )
        except Exception as e:
            logger.error(f"Error in threshold check: {e}")
    
    async def start_monitoring(self):
        """Start the monitoring system"""
        if self.is_monitoring:
            logger.warning("Monitoring is already running")
            return
        
        self.is_monitoring = True
        logger.info("Starting production monitoring system")
        
        # Start metrics collection
        collection_task = asyncio.create_task(self.metrics_collector.start_collection())
        
        # Start threshold monitoring
        monitoring_task = asyncio.create_task(self._monitoring_loop())
        
        try:
            await asyncio.gather(collection_task, monitoring_task)
        except Exception as e:
            logger.error(f"Error in monitoring system: {e}")
        finally:
            self.is_monitoring = False
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.is_monitoring:
            try:
                # Check recent metrics against thresholds
                recent_metrics = self.metrics_collector.get_recent_metrics(minutes=1)
                if recent_metrics:
                    latest_metrics = recent_metrics[-1]
                    self.check_thresholds(latest_metrics)
                
                # Cleanup old alerts periodically
                if int(time.time()) % 3600 == 0:  # Every hour
                    self.alert_manager.cleanup_old_alerts()
                
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(60)
    
    def stop_monitoring(self):
        """Stop the monitoring system"""
        self.is_monitoring = False
        self.metrics_collector.stop_collection()
        logger.info("Stopped production monitoring system")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get current system health status"""
        try:
            active_alerts = self.alert_manager.get_active_alerts()
            recent_metrics = self.metrics_collector.get_recent_metrics(minutes=5)
            
            status = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'overall_health': 'healthy',
                'active_alerts': len(active_alerts),
                'critical_alerts': len([a for a in active_alerts if a.severity == AlertSeverity.CRITICAL]),
                'system_metrics': None,
                'alert_summary': {}
            }
            
            # Determine overall health
            if any(a.severity == AlertSeverity.CRITICAL for a in active_alerts):
                status['overall_health'] = 'critical'
            elif any(a.severity == AlertSeverity.ERROR for a in active_alerts):
                status['overall_health'] = 'degraded'
            elif any(a.severity == AlertSeverity.WARNING for a in active_alerts):
                status['overall_health'] = 'warning'
            
            # Add latest system metrics
            if recent_metrics:
                latest = recent_metrics[-1]
                status['system_metrics'] = {
                    'cpu_percent': latest.cpu_percent,
                    'memory_percent': latest.memory_percent,
                    'gpu_percent': latest.gpu_percent[0] if latest.gpu_percent else 0,
                    'disk_percent': latest.disk_percent
                }
            
            # Alert summary by severity
            for severity in AlertSeverity:
                status['alert_summary'][severity.value] = len([
                    a for a in active_alerts if a.severity == severity
                ])
            
            return status
            
        except Exception as e:
            logger.error(f"Error getting health status: {e}")
            return {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'overall_health': 'unknown',
                'error': str(e)
            }

# Example usage and testing
async def test_production_monitor():
    """Test the production monitoring system"""
    print("📊 Testing RomAI Production Monitoring")
    print("=" * 50)
    
    # Initialize monitor
    monitor = ProductionMonitor()
    
    print("✅ Production monitor initialized")
    
    # Collect some metrics manually
    system_metrics = monitor.metrics_collector.collect_system_metrics()
    print(f"✅ System Metrics Collected:")
    print(f"   CPU: {system_metrics.cpu_percent:.1f}%")
    print(f"   Memory: {system_metrics.memory_percent:.1f}%")
    print(f"   GPU: {system_metrics.gpu_percent[0]:.1f}%" if system_metrics.gpu_percent else "   GPU: N/A")
    
    # Test model metrics
    test_model_metrics = ModelMetrics(
        model_version="test_model_v1",
        timestamp=datetime.now(timezone.utc),
        requests_per_second=50.0,
        avg_latency_ms=200.0,
        p95_latency_ms=350.0,
        p99_latency_ms=500.0,
        error_rate=0.02,
        accuracy=0.85,
        confidence_score=0.8,
        cultural_accuracy=0.9,
        memory_usage_mb=512.0
    )
    
    monitor.metrics_collector.record_model_metrics("test_model_v1", test_model_metrics)
    print("✅ Model metrics recorded")
    
    # Test threshold checking
    monitor.check_thresholds(system_metrics)
    monitor.check_model_thresholds("test_model_v1", test_model_metrics)
    print("✅ Threshold checking completed")
    
    # Get health status
    health = monitor.get_health_status()
    print(f"✅ Health Status: {health['overall_health']}")
    print(f"   Active Alerts: {health['active_alerts']}")
    
    return True

if __name__ == "__main__":
    # Install required packages if not available
    try:
        import GPUtil
    except ImportError:
        print("Installing GPUtil...")
        import subprocess
        subprocess.run(["pip", "install", "GPUtil"], check=True)
        import GPUtil
    
    asyncio.run(test_production_monitor())