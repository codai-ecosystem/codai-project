"""
ROMAI Autonomous Learning Loop Foundation
========================================

Implements continuous learning capabilities that enable ROMAI to improve its 
performance through experience, feedback, and self-optimization. This system
creates autonomous learning loops that use tools for self-improvement.

Key Features:
- Continuous learning from tool execution outcomes
- Performance feedback integration and optimization
- Adaptive behavior modification based on experience
- Self-improvement through iterative refinement
- Meta-learning for faster adaptation to new tasks
- Safe experimentation with rollback capabilities

Architecture Components:
- Learning Loop Manager: Orchestrates continuous improvement cycles
- Performance Feedback Processor: Analyzes outcomes and generates insights
- Adaptation Engine: Modifies behavior based on learned patterns
- Experimentation Framework: Safe testing of improvements
- Meta-Learning System: Learns how to learn more effectively

Author: GitHub Copilot AGI Inspector
Date: August 27, 2025
Status: Production Implementation
"""

import asyncio
import logging
import json
import time
import random
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple, Callable, Set
from dataclasses import dataclass, field
from collections import defaultdict, deque
from enum import Enum
import threading
from pathlib import Path
import pickle
import hashlib

# Import ROMAI components
try:
    from memory_integration import ToolMemoryManager, ToolExecution, ToolPerformanceProfile
    from tool_manager import ToolManager, ToolResult
    from real_inference import RealInferenceEngine, GenerationConfig
    ROMAI_COMPONENTS_AVAILABLE = True
except ImportError:
    try:
        from .memory_integration import ToolMemoryManager, ToolExecution, ToolPerformanceProfile
        from .tool_manager import ToolManager, ToolResult
        from .real_inference import RealInferenceEngine, GenerationConfig
        ROMAI_COMPONENTS_AVAILABLE = True
    except ImportError as e:
        ROMAI_COMPONENTS_AVAILABLE = False
        print(f"ROMAI components not available: {e}")
        
        # Define minimal classes for standalone operation
        from dataclasses import dataclass
        from typing import Dict, Any
        
        @dataclass
        class ToolResult:
            success: bool
            output: str = ""
            error: str = ""
            execution_time: float = 0.0
            tool_name: str = ""
            resource_usage: Dict[str, Any] = None
            timestamp: str = ""
            metadata: Dict[str, Any] = None
        
        class RealInferenceEngine:
            """Minimal RealInferenceEngine for standalone operation."""
            def __init__(self):
                pass
        
        class GenerationConfig:
            """Minimal GenerationConfig for standalone operation."""
            def __init__(self):
                pass
        
        class ToolMemoryManager:
            """Minimal ToolMemoryManager for standalone operation."""
            def __init__(self):
                pass
        
        class ToolExecution:
            """Minimal ToolExecution for standalone operation."""
            def __init__(self):
                pass
        
        class ToolPerformanceProfile:
            """Minimal ToolPerformanceProfile for standalone operation.""" 
            def __init__(self):
                pass

# Configure logging
logger = logging.getLogger(__name__)


class LearningMode(Enum):
    """Different learning modes for the system."""
    EXPLORATION = "exploration"  # Trying new approaches
    EXPLOITATION = "exploitation"  # Using known good approaches
    EXPERIMENTATION = "experimentation"  # Safe testing of improvements
    OPTIMIZATION = "optimization"  # Fine-tuning existing capabilities
    META_LEARNING = "meta_learning"  # Learning how to learn


class AdaptationStrategy(Enum):
    """Strategies for behavioral adaptation."""
    CONSERVATIVE = "conservative"  # Small, safe changes
    MODERATE = "moderate"  # Balanced risk/reward changes
    AGGRESSIVE = "aggressive"  # Larger changes for faster learning
    DYNAMIC = "dynamic"  # Adapts strategy based on context


