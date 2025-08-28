"""
ROMAI Meta-Cognitive Awareness Module
====================================

Advanced meta-cognitive system for ROMAI AGI.
Handles self-awareness, reflection, strategic thinking about thinking,
and monitoring of cognitive processes.

Author: ROMAI AGI Team
Date: 2025-01-17
Version: 1.0.0
"""

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple, Union, Callable
import json
import statistics
from collections import deque, defaultdict


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CognitiveProcessType(Enum):
    """Types of cognitive processes to monitor."""
    REASONING = "reasoning"
    PROBLEM_SOLVING = "problem_solving"
    LEARNING = "learning"
    MEMORY_RETRIEVAL = "memory_retrieval"
    PATTERN_RECOGNITION = "pattern_recognition"
    DECISION_MAKING = "decision_making"
    PLANNING = "planning"
    EVALUATION = "evaluation"


class MetaCognitiveStrategy(Enum):
    """Meta-cognitive strategies."""
    MONITOR_PROGRESS = "monitor_progress"
    EVALUATE_UNDERSTANDING = "evaluate_understanding"
    PLAN_APPROACH = "plan_approach"
    ALLOCATE_RESOURCES = "allocate_resources"
    ADJUST_STRATEGY = "adjust_strategy"
    SEEK_HELP = "seek_help"
    VERIFY_SOLUTION = "verify_solution"
    REFLECT_ON_PROCESS = "reflect_on_process"


class ConfidenceLevel(Enum):
    """Levels of confidence in cognitive processes."""
    VERY_LOW = "very_low"      # 0.0-0.2
    LOW = "low"                # 0.2-0.4
    MODERATE = "moderate"      # 0.4-0.6
    HIGH = "high"              # 0.6-0.8
    VERY_HIGH = "very_high"    # 0.8-1.0


class CognitiveState(Enum):
    """States of cognitive processing."""
    IDLE = "idle"
    FOCUSED = "focused"
    EXPLORING = "exploring"
    CONFUSED = "confused"
    STUCK = "stuck"
    CONFIDENT = "confident"
    UNCERTAIN = "uncertain"
    OVERLOADED = "overloaded"


@dataclass
class CognitiveMonitor:
    """Monitors a specific cognitive process."""
    process_type: CognitiveProcessType
    process_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    input_data: Dict[str, Any] = field(default_factory=dict)
    output_data: Dict[str, Any] = field(default_factory=dict)
    intermediate_states: List[Dict[str, Any]] = field(default_factory=list)
    resource_usage: Dict[str, float] = field(default_factory=dict)
    confidence_trajectory: List[float] = field(default_factory=list)
    errors_encountered: List[str] = field(default_factory=list)
    strategies_applied: List[MetaCognitiveStrategy] = field(default_factory=list)
    monitor_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    
    def add_state(self, state: Dict[str, Any]):
        """Add an intermediate state."""
        state["timestamp"] = datetime.now()
        self.intermediate_states.append(state)
    
    def add_confidence(self, confidence: float):
        """Add a confidence measurement."""
        self.confidence_trajectory.append(max(0.0, min(1.0, confidence)))
    
    def add_error(self, error: str):
        """Add an error encountered."""
        self.errors_encountered.append(f"{datetime.now().isoformat()}: {error}")
    
    def get_duration(self) -> Optional[float]:
        """Get the duration of the process in seconds."""
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return (datetime.now() - self.start_time).total_seconds()
    
    def get_average_confidence(self) -> float:
        """Get average confidence during the process."""
        if not self.confidence_trajectory:
            return 0.5
        return statistics.mean(self.confidence_trajectory)


@dataclass
class MetaCognitiveReflection:
    """Represents a meta-cognitive reflection on a process or decision."""
    reflection_id: str
    target_process_id: str
    reflection_type: str  # 'process_review', 'strategy_evaluation', 'learning_assessment'
    insights: List[str]
    improvements_identified: List[str]
    confidence_in_reflection: float
    action_items: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        if not self.reflection_id:
            self.reflection_id = str(uuid.uuid4())[:8]


