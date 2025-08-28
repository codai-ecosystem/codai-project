"""
RomAI AGI Evolution Phase 2 - Advanced Learning Systems

Main orchestrator integrating continuous learning, meta-learning,
and transfer learning for comprehensive advanced learning capabilities.
"""

import asyncio
import json
import logging
import math
from collections import defaultdict, OrderedDict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Union, Callable
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F

# Import learning components
from .learning_types import (
    LearningTask, LearningExperience, LearningModel, LearningConfiguration,
    LearningProgress, LearningType, LearningStatus, LearningStrategy,
    MetaLearningAlgorithm, TransferType, create_learning_experience,
    create_learning_task, calculate_learning_metrics, assess_task_similarity
)

from .continuous_learner import ContinuousLearner
from .meta_learner import MetaLearner
from .transfer_learner import TransferLearner

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# LEARNING STRATEGY COORDINATOR
# ============================================================================

class LearningStrategyCoordinator:
    """Coordinates between different learning strategies"""
    
    def __init__(self):
        self.strategy_performance = defaultdict(list)
        self.strategy_usage = defaultdict(int)
        self.coordination_history = []
        
        # Strategy selection weights (adaptive)
        self.strategy_weights = {
            LearningStrategy.CONTINUOUS: 1.0,
            LearningStrategy.META_LEARNING: 0.8,
            LearningStrategy.TRANSFER: 0.9,
            LearningStrategy.MULTI_TASK: 0.7,
            LearningStrategy.INCREMENTAL: 0.6
        }
        
        logger.info("🎯 Learning Strategy Coordinator initialized")
    
    def select_optimal_strategy(self, task: LearningTask, 
                              available_strategies: List[LearningStrategy],
                              context: Dict[str, Any] = None) -> LearningStrategy:
        """Select optimal learning strategy for a task"""
        try:
            context = context or {}
            
            # Score each available strategy
            strategy_scores = {}
            
            for strategy in available_strategies:
                score = self._calculate_strategy_score(task, strategy, context)
                strategy_scores[strategy] = score
            
            # Select best strategy
            optimal_strategy = max(strategy_scores.items(), key=lambda x: x[1])[0]
            
            # Update usage statistics
            self.strategy_usage[optimal_strategy] += 1
            
            # Record coordination decision
            coordination_record = {
                "task_id": task.task_id,
                "available_strategies": [s.value for s in available_strategies],
                "strategy_scores": {s.value: score for s, score in strategy_scores.items()},
                "selected_strategy": optimal_strategy.value,
                "context": context,
                "timestamp": datetime.now().isoformat()
            }
            
            self.coordination_history.append(coordination_record)
            
            logger.info(f"🎯 Selected strategy: {optimal_strategy.value} for task {task.name}")
            return optimal_strategy
            
        except Exception as e:
            logger.error(f"❌ Strategy selection failed: {e}")
            return LearningStrategy.CONTINUOUS  # Fallback
    
    def _calculate_strategy_score(self, task: LearningTask, 
                                strategy: LearningStrategy,
                                context: Dict[str, Any]) -> float:
        """Calculate score for a learning strategy"""
        base_score = self.strategy_weights.get(strategy, 0.5)
        
        # Task-specific adjustments
        if strategy == LearningStrategy.META_LEARNING:
            # Better for few-shot scenarios
            if context.get('training_data_size', 1000) < 100:
                base_score += 0.3
            if task.num_classes and task.num_classes <= 10:
                base_score += 0.2
        
        elif strategy == LearningStrategy.TRANSFER:
            # Better when similar tasks exist
            if context.get('has_similar_tasks', False):
                base_score += 0.4
            if context.get('domain_similarity', 0.0) > 0.7:
                base_score += 0.3
        
        elif strategy == LearningStrategy.CONTINUOUS:
            # Better for streaming data
            if context.get('is_streaming', False):
                base_score += 0.3
            if context.get('data_distribution_shift', False):
                base_score += 0.2
        
        # Historical performance adjustment
        if strategy in self.strategy_performance:
            avg_performance = np.mean(self.strategy_performance[strategy])
            base_score *= (0.5 + avg_performance)  # Scale by historical success
        
        # Usage balancing (encourage diversity)
        usage_penalty = self.strategy_usage[strategy] * 0.01
        base_score -= usage_penalty
        
        return max(0.0, base_score)
    
    def update_strategy_performance(self, strategy: LearningStrategy, 
                                  performance: float):
        """Update performance statistics for a strategy"""
        self.strategy_performance[strategy].append(performance)
        
        # Keep only recent performance history
        if len(self.strategy_performance[strategy]) > 100:
            self.strategy_performance[strategy] = self.strategy_performance[strategy][-50:]
    
    def get_coordination_statistics(self) -> Dict[str, Any]:
        """Get coordination statistics"""
        return {
            "strategy_usage": dict(self.strategy_usage),
            "strategy_performance": {
                k.value: {
                    "avg_performance": np.mean(v) if v else 0.0,
                    "performance_std": np.std(v) if v else 0.0,
                    "num_evaluations": len(v)
                } for k, v in self.strategy_performance.items()
            },
            "coordination_history_size": len(self.coordination_history),
            "strategy_weights": {k.value: v for k, v in self.strategy_weights.items()}
        }

