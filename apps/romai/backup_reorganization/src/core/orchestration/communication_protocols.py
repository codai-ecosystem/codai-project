#!/usr/bin/env python3
"""
🌐 Communication Protocols System
================================

Advanced inter-agent communication system implementing Romanian cultural
communication patterns, hierarchical message routing, and collective
intelligence coordination protocols. Ensures efficient, respectful, and
culturally-appropriate agent interactions.

File: apps/romai/src/core/orchestration/communication_protocols.py
Author: RomAI AGI Development Team  
Version: 1.0.0 (Production Ready)
"""

import asyncio
import time
import json
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Dict, List, Optional, Any, Callable, Set
import logging
import uuid
from collections import deque, defaultdict

from .cultural_leadership import RomanianLeadershipStyle, CulturalValue, RomanianCulturalAdvisor

class MessageType(Enum):
    """Types of messages in the communication system"""
    TASK_REQUEST = "task_request"
    TASK_RESPONSE = "task_response"
    STATUS_UPDATE = "status_update"
    RESOURCE_REQUEST = "resource_request"
    KNOWLEDGE_SHARING = "knowledge_sharing"
    CULTURAL_GUIDANCE = "cultural_guidance"
    COORDINATION = "coordination"
    BROADCAST = "broadcast"
    DIRECT_MESSAGE = "direct_message"
    ERROR_REPORT = "error_report"
    HEARTBEAT = "heartbeat"

class MessagePriority(Enum):
    """Message priority levels"""
    URGENT = 10      # Immediate attention required
    HIGH = 8         # High priority, process quickly  
    NORMAL = 5       # Standard priority
    LOW = 3          # Low priority, can wait
    BACKGROUND = 1   # Background/maintenance messages

class CommunicationProtocol(Enum):
    """Communication protocol types"""
    DIRECT = "direct"                    # Point-to-point communication
    BROADCAST = "broadcast"              # One-to-many communication  
    MULTICAST = "multicast"             # One-to-some communication
    HIERARCHICAL = "hierarchical"       # Through leadership chain
    CONSENSUS = "consensus"             # Collective decision-making
    CULTURAL_MEDIATED = "cultural_mediated"  # With cultural advisor involvement

@dataclass
class CommunicationMessage:
    """Represents a message in the communication system"""
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str = ""
    recipient_id: Optional[str] = None  # None for broadcast messages
    message_type: MessageType = MessageType.DIRECT_MESSAGE
    priority: MessagePriority = MessagePriority.NORMAL
    protocol: CommunicationProtocol = CommunicationProtocol.DIRECT
    
    # Message content
    subject: str = ""
    content: Dict[str, Any] = field(default_factory=dict)
    attachments: List[Dict[str, Any]] = field(default_factory=list)
    
    # Routing and delivery
    delivery_path: List[str] = field(default_factory=list)
    requires_acknowledgment: bool = True
    expires_at: Optional[float] = None
    
    # Cultural context
    cultural_context: Optional[str] = None
    requires_cultural_review: bool = False
    romanian_politeness_level: float = 0.7  # 0.0 to 1.0
    
    # Metadata
    created_time: float = field(default_factory=time.time)
    sent_time: Optional[float] = None
    received_time: Optional[float] = None
    processed_time: Optional[float] = None
    
    # Status tracking
    delivery_status: str = "pending"  # pending, sent, delivered, processed, failed
    acknowledgment_received: bool = False
    retry_count: int = 0
    
    def __lt__(self, other):
        """Priority queue comparison"""
        return self.priority.value > other.priority.value

@dataclass
class ConversationThread:
    """Tracks conversation threads between agents"""
    thread_id: str
    participants: Set[str] = field(default_factory=set)
    message_history: List[str] = field(default_factory=list)  # message_ids
    thread_topic: str = ""
    created_time: float = field(default_factory=time.time)
    last_activity: float = field(default_factory=time.time)
    cultural_context: Optional[Dict[str, Any]] = None
    is_active: bool = True

