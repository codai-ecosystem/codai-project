#!/usr/bin/env python3
"""
ROMAI Real-time Monitoring Deployment Script
Orchestrates deployment of all real-time monitoring components.
"""

import asyncio
import subprocess
import sys
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional
import logging

class RomaiMonitoringDeployer:
    """
    Deploys and manages ROMAI real-time monitoring infrastructure.
    """
    
    def __init__(self):
        self.logger = self._setup_logging()
        self.base_path = Path(__file__).parent.parent
        self.services = {}
        self.deployment_config = {
            'elk_stack': {
                'compose_file': 'infrastructure/monitoring/docker-compose.elk.yml',
                'services': [
                    'elasticsearch',
                    'kibana',
                    'logstash',
                    'filebeat',
                    'metricbeat',
                    'apm-server',
                    'elastalert2'
                ],
                'health_checks': {
                    'elasticsearch': 'http://localhost:9200/_cluster/health',
                    'kibana': 'http://localhost:5601/api/status',
                    'logstash': 'http://localhost:9600/_node/stats'
                }
            },
            'real_time_components': {
                'websocket_server': {
                    'script': 'infrastructure/monitoring/real-time/websocket/streaming_server.py',
                    'port': 8765,
                    'health_check': 'ws://localhost:8765'
                },
                'analytics_integration': {
                    'script': 'infrastructure/monitoring/real-time/integration/romai_analytics_integration.py',
                    'dependencies': ['elasticsearch', 'redis'],
                    'health_check': 'http://localhost:8765/health'
                },
                'dashboard': {
                    'file': 'infrastructure/monitoring/real-time/streaming-dashboards/real-time-dashboard.html',
                    'port': 8080,
                    'serve_locally': True
                }
            },
            'romai_services': {
                'api': {
                    'path': 'apps/api',
                    'port': 3001,
                    'health_check': 'http://localhost:3001/health'
                },
                'dashboard': {
                    'path': 'apps/dashboard',
                    'port': 3000,
                    'health_check': 'http://localhost:3000'
                },
                'mcp_server': {
                    'path': 'apps/mcp-server',
                    'port': 3002,
                    'health_check': 'http://localhost:3002/health'
                }
            }
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for deployment."""
        logger = logging.getLogger('romai_deployer')
        logger.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        return logger
    
    async def deploy_all(self, skip_elk: bool = False):
        """Deploy all monitoring components."""
        try:
            self.logger.info("🚀 Starting ROMAI Real-time Monitoring Deployment")
            
            # Step 1: Deploy ELK Stack
            if not skip_elk:
                await self._deploy_elk_stack()
                await self._wait_for_elk_health()
            
            # Step 2: Deploy Real-time Components
            await self._deploy_real_time_components()
            
            # Step 3: Deploy ROMAI Services
            await self._deploy_romai_services()
            
            # Step 4: Setup Kibana Dashboards
            await self._setup_kibana_dashboards()
            
            # Step 5: Validate Deployment
            await self._validate_deployment()
            
            # Step 6: Start Performance Test
            await self._run_performance_test()
            
            self.logger.info("✅ ROMAI Real-time Monitoring Deployment Complete!")
            await self._print_access_urls()
            
        except Exception as e:
            self.logger.error(f"❌ Deployment failed: {e}")
            await self._cleanup_failed_deployment()
            raise
    
    async def _deploy_elk_stack(self):
        """Deploy ELK stack using Docker Compose."""
        self.logger.info("📦 Deploying ELK Stack...")
        
        compose_file = self.base_path / self.deployment_config['elk_stack']['compose_file']
        
        if not compose_file.exists():
            raise FileNotFoundError(f"Docker Compose file not found: {compose_file}")
        
        try:
            # Stop any existing containers
            subprocess.run([
                'docker-compose', '-f', str(compose_file), 'down'
            ], capture_output=True, text=True)
            
            # Start ELK stack
            result = subprocess.run([
                'docker-compose', '-f', str(compose_file), 'up', '-d'
            ], capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Docker Compose failed: {result.stderr}")
            
            self.logger.info("✅ ELK Stack containers started")
            
        except subprocess.SubprocessError as e:
            raise Exception(f"Failed to deploy ELK stack: {e}")
    
    async def _wait_for_elk_health(self):
        """Wait for ELK stack to be healthy."""
        self.logger.info("⏳ Waiting for ELK Stack health checks...")
        
        health_checks = self.deployment_config['elk_stack']['health_checks']
        max_wait_time = 300  # 5 minutes
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            all_healthy = True
            
            for service, url in health_checks.items():
                try:
                    response = requests.get(url, timeout=5)
                    if response.status_code == 200:
                        self.logger.info(f"✅ {service} is healthy")
                    else:
                        all_healthy = False
                        self.logger.info(f"⏳ {service} not ready (status: {response.status_code})")
                except requests.RequestException:
                    all_healthy = False
                    self.logger.info(f"⏳ {service} not ready (connection failed)")
            
            if all_healthy:
                self.logger.info("✅ All ELK services are healthy")
                return
            
            await asyncio.sleep(10)
        
        raise Exception("ELK stack health check timeout")
    
    async def _deploy_real_time_components(self):
        """Deploy real-time monitoring components."""
        self.logger.info("🔄 Deploying Real-time Components...")
        
        components = self.deployment_config['real_time_components']
        
        # Start WebSocket server
        await self._start_websocket_server(components['websocket_server'])
        
        # Start analytics integration
        await self._start_analytics_integration(components['analytics_integration'])
        
        # Serve dashboard
        await self._serve_dashboard(components['dashboard'])
        
        self.logger.info("✅ Real-time components deployed")
    
    async def _start_websocket_server(self, config: Dict):
        """Start WebSocket streaming server."""
        script_path = self.base_path / config['script']
        
        try:
            process = await asyncio.create_subprocess_exec(
                sys.executable, str(script_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            self.services['websocket_server'] = process
            self.logger.info(f"✅ WebSocket server started (PID: {process.pid})")
            
            # Wait a moment for startup
            await asyncio.sleep(3)
            
        except Exception as e:
            raise Exception(f"Failed to start WebSocket server: {e}")
    
    async def _start_analytics_integration(self, config: Dict):
        """Start analytics integration service."""
        script_path = self.base_path / config['script']
        
        try:
            process = await asyncio.create_subprocess_exec(
                sys.executable, str(script_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            self.services['analytics_integration'] = process
            self.logger.info(f"✅ Analytics integration started (PID: {process.pid})")
            
            # Wait a moment for startup
            await asyncio.sleep(5)
            
        except Exception as e:
            raise Exception(f"Failed to start analytics integration: {e}")
    
    async def _serve_dashboard(self, config: Dict):
        """Serve real-time dashboard."""
        dashboard_path = self.base_path / config['file']
        port = config['port']
        
        try:
            # Simple HTTP server for the dashboard
            process = await asyncio.create_subprocess_exec(
                sys.executable, '-m', 'http.server', str(port),
                cwd=dashboard_path.parent,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            self.services['dashboard_server'] = process
            self.logger.info(f"✅ Dashboard server started on port {port} (PID: {process.pid})")
            
        except Exception as e:
            self.logger.warning(f"Failed to start dashboard server: {e}")
    
    async def _deploy_romai_services(self):
        """Deploy ROMAI services."""
        self.logger.info("🎯 Deploying ROMAI Services...")
        
        services = self.deployment_config['romai_services']
        
        for service_name, config in services.items():
            try:
                await self._start_romai_service(service_name, config)
            except Exception as e:
                self.logger.warning(f"Failed to start {service_name}: {e}")
        
        self.logger.info("✅ ROMAI services deployment attempted")
    
    async def _start_romai_service(self, name: str, config: Dict):
        """Start a ROMAI service."""
        service_path = self.base_path / config['path']
        
        if not service_path.exists():
            self.logger.warning(f"Service path not found: {service_path}")
            return
        
        try:
            # Check if package.json exists
            package_json = service_path / 'package.json'
            if package_json.exists():
                # Install dependencies
                subprocess.run(['npm', 'install'], cwd=service_path, capture_output=True)
                
                # Start service
                process = await asyncio.create_subprocess_exec(
                    'npm', 'start',
                    cwd=service_path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                self.services[f'romai_{name}'] = process
                self.logger.info(f"✅ ROMAI {name} started (PID: {process.pid})")
                
        except Exception as e:
            self.logger.warning(f"Failed to start ROMAI {name}: {e}")
    
    async def _setup_kibana_dashboards(self):
        """Setup Kibana dashboards."""
        self.logger.info("📊 Setting up Kibana dashboards...")
        
        try:
            # Wait for Kibana to be ready
            await asyncio.sleep(10)
            
            kibana_url = "http://localhost:5601"
            
            # Create index patterns
            index_patterns = [
                'romai-analytics-logs-*',
                'romai-analytics-metrics-*',
                'romai-analytics-performance-*',
                'romai-analytics-security-*'
            ]
            
            for pattern in index_patterns:
                try:
                    response = requests.post(
                        f"{kibana_url}/api/saved_objects/index-pattern",
                        headers={'Content-Type': 'application/json', 'kbn-xsrf': 'true'},
                        json={
                            'attributes': {
                                'title': pattern,
                                'timeFieldName': 'timestamp'
                            }
                        },
                        timeout=10
                    )
                    
                    if response.status_code in [200, 409]:  # 409 = already exists
                        self.logger.info(f"✅ Index pattern created: {pattern}")
                    
                except requests.RequestException as e:
                    self.logger.warning(f"Failed to create index pattern {pattern}: {e}")
            
            self.logger.info("✅ Kibana dashboard setup completed")
            
        except Exception as e:
            self.logger.warning(f"Kibana dashboard setup failed: {e}")
    
    async def _validate_deployment(self):
        """Validate the deployment."""
        self.logger.info("🔍 Validating deployment...")
        
        validation_results = {}
        
        # Check ELK services
        for service, url in self.deployment_config['elk_stack']['health_checks'].items():
            try:
                response = requests.get(url, timeout=5)
                validation_results[f'elk_{service}'] = response.status_code == 200
            except:
                validation_results[f'elk_{service}'] = False
        
        # Check WebSocket server
        try:
            import websockets
            async with websockets.connect('ws://localhost:8765') as websocket:
                await websocket.send('{"type": "ping"}')
                response = await websocket.recv()
                validation_results['websocket_server'] = True
        except:
            validation_results['websocket_server'] = False
        
        # Check dashboard
        try:
            response = requests.get('http://localhost:8080', timeout=5)
            validation_results['dashboard'] = response.status_code == 200
        except:
            validation_results['dashboard'] = False
        
        # Print validation results
        self.logger.info("📋 Validation Results:")
        for service, status in validation_results.items():
            status_icon = "✅" if status else "❌"
            self.logger.info(f"  {status_icon} {service}: {'Healthy' if status else 'Failed'}")
        
        healthy_services = sum(validation_results.values())
        total_services = len(validation_results)
        health_percentage = (healthy_services / total_services) * 100
        
        self.logger.info(f"📊 Overall Health: {health_percentage:.1f}% ({healthy_services}/{total_services})")
        
        if health_percentage < 70:
            raise Exception(f"Deployment validation failed: {health_percentage:.1f}% healthy")
    
    async def _run_performance_test(self):
        """Run a quick performance test."""
        self.logger.info("🚀 Running performance test...")
        
        try:
            # Test WebSocket connection and data flow
            import websockets
            
            start_time = time.time()
            message_count = 0
            
            async with websockets.connect('ws://localhost:8765') as websocket:
                # Subscribe to streams
                await websocket.send(json.dumps({
                    'type': 'subscribe',
                    'streams': ['logs', 'metrics', 'performance']
                }))
                
                # Collect messages for 10 seconds
                timeout = 10
                end_time = start_time + timeout
                
                while time.time() < end_time:
                    try:
                        message = await asyncio.wait_for(websocket.recv(), timeout=1)
                        message_count += 1
                    except asyncio.TimeoutError:
                        continue
            
            messages_per_second = message_count / timeout
            self.logger.info(f"📈 Performance Test Results:")
            self.logger.info(f"  Messages received: {message_count}")
            self.logger.info(f"  Messages per second: {messages_per_second:.2f}")
            self.logger.info(f"  Test duration: {timeout}s")
            
            if messages_per_second > 1:
                self.logger.info("✅ Performance test passed")
            else:
                self.logger.warning("⚠️  Performance test shows low message rate")
        
        except Exception as e:
            self.logger.warning(f"Performance test failed: {e}")
    
    async def _print_access_urls(self):
        """Print access URLs for all services."""
        self.logger.info("\n🌐 Access URLs:")
        self.logger.info("=" * 50)
        self.logger.info("📊 Kibana Dashboard:     http://localhost:5601")
        self.logger.info("🔍 Elasticsearch:        http://localhost:9200")
        self.logger.info("📈 Real-time Dashboard:  http://localhost:8080/real-time-dashboard.html")
        self.logger.info("🔌 WebSocket Stream:     ws://localhost:8765")
        self.logger.info("🎯 ROMAI API:            http://localhost:3001")
        self.logger.info("💻 ROMAI Dashboard:      http://localhost:3000")
        self.logger.info("🤖 ROMAI MCP Server:     http://localhost:3002")
        self.logger.info("=" * 50)
    
    async def _cleanup_failed_deployment(self):
        """Cleanup after failed deployment."""
        self.logger.info("🧹 Cleaning up failed deployment...")
        
        # Stop processes
        for name, process in self.services.items():
            try:
                process.terminate()
                await process.wait()
                self.logger.info(f"Stopped {name}")
            except:
                pass
        
        # Stop Docker containers
        compose_file = self.base_path / self.deployment_config['elk_stack']['compose_file']
        if compose_file.exists():
            subprocess.run([
                'docker-compose', '-f', str(compose_file), 'down'
            ], capture_output=True)
    
    async def stop_all(self):
        """Stop all services."""
        self.logger.info("🛑 Stopping all services...")
        
        # Stop processes
        for name, process in self.services.items():
            try:
                process.terminate()
                await process.wait()
                self.logger.info(f"✅ Stopped {name}")
            except:
                self.logger.warning(f"Failed to stop {name}")
        
        # Stop Docker containers
        compose_file = self.base_path / self.deployment_config['elk_stack']['compose_file']
        if compose_file.exists():
            subprocess.run([
                'docker-compose', '-f', str(compose_file), 'down'
            ], capture_output=True)
            self.logger.info("✅ Stopped ELK stack")
        
        self.logger.info("✅ All services stopped")


async def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='ROMAI Real-time Monitoring Deployer')
    parser.add_argument('action', choices=['deploy', 'stop'], help='Action to perform')
    parser.add_argument('--skip-elk', action='store_true', help='Skip ELK stack deployment')
    
    args = parser.parse_args()
    
    deployer = RomaiMonitoringDeployer()
    
    try:
        if args.action == 'deploy':
            await deployer.deploy_all(skip_elk=args.skip_elk)
            
            # Keep running
            print("\n✨ Press Ctrl+C to stop all services")
            while True:
                await asyncio.sleep(1)
                
        elif args.action == 'stop':
            await deployer.stop_all()
    
    except KeyboardInterrupt:
        print("\n🛑 Stopping services...")
        await deployer.stop_all()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