class LearningResourceManager:
    """Manages computational resources for learning processes"""
    
    def __init__(self, max_memory_gb: float = 8.0, max_cpu_cores: int = 8):
        self.max_memory_gb = max_memory_gb
        self.max_cpu_cores = max_cpu_cores
        
        # Resource tracking
        self.active_processes = {}
        self.resource_usage = {
            "memory_gb": 0.0,
            "cpu_cores": 0.0,
            "gpu_memory_gb": 0.0
        }
        
        # Resource allocation history
        self.allocation_history = []
        
        logger.info(f"📊 Resource Manager initialized (Memory: {max_memory_gb}GB, CPU: {max_cpu_cores} cores)")
    
    def allocate_resources(self, process_id: str, 
                         resource_request: Dict[str, float]) -> bool:
        """Allocate resources for a learning process"""
        try:
            # Check if resources are available
            memory_needed = resource_request.get("memory_gb", 0.0)
            cpu_needed = resource_request.get("cpu_cores", 0.0)
            gpu_needed = resource_request.get("gpu_memory_gb", 0.0)
            
            # Check availability
            if (self.resource_usage["memory_gb"] + memory_needed > self.max_memory_gb or
                self.resource_usage["cpu_cores"] + cpu_needed > self.max_cpu_cores):
                logger.warning(f"❌ Insufficient resources for process {process_id}")
                return False
            
            # Allocate resources
            self.resource_usage["memory_gb"] += memory_needed
            self.resource_usage["cpu_cores"] += cpu_needed
            self.resource_usage["gpu_memory_gb"] += gpu_needed
            
            # Record allocation
            allocation = {
                "process_id": process_id,
                "allocation": resource_request.copy(),
                "timestamp": datetime.now().isoformat(),
                "action": "allocate"
            }
            
            self.active_processes[process_id] = allocation
            self.allocation_history.append(allocation)
            
            logger.info(f"✅ Resources allocated for {process_id}: {resource_request}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Resource allocation failed: {e}")
            return False
    
    def deallocate_resources(self, process_id: str) -> bool:
        """Deallocate resources from a learning process"""
        try:
            if process_id not in self.active_processes:
                logger.warning(f"⚠️ Process {process_id} not found in active processes")
                return False
            
            # Get allocation info
            allocation = self.active_processes[process_id]
            resource_request = allocation["allocation"]
            
            # Deallocate
            self.resource_usage["memory_gb"] -= resource_request.get("memory_gb", 0.0)
            self.resource_usage["cpu_cores"] -= resource_request.get("cpu_cores", 0.0)
            self.resource_usage["gpu_memory_gb"] -= resource_request.get("gpu_memory_gb", 0.0)
            
            # Ensure non-negative values
            for key in self.resource_usage:
                self.resource_usage[key] = max(0.0, self.resource_usage[key])
            
            # Record deallocation
            deallocation = {
                "process_id": process_id,
                "allocation": resource_request.copy(),
                "timestamp": datetime.now().isoformat(),
                "action": "deallocate"
            }
            
            self.allocation_history.append(deallocation)
            del self.active_processes[process_id]
            
            logger.info(f"✅ Resources deallocated for {process_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Resource deallocation failed: {e}")
            return False
    
    def get_resource_usage(self) -> Dict[str, float]:
        """Get current resource usage"""
        return {
            "memory_utilization": self.resource_usage["memory_gb"] / self.max_memory_gb,
            "cpu_utilization": self.resource_usage["cpu_cores"] / self.max_cpu_cores,
            "active_processes": len(self.active_processes),
            **self.resource_usage
        }

class LearningPerformanceMonitor:
    """Monitors and analyzes learning performance"""
    
    def __init__(self, monitoring_window: int = 1000):
        self.monitoring_window = monitoring_window
        
        # Performance metrics storage
        self.learning_metrics = defaultdict(list)
        self.system_metrics = defaultdict(list)
        self.performance_trends = {}
        
        # Anomaly detection
        self.performance_baselines = {}
        self.anomaly_thresholds = {
            "accuracy_drop": 0.1,
            "loss_spike": 2.0,
            "learning_rate_instability": 0.5
        }
        
        logger.info("📈 Performance Monitor initialized")
    
    def record_learning_metrics(self, learner_id: str, 
                              metrics: Dict[str, float]):
        """Record learning metrics for a learner"""
        timestamp = datetime.now()
        
        # Store metrics with timestamp
        metric_record = {
            "timestamp": timestamp,
            "learner_id": learner_id,
            **metrics
        }
        
        for metric_name, value in metrics.items():
            self.learning_metrics[f"{learner_id}_{metric_name}"].append({
                "value": value,
                "timestamp": timestamp
            })
        
        # Maintain window size
        for key in self.learning_metrics:
            if len(self.learning_metrics[key]) > self.monitoring_window:
                self.learning_metrics[key] = self.learning_metrics[key][-self.monitoring_window:]
        
        # Check for anomalies
        self._check_anomalies(learner_id, metrics)
    
    def record_system_metrics(self, system_id: str,
                            metrics: Dict[str, float]):
        """Record system-level metrics"""
        timestamp = datetime.now()
        
        for metric_name, value in metrics.items():
            self.system_metrics[f"{system_id}_{metric_name}"].append({
                "value": value,
                "timestamp": timestamp
            })
        
        # Maintain window size
        for key in self.system_metrics:
            if len(self.system_metrics[key]) > self.monitoring_window:
                self.system_metrics[key] = self.system_metrics[key][-self.monitoring_window:]
    
    def _check_anomalies(self, learner_id: str, metrics: Dict[str, float]):
        """Check for performance anomalies"""
        # Establish baselines if not exist
        if learner_id not in self.performance_baselines:
            self.performance_baselines[learner_id] = {}
        
        # Check each metric
        for metric_name, value in metrics.items():
            key = f"{learner_id}_{metric_name}"
            
            if key in self.learning_metrics and len(self.learning_metrics[key]) > 10:
                # Calculate baseline statistics
                recent_values = [m["value"] for m in self.learning_metrics[key][-10:]]
                baseline_mean = np.mean(recent_values)
                baseline_std = np.std(recent_values)
                
                # Store baseline
                self.performance_baselines[learner_id][metric_name] = {
                    "mean": baseline_mean,
                    "std": baseline_std
                }
                
                # Check for anomalies
                if baseline_std > 0:
                    z_score = abs(value - baseline_mean) / baseline_std
                    
                    if z_score > 3.0:  # 3-sigma rule
                        logger.warning(f"⚠️ Anomaly detected in {learner_id}.{metric_name}: "
                                     f"value={value:.3f}, baseline={baseline_mean:.3f}±{baseline_std:.3f}")
    
    def get_performance_trends(self, learner_id: str = None) -> Dict[str, Any]:
        """Get performance trends analysis"""
        trends = {}
        
        # Select metrics to analyze
        if learner_id:
            metrics_to_analyze = {k: v for k, v in self.learning_metrics.items() 
                                if k.startswith(learner_id)}
        else:
            metrics_to_analyze = self.learning_metrics
        
        # Analyze trends for each metric
        for metric_key, metric_data in metrics_to_analyze.items():
            if len(metric_data) < 5:
                continue
            
            values = [m["value"] for m in metric_data[-20:]]  # Last 20 points
            
            # Calculate trend slope
            x = np.arange(len(values))
            if len(values) > 1:
                slope = np.polyfit(x, values, 1)[0]
                
                trends[metric_key] = {
                    "slope": slope,
                    "trend": "improving" if slope > 0.001 else "declining" if slope < -0.001 else "stable",
                    "recent_mean": np.mean(values[-5:]) if len(values) >= 5 else np.mean(values),
                    "recent_std": np.std(values[-5:]) if len(values) >= 5 else np.std(values),
                    "data_points": len(values)
                }
        
        return trends
    
    def generate_performance_report(self) -> str:
        """Generate comprehensive performance report"""
        report_lines = [
            "🎯 LEARNING PERFORMANCE REPORT",
            "=" * 50,
            f"Monitoring Window: {self.monitoring_window} samples",
            f"Monitored Learners: {len(set(k.split('_')[0] for k in self.learning_metrics.keys()))}",
            f"Total Metrics: {len(self.learning_metrics)}",
            ""
        ]
        
        # Performance trends
        trends = self.get_performance_trends()
        
        improving_metrics = [k for k, v in trends.items() if v["trend"] == "improving"]
        declining_metrics = [k for k, v in trends.items() if v["trend"] == "declining"]
        stable_metrics = [k for k, v in trends.items() if v["trend"] == "stable"]
        
        report_lines.extend([
            "📈 TREND ANALYSIS:",
            f"  Improving: {len(improving_metrics)} metrics",
            f"  Declining: {len(declining_metrics)} metrics",
            f"  Stable: {len(stable_metrics)} metrics",
            ""
        ])
        
        # Highlight concerning trends
        if declining_metrics:
            report_lines.append("⚠️ DECLINING METRICS:")
            for metric in declining_metrics[:5]:  # Top 5
                trend_data = trends[metric]
                report_lines.append(f"  • {metric}: slope={trend_data['slope']:.4f}")
            report_lines.append("")
        
        # System health
        report_lines.extend([
            "🔍 ANOMALY DETECTION:",
            f"  Baselines established: {len(self.performance_baselines)}",
            f"  Monitoring thresholds: {len(self.anomaly_thresholds)}",
            ""
        ])
        
        return "\\n".join(report_lines)