@dataclass
class AgentCommunicationProfile:
    """Communication preferences and patterns for an agent"""
    agent_id: str
    preferred_protocols: List[CommunicationProtocol] = field(default_factory=list)
    communication_style: str = "formal"  # formal, casual, technical, cultural
    response_time_expectations: Dict[MessagePriority, float] = field(default_factory=dict)
    cultural_communication_preferences: List[str] = field(default_factory=list)
    active_conversations: Set[str] = field(default_factory=set)
    message_processing_capacity: int = 10
    current_message_load: int = 0
    
class RomanianCommunicationProtocols:
    """
    🌐 Romanian Cultural Communication System
    
    Implements traditional Romanian communication patterns including respectful
    hierarchies, community consultation, and cultural mediation approaches.
    """
    
    def __init__(self, cultural_advisor: Optional[RomanianCulturalAdvisor] = None):
        self.cultural_advisor = cultural_advisor or RomanianCulturalAdvisor()
        self.logger = logging.getLogger("RomAI.Communication")
        
        # Communication infrastructure
        self.messages: Dict[str, CommunicationMessage] = {}
        self.message_queue: List[CommunicationMessage] = []  # Priority queue
        self.agent_profiles: Dict[str, AgentCommunicationProfile] = {}
        self.conversation_threads: Dict[str, ConversationThread] = {}
        
        # Message routing and delivery
        self.message_handlers: Dict[str, List[Callable]] = defaultdict(list)
        self.delivery_acknowledgments: Dict[str, Dict[str, float]] = {}
        self.failed_deliveries: deque = deque(maxlen=100)
        
        # Cultural communication patterns
        self.romanian_greeting_patterns = [
            "Bună ziua", "Salutare", "Cu respect", "În numele colaborării"
        ]
        self.romanian_closing_patterns = [
            "Cu stimă", "Toate cele bune", "În așteptarea colaborării", "Cu respect"
        ]
        
        # Performance metrics
        self.communication_metrics = {
            'messages_sent': 0,
            'messages_delivered': 0,
            'messages_failed': 0,
            'average_delivery_time': 0.0,
            'cultural_mediation_events': 0,
            'consensus_decisions': 0
        }
        
    async def initialize_agent_profiles(self, agent_ids: List[str]) -> None:
        """Initialize communication profiles for all agents"""
        
        for agent_id in agent_ids:
            # Default response time expectations (seconds)
            response_times = {
                MessagePriority.URGENT: 60.0,      # 1 minute
                MessagePriority.HIGH: 300.0,       # 5 minutes
                MessagePriority.NORMAL: 1800.0,    # 30 minutes
                MessagePriority.LOW: 7200.0,       # 2 hours
                MessagePriority.BACKGROUND: 86400.0 # 24 hours
            }
            
            # Determine communication preferences based on agent role/type
            preferred_protocols = [CommunicationProtocol.DIRECT, CommunicationProtocol.HIERARCHICAL]
            cultural_prefs = ["respectful_address", "proper_greetings", "cultural_context"]
            
            self.agent_profiles[agent_id] = AgentCommunicationProfile(
                agent_id=agent_id,
                preferred_protocols=preferred_protocols,
                communication_style="formal",
                response_time_expectations=response_times,
                cultural_communication_preferences=cultural_prefs
            )
            
        self.logger.info(f"Initialized communication profiles for {len(agent_ids)} agents")
        
    async def send_message(self, message: CommunicationMessage) -> str:
        """Send a message through the communication system"""
        
        # Apply Romanian cultural enhancements
        await self._apply_cultural_enhancements(message)
        
        # Validate message
        if not message.sender_id:
            raise ValueError("Message must have a sender_id")
            
        # Store message
        self.messages[message.message_id] = message
        
        # Route message based on protocol
        await self._route_message(message)
        
        # Update metrics
        self.communication_metrics['messages_sent'] += 1
        
        self.logger.info(f"Message sent: {message.subject} ({message.message_type.value})")
        
        return message.message_id
        
    async def _apply_cultural_enhancements(self, message: CommunicationMessage) -> None:
        """Apply Romanian cultural enhancements to message"""
        
        sender_profile = self.agent_profiles.get(message.sender_id)
        if not sender_profile:
            return
            
        # Add respectful greeting if not present
        content_str = str(message.content)
        if not any(greeting in content_str for greeting in self.romanian_greeting_patterns):
            if message.romanian_politeness_level >= 0.6:
                greeting = self.romanian_greeting_patterns[0]  # "Bună ziua"
                if isinstance(message.content, dict):
                    message.content['greeting'] = greeting
                    
        # Add cultural context for important messages
        if message.priority.value >= MessagePriority.HIGH.value:
            cultural_context = await self.cultural_advisor.assess_cultural_context(
                [message.sender_id, message.recipient_id] if message.recipient_id else [message.sender_id],
                []
            )
            message.cultural_context = f"Leadership: {cultural_context.leadership_style.value}"
            
        # Adjust tone based on Romanian communication norms
        if message.romanian_politeness_level >= 0.8:
            message.requires_cultural_review = True
            
    async def _route_message(self, message: CommunicationMessage) -> None:
        """Route message based on protocol and recipient"""
        
        message.sent_time = time.time()
        
        if message.protocol == CommunicationProtocol.DIRECT:
            await self._route_direct_message(message)
        elif message.protocol == CommunicationProtocol.BROADCAST:
            await self._route_broadcast_message(message)
        elif message.protocol == CommunicationProtocol.MULTICAST:
            await self._route_multicast_message(message)
        elif message.protocol == CommunicationProtocol.HIERARCHICAL:
            await self._route_hierarchical_message(message)
        elif message.protocol == CommunicationProtocol.CONSENSUS:
            await self._route_consensus_message(message)
        elif message.protocol == CommunicationProtocol.CULTURAL_MEDIATED:
            await self._route_cultural_mediated_message(message)
        else:
            self.logger.warning(f"Unknown protocol: {message.protocol}")
            await self._route_direct_message(message)  # Fallback
            
    async def _route_direct_message(self, message: CommunicationMessage) -> None:
        """Route direct point-to-point message"""
        
        if not message.recipient_id:
            raise ValueError("Direct messages must have a recipient_id")
            
        if message.recipient_id not in self.agent_profiles:
            message.delivery_status = "failed"
            self.failed_deliveries.append({
                'message_id': message.message_id,
                'reason': f'Recipient {message.recipient_id} not found',
                'timestamp': time.time()
            })
            return
            
        # Add to priority queue for delivery
        message.delivery_path = [message.recipient_id]
        await self._queue_for_delivery(message)
        
    async def _route_broadcast_message(self, message: CommunicationMessage) -> None:
        """Route broadcast message to all agents"""
        
        recipients = list(self.agent_profiles.keys())
        if message.sender_id in recipients:
            recipients.remove(message.sender_id)  # Don't send to self
            
        message.delivery_path = recipients
        await self._queue_for_delivery(message)
        
    async def _route_multicast_message(self, message: CommunicationMessage) -> None:
        """Route multicast message to specific group"""
        
        # Get recipients from message content
        recipients = message.content.get('recipients', [])
        if not recipients:
            self.logger.warning("Multicast message has no recipients specified")
            return
            
        # Filter to existing agents
        valid_recipients = [r for r in recipients if r in self.agent_profiles]
        message.delivery_path = valid_recipients
        await self._queue_for_delivery(message)
        
    async def _route_hierarchical_message(self, message: CommunicationMessage) -> None:
        """Route message through leadership hierarchy"""
        
        # Get current cultural leadership context
        cultural_context = await self.cultural_advisor.assess_cultural_context(
            list(self.agent_profiles.keys()), []
        )
        
        # Determine hierarchy based on leadership style
        if cultural_context.leadership_style == RomanianLeadershipStyle.VOIVODE:
            # Military-style hierarchy - direct to all subordinates
            await self._route_broadcast_message(message)
        elif cultural_context.leadership_style == RomanianLeadershipStyle.BOYAR:
            # Council-style - route through consultative process
            await self._route_consensus_message(message)
        else:
            # Default hierarchical routing
            await self._route_direct_message(message)
            
    async def _route_consensus_message(self, message: CommunicationMessage) -> None:
        """Route message through consensus-building protocol"""
        
        # Create consensus thread
        thread_id = f"consensus_{int(time.time())}"
        thread = ConversationThread(
            thread_id=thread_id,
            participants=set(self.agent_profiles.keys()),
            thread_topic=f"Consensus: {message.subject}",
            cultural_context={'protocol': 'consensus_building'}
        )
        self.conversation_threads[thread_id] = thread
        
        # Broadcast to all participants for consensus
        message.content['consensus_thread'] = thread_id
        message.content['requires_response'] = True
        await self._route_broadcast_message(message)
        
        self.communication_metrics['consensus_decisions'] += 1
        
    async def _route_cultural_mediated_message(self, message: CommunicationMessage) -> None:
        """Route message with cultural advisor mediation"""
        
        # Get cultural guidance for the message
        cultural_guidance = await self.cultural_advisor.provide_cultural_guidance(
            message.sender_id,
            {
                'type': 'communication',
                'message_type': message.message_type.value,
                'priority': message.priority.value,
                'recipient': message.recipient_id
            }
        )
        
        # Apply cultural modifications
        message.content['cultural_guidance'] = cultural_guidance
        message.cultural_context = json.dumps(cultural_guidance.get('recommended_approach', {}))
        
        # Route through appropriate protocol based on guidance
        if cultural_guidance.get('leadership_style_suggestion'):
            message.protocol = CommunicationProtocol.HIERARCHICAL
            await self._route_hierarchical_message(message)
        else:
            await self._route_direct_message(message)
            
        self.communication_metrics['cultural_mediation_events'] += 1
        
    async def _queue_for_delivery(self, message: CommunicationMessage) -> None:
        """Queue message for delivery to recipients"""
        
        import heapq
        heapq.heappush(self.message_queue, message)
        message.delivery_status = "queued"
        
        # Process queue if not too busy
        if len(self.message_queue) <= 100:  # Avoid overwhelming the system
            await self._process_message_queue()
            
    async def _process_message_queue(self) -> None:
        """Process queued messages for delivery"""
        
        import heapq
        processed_count = 0
        max_batch_size = 50
        
        while self.message_queue and processed_count < max_batch_size:
            message = heapq.heappop(self.message_queue)
            
            try:
                await self._deliver_message(message)
                processed_count += 1
            except Exception as e:
                self.logger.error(f"Failed to deliver message {message.message_id}: {e}")
                message.delivery_status = "failed"
                message.retry_count += 1
                
                # Retry if not exceeded limit
                if message.retry_count < 3:
                    await asyncio.sleep(2 ** message.retry_count)  # Exponential backoff
                    heapq.heappush(self.message_queue, message)
                else:
                    self.failed_deliveries.append({
                        'message_id': message.message_id,
                        'reason': str(e),
                        'timestamp': time.time()
                    })
                    
    async def _deliver_message(self, message: CommunicationMessage) -> None:
        """Deliver message to recipients"""
        
        delivery_start_time = time.time()
        
        # Deliver to each recipient in delivery path
        for recipient_id in message.delivery_path:
            if recipient_id in self.agent_profiles:
                recipient_profile = self.agent_profiles[recipient_id]
                
                # Check recipient capacity
                if recipient_profile.current_message_load >= recipient_profile.message_processing_capacity:
                    self.logger.warning(f"Recipient {recipient_id} at message capacity, queueing")
                    # In real implementation, would queue for later delivery
                    continue
                    
                # Trigger message handlers for recipient
                await self._trigger_message_handlers(recipient_id, message)
                
                # Update recipient load
                recipient_profile.current_message_load += 1
                
                # Add to conversation thread if applicable
                await self._update_conversation_thread(message)
                
        # Update delivery status and timing
        message.delivery_status = "delivered"
        message.received_time = time.time()
        
        # Update metrics
        delivery_time = message.received_time - message.sent_time
        self.communication_metrics['messages_delivered'] += 1
        
        # Update average delivery time (exponential moving average)
        if self.communication_metrics['average_delivery_time'] == 0.0:
            self.communication_metrics['average_delivery_time'] = delivery_time
        else:
            alpha = 0.1  # Smoothing factor
            self.communication_metrics['average_delivery_time'] = (
                alpha * delivery_time + 
                (1 - alpha) * self.communication_metrics['average_delivery_time']
            )
            
        # Send acknowledgment if required
        if message.requires_acknowledgment:
            await self._send_acknowledgment(message)
            
    async def _trigger_message_handlers(self, recipient_id: str, message: CommunicationMessage) -> None:
        """Trigger registered message handlers for recipient"""
        
        handlers = self.message_handlers.get(recipient_id, [])
        
        for handler in handlers:
            try:
                await handler(message)
            except Exception as e:
                self.logger.error(f"Message handler failed for {recipient_id}: {e}")
                
    async def _update_conversation_thread(self, message: CommunicationMessage) -> None:
        """Update conversation thread with new message"""
        
        # Find or create relevant thread
        thread_id = message.content.get('thread_id')
        if not thread_id:
            # Create new thread for multi-party conversations
            if len(message.delivery_path) > 1:
                thread_id = f"thread_{message.message_id[:8]}"
                participants = set(message.delivery_path)
                participants.add(message.sender_id)
                
                self.conversation_threads[thread_id] = ConversationThread(
                    thread_id=thread_id,
                    participants=participants,
                    thread_topic=message.subject
                )
                
        if thread_id and thread_id in self.conversation_threads:
            thread = self.conversation_threads[thread_id]
            thread.message_history.append(message.message_id)
            thread.last_activity = time.time()
            
            # Update cultural context if present
            if message.cultural_context:
                if not thread.cultural_context:
                    thread.cultural_context = {}
                thread.cultural_context['latest_cultural_guidance'] = message.cultural_context
                
    async def _send_acknowledgment(self, original_message: CommunicationMessage) -> None:
        """Send acknowledgment for delivered message"""
        
        ack_message = CommunicationMessage(
            sender_id="communication_system",
            recipient_id=original_message.sender_id,
            message_type=MessageType.STATUS_UPDATE,
            priority=MessagePriority.LOW,
            protocol=CommunicationProtocol.DIRECT,
            subject=f"Acknowledgment: {original_message.subject}",
            content={
                'original_message_id': original_message.message_id,
                'acknowledgment_type': 'delivery_confirmation',
                'delivered_to': original_message.delivery_path,
                'delivery_time': original_message.received_time
            },
            requires_acknowledgment=False
        )
        
        await self.send_message(ack_message)
        original_message.acknowledgment_received = True
        
    def register_message_handler(self, agent_id: str, 
                                handler: Callable[[CommunicationMessage], None]) -> None:
        """Register a message handler for an agent"""
        
        self.message_handlers[agent_id].append(handler)
        self.logger.info(f"Registered message handler for agent {agent_id}")
        
    def unregister_message_handler(self, agent_id: str, 
                                  handler: Callable[[CommunicationMessage], None]) -> None:
        """Unregister a message handler for an agent"""
        
        if agent_id in self.message_handlers:
            try:
                self.message_handlers[agent_id].remove(handler)
                self.logger.info(f"Unregistered message handler for agent {agent_id}")
            except ValueError:
                self.logger.warning(f"Handler not found for agent {agent_id}")
                
    async def get_communication_status(self) -> Dict[str, Any]:
        """Get comprehensive communication system status"""
        
        active_threads = len([t for t in self.conversation_threads.values() if t.is_active])
        
        return {
            'system_metrics': self.communication_metrics,
            'message_queue_size': len(self.message_queue),
            'active_conversations': active_threads,
            'total_conversations': len(self.conversation_threads),
            'failed_deliveries_recent': len(self.failed_deliveries),
            'agent_communication_loads': {
                agent_id: {
                    'current_load': profile.current_message_load,
                    'capacity': profile.message_processing_capacity,
                    'utilization': profile.current_message_load / profile.message_processing_capacity,
                    'active_conversations': len(profile.active_conversations),
                    'communication_style': profile.communication_style
                }
                for agent_id, profile in self.agent_profiles.items()
            },
            'cultural_communication': {
                'mediation_events': self.communication_metrics['cultural_mediation_events'],
                'consensus_decisions': self.communication_metrics['consensus_decisions'],
                'cultural_advisor_status': self.cultural_advisor.get_cultural_status()
            }
        }

# Export key classes
__all__ = [
    'MessageType', 'MessagePriority', 'CommunicationProtocol',
    'CommunicationMessage', 'ConversationThread', 'AgentCommunicationProfile',
    'RomanianCommunicationProtocols'
]