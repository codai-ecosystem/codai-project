"""
Metrics collection and analysis utilities for RomAI system.

Provides comprehensive metrics collection, analysis, and reporting capabilities.
"""

import time
import statistics
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union, Callable
from enum import Enum
import threading
import json


class MetricType(Enum):
    """Types of metrics that can be collected."""
    COUNTER = "counter"
    GAUGE = "gauge" 
    HISTOGRAM = "histogram"
    TIMER = "timer"
    RATE = "rate"


@dataclass
class MetricValue:
    """Individual metric measurement."""
    value: Union[int, float]
    timestamp: float
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass 
class MetricSummary:
    """Statistical summary of metric values."""
    name: str
    metric_type: MetricType
    count: int
    total: Union[int, float]
    average: float
    minimum: Union[int, float]
    maximum: Union[int, float]
    median: float
    percentile_95: float
    percentile_99: float
    rate_per_second: float
    last_updated: float


class MetricsCollector:
    """Thread-safe metrics collection system."""
    
    def __init__(self, max_values_per_metric: int = 10000):
        self._metrics: Dict[str, Dict[str, Any]] = defaultdict(dict)
        self._values: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_values_per_metric))
        self._lock = threading.RLock()
        self._start_time = time.time()
    
    def increment(self, metric_name: str, value: Union[int, float] = 1, 
                  **metadata) -> None:
        """Increment a counter metric."""
        with self._lock:
            if metric_name not in self._metrics:
                self._metrics[metric_name] = {
                    'type': MetricType.COUNTER,
                    'value': 0,
                    'created_at': time.time()
                }
            
            self._metrics[metric_name]['value'] += value
            self._metrics[metric_name]['last_updated'] = time.time()
            
            # Store individual measurement
            self._values[metric_name].append(MetricValue(
                value=value,
                timestamp=time.time(),
                metadata=metadata
            ))
    
    def set_gauge(self, metric_name: str, value: Union[int, float], 
                  **metadata) -> None:
        """Set a gauge metric value."""
        with self._lock:
            self._metrics[metric_name] = {
                'type': MetricType.GAUGE,
                'value': value,
                'last_updated': time.time(),
                'created_at': self._metrics.get(metric_name, {}).get('created_at', time.time())
            }
            
            # Store individual measurement
            self._values[metric_name].append(MetricValue(
                value=value,
                timestamp=time.time(),
                metadata=metadata
            ))
    
    def record_time(self, metric_name: str, duration: float, 
                   **metadata) -> None:
        """Record a timing measurement."""
        with self._lock:
            if metric_name not in self._metrics:
                self._metrics[metric_name] = {
                    'type': MetricType.TIMER,
                    'total_time': 0,
                    'count': 0,
                    'min_time': float('inf'),
                    'max_time': 0,
                    'created_at': time.time()
                }
            
            metric = self._metrics[metric_name]
            metric['total_time'] += duration
            metric['count'] += 1
            metric['min_time'] = min(metric['min_time'], duration)
            metric['max_time'] = max(metric['max_time'], duration)
            metric['avg_time'] = metric['total_time'] / metric['count']
            metric['last_updated'] = time.time()
            
            # Store individual measurement
            self._values[metric_name].append(MetricValue(
                value=duration,
                timestamp=time.time(),
                metadata=metadata
            ))
    
    def record_histogram(self, metric_name: str, value: Union[int, float],
                        **metadata) -> None:
        """Record a value for histogram analysis."""
        with self._lock:
            if metric_name not in self._metrics:
                self._metrics[metric_name] = {
                    'type': MetricType.HISTOGRAM,
                    'count': 0,
                    'sum': 0,
                    'created_at': time.time()
                }
            
            metric = self._metrics[metric_name]
            metric['count'] += 1
            metric['sum'] += value
            metric['last_updated'] = time.time()
            
            # Store individual measurement
            self._values[metric_name].append(MetricValue(
                value=value,
                timestamp=time.time(),
                metadata=metadata
            ))
    
    def get_metric(self, metric_name: str) -> Optional[Dict[str, Any]]:
        """Get current metric data."""
        with self._lock:
            return self._metrics.get(metric_name, {}).copy()
    
    def get_metric_summary(self, metric_name: str) -> Optional[MetricSummary]:
        """Get statistical summary of a metric."""
        with self._lock:
            if metric_name not in self._metrics:
                return None
            
            metric = self._metrics[metric_name]
            values = [v.value for v in self._values[metric_name]]
            
            if not values:
                return None
            
            # Calculate statistics
            count = len(values)
            total = sum(values)
            average = total / count
            minimum = min(values)
            maximum = max(values)
            median = statistics.median(values)
            
            # Percentiles
            sorted_values = sorted(values)
            percentile_95 = sorted_values[int(0.95 * len(sorted_values))] if sorted_values else 0
            percentile_99 = sorted_values[int(0.99 * len(sorted_values))] if sorted_values else 0
            
            # Rate calculation
            time_span = time.time() - metric.get('created_at', time.time())
            rate_per_second = count / time_span if time_span > 0 else 0
            
            return MetricSummary(
                name=metric_name,
                metric_type=metric['type'],
                count=count,
                total=total,
                average=average,
                minimum=minimum,
                maximum=maximum,
                median=median,
                percentile_95=percentile_95,
                percentile_99=percentile_99,
                rate_per_second=rate_per_second,
                last_updated=metric.get('last_updated', 0)
            )
    
    def get_all_metrics(self) -> Dict[str, Dict[str, Any]]:
        """Get all current metrics."""
        with self._lock:
            return {name: metric.copy() for name, metric in self._metrics.items()}
    
    def get_all_summaries(self) -> Dict[str, MetricSummary]:
        """Get summaries for all metrics."""
        summaries = {}
        for metric_name in self._metrics.keys():
            summary = self.get_metric_summary(metric_name)
            if summary:
                summaries[metric_name] = summary
        return summaries
    
    def reset_metric(self, metric_name: str) -> None:
        """Reset a specific metric."""
        with self._lock:
            if metric_name in self._metrics:
                del self._metrics[metric_name]
            if metric_name in self._values:
                self._values[metric_name].clear()
    
    def reset_all_metrics(self) -> None:
        """Reset all metrics."""
        with self._lock:
            self._metrics.clear()
            self._values.clear()
    
    def export_metrics(self) -> Dict[str, Any]:
        """Export all metrics in a serializable format."""
        with self._lock:
            return {
                'timestamp': time.time(),
                'uptime': time.time() - self._start_time,
                'metrics': self.get_all_metrics(),
                'summaries': {
                    name: {
                        'name': summary.name,
                        'type': summary.metric_type.value,
                        'count': summary.count,
                        'total': summary.total,
                        'average': summary.average,
                        'minimum': summary.minimum,
                        'maximum': summary.maximum,
                        'median': summary.median,
                        'percentile_95': summary.percentile_95,
                        'percentile_99': summary.percentile_99,
                        'rate_per_second': summary.rate_per_second,
                        'last_updated': summary.last_updated
                    }
                    for name, summary in self.get_all_summaries().items()
                }
            }


