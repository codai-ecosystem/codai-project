#!/usr/bin/env python3
"""
📋 Task Distribution System
==========================

Advanced task distribution system for multi-agent coordination using
Romanian cultural principles of fair resource allocation and collaborative
work organization. Implements intelligent task assignment, load balancing,
and cultural harmony optimization.

File: apps/romai/src/core/orchestration/task_distribution.py
Author: RomAI AGI Development Team  
Version: 1.0.0 (Production Ready)
"""

import asyncio
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Any, Tuple, Set
import logging
import heapq
import uuid
from collections import defaultdict, deque

from .cultural_leadership import RomanianLeadershipStyle, CulturalValue, RomanianCulturalAdvisor

class TaskPriority(Enum):
    """Task priority levels"""
    CRITICAL = 10    # Must be completed immediately
    HIGH = 8        # Important, time-sensitive
    NORMAL = 5      # Standard priority
    LOW = 3         # Can be deferred
    BACKGROUND = 1  # Non-urgent, fill-in work

class TaskStatus(Enum):
    """Task status tracking"""
    PENDING = "pending"
    ASSIGNED = "assigned" 
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(Enum):
    """Types of tasks for specialization"""
    REASONING = "reasoning"
    COMPUTATION = "computation"
    ANALYSIS = "analysis"
    COORDINATION = "coordination"
    LEARNING = "learning"
    CREATIVE = "creative"
    CULTURAL = "cultural"
    MAINTENANCE = "maintenance"

@dataclass
class Task:
    """Represents a task in the multi-agent system"""
    task_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    task_type: TaskType = TaskType.COMPUTATION
    priority: TaskPriority = TaskPriority.NORMAL
    status: TaskStatus = TaskStatus.PENDING
    
    # Requirements and constraints
    required_capabilities: List[str] = field(default_factory=list)
    estimated_duration: float = 3600.0  # seconds
    deadline: Optional[float] = None
    dependencies: List[str] = field(default_factory=list)  # task_ids
    resource_requirements: Dict[str, float] = field(default_factory=dict)
    
    # Assignment tracking
    assigned_agent: Optional[str] = None
    assignment_time: Optional[float] = None
    start_time: Optional[float] = None
    completion_time: Optional[float] = None
    
    # Cultural context
    cultural_sensitivity: float = 0.0  # 0.0 to 1.0
    requires_cultural_guidance: bool = False
    Romanian_cultural_context: Optional[str] = None
    
    # Progress tracking
    progress: float = 0.0  # 0.0 to 1.0
    quality_score: float = 0.0  # 0.0 to 1.0
    effort_spent: float = 0.0  # seconds
    
    # Metadata
    created_time: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __lt__(self, other):
        """Priority queue comparison (higher priority first)"""
        return self.priority.value > other.priority.value

@dataclass 
class AgentWorkload:
    """Tracks an agent's current workload and capacity"""
    agent_id: str
    current_tasks: List[str] = field(default_factory=list)  # task_ids
    total_estimated_work: float = 0.0  # seconds
    capacity_utilization: float = 0.0  # 0.0 to 1.0
    specializations: List[TaskType] = field(default_factory=list)
    performance_history: Dict[str, float] = field(default_factory=dict)
    cultural_alignment: float = 0.8  # 0.0 to 1.0
    last_assignment_time: float = 0.0
    preferred_work_patterns: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DistributionMetrics:
    """Tracks distribution system performance"""
    total_tasks_assigned: int = 0
    total_tasks_completed: int = 0
    average_assignment_time: float = 0.0
    workload_balance_score: float = 1.0  # 0.0 to 1.0
    cultural_harmony_score: float = 1.0  # 0.0 to 1.0
    agent_satisfaction_scores: Dict[str, float] = field(default_factory=dict)
    task_completion_rates: Dict[TaskType, float] = field(default_factory=dict)
    
