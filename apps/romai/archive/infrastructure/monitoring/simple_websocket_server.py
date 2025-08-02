#!/usr/bin/env python3
"""
Simple Real-time WebSocket Streaming Server
Lightweight version for testing without Elasticsearch dependency.
"""

import asyncio
import websockets
import json
import logging
import time
import random
from datetime import datetime
from typing import Set, Dict, Any

class SimpleStreamingServer:
    """
    Simple WebSocket streaming server for real-time analytics.
    """
    
    def __init__(self):
        self.logger = self._setup_logging()
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.is_running = False
        
    def _setup_logging(self) -> logging.Logger:
        """Setup logging."""
        logger = logging.getLogger('simple_streaming')
        logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    async def register_client(self, websocket):
        """Register a new client."""
        try:
            self.clients.add(websocket)
            client_ip = websocket.remote_address[0] if websocket.remote_address else 'unknown'
            self.logger.info(f"New client connected from {client_ip}. Total clients: {len(self.clients)}")
            
            # Send welcome message
            await self.send_to_client(websocket, {
                'type': 'connection_established',
                'message': 'Connected to ROMAI Real-time Analytics',
                'timestamp': datetime.utcnow().isoformat(),
                'client_count': len(self.clients)
            })
        except Exception as e:
            self.logger.error(f"Error registering client: {e}")
    
    async def unregister_client(self, websocket):
        """Unregister a client."""
        self.clients.discard(websocket)
        self.logger.info(f"Client disconnected. Total clients: {len(self.clients)}")
    
    async def send_to_client(self, websocket, data: Dict):
        """Send data to a specific client."""
        try:
            await websocket.send(json.dumps(data))
        except websockets.exceptions.ConnectionClosed:
            await self.unregister_client(websocket)
        except Exception as e:
            self.logger.error(f"Error sending to client: {e}")
    
    async def broadcast(self, data: Dict):
        """Broadcast data to all connected clients."""
        if not self.clients:
            return
        
        message = json.dumps(data)
        disconnected = set()
        
        for client in self.clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)
            except Exception as e:
                self.logger.error(f"Broadcast error: {e}")
                disconnected.add(client)
        
        # Remove disconnected clients
        for client in disconnected:
            await self.unregister_client(client)
    
    async def handle_client_message(self, websocket, data: Dict):
        """Handle incoming client messages."""
        try:
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send_to_client(websocket, {
                    'type': 'pong',
                    'timestamp': datetime.utcnow().isoformat(),
                    'server_time': time.time()
                })
            elif message_type == 'subscribe':
                streams = data.get('streams', [])
                await self.send_to_client(websocket, {
                    'type': 'subscription_confirmed',
                    'streams': streams,
                    'timestamp': datetime.utcnow().isoformat(),
                    'message': f'Subscribed to {len(streams)} streams'
                })
            elif message_type == 'get_status':
                await self.send_to_client(websocket, {
                    'type': 'status',
                    'connected_clients': len(self.clients),
                    'server_uptime': time.time() - getattr(self, 'start_time', time.time()),
                    'timestamp': datetime.utcnow().isoformat()
                })
        except Exception as e:
            self.logger.error(f"Error handling client message: {e}")
    
    async def handle_client(self, websocket):
        """Handle client connections."""
        await self.register_client(websocket)
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self.handle_client_message(websocket, data)
                except json.JSONDecodeError:
                    await self.send_to_client(websocket, {
                        'type': 'error',
                        'message': 'Invalid JSON format'
                    })
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            self.logger.error(f"Client handler error: {e}")
        finally:
            await self.unregister_client(websocket)
    
    def generate_sample_log(self) -> Dict[str, Any]:
        """Generate sample log data."""
        services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory', 'romai-core']
        levels = ['INFO', 'WARN', 'ERROR', 'DEBUG']
        endpoints = ['/api/chat', '/api/auth', '/api/users', '/api/health', '/api/analytics']
        
        service = random.choice(services)
        level = random.choice(levels)
        
        return {
            'stream_type': 'logs',
            'service': service,
            'data': {
                'level': level,
                'message': f'Sample {level} message from {service}',
                'response_time_ms': random.randint(10, 500),
                'endpoint': random.choice(endpoints),
                'method': random.choice(['GET', 'POST', 'PUT', 'DELETE']),
                'status_code': 200 if level != 'ERROR' else random.choice([400, 401, 403, 404, 500]),
                'user_id': f'user_{random.randint(1, 100)}',
                'session_id': f'session_{random.randint(1, 50)}',
                'client_ip': f'192.168.1.{random.randint(1, 255)}'
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def generate_sample_metrics(self) -> Dict[str, Any]:
        """Generate sample metrics data."""
        return {
            'stream_type': 'metrics',
            'service': 'romai-system',
            'data': {
                'cpu_usage_percent': round(random.uniform(10, 90), 2),
                'memory_usage_mb': random.randint(512, 4096),
                'memory_usage_percent': round(random.uniform(30, 85), 2),
                'requests_per_second': round(random.uniform(5, 50), 2),
                'active_connections': len(self.clients),
                'response_time_avg': random.randint(50, 300),
                'disk_usage_percent': round(random.uniform(40, 80), 2)
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def generate_sample_performance(self) -> Dict[str, Any]:
        """Generate sample performance data."""
        return {
            'stream_type': 'performance',
            'service': random.choice(['romai-api', 'romai-dashboard', 'romai-mcp']),
            'data': {
                'response_time_ms': random.randint(20, 800),
                'throughput_rps': round(random.uniform(10, 100), 2),
                'error_rate_percent': round(random.uniform(0, 5), 2),
                'concurrent_users': random.randint(5, 100),
                'database_query_time_ms': random.randint(1, 50),
                'cache_hit_rate_percent': round(random.uniform(70, 95), 2)
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def generate_sample_security(self) -> Dict[str, Any]:
        """Generate sample security data."""
        event_types = ['login_attempt', 'api_access', 'failed_login', 'suspicious_activity']
        threat_levels = ['low', 'medium', 'high']
        
        return {
            'stream_type': 'security',
            'service': 'romai-security',
            'data': {
                'event_type': random.choice(event_types),
                'threat_level': random.choice(threat_levels),
                'client_ip': f'192.168.1.{random.randint(1, 255)}',
                'user_id': f'user_{random.randint(1, 100)}',
                'blocked': random.choice([True, False]),
                'severity': random.choice(['low', 'medium', 'high', 'critical']),
                'details': {
                    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'endpoint': '/api/auth/login',
                    'method': 'POST'
                }
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    async def data_generator(self):
        """Generate and broadcast sample data."""
        while self.is_running:
            try:
                if self.clients:
                    # Generate different types of data
                    generators = [
                        self.generate_sample_log,
                        self.generate_sample_metrics,
                        self.generate_sample_performance,
                        self.generate_sample_security
                    ]
                    
                    # Send multiple data points
                    for _ in range(random.randint(1, 3)):
                        generator = random.choice(generators)
                        data = generator()
                        await self.broadcast(data)
                        await asyncio.sleep(random.uniform(0.1, 0.5))
                
                await asyncio.sleep(random.uniform(1, 3))
                
            except Exception as e:
                self.logger.error(f"Data generator error: {e}")
                await asyncio.sleep(1)
    
    async def start_server(self, host='localhost', port=8767):
        """Start the WebSocket server."""
        self.start_time = time.time()
        self.is_running = True
        
        # Start data generator
        asyncio.create_task(self.data_generator())
        
        # Start WebSocket server
        self.logger.info(f"Starting real-time streaming server on {host}:{port}")
        
        async with websockets.serve(self.handle_client, host, port):
            self.logger.info(f"✅ Server running on ws://{host}:{port}")
            self.logger.info("Server is ready to accept connections...")
            
            # Keep the server running
            while self.is_running:
                await asyncio.sleep(1)
    
    def stop_server(self):
        """Stop the server."""
        self.is_running = False
        self.logger.info("Server stopping...")


async def main():
    """Main entry point."""
    server = SimpleStreamingServer()
    
    try:
        await server.start_server()
    except KeyboardInterrupt:
        print("\n🛑 Server interrupted by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
    finally:
        server.stop_server()
        print("✅ Server stopped")


if __name__ == "__main__":
    asyncio.run(main())
