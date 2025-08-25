"""
Agent Communication Framework for Romanian AI
Week 7 Day 3 Implementation - Component 2

This module provides advanced communication system for Romanian agent collaboration,
enabling asynchronous messaging, cultural knowledge propagation, and distributed
decision making with Romanian language context preservation.
"""

import asyncio
import time
import json
import logging
import uuid
from typing import Dict, List, Any, Optional, Set, Tuple, Callable, Union
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, deque
from datetime import datetime, timedelta
import hashlib
import weakref

# Configure logging
logger = logging.getLogger(__name__)

class MessageType(Enum):
    """Types of agent messages"""
    TASK_REQUEST = "task_request"
    TASK_RESPONSE = "task_response"
    CULTURAL_CONTEXT = "cultural_context"
    CAPABILITY_QUERY = "capability_query"
    CAPABILITY_RESPONSE = "capability_response"
    COLLABORATION_INVITE = "collaboration_invite"
    COLLABORATION_RESPONSE = "collaboration_response"
    KNOWLEDGE_SHARE = "knowledge_share"
    STATUS_UPDATE = "status_update"
    HEARTBEAT = "heartbeat"

class MessagePriority(Enum):
    """Message priority levels"""
    CRITICAL = "critical"
    HIGH = "high" 
    NORMAL = "normal"
    LOW = "low"

class CommunicationProtocol(Enum):
    """Communication protocol types"""
    DIRECT = "direct"
    BROADCAST = "broadcast"
    MULTICAST = "multicast"
    PUBLISH_SUBSCRIBE = "publish_subscribe"