class TaskDistributionSystem:
    """
    📋 Advanced Task Distribution System
    
    Implements intelligent task assignment using Romanian cultural principles
    of fair resource allocation, collaborative work organization, and cultural
    harmony optimization.
    """
    
    def __init__(self, cultural_advisor: Optional[RomanianCulturalAdvisor] = None):
        self.cultural_advisor = cultural_advisor or RomanianCulturalAdvisor()
        self.logger = logging.getLogger("RomAI.TaskDistribution")
        
        # Task management
        self.tasks: Dict[str, Task] = {}
        self.task_queue: List[Task] = []  # Priority queue
        self.agent_workloads: Dict[str, AgentWorkload] = {}
        
        # Distribution algorithms
        self.distribution_strategies = {
            'cultural_harmony': self._distribute_cultural_harmony,
            'load_balance': self._distribute_load_balance,
            'specialization': self._distribute_specialization,
            'round_robin': self._distribute_round_robin,
            'priority_first': self._distribute_priority_first
        }
        
        # Performance tracking
        self.metrics = DistributionMetrics()
        self.assignment_history: deque = deque(maxlen=1000)
        
        # Configuration
        self.max_concurrent_tasks_per_agent = 5
        self.workload_balance_threshold = 0.8
        self.cultural_harmony_weight = 0.3
        self.performance_weight = 0.4
        self.specialization_weight = 0.3
        
    async def initialize_agent_workloads(self, agent_ids: List[str], 
                                       agent_capabilities: Dict[str, List[str]]) -> None:
        """Initialize workload tracking for all agents"""
        
        for agent_id in agent_ids:
            capabilities = agent_capabilities.get(agent_id, [])
            
            # Map capabilities to task types
            specializations = []
            for capability in capabilities:
                if any(keyword in capability.lower() for keyword in ['reason', 'logic', 'think']):
                    specializations.append(TaskType.REASONING)
                elif any(keyword in capability.lower() for keyword in ['compute', 'calculate', 'math']):
                    specializations.append(TaskType.COMPUTATION)
                elif any(keyword in capability.lower() for keyword in ['analyze', 'research', 'study']):
                    specializations.append(TaskType.ANALYSIS)
                elif any(keyword in capability.lower() for keyword in ['coordinate', 'manage', 'organize']):
                    specializations.append(TaskType.COORDINATION)
                elif any(keyword in capability.lower() for keyword in ['learn', 'train', 'adapt']):
                    specializations.append(TaskType.LEARNING)
                elif any(keyword in capability.lower() for keyword in ['create', 'design', 'innovate']):
                    specializations.append(TaskType.CREATIVE)
                elif any(keyword in capability.lower() for keyword in ['culture', 'romanian', 'traditional']):
                    specializations.append(TaskType.CULTURAL)
                    
            # Default to computation if no specializations identified
            if not specializations:
                specializations = [TaskType.COMPUTATION]
                
            self.agent_workloads[agent_id] = AgentWorkload(
                agent_id=agent_id,
                specializations=specializations,
                cultural_alignment=0.8 + (0.2 * ('cultural' in capabilities or 'romanian' in str(capabilities).lower()))
            )
            
        self.logger.info(f"Initialized workload tracking for {len(agent_ids)} agents")
        
    async def submit_task(self, task: Task) -> str:
        """Submit a new task for distribution"""
        
        # Validate task
        if not task.name:
            task.name = f"Task_{task.task_id[:8]}"
            
        # Apply cultural context if needed
        if task.cultural_sensitivity > 0.5 or task.requires_cultural_guidance:
            cultural_context = await self.cultural_advisor.assess_cultural_context(
                list(self.agent_workloads.keys()),
                [{'task_id': task.task_id, 'type': task.task_type.value}]
            )
            task.Romanian_cultural_context = f"Leadership: {cultural_context.leadership_style.value}"
            
        # Store task
        self.tasks[task.task_id] = task
        
        # Add to priority queue
        heapq.heappush(self.task_queue, task)
        
        self.logger.info(f"Task submitted: {task.name} (ID: {task.task_id[:8]}, Priority: {task.priority.name})")
        
        # Try immediate assignment if possible
        await self._attempt_immediate_assignment(task)
        
        return task.task_id
        
    async def _attempt_immediate_assignment(self, task: Task) -> bool:
        """Try to assign task immediately if suitable agent available"""
        
        if task.priority.value >= TaskPriority.HIGH.value:
            suitable_agents = await self._find_suitable_agents(task)
            if suitable_agents:
                best_agent = suitable_agents[0]
                await self._assign_task_to_agent(task.task_id, best_agent['agent_id'])
                return True
                
        return False
        
    async def distribute_pending_tasks(self, strategy: str = 'cultural_harmony') -> Dict[str, Any]:
        """Distribute all pending tasks using specified strategy"""
        
        if strategy not in self.distribution_strategies:
            raise ValueError(f"Unknown distribution strategy: {strategy}")
            
        distribution_func = self.distribution_strategies[strategy]
        
        # Get pending tasks
        pending_tasks = [task for task in self.task_queue if task.status == TaskStatus.PENDING]
        
        if not pending_tasks:
            return {
                'status': 'no_pending_tasks',
                'assignments': [],
                'metrics': self._calculate_distribution_metrics()
            }
            
        # Apply distribution strategy
        assignments = await distribution_func(pending_tasks)
        
        # Execute assignments
        successful_assignments = []
        for assignment in assignments:
            try:
                await self._assign_task_to_agent(assignment['task_id'], assignment['agent_id'])
                successful_assignments.append(assignment)
            except Exception as e:
                self.logger.error(f"Failed to assign task {assignment['task_id']}: {e}")
                
        # Update metrics
        self.metrics.total_tasks_assigned += len(successful_assignments)
        self._update_performance_metrics()
        
        return {
            'status': 'success',
            'strategy_used': strategy,
            'total_pending': len(pending_tasks),
            'successful_assignments': len(successful_assignments),
            'assignments': successful_assignments,
            'metrics': self._calculate_distribution_metrics()
        }
        
    async def _distribute_cultural_harmony(self, tasks: List[Task]) -> List[Dict[str, Any]]:
        """Distribute tasks optimizing for cultural harmony"""
        
        assignments = []
        
        for task in sorted(tasks, key=lambda t: t.priority.value, reverse=True):
            suitable_agents = await self._find_suitable_agents(task)
            
            if not suitable_agents:
                self.logger.warning(f"No suitable agents found for task {task.task_id}")
                continue
                
            # Score agents by cultural alignment and other factors
            best_agent = None
            best_score = -1.0
            
            for agent_info in suitable_agents:
                agent_id = agent_info['agent_id']
                workload = self.agent_workloads[agent_id]
                
                # Cultural harmony score
                cultural_score = workload.cultural_alignment
                if task.requires_cultural_guidance:
                    cultural_score *= 1.5
                    
                # Workload balance score  
                workload_score = max(0.0, 1.0 - workload.capacity_utilization)
                
                # Specialization score
                spec_score = 1.0 if task.task_type in workload.specializations else 0.5
                
                # Performance history score
                perf_score = workload.performance_history.get(task.task_type.value, 0.7)
                
                # Combined score
                total_score = (
                    self.cultural_harmony_weight * cultural_score +
                    0.3 * workload_score +
                    self.specialization_weight * spec_score +
                    self.performance_weight * perf_score
                )
                
                if total_score > best_score:
                    best_score = total_score
                    best_agent = agent_id
                    
            if best_agent:
                assignments.append({
                    'task_id': task.task_id,
                    'agent_id': best_agent,
                    'assignment_score': best_score,
                    'rationale': f'Cultural harmony optimization (score: {best_score:.3f})'
                })
                
                # Update workload projection for subsequent assignments
                self.agent_workloads[best_agent].capacity_utilization += (
                    task.estimated_duration / 28800  # 8 hours workday
                )
                
        return assignments
        
    async def _distribute_load_balance(self, tasks: List[Task]) -> List[Dict[str, Any]]:
        """Distribute tasks optimizing for load balance"""
        
        assignments = []
        
        for task in sorted(tasks, key=lambda t: t.priority.value, reverse=True):
            suitable_agents = await self._find_suitable_agents(task)
            
            if not suitable_agents:
                continue
                
            # Find agent with lowest current workload
            best_agent = min(suitable_agents, 
                           key=lambda a: self.agent_workloads[a['agent_id']].capacity_utilization)
            
            assignments.append({
                'task_id': task.task_id,
                'agent_id': best_agent['agent_id'],
                'assignment_score': 1.0 - self.agent_workloads[best_agent['agent_id']].capacity_utilization,
                'rationale': 'Load balancing optimization'
            })
            
            # Update workload projection
            self.agent_workloads[best_agent['agent_id']].capacity_utilization += (
                task.estimated_duration / 28800
            )
            
        return assignments
        
    async def _distribute_specialization(self, tasks: List[Task]) -> List[Dict[str, Any]]:
        """Distribute tasks based on agent specializations"""
        
        assignments = []
        
        for task in sorted(tasks, key=lambda t: t.priority.value, reverse=True):
            suitable_agents = await self._find_suitable_agents(task)
            
            # Prefer agents with specialization in task type
            specialized_agents = [
                agent for agent in suitable_agents 
                if task.task_type in self.agent_workloads[agent['agent_id']].specializations
            ]
            
            target_agents = specialized_agents if specialized_agents else suitable_agents
            
            if target_agents:
                # Choose least loaded among specialists
                best_agent = min(target_agents,
                               key=lambda a: self.agent_workloads[a['agent_id']].capacity_utilization)
                
                assignments.append({
                    'task_id': task.task_id,
                    'agent_id': best_agent['agent_id'],
                    'assignment_score': 1.0 if specialized_agents else 0.5,
                    'rationale': f"Specialization match: {task.task_type.value}"
                })
                
                self.agent_workloads[best_agent['agent_id']].capacity_utilization += (
                    task.estimated_duration / 28800
                )
                
        return assignments
        
    async def _distribute_round_robin(self, tasks: List[Task]) -> List[Dict[str, Any]]:
        """Distribute tasks using round-robin assignment"""
        
        assignments = []
        available_agents = list(self.agent_workloads.keys())
        
        if not available_agents:
            return assignments
            
        agent_index = 0
        
        for task in sorted(tasks, key=lambda t: t.priority.value, reverse=True):
            # Skip agents that are overloaded
            attempts = 0
            while (attempts < len(available_agents) and 
                   self.agent_workloads[available_agents[agent_index]].capacity_utilization > 0.9):
                agent_index = (agent_index + 1) % len(available_agents)
                attempts += 1
                
            if attempts < len(available_agents):
                selected_agent = available_agents[agent_index]
                
                assignments.append({
                    'task_id': task.task_id,
                    'agent_id': selected_agent,
                    'assignment_score': 1.0,
                    'rationale': 'Round-robin distribution'
                })
                
                self.agent_workloads[selected_agent].capacity_utilization += (
                    task.estimated_duration / 28800
                )
                
                agent_index = (agent_index + 1) % len(available_agents)
                
        return assignments
        
    async def _distribute_priority_first(self, tasks: List[Task]) -> List[Dict[str, Any]]:
        """Distribute tasks prioritizing highest priority tasks first"""
        
        assignments = []
        
        # Sort by priority, then by deadline
        sorted_tasks = sorted(tasks, key=lambda t: (
            t.priority.value,
            t.deadline if t.deadline else float('inf')
        ), reverse=True)
        
        for task in sorted_tasks:
            suitable_agents = await self._find_suitable_agents(task)
            
            if suitable_agents:
                # For high priority tasks, prefer agents with best performance history
                if task.priority.value >= TaskPriority.HIGH.value:
                    best_agent = max(suitable_agents, 
                                   key=lambda a: self.agent_workloads[a['agent_id']].performance_history.get(
                                       task.task_type.value, 0.5))
                else:
                    # For normal/low priority, balance workload
                    best_agent = min(suitable_agents,
                                   key=lambda a: self.agent_workloads[a['agent_id']].capacity_utilization)
                    
                assignments.append({
                    'task_id': task.task_id,
                    'agent_id': best_agent['agent_id'],
                    'assignment_score': task.priority.value / 10.0,
                    'rationale': f'Priority-first assignment (Priority: {task.priority.name})'
                })
                
                self.agent_workloads[best_agent['agent_id']].capacity_utilization += (
                    task.estimated_duration / 28800
                )
                
        return assignments
        
    async def _find_suitable_agents(self, task: Task) -> List[Dict[str, Any]]:
        """Find agents suitable for a given task"""
        
        suitable_agents = []
        
        for agent_id, workload in self.agent_workloads.items():
            # Check capacity constraints
            if len(workload.current_tasks) >= self.max_concurrent_tasks_per_agent:
                continue
                
            if workload.capacity_utilization > 0.95:
                continue
                
            # Check capability requirements
            if task.required_capabilities:
                # In real implementation, would check against actual agent capabilities
                # For now, assume all agents can handle basic tasks
                pass
                
            # Check cultural requirements
            if task.requires_cultural_guidance and workload.cultural_alignment < 0.6:
                continue
                
            # Calculate suitability score
            suitability_score = self._calculate_agent_suitability(agent_id, task)
            
            if suitability_score > 0.3:  # Minimum suitability threshold
                suitable_agents.append({
                    'agent_id': agent_id,
                    'suitability_score': suitability_score
                })
                
        # Sort by suitability score (descending)
        suitable_agents.sort(key=lambda x: x['suitability_score'], reverse=True)
        
        return suitable_agents
        
    def _calculate_agent_suitability(self, agent_id: str, task: Task) -> float:
        """Calculate how suitable an agent is for a specific task"""
        
        workload = self.agent_workloads[agent_id]
        score = 0.0
        
        # Specialization match
        if task.task_type in workload.specializations:
            score += 0.4
        else:
            score += 0.1  # Can still handle basic tasks
            
        # Performance history
        perf_score = workload.performance_history.get(task.task_type.value, 0.6)
        score += 0.3 * perf_score
        
        # Cultural alignment
        if task.cultural_sensitivity > 0.0 or task.requires_cultural_guidance:
            score += 0.2 * workload.cultural_alignment
        else:
            score += 0.1  # Small bonus for cultural alignment
            
        # Workload factor (prefer less loaded agents)
        score += 0.1 * (1.0 - workload.capacity_utilization)
        
        return min(1.0, score)
        
    async def _assign_task_to_agent(self, task_id: str, agent_id: str) -> bool:
        """Assign a specific task to a specific agent"""
        
        if task_id not in self.tasks:
            raise ValueError(f"Task {task_id} not found")
            
        if agent_id not in self.agent_workloads:
            raise ValueError(f"Agent {agent_id} not found")
            
        task = self.tasks[task_id]
        workload = self.agent_workloads[agent_id]
        
        # Update task status
        task.status = TaskStatus.ASSIGNED
        task.assigned_agent = agent_id
        task.assignment_time = time.time()
        
        # Update agent workload
        workload.current_tasks.append(task_id)
        workload.total_estimated_work += task.estimated_duration
        workload.capacity_utilization = min(1.0, workload.total_estimated_work / 28800)
        workload.last_assignment_time = time.time()
        
        # Remove from queue
        self.task_queue = [t for t in self.task_queue if t.task_id != task_id]
        heapq.heapify(self.task_queue)
        
        # Record assignment
        assignment_record = {
            'task_id': task_id,
            'agent_id': agent_id,
            'assignment_time': task.assignment_time,
            'task_priority': task.priority.value,
            'task_type': task.task_type.value
        }
        self.assignment_history.append(assignment_record)
        
        self.logger.info(f"Task {task.name} assigned to agent {agent_id}")
        
        return True
        
    def _calculate_distribution_metrics(self) -> Dict[str, Any]:
        """Calculate current distribution system metrics"""
        
        # Workload balance calculation
        if self.agent_workloads:
            utilizations = [w.capacity_utilization for w in self.agent_workloads.values()]
            avg_utilization = sum(utilizations) / len(utilizations)
            utilization_variance = sum((u - avg_utilization) ** 2 for u in utilizations) / len(utilizations)
            workload_balance_score = max(0.0, 1.0 - (utilization_variance * 4))  # Scale variance
        else:
            workload_balance_score = 1.0
            
        # Task completion rates by type
        completion_rates = {}
        for task_type in TaskType:
            type_tasks = [t for t in self.tasks.values() if t.task_type == task_type]
            if type_tasks:
                completed_tasks = [t for t in type_tasks if t.status == TaskStatus.COMPLETED]
                completion_rates[task_type.value] = len(completed_tasks) / len(type_tasks)
            else:
                completion_rates[task_type.value] = 0.0
                
        # Cultural harmony score (based on cultural alignment of assigned tasks)
        cultural_tasks = [t for t in self.tasks.values() 
                         if t.requires_cultural_guidance and t.assigned_agent]
        cultural_harmony_score = 1.0
        
        if cultural_tasks:
            harmony_scores = []
            for task in cultural_tasks:
                agent_alignment = self.agent_workloads[task.assigned_agent].cultural_alignment
                harmony_scores.append(agent_alignment)
            cultural_harmony_score = sum(harmony_scores) / len(harmony_scores)
            
        return {
            'workload_balance_score': workload_balance_score,
            'cultural_harmony_score': cultural_harmony_score,
            'task_completion_rates': completion_rates,
            'total_active_tasks': sum(len(w.current_tasks) for w in self.agent_workloads.values()),
            'total_agents': len(self.agent_workloads),
            'average_utilization': sum(w.capacity_utilization for w in self.agent_workloads.values()) / len(self.agent_workloads) if self.agent_workloads else 0.0,
            'pending_tasks_count': len([t for t in self.tasks.values() if t.status == TaskStatus.PENDING])
        }
        
    def _update_performance_metrics(self) -> None:
        """Update performance metrics based on recent assignments"""
        
        if self.assignment_history:
            recent_assignments = list(self.assignment_history)[-100:]  # Last 100 assignments
            assignment_times = [time.time() - a['assignment_time'] for a in recent_assignments 
                              if time.time() - a['assignment_time'] < 3600]  # Last hour
            
            if assignment_times:
                self.metrics.average_assignment_time = sum(assignment_times) / len(assignment_times)
                
        self.metrics.workload_balance_score = self._calculate_distribution_metrics()['workload_balance_score']
        self.metrics.cultural_harmony_score = self._calculate_distribution_metrics()['cultural_harmony_score']
        
    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        
        return {
            'system_info': {
                'total_tasks': len(self.tasks),
                'total_agents': len(self.agent_workloads),
                'active_assignments': sum(len(w.current_tasks) for w in self.agent_workloads.values())
            },
            'task_distribution': {
                'pending': len([t for t in self.tasks.values() if t.status == TaskStatus.PENDING]),
                'assigned': len([t for t in self.tasks.values() if t.status == TaskStatus.ASSIGNED]),
                'in_progress': len([t for t in self.tasks.values() if t.status == TaskStatus.IN_PROGRESS]),
                'completed': len([t for t in self.tasks.values() if t.status == TaskStatus.COMPLETED]),
                'failed': len([t for t in self.tasks.values() if t.status == TaskStatus.FAILED])
            },
            'agent_workloads': {
                agent_id: {
                    'current_tasks': len(workload.current_tasks),
                    'capacity_utilization': workload.capacity_utilization,
                    'specializations': [s.value for s in workload.specializations],
                    'cultural_alignment': workload.cultural_alignment
                }
                for agent_id, workload in self.agent_workloads.items()
            },
            'performance_metrics': self._calculate_distribution_metrics(),
            'cultural_status': self.cultural_advisor.get_cultural_status()
        }

# Export key classes
__all__ = [
    'TaskPriority', 'TaskStatus', 'TaskType', 'Task', 
    'AgentWorkload', 'DistributionMetrics', 'TaskDistributionSystem'
]