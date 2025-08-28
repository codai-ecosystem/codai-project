"""
Strategic Planning Engine - Goal Decomposition and Multi-Step Planning
===================================================================

Implements strategic planning capabilities for the AGI system including
goal decomposition, multi-step planning, and adaptive strategy adjustment.

Key Features:
- Hierarchical goal decomposition with dependency tracking
- Multi-horizon planning (short-term, medium-term, long-term)
- Strategy evaluation and optimization
- Dynamic plan adaptation based on performance feedback
- Resource-aware planning with constraint satisfaction

Author: GitHub Copilot Agent
Date: August 27, 2025
Version: 1.0.0 - Phase 1 AGI Implementation
"""

import asyncio
import logging
import time
import json
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import networkx as nx
import numpy as np

logger = logging.getLogger(__name__)

class PlanHorizon(Enum):
    """Planning time horizons"""
    IMMEDIATE = "immediate"      # 0-1 minutes
    SHORT_TERM = "short_term"    # 1-10 minutes
    MEDIUM_TERM = "medium_term"  # 10-60 minutes
    LONG_TERM = "long_term"      # 1+ hours

class GoalStatus(Enum):
    """Goal execution status"""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"

class StrategyType(Enum):
    """Strategic approach types"""
    AGGRESSIVE = "aggressive"     # High risk, high reward
    CONSERVATIVE = "conservative" # Low risk, steady progress
    BALANCED = "balanced"        # Moderate risk/reward
    ADAPTIVE = "adaptive"        # Dynamic based on context
    EXPLORATORY = "exploratory"  # Learning-focused

@dataclass
class Goal:
    """Strategic goal with metadata"""
    id: str
    description: str
    priority: float
    horizon: PlanHorizon
    status: GoalStatus = GoalStatus.PENDING
    
    # Dependencies and relationships
    depends_on: List[str] = field(default_factory=list)
    enables: List[str] = field(default_factory=list)
    
    # Resource requirements
    resource_requirements: Dict[str, float] = field(default_factory=dict)
    estimated_duration: float = 0.0
    
    # Success criteria
    success_criteria: List[str] = field(default_factory=list)
    progress_metrics: Dict[str, Any] = field(default_factory=dict)
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    deadline: Optional[datetime] = None
    
    def update_progress(self, metrics: Dict[str, Any]) -> None:
        """Update goal progress metrics"""
        self.progress_metrics.update(metrics)
        self.updated_at = datetime.now()

@dataclass
class Strategy:
    """Strategic approach with execution plan"""
    id: str
    name: str
    type: StrategyType
    description: str
    
    # Execution plan
    goals: List[Goal]
    execution_order: List[str]  # Goal IDs in execution order
    
    # Performance tracking
    expected_outcome: Dict[str, Any]
    actual_outcome: Dict[str, Any] = field(default_factory=dict)
    success_probability: float = 0.8
    
    # Adaptation parameters
    adaptation_triggers: List[str] = field(default_factory=list)
    fallback_strategies: List[str] = field(default_factory=list)
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    last_evaluated: Optional[datetime] = None

