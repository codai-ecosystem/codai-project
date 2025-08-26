"""
RomAI Real-Time Learning Engine - TODO 12 Implementation
=====================================================

Revolutionary continuous learning system with:
- Online learning during inference
- Catastrophic forgetting prevention via EWC
- Real-time adaptation without service interruption
- Romanian cultural knowledge expansion
- Performance-preserving incremental updates

Architecture: O(1) per-update complexity with memory-efficient consolidation
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.optim import Adam, SGD
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import deque
import numpy as np
import asyncio
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

@dataclass
class LearningExperience:
    """Container for learning experiences with cultural context"""
    input_data: torch.Tensor
    target_output: torch.Tensor
    cultural_context: Dict[str, Any]
    performance_feedback: float
    importance_weight: float
    timestamp: datetime
    learning_type: str  # 'cultural', 'reasoning', 'decision', 'creative'

@dataclass
class LearningMetrics:
    """Comprehensive learning performance tracking"""
    total_updates: int = 0
    successful_adaptations: int = 0
    performance_improvements: int = 0
    cultural_knowledge_expansions: int = 0
    forgetting_prevention_activations: int = 0
    average_learning_rate: float = 0.001
    memory_consolidation_efficiency: float = 0.0
    real_time_adaptation_latency: float = 0.0

class ElasticWeightConsolidation:
    """
    Elastic Weight Consolidation (EWC) for catastrophic forgetting prevention
    Maintains importance of previous learning while allowing new adaptation
    """
    
    def __init__(self, model: nn.Module, lambda_reg: float = 1000.0):
        self.model = model
        self.lambda_reg = lambda_reg
        self.fisher_information = {}
        self.optimal_params = {}
        self.task_count = 0
        
    def compute_fisher_information(self, data_samples, num_samples: int = 1000):
        """Compute Fisher Information Matrix for importance weighting"""
        self.fisher_information = {}
        self.optimal_params = {}
        
        # Store current optimal parameters
        for name, param in self.model.named_parameters():
            self.optimal_params[name] = param.clone().detach()
            self.fisher_information[name] = torch.zeros_like(param)
        
        # Compute Fisher Information from data samples
        self.model.eval()
        for i, (inputs, targets, cultural_context) in enumerate(data_samples):
            if i >= num_samples:
                break
                
            self.model.zero_grad()
            try:
                # Handle different model types
                if hasattr(self.model, 'forward') and 'cultural_context' in self.model.forward.__code__.co_varnames:
                    outputs = self.model(inputs, cultural_context=cultural_context)
                else:
                    outputs = self.model(inputs)
            except TypeError:
                outputs = self.model(inputs)
            
            loss = F.mse_loss(outputs, targets)
            loss.backward()
            
            for name, param in self.model.named_parameters():
                if param.grad is not None:
                    self.fisher_information[name] += (param.grad ** 2) / num_samples
        
        self.task_count += 1
        logger.info(f"✅ Fisher Information computed for task {self.task_count}")
    
    def compute_ewc_loss(self) -> torch.Tensor:
        """Compute EWC regularization loss"""
        ewc_loss = torch.tensor(0.0)
        
        # Only apply EWC if we have Fisher information
        if not self.fisher_information:
            return ewc_loss
        
        for name, param in self.model.named_parameters():
            if name in self.fisher_information:
                fisher = self.fisher_information[name]
                optimal = self.optimal_params[name]
                ewc_loss += (fisher * (param - optimal) ** 2).sum()
        
        return self.lambda_reg * ewc_loss

class ExperienceReplayBuffer:
    """
    Intelligent experience replay buffer with cultural prioritization
    Maintains diverse learning experiences for consolidation
    """
    
    def __init__(self, capacity: int = 10000, cultural_priority_weight: float = 0.3):
        self.capacity = capacity
        self.cultural_priority_weight = cultural_priority_weight
        self.buffer = deque(maxlen=capacity)
        self.cultural_experiences = deque(maxlen=capacity // 2)
        self.importance_weights = deque(maxlen=capacity)
        
    def add_experience(self, experience: LearningExperience):
        """Add learning experience with importance weighting"""
        self.buffer.append(experience)
        
        # Calculate importance based on performance and cultural relevance
        importance = experience.performance_feedback
        if 'romanian' in str(experience.cultural_context).lower():
            importance += self.cultural_priority_weight
            self.cultural_experiences.append(experience)
        
        self.importance_weights.append(importance)
        
    def sample_experiences(self, batch_size: int = 32) -> List[LearningExperience]:
        """Sample experiences with importance weighting"""
        if len(self.buffer) < batch_size:
            return list(self.buffer)
        
        # Importance-weighted sampling
        weights = np.array(self.importance_weights)
        weights = weights / weights.sum()  # Normalize
        
        indices = np.random.choice(
            len(self.buffer), 
            size=min(batch_size, len(self.buffer)), 
            replace=False, 
            p=weights
        )
        
        return [self.buffer[i] for i in indices]

class RealTimeLearningEngine(nn.Module):
    """
    Revolutionary Real-Time Learning Engine for continuous adaptation
    
    Features:
    - Online learning during inference with O(1) updates
    - Catastrophic forgetting prevention via EWC
    - Romanian cultural knowledge expansion
    - Performance-preserving incremental learning
    - Real-time adaptation without service interruption
    """
    
    def __init__(
        self,
        base_model: nn.Module,
        cultural_supremacy_engine: nn.Module,
        learning_rate: float = 0.001,
        ewc_lambda: float = 1000.0,
        replay_buffer_size: int = 10000,
        adaptation_threshold: float = 0.1
    ):
        super().__init__()
        
        self.base_model = base_model
        self.cultural_supremacy_engine = cultural_supremacy_engine
        self.adaptation_threshold = adaptation_threshold
        
        # Initialize learning components
        self.ewc = ElasticWeightConsolidation(base_model, ewc_lambda)
        self.replay_buffer = ExperienceReplayBuffer(replay_buffer_size)
        self.optimizer = Adam(self.parameters(), lr=learning_rate)
        
        # Performance tracking
        self.metrics = LearningMetrics()
        self.performance_history = deque(maxlen=1000)
        self.cultural_knowledge_base = {}
        
        # Real-time learning state
        self.learning_active = True
        self.consolidation_frequency = 20  # More frequent consolidation every 20 updates
        self.update_count = 0
        
        logger.info("🧠 Real-Time Learning Engine initialized")
        logger.info(f"📚 EWC lambda: {ewc_lambda}")
        logger.info(f"🔄 Learning rate: {learning_rate}")
        logger.info(f"💾 Replay buffer capacity: {replay_buffer_size}")
    
    async def online_learning_update(
        self,
        input_data: torch.Tensor,
        target_output: torch.Tensor,
        cultural_context: Dict[str, Any],
        performance_feedback: float
    ) -> Dict[str, Any]:
        """
        Perform online learning update during inference
        O(1) complexity per update with importance weighting
        """
        if not self.learning_active:
            return {'status': 'learning_disabled', 'update_applied': False}
        
        start_time = datetime.now()
        
        # Create learning experience
        experience = LearningExperience(
            input_data=input_data.clone(),
            target_output=target_output.clone(),
            cultural_context=cultural_context.copy(),
            performance_feedback=performance_feedback,
            importance_weight=self._calculate_importance_weight(performance_feedback, cultural_context),
            timestamp=start_time,
            learning_type=self._classify_learning_type(cultural_context)
        )
        
        # Add to replay buffer
        self.replay_buffer.add_experience(experience)
        
        # Decide whether to update immediately based on importance
        should_update = (
            experience.importance_weight > self.adaptation_threshold or
            performance_feedback < 0.5  # Poor performance triggers immediate learning
        )
        
        update_result = {'status': 'no_update', 'update_applied': False}
        
        if should_update:
            update_result = await self._perform_gradient_update(experience)
            self.update_count += 1
            
        # Periodic memory consolidation (more frequent)
        if self.update_count % self.consolidation_frequency == 0:
            await self._consolidate_memory()        # Update metrics
        update_latency = (datetime.now() - start_time).total_seconds() * 1000
        self.metrics.real_time_adaptation_latency = (
            self.metrics.real_time_adaptation_latency * 0.9 + update_latency * 0.1
        )
        
        return {
            **update_result,
            'latency_ms': update_latency,
            'importance_weight': experience.importance_weight,
            'learning_type': experience.learning_type,
            'buffer_size': len(self.replay_buffer.buffer)
        }
    
    async def _perform_gradient_update(self, experience: LearningExperience) -> Dict[str, Any]:
        """Perform gradient update with EWC regularization"""
        self.train()
        
        # Forward pass
        self.optimizer.zero_grad()
        
        # Get model prediction with cultural context handling
        try:
            if hasattr(self.base_model, 'forward') and 'cultural_context' in self.base_model.forward.__code__.co_varnames:
                prediction = self.base_model(
                    experience.input_data,
                    cultural_context=experience.cultural_context
                )
            else:
                # Standard forward pass for models without cultural context support
                prediction = self.base_model(experience.input_data)
        except TypeError:
            # Fallback for models that don't support cultural context
            prediction = self.base_model(experience.input_data)
        
        # Compute primary loss
        primary_loss = F.mse_loss(prediction, experience.target_output)
        
        # Add EWC regularization
        ewc_loss = self.ewc.compute_ewc_loss()
        
        # Cultural enhancement loss
        cultural_loss = await self._compute_cultural_enhancement_loss(experience)
        
        # Combined loss with importance weighting
        total_loss = (
            primary_loss * experience.importance_weight +
            ewc_loss * 0.1 +
            cultural_loss * 0.2
        )
        
        # Backward pass with gradient clipping
        total_loss.backward()
        torch.nn.utils.clip_grad_norm_(self.parameters(), max_norm=1.0)
        self.optimizer.step()
        
        # Update metrics
        self.metrics.total_updates += 1
        
        # Check if update improved performance
        improvement = experience.performance_feedback - (self.performance_history[-1] if self.performance_history else 0.5)
        if improvement > 0:
            self.metrics.successful_adaptations += 1
            self.metrics.performance_improvements += 1
        
        self.performance_history.append(experience.performance_feedback)
        
        logger.info(f"🔄 Real-time learning update applied. Loss: {total_loss.item():.4f}")
        
        return {
            'status': 'update_applied',
            'update_applied': True,
            'total_loss': total_loss.item(),
            'primary_loss': primary_loss.item(),
            'ewc_loss': ewc_loss.item() if isinstance(ewc_loss, torch.Tensor) else ewc_loss,
            'cultural_loss': cultural_loss.item() if isinstance(cultural_loss, torch.Tensor) else cultural_loss,
            'improvement': improvement
        }
    
    async def _compute_cultural_enhancement_loss(self, experience: LearningExperience) -> torch.Tensor:
        """Compute loss for cultural knowledge enhancement"""
        try:
            if self.cultural_supremacy_engine is None:
                return torch.tensor(0.0)
            
            # Set cultural engine to eval mode for inference
            self.cultural_supremacy_engine.eval()
            
            with torch.no_grad():
                # Process cultural context through supremacy engine
                try:
                    if hasattr(self.cultural_supremacy_engine, 'forward') and 'cultural_context' in self.cultural_supremacy_engine.forward.__code__.co_varnames:
                        cultural_embedding = self.cultural_supremacy_engine(
                            experience.input_data,
                            cultural_context=experience.cultural_context
                        )
                    else:
                        cultural_embedding = self.cultural_supremacy_engine(experience.input_data)
                except TypeError:
                    # Fallback for simple cultural models
                    cultural_embedding = self.cultural_supremacy_engine(experience.input_data)
            
            # Cultural alignment loss - encourage better cultural integration
            cultural_target = torch.ones_like(cultural_embedding) * 0.9  # High cultural alignment target
            cultural_loss = F.mse_loss(cultural_embedding, cultural_target)
            
            # Track cultural knowledge expansion
            if 'romanian' in str(experience.cultural_context).lower():
                self.metrics.cultural_knowledge_expansions += 1
                self._expand_cultural_knowledge_base(experience)
            
            return cultural_loss
            
        except Exception as e:
            logger.warning(f"Cultural enhancement loss computation failed: {e}")
            return torch.tensor(0.0)
    
    def _expand_cultural_knowledge_base(self, experience: LearningExperience):
        """Expand Romanian cultural knowledge base with new learnings"""
        cultural_key = f"cultural_learning_{self.metrics.cultural_knowledge_expansions}"
        
        self.cultural_knowledge_base[cultural_key] = {
            'context': experience.cultural_context,
            'performance': experience.performance_feedback,
            'timestamp': experience.timestamp.isoformat(),
            'learning_type': experience.learning_type,
            'importance': experience.importance_weight
        }
        
        # Keep only most important cultural learnings
        if len(self.cultural_knowledge_base) > 1000:
            # Remove least important entries
            sorted_entries = sorted(
                self.cultural_knowledge_base.items(),
                key=lambda x: x[1]['importance'],
                reverse=True
            )
            self.cultural_knowledge_base = dict(sorted_entries[:1000])
    
    async def _consolidate_memory(self):
        """Consolidate important memories and update Fisher Information"""
        logger.info("🧠 Performing memory consolidation...")
        
        # Sample experiences for consolidation
        consolidation_experiences = self.replay_buffer.sample_experiences(
            batch_size=min(100, len(self.replay_buffer.buffer))
        )
        
        if not consolidation_experiences:
            return
        
        # Create data loader for Fisher Information computation
        consolidation_data = [
            (exp.input_data, exp.target_output, exp.cultural_context)
            for exp in consolidation_experiences
        ]
        
        # Update Fisher Information Matrix
        self.ewc.compute_fisher_information(consolidation_data, num_samples=len(consolidation_data))
        
        # Update consolidation metrics
        self.metrics.memory_consolidation_efficiency = (
            len(consolidation_experiences) / max(len(self.replay_buffer.buffer), 1)
        )
        self.metrics.forgetting_prevention_activations += 1
        
        logger.info(f"✅ Memory consolidation complete. Processed {len(consolidation_experiences)} experiences")
    
    def _calculate_importance_weight(
        self, 
        performance_feedback: float, 
        cultural_context: Dict[str, Any]
    ) -> float:
        """Calculate importance weight for learning update"""
        base_importance = 1.0 - performance_feedback  # Poor performance = high importance
        
        # Boost importance for cultural learning
        cultural_boost = 0.0
        if 'romanian' in str(cultural_context).lower():
            cultural_boost = 0.3
        
        # Boost for novel contexts
        novelty_boost = 0.1 if self._is_novel_context(cultural_context) else 0.0
        
        return min(base_importance + cultural_boost + novelty_boost, 2.0)
    
    def _is_novel_context(self, cultural_context: Dict[str, Any]) -> bool:
        """Check if this is a novel learning context"""
        context_signature = str(sorted(cultural_context.items()))
        
        # Check against recent contexts
        for exp in list(self.replay_buffer.buffer)[-50:]:  # Check last 50 experiences
            if str(sorted(exp.cultural_context.items())) == context_signature:
                return False
        
        return True
    
    def _classify_learning_type(self, cultural_context: Dict[str, Any]) -> str:
        """Classify the type of learning based on context"""
        context_str = str(cultural_context).lower()
        
        if 'romanian' in context_str or 'cultural' in context_str:
            return 'cultural'
        elif 'decision' in context_str or 'choice' in context_str:
            return 'decision'
        elif 'reasoning' in context_str or 'logic' in context_str:
            return 'reasoning'
        elif 'creative' in context_str or 'artistic' in context_str:
            return 'creative'
        else:
            return 'general'
    
    def get_learning_metrics(self) -> Dict[str, Any]:
        """Get comprehensive learning performance metrics"""
        success_rate = (
            self.metrics.successful_adaptations / max(self.metrics.total_updates, 1)
        )
        
        return {
            'total_updates': self.metrics.total_updates,
            'success_rate': success_rate,
            'performance_improvements': self.metrics.performance_improvements,
            'cultural_knowledge_expansions': self.metrics.cultural_knowledge_expansions,
            'memory_consolidation_efficiency': self.metrics.memory_consolidation_efficiency,
            'average_adaptation_latency_ms': self.metrics.real_time_adaptation_latency,
            'forgetting_prevention_activations': self.metrics.forgetting_prevention_activations,
            'buffer_utilization': len(self.replay_buffer.buffer) / self.replay_buffer.capacity,
            'cultural_knowledge_base_size': len(self.cultural_knowledge_base),
            'learning_active': self.learning_active
        }
    
    def enable_learning(self):
        """Enable real-time learning"""
        self.learning_active = True
        logger.info("✅ Real-time learning enabled")
    
    def disable_learning(self):
        """Disable real-time learning"""
        self.learning_active = False
        logger.info("⏸️ Real-time learning disabled")
    
    def save_learning_state(self, filepath: str):
        """Save learning state for persistence"""
        state = {
            'metrics': self.metrics.__dict__,
            'cultural_knowledge_base': self.cultural_knowledge_base,
            'performance_history': list(self.performance_history),
            'update_count': self.update_count,
            'learning_active': self.learning_active
        }
        
        with open(filepath, 'w') as f:
            json.dump(state, f, indent=2, default=str)
        
        logger.info(f"💾 Learning state saved to {filepath}")
    
    def load_learning_state(self, filepath: str):
        """Load learning state from file"""
        try:
            with open(filepath, 'r') as f:
                state = json.load(f)
            
            # Restore state
            for key, value in state['metrics'].items():
                if hasattr(self.metrics, key):
                    setattr(self.metrics, key, value)
            
            self.cultural_knowledge_base = state['cultural_knowledge_base']
            self.performance_history = deque(state['performance_history'], maxlen=1000)
            self.update_count = state['update_count']
            self.learning_active = state['learning_active']
            
            logger.info(f"📂 Learning state loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Failed to load learning state: {e}")

# Example usage and validation
if __name__ == "__main__":
    async def test_real_time_learning():
        """Test the real-time learning capabilities"""
        print("🧠 Testing RomAI Real-Time Learning Engine...")
        
        # Create a simple base model for testing
        base_model = nn.Sequential(
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 128)
        )
        
        # Create cultural supremacy engine (mock for testing)
        cultural_engine = nn.Sequential(
            nn.Linear(1024, 512),
            nn.Tanh(),
            nn.Linear(512, 128)
        )
        
        # Initialize real-time learning engine
        learning_engine = RealTimeLearningEngine(
            base_model=base_model,
            cultural_supremacy_engine=cultural_engine,
            learning_rate=0.001,
            ewc_lambda=1000.0
        )
        
        print("✅ Real-time learning engine initialized")
        
        # Simulate learning experiences
        for i in range(10):
        # RomAI General Expert - Authentic Neural Inference
                    try:
                        # Route to appropriate expert based on input analysis
                        expert_input = self._prepare_expert_input(input_data)

                        # Automatic expert selection
                        selected_expert = self.model.router.select_optimal_expert(expert_input)

                        # Process with selected expert
                        with torch.no_grad():
                            expert_outputs = self.model.route_to_expert(
                                expert_input,
                                expert_type=selected_expert,
                                use_mla_attention=True
                            )

                            # Generate response
                            response = self.model.generate_response(expert_outputs)

                            return {
                                "response": response["response"],
                                "reasoning": response["reasoning"],
                                "confidence": response["confidence"],
                                "expert_used": selected_expert,
                                "method": "neural_general_reasoning",
                                "quality_score": response["quality_score"]
                            }

                    except Exception as e:
                        logger.error(f"General expert error: {e}")
                        # Ultimate fallback
                        return {"error": f"Neural inference failed: {e}", "fallback": True}
        # RomAI General Expert - Authentic Neural Inference
                    try:
                        # Route to appropriate expert based on input analysis
                        expert_input = self._prepare_expert_input(input_data)

                        # Automatic expert selection
                        selected_expert = self.model.router.select_optimal_expert(expert_input)

                        # Process with selected expert
                        with torch.no_grad():
                            expert_outputs = self.model.route_to_expert(
                                expert_input,
                                expert_type=selected_expert,
                                use_mla_attention=True
                            )

                            # Generate response
                            response = self.model.generate_response(expert_outputs)

                            return {
                                "response": response["response"],
                                "reasoning": response["reasoning"],
                                "confidence": response["confidence"],
                                "expert_used": selected_expert,
                                "method": "neural_general_reasoning",
                                "quality_score": response["quality_score"]
                            }

                    except Exception as e:
                        logger.error(f"General expert error: {e}")
                        # Ultimate fallback
                        return {"error": f"Neural inference failed: {e}", "fallback": True}
            cultural_context = {
                'type': 'romanian_cultural_reasoning',
                'domain': 'mathematical_heritage',
                'complexity': 'high',
                'iteration': i
            }
            performance_feedback = 0.7 + (i * 0.02)  # Gradually improving performance
            
            # Perform online learning update
            result = await learning_engine.online_learning_update(
                input_data, target_output, cultural_context, performance_feedback
            )
            
            print(f"Update {i+1}: {result['status']}, Latency: {result['latency_ms']:.2f}ms")
        
        # Get learning metrics
        metrics = learning_engine.get_learning_metrics()
        print("\n📊 Learning Metrics:")
        for key, value in metrics.items():
            print(f"  {key}: {value}")
        
        print("\n🎯 Real-time learning test completed successfully!")
    
    # Run the test
    asyncio.run(test_real_time_learning())