@dataclass
class CognitiveGoal:
    """Represents a cognitive goal with meta-cognitive tracking."""
    goal_id: str
    description: str
    goal_type: str  # 'performance', 'understanding', 'efficiency', 'accuracy'
    target_metrics: Dict[str, float]
    current_metrics: Dict[str, float] = field(default_factory=dict)
    strategies_to_achieve: List[MetaCognitiveStrategy] = field(default_factory=list)
    progress: float = 0.0
    status: str = "active"  # 'active', 'achieved', 'abandoned'
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        if not self.goal_id:
            self.goal_id = str(uuid.uuid4())[:8]
    
    def update_progress(self):
        """Update progress based on current vs target metrics."""
        if not self.target_metrics:
            return
        
        progress_scores = []
        for metric, target in self.target_metrics.items():
            current = self.current_metrics.get(metric, 0.0)
            if target > 0:
                progress_scores.append(min(current / target, 1.0))
            else:
                progress_scores.append(1.0 if current == target else 0.0)
        
        self.progress = statistics.mean(progress_scores) if progress_scores else 0.0
        
        if self.progress >= 0.95:
            self.status = "achieved"


@dataclass
class StrategicPlan:
    """Represents a strategic plan for achieving cognitive goals."""
    plan_id: str
    goal_ids: List[str]
    planned_strategies: List[Tuple[MetaCognitiveStrategy, Dict[str, Any]]]
    execution_order: List[str]
    resource_allocation: Dict[str, float]
    expected_outcomes: Dict[str, Any]
    contingency_plans: Dict[str, List[str]] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        if not self.plan_id:
            self.plan_id = str(uuid.uuid4())[:8]


