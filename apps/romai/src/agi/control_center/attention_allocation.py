"""
Attention Allocation System - Cognitive Resource Management
========================================================

Manages cognitive resources across multiple reasoning engines and tasks.
Implements attention mechanisms for optimal resource utilization and
performance in the AGI system.

Key Features:
- Dynamic attention allocation based on task priority and resource needs
- Resource contention resolution with fair allocation algorithms
- Performance monitoring and adaptive resource management
- Multi-engine coordination with resource budgeting
- Real-time resource reallocation based on performance feedback

Author: GitHub Copilot Agent
Date: August 27, 2025
Version: 1.0.0 - Phase 1 AGI Implementation
"""

import asyncio
import logging
import time
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AttentionMode(Enum):
    """Attention allocation modes"""
    FOCUSED = "focused"          # Single high-priority task
    DISTRIBUTED = "distributed"  # Multiple medium-priority tasks
    BALANCED = "balanced"        # Equal distribution
    ADAPTIVE = "adaptive"        # Dynamic based on performance
    EMERGENCY = "emergency"      # Critical task only

@dataclass
class ResourceBudget:
    """Resource budget for cognitive operations"""
    max_attention: float = 1.0
    max_memory: float = 1.0
    max_reasoning: float = 1.0
    max_learning: float = 1.0
    max_execution: float = 1.0
    
    # Current allocation
    allocated_attention: float = 0.0
    allocated_memory: float = 0.0
    allocated_reasoning: float = 0.0
    allocated_learning: float = 0.0
    allocated_execution: float = 0.0
    
    def available_attention(self) -> float:
        return max(0.0, self.max_attention - self.allocated_attention)
    
    def available_memory(self) -> float:
        return max(0.0, self.max_memory - self.allocated_memory)
    
    def available_reasoning(self) -> float:
        return max(0.0, self.max_reasoning - self.allocated_reasoning)

@dataclass
class AttentionRequest:
    """Request for cognitive resources"""
    task_id: str
    priority: float
    resource_needs: Dict[str, float]
    estimated_duration: float
    context: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class ResourceAllocation:
    """Allocated resources for a task"""
    task_id: str
    attention: float
    memory: float
    reasoning: float
    learning: float
    execution: float
    allocated_at: datetime = field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None

