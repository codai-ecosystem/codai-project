"""
Advanced Monitoring System for RomAI AGI
Real-time monitoring, metrics collection, and system health tracking
"""

import logging
import asyncio
import time
import psutil
import threading
from typing import Dict, List, Any, Optional, Union, Callable
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import defaultdict, deque
import json

logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """System performance metrics"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_available_gb: float
    gpu_memory_used: Optional[float] = None
    gpu_memory_total: Optional[float] = None
    disk_usage_percent: float = 0.0
    network_io_bytes: int = 0
    active_threads: int = 0
    response_time_ms: float = 0.0

@dataclass
class ModelMetrics:
    """Model performance metrics"""
    model_name: str
    timestamp: datetime
    inference_count: int
    average_latency_ms: float
    success_rate: float
    error_count: int
    memory_usage_mb: float
    throughput_per_second: float

@dataclass
class AlertRule:
    """Monitoring alert rule"""
    name: str
    condition: str
    threshold: float
    severity: str = "warning"
    enabled: bool = True
    cooldown_minutes: int = 5

class MetricsCollector:
    """Real-time metrics collector"""
    
    def __init__(self, collection_interval: float = 1.0):
        self.collection_interval = collection_interval
        self.metrics_history = deque(maxlen=3600)  # 1 hour of metrics
        self.is_collecting = False
        self.collector_thread = None
        
        # Performance counters
        self.counters = defaultdict(int)
        self.timings = defaultdict(list)
        self.model_stats = defaultdict(lambda: {
            'requests': 0,
            'total_time': 0.0,
            'errors': 0,
            'memory_peak': 0.0
        })
        
        logger.info("📊 Metrics collector initialized")
    
    def start_collection(self):
        """Start metrics collection"""
        if not self.is_collecting:
            self.is_collecting = True
            self.collector_thread = threading.Thread(target=self._collect_loop, daemon=True)
            self.collector_thread.start()
            logger.info("🚀 Metrics collection started")
    
    def stop_collection(self):
        """Stop metrics collection"""
        self.is_collecting = False
        if self.collector_thread:
            self.collector_thread.join(timeout=5.0)
        logger.info("⏹️ Metrics collection stopped")
    
    def _collect_loop(self):
        """Metrics collection loop"""
        while self.is_collecting:
            try:
                metrics = self._collect_system_metrics()
                self.metrics_history.append(metrics)
                time.sleep(self.collection_interval)
            except Exception as e:
                logger.error(f"❌ Metrics collection error: {e}")
                time.sleep(self.collection_interval)
    
    def _collect_system_metrics(self) -> SystemMetrics:
        """Collect system metrics"""
        try:
            # System metrics
            cpu_percent = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            # GPU metrics (if available)
            gpu_memory_used = None
            gpu_memory_total = None
            try:
                import GPUtil
                gpus = GPUtil.getGPUs()
                if gpus:
                    gpu = gpus[0]
                    gpu_memory_used = gpu.memoryUsed
                    gpu_memory_total = gpu.memoryTotal
            except ImportError:
                pass
            
            return SystemMetrics(
                timestamp=datetime.now(),
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                memory_available_gb=memory.available / (1024**3),
                gpu_memory_used=gpu_memory_used,
                gpu_memory_total=gpu_memory_total,
                disk_usage_percent=disk.percent,
                network_io_bytes=network.bytes_sent + network.bytes_recv,
                active_threads=threading.active_count(),
                response_time_ms=0.0  # Will be updated by specific measurements
            )
            
        except Exception as e:
            logger.error(f"❌ Failed to collect system metrics: {e}")
            return SystemMetrics(
                timestamp=datetime.now(),
                cpu_percent=0.0,
                memory_percent=0.0,
                memory_available_gb=0.0,
                disk_usage_percent=0.0,
                network_io_bytes=0,
                active_threads=0,
                response_time_ms=0.0
            )
    
    def record_model_request(self, model_name: str, latency_ms: float, success: bool = True):
        """Record model inference request"""
        stats = self.model_stats[model_name]
        stats['requests'] += 1
        stats['total_time'] += latency_ms
        if not success:
            stats['errors'] += 1
        
        # Update timing history
        self.timings[f"{model_name}_latency"].append(latency_ms)
        if len(self.timings[f"{model_name}_latency"]) > 1000:
            self.timings[f"{model_name}_latency"].pop(0)
    
    def record_memory_usage(self, component: str, memory_mb: float):
        """Record memory usage for component"""
        self.model_stats[component]['memory_peak'] = max(
            self.model_stats[component]['memory_peak'], 
            memory_mb
        )
    
    def get_latest_metrics(self) -> Optional[SystemMetrics]:
        """Get latest system metrics"""
        return self.metrics_history[-1] if self.metrics_history else None
    
    def get_model_metrics(self, model_name: str) -> Optional[ModelMetrics]:
        """Get model performance metrics"""
        if model_name not in self.model_stats:
            return None
        
        stats = self.model_stats[model_name]
        if stats['requests'] == 0:
            return None
        
        return ModelMetrics(
            model_name=model_name,
            timestamp=datetime.now(),
            inference_count=stats['requests'],
            average_latency_ms=stats['total_time'] / stats['requests'],
            success_rate=(stats['requests'] - stats['errors']) / stats['requests'],
            error_count=stats['errors'],
            memory_usage_mb=stats['memory_peak'],
            throughput_per_second=stats['requests'] / max(1, (time.time() - self._start_time)) if hasattr(self, '_start_time') else 0.0
        )
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get comprehensive metrics summary"""
        latest = self.get_latest_metrics()
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'system': asdict(latest) if latest else None,
            'models': {},
            'counters': dict(self.counters),
            'collection_active': self.is_collecting,
            'history_size': len(self.metrics_history)
        }
        
        # Add model metrics
        for model_name in self.model_stats.keys():
            model_metrics = self.get_model_metrics(model_name)
            if model_metrics:
                summary['models'][model_name] = asdict(model_metrics)
        
        return summary