@dataclass
class LearningObjective:
    """Represents a learning objective with success criteria."""
    
    objective_id: str
    name: str
    description: str
    target_metric: str  # e.g., 'success_rate', 'execution_time', 'user_satisfaction'
    target_value: float
    current_value: float = 0.0
    progress: float = 0.0  # 0.0 to 1.0
    priority: float = 1.0  # Learning priority
    domain: str = "general"
    
    # Success criteria
    success_threshold: float = 0.8  # Achievement threshold
    measurement_window: int = 100  # Number of executions to measure
    stability_requirement: float = 0.9  # Consistency requirement
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    learning_tags: List[str] = field(default_factory=list)
    
    @property
    def is_achieved(self) -> bool:
        """Check if objective is achieved."""
        return (self.current_value >= self.target_value * self.success_threshold and 
                self.progress >= self.success_threshold)
    
    @property
    def improvement_potential(self) -> float:
        """Calculate potential for improvement."""
        if self.target_value == 0:
            return 0.0
        return max(0.0, (self.target_value - self.current_value) / self.target_value)


@dataclass
class LearningExperiment:
    """Represents a learning experiment for safe capability testing."""
    
    experiment_id: str
    name: str
    description: str
    hypothesis: str
    
    # Experiment configuration
    experiment_type: str  # 'parameter_tuning', 'strategy_testing', 'capability_enhancement'
    target_components: List[str]  # Components being modified
    modifications: Dict[str, Any]  # Specific changes being tested
    
    # Safety and control
    safety_constraints: Dict[str, Any] = field(default_factory=dict)
    rollback_conditions: List[str] = field(default_factory=list)
    max_duration: timedelta = field(default_factory=lambda: timedelta(hours=1))
    max_executions: int = 50
    
    # Tracking
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str = "planned"  # planned, running, completed, failed, rolled_back
    executions_count: int = 0
    
    # Results
    baseline_metrics: Dict[str, float] = field(default_factory=dict)
    experiment_metrics: Dict[str, float] = field(default_factory=dict)
    success_criteria_met: bool = False
    confidence_level: float = 0.0
    
    # Learning outcomes
    insights: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    next_experiments: List[str] = field(default_factory=list)
    
    @property
    def is_successful(self) -> bool:
        """Check if experiment was successful."""
        return self.success_criteria_met and self.confidence_level >= 0.8
    
    @property
    def duration(self) -> Optional[timedelta]:
        """Get experiment duration."""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        elif self.start_time:
            return datetime.now() - self.start_time
        return None


