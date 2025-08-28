"""
Inter-System Communication Bus - Phase 1 AGI Evolution
High-performance messaging and coordination system
"""

import logging
import asyncio
import time
import json
import uuid
from typing import Dict, List, Any, Optional, Set, Callable, Union
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
import threading
from collections import defaultdict, deque
import weakref

logger = logging.getLogger(__name__)

class MessageType(Enum):
    """Types of inter-system messages"""
    COMMAND = "command"              # Direct command execution
    QUERY = "query"                  # Information request
    RESPONSE = "response"            # Response to query/command
    EVENT = "event"                  # System event notification
    BROADCAST = "broadcast"          # System-wide announcement
    HEARTBEAT = "heartbeat"          # Health check message
    COORDINATION = "coordination"    # Multi-system coordination
    RESOURCE_REQUEST = "resource_request"
    MEMORY_UPDATE = "memory_update"
    STATUS_UPDATE = "status_update"

class MessagePriority(Enum):
    """Message priority levels"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5

class CommunicationProtocol(Enum):
    """Communication protocols"""
    ASYNC_DIRECT = "async_direct"        # Direct async function call
    ASYNC_QUEUED = "async_queued"        # Queued async processing
    SYNC_BLOCKING = "sync_blocking"      # Synchronous blocking call
    FIRE_AND_FORGET = "fire_and_forget"  # No response expected
    PUBLISH_SUBSCRIBE = "pub_sub"        # Pub/sub pattern
    REQUEST_RESPONSE = "request_response" # Request-response pattern

@dataclass
class Message:
    """Universal message format for inter-system communication"""
    id: str
    message_type: MessageType
    priority: MessagePriority
    sender_id: str
    recipient_id: str
    topic: str
    payload: Dict[str, Any]
    
    # Protocol and routing
    protocol: CommunicationProtocol = CommunicationProtocol.ASYNC_QUEUED
    expects_response: bool = False
    response_timeout: float = 30.0
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    processed_at: Optional[datetime] = None
    response_received_at: Optional[datetime] = None
    
    # Routing and delivery
    routing_key: Optional[str] = None
    delivery_tag: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3
    
    # Context and correlation
    conversation_id: Optional[str] = None
    correlation_id: Optional[str] = None
    parent_message_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary"""
        data = asdict(self)
        # Convert datetime objects to ISO strings
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat() if value else None
            elif isinstance(value, Enum):
                data[key] = value.value
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Message':
        """Create message from dictionary"""
        # Convert string timestamps back to datetime
        datetime_fields = ['created_at', 'processed_at', 'response_received_at']
        for field in datetime_fields:
            if data.get(field):
                data[field] = datetime.fromisoformat(data[field])
        
        # Convert enum strings back to enums
        if 'message_type' in data:
            data['message_type'] = MessageType(data['message_type'])
        if 'priority' in data:
            data['priority'] = MessagePriority(data['priority'])
        if 'protocol' in data:
            data['protocol'] = CommunicationProtocol(data['protocol'])
        
        return cls(**data)

@dataclass
class SystemEndpoint:
    """System endpoint registration"""
    system_id: str
    system_name: str
    endpoint_type: str
    message_handlers: Dict[str, Callable] = field(default_factory=dict)
    subscriptions: Set[str] = field(default_factory=set)
    
    # Health and status
    is_active: bool = True
    last_heartbeat: datetime = field(default_factory=datetime.now)
    message_count: int = 0
    error_count: int = 0
    
    # Performance metrics
    average_response_time: float = 0.0
    max_response_time: float = 0.0
    total_processing_time: float = 0.0

class MessageRoute:
    """Message routing information"""
    def __init__(self, pattern: str, handler: Callable, priority: int = 0):
        self.pattern = pattern
        self.handler = handler
        self.priority = priority
        self.message_count = 0
        self.total_processing_time = 0.0
        self.error_count = 0

