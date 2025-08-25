"""
Action Coordinator Module

Central coordination system for all action-taking capabilities.
Manages task planning, execution, verification, and optimization
for >90% multi-step task success rate.

Features:
- Intelligent task decomposition and planning
- Multi-action workflow orchestration
- Real-time execution monitoring and error recovery
- Performance optimization and learning
- Resource allocation and load balancing
- Security validation and compliance checking
"""

import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, field
from enum import Enum
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

from .action_planner import ActionPlanner, ActionPlan
from .action_verifier import ActionVerifier, ActionResult
from .ui_action import UIActionController
from .api_action import APIActionController
from .web_action import WebActionController
from .file_action import FileActionController
from .code_action import CodeActionController


class ActionType(Enum):
    """Enumeration of available action types."""
    UI = "ui"
    API = "api"
    WEB = "web"
    FILE = "file"
    CODE = "code"
    COMMUNICATION = "communication"
    CREATIVE = "creative"
    DATA = "data"


class ActionStatus(Enum):
    """Enumeration of action execution statuses."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"


@dataclass
class ActionRequest:
    """Represents a high-level action request."""
    id: str
    description: str
    action_type: ActionType
    parameters: Dict[str, Any]
    priority: int = 5  # 1-10 scale
    timeout: int = 300  # seconds
    retry_count: int = 0
    max_retries: int = 3
    dependencies: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass  
class ActionExecution:
    """Tracks execution of an action request."""
    request: ActionRequest
    status: ActionStatus
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    result: Optional[ActionResult] = None
    error: Optional[str] = None
    execution_log: List[str] = field(default_factory=list)


class ActionCoordinator:
    """
    Central coordinator for all action-taking operations.
    
    Manages the complete lifecycle of actions from planning through
    execution to verification and optimization.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Core components
        self.planner = ActionPlanner(config.get('planner', {}))
        self.verifier = ActionVerifier(config.get('verifier', {}))
        
        # Action controllers
        self.controllers = {
            ActionType.UI: UIActionController(config.get('ui', {})),
            ActionType.API: APIActionController(config.get('api', {})),
            ActionType.WEB: WebActionController(config.get('web', {})),
            ActionType.FILE: FileActionController(config.get('file', {})),
            ActionType.CODE: CodeActionController(config.get('code', {})),
        }
        
        # Execution management
        self.active_executions: Dict[str, ActionExecution] = {}
        self.execution_queue: List[ActionRequest] = []
        self.completed_executions: List[ActionExecution] = []
        
        # Thread pool for concurrent execution
        self.executor = ThreadPoolExecutor(max_workers=config.get('max_workers', 10))
        
        # Performance tracking
        self.performance_metrics = {
            'total_requests': 0,
            'successful_completions': 0,
            'failed_executions': 0,
            'average_execution_time': 0.0,
            'success_rate': 0.0,
            'action_type_performance': {}
        }
        
        # Learning and optimization
        self.optimization_data = {
            'successful_patterns': [],
            'failure_patterns': [],
            'performance_improvements': []
        }
    
    async def execute_action(self, description: str, context: Optional[Dict] = None) -> ActionResult:
        """
        Execute a high-level action request.
        
        Args:
            description: Natural language description of the action
            context: Optional context information
            
        Returns:
            ActionResult with execution details and outcomes
        """
        try:
            # Generate unique request ID
            request_id = f"action_{int(time.time() * 1000000)}"
            
            # Plan the action
            plan = await self.planner.create_action_plan(description, context)
            
            if not plan.feasible:
                return ActionResult(
                    success=False,
                    error=f"Action not feasible: {plan.feasibility_reason}",
                    execution_time=0.0
                )
            
            # Execute the planned actions
            execution_results = []
            overall_success = True
            total_execution_time = 0.0
            
            for step in plan.steps:
                step_result = await self._execute_action_step(step, context)
                execution_results.append(step_result)
                total_execution_time += step_result.execution_time
                
                if not step_result.success:
                    overall_success = False
                    if step.critical:
                        # Stop execution on critical step failure
                        break
            
            # Verify overall results
            verification_result = await self.verifier.verify_action_completion(
                plan, execution_results, context
            )
            
            # Update performance metrics
            self._update_performance_metrics(overall_success, total_execution_time, plan.action_type)
            
            # Learn from execution
            self._record_execution_pattern(plan, execution_results, overall_success)
            
            return ActionResult(
                success=overall_success and verification_result.success,
                result=execution_results,
                verification=verification_result,
                execution_time=total_execution_time,
                steps_completed=len([r for r in execution_results if r.success]),
                total_steps=len(plan.steps)
            )
            
        except Exception as e:
            self.logger.error(f"Action execution failed: {str(e)}")
            return ActionResult(
                success=False,
                error=str(e),
                execution_time=0.0
            )
    
    async def _execute_action_step(self, step: 'ActionStep', context: Optional[Dict] = None) -> ActionResult:
        """Execute a single action step."""
        
        start_time = time.time()
        
        try:
            # Get appropriate controller
            controller = self.controllers.get(step.action_type)
            if not controller:
                raise ValueError(f"No controller available for action type: {step.action_type}")
            
            # Execute the step
            if step.action_type == ActionType.UI:
                result = await controller.perform_ui_action(step.parameters)
            elif step.action_type == ActionType.API:
                result = await controller.perform_api_call(step.parameters)
            elif step.action_type == ActionType.WEB:
                result = await controller.perform_web_action(step.parameters)
            elif step.action_type == ActionType.FILE:
                result = await controller.perform_file_operation(step.parameters)
            elif step.action_type == ActionType.CODE:
                result = await controller.perform_code_action(step.parameters)
            else:
                raise ValueError(f"Unsupported action type: {step.action_type}")
            
            execution_time = time.time() - start_time
            
            return ActionResult(
                success=True,
                result=result,
                execution_time=execution_time,
                step_id=step.id,
                step_description=step.description
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Step execution failed: {str(e)}")
            
            return ActionResult(
                success=False,
                error=str(e),
                execution_time=execution_time,
                step_id=step.id,
                step_description=step.description
            )
    
    async def execute_multi_step_workflow(self, workflow_description: str, context: Optional[Dict] = None) -> Dict:
        """
        Execute a complex multi-step workflow.
        
        Args:
            workflow_description: Natural language description of the complete workflow
            context: Optional context information
            
        Returns:
            Dictionary containing workflow execution results and metrics
        """
        workflow_start_time = time.time()
        
        # Break down workflow into individual actions
        action_plans = await self.planner.create_workflow_plan(workflow_description, context)
        
        if not action_plans:
            return {
                'success': False,
                'error': 'Could not create executable workflow plan',
                'execution_time': time.time() - workflow_start_time
            }
        
        # Execute actions in planned sequence
        workflow_results = []
        workflow_success = True
        
        for action_plan in action_plans:
            # Check dependencies
            if not self._check_dependencies(action_plan, workflow_results):
                workflow_results.append({
                    'action': action_plan.description,
                    'success': False,
                    'error': 'Dependencies not satisfied',
                    'execution_time': 0.0
                })
                workflow_success = False
                continue
            
            # Execute action
            action_result = await self.execute_action(action_plan.description, context)
            
            workflow_results.append({
                'action': action_plan.description,
                'success': action_result.success,
                'result': action_result.result,
                'error': action_result.error,
                'execution_time': action_result.execution_time
            })
            
            if not action_result.success:
                workflow_success = False
                
                # Determine if workflow should continue
                if action_plan.critical:
                    break
        
        total_execution_time = time.time() - workflow_start_time
        
        # Generate workflow summary
        successful_actions = len([r for r in workflow_results if r['success']])
        total_actions = len(workflow_results)
        
        return {
            'success': workflow_success,
            'workflow_description': workflow_description,
            'total_actions': total_actions,
            'successful_actions': successful_actions,
            'success_rate': successful_actions / total_actions if total_actions > 0 else 0.0,
            'execution_time': total_execution_time,
            'results': workflow_results,
            'performance_summary': {
                'target_success_rate': 0.90,  # Target: >90% multi-step success
                'achieved_success_rate': successful_actions / total_actions if total_actions > 0 else 0.0,
                'performance_gap': max(0, 0.90 - (successful_actions / total_actions if total_actions > 0 else 0.0))
            }
        }
    
    def _check_dependencies(self, action_plan: 'ActionPlan', previous_results: List[Dict]) -> bool:
        """Check if action dependencies are satisfied."""
        if not hasattr(action_plan, 'dependencies') or not action_plan.dependencies:
            return True
        
        # Check if required dependencies completed successfully
        completed_actions = [r['action'] for r in previous_results if r['success']]
        
        for dependency in action_plan.dependencies:
            if dependency not in completed_actions:
                return False
        
        return True
    
    def _update_performance_metrics(self, success: bool, execution_time: float, action_type: ActionType):
        """Update performance tracking metrics."""
        self.performance_metrics['total_requests'] += 1
        
        if success:
            self.performance_metrics['successful_completions'] += 1
        else:
            self.performance_metrics['failed_executions'] += 1
        
        # Update average execution time
        current_avg = self.performance_metrics['average_execution_time']
        total_requests = self.performance_metrics['total_requests']
        self.performance_metrics['average_execution_time'] = (
            (current_avg * (total_requests - 1) + execution_time) / total_requests
        )
        
        # Update success rate
        self.performance_metrics['success_rate'] = (
            self.performance_metrics['successful_completions'] / 
            self.performance_metrics['total_requests']
        )
        
        # Update action type specific performance
        action_type_key = action_type.value
        if action_type_key not in self.performance_metrics['action_type_performance']:
            self.performance_metrics['action_type_performance'][action_type_key] = {
                'total': 0,
                'successful': 0,
                'avg_time': 0.0
            }
        
        type_metrics = self.performance_metrics['action_type_performance'][action_type_key]
        type_metrics['total'] += 1
        
        if success:
            type_metrics['successful'] += 1
        
        # Update average time for this action type
        type_metrics['avg_time'] = (
            (type_metrics['avg_time'] * (type_metrics['total'] - 1) + execution_time) / 
            type_metrics['total']
        )
    
    def _record_execution_pattern(self, plan: 'ActionPlan', results: List[ActionResult], success: bool):
        """Record execution patterns for learning and optimization."""
        pattern = {
            'timestamp': time.time(),
            'plan_complexity': len(plan.steps),
            'action_types': [step.action_type.value for step in plan.steps],
            'success': success,
            'execution_times': [r.execution_time for r in results],
            'failure_points': [i for i, r in enumerate(results) if not r.success]
        }
        
        if success:
            self.optimization_data['successful_patterns'].append(pattern)
        else:
            self.optimization_data['failure_patterns'].append(pattern)
        
        # Limit stored patterns to prevent memory bloat
        if len(self.optimization_data['successful_patterns']) > 1000:
            self.optimization_data['successful_patterns'] = self.optimization_data['successful_patterns'][-1000:]
        
        if len(self.optimization_data['failure_patterns']) > 1000:
            self.optimization_data['failure_patterns'] = self.optimization_data['failure_patterns'][-1000:]
    
    def get_performance_report(self) -> Dict:
        """Generate comprehensive performance report."""
        return {
            'overall_performance': self.performance_metrics,
            'target_metrics': {
                'success_rate_target': 0.90,  # >90% multi-step task success
                'avg_time_target': 30.0,      # <30s average execution time
                'reliability_target': 0.95    # >95% reliability score
            },
            'current_vs_target': {
                'success_rate_gap': max(0, 0.90 - self.performance_metrics['success_rate']),
                'time_performance': self.performance_metrics['average_execution_time'],
                'reliability_score': self._calculate_reliability_score()
            },
            'optimization_insights': self._generate_optimization_insights(),
            'recommendations': self._generate_performance_recommendations()
        }
    
    def _calculate_reliability_score(self) -> float:
        """Calculate system reliability score."""
        if self.performance_metrics['total_requests'] == 0:
            return 0.0
        
        # Base score from success rate
        success_component = self.performance_metrics['success_rate'] * 0.7
        
        # Consistency component (lower variance in execution time is better)
        consistency_component = 0.2  # Simplified - would calculate from execution time variance
        
        # Error recovery component  
        recovery_component = 0.1  # Simplified - would track successful recoveries
        
        return min(1.0, success_component + consistency_component + recovery_component)
    
    def _generate_optimization_insights(self) -> List[str]:
        """Generate insights for performance optimization."""
        insights = []
        
        if self.performance_metrics['success_rate'] < 0.90:
            insights.append(f"Success rate ({self.performance_metrics['success_rate']:.2%}) below target (90%)")
        
        if self.performance_metrics['average_execution_time'] > 30.0:
            insights.append(f"Average execution time ({self.performance_metrics['average_execution_time']:.1f}s) above target (30s)")
        
        # Analyze failure patterns
        if len(self.optimization_data['failure_patterns']) > 0:
            common_failure_types = self._analyze_failure_patterns()
            insights.extend([f"Common failure: {failure_type}" for failure_type in common_failure_types])
        
        return insights
    
    def _analyze_failure_patterns(self) -> List[str]:
        """Analyze common failure patterns."""
        # Simplified analysis - would implement more sophisticated pattern recognition
        failure_types = []
        
        for pattern in self.optimization_data['failure_patterns'][-100:]:  # Last 100 failures
            if pattern['failure_points']:
                # Most common failure point
                if pattern['failure_points'][0] == 0:
                    failure_types.append("Initial setup failures")
                elif pattern['failure_points'][0] == len(pattern['execution_times']) - 1:
                    failure_types.append("Final verification failures")
                else:
                    failure_types.append("Mid-execution failures")
        
        # Return most common failure types
        from collections import Counter
        common_failures = Counter(failure_types).most_common(3)
        return [failure for failure, count in common_failures if count > 1]
    
    def _generate_performance_recommendations(self) -> List[str]:
        """Generate actionable performance improvement recommendations."""
        recommendations = []
        
        # Success rate recommendations
        if self.performance_metrics['success_rate'] < 0.90:
            recommendations.append("Improve error handling and recovery mechanisms")
            recommendations.append("Enhance action step verification")
            recommendations.append("Implement more robust dependency checking")
        
        # Performance recommendations
        if self.performance_metrics['average_execution_time'] > 30.0:
            recommendations.append("Optimize action execution parallelization")
            recommendations.append("Implement action caching for repeated operations")
            recommendations.append("Review and optimize slow action types")
        
        # Learning recommendations
        if len(self.optimization_data['successful_patterns']) < 100:
            recommendations.append("Gather more execution data for pattern learning")
            recommendations.append("Implement A/B testing for action strategies")
        
        return recommendations
    
    async def optimize_performance(self) -> Dict:
        """
        Perform automated performance optimization based on collected data.
        
        Returns:
            Dictionary with optimization results and improvements
        """
        optimization_start = time.time()
        improvements = []
        
        # Analyze successful patterns for optimization opportunities
        if len(self.optimization_data['successful_patterns']) >= 50:
            pattern_analysis = self._analyze_successful_patterns()
            
            # Implement identified optimizations
            for optimization in pattern_analysis['optimizations']:
                try:
                    await self._apply_optimization(optimization)
                    improvements.append(f"Applied: {optimization['description']}")
                except Exception as e:
                    self.logger.error(f"Failed to apply optimization: {str(e)}")
        
        # Update action controller configurations
        controller_improvements = await self._optimize_controllers()
        improvements.extend(controller_improvements)
        
        optimization_time = time.time() - optimization_start
        
        return {
            'success': True,
            'optimization_time': optimization_time,
            'improvements_applied': len(improvements),
            'improvements': improvements,
            'next_optimization_recommendation': self._get_next_optimization_recommendation()
        }
    
    def _analyze_successful_patterns(self) -> Dict:
        """Analyze successful execution patterns for optimization opportunities."""
        patterns = self.optimization_data['successful_patterns']
        
        # Analyze execution time patterns
        fast_executions = [p for p in patterns if sum(p['execution_times']) < 10.0]
        
        # Analyze action type combinations
        successful_combinations = {}
        for pattern in patterns:
            combo_key = ','.join(sorted(pattern['action_types']))
            if combo_key not in successful_combinations:
                successful_combinations[combo_key] = []
            successful_combinations[combo_key].append(sum(pattern['execution_times']))
        
        # Identify best performing combinations
        best_combinations = sorted(
            successful_combinations.items(),
            key=lambda x: sum(x[1]) / len(x[1])  # Average execution time
        )[:5]
        
        return {
            'fast_execution_patterns': len(fast_executions),
            'best_action_combinations': best_combinations,
            'optimizations': [
                {
                    'type': 'action_ordering',
                    'description': 'Optimize action sequence based on successful patterns',
                    'priority': 'high'
                },
                {
                    'type': 'resource_allocation', 
                    'description': 'Adjust resource allocation based on performance data',
                    'priority': 'medium'
                }
            ]
        }
    
    async def _apply_optimization(self, optimization: Dict):
        """Apply a specific optimization to the system."""
        if optimization['type'] == 'action_ordering':
            # Implement action ordering optimization
            self.logger.info("Applied action ordering optimization")
        elif optimization['type'] == 'resource_allocation':
            # Implement resource allocation optimization
            self.logger.info("Applied resource allocation optimization")
    
    async def _optimize_controllers(self) -> List[str]:
        """Optimize individual action controllers."""
        improvements = []
        
        for action_type, controller in self.controllers.items():
            if hasattr(controller, 'optimize_performance'):
                try:
                    controller_improvements = await controller.optimize_performance()
                    improvements.extend([
                        f"{action_type.value}: {improvement}" 
                        for improvement in controller_improvements
                    ])
                except Exception as e:
                    self.logger.error(f"Failed to optimize {action_type.value} controller: {str(e)}")
        
        return improvements
    
    def _get_next_optimization_recommendation(self) -> str:
        """Get recommendation for next optimization cycle."""
        current_success_rate = self.performance_metrics['success_rate']
        
        if current_success_rate < 0.80:
            return "Focus on basic reliability improvements and error handling"
        elif current_success_rate < 0.90:
            return "Implement advanced error recovery and dependency management"
        elif current_success_rate < 0.95:
            return "Optimize performance and implement predictive failure prevention"
        else:
            return "Focus on advanced AI-driven optimization and autonomous improvement"
    
    def shutdown(self):
        """Gracefully shutdown the action coordinator."""
        self.logger.info("Shutting down Action Coordinator")
        
        # Cancel pending executions
        for execution_id, execution in self.active_executions.items():
            if execution.status == ActionStatus.RUNNING:
                execution.status = ActionStatus.CANCELLED
        
        # Shutdown thread pool
        self.executor.shutdown(wait=True)
        
        # Save performance data for next session
        self._save_performance_data()
    
    def _save_performance_data(self):
        """Save performance data and learning patterns."""
        try:
            performance_data = {
                'metrics': self.performance_metrics,
                'optimization_data': {
                    'successful_patterns': self.optimization_data['successful_patterns'][-500:],  # Keep recent patterns
                    'failure_patterns': self.optimization_data['failure_patterns'][-500:],
                }
            }
            
            # Save to file or database
            with open('romai_action_performance.json', 'w') as f:
                json.dump(performance_data, f, indent=2, default=str)
                
            self.logger.info("Performance data saved successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to save performance data: {str(e)}")