# ============================================================================
# ADVANCED LEARNING SYSTEMS
# ============================================================================

class AdvancedLearningSystems:
    """
    Main orchestrator for advanced learning capabilities integrating
    continuous learning, meta-learning, and transfer learning
    """
    
    def __init__(self, config: LearningConfiguration = None):
        self.config = config or LearningConfiguration()
        
        # Initialize learning components
        self.continuous_learner = ContinuousLearner(self.config)
        self.meta_learner = MetaLearner(self.config)
        self.transfer_learner = TransferLearner(self.config)
        
        # Initialize coordination components
        self.strategy_coordinator = LearningStrategyCoordinator()
        self.resource_manager = LearningResourceManager(
            max_memory_gb=self.config.max_memory_gb if hasattr(self.config, 'max_memory_gb') else 8.0,
            max_cpu_cores=self.config.max_cpu_cores if hasattr(self.config, 'max_cpu_cores') else 8
        )
        self.performance_monitor = LearningPerformanceMonitor()
        
        # System state
        self.active_learning_processes = {}
        self.learning_history = []
        self.system_models = {}
        
        # Integration statistics
        self.total_learning_tasks = 0
        self.successful_learning_tasks = 0
        self.integration_performance = defaultdict(list)
        
        # Device management
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        logger.info("🚀 Advanced Learning Systems initialized")
    
    async def initialize(self, config: LearningConfiguration = None) -> bool:
        """Initialize the advanced learning systems"""
        try:
            if config:
                self.config = config
            
            # Initialize all learning components
            init_tasks = [
                self.continuous_learner.initialize(self.config),
                self.meta_learner.initialize(self.config),
                self.transfer_learner.initialize(self.config)
            ]
            
            init_results = await asyncio.gather(*init_tasks, return_exceptions=True)
            
            success_count = sum(1 for result in init_results if result is True)
            
            if success_count == len(init_tasks):
                logger.info("✅ All learning systems initialized successfully")
                return True
            else:
                logger.warning(f"⚠️ Only {success_count}/{len(init_tasks)} systems initialized")
                return success_count > 0
            
        except Exception as e:
            logger.error(f"❌ Advanced Learning Systems initialization failed: {e}")
            return False
    
    async def learn_intelligently(self, experiences: List[LearningExperience],
                                task: LearningTask = None) -> LearningProgress:
        """Intelligently learn from experiences using optimal strategy"""
        try:
            if not experiences:
                raise ValueError("No experiences provided for learning")
            
            logger.info(f"🧠 Intelligent learning from {len(experiences)} experiences")
            start_time = datetime.now()
            
            # Create or infer task
            if not task:
                task = self._infer_task_from_experiences(experiences)
            
            # Allocate resources for learning
            process_id = f"learning_{task.task_id}_{start_time.timestamp()}"
            resource_request = self._estimate_resource_requirements(experiences, task)
            
            if not self.resource_manager.allocate_resources(process_id, resource_request):
                raise RuntimeError("Insufficient resources for learning")
            
            try:
                # Determine optimal learning strategy
                context = self._analyze_learning_context(experiences, task)
                available_strategies = [LearningStrategy.CONTINUOUS, LearningStrategy.META_LEARNING, 
                                      LearningStrategy.TRANSFER]
                
                optimal_strategy = self.strategy_coordinator.select_optimal_strategy(
                    task, available_strategies, context
                )
                
                logger.info(f"🎯 Selected learning strategy: {optimal_strategy.value}")
                
                # Execute learning based on strategy
                if optimal_strategy == LearningStrategy.CONTINUOUS:
                    progress = await self._continuous_learning_process(experiences, task)
                elif optimal_strategy == LearningStrategy.META_LEARNING:
                    progress = await self._meta_learning_process(experiences, task)
                elif optimal_strategy == LearningStrategy.TRANSFER:
                    progress = await self._transfer_learning_process(experiences, task)
                else:
                    # Fallback to continuous learning
                    progress = await self.continuous_learner.learn(experiences)
                
                # Monitor performance
                self._monitor_learning_performance(progress, optimal_strategy)
                
                # Update strategy performance
                strategy_performance = self._calculate_strategy_performance(progress)
                self.strategy_coordinator.update_strategy_performance(
                    optimal_strategy, strategy_performance
                )
                
                # Record learning process
                learning_time = (datetime.now() - start_time).total_seconds()
                learning_record = {
                    "process_id": process_id,
                    "task": task.task_id,
                    "strategy": optimal_strategy.value,
                    "num_experiences": len(experiences),
                    "learning_time": learning_time,
                    "performance": strategy_performance,
                    "progress": progress.status.value,
                    "timestamp": start_time.isoformat()
                }
                
                self.learning_history.append(learning_record)
                
                # Update statistics
                self.total_learning_tasks += 1
                if progress.status == LearningStatus.CONVERGED:
                    self.successful_learning_tasks += 1
                
                logger.info(f"✅ Intelligent learning completed in {learning_time:.2f}s. "
                           f"Strategy: {optimal_strategy.value}, Performance: {strategy_performance:.3f}")
                
                return progress
                
            finally:
                # Always deallocate resources
                self.resource_manager.deallocate_resources(process_id)
            
        except Exception as e:
            logger.error(f"❌ Intelligent learning failed: {e}")
            raise
    
    async def adapt_and_transfer(self, source_task: LearningTask, target_task: LearningTask,
                               support_data: List[LearningExperience],
                               transfer_type: TransferType = TransferType.FINE_TUNING) -> LearningProgress:
        """Adapt and transfer knowledge between tasks"""
        try:
            logger.info(f"🔄 Adapting and transferring: {source_task.name} -> {target_task.name}")
            
            # Check if we have a suitable source model
            source_model = self.system_models.get(source_task.task_id)
            if not source_model:
                logger.warning(f"No source model found for {source_task.task_id}")
                # Fallback to meta-learning adaptation
                return await self.meta_learner.adapt_to_task(target_task, support_data)
            
            # Add source model to transfer learner
            self.transfer_learner.add_source_model(source_task.task_id, source_model)
            
            # Create target model if needed
            if not self.transfer_learner.target_model:
                target_model = self._create_compatible_model(source_model, target_task)
                self.transfer_learner.set_target_model(target_model)
            
            # Perform transfer learning
            transfer_progress = await self.transfer_learner.transfer_knowledge(
                source_task, target_task, transfer_type
            )
            
            # If we have support data, perform meta-learning adaptation
            if support_data:
                logger.info("🎯 Performing meta-learning adaptation on support data")
                
                # Set the transferred model as the meta-learner's model
                if self.transfer_learner.target_model:
                    self.meta_learner.model = self.transfer_learner.target_model
                    await self.meta_learner._initialize_components()
                
                # Perform adaptation
                adapted_model = await self.meta_learner.adapt_to_task(target_task, support_data)
                
                # Combine transfer and adaptation results
                transfer_progress.metadata["meta_adaptation"] = adapted_model.metadata
            
            # Store the adapted model
            if self.transfer_learner.target_model:
                self.system_models[target_task.task_id] = self.transfer_learner.target_model
            
            logger.info("✅ Adapt and transfer completed successfully")
            return transfer_progress
            
        except Exception as e:
            logger.error(f"❌ Adapt and transfer failed: {e}")
            raise
    
    async def continuous_meta_learning(self, experience_stream: List[LearningExperience],
                                     learning_window: int = 100) -> LearningProgress:
        """Perform continuous meta-learning on experience stream"""
        try:
            logger.info(f"🔄 Continuous meta-learning on stream of {len(experience_stream)} experiences")
            
            # Process experiences in windows
            progress = LearningProgress(
                task_id="continuous_meta_learning",
                model_id="integrated_system",
                total_steps=len(experience_stream) // learning_window,
                status=LearningStatus.TRAINING
            )
            
            for i in range(0, len(experience_stream), learning_window):
                window_experiences = experience_stream[i:i + learning_window]
                
                # Group experiences by task for meta-learning
                task_groups = defaultdict(list)
                for exp in window_experiences:
                    task_groups[exp.task_id].append(exp)
                
                # Create meta-learning episodes
                episodes = []
                for task_id, task_exps in task_groups.items():
                    if len(task_exps) >= 10:  # Minimum for support/query split
                        # Infer task
                        task = self._infer_task_from_experiences(task_exps)
                        
                        # Split into support and query
                        mid_point = len(task_exps) // 2
                        support_data = task_exps[:mid_point]
                        query_data = task_exps[mid_point:]
                        
                        from .learning_types import create_meta_episode
                        episode = create_meta_episode(
                            support_tasks=[task],
                            query_task=task,
                            support_data=support_data,
                            query_data=query_data
                        )
                        episodes.append(episode)
                
                # Perform meta-training on episodes
                if episodes:
                    meta_progress = await self.meta_learner.meta_train(episodes)
                    
                    # Update main progress
                    progress.current_step += 1
                    progress.training_loss.extend(meta_progress.training_loss)
                    
                    # Store episode results for continuous learning
                    all_window_experiences = [exp for exps in task_groups.values() for exp in exps]
                    continuous_progress = await self.continuous_learner.learn(all_window_experiences)
                    
                    logger.info(f"Window {progress.current_step}: "
                               f"Meta episodes: {len(episodes)}, "
                               f"Continuous learning: {continuous_progress.status.value}")
            
            progress.status = LearningStatus.CONVERGED
            progress.last_update = datetime.now()
            
            logger.info("✅ Continuous meta-learning completed")
            return progress
            
        except Exception as e:
            logger.error(f"❌ Continuous meta-learning failed: {e}")
            raise
    
    async def predict_with_confidence(self, input_data: Any, 
                                    task_context: LearningTask = None) -> Dict[str, Any]:
        """Make predictions with confidence estimation"""
        try:
            predictions = {}
            
            # Get predictions from all learners
            if self.continuous_learner:
                try:
                    continuous_pred = await self.continuous_learner.predict(input_data)
                    predictions["continuous"] = continuous_pred
                except Exception as e:
                    logger.warning(f"Continuous learner prediction failed: {e}")
            
            if self.meta_learner and self.meta_learner.model:
                try:
                    meta_pred = await self.meta_learner.predict(input_data)
                    predictions["meta"] = meta_pred
                except Exception as e:
                    logger.warning(f"Meta learner prediction failed: {e}")
            
            if self.transfer_learner and self.transfer_learner.target_model:
                try:
                    transfer_pred = await self.transfer_learner.predict(input_data)
                    predictions["transfer"] = transfer_pred
                except Exception as e:
                    logger.warning(f"Transfer learner prediction failed: {e}")
            
            if not predictions:
                raise ValueError("No learners available for prediction")
            
            # Ensemble predictions with confidence
            ensemble_result = self._ensemble_predictions_with_confidence(predictions, task_context)
            
            return ensemble_result
            
        except Exception as e:
            logger.error(f"❌ Confident prediction failed: {e}")
            raise
    
    async def evaluate_system_performance(self, test_data: List[LearningExperience]) -> Dict[str, Any]:
        """Comprehensive evaluation of the integrated system"""
        try:
            logger.info(f"📊 Evaluating system performance on {len(test_data)} examples")
            
            # Evaluate each learning component
            evaluation_results = {}
            
            # Continuous learner evaluation
            try:
                continuous_eval = await self.continuous_learner.evaluate(test_data)
                evaluation_results["continuous_learner"] = continuous_eval
            except Exception as e:
                logger.warning(f"Continuous learner evaluation failed: {e}")
                evaluation_results["continuous_learner"] = {}
            
            # Meta learner evaluation
            try:
                meta_eval = await self.meta_learner.evaluate(test_data)
                evaluation_results["meta_learner"] = meta_eval
            except Exception as e:
                logger.warning(f"Meta learner evaluation failed: {e}")
                evaluation_results["meta_learner"] = {}
            
            # Transfer learner evaluation
            try:
                transfer_eval = await self.transfer_learner.evaluate(test_data)
                evaluation_results["transfer_learner"] = transfer_eval
            except Exception as e:
                logger.warning(f"Transfer learner evaluation failed: {e}")
                evaluation_results["transfer_learner"] = {}
            
            # System-level metrics
            system_stats = {
                "total_learning_tasks": self.total_learning_tasks,
                "successful_learning_tasks": self.successful_learning_tasks,
                "success_rate": self.successful_learning_tasks / max(self.total_learning_tasks, 1),
                "active_processes": len(self.active_learning_processes),
                "system_models": len(self.system_models),
                "learning_history_size": len(self.learning_history)
            }
            
            evaluation_results["system_statistics"] = system_stats
            
            # Coordination statistics
            evaluation_results["strategy_coordination"] = self.strategy_coordinator.get_coordination_statistics()
            
            # Resource utilization
            evaluation_results["resource_utilization"] = self.resource_manager.get_resource_usage()
            
            # Performance monitoring
            evaluation_results["performance_trends"] = self.performance_monitor.get_performance_trends()
            
            logger.info("✅ System evaluation completed")
            return evaluation_results
            
        except Exception as e:
            logger.error(f"❌ System evaluation failed: {e}")
            return {}
    
    async def save_system_state(self, save_dir: str) -> bool:
        """Save the complete system state"""
        try:
            import os
            os.makedirs(save_dir, exist_ok=True)
            
            # Save individual learners
            save_tasks = []
            
            continuous_path = os.path.join(save_dir, "continuous_learner.pth")
            save_tasks.append(self.continuous_learner.save_model(continuous_path))
            
            meta_path = os.path.join(save_dir, "meta_learner.pth")
            save_tasks.append(self.meta_learner.save_model(meta_path))
            
            transfer_path = os.path.join(save_dir, "transfer_learner.pth")
            save_tasks.append(self.transfer_learner.save_model(transfer_path))
            
            # Execute save tasks
            save_results = await asyncio.gather(*save_tasks, return_exceptions=True)
            successful_saves = sum(1 for result in save_results if result is True)
            
            # Save system state
            system_state = {
                "config": self.config.__dict__,
                "active_learning_processes": self.active_learning_processes,
                "learning_history": self.learning_history,
                "total_learning_tasks": self.total_learning_tasks,
                "successful_learning_tasks": self.successful_learning_tasks,
                "integration_performance": dict(self.integration_performance),
                "strategy_coordination": self.strategy_coordinator.get_coordination_statistics(),
                "resource_manager_state": {
                    "active_processes": self.resource_manager.active_processes,
                    "allocation_history": self.resource_manager.allocation_history
                },
                "timestamp": datetime.now().isoformat()
            }
            
            system_state_path = os.path.join(save_dir, "system_state.json")
            with open(system_state_path, 'w') as f:
                json.dump(system_state, f, indent=2, default=str)
            
            logger.info(f"✅ System state saved to {save_dir} ({successful_saves}/3 learners)")
            return successful_saves > 0
            
        except Exception as e:
            logger.error(f"❌ System state saving failed: {e}")
            return False
    
    async def load_system_state(self, save_dir: str) -> bool:
        """Load the complete system state"""
        try:
            import os
            
            # Load individual learners
            load_tasks = []
            
            continuous_path = os.path.join(save_dir, "continuous_learner.pth")
            if os.path.exists(continuous_path):
                load_tasks.append(self.continuous_learner.load_model(continuous_path))
            
            meta_path = os.path.join(save_dir, "meta_learner.pth")
            if os.path.exists(meta_path):
                load_tasks.append(self.meta_learner.load_model(meta_path))
            
            transfer_path = os.path.join(save_dir, "transfer_learner.pth")
            if os.path.exists(transfer_path):
                load_tasks.append(self.transfer_learner.load_model(transfer_path))
            
            # Execute load tasks
            if load_tasks:
                load_results = await asyncio.gather(*load_tasks, return_exceptions=True)
                successful_loads = sum(1 for result in load_results if result is True)
            else:
                successful_loads = 0
            
            # Load system state
            system_state_path = os.path.join(save_dir, "system_state.json")
            if os.path.exists(system_state_path):
                with open(system_state_path, 'r') as f:
                    system_state = json.load(f)
                
                # Restore system state
                if "learning_history" in system_state:
                    self.learning_history = system_state["learning_history"]
                
                if "total_learning_tasks" in system_state:
                    self.total_learning_tasks = system_state["total_learning_tasks"]
                    self.successful_learning_tasks = system_state.get("successful_learning_tasks", 0)
                
                # Restore resource manager state
                if "resource_manager_state" in system_state:
                    rm_state = system_state["resource_manager_state"]
                    self.resource_manager.active_processes = rm_state.get("active_processes", {})
                    self.resource_manager.allocation_history = rm_state.get("allocation_history", [])
            
            logger.info(f"✅ System state loaded from {save_dir} ({successful_loads} learners)")
            return successful_loads > 0
            
        except Exception as e:
            logger.error(f"❌ System state loading failed: {e}")
            return False
    
    # Helper methods
    def _infer_task_from_experiences(self, experiences: List[LearningExperience]) -> LearningTask:
        """Infer learning task from experiences"""
        # Analyze experiences to infer task properties
        unique_tasks = set(exp.task_id for exp in experiences if exp.task_id)
        
        if unique_tasks:
            task_id = list(unique_tasks)[0]  # Use first task ID
        else:
            task_id = f"inferred_task_{datetime.now().timestamp()}"
        
        # Analyze data characteristics
        input_samples = [exp.input_data for exp in experiences if exp.input_data is not None]
        target_samples = [exp.target_data for exp in experiences if exp.target_data is not None]
        
        # Infer task type
        if target_samples:
            if all(isinstance(t, (int, np.integer)) for t in target_samples[:10]):
                task_type = LearningType.SUPERVISED
                num_classes = len(set(target_samples))
            else:
                task_type = LearningType.SUPERVISED  # Regression
                num_classes = None
        else:
            task_type = LearningType.UNSUPERVISED
            num_classes = None
        
        from .learning_types import create_learning_task
        return create_learning_task(
            name=f"Task_{task_id}",
            task_type=task_type,
            domain="general",
            num_classes=num_classes
        )
    
    def _analyze_learning_context(self, experiences: List[LearningExperience], 
                                task: LearningTask) -> Dict[str, Any]:
        """Analyze context for learning strategy selection"""
        context = {
            "training_data_size": len(experiences),
            "has_similar_tasks": len(self.system_models) > 0,
            "is_streaming": hasattr(experiences[0], 'timestamp') if experiences else False,
            "data_distribution_shift": False,  # Would need actual analysis
            "domain_similarity": 0.5  # Would need domain analysis
        }
        
        # Check for similar tasks
        if self.system_models:
            # Simple heuristic for domain similarity
            for model_task_id in self.system_models.keys():
                if model_task_id in task.name or task.name in model_task_id:
                    context["domain_similarity"] = 0.8
                    break
        
        return context
    
    def _estimate_resource_requirements(self, experiences: List[LearningExperience],
                                      task: LearningTask) -> Dict[str, float]:
        """Estimate resource requirements for learning"""
        # Simple heuristic based on data size and task complexity
        base_memory = 0.5  # GB
        base_cpu = 1.0     # cores
        
        # Scale with data size
        memory_gb = base_memory + (len(experiences) / 1000) * 0.1
        cpu_cores = base_cpu + (len(experiences) / 5000) * 0.5
        
        # Scale with task complexity
        if task.num_classes and task.num_classes > 10:
            memory_gb *= 1.5
            cpu_cores *= 1.2
        
        return {
            "memory_gb": min(memory_gb, 4.0),  # Cap at 4GB
            "cpu_cores": min(cpu_cores, 4.0),  # Cap at 4 cores
            "gpu_memory_gb": 1.0 if torch.cuda.is_available() else 0.0
        }
    
    async def _continuous_learning_process(self, experiences: List[LearningExperience],
                                         task: LearningTask) -> LearningProgress:
        """Execute continuous learning process"""
        return await self.continuous_learner.learn(experiences)
    
    async def _meta_learning_process(self, experiences: List[LearningExperience],
                                   task: LearningTask) -> LearningProgress:
        """Execute meta-learning process"""
        # Convert experiences to meta-learning format
        return await self.meta_learner.learn(experiences)
    
    async def _transfer_learning_process(self, experiences: List[LearningExperience],
                                       task: LearningTask) -> LearningProgress:
        """Execute transfer learning process"""
        # Use transfer learning if we have suitable source models
        if self.system_models:
            # Find most similar source task
            best_source_task = None
            best_similarity = 0.0
            
            for source_task_id in self.system_models.keys():
                # Simple similarity heuristic
                similarity = 0.5  # Base similarity
                if task.domain in source_task_id or source_task_id in task.name:
                    similarity = 0.8
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_source_task = source_task_id
            
            if best_source_task and best_similarity > 0.6:
                # Perform transfer learning
                from .learning_types import create_learning_task
                source_task = create_learning_task(
                    name=best_source_task,
                    task_type=task.task_type,
                    domain=task.domain
                )
                
                # Add source model
                source_model = self.system_models[best_source_task]
                self.transfer_learner.add_source_model(source_task.task_id, source_model)
                
                # Create target model
                if not self.transfer_learner.target_model:
                    target_model = self._create_compatible_model(source_model, task)
                    self.transfer_learner.set_target_model(target_model)
                
                # Perform transfer
                return await self.transfer_learner.transfer_knowledge(
                    source_task, task, TransferType.FINE_TUNING
                )
        
        # Fallback to continuous learning
        return await self.continuous_learner.learn(experiences)
    
    def _monitor_learning_performance(self, progress: LearningProgress, 
                                    strategy: LearningStrategy):
        """Monitor learning performance"""
        # Extract performance metrics
        metrics = {
            "final_loss": progress.training_loss[-1] if progress.training_loss else 0.0,
            "convergence_steps": progress.current_step,
            "learning_rate": progress.learning_rates[-1] if progress.learning_rates else 0.0,
            "status": 1.0 if progress.status == LearningStatus.CONVERGED else 0.0
        }
        
        # Record with performance monitor
        learner_id = f"{strategy.value}_learner"
        self.performance_monitor.record_learning_metrics(learner_id, metrics)
        
        # Record system metrics
        resource_usage = self.resource_manager.get_resource_usage()
        self.performance_monitor.record_system_metrics("advanced_learning_systems", resource_usage)
    
    def _calculate_strategy_performance(self, progress: LearningProgress) -> float:
        """Calculate performance score for a learning strategy"""
        base_score = 0.5
        
        # Convergence bonus
        if progress.status == LearningStatus.CONVERGED:
            base_score += 0.3
        
        # Efficiency bonus (fewer steps = better)
        if progress.current_step > 0:
            efficiency = min(1.0, 100.0 / progress.current_step)  # Normalize around 100 steps
            base_score += 0.2 * efficiency
        
        # Loss improvement bonus
        if progress.training_loss and len(progress.training_loss) > 1:
            loss_improvement = (progress.training_loss[0] - progress.training_loss[-1]) / progress.training_loss[0]
            base_score += 0.2 * min(1.0, max(0.0, loss_improvement))
        
        return min(1.0, base_score)
    
    def _ensemble_predictions_with_confidence(self, predictions: Dict[str, Any],
                                            task_context: LearningTask = None) -> Dict[str, Any]:
        """Ensemble predictions with confidence estimation"""
        if not predictions:
            return {"prediction": None, "confidence": 0.0}
        
        # Convert predictions to numpy arrays
        pred_arrays = {}
        for learner, pred in predictions.items():
            if isinstance(pred, torch.Tensor):
                pred_arrays[learner] = pred.cpu().numpy()
            elif isinstance(pred, np.ndarray):
                pred_arrays[learner] = pred
            else:
                pred_arrays[learner] = np.array(pred)
        
        # Simple ensemble: average predictions
        if len(pred_arrays) > 1:
            # Ensure all predictions have same shape
            shapes = [pred.shape for pred in pred_arrays.values()]
            if len(set(shapes)) == 1:  # All same shape
                ensemble_pred = np.mean(list(pred_arrays.values()), axis=0)
                
                # Calculate confidence as inverse of prediction variance
                pred_variance = np.var(list(pred_arrays.values()), axis=0).mean()
                confidence = 1.0 / (1.0 + pred_variance)
            else:
                # Use first available prediction
                ensemble_pred = list(pred_arrays.values())[0]
                confidence = 0.5  # Medium confidence for single prediction
        else:
            ensemble_pred = list(pred_arrays.values())[0]
            confidence = 0.7  # Good confidence for single learner
        
        return {
            "prediction": ensemble_pred,
            "confidence": confidence,
            "individual_predictions": pred_arrays,
            "ensemble_method": "average"
        }
    
    def _create_compatible_model(self, source_model: nn.Module, 
                               target_task: LearningTask) -> nn.Module:
        """Create a model compatible with target task"""
        # Simple heuristic: copy source model architecture but adjust output
        try:
            # Get source model structure
            source_modules = list(source_model.children())
            
            if source_modules and hasattr(source_modules[-1], 'out_features'):
                # Replace final layer for different number of classes
                if target_task.num_classes:
                    # Clone the model structure
                    target_model = deepcopy(source_model)
                    
                    # Adjust final layer
                    final_layer = list(target_model.children())[-1]
                    if hasattr(final_layer, 'in_features') and hasattr(final_layer, 'out_features'):
                        new_final_layer = nn.Linear(final_layer.in_features, target_task.num_classes)
                        # Replace final layer
                        target_model_modules = list(target_model.children())[:-1]
                        target_model_modules.append(new_final_layer)
                        
                        # Rebuild model
                        target_model = nn.Sequential(*target_model_modules)
                    
                    return target_model.to(self.device)
            
            # Fallback: return a copy of source model
            return deepcopy(source_model).to(self.device)
            
        except Exception as e:
            logger.warning(f"Model compatibility adjustment failed: {e}")
            return deepcopy(source_model).to(self.device)
    
    def get_comprehensive_statistics(self) -> Dict[str, Any]:
        """Get comprehensive system statistics"""
        return {
            "system_overview": {
                "total_learning_tasks": self.total_learning_tasks,
                "successful_learning_tasks": self.successful_learning_tasks,
                "success_rate": self.successful_learning_tasks / max(self.total_learning_tasks, 1),
                "active_processes": len(self.active_learning_processes),
                "system_models": len(self.system_models),
                "learning_history_size": len(self.learning_history)
            },
            "continuous_learner_stats": self.continuous_learner.get_statistics(),
            "meta_learner_stats": self.meta_learner.get_statistics(),
            "transfer_learner_stats": self.transfer_learner.get_statistics(),
            "strategy_coordination": self.strategy_coordinator.get_coordination_statistics(),
            "resource_utilization": self.resource_manager.get_resource_usage(),
            "performance_trends": self.performance_monitor.get_performance_trends(),
            "integration_performance": {
                k: {
                    "avg": np.mean(v) if v else 0.0,
                    "std": np.std(v) if v else 0.0,
                    "count": len(v)
                } for k, v in self.integration_performance.items()
            }
        }

