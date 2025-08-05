"""
RomAI Performance Monitoring System
===================================

Comprehensive performance tracking and optimization utilities.
"""

import time
import psutil
import threading
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from collections import defaultdict, deque
import statistics

from .logging import get_logger
from .exceptions import PerformanceError, TimeoutError


@dataclass
class PerformanceMetrics:
    """Performance metrics data structure"""
    execution_time: float = 0.0
    memory_usage: float = 0.0  # MB
    cpu_usage: float = 0.0     # Percentage
    gpu_usage: float = 0.0     # Percentage (if available)
    throughput: float = 0.0    # Operations per second
    latency: float = 0.0       # Average response time
    error_rate: float = 0.0    # Percentage of errors
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'execution_time': self.execution_time,
            'memory_usage': self.memory_usage,
            'cpu_usage': self.cpu_usage,
            'gpu_usage': self.gpu_usage,
            'throughput': self.throughput,
            'latency': self.latency,
            'error_rate': self.error_rate,
            'timestamp': self.timestamp.isoformat()
        }


@dataclass
class PerformanceThresholds:
    """Performance warning and critical thresholds"""
    max_execution_time: float = 30.0      # seconds
    max_memory_usage: float = 1024.0      # MB
    max_cpu_usage: float = 80.0           # percentage
    max_gpu_usage: float = 90.0           # percentage
    min_throughput: float = 1.0           # operations/second
    max_latency: float = 1.0              # seconds
    max_error_rate: float = 5.0           # percentage


class PerformanceTimer:
    """Context manager for timing operations"""
    
    def __init__(self, name: str = "operation"):
        self.name = name
        self.start_time = None
        self.end_time = None
        self.execution_time = None
        self.logger = get_logger()
    
    def __enter__(self):
        self.start_time = time.perf_counter()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()
        self.execution_time = self.end_time - self.start_time
        self.logger.debug(f"{self.name} completed in {self.execution_time:.4f}s")


