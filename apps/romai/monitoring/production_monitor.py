"""
RomAI Production Monitoring System
Advanced monitoring, alerting, and performance tracking for AGI system
"""
import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import aiohttp
import logging
from dataclasses import dataclass, asdict
from pathlib import Path
import psutil
import GPUtil
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('romai_monitoring.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter('romai_requests_total', 'Total requests', ['endpoint', 'method', 'status'])
REQUEST_DURATION = Histogram('romai_request_duration_seconds', 'Request duration', ['endpoint'])
ACTIVE_CONNECTIONS = Gauge('romai_active_connections', 'Active connections')
SYSTEM_CPU = Gauge('romai_system_cpu_percent', 'System CPU usage')
SYSTEM_MEMORY = Gauge('romai_system_memory_percent', 'System memory usage')
GPU_UTILIZATION = Gauge('romai_gpu_utilization_percent', 'GPU utilization')
MODEL_INFERENCE_TIME = Histogram('romai_model_inference_seconds', 'Model inference time', ['model_type'])

@dataclass
class HealthStatus:
    service: str
    status: str
    response_time_ms: float
    timestamp: datetime
    details: Dict[str, Any]

@dataclass
class PerformanceMetrics:
    endpoint: str
    response_time_ms: float
    success_rate: float
    error_rate: float
    requests_per_second: float
    timestamp: datetime

@dataclass
class SystemMetrics:
    cpu_percent: float
    memory_percent: float
    gpu_utilization: float
    gpu_memory_percent: float
    disk_usage_percent: float
    active_connections: int
    timestamp: datetime

class RomAIMonitor:
    def __init__(self, config_path: str = "monitoring_config.json"):
        self.config = self.load_config(config_path)
        self.health_history: List[HealthStatus] = []
        self.performance_history: List[PerformanceMetrics] = []
        self.system_history: List[SystemMetrics] = []
        self.alerts: List[Dict] = []
        
        # Start Prometheus metrics server
        start_http_server(9090)
        logger.info("Started Prometheus metrics server on port 9090")

    def load_config(self, config_path: str) -> Dict:
        """Load monitoring configuration"""
        default_config = {
            "endpoints": [
                {"url": "http://localhost:6101/health", "name": "RomAI Model Server", "timeout": 5},
                {"url": "http://localhost:6101/api/v1/moe/status", "name": "MOE System", "timeout": 5},
                {"url": "http://localhost:8001/api/v1/health", "name": "Enterprise API", "timeout": 5},
                {"url": "http://localhost:4950/health", "name": "MemorAI MCP", "timeout": 5}
            ],
            "performance_endpoints": [
                {"url": "http://localhost:6101/api/v1/mathematical-reasoning/solve", "name": "Math Reasoning"},
                {"url": "http://localhost:6101/api/v1/logical-reasoning/analyze", "name": "Logic Reasoning"},
                {"url": "http://localhost:6101/api/v1/romanian-intelligence/chat", "name": "Romanian Intelligence"}
            ],
            "thresholds": {
                "response_time_ms": 2000,
                "cpu_percent": 80,
                "memory_percent": 85,
                "gpu_utilization": 90,
                "error_rate": 5,
                "success_rate": 95
            },
            "monitoring_interval": 30,
            "alert_cooldown": 300
        }
        
        try:
            if Path(config_path).exists():
                with open(config_path, 'r') as f:
                    config = json.load(f)
                return {**default_config, **config}
            else:
                with open(config_path, 'w') as f:
                    json.dump(default_config, f, indent=2)
                return default_config
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return default_config

    async def check_health(self, endpoint: Dict) -> HealthStatus:
        """Check health of a single endpoint"""
        start_time = time.time()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    endpoint["url"], 
                    timeout=aiohttp.ClientTimeout(total=endpoint["timeout"])
                ) as response:
                    response_time_ms = (time.time() - start_time) * 1000
                    data = await response.json()
                    
                    status = "healthy" if response.status == 200 else "unhealthy"
                    
                    # Update Prometheus metrics
                    REQUEST_COUNT.labels(
                        endpoint=endpoint["name"], 
                        method="GET", 
                        status=response.status
                    ).inc()
                    REQUEST_DURATION.labels(endpoint=endpoint["name"]).observe(response_time_ms / 1000)
                    
                    return HealthStatus(
                        service=endpoint["name"],
                        status=status,
                        response_time_ms=response_time_ms,
                        timestamp=datetime.now(),
                        details=data
                    )
                    
        except Exception as e:
            response_time_ms = (time.time() - start_time) * 1000
            logger.error(f"Health check failed for {endpoint['name']}: {e}")
            
            REQUEST_COUNT.labels(
                endpoint=endpoint["name"], 
                method="GET", 
                status="error"
            ).inc()
            
            return HealthStatus(
                service=endpoint["name"],
                status="error",
                response_time_ms=response_time_ms,
                timestamp=datetime.now(),
                details={"error": str(e)}
            )

    async def check_performance(self, endpoint: Dict) -> PerformanceMetrics:
        """Test performance of an endpoint"""
        test_payloads = {
            "Math Reasoning": {"problem": "What is 15 + 25?", "context": "basic_arithmetic"},
            "Logic Reasoning": {"query": "All birds have wings. Robin is a bird. Does Robin have wings?"},
            "Romanian Intelligence": {"message": "Salut!", "context": "romanian"}
        }
        
        payload = test_payloads.get(endpoint["name"], {})
        successful_requests = 0
        total_requests = 3
        total_time = 0
        
        for i in range(total_requests):
            start_time = time.time()
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        endpoint["url"],
                        json=payload,
                        headers={"Content-Type": "application/json"},
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as response:
                        request_time = (time.time() - start_time) * 1000
                        total_time += request_time
                        
                        if response.status == 200:
                            successful_requests += 1
                        
                        # Update model inference time metric
                        MODEL_INFERENCE_TIME.labels(model_type=endpoint["name"]).observe(request_time / 1000)
                        
            except Exception as e:
                logger.error(f"Performance test failed for {endpoint['name']}: {e}")
        
        avg_response_time = total_time / total_requests if total_requests > 0 else 0
        success_rate = (successful_requests / total_requests) * 100 if total_requests > 0 else 0
        error_rate = 100 - success_rate
        
        return PerformanceMetrics(
            endpoint=endpoint["name"],
            response_time_ms=avg_response_time,
            success_rate=success_rate,
            error_rate=error_rate,
            requests_per_second=1000 / avg_response_time if avg_response_time > 0 else 0,
            timestamp=datetime.now()
        )

    def get_system_metrics(self) -> SystemMetrics:
        """Collect system metrics"""
        # CPU and Memory
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # GPU metrics
        gpu_util = 0
        gpu_memory = 0
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]  # Use first GPU
                gpu_util = gpu.load * 100
                gpu_memory = gpu.memoryUtil * 100
        except Exception as e:
            logger.warning(f"Could not get GPU metrics: {e}")
        
        # Network connections
        connections = len(psutil.net_connections())
        
        # Update Prometheus metrics
        SYSTEM_CPU.set(cpu_percent)
        SYSTEM_MEMORY.set(memory.percent)
        GPU_UTILIZATION.set(gpu_util)
        ACTIVE_CONNECTIONS.set(connections)
        
        return SystemMetrics(
            cpu_percent=cpu_percent,
            memory_percent=memory.percent,
            gpu_utilization=gpu_util,
            gpu_memory_percent=gpu_memory,
            disk_usage_percent=disk.percent,
            active_connections=connections,
            timestamp=datetime.now()
        )

    def check_alerts(self, health_status: List[HealthStatus], 
                    performance_metrics: List[PerformanceMetrics],
                    system_metrics: SystemMetrics) -> List[Dict]:
        """Check for alert conditions"""
        alerts = []
        thresholds = self.config["thresholds"]
        
        # Health alerts
        for health in health_status:
            if health.status != "healthy":
                alerts.append({
                    "type": "health",
                    "severity": "critical",
                    "service": health.service,
                    "message": f"{health.service} is {health.status}",
                    "timestamp": health.timestamp,
                    "details": health.details
                })
            elif health.response_time_ms > thresholds["response_time_ms"]:
                alerts.append({
                    "type": "performance",
                    "severity": "warning",
                    "service": health.service,
                    "message": f"{health.service} response time {health.response_time_ms:.2f}ms exceeds threshold {thresholds['response_time_ms']}ms",
                    "timestamp": health.timestamp
                })
        
        # Performance alerts
        for perf in performance_metrics:
            if perf.success_rate < thresholds["success_rate"]:
                alerts.append({
                    "type": "success_rate",
                    "severity": "critical",
                    "service": perf.endpoint,
                    "message": f"{perf.endpoint} success rate {perf.success_rate:.1f}% below threshold {thresholds['success_rate']}%",
                    "timestamp": perf.timestamp
                })
        
        # System alerts
        if system_metrics.cpu_percent > thresholds["cpu_percent"]:
            alerts.append({
                "type": "system",
                "severity": "warning",
                "service": "system",
                "message": f"CPU usage {system_metrics.cpu_percent:.1f}% exceeds threshold {thresholds['cpu_percent']}%",
                "timestamp": system_metrics.timestamp
            })
        
        if system_metrics.memory_percent > thresholds["memory_percent"]:
            alerts.append({
                "type": "system",
                "severity": "critical",
                "service": "system",
                "message": f"Memory usage {system_metrics.memory_percent:.1f}% exceeds threshold {thresholds['memory_percent']}%",
                "timestamp": system_metrics.timestamp
            })
        
        return alerts

    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive monitoring report"""
        current_time = datetime.now()
        
        # Get recent data (last hour)
        recent_health = [h for h in self.health_history 
                        if (current_time - h.timestamp).seconds < 3600]
        recent_performance = [p for p in self.performance_history 
                             if (current_time - p.timestamp).seconds < 3600]
        recent_system = [s for s in self.system_history 
                        if (current_time - s.timestamp).seconds < 3600]
        recent_alerts = [a for a in self.alerts 
                        if (current_time - a["timestamp"]).seconds < 3600]
        
        # Calculate summary statistics
        health_summary = {}
        for health in recent_health:
            if health.service not in health_summary:
                health_summary[health.service] = {
                    "status": health.status,
                    "avg_response_time": 0,
                    "count": 0
                }
            health_summary[health.service]["avg_response_time"] += health.response_time_ms
            health_summary[health.service]["count"] += 1
        
        for service in health_summary:
            if health_summary[service]["count"] > 0:
                health_summary[service]["avg_response_time"] /= health_summary[service]["count"]
        
        performance_summary = {}
        for perf in recent_performance:
            performance_summary[perf.endpoint] = {
                "avg_response_time": perf.response_time_ms,
                "success_rate": perf.success_rate,
                "requests_per_second": perf.requests_per_second
            }
        
        system_summary = {}
        if recent_system:
            latest_system = recent_system[-1]
            system_summary = {
                "cpu_percent": latest_system.cpu_percent,
                "memory_percent": latest_system.memory_percent,
                "gpu_utilization": latest_system.gpu_utilization,
                "active_connections": latest_system.active_connections
            }
        
        return {
            "timestamp": current_time,
            "health_summary": health_summary,
            "performance_summary": performance_summary,
            "system_summary": system_summary,
            "recent_alerts": [asdict(alert) for alert in recent_alerts[-10:]],  # Last 10 alerts
            "overall_status": "healthy" if len([a for a in recent_alerts if a["severity"] == "critical"]) == 0 else "degraded"
        }

    async def run_monitoring_cycle(self):
        """Run one complete monitoring cycle"""
        logger.info("Starting monitoring cycle...")
        
        # Health checks
        health_tasks = [self.check_health(endpoint) for endpoint in self.config["endpoints"]]
        health_results = await asyncio.gather(*health_tasks, return_exceptions=True)
        
        # Filter out exceptions
        health_status = [r for r in health_results if isinstance(r, HealthStatus)]
        self.health_history.extend(health_status)
        
        # Performance checks
        perf_tasks = [self.check_performance(endpoint) for endpoint in self.config["performance_endpoints"]]
        perf_results = await asyncio.gather(*perf_tasks, return_exceptions=True)
        
        # Filter out exceptions
        performance_metrics = [r for r in perf_results if isinstance(r, PerformanceMetrics)]
        self.performance_history.extend(performance_metrics)
        
        # System metrics
        system_metrics = self.get_system_metrics()
        self.system_history.append(system_metrics)
        
        # Check alerts
        new_alerts = self.check_alerts(health_status, performance_metrics, system_metrics)
        self.alerts.extend(new_alerts)
        
        # Log new alerts
        for alert in new_alerts:
            if alert["severity"] == "critical":
                logger.critical(f"CRITICAL ALERT: {alert['message']}")
            else:
                logger.warning(f"WARNING: {alert['message']}")
        
        # Clean up old data (keep only last 24 hours)
        cutoff = datetime.now() - timedelta(hours=24)
        self.health_history = [h for h in self.health_history if h.timestamp > cutoff]
        self.performance_history = [p for p in self.performance_history if p.timestamp > cutoff]
        self.system_history = [s for s in self.system_history if s.timestamp > cutoff]
        self.alerts = [a for a in self.alerts if a["timestamp"] > cutoff]
        
        logger.info(f"Monitoring cycle completed. Health checks: {len(health_status)}, Performance tests: {len(performance_metrics)}, Alerts: {len(new_alerts)}")

    async def start_monitoring(self):
        """Start continuous monitoring"""
        logger.info("Starting RomAI Production Monitoring System...")
        
        while True:
            try:
                await self.run_monitoring_cycle()
                await asyncio.sleep(self.config["monitoring_interval"])
            except Exception as e:
                logger.error(f"Error in monitoring cycle: {e}")
                await asyncio.sleep(30)  # Wait 30 seconds before retry

    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get data for monitoring dashboard"""
        return self.generate_report()

