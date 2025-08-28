"""
RomAI AGI Production Monitoring System - Phase 3B
================================================

Enterprise-grade monitoring, logging, and observability system for RomAI AGI.
Provides real-time performance tracking, error detection, and operational insights.

Features:
- Structured logging with JSON output
- Performance metrics collection
- Health monitoring and alerting
- Error tracking and analysis
- Request/response monitoring
- Capability scoring surveillance
- Production-ready dashboards
"""

import logging
import json
import time
import asyncio
import traceback
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from collections import defaultdict, deque
import hashlib
import uuid

# Production logging configuration
class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class AlertSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class ProductionMetric:
    """Production metric data structure"""
    metric_name: str
    value: float
    timestamp: datetime
    tags: Dict[str, str]
    unit: str = ""
    source: str = "romai_agi"

@dataclass
class HealthCheckResult:
    """Health check result"""
    service_name: str
    status: str  # healthy, degraded, unhealthy
    response_time_ms: float
    details: Dict[str, Any]
    timestamp: datetime
    error_message: Optional[str] = None

@dataclass
class AlertEvent:
    """Alert event data"""
    alert_id: str
    severity: AlertSeverity
    title: str
    description: str
    timestamp: datetime
    source: str
    tags: Dict[str, str]
    resolved: bool = False
    resolution_time: Optional[datetime] = None

class ProductionLogger:
    """
    Production-grade structured logger with JSON output
    """
    
    def __init__(self, service_name: str = "romai_agi"):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)
        
        # Configure structured logging
        self._setup_structured_logging()
        
        # Request tracking
        self.request_context = {}
        
    def _setup_structured_logging(self):
        """Setup structured JSON logging"""
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Create JSON formatter
        class JSONFormatter(logging.Formatter):
            def format(self, record):
                log_entry = {
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "level": record.levelname,
                    "service": "romai_agi",
                    "logger": record.name,
                    "message": record.getMessage(),
                    "module": record.module,
                    "function": record.funcName,
                    "line": record.lineno,
                }
                
                # Add exception info if present
                if record.exc_info:
                    log_entry["exception"] = {
                        "type": record.exc_info[0].__name__,
                        "message": str(record.exc_info[1]),
                        "traceback": traceback.format_exception(*record.exc_info)
                    }
                
                # Add extra fields
                for key, value in record.__dict__.items():
                    if key not in ["name", "msg", "args", "levelname", "levelno", "pathname", 
                                  "filename", "module", "lineno", "funcName", "created", 
                                  "msecs", "relativeCreated", "thread", "threadName", 
                                  "processName", "process", "exc_info", "exc_text", "stack_info"]:
                        log_entry[key] = value
                
                return json.dumps(log_entry, default=str, ensure_ascii=False)
        
        # Console handler with JSON formatting
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(JSONFormatter())
        self.logger.addHandler(console_handler)
        
        # Set level
        self.logger.setLevel(logging.INFO)
        
    def log_request(self, request_id: str, method: str, endpoint: str, 
                   user_id: Optional[str] = None, **kwargs):
        """Log incoming request"""
        self.logger.info(
            "Request received",
            extra={
                "event_type": "request_start",
                "request_id": request_id,
                "http_method": method,
                "endpoint": endpoint,
                "user_id": user_id,
                **kwargs
            }
        )
    
    def log_response(self, request_id: str, status_code: int, response_time_ms: float,
                    response_size: int = 0, **kwargs):
        """Log response completion"""
        self.logger.info(
            "Request completed",
            extra={
                "event_type": "request_complete",
                "request_id": request_id,
                "status_code": status_code,
                "response_time_ms": response_time_ms,
                "response_size_bytes": response_size,
                **kwargs
            }
        )
    
    def log_capability_score(self, capability: str, score: float, 
                           context: Dict[str, Any], **kwargs):
        """Log capability scoring events"""
        self.logger.info(
            "Capability score recorded",
            extra={
                "event_type": "capability_score",
                "capability": capability,
                "score": score,
                "context": context,
                **kwargs
            }
        )
    
    def log_error(self, error: Exception, context: Dict[str, Any], 
                 request_id: Optional[str] = None, **kwargs):
        """Log error with full context"""
        self.logger.error(
            f"Error occurred: {str(error)}",
            exc_info=error,
            extra={
                "event_type": "error",
                "error_type": type(error).__name__,
                "error_message": str(error),
                "context": context,
                "request_id": request_id,
                **kwargs
            }
        )
    
    def log_performance_metric(self, metric_name: str, value: float, 
                             unit: str = "", **kwargs):
        """Log performance metrics"""
        self.logger.info(
            f"Performance metric: {metric_name} = {value}{unit}",
            extra={
                "event_type": "performance_metric",
                "metric_name": metric_name,
                "metric_value": value,
                "metric_unit": unit,
                **kwargs
            }
        )