class AlertManager:
    """Advanced alerting system"""
    
    def __init__(self):
        self.alert_rules = {}
        self.active_alerts = {}
        self.alert_history = deque(maxlen=1000)
        self.alert_callbacks = []
        
        self._setup_default_rules()
        logger.info("🚨 Alert manager initialized")
    
    def _setup_default_rules(self):
        """Setup default alert rules"""
        default_rules = [
            AlertRule("high_cpu", "cpu_percent > threshold", 80.0, "warning"),
            AlertRule("high_memory", "memory_percent > threshold", 85.0, "warning"),
            AlertRule("low_memory", "memory_available_gb < threshold", 2.0, "critical"),
            AlertRule("high_error_rate", "error_rate > threshold", 0.1, "warning"),
            AlertRule("slow_response", "response_time_ms > threshold", 5000.0, "warning"),
        ]
        
        for rule in default_rules:
            self.alert_rules[rule.name] = rule
    
    def add_alert_rule(self, rule: AlertRule):
        """Add custom alert rule"""
        self.alert_rules[rule.name] = rule
        logger.info(f"📝 Added alert rule: {rule.name}")
    
    def add_alert_callback(self, callback: Callable[[str, Dict], None]):
        """Add alert callback function"""
        self.alert_callbacks.append(callback)
    
    def check_alerts(self, metrics: SystemMetrics, model_metrics: Dict[str, ModelMetrics]):
        """Check all alert conditions"""
        current_time = datetime.now()
        
        for rule_name, rule in self.alert_rules.items():
            if not rule.enabled:
                continue
            
            # Check cooldown
            if rule_name in self.active_alerts:
                last_alert_time = self.active_alerts[rule_name]['timestamp']
                if current_time - last_alert_time < timedelta(minutes=rule.cooldown_minutes):
                    continue
            
            # Evaluate condition
            alert_triggered = self._evaluate_condition(rule, metrics, model_metrics)
            
            if alert_triggered:
                self._trigger_alert(rule_name, rule, metrics)
    
    def _evaluate_condition(self, rule: AlertRule, metrics: SystemMetrics, model_metrics: Dict[str, ModelMetrics]) -> bool:
        """Evaluate alert condition"""
        try:
            # Create evaluation context
            context = {
                'cpu_percent': metrics.cpu_percent,
                'memory_percent': metrics.memory_percent,
                'memory_available_gb': metrics.memory_available_gb,
                'response_time_ms': metrics.response_time_ms,
                'threshold': rule.threshold,
                'error_rate': 0.0  # Calculate from model metrics
            }
            
            # Calculate error rate from model metrics
            total_requests = sum(m.inference_count for m in model_metrics.values())
            total_errors = sum(m.error_count for m in model_metrics.values())
            if total_requests > 0:
                context['error_rate'] = total_errors / total_requests
            
            # Simple condition evaluation
            if rule.condition == "cpu_percent > threshold":
                return context['cpu_percent'] > context['threshold']
            elif rule.condition == "memory_percent > threshold":
                return context['memory_percent'] > context['threshold']
            elif rule.condition == "memory_available_gb < threshold":
                return context['memory_available_gb'] < context['threshold']
            elif rule.condition == "error_rate > threshold":
                return context['error_rate'] > context['threshold']
            elif rule.condition == "response_time_ms > threshold":
                return context['response_time_ms'] > context['threshold']
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Error evaluating alert condition: {e}")
            return False
    
    def _trigger_alert(self, rule_name: str, rule: AlertRule, metrics: SystemMetrics):
        """Trigger alert"""
        alert_data = {
            'rule_name': rule_name,
            'severity': rule.severity,
            'timestamp': datetime.now(),
            'condition': rule.condition,
            'threshold': rule.threshold,
            'current_metrics': asdict(metrics)
        }
        
        # Record alert
        self.active_alerts[rule_name] = alert_data
        self.alert_history.append(alert_data)
        
        # Notify callbacks
        for callback in self.alert_callbacks:
            try:
                callback(rule_name, alert_data)
            except Exception as e:
                logger.error(f"❌ Alert callback error: {e}")
        
        logger.warning(f"🚨 ALERT: {rule_name} - {rule.condition} (threshold: {rule.threshold})")
    
    def get_active_alerts(self) -> Dict[str, Dict]:
        """Get active alerts"""
        return dict(self.active_alerts)
    
    def clear_alert(self, rule_name: str):
        """Clear active alert"""
        if rule_name in self.active_alerts:
            del self.active_alerts[rule_name]
            logger.info(f"✅ Cleared alert: {rule_name}")