class PerformanceProfiler:
    """Profiler for analyzing system performance."""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
        self._active_timers: Dict[str, float] = {}
        self._lock = threading.RLock()
    
    def start_timer(self, operation: str) -> None:
        """Start timing an operation."""
        with self._lock:
            self._active_timers[operation] = time.perf_counter()
    
    def end_timer(self, operation: str, **metadata) -> Optional[float]:
        """End timing an operation and record the duration."""
        with self._lock:
            start_time = self._active_timers.pop(operation, None)
            if start_time is None:
                return None
            
            duration = time.perf_counter() - start_time
            self.metrics.record_time(f"operation.{operation}.duration", duration, **metadata)
            return duration
    
    def time_function(self, func: Callable, *args, **kwargs) -> tuple:
        """Time a function execution and return result with duration."""
        operation = f"{func.__module__}.{func.__name__}"
        start_time = time.perf_counter()
        
        try:
            result = func(*args, **kwargs)
            success = True
            error = None
        except Exception as e:
            result = None
            success = False
            error = str(e)
            raise
        finally:
            duration = time.perf_counter() - start_time
            self.metrics.record_time(
                f"function.{operation}.duration",
                duration,
                success=success,
                error=error
            )
        
        return result, duration


class SystemMetricsCollector:
    """Collector for system-level metrics."""
    
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
    
    def collect_memory_usage(self) -> None:
        """Collect memory usage metrics."""
        try:
            import psutil
            process = psutil.Process()
            
            # Memory info
            memory_info = process.memory_info()
            self.metrics.set_gauge("system.memory.rss", memory_info.rss)
            self.metrics.set_gauge("system.memory.vms", memory_info.vms)
            
            # Memory percentage
            memory_percent = process.memory_percent()
            self.metrics.set_gauge("system.memory.percent", memory_percent)
            
            # System memory
            system_memory = psutil.virtual_memory()
            self.metrics.set_gauge("system.memory.available", system_memory.available)
            self.metrics.set_gauge("system.memory.used", system_memory.used)
            self.metrics.set_gauge("system.memory.percent_total", system_memory.percent)
            
        except ImportError:
            # psutil not available
            pass
    
    def collect_cpu_usage(self) -> None:
        """Collect CPU usage metrics."""
        try:
            import psutil
            
            # CPU percentage
            cpu_percent = psutil.cpu_percent(interval=None)
            self.metrics.set_gauge("system.cpu.percent", cpu_percent)
            
            # CPU count
            self.metrics.set_gauge("system.cpu.count", psutil.cpu_count())
            
            # Load average (Unix-like systems)
            try:
                load_avg = psutil.getloadavg()
                self.metrics.set_gauge("system.cpu.load_avg_1m", load_avg[0])
                self.metrics.set_gauge("system.cpu.load_avg_5m", load_avg[1])
                self.metrics.set_gauge("system.cpu.load_avg_15m", load_avg[2])
            except (AttributeError, OSError):
                # Not available on Windows
                pass
                
        except ImportError:
            # psutil not available
            pass
    
    def collect_all_system_metrics(self) -> None:
        """Collect all available system metrics."""
        self.collect_memory_usage()
        self.collect_cpu_usage()


