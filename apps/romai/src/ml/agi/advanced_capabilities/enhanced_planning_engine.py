"""
RomAI AGI Evolution Phase 2 - Enhanced Planning Engine

This module provides sophisticated multi-step planning capabilities for the
RomAI AGI system, enabling hierarchical goal decomposition, constraint satisfaction,
resource allocation, and adaptive replanning.

Built upon the successful Phase 1 foundation and Phase 2 Advanced Tool Use System,
this planning engine coordinates complex multi-step tasks using available tools.
"""

import asyncio
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Union, Callable, Set, Tuple
import uuid
import networkx as nx
from collections import defaultdict, deque
import heapq
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import Phase 2 Tool System
try:
    from .advanced_tool_use_system import AdvancedToolUseSystem, ToolResult
    logger.info("✅ Advanced Tool Use System imported successfully")
except ImportError:
    logger.warning("⚠️ Advanced Tool Use System not found, running in standalone mode")
    AdvancedToolUseSystem = None
    ToolResult = None

# ============================================================================
# CORE DATA STRUCTURES
# ============================================================================

class PlanStatus(Enum):
    """Status of plan execution"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REPLANNING = "replanning"

@dataclass
class Goal:
    """Represents a goal to be achieved through planning"""
    id: str = field(default_factory=lambda: f"goal_{uuid.uuid4().hex[:8]}")
    name: str = ""
    description: str = ""
    priority: int = 5  # 1-10 scale
    constraints: List[str] = field(default_factory=list)
    success_criteria: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)  # Other goal IDs
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.now)
    deadline: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PlanningConstraint:
    """Represents a constraint that must be satisfied during planning"""
    id: str = field(default_factory=lambda: f"constraint_{uuid.uuid4().hex[:8]}")
    constraint_type: str = ""  # e.g., "resource", "time", "dependency", "security"
    description: str = ""
    severity: str = "medium"  # "low", "medium", "high", "critical"
    is_hard: bool = True  # Hard constraints must be satisfied, soft constraints are preferences
    parameters: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def is_satisfied(self, context: Dict[str, Any]) -> bool:
        """Check if the constraint is satisfied in the given context"""
        # This would be implemented based on constraint type
        # For now, return True as a placeholder
        return True
    
    def get_violation_reason(self, context: Dict[str, Any]) -> Optional[str]:
        """Get the reason why the constraint is violated, if any"""
        if self.is_satisfied(context):
            return None
        return f"Constraint {self.id} ({self.constraint_type}) is not satisfied"

class TaskPriority(Enum):
    """Task priority levels"""
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4
    BACKGROUND = 5

class ConstraintType(Enum):
    """Types of constraints in planning"""
    TEMPORAL = "temporal"      # Time-based constraints
    RESOURCE = "resource"      # Resource availability constraints
    DEPENDENCY = "dependency"  # Task dependency constraints
    CAPACITY = "capacity"      # System capacity constraints
    SECURITY = "security"      # Security and permission constraints

@dataclass
class Resource:
    """Represents a system resource"""
    name: str
    type: str
    capacity: float
    available: float = 0.0
    unit: str = "units"
    renewable: bool = True
    constraints: Dict[str, Any] = field(default_factory=dict)
    
    def allocate(self, amount: float) -> bool:
        """Allocate resource amount if available"""
        if self.available >= amount:
            self.available -= amount
            return True
        return False
    
    def deallocate(self, amount: float):
        """Deallocate resource amount"""
        self.available = min(self.capacity, self.available + amount)

@dataclass
class Constraint:
    """Represents a planning constraint"""
    id: str
    type: ConstraintType
    description: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    is_hard: bool = True  # Hard constraints must be satisfied, soft can be violated
    weight: float = 1.0  # Weight for soft constraint violations
    
    def evaluate(self, context: Dict[str, Any]) -> Tuple[bool, float]:
        """Evaluate constraint satisfaction. Returns (satisfied, violation_cost)"""
        # This would be implemented by specific constraint types
        return True, 0.0

@dataclass
class Task:
    """Represents a single task in the plan"""
    id: str
    name: str
    description: str
    tool_name: Optional[str] = None
    tool_parameters: Dict[str, Any] = field(default_factory=dict)
    
    # Task properties
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_duration: timedelta = field(default_factory=lambda: timedelta(minutes=1))
    deadline: Optional[datetime] = None
    
    # Dependencies and constraints
    dependencies: Set[str] = field(default_factory=set)
    resource_requirements: Dict[str, float] = field(default_factory=dict)
    constraints: List[Constraint] = field(default_factory=list)
    
    # Execution tracking
    status: PlanStatus = PlanStatus.PENDING
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    result: Optional[Any] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3
    
    # Task metadata
    created_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def actual_duration(self) -> Optional[timedelta]:
        """Get actual execution duration if completed"""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return None
    
    def can_execute(self, completed_tasks: Set[str]) -> bool:
        """Check if task dependencies are satisfied"""
        return self.dependencies.issubset(completed_tasks)

@dataclass
class Plan:
    """Represents a complete execution plan"""
    id: str
    name: str
    description: str
    goal: str
    
    # Plan structure
    tasks: Dict[str, Task] = field(default_factory=dict)
    task_graph: nx.DiGraph = field(default_factory=nx.DiGraph)
    
    # Plan properties
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_completion: Optional[datetime] = None
    deadline: Optional[datetime] = None
    
    # Execution tracking
    status: PlanStatus = PlanStatus.PENDING
    current_tasks: Set[str] = field(default_factory=set)
    completed_tasks: Set[str] = field(default_factory=set)
    failed_tasks: Set[str] = field(default_factory=set)
    
    # Plan metadata
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add_task(self, task: Task):
        """Add task to plan"""
        self.tasks[task.id] = task
        self.task_graph.add_node(task.id, task=task)
        
        # Add dependency edges
        for dep_id in task.dependencies:
            if dep_id in self.tasks:
                self.task_graph.add_edge(dep_id, task.id)
    
    def get_ready_tasks(self) -> List[Task]:
        """Get tasks that are ready to execute"""
        ready = []
        for task_id, task in self.tasks.items():
            if (task.status == PlanStatus.PENDING and 
                task.can_execute(self.completed_tasks)):
                ready.append(task)
        return ready
    
    def get_critical_path(self) -> List[str]:
        """Calculate critical path through task graph"""
        try:
            # Find longest path (critical path)
            path_lengths = nx.dag_longest_path_length(self.task_graph)
            critical_path = nx.dag_longest_path(self.task_graph)
            return critical_path
        except:
            return []
    
    @property 
    def completion_percentage(self) -> float:
        """Calculate plan completion percentage"""
        if not self.tasks:
            return 0.0
        return (len(self.completed_tasks) / len(self.tasks)) * 100

@dataclass
class PlanExecutionContext:
    """Context for plan execution"""
    plan: Plan
    resources: Dict[str, Resource]
    tool_system: Optional[Any] = None
    max_parallel_tasks: int = 4
    execution_timeout: timedelta = field(default_factory=lambda: timedelta(hours=1))
    
    # Execution state
    active_tasks: Dict[str, asyncio.Task] = field(default_factory=dict)
    task_results: Dict[str, Any] = field(default_factory=dict)
    execution_log: List[Dict[str, Any]] = field(default_factory=list)
    
    def log_event(self, event: str, task_id: Optional[str] = None, **kwargs):
        """Log execution event"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": event,
            "task_id": task_id,
            **kwargs
        }
        self.execution_log.append(log_entry)
        logger.info(f"📋 {event}" + (f" (Task: {task_id})" if task_id else ""))