class AdvancedMonitoringSystem:
    """Advanced monitoring system coordinator"""
    
    def __init__(self):
        self.metrics_collector = MetricsCollector()
        self.alert_manager = AlertManager()
        self.monitoring_active = False
        self.monitor_thread = None
        
        # Setup alert callback
        self.alert_manager.add_alert_callback(self._handle_alert)
        
        logger.info("🔍 Advanced monitoring system initialized")
    
    def start_monitoring(self):
        """Start comprehensive monitoring"""
        if not self.monitoring_active:
            self.monitoring_active = True
            self.metrics_collector.start_collection()
            
            # Start monitoring loop
            self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
            self.monitor_thread.start()
            
            logger.info("🚀 Advanced monitoring started")
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.monitoring_active = False
        self.metrics_collector.stop_collection()
        
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5.0)
        
        logger.info("⏹️ Advanced monitoring stopped")
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.monitoring_active:
            try:
                # Get latest metrics
                system_metrics = self.metrics_collector.get_latest_metrics()
                if system_metrics:
                    # Get model metrics
                    model_metrics = {}
                    for model_name in self.metrics_collector.model_stats.keys():
                        metrics = self.metrics_collector.get_model_metrics(model_name)
                        if metrics:
                            model_metrics[model_name] = metrics
                    
                    # Check alerts
                    self.alert_manager.check_alerts(system_metrics, model_metrics)
                
                time.sleep(5.0)  # Check every 5 seconds
                
            except Exception as e:
                logger.error(f"❌ Monitoring loop error: {e}")
                time.sleep(5.0)
    
    def _handle_alert(self, rule_name: str, alert_data: Dict):
        """Handle triggered alert"""
        # Log alert
        severity = alert_data.get('severity', 'info')
        if severity == 'critical':
            logger.critical(f"🚨 CRITICAL ALERT: {rule_name}")
        elif severity == 'warning':
            logger.warning(f"⚠️ WARNING: {rule_name}")
        else:
            logger.info(f"ℹ️ INFO: {rule_name}")
    
    def record_inference(self, model_name: str, latency_ms: float, success: bool = True):
        """Record model inference metrics"""
        self.metrics_collector.record_model_request(model_name, latency_ms, success)
    
    def record_memory_usage(self, component: str, memory_mb: float):
        """Record memory usage"""
        self.metrics_collector.record_memory_usage(component, memory_mb)
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get comprehensive health status"""
        metrics_summary = self.metrics_collector.get_metrics_summary()
        active_alerts = self.alert_manager.get_active_alerts()
        
        # Determine overall health
        health_score = 1.0
        if active_alerts:
            critical_alerts = sum(1 for alert in active_alerts.values() if alert.get('severity') == 'critical')
            warning_alerts = len(active_alerts) - critical_alerts
            health_score -= (critical_alerts * 0.3 + warning_alerts * 0.1)
        
        health_status = "healthy" if health_score > 0.8 else ("degraded" if health_score > 0.5 else "unhealthy")
        
        return {
            'status': health_status,
            'health_score': max(0.0, health_score),
            'monitoring_active': self.monitoring_active,
            'active_alerts': len(active_alerts),
            'critical_alerts': sum(1 for alert in active_alerts.values() if alert.get('severity') == 'critical'),
            'metrics': metrics_summary,
            'timestamp': datetime.now().isoformat()
        }
    
    def add_custom_alert(self, name: str, condition: str, threshold: float, severity: str = "warning"):
        """Add custom monitoring alert"""
        rule = AlertRule(name, condition, threshold, severity)
        self.alert_manager.add_alert_rule(rule)
    
    def export_metrics(self, format: str = "json") -> str:
        """Export metrics in specified format"""
        health_status = self.get_health_status()
        
        if format.lower() == "json":
            return json.dumps(health_status, indent=2, default=str)
        else:
            return str(health_status)

# Global monitoring instance
advanced_monitoring_system = AdvancedMonitoringSystem()

# Convenience functions for external access
def get_monitoring_system() -> AdvancedMonitoringSystem:
    """Get the global monitoring system instance"""
    return advanced_monitoring_system

def start_monitoring():
    """Start monitoring system"""
    advanced_monitoring_system.start_monitoring()

def get_health_status():
    """Get current health status"""
    return advanced_monitoring_system.get_health_status()

# Context manager for monitoring
class MonitoringContext:
    """Context manager for automatic monitoring"""
    
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            duration_ms = (time.time() - self.start_time) * 1000
            success = exc_type is None
            advanced_monitoring_system.record_inference(
                self.operation_name, 
                duration_ms, 
                success
            )

logger.info("✅ Advanced monitoring system module loaded successfully")