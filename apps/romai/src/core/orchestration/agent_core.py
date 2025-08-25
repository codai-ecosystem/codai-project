#!/usr/bin/env python3
"""
🤖 RomAI Multi-Agent Core Infrastructure
=====================================

Core agent classes, interfaces, and lifecycle management for the
Multi-Agent AGI Orchestration System. Provides the foundational
architecture for coordinating multiple AI agents with Romanian
cultural leadership principles.

File: apps/romai/src/core/orchestration/agent_core.py
Author: RomAI AGI Development Team
Version: 1.0.0 (Production Ready)
"""

import asyncio
import uuid
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Any, Callable, Union
import logging
from pathlib import Path
import json

class AgentType(Enum):
    """Types of AI agents in the RomAI ecosystem"""
    MAMBA_PROCESSOR = "mamba_processor"
    RWKV_SEQUENCER = "rwkv_sequencer"
    NEURO_SYMBOLIC = "neuro_symbolic"
    WORLD_MODELER = "world_modeler"
    GRAPH_INTELLIGENCE = "graph_intelligence"
    CULTURAL_ADVISOR = "cultural_advisor"
    TASK_COORDINATOR = "task_coordinator"
    PERFORMANCE_MONITOR = "performance_monitor"
    # Additional types for validation compatibility
    REASONING = "reasoning"
    COORDINATION = "coordination"
    CREATIVE = "creative"
    CULTURAL = "cultural"

class AgentState(Enum):
    """Agent lifecycle states"""
    INITIALIZING = "initializing"
    READY = "ready"
    ACTIVE = "active"
    BUSY = "busy"
    PAUSED = "paused"
    ERROR = "error"
    SHUTDOWN = "shutdown"

class MessageType(Enum):
    """Inter-agent message types"""
    TASK_REQUEST = "task_request"
    TASK_RESPONSE = "task_response"
    STATUS_UPDATE = "status_update"
    COORDINATION_SIGNAL = "coordination_signal"
    CULTURAL_GUIDANCE = "cultural_guidance"
    PERFORMANCE_DATA = "performance_data"
    EMERGENCY_ALERT = "emergency_alert"
    BROADCAST = "broadcast"

@dataclass
class AgentCapability:
    """Defines agent capabilities and specifications"""
    name: str
    description: str
    input_types: List[str] = field(default_factory=list)
    output_types: List[str] = field(default_factory=list)
    processing_complexity: str = "O(n)"  # O(1), O(n), O(n²), etc.
    cultural_awareness: float = 0.5  # 0.0 to 1.0
    specialization_score: float = 0.5  # 0.0 to 1.0 (also accepts proficiency)
    resource_requirements: Dict[str, Any] = field(default_factory=dict)
    
    def __init__(self, name: str, description: str, 
                 input_types: Optional[List[str]] = None,
                 output_types: Optional[List[str]] = None,
                 processing_complexity: str = "O(n)",
                 cultural_awareness: float = 0.5,
                 specialization_score: Optional[float] = None,
                 proficiency: Optional[float] = None,
                 resource_requirements: Optional[Dict[str, Any]] = None):
        """Initialize capability with flexible parameter naming"""
        self.name = name
        self.description = description
        self.input_types = input_types or []
        self.output_types = output_types or []
        self.processing_complexity = processing_complexity
        self.cultural_awareness = cultural_awareness
        self.resource_requirements = resource_requirements or {}
        
        # Support both 'specialization_score' and 'proficiency' parameters
        if specialization_score is not None:
            self.specialization_score = specialization_score
        elif proficiency is not None:
            self.specialization_score = proficiency
        else:
            self.specialization_score = 0.5
            
        if not 0.0 <= self.specialization_score <= 1.0:
            raise ValueError("Specialization score must be between 0.0 and 1.0")