class AttentionAllocationSystem:
    """
    Cognitive Resource Management System
    
    Manages attention and cognitive resources across multiple reasoning engines,
    ensuring optimal performance and fair resource distribution.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize attention allocation system"""
        self.config = config or {}
        
        # Resource management
        self.budget = ResourceBudget()
        self.active_allocations: Dict[str, ResourceAllocation] = {}
        self.allocation_history: List[ResourceAllocation] = []
        
        # Attention modes and strategies
        self.current_mode = AttentionMode.ADAPTIVE
        self.allocation_strategy = "priority_weighted"
        
        # Performance tracking
        self.performance_metrics = {
            "allocation_efficiency": 0.8,
            "resource_utilization": 0.7,
            "task_completion_rate": 0.85,
            "response_time": 0.2
        }
        
        # Adaptation parameters
        self.adaptation_rate = 0.1
        self.efficiency_threshold = 0.8
        self.reallocation_threshold = 0.1
        
        logger.info("🎯 Attention Allocation System initialized")
        logger.info(f"📊 Mode: {self.current_mode.value}, Strategy: {self.allocation_strategy}")
    
    async def allocate_resources(self, goals: List[Dict[str, Any]], 
                                state: Any) -> Dict[Any, float]:
        """
        Allocate cognitive resources based on goals and system state
        
        Args:
            goals: List of current system goals with priorities
            state: Current AGI system state
            
        Returns:
            Resource allocation mapping
        """
        try:
            # Convert goals to resource requests
            resource_requests = await self._convert_goals_to_requests(goals)
            
            # Calculate optimal allocation
            allocation_plan = await self._calculate_optimal_allocation(resource_requests, state)
            
            # Apply allocation with monitoring
            applied_allocation = await self._apply_allocation_plan(allocation_plan)
            
            # Update performance metrics
            await self._update_performance_metrics(applied_allocation)
            
            # Adapt allocation strategy if needed
            await self._adapt_allocation_strategy()
            
            return applied_allocation
            
        except Exception as e:
            logger.error(f"❌ Resource allocation failed: {e}")
            return await self._fallback_allocation(goals)
    
    async def _convert_goals_to_requests(self, goals: List[Dict[str, Any]]) -> List[AttentionRequest]:
        """Convert AGI goals to resource requests"""
        requests = []
        
        for goal in goals:
            goal_id = goal.get("id", f"goal_{len(requests)}")
            priority = self._priority_to_float(goal.get("priority"))
            
            # Estimate resource needs based on goal type
            resource_needs = await self._estimate_resource_needs(goal)
            
            # Estimate duration
            estimated_duration = await self._estimate_goal_duration(goal)
            
            request = AttentionRequest(
                task_id=goal_id,
                priority=priority,
                resource_needs=resource_needs,
                estimated_duration=estimated_duration,
                context=goal
            )
            
            requests.append(request)
        
        return requests
    
    async def _estimate_resource_needs(self, goal: Dict[str, Any]) -> Dict[str, float]:
        """Estimate resource needs for a goal"""
        goal_type = goal.get("id", "unknown")
        
        # Resource need templates based on goal type
        resource_templates = {
            "maintain_operation": {
                "attention": 0.3,
                "memory": 0.2,
                "reasoning": 0.4,
                "learning": 0.1,
                "execution": 0.5
            },
            "improve_performance": {
                "attention": 0.6,
                "memory": 0.4,
                "reasoning": 0.8,
                "learning": 0.7,
                "execution": 0.3
            },
            "acquire_knowledge": {
                "attention": 0.5,
                "memory": 0.8,
                "reasoning": 0.6,
                "learning": 0.9,
                "execution": 0.2
            },
            "optimize_resources": {
                "attention": 0.7,
                "memory": 0.3,
                "reasoning": 0.9,
                "learning": 0.4,
                "execution": 0.6
            },
            "default": {
                "attention": 0.4,
                "memory": 0.3,
                "reasoning": 0.5,
                "learning": 0.3,
                "execution": 0.4
            }
        }
        
        return resource_templates.get(goal_type, resource_templates["default"])
    
    async def _estimate_goal_duration(self, goal: Dict[str, Any]) -> float:
        """Estimate duration for goal completion"""
        goal_type = goal.get("id", "unknown")
        
        duration_estimates = {
            "maintain_operation": 2.0,
            "improve_performance": 10.0,
            "acquire_knowledge": 15.0,
            "optimize_resources": 5.0,
            "performance_recovery": 8.0,
            "queue_management": 3.0
        }
        
        return duration_estimates.get(goal_type, 5.0)
    
    async def _calculate_optimal_allocation(self, requests: List[AttentionRequest], 
                                          state: Any) -> Dict[str, ResourceAllocation]:
        """Calculate optimal resource allocation using priority-weighted algorithm"""
        allocation_plan = {}
        
        # Sort requests by priority (descending)
        sorted_requests = sorted(requests, key=lambda r: r.priority, reverse=True)
        
        # Reset budget allocation counters
        self.budget.allocated_attention = 0.0
        self.budget.allocated_memory = 0.0
        self.budget.allocated_reasoning = 0.0
        self.budget.allocated_learning = 0.0
        self.budget.allocated_execution = 0.0
        
        for request in sorted_requests:
            # Calculate allocation based on priority and availability
            allocation = await self._calculate_single_allocation(request)
            
            if allocation:
                allocation_plan[request.task_id] = allocation
                
                # Update budget allocation
                self._update_budget_allocation(allocation)
        
        return allocation_plan
    
    async def _calculate_single_allocation(self, request: AttentionRequest) -> Optional[ResourceAllocation]:
        """Calculate resource allocation for a single request"""
        needed_attention = request.resource_needs.get("attention", 0.0)
        needed_memory = request.resource_needs.get("memory", 0.0)
        needed_reasoning = request.resource_needs.get("reasoning", 0.0)
        needed_learning = request.resource_needs.get("learning", 0.0)
        needed_execution = request.resource_needs.get("execution", 0.0)
        
        # Check availability
        available_attention = self.budget.available_attention()
        available_memory = self.budget.available_memory()
        available_reasoning = self.budget.available_reasoning()
        
        # Apply priority scaling
        priority_factor = min(1.0, request.priority)
        
        # Calculate actual allocation (may be less than requested)
        allocated_attention = min(needed_attention * priority_factor, available_attention)
        allocated_memory = min(needed_memory * priority_factor, available_memory)
        allocated_reasoning = min(needed_reasoning * priority_factor, available_reasoning)
        allocated_learning = min(needed_learning * priority_factor, 
                                self.budget.max_learning - self.budget.allocated_learning)
        allocated_execution = min(needed_execution * priority_factor,
                                 self.budget.max_execution - self.budget.allocated_execution)
        
        # Only allocate if we can provide reasonable resources
        min_threshold = 0.1
        if (allocated_attention < min_threshold * needed_attention and 
            allocated_reasoning < min_threshold * needed_reasoning):
            return None  # Insufficient resources
        
        # Create allocation with expiration
        expiration = datetime.now() + timedelta(seconds=request.estimated_duration + 10)
        
        return ResourceAllocation(
            task_id=request.task_id,
            attention=allocated_attention,
            memory=allocated_memory,
            reasoning=allocated_reasoning,
            learning=allocated_learning,
            execution=allocated_execution,
            expires_at=expiration
        )
    
    def _update_budget_allocation(self, allocation: ResourceAllocation) -> None:
        """Update budget with new allocation"""
        self.budget.allocated_attention += allocation.attention
        self.budget.allocated_memory += allocation.memory
        self.budget.allocated_reasoning += allocation.reasoning
        self.budget.allocated_learning += allocation.learning
        self.budget.allocated_execution += allocation.execution
    
    async def _apply_allocation_plan(self, allocation_plan: Dict[str, ResourceAllocation]) -> Dict[Any, float]:
        """Apply the calculated allocation plan"""
        # Store active allocations
        for task_id, allocation in allocation_plan.items():
            self.active_allocations[task_id] = allocation
            self.allocation_history.append(allocation)
        
        # Clean up expired allocations
        await self._cleanup_expired_allocations()
        
        # Convert to expected format for AGI Control Center
        from .agi_control_center import ResourceType
        
        resource_allocation = {
            ResourceType.ATTENTION: sum(a.attention for a in allocation_plan.values()),
            ResourceType.MEMORY: sum(a.memory for a in allocation_plan.values()),
            ResourceType.REASONING: sum(a.reasoning for a in allocation_plan.values()),
            ResourceType.LEARNING: sum(a.learning for a in allocation_plan.values()),
            ResourceType.EXECUTION: sum(a.execution for a in allocation_plan.values())
        }
        
        logger.info(f"📊 Resources allocated: Attention={resource_allocation[ResourceType.ATTENTION]:.2f}, "
                   f"Reasoning={resource_allocation[ResourceType.REASONING]:.2f}")
        
        return resource_allocation
    
    async def _cleanup_expired_allocations(self) -> None:
        """Clean up expired resource allocations"""
        current_time = datetime.now()
        expired_tasks = []
        
        for task_id, allocation in self.active_allocations.items():
            if allocation.expires_at and current_time > allocation.expires_at:
                expired_tasks.append(task_id)
        
        for task_id in expired_tasks:
            del self.active_allocations[task_id]
            logger.debug(f"🧹 Cleaned up expired allocation for task: {task_id}")
    
    async def _update_performance_metrics(self, allocation: Dict[Any, float]) -> None:
        """Update performance metrics based on allocation results"""
        # Calculate utilization
        total_allocated = sum(allocation.values())
        total_capacity = 5.0  # 5 resource types, max 1.0 each
        
        utilization = min(1.0, total_allocated / total_capacity)
        
        # Update running averages
        alpha = 0.1  # Smoothing factor
        self.performance_metrics["resource_utilization"] = (
            (1 - alpha) * self.performance_metrics["resource_utilization"] + 
            alpha * utilization
        )
        
        # Calculate allocation efficiency (how well we use available resources)
        efficiency = utilization / max(0.1, len(self.active_allocations))
        self.performance_metrics["allocation_efficiency"] = (
            (1 - alpha) * self.performance_metrics["allocation_efficiency"] +
            alpha * efficiency
        )
    
    async def _adapt_allocation_strategy(self) -> None:
        """Adapt allocation strategy based on performance"""
        current_efficiency = self.performance_metrics["allocation_efficiency"]
        
        if current_efficiency < self.efficiency_threshold:
            # Try different allocation strategy
            if self.allocation_strategy == "priority_weighted":
                self.allocation_strategy = "balanced"
                self.current_mode = AttentionMode.BALANCED
            elif self.allocation_strategy == "balanced":
                self.allocation_strategy = "focused"
                self.current_mode = AttentionMode.FOCUSED
            else:
                self.allocation_strategy = "priority_weighted"
                self.current_mode = AttentionMode.ADAPTIVE
            
            logger.info(f"🔄 Adapted allocation strategy: {self.allocation_strategy}")
    
    async def _fallback_allocation(self, goals: List[Dict[str, Any]]) -> Dict[Any, float]:
        """Fallback allocation when main algorithm fails"""
        from .agi_control_center import ResourceType
        
        # Simple equal distribution
        num_goals = len(goals) if goals else 1
        allocation_per_goal = 0.8 / num_goals
        
        return {
            ResourceType.ATTENTION: min(1.0, allocation_per_goal * 1.2),
            ResourceType.MEMORY: min(1.0, allocation_per_goal * 0.8),
            ResourceType.REASONING: min(1.0, allocation_per_goal * 1.0),
            ResourceType.LEARNING: min(1.0, allocation_per_goal * 0.6),
            ResourceType.EXECUTION: min(1.0, allocation_per_goal * 0.9)
        }
    
    def _priority_to_float(self, priority) -> float:
        """Convert priority enum to float value"""
        if hasattr(priority, 'value'):
            return priority.value
        if isinstance(priority, (int, float)):
            return float(priority)
        return 0.5  # Default medium priority
    
    async def reallocate_resources(self, task_id: str, new_needs: Dict[str, float]) -> bool:
        """Reallocate resources for a specific task"""
        if task_id not in self.active_allocations:
            return False
        
        current_allocation = self.active_allocations[task_id]
        
        # Calculate needed changes
        attention_diff = new_needs.get("attention", 0) - current_allocation.attention
        memory_diff = new_needs.get("memory", 0) - current_allocation.memory
        reasoning_diff = new_needs.get("reasoning", 0) - current_allocation.reasoning
        
        # Check if we have available resources for increase
        if attention_diff > 0 and attention_diff > self.budget.available_attention():
            return False
        if memory_diff > 0 and memory_diff > self.budget.available_memory():
            return False
        if reasoning_diff > 0 and reasoning_diff > self.budget.available_reasoning():
            return False
        
        # Apply reallocation
        current_allocation.attention += attention_diff
        current_allocation.memory += memory_diff
        current_allocation.reasoning += reasoning_diff
        
        logger.info(f"🔄 Reallocated resources for task: {task_id}")
        return True
    
    async def get_allocation_status(self) -> Dict[str, Any]:
        """Get current allocation status"""
        return {
            "mode": self.current_mode.value,
            "strategy": self.allocation_strategy,
            "active_allocations": len(self.active_allocations),
            "budget_utilization": {
                "attention": self.budget.allocated_attention / self.budget.max_attention,
                "memory": self.budget.allocated_memory / self.budget.max_memory,
                "reasoning": self.budget.allocated_reasoning / self.budget.max_reasoning,
                "learning": self.budget.allocated_learning / self.budget.max_learning,
                "execution": self.budget.allocated_execution / self.budget.max_execution
            },
            "performance_metrics": self.performance_metrics.copy()
        }
    
    async def emergency_reallocation(self, critical_task_id: str) -> bool:
        """Emergency reallocation for critical tasks"""
        logger.warning(f"🚨 Emergency reallocation for task: {critical_task_id}")
        
        # Free up resources from non-critical tasks
        self.current_mode = AttentionMode.EMERGENCY
        
        # Reduce allocation for all other tasks
        for task_id, allocation in self.active_allocations.items():
            if task_id != critical_task_id:
                allocation.attention *= 0.3
                allocation.memory *= 0.3
                allocation.reasoning *= 0.3
        
        # Allocate maximum resources to critical task
        critical_allocation = ResourceAllocation(
            task_id=critical_task_id,
            attention=0.9,
            memory=0.8,
            reasoning=0.95,
            learning=0.2,
            execution=0.9
        )
        
        self.active_allocations[critical_task_id] = critical_allocation
        
        return True