# ROMAI Real-time Log Streaming Server
# WebSocket-based live log streaming with Elasticsearch integration

import asyncio
import websockets
import json
import logging
import time
from datetime import datetime, timezone
from elasticsearch import AsyncElasticsearch
from typing import Dict, List, Set, Optional
import uuid
import os
from dataclasses import dataclass, asdict
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class StreamType(Enum):
    LOGS = "logs"
    METRICS = "metrics"
    ALERTS = "alerts"
    PERFORMANCE = "performance"
    SECURITY = "security"

@dataclass
class StreamMessage:
    id: str
    timestamp: str
    stream_type: StreamType
    service: str
    data: Dict
    correlation_id: Optional[str] = None
    
    def to_json(self) -> str:
        return json.dumps({
            **asdict(self),
            'stream_type': self.stream_type.value
        })

class RealTimeLogStreamer:
    def __init__(self):
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.elasticsearch_client = None
        self.running = False
        self.stream_interval = 2  # seconds
        
        # Elasticsearch configuration
        self.es_config = {
            'hosts': [os.getenv('ELASTICSEARCH_HOST', 'http://localhost:9200')],
            'http_auth': ('elastic', os.getenv('ELASTIC_PASSWORD', 'elastic_secure_2025')),
            'verify_certs': False,
            'ssl_show_warn': False
        }
        
    async def initialize_elasticsearch(self):
        """Initialize Elasticsearch connection"""
        try:
            self.elasticsearch_client = AsyncElasticsearch(**self.es_config)
            
            # Test connection
            health = await self.elasticsearch_client.cluster.health()
            logger.info(f"Elasticsearch connection established: {health['status']}")
            
            # Create real-time indices if they don't exist
            await self.create_realtime_indices()
            
        except Exception as e:
            logger.error(f"Failed to connect to Elasticsearch: {e}")
            self.elasticsearch_client = None

    async def create_realtime_indices(self):
        """Create indices for real-time streaming"""
        indices = [
            'romai-realtime-logs',
            'romai-realtime-metrics',
            'romai-realtime-alerts',
            'romai-realtime-performance',
            'romai-realtime-security'
        ]
        
        index_settings = {
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "refresh_interval": "1s",  # Fast refresh for real-time
                "index.mapping.total_fields.limit": 2000
            },
            "mappings": {
                "properties": {
                    "@timestamp": {"type": "date"},
                    "service": {"type": "keyword"},
                    "level": {"type": "keyword"},
                    "message": {"type": "text"},
                    "correlation_id": {"type": "keyword"},
                    "response_time_ms": {"type": "float"},
                    "error_code": {"type": "keyword"},
                    "client_ip": {"type": "ip"},
                    "user_id": {"type": "keyword"},
                    "endpoint": {"type": "keyword"},
                    "http_method": {"type": "keyword"},
                    "status_code": {"type": "integer"},
                    "geoip": {
                        "properties": {
                            "city_name": {"type": "keyword"},
                            "country_name": {"type": "keyword"},
                            "location": {"type": "geo_point"}
                        }
                    }
                }
            }
        }
        
        for index in indices:
            try:
                exists = await self.elasticsearch_client.indices.exists(index=index)
                if not exists:
                    await self.elasticsearch_client.indices.create(
                        index=index,
                        body=index_settings
                    )
                    logger.info(f"Created real-time index: {index}")
                else:
                    logger.info(f"Real-time index already exists: {index}")
            except Exception as e:
                logger.error(f"Failed to create index {index}: {e}")

    async def register_client(self, websocket: websockets.WebSocketServerProtocol):
        """Register a new WebSocket client"""
        self.clients.add(websocket)
        logger.info(f"Client registered. Total clients: {len(self.clients)}")
        
        # Send welcome message
        welcome_msg = StreamMessage(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc).isoformat(),
            stream_type=StreamType.LOGS,
            service="streaming-server",
            data={
                "type": "welcome",
                "message": "Connected to ROMAI real-time log stream",
                "client_count": len(self.clients)
            }
        )
        
        try:
            await websocket.send(welcome_msg.to_json())
        except websockets.exceptions.ConnectionClosed:
            self.clients.discard(websocket)

    async def unregister_client(self, websocket: websockets.WebSocketServerProtocol):
        """Unregister a WebSocket client"""
        self.clients.discard(websocket)
        logger.info(f"Client unregistered. Total clients: {len(self.clients)}")

    async def broadcast_message(self, message: StreamMessage):
        """Broadcast message to all connected clients"""
        if not self.clients:
            return
            
        # Store message in Elasticsearch
        await self.store_message_in_elasticsearch(message)
        
        # Broadcast to WebSocket clients
        disconnected_clients = set()
        for client in self.clients:
            try:
                await client.send(message.to_json())
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        for client in disconnected_clients:
            self.clients.discard(client)

    async def store_message_in_elasticsearch(self, message: StreamMessage):
        """Store streaming message in Elasticsearch for persistence"""
        if not self.elasticsearch_client:
            return
            
        try:
            index_name = f"romai-realtime-{message.stream_type.value}"
            
            doc = {
                "@timestamp": message.timestamp,
                "stream_id": message.id,
                "stream_type": message.stream_type.value,
                "service": message.service,
                "correlation_id": message.correlation_id,
                **message.data
            }
            
            await self.elasticsearch_client.index(
                index=index_name,
                body=doc
            )
            
        except Exception as e:
            logger.error(f"Failed to store message in Elasticsearch: {e}")

    async def generate_sample_data(self):
        """Generate sample real-time data for demonstration"""
        services = ['romai-api', 'romai-mcp', 'romai-dashboard', 'romai-auth']
        log_levels = ['INFO', 'WARN', 'ERROR', 'DEBUG']
        endpoints = ['/api/chat', '/api/users', '/mcp/tools', '/dashboard/metrics', '/auth/login']
        
        while self.running:
            try:
                # Generate log message
                service = services[int(time.time()) % len(services)]
                level = log_levels[int(time.time() * 2) % len(log_levels)]
                endpoint = endpoints[int(time.time() * 3) % len(endpoints)]
                
                correlation_id = str(uuid.uuid4())
                response_time = 50 + (int(time.time()) % 500)  # 50-550ms
                
                log_message = StreamMessage(
                    id=str(uuid.uuid4()),
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    stream_type=StreamType.LOGS,
                    service=service,
                    correlation_id=correlation_id,
                    data={
                        "level": level,
                        "message": f"API Request: GET {endpoint} - Response time: {response_time}ms",
                        "endpoint": endpoint,
                        "http_method": "GET",
                        "response_time_ms": response_time,
                        "status_code": 200 if level != "ERROR" else 500,
                        "client_ip": f"192.168.1.{(int(time.time()) % 254) + 1}",
                        "user_id": f"user_{int(time.time()) % 100}"
                    }
                )
                
                await self.broadcast_message(log_message)
                
                # Generate performance metrics
                if int(time.time()) % 3 == 0:  # Every 3rd iteration
                    perf_message = StreamMessage(
                        id=str(uuid.uuid4()),
                        timestamp=datetime.now(timezone.utc).isoformat(),
                        stream_type=StreamType.PERFORMANCE,
                        service=service,
                        correlation_id=correlation_id,
                        data={
                            "cpu_usage": round(20 + (int(time.time()) % 60), 2),
                            "memory_usage": round(30 + (int(time.time()) % 40), 2),
                            "response_time_avg": response_time,
                            "requests_per_second": 10 + (int(time.time()) % 90),
                            "error_rate": round((int(time.time()) % 10) / 100, 3)
                        }
                    )
                    
                    await self.broadcast_message(perf_message)
                
                # Generate security events occasionally
                if int(time.time()) % 10 == 0:  # Every 10th iteration
                    security_message = StreamMessage(
                        id=str(uuid.uuid4()),
                        timestamp=datetime.now(timezone.utc).isoformat(),
                        stream_type=StreamType.SECURITY,
                        service="romai-auth",
                        correlation_id=correlation_id,
                        data={
                            "event_type": "login_attempt" if int(time.time()) % 2 == 0 else "failed_login",
                            "user_id": f"user_{int(time.time()) % 100}",
                            "client_ip": f"10.0.0.{(int(time.time()) % 254) + 1}",
                            "success": int(time.time()) % 2 == 0,
                            "threat_level": "low" if int(time.time()) % 2 == 0 else "medium"
                        }
                    )
                    
                    await self.broadcast_message(security_message)
                
                await asyncio.sleep(self.stream_interval)
                
            except Exception as e:
                logger.error(f"Error generating sample data: {e}")
                await asyncio.sleep(1)

    async def handle_client(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """Handle individual WebSocket client connection"""
        await self.register_client(websocket)
        
        try:
            # Listen for client messages (for filtering, subscriptions, etc.)
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self.handle_client_message(websocket, data)
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received from client: {message}")
                except Exception as e:
                    logger.error(f"Error handling client message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info("Client connection closed")
        finally:
            await self.unregister_client(websocket)

    async def handle_client_message(self, websocket: websockets.WebSocketServerProtocol, data: Dict):
        """Handle messages from WebSocket clients"""
        message_type = data.get('type')
        
        if message_type == 'subscribe':
            # Handle stream subscription
            stream_types = data.get('streams', [])
            logger.info(f"Client subscribed to streams: {stream_types}")
            
        elif message_type == 'filter':
            # Handle filtering requests
            filters = data.get('filters', {})
            logger.info(f"Client applied filters: {filters}")
            
        elif message_type == 'ping':
            # Handle ping/pong for connection health
            pong_msg = StreamMessage(
                id=str(uuid.uuid4()),
                timestamp=datetime.now(timezone.utc).isoformat(),
                stream_type=StreamType.LOGS,
                service="streaming-server",
                data={"type": "pong", "timestamp": time.time()}
            )
            await websocket.send(pong_msg.to_json())

    async def start_server(self, host: str = "localhost", port: int = 8765):
        """Start the WebSocket streaming server"""
        logger.info(f"Starting real-time streaming server on {host}:{port}")
        
        # Initialize Elasticsearch connection
        await self.initialize_elasticsearch()
        
        # Start the server
        self.running = True
        
        # Start sample data generation
        asyncio.create_task(self.generate_sample_data())
        
        # Start WebSocket server
        async with websockets.serve(self.handle_client, host, port):
            logger.info(f"Real-time streaming server started on ws://{host}:{port}")
            await asyncio.Future()  # Run forever

    def stop_server(self):
        """Stop the streaming server"""
        self.running = False
        logger.info("Streaming server stopped")

async def main():
    """Main entry point for the streaming server"""
    streamer = RealTimeLogStreamer()
    
    try:
        await streamer.start_server()
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
        streamer.stop_server()
    except Exception as e:
        logger.error(f"Server error: {e}")
        streamer.stop_server()

if __name__ == "__main__":
    asyncio.run(main())