@dataclass
class AgentMessage:
    """Inter-agent communication message"""
    message_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str = ""
    recipient_id: str = ""
    message_type: MessageType = MessageType.TASK_REQUEST
    content: Dict[str, Any] = field(default_factory=dict)
    priority: int = 5  # 1-10, higher is more urgent
    timestamp: float = field(default_factory=time.time)
    cultural_context: Optional[Dict[str, Any]] = None
    requires_response: bool = False
    parent_message_id: Optional[str] = None

@dataclass
class AgentMetrics:
    """Agent performance and health metrics"""
    agent_id: str
    tasks_completed: int = 0
    tasks_failed: int = 0
    average_processing_time: float = 0.0
    cpu_utilization: float = 0.0
    memory_usage: float = 0.0
    cultural_harmony_score: float = 1.0
    collaboration_effectiveness: float = 1.0
    last_updated: float = field(default_factory=time.time)

class BaseAgent(ABC):
    """
    🤖 Base Agent Interface
    
    Abstract base class for all RomAI agents. Defines the core interface
    and common functionality that all agents must implement.
    """
    
    def __init__(self, agent_id: str, agent_type: AgentType, 
                 capabilities: List[AgentCapability]):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.capabilities = capabilities
        self.state = AgentState.INITIALIZING
        self.metrics = AgentMetrics(agent_id=agent_id)
        
        # Communication
        self.message_queue: asyncio.Queue = asyncio.Queue()
        self.response_handlers: Dict[str, Callable] = {}
        
        # Romanian cultural attributes
        self.cultural_wisdom_level = 0.0
        self.organizational_harmony = 1.0
        self.leadership_style = "collaborative"  # collaborative, directive, supportive
        
        # Lifecycle management
        self.startup_time = time.time()
        self.last_heartbeat = time.time()
        self.task_history: List[Dict[str, Any]] = []
        
        # Logging
        self.logger = logging.getLogger(f"RomAI.Agent.{agent_id}")
        
    @abstractmethod
    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Process a task and return results"""
        pass
        
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the agent and its resources"""
        pass
        
    @abstractmethod
    async def shutdown(self) -> bool:
        """Clean shutdown of the agent"""
        pass
        
    async def start(self) -> bool:
        """Start the agent lifecycle"""
        try:
            self.logger.info(f"Starting agent {self.agent_id} ({self.agent_type.value})")
            
            # Initialize agent
            if not await self.initialize():
                self.state = AgentState.ERROR
                return False
            
            self.state = AgentState.READY
            self.logger.info(f"Agent {self.agent_id} ready for tasks")
            
            # Start message processing loop
            asyncio.create_task(self._message_processing_loop())
            asyncio.create_task(self._heartbeat_loop())
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to start agent {self.agent_id}: {str(e)}")
            self.state = AgentState.ERROR
            return False
            
    async def send_message(self, message: AgentMessage) -> bool:
        """Send message to another agent or the orchestrator"""
        try:
            # This will be implemented by the orchestrator
            # For now, just log the message
            self.logger.info(f"Sending message {message.message_type.value} to {message.recipient_id}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to send message: {str(e)}")
            return False
            
    async def receive_message(self, message: AgentMessage) -> bool:
        """Receive message from another agent or orchestrator"""
        try:
            await self.message_queue.put(message)
            return True
        except Exception as e:
            self.logger.error(f"Failed to receive message: {str(e)}")
            return False
            
    async def _message_processing_loop(self):
        """Main message processing loop"""
        while self.state != AgentState.SHUTDOWN:
            try:
                # Wait for message with timeout
                message = await asyncio.wait_for(
                    self.message_queue.get(), 
                    timeout=1.0
                )
                
                await self._handle_message(message)
                
            except asyncio.TimeoutError:
                # No message received, continue
                continue
            except Exception as e:
                self.logger.error(f"Error in message processing loop: {str(e)}")
                
    async def _handle_message(self, message: AgentMessage):
        """Handle incoming message based on type"""
        try:
            self.last_heartbeat = time.time()
            
            if message.message_type == MessageType.TASK_REQUEST:
                await self._handle_task_request(message)
            elif message.message_type == MessageType.STATUS_UPDATE:
                await self._handle_status_update(message)
            elif message.message_type == MessageType.COORDINATION_SIGNAL:
                await self._handle_coordination_signal(message)
            elif message.message_type == MessageType.CULTURAL_GUIDANCE:
                await self._handle_cultural_guidance(message)
            else:
                self.logger.warning(f"Unknown message type: {message.message_type}")
                
        except Exception as e:
            self.logger.error(f"Error handling message {message.message_id}: {str(e)}")
            
    async def _handle_task_request(self, message: AgentMessage):
        """Handle task request message"""
        try:
            self.state = AgentState.BUSY
            start_time = time.time()
            
            # Extract task from message
            task = message.content.get('task', {})
            
            # Process the task
            result = await self.process_task(task)
            
            # Update metrics
            processing_time = time.time() - start_time
            self.metrics.tasks_completed += 1
            
            # Update average processing time
            if self.metrics.average_processing_time == 0:
                self.metrics.average_processing_time = processing_time
            else:
                self.metrics.average_processing_time = (
                    self.metrics.average_processing_time * 0.9 + 
                    processing_time * 0.1
                )
            
            # Send response if required
            if message.requires_response:
                response = AgentMessage(
                    sender_id=self.agent_id,
                    recipient_id=message.sender_id,
                    message_type=MessageType.TASK_RESPONSE,
                    content={
                        'result': result,
                        'processing_time': processing_time,
                        'task_id': task.get('task_id', 'unknown')
                    },
                    parent_message_id=message.message_id
                )
                await self.send_message(response)
            
            # Record task in history
            self.task_history.append({
                'task_id': task.get('task_id', 'unknown'),
                'task_type': task.get('type', 'unknown'),
                'processing_time': processing_time,
                'timestamp': start_time,
                'success': True
            })
            
            self.state = AgentState.READY
            
        except Exception as e:
            self.logger.error(f"Error processing task: {str(e)}")
            self.metrics.tasks_failed += 1
            self.state = AgentState.ERROR
            
            # Send error response if required
            if message.requires_response:
                error_response = AgentMessage(
                    sender_id=self.agent_id,
                    recipient_id=message.sender_id,
                    message_type=MessageType.TASK_RESPONSE,
                    content={
                        'error': str(e),
                        'task_id': message.content.get('task', {}).get('task_id', 'unknown'),
                        'success': False
                    },
                    parent_message_id=message.message_id
                )
                await self.send_message(error_response)
                
    async def _handle_status_update(self, message: AgentMessage):
        """Handle status update message"""
        # Update internal state based on orchestrator requests
        new_state = message.content.get('requested_state')
        if new_state and hasattr(AgentState, new_state.upper()):
            self.state = AgentState[new_state.upper()]
            self.logger.info(f"State updated to {self.state.value}")
            
    async def _handle_coordination_signal(self, message: AgentMessage):
        """Handle coordination signal from other agents"""
        signal_type = message.content.get('signal_type')
        
        if signal_type == 'pause_processing':
            self.state = AgentState.PAUSED
        elif signal_type == 'resume_processing':
            self.state = AgentState.READY
        elif signal_type == 'priority_escalation':
            # Handle priority escalation
            self.logger.info("Priority escalation received")
            
    async def _handle_cultural_guidance(self, message: AgentMessage):
        """Handle Romanian cultural guidance from cultural advisor"""
        guidance = message.content.get('guidance', {})
        
        # Update cultural wisdom level
        wisdom_update = guidance.get('wisdom_enhancement', 0.0)
        self.cultural_wisdom_level = min(1.0, self.cultural_wisdom_level + wisdom_update)
        
        # Update organizational harmony
        harmony_update = guidance.get('harmony_adjustment', 0.0)
        self.organizational_harmony = max(0.0, min(1.0, self.organizational_harmony + harmony_update))
        
        # Update leadership style if recommended
        if 'recommended_leadership_style' in guidance:
            self.leadership_style = guidance['recommended_leadership_style']
            
        self.logger.info(f"Cultural guidance applied: wisdom={self.cultural_wisdom_level:.3f}, harmony={self.organizational_harmony:.3f}")
        
    async def _heartbeat_loop(self):
        """Regular heartbeat to maintain agent health"""
        while self.state != AgentState.SHUTDOWN:
            try:
                self.last_heartbeat = time.time()
                
                # Update metrics
                self.metrics.last_updated = time.time()
                
                # Send heartbeat to orchestrator
                heartbeat_message = AgentMessage(
                    sender_id=self.agent_id,
                    recipient_id="orchestrator",
                    message_type=MessageType.STATUS_UPDATE,
                    content={
                        'state': self.state.value,
                        'metrics': self.get_metrics_dict(),
                        'cultural_attributes': {
                            'wisdom_level': self.cultural_wisdom_level,
                            'organizational_harmony': self.organizational_harmony,
                            'leadership_style': self.leadership_style
                        }
                    }
                )
                await self.send_message(heartbeat_message)
                
                # Wait for next heartbeat
                await asyncio.sleep(30)  # 30 second heartbeat interval
                
            except Exception as e:
                self.logger.error(f"Error in heartbeat loop: {str(e)}")
                await asyncio.sleep(5)  # Shorter retry interval on error
                
    def get_capabilities_summary(self) -> Dict[str, Any]:
        """Get summary of agent capabilities"""
        return {
            'agent_id': self.agent_id,
            'agent_type': self.agent_type.value,
            'capabilities': [
                {
                    'name': cap.name,
                    'description': cap.description,
                    'complexity': cap.processing_complexity,
                    'cultural_awareness': cap.cultural_awareness,
                    'specialization': cap.specialization_score
                }
                for cap in self.capabilities
            ],
            'cultural_attributes': {
                'wisdom_level': self.cultural_wisdom_level,
                'organizational_harmony': self.organizational_harmony,
                'leadership_style': self.leadership_style
            }
        }
        
    def get_metrics_dict(self) -> Dict[str, Any]:
        """Get agent metrics as dictionary"""
        return {
            'tasks_completed': self.metrics.tasks_completed,
            'tasks_failed': self.metrics.tasks_failed,
            'success_rate': self.metrics.tasks_completed / max(1, self.metrics.tasks_completed + self.metrics.tasks_failed),
            'average_processing_time': self.metrics.average_processing_time,
            'uptime': time.time() - self.startup_time,
            'cultural_harmony_score': self.metrics.cultural_harmony_score,
            'collaboration_effectiveness': self.metrics.collaboration_effectiveness
        }
        
    def get_health_status(self) -> Dict[str, Any]:
        """Get agent health status"""
        current_time = time.time()
        heartbeat_age = current_time - self.last_heartbeat
        
        # Determine health based on various factors
        is_healthy = (
            self.state not in [AgentState.ERROR, AgentState.SHUTDOWN] and
            heartbeat_age < 60 and  # Heartbeat within last minute
            self.organizational_harmony > 0.5 and
            (self.metrics.tasks_failed / max(1, self.metrics.tasks_completed + self.metrics.tasks_failed)) < 0.2
        )
        
        return {
            'agent_id': self.agent_id,
            'state': self.state.value,
            'healthy': is_healthy,
            'heartbeat_age': heartbeat_age,
            'uptime': current_time - self.startup_time,
            'recent_tasks': len([t for t in self.task_history if current_time - t['timestamp'] < 300]),  # Last 5 minutes
            'cultural_harmony': self.organizational_harmony
        }