@dataclass
class RomanianMessage:
    """Message structure for Romanian agent communication"""
    message_id: str
    message_type: MessageType
    sender_id: str
    recipient_ids: List[str]
    content: Dict[str, Any]
    cultural_context: Dict[str, Any] = field(default_factory=dict)
    priority: MessagePriority = MessagePriority.NORMAL
    protocol: CommunicationProtocol = CommunicationProtocol.DIRECT
    timestamp: datetime = field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    reply_to: Optional[str] = None
    conversation_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Initialize message defaults"""
        if not self.expires_at:
            # Default expiration: 1 hour for normal messages, 5 minutes for heartbeats
            delta = timedelta(minutes=5) if self.message_type == MessageType.HEARTBEAT else timedelta(hours=1)
            self.expires_at = self.timestamp + delta
        
        if not self.conversation_id:
            self.conversation_id = self.message_id
    
    def is_expired(self) -> bool:
        """Check if message has expired"""
        return datetime.now() > self.expires_at
    
    def get_age_seconds(self) -> float:
        """Get message age in seconds"""
        return (datetime.now() - self.timestamp).total_seconds()

@dataclass
class CulturalKnowledge:
    """Cultural knowledge structure for sharing"""
    knowledge_id: str
    knowledge_type: str
    content: Dict[str, Any]
    cultural_domain: str
    regional_relevance: List[str] = field(default_factory=list)
    confidence_score: float = 0.8
    source_agents: List[str] = field(default_factory=list)
    validation_count: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def update_confidence(self, new_validation: float):
        """Update confidence score with new validation"""
        self.validation_count += 1
        # Weighted average with existing confidence
        self.confidence_score = (self.confidence_score + new_validation) / 2
        self.updated_at = datetime.now()

@dataclass
class AgentCapability:
    """Agent capability structure"""
    capability_id: str
    capability_name: str
    capability_type: str
    description: str
    proficiency_level: float = 0.8
    cultural_specialization: List[str] = field(default_factory=list)
    performance_metrics: Dict[str, float] = field(default_factory=dict)
    availability: bool = True
    last_used: Optional[datetime] = None
    
    def use_capability(self):
        """Mark capability as used"""
        self.last_used = datetime.now()

class RomanianAgentCommunicator:
    """Advanced communication system for Romanian agent collaboration"""
    
    def __init__(self, agent_id: str, max_message_history: int = 1000):
        self.agent_id = agent_id
        self.max_message_history = max_message_history
        
        # Message handling
        self.message_inbox: deque = deque(maxlen=max_message_history)
        self.message_outbox: deque = deque(maxlen=max_message_history)
        self.conversation_threads: Dict[str, List[str]] = {}
        
        # Subscriptions and routing
        self.message_handlers: Dict[MessageType, List[Callable]] = defaultdict(list)
        self.topic_subscriptions: Set[str] = set()
        self.peer_connections: Dict[str, Any] = {}
        
        # Cultural knowledge management
        self.cultural_knowledge_base: Dict[str, CulturalKnowledge] = {}
        self.knowledge_propagation_log: deque = deque(maxlen=500)
        
        # Capability management
        self.advertised_capabilities: Dict[str, AgentCapability] = {}
        self.peer_capabilities: Dict[str, Dict[str, AgentCapability]] = {}
        
        # Communication metrics
        self.communication_metrics = {
            "messages_sent": 0,
            "messages_received": 0,
            "cultural_knowledge_shared": 0,
            "capability_queries": 0,
            "collaboration_invitations": 0,
            "average_response_time_ms": 0.0
        }
        
        # Background tasks
        self.background_tasks: Set[asyncio.Task] = set()
        self.is_running = False
        
        logger.info(f"Romanian Agent Communicator initialized for agent {agent_id}")
    
    async def start(self):
        """Start the communication system"""
        if self.is_running:
            return
        
        self.is_running = True
        
        # Start background tasks
        self.background_tasks.add(
            asyncio.create_task(self._message_processor())
        )
        self.background_tasks.add(
            asyncio.create_task(self._heartbeat_sender())
        )
        self.background_tasks.add(
            asyncio.create_task(self._knowledge_propagator())
        )
        self.background_tasks.add(
            asyncio.create_task(self._cleanup_manager())
        )
        
        logger.info(f"Communication system started for agent {self.agent_id}")
    
    async def stop(self):
        """Stop the communication system"""
        if not self.is_running:
            return
        
        self.is_running = False
        
        # Cancel background tasks
        for task in self.background_tasks:
            task.cancel()
        
        if self.background_tasks:
            await asyncio.gather(*self.background_tasks, return_exceptions=True)
        
        self.background_tasks.clear()
        
        logger.info(f"Communication system stopped for agent {self.agent_id}")
    
    async def send_message(
        self,
        message_type: MessageType,
        recipients: List[str],
        content: Dict[str, Any],
        cultural_context: Optional[Dict[str, Any]] = None,
        priority: MessagePriority = MessagePriority.NORMAL,
        protocol: CommunicationProtocol = CommunicationProtocol.DIRECT
    ) -> str:
        """Send a message to other agents"""
        
        message_id = str(uuid.uuid4())
        
        message = RomanianMessage(
            message_id=message_id,
            message_type=message_type,
            sender_id=self.agent_id,
            recipient_ids=recipients,
            content=content,
            cultural_context=cultural_context or {},
            priority=priority,
            protocol=protocol
        )
        
        # Enhance cultural context
        message.cultural_context = await self._enhance_cultural_context(message.cultural_context)
        
        # Add to outbox
        self.message_outbox.append(message)
        
        # Route message based on protocol
        await self._route_message(message)
        
        # Update metrics
        self.communication_metrics["messages_sent"] += 1
        
        logger.debug(f"Message {message_id} sent from {self.agent_id} to {recipients}")
        
        return message_id
    
    async def receive_message(self, message: RomanianMessage) -> bool:
        """Receive and process a message"""
        
        try:
            # Check if message is expired
            if message.is_expired():
                logger.warning(f"Received expired message {message.message_id}")
                return False
            
            # Add to inbox
            self.message_inbox.append(message)
            
            # Update conversation thread
            if message.conversation_id:
                if message.conversation_id not in self.conversation_threads:
                    self.conversation_threads[message.conversation_id] = []
                self.conversation_threads[message.conversation_id].append(message.message_id)
            
            # Process cultural context
            await self._process_cultural_context(message)
            
            # Handle message based on type
            await self._handle_message_by_type(message)
            
            # Update metrics
            self.communication_metrics["messages_received"] += 1
            
            logger.debug(f"Message {message.message_id} received by {self.agent_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error receiving message {message.message_id}: {e}")
            return False
    
    async def register_message_handler(
        self,
        message_type: MessageType,
        handler: Callable[[RomanianMessage], asyncio.coroutine]
    ):
        """Register a handler for specific message types"""
        
        self.message_handlers[message_type].append(handler)
        logger.debug(f"Handler registered for {message_type.value}")
    
    async def query_agent_capabilities(
        self,
        target_agents: List[str],
        required_capabilities: Optional[List[str]] = None
    ) -> Dict[str, Dict[str, AgentCapability]]:
        """Query capabilities of other agents"""
        
        query_id = str(uuid.uuid4())
        
        # Send capability query
        await self.send_message(
            message_type=MessageType.CAPABILITY_QUERY,
            recipients=target_agents,
            content={
                "query_id": query_id,
                "required_capabilities": required_capabilities or [],
                "requesting_agent": self.agent_id
            },
            priority=MessagePriority.HIGH
        )
        
        # Wait for responses (with timeout)
        responses = await self._wait_for_capability_responses(query_id, target_agents, timeout=5.0)
        
        # Update peer capabilities cache
        for agent_id, capabilities in responses.items():
            self.peer_capabilities[agent_id] = capabilities
        
        self.communication_metrics["capability_queries"] += 1
        
        return responses
    
    async def invite_collaboration(
        self,
        target_agents: List[str],
        task_description: str,
        required_capabilities: List[str],
        cultural_context: Dict[str, Any],
        collaboration_type: str = "joint_processing"
    ) -> Dict[str, bool]:
        """Invite other agents to collaborate"""
        
        collaboration_id = str(uuid.uuid4())
        
        invitation_content = {
            "collaboration_id": collaboration_id,
            "task_description": task_description,
            "required_capabilities": required_capabilities,
            "collaboration_type": collaboration_type,
            "initiating_agent": self.agent_id,
            "estimated_duration": 60.0,  # seconds
            "deadline": (datetime.now() + timedelta(minutes=10)).isoformat()
        }
        
        # Send collaboration invitations
        await self.send_message(
            message_type=MessageType.COLLABORATION_INVITE,
            recipients=target_agents,
            content=invitation_content,
            cultural_context=cultural_context,
            priority=MessagePriority.HIGH
        )
        
        # Wait for responses
        responses = await self._wait_for_collaboration_responses(
            collaboration_id, target_agents, timeout=10.0
        )
        
        self.communication_metrics["collaboration_invitations"] += 1
        
        return responses
    
    async def share_cultural_knowledge(
        self,
        knowledge: CulturalKnowledge,
        target_agents: Optional[List[str]] = None,
        propagation_strategy: str = "broadcast"
    ) -> bool:
        """Share cultural knowledge with other agents"""
        
        try:
            # Determine recipients
            if target_agents is None:
                recipients = list(self.peer_connections.keys())
            else:
                recipients = target_agents
            
            if not recipients:
                logger.warning("No recipients for cultural knowledge sharing")
                return False
            
            # Prepare knowledge sharing content
            knowledge_content = {
                "knowledge_id": knowledge.knowledge_id,
                "knowledge_type": knowledge.knowledge_type,
                "content": knowledge.content,
                "cultural_domain": knowledge.cultural_domain,
                "regional_relevance": knowledge.regional_relevance,
                "confidence_score": knowledge.confidence_score,
                "source_agent": self.agent_id,
                "propagation_strategy": propagation_strategy
            }
            
            # Send knowledge sharing message
            await self.send_message(
                message_type=MessageType.KNOWLEDGE_SHARE,
                recipients=recipients,
                content=knowledge_content,
                cultural_context={
                    "sharing_context": "knowledge_propagation",
                    "cultural_domain": knowledge.cultural_domain
                },
                priority=MessagePriority.NORMAL,
                protocol=CommunicationProtocol.BROADCAST if propagation_strategy == "broadcast" else CommunicationProtocol.MULTICAST
            )
            
            # Log propagation
            self.knowledge_propagation_log.append({
                "timestamp": datetime.now(),
                "knowledge_id": knowledge.knowledge_id,
                "recipients": recipients,
                "propagation_strategy": propagation_strategy
            })
            
            self.communication_metrics["cultural_knowledge_shared"] += 1
            
            logger.info(f"Cultural knowledge {knowledge.knowledge_id} shared with {len(recipients)} agents")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to share cultural knowledge: {e}")
            return False
    
    async def advertise_capabilities(self, capabilities: List[AgentCapability]):
        """Advertise agent capabilities to peers"""
        
        for capability in capabilities:
            self.advertised_capabilities[capability.capability_id] = capability
        
        # Broadcast capabilities to known peers
        if self.peer_connections:
            capability_data = {
                capability.capability_id: {
                    "name": capability.capability_name,
                    "type": capability.capability_type,
                    "description": capability.description,
                    "proficiency_level": capability.proficiency_level,
                    "cultural_specialization": capability.cultural_specialization,
                    "availability": capability.availability
                }
                for capability in capabilities
            }
            
            await self.send_message(
                message_type=MessageType.STATUS_UPDATE,
                recipients=list(self.peer_connections.keys()),
                content={
                    "update_type": "capability_advertisement",
                    "capabilities": capability_data,
                    "agent_id": self.agent_id
                },
                protocol=CommunicationProtocol.BROADCAST
            )
    
    async def _route_message(self, message: RomanianMessage):
        """Route message based on protocol"""
        
        if message.protocol == CommunicationProtocol.DIRECT:
            await self._send_direct_message(message)
        elif message.protocol == CommunicationProtocol.BROADCAST:
            await self._broadcast_message(message)
        elif message.protocol == CommunicationProtocol.MULTICAST:
            await self._multicast_message(message)
        elif message.protocol == CommunicationProtocol.PUBLISH_SUBSCRIBE:
            await self._publish_message(message)
    
    async def _send_direct_message(self, message: RomanianMessage):
        """Send direct message to specific recipients"""
        
        for recipient_id in message.recipient_ids:
            if recipient_id in self.peer_connections:
                # In a real implementation, this would send via network
                # For now, we simulate the sending process
                await self._simulate_message_delivery(message, recipient_id)
    
    async def _broadcast_message(self, message: RomanianMessage):
        """Broadcast message to all connected peers"""
        
        for peer_id in self.peer_connections:
            if peer_id not in message.recipient_ids:
                continue
            await self._simulate_message_delivery(message, peer_id)
    
    async def _multicast_message(self, message: RomanianMessage):
        """Multicast message to specific group"""
        
        # Similar to direct messaging but with group optimization
        await self._send_direct_message(message)
    
    async def _publish_message(self, message: RomanianMessage):
        """Publish message to topic subscribers"""
        
        # Implementation for publish-subscribe pattern
        pass
    
    async def _simulate_message_delivery(self, message: RomanianMessage, recipient_id: str):
        """Simulate message delivery to recipient"""
        
        # Simulate network delay
        delivery_delay = 0.01 + (len(json.dumps(message.content)) / 10000)  # Basic size-based delay
        await asyncio.sleep(delivery_delay)
        
        logger.debug(f"Message {message.message_id} delivered to {recipient_id}")
    
    async def _enhance_cultural_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance cultural context with agent knowledge"""
        
        enhanced_context = context.copy()
        
        # Add agent's cultural knowledge
        enhanced_context["agent_cultural_knowledge"] = [
            {
                "knowledge_id": k.knowledge_id,
                "domain": k.cultural_domain,
                "confidence": k.confidence_score
            }
            for k in self.cultural_knowledge_base.values()
            if k.confidence_score > 0.7
        ]
        
        # Add timestamp and agent info
        enhanced_context["enhancement_timestamp"] = datetime.now().isoformat()
        enhanced_context["enhancing_agent"] = self.agent_id
        
        return enhanced_context
    
    async def _process_cultural_context(self, message: RomanianMessage):
        """Process and learn from cultural context in message"""
        
        cultural_context = message.cultural_context
        
        if not cultural_context:
            return
        
        # Extract cultural knowledge from context
        shared_knowledge = cultural_context.get("agent_cultural_knowledge", [])
        
        for knowledge_info in shared_knowledge:
            knowledge_id = knowledge_info.get("knowledge_id")
            domain = knowledge_info.get("domain")
            confidence = knowledge_info.get("confidence", 0.0)
            
            # Update or create cultural knowledge entry
            if knowledge_id and knowledge_id not in self.cultural_knowledge_base:
                # Request full knowledge details
                await self._request_cultural_knowledge_details(message.sender_id, knowledge_id)
    
    async def _handle_message_by_type(self, message: RomanianMessage):
        """Handle message based on its type"""
        
        # Call registered handlers
        handlers = self.message_handlers.get(message.message_type, [])
        for handler in handlers:
            try:
                await handler(message)
            except Exception as e:
                logger.error(f"Handler error for message {message.message_id}: {e}")
        
        # Built-in handling for specific message types
        if message.message_type == MessageType.CAPABILITY_QUERY:
            await self._handle_capability_query(message)
        elif message.message_type == MessageType.CAPABILITY_RESPONSE:
            await self._handle_capability_response(message)
        elif message.message_type == MessageType.COLLABORATION_INVITE:
            await self._handle_collaboration_invite(message)
        elif message.message_type == MessageType.COLLABORATION_RESPONSE:
            await self._handle_collaboration_response(message)
        elif message.message_type == MessageType.KNOWLEDGE_SHARE:
            await self._handle_knowledge_share(message)
        elif message.message_type == MessageType.HEARTBEAT:
            await self._handle_heartbeat(message)
    
    async def _handle_capability_query(self, message: RomanianMessage):
        """Handle capability query from another agent"""
        
        query_content = message.content
        query_id = query_content.get("query_id")
        required_capabilities = query_content.get("required_capabilities", [])
        
        # Filter relevant capabilities
        relevant_capabilities = {}
        for cap_id, capability in self.advertised_capabilities.items():
            if not required_capabilities or capability.capability_name in required_capabilities:
                relevant_capabilities[cap_id] = {
                    "name": capability.capability_name,
                    "type": capability.capability_type,
                    "proficiency_level": capability.proficiency_level,
                    "cultural_specialization": capability.cultural_specialization,
                    "availability": capability.availability
                }
        
        # Send response
        await self.send_message(
            message_type=MessageType.CAPABILITY_RESPONSE,
            recipients=[message.sender_id],
            content={
                "query_id": query_id,
                "responding_agent": self.agent_id,
                "capabilities": relevant_capabilities
            }
        )
    
    async def _handle_capability_response(self, message: RomanianMessage):
        """Handle capability response from another agent"""
        
        response_content = message.content
        responding_agent = response_content.get("responding_agent")
        capabilities_data = response_content.get("capabilities", {})
        
        # Convert to AgentCapability objects
        capabilities = {}
        for cap_id, cap_data in capabilities_data.items():
            capability = AgentCapability(
                capability_id=cap_id,
                capability_name=cap_data["name"],
                capability_type=cap_data["type"],
                description=cap_data.get("description", ""),
                proficiency_level=cap_data.get("proficiency_level", 0.0),
                cultural_specialization=cap_data.get("cultural_specialization", []),
                availability=cap_data.get("availability", True)
            )
            capabilities[cap_id] = capability
        
        # Cache capabilities
        self.peer_capabilities[responding_agent] = capabilities
    
    async def _handle_collaboration_invite(self, message: RomanianMessage):
        """Handle collaboration invitation"""
        
        invite_content = message.content
        collaboration_id = invite_content.get("collaboration_id")
        task_description = invite_content.get("task_description")
        required_capabilities = invite_content.get("required_capabilities", [])
        
        # Evaluate if we can participate
        can_participate = await self._evaluate_collaboration_capability(required_capabilities)
        
        # Send response
        await self.send_message(
            message_type=MessageType.COLLABORATION_RESPONSE,
            recipients=[message.sender_id],
            content={
                "collaboration_id": collaboration_id,
                "responding_agent": self.agent_id,
                "acceptance": can_participate,
                "available_capabilities": list(self.advertised_capabilities.keys()) if can_participate else []
            }
        )
    
    async def _handle_collaboration_response(self, message: RomanianMessage):
        """Handle collaboration response"""
        
        response_content = message.content
        collaboration_id = response_content.get("collaboration_id")
        responding_agent = response_content.get("responding_agent")
        acceptance = response_content.get("acceptance", False)
        
        # Store response for coordination
        # In a real implementation, this would be handled by the coordination hub
        logger.info(f"Collaboration response from {responding_agent}: {'accepted' if acceptance else 'declined'}")
    
    async def _handle_knowledge_share(self, message: RomanianMessage):
        """Handle shared cultural knowledge"""
        
        knowledge_content = message.content
        knowledge_id = knowledge_content.get("knowledge_id")
        
        if knowledge_id and knowledge_id not in self.cultural_knowledge_base:
            # Create cultural knowledge entry
            cultural_knowledge = CulturalKnowledge(
                knowledge_id=knowledge_id,
                knowledge_type=knowledge_content.get("knowledge_type", "general"),
                content=knowledge_content.get("content", {}),
                cultural_domain=knowledge_content.get("cultural_domain", "general"),
                regional_relevance=knowledge_content.get("regional_relevance", []),
                confidence_score=knowledge_content.get("confidence_score", 0.7),
                source_agents=[knowledge_content.get("source_agent", message.sender_id)]
            )
            
            self.cultural_knowledge_base[knowledge_id] = cultural_knowledge
            
            logger.info(f"Cultural knowledge {knowledge_id} acquired from {message.sender_id}")
    
    async def _handle_heartbeat(self, message: RomanianMessage):
        """Handle heartbeat message"""
        
        # Update peer connection status
        sender_id = message.sender_id
        if sender_id in self.peer_connections:
            self.peer_connections[sender_id]["last_heartbeat"] = datetime.now()
    
    async def _evaluate_collaboration_capability(self, required_capabilities: List[str]) -> bool:
        """Evaluate if agent can participate in collaboration"""
        
        if not required_capabilities:
            return True
        
        # Check if we have matching capabilities
        our_capability_names = {cap.capability_name for cap in self.advertised_capabilities.values()}
        
        # We can participate if we have at least 50% of required capabilities
        matching_capabilities = len(set(required_capabilities) & our_capability_names)
        return matching_capabilities / len(required_capabilities) >= 0.5
    
    async def _wait_for_capability_responses(
        self,
        query_id: str,
        target_agents: List[str],
        timeout: float
    ) -> Dict[str, Dict[str, AgentCapability]]:
        """Wait for capability responses from agents"""
        
        responses = {}
        start_time = time.time()
        
        while len(responses) < len(target_agents) and (time.time() - start_time) < timeout:
            # Check for new capability responses in inbox
            for message in list(self.message_inbox):
                if (message.message_type == MessageType.CAPABILITY_RESPONSE and
                    message.content.get("query_id") == query_id):
                    
                    responding_agent = message.content.get("responding_agent")
                    if responding_agent in target_agents and responding_agent not in responses:
                        capabilities_data = message.content.get("capabilities", {})
                        
                        # Convert to AgentCapability objects
                        capabilities = {}
                        for cap_id, cap_data in capabilities_data.items():
                            capability = AgentCapability(
                                capability_id=cap_id,
                                capability_name=cap_data["name"],
                                capability_type=cap_data["type"],
                                description=cap_data.get("description", ""),
                                proficiency_level=cap_data.get("proficiency_level", 0.0)
                            )
                            capabilities[cap_id] = capability
                        
                        responses[responding_agent] = capabilities
            
            await asyncio.sleep(0.1)  # Small delay to prevent busy waiting
        
        return responses
    
    async def _wait_for_collaboration_responses(
        self,
        collaboration_id: str,
        target_agents: List[str],
        timeout: float
    ) -> Dict[str, bool]:
        """Wait for collaboration responses from agents"""
        
        responses = {}
        start_time = time.time()
        
        while len(responses) < len(target_agents) and (time.time() - start_time) < timeout:
            # Check for new collaboration responses in inbox
            for message in list(self.message_inbox):
                if (message.message_type == MessageType.COLLABORATION_RESPONSE and
                    message.content.get("collaboration_id") == collaboration_id):
                    
                    responding_agent = message.content.get("responding_agent")
                    if responding_agent in target_agents and responding_agent not in responses:
                        acceptance = message.content.get("acceptance", False)
                        responses[responding_agent] = acceptance
            
            await asyncio.sleep(0.1)
        
        return responses
    
    async def _request_cultural_knowledge_details(self, source_agent: str, knowledge_id: str):
        """Request detailed cultural knowledge from source agent"""
        
        await self.send_message(
            message_type=MessageType.CAPABILITY_QUERY,  # Reusing for knowledge query
            recipients=[source_agent],
            content={
                "query_type": "cultural_knowledge_details",
                "knowledge_id": knowledge_id,
                "requesting_agent": self.agent_id
            }
        )
    
    async def _message_processor(self):
        """Background message processing"""
        
        while self.is_running:
            try:
                # Process priority messages first
                priority_messages = [
                    msg for msg in self.message_inbox
                    if msg.priority in [MessagePriority.CRITICAL, MessagePriority.HIGH]
                ]
                
                for message in priority_messages:
                    await self._handle_message_by_type(message)
                
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Message processor error: {e}")
                await asyncio.sleep(1.0)
    
    async def _heartbeat_sender(self):
        """Send periodic heartbeats to connected peers"""
        
        while self.is_running:
            try:
                if self.peer_connections:
                    await self.send_message(
                        message_type=MessageType.HEARTBEAT,
                        recipients=list(self.peer_connections.keys()),
                        content={
                            "agent_id": self.agent_id,
                            "status": "active",
                            "timestamp": datetime.now().isoformat()
                        },
                        priority=MessagePriority.LOW
                    )
                
                await asyncio.sleep(30.0)  # Heartbeat every 30 seconds
                
            except Exception as e:
                logger.error(f"Heartbeat sender error: {e}")
                await asyncio.sleep(60.0)
    
    async def _knowledge_propagator(self):
        """Background cultural knowledge propagation"""
        
        while self.is_running:
            try:
                # Identify knowledge to propagate
                high_confidence_knowledge = [
                    knowledge for knowledge in self.cultural_knowledge_base.values()
                    if knowledge.confidence_score > 0.8 and knowledge.validation_count > 2
                ]
                
                # Propagate high-confidence knowledge periodically
                for knowledge in high_confidence_knowledge[:3]:  # Limit to 3 per cycle
                    if self.peer_connections:
                        await self.share_cultural_knowledge(knowledge)
                
                await asyncio.sleep(300.0)  # Propagate every 5 minutes
                
            except Exception as e:
                logger.error(f"Knowledge propagator error: {e}")
                await asyncio.sleep(600.0)
    
    async def _cleanup_manager(self):
        """Background cleanup of expired messages and data"""
        
        while self.is_running:
            try:
                # Remove expired messages
                current_time = datetime.now()
                
                # Clean inbox
                self.message_inbox = deque(
                    [msg for msg in self.message_inbox if not msg.is_expired()],
                    maxlen=self.max_message_history
                )
                
                # Clean outbox
                self.message_outbox = deque(
                    [msg for msg in self.message_outbox if not msg.is_expired()],
                    maxlen=self.max_message_history
                )
                
                # Clean old conversation threads
                old_conversations = [
                    conv_id for conv_id, messages in self.conversation_threads.items()
                    if len(messages) == 0 or 
                    all(msg for msg in self.message_inbox + self.message_outbox 
                        if msg.conversation_id == conv_id and msg.is_expired())
                ]
                
                for conv_id in old_conversations:
                    del self.conversation_threads[conv_id]
                
                await asyncio.sleep(300.0)  # Cleanup every 5 minutes
                
            except Exception as e:
                logger.error(f"Cleanup manager error: {e}")
                await asyncio.sleep(600.0)
    
    async def get_communication_metrics(self) -> Dict[str, Any]:
        """Get communication system metrics"""
        
        return {
            "agent_id": self.agent_id,
            "communication_status": {
                "is_running": self.is_running,
                "peer_connections": len(self.peer_connections),
                "active_conversations": len(self.conversation_threads),
                "inbox_messages": len(self.message_inbox),
                "outbox_messages": len(self.message_outbox)
            },
            "performance_metrics": self.communication_metrics,
            "cultural_knowledge": {
                "total_knowledge_entries": len(self.cultural_knowledge_base),
                "high_confidence_knowledge": len([
                    k for k in self.cultural_knowledge_base.values()
                    if k.confidence_score > 0.8
                ]),
                "knowledge_propagation_events": len(self.knowledge_propagation_log)
            },
            "capabilities": {
                "advertised_capabilities": len(self.advertised_capabilities),
                "peer_capabilities_known": len(self.peer_capabilities),
                "total_peer_capabilities": sum(
                    len(caps) for caps in self.peer_capabilities.values()
                )
            },
            "message_handlers": {
                msg_type.value: len(handlers)
                for msg_type, handlers in self.message_handlers.items()
            }
        }

# Export key classes
__all__ = [
    "RomanianAgentCommunicator",
    "RomanianMessage",
    "CulturalKnowledge",
    "AgentCapability",
    "MessageType",
    "MessagePriority", 
    "CommunicationProtocol"
]