class MetricsCollector:
    """
    Production metrics collection and aggregation
    """
    
    def __init__(self, buffer_size: int = 10000):
        self.metrics_buffer = deque(maxlen=buffer_size)
        self.aggregated_metrics = defaultdict(list)
        self.lock = threading.Lock()
        
        # Performance counters
        self.counters = defaultdict(int)
        self.gauges = defaultdict(float)
        self.histograms = defaultdict(list)
        
        # Start background aggregation
        self._start_background_aggregation()
    
    def record_counter(self, name: str, value: int = 1, tags: Dict[str, str] = None):
        """Record counter metric"""
        with self.lock:
            self.counters[name] += value
            
        metric = ProductionMetric(
            metric_name=name,
            value=value,
            timestamp=datetime.utcnow(),
            tags=tags or {},
            unit="count"
        )
        self.metrics_buffer.append(metric)
    
    def record_gauge(self, name: str, value: float, tags: Dict[str, str] = None):
        """Record gauge metric"""
        with self.lock:
            self.gauges[name] = value
            
        metric = ProductionMetric(
            metric_name=name,
            value=value,
            timestamp=datetime.utcnow(),
            tags=tags or {},
            unit="gauge"
        )
        self.metrics_buffer.append(metric)
    
    def record_histogram(self, name: str, value: float, tags: Dict[str, str] = None):
        """Record histogram metric (for response times, etc.)"""
        with self.lock:
            self.histograms[name].append(value)
            # Keep only last 1000 values for memory efficiency
            if len(self.histograms[name]) > 1000:
                self.histograms[name] = self.histograms[name][-1000:]
        
        metric = ProductionMetric(
            metric_name=name,
            value=value,
            timestamp=datetime.utcnow(),
            tags=tags or {},
            unit="histogram"
        )
        self.metrics_buffer.append(metric)
    
    def get_system_metrics(self) -> Dict[str, float]:
        """Get current system metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "system.cpu.percent": cpu_percent,
                "system.memory.percent": memory.percent,
                "system.memory.available_mb": memory.available / (1024 * 1024),
                "system.disk.percent": disk.percent,
                "system.disk.free_gb": disk.free / (1024 * 1024 * 1024)
            }
        except Exception as e:
            return {"system.metrics.error": 1.0}
    
    def get_aggregated_metrics(self, window_minutes: int = 5) -> Dict[str, Any]:
        """Get aggregated metrics for the specified time window"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=window_minutes)
        
        recent_metrics = [
            m for m in self.metrics_buffer 
            if m.timestamp >= cutoff_time
        ]
        
        # Group by metric name
        grouped = defaultdict(list)
        for metric in recent_metrics:
            grouped[metric.metric_name].append(metric.value)
        
        # Calculate aggregations
        aggregated = {}
        for name, values in grouped.items():
            if values:
                aggregated[name] = {
                    "count": len(values),
                    "sum": sum(values),
                    "avg": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "latest": values[-1] if values else 0
                }
        
        return aggregated
    
    def _start_background_aggregation(self):
        """Start background thread for metrics aggregation"""
        def aggregate_metrics():
            while True:
                try:
                    # Record system metrics every 30 seconds
                    system_metrics = self.get_system_metrics()
                    for name, value in system_metrics.items():
                        self.record_gauge(name, value)
                    
                    time.sleep(30)
                except Exception as e:
                    # Log error but don't crash the aggregator
                    pass
        
        thread = threading.Thread(target=aggregate_metrics, daemon=True)
        thread.start()