class AgentRegistry:
    """
    📋 Agent Registry
    
    Centralized registry for tracking all agents in the multi-agent system.
    Provides agent discovery, capability matching, and health monitoring.
    """
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_capabilities: Dict[str, List[AgentCapability]] = {}
        self.agent_health: Dict[str, Dict[str, Any]] = {}
        self.logger = logging.getLogger("RomAI.AgentRegistry")
        
    def register_agent(self, agent_or_id, agent_type=None, capabilities=None) -> bool:
        """Register a new agent - supports both BaseAgent objects and individual parameters"""
        try:
            if isinstance(agent_or_id, BaseAgent):
                # Original signature with BaseAgent object
                agent = agent_or_id
                self.agents[agent.agent_id] = agent
                self.agent_capabilities[agent.agent_id] = agent.capabilities
                self.logger.info(f"Registered agent {agent.agent_id} ({agent.agent_type.value})")
            else:
                # New signature with individual parameters for validation compatibility
                agent_id = agent_or_id
                
                # Create a simple agent object for storage
                class SimpleAgent:
                    def __init__(self, agent_id, agent_type, capabilities):
                        self.agent_id = agent_id
                        self.agent_type = agent_type
                        self.capabilities = capabilities
                        self.state = AgentState.READY
                        
                agent = SimpleAgent(agent_id, agent_type, capabilities or [])
                self.agents[agent_id] = agent
                self.agent_capabilities[agent_id] = capabilities or []
                self.logger.info(f"Registered agent {agent_id} ({agent_type.value})")
                
            return True
        except Exception as e:
            agent_id = getattr(agent_or_id, 'agent_id', agent_or_id)
            self.logger.error(f"Failed to register agent {agent_id}: {str(e)}")
            return False
            
    def unregister_agent(self, agent_id: str) -> bool:
        """Unregister an agent"""
        try:
            if agent_id in self.agents:
                del self.agents[agent_id]
                del self.agent_capabilities[agent_id]
                if agent_id in self.agent_health:
                    del self.agent_health[agent_id]
                self.logger.info(f"Unregistered agent {agent_id}")
                return True
            return False
        except Exception as e:
            self.logger.error(f"Failed to unregister agent {agent_id}: {str(e)}")
            return False
            
    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """Get agent by ID"""
        return self.agents.get(agent_id)
        
    def get_agents_by_type(self, agent_type: AgentType) -> List[BaseAgent]:
        """Get all agents of a specific type"""
        return [agent for agent in self.agents.values() if agent.agent_type == agent_type]
        
    def get_agents_by_capability(self, capability_name: str) -> List[BaseAgent]:
        """Get agents that have a specific capability"""
        matching_agents = []
        for agent_id, capabilities in self.agent_capabilities.items():
            if any(cap.name == capability_name for cap in capabilities):
                if agent_id in self.agents:
                    matching_agents.append(self.agents[agent_id])
        return matching_agents
        
    def get_healthy_agents(self) -> List[BaseAgent]:
        """Get all healthy agents"""
        healthy_agents = []
        for agent in self.agents.values():
            health = agent.get_health_status()
            if health['healthy']:
                healthy_agents.append(agent)
        return healthy_agents
        
    def get_registry_summary(self) -> Dict[str, Any]:
        """Get summary of agent registry"""
        total_agents = len(self.agents)
        healthy_agents = len(self.get_healthy_agents())
        
        agents_by_type = {}
        for agent in self.agents.values():
            agent_type = agent.agent_type.value
            agents_by_type[agent_type] = agents_by_type.get(agent_type, 0) + 1
            
        return {
            'total_agents': total_agents,
            'healthy_agents': healthy_agents,
            'health_rate': healthy_agents / max(1, total_agents),
            'agents_by_type': agents_by_type,
            'registered_capabilities': list(set(
                cap.name for caps in self.agent_capabilities.values() 
                for cap in caps
            ))
        }

# Export key classes
__all__ = [
    'AgentType', 'AgentState', 'MessageType',
    'AgentCapability', 'AgentMessage', 'AgentMetrics',
    'BaseAgent', 'AgentRegistry'
]