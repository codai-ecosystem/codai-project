#!/usr/bin/env python3
"""
RomAI Continuous Learning Pipeline - TODO #8
Advanced continuous learning system with online learning, experience replay, 
meta-learning, and knowledge consolidation to prevent catastrophic forgetting

Key Features:
- Online Learning: Real-time adaptation to new data
- Experience Replay: Memory buffer to prevent forgetting
- Meta-Learning (MAML): Few-shot learning capabilities
- Knowledge Consolidation: Stable knowledge integration
- Elastic Weight Consolidation: Protect important weights
- Synaptic Intelligence: Dynamic importance estimation
"""

import asyncio
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset, Dataset
import numpy as np
import logging
from typing import Dict, List, Tuple, Any, Optional, Union, Callable
from dataclasses import dataclass, field
from collections import deque, defaultdict
import json
import time
import pickle
import threading
import uuid
from abc import ABC, abstractmethod
import math
from datetime import datetime, timedelta
import hashlib
import random
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LearningExperience:
    """Single learning experience for replay buffer"""
    task_id: str
    input_data: torch.Tensor
    target_data: torch.Tensor
    context: Dict[str, Any]
    timestamp: float
    importance: float = 1.0
    replay_count: int = 0
    performance_score: float = 0.0

@dataclass
class TaskMetadata:
    """Metadata for learning tasks"""
    task_id: str
    task_type: str
    domain: str
    difficulty: float
    data_size: int
    created_at: float
    last_updated: float
    performance_history: List[float] = field(default_factory=list)
    