class InterSystemCommunicationBus:
    """
    Inter-System Communication Bus - Phase 1 AGI Evolution
    
    This bus enables efficient communication between all AGI components:
    1. Unified message passing between all subsystems
    2. Support for multiple communication patterns (pub/sub, request/response, etc.)
    3. Message routing, queuing, and delivery guarantees
    4. Performance monitoring and optimization
    5. Fault tolerance and error recovery
    """
    
    def __init__(self):
        # Core messaging infrastructure
        self.endpoints = {}  # system_id -> SystemEndpoint
        self.message_queues = defaultdict(lambda: asyncio.Queue())
        self.message_routes = defaultdict(list)  # topic -> List[MessageRoute]
        self.pending_responses = {}  # message_id -> Future
        self.message_history = deque(maxlen=10000)
        
        # Pub/sub system
        self.subscriptions = defaultdict(set)  # topic -> set of system_ids
        self.topic_handlers = defaultdict(list)  # topic -> list of handlers
        
        # Performance and monitoring
        self.performance_metrics = {
            'messages_sent': 0,
            'messages_delivered': 0,
            'messages_failed': 0,
            'average_delivery_time': 0.0,
            'peak_queue_size': 0,
            'active_conversations': 0,
            'total_processing_time': 0.0
        }
        
        # System state
        self.is_running = False
        self.worker_tasks = []
        self.health_check_interval = 10.0
        self.message_retention_hours = 24
        
        # Built-in system topics
        self.system_topics = {
            'system.heartbeat',
            'system.shutdown',
            'system.startup',
            'system.error',
            'agi.task_started',
            'agi.task_completed',
            'agi.resource_allocated',
            'agi.resource_released',
            'memory.updated',
            'consciousness.state_changed'
        }
        
        logger.info("🚌 Inter-System Communication Bus initialized - Phase 1 AGI Evolution")
    
    async def start(self):
        """Start the communication bus"""
        if self.is_running:
            logger.warning("⚠️ Communication bus already running")
            return
        
        self.is_running = True
        logger.info("🚀 Starting Inter-System Communication Bus...")
        
        # Start worker tasks
        self.worker_tasks = [
            asyncio.create_task(self._message_delivery_worker()),
            asyncio.create_task(self._health_check_worker()),
            asyncio.create_task(self._performance_monitor_worker()),
            asyncio.create_task(self._cleanup_worker())
        ]
        
        # Send startup event
        startup_msg = Message(
            id=str(uuid.uuid4()),
            message_type=MessageType.EVENT,
            priority=MessagePriority.HIGH,
            sender_id="communication_bus",
            recipient_id="all",
            topic="system.startup",
            payload={"timestamp": datetime.now().isoformat()}
        )
        
        await self.broadcast_message(startup_msg)
        logger.info("✅ Communication bus started successfully")
    
    async def register_system(self, 
                            system_id: str, 
                            system_name: str, 
                            endpoint_type: str = "generic") -> bool:
        """Register a system endpoint"""
        logger.info(f"📋 Registering system: {system_id} ({system_name})")
        
        if system_id in self.endpoints:
            logger.warning(f"⚠️ System already registered: {system_id}")
            return False
        
        endpoint = SystemEndpoint(
            system_id=system_id,
            system_name=system_name,
            endpoint_type=endpoint_type
        )
        
        self.endpoints[system_id] = endpoint
        
        # Create dedicated message queue
        self.message_queues[system_id] = asyncio.Queue()
        
        logger.info(f"✅ System registered: {system_id}")
        return True
    
    async def subscribe_to_topic(self, system_id: str, topic: str, handler: Optional[Callable] = None) -> bool:
        """Subscribe system to a topic"""
        if system_id not in self.endpoints:
            logger.error(f"❌ System not registered: {system_id}")
            return False
        
        self.subscriptions[topic].add(system_id)
        self.endpoints[system_id].subscriptions.add(topic)
        
        if handler:
            self.topic_handlers[topic].append((system_id, handler))
        
        logger.info(f"📡 Subscribed {system_id} to topic: {topic}")
        return True
    
    async def register_message_handler(self, 
                                     system_id: str, 
                                     message_type: str, 
                                     handler: Callable) -> bool:
        """Register a message handler for a system"""
        if system_id not in self.endpoints:
            logger.error(f"❌ System not registered: {system_id}")
            return False
        
        self.endpoints[system_id].message_handlers[message_type] = handler
        logger.info(f"🔧 Handler registered for {system_id}: {message_type}")
        return True
    
    async def send_message(self, message: Message) -> Optional[str]:
        """Send a message to specific recipient"""
        self.performance_metrics['messages_sent'] += 1
        
        logger.info(f"📤 Sending message: {message.topic} ({message.sender_id} → {message.recipient_id})")
        
        try:
            # Validate recipient exists
            if message.recipient_id != "all" and message.recipient_id not in self.endpoints:
                logger.error(f"❌ Recipient not found: {message.recipient_id}")
                self.performance_metrics['messages_failed'] += 1
                return None
            
            # Store in message history
            self.message_history.append(message)
            
            # Handle different protocols
            if message.protocol == CommunicationProtocol.ASYNC_DIRECT:
                return await self._handle_direct_message(message)
            elif message.protocol == CommunicationProtocol.ASYNC_QUEUED:
                return await self._queue_message(message)
            elif message.protocol == CommunicationProtocol.FIRE_AND_FORGET:
                return await self._fire_and_forget(message)
            elif message.protocol == CommunicationProtocol.REQUEST_RESPONSE:
                return await self._handle_request_response(message)
            else:
                return await self._queue_message(message)  # Default to queued
                
        except Exception as e:
            logger.error(f"❌ Message sending failed: {e}")
            self.performance_metrics['messages_failed'] += 1
            return None
    
    async def broadcast_message(self, message: Message) -> int:
        """Broadcast message to all subscribers of a topic"""
        if message.topic not in self.subscriptions:
            logger.warning(f"⚠️ No subscribers for topic: {message.topic}")
            return 0
        
        subscribers = self.subscriptions[message.topic]
        sent_count = 0
        
        logger.info(f"📢 Broadcasting to {len(subscribers)} subscribers: {message.topic}")
        
        for system_id in subscribers:
            if system_id in self.endpoints and self.endpoints[system_id].is_active:
                # Create individual message for each subscriber
                individual_msg = Message(
                    id=str(uuid.uuid4()),
                    message_type=message.message_type,
                    priority=message.priority,
                    sender_id=message.sender_id,
                    recipient_id=system_id,
                    topic=message.topic,
                    payload=message.payload.copy(),
                    protocol=CommunicationProtocol.ASYNC_QUEUED,
                    conversation_id=message.conversation_id,
                    correlation_id=message.correlation_id
                )
                
                if await self.send_message(individual_msg):
                    sent_count += 1
        
        return sent_count
    
    async def request(self, 
                    sender_id: str,
                    recipient_id: str,
                    topic: str,
                    payload: Dict[str, Any],
                    timeout: float = 30.0) -> Optional[Dict[str, Any]]:
        """Send request and wait for response"""
        request_msg = Message(
            id=str(uuid.uuid4()),
            message_type=MessageType.QUERY,
            priority=MessagePriority.NORMAL,
            sender_id=sender_id,
            recipient_id=recipient_id,
            topic=topic,
            payload=payload,
            protocol=CommunicationProtocol.REQUEST_RESPONSE,
            expects_response=True,
            response_timeout=timeout
        )
        
        # Create future for response
        response_future = asyncio.Future()
        self.pending_responses[request_msg.id] = response_future
        
        # Send request
        if await self.send_message(request_msg):
            try:
                # Wait for response
                response = await asyncio.wait_for(response_future, timeout=timeout)
                return response
            except asyncio.TimeoutError:
                logger.error(f"❌ Request timeout: {topic}")
                del self.pending_responses[request_msg.id]
                return None
        
        return None
    
    async def respond(self, 
                    original_message_id: str,
                    sender_id: str,
                    recipient_id: str,
                    payload: Dict[str, Any]) -> bool:
        """Send response to a request"""
        response_msg = Message(
            id=str(uuid.uuid4()),
            message_type=MessageType.RESPONSE,
            priority=MessagePriority.HIGH,
            sender_id=sender_id,
            recipient_id=recipient_id,
            topic="response",
            payload=payload,
            protocol=CommunicationProtocol.ASYNC_DIRECT,
            parent_message_id=original_message_id
        )
        
        # Handle pending response future
        if original_message_id in self.pending_responses:
            future = self.pending_responses[original_message_id]
            if not future.done():
                future.set_result(payload)
            del self.pending_responses[original_message_id]
            return True
        
        # If no pending future, send as regular message
        return await self.send_message(response_msg) is not None
    
    async def _handle_direct_message(self, message: Message) -> Optional[str]:
        """Handle direct message delivery"""
        endpoint = self.endpoints.get(message.recipient_id)
        if not endpoint:
            return None
        
        start_time = time.time()
        
        try:
            # Find appropriate handler
            handler = None
            if message.topic in endpoint.message_handlers:
                handler = endpoint.message_handlers[message.topic]
            elif message.message_type.value in endpoint.message_handlers:
                handler = endpoint.message_handlers[message.message_type.value]
            
            if handler:
                # Call handler directly
                if asyncio.iscoroutinefunction(handler):
                    await handler(message)
                else:
                    handler(message)
                
                # Update metrics
                processing_time = time.time() - start_time
                endpoint.message_count += 1
                endpoint.total_processing_time += processing_time
                endpoint.average_response_time = endpoint.total_processing_time / endpoint.message_count
                endpoint.max_response_time = max(endpoint.max_response_time, processing_time)
                
                self.performance_metrics['messages_delivered'] += 1
                return message.id
            else:
                logger.warning(f"⚠️ No handler for message: {message.topic} at {message.recipient_id}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Direct message handling failed: {e}")
            endpoint.error_count += 1
            return None
    
    async def _queue_message(self, message: Message) -> Optional[str]:
        """Queue message for asynchronous delivery"""
        if message.recipient_id == "all":
            # Handle broadcast
            return str(await self.broadcast_message(message))
        
        queue = self.message_queues[message.recipient_id]
        await queue.put(message)
        
        # Update peak queue size metric
        current_size = queue.qsize()
        self.performance_metrics['peak_queue_size'] = max(
            self.performance_metrics['peak_queue_size'], 
            current_size
        )
        
        return message.id
    
    async def _fire_and_forget(self, message: Message) -> Optional[str]:
        """Send message without waiting for acknowledgment"""
        # Simply queue the message and return immediately
        return await self._queue_message(message)
    
    async def _handle_request_response(self, message: Message) -> Optional[str]:
        """Handle request-response pattern"""
        # Queue the message and set up response tracking
        message_id = await self._queue_message(message)
        
        if message_id and message.expects_response:
            # Create future for response tracking
            if message.id not in self.pending_responses:
                self.pending_responses[message.id] = asyncio.Future()
        
        return message_id
    
    async def _message_delivery_worker(self):
        """Worker task for processing queued messages"""
        logger.info("🚛 Message delivery worker started")
        
        while self.is_running:
            try:
                # Process messages for all systems
                for system_id, queue in self.message_queues.items():
                    if not queue.empty() and system_id in self.endpoints:
                        endpoint = self.endpoints[system_id]
                        if endpoint.is_active:
                            try:
                                message = await asyncio.wait_for(queue.get(), timeout=0.1)
                                await self._deliver_message(message, endpoint)
                            except asyncio.TimeoutError:
                                continue  # No message available
                
                # Brief pause to prevent CPU overload
                await asyncio.sleep(0.01)
                
            except Exception as e:
                logger.error(f"❌ Message delivery worker error: {e}")
                await asyncio.sleep(1.0)
    
    async def _deliver_message(self, message: Message, endpoint: SystemEndpoint):
        """Deliver message to endpoint"""
        start_time = time.time()
        
        try:
            message.processed_at = datetime.now()
            
            # Find appropriate handler
            handler = None
            if message.topic in endpoint.message_handlers:
                handler = endpoint.message_handlers[message.topic]
            elif message.message_type.value in endpoint.message_handlers:
                handler = endpoint.message_handlers[message.message_type.value]
            elif 'default' in endpoint.message_handlers:
                handler = endpoint.message_handlers['default']
            
            if handler:
                # Execute handler
                if asyncio.iscoroutinefunction(handler):
                    result = await handler(message)
                else:
                    result = handler(message)
                
                # Handle automatic response for queries
                if (message.message_type == MessageType.QUERY and 
                    message.expects_response and 
                    result is not None):
                    await self.respond(
                        message.id,
                        endpoint.system_id,
                        message.sender_id,
                        {"result": result}
                    )
                
                # Update endpoint metrics
                processing_time = time.time() - start_time
                endpoint.message_count += 1
                endpoint.total_processing_time += processing_time
                endpoint.average_response_time = endpoint.total_processing_time / endpoint.message_count
                endpoint.max_response_time = max(endpoint.max_response_time, processing_time)
                
                self.performance_metrics['messages_delivered'] += 1
                self.performance_metrics['total_processing_time'] += processing_time
                
                logger.debug(f"✅ Message delivered: {message.id} to {endpoint.system_id}")
                
            else:
                logger.warning(f"⚠️ No handler for message: {message.topic} at {endpoint.system_id}")
                # Send to dead letter queue or log
                
        except Exception as e:
            logger.error(f"❌ Message delivery failed: {e}")
            endpoint.error_count += 1
            self.performance_metrics['messages_failed'] += 1
    
    async def _health_check_worker(self):
        """Worker task for monitoring system health"""
        logger.info("💓 Health check worker started")
        
        while self.is_running:
            try:
                current_time = datetime.now()
                
                for system_id, endpoint in self.endpoints.items():
                    # Check for stale endpoints
                    time_since_heartbeat = current_time - endpoint.last_heartbeat
                    if time_since_heartbeat > timedelta(seconds=self.health_check_interval * 3):
                        if endpoint.is_active:
                            logger.warning(f"⚠️ System appears unhealthy: {system_id}")
                            endpoint.is_active = False
                            
                            # Send system error event
                            error_msg = Message(
                                id=str(uuid.uuid4()),
                                message_type=MessageType.EVENT,
                                priority=MessagePriority.HIGH,
                                sender_id="communication_bus",
                                recipient_id="all",
                                topic="system.error",
                                payload={
                                    "system_id": system_id,
                                    "error": "health_check_failed",
                                    "last_heartbeat": endpoint.last_heartbeat.isoformat()
                                }
                            )
                            await self.broadcast_message(error_msg)
                
                await asyncio.sleep(self.health_check_interval)
                
            except Exception as e:
                logger.error(f"❌ Health check worker error: {e}")
                await asyncio.sleep(self.health_check_interval)
    
    async def _performance_monitor_worker(self):
        """Worker task for performance monitoring"""
        while self.is_running:
            try:
                # Calculate performance metrics
                if self.performance_metrics['messages_delivered'] > 0:
                    self.performance_metrics['average_delivery_time'] = (
                        self.performance_metrics['total_processing_time'] / 
                        self.performance_metrics['messages_delivered']
                    )
                
                await asyncio.sleep(30.0)  # Update every 30 seconds
                
            except Exception as e:
                logger.error(f"❌ Performance monitor error: {e}")
                await asyncio.sleep(30.0)
    
    async def _cleanup_worker(self):
        """Worker task for cleaning up old data"""
        while self.is_running:
            try:
                current_time = datetime.now()
                cleanup_threshold = current_time - timedelta(hours=self.message_retention_hours)
                
                # Clean old messages from history
                old_count = len(self.message_history)
                self.message_history = deque(
                    (msg for msg in self.message_history if msg.created_at > cleanup_threshold),
                    maxlen=10000
                )
                cleaned_count = old_count - len(self.message_history)
                
                if cleaned_count > 0:
                    logger.info(f"🧹 Cleaned up {cleaned_count} old messages")
                
                # Clean expired pending responses
                expired_responses = [
                    msg_id for msg_id, future in self.pending_responses.items()
                    if future.done() or (datetime.now() - current_time).total_seconds() > 300
                ]
                
                for msg_id in expired_responses:
                    del self.pending_responses[msg_id]
                
                await asyncio.sleep(3600.0)  # Clean up every hour
                
            except Exception as e:
                logger.error(f"❌ Cleanup worker error: {e}")
                await asyncio.sleep(3600.0)
    
    async def send_heartbeat(self, system_id: str):
        """Send heartbeat from system"""
        if system_id in self.endpoints:
            self.endpoints[system_id].last_heartbeat = datetime.now()
            
            heartbeat_msg = Message(
                id=str(uuid.uuid4()),
                message_type=MessageType.HEARTBEAT,
                priority=MessagePriority.LOW,
                sender_id=system_id,
                recipient_id="communication_bus",
                topic="system.heartbeat",
                payload={"timestamp": datetime.now().isoformat()}
            )
            
            await self.send_message(heartbeat_msg)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        status = {
            'bus_status': 'running' if self.is_running else 'stopped',
            'registered_systems': len(self.endpoints),
            'active_systems': sum(1 for ep in self.endpoints.values() if ep.is_active),
            'total_topics': len(self.subscriptions),
            'performance_metrics': self.performance_metrics,
            'queue_status': {
                system_id: queue.qsize() 
                for system_id, queue in self.message_queues.items()
            },
            'pending_responses': len(self.pending_responses)
        }
        
        # Add endpoint details
        status['endpoints'] = {}
        for system_id, endpoint in self.endpoints.items():
            status['endpoints'][system_id] = {
                'name': endpoint.system_name,
                'type': endpoint.endpoint_type,
                'is_active': endpoint.is_active,
                'message_count': endpoint.message_count,
                'error_count': endpoint.error_count,
                'average_response_time': endpoint.average_response_time,
                'subscriptions': list(endpoint.subscriptions),
                'last_heartbeat': endpoint.last_heartbeat.isoformat()
            }
        
        return status
    
    async def shutdown(self):
        """Graceful shutdown of communication bus"""
        logger.info("🛑 Shutting down Inter-System Communication Bus...")
        
        # Send shutdown event
        shutdown_msg = Message(
            id=str(uuid.uuid4()),
            message_type=MessageType.EVENT,
            priority=MessagePriority.CRITICAL,
            sender_id="communication_bus",
            recipient_id="all",
            topic="system.shutdown",
            payload={"timestamp": datetime.now().isoformat()}
        )
        
        await self.broadcast_message(shutdown_msg)
        
        # Stop workers
        self.is_running = False
        
        # Wait for worker tasks to complete
        if self.worker_tasks:
            await asyncio.gather(*self.worker_tasks, return_exceptions=True)
        
        # Clear all pending futures
        for future in self.pending_responses.values():
            if not future.done():
                future.set_exception(Exception("Communication bus shutting down"))
        
        logger.info("✅ Communication bus shutdown complete")