class ResourceMonitor:
    """Monitor system resource usage"""
    
    def __init__(self, sample_interval: float = 1.0):
        self.sample_interval = sample_interval
        self.monitoring = False
        self.metrics_history: List[PerformanceMetrics] = []
        self.monitor_thread = None
        self.logger = get_logger()
    
    def start_monitoring(self):
        """Start resource monitoring in background thread"""
        if self.monitoring:
            return
        
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        self.logger.info("Resource monitoring started")
    
    def stop_monitoring(self):
        """Stop resource monitoring"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5.0)
        self.logger.info("Resource monitoring stopped")
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.monitoring:
            try:
                metrics = self.get_current_metrics()
                self.metrics_history.append(metrics)
                
                # Keep only last 1000 samples
                if len(self.metrics_history) > 1000:
                    self.metrics_history = self.metrics_history[-1000:]
                
                time.sleep(self.sample_interval)
            except Exception as e:
                self.logger.error(f"Error in resource monitoring: {e}")
    
    def get_current_metrics(self) -> PerformanceMetrics:
        """Get current system metrics"""
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=None)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_mb = (memory.total - memory.available) / (1024 * 1024)
        
        # GPU usage (if available)
        gpu_usage = 0.0
        try:
            import GPUtil
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu_usage = gpus[0].load * 100
        except ImportError:
            pass
        
        return PerformanceMetrics(
            memory_usage=memory_mb,
            cpu_usage=cpu_percent,
            gpu_usage=gpu_usage,
            timestamp=datetime.now()
        )
    
    def get_average_metrics(self, duration_minutes: int = 5) -> Optional[PerformanceMetrics]:
        """Get average metrics over specified duration"""
        if not self.metrics_history:
            return None
        
        cutoff_time = datetime.now() - timedelta(minutes=duration_minutes)
        recent_metrics = [m for m in self.metrics_history if m.timestamp >= cutoff_time]
        
        if not recent_metrics:
            return None
        
        return PerformanceMetrics(
            memory_usage=statistics.mean(m.memory_usage for m in recent_metrics),
            cpu_usage=statistics.mean(m.cpu_usage for m in recent_metrics),
            gpu_usage=statistics.mean(m.gpu_usage for m in recent_metrics),
            timestamp=datetime.now()
        )


class PerformanceProfiler:
    """Comprehensive performance profiler"""
    
    def __init__(self, thresholds: Optional[PerformanceThresholds] = None):
        self.thresholds = thresholds or PerformanceThresholds()
        self.timers: Dict[str, List[float]] = defaultdict(list)
        self.counters: Dict[str, int] = defaultdict(int)
        self.errors: Dict[str, int] = defaultdict(int)
        self.resource_monitor = ResourceMonitor()
        self.logger = get_logger()
        
        # Start resource monitoring
        self.resource_monitor.start_monitoring()
    
    def __del__(self):
        """Cleanup when profiler is destroyed"""
        try:
            self.resource_monitor.stop_monitoring()
        except:
            pass
    
    @contextmanager
    def profile(self, operation_name: str):
        """Profile an operation"""
        start_time = time.perf_counter()
        start_memory = psutil.virtual_memory().used / (1024 * 1024)
        
        try:
            yield
            self.counters[operation_name] += 1
        except Exception as e:
            self.errors[operation_name] += 1
            self.logger.error(f"Error in {operation_name}: {e}")
            raise
        finally:
            end_time = time.perf_counter()
            execution_time = end_time - start_time
            
            self.timers[operation_name].append(execution_time)
            
            # Check thresholds
            self._check_thresholds(operation_name, execution_time)
    
    def _check_thresholds(self, operation_name: str, execution_time: float):
        """Check if metrics exceed thresholds"""
        if execution_time > self.thresholds.max_execution_time:
            self.logger.warning(
                f"Operation {operation_name} exceeded execution time threshold: "
                f"{execution_time:.2f}s > {self.thresholds.max_execution_time}s"
            )
        
        # Check memory usage
        current_memory = psutil.virtual_memory().used / (1024 * 1024)
        if current_memory > self.thresholds.max_memory_usage:
            self.logger.warning(
                f"Memory usage exceeded threshold: "
                f"{current_memory:.2f}MB > {self.thresholds.max_memory_usage}MB"
            )
    
    def get_operation_stats(self, operation_name: str) -> Dict[str, Any]:
        """Get statistics for a specific operation"""
        timings = self.timers.get(operation_name, [])
        if not timings:
            return {"error": "No data available"}
        
        return {
            "operation": operation_name,
            "total_calls": self.counters[operation_name],
            "total_errors": self.errors[operation_name],
            "error_rate": (self.errors[operation_name] / self.counters[operation_name]) * 100,
            "avg_time": statistics.mean(timings),
            "min_time": min(timings),
            "max_time": max(timings),
            "median_time": statistics.median(timings),
            "total_time": sum(timings)
        }
    
    def get_all_stats(self) -> Dict[str, Any]:
        """Get statistics for all operations"""
        stats = {}
        for operation in self.timers.keys():
            stats[operation] = self.get_operation_stats(operation)
        
        # Add system metrics
        system_metrics = self.resource_monitor.get_average_metrics()
        if system_metrics:
            stats["system"] = system_metrics.to_dict()
        
        return stats
    
    def reset_stats(self):
        """Reset all statistics"""
        self.timers.clear()
        self.counters.clear()
        self.errors.clear()
        self.resource_monitor.metrics_history.clear()
        self.logger.info("Performance statistics reset")


class LatencyTracker:
    """Track latency for operations"""
    
    def __init__(self, max_samples: int = 1000):
        self.max_samples = max_samples
        self.latencies: deque = deque(maxlen=max_samples)
        self.operation_latencies: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_samples))
    
    def record_latency(self, latency: float, operation: Optional[str] = None):
        """Record a latency measurement"""
        self.latencies.append(latency)
        if operation:
            self.operation_latencies[operation].append(latency)
    
    def get_percentiles(self, operation: Optional[str] = None) -> Dict[str, float]:
        """Get latency percentiles"""
        if operation:
            data = list(self.operation_latencies.get(operation, []))
        else:
            data = list(self.latencies)
        
        if not data:
            return {}
        
        sorted_data = sorted(data)
        n = len(sorted_data)
        
        return {
            "p50": sorted_data[int(n * 0.5)],
            "p90": sorted_data[int(n * 0.9)],
            "p95": sorted_data[int(n * 0.95)],
            "p99": sorted_data[int(n * 0.99)],
            "min": min(sorted_data),
            "max": max(sorted_data),
            "avg": statistics.mean(sorted_data)
        }


class ThroughputCounter:
    """Track throughput (operations per second)"""
    
    def __init__(self, window_size: int = 60):
        self.window_size = window_size
        self.timestamps: deque = deque(maxlen=window_size)
        self.operation_timestamps: Dict[str, deque] = defaultdict(lambda: deque(maxlen=window_size))
    
    def increment(self, operation: Optional[str] = None):
        """Increment operation counter"""
        now = time.time()
        self.timestamps.append(now)
        if operation:
            self.operation_timestamps[operation].append(now)
    
    def get_throughput(self, operation: Optional[str] = None) -> float:
        """Get current throughput (ops/second)"""
        if operation:
            timestamps = self.operation_timestamps.get(operation, deque())
        else:
            timestamps = self.timestamps
        
        if len(timestamps) < 2:
            return 0.0
        
        time_span = timestamps[-1] - timestamps[0]
        if time_span == 0:
            return 0.0
        
        return len(timestamps) / time_span


# Global performance profiler instance
_global_profiler: Optional[PerformanceProfiler] = None


def get_profiler() -> PerformanceProfiler:
    """Get the global performance profiler"""
    global _global_profiler
    if _global_profiler is None:
        _global_profiler = PerformanceProfiler()
    return _global_profiler


def profile_operation(name: str):
    """Decorator for profiling operations"""
    def decorator(func: Callable) -> Callable:
        def wrapper(*args, **kwargs):
            with get_profiler().profile(name):
                return func(*args, **kwargs)
        return wrapper
    return decorator


@contextmanager
def timeout(seconds: float):
    """Context manager for operation timeout"""
    def timeout_handler():
        raise TimeoutError(f"Operation timed out after {seconds} seconds")
    
    timer = threading.Timer(seconds, timeout_handler)
    timer.start()
    try:
        yield
    finally:
        timer.cancel()


# Convenience functions
def get_performance_stats() -> Dict[str, Any]:
    """Get all performance statistics"""
    return get_profiler().get_all_stats()


def reset_performance_stats():
    """Reset all performance statistics"""
    get_profiler().reset_stats()


def check_performance_health() -> bool:
    """Check if system performance is healthy"""
    profiler = get_profiler()
    current_metrics = profiler.resource_monitor.get_current_metrics()
    
    thresholds = profiler.thresholds
    
    if current_metrics.memory_usage > thresholds.max_memory_usage:
        return False
    
    if current_metrics.cpu_usage > thresholds.max_cpu_usage:
        return False
    
    return True