class MetaLearningModel(nn.Module):
    """MAML-based meta-learning model for few-shot adaptation"""
    
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int, num_layers: int = 3):
        super().__init__()
        
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        self.num_layers = num_layers
        
        # Build flexible architecture
        layers = []
        current_dim = input_dim
        
        for i in range(num_layers):
            layers.append(nn.Linear(current_dim, hidden_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(0.1))
            current_dim = hidden_dim
            
        layers.append(nn.Linear(current_dim, output_dim))
        
        self.network = nn.Sequential(*layers)
        
        # Meta-learning specific components
        self.adaptation_lr = nn.Parameter(torch.ones(1) * 0.001)
        self.task_embedding = nn.Embedding(1000, hidden_dim)  # Support 1000 different tasks
        
    def forward(self, x: torch.Tensor, task_id: Optional[int] = None) -> torch.Tensor:
        """Forward pass with optional task conditioning"""
        if task_id is not None:
            task_emb = self.task_embedding(torch.tensor([task_id], device=x.device))
            # Add task embedding to the first layer
            if x.size(1) + task_emb.size(1) <= self.input_dim + self.hidden_dim:
                x = torch.cat([x, task_emb.expand(x.size(0), -1)], dim=1)
            
        return self.network(x)
    
    def meta_forward(self, x: torch.Tensor, params: Dict[str, torch.Tensor]) -> torch.Tensor:
        """Forward pass with custom parameters (for MAML)"""
        # Custom forward with provided parameters
        current = x
        layer_idx = 0
        
        for name, module in self.network.named_modules():
            if isinstance(module, nn.Linear):
                weight_key = f"{name}.weight"
                bias_key = f"{name}.bias"
                
                if weight_key in params and bias_key in params:
                    current = F.linear(current, params[weight_key], params[bias_key])
                else:
                    current = module(current)
                    
            elif isinstance(module, nn.ReLU):
                current = F.relu(current)
            elif isinstance(module, nn.Dropout):
                current = F.dropout(current, training=self.training)
                
        return current

class ExperienceReplayBuffer:
    """Advanced experience replay buffer with importance sampling"""
    
    def __init__(self, max_size: int = 100000, alpha: float = 0.6, beta: float = 0.4):
        self.max_size = max_size
        self.alpha = alpha  # Prioritization exponent
        self.beta = beta    # Importance sampling exponent
        
        self.buffer: deque = deque(maxlen=max_size)
        self.priorities = deque(maxlen=max_size)
        self.task_buffers: Dict[str, List[LearningExperience]] = defaultdict(list)
        
        self.position = 0
        self.max_priority = 1.0
        
    def add(self, experience: LearningExperience) -> None:
        """Add experience with priority"""
        # Calculate initial priority based on novelty and importance
        priority = self.max_priority
        
        if len(self.buffer) >= self.max_size:
            # Remove oldest from task buffer
            old_exp = self.buffer[0]
            if old_exp.task_id in self.task_buffers:
                self.task_buffers[old_exp.task_id] = [
                    e for e in self.task_buffers[old_exp.task_id] 
                    if e.timestamp != old_exp.timestamp
                ]
        
        self.buffer.append(experience)
        self.priorities.append(priority)
        self.task_buffers[experience.task_id].append(experience)
        
        self.max_priority = max(self.max_priority, priority)
        
    def sample(self, batch_size: int, task_balance: bool = True) -> Tuple[List[LearningExperience], torch.Tensor]:
        """Sample batch with prioritized sampling and optional task balancing"""
        if len(self.buffer) < batch_size:
            return list(self.buffer), torch.ones(len(self.buffer))
            
        # Convert priorities to probabilities
        priorities = np.array(self.priorities) ** self.alpha
        probabilities = priorities / priorities.sum()
        
        # Importance sampling weights
        total_size = len(self.buffer)
        weights = (total_size * probabilities) ** (-self.beta)
        weights = weights / weights.max()
        
        if task_balance:
            # Ensure balanced sampling across tasks
            samples = []
            sample_weights = []
            tasks = list(self.task_buffers.keys())
            
            if len(tasks) > 0:
                samples_per_task = max(1, batch_size // len(tasks))
                remaining_samples = batch_size - (samples_per_task * len(tasks))
                
                for task_id in tasks:
                    task_experiences = self.task_buffers[task_id]
                    if len(task_experiences) > 0:
                        # Sample from this task
                        task_sample_size = min(samples_per_task, len(task_experiences))
                        task_samples = np.random.choice(
                            task_experiences, 
                            size=task_sample_size, 
                            replace=False
                        )
                        samples.extend(task_samples)
                        sample_weights.extend([1.0] * task_sample_size)
                
                # Fill remaining slots randomly
                if remaining_samples > 0 and len(samples) < batch_size:
                    indices = np.random.choice(
                        len(self.buffer),
                        size=min(remaining_samples, len(self.buffer) - len(samples)),
                        replace=False,
                        p=probabilities
                    )
                    for idx in indices:
                        samples.append(self.buffer[idx])
                        sample_weights.append(weights[idx])
        else:
            # Standard prioritized sampling
            indices = np.random.choice(
                len(self.buffer), 
                size=batch_size, 
                replace=False, 
                p=probabilities
            )
            samples = [self.buffer[i] for i in indices]
            sample_weights = [weights[i] for i in indices]
        
        return samples, torch.tensor(sample_weights, dtype=torch.float32)
    
    def update_priorities(self, experiences: List[LearningExperience], td_errors: torch.Tensor) -> None:
        """Update experience priorities based on TD errors"""
        for exp, error in zip(experiences, td_errors):
            # Find experience in buffer and update priority
            for i, buffer_exp in enumerate(self.buffer):
                if (buffer_exp.timestamp == exp.timestamp and 
                    buffer_exp.task_id == exp.task_id):
                    
                    priority = abs(error.item()) + 1e-6
                    self.priorities[i] = priority
                    self.max_priority = max(self.max_priority, priority)
                    break

class ElasticWeightConsolidation:
    """Elastic Weight Consolidation for preventing catastrophic forgetting"""
    
    def __init__(self, model: nn.Module, lambda_ewc: float = 0.4):
        self.model = model
        self.lambda_ewc = lambda_ewc
        self.fisher_information: Dict[str, torch.Tensor] = {}
        self.optimal_weights: Dict[str, torch.Tensor] = {}
        
    def compute_fisher_information(self, data_loader: DataLoader) -> None:
        """Compute Fisher Information Matrix for important weights"""
        logger.info("Computing Fisher Information Matrix...")
        
        # Initialize Fisher information
        for name, param in self.model.named_parameters():
            if param.requires_grad:
                self.fisher_information[name] = torch.zeros_like(param)
        
        self.model.eval()
        num_samples = 0
        
        for batch_idx, (data, targets) in enumerate(data_loader):
            self.model.zero_grad()
            
            # Forward pass
            outputs = self.model(data)
            loss = F.cross_entropy(outputs, targets)
            
            # Backward pass
            loss.backward()
            
            # Accumulate squared gradients (Fisher Information)
            for name, param in self.model.named_parameters():
                if param.requires_grad and param.grad is not None:
                    self.fisher_information[name] += param.grad.data ** 2
            
            num_samples += len(data)
            
            # Limit computation for efficiency
            if batch_idx >= 100:  
                break
        
        # Average over samples
        for name in self.fisher_information:
            self.fisher_information[name] /= num_samples
            
        # Store optimal weights
        for name, param in self.model.named_parameters():
            if param.requires_grad:
                self.optimal_weights[name] = param.data.clone()
                
        logger.info(f"Fisher Information computed for {len(self.fisher_information)} parameter groups")
    
    def ewc_loss(self) -> torch.Tensor:
        """Compute EWC regularization loss"""
        loss = torch.tensor(0.0, device=next(self.model.parameters()).device)
        for name, param in self.model.named_parameters():
            if name in self.fisher_information and param.requires_grad:
                fisher = self.fisher_information[name]
                optimal = self.optimal_weights[name]
                loss += (fisher * (param - optimal) ** 2).sum()
        
        return self.lambda_ewc * loss

class SynapticIntelligence:
    """Synaptic Intelligence for dynamic importance estimation"""
    
    def __init__(self, model: nn.Module, xi: float = 0.1, epsilon: float = 1e-3):
        self.model = model
        self.xi = xi
        self.epsilon = epsilon
        
        # Initialize tracking variables
        self.omega: Dict[str, torch.Tensor] = {}
        self.small_omega: Dict[str, torch.Tensor] = {}
        self.previous_weights: Dict[str, torch.Tensor] = {}
        
        for name, param in model.named_parameters():
            if param.requires_grad:
                self.omega[name] = torch.zeros_like(param)
                self.small_omega[name] = torch.zeros_like(param)
                self.previous_weights[name] = param.data.clone()
    
    def update_omega(self, learning_rate: float) -> None:
        """Update importance weights after each gradient step"""
        for name, param in self.model.named_parameters():
            if param.requires_grad and param.grad is not None:
                delta = param.data - self.previous_weights[name]
                self.small_omega[name] -= learning_rate * param.grad * delta
                self.previous_weights[name] = param.data.clone()
    
    def consolidate_importance(self) -> None:
        """Consolidate importance weights after task completion"""
        for name, param in self.model.named_parameters():
            if name in self.small_omega and param.requires_grad:
                delta_total = param.data - self.previous_weights[name]
                self.omega[name] += self.small_omega[name] / (
                    delta_total ** 2 + self.epsilon
                )
                self.small_omega[name].zero_()
    
    def si_loss(self) -> torch.Tensor:
        """Compute Synaptic Intelligence regularization loss"""
        loss = torch.tensor(0.0, device=next(self.model.parameters()).device)
        for name, param in self.model.named_parameters():
            if name in self.omega and param.requires_grad:
                delta = param - self.previous_weights[name]
                loss += (self.omega[name] * delta ** 2).sum()
        
        return self.xi * loss

class ContinuousLearningPipeline:
    """Main continuous learning pipeline orchestrating all components"""
    
    def __init__(
        self,
        model: MetaLearningModel,
        base_learning_rate: float = 0.001,
        meta_learning_rate: float = 0.01,
        experience_buffer_size: int = 100000,
        ewc_lambda: float = 0.4,
        si_xi: float = 0.1,
        device: str = "cuda" if torch.cuda.is_available() else "cpu"
    ):
        self.model = model.to(device)
        self.device = device
        
        # Optimizers
        self.optimizer = optim.Adam(model.parameters(), lr=base_learning_rate)
        self.meta_optimizer = optim.Adam(model.parameters(), lr=meta_learning_rate)
        
        # Core components
        self.experience_buffer = ExperienceReplayBuffer(max_size=experience_buffer_size)
        self.ewc = ElasticWeightConsolidation(model, lambda_ewc=ewc_lambda)
        self.si = SynapticIntelligence(model, xi=si_xi)
        
        # Learning state
        self.task_registry: Dict[str, TaskMetadata] = {}
        self.current_task_id: Optional[str] = None
        self.learning_step = 0
        self.consolidation_frequency = 1000
        
        # Performance tracking
        self.performance_history: List[Dict[str, float]] = []
        self.forgetting_metrics: Dict[str, List[float]] = defaultdict(list)
        
        # Threading for online learning
        self.online_learning_active = False
        self.online_learning_thread: Optional[threading.Thread] = None
        self.learning_queue: deque = deque(maxlen=10000)
        
        logger.info(f"Continuous Learning Pipeline initialized on {device}")
    
    async def register_task(
        self, 
        task_id: str, 
        task_type: str, 
        domain: str, 
        difficulty: float = 1.0
    ) -> None:
        """Register a new learning task"""
        if task_id in self.task_registry:
            logger.warning(f"Task {task_id} already registered, updating metadata")
        
        self.task_registry[task_id] = TaskMetadata(
            task_id=task_id,
            task_type=task_type,
            domain=domain,
            difficulty=difficulty,
            data_size=0,
            created_at=time.time(),
            last_updated=time.time()
        )
        
        logger.info(f"Registered task: {task_id} ({task_type}, {domain})")
    
    async def online_learning_step(
        self,
        task_id: str,
        input_data: torch.Tensor,
        target_data: torch.Tensor,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, float]:
        """Single step of online learning"""
        if context is None:
            context = {}
            
        input_data = input_data.to(self.device)
        target_data = target_data.to(self.device)
        
        # Forward pass
        self.model.train()
        outputs = self.model(input_data)
        
        # Compute base loss
        if target_data.dim() > 1:
            base_loss = F.mse_loss(outputs, target_data)
        else:
            base_loss = F.cross_entropy(outputs, target_data)
        
        # Add regularization losses
        ewc_loss = self.ewc.ewc_loss()
        si_loss = self.si.si_loss()
        total_loss = base_loss + ewc_loss + si_loss
        
        # Backward pass
        self.optimizer.zero_grad()
        total_loss.backward()
        
        # Gradient clipping for stability
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
        
        self.optimizer.step()
        self.si.update_omega(self.optimizer.param_groups[0]['lr'])
        
        # Store experience
        experience = LearningExperience(
            task_id=task_id,
            input_data=input_data.cpu(),
            target_data=target_data.cpu(),
            context=context,
            timestamp=time.time(),
            importance=1.0,
            performance_score=1.0 / (base_loss.item() + 1e-6)
        )
        self.experience_buffer.add(experience)
        
        # Update task metadata
        if task_id in self.task_registry:
            self.task_registry[task_id].data_size += len(input_data)
            self.task_registry[task_id].last_updated = time.time()
        
        self.learning_step += 1
        
        # Periodic consolidation
        if self.learning_step % self.consolidation_frequency == 0:
            await self.consolidate_knowledge()
        
        return {
            "base_loss": base_loss.item() if hasattr(base_loss, 'item') else float(base_loss),
            "ewc_loss": ewc_loss.item() if hasattr(ewc_loss, 'item') else float(ewc_loss),
            "si_loss": si_loss.item() if hasattr(si_loss, 'item') else float(si_loss),
            "total_loss": total_loss.item() if hasattr(total_loss, 'item') else float(total_loss),
            "learning_step": self.learning_step
        }
    
    async def meta_learning_adaptation(
        self,
        support_data: List[Tuple[torch.Tensor, torch.Tensor]],
        query_data: List[Tuple[torch.Tensor, torch.Tensor]],
        task_id: str,
        inner_steps: int = 5,
        inner_lr: float = 0.01
    ) -> Dict[str, float]:
        """MAML-based few-shot adaptation"""
        logger.info(f"Meta-learning adaptation for task {task_id}")
        
        # Create fast weights (copy of current weights)
        fast_weights = {}
        for name, param in self.model.named_parameters():
            if param.requires_grad:
                fast_weights[name] = param.clone()
        
        # Inner loop: adapt to support set
        for step in range(inner_steps):
            meta_loss = 0
            
            for support_x, support_y in support_data:
                support_x = support_x.to(self.device)
                support_y = support_y.to(self.device)
                
                # Forward with fast weights
                outputs = self.model.meta_forward(support_x, fast_weights)
                
                if support_y.dim() > 1:
                    loss = F.mse_loss(outputs, support_y)
                else:
                    loss = F.cross_entropy(outputs, support_y)
                
                meta_loss += loss
            
            # Compute gradients w.r.t. fast weights
            grads = torch.autograd.grad(
                meta_loss, 
                fast_weights.values(), 
                create_graph=True,
                allow_unused=True
            )
            
            # Update fast weights
            for (name, param), grad in zip(fast_weights.items(), grads):
                if grad is not None:
                    fast_weights[name] = param - inner_lr * grad
        
        # Outer loop: evaluate on query set
        query_loss = 0
        query_accuracy = 0
        total_queries = 0
        
        for query_x, query_y in query_data:
            query_x = query_x.to(self.device)
            query_y = query_y.to(self.device)
            
            # Forward with adapted weights
            outputs = self.model.meta_forward(query_x, fast_weights)
            
            if query_y.dim() > 1:
                loss = F.mse_loss(outputs, query_y)
                # For regression, use RMSE as accuracy metric
                accuracy = 1.0 / (1.0 + torch.sqrt(loss).item())
            else:
                loss = F.cross_entropy(outputs, query_y)
                # For classification, compute accuracy
                pred = outputs.argmax(dim=1)
                accuracy = (pred == query_y).float().mean().item()
            
            query_loss += loss
            query_accuracy += accuracy * len(query_x)
            total_queries += len(query_x)
        
        query_accuracy /= max(total_queries, 1)
        
        # Update model parameters using meta-gradient
        self.meta_optimizer.zero_grad()
        query_loss.backward()
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
        self.meta_optimizer.step()
        
        return {
            "query_loss": query_loss.item() if hasattr(query_loss, 'item') else float(query_loss),
            "query_accuracy": query_accuracy,
            "adaptation_steps": inner_steps,
            "total_queries": total_queries
        }
    
    async def experience_replay_training(
        self,
        batch_size: int = 32,
        num_batches: int = 10
    ) -> Dict[str, float]:
        """Training using experience replay to prevent forgetting"""
        if len(self.experience_buffer.buffer) < batch_size:
            return {"replay_loss": 0.0, "replay_batches": 0}
        
        total_loss = 0
        replay_accuracy = 0
        
        for batch_idx in range(num_batches):
            # Sample experiences with importance sampling
            experiences, weights = self.experience_buffer.sample(batch_size)
            
            if not experiences:
                continue
            
            # Prepare batch data
            batch_inputs = torch.stack([exp.input_data for exp in experiences]).to(self.device)
            batch_targets = torch.stack([exp.target_data for exp in experiences]).to(self.device)
            weights = weights.to(self.device)
            
            # Forward pass
            self.model.train()
            outputs = self.model(batch_inputs)
            
            # Compute loss
            if batch_targets.dim() > 2:
                base_loss = F.mse_loss(outputs, batch_targets, reduction='none')
                base_loss = (base_loss.mean(dim=tuple(range(1, base_loss.dim()))) * weights).mean()
            else:
                base_loss = F.cross_entropy(outputs, batch_targets, reduction='none')
                base_loss = (base_loss * weights).mean()
            
            # Add regularization
            ewc_loss = self.ewc.ewc_loss()
            si_loss = self.si.si_loss()
            total_batch_loss = base_loss + ewc_loss + si_loss
            
            # Backward pass
            self.optimizer.zero_grad()
            total_batch_loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()
            self.si.update_omega(self.optimizer.param_groups[0]['lr'])
            
            # Update experience priorities based on prediction errors
            with torch.no_grad():
                if batch_targets.dim() > 2:
                    td_errors = F.mse_loss(outputs, batch_targets, reduction='none').mean(dim=tuple(range(1, outputs.dim()-1)))
                else:
                    pred_probs = F.softmax(outputs, dim=1)
                    td_errors = -torch.log(pred_probs.gather(1, batch_targets.unsqueeze(1)) + 1e-8).squeeze()
                
            self.experience_buffer.update_priorities(experiences, td_errors.cpu())
            
            total_loss += total_batch_loss.item() if hasattr(total_batch_loss, 'item') else float(total_batch_loss)
            
            # Calculate accuracy for monitoring
            if batch_targets.dim() <= 2:
                pred = outputs.argmax(dim=1)
                batch_accuracy = (pred == batch_targets).float().mean().item()
                replay_accuracy += batch_accuracy
        
        avg_loss = total_loss / num_batches
        avg_accuracy = replay_accuracy / num_batches
        
        return {
            "replay_loss": avg_loss,
            "replay_accuracy": avg_accuracy,
            "replay_batches": num_batches
        }
    
    async def consolidate_knowledge(self) -> Dict[str, Any]:
        """Consolidate knowledge and update importance weights"""
        logger.info("Consolidating knowledge...")
        
        start_time = time.time()
        
        # Update Synaptic Intelligence
        self.si.consolidate_importance()
        
        # Compute new Fisher Information if we have enough experiences
        if len(self.experience_buffer.buffer) >= 100:
            # Create temporary dataloader from recent experiences
            recent_experiences = list(self.experience_buffer.buffer)[-1000:]  # Last 1000 experiences
            
            inputs = torch.stack([exp.input_data for exp in recent_experiences])
            targets = torch.stack([exp.target_data for exp in recent_experiences])
            
            temp_dataset = TensorDataset(inputs, targets)
            temp_loader = DataLoader(temp_dataset, batch_size=32, shuffle=True)
            
            self.ewc.compute_fisher_information(temp_loader)
        
        # Performance evaluation on all tasks
        task_performances = {}
        for task_id, task_metadata in self.task_registry.items():
            # Get experiences for this task
            task_experiences = self.experience_buffer.task_buffers.get(task_id, [])
            if task_experiences:
                # Evaluate on sample of task experiences
                sample_size = min(100, len(task_experiences))
                sample_experiences = random.sample(task_experiences, sample_size)
                
                inputs = torch.stack([exp.input_data for exp in sample_experiences]).to(self.device)
                targets = torch.stack([exp.target_data for exp in sample_experiences]).to(self.device)
                
                with torch.no_grad():
                    self.model.eval()
                    outputs = self.model(inputs)
                    
                    if targets.dim() > 2:
                        loss = F.mse_loss(outputs, targets).item() if hasattr(F.mse_loss(outputs, targets), 'item') else float(F.mse_loss(outputs, targets))
                        accuracy = 1.0 / (1.0 + math.sqrt(loss))
                    else:
                        loss = F.cross_entropy(outputs, targets).item() if hasattr(F.cross_entropy(outputs, targets), 'item') else float(F.cross_entropy(outputs, targets))
                        pred = outputs.argmax(dim=1)
                        accuracy = (pred == targets).float().mean().item() if hasattr((pred == targets).float().mean(), 'item') else float((pred == targets).float().mean())
                
                task_performances[task_id] = {
                    "loss": loss,
                    "accuracy": accuracy,
                    "sample_size": sample_size
                }
                
                # Update task metadata
                task_metadata.performance_history.append(accuracy)
                
                # Track forgetting (if we have previous performance)
                if len(task_metadata.performance_history) > 1:
                    forgetting = max(0, max(task_metadata.performance_history[:-1]) - accuracy)
                    self.forgetting_metrics[task_id].append(forgetting)
        
        consolidation_time = time.time() - start_time
        
        # Save performance snapshot
        performance_snapshot = {
            "timestamp": time.time(),
            "learning_step": self.learning_step,
            "task_performances": task_performances,
            "buffer_size": len(self.experience_buffer.buffer),
            "consolidation_time": consolidation_time
        }
        self.performance_history.append(performance_snapshot)
        
        logger.info(f"Knowledge consolidation completed in {consolidation_time:.2f}s")
        logger.info(f"Evaluated {len(task_performances)} tasks")
        
        return performance_snapshot
    
    async def start_online_learning(self) -> None:
        """Start online learning thread"""
        if self.online_learning_active:
            logger.warning("Online learning already active")
            return
        
        self.online_learning_active = True
        self.online_learning_thread = threading.Thread(
            target=self._online_learning_worker,
            daemon=True
        )
        self.online_learning_thread.start()
        logger.info("Online learning thread started")
    
    def _online_learning_worker(self) -> None:
        """Worker thread for continuous online learning"""
        while self.online_learning_active:
            if len(self.learning_queue) > 0:
                # Process queued learning requests
                learning_request = self.learning_queue.popleft()
                
                try:
                    # Run learning step in event loop
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(self.online_learning_step(**learning_request))
                    loop.close()
                except Exception as e:
                    logger.error(f"Error in online learning worker: {e}")
            else:
                time.sleep(0.1)  # Brief pause when no work
    
    async def queue_learning(
        self,
        task_id: str,
        input_data: torch.Tensor,
        target_data: torch.Tensor,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Queue data for online learning"""
        learning_request = {
            "task_id": task_id,
            "input_data": input_data,
            "target_data": target_data,
            "context": context or {}
        }
        self.learning_queue.append(learning_request)
    
    async def stop_online_learning(self) -> None:
        """Stop online learning thread"""
        if not self.online_learning_active:
            return
        
        self.online_learning_active = False
        if self.online_learning_thread:
            self.online_learning_thread.join(timeout=5.0)
        logger.info("Online learning thread stopped")
    
    async def get_learning_statistics(self) -> Dict[str, Any]:
        """Get comprehensive learning statistics"""
        stats = {
            "pipeline_info": {
                "learning_steps": self.learning_step,
                "active_tasks": len(self.task_registry),
                "experience_buffer_size": len(self.experience_buffer.buffer),
                "online_learning_active": self.online_learning_active,
                "device": str(self.device)
            },
            "task_statistics": {},
            "performance_metrics": {
                "overall_forgetting": 0.0,
                "learning_efficiency": 0.0,
                "knowledge_retention": 0.0
            },
            "buffer_statistics": {
                "total_experiences": len(self.experience_buffer.buffer),
                "task_distribution": {},
                "average_replay_count": 0.0
            }
        }
        
        # Task statistics
        for task_id, task_meta in self.task_registry.items():
            task_experiences = self.experience_buffer.task_buffers.get(task_id, [])
            
            stats["task_statistics"][task_id] = {
                "type": task_meta.task_type,
                "domain": task_meta.domain,
                "difficulty": task_meta.difficulty,
                "data_size": task_meta.data_size,
                "experiences": len(task_experiences),
                "avg_performance": np.mean(task_meta.performance_history) if task_meta.performance_history else 0.0,
                "performance_trend": self._calculate_trend(task_meta.performance_history),
                "forgetting_rate": np.mean(self.forgetting_metrics.get(task_id, [0.0]))
            }
            
            stats["buffer_statistics"]["task_distribution"][task_id] = len(task_experiences)
        
        # Performance metrics
        if self.performance_history:
            recent_performance = self.performance_history[-10:]  # Last 10 snapshots
            
            # Calculate overall metrics
            all_forgetting = []
            all_accuracy = []
            
            for snapshot in recent_performance:
                for task_perf in snapshot["task_performances"].values():
                    all_accuracy.append(task_perf["accuracy"])
                    
            if all_accuracy:
                stats["performance_metrics"]["knowledge_retention"] = np.mean(all_accuracy)
            
            # Calculate forgetting rates
            for forgetting_list in self.forgetting_metrics.values():
                all_forgetting.extend(forgetting_list)
            
            if all_forgetting:
                stats["performance_metrics"]["overall_forgetting"] = np.mean(all_forgetting)
        
        # Buffer statistics
        if len(self.experience_buffer.buffer) > 0:
            replay_counts = [exp.replay_count for exp in self.experience_buffer.buffer]
            stats["buffer_statistics"]["average_replay_count"] = np.mean(replay_counts)
        
        return stats
    
    def _calculate_trend(self, performance_history: List[float]) -> str:
        """Calculate performance trend (improving, stable, declining)"""
        if len(performance_history) < 2:
            return "insufficient_data"
        
        recent = performance_history[-5:]  # Last 5 data points
        if len(recent) < 2:
            return "insufficient_data"
        
        # Simple linear trend
        x = np.arange(len(recent))
        y = np.array(recent)
        slope = np.corrcoef(x, y)[0, 1] if len(recent) > 2 else (recent[-1] - recent[0])
        
        if slope > 0.1:
            return "improving"
        elif slope < -0.1:
            return "declining"
        else:
            return "stable"
    
    async def save_checkpoint(self, filepath: str) -> None:
        """Save complete pipeline state"""
        checkpoint = {
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "meta_optimizer_state_dict": self.meta_optimizer.state_dict(),
            "learning_step": self.learning_step,
            "task_registry": self.task_registry,
            "performance_history": self.performance_history,
            "forgetting_metrics": dict(self.forgetting_metrics),
            "ewc_fisher": self.ewc.fisher_information,
            "ewc_weights": self.ewc.optimal_weights,
            "si_omega": self.si.omega,
            "timestamp": time.time()
        }
        
        torch.save(checkpoint, filepath)
        logger.info(f"Checkpoint saved to {filepath}")
    
    async def load_checkpoint(self, filepath: str) -> None:
        """Load complete pipeline state"""
        checkpoint = torch.load(filepath, map_location=self.device, weights_only=False)
        
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
        self.meta_optimizer.load_state_dict(checkpoint["meta_optimizer_state_dict"])
        
        self.learning_step = checkpoint["learning_step"]
        self.task_registry = checkpoint["task_registry"]
        self.performance_history = checkpoint["performance_history"]
        self.forgetting_metrics = defaultdict(list, checkpoint["forgetting_metrics"])
        
        self.ewc.fisher_information = checkpoint["ewc_fisher"]
        self.ewc.optimal_weights = checkpoint["ewc_weights"]
        self.si.omega = checkpoint["si_omega"]
        
        logger.info(f"Checkpoint loaded from {filepath}")

# Factory function for easy initialization
def create_continuous_learning_pipeline(
    input_dim: int = 512,
    hidden_dim: int = 256,
    output_dim: int = 128,
    **kwargs
) -> ContinuousLearningPipeline:
    """Create a configured continuous learning pipeline"""
    
    # Create meta-learning model
    model = MetaLearningModel(
        input_dim=input_dim,
        hidden_dim=hidden_dim,
        output_dim=output_dim,
        num_layers=kwargs.get('num_layers', 3)
    )
    
    # Create pipeline
    pipeline = ContinuousLearningPipeline(
        model=model,
        base_learning_rate=kwargs.get('base_learning_rate', 0.001),
        meta_learning_rate=kwargs.get('meta_learning_rate', 0.01),
        experience_buffer_size=kwargs.get('experience_buffer_size', 100000),
        ewc_lambda=kwargs.get('ewc_lambda', 0.4),
        si_xi=kwargs.get('si_xi', 0.1),
        device=kwargs.get('device', "cuda" if torch.cuda.is_available() else "cpu")
    )
    
    return pipeline

if __name__ == "__main__":
    async def demo_continuous_learning():
        """Demonstrate continuous learning pipeline"""
        logger.info("🧠 RomAI Continuous Learning Pipeline Demo")
        
        # Create pipeline
        pipeline = create_continuous_learning_pipeline(
            input_dim=100,
            hidden_dim=128,
            output_dim=10
        )
        
        # Register some tasks
        await pipeline.register_task("classification_1", "classification", "nlp", 0.8)
        await pipeline.register_task("regression_1", "regression", "vision", 1.2)
        await pipeline.register_task("meta_task_1", "few_shot", "general", 1.5)
        
        # Start online learning
        await pipeline.start_online_learning()
        
        # Simulate some learning experiences
        for i in range(100):
            # Generate synthetic data
            input_data = torch.randn(8, 100)
            target_data = torch.randint(0, 10, (8,))
            
            task_id = f"classification_{(i % 3) + 1}"
            
            # Online learning
            if i % 10 == 0:
                result = await pipeline.online_learning_step(task_id, input_data, target_data)
                logger.info(f"Step {i}: Loss={result['total_loss']:.4f}")
            else:
                # Queue for background learning
                await pipeline.queue_learning(task_id, input_data, target_data)
            
            # Experience replay periodically
            if i % 20 == 0 and i > 0:
                replay_result = await pipeline.experience_replay_training()
                logger.info(f"Replay {i}: Loss={replay_result['replay_loss']:.4f}")
            
            await asyncio.sleep(0.01)  # Brief pause
        
        # Meta-learning demo
        support_data = [(torch.randn(5, 100), torch.randint(0, 10, (5,)))]
        query_data = [(torch.randn(5, 100), torch.randint(0, 10, (5,)))]
        
        meta_result = await pipeline.meta_learning_adaptation(
            support_data, query_data, "meta_task_1"
        )
        logger.info(f"Meta-learning: Accuracy={meta_result['query_accuracy']:.4f}")
        
        # Get statistics
        stats = await pipeline.get_learning_statistics()
        logger.info(f"Pipeline Statistics:")
        logger.info(f"  Learning Steps: {stats['pipeline_info']['learning_steps']}")
        logger.info(f"  Active Tasks: {stats['pipeline_info']['active_tasks']}")
        logger.info(f"  Buffer Size: {stats['pipeline_info']['experience_buffer_size']}")
        logger.info(f"  Knowledge Retention: {stats['performance_metrics']['knowledge_retention']:.4f}")
        
        # Stop online learning
        await pipeline.stop_online_learning()
        
        logger.info("✅ Continuous Learning Pipeline Demo completed successfully!")
    
    # Run demo
    asyncio.run(demo_continuous_learning())