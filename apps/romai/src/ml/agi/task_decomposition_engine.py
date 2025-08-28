"""
Task Decomposition Engine - Phase 1 AGI Evolution
Hierarchical task planning and execution system
"""

import logging
import asyncio
import time
from typing import Dict, List, Any, Optional, Set, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
import networkx as nx
import uuid

logger = logging.getLogger(__name__)

class TaskComplexity(Enum):
    """Task complexity levels"""
    TRIVIAL = 1      # Single operation, <1 second
    SIMPLE = 2       # Few operations, <5 seconds  
    MODERATE = 3     # Multiple steps, <30 seconds
    COMPLEX = 4      # Many steps, <5 minutes
    VERY_COMPLEX = 5 # Extensive planning, >5 minutes

class DecompositionStrategy(Enum):
    """Task decomposition strategies"""
    SEQUENTIAL = "sequential"          # Steps must be done in order
    PARALLEL = "parallel"             # Steps can be done simultaneously  
    HIERARCHICAL = "hierarchical"     # Nested sub-tasks
    CONDITIONAL = "conditional"       # If-then branches
    ITERATIVE = "iterative"          # Repeating patterns
    ADAPTIVE = "adaptive"            # Dynamic based on results

@dataclass
class TaskNode:
    """Individual task node in decomposition tree"""
    id: str
    name: str
    description: str
    complexity: TaskComplexity
    estimated_time: float
    prerequisites: Set[str] = field(default_factory=set)
    resources_required: Dict[str, Any] = field(default_factory=dict)
    input_requirements: Dict[str, Any] = field(default_factory=dict)
    output_specifications: Dict[str, Any] = field(default_factory=dict)
    success_criteria: List[str] = field(default_factory=list)
    failure_conditions: List[str] = field(default_factory=list)
    retry_policy: Dict[str, Any] = field(default_factory=dict)
    
    # Execution state
    status: str = "pending"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    result: Any = None
    error: Optional[str] = None
    attempts: int = 0
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    created_by: str = "task_decomposition_engine"
    priority: int = 5
    