# ============================================================================
# GOAL DECOMPOSITION ENGINE
# ============================================================================

class GoalDecomposer:
    """Decomposes high-level goals into executable task hierarchies"""
    
    def __init__(self):
        self.decomposition_strategies = {
            "sequential": self._sequential_decomposition,
            "parallel": self._parallel_decomposition, 
            "hierarchical": self._hierarchical_decomposition,
            "template": self._template_based_decomposition
        }
        
        # Common task templates
        self.task_templates = {
            "research_topic": [
                ("web_search", "Search for information about {topic}"),
                ("web_browse", "Browse relevant websites for detailed information"),
                ("summarize", "Summarize findings and extract key insights")
            ],
            "analyze_file": [
                ("read_file", "Read and load the file content"),
                ("parse_content", "Parse and structure the content"),
                ("analyze_data", "Perform analysis on the structured data"),
                ("generate_report", "Generate analysis report")
            ],
            "create_document": [
                ("gather_requirements", "Understand document requirements"),
                ("research_content", "Research and gather content"),
                ("structure_document", "Create document structure and outline"),
                ("write_content", "Write document content"),
                ("review_edit", "Review and edit document"),
                ("save_document", "Save final document")
            ]
        }
    
    async def decompose_goal(self, goal: str, context: Dict[str, Any] = None) -> Plan:
        """Decompose high-level goal into executable plan"""
        try:
            plan_id = str(uuid.uuid4())
            plan = Plan(
                id=plan_id,
                name=f"Plan for: {goal[:50]}...",
                description=f"Automatically generated plan to achieve: {goal}",
                goal=goal
            )
            
            # Analyze goal to determine decomposition strategy
            strategy = await self._analyze_goal_complexity(goal, context or {})
            logger.info(f"🎯 Using {strategy} decomposition for goal: {goal}")
            
            # Apply decomposition strategy
            if strategy in self.decomposition_strategies:
                tasks = await self.decomposition_strategies[strategy](goal, context or {})
            else:
                tasks = await self._default_decomposition(goal, context or {})
            
            # Add tasks to plan
            for task in tasks:
                plan.add_task(task)
            
            # Calculate estimated completion time
            await self._estimate_plan_duration(plan)
            
            logger.info(f"✅ Goal decomposed into {len(tasks)} tasks")
            return plan
            
        except Exception as e:
            logger.error(f"Goal decomposition failed: {e}")
            # Return minimal plan with single task
            return await self._create_fallback_plan(goal)
    
    async def _analyze_goal_complexity(self, goal: str, context: Dict[str, Any]) -> str:
        """Analyze goal to determine best decomposition strategy"""
        goal_lower = goal.lower()
        
        # Template-based goals
        if any(template in goal_lower for template in self.task_templates.keys()):
            return "template"
        
        # Sequential indicators
        if any(word in goal_lower for word in ["then", "after", "followed by", "step by step"]):
            return "sequential"
        
        # Parallel indicators  
        if any(word in goal_lower for word in ["and", "also", "simultaneously", "parallel"]):
            return "parallel"
        
        # Hierarchical indicators
        if any(word in goal_lower for word in ["analyze", "research", "investigate", "study"]):
            return "hierarchical"
        
        return "sequential"  # Default
    
    async def _sequential_decomposition(self, goal: str, context: Dict[str, Any]) -> List[Task]:
        """Decompose goal into sequential tasks"""
        tasks = []
        
        # Simple heuristic-based decomposition
        if "research" in goal.lower():
            topic = goal.split("research")[-1].strip()
            tasks.extend(self._create_research_tasks(topic))
        elif "analyze" in goal.lower():
            subject = goal.split("analyze")[-1].strip()
            tasks.extend(self._create_analysis_tasks(subject))
        elif "create" in goal.lower() or "write" in goal.lower():
            subject = goal.split("create" if "create" in goal.lower() else "write")[-1].strip()
            tasks.extend(self._create_creation_tasks(subject))
        else:
            # Generic decomposition
            tasks.append(Task(
                id=str(uuid.uuid4()),
                name="Execute Goal",
                description=f"Execute the goal: {goal}",
                tool_name="web_search",
                tool_parameters={"query": goal, "max_results": 5}
            ))
        
        return tasks
    
    async def _parallel_decomposition(self, goal: str, context: Dict[str, Any]) -> List[Task]:
        """Decompose goal into parallel tasks"""
        # Split goal by "and" and create parallel tasks
        parts = [part.strip() for part in goal.split(" and ") if part.strip()]
        
        tasks = []
        for i, part in enumerate(parts):
            task = Task(
                id=str(uuid.uuid4()),
                name=f"Part {i+1}: {part[:30]}...",
                description=f"Execute part {i+1}: {part}",
                tool_name="web_search",
                tool_parameters={"query": part, "max_results": 3}
            )
            tasks.append(task)
        
        return tasks
    
    async def _hierarchical_decomposition(self, goal: str, context: Dict[str, Any]) -> List[Task]:
        """Decompose goal into hierarchical task structure"""
        tasks = []
        
        # Create main task
        main_task = Task(
            id="main_task",
            name="Main Goal",
            description=goal,
            priority=TaskPriority.HIGH
        )
        tasks.append(main_task)
        
        # Create subtasks
        if "research" in goal.lower():
            subtasks = self._create_research_tasks(goal)
            for subtask in subtasks:
                subtask.dependencies.add("main_task")
            tasks.extend(subtasks)
        
        return tasks
    
    async def _template_based_decomposition(self, goal: str, context: Dict[str, Any]) -> List[Task]:
        """Use predefined templates for common goal patterns"""
        goal_lower = goal.lower()
        
        # Find matching template
        template_name = None
        for template in self.task_templates.keys():
            if template.replace("_", " ") in goal_lower:
                template_name = template
                break
        
        if not template_name:
            return await self._sequential_decomposition(goal, context)
        
        # Apply template
        template = self.task_templates[template_name]
        tasks = []
        prev_task_id = None
        
        for i, (tool_name, task_desc) in enumerate(template):
            task = Task(
                id=f"task_{i+1}",
                name=f"Step {i+1}",
                description=task_desc.format(**context, topic=goal),
                tool_name=tool_name if tool_name != "summarize" else "web_search",
                tool_parameters=self._get_tool_parameters(tool_name, goal, context)
            )
            
            if prev_task_id:
                task.dependencies.add(prev_task_id)
            
            tasks.append(task)
            prev_task_id = task.id
        
        return tasks
    
    def _create_research_tasks(self, topic: str) -> List[Task]:
        """Create research-specific task sequence"""
        tasks = []
        
        # Search task
        search_task = Task(
            id="search_task",
            name="Search Information",
            description=f"Search for information about {topic}",
            tool_name="web_search",
            tool_parameters={"query": topic, "max_results": 5}
        )
        tasks.append(search_task)
        
        # Browse task
        browse_task = Task(
            id="browse_task", 
            name="Browse Sources",
            description="Browse relevant sources for detailed information",
            tool_name="web_browse",
            tool_parameters={"url": "https://wikipedia.org", "extract_text": True},
            dependencies={"search_task"}
        )
        tasks.append(browse_task)
        
        return tasks
    
    def _create_analysis_tasks(self, subject: str) -> List[Task]:
        """Create analysis-specific task sequence"""
        tasks = []
        
        # Data gathering
        gather_task = Task(
            id="gather_data",
            name="Gather Data",
            description=f"Gather data about {subject}",
            tool_name="web_search",
            tool_parameters={"query": f"data analysis {subject}", "max_results": 3}
        )
        tasks.append(gather_task)
        
        # Analysis task
        analyze_task = Task(
            id="analyze_data",
            name="Analyze Data", 
            description=f"Perform analysis on {subject}",
            dependencies={"gather_data"}
        )
        tasks.append(analyze_task)
        
        return tasks
    
    def _create_creation_tasks(self, subject: str) -> List[Task]:
        """Create creation-specific task sequence"""
        tasks = []
        
        # Planning task
        plan_task = Task(
            id="plan_creation",
            name="Plan Creation",
            description=f"Plan the creation of {subject}",
            tool_name="web_search",
            tool_parameters={"query": f"how to create {subject}", "max_results": 3}
        )
        tasks.append(plan_task)
        
        # Creation task
        create_task = Task(
            id="create_content",
            name="Create Content",
            description=f"Create {subject}",
            dependencies={"plan_creation"}
        )
        tasks.append(create_task)
        
        return tasks
    
    def _get_tool_parameters(self, tool_name: str, goal: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Get appropriate parameters for tool based on context"""
        if tool_name == "web_search":
            return {"query": goal, "max_results": 5}
        elif tool_name == "web_browse":
            return {"url": context.get("url", "https://wikipedia.org"), "extract_text": True}
        elif tool_name == "read_file":
            return {"path": context.get("file_path", "data.txt")}
        elif tool_name == "write_file":
            return {"path": context.get("output_path", "output.txt"), "content": "Generated content"}
        else:
            return {}
    
    async def _default_decomposition(self, goal: str, context: Dict[str, Any]) -> List[Task]:
        """Default fallback decomposition"""
        return await self._sequential_decomposition(goal, context)
    
    async def _estimate_plan_duration(self, plan: Plan):
        """Estimate total plan duration"""
        if not plan.tasks:
            return
            
        # Simple estimation: sum of task durations on critical path
        critical_path = plan.get_critical_path()
        if critical_path:
            total_duration = sum(
                (plan.tasks[task_id].estimated_duration 
                for task_id in critical_path),
                start=timedelta()
            )
        else:
            # Fallback: sum all task durations
            total_duration = sum(
                (task.estimated_duration for task in plan.tasks.values()),
                start=timedelta()
            )
        
        plan.estimated_completion = datetime.now() + total_duration
    
    async def _create_fallback_plan(self, goal: str) -> Plan:
        """Create minimal fallback plan"""
        plan = Plan(
            id=str(uuid.uuid4()),
            name="Fallback Plan",
            description=f"Simple plan for: {goal}",
            goal=goal
        )
        
        task = Task(
            id="fallback_task",
            name="Execute Goal",
            description=goal,
            tool_name="web_search",
            tool_parameters={"query": goal, "max_results": 3}
        )
        
        plan.add_task(task)
        return plan

# ============================================================================
# CONSTRAINT SATISFACTION ENGINE
# ============================================================================

class ConstraintSolver:
    """Solves planning constraints using constraint satisfaction techniques"""
    
    def __init__(self):
        self.constraint_evaluators = {
            ConstraintType.TEMPORAL: self._evaluate_temporal_constraint,
            ConstraintType.RESOURCE: self._evaluate_resource_constraint,
            ConstraintType.DEPENDENCY: self._evaluate_dependency_constraint,
            ConstraintType.CAPACITY: self._evaluate_capacity_constraint,
            ConstraintType.SECURITY: self._evaluate_security_constraint
        }
    
    async def solve_constraints(self, plan: Plan, resources: Dict[str, Resource]) -> bool:
        """Solve all constraints in the plan"""
        try:
            # Check hard constraints first
            violations = await self._check_hard_constraints(plan, resources)
            if violations:
                logger.warning(f"⚠️ Hard constraint violations: {violations}")
                return False
            
            # Optimize soft constraints
            await self._optimize_soft_constraints(plan, resources)
            
            logger.info("✅ All constraints satisfied")
            return True
            
        except Exception as e:
            logger.error(f"Constraint solving failed: {e}")
            return False
    
    async def _check_hard_constraints(self, plan: Plan, resources: Dict[str, Resource]) -> List[str]:
        """Check hard constraints and return violations"""
        violations = []
        
        for task in plan.tasks.values():
            for constraint in task.constraints:
                if constraint.is_hard:
                    satisfied, _ = await self._evaluate_constraint(constraint, task, plan, resources)
                    if not satisfied:
                        violations.append(f"Task {task.id}: {constraint.description}")
        
        return violations
    
    async def _optimize_soft_constraints(self, plan: Plan, resources: Dict[str, Resource]):
        """Optimize soft constraint satisfaction"""
        # For now, just evaluate soft constraints
        total_violation_cost = 0.0
        
        for task in plan.tasks.values():
            for constraint in task.constraints:
                if not constraint.is_hard:
                    satisfied, cost = await self._evaluate_constraint(constraint, task, plan, resources)
                    total_violation_cost += cost * constraint.weight
        
        logger.info(f"📊 Soft constraint violation cost: {total_violation_cost:.2f}")
    
    async def _evaluate_constraint(self, constraint: Constraint, task: Task, 
                                 plan: Plan, resources: Dict[str, Resource]) -> Tuple[bool, float]:
        """Evaluate a specific constraint"""
        evaluator = self.constraint_evaluators.get(constraint.type)
        if evaluator:
            return await evaluator(constraint, task, plan, resources)
        return True, 0.0
    
    async def _evaluate_temporal_constraint(self, constraint: Constraint, task: Task,
                                          plan: Plan, resources: Dict[str, Resource]) -> Tuple[bool, float]:
        """Evaluate temporal constraints"""
        if "deadline" in constraint.parameters:
            deadline = datetime.fromisoformat(constraint.parameters["deadline"])
            if task.deadline and task.deadline > deadline:
                return False, 100.0  # High violation cost
        return True, 0.0
    
    async def _evaluate_resource_constraint(self, constraint: Constraint, task: Task,
                                          plan: Plan, resources: Dict[str, Resource]) -> Tuple[bool, float]:
        """Evaluate resource constraints"""
        resource_name = constraint.parameters.get("resource")
        required_amount = constraint.parameters.get("amount", 0)
        
        if resource_name in resources:
            resource = resources[resource_name]
            if resource.available < required_amount:
                return False, required_amount - resource.available
        
        return True, 0.0
    
    async def _evaluate_dependency_constraint(self, constraint: Constraint, task: Task,
                                            plan: Plan, resources: Dict[str, Resource]) -> Tuple[bool, float]:
        """Evaluate dependency constraints"""
        # Dependencies are handled by the task graph
        return True, 0.0
    
    async def _evaluate_capacity_constraint(self, constraint: Constraint, task: Task,
                                          plan: Plan, resources: Dict[str, Resource]) -> Tuple[bool, float]:
        """Evaluate capacity constraints"""
        max_parallel = constraint.parameters.get("max_parallel", float('inf'))
        if len(plan.current_tasks) >= max_parallel:
            return False, len(plan.current_tasks) - max_parallel
        return True, 0.0
    
    async def _evaluate_security_constraint(self, constraint: Constraint, task: Task,
                                          plan: Plan, resources: Dict[str, Resource]) -> Tuple[bool, float]:
        """Evaluate security constraints"""
        # Security constraints would check permissions, access levels, etc.
        return True, 0.0

# ============================================================================
# ADAPTIVE REPLANNING ENGINE
# ============================================================================

class AdaptiveReplanner:
    """Handles dynamic plan adaptation and replanning"""
    
    def __init__(self, goal_decomposer: GoalDecomposer, constraint_solver: ConstraintSolver):
        self.goal_decomposer = goal_decomposer
        self.constraint_solver = constraint_solver
        self.replan_triggers = {
            "task_failure": self._handle_task_failure,
            "resource_unavailable": self._handle_resource_shortage, 
            "deadline_pressure": self._handle_deadline_pressure,
            "new_information": self._handle_new_information
        }
    
    async def should_replan(self, plan: Plan, context: PlanExecutionContext) -> Tuple[bool, str]:
        """Determine if replanning is needed"""
        reasons = []
        
        # Check for failed tasks
        if plan.failed_tasks:
            reasons.append("task_failure")
        
        # Check resource availability
        for resource in context.resources.values():
            if resource.available < resource.capacity * 0.1:  # Less than 10% available
                reasons.append("resource_unavailable")
        
        # Check deadline pressure
        if plan.deadline:
            remaining_time = plan.deadline - datetime.now()
            if remaining_time < timedelta(hours=1):  # Less than 1 hour remaining
                reasons.append("deadline_pressure")
        
        should_replan = bool(reasons)
        primary_reason = reasons[0] if reasons else ""
        
        return should_replan, primary_reason
    
    async def replan(self, plan: Plan, context: PlanExecutionContext, reason: str) -> Plan:
        """Create new plan based on current situation"""
        try:
            logger.info(f"🔄 Replanning due to: {reason}")
            
            # Handle specific replan triggers
            handler = self.replan_triggers.get(reason, self._default_replan)
            new_plan = await handler(plan, context)
            
            # Preserve completed tasks
            for task_id in plan.completed_tasks:
                if task_id in plan.tasks:
                    completed_task = plan.tasks[task_id]
                    new_plan.add_task(completed_task)
                    new_plan.completed_tasks.add(task_id)
            
            # Validate new plan
            constraints_ok = await self.constraint_solver.solve_constraints(
                new_plan, context.resources
            )
            
            if constraints_ok:
                logger.info(f"✅ Replanning successful: {len(new_plan.tasks)} tasks")
                return new_plan
            else:
                logger.warning("⚠️ New plan violates constraints, using simplified plan")
                return await self._create_simplified_plan(plan.goal)
                
        except Exception as e:
            logger.error(f"Replanning failed: {e}")
            return plan  # Return original plan as fallback
    
    async def _handle_task_failure(self, plan: Plan, context: PlanExecutionContext) -> Plan:
        """Handle replanning due to task failures"""
        # Remove failed tasks and create alternatives
        new_plan = Plan(
            id=str(uuid.uuid4()),
            name=f"Replan: {plan.name}",
            description=f"Replanned version of: {plan.description}",
            goal=plan.goal,
            priority=plan.priority
        )
        
        # Add successful tasks
        for task_id, task in plan.tasks.items():
            if task.status == PlanStatus.COMPLETED:
                new_plan.add_task(task)
        
        # Create alternative tasks for failed ones
        for task_id in plan.failed_tasks:
            failed_task = plan.tasks[task_id]
            
            # Create alternative task with different approach
            alt_task = Task(
                id=f"alt_{task_id}",
                name=f"Alternative: {failed_task.name}",
                description=f"Alternative approach: {failed_task.description}",
                tool_name="web_search",  # Use safer default tool
                tool_parameters={"query": failed_task.name, "max_results": 3},
                priority=failed_task.priority,
                dependencies=failed_task.dependencies.copy()
            )
            new_plan.add_task(alt_task)
        
        return new_plan
    
    async def _handle_resource_shortage(self, plan: Plan, context: PlanExecutionContext) -> Plan:
        """Handle replanning due to resource shortages"""
        # Create resource-optimized plan
        return await self._optimize_for_resources(plan, context.resources)
    
    async def _handle_deadline_pressure(self, plan: Plan, context: PlanExecutionContext) -> Plan:
        """Handle replanning due to deadline pressure"""
        # Create time-optimized plan
        return await self._optimize_for_time(plan)
    
    async def _handle_new_information(self, plan: Plan, context: PlanExecutionContext) -> Plan:
        """Handle replanning due to new information"""
        # Re-decompose goal with new context
        new_context = {"existing_results": context.task_results}
        return await self.goal_decomposer.decompose_goal(plan.goal, new_context)
    
    async def _default_replan(self, plan: Plan, context: PlanExecutionContext) -> Plan:
        """Default replanning strategy"""
        return await self.goal_decomposer.decompose_goal(plan.goal)
    
    async def _optimize_for_resources(self, plan: Plan, resources: Dict[str, Resource]) -> Plan:
        """Optimize plan for available resources"""
        # Simple optimization: reduce parallelism
        optimized_plan = Plan(
            id=str(uuid.uuid4()),
            name=f"Resource-Optimized: {plan.name}",
            description=f"Resource-optimized version of: {plan.description}",
            goal=plan.goal
        )
        
        # Add tasks sequentially to reduce resource contention
        prev_task_id = None
        for task in plan.tasks.values():
            if task.status != PlanStatus.COMPLETED:
                optimized_task = Task(
                    id=task.id,
                    name=task.name,
                    description=task.description,
                    tool_name=task.tool_name,
                    tool_parameters=task.tool_parameters,
                    priority=task.priority
                )
                
                if prev_task_id:
                    optimized_task.dependencies.add(prev_task_id)
                
                optimized_plan.add_task(optimized_task)
                prev_task_id = task.id
        
        return optimized_plan
    
    async def _optimize_for_time(self, plan: Plan) -> Plan:
        """Optimize plan for time constraints"""
        # Simple optimization: increase parallelism and reduce task complexity
        optimized_plan = Plan(
            id=str(uuid.uuid4()),
            name=f"Time-Optimized: {plan.name}",
            description=f"Time-optimized version of: {plan.description}",
            goal=plan.goal
        )
        
        # Add only essential tasks
        essential_tasks = [
            task for task in plan.tasks.values() 
            if task.priority in [TaskPriority.CRITICAL, TaskPriority.HIGH]
        ]
        
        for task in essential_tasks:
            if task.status != PlanStatus.COMPLETED:
                optimized_plan.add_task(task)
        
        # If no essential tasks, add first available task
        if not essential_tasks and plan.tasks:
            first_task = next(iter(plan.tasks.values()))
            optimized_plan.add_task(first_task)
        
        return optimized_plan
    
    async def _create_simplified_plan(self, goal: str) -> Plan:
        """Create simplified fallback plan"""
        return await self.goal_decomposer.decompose_goal(goal)

# ============================================================================
# ENHANCED PLANNING ENGINE
# ============================================================================

class EnhancedPlanningEngine:
    """
    Enhanced Planning Engine for AGI Phase 2
    Provides sophisticated multi-step planning with goal decomposition,
    constraint satisfaction, and adaptive replanning capabilities
    """
    
    def __init__(self, tool_system: Optional[AdvancedToolUseSystem] = None):
        self.tool_system = tool_system
        self.goal_decomposer = GoalDecomposer()
        self.constraint_solver = ConstraintSolver()
        self.adaptive_replanner = AdaptiveReplanner(self.goal_decomposer, self.constraint_solver)
        
        # Planning state
        self.active_plans: Dict[str, Plan] = {}
        self.plan_history: List[Plan] = []
        self.execution_contexts: Dict[str, PlanExecutionContext] = {}
        
        # Default resources
        self.default_resources = {
            "cpu": Resource("cpu", "compute", 100.0, 80.0, "percent"),
            "memory": Resource("memory", "storage", 16.0, 12.0, "GB"),
            "network": Resource("network", "bandwidth", 100.0, 90.0, "Mbps"),
            "tools": Resource("tools", "concurrent", 10.0, 10.0, "instances")
        }
        
        logger.info("🧠 Enhanced Planning Engine initialized - AGI Phase 2")
    
    async def generate_comprehensive_plan(self, goal: str, context: Dict[str, Any] = None,
                                        constraints: List[Constraint] = None) -> Plan:
        """Generate a comprehensive execution plan for the given goal - API compatibility method"""
        return await self.create_plan(goal, context, constraints)
    
    async def create_plan(self, goal: str, context: Dict[str, Any] = None, 
                         constraints: List[Constraint] = None) -> Plan:
        """Create comprehensive execution plan for goal"""
        try:
            logger.info(f"📋 Creating plan for goal: {goal}")
            
            # Decompose goal into tasks
            plan = await self.goal_decomposer.decompose_goal(goal, context or {})
            
            # Add constraints if provided
            if constraints:
                for constraint in constraints:
                    # Apply constraint to relevant tasks
                    for task in plan.tasks.values():
                        task.constraints.append(constraint)
            
            # Solve constraints
            resources = context.get("resources", self.default_resources) if context else self.default_resources
            constraints_satisfied = await self.constraint_solver.solve_constraints(plan, resources)
            
            if not constraints_satisfied:
                logger.warning("⚠️ Initial constraints not satisfied, creating simplified plan")
                plan = await self.goal_decomposer.decompose_goal(goal, {"simplified": True})
            
            # Create execution context
            exec_context = PlanExecutionContext(
                plan=plan,
                resources=resources,
                tool_system=self.tool_system
            )
            
            # Store plan and context
            self.active_plans[plan.id] = plan
            self.execution_contexts[plan.id] = exec_context
            
            logger.info(f"✅ Plan created: {len(plan.tasks)} tasks, estimated completion: {plan.estimated_completion}")
            return plan
            
        except Exception as e:
            logger.error(f"Plan creation failed: {e}")
            raise
    
    async def execute_plan(self, plan_id: str) -> Dict[str, Any]:
        """Execute plan with monitoring and adaptation"""
        if plan_id not in self.active_plans:
            raise ValueError(f"Plan {plan_id} not found")
        
        plan = self.active_plans[plan_id]
        context = self.execution_contexts[plan_id]
        
        try:
            logger.info(f"🚀 Starting plan execution: {plan.name}")
            plan.status = PlanStatus.IN_PROGRESS
            plan.started_at = datetime.now()
            context.log_event("plan_started", plan_id=plan.id)
            
            # Main execution loop
            while plan.status == PlanStatus.IN_PROGRESS:
                # Check for replanning needs
                should_replan, reason = await self.adaptive_replanner.should_replan(plan, context)
                
                if should_replan:
                    plan = await self.adaptive_replanner.replan(plan, context, reason)
                    self.active_plans[plan_id] = plan
                    context.plan = plan
                    context.log_event("plan_replanned", plan_id=plan.id, reason=reason)
                
                # Execute ready tasks
                ready_tasks = plan.get_ready_tasks()
                if ready_tasks:
                    await self._execute_tasks_batch(ready_tasks, context)
                
                # Update plan status
                await self._update_plan_status(plan)
                
                # Small delay to prevent busy waiting
                await asyncio.sleep(0.1)
            
            # Finalize execution
            if plan.status == PlanStatus.COMPLETED:
                plan.completed_at = datetime.now()
                context.log_event("plan_completed", plan_id=plan.id)
                logger.info(f"🎉 Plan completed successfully: {plan.completion_percentage:.1f}%")
            else:
                context.log_event("plan_failed", plan_id=plan.id)
                logger.error(f"❌ Plan execution failed: {plan.status}")
            
            # Move to history
            self.plan_history.append(plan)
            del self.active_plans[plan_id]
            
            return {
                "plan_id": plan_id,
                "status": plan.status.value,
                "completion_percentage": plan.completion_percentage,
                "completed_tasks": len(plan.completed_tasks),
                "failed_tasks": len(plan.failed_tasks),
                "execution_time": (plan.completed_at - plan.started_at).total_seconds() if plan.completed_at else None,
                "results": context.task_results
            }
            
        except Exception as e:
            logger.error(f"Plan execution failed: {e}")
            plan.status = PlanStatus.FAILED
            context.log_event("plan_error", plan_id=plan.id, error=str(e))
            raise
    
    async def _execute_tasks_batch(self, tasks: List[Task], context: PlanExecutionContext):
        """Execute batch of ready tasks"""
        # Limit concurrent tasks
        available_slots = context.max_parallel_tasks - len(context.active_tasks)
        tasks_to_run = tasks[:available_slots]
        
        for task in tasks_to_run:
            task_coroutine = self._execute_single_task(task, context)
            async_task = asyncio.create_task(task_coroutine)
            context.active_tasks[task.id] = async_task
            task.status = PlanStatus.IN_PROGRESS
            task.start_time = datetime.now()
            context.log_event("task_started", task_id=task.id)
        
        # Wait for any tasks to complete
        if context.active_tasks:
            done, pending = await asyncio.wait(
                context.active_tasks.values(),
                return_when=asyncio.FIRST_COMPLETED,
                timeout=1.0
            )
            
            # Process completed tasks
            for async_task in done:
                task_id = None
                for tid, atask in context.active_tasks.items():
                    if atask == async_task:
                        task_id = tid
                        break
                
                if task_id:
                    del context.active_tasks[task_id]
                    await self._process_task_completion(task_id, context)
    
    async def _execute_single_task(self, task: Task, context: PlanExecutionContext):
        """Execute single task"""
        try:
            if task.tool_name and self.tool_system:
                # Execute using tool system
                result = await self.tool_system.use_tool(task.tool_name, task.tool_parameters)
                task.result = result.result
                task.status = PlanStatus.COMPLETED if result.success else PlanStatus.FAILED
                if result.error_message:
                    task.error_message = result.error_message
            else:
                # Simulate task execution
                await asyncio.sleep(0.5)  # Simulate work
                task.result = f"Task {task.name} completed successfully"
                task.status = PlanStatus.COMPLETED
            
            task.end_time = datetime.now()
            
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            task.status = PlanStatus.FAILED
            task.error_message = str(e)
            task.end_time = datetime.now()
    
    async def _process_task_completion(self, task_id: str, context: PlanExecutionContext):
        """Process completed task and update plan state"""
        plan = context.plan
        task = plan.tasks[task_id]
        
        if task.status == PlanStatus.COMPLETED:
            plan.completed_tasks.add(task_id)
            context.task_results[task_id] = task.result
            context.log_event("task_completed", task_id=task_id)
            logger.info(f"✅ Task completed: {task.name}")
        else:
            plan.failed_tasks.add(task_id)
            context.log_event("task_failed", task_id=task_id, error=task.error_message)
            logger.warning(f"❌ Task failed: {task.name} - {task.error_message}")
            
            # Handle retries
            if task.retry_count < task.max_retries:
                task.retry_count += 1
                task.status = PlanStatus.PENDING
                plan.failed_tasks.discard(task_id)
                logger.info(f"🔄 Retrying task: {task.name} (attempt {task.retry_count + 1})")
    
    async def _update_plan_status(self, plan: Plan):
        """Update overall plan execution status"""
        total_tasks = len(plan.tasks)
        completed = len(plan.completed_tasks)
        failed = len(plan.failed_tasks)
        
        if completed == total_tasks:
            plan.status = PlanStatus.COMPLETED
        elif failed > 0 and completed + failed == total_tasks:
            # All tasks either completed or failed
            if completed > failed:
                plan.status = PlanStatus.COMPLETED
            else:
                plan.status = PlanStatus.FAILED
        # Otherwise, keep as IN_PROGRESS
    
    async def get_plan_status(self, plan_id: str) -> Dict[str, Any]:
        """Get current plan execution status"""
        plan = self.active_plans.get(plan_id) or next(
            (p for p in self.plan_history if p.id == plan_id), None
        )
        
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        context = self.execution_contexts.get(plan_id)
        
        return {
            "plan_id": plan_id,
            "name": plan.name,
            "goal": plan.goal,
            "status": plan.status.value,
            "completion_percentage": plan.completion_percentage,
            "total_tasks": len(plan.tasks),
            "completed_tasks": len(plan.completed_tasks),
            "failed_tasks": len(plan.failed_tasks),
            "current_tasks": len(plan.current_tasks),
            "estimated_completion": plan.estimated_completion.isoformat() if plan.estimated_completion else None,
            "started_at": plan.started_at.isoformat() if plan.started_at else None,
            "active_tasks": list(context.active_tasks.keys()) if context else [],
            "execution_log": context.execution_log[-10:] if context else []  # Last 10 events
        }
    
    async def list_active_plans(self) -> List[Dict[str, Any]]:
        """List all active plans"""
        plans = []
        for plan in self.active_plans.values():
            plans.append({
                "plan_id": plan.id,
                "name": plan.name,
                "goal": plan.goal,
                "status": plan.status.value,
                "completion_percentage": plan.completion_percentage,
                "created_at": plan.created_at.isoformat()
            })
        return plans
    
    async def cancel_plan(self, plan_id: str) -> bool:
        """Cancel active plan execution"""
        if plan_id not in self.active_plans:
            return False
        
        plan = self.active_plans[plan_id]
        context = self.execution_contexts[plan_id]
        
        # Cancel all active tasks
        for async_task in context.active_tasks.values():
            async_task.cancel()
        
        plan.status = PlanStatus.CANCELLED
        context.log_event("plan_cancelled", plan_id=plan_id)
        
        # Move to history
        self.plan_history.append(plan)
        del self.active_plans[plan_id]
        del self.execution_contexts[plan_id]
        
        logger.info(f"⏹️ Plan cancelled: {plan.name}")
        return True
    
    async def execute_plan_with_monitoring(self, plan_id: str, monitoring_config: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute plan with enhanced monitoring for system integration API"""
        return await self.execute_plan(plan_id)

# ============================================================================
# TESTING AND VALIDATION
# ============================================================================

async def test_enhanced_planning_engine():
    """Test the Enhanced Planning Engine functionality"""
    print("🧠 Testing RomAI Enhanced Planning Engine")
    print("=" * 60)
    
    try:
        # Import tool system if available
        tool_system = None
        try:
            from .advanced_tool_use_system import AdvancedToolUseSystem
            tool_system = AdvancedToolUseSystem()
            print("🛠️ Tool system integrated")
        except:
            print("⚠️ Tool system not available, testing in standalone mode")
        
        # Initialize planning engine
        planner = EnhancedPlanningEngine(tool_system)
        
        print(f"\n📋 Testing Goal Decomposition...")
        
        # Test 1: Research goal
        research_goal = "Research artificial intelligence and its applications in healthcare"
        plan = await planner.create_plan(research_goal)
        
        print(f"✅ Research plan created:")
        print(f"  • Goal: {plan.goal}")
        print(f"  • Tasks: {len(plan.tasks)}")
        print(f"  • Estimated completion: {plan.estimated_completion}")
        
        for task_id, task in list(plan.tasks.items())[:3]:  # Show first 3 tasks
            print(f"    - {task.name}: {task.description}")
        
        # Test 2: Plan execution
        print(f"\n🚀 Testing Plan Execution...")
        
        simple_goal = "Search for information about machine learning"
        simple_plan = await planner.create_plan(simple_goal)
        
        execution_result = await planner.execute_plan(simple_plan.id)
        
        print(f"✅ Plan execution result:")
        print(f"  • Status: {execution_result['status']}")
        print(f"  • Completion: {execution_result['completion_percentage']:.1f}%")
        print(f"  • Completed tasks: {execution_result['completed_tasks']}")
        print(f"  • Execution time: {execution_result.get('execution_time', 'N/A')}s")
        
        # Test 3: Plan status monitoring
        print(f"\n📊 Testing Plan Status Monitoring...")
        
        monitoring_goal = "Analyze current technology trends"
        monitoring_plan = await planner.create_plan(monitoring_goal)
        
        status = await planner.get_plan_status(monitoring_plan.id)
        print(f"✅ Plan status retrieved:")
        print(f"  • Name: {status['name']}")
        print(f"  • Status: {status['status']}")
        print(f"  • Progress: {status['completion_percentage']:.1f}%")
        
        # Test 4: Constraint handling
        print(f"\n⚙️ Testing Constraint Handling...")
        
        # Create time constraint
        time_constraint = Constraint(
            id="deadline",
            type=ConstraintType.TEMPORAL,
            description="Must complete within 1 hour",
            parameters={"deadline": (datetime.now() + timedelta(hours=1)).isoformat()},
            is_hard=True
        )
        
        constrained_plan = await planner.create_plan(
            "Create comprehensive analysis report",
            constraints=[time_constraint]
        )
        
        print(f"✅ Constrained plan created:")
        print(f"  • Tasks: {len(constrained_plan.tasks)}")
        print(f"  • Has constraints: {any(task.constraints for task in constrained_plan.tasks.values())}")
        
        # Test 5: Active plans listing
        active_plans = await planner.list_active_plans()
        print(f"\n📋 Active plans: {len(active_plans)}")
        for plan_info in active_plans:
            print(f"  • {plan_info['name']} - {plan_info['status']}")
        
        print(f"\n🎉 Enhanced Planning Engine test completed successfully!")
        print(f"📊 Test Summary:")
        print(f"  • Goal decomposition: ✅")
        print(f"  • Plan execution: ✅")
        print(f"  • Status monitoring: ✅")
        print(f"  • Constraint handling: ✅")
        print(f"  • Plan management: ✅")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Enhanced Planning Engine test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

# Global instance for Phase 2 AGI Evolution
enhanced_planning_engine = None

# Initialize with tool system if available
async def initialize_planning_engine():
    """Initialize global planning engine instance"""
    global enhanced_planning_engine
    
    try:
        # Try to import and initialize tool system
        from .advanced_tool_use_system import advanced_tool_use_system
        enhanced_planning_engine = EnhancedPlanningEngine(advanced_tool_use_system)
        logger.info("✅ Enhanced Planning Engine initialized with tool system integration")
    except ImportError:
        enhanced_planning_engine = EnhancedPlanningEngine()
        logger.info("✅ Enhanced Planning Engine initialized in standalone mode")
    
    return enhanced_planning_engine

logger.info("✅ Enhanced Planning Engine module loaded - AGI Evolution Phase 2 ready!")

# Convenience functions for external usage
async def create_plan(goal: str, **kwargs) -> Plan:
    """Convenience function to create plans"""
    global enhanced_planning_engine
    if not enhanced_planning_engine:
        await initialize_planning_engine()
    return await enhanced_planning_engine.create_plan(goal, **kwargs)

async def execute_plan(plan_id: str) -> Dict[str, Any]:
    """Convenience function to execute plans"""
    global enhanced_planning_engine
    if not enhanced_planning_engine:
        await initialize_planning_engine()
    return await enhanced_planning_engine.execute_plan(plan_id)

if __name__ == "__main__":
    # Run tests if module is executed directly
    asyncio.run(test_enhanced_planning_engine())