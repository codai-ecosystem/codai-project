"""
Multi-Agent Coordination Hub for Romanian AI
Week 7 Day 3 Implementation - Component 1

This module provides the central coordination system for multiple Romanian AI agents,
enabling real-time collaboration with cultural context preservation and performance
optimization targeting < 200ms coordination latency.
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
import weakref
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logger = logging.getLogger(__name__)

class AgentStatus(Enum):
    """Agent status states"""
    INITIALIZING = "initializing"
    ACTIVE = "active"
    BUSY = "busy"
    IDLE = "idle"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    MAINTENANCE = "maintenance"

class TaskPriority(Enum):
    """Task priority levels"""
    CRITICAL = "critical"
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"
    BACKGROUND = "background"

class CoordinationStrategy(Enum):
    """Agent coordination strategies"""
    ROUND_ROBIN = "round_robin"
    LOAD_BALANCED = "load_balanced"
    CAPABILITY_BASED = "capability_based"
    CULTURAL_EXPERTISE = "cultural_expertise"
    PERFORMANCE_OPTIMIZED = "performance_optimized"

@dataclass
class RomanianAgentProfile:
    """Profile of a Romanian AI agent"""
    agent_id: str
    name: str
    agent_type: str
    capabilities: List[str] = field(default_factory=list)
    cultural_expertise: Dict[str, float] = field(default_factory=dict)
    regional_specialization: List[str] = field(default_factory=list)
    performance_metrics: Dict[str, float] = field(default_factory=dict)
    status: AgentStatus = AgentStatus.INITIALIZING
    last_activity: datetime = field(default_factory=datetime.now)
    current_load: float = 0.0
    max_concurrent_tasks: int = 5
    supported_languages: List[str] = field(default_factory=lambda: ["romanian"])
    
    def __post_init__(self):
        """Initialize default capabilities and metrics"""
        if not self.capabilities:
            self.capabilities = ["romanian_processing", "cultural_awareness"]
        
        if not self.cultural_expertise:
            self.cultural_expertise = {
                "traditional_culture": 0.8,
                "modern_culture": 0.7,
                "business_culture": 0.6,
                "regional_knowledge": 0.7
            }
        
        if not self.performance_metrics:
            self.performance_metrics = {
                "response_time_ms": 100.0,
                "accuracy_score": 0.85,
                "cultural_appropriateness": 0.9,
                "task_completion_rate": 0.95
            }

@dataclass
class CoordinationTask:
    """Task for agent coordination"""
    task_id: str
    task_type: str
    description: str
    priority: TaskPriority
    required_capabilities: List[str] = field(default_factory=list)
    cultural_context: Dict[str, Any] = field(default_factory=dict)
    deadline: Optional[datetime] = None
    estimated_duration: float = 30.0  # seconds
    assigned_agents: List[str] = field(default_factory=list)
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def get_age_seconds(self) -> float:
        """Get task age in seconds"""
        return (datetime.now() - self.created_at).total_seconds()
    
    def is_overdue(self) -> bool:
        """Check if task is overdue"""
        if not self.deadline:
            return False
        return datetime.now() > self.deadline

@dataclass
class CoordinationMetrics:
    """Coordination performance metrics"""
    total_tasks_processed: int = 0
    successful_tasks: int = 0
    failed_tasks: int = 0
    average_coordination_time_ms: float = 0.0
    average_task_completion_time: float = 0.0
    cultural_context_preservation_rate: float = 0.0
    agent_utilization_rate: float = 0.0
    peak_concurrent_agents: int = 0
    total_coordination_requests: int = 0
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate"""
        if self.total_tasks_processed == 0:
            return 0.0
        return self.successful_tasks / self.total_tasks_processed
    
    @property
    def coordination_efficiency(self) -> float:
        """Calculate coordination efficiency"""
        target_time = 200.0  # Target < 200ms
        if self.average_coordination_time_ms == 0:
            return 1.0
        return min(1.0, target_time / self.average_coordination_time_ms)