# Global instance for Phase 1 AGI Evolution
communication_bus = InterSystemCommunicationBus()

# Convenience functions for common message patterns
async def send_command(sender_id: str, recipient_id: str, command: str, params: Dict[str, Any] = None) -> Optional[str]:
    """Send command message"""
    msg = Message(
        id=str(uuid.uuid4()),
        message_type=MessageType.COMMAND,
        priority=MessagePriority.NORMAL,
        sender_id=sender_id,
        recipient_id=recipient_id,
        topic=f"command.{command}",
        payload=params or {},
        protocol=CommunicationProtocol.ASYNC_QUEUED
    )
    return await communication_bus.send_message(msg)

async def send_event(sender_id: str, event_name: str, event_data: Dict[str, Any] = None) -> int:
    """Send event notification"""
    msg = Message(
        id=str(uuid.uuid4()),
        message_type=MessageType.EVENT,
        priority=MessagePriority.NORMAL,
        sender_id=sender_id,
        recipient_id="all",
        topic=f"event.{event_name}",
        payload=event_data or {},
        protocol=CommunicationProtocol.FIRE_AND_FORGET
    )
    return await communication_bus.broadcast_message(msg)

async def query_system(sender_id: str, recipient_id: str, query: str, params: Dict[str, Any] = None, timeout: float = 30.0) -> Optional[Dict[str, Any]]:
    """Query system and wait for response"""
    return await communication_bus.request(
        sender_id=sender_id,
        recipient_id=recipient_id,
        topic=f"query.{query}",
        payload=params or {},
        timeout=timeout
    )

logger.info("✅ Inter-System Communication Bus module loaded - AGI Evolution Phase 1 ready!")