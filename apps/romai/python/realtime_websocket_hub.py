"""
RomAI AGI - Real-time WebSocket Hub
Week 3 Day 3: Real-time Intelligence & Live Updates

Central communication system for live agent coordination with Romanian cultural intelligence.
Provides WebSocket server for real-time connections, agent-to-agent communication, and 
cultural message routing with advanced Romanian context awareness.
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Set, Any, Optional, Callable
from enum import Enum
from dataclasses import dataclass, asdict
from uuid import uuid4
import websockets
import aiohttp
from websockets.server import WebSocketServerProtocol

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionType(Enum):
    AGENT = "agent"
    USER = "user"
    DASHBOARD = "dashboard"
    SYSTEM = "system"

class MessageType(Enum):
    AGENT_COMMUNICATION = "agent_communication"
    TASK_UPDATE = "task_update"
    CULTURAL_INSIGHT = "cultural_insight"
    PERFORMANCE_METRIC = "performance_metric"
    USER_INTERACTION = "user_interaction"
    SYSTEM_EVENT = "system_event"
    ROMANIAN_ANALYSIS = "romanian_analysis"
    COLLABORATION_REQUEST = "collaboration_request"

class MessagePriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4
    ROMANIAN_CULTURAL = 5

@dataclass
class WebSocketConnection:
    websocket: WebSocketServerProtocol
    connection_id: str
    connection_type: ConnectionType
    connected_at: datetime
    last_activity: datetime
    user_id: Optional[str] = None
    agent_id: Optional[str] = None
    capabilities: List[str] = None
    romanian_context_level: float = 0.0
    
    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = []

@dataclass
class RealTimeMessage:
    message_id: str
    message_type: MessageType
    priority: MessagePriority
    sender_id: str
    target_id: Optional[str]
    content: Dict[str, Any]
    romanian_context_score: float
    created_at: datetime
    broadcast: bool = False
    processed: bool = False
    
    def to_json(self) -> str:
        """Convert message to JSON for WebSocket transmission."""
        return json.dumps({
            "message_id": self.message_id,
            "message_type": self.message_type.value,
            "priority": self.priority.value,
            "sender_id": self.sender_id,
            "target_id": self.target_id,
            "content": self.content,
            "romanian_context_score": self.romanian_context_score,
            "created_at": self.created_at.isoformat(),
            "broadcast": self.broadcast,
            "timestamp": datetime.now().isoformat()
        })

class RealTimeWebSocketHub:
    """
    Advanced WebSocket hub for real-time Romanian AGI coordination.
    Handles agent communication, cultural message routing, and live collaboration.
    """
    
    def __init__(self, host: str = "localhost", port: int = 8080, cbd_url: str = "http://localhost:4180"):
        self.host = host
        self.port = port
        self.cbd_url = cbd_url
        
        # Connection management
        self.connections: Dict[str, WebSocketConnection] = {}
        self.agent_connections: Dict[str, str] = {}  # agent_id -> connection_id
        self.user_connections: Dict[str, str] = {}   # user_id -> connection_id
        
        # Message handling
        self.message_queue: List[RealTimeMessage] = []
        self.message_handlers: Dict[MessageType, Callable] = {}
        self.broadcast_channels: Dict[str, Set[str]] = {}  # channel -> connection_ids
        
        # Romanian cultural context
        self.cultural_keywords = {
            "urgent": ["urgență", "urgent", "imediat", "acum"],
            "cultural": ["cultură", "tradiție", "folclor", "patrimoniu", "identitate"],
            "language": ["română", "românesc", "linguistic", "gramatică", "diacritice"],
            "regions": ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea"],
            "celebrations": ["Crăciun", "Paște", "Rusalii", "Bobotează", "mărțișor"]
        }
        
        # Performance metrics
        self.hub_metrics = {
            "total_connections": 0,
            "active_connections": 0,
            "messages_processed": 0,
            "romanian_messages": 0,
            "average_latency": 0.0,
            "error_count": 0,
            "uptime_start": datetime.now()
        }
        
        # Session management
        self.session = None
        self.server_running = False
        
    async def initialize(self):
        """Initialize the WebSocket hub."""
        self.session = aiohttp.ClientSession()
        await self._setup_message_handlers()
        await self._setup_broadcast_channels()
        logger.info(f"🚀 Real-time WebSocket Hub initialized on {self.host}:{self.port}")
    
    async def _setup_message_handlers(self):
        """Setup message type handlers."""
        self.message_handlers = {
            MessageType.AGENT_COMMUNICATION: self._handle_agent_communication,
            MessageType.TASK_UPDATE: self._handle_task_update,
            MessageType.CULTURAL_INSIGHT: self._handle_cultural_insight,
            MessageType.PERFORMANCE_METRIC: self._handle_performance_metric,
            MessageType.USER_INTERACTION: self._handle_user_interaction,
            MessageType.SYSTEM_EVENT: self._handle_system_event,
            MessageType.ROMANIAN_ANALYSIS: self._handle_romanian_analysis,
            MessageType.COLLABORATION_REQUEST: self._handle_collaboration_request
        }
    
    async def _setup_broadcast_channels(self):
        """Setup broadcast channels for different types of content."""
        self.broadcast_channels = {
            "agents": set(),
            "users": set(),
            "dashboards": set(),
            "romanian_cultural": set(),
            "performance_monitoring": set(),
            "collaboration": set()
        }
    
    async def start_server(self):
        """Start the WebSocket server."""
        try:
            self.server_running = True
            
            # Start message processing task
            asyncio.create_task(self._message_processor())
            asyncio.create_task(self._metrics_updater())
            
            # Start WebSocket server
            async with websockets.serve(
                self._handle_connection,
                self.host,
                self.port,
                ping_interval=20,
                ping_timeout=10,
                close_timeout=10
            ):
                logger.info(f"🌐 WebSocket server started on ws://{self.host}:{self.port}")
                logger.info("🎯 Ready for real-time Romanian AGI connections!")
                
                # Keep server running
                while self.server_running:
                    await asyncio.sleep(1)
                    
        except Exception as e:
            logger.error(f"❌ WebSocket server error: {str(e)}")
            self.server_running = False
    
    async def _handle_connection(self, websocket: WebSocketServerProtocol, path: str = "/"):
        """Handle new WebSocket connection."""
        connection_id = str(uuid4())
        
        try:
            # Initial connection setup
            await self._register_connection(websocket, connection_id, path)
            
            # Send welcome message
            welcome_message = {
                "type": "connection_established",
                "connection_id": connection_id,
                "server_info": {
                    "name": "RomAI AGI WebSocket Hub",
                    "version": "3.0.0",
                    "romanian_cultural_support": True,
                    "real_time_capabilities": True
                },
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send(json.dumps(welcome_message))
            
            # Handle messages
            async for raw_message in websocket:
                await self._process_incoming_message(connection_id, raw_message)
                
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"🔌 Connection {connection_id} closed")
        except Exception as e:
            logger.error(f"❌ Connection error for {connection_id}: {str(e)}")
        finally:
            await self._unregister_connection(connection_id)
    
    async def _register_connection(self, websocket: WebSocketServerProtocol, connection_id: str, path: str):
        """Register a new WebSocket connection."""
        # Determine connection type from path
        connection_type = ConnectionType.USER
        if "/agent" in path:
            connection_type = ConnectionType.AGENT
        elif "/dashboard" in path:
            connection_type = ConnectionType.DASHBOARD
        elif "/system" in path:
            connection_type = ConnectionType.SYSTEM
        
        # Create connection object
        connection = WebSocketConnection(
            websocket=websocket,
            connection_id=connection_id,
            connection_type=connection_type,
            connected_at=datetime.now(),
            last_activity=datetime.now()
        )
        
        # Store connection
        self.connections[connection_id] = connection
        
        # Add to appropriate broadcast channels
        if connection_type == ConnectionType.AGENT:
            self.broadcast_channels["agents"].add(connection_id)
        elif connection_type == ConnectionType.USER:
            self.broadcast_channels["users"].add(connection_id)
        elif connection_type == ConnectionType.DASHBOARD:
            self.broadcast_channels["dashboards"].add(connection_id)
        
        # Update metrics
        self.hub_metrics["total_connections"] += 1
        self.hub_metrics["active_connections"] = len(self.connections)
        
        logger.info(f"✅ Registered {connection_type.value} connection: {connection_id}")
        
        # Store in CBD
        await self._store_connection_in_cbd(connection)
    
    async def _unregister_connection(self, connection_id: str):
        """Unregister a WebSocket connection."""
        if connection_id in self.connections:
            connection = self.connections[connection_id]
            
            # Remove from broadcast channels
            for channel_connections in self.broadcast_channels.values():
                channel_connections.discard(connection_id)
            
            # Remove from agent/user mappings
            if connection.agent_id and connection.agent_id in self.agent_connections:
                del self.agent_connections[connection.agent_id]
            if connection.user_id and connection.user_id in self.user_connections:
                del self.user_connections[connection.user_id]
            
            # Remove connection
            del self.connections[connection_id]
            
            # Update metrics
            self.hub_metrics["active_connections"] = len(self.connections)
            
            logger.info(f"🔌 Unregistered connection: {connection_id}")
    
    async def _process_incoming_message(self, connection_id: str, raw_message: str):
        """Process incoming WebSocket message."""
        try:
            # Parse message
            message_data = json.loads(raw_message)
            
            # Calculate Romanian context score
            romanian_score = self._calculate_romanian_context_score(message_data.get("content", {}))
            
            # Create real-time message
            message = RealTimeMessage(
                message_id=str(uuid4()),
                message_type=MessageType(message_data.get("type", "user_interaction")),
                priority=MessagePriority(message_data.get("priority", 2)),
                sender_id=connection_id,
                target_id=message_data.get("target_id"),
                content=message_data.get("content", {}),
                romanian_context_score=romanian_score,
                created_at=datetime.now(),
                broadcast=message_data.get("broadcast", False)
            )
            
            # Add to message queue
            self.message_queue.append(message)
            
            # Update connection activity
            if connection_id in self.connections:
                self.connections[connection_id].last_activity = datetime.now()
            
            # Update metrics
            self.hub_metrics["messages_processed"] += 1
            if romanian_score > 0.3:
                self.hub_metrics["romanian_messages"] += 1
            
            logger.debug(f"📨 Message queued: {message.message_id} (Romanian score: {romanian_score:.2f})")
            
        except Exception as e:
            logger.error(f"❌ Error processing message from {connection_id}: {str(e)}")
            self.hub_metrics["error_count"] += 1
    
    def _calculate_romanian_context_score(self, content: Dict[str, Any]) -> float:
        """Calculate Romanian cultural context score for message content."""
        score = 0.0
        content_str = str(content).lower()
        
        # Check for Romanian cultural keywords
        for category, keywords in self.cultural_keywords.items():
            category_score = 0.0
            for keyword in keywords:
                if keyword in content_str:
                    category_score += 1.0 / len(keywords)
            
            # Weight different categories
            weight = {
                "urgent": 0.1,
                "cultural": 0.4,
                "language": 0.3,
                "regions": 0.1,
                "celebrations": 0.1
            }.get(category, 0.1)
            
            score += category_score * weight
        
        # Additional Romanian indicators
        romanian_indicators = ["românia", "român", "românesc", "bucurești", "transilvan"]
        for indicator in romanian_indicators:
            if indicator in content_str:
                score += 0.15
        
        return min(score, 1.0)
    
    async def _message_processor(self):
        """Process messages from the queue."""
        while self.server_running:
            try:
                if self.message_queue:
                    # Sort by priority and Romanian context
                    self.message_queue.sort(
                        key=lambda m: (m.priority.value, m.romanian_context_score),
                        reverse=True
                    )
                    
                    # Process highest priority message
                    message = self.message_queue.pop(0)
                    await self._route_message(message)
                
                await asyncio.sleep(0.01)  # 10ms processing interval
                
            except Exception as e:
                logger.error(f"❌ Message processor error: {str(e)}")
                await asyncio.sleep(1)
    
    async def _route_message(self, message: RealTimeMessage):
        """Route message to appropriate handlers and destinations."""
        start_time = time.time()
        
        try:
            # Handle message by type
            handler = self.message_handlers.get(message.message_type)
            if handler:
                await handler(message)
            
            # Route to target or broadcast
            if message.broadcast:
                await self._broadcast_message(message)
            elif message.target_id:
                await self._send_to_target(message)
            
            # Update latency metrics
            processing_time = (time.time() - start_time) * 1000  # ms
            if self.hub_metrics["average_latency"] == 0:
                self.hub_metrics["average_latency"] = processing_time
            else:
                self.hub_metrics["average_latency"] = (
                    self.hub_metrics["average_latency"] + processing_time
                ) / 2
            
            message.processed = True
            
            logger.debug(f"✅ Message routed: {message.message_id} ({processing_time:.1f}ms)")
            
        except Exception as e:
            logger.error(f"❌ Message routing error: {str(e)}")
            self.hub_metrics["error_count"] += 1
    
    async def _broadcast_message(self, message: RealTimeMessage):
        """Broadcast message to appropriate channels."""
        target_channels = []
        
        # Determine broadcast channels based on message type and content
        if message.message_type == MessageType.AGENT_COMMUNICATION:
            target_channels.append("agents")
        elif message.message_type == MessageType.CULTURAL_INSIGHT:
            target_channels.extend(["users", "dashboards", "romanian_cultural"])
        elif message.message_type == MessageType.PERFORMANCE_METRIC:
            target_channels.append("dashboards")
        elif message.romanian_context_score > 0.5:
            target_channels.append("romanian_cultural")
        
        # Default to users if no specific channels
        if not target_channels:
            target_channels.append("users")
        
        # Send to all connections in target channels
        for channel in target_channels:
            for connection_id in self.broadcast_channels.get(channel, set()):
                await self._send_to_connection(connection_id, message)
    
    async def _send_to_target(self, message: RealTimeMessage):
        """Send message to specific target."""
        await self._send_to_connection(message.target_id, message)
    
    async def _send_to_connection(self, connection_id: str, message: RealTimeMessage):
        """Send message to specific connection."""
        if connection_id in self.connections:
            try:
                connection = self.connections[connection_id]
                await connection.websocket.send(message.to_json())
                logger.debug(f"📤 Message sent to {connection_id}")
            except Exception as e:
                logger.error(f"❌ Failed to send message to {connection_id}: {str(e)}")
                # Connection might be dead, schedule for cleanup
                await self._unregister_connection(connection_id)
    
    # Message Handlers
    async def _handle_agent_communication(self, message: RealTimeMessage):
        """Handle agent-to-agent communication."""
        logger.debug(f"🤖 Agent communication: {message.sender_id} -> {message.target_id}")
        
        # Enhance with Romanian cultural context if needed
        if message.romanian_context_score > 0.5:
            message.content["cultural_enhancement"] = {
                "romanian_context_detected": True,
                "cultural_score": message.romanian_context_score,
                "suggested_agents": ["romanian_language_specialist", "cultural_context_agent"]
            }
    
    async def _handle_task_update(self, message: RealTimeMessage):
        """Handle task status updates."""
        logger.debug(f"📋 Task update: {message.content.get('task_id', 'unknown')}")
        
        # Store task update in CBD
        await self._store_task_update_in_cbd(message)
    
    async def _handle_cultural_insight(self, message: RealTimeMessage):
        """Handle Romanian cultural insights."""
        logger.debug(f"🧠 Cultural insight: {message.romanian_context_score:.2f} score")
        
        # Add to Romanian cultural broadcast channel
        self.broadcast_channels["romanian_cultural"].add(message.sender_id)
    
    async def _handle_performance_metric(self, message: RealTimeMessage):
        """Handle performance metrics."""
        logger.debug(f"📊 Performance metric: {message.content.get('metric_type', 'unknown')}")
        
        # Add to performance monitoring channel
        self.broadcast_channels["performance_monitoring"].add(message.sender_id)
    
    async def _handle_user_interaction(self, message: RealTimeMessage):
        """Handle user interactions."""
        logger.debug(f"👤 User interaction: {message.sender_id}")
        
        # Check if Romanian assistance is needed
        if message.romanian_context_score > 0.3:
            # Notify Romanian cultural agents
            cultural_notification = RealTimeMessage(
                message_id=str(uuid4()),
                message_type=MessageType.COLLABORATION_REQUEST,
                priority=MessagePriority.ROMANIAN_CULTURAL,
                sender_id="websocket_hub",
                target_id=None,
                content={
                    "type": "romanian_assistance_needed",
                    "original_message": message.content,
                    "cultural_score": message.romanian_context_score
                },
                romanian_context_score=1.0,
                created_at=datetime.now(),
                broadcast=True
            )
            self.message_queue.append(cultural_notification)
    
    async def _handle_system_event(self, message: RealTimeMessage):
        """Handle system events."""
        logger.debug(f"⚡ System event: {message.content.get('event_type', 'unknown')}")
    
    async def _handle_romanian_analysis(self, message: RealTimeMessage):
        """Handle Romanian language analysis requests."""
        logger.debug(f"🇷🇴 Romanian analysis: {message.romanian_context_score:.2f}")
        
        # Route to Romanian language specialist
        if "romanian_language_specialist" in self.agent_connections:
            message.target_id = self.agent_connections["romanian_language_specialist"]
    
    async def _handle_collaboration_request(self, message: RealTimeMessage):
        """Handle collaboration requests."""
        logger.debug(f"🤝 Collaboration request from: {message.sender_id}")
        
        # Add participants to collaboration channel
        self.broadcast_channels["collaboration"].add(message.sender_id)
        if message.target_id:
            self.broadcast_channels["collaboration"].add(message.target_id)
    
    async def _metrics_updater(self):
        """Update hub metrics periodically."""
        while self.server_running:
            try:
                # Calculate uptime
                uptime = datetime.now() - self.hub_metrics["uptime_start"]
                
                # Create metrics message
                metrics_message = RealTimeMessage(
                    message_id=str(uuid4()),
                    message_type=MessageType.PERFORMANCE_METRIC,
                    priority=MessagePriority.LOW,
                    sender_id="websocket_hub",
                    target_id=None,
                    content={
                        "metric_type": "hub_performance",
                        "metrics": {
                            **self.hub_metrics,
                            "uptime_seconds": uptime.total_seconds(),
                            "connections_by_type": {
                                conn_type.value: len([
                                    c for c in self.connections.values() 
                                    if c.connection_type == conn_type
                                ])
                                for conn_type in ConnectionType
                            }
                        }
                    },
                    romanian_context_score=0.0,
                    created_at=datetime.now(),
                    broadcast=True
                )
                
                self.message_queue.append(metrics_message)
                
                await asyncio.sleep(10)  # Update every 10 seconds
                
            except Exception as e:
                logger.error(f"❌ Metrics updater error: {str(e)}")
                await asyncio.sleep(30)
    
    async def _store_connection_in_cbd(self, connection: WebSocketConnection):
        """Store connection info in CBD."""
        try:
            connection_data = {
                "collection": "romai_websocket_connections",
                "document": {
                    "connection_id": connection.connection_id,
                    "connection_type": connection.connection_type.value,
                    "connected_at": connection.connected_at.isoformat(),
                    "user_id": connection.user_id,
                    "agent_id": connection.agent_id,
                    "capabilities": connection.capabilities,
                    "romanian_context_level": connection.romanian_context_level
                }
            }
            
            async with self.session.post(f"{self.cbd_url}/document", json=connection_data) as response:
                if response.status == 200:
                    logger.debug(f"✅ Connection {connection.connection_id} stored in CBD")
        
        except Exception as e:
            logger.error(f"❌ Error storing connection in CBD: {str(e)}")
    
    async def _store_task_update_in_cbd(self, message: RealTimeMessage):
        """Store task update in CBD."""
        try:
            update_data = {
                "collection": "romai_task_updates",
                "document": {
                    "message_id": message.message_id,
                    "task_id": message.content.get("task_id"),
                    "update_type": message.content.get("update_type"),
                    "status": message.content.get("status"),
                    "progress": message.content.get("progress"),
                    "cultural_score": message.romanian_context_score,
                    "timestamp": message.created_at.isoformat()
                }
            }
            
            async with self.session.post(f"{self.cbd_url}/document", json=update_data) as response:
                if response.status == 200:
                    logger.debug(f"✅ Task update stored in CBD")
        
        except Exception as e:
            logger.error(f"❌ Error storing task update in CBD: {str(e)}")
    
    def get_hub_status(self) -> Dict[str, Any]:
        """Get current hub status."""
        return {
            "server_info": {
                "host": self.host,
                "port": self.port,
                "running": self.server_running,
                "uptime": (datetime.now() - self.hub_metrics["uptime_start"]).total_seconds()
            },
            "connections": {
                "total": self.hub_metrics["total_connections"],
                "active": self.hub_metrics["active_connections"],
                "by_type": {
                    conn_type.value: len([
                        c for c in self.connections.values() 
                        if c.connection_type == conn_type
                    ])
                    for conn_type in ConnectionType
                }
            },
            "performance": {
                "messages_processed": self.hub_metrics["messages_processed"],
                "romanian_messages": self.hub_metrics["romanian_messages"],
                "average_latency_ms": self.hub_metrics["average_latency"],
                "error_count": self.hub_metrics["error_count"],
                "queue_size": len(self.message_queue)
            },
            "broadcast_channels": {
                channel: len(connections)
                for channel, connections in self.broadcast_channels.items()
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def cleanup(self):
        """Cleanup hub resources."""
        self.server_running = False
        
        # Close all connections
        for connection in self.connections.values():
            try:
                await connection.websocket.close()
            except:
                pass
        
        if self.session:
            await self.session.close()
        
        logger.info("🧹 WebSocket Hub cleanup completed")

# Example usage and testing
async def test_websocket_hub():
    """Test the WebSocket hub."""
    logger.info("🚀 Testing Real-time WebSocket Hub")
    
    hub = RealTimeWebSocketHub()
    
    try:
        await hub.initialize()
        
        # Start server in background
        server_task = asyncio.create_task(hub.start_server())
        
        # Wait a bit for server to start
        await asyncio.sleep(2)
        
        # Test WebSocket connection
        try:
            async with websockets.connect("ws://localhost:8080/user") as websocket:
                # Send test message
                test_message = {
                    "type": "user_interaction",
                    "priority": 3,
                    "content": {
                        "text": "Salut! Vreau să aflu despre tradițiile românești din Transilvania.",
                        "user_id": "test_user_001"
                    }
                }
                
                await websocket.send(json.dumps(test_message))
                logger.info("📤 Sent test message with Romanian content")
                
                # Wait for response
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                response_data = json.loads(response)
                logger.info(f"📥 Received response: {response_data['type']}")
                
        except Exception as e:
            logger.error(f"❌ WebSocket test failed: {str(e)}")
        
        # Get hub status
        status = hub.get_hub_status()
        logger.info("📊 Hub Status:")
        logger.info(f"Active Connections: {status['connections']['active']}")
        logger.info(f"Messages Processed: {status['performance']['messages_processed']}")
        logger.info(f"Romanian Messages: {status['performance']['romanian_messages']}")
        logger.info(f"Average Latency: {status['performance']['average_latency_ms']:.1f}ms")
        
        # Stop server
        hub.server_running = False
        await asyncio.sleep(1)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Hub test failed: {str(e)}")
        return False
    finally:
        await hub.cleanup()

if __name__ == "__main__":
    print("🚀 RomAI AGI - Real-time WebSocket Hub v3.0.0")
    print("=" * 50)
    asyncio.run(test_websocket_hub())