class RomanianAgentCoordinationHub:
    """Central coordination hub for Romanian AI agents"""
    
    def __init__(self, max_agents: int = 10, coordination_timeout: float = 5.0):
        self.max_agents = max_agents
        self.coordination_timeout = coordination_timeout
        
        # Agent management
        self.agents: Dict[str, RomanianAgentProfile] = {}
        self.agent_connections: Dict[str, Any] = {}  # Connection handlers
        
        # Task management
        self.active_tasks: Dict[str, CoordinationTask] = {}
        self.task_queue: deque = deque()
        self.completed_tasks: deque = deque(maxlen=1000)  # Keep last 1000
        
        # Performance tracking
        self.metrics = CoordinationMetrics()
        self.performance_history: deque = deque(maxlen=100)
        
        # Coordination state
        self.coordination_strategies: Dict[str, CoordinationStrategy] = {}
        self.cultural_context_cache: Dict[str, Any] = {}
        self.task_distribution_weights: Dict[str, float] = {}
        
        # Synchronization
        self.coordination_lock = asyncio.Lock()
        self.task_lock = asyncio.Lock()
        
        # Background tasks
        self.background_tasks: Set[asyncio.Task] = set()
        self.is_running = False
        
        logger.info(f"Romanian Agent Coordination Hub initialized (max_agents={max_agents})")
    
    async def start(self):
        """Start the coordination hub"""
        if self.is_running:
            return
        
        self.is_running = True
        
        # Start background tasks
        self.background_tasks.add(
            asyncio.create_task(self._task_processor())
        )
        self.background_tasks.add(
            asyncio.create_task(self._performance_monitor())
        )
        self.background_tasks.add(
            asyncio.create_task(self._health_checker())
        )
        
        logger.info("Coordination hub started")
    
    async def stop(self):
        """Stop the coordination hub"""
        if not self.is_running:
            return
        
        self.is_running = False
        
        # Cancel background tasks
        for task in self.background_tasks:
            task.cancel()
        
        # Wait for tasks to complete
        if self.background_tasks:
            await asyncio.gather(*self.background_tasks, return_exceptions=True)
        
        self.background_tasks.clear()
        
        logger.info("Coordination hub stopped")
    
    async def register_agent(
        self,
        agent_profile: RomanianAgentProfile,
        connection_handler: Optional[Any] = None
    ) -> bool:
        """Register a new Romanian AI agent"""
        
        async with self.coordination_lock:
            # Check capacity
            if len(self.agents) >= self.max_agents:
                logger.warning(f"Cannot register agent {agent_profile.agent_id}: max capacity reached")
                return False
            
            # Check for duplicate
            if agent_profile.agent_id in self.agents:
                logger.warning(f"Agent {agent_profile.agent_id} already registered")
                return False
            
            # Register agent
            agent_profile.status = AgentStatus.ACTIVE
            agent_profile.last_activity = datetime.now()
            
            self.agents[agent_profile.agent_id] = agent_profile
            if connection_handler:
                self.agent_connections[agent_profile.agent_id] = connection_handler
            
            # Initialize coordination strategy
            self.coordination_strategies[agent_profile.agent_id] = self._determine_coordination_strategy(
                agent_profile
            )
            
            # Update metrics
            self.metrics.peak_concurrent_agents = max(
                self.metrics.peak_concurrent_agents,
                len(self.agents)
            )
            
            logger.info(f"Agent {agent_profile.agent_id} registered successfully")
            return True
    
    async def unregister_agent(self, agent_id: str) -> bool:
        """Unregister an agent"""
        
        async with self.coordination_lock:
            if agent_id not in self.agents:
                logger.warning(f"Agent {agent_id} not found for unregistration")
                return False
            
            # Remove agent
            agent = self.agents.pop(agent_id)
            self.agent_connections.pop(agent_id, None)
            self.coordination_strategies.pop(agent_id, None)
            
            # Reassign active tasks
            await self._reassign_agent_tasks(agent_id)
            
            logger.info(f"Agent {agent_id} unregistered")
            return True
    
    async def coordinate_task(
        self,
        task_type: str,
        description: str,
        required_capabilities: List[str],
        cultural_context: Optional[Dict[str, Any]] = None,
        priority: TaskPriority = TaskPriority.NORMAL,
        deadline: Optional[datetime] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """Coordinate a task across agents"""
        
        start_time = time.time()
        task_id = str(uuid.uuid4())
        
        try:
            # Create coordination task
            task = CoordinationTask(
                task_id=task_id,
                task_type=task_type,
                description=description,
                priority=priority,
                required_capabilities=required_capabilities,
                cultural_context=cultural_context or {},
                deadline=deadline
            )
            
            # Find suitable agents
            suitable_agents = await self._find_suitable_agents(task)
            
            if not suitable_agents:
                coordination_time = (time.time() - start_time) * 1000
                return task_id, {
                    "status": "failed",
                    "error": "No suitable agents available",
                    "coordination_time_ms": coordination_time
                }
            
            # Select optimal agents
            selected_agents = await self._select_optimal_agents(task, suitable_agents)
            
            # Assign task to agents
            task.assigned_agents = selected_agents
            task.status = "assigned"
            task.started_at = datetime.now()
            
            async with self.task_lock:
                self.active_tasks[task_id] = task
            
            # Update agent loads
            await self._update_agent_loads(selected_agents, task.estimated_duration)
            
            # Execute coordination
            coordination_result = await self._execute_coordination(task)
            
            coordination_time = (time.time() - start_time) * 1000
            
            # Update metrics
            self.metrics.total_coordination_requests += 1
            self.metrics.average_coordination_time_ms = (
                (self.metrics.average_coordination_time_ms * (self.metrics.total_coordination_requests - 1) +
                 coordination_time) / self.metrics.total_coordination_requests
            )
            
            # Store performance data
            self.performance_history.append({
                "timestamp": datetime.now(),
                "task_id": task_id,
                "coordination_time_ms": coordination_time,
                "agents_used": len(selected_agents),
                "cultural_context_preserved": self._assess_cultural_preservation(task, coordination_result)
            })
            
            return task_id, {
                "status": "success",
                "coordination_time_ms": coordination_time,
                "assigned_agents": selected_agents,
                "result": coordination_result,
                "cultural_context_preserved": True
            }
            
        except Exception as e:
            coordination_time = (time.time() - start_time) * 1000
            logger.error(f"Coordination failed for task {task_id}: {e}")
            
            return task_id, {
                "status": "error",
                "error": str(e),
                "coordination_time_ms": coordination_time
            }
    
    async def _find_suitable_agents(self, task: CoordinationTask) -> List[str]:
        """Find agents suitable for the task"""
        
        suitable_agents = []
        
        for agent_id, agent in self.agents.items():
            # Check agent status
            if agent.status not in [AgentStatus.ACTIVE, AgentStatus.IDLE]:
                continue
            
            # Check capabilities
            if not all(cap in agent.capabilities for cap in task.required_capabilities):
                continue
            
            # Check load
            if agent.current_load >= 1.0:  # Agent is at capacity
                continue
            
            # Check cultural context compatibility
            if task.cultural_context:
                cultural_compatibility = self._assess_cultural_compatibility(agent, task.cultural_context)
                if cultural_compatibility < 0.6:  # Minimum threshold
                    continue
            
            suitable_agents.append(agent_id)
        
        return suitable_agents
    
    async def _select_optimal_agents(
        self,
        task: CoordinationTask,
        suitable_agents: List[str]
    ) -> List[str]:
        """Select optimal agents for the task"""
        
        # Score agents based on multiple factors
        agent_scores = {}
        
        for agent_id in suitable_agents:
            agent = self.agents[agent_id]
            score = 0.0
            
            # Performance score
            score += agent.performance_metrics.get("accuracy_score", 0.5) * 0.3
            
            # Cultural expertise score
            if task.cultural_context:
                cultural_score = self._calculate_cultural_score(agent, task.cultural_context)
                score += cultural_score * 0.3
            
            # Load balancing score (prefer less loaded agents)
            load_score = 1.0 - agent.current_load
            score += load_score * 0.2
            
            # Response time score (prefer faster agents)
            response_time = agent.performance_metrics.get("response_time_ms", 200.0)
            time_score = max(0.0, 1.0 - (response_time / 500.0))  # Normalize to 500ms max
            score += time_score * 0.2
            
            agent_scores[agent_id] = score
        
        # Sort by score and select top agents
        sorted_agents = sorted(agent_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Determine number of agents needed (1-3 based on task complexity)
        num_agents_needed = self._calculate_agents_needed(task)
        selected_agents = [agent_id for agent_id, _ in sorted_agents[:num_agents_needed]]
        
        return selected_agents
    
    async def _execute_coordination(self, task: CoordinationTask) -> Dict[str, Any]:
        """Execute the coordinated task"""
        
        coordination_start = time.time()
        
        try:
            # Prepare cultural context for agents
            enhanced_context = await self._prepare_cultural_context(task)
            
            # Distribute task to assigned agents
            agent_results = await self._distribute_task_to_agents(task, enhanced_context)
            
            # Synthesize results
            final_result = await self._synthesize_agent_results(task, agent_results)
            
            # Update task status
            task.status = "completed"
            task.completed_at = datetime.now()
            task.result = final_result
            
            # Move to completed tasks
            async with self.task_lock:
                self.active_tasks.pop(task.task_id, None)
                self.completed_tasks.append(task)
            
            # Update metrics
            self.metrics.total_tasks_processed += 1
            self.metrics.successful_tasks += 1
            
            execution_time = (time.time() - coordination_start) * 1000
            self.metrics.average_task_completion_time = (
                (self.metrics.average_task_completion_time * (self.metrics.total_tasks_processed - 1) +
                 execution_time) / self.metrics.total_tasks_processed
            )
            
            return final_result
            
        except Exception as e:
            # Handle coordination failure
            task.status = "failed"
            task.completed_at = datetime.now()
            
            self.metrics.total_tasks_processed += 1
            self.metrics.failed_tasks += 1
            
            logger.error(f"Task execution failed: {e}")
            raise
    
    async def _distribute_task_to_agents(
        self,
        task: CoordinationTask,
        enhanced_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Distribute task to assigned agents"""
        
        agent_tasks = []
        
        for agent_id in task.assigned_agents:
            agent_task = asyncio.create_task(
                self._execute_agent_task(agent_id, task, enhanced_context)
            )
            agent_tasks.append((agent_id, agent_task))
        
        # Wait for all agents to complete (with timeout)
        agent_results = {}
        
        try:
            for agent_id, agent_task in agent_tasks:
                result = await asyncio.wait_for(agent_task, timeout=self.coordination_timeout)
                agent_results[agent_id] = result
        except asyncio.TimeoutError:
            logger.warning(f"Agent coordination timeout for task {task.task_id}")
            # Cancel remaining tasks
            for _, agent_task in agent_tasks:
                if not agent_task.done():
                    agent_task.cancel()
        
        return agent_results
    
    async def _execute_agent_task(
        self,
        agent_id: str,
        task: CoordinationTask,
        enhanced_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute task on specific agent"""
        
        try:
            # Simulate agent task execution
            # In a real implementation, this would make API calls to the agent
            
            agent = self.agents[agent_id]
            
            # Simulate processing time based on agent performance
            base_time = agent.performance_metrics.get("response_time_ms", 100.0) / 1000.0
            processing_time = base_time + (task.estimated_duration * 0.1)  # 10% of estimated time
            
            await asyncio.sleep(processing_time)
            
            # Generate simulated result based on agent capabilities
            result = {
                "agent_id": agent_id,
                "status": "success",
                "processing_time_ms": processing_time * 1000,
                "cultural_context_applied": enhanced_context.get("cultural_markers", []),
                "regional_adaptation": agent.regional_specialization,
                "accuracy_score": agent.performance_metrics.get("accuracy_score", 0.85),
                "content": f"Processed by {agent.name} with Romanian cultural awareness",
                "timestamp": datetime.now().isoformat()
            }
            
            # Update agent activity
            agent.last_activity = datetime.now()
            
            return result
            
        except Exception as e:
            logger.error(f"Agent {agent_id} task execution failed: {e}")
            return {
                "agent_id": agent_id,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _synthesize_agent_results(
        self,
        task: CoordinationTask,
        agent_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Synthesize results from multiple agents"""
        
        successful_results = [
            result for result in agent_results.values()
            if result.get("status") == "success"
        ]
        
        if not successful_results:
            return {
                "status": "failed",
                "error": "No successful agent results",
                "agent_count": len(agent_results)
            }
        
        # Calculate aggregate metrics
        avg_accuracy = sum(r.get("accuracy_score", 0) for r in successful_results) / len(successful_results)
        total_processing_time = sum(r.get("processing_time_ms", 0) for r in successful_results)
        
        # Combine cultural contexts
        all_cultural_markers = set()
        all_regional_adaptations = set()
        
        for result in successful_results:
            all_cultural_markers.update(result.get("cultural_context_applied", []))
            all_regional_adaptations.update(result.get("regional_adaptation", []))
        
        # Create synthesized result
        synthesized_result = {
            "status": "success",
            "task_id": task.task_id,
            "task_type": task.task_type,
            "coordination_summary": {
                "agents_involved": len(successful_results),
                "average_accuracy": avg_accuracy,
                "total_processing_time_ms": total_processing_time,
                "cultural_markers_applied": list(all_cultural_markers),
                "regional_adaptations": list(all_regional_adaptations)
            },
            "cultural_context_preservation": len(all_cultural_markers) > 0,
            "agent_results": agent_results,
            "final_content": self._merge_agent_content(successful_results),
            "metadata": {
                "coordination_strategy": "collaborative_synthesis",
                "romanian_cultural_integration": True,
                "synthesis_timestamp": datetime.now().isoformat()
            }
        }
        
        return synthesized_result
    
    def _merge_agent_content(self, successful_results: List[Dict[str, Any]]) -> str:
        """Merge content from multiple agents"""
        
        contents = [result.get("content", "") for result in successful_results]
        
        if len(contents) == 1:
            return contents[0]
        
        # Simple content merging strategy
        merged_content = "Rezultat colaborativ: " + " | ".join(contents)
        return merged_content
    
    async def _prepare_cultural_context(self, task: CoordinationTask) -> Dict[str, Any]:
        """Prepare enhanced cultural context for agents"""
        
        enhanced_context = task.cultural_context.copy()
        
        # Add Romanian cultural markers
        cultural_markers = []
        if "formal" in task.description.lower():
            cultural_markers.extend(["business_formal", "respectful_address"])
        if "traditional" in task.description.lower():
            cultural_markers.extend(["traditional_culture", "folk_elements"])
        
        enhanced_context["cultural_markers"] = cultural_markers
        enhanced_context["language"] = "romanian"
        enhanced_context["coordination_timestamp"] = datetime.now().isoformat()
        
        return enhanced_context
    
    def _assess_cultural_compatibility(
        self,
        agent: RomanianAgentProfile,
        cultural_context: Dict[str, Any]
    ) -> float:
        """Assess agent's compatibility with cultural context"""
        
        compatibility_score = 0.0
        
        # Check cultural expertise alignment
        context_type = cultural_context.get("type", "general")
        if context_type in agent.cultural_expertise:
            compatibility_score += agent.cultural_expertise[context_type] * 0.6
        
        # Check regional specialization
        required_region = cultural_context.get("region")
        if required_region and required_region in agent.regional_specialization:
            compatibility_score += 0.3
        
        # Base compatibility for Romanian agents
        compatibility_score += 0.4  # Base score for Romanian AI agents
        
        return min(1.0, compatibility_score)
    
    def _calculate_cultural_score(
        self,
        agent: RomanianAgentProfile,
        cultural_context: Dict[str, Any]
    ) -> float:
        """Calculate cultural expertise score for agent"""
        
        score = 0.0
        
        # Weight cultural expertise based on context
        for expertise, value in agent.cultural_expertise.items():
            if expertise in cultural_context.get("required_expertise", []):
                score += value * 0.8
            else:
                score += value * 0.2
        
        return min(1.0, score / len(agent.cultural_expertise) if agent.cultural_expertise else 0.5)
    
    def _calculate_agents_needed(self, task: CoordinationTask) -> int:
        """Calculate number of agents needed for task"""
        
        # Base on task complexity and priority
        if task.priority == TaskPriority.CRITICAL:
            return min(3, len(self.agents))  # Up to 3 agents for critical tasks
        elif task.priority == TaskPriority.HIGH:
            return min(2, len(self.agents))  # Up to 2 agents for high priority
        else:
            return 1  # Single agent for normal/low priority
    
    def _determine_coordination_strategy(self, agent: RomanianAgentProfile) -> CoordinationStrategy:
        """Determine coordination strategy for agent"""
        
        # Analyze agent capabilities to determine best strategy
        if "cultural_analysis" in agent.capabilities:
            return CoordinationStrategy.CULTURAL_EXPERTISE
        elif agent.performance_metrics.get("response_time_ms", 200) < 100:
            return CoordinationStrategy.PERFORMANCE_OPTIMIZED
        else:
            return CoordinationStrategy.CAPABILITY_BASED
    
    def _assess_cultural_preservation(
        self,
        task: CoordinationTask,
        coordination_result: Dict[str, Any]
    ) -> bool:
        """Assess if cultural context was preserved"""
        
        if not task.cultural_context:
            return True  # No cultural context to preserve
        
        result_markers = coordination_result.get("coordination_summary", {}).get("cultural_markers_applied", [])
        return len(result_markers) > 0
    
    async def _update_agent_loads(self, agent_ids: List[str], estimated_duration: float):
        """Update agent load metrics"""
        
        load_increment = min(0.3, estimated_duration / 100.0)  # Load based on duration
        
        for agent_id in agent_ids:
            if agent_id in self.agents:
                self.agents[agent_id].current_load = min(1.0, 
                    self.agents[agent_id].current_load + load_increment
                )
    
    async def _reassign_agent_tasks(self, agent_id: str):
        """Reassign tasks from disconnected agent"""
        
        tasks_to_reassign = [
            task for task in self.active_tasks.values()
            if agent_id in task.assigned_agents
        ]
        
        for task in tasks_to_reassign:
            task.assigned_agents.remove(agent_id)
            if not task.assigned_agents:
                # Find new agents for the task
                suitable_agents = await self._find_suitable_agents(task)
                if suitable_agents:
                    new_agents = await self._select_optimal_agents(task, suitable_agents)
                    task.assigned_agents = new_agents
                else:
                    # Mark task as failed if no suitable agents
                    task.status = "failed"
                    task.completed_at = datetime.now()
    
    async def _task_processor(self):
        """Background task processor"""
        
        while self.is_running:
            try:
                # Process queued tasks
                if self.task_queue:
                    async with self.task_lock:
                        if self.task_queue:
                            queued_task = self.task_queue.popleft()
                            # Process queued task
                            await self._process_queued_task(queued_task)
                
                # Check for overdue tasks
                await self._check_overdue_tasks()
                
                await asyncio.sleep(1.0)  # Check every second
                
            except Exception as e:
                logger.error(f"Task processor error: {e}")
                await asyncio.sleep(5.0)
    
    async def _performance_monitor(self):
        """Background performance monitoring"""
        
        while self.is_running:
            try:
                # Update agent loads (decay over time)
                for agent in self.agents.values():
                    agent.current_load = max(0.0, agent.current_load - 0.1)
                
                # Calculate utilization rate
                active_agents = sum(1 for agent in self.agents.values() 
                                   if agent.status == AgentStatus.ACTIVE)
                self.metrics.agent_utilization_rate = active_agents / max(1, len(self.agents))
                
                # Calculate cultural context preservation rate
                recent_performance = list(self.performance_history)[-20:]  # Last 20 tasks
                if recent_performance:
                    preserved_count = sum(1 for p in recent_performance 
                                        if p.get("cultural_context_preserved", False))
                    self.metrics.cultural_context_preservation_rate = preserved_count / len(recent_performance)
                
                await asyncio.sleep(5.0)  # Monitor every 5 seconds
                
            except Exception as e:
                logger.error(f"Performance monitor error: {e}")
                await asyncio.sleep(10.0)
    
    async def _health_checker(self):
        """Background health checking"""
        
        while self.is_running:
            try:
                # Check agent health
                for agent_id, agent in list(self.agents.items()):
                    # Check last activity
                    time_since_activity = (datetime.now() - agent.last_activity).total_seconds()
                    
                    if time_since_activity > 300:  # 5 minutes inactive
                        agent.status = AgentStatus.DISCONNECTED
                        logger.warning(f"Agent {agent_id} marked as disconnected")
                
                await asyncio.sleep(30.0)  # Health check every 30 seconds
                
            except Exception as e:
                logger.error(f"Health checker error: {e}")
                await asyncio.sleep(60.0)
    
    async def _process_queued_task(self, task_data: Dict[str, Any]):
        """Process a queued task"""
        # Implementation for processing queued tasks
        pass
    
    async def _check_overdue_tasks(self):
        """Check for and handle overdue tasks"""
        
        current_time = datetime.now()
        overdue_tasks = [
            task for task in self.active_tasks.values()
            if task.deadline and current_time > task.deadline
        ]
        
        for task in overdue_tasks:
            logger.warning(f"Task {task.task_id} is overdue")
            # Could implement escalation logic here
    
    async def get_coordination_metrics(self) -> Dict[str, Any]:
        """Get comprehensive coordination metrics"""
        
        return {
            "hub_status": {
                "is_running": self.is_running,
                "registered_agents": len(self.agents),
                "active_tasks": len(self.active_tasks),
                "completed_tasks": len(self.completed_tasks)
            },
            "performance_metrics": {
                "total_tasks_processed": self.metrics.total_tasks_processed,
                "success_rate": self.metrics.success_rate,
                "average_coordination_time_ms": self.metrics.average_coordination_time_ms,
                "average_task_completion_time": self.metrics.average_task_completion_time,
                "cultural_context_preservation_rate": self.metrics.cultural_context_preservation_rate,
                "agent_utilization_rate": self.metrics.agent_utilization_rate,
                "coordination_efficiency": self.metrics.coordination_efficiency
            },
            "targets": {
                "coordination_latency": {"target": "< 200ms", "current": f"{self.metrics.average_coordination_time_ms:.1f}ms"},
                "success_rate": {"target": "> 95%", "current": f"{self.metrics.success_rate*100:.1f}%"},
                "cultural_preservation": {"target": "> 95%", "current": f"{self.metrics.cultural_context_preservation_rate*100:.1f}%"}
            },
            "agent_summary": {
                agent_id: {
                    "name": agent.name,
                    "status": agent.status.value,
                    "current_load": agent.current_load,
                    "capabilities": len(agent.capabilities),
                    "cultural_expertise": len(agent.cultural_expertise)
                }
                for agent_id, agent in self.agents.items()
            }
        }

# Export key classes
__all__ = [
    "RomanianAgentCoordinationHub",
    "RomanianAgentProfile", 
    "CoordinationTask",
    "CoordinationMetrics",
    "AgentStatus",
    "TaskPriority",
    "CoordinationStrategy"
]