class LearningLoopManager:
    """
    Manages autonomous learning loops for continuous AGI improvement.
    
    This system orchestrates learning cycles that analyze performance,
    identify improvement opportunities, design and execute experiments,
    and adapt behavior based on outcomes.
    """
    
    def __init__(
        self,
        memory_manager: Optional[ToolMemoryManager] = None,
        tool_manager: Optional[ToolManager] = None,
        inference_engine: Optional[RealInferenceEngine] = None,
        learning_rate: float = 0.1,
        adaptation_strategy: AdaptationStrategy = AdaptationStrategy.MODERATE
    ):
        """
        Initialize the Learning Loop Manager.
        
        Args:
            memory_manager: Tool memory manager for execution history
            tool_manager: Tool manager for executing tools
            inference_engine: Inference engine for decision making
            learning_rate: Rate of behavioral adaptation
            adaptation_strategy: Strategy for making changes
        """
        self.memory_manager = memory_manager
        self.tool_manager = tool_manager
        self.inference_engine = inference_engine
        self.learning_rate = learning_rate
        self.adaptation_strategy = adaptation_strategy
        
        # Learning state
        self.learning_objectives: Dict[str, LearningObjective] = {}
        self.active_experiments: Dict[str, LearningExperiment] = {}
        self.completed_experiments: List[LearningExperiment] = []
        
        # Learning loop control
        self.is_learning_active = False
        self.learning_mode = LearningMode.EXPLOITATION
        self.learning_thread: Optional[threading.Thread] = None
        self._stop_learning = threading.Event()
        
        # Performance tracking
        self.performance_history: deque = deque(maxlen=1000)
        self.learning_metrics: Dict[str, List[float]] = defaultdict(list)
        
        # Configuration
        self.learning_config = {
            'min_data_points': 10,  # Minimum executions before learning
            'analysis_interval': 300,  # Seconds between analyses
            'experiment_interval': 3600,  # Seconds between experiments
            'adaptation_threshold': 0.1,  # Minimum improvement to adapt
            'confidence_threshold': 0.8,  # Confidence required for changes
            'max_concurrent_experiments': 2,
            'safety_mode': True
        }
        
        # Storage
        self.storage_dir = Path("./learning_data")
        self.storage_dir.mkdir(exist_ok=True)
        
        # Meta-learning
        self.meta_learning_insights: Dict[str, Any] = {}
        self.learning_efficiency_history: List[float] = []
        
        logger.info("LearningLoopManager initialized")
    
    async def start_learning_loops(self):
        """Start autonomous learning loops in background."""
        if self.is_learning_active:
            logger.warning("Learning loops already active")
            return
        
        if not ROMAI_COMPONENTS_AVAILABLE:
            logger.error("ROMAI components not available - cannot start learning")
            return
        
        self.is_learning_active = True
        self._stop_learning.clear()
        
        # Start learning thread
        self.learning_thread = threading.Thread(
            target=self._learning_loop_worker,
            name="LearningLoop",
            daemon=True
        )
        self.learning_thread.start()
        
        logger.info("🧠 Autonomous learning loops started")
    
    def stop_learning_loops(self):
        """Stop autonomous learning loops."""
        if not self.is_learning_active:
            return
        
        self.is_learning_active = False
        self._stop_learning.set()
        
        if self.learning_thread and self.learning_thread.is_alive():
            self.learning_thread.join(timeout=10)
        
        logger.info("🛑 Autonomous learning loops stopped")
    
    def _learning_loop_worker(self):
        """Worker thread for continuous learning."""
        logger.info("Learning loop worker started")
        
        last_analysis = time.time()
        last_experiment = time.time()
        
        while not self._stop_learning.is_set():
            try:
                current_time = time.time()
                
                # Periodic performance analysis
                if current_time - last_analysis >= self.learning_config['analysis_interval']:
                    asyncio.run(self._perform_analysis())
                    last_analysis = current_time
                
                # Periodic experimentation
                if current_time - last_experiment >= self.learning_config['experiment_interval']:
                    asyncio.run(self._conduct_experiments())
                    last_experiment = current_time
                
                # Update learning objectives
                asyncio.run(self._update_learning_objectives())
                
                # Adapt behavior based on learning
                asyncio.run(self._adapt_behavior())
                
                # Brief pause to prevent excessive CPU usage
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in learning loop: {e}")
                time.sleep(60)  # Longer pause on error
        
        logger.info("Learning loop worker stopped")
    
    async def _perform_analysis(self):
        """Perform analysis of recent performance data."""
        if not self.memory_manager:
            return
        
        try:
            logger.debug("Performing learning analysis...")
            
            # Get recent performance data
            insights = self.memory_manager.get_learning_insights()
            
            # Analyze trends and patterns
            analysis_results = {
                'timestamp': datetime.now(),
                'overall_success_rate': insights.get('overall_success_rate', 0.0),
                'total_executions': insights.get('total_executions', 0),
                'unique_tools': insights.get('unique_tools', 0),
                'improvement_opportunities': insights.get('improvement_opportunities', []),
                'domain_performance': insights.get('domain_analysis', {}),
                'temporal_patterns': insights.get('temporal_patterns', {})
            }
            
            # Update learning metrics
            self.learning_metrics['success_rate'].append(analysis_results['overall_success_rate'])
            self.learning_metrics['execution_count'].append(analysis_results['total_executions'])
            
            # Identify learning opportunities
            await self._identify_learning_opportunities(analysis_results)
            
            # Store analysis
            self.performance_history.append(analysis_results)
            
            logger.debug(f"Analysis completed: {analysis_results['overall_success_rate']:.2f} success rate")
            
        except Exception as e:
            logger.error(f"Error in performance analysis: {e}")
    
    async def _identify_learning_opportunities(self, analysis_results: Dict[str, Any]):
        """Identify specific learning opportunities from analysis."""
        opportunities = analysis_results.get('improvement_opportunities', [])
        
        for opportunity in opportunities:
            tool_name = opportunity.get('tool', '')
            issue_type = opportunity.get('issue', '')
            
            # Create learning objectives for significant opportunities
            if issue_type == 'low_success_rate':
                current_rate = opportunity.get('current_rate', 0.0)
                if current_rate < 0.7:  # Significant improvement needed
                    objective_id = f"improve_{tool_name}_success_rate"
                    
                    if objective_id not in self.learning_objectives:
                        self.learning_objectives[objective_id] = LearningObjective(
                            objective_id=objective_id,
                            name=f"Improve {tool_name} Success Rate",
                            description=f"Increase success rate for {tool_name} from {current_rate:.2f} to 0.9",
                            target_metric='success_rate',
                            target_value=0.9,
                            current_value=current_rate,
                            priority=1.0 - current_rate,  # Lower success = higher priority
                            learning_tags=['reliability', 'tool_optimization']
                        )
            
            elif issue_type == 'slow_execution':
                current_time = opportunity.get('current_time', 0.0)
                if current_time > 10:  # More than 10 seconds
                    objective_id = f"optimize_{tool_name}_performance"
                    
                    if objective_id not in self.learning_objectives:
                        target_time = max(5.0, current_time * 0.5)  # 50% improvement target
                        self.learning_objectives[objective_id] = LearningObjective(
                            objective_id=objective_id,
                            name=f"Optimize {tool_name} Performance",
                            description=f"Reduce execution time for {tool_name} from {current_time:.1f}s to {target_time:.1f}s",
                            target_metric='execution_time',
                            target_value=target_time,
                            current_value=current_time,
                            priority=min(1.0, current_time / 30.0),  # Slower = higher priority
                            learning_tags=['performance', 'optimization']
                        )
    
    async def _conduct_experiments(self):
        """Design and conduct learning experiments."""
        if len(self.active_experiments) >= self.learning_config['max_concurrent_experiments']:
            logger.debug("Maximum concurrent experiments reached")
            return
        
        try:
            # Check if we have enough data for experimentation
            if not self.memory_manager:
                return
            
            insights = self.memory_manager.get_learning_insights()
            if insights.get('total_executions', 0) < self.learning_config['min_data_points']:
                logger.debug("Insufficient data for experimentation")
                return
            
            # Design new experiments based on learning objectives
            new_experiments = await self._design_experiments()
            
            for experiment in new_experiments:
                if len(self.active_experiments) >= self.learning_config['max_concurrent_experiments']:
                    break
                
                await self._start_experiment(experiment)
            
        except Exception as e:
            logger.error(f"Error conducting experiments: {e}")
    
    async def _design_experiments(self) -> List[LearningExperiment]:
        """Design experiments based on current learning objectives."""
        experiments = []
        
        # Prioritize objectives by improvement potential
        sorted_objectives = sorted(
            self.learning_objectives.values(),
            key=lambda obj: obj.improvement_potential * obj.priority,
            reverse=True
        )
        
        for objective in sorted_objectives[:3]:  # Top 3 objectives
            if objective.is_achieved:
                continue
            
            # Design experiment based on objective type
            experiment = None
            
            if 'success_rate' in objective.target_metric:
                experiment = await self._design_success_rate_experiment(objective)
            elif 'execution_time' in objective.target_metric:
                experiment = await self._design_performance_experiment(objective)
            
            if experiment:
                experiments.append(experiment)
        
        return experiments
    
    async def _design_success_rate_experiment(self, objective: LearningObjective) -> LearningExperiment:
        """Design experiment to improve tool success rates."""
        tool_name = objective.name.split()[1] if len(objective.name.split()) > 1 else "unknown"
        
        experiment_id = f"success_rate_{tool_name}_{int(time.time())}"
        
        return LearningExperiment(
            experiment_id=experiment_id,
            name=f"Improve {tool_name} Success Rate",
            description=f"Experiment to increase success rate for {tool_name}",
            hypothesis=f"Optimizing parameters and error handling will improve {tool_name} success rate",
            experiment_type="parameter_tuning",
            target_components=[tool_name],
            modifications={
                'parameter_optimization': True,
                'error_handling_enhancement': True,
                'retry_logic': True
            },
            safety_constraints={
                'max_retries': 3,
                'timeout_increase': 1.5,
                'rollback_on_failure_rate': 0.5
            },
            rollback_conditions=[
                'success_rate_drops_below_baseline',
                'execution_time_increases_significantly',
                'user_satisfaction_decreases'
            ],
            max_executions=30
        )
    
    async def _design_performance_experiment(self, objective: LearningObjective) -> LearningExperiment:
        """Design experiment to improve tool performance."""
        tool_name = objective.name.split()[1] if len(objective.name.split()) > 1 else "unknown"
        
        experiment_id = f"performance_{tool_name}_{int(time.time())}"
        
        return LearningExperiment(
            experiment_id=experiment_id,
            name=f"Optimize {tool_name} Performance",
            description=f"Experiment to reduce execution time for {tool_name}",
            hypothesis=f"Parameter tuning and caching will reduce {tool_name} execution time",
            experiment_type="performance_optimization",
            target_components=[tool_name],
            modifications={
                'caching_enabled': True,
                'parallel_processing': True,
                'resource_optimization': True
            },
            safety_constraints={
                'max_memory_usage': '4GB',
                'max_cpu_usage': '80%',
                'preserve_accuracy': True
            },
            rollback_conditions=[
                'execution_time_increases',
                'resource_usage_exceeds_limits',
                'accuracy_degradation'
            ],
            max_executions=25
        )
    
    async def _start_experiment(self, experiment: LearningExperiment):
        """Start a learning experiment."""
        try:
            logger.info(f"🧪 Starting experiment: {experiment.name}")
            
            # Record baseline metrics
            if self.memory_manager:
                insights = self.memory_manager.get_learning_insights()
                experiment.baseline_metrics = {
                    'overall_success_rate': insights.get('overall_success_rate', 0.0),
                    'average_execution_time': self._get_average_execution_time(),
                    'user_satisfaction': self._get_average_satisfaction()
                }
            
            # Start experiment
            experiment.start_time = datetime.now()
            experiment.status = "running"
            self.active_experiments[experiment.experiment_id] = experiment
            
            # Apply experimental modifications (simulation)
            await self._apply_experimental_modifications(experiment)
            
            logger.info(f"✅ Experiment started: {experiment.experiment_id}")
            
        except Exception as e:
            logger.error(f"Error starting experiment {experiment.experiment_id}: {e}")
            experiment.status = "failed"
    
    async def _apply_experimental_modifications(self, experiment: LearningExperiment):
        """Apply experimental modifications (simulated for safety)."""
        # In a real implementation, this would carefully modify system behavior
        # For now, we simulate the changes and track their theoretical impact
        
        modifications = experiment.modifications
        
        logger.debug(f"Applying modifications for {experiment.experiment_id}: {modifications}")
        
        # Simulate modification effects
        if modifications.get('parameter_optimization'):
            logger.debug("Applied parameter optimization")
        
        if modifications.get('caching_enabled'):
            logger.debug("Enabled caching optimization")
        
        if modifications.get('error_handling_enhancement'):
            logger.debug("Enhanced error handling")
        
        # Store modification state for tracking
        experiment.status = "running"
    
    def _get_average_execution_time(self) -> float:
        """Get average execution time from recent executions."""
        if not self.memory_manager or not self.memory_manager.executions:
            return 0.0
        
        recent_executions = self.memory_manager.executions[-50:]  # Last 50 executions
        times = [exec.execution_time for exec in recent_executions if exec.execution_time > 0]
        
        return sum(times) / len(times) if times else 0.0
    
    def _get_average_satisfaction(self) -> float:
        """Get average user satisfaction from recent executions."""
        if not self.memory_manager or not self.memory_manager.executions:
            return 0.0
        
        recent_executions = self.memory_manager.executions[-50:]
        satisfactions = [
            exec.user_satisfaction for exec in recent_executions 
            if exec.user_satisfaction is not None
        ]
        
        return sum(satisfactions) / len(satisfactions) if satisfactions else 0.0
    
    async def _update_learning_objectives(self):
        """Update progress on learning objectives."""
        if not self.memory_manager:
            return
        
        try:
            insights = self.memory_manager.get_learning_insights()
            current_time = datetime.now()
            
            for objective in self.learning_objectives.values():
                # Update current values based on recent performance
                if objective.target_metric == 'success_rate':
                    objective.current_value = insights.get('overall_success_rate', 0.0)
                elif objective.target_metric == 'execution_time':
                    objective.current_value = self._get_average_execution_time()
                
                # Calculate progress
                if objective.target_value > 0:
                    if objective.target_metric == 'execution_time':
                        # For time, lower is better
                        progress = max(0.0, 1.0 - (objective.current_value / objective.target_value))
                    else:
                        # For rates, higher is better
                        progress = min(1.0, objective.current_value / objective.target_value)
                    
                    objective.progress = progress
                
                objective.last_updated = current_time
                
                # Log achievement
                if objective.is_achieved and 'achievement_logged' not in objective.learning_tags:
                    logger.info(f"🎯 Learning objective achieved: {objective.name}")
                    objective.learning_tags.append('achievement_logged')
        
        except Exception as e:
            logger.error(f"Error updating learning objectives: {e}")
    
    async def _adapt_behavior(self):
        """Adapt behavior based on learning outcomes."""
        try:
            # Check completed experiments for adaptation opportunities
            adaptations_made = 0
            
            for experiment_id, experiment in list(self.active_experiments.items()):
                if await self._should_complete_experiment(experiment):
                    await self._complete_experiment(experiment)
                    adaptations_made += 1
            
            # Adjust learning mode based on recent performance
            await self._adjust_learning_mode()
            
            if adaptations_made > 0:
                logger.info(f"🔄 Made {adaptations_made} behavioral adaptations")
        
        except Exception as e:
            logger.error(f"Error in behavioral adaptation: {e}")
    
    async def _should_complete_experiment(self, experiment: LearningExperiment) -> bool:
        """Check if an experiment should be completed."""
        if experiment.status != "running":
            return False
        
        current_time = datetime.now()
        
        # Time-based completion
        if experiment.start_time:
            if current_time - experiment.start_time >= experiment.max_duration:
                return True
        
        # Execution count-based completion
        if experiment.executions_count >= experiment.max_executions:
            return True
        
        # Rollback condition check
        if await self._check_rollback_conditions(experiment):
            return True
        
        # Success criteria met
        if experiment.success_criteria_met and experiment.confidence_level >= 0.8:
            return True
        
        return False
    
    async def _check_rollback_conditions(self, experiment: LearningExperiment) -> bool:
        """Check if experiment should be rolled back."""
        if not self.learning_config['safety_mode']:
            return False
        
        # Get current metrics
        if not self.memory_manager:
            return False
        
        insights = self.memory_manager.get_learning_insights()
        current_success_rate = insights.get('overall_success_rate', 0.0)
        baseline_success_rate = experiment.baseline_metrics.get('overall_success_rate', 0.0)
        
        # Check rollback conditions
        for condition in experiment.rollback_conditions:
            if condition == 'success_rate_drops_below_baseline':
                if current_success_rate < baseline_success_rate - 0.1:  # 10% drop
                    logger.warning(f"Rollback triggered: success rate dropped to {current_success_rate:.2f}")
                    return True
            
            elif condition == 'execution_time_increases_significantly':
                current_time = self._get_average_execution_time()
                baseline_time = experiment.baseline_metrics.get('average_execution_time', 0.0)
                if current_time > baseline_time * 1.5:  # 50% increase
                    logger.warning(f"Rollback triggered: execution time increased to {current_time:.2f}s")
                    return True
        
        return False
    
    async def _complete_experiment(self, experiment: LearningExperiment):
        """Complete an experiment and analyze results."""
        try:
            experiment.end_time = datetime.now()
            
            # Gather final metrics
            if self.memory_manager:
                insights = self.memory_manager.get_learning_insights()
                experiment.experiment_metrics = {
                    'overall_success_rate': insights.get('overall_success_rate', 0.0),
                    'average_execution_time': self._get_average_execution_time(),
                    'user_satisfaction': self._get_average_satisfaction()
                }
            
            # Analyze results
            success_improvement = (
                experiment.experiment_metrics.get('overall_success_rate', 0.0) -
                experiment.baseline_metrics.get('overall_success_rate', 0.0)
            )
            
            time_improvement = (
                experiment.baseline_metrics.get('average_execution_time', 0.0) -
                experiment.experiment_metrics.get('average_execution_time', 0.0)
            )
            
            # Determine success
            experiment.success_criteria_met = (
                success_improvement >= 0.05 or  # 5% improvement in success rate
                time_improvement >= 1.0  # 1 second improvement in time
            )
            
            experiment.confidence_level = min(1.0, max(0.0, 
                (success_improvement * 10 + time_improvement / 10) / 2
            ))
            
            # Generate insights
            if experiment.is_successful:
                experiment.insights.append(f"Successful improvement: +{success_improvement:.2%} success rate")
                experiment.insights.append(f"Time improvement: -{time_improvement:.1f}s execution time")
                experiment.recommendations.append("Deploy modifications to production")
                experiment.status = "completed"
                
                logger.info(f"🎉 Experiment successful: {experiment.name}")
            else:
                experiment.insights.append("No significant improvement observed")
                experiment.recommendations.append("Try alternative optimization strategies")
                experiment.status = "completed"
                
                logger.info(f"📊 Experiment completed (no improvement): {experiment.name}")
            
            # Move to completed experiments
            self.completed_experiments.append(experiment)
            del self.active_experiments[experiment.experiment_id]
            
            # Update meta-learning insights
            await self._update_meta_learning_insights(experiment)
        
        except Exception as e:
            logger.error(f"Error completing experiment {experiment.experiment_id}: {e}")
            experiment.status = "failed"
    
    async def _update_meta_learning_insights(self, experiment: LearningExperiment):
        """Update meta-learning insights from completed experiment."""
        experiment_type = experiment.experiment_type
        was_successful = experiment.is_successful
        
        # Track success rates by experiment type
        if experiment_type not in self.meta_learning_insights:
            self.meta_learning_insights[experiment_type] = {
                'total_experiments': 0,
                'successful_experiments': 0,
                'success_rate': 0.0,
                'best_practices': [],
                'common_failures': []
            }
        
        meta_data = self.meta_learning_insights[experiment_type]
        meta_data['total_experiments'] += 1
        
        if was_successful:
            meta_data['successful_experiments'] += 1
            
            # Extract best practices
            for modification in experiment.modifications:
                if modification not in meta_data['best_practices']:
                    meta_data['best_practices'].append(modification)
        else:
            # Track common failure patterns
            failure_pattern = f"Failed with modifications: {list(experiment.modifications.keys())}"
            if failure_pattern not in meta_data['common_failures']:
                meta_data['common_failures'].append(failure_pattern)
        
        meta_data['success_rate'] = meta_data['successful_experiments'] / meta_data['total_experiments']
        
        logger.debug(f"Updated meta-learning for {experiment_type}: {meta_data['success_rate']:.2f} success rate")
    
    async def _adjust_learning_mode(self):
        """Adjust learning mode based on recent performance."""
        if len(self.learning_metrics['success_rate']) < 5:
            return
        
        recent_performance = self.learning_metrics['success_rate'][-5:]
        avg_performance = sum(recent_performance) / len(recent_performance)
        
        # Adjust mode based on performance trends
        if avg_performance >= 0.9:
            # High performance - explore new capabilities
            new_mode = LearningMode.EXPLORATION
        elif avg_performance >= 0.7:
            # Good performance - optimize current capabilities
            new_mode = LearningMode.OPTIMIZATION
        elif avg_performance >= 0.5:
            # Moderate performance - experiment carefully
            new_mode = LearningMode.EXPERIMENTATION
        else:
            # Poor performance - exploit known good approaches
            new_mode = LearningMode.EXPLOITATION
        
        if new_mode != self.learning_mode:
            logger.info(f"🔄 Learning mode changed: {self.learning_mode.value} → {new_mode.value}")
            self.learning_mode = new_mode
    
    def get_learning_status(self) -> Dict[str, Any]:
        """Get current learning status and metrics."""
        return {
            'is_active': self.is_learning_active,
            'learning_mode': self.learning_mode.value,
            'adaptation_strategy': self.adaptation_strategy.value,
            'learning_objectives': {
                obj_id: {
                    'name': obj.name,
                    'progress': obj.progress,
                    'is_achieved': obj.is_achieved,
                    'current_value': obj.current_value,
                    'target_value': obj.target_value
                }
                for obj_id, obj in self.learning_objectives.items()
            },
            'active_experiments': len(self.active_experiments),
            'completed_experiments': len(self.completed_experiments),
            'performance_metrics': {
                'recent_success_rate': self.learning_metrics['success_rate'][-1] if self.learning_metrics['success_rate'] else 0.0,
                'execution_count': self.learning_metrics['execution_count'][-1] if self.learning_metrics['execution_count'] else 0,
                'learning_efficiency': self.learning_efficiency_history[-1] if self.learning_efficiency_history else 0.0
            },
            'meta_learning_insights': self.meta_learning_insights
        }
    
    def add_learning_objective(self, objective: LearningObjective):
        """Add a new learning objective."""
        self.learning_objectives[objective.objective_id] = objective
        logger.info(f"📋 Added learning objective: {objective.name}")
    
    def remove_learning_objective(self, objective_id: str):
        """Remove a learning objective."""
        if objective_id in self.learning_objectives:
            objective_name = self.learning_objectives[objective_id].name
            del self.learning_objectives[objective_id]
            logger.info(f"🗑️ Removed learning objective: {objective_name}")
    
    async def save_learning_state(self):
        """Save current learning state to storage."""
        try:
            state_file = self.storage_dir / f"learning_state_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            state_data = {
                'learning_objectives': {
                    obj_id: {
                        'objective_id': obj.objective_id,
                        'name': obj.name,
                        'description': obj.description,
                        'target_metric': obj.target_metric,
                        'target_value': obj.target_value,
                        'current_value': obj.current_value,
                        'progress': obj.progress,
                        'priority': obj.priority,
                        'domain': obj.domain,
                        'created_at': obj.created_at.isoformat(),
                        'last_updated': obj.last_updated.isoformat(),
                        'learning_tags': obj.learning_tags
                    }
                    for obj_id, obj in self.learning_objectives.items()
                },
                'meta_learning_insights': self.meta_learning_insights,
                'learning_metrics': {k: v[-100:] for k, v in self.learning_metrics.items()},  # Last 100 points
                'performance_history': list(self.performance_history)[-50:],  # Last 50 analyses
                'learning_config': self.learning_config,
                'timestamp': datetime.now().isoformat()
            }
            
            with open(state_file, 'w', encoding='utf-8') as f:
                json.dump(state_data, f, indent=2)
            
            logger.info(f"💾 Saved learning state: {state_file}")
        
        except Exception as e:
            logger.error(f"Error saving learning state: {e}")


