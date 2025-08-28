"""
Multi-Agent Coordination System
==============================

Advanced multi-agent coordination system for ROMAI AGI instances.
Enables distributed reasoning, collaboration, and coordinated problem-solving
across multiple AGI agents.

This system builds on the Advanced Reasoning Engine (Phase 3.1) to enable:
- Agent discovery and registration
- Inter-agent communication protocols
- Distributed reasoning coordination
- Task distribution and load balancing
- Consensus mechanisms and conflict resolution
- Performance monitoring and optimization

Author: ROMAI AGI Team
Date: 2025-08-28
Version: 1.0.0
"""

import asyncio
import json
import time
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
import hashlib
import threading
from collections import defaultdict, deque
import websockets
import aiohttp
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentRole(Enum):
    """Roles that agents can play in multi-agent coordination."""
    COORDINATOR = "coordinator"
    SPECIALIST = "specialist"  
    MONITOR = "monitor"
    BACKUP = "backup"
    LEARNER = "learner"


class TaskPriority(Enum):
    """Task priority levels for distributed reasoning."""
    CRITICAL = "critical"
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"
    BACKGROUND = "background"


class CoordinationStatus(Enum):
    """Status of coordination activities."""
    INITIALIZING = "initializing"
    ACTIVE = "active"
    COORDINATING = "coordinating"
    CONSENSUS = "consensus"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"


class MessageType(Enum):
    """Types of inter-agent messages."""
    HANDSHAKE = "handshake"
    TASK_REQUEST = "task_request"
    TASK_RESPONSE = "task_response"
    REASONING_SHARE = "reasoning_share"
    CONSENSUS_PROPOSAL = "consensus_proposal"
    CONSENSUS_VOTE = "consensus_vote"
    STATUS_UPDATE = "status_update"
    HEARTBEAT = "heartbeat"
    SHUTDOWN = "shutdown"


@dataclass
class AgentCapability:
    """Represents a capability that an agent provides."""
    capability_id: str
    name: str
    description: str
    expertise_level: float  # 0.0 to 1.0
    processing_speed: float  # operations per second
    reliability_score: float  # 0.0 to 1.0
    resource_requirements: Dict[str, Any] = field(default_factory=dict)
    specializations: List[str] = field(default_factory=list)


@dataclass
class AgentInfo:
    """Information about a participating agent."""
    agent_id: str
    name: str
    role: AgentRole
    endpoint: str
    capabilities: List[AgentCapability] = field(default_factory=list)
    status: str = "active"
    last_heartbeat: datetime = field(default_factory=datetime.now)
    performance_metrics: Dict[str, float] = field(default_factory=dict)
    trust_score: float = 1.0
    
    def is_healthy(self, timeout_seconds: int = 30) -> bool:
        """Check if agent is healthy based on heartbeat."""
        if self.status != "active":
            return False
        time_since_heartbeat = datetime.now() - self.last_heartbeat
        return time_since_heartbeat.total_seconds() < timeout_seconds


@dataclass
class CoordinationTask:
    """A task that requires multi-agent coordination."""
    task_id: str
    description: str
    priority: TaskPriority
    required_capabilities: List[str]
    input_data: Dict[str, Any]
    expected_output: Dict[str, Any] = field(default_factory=dict)
    assigned_agents: List[str] = field(default_factory=list)
    status: CoordinationStatus = CoordinationStatus.INITIALIZING
    created_at: datetime = field(default_factory=datetime.now)
    deadline: Optional[datetime] = None
    progress: float = 0.0
    intermediate_results: Dict[str, Any] = field(default_factory=dict)
    
    def is_expired(self) -> bool:
        """Check if task has exceeded its deadline."""
        if self.deadline is None:
            return False
        return datetime.now() > self.deadline