class HealthMonitor:
    """
    Production health monitoring and alerting
    """
    
    def __init__(self, logger: ProductionLogger, metrics: MetricsCollector):
        self.logger = logger
        self.metrics = metrics
        self.health_checks = {}
        self.alert_history = deque(maxlen=1000)
        self.alert_thresholds = {
            "response_time_ms": 5000,  # 5 second threshold
            "error_rate_percent": 5.0,  # 5% error rate
            "cpu_percent": 90.0,        # 90% CPU usage
            "memory_percent": 95.0,     # 95% memory usage
            "capability_score_min": 0.5  # Minimum capability score
        }
    
    def register_health_check(self, name: str, check_function):
        """Register a health check function"""
        self.health_checks[name] = check_function
    
    async def run_health_checks(self) -> Dict[str, HealthCheckResult]:
        """Run all registered health checks"""
        results = {}
        
        for name, check_func in self.health_checks.items():
            start_time = time.time()
            
            try:
                # Run health check
                if asyncio.iscoroutinefunction(check_func):
                    check_result = await check_func()
                else:
                    check_result = check_func()
                
                response_time = (time.time() - start_time) * 1000
                
                result = HealthCheckResult(
                    service_name=name,
                    status="healthy" if check_result else "unhealthy",
                    response_time_ms=response_time,
                    details={"result": check_result},
                    timestamp=datetime.utcnow()
                )
                
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                result = HealthCheckResult(
                    service_name=name,
                    status="unhealthy",
                    response_time_ms=response_time,
                    details={"error": str(e)},
                    timestamp=datetime.utcnow(),
                    error_message=str(e)
                )
                
                # Log health check failure
                self.logger.log_error(e, {"health_check": name})
            
            results[name] = result
            
            # Record health check metrics
            self.metrics.record_gauge(f"health_check.{name}.response_time_ms", 
                                    result.response_time_ms)
            self.metrics.record_gauge(f"health_check.{name}.status",
                                    1.0 if result.status == "healthy" else 0.0)
        
        return results
    
    def check_alert_conditions(self, metrics: Dict[str, Any]):
        """Check for alert conditions and trigger alerts"""
        current_time = datetime.utcnow()
        
        # Check response time alerts
        if "response_time_ms" in metrics:
            avg_response_time = metrics["response_time_ms"].get("avg", 0)
            if avg_response_time > self.alert_thresholds["response_time_ms"]:
                self._create_alert(
                    AlertSeverity.HIGH,
                    "High Response Time",
                    f"Average response time {avg_response_time:.1f}ms exceeds threshold {self.alert_thresholds['response_time_ms']}ms",
                    {"metric": "response_time_ms", "value": avg_response_time}
                )
        
        # Check system resource alerts
        system_cpu = metrics.get("system.cpu.percent", {}).get("latest", 0)
        if system_cpu > self.alert_thresholds["cpu_percent"]:
            self._create_alert(
                AlertSeverity.CRITICAL,
                "High CPU Usage",
                f"CPU usage {system_cpu:.1f}% exceeds threshold {self.alert_thresholds['cpu_percent']}%",
                {"metric": "cpu_percent", "value": system_cpu}
            )
        
        system_memory = metrics.get("system.memory.percent", {}).get("latest", 0)
        if system_memory > self.alert_thresholds["memory_percent"]:
            self._create_alert(
                AlertSeverity.CRITICAL,
                "High Memory Usage", 
                f"Memory usage {system_memory:.1f}% exceeds threshold {self.alert_thresholds['memory_percent']}%",
                {"metric": "memory_percent", "value": system_memory}
            )
    
    def _create_alert(self, severity: AlertSeverity, title: str, description: str, 
                     tags: Dict[str, str]):
        """Create and log an alert"""
        alert = AlertEvent(
            alert_id=str(uuid.uuid4()),
            severity=severity,
            title=title,
            description=description,
            timestamp=datetime.utcnow(),
            source="romai_agi_monitor",
            tags=tags
        )
        
        self.alert_history.append(alert)
        
        # Log alert
        self.logger.logger.warning(
            f"ALERT: {title}",
            extra={
                "event_type": "alert",
                "alert_id": alert.alert_id,
                "severity": severity.value,
                "title": title,
                "description": description,
                "tags": tags
            }
        )
        
        # Record alert metric
        self.metrics.record_counter(f"alerts.{severity.value}")
        
        return alert

