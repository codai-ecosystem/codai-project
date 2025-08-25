"""
Real Performance Monitor
Eliminates ALL hardcoded performance metrics with genuine system monitoring
Production-ready performance tracking for RomAI AGI Platform
"""

import asyncio
import psutil
import time
import logging
from typing import Dict, List, Optional, Any, NamedTuple
from dataclasses import dataclass, asdict
from datetime import datetime, timezone, timedelta
from enum import Enum
import json
import aiohttp
import os
from pathlib import Path
import threading
from collections import deque, defaultdict
import statistics

# Remove circular import - we'll import at runtime if needed
# from ..real_database import (
#     RealDatabaseManager, RealDatabaseOperations, 
#     real_api_manager, real_performance_monitor
# )


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerformanceMetricType(Enum):
    """Real performance metric types"""
    CPU_USAGE = "cpu_usage_percent"
    MEMORY_USAGE = "memory_usage_percent"
    DISK_USAGE = "disk_usage_percent"
    NETWORK_IO = "network_io_bytes"
    RESPONSE_TIME = "response_time_ms"
    REQUEST_COUNT = "request_count"
    ERROR_RATE = "error_rate_percent"
    UPTIME = "uptime_seconds"
    CONCURRENT_USERS = "concurrent_users"
    DATABASE_CONNECTIONS = "database_connections"
    CACHE_HIT_RATE = "cache_hit_rate_percent"
    THROUGHPUT = "throughput_requests_per_second"

class ServiceHealth(Enum):
    """Real service health statuses"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

@dataclass
class RealMetric:
    """Real performance metric data structure"""
    name: str
    type: PerformanceMetricType
    value: float
    unit: str
    timestamp: datetime
    component: str
    collection_method: str
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization"""
        return {
            'name': self.name,
            'type': self.type.value,
            'value': self.value,
            'unit': self.unit,
            'timestamp': self.timestamp.isoformat(),
            'component': self.component,
            'collection_method': self.collection_method,
            'metadata': self.metadata or {}
        }

@dataclass
class SystemResourceMetrics:
    """Real system resource metrics"""
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_bytes_sent: int
    network_bytes_recv: int
    process_count: int
    load_average: List[float]
    timestamp: datetime

