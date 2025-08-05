#!/usr/bin/env python3
"""
🔍 RomAI AGI Week 3 Production Health Monitor
Comprehensive system health monitoring and alerting
"""

import asyncio
import aiohttp
import time
import json
import logging
import psutil
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

@dataclass
class HealthCheckResult:
    service: str
    status: HealthStatus
    response_time: float
    error: Optional[str] = None
    details: Dict[str, Any] = None
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.details is None:
            self.details = {}

class RomAIHealthMonitor:
    """Comprehensive health monitoring for RomAI AGI production environment"""
    
    def __init__(self):
        self.services = {
            'romai_frontend': 'http://localhost:3000/api/health',
            'romai_python_api': 'http://localhost:8001/health',
            'cbd_database': 'http://localhost:4180/health',
            'redis_cache': 'redis://localhost:6379',
            'postgres_db': 'postgresql://romai:romai123@localhost:5432/romai_production',
            'prometheus': 'http://localhost:9090/-/healthy',
            'grafana': 'http://localhost:3001/api/health',
        }
        
        self.thresholds = {
            'response_time_warning': 1.0,  # seconds
            'response_time_critical': 3.0,  # seconds
            'cpu_usage_warning': 70.0,     # percentage
            'cpu_usage_critical': 90.0,    # percentage
            'memory_usage_warning': 80.0,  # percentage
            'memory_usage_critical': 95.0, # percentage
            'disk_usage_warning': 80.0,    # percentage
            'disk_usage_critical': 90.0,   # percentage
        }
        
        self.session = None
        self.health_history = []
        self.alert_cooldown = {}  # Prevent alert spam
        
    async def start_monitoring(self):
        """Start the health monitoring service"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=10)
        )
        
        logger.info("🔍 Starting RomAI AGI Health Monitor...")
        logger.info("📊 Monitoring services: %s", list(self.services.keys()))
        
        try:
            while True:
                health_report = await self.perform_health_checks()
                await self.process_health_report(health_report)
                await self.store_health_metrics(health_report)
                
                # Monitor every 30 seconds
                await asyncio.sleep(30)
                
        except KeyboardInterrupt:
            logger.info("🛑 Health monitor stopped by user")
        except Exception as e:
            logger.error("❌ Health monitor error: %s", str(e))
        finally:
            if self.session:
                await self.session.close()

    async def perform_health_checks(self) -> Dict[str, HealthCheckResult]:
        """Perform health checks on all services"""
        health_results = {}
        
        # Check web services
        web_services = {
            k: v for k, v in self.services.items() 
            if v.startswith('http')
        }
        
        for service, url in web_services.items():
            health_results[service] = await self.check_http_service(service, url)
        
        # Check system health
        health_results['system'] = await self.check_system_health()
        
        # Check application-specific metrics
        health_results['romai_app'] = await self.check_romai_application()
        
        return health_results

    async def check_http_service(self, service: str, url: str) -> HealthCheckResult:
        """Check HTTP service health"""
        start_time = time.time()
        
        try:
            async with self.session.get(url) as response:
                response_time = time.time() - start_time
                
                if response.status == 200:
                    data = await response.json() if 'application/json' in response.content_type else {}
                    
                    status = HealthStatus.HEALTHY
                    if response_time > self.thresholds['response_time_critical']:
                        status = HealthStatus.UNHEALTHY
                    elif response_time > self.thresholds['response_time_warning']:
                        status = HealthStatus.DEGRADED
                    
                    return HealthCheckResult(
                        service=service,
                        status=status,
                        response_time=response_time,
                        details={
                            'status_code': response.status,
                            'response_data': data,
                            'content_type': response.content_type
                        }
                    )
                else:
                    return HealthCheckResult(
                        service=service,
                        status=HealthStatus.UNHEALTHY,
                        response_time=response_time,
                        error=f"HTTP {response.status}",
                        details={'status_code': response.status}
                    )
                    
        except asyncio.TimeoutError:
            return HealthCheckResult(
                service=service,
                status=HealthStatus.UNHEALTHY,
                response_time=time.time() - start_time,
                error="Timeout"
            )
        except Exception as e:
            return HealthCheckResult(
                service=service,
                status=HealthStatus.UNHEALTHY,
                response_time=time.time() - start_time,
                error=str(e)
            )

    async def check_system_health(self) -> HealthCheckResult:
        """Check system resource health"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            
            # Load average
            load_avg = os.getloadavg() if hasattr(os, 'getloadavg') else (0, 0, 0)
            
            # Determine overall status
            status = HealthStatus.HEALTHY
            
            if (cpu_percent > self.thresholds['cpu_usage_critical'] or 
                memory_percent > self.thresholds['memory_usage_critical'] or
                disk_percent > self.thresholds['disk_usage_critical']):
                status = HealthStatus.UNHEALTHY
            elif (cpu_percent > self.thresholds['cpu_usage_warning'] or 
                  memory_percent > self.thresholds['memory_usage_warning'] or
                  disk_percent > self.thresholds['disk_usage_warning']):
                status = HealthStatus.DEGRADED
            
            return HealthCheckResult(
                service='system',
                status=status,
                response_time=0.1,
                details={
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory_percent,
                    'memory_available_gb': memory.available / (1024**3),
                    'disk_percent': disk_percent,
                    'disk_free_gb': disk.free / (1024**3),
                    'load_average': load_avg,
                    'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat()
                }
            )
            
        except Exception as e:
            return HealthCheckResult(
                service='system',
                status=HealthStatus.UNKNOWN,
                response_time=0.1,
                error=str(e)
            )

    async def check_romai_application(self) -> HealthCheckResult:
        """Check RomAI-specific application health"""
        try:
            start_time = time.time()
            
            # Check if critical processes are running
            romai_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    cmdline = ' '.join(proc.info['cmdline'] or [])
                    if 'romai' in cmdline.lower() or 'next' in proc.info['name'].lower():
                        romai_processes.append({
                            'pid': proc.info['pid'],
                            'name': proc.info['name'],
                            'cmdline': cmdline[:100]  # Truncate for readability
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            # Check CBD connection health
            cbd_healthy = True
            cbd_error = None
            try:
                async with self.session.get('http://localhost:4180/stats') as response:
                    if response.status != 200:
                        cbd_healthy = False
                        cbd_error = f"CBD stats endpoint returned {response.status}"
            except Exception as e:
                cbd_healthy = False
                cbd_error = str(e)
            
            response_time = time.time() - start_time
            
            # Determine status
            if len(romai_processes) == 0:
                status = HealthStatus.UNHEALTHY
                error = "No RomAI processes detected"
            elif not cbd_healthy:
                status = HealthStatus.DEGRADED
                error = f"CBD connection issue: {cbd_error}"
            else:
                status = HealthStatus.HEALTHY
                error = None
            
            return HealthCheckResult(
                service='romai_app',
                status=status,
                response_time=response_time,
                error=error,
                details={
                    'processes_count': len(romai_processes),
                    'processes': romai_processes,
                    'cbd_healthy': cbd_healthy,
                    'cbd_error': cbd_error
                }
            )
            
        except Exception as e:
            return HealthCheckResult(
                service='romai_app',
                status=HealthStatus.UNKNOWN,
                response_time=0.1,
                error=str(e)
            )

    async def process_health_report(self, health_report: Dict[str, HealthCheckResult]):
        """Process health report and trigger alerts if needed"""
        current_time = datetime.now()
        
        # Calculate overall health
        unhealthy_services = [
            result.service for result in health_report.values() 
            if result.status == HealthStatus.UNHEALTHY
        ]
        
        degraded_services = [
            result.service for result in health_report.values() 
            if result.status == HealthStatus.DEGRADED
        ]
        
        # Log health status
        if unhealthy_services:
            logger.error("❌ UNHEALTHY services: %s", unhealthy_services)
        elif degraded_services:
            logger.warning("⚠️ DEGRADED services: %s", degraded_services)
        else:
            logger.info("✅ All services healthy")
        
        # Print detailed status
        self.print_health_summary(health_report)
        
        # Send alerts if needed
        await self.send_alerts_if_needed(health_report, current_time)

    def print_health_summary(self, health_report: Dict[str, HealthCheckResult]):
        """Print a formatted health summary"""
        print("\n" + "="*80)
        print(f"🔍 RomAI AGI Health Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)
        
        for service, result in health_report.items():
            status_emoji = {
                HealthStatus.HEALTHY: "✅",
                HealthStatus.DEGRADED: "⚠️",
                HealthStatus.UNHEALTHY: "❌",
                HealthStatus.UNKNOWN: "❓"
            }
            
            emoji = status_emoji.get(result.status, "❓")
            
            print(f"{emoji} {service:20} | {result.status.value:10} | "
                  f"{result.response_time:6.3f}s | {result.error or 'OK'}")
            
            # Print additional details for system health
            if service == 'system' and result.details:
                details = result.details
                print(f"   📊 CPU: {details.get('cpu_percent', 0):.1f}% | "
                      f"Memory: {details.get('memory_percent', 0):.1f}% | "
                      f"Disk: {details.get('disk_percent', 0):.1f}%")
        
        print("="*80)

    async def send_alerts_if_needed(self, health_report: Dict[str, HealthCheckResult], 
                                   current_time: datetime):
        """Send alerts for unhealthy services (with cooldown)"""
        for service, result in health_report.items():
            if result.status in [HealthStatus.UNHEALTHY, HealthStatus.DEGRADED]:
                # Check cooldown
                last_alert = self.alert_cooldown.get(service)
                if last_alert and current_time - last_alert < timedelta(minutes=5):
                    continue  # Skip alert due to cooldown
                
                # Send alert
                await self.send_alert(service, result)
                self.alert_cooldown[service] = current_time
            else:
                # Clear cooldown for healthy services
                self.alert_cooldown.pop(service, None)

    async def send_alert(self, service: str, result: HealthCheckResult):
        """Send alert for unhealthy service"""
        alert_message = {
            'timestamp': result.timestamp.isoformat(),
            'service': service,
            'status': result.status.value,
            'error': result.error,
            'response_time': result.response_time,
            'details': result.details
        }
        
        # Log alert
        logger.error("🚨 ALERT: %s is %s - %s", 
                    service, result.status.value, result.error or 'No details')
        
        # Here you would typically send alerts to:
        # - Slack/Discord webhook
        # - Email notifications
        # - PagerDuty/Opsgenie
        # - Push notifications
        
        # For now, just write to alert log
        alert_file = '/app/logs/alerts.json'
        os.makedirs(os.path.dirname(alert_file), exist_ok=True)
        
        try:
            with open(alert_file, 'a') as f:
                f.write(json.dumps(alert_message) + '\n')
        except Exception as e:
            logger.error("Failed to write alert to file: %s", str(e))

    async def store_health_metrics(self, health_report: Dict[str, HealthCheckResult]):
        """Store health metrics for analysis"""
        self.health_history.append({
            'timestamp': datetime.now().isoformat(),
            'report': {
                service: {
                    'status': result.status.value,
                    'response_time': result.response_time,
                    'error': result.error,
                    'details': result.details
                }
                for service, result in health_report.items()
            }
        })
        
        # Keep only last 1000 entries
        if len(self.health_history) > 1000:
            self.health_history = self.health_history[-1000:]
        
        # Save to file for persistence
        metrics_file = '/app/logs/health_metrics.json'
        os.makedirs(os.path.dirname(metrics_file), exist_ok=True)
        
        try:
            with open(metrics_file, 'w') as f:
                json.dump(self.health_history[-100:], f, indent=2)  # Save last 100 entries
        except Exception as e:
            logger.error("Failed to save health metrics: %s", str(e))

    async def get_health_summary(self) -> Dict[str, Any]:
        """Get current health summary for API endpoints"""
        health_report = await self.perform_health_checks()
        
        overall_status = HealthStatus.HEALTHY
        if any(r.status == HealthStatus.UNHEALTHY for r in health_report.values()):
            overall_status = HealthStatus.UNHEALTHY
        elif any(r.status == HealthStatus.DEGRADED for r in health_report.values()):
            overall_status = HealthStatus.DEGRADED
        
        return {
            'timestamp': datetime.now().isoformat(),
            'overall_status': overall_status.value,
            'services': {
                service: {
                    'status': result.status.value,
                    'response_time': result.response_time,
                    'error': result.error
                }
                for service, result in health_report.items()
            },
            'summary': {
                'total_services': len(health_report),
                'healthy': sum(1 for r in health_report.values() if r.status == HealthStatus.HEALTHY),
                'degraded': sum(1 for r in health_report.values() if r.status == HealthStatus.DEGRADED),
                'unhealthy': sum(1 for r in health_report.values() if r.status == HealthStatus.UNHEALTHY),
                'unknown': sum(1 for r in health_report.values() if r.status == HealthStatus.UNKNOWN)
            }
        }

async def main():
    """Main function to start health monitoring"""
    monitor = RomAIHealthMonitor()
    await monitor.start_monitoring()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Health monitor stopped")
    except Exception as e:
        logger.error("❌ Failed to start health monitor: %s", str(e))