class ProductionObservabilityManager:
    """
    Main production observability manager
    Coordinates logging, metrics, and health monitoring
    """
    
    def __init__(self):
        self.logger = ProductionLogger("romai_agi")
        self.metrics = MetricsCollector()
        self.health_monitor = HealthMonitor(self.logger, self.metrics)
        
        # Provide easy access aliases for external code
        self.production_logger = self.logger
        self.metrics_collector = self.metrics
        
        # Register default health checks
        self._register_default_health_checks()
        
        # Start monitoring loop
        self._start_monitoring_loop()
        
        self.logger.logger.info("Production observability system initialized")
    
    def _register_default_health_checks(self):
        """Register default health checks"""
        
        def check_server_alive():
            """Basic server alive check"""
            return True
        
        def check_memory_usage():
            """Check memory usage is reasonable"""
            memory = psutil.virtual_memory()
            return memory.percent < 90.0
        
        def check_disk_space():
            """Check disk space availability"""
            disk = psutil.disk_usage('/')
            return disk.percent < 90.0
        
        self.health_monitor.register_health_check("server_alive", check_server_alive)
        self.health_monitor.register_health_check("memory_usage", check_memory_usage)
        self.health_monitor.register_health_check("disk_space", check_disk_space)
    
    def _start_monitoring_loop(self):
        """Start background monitoring loop"""
        def monitoring_loop():
            while True:
                try:
                    # Run health checks every 60 seconds
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    
                    health_results = loop.run_until_complete(
                        self.health_monitor.run_health_checks()
                    )
                    
                    # Get aggregated metrics
                    metrics = self.metrics.get_aggregated_metrics(window_minutes=5)
                    
                    # Check for alert conditions
                    self.health_monitor.check_alert_conditions(metrics)
                    
                    # Log health summary
                    healthy_count = sum(1 for result in health_results.values() 
                                      if result.status == "healthy")
                    total_checks = len(health_results)
                    
                    self.logger.logger.info(
                        f"Health check summary: {healthy_count}/{total_checks} healthy",
                        extra={
                            "event_type": "health_summary",
                            "healthy_checks": healthy_count,
                            "total_checks": total_checks,
                            "health_percentage": (healthy_count / total_checks * 100) if total_checks > 0 else 0
                        }
                    )
                    
                    loop.close()
                    
                except Exception as e:
                    # Log monitoring errors but don't crash
                    self.logger.log_error(e, {"component": "monitoring_loop"})
                
                time.sleep(60)  # Run every minute
        
        thread = threading.Thread(target=monitoring_loop, daemon=True)
        thread.start()
    
    def get_production_dashboard_data(self) -> Dict[str, Any]:
        """Get data for production dashboard"""
        # Get recent metrics
        metrics = self.metrics.get_aggregated_metrics(window_minutes=15)
        
        # Get recent alerts
        recent_alerts = [
            asdict(alert) for alert in self.health_monitor.alert_history
            if alert.timestamp >= datetime.utcnow() - timedelta(hours=1)
        ]
        
        # System health summary
        system_metrics = self.metrics.get_system_metrics()
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "system_health": {
                "status": "healthy",  # Simplified for now
                "uptime_hours": time.time() // 3600,  # Approximate
                "system_metrics": system_metrics
            },
            "performance_metrics": metrics,
            "recent_alerts": recent_alerts,
            "alert_summary": {
                "total_alerts": len(self.health_monitor.alert_history),
                "recent_alerts": len(recent_alerts),
                "critical_alerts": len([a for a in recent_alerts if a.get("severity") == "critical"])
            }
        }

# Global production observability instance
production_monitor = None

def get_production_monitor() -> ProductionObservabilityManager:
    """Get or create global production monitor"""
    global production_monitor
    if production_monitor is None:
        production_monitor = ProductionObservabilityManager()
    return production_monitor

# Decorator for monitoring API endpoints
def monitor_endpoint(endpoint_name: str):
    """Decorator to monitor API endpoint performance"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            monitor = get_production_monitor()
            request_id = str(uuid.uuid4())
            start_time = time.time()
            
            # Log request start
            monitor.logger.log_request(
                request_id=request_id,
                method="POST",  # Assume POST for ML endpoints
                endpoint=endpoint_name
            )
            
            try:
                # Execute function
                result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
                
                # Calculate response time
                response_time_ms = (time.time() - start_time) * 1000
                
                # Log successful response
                monitor.logger.log_response(
                    request_id=request_id,
                    status_code=200,
                    response_time_ms=response_time_ms
                )
                
                # Record metrics
                monitor.metrics.record_counter(f"endpoint.{endpoint_name}.requests")
                monitor.metrics.record_histogram(f"endpoint.{endpoint_name}.response_time_ms", response_time_ms)
                monitor.metrics.record_counter(f"endpoint.{endpoint_name}.success")
                
                return result
                
            except Exception as e:
                # Calculate response time for error case
                response_time_ms = (time.time() - start_time) * 1000
                
                # Log error response
                monitor.logger.log_response(
                    request_id=request_id,
                    status_code=500,
                    response_time_ms=response_time_ms,
                    error=str(e)
                )
                
                # Log error details
                monitor.logger.log_error(e, {
                    "endpoint": endpoint_name,
                    "request_id": request_id
                })
                
                # Record error metrics
                monitor.metrics.record_counter(f"endpoint.{endpoint_name}.requests")
                monitor.metrics.record_counter(f"endpoint.{endpoint_name}.errors")
                monitor.metrics.record_histogram(f"endpoint.{endpoint_name}.response_time_ms", response_time_ms)
                
                raise
        
        return wrapper
    return decorator

# Export for use in other modules
__all__ = [
    'ProductionLogger',
    'MetricsCollector', 
    'HealthMonitor',
    'ProductionObservabilityManager',
    'get_production_monitor',
    'monitor_endpoint',
    'ProductionMetric',
    'HealthCheckResult',
    'AlertEvent',
    'LogLevel',
    'AlertSeverity'
]