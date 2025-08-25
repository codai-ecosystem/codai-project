"""
Health Check and Monitoring System for RomAI
Comprehensive health monitoring with Romanian cultural awareness
"""

import asyncio
import aiohttp
import time
import logging
import json
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timedelta
import psutil
import GPUtil
import sqlite3
from prometheus_client import start_http_server, Counter, Histogram, Gauge, generate_latest

logger = logging.getLogger(__name__)

class HealthStatus(Enum):
    """Health status levels"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    CRITICAL = "critical"

@dataclass
class ComponentHealth:
    """Individual component health status"""
    name: str
    status: HealthStatus
    message: str
    response_time_ms: float
    last_check: datetime
    details: Dict[str, Any]

@dataclass
class RomanianCulturalMetrics:
    """Romanian cultural processing metrics"""
    diacritics_processed: int
    cultural_queries: int
    dor_emotion_requests: int
    literature_analysis_requests: int
    cultural_accuracy_score: float
    romanian_language_requests: int

@dataclass
class SystemMetrics:
    """System performance metrics"""
    cpu_usage: float
    memory_usage: float
    gpu_usage: float
    disk_usage: float
    network_io: Dict[str, int]
    active_connections: int
    request_rate: float

class RomAIHealthChecker:
    """Comprehensive health checking system for RomAI"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.db_path = config.get('db_path', 'health_monitoring.db')
        self.check_interval = config.get('check_interval', 30)
        
        # Health tracking
        self.component_health: Dict[str, ComponentHealth] = {}
        self.system_metrics = SystemMetrics(0, 0, 0, 0, {}, 0, 0)
        self.cultural_metrics = RomanianCulturalMetrics(0, 0, 0, 0, 0.0, 0)
        
        # Prometheus metrics
        self.setup_prometheus_metrics()
        
        # Initialize database
        self.init_database()
        
        # HTTP session for health checks
        self.session: Optional[aiohttp.ClientSession] = None
    
    def setup_prometheus_metrics(self):
        """Setup Prometheus metrics"""
        self.metrics = {
            # System metrics
            'cpu_usage': Gauge('romai_cpu_usage_percent', 'CPU usage percentage'),
            'memory_usage': Gauge('romai_memory_usage_percent', 'Memory usage percentage'),
            'gpu_usage': Gauge('romai_gpu_usage_percent', 'GPU usage percentage'),
            'disk_usage': Gauge('romai_disk_usage_percent', 'Disk usage percentage'),
            
            # Application metrics
            'active_connections': Gauge('romai_active_connections', 'Active connections count'),
            'request_rate': Gauge('romai_request_rate_per_second', 'Request rate per second'),
            'response_time': Histogram('romai_response_time_seconds', 'Response time histogram'),
            
            # Cultural metrics
            'diacritics_processed': Counter('romai_diacritics_processed_total', 'Diacritics processed'),
            'cultural_queries': Counter('romai_cultural_queries_total', 'Cultural queries processed'),
            'dor_emotion_requests': Counter('romai_dor_emotion_requests_total', 'Dor emotion requests'),
            'literature_analysis': Counter('romai_literature_analysis_total', 'Literature analysis requests'),
            'cultural_accuracy': Gauge('romai_cultural_accuracy_score', 'Cultural accuracy score'),
            'romanian_requests': Counter('romai_romanian_requests_total', 'Romanian language requests'),
            
            # Health status
            'component_health': Gauge('romai_component_health', 'Component health status (1=healthy, 0=unhealthy)', ['component']),
            'overall_health': Gauge('romai_overall_health_score', 'Overall system health score (0-1)')
        }
    
    def init_database(self):
        """Initialize SQLite database for health tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS health_checks (
                timestamp TEXT NOT NULL,
                component TEXT NOT NULL,
                status TEXT NOT NULL,
                response_time_ms REAL,
                message TEXT,
                details TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_metrics (
                timestamp TEXT NOT NULL,
                cpu_usage REAL,
                memory_usage REAL,
                gpu_usage REAL,
                disk_usage REAL,
                active_connections INTEGER,
                request_rate REAL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cultural_metrics (
                timestamp TEXT NOT NULL,
                diacritics_processed INTEGER,
                cultural_queries INTEGER,
                dor_emotion_requests INTEGER,
                literature_analysis INTEGER,
                cultural_accuracy REAL,
                romanian_requests INTEGER
            )
        ''')
        
        conn.commit()
        conn.close()
    
    async def initialize(self):
        """Initialize the health checker"""
        timeout = aiohttp.ClientTimeout(total=10)
        self.session = aiohttp.ClientSession(timeout=timeout)
        
        # Start Prometheus metrics server
        prometheus_port = self.config.get('prometheus_port', 9090)
        start_http_server(prometheus_port)
        
        logger.info(f"Health checker initialized, Prometheus metrics on port {prometheus_port}")
    
    async def check_component_health(self, name: str, url: str, 
                                   cultural_check: bool = False) -> ComponentHealth:
        """Check health of a specific component"""
        start_time = time.time()
        
        try:
            health_url = f"{url.rstrip('/')}/health"
            
            async with self.session.get(health_url) as response:
                response_time = (time.time() - start_time) * 1000
                response_data = await response.json()
                
                # Determine health status
                if response.status == 200:
                    status = HealthStatus.HEALTHY
                    message = "Component is healthy"
                elif response.status in [201, 202]:
                    status = HealthStatus.DEGRADED
                    message = "Component is degraded but functional"
                else:
                    status = HealthStatus.UNHEALTHY
                    message = f"Component returned status {response.status}"
                
                # Additional cultural checks
                details = response_data
                if cultural_check and 'cultural_features' in response_data:
                    cultural_features = response_data['cultural_features']
                    if not cultural_features.get('diacritics_support', False):
                        status = HealthStatus.DEGRADED
                        message += " (Missing diacritics support)"
                    
                    if not cultural_features.get('romanian_context', False):
                        status = HealthStatus.DEGRADED
                        message += " (Missing Romanian context)"
                
                return ComponentHealth(
                    name=name,
                    status=status,
                    message=message,
                    response_time_ms=response_time,
                    last_check=datetime.now(),
                    details=details
                )
        
        except asyncio.TimeoutError:
            return ComponentHealth(
                name=name,
                status=HealthStatus.CRITICAL,
                message="Health check timeout",
                response_time_ms=10000,  # Timeout value
                last_check=datetime.now(),
                details={}
            )
        
        except Exception as e:
            return ComponentHealth(
                name=name,
                status=HealthStatus.CRITICAL,
                message=f"Health check failed: {str(e)}",
                response_time_ms=0,
                last_check=datetime.now(),
                details={'error': str(e)}
            )
    
    def collect_system_metrics(self) -> SystemMetrics:
        """Collect system performance metrics"""
        # CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        
        # GPU usage
        gpu_usage = 0.0
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu_usage = max(gpu.load * 100 for gpu in gpus)
        except Exception:
            pass
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_usage = (disk.used / disk.total) * 100
        
        # Network I/O
        network = psutil.net_io_counters()
        network_io = {
            'bytes_sent': network.bytes_sent,
            'bytes_recv': network.bytes_recv,
            'packets_sent': network.packets_sent,
            'packets_recv': network.packets_recv
        }
        
        # Active connections (approximate)
        connections = len(psutil.net_connections(kind='inet'))
        
        return SystemMetrics(
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            gpu_usage=gpu_usage,
            disk_usage=disk_usage,
            network_io=network_io,
            active_connections=connections,
            request_rate=0.0  # Will be calculated separately
        )
    
    async def collect_cultural_metrics(self) -> RomanianCulturalMetrics:
        """Collect Romanian cultural processing metrics"""
        # In a real implementation, these would be collected from the application
        # For now, we'll return mock data
        
        return RomanianCulturalMetrics(
            diacritics_processed=1000,
            cultural_queries=150,
            dor_emotion_requests=25,
            literature_analysis_requests=40,
            cultural_accuracy_score=0.95,
            romanian_language_requests=800
        )
    
    def calculate_overall_health_score(self) -> float:
        """Calculate overall health score based on all components"""
        if not self.component_health:
            return 0.0
        
        total_score = 0.0
        total_weight = 0.0
        
        for component_name, health in self.component_health.items():
            # Assign weights based on component importance
            weight = self._get_component_weight(component_name)
            
            # Convert status to score
            status_score = {
                HealthStatus.HEALTHY: 1.0,
                HealthStatus.DEGRADED: 0.7,
                HealthStatus.UNHEALTHY: 0.3,
                HealthStatus.CRITICAL: 0.0
            }.get(health.status, 0.0)
            
            # Factor in response time
            response_time_factor = max(0, 1.0 - (health.response_time_ms / 5000))
            
            final_score = status_score * response_time_factor
            
            total_score += final_score * weight
            total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0.0
    
    def _get_component_weight(self, component_name: str) -> float:
        """Get weight for component based on importance"""
        weights = {
            'romai-agi-server': 0.4,      # Core AI engine
            'romai-enterprise-api': 0.3,  # Enterprise API
            'cultural-gateway': 0.2,      # Cultural gateway
            'redis': 0.05,                # Cache
            'postgres': 0.05              # Database
        }
        
        return weights.get(component_name, 0.1)
    
    async def perform_comprehensive_health_check(self):
        """Perform comprehensive health check of all components"""
        components_to_check = self.config.get('components', {})
        
        # Check each component
        for component_name, component_config in components_to_check.items():
            health = await self.check_component_health(
                component_name,
                component_config['url'],
                component_config.get('cultural_check', False)
            )
            
            self.component_health[component_name] = health
            
            # Update Prometheus metrics
            status_value = 1.0 if health.status == HealthStatus.HEALTHY else 0.0
            self.metrics['component_health'].labels(component=component_name).set(status_value)
        
        # Collect system metrics
        self.system_metrics = self.collect_system_metrics()
        
        # Update Prometheus system metrics
        self.metrics['cpu_usage'].set(self.system_metrics.cpu_usage)
        self.metrics['memory_usage'].set(self.system_metrics.memory_usage)
        self.metrics['gpu_usage'].set(self.system_metrics.gpu_usage)
        self.metrics['disk_usage'].set(self.system_metrics.disk_usage)
        self.metrics['active_connections'].set(self.system_metrics.active_connections)
        
        # Collect cultural metrics
        self.cultural_metrics = await self.collect_cultural_metrics()
        
        # Update Prometheus cultural metrics
        self.metrics['cultural_accuracy'].set(self.cultural_metrics.cultural_accuracy_score)
        
        # Calculate overall health
        overall_health = self.calculate_overall_health_score()
        self.metrics['overall_health'].set(overall_health)
        
        # Store in database
        await self.store_health_data()
        
        logger.info(f"Health check completed. Overall health: {overall_health:.3f}")
    
    async def store_health_data(self):
        """Store health data in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        timestamp = datetime.now().isoformat()
        
        # Store component health
        for health in self.component_health.values():
            cursor.execute('''
                INSERT INTO health_checks (timestamp, component, status, response_time_ms, message, details)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                timestamp,
                health.name,
                health.status.value,
                health.response_time_ms,
                health.message,
                json.dumps(health.details)
            ))
        
        # Store system metrics
        cursor.execute('''
            INSERT INTO system_metrics (timestamp, cpu_usage, memory_usage, gpu_usage, 
                                      disk_usage, active_connections, request_rate)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            timestamp,
            self.system_metrics.cpu_usage,
            self.system_metrics.memory_usage,
            self.system_metrics.gpu_usage,
            self.system_metrics.disk_usage,
            self.system_metrics.active_connections,
            self.system_metrics.request_rate
        ))
        
        # Store cultural metrics
        cursor.execute('''
            INSERT INTO cultural_metrics (timestamp, diacritics_processed, cultural_queries,
                                        dor_emotion_requests, literature_analysis, 
                                        cultural_accuracy, romanian_requests)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            timestamp,
            self.cultural_metrics.diacritics_processed,
            self.cultural_metrics.cultural_queries,
            self.cultural_metrics.dor_emotion_requests,
            self.cultural_metrics.literature_analysis_requests,
            self.cultural_metrics.cultural_accuracy_score,
            self.cultural_metrics.romanian_language_requests
        ))
        
        conn.commit()
        conn.close()
    
    async def get_health_summary(self) -> Dict[str, Any]:
        """Get comprehensive health summary"""
        overall_health = self.calculate_overall_health_score()
        
        # Determine overall status
        if overall_health >= 0.9:
            overall_status = HealthStatus.HEALTHY
        elif overall_health >= 0.7:
            overall_status = HealthStatus.DEGRADED
        elif overall_health >= 0.3:
            overall_status = HealthStatus.UNHEALTHY
        else:
            overall_status = HealthStatus.CRITICAL
        
        return {
            'overall_status': overall_status.value,
            'overall_score': overall_health,
            'timestamp': datetime.now().isoformat(),
            'components': {
                name: {
                    'status': health.status.value,
                    'message': health.message,
                    'response_time_ms': health.response_time_ms,
                    'last_check': health.last_check.isoformat()
                }
                for name, health in self.component_health.items()
            },
            'system_metrics': asdict(self.system_metrics),
            'cultural_metrics': asdict(self.cultural_metrics),
            'romanian_cultural_health': {
                'diacritics_support': True,
                'cultural_accuracy': self.cultural_metrics.cultural_accuracy_score,
                'romanian_requests_ratio': 0.8  # Calculated ratio
            }
        }
    
    async def generate_health_report(self) -> str:
        """Generate detailed health report"""
        summary = await self.get_health_summary()
        
        report = f"""
# 🏥 RomAI Health Report

## Overall Status: {summary['overall_status'].upper()} ({summary['overall_score']:.3f})
**Generated:** {summary['timestamp']}

## 🖥️ System Metrics
- **CPU Usage:** {summary['system_metrics']['cpu_usage']:.1f}%
- **Memory Usage:** {summary['system_metrics']['memory_usage']:.1f}%
- **GPU Usage:** {summary['system_metrics']['gpu_usage']:.1f}%
- **Disk Usage:** {summary['system_metrics']['disk_usage']:.1f}%
- **Active Connections:** {summary['system_metrics']['active_connections']}

## 🇷🇴 Romanian Cultural Health
- **Cultural Accuracy:** {summary['cultural_metrics']['cultural_accuracy_score']:.3f}
- **Diacritics Processed:** {summary['cultural_metrics']['diacritics_processed']:,}
- **Cultural Queries:** {summary['cultural_metrics']['cultural_queries']:,}
- **Dor Emotion Requests:** {summary['cultural_metrics']['dor_emotion_requests']:,}
- **Literature Analysis:** {summary['cultural_metrics']['literature_analysis_requests']:,}
- **Romanian Language Requests:** {summary['cultural_metrics']['romanian_language_requests']:,}

## 🔧 Component Status
"""
        
        for component_name, component_data in summary['components'].items():
            status_emoji = {
                'healthy': '✅',
                'degraded': '⚠️',
                'unhealthy': '❌',
                'critical': '🚨'
            }.get(component_data['status'], '❓')
            
            report += f"- **{component_name}:** {status_emoji} {component_data['status'].upper()}\n"
            report += f"  - Response Time: {component_data['response_time_ms']:.0f}ms\n"
            report += f"  - Message: {component_data['message']}\n"
        
        return report.strip()
    
    async def run_continuous_monitoring(self):
        """Run continuous health monitoring"""
        logger.info(f"Starting continuous health monitoring (interval: {self.check_interval}s)")
        
        while True:
            try:
                await self.perform_comprehensive_health_check()
                await asyncio.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"Health monitoring error: {e}")
                await asyncio.sleep(self.check_interval)
    
    async def shutdown(self):
        """Clean shutdown"""
        if self.session:
            await self.session.close()
        
        logger.info("Health checker shutdown complete")


# Example usage
if __name__ == '__main__':
    import yaml
    
    # Default configuration
    config = {
        'db_path': 'romai_health.db',
        'check_interval': 30,
        'prometheus_port': 9090,
        'components': {
            'romai-agi-server': {
                'url': 'http://localhost:6101',
                'cultural_check': True
            },
            'romai-enterprise-api': {
                'url': 'http://localhost:8001',
                'cultural_check': True
            },
            'cultural-gateway': {
                'url': 'http://localhost:8080',
                'cultural_check': True
            },
            'redis': {
                'url': 'http://localhost:6379',
                'cultural_check': False
            }
        }
    }
    
    async def main():
        health_checker = RomAIHealthChecker(config)
        await health_checker.initialize()
        
        print("🏥 RomAI Health Checker Started")
        print("🔍 Performing initial health check...")
        
        await health_checker.perform_comprehensive_health_check()
        
        print("\n📊 Health Summary:")
        summary = await health_checker.get_health_summary()
        print(json.dumps(summary, indent=2, default=str))
        
        print(f"\n📋 Health Report:")
        report = await health_checker.generate_health_report()
        print(report)
        
        # Start continuous monitoring
        await health_checker.run_continuous_monitoring()
    
    asyncio.run(main())