# CLI interface
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="RomAI Production Monitoring System")
    parser.add_argument("--config", default="monitoring_config.json", help="Configuration file path")
    parser.add_argument("--report", action="store_true", help="Generate monitoring report and exit")
    parser.add_argument("--daemon", action="store_true", help="Run as monitoring daemon")
    
    args = parser.parse_args()
    
    monitor = RomAIMonitor(args.config)
    
    if args.report:
        # Generate single report
        asyncio.run(monitor.run_monitoring_cycle())
        report = monitor.generate_report()
        print(json.dumps(report, indent=2, default=str))
    elif args.daemon:
        # Run continuous monitoring
        asyncio.run(monitor.start_monitoring())
    else:
        # Interactive mode - run one cycle and show results
        async def interactive():
            await monitor.run_monitoring_cycle()
            report = monitor.generate_report()
            print("\n🔍 RomAI Monitoring Report")
            print("=" * 50)
            print(f"Overall Status: {report['overall_status'].upper()}")
            print(f"Timestamp: {report['timestamp']}")
            
            if report['health_summary']:
                print("\n🏥 Health Summary:")
                for service, data in report['health_summary'].items():
                    print(f"  {service}: {data['status']} ({data['avg_response_time']:.2f}ms)")
            
            if report['performance_summary']:
                print("\n📊 Performance Summary:")
                for endpoint, data in report['performance_summary'].items():
                    print(f"  {endpoint}: {data['success_rate']:.1f}% success, {data['avg_response_time']:.2f}ms")
            
            if report['system_summary']:
                print(f"\n💻 System Summary:")
                sys = report['system_summary']
                print(f"  CPU: {sys['cpu_percent']:.1f}%")
                print(f"  Memory: {sys['memory_percent']:.1f}%")
                print(f"  GPU: {sys['gpu_utilization']:.1f}%")
                print(f"  Connections: {sys['active_connections']}")
            
            if report['recent_alerts']:
                print(f"\n🚨 Recent Alerts:")
                for alert in report['recent_alerts'][-5:]:
                    print(f"  [{alert['severity'].upper()}] {alert['message']}")
        
        asyncio.run(interactive())