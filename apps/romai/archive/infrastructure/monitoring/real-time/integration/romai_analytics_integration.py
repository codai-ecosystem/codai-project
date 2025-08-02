#!/usr/bin/env python3
"""
ROMAI Real-time Analytics Integration
Integrates ROMAI services with real-time streaming and Elasticsearch.
"""

import asyncio
import json
import logging
import aiohttp
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from elasticsearch import AsyncElasticsearch
from elasticsearch.helpers import async_bulk
import websockets
import redis.asyncio as redis
from pathlib import Path

class RomaiAnalyticsIntegrator:
    """
    Integrates ROMAI services with real-time analytics infrastructure.
    """
    
    def __init__(self):
        self.logger = self._setup_logging()
        self.es_client = None
        self.redis_client = None
        self.websocket_server = None
        self.active_connections = set()
        self.metrics_cache = {}
        
        # Configuration
        self.config = {
            'elasticsearch': {
                'host': 'localhost',
                'port': 9200,
                'index_prefix': 'romai-analytics'
            },
            'redis': {
                'host': 'localhost',
                'port': 6379,
                'db': 0
            },
            'websocket': {
                'host': 'localhost',
                'port': 8765
            },
            'romai_services': {
                'api': 'http://localhost:3001',
                'dashboard': 'http://localhost:3000',
                'mcp_server': 'http://localhost:3002'
            },
            'monitoring': {
                'log_retention_days': 30,
                'metrics_interval_seconds': 5,
                'alert_thresholds': {
                    'error_rate_percent': 5.0,
                    'response_time_ms': 1000,
                    'memory_usage_percent': 85.0,
                    'cpu_usage_percent': 80.0
                }
            }
        }
    
    def _setup_logging(self) -> logging.Logger:
        """Setup comprehensive logging."""
        logger = logging.getLogger('romai_analytics')
        logger.setLevel(logging.INFO)
        
        # Create logs directory
        log_dir = Path(__file__).parent.parent / 'logs'
        log_dir.mkdir(exist_ok=True)
        
        # File handler
        file_handler = logging.FileHandler(log_dir / 'analytics-integration.log')
        file_handler.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    async def initialize(self):
        """Initialize all connections and services."""
        try:
            await self._initialize_elasticsearch()
            await self._initialize_redis()
            await self._setup_indices()
            await self._start_websocket_server()
            await self._start_monitoring_tasks()
            
            self.logger.info("ROMAI Analytics Integration initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Initialization failed: {e}")
            raise
    
    async def _initialize_elasticsearch(self):
        """Initialize Elasticsearch connection."""
        try:
            self.es_client = AsyncElasticsearch([{
                'host': self.config['elasticsearch']['host'],
                'port': self.config['elasticsearch']['port']
            }])
            
            # Test connection
            await self.es_client.ping()
            self.logger.info("Elasticsearch connection established")
            
        except Exception as e:
            self.logger.error(f"Elasticsearch initialization failed: {e}")
            raise
    
    async def _initialize_redis(self):
        """Initialize Redis connection."""
        try:
            self.redis_client = redis.Redis(
                host=self.config['redis']['host'],
                port=self.config['redis']['port'],
                db=self.config['redis']['db'],
                decode_responses=True
            )
            
            # Test connection
            await self.redis_client.ping()
            self.logger.info("Redis connection established")
            
        except Exception as e:
            self.logger.error(f"Redis initialization failed: {e}")
            raise
    
    async def _setup_indices(self):
        """Setup Elasticsearch indices with proper mappings."""
        indices = {
            'logs': {
                'mappings': {
                    'properties': {
                        'timestamp': {'type': 'date'},
                        'service': {'type': 'keyword'},
                        'level': {'type': 'keyword'},
                        'message': {'type': 'text'},
                        'user_id': {'type': 'keyword'},
                        'session_id': {'type': 'keyword'},
                        'client_ip': {'type': 'ip'},
                        'response_time_ms': {'type': 'integer'},
                        'status_code': {'type': 'integer'},
                        'endpoint': {'type': 'keyword'},
                        'method': {'type': 'keyword'},
                        'user_agent': {'type': 'text'},
                        'error_details': {'type': 'object'}
                    }
                }
            },
            'metrics': {
                'mappings': {
                    'properties': {
                        'timestamp': {'type': 'date'},
                        'service': {'type': 'keyword'},
                        'metric_name': {'type': 'keyword'},
                        'metric_value': {'type': 'double'},
                        'metric_type': {'type': 'keyword'},
                        'tags': {'type': 'object'},
                        'host': {'type': 'keyword'},
                        'environment': {'type': 'keyword'}
                    }
                }
            },
            'performance': {
                'mappings': {
                    'properties': {
                        'timestamp': {'type': 'date'},
                        'service': {'type': 'keyword'},
                        'endpoint': {'type': 'keyword'},
                        'response_time_ms': {'type': 'integer'},
                        'cpu_usage_percent': {'type': 'float'},
                        'memory_usage_mb': {'type': 'integer'},
                        'memory_usage_percent': {'type': 'float'},
                        'requests_per_second': {'type': 'float'},
                        'concurrent_users': {'type': 'integer'},
                        'error_count': {'type': 'integer'},
                        'success_count': {'type': 'integer'}
                    }
                }
            },
            'security': {
                'mappings': {
                    'properties': {
                        'timestamp': {'type': 'date'},
                        'event_type': {'type': 'keyword'},
                        'severity': {'type': 'keyword'},
                        'client_ip': {'type': 'ip'},
                        'user_id': {'type': 'keyword'},
                        'session_id': {'type': 'keyword'},
                        'user_agent': {'type': 'text'},
                        'threat_level': {'type': 'keyword'},
                        'blocked': {'type': 'boolean'},
                        'details': {'type': 'object'},
                        'geolocation': {
                            'properties': {
                                'country': {'type': 'keyword'},
                                'city': {'type': 'keyword'},
                                'lat': {'type': 'float'},
                                'lon': {'type': 'float'}
                            }
                        }
                    }
                }
            },
            'user_activity': {
                'mappings': {
                    'properties': {
                        'timestamp': {'type': 'date'},
                        'user_id': {'type': 'keyword'},
                        'session_id': {'type': 'keyword'},
                        'action': {'type': 'keyword'},
                        'endpoint': {'type': 'keyword'},
                        'duration_ms': {'type': 'integer'},
                        'client_ip': {'type': 'ip'},
                        'user_agent': {'type': 'text'},
                        'success': {'type': 'boolean'},
                        'error_message': {'type': 'text'},
                        'metadata': {'type': 'object'}
                    }
                }
            }
        }
        
        for index_type, mapping in indices.items():
            index_name = f"{self.config['elasticsearch']['index_prefix']}-{index_type}"
            
            try:
                if not await self.es_client.indices.exists(index=index_name):
                    await self.es_client.indices.create(
                        index=index_name,
                        body=mapping
                    )
                    self.logger.info(f"Created index: {index_name}")
                else:
                    self.logger.info(f"Index exists: {index_name}")
                    
            except Exception as e:
                self.logger.error(f"Failed to create index {index_name}: {e}")
    
    async def _start_websocket_server(self):
        """Start WebSocket server for real-time streaming."""
        async def handle_client(websocket, path):
            self.active_connections.add(websocket)
            client_ip = websocket.remote_address[0]
            self.logger.info(f"New WebSocket connection from {client_ip}")
            
            try:
                await websocket.send(json.dumps({
                    'type': 'connection_established',
                    'message': 'Connected to ROMAI Real-time Analytics',
                    'timestamp': datetime.utcnow().isoformat(),
                    'client_count': len(self.active_connections)
                }))
                
                async for message in websocket:
                    try:
                        data = json.loads(message)
                        await self._handle_websocket_message(websocket, data)
                    except json.JSONDecodeError:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': 'Invalid JSON format'
                        }))
                        
            except websockets.exceptions.ConnectionClosed:
                pass
            except Exception as e:
                self.logger.error(f"WebSocket error: {e}")
            finally:
                self.active_connections.discard(websocket)
                self.logger.info(f"WebSocket connection closed for {client_ip}")
        
        start_server = websockets.serve(
            handle_client,
            self.config['websocket']['host'],
            self.config['websocket']['port']
        )
        
        self.websocket_server = await start_server
        self.logger.info(f"WebSocket server started on ws://{self.config['websocket']['host']}:{self.config['websocket']['port']}")
    
    async def _handle_websocket_message(self, websocket, data):
        """Handle incoming WebSocket messages."""
        message_type = data.get('type')
        
        if message_type == 'subscribe':
            streams = data.get('streams', [])
            await websocket.send(json.dumps({
                'type': 'subscription_confirmed',
                'streams': streams,
                'timestamp': datetime.utcnow().isoformat()
            }))
            
        elif message_type == 'ping':
            await websocket.send(json.dumps({
                'type': 'pong',
                'timestamp': datetime.utcnow().isoformat(),
                'server_time': time.time()
            }))
            
        elif message_type == 'get_metrics':
            metrics = await self._get_current_metrics()
            await websocket.send(json.dumps({
                'type': 'metrics_snapshot',
                'data': metrics,
                'timestamp': datetime.utcnow().isoformat()
            }))
    
    async def _start_monitoring_tasks(self):
        """Start background monitoring tasks."""
        # Service health monitoring
        asyncio.create_task(self._monitor_service_health())
        
        # Log aggregation
        asyncio.create_task(self._aggregate_logs())
        
        # Performance monitoring
        asyncio.create_task(self._monitor_performance())
        
        # Security monitoring
        asyncio.create_task(self._monitor_security())
        
        # Real-time streaming
        asyncio.create_task(self._stream_real_time_data())
        
        self.logger.info("All monitoring tasks started")
    
    async def _monitor_service_health(self):
        """Monitor health of ROMAI services."""
        while True:
            try:
                for service_name, service_url in self.config['romai_services'].items():
                    health_data = await self._check_service_health(service_name, service_url)
                    
                    # Store in Elasticsearch
                    await self._store_health_data(service_name, health_data)
                    
                    # Cache for real-time dashboard
                    self.metrics_cache[f"health_{service_name}"] = health_data
                    
                    # Broadcast to WebSocket clients
                    await self._broadcast_to_websockets({
                        'stream_type': 'health',
                        'service': service_name,
                        'data': health_data,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                
                await asyncio.sleep(self.config['monitoring']['metrics_interval_seconds'])
                
            except Exception as e:
                self.logger.error(f"Service health monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _check_service_health(self, service_name: str, service_url: str) -> Dict[str, Any]:
        """Check health of a specific service."""
        try:
            start_time = time.time()
            
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{service_url}/health", timeout=5) as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        health_data = await response.json()
                        health_data.update({
                            'status': 'healthy',
                            'response_time_ms': response_time,
                            'last_check': datetime.utcnow().isoformat()
                        })
                        return health_data
                    else:
                        return {
                            'status': 'unhealthy',
                            'status_code': response.status,
                            'response_time_ms': response_time,
                            'last_check': datetime.utcnow().isoformat()
                        }
                        
        except asyncio.TimeoutError:
            return {
                'status': 'timeout',
                'error': 'Health check timeout',
                'last_check': datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'last_check': datetime.utcnow().isoformat()
            }
    
    async def _store_health_data(self, service_name: str, health_data: Dict[str, Any]):
        """Store health data in Elasticsearch."""
        try:
            document = {
                'timestamp': datetime.utcnow(),
                'service': service_name,
                'metric_name': 'service_health',
                'metric_type': 'health',
                **health_data
            }
            
            index_name = f"{self.config['elasticsearch']['index_prefix']}-metrics"
            await self.es_client.index(
                index=index_name,
                body=document
            )
            
        except Exception as e:
            self.logger.error(f"Failed to store health data: {e}")
    
    async def _aggregate_logs(self):
        """Aggregate and process logs from various sources."""
        while True:
            try:
                # Simulate log aggregation from ROMAI services
                log_entries = await self._collect_service_logs()
                
                for log_entry in log_entries:
                    # Store in Elasticsearch
                    await self._store_log_entry(log_entry)
                    
                    # Broadcast to WebSocket clients
                    await self._broadcast_to_websockets({
                        'stream_type': 'logs',
                        'service': log_entry.get('service', 'unknown'),
                        'data': log_entry,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                
                await asyncio.sleep(2)
                
            except Exception as e:
                self.logger.error(f"Log aggregation error: {e}")
                await asyncio.sleep(5)
    
    async def _collect_service_logs(self) -> List[Dict[str, Any]]:
        """Collect logs from ROMAI services."""
        logs = []
        
        # Simulate various log types
        services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory']
        levels = ['INFO', 'WARN', 'ERROR', 'DEBUG']
        
        for service in services:
            if time.time() % 10 < 5:  # Simulate intermittent logging
                log_entry = {
                    'service': service,
                    'level': levels[int(time.time()) % len(levels)],
                    'message': f"Sample log message from {service}",
                    'timestamp': datetime.utcnow().isoformat(),
                    'response_time_ms': int(50 + (time.time() % 200)),
                    'endpoint': f"/api/{service.split('-')[1]}/action",
                    'method': 'POST',
                    'status_code': 200 if time.time() % 10 > 1 else 500,
                    'user_id': f"user_{int(time.time()) % 100}",
                    'session_id': f"session_{int(time.time() / 10)}",
                    'client_ip': f"192.168.1.{int(time.time()) % 255}"
                }
                logs.append(log_entry)
        
        return logs
    
    async def _store_log_entry(self, log_entry: Dict[str, Any]):
        """Store log entry in Elasticsearch."""
        try:
            index_name = f"{self.config['elasticsearch']['index_prefix']}-logs"
            await self.es_client.index(
                index=index_name,
                body=log_entry
            )
            
        except Exception as e:
            self.logger.error(f"Failed to store log entry: {e}")
    
    async def _monitor_performance(self):
        """Monitor performance metrics."""
        while True:
            try:
                performance_data = await self._collect_performance_metrics()
                
                # Store in Elasticsearch
                await self._store_performance_data(performance_data)
                
                # Broadcast to WebSocket clients
                await self._broadcast_to_websockets({
                    'stream_type': 'performance',
                    'service': 'system',
                    'data': performance_data,
                    'timestamp': datetime.utcnow().isoformat()
                })
                
                await asyncio.sleep(self.config['monitoring']['metrics_interval_seconds'])
                
            except Exception as e:
                self.logger.error(f"Performance monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _collect_performance_metrics(self) -> Dict[str, Any]:
        """Collect system performance metrics."""
        # Simulate performance metrics
        import psutil
        
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            performance_data = {
                'cpu_usage_percent': cpu_percent,
                'memory_usage_mb': memory.used // (1024 * 1024),
                'memory_usage_percent': memory.percent,
                'requests_per_second': 15 + (time.time() % 10),
                'response_time_avg': 50 + int(time.time() % 100),
                'concurrent_users': int(10 + (time.time() % 50)),
                'error_count': int(time.time() % 5),
                'success_count': int(50 + (time.time() % 100))
            }
            
            return performance_data
            
        except ImportError:
            # Fallback if psutil not available
            return {
                'cpu_usage_percent': 25 + (time.time() % 50),
                'memory_usage_mb': 1024 + int(time.time() % 2048),
                'memory_usage_percent': 45 + (time.time() % 40),
                'requests_per_second': 15 + (time.time() % 10),
                'response_time_avg': 50 + int(time.time() % 100),
                'concurrent_users': int(10 + (time.time() % 50)),
                'error_count': int(time.time() % 5),
                'success_count': int(50 + (time.time() % 100))
            }
    
    async def _store_performance_data(self, performance_data: Dict[str, Any]):
        """Store performance data in Elasticsearch."""
        try:
            document = {
                'timestamp': datetime.utcnow(),
                'service': 'romai-system',
                **performance_data
            }
            
            index_name = f"{self.config['elasticsearch']['index_prefix']}-performance"
            await self.es_client.index(
                index=index_name,
                body=document
            )
            
        except Exception as e:
            self.logger.error(f"Failed to store performance data: {e}")
    
    async def _monitor_security(self):
        """Monitor security events."""
        while True:
            try:
                security_events = await self._collect_security_events()
                
                for event in security_events:
                    # Store in Elasticsearch
                    await self._store_security_event(event)
                    
                    # Broadcast to WebSocket clients
                    await self._broadcast_to_websockets({
                        'stream_type': 'security',
                        'service': 'security',
                        'data': event,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                    
                    # Check for alerts
                    await self._check_security_alerts(event)
                
                await asyncio.sleep(10)
                
            except Exception as e:
                self.logger.error(f"Security monitoring error: {e}")
                await asyncio.sleep(15)
    
    async def _collect_security_events(self) -> List[Dict[str, Any]]:
        """Collect security events."""
        events = []
        
        # Simulate security events
        if time.time() % 30 < 5:  # Occasional security events
            event_types = ['login_attempt', 'failed_login', 'api_access', 'unauthorized_access']
            threat_levels = ['low', 'medium', 'high']
            
            event = {
                'event_type': event_types[int(time.time()) % len(event_types)],
                'severity': 'medium',
                'client_ip': f"192.168.1.{int(time.time()) % 255}",
                'user_id': f"user_{int(time.time()) % 100}",
                'threat_level': threat_levels[int(time.time()) % len(threat_levels)],
                'blocked': time.time() % 10 > 7,
                'details': {
                    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'endpoint': '/api/auth/login',
                    'method': 'POST'
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            events.append(event)
        
        return events
    
    async def _store_security_event(self, event: Dict[str, Any]):
        """Store security event in Elasticsearch."""
        try:
            index_name = f"{self.config['elasticsearch']['index_prefix']}-security"
            await self.es_client.index(
                index=index_name,
                body=event
            )
            
        except Exception as e:
            self.logger.error(f"Failed to store security event: {e}")
    
    async def _check_security_alerts(self, event: Dict[str, Any]):
        """Check for security alerts and trigger notifications."""
        if event.get('threat_level') == 'high':
            alert = {
                'type': 'security_alert',
                'severity': 'high',
                'message': f"High threat level detected: {event.get('event_type')}",
                'event': event,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Broadcast alert
            await self._broadcast_to_websockets(alert)
            
            # Store alert
            await self._store_alert(alert)
    
    async def _store_alert(self, alert: Dict[str, Any]):
        """Store alert in Elasticsearch."""
        try:
            index_name = f"{self.config['elasticsearch']['index_prefix']}-alerts"
            await self.es_client.index(
                index=index_name,
                body=alert
            )
            
        except Exception as e:
            self.logger.error(f"Failed to store alert: {e}")
    
    async def _stream_real_time_data(self):
        """Stream real-time data to WebSocket clients."""
        while True:
            try:
                if self.active_connections:
                    # Generate sample real-time data
                    sample_data = {
                        'stream_type': 'metrics',
                        'service': 'romai-system',
                        'data': {
                            'active_connections': len(self.active_connections),
                            'timestamp': datetime.utcnow().isoformat(),
                            'system_load': time.time() % 100,
                            'memory_usage': 50 + (time.time() % 30),
                            'request_rate': 10 + (time.time() % 20)
                        },
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    
                    await self._broadcast_to_websockets(sample_data)
                
                await asyncio.sleep(2)
                
            except Exception as e:
                self.logger.error(f"Real-time streaming error: {e}")
                await asyncio.sleep(5)
    
    async def _broadcast_to_websockets(self, data: Dict[str, Any]):
        """Broadcast data to all WebSocket connections."""
        if not self.active_connections:
            return
        
        message = json.dumps(data)
        disconnected_clients = set()
        
        for websocket in self.active_connections:
            try:
                await websocket.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(websocket)
            except Exception as e:
                self.logger.error(f"Failed to send WebSocket message: {e}")
                disconnected_clients.add(websocket)
        
        # Remove disconnected clients
        self.active_connections -= disconnected_clients
    
    async def _get_current_metrics(self) -> Dict[str, Any]:
        """Get current metrics snapshot."""
        return {
            'active_connections': len(self.active_connections),
            'system_health': 'good',
            'uptime_seconds': time.time() - getattr(self, 'start_time', time.time()),
            'metrics_cache_size': len(self.metrics_cache),
            'last_update': datetime.utcnow().isoformat()
        }
    
    async def run(self):
        """Run the analytics integrator."""
        self.start_time = time.time()
        
        try:
            await self.initialize()
            self.logger.info("ROMAI Analytics Integration running...")
            
            # Keep the main loop running
            while True:
                await asyncio.sleep(1)
                
        except KeyboardInterrupt:
            self.logger.info("Shutting down...")
        except Exception as e:
            self.logger.error(f"Runtime error: {e}")
        finally:
            await self.cleanup()
    
    async def cleanup(self):
        """Cleanup resources."""
        try:
            if self.websocket_server:
                self.websocket_server.close()
                await self.websocket_server.wait_closed()
            
            if self.es_client:
                await self.es_client.close()
            
            if self.redis_client:
                await self.redis_client.close()
            
            self.logger.info("Cleanup completed")
            
        except Exception as e:
            self.logger.error(f"Cleanup error: {e}")


async def main():
    """Main entry point."""
    integrator = RomaiAnalyticsIntegrator()
    await integrator.run()


if __name__ == "__main__":
    asyncio.run(main())