# ============================================================================
# TESTING
# ============================================================================

async def test_advanced_learning_systems():
    """Test the Advanced Learning Systems functionality"""
    print("🚀 Testing RomAI Advanced Learning Systems")
    print("=" * 45)
    
    try:
        # Initialize advanced learning systems
        config = LearningConfiguration()
        system = AdvancedLearningSystems(config)
        success = await system.initialize(config)
        print(f"✅ Advanced Learning Systems initialization: {success}")
        
        # Test 1: Intelligent learning
        print("\n🧠 Test 1: Intelligent Learning")
        
        from .learning_types import create_learning_experience, create_learning_task
        
        # Create diverse learning experiences
        experiences = []
        for i in range(50):
            exp = create_learning_experience(
                task_id="intelligent_task",
                input_data=np.random.randn(20),
                target_data=random.randint(0, 2)
            )
            experiences.append(exp)
        
        task = create_learning_task(
            name="Intelligent Learning Task",
            task_type=LearningType.SUPERVISED,
            domain="synthetic",
            num_classes=3
        )
        
        progress = await system.learn_intelligently(experiences, task)
        
        print(f"✅ Intelligent learning completed:")
        print(f"  • Status: {progress.status.value}")
        print(f"  • Steps: {progress.current_step}")
        print(f"  • Strategy: {progress.metadata.get('strategy', 'N/A')}")
        
        # Test 2: Continuous meta-learning
        print("\n🔄 Test 2: Continuous Meta-Learning")
        
        # Create experience stream with multiple tasks
        experience_stream = []
        for task_id in ["task_a", "task_b", "task_c"]:
            for i in range(30):
                exp = create_learning_experience(
                    task_id=task_id,
                    input_data=np.random.randn(15),
                    target_data=random.randint(0, 1)
                )
                exp.timestamp = datetime.now() + timedelta(seconds=i)  # Add timestamp
                experience_stream.append(exp)
        
        meta_progress = await system.continuous_meta_learning(experience_stream, learning_window=20)
        
        print(f"✅ Continuous meta-learning completed:")
        print(f"  • Status: {meta_progress.status.value}")
        print(f"  • Windows processed: {meta_progress.current_step}")
        print(f"  • Training loss points: {len(meta_progress.training_loss)}")
        
        # Test 3: Adapt and transfer
        print("\n🔄 Test 3: Adapt and Transfer")
        
        # Create source and target tasks
        source_task = create_learning_task(
            name="Source Computer Vision",
            task_type=LearningType.SUPERVISED,
            domain="computer_vision",
            num_classes=5
        )
        
        target_task = create_learning_task(
            name="Target Medical Imaging",
            task_type=LearningType.SUPERVISED,
            domain="medical_imaging",
            num_classes=3
        )
        
        # Create simple source model
        class SimpleModel(nn.Module):
            def __init__(self, num_classes=5):
                super().__init__()
                self.features = nn.Sequential(
                    nn.Linear(20, 50),
                    nn.ReLU(),
                    nn.Linear(50, 30),
                    nn.ReLU()
                )
                self.classifier = nn.Linear(30, num_classes)
            
            def forward(self, x):
                features = self.features(x)
                return self.classifier(features)
        
        source_model = SimpleModel(5)
        system.system_models[source_task.task_id] = source_model
        
        # Create support data for adaptation
        support_data = []
        for i in range(10):
            exp = create_learning_experience(
                task_id=target_task.task_id,
                input_data=np.random.randn(20),
                target_data=random.randint(0, 2)
            )
            support_data.append(exp)
        
        transfer_progress = await system.adapt_and_transfer(
            source_task, target_task, support_data, TransferType.FINE_TUNING
        )
        
        print(f"✅ Adapt and transfer completed:")
        print(f"  • Status: {transfer_progress.status.value}")
        print(f"  • Transfer time: {transfer_progress.metadata.get('transfer_time', 'N/A')}")
        print(f"  • Has meta adaptation: {'meta_adaptation' in transfer_progress.metadata}")
        
        # Test 4: Confident predictions
        print("\n🔮 Test 4: Confident Predictions")
        
        test_input = np.random.randn(20)
        prediction_result = await system.predict_with_confidence(test_input, target_task)
        
        print(f"✅ Confident prediction made:")
        print(f"  • Prediction shape: {prediction_result['prediction'].shape}")
        print(f"  • Confidence: {prediction_result['confidence']:.3f}")
        print(f"  • Individual predictions: {len(prediction_result['individual_predictions'])}")
        print(f"  • Ensemble method: {prediction_result['ensemble_method']}")
        
        # Test 5: System evaluation
        print("\n📊 Test 5: System Evaluation")
        
        # Create comprehensive test data
        test_data = []
        for i in range(25):
            exp = create_learning_experience(
                task_id=f"eval_task_{i % 3}",
                input_data=np.random.randn(20),
                target_data=random.randint(0, 2)
            )
            test_data.append(exp)
        
        eval_results = await system.evaluate_system_performance(test_data)
        
        print(f"✅ System evaluation completed:")
        print(f"  • Components evaluated: {len(eval_results)}")
        print(f"  • System success rate: {eval_results.get('system_statistics', {}).get('success_rate', 0):.3f}")
        print(f"  • Active processes: {eval_results.get('system_statistics', {}).get('active_processes', 0)}")
        
        # Test 6: Comprehensive statistics
        print("\n📈 Test 6: Comprehensive Statistics")
        
        stats = system.get_comprehensive_statistics()
        
        print(f"✅ Comprehensive statistics:")
        print(f"  • Total tasks: {stats['system_overview']['total_learning_tasks']}")
        print(f"  • Success rate: {stats['system_overview']['success_rate']:.3f}")
        print(f"  • System models: {stats['system_overview']['system_models']}")
        print(f"  • Continuous learner experiences: {stats['continuous_learner_stats']['total_experiences']}")
        print(f"  • Meta learner episodes: {stats['meta_learner_stats']['total_meta_episodes']}")
        print(f"  • Transfer learner transfers: {stats['transfer_learner_stats']['total_transfers']}")
        
        # Test 7: Performance monitoring
        print("\n📋 Test 7: Performance Monitoring")
        
        performance_report = system.performance_monitor.generate_performance_report()
        print("✅ Performance Report Generated:")
        print(performance_report[:500] + "..." if len(performance_report) > 500 else performance_report)
        
        # Test 8: System persistence
        print("\n💾 Test 8: System Persistence")
        
        save_dir = "test_advanced_learning_systems"
        save_success = await system.save_system_state(save_dir)
        print(f"✅ System save: {save_success}")
        
        if save_success:
            load_success = await system.load_system_state(save_dir)
            print(f"✅ System load: {load_success}")
            
            # Cleanup
            import shutil
            try:
                shutil.rmtree(save_dir)
            except:
                pass
        
        print("\n🎉 Advanced Learning Systems test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Advanced Learning Systems test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Advanced Learning Systems module loaded - Comprehensive learning integration ready!")

if __name__ == "__main__":
    import random
    asyncio.run(test_advanced_learning_systems())