@dataclass
class InterAgentMessage:
    """Message exchanged between agents."""
    message_id: str
    sender_id: str
    recipient_id: Optional[str]  # None for broadcast
    message_type: MessageType
    content: Dict[str, Any]
    timestamp: datetime = field(default_factory=datetime.now)
    priority: TaskPriority = TaskPriority.NORMAL
    requires_response: bool = False
    correlation_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary for serialization."""
        return {
            "message_id": self.message_id,
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
            "message_type": self.message_type.value,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "priority": self.priority.value,
            "requires_response": self.requires_response,
            "correlation_id": self.correlation_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'InterAgentMessage':
        """Create message from dictionary."""
        return cls(
            message_id=data["message_id"],
            sender_id=data["sender_id"],
            recipient_id=data.get("recipient_id"),
            message_type=MessageType(data["message_type"]),
            content=data["content"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            priority=TaskPriority(data.get("priority", "normal")),
            requires_response=data.get("requires_response", False),
            correlation_id=data.get("correlation_id")
        )


class InterAgentCommunication:
    """Handles communication between agents."""
    
    def __init__(self, agent_id: str, port: int = 8000):
        """Initialize inter-agent communication system."""
        self.agent_id = agent_id
        self.port = port
        self.message_handlers: Dict[MessageType, Callable] = {}
        self.active_connections: Dict[str, Any] = {}
        self.message_queue: asyncio.Queue = asyncio.Queue()
        self.response_waiters: Dict[str, asyncio.Event] = {}
        self.responses: Dict[str, InterAgentMessage] = {}
        self.server = None
        self.running = False
        
        logger.info(f"💬 Inter-Agent Communication initialized for {agent_id}")
    
    def register_handler(self, message_type: MessageType, handler: Callable):
        """Register a handler for a specific message type."""
        self.message_handlers[message_type] = handler
        logger.info(f"📝 Registered handler for {message_type.value}")
    
    async def start_server(self):
        """Start the communication server."""
        try:
            self.server = await websockets.serve(
                self._handle_connection, 
                "localhost", 
                self.port
            )
            self.running = True
            logger.info(f"🚀 Communication server started on port {self.port}")
            
            # Start message processing loop
            asyncio.create_task(self._process_messages())
            
        except Exception as e:
            logger.error(f"❌ Failed to start communication server: {e}")
            raise
    
    async def stop_server(self):
        """Stop the communication server."""
        self.running = False
        if self.server:
            self.server.close()
            await self.server.wait_closed()
        
        # Close all active connections
        for connection in self.active_connections.values():
            await connection.close()
        
        logger.info("🛑 Communication server stopped")
    
    async def _handle_connection(self, websocket, path):
        """Handle incoming WebSocket connections."""
        agent_id = None
        try:
            async for raw_message in websocket:
                try:
                    data = json.loads(raw_message)
                    message = InterAgentMessage.from_dict(data)
                    
                    # Store connection for the sender
                    if message.sender_id not in self.active_connections:
                        self.active_connections[message.sender_id] = websocket
                        agent_id = message.sender_id
                        logger.info(f"🔗 New connection from agent {agent_id}")
                    
                    await self.message_queue.put(message)
                    
                except json.JSONDecodeError as e:
                    logger.error(f"❌ Invalid JSON in message: {e}")
                except Exception as e:
                    logger.error(f"❌ Error processing message: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            if agent_id and agent_id in self.active_connections:
                del self.active_connections[agent_id]
                logger.info(f"🔌 Connection closed for agent {agent_id}")
        except Exception as e:
            logger.error(f"❌ Connection error: {e}")
    
    async def _process_messages(self):
        """Process incoming messages."""
        while self.running:
            try:
                # Wait for message with timeout
                try:
                    message = await asyncio.wait_for(
                        self.message_queue.get(), 
                        timeout=1.0
                    )
                except asyncio.TimeoutError:
                    continue
                
                # Check if this is a response to a waiting request
                if message.correlation_id and message.correlation_id in self.response_waiters:
                    self.responses[message.correlation_id] = message
                    self.response_waiters[message.correlation_id].set()
                    continue
                
                # Handle message based on type
                if message.message_type in self.message_handlers:
                    try:
                        response = await self.message_handlers[message.message_type](message)
                        
                        # Send response if required and generated
                        if message.requires_response and response:
                            await self.send_message(response)
                            
                    except Exception as e:
                        logger.error(f"❌ Error handling {message.message_type.value}: {e}")
                        
                        # Send error response if required
                        if message.requires_response:
                            error_response = InterAgentMessage(
                                message_id=str(uuid.uuid4()),
                                sender_id=self.agent_id,
                                recipient_id=message.sender_id,
                                message_type=message.message_type,
                                content={"error": str(e), "success": False},
                                correlation_id=message.message_id
                            )
                            await self.send_message(error_response)
                else:
                    logger.warning(f"⚠️ No handler for message type {message.message_type.value}")
                    
            except Exception as e:
                logger.error(f"❌ Error in message processing loop: {e}")
                await asyncio.sleep(1)
    
    async def send_message(self, message: InterAgentMessage) -> bool:
        """Send a message to another agent."""
        try:
            if message.recipient_id and message.recipient_id in self.active_connections:
                connection = self.active_connections[message.recipient_id]
                await connection.send(json.dumps(message.to_dict()))
                logger.debug(f"📤 Sent {message.message_type.value} to {message.recipient_id}")
                return True
            elif message.recipient_id is None:
                # Broadcast to all connections
                for agent_id, connection in self.active_connections.items():
                    await connection.send(json.dumps(message.to_dict()))
                logger.debug(f"📡 Broadcast {message.message_type.value} to {len(self.active_connections)} agents")
                return True
            else:
                logger.warning(f"⚠️ No connection to recipient {message.recipient_id}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to send message: {e}")
            return False
    
    async def send_request(self, message: InterAgentMessage, timeout: float = 30.0) -> Optional[InterAgentMessage]:
        """Send a request message and wait for response."""
        message.requires_response = True
        correlation_id = message.message_id
        
        # Set up response waiter
        self.response_waiters[correlation_id] = asyncio.Event()
        
        try:
            # Send the message
            success = await self.send_message(message)
            if not success:
                return None
            
            # Wait for response
            await asyncio.wait_for(
                self.response_waiters[correlation_id].wait(),
                timeout=timeout
            )
            
            return self.responses.get(correlation_id)
            
        except asyncio.TimeoutError:
            logger.warning(f"⏰ Request {correlation_id} timed out")
            return None
        finally:
            # Cleanup
            self.response_waiters.pop(correlation_id, None)
            self.responses.pop(correlation_id, None)
    
    async def connect_to_agent(self, agent_endpoint: str) -> bool:
        """Connect to another agent."""
        try:
            # This would connect to the agent's WebSocket endpoint
            # Implementation depends on the specific networking setup
            logger.info(f"🔗 Connecting to agent at {agent_endpoint}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to {agent_endpoint}: {e}")
            return False


class DistributedReasoning:
    """Coordinates distributed reasoning across multiple agents."""
    
    def __init__(self, agent_id: str, communication: InterAgentCommunication):
        """Initialize distributed reasoning system."""
        self.agent_id = agent_id
        self.communication = communication
        self.active_reasonings: Dict[str, CoordinationTask] = {}
        self.reasoning_results: Dict[str, Dict[str, Any]] = {}
        self.consensus_votes: Dict[str, Dict[str, Any]] = defaultdict(dict)
        
        # Register message handlers
        self.communication.register_handler(
            MessageType.REASONING_SHARE, 
            self._handle_reasoning_share
        )
        self.communication.register_handler(
            MessageType.CONSENSUS_PROPOSAL, 
            self._handle_consensus_proposal
        )
        self.communication.register_handler(
            MessageType.CONSENSUS_VOTE, 
            self._handle_consensus_vote
        )
        
        logger.info(f"🧠 Distributed Reasoning initialized for {agent_id}")
    
    async def start_distributed_reasoning(
        self, 
        problem: str, 
        domain: str,
        participating_agents: List[str],
        timeout_minutes: int = 10
    ) -> Dict[str, Any]:
        """Start a distributed reasoning session."""
        reasoning_id = str(uuid.uuid4())
        
        logger.info(f"🚀 Starting distributed reasoning: {reasoning_id}")
        logger.info(f"   Problem: {problem}")
        logger.info(f"   Domain: {domain}")
        logger.info(f"   Agents: {participating_agents}")
        
        try:
            # Create reasoning task
            task = CoordinationTask(
                task_id=reasoning_id,
                description=f"Distributed reasoning: {problem}",
                priority=TaskPriority.NORMAL,
                required_capabilities=["reasoning", domain],
                input_data={
                    "problem": problem,
                    "domain": domain,
                    "participating_agents": participating_agents
                },
                deadline=datetime.now() + timedelta(minutes=timeout_minutes)
            )
            
            self.active_reasonings[reasoning_id] = task
            
            # Share reasoning request with participating agents
            reasoning_message = InterAgentMessage(
                message_id=str(uuid.uuid4()),
                sender_id=self.agent_id,
                recipient_id=None,  # Broadcast
                message_type=MessageType.REASONING_SHARE,
                content={
                    "reasoning_id": reasoning_id,
                    "problem": problem,
                    "domain": domain,
                    "action": "start_reasoning",
                    "participating_agents": participating_agents
                }
            )
            
            await self.communication.send_message(reasoning_message)
            
            # Perform local reasoning
            local_result = await self._perform_local_reasoning(problem, domain)
            
            # Share local reasoning result
            result_message = InterAgentMessage(
                message_id=str(uuid.uuid4()),
                sender_id=self.agent_id,
                recipient_id=None,  # Broadcast
                message_type=MessageType.REASONING_SHARE,
                content={
                    "reasoning_id": reasoning_id,
                    "action": "share_result",
                    "result": local_result,
                    "confidence": local_result.get("confidence", 0.5)
                }
            )
            
            await self.communication.send_message(result_message)
            
            # Wait for other agents' results
            deadline = datetime.now() + timedelta(minutes=timeout_minutes)
            while datetime.now() < deadline:
                if len(self.reasoning_results.get(reasoning_id, {})) >= len(participating_agents):
                    break
                await asyncio.sleep(1)
            
            # Aggregate results and form consensus
            final_result = await self._form_consensus(reasoning_id)
            
            # Update task status
            task.status = CoordinationStatus.COMPLETED
            task.progress = 1.0
            task.expected_output = final_result
            
            logger.info(f"✅ Distributed reasoning completed: {reasoning_id}")
            return final_result
            
        except Exception as e:
            logger.error(f"❌ Distributed reasoning failed: {e}")
            if reasoning_id in self.active_reasonings:
                self.active_reasonings[reasoning_id].status = CoordinationStatus.FAILED
            raise
    
    async def _perform_local_reasoning(self, problem: str, domain: str) -> Dict[str, Any]:
        """Perform reasoning locally (simplified for now)."""
        # This would integrate with the Advanced Reasoning Engine from Phase 3.1
        # For now, we'll use a simplified mock reasoning
        
        await asyncio.sleep(0.1)  # Simulate thinking time
        
        local_result = {
            "agent_id": self.agent_id,
            "problem": problem,
            "domain": domain,
            "conclusion": f"Local reasoning result for: {problem}",
            "reasoning_steps": [
                "Analyzed problem context",
                "Applied domain knowledge",
                "Generated solution"
            ],
            "confidence": 0.7,
            "reasoning_time": 0.1,
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "agent_capability": "distributed_reasoning"
            }
        }
        
        logger.info(f"🧠 Local reasoning completed with {local_result['confidence']} confidence")
        return local_result
    
    async def _form_consensus(self, reasoning_id: str) -> Dict[str, Any]:
        """Form consensus from multiple reasoning results."""
        results = self.reasoning_results.get(reasoning_id, {})
        
        if not results:
            logger.warning(f"⚠️ No results available for consensus: {reasoning_id}")
            return {"error": "No results available", "consensus": False}
        
        logger.info(f"🤝 Forming consensus from {len(results)} results")
        
        # Simple consensus algorithm - in practice, this would be more sophisticated
        all_conclusions = [result["conclusion"] for result in results.values()]
        all_confidences = [result["confidence"] for result in results.values()]
        
        # Calculate consensus metrics
        avg_confidence = sum(all_confidences) / len(all_confidences)
        conclusion_agreement = len(set(all_conclusions)) == 1
        
        # Create consensus result
        consensus_result = {
            "reasoning_id": reasoning_id,
            "consensus_achieved": conclusion_agreement,
            "consensus_confidence": avg_confidence,
            "participating_agents": list(results.keys()),
            "individual_results": results,
            "final_conclusion": all_conclusions[0] if conclusion_agreement else "Mixed conclusions",
            "consensus_metadata": {
                "algorithm": "simple_majority",
                "timestamp": datetime.now().isoformat(),
                "result_count": len(results)
            }
        }
        
        # Broadcast consensus proposal
        consensus_message = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_id=self.agent_id,
            recipient_id=None,
            message_type=MessageType.CONSENSUS_PROPOSAL,
            content={
                "reasoning_id": reasoning_id,
                "consensus_result": consensus_result
            }
        )
        
        await self.communication.send_message(consensus_message)
        
        logger.info(f"✅ Consensus formed with {avg_confidence:.2f} confidence")
        return consensus_result
    
    async def _handle_reasoning_share(self, message: InterAgentMessage) -> Optional[InterAgentMessage]:
        """Handle shared reasoning from other agents."""
        content = message.content
        reasoning_id = content.get("reasoning_id")
        action = content.get("action")
        
        if action == "start_reasoning":
            logger.info(f"🔄 Received reasoning request: {reasoning_id}")
            
            # Participate in distributed reasoning
            problem = content["problem"]
            domain = content["domain"]
            
            # Perform local reasoning
            local_result = await self._perform_local_reasoning(problem, domain)
            
            # Store our result
            if reasoning_id not in self.reasoning_results:
                self.reasoning_results[reasoning_id] = {}
            self.reasoning_results[reasoning_id][self.agent_id] = local_result
            
            # Share our result
            result_message = InterAgentMessage(
                message_id=str(uuid.uuid4()),
                sender_id=self.agent_id,
                recipient_id=None,
                message_type=MessageType.REASONING_SHARE,
                content={
                    "reasoning_id": reasoning_id,
                    "action": "share_result",
                    "result": local_result,
                    "confidence": local_result.get("confidence", 0.5)
                }
            )
            
            await self.communication.send_message(result_message)
            
        elif action == "share_result":
            reasoning_result = content["result"]
            sender_id = message.sender_id
            
            # Store the shared result
            if reasoning_id not in self.reasoning_results:
                self.reasoning_results[reasoning_id] = {}
            self.reasoning_results[reasoning_id][sender_id] = reasoning_result
            
            logger.info(f"📥 Received reasoning result from {sender_id} for {reasoning_id}")
        
        return None
    
    async def _handle_consensus_proposal(self, message: InterAgentMessage) -> Optional[InterAgentMessage]:
        """Handle consensus proposal from coordinator."""
        content = message.content
        reasoning_id = content.get("reasoning_id")
        consensus_result = content.get("consensus_result")
        
        logger.info(f"🗳️ Received consensus proposal for {reasoning_id}")
        
        # Simple voting - accept if confidence is reasonable
        vote = consensus_result.get("consensus_confidence", 0) > 0.3
        
        # Send vote
        vote_message = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_id=self.agent_id,
            recipient_id=message.sender_id,
            message_type=MessageType.CONSENSUS_VOTE,
            content={
                "reasoning_id": reasoning_id,
                "vote": vote,
                "voter_confidence": 0.8,
                "comments": "Automated consensus vote"
            }
        )
        
        return vote_message
    
    async def _handle_consensus_vote(self, message: InterAgentMessage) -> Optional[InterAgentMessage]:
        """Handle consensus votes from other agents."""
        content = message.content
        reasoning_id = content.get("reasoning_id")
        vote = content.get("vote")
        voter_id = message.sender_id
        
        # Store the vote
        self.consensus_votes[reasoning_id][voter_id] = {
            "vote": vote,
            "confidence": content.get("voter_confidence", 0.5),
            "timestamp": message.timestamp
        }
        
        logger.info(f"📊 Received vote from {voter_id} for {reasoning_id}: {vote}")
        
        return None


class AgentCoordinator:
    """Main coordinator for multi-agent systems."""
    
    def __init__(self, agent_id: str, name: str, role: AgentRole = AgentRole.COORDINATOR, port: int = 8000):
        """Initialize the agent coordinator."""
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.port = port
        
        # Initialize communication
        self.communication = InterAgentCommunication(agent_id, port)
        
        # Initialize distributed reasoning
        self.distributed_reasoning = DistributedReasoning(agent_id, self.communication)
        
        # Agent registry
        self.known_agents: Dict[str, AgentInfo] = {}
        self.local_capabilities: List[AgentCapability] = []
        self.coordination_tasks: Dict[str, CoordinationTask] = {}
        
        # Performance tracking
        self.coordination_stats = {
            "tasks_completed": 0,
            "tasks_failed": 0,
            "total_coordination_time": 0.0,
            "average_agent_response_time": 0.0
        }
        
        # Setup message handlers
        self._setup_message_handlers()
        
        logger.info(f"🤖 Agent Coordinator '{name}' ({agent_id}) initialized")
        logger.info(f"   Role: {role.value}")
        logger.info(f"   Port: {port}")
    
    def _setup_message_handlers(self):
        """Setup message handlers for coordination."""
        self.communication.register_handler(MessageType.HANDSHAKE, self._handle_handshake)
        self.communication.register_handler(MessageType.TASK_REQUEST, self._handle_task_request)
        self.communication.register_handler(MessageType.STATUS_UPDATE, self._handle_status_update)
        self.communication.register_handler(MessageType.HEARTBEAT, self._handle_heartbeat)
    
    async def start(self):
        """Start the agent coordinator."""
        logger.info(f"🚀 Starting Agent Coordinator: {self.name}")
        
        try:
            # Start communication server
            await self.communication.start_server()
            
            # Register default capabilities
            await self._register_default_capabilities()
            
            # Start heartbeat
            asyncio.create_task(self._heartbeat_loop())
            
            # Start health monitoring
            asyncio.create_task(self._health_monitoring_loop())
            
            logger.info(f"✅ Agent Coordinator {self.name} is fully operational")
            
        except Exception as e:
            logger.error(f"❌ Failed to start Agent Coordinator: {e}")
            raise
    
    async def stop(self):
        """Stop the agent coordinator."""
        logger.info(f"🛑 Stopping Agent Coordinator: {self.name}")
        
        # Send shutdown message to all known agents
        shutdown_message = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_id=self.agent_id,
            recipient_id=None,
            message_type=MessageType.SHUTDOWN,
            content={"reason": "Coordinator shutdown"}
        )
        
        await self.communication.send_message(shutdown_message)
        
        # Stop communication
        await self.communication.stop_server()
        
        logger.info(f"✅ Agent Coordinator {self.name} stopped")
    
    async def _register_default_capabilities(self):
        """Register default capabilities for this agent."""
        default_capabilities = [
            AgentCapability(
                capability_id="distributed_reasoning",
                name="Distributed Reasoning",
                description="Coordinate reasoning across multiple agents",
                expertise_level=0.8,
                processing_speed=10.0,
                reliability_score=0.9,
                specializations=["coordination", "consensus"]
            ),
            AgentCapability(
                capability_id="task_management",
                name="Task Management",
                description="Manage and distribute tasks across agents",
                expertise_level=0.9,
                processing_speed=50.0,
                reliability_score=0.95,
                specializations=["scheduling", "load_balancing"]
            )
        ]
        
        self.local_capabilities.extend(default_capabilities)
        logger.info(f"📝 Registered {len(default_capabilities)} default capabilities")
    
    async def discover_agents(self, network_range: str = "localhost") -> List[AgentInfo]:
        """Discover other agents in the network."""
        logger.info(f"🔍 Discovering agents in network: {network_range}")
        
        discovered_agents = []
        
        # Simple discovery - try connecting to common ports
        common_ports = [8000, 8001, 8002, 8003, 8004]
        
        for port in common_ports:
            if port == self.port:
                continue
                
            try:
                # Try to connect and handshake
                endpoint = f"ws://{network_range}:{port}"
                
                handshake_message = InterAgentMessage(
                    message_id=str(uuid.uuid4()),
                    sender_id=self.agent_id,
                    recipient_id=None,
                    message_type=MessageType.HANDSHAKE,
                    content={
                        "agent_name": self.name,
                        "agent_role": self.role.value,
                        "capabilities": [cap.__dict__ for cap in self.local_capabilities],
                        "endpoint": f"ws://localhost:{self.port}"
                    }
                )
                
                # This would actually attempt connection - simplified for now
                logger.debug(f"🤝 Attempting handshake with {endpoint}")
                
            except Exception as e:
                logger.debug(f"No agent found at port {port}")
        
        logger.info(f"🔍 Discovery completed: {len(discovered_agents)} agents found")
        return discovered_agents
    
    async def coordinate_task(
        self, 
        task_description: str, 
        required_capabilities: List[str],
        priority: TaskPriority = TaskPriority.NORMAL
    ) -> CoordinationTask:
        """Coordinate a task across multiple agents."""
        task_id = str(uuid.uuid4())
        
        logger.info(f"📋 Coordinating new task: {task_id}")
        logger.info(f"   Description: {task_description}")
        logger.info(f"   Required capabilities: {required_capabilities}")
        logger.info(f"   Priority: {priority.value}")
        
        # Create coordination task
        task = CoordinationTask(
            task_id=task_id,
            description=task_description,
            priority=priority,
            required_capabilities=required_capabilities,
            input_data={"original_request": task_description}
        )
        
        self.coordination_tasks[task_id] = task
        
        try:
            # Find suitable agents
            suitable_agents = self._find_suitable_agents(required_capabilities)
            
            if not suitable_agents:
                logger.warning(f"⚠️ No suitable agents found for capabilities: {required_capabilities}")
                task.status = CoordinationStatus.FAILED
                return task
            
            # Assign agents to task
            task.assigned_agents = [agent.agent_id for agent in suitable_agents]
            task.status = CoordinationStatus.ACTIVE
            
            # Send task requests to assigned agents
            for agent in suitable_agents:
                task_request = InterAgentMessage(
                    message_id=str(uuid.uuid4()),
                    sender_id=self.agent_id,
                    recipient_id=agent.agent_id,
                    message_type=MessageType.TASK_REQUEST,
                    content={
                        "task_id": task_id,
                        "description": task_description,
                        "required_capabilities": required_capabilities,
                        "priority": priority.value,
                        "deadline": task.deadline.isoformat() if task.deadline else None
                    },
                    requires_response=True
                )
                
                response = await self.communication.send_request(task_request)
                
                if response and response.content.get("accepted", False):
                    logger.info(f"✅ Agent {agent.agent_id} accepted task {task_id}")
                else:
                    logger.warning(f"❌ Agent {agent.agent_id} rejected task {task_id}")
            
            task.status = CoordinationStatus.COORDINATING
            
            # Monitor task progress
            await self._monitor_task_progress(task)
            
            logger.info(f"✅ Task coordination completed: {task_id}")
            return task
            
        except Exception as e:
            logger.error(f"❌ Task coordination failed: {e}")
            task.status = CoordinationStatus.FAILED
            raise
    
    def _find_suitable_agents(self, required_capabilities: List[str]) -> List[AgentInfo]:
        """Find agents with required capabilities."""
        suitable_agents = []
        
        for agent in self.known_agents.values():
            if not agent.is_healthy():
                continue
                
            agent_capabilities = [cap.capability_id for cap in agent.capabilities]
            
            # Check if agent has all required capabilities
            if all(req_cap in agent_capabilities for req_cap in required_capabilities):
                suitable_agents.append(agent)
        
        # Sort by trust score and capability expertise
        suitable_agents.sort(
            key=lambda a: a.trust_score, 
            reverse=True
        )
        
        return suitable_agents
    
    async def _monitor_task_progress(self, task: CoordinationTask):
        """Monitor progress of a coordination task."""
        logger.info(f"👁️ Monitoring task progress: {task.task_id}")
        
        start_time = time.time()
        timeout = 60  # 1 minute timeout
        
        while task.status == CoordinationStatus.COORDINATING:
            if time.time() - start_time > timeout:
                logger.warning(f"⏰ Task {task.task_id} timed out")
                task.status = CoordinationStatus.TIMEOUT
                break
            
            # Check if task is complete
            if task.progress >= 1.0:
                task.status = CoordinationStatus.COMPLETED
                break
            
            await asyncio.sleep(1)
        
        # Update coordination statistics
        if task.status == CoordinationStatus.COMPLETED:
            self.coordination_stats["tasks_completed"] += 1
        else:
            self.coordination_stats["tasks_failed"] += 1
        
        self.coordination_stats["total_coordination_time"] += time.time() - start_time
    
    async def _heartbeat_loop(self):
        """Send periodic heartbeat to all known agents."""
        while True:
            try:
                heartbeat_message = InterAgentMessage(
                    message_id=str(uuid.uuid4()),
                    sender_id=self.agent_id,
                    recipient_id=None,
                    message_type=MessageType.HEARTBEAT,
                    content={
                        "timestamp": datetime.now().isoformat(),
                        "status": "active",
                        "coordination_stats": self.coordination_stats
                    }
                )
                
                await self.communication.send_message(heartbeat_message)
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                
            except Exception as e:
                logger.error(f"❌ Error in heartbeat loop: {e}")
                await asyncio.sleep(10)
    
    async def _health_monitoring_loop(self):
        """Monitor health of known agents."""
        while True:
            try:
                unhealthy_agents = []
                
                for agent_id, agent in self.known_agents.items():
                    if not agent.is_healthy():
                        unhealthy_agents.append(agent_id)
                        logger.warning(f"⚠️ Agent {agent_id} appears unhealthy")
                
                # Remove unhealthy agents after extended timeout
                for agent_id in unhealthy_agents:
                    agent = self.known_agents[agent_id]
                    time_since_heartbeat = datetime.now() - agent.last_heartbeat
                    
                    if time_since_heartbeat.total_seconds() > 300:  # 5 minutes
                        logger.warning(f"🚫 Removing unresponsive agent: {agent_id}")
                        del self.known_agents[agent_id]
                
                await asyncio.sleep(60)  # Check health every minute
                
            except Exception as e:
                logger.error(f"❌ Error in health monitoring: {e}")
                await asyncio.sleep(30)
    
    async def _handle_handshake(self, message: InterAgentMessage) -> Optional[InterAgentMessage]:
        """Handle handshake from another agent."""
        content = message.content
        sender_id = message.sender_id
        
        logger.info(f"🤝 Received handshake from {sender_id}")
        
        # Create agent info
        agent_info = AgentInfo(
            agent_id=sender_id,
            name=content.get("agent_name", sender_id),
            role=AgentRole(content.get("agent_role", "specialist")),
            endpoint=content.get("endpoint", "unknown"),
            capabilities=[
                AgentCapability(**cap_data) 
                for cap_data in content.get("capabilities", [])
            ]
        )
        
        # Add to known agents
        self.known_agents[sender_id] = agent_info
        
        # Send handshake response
        response = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_id=self.agent_id,
            recipient_id=sender_id,
            message_type=MessageType.HANDSHAKE,
            content={
                "agent_name": self.name,
                "agent_role": self.role.value,
                "capabilities": [cap.__dict__ for cap in self.local_capabilities],
                "endpoint": f"ws://localhost:{self.port}",
                "welcome": True
            },
            correlation_id=message.message_id
        )
        
        logger.info(f"✅ Agent {sender_id} registered successfully")
        return response
    
    async def _handle_task_request(self, message: InterAgentMessage) -> Optional[InterAgentMessage]:
        """Handle task request from coordinator."""
        content = message.content
        task_id = content.get("task_id")
        description = content.get("description")
        
        logger.info(f"📋 Received task request: {task_id}")
        logger.info(f"   Description: {description}")
        
        # Simple acceptance logic - in practice, would check capabilities and load
        accept_task = True
        
        # Send response
        response = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_id=self.agent_id,
            recipient_id=message.sender_id,
            message_type=MessageType.TASK_RESPONSE,
            content={
                "task_id": task_id,
                "accepted": accept_task,
                "estimated_completion_time": 30,
                "agent_capabilities": [cap.__dict__ for cap in self.local_capabilities]
            },
            correlation_id=message.message_id
        )
        
        logger.info(f"✅ Task {task_id} {'accepted' if accept_task else 'rejected'}")
        return response
    
    async def _handle_status_update(self, message: InterAgentMessage) -> Optional[InterAgentMessage]:
        """Handle status update from other agents."""
        content = message.content
        sender_id = message.sender_id
        
        if sender_id in self.known_agents:
            # Update agent status
            agent = self.known_agents[sender_id]
            agent.status = content.get("status", "unknown")
            agent.last_heartbeat = datetime.now()
            
            # Update performance metrics if provided
            if "performance_metrics" in content:
                agent.performance_metrics.update(content["performance_metrics"])
            
            logger.debug(f"📊 Updated status for {sender_id}: {agent.status}")
        
        return None
    
    async def _handle_heartbeat(self, message: InterAgentMessage) -> Optional[InterAgentMessage]:
        """Handle heartbeat from other agents."""
        sender_id = message.sender_id
        
        if sender_id in self.known_agents:
            self.known_agents[sender_id].last_heartbeat = datetime.now()
            logger.debug(f"💓 Heartbeat received from {sender_id}")
        
        return None
    
    def get_coordination_statistics(self) -> Dict[str, Any]:
        """Get coordination statistics."""
        total_tasks = self.coordination_stats["tasks_completed"] + self.coordination_stats["tasks_failed"]
        success_rate = 0.0
        
        if total_tasks > 0:
            success_rate = self.coordination_stats["tasks_completed"] / total_tasks
        
        avg_coordination_time = 0.0
        if self.coordination_stats["tasks_completed"] > 0:
            avg_coordination_time = (
                self.coordination_stats["total_coordination_time"] / 
                self.coordination_stats["tasks_completed"]
            )
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.name,
            "role": self.role.value,
            "known_agents": len(self.known_agents),
            "active_tasks": len(self.coordination_tasks),
            "total_tasks": total_tasks,
            "tasks_completed": self.coordination_stats["tasks_completed"],
            "tasks_failed": self.coordination_stats["tasks_failed"],
            "success_rate": success_rate,
            "average_coordination_time": avg_coordination_time,
            "local_capabilities": len(self.local_capabilities),
            "uptime": time.time(),
            "status": "active"
        }


# Example usage and testing
async def create_test_agent_network():
    """Create a test network of agents for demonstration."""
    logger.info("🌐 Creating test agent network...")
    
    # Create multiple agents
    coordinator = AgentCoordinator("coordinator-001", "Main Coordinator", AgentRole.COORDINATOR, 8000)
    specialist1 = AgentCoordinator("specialist-001", "Math Specialist", AgentRole.SPECIALIST, 8001)
    specialist2 = AgentCoordinator("specialist-002", "Logic Specialist", AgentRole.SPECIALIST, 8002)
    
    agents = [coordinator, specialist1, specialist2]
    
    try:
        # Start all agents
        for agent in agents:
            await agent.start()
            await asyncio.sleep(1)  # Small delay between starts
        
        # Discover agents
        await coordinator.discover_agents()
        
        # Test distributed reasoning
        result = await coordinator.distributed_reasoning.start_distributed_reasoning(
            "What is 2 + 2 and why is mathematics important?",
            "mathematics",
            ["specialist-001", "specialist-002"]
        )
        
        logger.info(f"🧠 Distributed reasoning result: {result}")
        
        # Test task coordination
        task = await coordinator.coordinate_task(
            "Solve complex mathematical problem",
            ["mathematical_reasoning", "logical_analysis"]
        )
        
        logger.info(f"📋 Task coordination result: {task.status}")
        
        # Get statistics
        for agent in agents:
            stats = agent.get_coordination_statistics()
            logger.info(f"📊 Agent {agent.name} stats: {stats}")
        
        return agents
        
    except Exception as e:
        logger.error(f"❌ Error creating test network: {e}")
        
        # Cleanup
        for agent in agents:
            try:
                await agent.stop()
            except:
                pass
        
        raise


if __name__ == "__main__":
    logger.info("🚀 ROMAI Multi-Agent Coordination System - Test Mode")
    
    async def main():
        try:
            agents = await create_test_agent_network()
            
            # Run for a bit to see the system in action
            logger.info("⏰ Running test network for 30 seconds...")
            await asyncio.sleep(30)
            
            # Cleanup
            logger.info("🛑 Stopping test network...")
            for agent in agents:
                await agent.stop()
            
            logger.info("✅ Test completed successfully!")
            
        except KeyboardInterrupt:
            logger.info("⏹️ Test interrupted by user")
        except Exception as e:
            logger.error(f"❌ Test failed: {e}")
    
    asyncio.run(main())