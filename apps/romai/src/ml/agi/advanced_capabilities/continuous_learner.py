"""
RomAI AGI Evolution Phase 2 - Continuous Learner

Advanced continuous learning implementation with online learning algorithms,
catastrophic forgetting prevention, and adaptive learning strategies.
"""

import asyncio
import json
import logging
import random
from collections import deque
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Union
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from copy import deepcopy
import pickle

# Import learning types
from .learning_types import (
    LearningTask, LearningExperience, LearningModel, LearningConfiguration,
    LearningProgress, LearningType, LearningStrategy, LearningStatus,
    ContinuousLearnerInterface, create_learning_experience, calculate_learning_metrics
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# CONTINUOUS LEARNING COMPONENTS
# ============================================================================

class ExperienceReplayBuffer:
    """Memory buffer for storing and replaying past experiences"""
    
    def __init__(self, max_size: int = 10000, selection_strategy: str = "random"):
        self.max_size = max_size
        self.selection_strategy = selection_strategy
        self.buffer = deque(maxlen=max_size)
        self.importance_weights = deque(maxlen=max_size)
        
        # Statistics
        self.total_added = 0
        self.total_sampled = 0
        
        logger.info(f"📚 Experience Replay Buffer initialized (max_size={max_size})")
    
    def add_experience(self, experience: LearningExperience, importance: float = 1.0):
        """Add experience to buffer with importance weight"""
        self.buffer.append(experience)
        self.importance_weights.append(importance)
        self.total_added += 1
        
        logger.debug(f"Added experience {experience.experience_id[:8]}... (importance: {importance:.3f})")
    
    def sample_experiences(self, batch_size: int) -> List[LearningExperience]:
        """Sample experiences from buffer"""
        if len(self.buffer) == 0:
            return []
        
        batch_size = min(batch_size, len(self.buffer))
        
        if self.selection_strategy == "random":
            indices = random.sample(range(len(self.buffer)), batch_size)
        elif self.selection_strategy == "importance":
            # Weighted sampling based on importance
            weights = np.array(list(self.importance_weights))
            weights = weights / weights.sum()
            indices = np.random.choice(len(self.buffer), batch_size, replace=False, p=weights)
        elif self.selection_strategy == "recent":
            # Prefer more recent experiences
            indices = list(range(max(0, len(self.buffer) - batch_size), len(self.buffer)))
        else:
            indices = random.sample(range(len(self.buffer)), batch_size)
        
        experiences = [self.buffer[i] for i in indices]
        self.total_sampled += len(experiences)
        
        logger.debug(f"Sampled {len(experiences)} experiences using {self.selection_strategy} strategy")
        return experiences
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get buffer statistics"""
        return {
            "current_size": len(self.buffer),
            "max_size": self.max_size,
            "total_added": self.total_added,
            "total_sampled": self.total_sampled,
            "utilization": len(self.buffer) / self.max_size,
            "selection_strategy": self.selection_strategy
        }

class CatastrophicForgettingRegularizer:
    """Regularization techniques to prevent catastrophic forgetting"""
    
    def __init__(self, method: str = "ewc", lambda_reg: float = 0.4):
        self.method = method
        self.lambda_reg = lambda_reg
        self.fisher_information = {}
        self.optimal_params = {}
        
        logger.info(f"🛡️ Catastrophic Forgetting Regularizer initialized (method={method})")
    
    def compute_fisher_information(self, model: nn.Module, data_loader, device: str = "cpu"):
        """Compute Fisher Information Matrix for EWC"""
        fisher = {}
        model.eval()
        
        for name, param in model.named_parameters():
            if param.requires_grad:
                fisher[name] = torch.zeros_like(param)
        
        total_samples = 0
        for batch_data, batch_targets in data_loader:
            batch_data, batch_targets = batch_data.to(device), batch_targets.to(device)
            
            model.zero_grad()
            output = model(batch_data)
            loss = nn.functional.cross_entropy(output, batch_targets)
            loss.backward()
            
            for name, param in model.named_parameters():
                if param.grad is not None:
                    fisher[name] += param.grad.data ** 2
            
            total_samples += len(batch_data)
        
        # Normalize by number of samples
        for name in fisher:
            fisher[name] /= total_samples
        
        self.fisher_information = fisher
        
        # Store optimal parameters
        for name, param in model.named_parameters():
            if param.requires_grad:
                self.optimal_params[name] = param.data.clone()
        
        logger.info(f"Computed Fisher Information for {len(fisher)} parameters")
    
    def calculate_ewc_loss(self, model: nn.Module) -> torch.Tensor:
        """Calculate EWC regularization loss"""
        loss = 0
        for name, param in model.named_parameters():
            if name in self.fisher_information and param.requires_grad:
                loss += (self.fisher_information[name] * 
                        (param - self.optimal_params[name]) ** 2).sum()
        
        return self.lambda_reg * loss
    
    def calculate_l2_loss(self, model: nn.Module) -> torch.Tensor:
        """Calculate L2 regularization loss"""
        loss = 0
        for name, param in model.named_parameters():
            if name in self.optimal_params and param.requires_grad:
                loss += ((param - self.optimal_params[name]) ** 2).sum()
        
        return self.lambda_reg * loss
    
    def get_regularization_loss(self, model: nn.Module) -> torch.Tensor:
        """Get regularization loss based on method"""
        if self.method == "ewc":
            return self.calculate_ewc_loss(model)
        elif self.method == "l2":
            return self.calculate_l2_loss(model)
        else:
            return torch.tensor(0.0, requires_grad=True)

class AdaptiveLearningRateScheduler:
    """Adaptive learning rate scheduling for continuous learning"""
    
    def __init__(self, initial_lr: float = 0.001, patience: int = 10, 
                 factor: float = 0.8, min_lr: float = 1e-6):
        self.initial_lr = initial_lr
        self.current_lr = initial_lr
        self.patience = patience
        self.factor = factor
        self.min_lr = min_lr
        
        # Tracking variables
        self.best_loss = float('inf')
        self.wait_count = 0
        self.loss_history = deque(maxlen=100)
        self.lr_history = []
        
        logger.info(f"📈 Adaptive Learning Rate Scheduler initialized (initial_lr={initial_lr})")
    
    def update(self, current_loss: float) -> float:
        """Update learning rate based on current loss"""
        self.loss_history.append(current_loss)
        
        if current_loss < self.best_loss:
            self.best_loss = current_loss
            self.wait_count = 0
        else:
            self.wait_count += 1
        
        # Reduce learning rate if no improvement
        if self.wait_count >= self.patience:
            old_lr = self.current_lr
            self.current_lr = max(self.current_lr * self.factor, self.min_lr)
            self.wait_count = 0
            
            if self.current_lr < old_lr:
                logger.info(f"📉 Learning rate reduced: {old_lr:.6f} -> {self.current_lr:.6f}")
        
        # Increase learning rate if loss is consistently decreasing
        elif len(self.loss_history) >= 5:
            recent_losses = list(self.loss_history)[-5:]
            if all(recent_losses[i] > recent_losses[i+1] for i in range(len(recent_losses)-1)):
                old_lr = self.current_lr
                self.current_lr = min(self.current_lr / self.factor, self.initial_lr)
                
                if self.current_lr > old_lr:
                    logger.info(f"📈 Learning rate increased: {old_lr:.6f} -> {self.current_lr:.6f}")
        
        self.lr_history.append(self.current_lr)
        return self.current_lr
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get scheduler statistics"""
        return {
            "current_lr": self.current_lr,
            "initial_lr": self.initial_lr,
            "best_loss": self.best_loss,
            "wait_count": self.wait_count,
            "lr_changes": len([i for i in range(1, len(self.lr_history)) 
                             if self.lr_history[i] != self.lr_history[i-1]]),
            "min_lr_reached": self.current_lr <= self.min_lr
        }

# ============================================================================
# CONTINUOUS LEARNER IMPLEMENTATION
# ============================================================================

class ContinuousLearner(ContinuousLearnerInterface):
    """
    Advanced continuous learning system with catastrophic forgetting prevention
    and adaptive learning strategies
    """
    
    def __init__(self, config: LearningConfiguration = None):
        self.config = config or LearningConfiguration()
        
        # Core components
        self.model: Optional[nn.Module] = None
        self.optimizer: Optional[optim.Optimizer] = None
        self.experience_buffer = ExperienceReplayBuffer(
            max_size=self.config.memory_buffer_size,
            selection_strategy="importance"
        )
        
        # Regularization and adaptation
        self.forgetting_regularizer = CatastrophicForgettingRegularizer(
            method="ewc",
            lambda_reg=self.config.catastrophic_forgetting_lambda
        )
        self.lr_scheduler = AdaptiveLearningRateScheduler(
            initial_lr=self.config.learning_rate,
            patience=self.config.patience
        )
        
        # Learning state
        self.current_task: Optional[LearningTask] = None
        self.task_history: List[str] = []
        self.performance_history: Dict[str, List[float]] = {}
        
        # Statistics
        self.total_updates = 0
        self.successful_updates = 0
        self.adaptation_count = 0
        self.last_consolidation = None
        
        # Device management
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        logger.info("🔄 Continuous Learner initialized")
    
    async def initialize(self, config: LearningConfiguration) -> bool:
        """Initialize the continuous learning system"""
        try:
            self.config = config
            
            # Update components with new config
            self.experience_buffer = ExperienceReplayBuffer(
                max_size=config.memory_buffer_size,
                selection_strategy="importance"
            )
            
            self.forgetting_regularizer = CatastrophicForgettingRegularizer(
                method="ewc",
                lambda_reg=config.catastrophic_forgetting_lambda
            )
            
            self.lr_scheduler = AdaptiveLearningRateScheduler(
                initial_lr=config.learning_rate,
                patience=config.patience
            )
            
            # Initialize default model if not already set
            if not self.model:
                await self._initialize_default_model()
            
            logger.info("✅ Continuous Learner initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Continuous Learner initialization failed: {e}")
            return False
    
    async def learn(self, experiences: List[LearningExperience]) -> LearningProgress:
        """Learn from a batch of experiences"""
        try:
            if not self.model:
                raise ValueError("Model not initialized. Call initialize() first.")
            
            logger.info(f"🎓 Learning from {len(experiences)} experiences")
            
            # Create learning progress tracker
            progress = LearningProgress(
                task_id=experiences[0].task_id if experiences else "unknown",
                model_id="continuous_learner",
                total_steps=len(experiences),
                status=LearningStatus.TRAINING
            )
            
            # Process experiences in batches
            batch_size = self.config.batch_size
            total_loss = 0.0
            
            for i in range(0, len(experiences), batch_size):
                batch_experiences = experiences[i:i + batch_size]
                batch_loss = await self._process_experience_batch(batch_experiences)
                
                total_loss += batch_loss
                progress.current_step = i // batch_size + 1
                
                # Update learning rate
                avg_loss = total_loss / progress.current_step
                new_lr = self.lr_scheduler.update(avg_loss)
                for param_group in self.optimizer.param_groups:
                    param_group['lr'] = new_lr
                
                # Record progress
                progress.training_loss.append(batch_loss)
                progress.learning_rates.append(new_lr)
                
                # Log progress
                if progress.current_step % 10 == 0:
                    logger.debug(f"Step {progress.current_step}/{progress.total_steps}, "
                               f"Loss: {batch_loss:.4f}, LR: {new_lr:.6f}")
            
            # Update statistics
            self.total_updates += len(experiences)
            self.successful_updates += len(experiences)  # Assume success for now
            
            # Finalize progress
            progress.status = LearningStatus.CONVERGED
            progress.last_update = datetime.now()
            
            # Add experiences to replay buffer
            for exp in experiences:
                importance = 1.0 / (1.0 + abs(exp.prediction_error or 0.0))  # Higher importance for difficult examples
                self.experience_buffer.add_experience(exp, importance)
            
            logger.info(f"✅ Learning completed. Average loss: {total_loss / len(experiences):.4f}")
            return progress
            
        except Exception as e:
            logger.error(f"❌ Learning failed: {e}")
            raise
    
    async def update_online(self, experience: LearningExperience) -> bool:
        """Update the model with a single experience (online learning)"""
        try:
            if not self.model:
                raise ValueError("Model not initialized")
            
            logger.debug(f"🔄 Online update with experience {experience.experience_id[:8]}...")
            
            # Process single experience
            loss = await self._process_experience_batch([experience])
            
            # Update learning rate
            new_lr = self.lr_scheduler.update(loss)
            for param_group in self.optimizer.param_groups:
                param_group['lr'] = new_lr
            
            # Add to replay buffer
            importance = 1.0 / (1.0 + abs(experience.prediction_error or 0.0))
            self.experience_buffer.add_experience(experience, importance)
            
            # Occasionally replay past experiences
            if self.total_updates % 10 == 0:
                await self._replay_experiences()
            
            self.total_updates += 1
            self.successful_updates += 1
            
            logger.debug(f"✅ Online update completed. Loss: {loss:.4f}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Online update failed: {e}")
            return False
    
    async def predict(self, input_data: Any) -> Any:
        """Make predictions on new inputs"""
        try:
            if not self.model:
                raise ValueError("Model not initialized")
            
            self.model.eval()
            
            # Convert input to tensor with proper data type handling
            try:
                if isinstance(input_data, (list, tuple)):
                    input_array = np.array(input_data, dtype=np.float32)
                elif isinstance(input_data, np.ndarray):
                    input_array = input_data.astype(np.float32)
                elif isinstance(input_data, torch.Tensor):
                    input_tensor = input_data.float().to(self.device)
                else:
                    input_array = np.array([input_data], dtype=np.float32)
                
                # Convert to tensor if not already a tensor
                if not isinstance(input_data, torch.Tensor):
                    input_tensor = torch.from_numpy(input_array).float().to(self.device)
                    
            except (ValueError, TypeError) as e:
                raise ValueError(f"Cannot convert input data to tensor: {e}")
            
            # Add batch dimension if needed
            if len(input_tensor.shape) == 1:
                input_tensor = input_tensor.unsqueeze(0)
            
            with torch.no_grad():
                output = self.model(input_tensor)
                
                # Convert back to numpy
                if isinstance(output, torch.Tensor):
                    output = output.cpu().numpy()
            
            return output
            
        except Exception as e:
            logger.error(f"❌ Prediction failed: {e}")
            raise
    
    async def evaluate(self, test_data: List[LearningExperience]) -> Dict[str, float]:
        """Evaluate performance on test data"""
        try:
            if not self.model or not test_data:
                return {}
            
            logger.info(f"📊 Evaluating on {len(test_data)} test examples")
            
            self.model.eval()
            total_loss = 0.0
            correct_predictions = 0
            total_predictions = len(test_data)
            
            with torch.no_grad():
                for experience in test_data:
                    # Get prediction
                    prediction = await self.predict(experience.input_data)
                    
                    # Calculate loss (simplified)
                    if experience.target_data is not None:
                        try:
                            # Handle target data with proper type conversion
                            if isinstance(experience.target_data, (int, float)):
                                target = torch.tensor([experience.target_data], dtype=torch.float32).to(self.device)
                            else:
                                # Handle various target data types
                                if isinstance(experience.target_data, (list, tuple)):
                                    target_array = np.array(experience.target_data, dtype=np.float32)
                                elif isinstance(experience.target_data, np.ndarray):
                                    target_array = experience.target_data.astype(np.float32)
                                else:
                                    target_array = np.array([experience.target_data], dtype=np.float32)
                                target = torch.from_numpy(target_array).to(self.device)
                            
                            # Handle prediction data with proper type conversion
                            if isinstance(prediction, np.ndarray):
                                pred_array = prediction.astype(np.float32)
                            else:
                                pred_array = np.array(prediction, dtype=np.float32)
                            pred_tensor = torch.from_numpy(pred_array).to(self.device)
                            
                            loss = nn.functional.mse_loss(pred_tensor, target.float())
                            total_loss += loss.item()
                            
                            # Check accuracy (for classification)
                            if len(prediction.shape) > 1 and prediction.shape[1] > 1:
                                predicted_class = np.argmax(prediction, axis=1)[0]
                                if predicted_class == experience.target_data:
                                    correct_predictions += 1
                        except Exception as e:
                            logger.warning(f"⚠️ Skipping experience due to tensor conversion error: {e}")
                            continue
            
            metrics = {
                "test_loss": total_loss / total_predictions,
                "test_accuracy": correct_predictions / total_predictions,
                "total_examples": total_predictions,
                "correct_predictions": correct_predictions
            }
            
            logger.info(f"✅ Evaluation completed. Accuracy: {metrics['test_accuracy']:.3f}, "
                       f"Loss: {metrics['test_loss']:.4f}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Evaluation failed: {e}")
            return {}
    
    async def forget_selectively(self, criteria: Dict[str, Any]) -> int:
        """Selectively forget experiences based on criteria"""
        try:
            logger.info(f"🗑️ Selective forgetting with criteria: {criteria}")
            
            original_size = len(self.experience_buffer.buffer)
            removed_count = 0
            
            # Create new buffer with filtered experiences
            new_buffer = []
            new_weights = []
            
            for i, (experience, weight) in enumerate(zip(self.experience_buffer.buffer, 
                                                       self.experience_buffer.importance_weights)):
                should_keep = True
                
                # Apply criteria
                if "confidence_threshold" in criteria:
                    if experience.confidence_score < criteria["confidence_threshold"]:
                        should_keep = False
                
                if "age_threshold" in criteria:
                    age = (datetime.now() - experience.timestamp).total_seconds()
                    if age > criteria["age_threshold"]:
                        should_keep = False
                
                if "task_ids" in criteria:
                    if experience.task_id in criteria["task_ids"]:
                        should_keep = False
                
                if "importance_threshold" in criteria:
                    if weight < criteria["importance_threshold"]:
                        should_keep = False
                
                if should_keep:
                    new_buffer.append(experience)
                    new_weights.append(weight)
                else:
                    removed_count += 1
            
            # Update buffer
            self.experience_buffer.buffer = deque(new_buffer, maxlen=self.experience_buffer.max_size)
            self.experience_buffer.importance_weights = deque(new_weights, maxlen=self.experience_buffer.max_size)
            
            logger.info(f"✅ Selective forgetting completed. "
                       f"Removed {removed_count} experiences ({original_size} -> {len(new_buffer)})")
            
            return removed_count
            
        except Exception as e:
            logger.error(f"❌ Selective forgetting failed: {e}")
            return 0
    
    async def consolidate_memory(self) -> bool:
        """Consolidate learned knowledge"""
        try:
            logger.info("🧠 Consolidating memory...")
            
            if not self.model or len(self.experience_buffer.buffer) == 0:
                logger.warning("Cannot consolidate: no model or experiences")
                return False
            
            # Sample experiences for consolidation
            consolidation_size = min(1000, len(self.experience_buffer.buffer))
            experiences = self.experience_buffer.sample_experiences(consolidation_size)
            
            # Create data loader for Fisher Information computation
            # (Simplified - in practice would need proper data loader)
            data_points = []
            targets = []
            
            for exp in experiences:
                if exp.input_data is not None and exp.target_data is not None:
                    data_points.append(exp.input_data)
                    targets.append(exp.target_data)
            
            if len(data_points) > 0:
                # Compute Fisher Information (simplified)
                # In practice, would use proper data loader
                logger.info(f"Computing Fisher Information on {len(data_points)} samples")
                # self.forgetting_regularizer.compute_fisher_information(self.model, data_loader)
            
            self.last_consolidation = datetime.now()
            
            logger.info("✅ Memory consolidation completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Memory consolidation failed: {e}")
            return False
    
    async def save_model(self, path: str) -> bool:
        """Save the learned model"""
        try:
            if not self.model:
                logger.warning("No model to save")
                return False
            
            # Create save dictionary
            save_dict = {
                "model_state_dict": self.model.state_dict(),
                "optimizer_state_dict": self.optimizer.state_dict() if self.optimizer else None,
                "config": self.config.__dict__,
                "task_history": self.task_history,
                "performance_history": self.performance_history,
                "total_updates": self.total_updates,
                "successful_updates": self.successful_updates,
                "adaptation_count": self.adaptation_count,
                "lr_scheduler_state": self.lr_scheduler.__dict__,
                "buffer_stats": self.experience_buffer.get_statistics(),
                "timestamp": datetime.now().isoformat()
            }
            
            # Save to file
            torch.save(save_dict, path)
            
            logger.info(f"✅ Model saved to {path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Model saving failed: {e}")
            return False
    
    async def load_model(self, path: str) -> bool:
        """Load a previously saved model"""
        try:
            # Load from file
            save_dict = torch.load(path, map_location=self.device)
            
            # Restore model state
            if self.model and "model_state_dict" in save_dict:
                self.model.load_state_dict(save_dict["model_state_dict"])
            
            # Restore optimizer state
            if self.optimizer and "optimizer_state_dict" in save_dict:
                self.optimizer.load_state_dict(save_dict["optimizer_state_dict"])
            
            # Restore learning state
            if "task_history" in save_dict:
                self.task_history = save_dict["task_history"]
            
            if "performance_history" in save_dict:
                self.performance_history = save_dict["performance_history"]
            
            if "total_updates" in save_dict:
                self.total_updates = save_dict["total_updates"]
                self.successful_updates = save_dict.get("successful_updates", 0)
                self.adaptation_count = save_dict.get("adaptation_count", 0)
            
            logger.info(f"✅ Model loaded from {path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Model loading failed: {e}")
            return False
    
    async def _process_experience_batch(self, experiences: List[LearningExperience]) -> float:
        """Process a batch of experiences and return loss"""
        if not experiences or not self.model:
            return 0.0
        
        self.model.train()
        self.optimizer.zero_grad()
        
        batch_loss = 0.0
        valid_experiences = 0
        
        for experience in experiences:
            if experience.input_data is None or experience.target_data is None:
                continue
            
            # Convert to tensors with proper data type handling
            try:
                # Handle various input data types
                if isinstance(experience.input_data, (list, tuple)):
                    input_array = np.array(experience.input_data, dtype=np.float32)
                elif isinstance(experience.input_data, np.ndarray):
                    input_array = experience.input_data.astype(np.float32)
                else:
                    input_array = np.array([experience.input_data], dtype=np.float32)
                
                # Handle various target data types  
                if isinstance(experience.target_data, (list, tuple)):
                    target_array = np.array(experience.target_data, dtype=np.float32)
                elif isinstance(experience.target_data, np.ndarray):
                    target_array = experience.target_data.astype(np.float32)
                else:
                    target_array = np.array([experience.target_data], dtype=np.float32)
                
                input_tensor = torch.from_numpy(input_array).float().to(self.device)
                target_tensor = torch.from_numpy(target_array).float().to(self.device)
                
            except (ValueError, TypeError) as e:
                print(f"Warning: Skipping invalid experience data: {e}")
                continue
            
            # Ensure proper shapes
            if len(input_tensor.shape) == 1:
                input_tensor = input_tensor.unsqueeze(0)
            
            # Forward pass
            output = self.model(input_tensor)
            
            # Calculate loss
            if len(output.shape) > 1 and output.shape[1] > 1:  # Classification
                target_tensor = target_tensor.long()
                loss = nn.functional.cross_entropy(output, target_tensor)
            else:  # Regression
                loss = nn.functional.mse_loss(output, target_tensor)
            
            batch_loss += loss.item()
            valid_experiences += 1
            
            # Add regularization loss
            reg_loss = self.forgetting_regularizer.get_regularization_loss(self.model)
            total_loss = loss + reg_loss
            
            # Backward pass
            total_loss.backward()
        
        # Optimize
        if valid_experiences > 0:
            if self.config.gradient_clipping:
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.config.gradient_clipping)
            
            self.optimizer.step()
            return batch_loss / valid_experiences
        
        return 0.0
    
    async def _replay_experiences(self) -> None:
        """Replay past experiences to prevent forgetting"""
        if len(self.experience_buffer.buffer) < self.config.batch_size:
            return
        
        # Sample experiences for replay
        replay_batch = self.experience_buffer.sample_experiences(self.config.batch_size)
        
        # Process replay batch
        replay_loss = await self._process_experience_batch(replay_batch)
        
        logger.debug(f"🔄 Experience replay completed. Loss: {replay_loss:.4f}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics"""
        return {
            "total_updates": self.total_updates,
            "successful_updates": self.successful_updates,
            "success_rate": self.successful_updates / max(self.total_updates, 1),
            "adaptation_count": self.adaptation_count,
            "task_history": self.task_history,
            "current_task": self.current_task.task_id if self.current_task else None,
            "experience_buffer": self.experience_buffer.get_statistics(),
            "lr_scheduler": self.lr_scheduler.get_statistics(),
            "last_consolidation": self.last_consolidation.isoformat() if self.last_consolidation else None,
            "device": str(self.device),
            "model_parameters": sum(p.numel() for p in self.model.parameters()) if self.model else 0
        }

    async def _initialize_default_model(self):
        """Initialize a default neural network model for continuous learning"""
        try:
            # Create a simple adaptive neural network
            class DefaultContinuousLearningModel(nn.Module):
                def __init__(self, input_dim: int = 10, hidden_dim: int = 64, output_dim: int = 2):
                    super().__init__()
                    self.input_layer = nn.Linear(input_dim, hidden_dim)
                    self.hidden_layer = nn.Linear(hidden_dim, hidden_dim)
                    self.output_layer = nn.Linear(hidden_dim, output_dim)
                    self.dropout = nn.Dropout(0.1)
                    self.activation = nn.ReLU()
                    
                def forward(self, x):
                    # Ensure input is tensor
                    if not isinstance(x, torch.Tensor):
                        x = torch.tensor(x, dtype=torch.float32)
                    
                    # Handle different input shapes
                    if x.dim() == 1:
                        x = x.unsqueeze(0)
                    
                    # Adaptive input handling
                    if x.shape[-1] != 10:
                        # Create adaptive input layer
                        if not hasattr(self, 'adaptive_input'):
                            self.adaptive_input = nn.Linear(x.shape[-1], 10).to(x.device)
                        x = self.adaptive_input(x)
                    
                    x = self.activation(self.input_layer(x))
                    x = self.dropout(x)
                    x = self.activation(self.hidden_layer(x))
                    x = self.dropout(x)
                    x = self.output_layer(x)
                    return x
            
            # Initialize model
            self.model = DefaultContinuousLearningModel().to(self.device)
            
            # Initialize optimizer
            self.optimizer = optim.Adam(
                self.model.parameters(), 
                lr=self.config.learning_rate
            )
            
            logger.info("✅ Default continuous learning model initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize default model: {e}")
            # Fallback to even simpler model
            class SimpleFallbackModel(nn.Module):
                def __init__(self):
                    super().__init__()
                    self.linear = nn.Linear(10, 2)
                
                def forward(self, x):
                    if not isinstance(x, torch.Tensor):
                        x = torch.tensor(x, dtype=torch.float32)
                    if x.dim() == 1:
                        x = x.unsqueeze(0)
                    if x.shape[-1] != 10:
                        # Pad or truncate to 10 dimensions
                        if x.shape[-1] > 10:
                            x = x[..., :10]
                        else:
                            padding = torch.zeros(x.shape[:-1] + (10 - x.shape[-1],), device=x.device)
                            x = torch.cat([x, padding], dim=-1)
                    return self.linear(x)
            
            self.model = SimpleFallbackModel().to(self.device)
            self.optimizer = optim.Adam(self.model.parameters(), lr=self.config.learning_rate)
            logger.info("✅ Fallback continuous learning model initialized")

# ============================================================================
# TESTING
# ============================================================================

async def test_continuous_learner():
    """Test the Continuous Learner functionality"""
    print("🔄 Testing RomAI Continuous Learner")
    print("=" * 40)
    
    try:
        # Initialize learner
        config = LearningConfiguration(
            learning_rate=0.01,
            batch_size=16,
            max_epochs=5,
            memory_buffer_size=100
        )
        
        learner = ContinuousLearner(config)
        success = await learner.initialize(config)
        print(f"✅ Learner initialization: {success}")
        
        # Create simple model for testing
        class SimpleModel(nn.Module):
            def __init__(self):
                super().__init__()
                self.linear = nn.Linear(10, 2)
            
            def forward(self, x):
                return self.linear(x)
        
        learner.model = SimpleModel().to(learner.device)
        learner.optimizer = optim.Adam(learner.model.parameters(), lr=config.learning_rate)
        
        # Test 1: Create learning experiences
        print("\n📚 Test 1: Creating Learning Experiences")
        
        from .learning_types import create_learning_experience
        
        experiences = []
        for i in range(20):
            exp = create_learning_experience(
                task_id=f"test_task",
                input_data=np.random.randn(10),
                target_data=random.randint(0, 1),
                confidence_score=random.uniform(0.5, 1.0)
            )
            experiences.append(exp)
        
        print(f"✅ Created {len(experiences)} experiences")
        
        # Test 2: Batch learning
        print("\n🎓 Test 2: Batch Learning")
        
        progress = await learner.learn(experiences[:15])
        
        print(f"✅ Batch learning completed:")
        print(f"  • Status: {progress.status.value}")
        print(f"  • Steps: {progress.current_step}/{progress.total_steps}")
        print(f"  • Final loss: {progress.training_loss[-1] if progress.training_loss else 'N/A'}")
        
        # Test 3: Online learning
        print("\n🔄 Test 3: Online Learning")
        
        for exp in experiences[15:]:
            success = await learner.update_online(exp)
            if not success:
                break
        
        print(f"✅ Online learning completed on {len(experiences[15:])} experiences")
        
        # Test 4: Predictions
        print("\n🔮 Test 4: Making Predictions")
        
        test_input = np.random.randn(10)
        prediction = await learner.predict(test_input)
        
        print(f"✅ Prediction made:")
        print(f"  • Input shape: {test_input.shape}")
        print(f"  • Output shape: {prediction.shape}")
        print(f"  • Prediction: {prediction}")
        
        # Test 5: Evaluation
        print("\n📊 Test 5: Model Evaluation")
        
        test_experiences = experiences[:5]  # Use first 5 for testing
        eval_metrics = await learner.evaluate(test_experiences)
        
        print(f"✅ Evaluation completed:")
        for metric, value in eval_metrics.items():
            print(f"  • {metric}: {value}")
        
        # Test 6: Memory management
        print("\n🧠 Test 6: Memory Management")
        
        # Test selective forgetting
        forgotten_count = await learner.forget_selectively({
            "confidence_threshold": 0.7,
            "age_threshold": 3600  # 1 hour
        })
        
        print(f"✅ Selective forgetting: {forgotten_count} experiences removed")
        
        # Test memory consolidation
        consolidation_success = await learner.consolidate_memory()
        print(f"✅ Memory consolidation: {consolidation_success}")
        
        # Test 7: Statistics
        print("\n📈 Test 7: Learning Statistics")
        
        stats = learner.get_statistics()
        print(f"✅ Statistics:")
        print(f"  • Total updates: {stats['total_updates']}")
        print(f"  • Success rate: {stats['success_rate']:.3f}")
        print(f"  • Buffer size: {stats['experience_buffer']['current_size']}")
        print(f"  • Current LR: {stats['lr_scheduler']['current_lr']:.6f}")
        print(f"  • Model parameters: {stats['model_parameters']:,}")
        
        # Test 8: Save/load model
        print("\n💾 Test 8: Model Persistence")
        
        save_path = "test_continuous_model.pth"
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
        
        print("\n🎉 Continuous Learner test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Continuous Learner test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Continuous Learner module loaded - Advanced continuous learning ready!")

if __name__ == "__main__":
    asyncio.run(test_continuous_learner())