@dataclass
class DecompositionPlan:
    """Complete task decomposition plan"""
    id: str
    original_task: str
    strategy: DecompositionStrategy
    complexity: TaskComplexity
    total_estimated_time: float
    nodes: Dict[str, TaskNode]
    dependencies: nx.DiGraph
    execution_order: List[str]
    
    # Execution tracking
    status: str = "created"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    success_rate: float = 0.0
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    
class TaskDecompositionEngine:
    """
    Task Decomposition Engine - Phase 1 AGI Evolution
    
    This engine breaks down complex tasks into manageable components:
    1. Analyzes task complexity and requirements
    2. Generates hierarchical decomposition plans
    3. Creates dependency graphs for execution
    4. Manages resource allocation and scheduling
    5. Provides adaptive re-planning capabilities
    """
    
    def __init__(self):
        # Decomposition patterns and templates
        self.decomposition_patterns = self._load_decomposition_patterns()
        self.task_templates = self._load_task_templates()
        
        # Active plans and execution state
        self.active_plans = {}
        self.completed_plans = []
        self.execution_history = []
        
        # Performance metrics
        self.metrics = {
            'plans_created': 0,
            'plans_executed': 0,
            'success_rate': 0.0,
            'average_decomposition_time': 0.0,
            'average_execution_time': 0.0,
            'pattern_effectiveness': {},
            'complexity_distribution': {complexity: 0 for complexity in TaskComplexity}
        }
        
        # Learning system for pattern optimization
        self.pattern_success_rates = {}
        self.adaptation_history = []
        
        logger.info("🧩 Task Decomposition Engine initialized - Phase 1 AGI Evolution")
    
    def _load_decomposition_patterns(self) -> Dict[str, Dict]:
        """Load predefined decomposition patterns"""
        return {
            'mathematical_solving': {
                'strategy': DecompositionStrategy.SEQUENTIAL,
                'steps': [
                    'parse_problem',
                    'identify_mathematical_domain',
                    'select_solution_method',
                    'execute_calculations',
                    'verify_result',
                    'format_response'
                ],
                'complexity_factors': ['equation_type', 'variable_count', 'operation_complexity']
            },
            
            'logical_reasoning': {
                'strategy': DecompositionStrategy.HIERARCHICAL,
                'steps': [
                    'extract_premises',
                    'identify_logical_structure',
                    'apply_inference_rules',
                    'check_validity',
                    'generate_conclusion'
                ],
                'complexity_factors': ['premise_count', 'logical_operators', 'nested_statements']
            },
            
            'creative_generation': {
                'strategy': DecompositionStrategy.ITERATIVE,
                'steps': [
                    'understand_creative_goal',
                    'brainstorm_concepts',
                    'evaluate_ideas',
                    'refine_best_concepts',
                    'generate_final_output'
                ],
                'complexity_factors': ['creativity_scope', 'constraints', 'originality_requirements']
            },
            
            'multi_modal_analysis': {
                'strategy': DecompositionStrategy.PARALLEL,
                'steps': [
                    'analyze_text_content',
                    'process_numerical_data',
                    'extract_logical_structure',
                    'identify_cultural_context',
                    'synthesize_insights'
                ],
                'complexity_factors': ['modal_count', 'interaction_complexity', 'synthesis_requirements']
            },
            
            'autonomous_planning': {
                'strategy': DecompositionStrategy.ADAPTIVE,
                'steps': [
                    'analyze_current_state',
                    'define_goal_state',
                    'generate_action_space',
                    'plan_action_sequence',
                    'execute_with_monitoring',
                    'adapt_based_on_results'
                ],
                'complexity_factors': ['state_space_size', 'goal_complexity', 'uncertainty_level']
            }
        }
    
    def _load_task_templates(self) -> Dict[str, Dict]:
        """Load task templates for common operations"""
        return {
            'parse_input': {
                'complexity': TaskComplexity.SIMPLE,
                'estimated_time': 2.0,
                'resources': ['text_processor'],
                'success_criteria': ['input_successfully_parsed', 'data_structure_created']
            },
            
            'mathematical_computation': {
                'complexity': TaskComplexity.MODERATE,
                'estimated_time': 5.0,
                'resources': ['math_engine', 'symbolic_processor'],
                'success_criteria': ['computation_completed', 'result_validated']
            },
            
            'logical_inference': {
                'complexity': TaskComplexity.MODERATE,
                'estimated_time': 7.0,
                'resources': ['logic_engine', 'knowledge_base'],
                'success_criteria': ['inference_valid', 'conclusion_sound']
            },
            
            'creative_synthesis': {
                'complexity': TaskComplexity.COMPLEX,
                'estimated_time': 15.0,
                'resources': ['creative_engine', 'memory_system'],
                'success_criteria': ['novel_solution_generated', 'creativity_criteria_met']
            },
            
            'result_validation': {
                'complexity': TaskComplexity.SIMPLE,
                'estimated_time': 3.0,
                'resources': ['validation_system'],
                'success_criteria': ['validation_completed', 'confidence_calculated']
            }
        }
    
    async def decompose_task(self, 
                           task_description: str,
                           context: Dict[str, Any] = None,
                           constraints: Dict[str, Any] = None) -> DecompositionPlan:
        """
        Decompose a complex task into manageable components
        
        Args:
            task_description: Natural language description of the task
            context: Additional context and requirements
            constraints: Time, resource, and other constraints
            
        Returns:
            DecompositionPlan: Complete plan with nodes and dependencies
        """
        start_time = time.time()
        plan_id = str(uuid.uuid4())
        
        logger.info(f"🧩 Decomposing task: {task_description[:100]}...")
        
        try:
            # Step 1: Analyze task characteristics
            task_analysis = await self._analyze_task(task_description, context)
            
            # Step 2: Select decomposition strategy
            strategy = self._select_decomposition_strategy(task_analysis)
            
            # Step 3: Generate task nodes
            nodes = await self._generate_task_nodes(task_description, task_analysis, strategy)
            
            # Step 4: Create dependency graph
            dependencies = self._create_dependency_graph(nodes, strategy)
            
            # Step 5: Determine execution order
            execution_order = self._calculate_execution_order(dependencies)
            
            # Step 6: Calculate time estimates
            total_time = sum(node.estimated_time for node in nodes.values())
            
            # Create decomposition plan
            plan = DecompositionPlan(
                id=plan_id,
                original_task=task_description,
                strategy=strategy,
                complexity=task_analysis['complexity'],
                total_estimated_time=total_time,
                nodes=nodes,
                dependencies=dependencies,
                execution_order=execution_order
            )
            
            # Store plan
            self.active_plans[plan_id] = plan
            
            # Update metrics
            decomposition_time = time.time() - start_time
            self._update_decomposition_metrics(plan, decomposition_time)
            
            logger.info(f"✅ Task decomposed: {len(nodes)} nodes, {total_time:.1f}s estimated")
            return plan
            
        except Exception as e:
            logger.error(f"❌ Task decomposition failed: {e}")
            raise
    
    async def _analyze_task(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyze task to determine characteristics and requirements"""
        analysis = {
            'task_type': 'unknown',
            'complexity': TaskComplexity.MODERATE,
            'domain': 'general',
            'estimated_steps': 3,
            'resource_requirements': [],
            'parallelizable': False,
            'iterative': False,
            'conditional': False
        }
        
        task_lower = task.lower()
        
        # Identify task type and domain
        if any(word in task_lower for word in ['solve', 'calculate', 'compute', 'math']):
            analysis['task_type'] = 'mathematical'
            analysis['domain'] = 'mathematics'
            analysis['resource_requirements'] = ['math_engine']
            
        elif any(word in task_lower for word in ['reason', 'logic', 'prove', 'deduce']):
            analysis['task_type'] = 'logical'
            analysis['domain'] = 'logic'
            analysis['resource_requirements'] = ['logic_engine']
            
        elif any(word in task_lower for word in ['create', 'generate', 'design', 'invent']):
            analysis['task_type'] = 'creative'
            analysis['domain'] = 'creativity'
            analysis['resource_requirements'] = ['creative_engine']
            analysis['iterative'] = True
            
        elif any(word in task_lower for word in ['cultural', 'romanian', 'tradition', 'social']):
            analysis['task_type'] = 'cultural'
            analysis['domain'] = 'culture'
            analysis['resource_requirements'] = ['cultural_engine']
            
        else:
            analysis['task_type'] = 'multi_modal'
            analysis['resource_requirements'] = ['math_engine', 'logic_engine', 'creative_engine']
            analysis['parallelizable'] = True
        
        # Estimate complexity based on task characteristics
        complexity_indicators = 0
        
        if len(task.split()) > 20:
            complexity_indicators += 1
        if any(word in task_lower for word in ['complex', 'detailed', 'comprehensive', 'thorough']):
            complexity_indicators += 2
        if any(word in task_lower for word in ['analyze', 'evaluate', 'compare', 'synthesize']):
            complexity_indicators += 1
        if any(word in task_lower for word in ['multiple', 'various', 'different', 'several']):
            complexity_indicators += 1
        
        # Map to complexity level
        if complexity_indicators == 0:
            analysis['complexity'] = TaskComplexity.SIMPLE
            analysis['estimated_steps'] = 2
        elif complexity_indicators <= 2:
            analysis['complexity'] = TaskComplexity.MODERATE
            analysis['estimated_steps'] = 4
        elif complexity_indicators <= 4:
            analysis['complexity'] = TaskComplexity.COMPLEX
            analysis['estimated_steps'] = 6
        else:
            analysis['complexity'] = TaskComplexity.VERY_COMPLEX
            analysis['estimated_steps'] = 10
        
        # Check for conditional logic
        if any(word in task_lower for word in ['if', 'when', 'unless', 'depending']):
            analysis['conditional'] = True
        
        return analysis
    
    def _select_decomposition_strategy(self, task_analysis: Dict[str, Any]) -> DecompositionStrategy:
        """Select optimal decomposition strategy based on task analysis"""
        task_type = task_analysis['task_type']
        
        # Check for pattern matches
        if task_type in self.decomposition_patterns:
            return self.decomposition_patterns[task_type]['strategy']
        
        # Fallback logic based on characteristics
        if task_analysis['parallelizable']:
            return DecompositionStrategy.PARALLEL
        elif task_analysis['conditional']:
            return DecompositionStrategy.CONDITIONAL
        elif task_analysis['iterative']:
            return DecompositionStrategy.ITERATIVE
        elif task_analysis['complexity'] in [TaskComplexity.COMPLEX, TaskComplexity.VERY_COMPLEX]:
            return DecompositionStrategy.HIERARCHICAL
        else:
            return DecompositionStrategy.SEQUENTIAL
    
    async def _generate_task_nodes(self, 
                                 task: str, 
                                 analysis: Dict[str, Any], 
                                 strategy: DecompositionStrategy) -> Dict[str, TaskNode]:
        """Generate individual task nodes based on analysis and strategy"""
        nodes = {}
        task_type = analysis['task_type']
        
        # Get pattern-based steps if available
        if task_type in self.decomposition_patterns:
            pattern_steps = self.decomposition_patterns[task_type]['steps']
        else:
            # Generate generic steps
            pattern_steps = self._generate_generic_steps(analysis)
        
        # Create nodes for each step
        for i, step_name in enumerate(pattern_steps):
            node_id = f"node_{i+1:02d}_{step_name}"
            
            # Get template if available
            template = self.task_templates.get(step_name, {})
            
            node = TaskNode(
                id=node_id,
                name=step_name.replace('_', ' ').title(),
                description=f"Execute {step_name} for: {task[:50]}...",
                complexity=template.get('complexity', TaskComplexity.MODERATE),
                estimated_time=template.get('estimated_time', 5.0),
                resources_required={
                    'engines': analysis['resource_requirements'],
                    'memory': ['working_memory'],
                    'processing_power': 1.0
                },
                success_criteria=template.get('success_criteria', [f"{step_name}_completed"]),
                failure_conditions=[f"{step_name}_failed", "timeout_exceeded"],
                retry_policy={
                    'max_attempts': 3,
                    'backoff_factor': 1.5,
                    'timeout': 30.0
                }
            )
            
            nodes[node_id] = node
        
        return nodes
    
    def _generate_generic_steps(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate generic decomposition steps"""
        steps = ['parse_input']
        
        if analysis['task_type'] == 'mathematical':
            steps.extend(['mathematical_computation', 'result_validation'])
        elif analysis['task_type'] == 'logical':
            steps.extend(['logical_inference', 'result_validation'])
        elif analysis['task_type'] == 'creative':
            steps.extend(['creative_synthesis', 'result_validation'])
        else:
            steps.extend(['process_task', 'result_validation'])
        
        return steps
    
    def _create_dependency_graph(self, nodes: Dict[str, TaskNode], strategy: DecompositionStrategy) -> nx.DiGraph:
        """Create dependency graph based on strategy and node relationships"""
        graph = nx.DiGraph()
        
        # Add all nodes
        for node_id in nodes:
            graph.add_node(node_id)
        
        node_list = list(nodes.keys())
        
        if strategy == DecompositionStrategy.SEQUENTIAL:
            # Linear dependencies
            for i in range(len(node_list) - 1):
                graph.add_edge(node_list[i], node_list[i + 1])
                
        elif strategy == DecompositionStrategy.PARALLEL:
            # Minimal dependencies - most can run in parallel
            # Usually just input parsing and final result validation
            if len(node_list) > 2:
                first_node = node_list[0]
                last_node = node_list[-1]
                
                # All other nodes depend on first
                for node_id in node_list[1:-1]:
                    graph.add_edge(first_node, node_id)
                
                # Last node depends on all others
                for node_id in node_list[:-1]:
                    graph.add_edge(node_id, last_node)
                    
        elif strategy == DecompositionStrategy.HIERARCHICAL:
            # Tree-like dependencies
            root = node_list[0]
            for i in range(1, len(node_list)):
                parent_idx = (i - 1) // 2
                graph.add_edge(node_list[parent_idx], node_list[i])
                
        else:
            # Default to sequential for other strategies
            for i in range(len(node_list) - 1):
                graph.add_edge(node_list[i], node_list[i + 1])
        
        return graph
    
    def _calculate_execution_order(self, dependencies: nx.DiGraph) -> List[str]:
        """Calculate optimal execution order using topological sort"""
        try:
            return list(nx.topological_sort(dependencies))
        except nx.NetworkXError:
            # Graph has cycles, use alternative approach
            logger.warning("⚠️ Dependency graph has cycles, using heuristic ordering")
            return list(dependencies.nodes())
    
    async def execute_plan(self, plan_id: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute a decomposition plan"""
        if plan_id not in self.active_plans:
            raise ValueError(f"Plan {plan_id} not found")
        
        plan = self.active_plans[plan_id]
        plan.status = "executing"
        plan.start_time = datetime.now()
        
        logger.info(f"🚀 Executing decomposition plan: {plan_id}")
        
        execution_results = {}
        successful_nodes = 0
        
        try:
            # Execute nodes in order
            for node_id in plan.execution_order:
                node = plan.nodes[node_id]
                
                # Check prerequisites
                if await self._check_prerequisites(node, execution_results):
                    # Execute node
                    result = await self._execute_node(node, context, execution_results)
                    execution_results[node_id] = result
                    
                    if result['success']:
                        successful_nodes += 1
                    else:
                        logger.error(f"❌ Node failed: {node_id}")
                        break
                else:
                    logger.error(f"❌ Prerequisites not met for node: {node_id}")
                    break
            
            # Calculate success rate
            plan.success_rate = successful_nodes / len(plan.nodes)
            plan.end_time = datetime.now()
            
            if plan.success_rate == 1.0:
                plan.status = "completed"
                logger.info(f"✅ Plan executed successfully: {plan_id}")
            else:
                plan.status = "partial"
                logger.warning(f"⚠️ Plan partially completed: {plan_id} ({plan.success_rate:.1%})")
            
            # Move to completed plans
            self.completed_plans.append(plan)
            del self.active_plans[plan_id]
            
            return {
                'success': plan.success_rate > 0.8,
                'plan_id': plan_id,
                'success_rate': plan.success_rate,
                'execution_time': (plan.end_time - plan.start_time).total_seconds(),
                'results': execution_results
            }
            
        except Exception as e:
            plan.status = "failed"
            plan.end_time = datetime.now()
            logger.error(f"❌ Plan execution failed: {plan_id} - {e}")
            
            return {
                'success': False,
                'plan_id': plan_id,
                'error': str(e),
                'results': execution_results
            }
    
    async def _check_prerequisites(self, node: TaskNode, results: Dict[str, Any]) -> bool:
        """Check if node prerequisites are satisfied"""
        if not node.prerequisites:
            return True
        
        for prereq in node.prerequisites:
            if prereq not in results or not results[prereq]['success']:
                return False
        
        return True
    
    async def _execute_node(self, 
                           node: TaskNode, 
                           context: Dict[str, Any],
                           previous_results: Dict[str, Any]) -> Dict[str, Any]:
        """Execute individual task node"""
        node.status = "running"
        node.start_time = datetime.now()
        node.attempts += 1
        
        logger.info(f"⚡ Executing node: {node.name}")
        
        try:
            # Simulate node execution (in real implementation, this would call appropriate engines)
            await asyncio.sleep(min(node.estimated_time / 10, 1.0))  # Simulated processing time
            
            # Mock successful execution
            result = {
                'success': True,
                'node_id': node.id,
                'output': f"Result from {node.name}",
                'execution_time': (datetime.now() - node.start_time).total_seconds(),
                'resources_used': node.resources_required,
                'confidence': 0.85
            }
            
            node.status = "completed"
            node.end_time = datetime.now()
            node.result = result['output']
            
            return result
            
        except Exception as e:
            node.status = "failed"
            node.end_time = datetime.now()
            node.error = str(e)
            
            return {
                'success': False,
                'node_id': node.id,
                'error': str(e),
                'execution_time': (datetime.now() - node.start_time).total_seconds()
            }
    
    def _update_decomposition_metrics(self, plan: DecompositionPlan, decomposition_time: float):
        """Update decomposition performance metrics"""
        self.metrics['plans_created'] += 1
        
        # Update average decomposition time
        total_time = self.metrics['average_decomposition_time'] * (self.metrics['plans_created'] - 1)
        self.metrics['average_decomposition_time'] = (total_time + decomposition_time) / self.metrics['plans_created']
        
        # Update complexity distribution
        self.metrics['complexity_distribution'][plan.complexity] += 1
        
        # Update pattern effectiveness (if we track execution later)
        pattern_key = plan.strategy.value
        if pattern_key not in self.metrics['pattern_effectiveness']:
            self.metrics['pattern_effectiveness'][pattern_key] = {'used': 0, 'successful': 0}
        self.metrics['pattern_effectiveness'][pattern_key]['used'] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        return {
            'decomposition_metrics': self.metrics,
            'active_plans': len(self.active_plans),
            'completed_plans': len(self.completed_plans),
            'total_nodes_created': sum(len(plan.nodes) for plan in self.completed_plans),
            'average_nodes_per_plan': sum(len(plan.nodes) for plan in self.completed_plans) / max(len(self.completed_plans), 1)
        }
    
    async def adaptive_replan(self, plan_id: str, execution_feedback: Dict[str, Any]) -> DecompositionPlan:
        """Adaptively re-plan based on execution feedback"""
        if plan_id not in self.active_plans:
            raise ValueError(f"Plan {plan_id} not found")
        
        original_plan = self.active_plans[plan_id]
        logger.info(f"🔄 Adaptive re-planning for: {plan_id}")
        
        # Create new plan based on feedback
        new_plan = await self.decompose_task(
            original_plan.original_task,
            context={'feedback': execution_feedback, 'previous_plan': original_plan}
        )
        
        # Update adaptation history
        self.adaptation_history.append({
            'original_plan_id': plan_id,
            'new_plan_id': new_plan.id,
            'reason': 'execution_feedback',
            'timestamp': datetime.now()
        })
        
        return new_plan

# Global instance for Phase 1 AGI Evolution
task_decomposition_engine = TaskDecompositionEngine()

logger.info("✅ Task Decomposition Engine module loaded - AGI Evolution Phase 1 ready!")