class ApplicationMetrics:
    """High-level application metrics for RomAI system."""
    
    def __init__(self):
        self.collector = MetricsCollector()
        self.profiler = PerformanceProfiler(self.collector)
        self.system_collector = SystemMetricsCollector(self.collector)
    
    # Request metrics
    def record_request(self, endpoint: str, method: str, status_code: int, 
                      duration: float, **metadata) -> None:
        """Record API request metrics."""
        self.collector.increment(f"requests.total", endpoint=endpoint, method=method)
        self.collector.increment(f"requests.{status_code}", endpoint=endpoint)
        self.collector.record_time(f"requests.duration", duration, 
                                 endpoint=endpoint, method=method, status=status_code)
        
        # Success/error rates
        if 200 <= status_code < 400:
            self.collector.increment("requests.success", endpoint=endpoint)
        else:
            self.collector.increment("requests.error", endpoint=endpoint)
    
    # Engine metrics
    def record_engine_operation(self, engine_name: str, operation: str, 
                               duration: float, success: bool, **metadata) -> None:
        """Record reasoning engine operation metrics."""
        self.collector.increment(f"engine.{engine_name}.operations.total")
        self.collector.record_time(f"engine.{engine_name}.duration", duration, 
                                 operation=operation, success=success)
        
        if success:
            self.collector.increment(f"engine.{engine_name}.operations.success")
        else:
            self.collector.increment(f"engine.{engine_name}.operations.error")
    
    # Business metrics
    def record_problem_solved(self, problem_type: str, difficulty: str, 
                             confidence: float, **metadata) -> None:
        """Record problem-solving metrics."""
        self.collector.increment("problems.solved.total", 
                               problem_type=problem_type, difficulty=difficulty)
        self.collector.record_histogram("problems.confidence", confidence,
                                       problem_type=problem_type)
    
    def record_user_interaction(self, interaction_type: str, user_id: Optional[str] = None,
                               **metadata) -> None:
        """Record user interaction metrics."""
        self.collector.increment(f"interactions.{interaction_type}")
        if user_id:
            self.collector.increment("users.active", user_id=user_id)
    
    # Health metrics
    def update_health_status(self, component: str, status: str) -> None:
        """Update component health status."""
        health_value = 1 if status == "healthy" else 0
        self.collector.set_gauge(f"health.{component}", health_value, status=status)
    
    def get_health_dashboard(self) -> Dict[str, Any]:
        """Get health dashboard data."""
        summaries = self.collector.get_all_summaries()
        
        # Calculate overall health score
        health_metrics = {name: summary for name, summary in summaries.items() 
                         if name.startswith("health.")}
        
        if health_metrics:
            healthy_components = sum(1 for summary in health_metrics.values() 
                                   if summary.average > 0.8)
            health_score = healthy_components / len(health_metrics)
        else:
            health_score = 1.0
        
        return {
            'health_score': health_score,
            'component_count': len(health_metrics),
            'healthy_components': sum(1 for summary in health_metrics.values() 
                                    if summary.average > 0.8),
            'components': {name.replace('health.', ''): summary.average 
                          for name, summary in health_metrics.items()},
            'timestamp': time.time()
        }
    
    def get_performance_dashboard(self) -> Dict[str, Any]:
        """Get performance dashboard data."""
        summaries = self.collector.get_all_summaries()
        
        # Request performance
        request_metrics = {name: summary for name, summary in summaries.items() 
                          if name.startswith("requests.")}
        
        # Engine performance
        engine_metrics = {name: summary for name, summary in summaries.items() 
                         if name.startswith("engine.")}
        
        return {
            'requests': {
                'total_requests': request_metrics.get('requests.total', MetricSummary(
                    '', MetricType.COUNTER, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).count,
                'success_rate': self._calculate_success_rate(request_metrics),
                'avg_response_time': request_metrics.get('requests.duration', MetricSummary(
                    '', MetricType.TIMER, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).average,
                'requests_per_second': request_metrics.get('requests.total', MetricSummary(
                    '', MetricType.COUNTER, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).rate_per_second
            },
            'engines': {
                name.replace('engine.', '').split('.')[0]: {
                    'operations': summary.count,
                    'avg_duration': summary.average,
                    'success_rate': self._calculate_engine_success_rate(name, summaries)
                }
                for name, summary in engine_metrics.items()
                if '.operations.total' in name
            },
            'timestamp': time.time()
        }
    
    def _calculate_success_rate(self, request_metrics: Dict[str, MetricSummary]) -> float:
        """Calculate request success rate."""
        success_count = request_metrics.get('requests.success', MetricSummary(
            '', MetricType.COUNTER, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).count
        total_count = request_metrics.get('requests.total', MetricSummary(
            '', MetricType.COUNTER, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).count
        
        return success_count / total_count if total_count > 0 else 1.0
    
    def _calculate_engine_success_rate(self, engine_prefix: str, 
                                     summaries: Dict[str, MetricSummary]) -> float:
        """Calculate engine success rate."""
        base_name = engine_prefix.replace('.operations.total', '')
        success_count = summaries.get(f'{base_name}.operations.success', MetricSummary(
            '', MetricType.COUNTER, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).count
        total_count = summaries.get(f'{base_name}.operations.total', MetricSummary(
            '', MetricType.COUNTER, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)).count
        
        return success_count / total_count if total_count > 0 else 1.0


# Global application metrics instance
app_metrics = ApplicationMetrics()