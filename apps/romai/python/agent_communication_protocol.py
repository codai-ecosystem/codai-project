"""
RomAI AGI - Agent Communication Protocol
Week 3 Day 2: Inter-Agent Communication and Coordination

Advanced communication system for multi-agent coordination with Romanian context awareness.
Handles message passing, state synchronization, and collaborative workflows.
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass, asdict
from enum import Enum
from typing import Dict, List, Any, Optional, Callable, Set
from uuid import uuid4
import aiohttp
import websockets
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MessageType(Enum):
    # Core communication
    TASK_ASSIGNMENT = "task_assignment"
    TASK_COMPLETION = "task_completion"
    STATUS_UPDATE = "status_update"
    HEARTBEAT = "heartbeat"
    
    # Collaboration
    KNOWLEDGE_SHARE = "knowledge_share"
    COLLABORATION_REQUEST = "collaboration_request"
    COLLABORATION_RESPONSE = "collaboration_response"
    RESOURCE_REQUEST = "resource_request"
    
    # Romanian context specific
    CULTURAL_CONTEXT_SHARE = "cultural_context_share"
    LINGUISTIC_ASSISTANCE = "linguistic_assistance"
    REGIONAL_INSIGHT = "regional_insight"
    
    # System messages
    AGENT_REGISTRATION = "agent_registration"
    AGENT_DEREGISTRATION = "agent_deregistration"
    SYSTEM_BROADCAST = "system_broadcast"
    ERROR_REPORT = "error_report"

class MessagePriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4
    CULTURAL_URGENT = 5  # Highest priority for Romanian cultural content

class CommunicationChannel(Enum):
    DIRECT = "direct"
    BROADCAST = "broadcast"
    GROUP = "group"
    ORCHESTRATOR = "orchestrator"

@dataclass
class Message:
    id: str
    type: MessageType
    sender_id: str
    recipient_id: Optional[str]
    channel: CommunicationChannel
    priority: MessagePriority
    content: Dict[str, Any]
    romanian_context: Optional[Dict[str, Any]] = None
    timestamp: datetime = None
    expires_at: Optional[datetime] = None
    retry_count: int = 0
    max_retries: int = 3
    delivery_confirmed: bool = False
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.expires_at is None:
            # Default expiration: 1 hour for most messages, 5 minutes for heartbeats
            if self.type == MessageType.HEARTBEAT:
                self.expires_at = self.timestamp + timedelta(minutes=5)
            else:
                self.expires_at = self.timestamp + timedelta(hours=1)

@dataclass
class AgentCapabilities:
    agent_id: str
    agent_type: str
    supported_message_types: List[MessageType]
    romanian_language_level: float  # 0.0-1.0
    cultural_expertise_areas: List[str]
    max_concurrent_conversations: int
    response_time_sla: float  # seconds
    availability_status: str

@dataclass
class ConversationContext:
    conversation_id: str
    participants: List[str]
    topic: str
    romanian_cultural_relevance: float
    started_at: datetime
    last_activity: datetime
    message_count: int
    shared_resources: List[str]

class AgentCommunicationProtocol:
    """
    Advanced communication protocol for multi-agent coordination with
    Romanian cultural context awareness and intelligent message routing.
    """
    
    def __init__(self, 
                 agent_id: str,
                 agent_type: str,
                 cbd_url: str = "http://localhost:4180",
                 websocket_port: int = 8765):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.cbd_url = cbd_url
        self.websocket_port = websocket_port
        self.session = None
        self.websocket = None
        
        # Message handling
        self.message_queue: List[Message] = []
        self.sent_messages: Dict[str, Message] = {}
        self.message_handlers: Dict[MessageType, Callable] = {}
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        
        # Agent registry
        self.known_agents: Dict[str, AgentCapabilities] = {}
        self.online_agents: Set[str] = set()
        
        # Romanian context management
        self.cultural_knowledge_cache: Dict[str, Any] = {}
        self.regional_preferences: Dict[str, Any] = {}
        self.linguistic_patterns: Dict[str, Any] = {}
        
        # Performance metrics
        self.messages_sent = 0
        self.messages_received = 0
        self.successful_collaborations = 0
        self.average_response_time = 0.0
        self.cultural_context_usage = 0
        
        # Setup default message handlers
        self._setup_default_handlers()
    
    async def initialize(self):
        """Initialize the communication protocol."""
        self.session = aiohttp.ClientSession()
        
        # Register agent capabilities
        await self._register_agent_capabilities()
        
        # Start WebSocket server for real-time communication
        await self._start_websocket_server()
        
        # Load cultural context
        await self._load_cultural_context()
        
        logger.info(f"📡 Agent Communication Protocol initialized for {self.agent_id}")
    
    def _setup_default_handlers(self):
        """Setup default message handlers."""
        self.message_handlers = {
            MessageType.HEARTBEAT: self._handle_heartbeat,
            MessageType.STATUS_UPDATE: self._handle_status_update,
            MessageType.TASK_ASSIGNMENT: self._handle_task_assignment,
            MessageType.KNOWLEDGE_SHARE: self._handle_knowledge_share,
            MessageType.CULTURAL_CONTEXT_SHARE: self._handle_cultural_context_share,
            MessageType.COLLABORATION_REQUEST: self._handle_collaboration_request,
            MessageType.LINGUISTIC_ASSISTANCE: self._handle_linguistic_assistance,
            MessageType.SYSTEM_BROADCAST: self._handle_system_broadcast,
            MessageType.ERROR_REPORT: self._handle_error_report
        }
    
    async def _register_agent_capabilities(self):
        """Register agent capabilities in the communication system."""
        capabilities = AgentCapabilities(
            agent_id=self.agent_id,
            agent_type=self.agent_type,
            supported_message_types=list(self.message_handlers.keys()),
            romanian_language_level=self._determine_romanian_language_level(),
            cultural_expertise_areas=self._determine_cultural_expertise(),
            max_concurrent_conversations=5,
            response_time_sla=2.0,  # 2 seconds
            availability_status="online"
        )
        
        capabilities_data = asdict(capabilities)
        capabilities_data['registered_at'] = datetime.now().isoformat()
        
        try:
            async with self.session.post(
                f"{self.cbd_url}/document",
                json={
                    "collection": "agent_capabilities",
                    "document": capabilities_data
                }
            ) as response:
                if response.status == 200:
                    logger.info(f"✅ Agent capabilities registered for {self.agent_id}")
        except Exception as e:
            logger.error(f"❌ Error registering agent capabilities: {str(e)}")
    
    def _determine_romanian_language_level(self) -> float:
        """Determine agent's Romanian language proficiency level."""
        # This would be based on agent type and configuration
        language_levels = {
            "romanian_language_specialist": 0.98,
            "cultural_context_agent": 0.95,
            "technical_implementation_agent": 0.75,
            "quality_assurance_agent": 0.80,
            "business_intelligence_agent": 0.70
        }
        return language_levels.get(self.agent_type, 0.50)
    
    def _determine_cultural_expertise(self) -> List[str]:
        """Determine agent's cultural expertise areas."""
        expertise_mapping = {
            "romanian_language_specialist": [
                "linguistic_analysis", "grammar", "semantics", "dialectology"
            ],
            "cultural_context_agent": [
                "folklore", "traditions", "history", "regional_customs", 
                "religious_practices", "cultural_sensitivity"
            ],
            "technical_implementation_agent": [
                "localization", "encoding", "ui_cultural_adaptation"
            ],
            "quality_assurance_agent": [
                "cultural_validation", "accuracy_assessment", "compliance"
            ],
            "business_intelligence_agent": [
                "market_analysis", "consumer_behavior", "cultural_trends"
            ]
        }
        return expertise_mapping.get(self.agent_type, ["general"])
    
    async def _start_websocket_server(self):
        """Start WebSocket server for real-time communication."""
        try:
            # This would start a WebSocket server in a real implementation
            # For now, we'll simulate WebSocket functionality
            self.websocket_active = True
            logger.info(f"📡 WebSocket server started on port {self.websocket_port}")
        except Exception as e:
            logger.error(f"❌ Error starting WebSocket server: {str(e)}")
    
    async def _load_cultural_context(self):
        """Load Romanian cultural context for intelligent communication."""
        cultural_data = {
            "formality_levels": {
                "formal": ["Domnule", "Doamnă", "Domnișoară", "stimat", "onorabil"],
                "informal": ["salut", "bună", "ce mai faci", "pa", "la revedere"],
                "respectful": ["cu respect", "cu considerație", "vă mulțumesc"]
            },
            "regional_greetings": {
                "Transilvania": ["Sărut mâna", "Bună dimineața"],
                "Moldova": ["Sănătate", "Noroc bun"],
                "Muntenia": ["Bună ziua", "Să trăiți"]
            },
            "cultural_courtesies": [
                "respectarea vârstei", "deferență față de tradiții",
                "importanța familiei", "ospitalitatea românească"
            ]
        }
        
        self.cultural_knowledge_cache = cultural_data
        logger.info("🧠 Cultural context loaded for communication")
    
    async def send_message(self, 
                          message_type: MessageType,
                          recipient_id: Optional[str],
                          content: Dict[str, Any],
                          channel: CommunicationChannel = CommunicationChannel.DIRECT,
                          priority: MessagePriority = MessagePriority.MEDIUM,
                          romanian_context: Optional[Dict[str, Any]] = None) -> str:
        """
        Send a message to another agent or broadcast.
        
        Args:
            message_type: Type of message to send
            recipient_id: Target agent ID (None for broadcast)
            content: Message content
            channel: Communication channel
            priority: Message priority
            romanian_context: Romanian cultural context if relevant
            
        Returns:
            Message ID for tracking
        """
        # Enhance content with Romanian cultural context if needed
        if romanian_context or self._has_romanian_content(content):
            enhanced_context = await self._enhance_romanian_context(content, romanian_context)
            romanian_context = enhanced_context
            self.cultural_context_usage += 1
        
        # Create message
        message = Message(
            id=str(uuid4()),
            type=message_type,
            sender_id=self.agent_id,
            recipient_id=recipient_id,
            channel=channel,
            priority=priority,
            content=content,
            romanian_context=romanian_context
        )
        
        # Queue message for delivery
        self.message_queue.append(message)
        self.sent_messages[message.id] = message
        self.messages_sent += 1
        
        # Store message in CBD for audit trail
        await self._store_message(message)
        
        # Attempt immediate delivery
        await self._deliver_message(message)
        
        logger.info(f"📤 Message sent: {message_type.value} to {recipient_id or 'broadcast'}")
        return message.id
    
    def _has_romanian_content(self, content: Dict[str, Any]) -> bool:
        """Check if content has Romanian text or cultural elements."""
        text_content = str(content).lower()
        
        # Check for Romanian diacritics
        romanian_chars = ['ă', 'â', 'î', 'ș', 'ț']
        if any(char in text_content for char in romanian_chars):
            return True
        
        # Check for Romanian cultural keywords
        cultural_keywords = [
            'român', 'românie', 'tradiție', 'folclor', 'cultura',
            'ortodox', 'cărturești', 'patrimoniu'
        ]
        return any(keyword in text_content for keyword in cultural_keywords)
    
    async def _enhance_romanian_context(self, 
                                       content: Dict[str, Any], 
                                       existing_context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Enhance message with Romanian cultural context."""
        enhanced_context = existing_context or {}
        
        # Detect formality level
        formality = self._detect_formality_level(content)
        if formality:
            enhanced_context['formality_level'] = formality
        
        # Detect regional context
        regional_context = self._detect_regional_context(content)
        if regional_context:
            enhanced_context['regional_context'] = regional_context
        
        # Add cultural sensitivity flags
        sensitivity = self._assess_cultural_sensitivity(content)
        if sensitivity > 0.7:
            enhanced_context['cultural_sensitivity'] = 'high'
            enhanced_context['handling_guidelines'] = [
                'Respectați tradițiile românești',
                'Utilizați limbaj formal și respectuos',
                'Considerați contextul cultural specific'
            ]
        
        # Add linguistic suggestions
        linguistic_suggestions = self._generate_linguistic_suggestions(content)
        if linguistic_suggestions:
            enhanced_context['linguistic_suggestions'] = linguistic_suggestions
        
        enhanced_context['enhanced_at'] = datetime.now().isoformat()
        enhanced_context['enhancement_version'] = '3.0.0'
        
        return enhanced_context
    
    def _detect_formality_level(self, content: Dict[str, Any]) -> Optional[str]:
        """Detect formality level of the content."""
        text_content = str(content).lower()
        
        formal_indicators = ['domnule', 'doamnă', 'vă rog', 'cu respect', 'stimat']
        informal_indicators = ['salut', 'bună', 'ce faci', 'pa']
        
        formal_count = sum(1 for indicator in formal_indicators if indicator in text_content)
        informal_count = sum(1 for indicator in informal_indicators if indicator in text_content)
        
        if formal_count > informal_count:
            return 'formal'
        elif informal_count > formal_count:
            return 'informal'
        
        return None
    
    def _detect_regional_context(self, content: Dict[str, Any]) -> Optional[str]:
        """Detect regional Romanian context in content."""
        text_content = str(content).lower()
        
        regional_indicators = {
            'Transilvania': ['brașov', 'cluj', 'sibiu', 'ardeal', 'transilvania'],
            'Moldova': ['iași', 'suceava', 'moldova', 'bucovina'],
            'Muntenia': ['bucurești', 'muntenia', 'țara românească']
        }
        
        for region, indicators in regional_indicators.items():
            if any(indicator in text_content for indicator in indicators):
                return region
        
        return None
    
    def _assess_cultural_sensitivity(self, content: Dict[str, Any]) -> float:
        """Assess cultural sensitivity level of content."""
        text_content = str(content).lower()
        
        high_sensitivity_keywords = [
            'religie', 'orthodox', 'tradiție', 'familie', 'neam',
            'patrie', 'istorie', 'războiul', 'eroic', 'martir'
        ]
        
        sensitivity_score = 0.0
        for keyword in high_sensitivity_keywords:
            if keyword in text_content:
                sensitivity_score += 0.2
        
        return min(sensitivity_score, 1.0)
    
    def _generate_linguistic_suggestions(self, content: Dict[str, Any]) -> List[str]:
        """Generate linguistic suggestions for Romanian content."""
        suggestions = []
        text_content = str(content)
        
        # Check for missing diacritics
        if 'romania' in text_content.lower() and 'românia' not in text_content.lower():
            suggestions.append("Utilizați 'România' cu diacritice pentru corectitudine")
        
        # Check for common mistakes
        common_mistakes = {
            'multumesc': 'mulțumesc',
            'copii': 'copii (verificați contextul: copii = children sau copii = copies)',
            'sunt': 'sunt (verificați conjugarea verbului a fi)'
        }
        
        for mistake, correction in common_mistakes.items():
            if mistake in text_content.lower():
                suggestions.append(f"Considerați corecția: {correction}")
        
        return suggestions
    
    async def _deliver_message(self, message: Message):
        """Deliver message to recipient(s)."""
        try:
            if message.channel == CommunicationChannel.BROADCAST:
                await self._broadcast_message(message)
            elif message.channel == CommunicationChannel.DIRECT:
                await self._send_direct_message(message)
            elif message.channel == CommunicationChannel.GROUP:
                await self._send_group_message(message)
            elif message.channel == CommunicationChannel.ORCHESTRATOR:
                await self._send_to_orchestrator(message)
        except Exception as e:
            logger.error(f"❌ Error delivering message {message.id}: {str(e)}")
            await self._handle_delivery_failure(message, str(e))
    
    async def _broadcast_message(self, message: Message):
        """Broadcast message to all online agents."""
        for agent_id in self.online_agents:
            if agent_id != self.agent_id:  # Don't send to self
                try:
                    await self._send_direct_message_to_agent(message, agent_id)
                except Exception as e:
                    logger.warning(f"⚠️ Failed to deliver broadcast to {agent_id}: {str(e)}")
    
    async def _send_direct_message(self, message: Message):
        """Send direct message to specific agent."""
        if message.recipient_id:
            await self._send_direct_message_to_agent(message, message.recipient_id)
        else:
            raise ValueError("Direct message requires recipient_id")
    
    async def _send_direct_message_to_agent(self, message: Message, recipient_id: str):
        """Send message directly to a specific agent."""
        # In a real implementation, this would use WebSocket or HTTP API
        # For now, we'll simulate by storing in CBD with recipient tag
        
        message_data = asdict(message)
        message_data['timestamp'] = message_data['timestamp'].isoformat()
        message_data['expires_at'] = message_data['expires_at'].isoformat()
        message_data['recipient_id'] = recipient_id
        message_data['delivery_status'] = 'sent'
        
        try:
            async with self.session.post(
                f"{self.cbd_url}/document",
                json={
                    "collection": f"agent_messages_{recipient_id}",
                    "document": message_data
                }
            ) as response:
                if response.status == 200:
                    message.delivery_confirmed = True
                    logger.debug(f"✅ Message delivered to {recipient_id}")
        except Exception as e:
            raise Exception(f"Failed to deliver message: {str(e)}")
    
    async def _send_group_message(self, message: Message):
        """Send message to a group of agents."""
        # Extract group members from message content or conversation context
        if 'group_members' in message.content:
            group_members = message.content['group_members']
            for member_id in group_members:
                if member_id != self.agent_id:
                    await self._send_direct_message_to_agent(message, member_id)
    
    async def _send_to_orchestrator(self, message: Message):
        """Send message to the orchestrator."""
        orchestrator_id = "romai_agi_orchestrator"
        await self._send_direct_message_to_agent(message, orchestrator_id)
    
    async def _handle_delivery_failure(self, message: Message, error: str):
        """Handle message delivery failure with retry logic."""
        message.retry_count += 1
        
        if message.retry_count <= message.max_retries:
            # Exponential backoff
            delay = 2 ** message.retry_count
            await asyncio.sleep(delay)
            
            logger.info(f"🔄 Retrying message delivery (attempt {message.retry_count})")
            await self._deliver_message(message)
        else:
            logger.error(f"❌ Message {message.id} failed after {message.max_retries} retries")
            
            # Send error report to orchestrator
            await self.send_message(
                MessageType.ERROR_REPORT,
                "romai_agi_orchestrator",
                {
                    "failed_message_id": message.id,
                    "error_description": error,
                    "retry_count": message.retry_count,
                    "agent_id": self.agent_id
                },
                CommunicationChannel.ORCHESTRATOR,
                MessagePriority.HIGH
            )
    
    async def _store_message(self, message: Message):
        """Store message in CBD for audit trail and analytics."""
        message_data = asdict(message)
        message_data['timestamp'] = message_data['timestamp'].isoformat()
        message_data['expires_at'] = message_data['expires_at'].isoformat()
        
        try:
            async with self.session.post(
                f"{self.cbd_url}/document",
                json={
                    "collection": "communication_audit",
                    "document": message_data
                }
            ) as response:
                if response.status == 200:
                    logger.debug(f"📝 Message {message.id} stored in audit trail")
        except Exception as e:
            logger.error(f"❌ Error storing message in audit trail: {str(e)}")
    
    async def receive_messages(self) -> List[Message]:
        """Receive and process incoming messages."""
        try:
            # In a real implementation, this would poll WebSocket or message queue
            # For now, we'll query CBD for messages addressed to this agent
            
            async with self.session.get(
                f"{self.cbd_url}/query",
                params={
                    "collection": f"agent_messages_{self.agent_id}",
                    "limit": 10,
                    "sort": "timestamp:desc"
                }
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    messages = []
                    
                    for msg_data in data.get('documents', []):
                        message = self._deserialize_message(msg_data)
                        if message and not self._is_message_expired(message):
                            messages.append(message)
                            await self._process_received_message(message)
                    
                    self.messages_received += len(messages)
                    return messages
        except Exception as e:
            logger.error(f"❌ Error receiving messages: {str(e)}")
        
        return []
    
    def _deserialize_message(self, msg_data: Dict[str, Any]) -> Optional[Message]:
        """Deserialize message data from CBD."""
        try:
            # Convert timestamp strings back to datetime objects
            timestamp = datetime.fromisoformat(msg_data['timestamp'].replace('Z', '+00:00'))
            expires_at = datetime.fromisoformat(msg_data['expires_at'].replace('Z', '+00:00'))
            
            return Message(
                id=msg_data['id'],
                type=MessageType(msg_data['type']),
                sender_id=msg_data['sender_id'],
                recipient_id=msg_data.get('recipient_id'),
                channel=CommunicationChannel(msg_data['channel']),
                priority=MessagePriority(msg_data['priority']),
                content=msg_data['content'],
                romanian_context=msg_data.get('romanian_context'),
                timestamp=timestamp,
                expires_at=expires_at,
                retry_count=msg_data.get('retry_count', 0),
                max_retries=msg_data.get('max_retries', 3),
                delivery_confirmed=msg_data.get('delivery_confirmed', False)
            )
        except Exception as e:
            logger.error(f"❌ Error deserializing message: {str(e)}")
            return None
    
    def _is_message_expired(self, message: Message) -> bool:
        """Check if message has expired."""
        return datetime.now() > message.expires_at
    
    async def _process_received_message(self, message: Message):
        """Process a received message using appropriate handler."""
        try:
            if message.type in self.message_handlers:
                handler = self.message_handlers[message.type]
                await handler(message)
            else:
                logger.warning(f"⚠️ No handler for message type: {message.type.value}")
        except Exception as e:
            logger.error(f"❌ Error processing message {message.id}: {str(e)}")
    
    # Default message handlers
    async def _handle_heartbeat(self, message: Message):
        """Handle heartbeat message."""
        sender_id = message.sender_id
        self.online_agents.add(sender_id)
        
        # Respond with our own heartbeat
        await self.send_message(
            MessageType.HEARTBEAT,
            sender_id,
            {
                "agent_id": self.agent_id,
                "status": "online",
                "timestamp": datetime.now().isoformat(),
                "capabilities_summary": {
                    "romanian_level": self._determine_romanian_language_level(),
                    "cultural_expertise": len(self._determine_cultural_expertise())
                }
            },
            CommunicationChannel.DIRECT,
            MessagePriority.LOW
        )
        logger.debug(f"💓 Heartbeat exchanged with {sender_id}")
    
    async def _handle_status_update(self, message: Message):
        """Handle status update message."""
        sender_id = message.sender_id
        status = message.content.get('status', 'unknown')
        
        logger.info(f"📊 Status update from {sender_id}: {status}")
        
        # Update agent status in local registry
        if sender_id in self.known_agents:
            self.known_agents[sender_id].availability_status = status
    
    async def _handle_task_assignment(self, message: Message):
        """Handle task assignment message."""
        task_info = message.content
        logger.info(f"📋 Task assignment received: {task_info.get('task_type', 'unknown')}")
        
        # Process Romanian context if present
        if message.romanian_context:
            logger.info(f"🧠 Romanian context: {message.romanian_context.get('formality_level', 'unknown')}")
    
    async def _handle_knowledge_share(self, message: Message):
        """Handle knowledge sharing message."""
        shared_knowledge = message.content.get('knowledge', {})
        knowledge_type = message.content.get('knowledge_type', 'general')
        
        logger.info(f"🧠 Knowledge shared: {knowledge_type}")
        
        # Store knowledge in local cache
        cache_key = f"{message.sender_id}_{knowledge_type}_{datetime.now().timestamp()}"
        self.cultural_knowledge_cache[cache_key] = shared_knowledge
        
        self.successful_collaborations += 1
    
    async def _handle_cultural_context_share(self, message: Message):
        """Handle Romanian cultural context sharing."""
        cultural_data = message.content.get('cultural_data', {})
        region = message.content.get('region', 'general')
        
        logger.info(f"🇷🇴 Cultural context shared for region: {region}")
        
        # Update regional preferences
        if region not in self.regional_preferences:
            self.regional_preferences[region] = {}
        
        self.regional_preferences[region].update(cultural_data)
        self.cultural_context_usage += 1
    
    async def _handle_collaboration_request(self, message: Message):
        """Handle collaboration request message."""
        collaboration_type = message.content.get('collaboration_type', 'general')
        task_description = message.content.get('task_description', '')
        
        logger.info(f"🤝 Collaboration request: {collaboration_type}")
        
        # Assess if we can help based on our capabilities
        can_help = await self._assess_collaboration_capability(message.content)
        
        # Send response
        await self.send_message(
            MessageType.COLLABORATION_RESPONSE,
            message.sender_id,
            {
                "request_id": message.id,
                "can_collaborate": can_help,
                "estimated_time": "2-5 minutes" if can_help else "N/A",
                "expertise_areas": self._determine_cultural_expertise(),
                "romanian_level": self._determine_romanian_language_level()
            },
            CommunicationChannel.DIRECT,
            MessagePriority.HIGH
        )
    
    async def _assess_collaboration_capability(self, request_content: Dict[str, Any]) -> bool:
        """Assess if agent can help with collaboration request."""
        required_expertise = request_content.get('required_expertise', [])
        my_expertise = self._determine_cultural_expertise()
        
        # Check if we have overlapping expertise
        overlap = set(required_expertise) & set(my_expertise)
        
        # Consider Romanian language requirements
        required_romanian_level = request_content.get('required_romanian_level', 0.0)
        my_romanian_level = self._determine_romanian_language_level()
        
        return len(overlap) > 0 and my_romanian_level >= required_romanian_level
    
    async def _handle_linguistic_assistance(self, message: Message):
        """Handle linguistic assistance request."""
        text_to_analyze = message.content.get('text', '')
        assistance_type = message.content.get('assistance_type', 'general')
        
        logger.info(f"📚 Linguistic assistance request: {assistance_type}")
        
        # Provide linguistic analysis based on agent capabilities
        if self.agent_type == "romanian_language_specialist":
            analysis = await self._provide_linguistic_analysis(text_to_analyze, assistance_type)
            
            await self.send_message(
                MessageType.LINGUISTIC_ASSISTANCE,
                message.sender_id,
                {
                    "request_id": message.id,
                    "analysis": analysis,
                    "confidence": 0.95,
                    "suggestions": analysis.get('suggestions', [])
                },
                CommunicationChannel.DIRECT,
                MessagePriority.HIGH
            )
    
    async def _provide_linguistic_analysis(self, text: str, analysis_type: str) -> Dict[str, Any]:
        """Provide linguistic analysis of Romanian text."""
        # Simplified linguistic analysis
        analysis = {
            "text_length": len(text),
            "has_diacritics": any(char in text for char in ['ă', 'â', 'î', 'ș', 'ț']),
            "formality_detected": self._detect_formality_level({"text": text}),
            "regional_indicators": self._detect_regional_context({"text": text}),
            "suggestions": []
        }
        
        if not analysis["has_diacritics"]:
            analysis["suggestions"].append("Considerați adăugarea diacriticelor pentru corectitudine")
        
        if analysis_type == "grammar":
            analysis["grammar_notes"] = "Analiza gramaticală completă necesită procesare avansată"
        
        return analysis
    
    async def _handle_system_broadcast(self, message: Message):
        """Handle system broadcast message."""
        broadcast_type = message.content.get('broadcast_type', 'general')
        system_message = message.content.get('message', '')
        
        logger.info(f"📢 System broadcast: {broadcast_type}")
        
        if broadcast_type == "agent_discovery":
            # Respond with our capabilities
            await self.send_message(
                MessageType.AGENT_REGISTRATION,
                message.sender_id,
                {
                    "agent_id": self.agent_id,
                    "agent_type": self.agent_type,
                    "capabilities": self._determine_cultural_expertise(),
                    "romanian_level": self._determine_romanian_language_level(),
                    "response_to_broadcast": message.id
                },
                CommunicationChannel.DIRECT,
                MessagePriority.MEDIUM
            )
    
    async def _handle_error_report(self, message: Message):
        """Handle error report message."""
        error_description = message.content.get('error_description', '')
        failed_message_id = message.content.get('failed_message_id', '')
        
        logger.warning(f"⚠️ Error report received: {error_description}")
        
        # If it's about our message, try alternative delivery
        if failed_message_id in self.sent_messages:
            logger.info(f"🔄 Attempting alternative delivery for message {failed_message_id}")
    
    async def start_communication_loop(self):
        """Start the main communication loop."""
        logger.info("📡 Starting communication loop...")
        
        while True:
            try:
                # Receive and process messages
                await self.receive_messages()
                
                # Send heartbeat periodically
                await self._send_periodic_heartbeat()
                
                # Clean up expired messages
                await self._cleanup_expired_messages()
                
                # Update performance metrics
                await self._update_communication_metrics()
                
                # Small delay
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"❌ Error in communication loop: {str(e)}")
                await asyncio.sleep(5)
    
    async def _send_periodic_heartbeat(self):
        """Send periodic heartbeat to maintain presence."""
        # Send heartbeat every 30 seconds
        if not hasattr(self, '_last_heartbeat') or \
           (datetime.now() - self._last_heartbeat).total_seconds() > 30:
            
            await self.send_message(
                MessageType.HEARTBEAT,
                None,  # Broadcast
                {
                    "agent_id": self.agent_id,
                    "status": "online",
                    "timestamp": datetime.now().isoformat()
                },
                CommunicationChannel.BROADCAST,
                MessagePriority.LOW
            )
            
            self._last_heartbeat = datetime.now()
    
    async def _cleanup_expired_messages(self):
        """Clean up expired messages from queues."""
        current_time = datetime.now()
        
        # Clean message queue
        self.message_queue = [
            msg for msg in self.message_queue 
            if current_time <= msg.expires_at
        ]
        
        # Clean sent messages
        expired_messages = [
            msg_id for msg_id, msg in self.sent_messages.items()
            if current_time > msg.expires_at
        ]
        
        for msg_id in expired_messages:
            del self.sent_messages[msg_id]
    
    async def _update_communication_metrics(self):
        """Update communication performance metrics."""
        metrics = {
            "agent_id": self.agent_id,
            "messages_sent": self.messages_sent,
            "messages_received": self.messages_received,
            "successful_collaborations": self.successful_collaborations,
            "cultural_context_usage": self.cultural_context_usage,
            "online_agents_count": len(self.online_agents),
            "conversation_contexts": len(self.conversation_contexts),
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            async with self.session.post(
                f"{self.cbd_url}/document",
                json={
                    "collection": "communication_metrics",
                    "document": metrics
                }
            ) as response:
                if response.status == 200:
                    logger.debug("📊 Communication metrics updated")
        except Exception as e:
            logger.error(f"❌ Error updating communication metrics: {str(e)}")
    
    async def get_communication_status(self) -> Dict[str, Any]:
        """Get comprehensive communication status."""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "communication_health": "operational",
            "messages_sent": self.messages_sent,
            "messages_received": self.messages_received,
            "successful_collaborations": self.successful_collaborations,
            "cultural_context_usage": self.cultural_context_usage,
            "online_agents": list(self.online_agents),
            "message_queue_size": len(self.message_queue),
            "active_conversations": len(self.conversation_contexts),
            "romanian_language_level": self._determine_romanian_language_level(),
            "cultural_expertise_areas": self._determine_cultural_expertise(),
            "websocket_status": getattr(self, 'websocket_active', False),
            "timestamp": datetime.now().isoformat()
        }
    
    async def cleanup(self):
        """Cleanup communication resources."""
        # Send deregistration message
        await self.send_message(
            MessageType.AGENT_DEREGISTRATION,
            None,
            {
                "agent_id": self.agent_id,
                "reason": "normal_shutdown",
                "timestamp": datetime.now().isoformat()
            },
            CommunicationChannel.BROADCAST,
            MessagePriority.HIGH
        )
        
        if self.session:
            await self.session.close()
        
        logger.info(f"📡 Communication protocol cleaned up for {self.agent_id}")

# Example usage and testing
async def test_communication_protocol():
    """Test the agent communication protocol."""
    # Create two test agents
    agent1 = AgentCommunicationProtocol("test_agent_1", "romanian_language_specialist")
    agent2 = AgentCommunicationProtocol("test_agent_2", "cultural_context_agent")
    
    try:
        # Initialize agents
        await agent1.initialize()
        await agent2.initialize()
        
        # Test Romanian cultural communication
        await agent1.send_message(
            MessageType.CULTURAL_CONTEXT_SHARE,
            agent2.agent_id,
            {
                "cultural_data": {
                    "tradition": "colinde de Crăciun",
                    "region": "Transilvania",
                    "significance": "foarte importantă pentru identitatea culturală"
                },
                "region": "Transilvania",
                "cultural_importance": 0.95
            },
            romanian_context={
                "formality_level": "formal",
                "cultural_sensitivity": "high"
            }
        )
        
        # Test collaboration request
        await agent2.send_message(
            MessageType.COLLABORATION_REQUEST,
            agent1.agent_id,
            {
                "collaboration_type": "linguistic_analysis",
                "task_description": "Analiză lingvistică text tradițional românesc",
                "required_expertise": ["linguistic_analysis", "cultural_context"],
                "required_romanian_level": 0.9,
                "urgency": "medium"
            }
        )
        
        # Simulate message processing
        await asyncio.sleep(1)
        
        # Process messages
        messages1 = await agent1.receive_messages()
        messages2 = await agent2.receive_messages()
        
        logger.info(f"Agent 1 received {len(messages1)} messages")
        logger.info(f"Agent 2 received {len(messages2)} messages")
        
        # Get status reports
        status1 = await agent1.get_communication_status()
        status2 = await agent2.get_communication_status()
        
        logger.info("📊 Communication Test Results:")
        logger.info(f"Agent 1 - Messages Sent: {status1['messages_sent']}, Received: {status1['messages_received']}")
        logger.info(f"Agent 2 - Messages Sent: {status2['messages_sent']}, Received: {status2['messages_received']}")
        logger.info(f"Cultural Context Usage: {status1['cultural_context_usage']} + {status2['cultural_context_usage']}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Communication test failed: {str(e)}")
        return False
    finally:
        await agent1.cleanup()
        await agent2.cleanup()

if __name__ == "__main__":
    print("📡 RomAI AGI - Agent Communication Protocol v3.0.0")
    print("=" * 55)
    asyncio.run(test_communication_protocol())