class StrategicPlanningEngine:
    """
    Strategic Planning Engine for AGI System
    
    Provides hierarchical goal decomposition, multi-step planning,
    and adaptive strategy management for autonomous AGI operation.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize strategic planning engine"""
        self.config = config or {}
        
        # Planning state
        self.active_goals: Dict[str, Goal] = {}
        self.completed_goals: Dict[str, Goal] = {}
        self.failed_goals: Dict[str, Goal] = {}
        
        # Strategy management
        self.active_strategies: Dict[str, Strategy] = {}
        self.strategy_library: Dict[str, Strategy] = {}
        self.current_strategy_type = StrategyType.ADAPTIVE
        
        # Dependency graph for goal relationships
        self.goal_dependency_graph = nx.DiGraph()
        
        # Planning parameters
        self.max_concurrent_goals = 5
        self.planning_horizon_seconds = {
            PlanHorizon.IMMEDIATE: 60,
            PlanHorizon.SHORT_TERM: 600,
            PlanHorizon.MEDIUM_TERM: 3600,
            PlanHorizon.LONG_TERM: 14400
        }
        
        # Performance tracking
        self.planning_metrics = {
            "goals_completed": 0,
            "goals_failed": 0,
            "average_completion_time": 0.0,
            "strategy_success_rate": 0.8,
            "adaptation_frequency": 0.1
        }
        
        # Initialize default strategies
        asyncio.create_task(self._initialize_default_strategies())
        
        logger.info("🎯 Strategic Planning Engine initialized")
        logger.info(f"📊 Strategy type: {self.current_strategy_type.value}")
    
    async def decompose_high_level_goal(self, high_level_goal: str, 
                                       context: Dict[str, Any]) -> List[Goal]:
        """
        Decompose high-level goal into actionable sub-goals
        
        Args:
            high_level_goal: High-level objective description
            context: Current system context and constraints
            
        Returns:
            List of decomposed goals with dependencies
        """
        try:
            # Analyze goal complexity and scope
            goal_analysis = await self._analyze_goal_complexity(high_level_goal, context)
            
            # Generate sub-goals based on analysis
            sub_goals = await self._generate_sub_goals(high_level_goal, goal_analysis, context)
            
            # Establish dependencies between sub-goals
            await self._establish_goal_dependencies(sub_goals)
            
            # Optimize goal sequence for efficiency
            optimized_goals = await self._optimize_goal_sequence(sub_goals)
            
            # Store goals in active planning
            for goal in optimized_goals:
                self.active_goals[goal.id] = goal
                self.goal_dependency_graph.add_node(goal.id, goal=goal)
            
            # Add dependency edges
            for goal in optimized_goals:
                for dependency in goal.depends_on:
                    if dependency in self.active_goals:
                        self.goal_dependency_graph.add_edge(dependency, goal.id)
            
            logger.info(f"🎯 Decomposed '{high_level_goal}' into {len(optimized_goals)} sub-goals")
            return optimized_goals
            
        except Exception as e:
            logger.error(f"❌ Goal decomposition failed: {e}")
            return await self._create_fallback_goals(high_level_goal)
    
    async def _analyze_goal_complexity(self, goal: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze goal complexity and requirements"""
        analysis = {
            "complexity_score": 0.5,
            "estimated_subtasks": 3,
            "required_capabilities": [],
            "resource_intensity": 0.6,
            "time_horizon": PlanHorizon.MEDIUM_TERM
        }
        
        # Simple heuristic-based analysis
        goal_lower = goal.lower()
        
        # Complexity indicators
        if any(word in goal_lower for word in ["optimize", "improve", "enhance", "maximize"]):
            analysis["complexity_score"] = 0.8
            analysis["estimated_subtasks"] = 5
            analysis["time_horizon"] = PlanHorizon.LONG_TERM
        
        if any(word in goal_lower for word in ["maintain", "monitor", "continue"]):
            analysis["complexity_score"] = 0.3
            analysis["estimated_subtasks"] = 2
            analysis["time_horizon"] = PlanHorizon.SHORT_TERM
        
        if any(word in goal_lower for word in ["learn", "acquire", "understand"]):
            analysis["required_capabilities"].append("learning")
            analysis["resource_intensity"] = 0.7
        
        if any(word in goal_lower for word in ["analyze", "evaluate", "assess"]):
            analysis["required_capabilities"].append("reasoning")
            analysis["resource_intensity"] = 0.8
        
        return analysis
    
    async def _generate_sub_goals(self, high_level_goal: str, 
                                 analysis: Dict[str, Any], 
                                 context: Dict[str, Any]) -> List[Goal]:
        """Generate sub-goals from high-level goal"""
        sub_goals = []
        goal_lower = high_level_goal.lower()
        
        # Template-based sub-goal generation
        if "performance" in goal_lower:
            sub_goals.extend(await self._create_performance_goals(high_level_goal, analysis))
        elif "maintain" in goal_lower:
            sub_goals.extend(await self._create_maintenance_goals(high_level_goal, analysis))
        elif "learn" in goal_lower or "acquire" in goal_lower:
            sub_goals.extend(await self._create_learning_goals(high_level_goal, analysis))
        elif "optimize" in goal_lower:
            sub_goals.extend(await self._create_optimization_goals(high_level_goal, analysis))
        else:
            sub_goals.extend(await self._create_general_goals(high_level_goal, analysis))
        
        return sub_goals
    
    async def _create_performance_goals(self, high_level_goal: str, 
                                      analysis: Dict[str, Any]) -> List[Goal]:
        """Create performance-related sub-goals"""
        goals = []
        
        # Performance assessment goal
        assess_goal = Goal(
            id=f"assess_current_performance_{int(time.time())}",
            description="Assess current system performance metrics",
            priority=0.9,
            horizon=PlanHorizon.IMMEDIATE,
            resource_requirements={"reasoning": 0.6, "memory": 0.4},
            estimated_duration=30.0,
            success_criteria=["Performance metrics collected", "Bottlenecks identified"]
        )
        goals.append(assess_goal)
        
        # Performance optimization goal
        optimize_goal = Goal(
            id=f"optimize_performance_{int(time.time())}",
            description="Implement performance optimizations",
            priority=0.8,
            horizon=PlanHorizon.MEDIUM_TERM,
            depends_on=[assess_goal.id],
            resource_requirements={"reasoning": 0.8, "execution": 0.7},
            estimated_duration=300.0,
            success_criteria=["Performance improved by >10%", "No regression in other metrics"]
        )
        goals.append(optimize_goal)
        
        # Performance validation goal
        validate_goal = Goal(
            id=f"validate_performance_{int(time.time())}",
            description="Validate performance improvements",
            priority=0.7,
            horizon=PlanHorizon.SHORT_TERM,
            depends_on=[optimize_goal.id],
            resource_requirements={"reasoning": 0.5, "memory": 0.3},
            estimated_duration=120.0,
            success_criteria=["Improvements verified", "Stability confirmed"]
        )
        goals.append(validate_goal)
        
        return goals
    
    async def _create_maintenance_goals(self, high_level_goal: str,
                                      analysis: Dict[str, Any]) -> List[Goal]:
        """Create maintenance-related sub-goals"""
        goals = []
        
        # System health check
        health_goal = Goal(
            id=f"system_health_check_{int(time.time())}",
            description="Perform comprehensive system health check",
            priority=0.8,
            horizon=PlanHorizon.IMMEDIATE,
            resource_requirements={"reasoning": 0.4, "memory": 0.3},
            estimated_duration=60.0,
            success_criteria=["All systems checked", "Issues identified"]
        )
        goals.append(health_goal)
        
        # Issue resolution
        resolve_goal = Goal(
            id=f"resolve_issues_{int(time.time())}",
            description="Resolve identified system issues",
            priority=0.9,
            horizon=PlanHorizon.SHORT_TERM,
            depends_on=[health_goal.id],
            resource_requirements={"reasoning": 0.7, "execution": 0.8},
            estimated_duration=240.0,
            success_criteria=["Critical issues resolved", "System stability restored"]
        )
        goals.append(resolve_goal)
        
        return goals
    
    async def _create_learning_goals(self, high_level_goal: str,
                                   analysis: Dict[str, Any]) -> List[Goal]:
        """Create learning-related sub-goals"""
        goals = []
        
        # Knowledge gap assessment
        assess_goal = Goal(
            id=f"assess_knowledge_gaps_{int(time.time())}",
            description="Identify knowledge gaps and learning opportunities",
            priority=0.7,
            horizon=PlanHorizon.SHORT_TERM,
            resource_requirements={"reasoning": 0.6, "learning": 0.5},
            estimated_duration=180.0,
            success_criteria=["Knowledge gaps identified", "Learning priorities set"]
        )
        goals.append(assess_goal)
        
        # Acquire knowledge
        learn_goal = Goal(
            id=f"acquire_knowledge_{int(time.time())}",
            description="Acquire new knowledge and skills",
            priority=0.8,
            horizon=PlanHorizon.LONG_TERM,
            depends_on=[assess_goal.id],
            resource_requirements={"learning": 0.9, "memory": 0.7},
            estimated_duration=900.0,
            success_criteria=["New knowledge acquired", "Skills improved"]
        )
        goals.append(learn_goal)
        
        # Apply knowledge
        apply_goal = Goal(
            id=f"apply_knowledge_{int(time.time())}",
            description="Apply newly acquired knowledge",
            priority=0.6,
            horizon=PlanHorizon.MEDIUM_TERM,
            depends_on=[learn_goal.id],
            resource_requirements={"execution": 0.6, "reasoning": 0.5},
            estimated_duration=360.0,
            success_criteria=["Knowledge successfully applied", "Positive outcomes achieved"]
        )
        goals.append(apply_goal)
        
        return goals
    
    async def _create_optimization_goals(self, high_level_goal: str,
                                       analysis: Dict[str, Any]) -> List[Goal]:
        """Create optimization-related sub-goals"""
        goals = []
        
        # Identify optimization opportunities
        identify_goal = Goal(
            id=f"identify_optimization_{int(time.time())}",
            description="Identify optimization opportunities",
            priority=0.8,
            horizon=PlanHorizon.SHORT_TERM,
            resource_requirements={"reasoning": 0.8, "memory": 0.5},
            estimated_duration=240.0,
            success_criteria=["Opportunities identified", "Impact assessed"]
        )
        goals.append(identify_goal)
        
        # Implement optimizations
        implement_goal = Goal(
            id=f"implement_optimizations_{int(time.time())}",
            description="Implement identified optimizations",
            priority=0.9,
            horizon=PlanHorizon.MEDIUM_TERM,
            depends_on=[identify_goal.id],
            resource_requirements={"execution": 0.8, "reasoning": 0.6},
            estimated_duration=600.0,
            success_criteria=["Optimizations implemented", "Improvements measured"]
        )
        goals.append(implement_goal)
        
        return goals
    
    async def _create_general_goals(self, high_level_goal: str,
                                  analysis: Dict[str, Any]) -> List[Goal]:
        """Create general sub-goals for unspecified goal types"""
        goals = []
        
        # Planning and analysis
        plan_goal = Goal(
            id=f"plan_execution_{int(time.time())}",
            description=f"Plan execution strategy for: {high_level_goal}",
            priority=0.7,
            horizon=PlanHorizon.SHORT_TERM,
            resource_requirements={"reasoning": 0.6, "memory": 0.4},
            estimated_duration=180.0,
            success_criteria=["Execution plan created", "Resources allocated"]
        )
        goals.append(plan_goal)
        
        # Execute plan
        execute_goal = Goal(
            id=f"execute_plan_{int(time.time())}",
            description=f"Execute plan for: {high_level_goal}",
            priority=0.8,
            horizon=PlanHorizon.MEDIUM_TERM,
            depends_on=[plan_goal.id],
            resource_requirements={"execution": 0.7, "reasoning": 0.5},
            estimated_duration=450.0,
            success_criteria=["Plan executed", "Objectives achieved"]
        )
        goals.append(execute_goal)
        
        return goals
    
    async def _establish_goal_dependencies(self, goals: List[Goal]) -> None:
        """Establish logical dependencies between goals"""
        # Simple heuristic: goals with "assess", "identify" come first
        assessment_goals = [g for g in goals if any(word in g.description.lower() 
                                                   for word in ["assess", "identify", "analyze"])]
        
        execution_goals = [g for g in goals if any(word in g.description.lower() 
                                                  for word in ["implement", "execute", "apply"])]
        
        validation_goals = [g for g in goals if any(word in g.description.lower() 
                                                   for word in ["validate", "verify", "check"])]
        
        # Create dependency chains
        if assessment_goals and execution_goals:
            for exec_goal in execution_goals:
                for assess_goal in assessment_goals:
                    if assess_goal.id not in exec_goal.depends_on:
                        exec_goal.depends_on.append(assess_goal.id)
        
        if execution_goals and validation_goals:
            for val_goal in validation_goals:
                for exec_goal in execution_goals:
                    if exec_goal.id not in val_goal.depends_on:
                        val_goal.depends_on.append(exec_goal.id)
    
    async def _optimize_goal_sequence(self, goals: List[Goal]) -> List[Goal]:
        """Optimize goal execution sequence"""
        # Sort by dependencies and priority
        def goal_sort_key(goal: Goal) -> Tuple[int, float, int]:
            dependency_count = len(goal.depends_on)
            priority = -goal.priority  # Negative for descending sort
            horizon_value = list(PlanHorizon).index(goal.horizon)
            return (dependency_count, priority, horizon_value)
        
        return sorted(goals, key=goal_sort_key)
    
    async def _create_fallback_goals(self, high_level_goal: str) -> List[Goal]:
        """Create simple fallback goals when decomposition fails"""
        fallback_goal = Goal(
            id=f"fallback_{int(time.time())}",
            description=f"Execute fallback approach for: {high_level_goal}",
            priority=0.5,
            horizon=PlanHorizon.MEDIUM_TERM,
            resource_requirements={"execution": 0.5, "reasoning": 0.4},
            estimated_duration=300.0,
            success_criteria=["Fallback approach executed"]
        )
        
        return [fallback_goal]
    
    async def create_execution_plan(self, goals: List[Goal], 
                                  available_resources: Dict[str, float]) -> Dict[str, Any]:
        """
        Create detailed execution plan for goals
        
        Args:
            goals: List of goals to plan execution for
            available_resources: Currently available system resources
            
        Returns:
            Detailed execution plan with scheduling and resource allocation
        """
        try:
            # Filter executable goals (dependencies met)
            executable_goals = await self._get_executable_goals(goals)
            
            # Create resource allocation plan
            resource_plan = await self._create_resource_allocation_plan(
                executable_goals, available_resources
            )
            
            # Generate execution schedule
            schedule = await self._generate_execution_schedule(executable_goals, resource_plan)
            
            # Create monitoring plan
            monitoring_plan = await self._create_monitoring_plan(executable_goals)
            
            execution_plan = {
                "goals": [goal.id for goal in executable_goals],
                "resource_allocation": resource_plan,
                "schedule": schedule,
                "monitoring": monitoring_plan,
                "estimated_completion": await self._estimate_completion_time(executable_goals),
                "success_probability": await self._estimate_success_probability(executable_goals),
                "created_at": datetime.now().isoformat()
            }
            
            logger.info(f"📋 Created execution plan for {len(executable_goals)} goals")
            return execution_plan
            
        except Exception as e:
            logger.error(f"❌ Execution planning failed: {e}")
            return await self._create_fallback_execution_plan(goals)
    
    async def _get_executable_goals(self, goals: List[Goal]) -> List[Goal]:
        """Get goals that can be executed (dependencies satisfied)"""
        executable = []
        
        for goal in goals:
            # Handle both dict and object goal formats
            if isinstance(goal, dict):
                goal_status = goal.get('status', 'pending')
                goal_depends_on = goal.get('depends_on', [])
            else:
                goal_status = getattr(goal, 'status', GoalStatus.PENDING)
                goal_depends_on = getattr(goal, 'depends_on', [])
            
            if goal_status == GoalStatus.PENDING or goal_status == 'pending':
                dependencies_met = all(
                    dep_id in self.completed_goals or 
                    (dep_id in self.active_goals and 
                     self.active_goals[dep_id].status == GoalStatus.COMPLETED)
                    for dep_id in goal_depends_on
                )
                
                if dependencies_met:
                    executable.append(goal)
        
        return executable
    
    async def _create_resource_allocation_plan(self, goals: List[Goal], 
                                             available_resources: Dict[str, float]) -> Dict[str, Any]:
        """Create resource allocation plan for goals"""
        allocation_plan = {
            "total_demand": {},
            "per_goal_allocation": {},
            "feasibility": "feasible"
        }
        
        # Calculate total resource demand
        total_demand = {}
        for goal in goals:
            # Handle both dict and object goal formats
            if isinstance(goal, dict):
                goal_resources = goal.get('resource_requirements', {})
            else:
                goal_resources = getattr(goal, 'resource_requirements', {})
            
            for resource, amount in goal_resources.items():
                total_demand[resource] = total_demand.get(resource, 0) + amount
        
        allocation_plan["total_demand"] = total_demand
        
        # Check feasibility
        for resource, demand in total_demand.items():
            available = available_resources.get(resource, 1.0)
            if demand > available:
                allocation_plan["feasibility"] = "oversubscribed"
                break
        
        # Allocate resources per goal
        for goal in goals:
            # Handle both dict and object goal formats
            if isinstance(goal, dict):
                goal_id = goal.get('id', 'unknown_goal')
                goal_resources = goal.get('resource_requirements', {})
            else:
                goal_id = getattr(goal, 'id', 'unknown_goal')
                goal_resources = getattr(goal, 'resource_requirements', {})
            
            allocation_plan["per_goal_allocation"][goal_id] = goal_resources.copy()
        
        return allocation_plan
    
    async def _generate_execution_schedule(self, goals: List[Goal], 
                                         resource_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Generate execution schedule for goals"""
        schedule = {
            "immediate": [],
            "short_term": [],
            "medium_term": [],
            "long_term": []
        }
        
        # Group goals by time horizon
        for goal in goals:
            # Handle both dict and object goal formats
            if isinstance(goal, dict):
                goal_id = goal.get('id', 'unknown_goal')
                goal_horizon = goal.get('horizon', 'immediate')
                goal_duration = goal.get('estimated_duration', 60.0)
                goal_priority = goal.get('priority', 5)
            else:
                goal_id = getattr(goal, 'id', 'unknown_goal')
                goal_horizon = getattr(goal, 'horizon', 'immediate')
                if hasattr(goal_horizon, 'value'):
                    goal_horizon = goal_horizon.value
                goal_duration = getattr(goal, 'estimated_duration', 60.0)
                goal_priority = getattr(goal, 'priority', 5)
            
            # Normalize horizon to match schedule keys
            if goal_horizon in schedule:
                schedule[goal_horizon].append({
                    "goal_id": goal_id,
                    "estimated_duration": goal_duration,
                    "priority": goal_priority
                })
            else:
                # Default to immediate if horizon not recognized
                schedule["immediate"].append({
                    "goal_id": goal_id,
                    "estimated_duration": goal_duration,
                    "priority": goal_priority
                })
        
        # Sort each horizon by priority (handle both enum and direct values)
        for horizon in schedule:
            def priority_key(x):
                priority = x["priority"]
                if hasattr(priority, 'value'):  # TaskPriority enum
                    return priority.value
                return priority  # Direct numeric value
            schedule[horizon].sort(key=priority_key, reverse=True)
        
        return schedule
    
    async def _create_monitoring_plan(self, goals: List[Goal]) -> Dict[str, Any]:
        """Create monitoring plan for goal execution"""
        monitoring_plan = {
            "check_intervals": {},
            "success_indicators": {},
            "failure_indicators": {},
            "escalation_triggers": []
        }
        
        for goal in goals:
            # Handle both dict and object goal formats
            if isinstance(goal, dict):
                goal_id = goal.get('id', 'unknown_goal')
                goal_duration = goal.get('estimated_duration', 60.0)
                goal_criteria = goal.get('success_criteria', ["Task completed successfully"])
            else:
                goal_id = getattr(goal, 'id', 'unknown_goal')
                goal_duration = getattr(goal, 'estimated_duration', 60.0)
                goal_criteria = getattr(goal, 'success_criteria', ["Task completed successfully"])
            
            monitoring_plan["check_intervals"][goal_id] = min(30.0, goal_duration / 4)
            monitoring_plan["success_indicators"][goal_id] = goal_criteria
            monitoring_plan["failure_indicators"][goal_id] = [
                "No progress for extended period",
                "Resource constraints exceeded",
                "Dependencies failed"
            ]
        
        return monitoring_plan
    
    async def _estimate_completion_time(self, goals: List[Goal]) -> float:
        """Estimate total completion time for goals"""
        if not goals:
            return 0.0
        
        # Simple estimation: sum of durations (assumes sequential execution)
        total_duration = 0.0
        for goal in goals:
            if isinstance(goal, dict):
                goal_duration = goal.get('estimated_duration', 60.0)
            else:
                goal_duration = getattr(goal, 'estimated_duration', 60.0)
            total_duration += goal_duration
        
        # Add buffer for coordination overhead
        overhead_factor = 1.2
        
        return total_duration * overhead_factor
    
    async def _estimate_success_probability(self, goals: List[Goal]) -> float:
        """Estimate probability of successful completion"""
        if not goals:
            return 1.0
        
        # Base success probability per goal
        base_probability = 0.8
        
        # Reduce probability based on complexity
        complexity_penalty = len(goals) * 0.05
        
        # Calculate resource penalty handling both dict and object formats
        resource_penalty = 0.0
        for goal in goals:
            if isinstance(goal, dict):
                goal_resources = goal.get('resource_requirements', {})
            else:
                goal_resources = getattr(goal, 'resource_requirements', {})
            
            resource_penalty += sum(goal_resources.values()) * 0.01
        
        final_probability = max(0.1, base_probability - complexity_penalty - resource_penalty)
        
        return min(1.0, final_probability)
    
    async def _create_fallback_execution_plan(self, goals: List[Goal]) -> Dict[str, Any]:
        """Create simple fallback execution plan"""
        if not goals:
            return {
                "goals": [],
                "resource_allocation": {"execution": 0.0},
                "schedule": {"immediate": []},
                "monitoring": {"check_intervals": {"default": 60.0}},
                "estimated_completion": 0.0,
                "success_probability": 1.0,
                "created_at": datetime.now().isoformat()
            }
        
        # Handle both dict and object goal formats
        first_goal = goals[0]
        if isinstance(first_goal, dict):
            goal_id = first_goal.get('id', 'unknown_goal')
        else:
            goal_id = getattr(first_goal, 'id', 'unknown_goal')
        
        return {
            "goals": [goal_id],  # Execute only first goal
            "resource_allocation": {"execution": 0.5},
            "schedule": {"immediate": [goal_id]},
            "monitoring": {"check_intervals": {"default": 60.0}},
            "estimated_completion": 300.0,
            "success_probability": 0.6,
            "created_at": datetime.now().isoformat()
        }
    
    async def _initialize_default_strategies(self) -> None:
        """Initialize default strategic approaches"""
        # Conservative strategy
        conservative = Strategy(
            id="conservative_default",
            name="Conservative Approach",
            type=StrategyType.CONSERVATIVE,
            description="Low-risk, steady progress strategy",
            goals=[],
            execution_order=[],
            expected_outcome={"risk": "low", "progress_rate": "steady"},
            success_probability=0.85
        )
        self.strategy_library["conservative"] = conservative
        
        # Aggressive strategy
        aggressive = Strategy(
            id="aggressive_default",
            name="Aggressive Approach",
            type=StrategyType.AGGRESSIVE,
            description="High-risk, high-reward strategy",
            goals=[],
            execution_order=[],
            expected_outcome={"risk": "high", "progress_rate": "fast"},
            success_probability=0.6
        )
        self.strategy_library["aggressive"] = aggressive
        
        # Balanced strategy (default active)
        balanced = Strategy(
            id="balanced_default",
            name="Balanced Approach",
            type=StrategyType.BALANCED,
            description="Moderate risk and reward strategy",
            goals=[],
            execution_order=[],
            expected_outcome={"risk": "moderate", "progress_rate": "moderate"},
            success_probability=0.75
        )
        self.strategy_library["balanced"] = balanced
        self.active_strategies["primary"] = balanced
    
    async def adapt_strategy(self, performance_feedback: Dict[str, Any]) -> bool:
        """
        Adapt strategic approach based on performance feedback
        
        Args:
            performance_feedback: Feedback on current strategy performance
            
        Returns:
            True if strategy was adapted, False otherwise
        """
        try:
            current_success_rate = performance_feedback.get("success_rate", 0.5)
            current_efficiency = performance_feedback.get("efficiency", 0.5)
            resource_utilization = performance_feedback.get("resource_utilization", 0.5)
            
            # Decide if adaptation is needed
            adaptation_needed = (
                current_success_rate < 0.6 or
                current_efficiency < 0.5 or
                resource_utilization > 0.9
            )
            
            if not adaptation_needed:
                return False
            
            # Select new strategy based on current performance
            new_strategy_type = await self._select_optimal_strategy(performance_feedback)
            
            if new_strategy_type != self.current_strategy_type:
                await self._switch_strategy(new_strategy_type)
                self.planning_metrics["adaptation_frequency"] += 0.1
                logger.info(f"🔄 Strategy adapted: {self.current_strategy_type.value}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Strategy adaptation failed: {e}")
            return False
    
    async def generate_task_plan(self, goals: List[Goal], 
                               resources: Dict[str, float]) -> Dict[str, Any]:
        """
        Generate a task plan from goals and resources.
        
        This is a convenience method that calls create_execution_plan.
        """
        return await self.create_execution_plan(goals, resources)
    
    async def _select_optimal_strategy(self, performance_feedback: Dict[str, Any]) -> StrategyType:
        """Select optimal strategy based on performance feedback"""
        success_rate = performance_feedback.get("success_rate", 0.5)
        efficiency = performance_feedback.get("efficiency", 0.5)
        time_pressure = performance_feedback.get("time_pressure", 0.5)
        
        # Strategy selection logic
        if success_rate < 0.4:
            return StrategyType.CONSERVATIVE  # Play it safe
        elif time_pressure > 0.8:
            return StrategyType.AGGRESSIVE    # Push harder
        elif efficiency < 0.3:
            return StrategyType.EXPLORATORY   # Learn more
        else:
            return StrategyType.BALANCED      # Stay balanced
    
    async def _switch_strategy(self, new_strategy_type: StrategyType) -> None:
        """Switch to new strategic approach"""
        self.current_strategy_type = new_strategy_type
        
        # Update active strategy
        strategy_key = new_strategy_type.value
        if strategy_key in self.strategy_library:
            self.active_strategies["primary"] = self.strategy_library[strategy_key]
    
    async def get_planning_status(self) -> Dict[str, Any]:
        """Get current planning status"""
        return {
            "active_goals": len(self.active_goals),
            "completed_goals": len(self.completed_goals),
            "failed_goals": len(self.failed_goals),
            "current_strategy": self.current_strategy_type.value,
            "active_strategies": list(self.active_strategies.keys()),
            "planning_metrics": self.planning_metrics.copy(),
            "goal_completion_rate": self._calculate_completion_rate()
        }
    
    def _calculate_completion_rate(self) -> float:
        """Calculate goal completion rate"""
        total_goals = len(self.completed_goals) + len(self.failed_goals)
        if total_goals == 0:
            return 1.0
        
        return len(self.completed_goals) / total_goals