class RealSystemMonitor:
    """
    Real System Monitor - NO MOCK DATA
    Collects genuine system performance metrics
    """
    
    def __init__(self, collection_interval: float = 1.0):
        self.collection_interval = collection_interval
        self.is_monitoring = False
        self.metrics_buffer = deque(maxlen=1000)  # Keep last 1000 metrics
        self.start_time = time.time()
        self._monitoring_task: Optional[asyncio.Task] = None
        
    def get_real_cpu_usage(self) -> float:
        """Get real CPU usage percentage"""
        return psutil.cpu_percent(interval=0.1)
    
    def get_real_memory_usage(self) -> Dict[str, float]:
        """Get real memory usage statistics"""
        memory = psutil.virtual_memory()
        return {
            'total': memory.total / (1024**3),  # GB
            'available': memory.available / (1024**3),  # GB
            'used': memory.used / (1024**3),  # GB
            'percent': memory.percent
        }
    
    def get_real_disk_usage(self, path: str = '/') -> Dict[str, float]:
        """Get real disk usage statistics"""
        # For Windows, use C: drive
        if os.name == 'nt':
            path = 'C:\\'
        
        disk = psutil.disk_usage(path)
        return {
            'total': disk.total / (1024**3),  # GB
            'used': disk.used / (1024**3),  # GB
            'free': disk.free / (1024**3),  # GB
            'percent': (disk.used / disk.total) * 100
        }
    
    def get_real_network_io(self) -> Dict[str, int]:
        """Get real network I/O statistics"""
        network = psutil.net_io_counters()
        return {
            'bytes_sent': network.bytes_sent,
            'bytes_recv': network.bytes_recv,
            'packets_sent': network.packets_sent,
            'packets_recv': network.packets_recv
        }
    
    def get_real_process_metrics(self) -> Dict[str, Any]:
        """Get real process-specific metrics"""
        current_process = psutil.Process()
        
        with current_process.oneshot():
            return {
                'pid': current_process.pid,
                'cpu_percent': current_process.cpu_percent(),
                'memory_percent': current_process.memory_percent(),
                'memory_info': current_process.memory_info()._asdict(),
                'num_threads': current_process.num_threads(),
                'connections': len(current_process.connections()),
                'open_files': len(current_process.open_files()),
                'create_time': current_process.create_time()
            }
    
    def get_real_load_average(self) -> List[float]:
        """Get real system load average"""
        if hasattr(os, 'getloadavg'):
            return list(os.getloadavg())
        else:
            # Windows doesn't have load average, use CPU count as approximation
            cpu_count = psutil.cpu_count()
            cpu_usage = psutil.cpu_percent(interval=0.1)
            load_estimate = (cpu_usage / 100) * cpu_count
            return [load_estimate, load_estimate, load_estimate]
    
    def collect_real_system_metrics(self) -> SystemResourceMetrics:
        """Collect comprehensive real system metrics"""
        cpu_percent = self.get_real_cpu_usage()
        memory_stats = self.get_real_memory_usage()
        disk_stats = self.get_real_disk_usage()
        network_stats = self.get_real_network_io()
        load_avg = self.get_real_load_average()
        
        return SystemResourceMetrics(
            cpu_percent=cpu_percent,
            memory_percent=memory_stats['percent'],
            disk_percent=disk_stats['percent'],
            network_bytes_sent=network_stats['bytes_sent'],
            network_bytes_recv=network_stats['bytes_recv'],
            process_count=len(psutil.pids()),
            load_average=load_avg,
            timestamp=datetime.now(timezone.utc)
        )
    
    async def start_monitoring(self):
        """Start real system monitoring"""
        if self.is_monitoring:
            logger.warning("System monitoring already running")
            return
        
        self.is_monitoring = True
        self._monitoring_task = asyncio.create_task(self._monitoring_loop())
        logger.info("✅ Real system monitoring started")
    
    async def stop_monitoring(self):
        """Stop real system monitoring"""
        self.is_monitoring = False
        if self._monitoring_task:
            self._monitoring_task.cancel()
            try:
                await self._monitoring_task
            except asyncio.CancelledError:
                pass
        logger.info("✅ Real system monitoring stopped")
    
    async def _monitoring_loop(self):
        """Real monitoring loop - continuously collects metrics"""
        while self.is_monitoring:
            try:
                # Collect real system metrics
                system_metrics = self.collect_real_system_metrics()
                
                # Convert to RealMetric objects
                metrics = [
                    RealMetric(
                        name="cpu_usage",
                        type=PerformanceMetricType.CPU_USAGE,
                        value=system_metrics.cpu_percent,
                        unit="percent",
                        timestamp=system_metrics.timestamp,
                        component="system",
                        collection_method="psutil"
                    ),
                    RealMetric(
                        name="memory_usage",
                        type=PerformanceMetricType.MEMORY_USAGE,
                        value=system_metrics.memory_percent,
                        unit="percent",
                        timestamp=system_metrics.timestamp,
                        component="system",
                        collection_method="psutil"
                    ),
                    RealMetric(
                        name="disk_usage",
                        type=PerformanceMetricType.DISK_USAGE,
                        value=system_metrics.disk_percent,
                        unit="percent",
                        timestamp=system_metrics.timestamp,
                        component="system",
                        collection_method="psutil"
                    )
                ]
                
                # Add metrics to buffer
                for metric in metrics:
                    self.metrics_buffer.append(metric)
                
                await asyncio.sleep(self.collection_interval)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(self.collection_interval)
    
    def get_recent_metrics(self, minutes: int = 5) -> List[RealMetric]:
        """Get real metrics from the last N minutes"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        return [metric for metric in self.metrics_buffer if metric.timestamp >= cutoff_time]
    
    def get_uptime_seconds(self) -> float:
        """Get real system uptime in seconds"""
        return time.time() - self.start_time

class RealAPIMonitor:
    """
    Real API Performance Monitor - NO MOCK DATA
    Monitors actual API response times and success rates
    """
    
    def __init__(self):
        self.request_metrics = deque(maxlen=10000)  # Keep last 10k requests
        self.response_times = defaultdict(list)  # Response times by endpoint
        self.error_counts = defaultdict(int)  # Error counts by endpoint
        self.success_counts = defaultdict(int)  # Success counts by endpoint
    
    def record_real_request(
        self,
        endpoint: str,
        method: str,
        response_time_ms: int,
        status_code: int,
        user_agent: str = None
    ):
        """Record real API request metrics"""
        timestamp = datetime.now(timezone.utc)
        
        # Record response time
        self.response_times[endpoint].append(response_time_ms)
        # Keep only last 1000 response times per endpoint
        if len(self.response_times[endpoint]) > 1000:
            self.response_times[endpoint] = self.response_times[endpoint][-1000:]
        
        # Count success/error
        if 200 <= status_code < 400:
            self.success_counts[endpoint] += 1
        else:
            self.error_counts[endpoint] += 1
        
        # Store detailed metric
        metric = RealMetric(
            name=f"api_request_{endpoint.replace('/', '_')}",
            type=PerformanceMetricType.RESPONSE_TIME,
            value=response_time_ms,
            unit="milliseconds",
            timestamp=timestamp,
            component="api",
            collection_method="request_tracking",
            metadata={
                'endpoint': endpoint,
                'method': method,
                'status_code': status_code,
                'user_agent': user_agent
            }
        )
        
        self.request_metrics.append(metric)
    
    def get_real_api_stats(self, endpoint: str = None) -> Dict[str, Any]:
        """Get real API performance statistics"""
        if endpoint:
            endpoints = [endpoint]
        else:
            endpoints = list(set(self.response_times.keys()) | set(self.error_counts.keys()) | set(self.success_counts.keys()))
        
        stats = {}
        
        for ep in endpoints:
            response_times = self.response_times.get(ep, [])
            success_count = self.success_counts.get(ep, 0)
            error_count = self.error_counts.get(ep, 0)
            total_requests = success_count + error_count
            
            if response_times:
                avg_response_time = statistics.mean(response_times)
                median_response_time = statistics.median(response_times)
                p95_response_time = statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max(response_times)
            else:
                avg_response_time = median_response_time = p95_response_time = 0
            
            error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0
            
            stats[ep] = {
                'total_requests': total_requests,
                'success_count': success_count,
                'error_count': error_count,
                'error_rate_percent': error_rate,
                'avg_response_time_ms': avg_response_time,
                'median_response_time_ms': median_response_time,
                'p95_response_time_ms': p95_response_time,
                'requests_per_minute': len([r for r in response_times if time.time() - time.mktime(r) < 60]) if response_times else 0
            }
        
        return stats

class RealServiceHealthChecker:
    """
    Real Service Health Checker - NO MOCK DATA
    Performs actual health checks on services
    """
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.health_endpoints = {
            'romai_agi': 'http://localhost:6101/health',
            'enterprise_api': 'http://localhost:8001/api/v1/health',
            'memorai_mcp': 'http://localhost:4950/health',
            'cbd_database': 'http://localhost:4180/health',
            'memorai_app': 'http://localhost:4006/api/health',
            'memorai_graphql': 'http://localhost:4500/health'
        }
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=10)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def check_real_service_health(self, service_name: str, endpoint: str) -> Dict[str, Any]:
        """Check real service health"""
        start_time = time.time()
        
        try:
            async with self.session.get(endpoint) as response:
                response_time_ms = int((time.time() - start_time) * 1000)
                
                if response.status == 200:
                    try:
                        health_data = await response.json()
                        return {
                            'service_name': service_name,
                            'status': ServiceHealth.HEALTHY.value,
                            'response_time_ms': response_time_ms,
                            'details': health_data,
                            'last_check': datetime.now(timezone.utc).isoformat()
                        }
                    except:
                        return {
                            'service_name': service_name,
                            'status': ServiceHealth.HEALTHY.value,
                            'response_time_ms': response_time_ms,
                            'details': {'raw_response': await response.text()},
                            'last_check': datetime.now(timezone.utc).isoformat()
                        }
                else:
                    return {
                        'service_name': service_name,
                        'status': ServiceHealth.DEGRADED.value,
                        'response_time_ms': response_time_ms,
                        'error': f"HTTP {response.status}",
                        'last_check': datetime.now(timezone.utc).isoformat()
                    }
                    
        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            return {
                'service_name': service_name,
                'status': ServiceHealth.UNHEALTHY.value,
                'response_time_ms': response_time_ms,
                'error': str(e),
                'last_check': datetime.now(timezone.utc).isoformat()
            }
    
    async def check_all_real_services(self) -> Dict[str, Dict[str, Any]]:
        """Check all real service health statuses"""
        health_results = {}
        
        for service_name, endpoint in self.health_endpoints.items():
            health_results[service_name] = await self.check_real_service_health(service_name, endpoint)
        
        return health_results

class RealPerformanceMonitor:
    """
    Real Performance Monitor - NO MOCK DATA
    Comprehensive real performance monitoring for RomAI AGI
    """
    
    def __init__(self):
        self.system_monitor = RealSystemMonitor()
        self.api_monitor = RealAPIMonitor()
        self.health_checker = RealServiceHealthChecker()
        self.metrics_history = deque(maxlen=100000)  # Keep last 100k metrics
        self.is_running = False
        self._monitoring_task: Optional[asyncio.Task] = None
    
    async def start_real_monitoring(self):
        """Start comprehensive real monitoring"""
        if self.is_running:
            logger.warning("Performance monitoring already running")
            return
        
        self.is_running = True
        await self.system_monitor.start_monitoring()
        self._monitoring_task = asyncio.create_task(self._comprehensive_monitoring_loop())
        logger.info("✅ Real performance monitoring started")
    
    async def stop_real_monitoring(self):
        """Stop comprehensive real monitoring"""
        self.is_running = False
        await self.system_monitor.stop_monitoring()
        
        if self._monitoring_task:
            self._monitoring_task.cancel()
            try:
                await self._monitoring_task
            except asyncio.CancelledError:
                pass
        
        logger.info("✅ Real performance monitoring stopped")
    
    async def _comprehensive_monitoring_loop(self):
        """Comprehensive monitoring loop"""
        while self.is_running:
            try:
                # Collect real service health
                async with self.health_checker:
                    health_data = await self.health_checker.check_all_real_services()
                
                # Store health metrics
                for service_name, health_info in health_data.items():
                    metric = RealMetric(
                        name=f"service_health_{service_name}",
                        type=PerformanceMetricType.UPTIME,
                        value=1.0 if health_info['status'] == ServiceHealth.HEALTHY.value else 0.0,
                        unit="boolean",
                        timestamp=datetime.now(timezone.utc),
                        component=service_name,
                        collection_method="health_check",
                        metadata=health_info
                    )
                    self.metrics_history.append(metric)
                
                # Wait before next comprehensive check
                await asyncio.sleep(30)  # Health checks every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in comprehensive monitoring loop: {e}")
                await asyncio.sleep(30)
    
    def record_real_api_request(
        self,
        endpoint: str,
        method: str,
        response_time_ms: int,
        status_code: int,
        user_agent: str = None
    ):
        """Record real API request for monitoring"""
        self.api_monitor.record_real_request(endpoint, method, response_time_ms, status_code, user_agent)
    
    async def get_real_performance_summary(self) -> Dict[str, Any]:
        """Get comprehensive real performance summary"""
        # Get recent system metrics
        recent_system_metrics = self.system_monitor.get_recent_metrics(minutes=5)
        
        if recent_system_metrics:
            cpu_values = [m.value for m in recent_system_metrics if m.type == PerformanceMetricType.CPU_USAGE]
            memory_values = [m.value for m in recent_system_metrics if m.type == PerformanceMetricType.MEMORY_USAGE]
            disk_values = [m.value for m in recent_system_metrics if m.type == PerformanceMetricType.DISK_USAGE]
            
            avg_cpu = statistics.mean(cpu_values) if cpu_values else 0
            avg_memory = statistics.mean(memory_values) if memory_values else 0
            avg_disk = statistics.mean(disk_values) if disk_values else 0
        else:
            avg_cpu = avg_memory = avg_disk = 0
        
        # Get API statistics
        api_stats = self.api_monitor.get_real_api_stats()
        
        # Get current service health
        async with self.health_checker:
            current_health = await self.health_checker.check_all_real_services()
        
        # Calculate overall health
        healthy_services = sum(1 for h in current_health.values() if h['status'] == ServiceHealth.HEALTHY.value)
        total_services = len(current_health)
        overall_health_percent = (healthy_services / total_services * 100) if total_services > 0 else 0
        
        return {
            'system_metrics': {
                'cpu_usage_percent': avg_cpu,
                'memory_usage_percent': avg_memory,
                'disk_usage_percent': avg_disk,
                'uptime_seconds': self.system_monitor.get_uptime_seconds()
            },
            'api_metrics': api_stats,
            'service_health': {
                'overall_health_percent': overall_health_percent,
                'healthy_services': healthy_services,
                'total_services': total_services,
                'services': current_health
            },
            'summary_timestamp': datetime.now(timezone.utc).isoformat(),
            'data_source': 'real_monitoring_system'  # Clearly indicates real data
        }
    
    async def get_system_metrics(self) -> Dict[str, float]:
        """Get current system metrics - required for testing"""
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_usage_percent': (disk.used / disk.total) * 100,
                'memory_available_gb': memory.available / (1024**3),
                'timestamp': time.time()
            }
        except Exception as e:
            logger.error(f"Failed to get system metrics: {e}")
            return {
                'cpu_percent': 0.0,
                'memory_percent': 0.0,
                'disk_usage_percent': 0.0,
                'memory_available_gb': 0.0,
                'timestamp': time.time()
            }

# Global instance for real performance monitoring
real_performance_monitor = RealPerformanceMonitor()

async def initialize_real_monitoring():
    """Initialize real performance monitoring"""
    logger.info("🚀 Initializing Real Performance Monitoring...")
    await real_performance_monitor.start_real_monitoring()
    logger.info("✅ Real performance monitoring initialized successfully")

async def get_real_performance_data():
    """Get real performance data"""
    return await real_performance_monitor.get_real_performance_summary()

if __name__ == "__main__":
    # Test real performance monitoring
    async def test_real_monitoring():
        await initialize_real_monitoring()
        
        # Wait a bit to collect some data
        await asyncio.sleep(10)
        
        # Get real performance summary
        performance_data = await get_real_performance_data()
        print("Real Performance Data:")
        print(json.dumps(performance_data, indent=2, default=str))
        
        await real_performance_monitor.stop_real_monitoring()
    
    asyncio.run(test_real_monitoring())