class MetaCognitiveAwarenessSystem:
    """
    Advanced meta-cognitive awareness system for ROMAI AGI.
    
    Provides capabilities for:
    - Monitoring cognitive processes in real-time
    - Self-reflection and process evaluation
    - Strategic planning for cognitive goals
    - Adaptive strategy selection
    - Confidence tracking and uncertainty management
    - Learning from cognitive experiences
    """
    
    def __init__(self):
        """Initialize the meta-cognitive awareness system."""
        self.active_monitors: Dict[str, CognitiveMonitor] = {}
        self.completed_monitors: Dict[str, CognitiveMonitor] = {}
        self.reflections: Dict[str, MetaCognitiveReflection] = {}
        self.cognitive_goals: Dict[str, CognitiveGoal] = {}
        self.strategic_plans: Dict[str, StrategicPlan] = {}
        
        # Cognitive state tracking
        self.current_state = CognitiveState.IDLE
        self.state_history = deque(maxlen=100)
        self.resource_monitors = {
            "attention": 1.0,
            "working_memory": 1.0,
            "processing_speed": 1.0,
            "confidence": 0.5
        }
        
        # Performance statistics
        self.performance_stats = {
            "total_processes_monitored": 0,
            "successful_processes": 0,
            "reflections_generated": 0,
            "goals_achieved": 0,
            "strategy_adjustments_made": 0,
            "average_confidence": 0.5,
            "start_time": time.time()
        }
        
        # Initialize meta-cognitive knowledge base
        self._initialize_metacognitive_knowledge()
        
        logger.info("🧠 Meta-Cognitive Awareness System initialized - Ready for self-reflection!")
    
    def _initialize_metacognitive_knowledge(self):
        """Initialize meta-cognitive knowledge and patterns."""
        self.strategy_effectiveness = {
            MetaCognitiveStrategy.MONITOR_PROGRESS: {"success_rate": 0.8, "resource_cost": 0.2},
            MetaCognitiveStrategy.EVALUATE_UNDERSTANDING: {"success_rate": 0.7, "resource_cost": 0.3},
            MetaCognitiveStrategy.PLAN_APPROACH: {"success_rate": 0.9, "resource_cost": 0.4},
            MetaCognitiveStrategy.ALLOCATE_RESOURCES: {"success_rate": 0.8, "resource_cost": 0.2},
            MetaCognitiveStrategy.ADJUST_STRATEGY: {"success_rate": 0.6, "resource_cost": 0.3},
            MetaCognitiveStrategy.SEEK_HELP: {"success_rate": 0.9, "resource_cost": 0.1},
            MetaCognitiveStrategy.VERIFY_SOLUTION: {"success_rate": 0.8, "resource_cost": 0.3},
            MetaCognitiveStrategy.REFLECT_ON_PROCESS: {"success_rate": 0.7, "resource_cost": 0.4}
        }
        
        self.cognitive_patterns = {
            "confidence_decline": {
                "description": "Confidence decreases over time during process",
                "indicators": ["declining_confidence_trajectory", "increasing_errors"],
                "recommended_strategies": [MetaCognitiveStrategy.ADJUST_STRATEGY, MetaCognitiveStrategy.SEEK_HELP]
            },
            "resource_overload": {
                "description": "Cognitive resources are being overused",
                "indicators": ["high_resource_usage", "decreased_performance"],
                "recommended_strategies": [MetaCognitiveStrategy.ALLOCATE_RESOURCES, MetaCognitiveStrategy.PLAN_APPROACH]
            },
            "stuck_pattern": {
                "description": "Process is not making progress",
                "indicators": ["no_intermediate_states", "long_duration"],
                "recommended_strategies": [MetaCognitiveStrategy.ADJUST_STRATEGY, MetaCognitiveStrategy.REFLECT_ON_PROCESS]
            }
        }
    
    async def start_monitoring(
        self,
        process_type: CognitiveProcessType,
        process_id: str,
        input_data: Optional[Dict[str, Any]] = None
    ) -> CognitiveMonitor:
        """
        Start monitoring a cognitive process.
        
        Args:
            process_type: Type of cognitive process
            process_id: Unique identifier for the process
            input_data: Initial input data for the process
            
        Returns:
            CognitiveMonitor for the process
        """
        logger.info(f"🔍 Starting monitoring for {process_type.value} process: {process_id}")
        
        monitor = CognitiveMonitor(
            process_type=process_type,
            process_id=process_id,
            start_time=datetime.now(),
            input_data=input_data or {}
        )
        
        self.active_monitors[process_id] = monitor
        self.performance_stats["total_processes_monitored"] += 1
        
        # Update cognitive state
        await self._update_cognitive_state()
        
        return monitor
    
    async def update_monitoring(
        self,
        process_id: str,
        state_data: Optional[Dict[str, Any]] = None,
        confidence: Optional[float] = None,
        resource_usage: Optional[Dict[str, float]] = None,
        error: Optional[str] = None
    ):
        """
        Update monitoring information for a process.
        
        Args:
            process_id: Process to update
            state_data: Current state information
            confidence: Current confidence level
            resource_usage: Current resource usage
            error: Any error encountered
        """
        if process_id not in self.active_monitors:
            logger.warning(f"Process {process_id} not found in active monitors")
            return
        
        monitor = self.active_monitors[process_id]
        
        # Update state
        if state_data:
            monitor.add_state(state_data)
        
        # Update confidence
        if confidence is not None:
            monitor.add_confidence(confidence)
        
        # Update resource usage
        if resource_usage:
            monitor.resource_usage.update(resource_usage)
        
        # Add error
        if error:
            monitor.add_error(error)
        
        # Check for patterns and recommend strategies
        await self._check_cognitive_patterns(monitor)
        
        # Update global cognitive state
        await self._update_cognitive_state()
    
    async def complete_monitoring(
        self,
        process_id: str,
        output_data: Optional[Dict[str, Any]] = None,
        success: bool = True
    ) -> CognitiveMonitor:
        """
        Complete monitoring for a process.
        
        Args:
            process_id: Process to complete
            output_data: Final output data
            success: Whether the process was successful
            
        Returns:
            Completed CognitiveMonitor
        """
        if process_id not in self.active_monitors:
            logger.warning(f"Process {process_id} not found in active monitors")
            return None
        
        monitor = self.active_monitors.pop(process_id)
        monitor.end_time = datetime.now()
        monitor.output_data = output_data or {}
        
        # Store completed monitor
        self.completed_monitors[process_id] = monitor
        
        # Update statistics
        if success:
            self.performance_stats["successful_processes"] += 1
        
        # Update average confidence
        avg_confidence = monitor.get_average_confidence()
        self._update_average_confidence(avg_confidence)
        
        # Trigger reflection on the completed process
        await self._generate_process_reflection(monitor, success)
        
        # Update cognitive state
        await self._update_cognitive_state()
        
        duration = monitor.get_duration()
        logger.info(f"✅ Completed monitoring for {process_id} ({duration:.2f}s, avg confidence: {avg_confidence:.2f})")
        
        return monitor
    
    async def _check_cognitive_patterns(self, monitor: CognitiveMonitor):
        """Check for cognitive patterns and recommend strategies."""
        # Check confidence decline pattern
        if len(monitor.confidence_trajectory) >= 3:
            recent_confidence = monitor.confidence_trajectory[-3:]
            if all(recent_confidence[i] > recent_confidence[i+1] for i in range(len(recent_confidence)-1)):
                await self._apply_pattern_response("confidence_decline", monitor)
        
        # Check resource overload pattern
        total_resource_usage = sum(monitor.resource_usage.values())
        if total_resource_usage > 3.0:  # Threshold for overload
            await self._apply_pattern_response("resource_overload", monitor)
        
        # Check stuck pattern
        duration = monitor.get_duration()
        if duration > 60 and len(monitor.intermediate_states) < 2:  # Stuck for > 1 minute with minimal progress
            await self._apply_pattern_response("stuck_pattern", monitor)
    
    async def _apply_pattern_response(self, pattern_name: str, monitor: CognitiveMonitor):
        """Apply response to a detected cognitive pattern."""
        if pattern_name not in self.cognitive_patterns:
            return
        
        pattern = self.cognitive_patterns[pattern_name]
        recommended_strategies = pattern["recommended_strategies"]
        
        logger.info(f"🚨 Detected pattern '{pattern_name}' in process {monitor.process_id}")
        logger.info(f"   Recommended strategies: {[s.value for s in recommended_strategies]}")
        
        # Apply the most effective strategy
        best_strategy = max(recommended_strategies, 
                          key=lambda s: self.strategy_effectiveness[s]["success_rate"])
        
        await self._apply_metacognitive_strategy(best_strategy, monitor)
        monitor.strategies_applied.append(best_strategy)
        self.performance_stats["strategy_adjustments_made"] += 1
    
    async def _apply_metacognitive_strategy(
        self, 
        strategy: MetaCognitiveStrategy, 
        monitor: CognitiveMonitor
    ):
        """Apply a meta-cognitive strategy to a process."""
        logger.info(f"🎯 Applying strategy: {strategy.value} to process {monitor.process_id}")
        
        if strategy == MetaCognitiveStrategy.MONITOR_PROGRESS:
            # Increase monitoring frequency
            monitor.add_state({"strategy_applied": "increased_monitoring"})
        
        elif strategy == MetaCognitiveStrategy.EVALUATE_UNDERSTANDING:
            # Assess current understanding
            avg_confidence = monitor.get_average_confidence()
            monitor.add_state({
                "strategy_applied": "understanding_evaluation",
                "current_understanding": avg_confidence
            })
        
        elif strategy == MetaCognitiveStrategy.ALLOCATE_RESOURCES:
            # Redistribute cognitive resources
            self._reallocate_resources(monitor)
            monitor.add_state({"strategy_applied": "resource_reallocation"})
        
        elif strategy == MetaCognitiveStrategy.ADJUST_STRATEGY:
            # Signal need for strategy adjustment
            monitor.add_state({
                "strategy_applied": "strategy_adjustment_recommended",
                "current_performance": monitor.get_average_confidence()
            })
        
        elif strategy == MetaCognitiveStrategy.REFLECT_ON_PROCESS:
            # Generate immediate reflection
            reflection = await self._generate_immediate_reflection(monitor)
            monitor.add_state({
                "strategy_applied": "process_reflection",
                "reflection_id": reflection.reflection_id
            })
    
    def _reallocate_resources(self, monitor: CognitiveMonitor):
        """Reallocate cognitive resources based on process needs."""
        # Simple resource reallocation strategy
        if monitor.process_type == CognitiveProcessType.REASONING:
            self.resource_monitors["attention"] = min(1.0, self.resource_monitors["attention"] + 0.1)
        elif monitor.process_type == CognitiveProcessType.LEARNING:
            self.resource_monitors["working_memory"] = min(1.0, self.resource_monitors["working_memory"] + 0.1)
        elif monitor.process_type == CognitiveProcessType.PROBLEM_SOLVING:
            self.resource_monitors["processing_speed"] = min(1.0, self.resource_monitors["processing_speed"] + 0.1)
    
    async def _generate_immediate_reflection(self, monitor: CognitiveMonitor) -> MetaCognitiveReflection:
        """Generate an immediate reflection on a process."""
        insights = []
        improvements = []
        
        # Analyze confidence trajectory
        if monitor.confidence_trajectory:
            avg_conf = statistics.mean(monitor.confidence_trajectory)
            if avg_conf < 0.4:
                insights.append("Process showing low confidence - may need strategy adjustment")
                improvements.append("Consider breaking down the problem into smaller steps")
        
        # Analyze errors
        if monitor.errors_encountered:
            insights.append(f"Process encountered {len(monitor.errors_encountered)} errors")
            improvements.append("Review error patterns and adjust approach")
        
        # Analyze duration
        duration = monitor.get_duration()
        if duration > 30:  # Long-running process
            insights.append("Process taking longer than expected")
            improvements.append("Consider time management strategies")
        
        reflection = MetaCognitiveReflection(
            reflection_id=str(uuid.uuid4())[:8],
            target_process_id=monitor.process_id,
            reflection_type="immediate_process_review",
            insights=insights or ["Process proceeding normally"],
            improvements_identified=improvements,
            confidence_in_reflection=0.7
        )
        
        self.reflections[reflection.reflection_id] = reflection
        return reflection
    
    async def _generate_process_reflection(self, monitor: CognitiveMonitor, success: bool):
        """Generate a comprehensive reflection on a completed process."""
        insights = []
        improvements = []
        action_items = []
        
        # Analyze overall performance
        duration = monitor.get_duration()
        avg_confidence = monitor.get_average_confidence()
        
        if success:
            insights.append(f"Process completed successfully in {duration:.1f}s with {avg_confidence:.2f} avg confidence")
        else:
            insights.append(f"Process failed after {duration:.1f}s with {avg_confidence:.2f} avg confidence")
            improvements.append("Analyze failure causes and improve strategy selection")
        
        # Analyze confidence patterns
        if monitor.confidence_trajectory:
            if len(set(monitor.confidence_trajectory)) == 1:
                insights.append("Confidence remained stable throughout process")
            elif monitor.confidence_trajectory[-1] > monitor.confidence_trajectory[0]:
                insights.append("Confidence improved during process - good learning occurred")
            else:
                insights.append("Confidence declined during process - strategy may need adjustment")
                improvements.append("Identify confidence decline triggers")
        
        # Analyze strategy effectiveness
        if monitor.strategies_applied:
            insights.append(f"Applied {len(monitor.strategies_applied)} meta-cognitive strategies")
            for strategy in set(monitor.strategies_applied):
                effectiveness = self.strategy_effectiveness[strategy]["success_rate"]
                action_items.append(f"Review effectiveness of {strategy.value} strategy (current: {effectiveness:.2f})")
        
        # Analyze resource usage
        if monitor.resource_usage:
            total_resources = sum(monitor.resource_usage.values())
            if total_resources > 2.0:
                improvements.append("Optimize resource usage for similar future processes")
        
        reflection = MetaCognitiveReflection(
            reflection_id=str(uuid.uuid4())[:8],
            target_process_id=monitor.process_id,
            reflection_type="process_completion_review",
            insights=insights,
            improvements_identified=improvements,
            confidence_in_reflection=0.8,
            action_items=action_items
        )
        
        self.reflections[reflection.reflection_id] = reflection
        self.performance_stats["reflections_generated"] += 1
        
        logger.info(f"📝 Generated reflection for process {monitor.process_id}: {len(insights)} insights, {len(improvements)} improvements")
    
    async def _update_cognitive_state(self):
        """Update the current cognitive state based on active processes."""
        if not self.active_monitors:
            new_state = CognitiveState.IDLE
        else:
            # Determine state based on active processes
            total_confidence = 0.0
            total_processes = 0
            has_errors = False
            
            for monitor in self.active_monitors.values():
                if monitor.confidence_trajectory:
                    total_confidence += monitor.confidence_trajectory[-1]
                    total_processes += 1
                if monitor.errors_encountered:
                    has_errors = True
            
            avg_confidence = total_confidence / max(total_processes, 1)
            
            if has_errors:
                new_state = CognitiveState.CONFUSED
            elif avg_confidence > 0.8:
                new_state = CognitiveState.CONFIDENT
            elif avg_confidence < 0.3:
                new_state = CognitiveState.UNCERTAIN
            elif len(self.active_monitors) > 3:
                new_state = CognitiveState.OVERLOADED
            else:
                new_state = CognitiveState.FOCUSED
        
        if new_state != self.current_state:
            self.state_history.append((self.current_state, datetime.now()))
            self.current_state = new_state
            logger.debug(f"🧠 Cognitive state changed to: {new_state.value}")
    
    def _update_average_confidence(self, new_confidence: float):
        """Update the running average confidence."""
        current_avg = self.performance_stats["average_confidence"]
        total_processes = self.performance_stats["total_processes_monitored"]
        
        # Weighted average
        self.performance_stats["average_confidence"] = (
            (current_avg * (total_processes - 1) + new_confidence) / total_processes
        )
    
    async def create_cognitive_goal(
        self,
        description: str,
        goal_type: str,
        target_metrics: Dict[str, float],
        strategies: Optional[List[MetaCognitiveStrategy]] = None
    ) -> CognitiveGoal:
        """
        Create a new cognitive goal.
        
        Args:
            description: Description of the goal
            goal_type: Type of goal (performance, understanding, efficiency, accuracy)
            target_metrics: Target metrics to achieve
            strategies: Strategies to use for achieving the goal
            
        Returns:
            Created CognitiveGoal
        """
        logger.info(f"🎯 Creating cognitive goal: {description}")
        
        goal = CognitiveGoal(
            goal_id=str(uuid.uuid4())[:8],
            description=description,
            goal_type=goal_type,
            target_metrics=target_metrics,
            strategies_to_achieve=strategies or []
        )
        
        self.cognitive_goals[goal.goal_id] = goal
        
        logger.info(f"✅ Created cognitive goal: {goal.goal_id}")
        return goal
    
    async def update_goal_progress(self, goal_id: str, current_metrics: Dict[str, float]):
        """Update progress on a cognitive goal."""
        if goal_id not in self.cognitive_goals:
            logger.warning(f"Goal {goal_id} not found")
            return
        
        goal = self.cognitive_goals[goal_id]
        goal.current_metrics.update(current_metrics)
        goal.update_progress()
        
        if goal.status == "achieved" and goal.status != "achieved":  # Newly achieved
            self.performance_stats["goals_achieved"] += 1
            logger.info(f"🎉 Goal achieved: {goal.description}")
    
    async def generate_strategic_plan(
        self,
        goal_ids: List[str],
        resource_constraints: Optional[Dict[str, float]] = None
    ) -> StrategicPlan:
        """
        Generate a strategic plan for achieving cognitive goals.
        
        Args:
            goal_ids: Goals to include in the plan
            resource_constraints: Available resource constraints
            
        Returns:
            Generated StrategicPlan
        """
        logger.info(f"📋 Generating strategic plan for {len(goal_ids)} goals")
        
        # Analyze goals
        goals = [self.cognitive_goals[gid] for gid in goal_ids if gid in self.cognitive_goals]
        
        # Plan strategies
        planned_strategies = []
        for goal in goals:
            for strategy in goal.strategies_to_achieve:
                strategy_data = {
                    "goal_id": goal.goal_id,
                    "expected_effectiveness": self.strategy_effectiveness[strategy]["success_rate"],
                    "resource_cost": self.strategy_effectiveness[strategy]["resource_cost"]
                }
                planned_strategies.append((strategy, strategy_data))
        
        # Optimize execution order
        execution_order = self._optimize_strategy_order(planned_strategies, resource_constraints)
        
        # Allocate resources
        resource_allocation = self._allocate_plan_resources(planned_strategies, resource_constraints)
        
        # Generate expected outcomes
        expected_outcomes = await self._predict_plan_outcomes(goals, planned_strategies)
        
        plan = StrategicPlan(
            plan_id=str(uuid.uuid4())[:8],
            goal_ids=goal_ids,
            planned_strategies=planned_strategies,
            execution_order=execution_order,
            resource_allocation=resource_allocation,
            expected_outcomes=expected_outcomes
        )
        
        self.strategic_plans[plan.plan_id] = plan
        
        logger.info(f"✅ Generated strategic plan: {plan.plan_id}")
        logger.info(f"   Strategies: {len(planned_strategies)}, Expected success: {expected_outcomes.get('success_probability', 0.5):.2f}")
        
        return plan
    
    def _optimize_strategy_order(
        self,
        strategies: List[Tuple[MetaCognitiveStrategy, Dict[str, Any]]],
        constraints: Optional[Dict[str, float]]
    ) -> List[str]:
        """Optimize the execution order of strategies."""
        # Simple optimization: sort by effectiveness/cost ratio
        strategy_scores = []
        for strategy, data in strategies:
            effectiveness = data["expected_effectiveness"]
            cost = data["resource_cost"]
            score = effectiveness / max(cost, 0.1)
            strategy_scores.append((strategy.value, score))
        
        # Sort by score (descending)
        strategy_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [name for name, score in strategy_scores]
    
    def _allocate_plan_resources(
        self,
        strategies: List[Tuple[MetaCognitiveStrategy, Dict[str, Any]]],
        constraints: Optional[Dict[str, float]]
    ) -> Dict[str, float]:
        """Allocate resources for plan execution."""
        total_cost = sum(data["resource_cost"] for _, data in strategies)
        
        allocation = {
            "attention": min(total_cost * 0.4, 1.0),
            "working_memory": min(total_cost * 0.3, 1.0),
            "processing_speed": min(total_cost * 0.3, 1.0)
        }
        
        # Apply constraints if provided
        if constraints:
            for resource, limit in constraints.items():
                if resource in allocation:
                    allocation[resource] = min(allocation[resource], limit)
        
        return allocation
    
    async def _predict_plan_outcomes(
        self,
        goals: List[CognitiveGoal],
        strategies: List[Tuple[MetaCognitiveStrategy, Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """Predict the outcomes of executing a strategic plan."""
        # Simple outcome prediction
        average_effectiveness = statistics.mean([
            data["expected_effectiveness"] for _, data in strategies
        ]) if strategies else 0.5
        
        success_probability = min(average_effectiveness * 1.1, 1.0)
        
        expected_metrics = {}
        for goal in goals:
            for metric, target in goal.target_metrics.items():
                expected_value = target * success_probability
                expected_metrics[f"{goal.goal_id}_{metric}"] = expected_value
        
        return {
            "success_probability": success_probability,
            "expected_completion_time": len(strategies) * 30,  # 30 seconds per strategy
            "expected_metrics": expected_metrics,
            "confidence": average_effectiveness
        }
    
    def get_cognitive_state_summary(self) -> Dict[str, Any]:
        """Get a summary of the current cognitive state."""
        return {
            "current_state": self.current_state.value,
            "active_processes": len(self.active_monitors),
            "resource_levels": self.resource_monitors.copy(),
            "recent_state_changes": [
                {"state": state.value, "timestamp": ts.isoformat()}
                for state, ts in list(self.state_history)[-5:]
            ]
        }
    
    def get_process_analytics(self) -> Dict[str, Any]:
        """Get analytics on cognitive processes."""
        all_monitors = list(self.completed_monitors.values()) + list(self.active_monitors.values())
        
        if not all_monitors:
            return {"message": "No processes to analyze"}
        
        # Process type distribution
        type_counts = defaultdict(int)
        for monitor in all_monitors:
            type_counts[monitor.process_type.value] += 1
        
        # Average metrics
        durations = [m.get_duration() for m in self.completed_monitors.values() if m.get_duration()]
        confidences = []
        for monitor in all_monitors:
            if monitor.confidence_trajectory:
                confidences.extend(monitor.confidence_trajectory)
        
        return {
            "total_processes": len(all_monitors),
            "completed_processes": len(self.completed_monitors),
            "active_processes": len(self.active_monitors),
            "process_type_distribution": dict(type_counts),
            "average_duration": statistics.mean(durations) if durations else 0.0,
            "average_confidence": statistics.mean(confidences) if confidences else 0.0,
            "success_rate": (
                self.performance_stats["successful_processes"] / 
                max(len(self.completed_monitors), 1)
            )
        }
    
    def get_system_statistics(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        current_time = time.time()
        uptime = current_time - self.performance_stats["start_time"]
        
        return {
            **self.performance_stats,
            "uptime_seconds": uptime,
            "current_state": self.current_state.value,
            "active_monitors": len(self.active_monitors),
            "completed_monitors": len(self.completed_monitors),
            "reflections_stored": len(self.reflections),
            "goals_active": len([g for g in self.cognitive_goals.values() if g.status == "active"]),
            "strategic_plans": len(self.strategic_plans),
            "processes_per_minute": (
                self.performance_stats["total_processes_monitored"] / max(uptime / 60, 1)
            )
        }


async def main():
    """Demonstrate the meta-cognitive awareness system."""
    logger.info("🧪 Testing ROMAI Meta-Cognitive Awareness System")
    logger.info("=" * 50)
    
    # Initialize system
    system = MetaCognitiveAwarenessSystem()
    
    # Test process monitoring
    logger.info("Testing process monitoring...")
    monitor = await system.start_monitoring(
        CognitiveProcessType.PROBLEM_SOLVING,
        "test_problem_1",
        {"problem": "Find the optimal path through a maze"}
    )
    
    # Simulate process updates
    await system.update_monitoring("test_problem_1", 
                                 {"step": "analyzing_maze"}, 
                                 confidence=0.8)
    
    await system.update_monitoring("test_problem_1", 
                                 {"step": "exploring_paths"}, 
                                 confidence=0.6)
    
    await system.update_monitoring("test_problem_1", 
                                 {"step": "optimizing_solution"}, 
                                 confidence=0.9)
    
    # Complete monitoring
    completed_monitor = await system.complete_monitoring(
        "test_problem_1",
        {"solution": "optimal_path_found"},
        success=True
    )
    
    # Test goal creation
    logger.info("Testing cognitive goals...")
    goal = await system.create_cognitive_goal(
        "Improve problem-solving efficiency",
        "performance",
        {"average_time": 30.0, "success_rate": 0.9},
        [MetaCognitiveStrategy.PLAN_APPROACH, MetaCognitiveStrategy.MONITOR_PROGRESS]
    )
    
    # Update goal progress
    await system.update_goal_progress(goal.goal_id, {"average_time": 25.0, "success_rate": 0.85})
    
    # Generate strategic plan
    logger.info("Testing strategic planning...")
    plan = await system.generate_strategic_plan([goal.goal_id])
    
    # Show results
    state_summary = system.get_cognitive_state_summary()
    analytics = system.get_process_analytics()
    stats = system.get_system_statistics()
    
    logger.info("\n📊 Meta-Cognitive Results:")
    logger.info(f"   Current state: {state_summary['current_state']}")
    logger.info(f"   Process completed: {completed_monitor.process_id} ({completed_monitor.get_duration():.1f}s)")
    logger.info(f"   Average confidence: {completed_monitor.get_average_confidence():.2f}")
    logger.info(f"   Strategies applied: {len(completed_monitor.strategies_applied)}")
    logger.info(f"   Goal progress: {goal.progress:.2f}")
    logger.info(f"   Strategic plan: {len(plan.planned_strategies)} strategies")
    
    logger.info("\n📊 System Statistics:")
    logger.info(f"   Total processes: {stats['total_processes_monitored']}")
    logger.info(f"   Success rate: {stats['successful_processes']}/{stats['total_processes_monitored']}")
    logger.info(f"   Reflections generated: {stats['reflections_generated']}")
    logger.info(f"   Strategy adjustments: {stats['strategy_adjustments_made']}")
    
    logger.info("\n✅ Meta-Cognitive Awareness System test completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())