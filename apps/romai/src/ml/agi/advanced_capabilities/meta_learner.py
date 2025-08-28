"""
RomAI AGI Evolution Phase 2 - Meta Learner

Advanced meta-learning implementation with MAML, few-shot learning,
and adaptive learning strategies for rapid task adaptation.
"""

import asyncio
import json
import logging
import math
from collections import defaultdict, OrderedDict
from datetime import datetime
from typing import Dict, List, Optional, Any, Set, Tuple, Union, Callable
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from copy import deepcopy

# Import learning types
from .learning_types import (
    LearningTask, LearningExperience, LearningModel, LearningConfiguration,
    LearningProgress, LearningType, LearningStatus, MetaLearningEpisode,
    MetaLearnerInterface, MetaLearningAlgorithm, create_learning_experience,
    create_meta_episode, calculate_learning_metrics
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# META-LEARNING COMPONENTS
# ============================================================================

class MAMLOptimizer:
    """Model-Agnostic Meta-Learning (MAML) optimizer"""
    
    def __init__(self, model: nn.Module, inner_lr: float = 0.01, 
                 meta_lr: float = 0.001, num_inner_steps: int = 5):
        self.model = model
        self.inner_lr = inner_lr
        self.meta_lr = meta_lr
        self.num_inner_steps = num_inner_steps
        
        # Meta-optimizer for outer loop
        self.meta_optimizer = optim.Adam(model.parameters(), lr=meta_lr)
        
        # Statistics
        self.total_episodes = 0
        self.adaptation_times = []
        
        logger.info(f"🎯 MAML Optimizer initialized (inner_lr={inner_lr}, meta_lr={meta_lr})")
    
    def inner_loop_update(self, support_data: List[Tuple], task_loss_fn: Callable) -> OrderedDict:
        """Perform inner loop adaptation for a single task"""
        # Create a copy of model parameters for adaptation
        adapted_params = OrderedDict()
        for name, param in self.model.named_parameters():
            adapted_params[name] = param.clone()
        
        # Perform gradient descent steps in inner loop
        for step in range(self.num_inner_steps):
            # Compute loss on support set
            support_loss = 0.0
            for input_data, target_data in support_data:
                # Forward pass with adapted parameters
                output = self._forward_with_params(input_data, adapted_params)
                loss = task_loss_fn(output, target_data)
                support_loss += loss
            
            if len(support_data) > 0:
                support_loss /= len(support_data)
            
            # Compute gradients with respect to adapted parameters
            grads = torch.autograd.grad(support_loss, adapted_params.values(), 
                                      create_graph=True, allow_unused=True)
            
            # Update adapted parameters
            for (name, param), grad in zip(adapted_params.items(), grads):
                if grad is not None:
                    adapted_params[name] = param - self.inner_lr * grad
        
        return adapted_params
    
    def outer_loop_update(self, episodes: List[Tuple]) -> float:
        """Perform outer loop meta-update"""
        self.meta_optimizer.zero_grad()
        
        total_meta_loss = 0.0
        valid_episodes = 0
        
        for support_data, query_data, task_loss_fn in episodes:
            if not support_data or not query_data:
                continue
            
            # Inner loop adaptation
            adapted_params = self.inner_loop_update(support_data, task_loss_fn)
            
            # Compute loss on query set with adapted parameters
            query_loss = 0.0
            for input_data, target_data in query_data:
                output = self._forward_with_params(input_data, adapted_params)
                loss = task_loss_fn(output, target_data)
                query_loss += loss
            
            if len(query_data) > 0:
                query_loss /= len(query_data)
                total_meta_loss += query_loss
                valid_episodes += 1
        
        if valid_episodes > 0:
            meta_loss = total_meta_loss / valid_episodes
            
            # Backward pass and meta-update
            meta_loss.backward()
            self.meta_optimizer.step()
            
            self.total_episodes += valid_episodes
            return meta_loss.item()
        
        return 0.0
    
    def _forward_with_params(self, input_data: torch.Tensor, params: OrderedDict) -> torch.Tensor:
        """Forward pass using specific parameters"""
        # This is a simplified implementation
        # In practice, would need to properly handle different layer types
        x = input_data
        
        # Apply parameters layer by layer (simplified)
        for name, param in params.items():
            if 'weight' in name and len(param.shape) == 2:  # Linear layer
                if x.dim() == 1:
                    x = x.unsqueeze(0)
                x = F.linear(x, param)
            elif 'bias' in name and len(param.shape) == 1:  # Bias
                x = x + param
        
        return x
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get MAML optimizer statistics"""
        return {
            "total_episodes": self.total_episodes,
            "inner_lr": self.inner_lr,
            "meta_lr": self.meta_lr,
            "num_inner_steps": self.num_inner_steps,
            "avg_adaptation_time": np.mean(self.adaptation_times) if self.adaptation_times else 0.0
        }

class FewShotLearningEvaluator:
    """Evaluator for few-shot learning performance"""
    
    def __init__(self):
        self.evaluation_history = []
        self.task_performance = defaultdict(list)
        
        logger.info("📊 Few-Shot Learning Evaluator initialized")
    
    def evaluate_few_shot_performance(self, model: nn.Module, test_tasks: List[Dict],
                                    k_shot: int = 5, num_query: int = 15) -> Dict[str, float]:
        """Evaluate few-shot learning performance across multiple tasks"""
        total_accuracy = 0.0
        total_loss = 0.0
        valid_tasks = 0
        
        model.eval()
        
        with torch.no_grad():
            for task in test_tasks:
                if 'support' not in task or 'query' not in task:
                    continue
                
                support_data = task['support'][:k_shot]
                query_data = task['query'][:num_query]
                
                if len(support_data) < k_shot or len(query_data) == 0:
                    continue
                
                # Simple adaptation (could use MAML here)
                task_accuracy, task_loss = self._evaluate_single_task(
                    model, support_data, query_data
                )
                
                total_accuracy += task_accuracy
                total_loss += task_loss
                valid_tasks += 1
                
                # Store task-specific performance
                task_id = task.get('task_id', f'task_{valid_tasks}')
                self.task_performance[task_id].append(task_accuracy)
        
        if valid_tasks == 0:
            return {"accuracy": 0.0, "loss": float('inf'), "num_tasks": 0}
        
        avg_accuracy = total_accuracy / valid_tasks
        avg_loss = total_loss / valid_tasks
        
        evaluation_result = {
            "accuracy": avg_accuracy,
            "loss": avg_loss,
            "num_tasks": valid_tasks,
            "k_shot": k_shot,
            "num_query": num_query,
            "timestamp": datetime.now().isoformat()
        }
        
        self.evaluation_history.append(evaluation_result)
        
        logger.info(f"📊 Few-shot evaluation: {avg_accuracy:.3f} accuracy on {valid_tasks} tasks")
        return evaluation_result
    
    def _evaluate_single_task(self, model: nn.Module, support_data: List, 
                            query_data: List) -> Tuple[float, float]:
        """Evaluate model on a single few-shot task"""
        correct = 0
        total_loss = 0.0
        
        for query_input, query_target in query_data:
            # Simple nearest neighbor based on support set (placeholder)
            output = model(query_input.unsqueeze(0))
            
            # Calculate accuracy (assuming classification)
            if len(output.shape) > 1 and output.shape[1] > 1:
                predicted = torch.argmax(output, dim=1)
                if predicted.item() == query_target:
                    correct += 1
            
            # Calculate loss
            if isinstance(query_target, int):
                query_target = torch.tensor([query_target])
            
            if len(output.shape) > 1 and output.shape[1] > 1:
                loss = F.cross_entropy(output, query_target)
            else:
                loss = F.mse_loss(output, query_target.float())
            
            total_loss += loss.item()
        
        accuracy = correct / len(query_data) if query_data else 0.0
        avg_loss = total_loss / len(query_data) if query_data else 0.0
        
        return accuracy, avg_loss
    
    def get_learning_curve(self, task_id: str = None) -> Dict[str, List[float]]:
        """Get learning curve for specific task or overall"""
        if task_id and task_id in self.task_performance:
            return {task_id: self.task_performance[task_id]}
        
        # Return overall learning curve
        overall_curve = [eval_result["accuracy"] for eval_result in self.evaluation_history]
        return {"overall": overall_curve}

class PrototypicalNetworks:
    """Prototypical Networks for few-shot learning"""
    
    def __init__(self, embedding_dim: int = 64):
        self.embedding_dim = embedding_dim
        
        # Simple embedding network (to be replaced with actual model)
        self.embedding_net = nn.Sequential(
            nn.Linear(784, 256),  # Assuming flattened image input
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, embedding_dim)
        )
        
        logger.info(f"🎯 Prototypical Networks initialized (embedding_dim={embedding_dim})")
    
    def compute_prototypes(self, support_embeddings: torch.Tensor, 
                         support_labels: torch.Tensor) -> torch.Tensor:
        """Compute class prototypes from support set"""
        unique_labels = torch.unique(support_labels)
        prototypes = []
        
        for label in unique_labels:
            mask = (support_labels == label)
            class_embeddings = support_embeddings[mask]
            prototype = torch.mean(class_embeddings, dim=0)
            prototypes.append(prototype)
        
        return torch.stack(prototypes)
    
    def classify_queries(self, query_embeddings: torch.Tensor, 
                       prototypes: torch.Tensor) -> torch.Tensor:
        """Classify query examples using prototypes"""
        # Compute distances to all prototypes
        distances = torch.cdist(query_embeddings, prototypes)
        
        # Use negative distances as logits (closer = higher probability)
        logits = -distances
        
        return F.softmax(logits, dim=1)
    
    def forward(self, support_data: torch.Tensor, support_labels: torch.Tensor,
               query_data: torch.Tensor) -> torch.Tensor:
        """Forward pass for prototypical networks"""
        # Embed support and query data
        support_embeddings = self.embedding_net(support_data)
        query_embeddings = self.embedding_net(query_data)
        
        # Compute prototypes
        prototypes = self.compute_prototypes(support_embeddings, support_labels)
        
        # Classify queries
        predictions = self.classify_queries(query_embeddings, prototypes)
        
        return predictions

# ============================================================================
# META LEARNER IMPLEMENTATION
# ============================================================================

class MetaLearner(MetaLearnerInterface):
    """
    Advanced meta-learning system with MAML, Prototypical Networks,
    and adaptive few-shot learning capabilities
    """
    
    def __init__(self, config: LearningConfiguration = None):
        self.config = config or LearningConfiguration()
        
        # Core components
        self.model: Optional[nn.Module] = None
        self.maml_optimizer: Optional[MAMLOptimizer] = None
        self.prototypical_nets: Optional[PrototypicalNetworks] = None
        self.evaluator = FewShotLearningEvaluator()
        
        # Meta-learning parameters
        self.meta_algorithm = MetaLearningAlgorithm.MAML
        self.inner_lr = self.config.inner_learning_rate
        self.meta_lr = self.config.learning_rate
        self.num_inner_steps = self.config.num_inner_steps
        
        # Learning state
        self.meta_training_history = []
        self.task_adaptations = {}
        self.adaptation_strategies = {}
        
        # Statistics
        self.total_meta_episodes = 0
        self.successful_adaptations = 0
        self.adaptation_times = []
        
        # Device management
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        logger.info("🧠 Meta Learner initialized")
    
    async def initialize(self, config: LearningConfiguration) -> bool:
        """Initialize the meta-learning system"""
        try:
            self.config = config
            
            # Update meta-learning parameters
            self.inner_lr = config.inner_learning_rate
            self.meta_lr = config.learning_rate
            self.num_inner_steps = config.num_inner_steps
            
            # Initialize components when model is set
            if self.model:
                await self._initialize_components()
            
            logger.info("✅ Meta Learner initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Meta Learner initialization failed: {e}")
            return False
    
    async def meta_train(self, episodes: List[MetaLearningEpisode]) -> LearningProgress:
        """Meta-train on multiple episodes"""
        try:
            if not self.model or not self.maml_optimizer:
                raise ValueError("Model and MAML optimizer not initialized")
            
            logger.info(f"🎯 Meta-training on {len(episodes)} episodes")
            
            # Create learning progress tracker
            progress = LearningProgress(
                task_id="meta_training",
                model_id="meta_learner",
                total_steps=len(episodes),
                status=LearningStatus.TRAINING
            )
            
            # Process episodes in batches
            batch_size = self.config.meta_batch_size
            total_meta_loss = 0.0
            
            for i in range(0, len(episodes), batch_size):
                batch_episodes = episodes[i:i + batch_size]
                
                # Prepare episode data for MAML
                episode_data = []
                for episode in batch_episodes:
                    support_data = await self._prepare_episode_data(episode.support_data)
                    query_data = await self._prepare_episode_data(episode.query_data)
                    
                    task_loss_fn = self._get_task_loss_function(episode.query_task)
                    episode_data.append((support_data, query_data, task_loss_fn))
                
                # Perform meta-update
                meta_loss = self.maml_optimizer.outer_loop_update(episode_data)
                total_meta_loss += meta_loss
                
                # Update progress
                progress.current_step = (i // batch_size) + 1
                progress.training_loss.append(meta_loss)
                progress.learning_rates.append(self.meta_lr)
                
                logger.debug(f"Meta-batch {progress.current_step}: loss = {meta_loss:.4f}")
            
            # Finalize progress
            avg_meta_loss = total_meta_loss / max(progress.current_step, 1)
            progress.status = LearningStatus.CONVERGED
            progress.last_update = datetime.now()
            
            # Update statistics
            self.total_meta_episodes += len(episodes)
            self.meta_training_history.append({
                "episodes": len(episodes),
                "avg_loss": avg_meta_loss,
                "timestamp": datetime.now()
            })
            
            logger.info(f"✅ Meta-training completed. Average meta-loss: {avg_meta_loss:.4f}")
            return progress
            
        except Exception as e:
            logger.error(f"❌ Meta-training failed: {e}")
            raise
    
    async def adapt_to_task(self, task: LearningTask, 
                          support_data: List[LearningExperience]) -> LearningModel:
        """Quickly adapt to a new task"""
        try:
            if not self.model:
                raise ValueError("Model not initialized")
            
            logger.info(f"🎯 Adapting to task: {task.name}")
            start_time = datetime.now()
            
            # Prepare support data
            prepared_support = await self._prepare_episode_data(support_data)
            
            if not prepared_support:
                logger.warning("No valid support data for adaptation")
                return self._create_adapted_model(task, 0.0)
            
            # Get task-specific loss function
            task_loss_fn = self._get_task_loss_function(task)
            
            # Perform adaptation using MAML
            if self.maml_optimizer:
                adapted_params = self.maml_optimizer.inner_loop_update(
                    prepared_support, task_loss_fn
                )
                
                # Create adapted model
                adapted_model = self._create_model_from_params(adapted_params)
            else:
                # Fallback: simple fine-tuning
                adapted_model = await self._simple_adaptation(task, support_data)
            
            # Calculate adaptation time
            adaptation_time = (datetime.now() - start_time).total_seconds()
            self.adaptation_times.append(adaptation_time)
            
            # Store adaptation information
            self.task_adaptations[task.task_id] = {
                "task": task,
                "support_size": len(support_data),
                "adaptation_time": adaptation_time,
                "timestamp": datetime.now()
            }
            
            self.successful_adaptations += 1
            
            # Create learning model
            learning_model = LearningModel(
                name=f"adapted_{task.name}",
                model_type="meta_adapted",
                training_tasks=[task.task_id],
                metadata={
                    "adaptation_time": adaptation_time,
                    "support_size": len(support_data),
                    "meta_algorithm": self.meta_algorithm.value
                }
            )
            
            logger.info(f"✅ Task adaptation completed in {adaptation_time:.2f}s")
            return learning_model
            
        except Exception as e:
            logger.error(f"❌ Task adaptation failed: {e}")
            raise
    
    async def get_adaptation_strategy(self, task: LearningTask) -> Dict[str, Any]:
        """Get optimal adaptation strategy for a task"""
        try:
            # Analyze task characteristics
            strategy = {
                "algorithm": self.meta_algorithm.value,
                "inner_lr": self.inner_lr,
                "num_inner_steps": self.num_inner_steps,
                "recommended_support_size": 5,
                "estimated_adaptation_time": 1.0
            }
            
            # Task-specific recommendations
            if task.task_type == LearningType.SUPERVISED:
                if task.num_classes and task.num_classes > 10:
                    strategy["recommended_support_size"] = max(10, task.num_classes)
                    strategy["num_inner_steps"] = min(10, self.num_inner_steps + 2)
                elif task.num_classes and task.num_classes <= 5:
                    strategy["recommended_support_size"] = 5
                    strategy["num_inner_steps"] = max(3, self.num_inner_steps - 1)
            
            # Domain-specific adjustments
            if task.domain == "computer_vision":
                strategy["inner_lr"] = max(0.001, self.inner_lr * 0.5)  # Lower LR for vision
            elif task.domain == "natural_language_processing":
                strategy["inner_lr"] = min(0.1, self.inner_lr * 2.0)  # Higher LR for NLP
            
            # Historical adaptation performance
            if task.task_id in self.task_adaptations:
                prev_adaptation = self.task_adaptations[task.task_id]
                strategy["estimated_adaptation_time"] = prev_adaptation["adaptation_time"]
            elif self.adaptation_times:
                strategy["estimated_adaptation_time"] = np.mean(self.adaptation_times)
            
            # Store strategy for future reference
            self.adaptation_strategies[task.task_id] = strategy
            
            logger.info(f"🎯 Generated adaptation strategy for {task.name}")
            return strategy
            
        except Exception as e:
            logger.error(f"❌ Adaptation strategy generation failed: {e}")
            return {}
    
    async def learn(self, experiences: List[LearningExperience]) -> LearningProgress:
        """Learn from experiences (convert to meta-learning episodes)"""
        try:
            # Group experiences by task for meta-learning
            task_experiences = defaultdict(list)
            for exp in experiences:
                task_experiences[exp.task_id].append(exp)
            
            # Create meta-learning episodes
            episodes = []
            for task_id, task_exps in task_experiences.items():
                if len(task_exps) < 10:  # Need minimum examples for support/query split
                    continue
                
                # Split into support and query
                mid_point = len(task_exps) // 2
                support_data = task_exps[:mid_point]
                query_data = task_exps[mid_point:]
                
                # Create dummy task (would be provided in real scenario)
                from .learning_types import create_learning_task
                task = create_learning_task(
                    name=f"task_{task_id}",
                    task_type=LearningType.SUPERVISED,
                    domain="general"
                )
                
                episode = create_meta_episode(
                    support_tasks=[task],
                    query_task=task,
                    support_data=support_data,
                    query_data=query_data
                )
                episodes.append(episode)
            
            if episodes:
                return await self.meta_train(episodes)
            else:
                logger.warning("Not enough experiences to create meta-learning episodes")
                return LearningProgress(status=LearningStatus.ERROR)
            
        except Exception as e:
            logger.error(f"❌ Learning from experiences failed: {e}")
            raise
    
    async def predict(self, input_data: Any) -> Any:
        """Make predictions using the meta-learned model"""
        try:
            if not self.model:
                raise ValueError("Model not initialized")
            
            self.model.eval()
            
            # Convert input to tensor if needed
            if isinstance(input_data, np.ndarray):
                input_tensor = torch.from_numpy(input_data).float().to(self.device)
            elif isinstance(input_data, torch.Tensor):
                input_tensor = input_data.to(self.device)
            else:
                raise ValueError(f"Unsupported input type: {type(input_data)}")
            
            # Add batch dimension if needed
            if len(input_tensor.shape) == 1:
                input_tensor = input_tensor.unsqueeze(0)
            
            with torch.no_grad():
                output = self.model(input_tensor)
                
                if isinstance(output, torch.Tensor):
                    output = output.cpu().numpy()
            
            return output
            
        except Exception as e:
            logger.error(f"❌ Prediction failed: {e}")
            raise
    
    async def evaluate(self, test_data: List[LearningExperience]) -> Dict[str, float]:
        """Evaluate meta-learning performance"""
        try:
            if not test_data:
                return {}
            
            logger.info(f"📊 Evaluating meta-learner on {len(test_data)} examples")
            
            # Group by task for few-shot evaluation
            task_groups = defaultdict(list)
            for exp in test_data:
                task_groups[exp.task_id].append(exp)
            
            # Prepare test tasks for few-shot evaluation
            test_tasks = []
            for task_id, task_exps in task_groups.items():
                if len(task_exps) < 10:
                    continue
                
                # Split into support and query
                mid_point = len(task_exps) // 2
                support = [(exp.input_data, exp.target_data) for exp in task_exps[:mid_point]]
                query = [(exp.input_data, exp.target_data) for exp in task_exps[mid_point:]]
                
                test_tasks.append({
                    'task_id': task_id,
                    'support': support,
                    'query': query
                })
            
            if not test_tasks:
                logger.warning("No suitable test tasks for few-shot evaluation")
                return {}
            
            # Evaluate few-shot performance
            results = self.evaluator.evaluate_few_shot_performance(
                self.model, test_tasks, k_shot=5, num_query=10
            )
            
            logger.info(f"✅ Meta-learning evaluation completed. "
                       f"Accuracy: {results['accuracy']:.3f}")
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Evaluation failed: {e}")
            return {}
    
    async def save_model(self, path: str) -> bool:
        """Save the meta-learned model"""
        try:
            if not self.model:
                logger.warning("No model to save")
                return False
            
            save_dict = {
                "model_state_dict": self.model.state_dict(),
                "config": self.config.__dict__,
                "meta_algorithm": self.meta_algorithm.value,
                "task_adaptations": self.task_adaptations,
                "adaptation_strategies": self.adaptation_strategies,
                "meta_training_history": self.meta_training_history,
                "total_meta_episodes": self.total_meta_episodes,
                "successful_adaptations": self.successful_adaptations,
                "adaptation_times": self.adaptation_times,
                "maml_stats": self.maml_optimizer.get_statistics() if self.maml_optimizer else {},
                "timestamp": datetime.now().isoformat()
            }
            
            torch.save(save_dict, path)
            
            logger.info(f"✅ Meta-learner saved to {path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Meta-learner saving failed: {e}")
            return False
    
    async def load_model(self, path: str) -> bool:
        """Load a previously saved meta-learner"""
        try:
            save_dict = torch.load(path, map_location=self.device)
            
            # Restore model state
            if self.model and "model_state_dict" in save_dict:
                self.model.load_state_dict(save_dict["model_state_dict"])
            
            # Restore meta-learning state
            if "task_adaptations" in save_dict:
                self.task_adaptations = save_dict["task_adaptations"]
            
            if "adaptation_strategies" in save_dict:
                self.adaptation_strategies = save_dict["adaptation_strategies"]
            
            if "meta_training_history" in save_dict:
                self.meta_training_history = save_dict["meta_training_history"]
            
            if "total_meta_episodes" in save_dict:
                self.total_meta_episodes = save_dict["total_meta_episodes"]
                self.successful_adaptations = save_dict.get("successful_adaptations", 0)
                self.adaptation_times = save_dict.get("adaptation_times", [])
            
            # Reinitialize components
            if self.model:
                await self._initialize_components()
            
            logger.info(f"✅ Meta-learner loaded from {path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Meta-learner loading failed: {e}")
            return False
    
    # Private helper methods
    async def _initialize_components(self):
        """Initialize meta-learning components"""
        if self.model:
            self.maml_optimizer = MAMLOptimizer(
                self.model, self.inner_lr, self.meta_lr, self.num_inner_steps
            )
            
            self.prototypical_nets = PrototypicalNetworks()
    
    async def _prepare_episode_data(self, experiences: List[LearningExperience]) -> List[Tuple]:
        """Prepare experience data for meta-learning"""
        data_pairs = []
        
        for exp in experiences:
            if exp.input_data is not None and exp.target_data is not None:
                # Convert to tensors
                input_tensor = torch.from_numpy(np.array(exp.input_data)).float()
                target_tensor = torch.tensor(exp.target_data)
                
                data_pairs.append((input_tensor, target_tensor))
        
        return data_pairs
    
    def _get_task_loss_function(self, task: LearningTask) -> Callable:
        """Get appropriate loss function for task"""
        if task.task_type == LearningType.SUPERVISED:
            if task.num_classes and task.num_classes > 1:
                return F.cross_entropy
            else:
                return F.mse_loss
        else:
            return F.mse_loss
    
    def _create_adapted_model(self, task: LearningTask, confidence: float) -> LearningModel:
        """Create learning model representation"""
        return LearningModel(
            name=f"adapted_{task.name}",
            model_type="meta_adapted",
            training_tasks=[task.task_id],
            accuracy=confidence,
            metadata={"adaptation_confidence": confidence}
        )
    
    def _create_model_from_params(self, params: OrderedDict) -> nn.Module:
        """Create model instance from parameters (placeholder)"""
        # This would create a new model instance with the adapted parameters
        # For now, return the existing model
        return self.model
    
    async def _simple_adaptation(self, task: LearningTask, 
                                support_data: List[LearningExperience]) -> nn.Module:
        """Simple adaptation fallback"""
        # Simple fine-tuning approach
        if not support_data:
            return self.model
        
        # Create temporary optimizer for adaptation
        temp_optimizer = optim.SGD(self.model.parameters(), lr=self.inner_lr)
        
        # Fine-tune for a few steps
        self.model.train()
        for _ in range(self.num_inner_steps):
            for exp in support_data[:self.config.batch_size]:
                if exp.input_data is None or exp.target_data is None:
                    continue
                
                temp_optimizer.zero_grad()
                
                input_tensor = torch.from_numpy(np.array(exp.input_data)).float().to(self.device)
                target_tensor = torch.tensor(exp.target_data).to(self.device)
                
                output = self.model(input_tensor.unsqueeze(0))
                loss = F.mse_loss(output, target_tensor.float().unsqueeze(0))
                
                loss.backward()
                temp_optimizer.step()
        
        return self.model
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive meta-learning statistics"""
        return {
            "total_meta_episodes": self.total_meta_episodes,
            "successful_adaptations": self.successful_adaptations,
            "adaptation_success_rate": self.successful_adaptations / max(self.total_meta_episodes, 1),
            "avg_adaptation_time": np.mean(self.adaptation_times) if self.adaptation_times else 0.0,
            "num_adapted_tasks": len(self.task_adaptations),
            "num_adaptation_strategies": len(self.adaptation_strategies),
            "meta_algorithm": self.meta_algorithm.value,
            "inner_lr": self.inner_lr,
            "meta_lr": self.meta_lr,
            "num_inner_steps": self.num_inner_steps,
            "maml_stats": self.maml_optimizer.get_statistics() if self.maml_optimizer else {},
            "evaluator_stats": {
                "total_evaluations": len(self.evaluator.evaluation_history),
                "num_tracked_tasks": len(self.evaluator.task_performance)
            }
        }

# ============================================================================
# TESTING
# ============================================================================

async def test_meta_learner():
    """Test the Meta Learner functionality"""
    print("🧠 Testing RomAI Meta Learner")
    print("=" * 35)
    
    try:
        # Initialize meta learner
        config = LearningConfiguration(
            inner_learning_rate=0.01,
            learning_rate=0.001,
            num_inner_steps=3,
            meta_batch_size=4
        )
        
        learner = MetaLearner(config)
        success = await learner.initialize(config)
        print(f"✅ Meta Learner initialization: {success}")
        
        # Create simple model for testing
        class SimpleMetaModel(nn.Module):
            def __init__(self):
                super().__init__()
                self.linear1 = nn.Linear(10, 20)
                self.linear2 = nn.Linear(20, 2)
            
            def forward(self, x):
                x = torch.relu(self.linear1(x))
                return self.linear2(x)
        
        learner.model = SimpleMetaModel().to(learner.device)
        await learner._initialize_components()
        
        # Test 1: Create meta-learning episodes
        print("\n🎯 Test 1: Creating Meta-Learning Episodes")
        
        from .learning_types import create_learning_task, create_learning_experience, create_meta_episode
        
        episodes = []
        for i in range(8):
            # Create task
            task = create_learning_task(
                name=f"Meta Task {i}",
                task_type=LearningType.SUPERVISED,
                domain="synthetic",
                num_classes=2
            )
            
            # Create support and query data
            support_data = []
            query_data = []
            
            for j in range(10):
                exp = create_learning_experience(
                    task_id=task.task_id,
                    input_data=np.random.randn(10),
                    target_data=random.randint(0, 1)
                )
                
                if j < 5:
                    support_data.append(exp)
                else:
                    query_data.append(exp)
            
            episode = create_meta_episode(
                support_tasks=[task],
                query_task=task,
                support_data=support_data,
                query_data=query_data
            )
            
            episodes.append(episode)
        
        print(f"✅ Created {len(episodes)} meta-learning episodes")
        
        # Test 2: Meta-training
        print("\n🎓 Test 2: Meta-Training")
        
        progress = await learner.meta_train(episodes)
        
        print(f"✅ Meta-training completed:")
        print(f"  • Status: {progress.status.value}")
        print(f"  • Steps: {progress.current_step}")
        print(f"  • Final loss: {progress.training_loss[-1] if progress.training_loss else 'N/A'}")
        
        # Test 3: Task adaptation
        print("\n🎯 Test 3: Task Adaptation")
        
        new_task = create_learning_task(
            name="New Task",
            task_type=LearningType.SUPERVISED,
            domain="new_domain",
            num_classes=2
        )
        
        support_experiences = []
        for i in range(5):
            exp = create_learning_experience(
                task_id=new_task.task_id,
                input_data=np.random.randn(10),
                target_data=random.randint(0, 1)
            )
            support_experiences.append(exp)
        
        adapted_model = await learner.adapt_to_task(new_task, support_experiences)
        
        print(f"✅ Task adaptation completed:")
        print(f"  • Adapted model: {adapted_model.name}")
        print(f"  • Model type: {adapted_model.model_type}")
        print(f"  • Training tasks: {len(adapted_model.training_tasks)}")
        
        # Test 4: Adaptation strategy
        print("\n📋 Test 4: Adaptation Strategy")
        
        strategy = await learner.get_adaptation_strategy(new_task)
        
        print(f"✅ Generated adaptation strategy:")
        print(f"  • Algorithm: {strategy.get('algorithm')}")
        print(f"  • Inner LR: {strategy.get('inner_lr')}")
        print(f"  • Support size: {strategy.get('recommended_support_size')}")
        print(f"  • Adaptation time: {strategy.get('estimated_adaptation_time'):.2f}s")
        
        # Test 5: Predictions
        print("\n🔮 Test 5: Making Predictions")
        
        test_input = np.random.randn(10)
        prediction = await learner.predict(test_input)
        
        print(f"✅ Prediction made:")
        print(f"  • Input shape: {test_input.shape}")
        print(f"  • Output shape: {prediction.shape}")
        print(f"  • Prediction: {prediction}")
        
        # Test 6: Evaluation
        print("\n📊 Test 6: Meta-Learning Evaluation")
        
        # Create test data from episodes
        test_experiences = []
        for episode in episodes[:3]:
            test_experiences.extend(episode.support_data[:3])
        
        eval_results = await learner.evaluate(test_experiences)
        
        print(f"✅ Evaluation completed:")
        for metric, value in eval_results.items():
            print(f"  • {metric}: {value}")
        
        # Test 7: Statistics
        print("\n📈 Test 7: Meta-Learning Statistics")
        
        stats = learner.get_statistics()
        
        print(f"✅ Statistics:")
        print(f"  • Total episodes: {stats['total_meta_episodes']}")
        print(f"  • Successful adaptations: {stats['successful_adaptations']}")
        print(f"  • Adaptation success rate: {stats['adaptation_success_rate']:.3f}")
        print(f"  • Avg adaptation time: {stats['avg_adaptation_time']:.3f}s")
        print(f"  • Meta algorithm: {stats['meta_algorithm']}")
        print(f"  • MAML episodes: {stats['maml_stats'].get('total_episodes', 0)}")
        
        # Test 8: Model persistence
        print("\n💾 Test 8: Model Persistence")
        
        save_path = "test_meta_learner.pth"
        save_success = await learner.save_model(save_path)
        print(f"✅ Model save: {save_success}")
        
        if save_success:
            load_success = await learner.load_model(save_path)
            print(f"✅ Model load: {load_success}")
            
            # Cleanup
            import os
            try:
                os.remove(save_path)
            except:
                pass
        
        print("\n🎉 Meta Learner test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Meta Learner test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Meta Learner module loaded - Advanced meta-learning ready!")

if __name__ == "__main__":
    asyncio.run(test_meta_learner())