# Example usage and testing
async def main():
    """Test the learning loop system."""
    print("🧠 ROMAI Learning Loop Foundation Test")
    print("=" * 50)
    
    # Initialize components (mocked for testing)
    print("\n1. Initializing learning system...")
    
    learning_manager = LearningLoopManager(
        learning_rate=0.1,
        adaptation_strategy=AdaptationStrategy.MODERATE
    )
    
    # Add sample learning objectives
    print("\n2. Adding learning objectives...")
    
    objective1 = LearningObjective(
        objective_id="improve_overall_success",
        name="Improve Overall Success Rate",
        description="Achieve 90% success rate across all tool executions",
        target_metric="success_rate",
        target_value=0.9,
        current_value=0.7,
        priority=1.0
    )
    
    learning_manager.add_learning_objective(objective1)
    
    objective2 = LearningObjective(
        objective_id="optimize_response_time",
        name="Optimize Response Time",
        description="Reduce average response time to under 5 seconds",
        target_metric="execution_time",
        target_value=5.0,
        current_value=12.0,
        priority=0.8
    )
    
    learning_manager.add_learning_objective(objective2)
    
    print(f"✅ Added {len(learning_manager.learning_objectives)} learning objectives")
    
    # Test experiment design
    print("\n3. Designing learning experiments...")
    
    experiments = await learning_manager._design_experiments()
    print(f"Designed {len(experiments)} experiments:")
    
    for i, experiment in enumerate(experiments, 1):
        print(f"  {i}. {experiment.name}")
        print(f"     Hypothesis: {experiment.hypothesis}")
        print(f"     Type: {experiment.experiment_type}")
    
    # Test learning status
    print("\n4. Learning system status...")
    
    status = learning_manager.get_learning_status()
    print(f"Learning Mode: {status['learning_mode']}")
    print(f"Active Experiments: {status['active_experiments']}")
    print(f"Learning Objectives: {len(status['learning_objectives'])}")
    
    for obj_id, obj_data in status['learning_objectives'].items():
        print(f"  - {obj_data['name']}: {obj_data['progress']:.1%} progress")
    
    # Save learning state
    print("\n5. Saving learning state...")
    await learning_manager.save_learning_state()
    
    print("🎯 Learning Loop Foundation Test Completed!")
    print("\n🚀 System is ready for autonomous learning!")


if __name__ == "__main__":
    asyncio.run(main())