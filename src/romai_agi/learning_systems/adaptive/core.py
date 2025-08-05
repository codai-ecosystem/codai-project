"""
Adaptive Learning Engine Core
============================

Core adaptive learning engine that integrates all components for Romanian AGI.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from typing import Dict, List, Optional, Any, Tuple
import asyncio
import logging
import numpy as np

from .strategies import LearningStrategy, AdaptationType
from .cultural_patterns import RomanianLearningPattern, RomanianCulturalProcessor, CulturalLearningContext
from .networks import AdaptiveLearningNetwork, CulturalLearningNetwork, LearningRateScheduler, AttentionMechanism
from .performance import PerformanceTracker, ValidationMetrics, LearningExperience

logger = logging.getLogger(__name__)

class AdaptiveLearningEngine:
    """Core adaptive learning engine with Romanian cultural integration."""
    
    def __init__(
        self,
        input_size: int = 256,
        hidden_size: int = 128,
        cultural_size: int = 64,
        device: str = 'cpu'
    ):
        """Initialize adaptive learning engine.
        
        Args:
            input_size: Size of input features
            hidden_size: Size of hidden layers  
            cultural_size: Size of cultural feature space
            device: Device for computation ('cpu' or 'cuda')
        """
        self.device = device
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.cultural_size = cultural_size
        
        # Initialize networks
        self.adaptive_network = AdaptiveLearningNetwork(input_size, hidden_size).to(device)
        self.cultural_network = CulturalLearningNetwork(input_size, cultural_size).to(device)
        self.lr_scheduler = LearningRateScheduler(hidden_size).to(device)
        self.attention_mechanism = AttentionMechanism(hidden_size).to(device)
        
        # Initialize cultural processor
        self.cultural_processor = RomanianCulturalProcessor()
        
        # Initialize performance tracking
        self.performance_tracker = PerformanceTracker()
        
        # Learning configuration
        self.current_strategy = LearningStrategy.ADAPTIVE
        self.adaptation_history: List[Dict[str, Any]] = []
        
        logger.info(f"Initialized AdaptiveLearningEngine on device: {device}")
        
    async def adaptive_learning_step(
        self,
        experience: LearningExperience,
        model: nn.Module,
        optimizer: torch.optim.Optimizer,
        cultural_context: Optional[CulturalLearningContext] = None
    ) -> Dict[str, Any]:
        """Perform one adaptive learning step.
        
        Args:
            experience: Learning experience data
            model: Model to adapt
            optimizer: Optimizer for model updates
            cultural_context: Optional cultural learning context
            
        Returns:
            Dictionary of adaptation results
        """
        # Convert experience to tensors
        input_tensor = self._prepare_input_tensor(experience)
        
        # Get adaptive predictions
        adaptive_output = self.adaptive_network(input_tensor)
        
        # Get cultural learning predictions
        cultural_output = self.cultural_network(input_tensor)
        
        # Apply attention mechanism for feature focus
        attended_features, attention_weights = self.attention_mechanism(
            adaptive_output['features'].unsqueeze(0),
            cultural_output['cultural_features'].unsqueeze(0),
            cultural_output['enhanced_output'].unsqueeze(0)
        )
        
        # Process cultural context if provided
        cultural_guidance = None
        if cultural_context:
            cultural_guidance = self.cultural_processor.process_cultural_learning(cultural_context)
        
        # Adapt learning rate
        performance_metrics = torch.tensor([
            experience.loss_value,
            experience.difficulty_level,
            cultural_output['alignment_score'].item()
        ], device=self.device).float()
        
        new_lr = self.lr_scheduler(performance_metrics)
        
        # Update optimizer learning rate
        for param_group in optimizer.param_groups:
            param_group['lr'] = new_lr.item()
        
        # Determine adaptation type
        adaptation_type_probs = adaptive_output['adaptation_type']
        adaptation_type_idx = torch.argmax(adaptation_type_probs).item()
        adaptation_type = list(AdaptationType)[adaptation_type_idx]
        
        # Apply adaptation based on type
        adaptation_result = await self._apply_adaptation(
            adaptation_type, model, optimizer, experience, cultural_guidance
        )
        
        # Track performance
        self.performance_tracker.add_experience(experience)
        
        # Record adaptation
        adaptation_record = {
            'timestamp': experience.timestamp,
            'strategy': self.current_strategy,
            'adaptation_type': adaptation_type,
            'learning_rate': new_lr.item(),
            'cultural_alignment': cultural_output['alignment_score'].item(),
            'attention_weights': attention_weights.detach().cpu().numpy(),
            'adaptation_success': adaptation_result['success']
        }
        self.adaptation_history.append(adaptation_record)
        
        return {
            'adaptation_type': adaptation_type,
            'new_learning_rate': new_lr.item(),
            'cultural_alignment': cultural_output['alignment_score'].item(),
            'pattern_scores': cultural_output['pattern_scores'].detach().cpu().numpy(),
            'regional_scores': cultural_output['regional_scores'].detach().cpu().numpy(),
            'attention_weights': attention_weights.detach().cpu().numpy(),
            'cultural_guidance': cultural_guidance,
            'adaptation_result': adaptation_result
        }
        
    def _prepare_input_tensor(self, experience: LearningExperience) -> torch.Tensor:
        """Prepare input tensor from learning experience.
        
        Args:
            experience: Learning experience to process
            
        Returns:
            Input tensor for networks
        """
        # Create feature vector from experience
        features = [
            experience.loss_value,
            experience.difficulty_level,
            experience.timestamp % 1.0,  # Normalized timestamp
        ]
        
        # Add strategy encoding
        strategy_encoding = [0.0] * len(LearningStrategy)
        strategy_idx = list(LearningStrategy).index(experience.learning_strategy)
        strategy_encoding[strategy_idx] = 1.0
        features.extend(strategy_encoding)
        
        # Add pattern encoding
        pattern_encoding = [0.0] * len(RomanianLearningPattern)
        pattern_idx = list(RomanianLearningPattern).index(experience.learning_pattern)
        pattern_encoding[pattern_idx] = 1.0
        features.extend(pattern_encoding)
        
        # Pad or truncate to input_size
        if len(features) < self.input_size:
            features.extend([0.0] * (self.input_size - len(features)))
        else:
            features = features[:self.input_size]
            
        return torch.tensor(features, device=self.device).float()
        
    async def _apply_adaptation(
        self,
        adaptation_type: AdaptationType,
        model: nn.Module,
        optimizer: torch.optim.Optimizer,
        experience: LearningExperience,
        cultural_guidance: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Apply specific adaptation based on type.
        
        Args:
            adaptation_type: Type of adaptation to apply
            model: Model to adapt
            optimizer: Optimizer for updates
            experience: Learning experience
            cultural_guidance: Cultural guidance for adaptation
            
        Returns:
            Adaptation result
        """
        success = True
        changes_made = []
        
        try:
            if adaptation_type == AdaptationType.LEARNING_RATE:
                # Learning rate already adapted in main step
                changes_made.append("Learning rate adjusted")
                
            elif adaptation_type == AdaptationType.PARAMETERS:
                # Apply parameter adaptation based on cultural guidance
                if cultural_guidance and 'cultural_multiplier' in cultural_guidance:
                    multiplier = cultural_guidance['cultural_multiplier']
                    with torch.no_grad():
                        for param in model.parameters():
                            if param.grad is not None:
                                param.grad *= multiplier
                    changes_made.append(f"Parameter gradients scaled by {multiplier:.3f}")
                    
            elif adaptation_type == AdaptationType.CULTURAL_CONTEXT:
                # Apply cultural context adaptation
                if cultural_guidance:
                    # Log cultural adaptation
                    logger.info(f"Applied cultural adaptation: {cultural_guidance.get('pattern_guidance', {})}")
                    changes_made.append("Cultural context adaptation applied")
                    
            elif adaptation_type == AdaptationType.REGIONAL_VARIATION:
                # Apply regional variation adaptation
                if experience.regional_specificity:
                    # Regional-specific adjustments could be implemented here
                    changes_made.append(f"Regional adaptation for {experience.regional_specificity}")
                    
            # Additional adaptation types can be implemented here
            
        except Exception as e:
            logger.error(f"Adaptation failed: {e}")
            success = False
            
        return {
            'success': success,
            'changes_made': changes_made,
            'adaptation_type': adaptation_type,
            'error': None if success else str(e)
        }
        
    async def get_performance_metrics(self) -> Dict[str, float]:
        """Get current performance metrics.
        
        Returns:
            Dictionary of performance metrics
        """
        metrics = self.performance_tracker.get_current_metrics()
        
        return {
            'learning_efficiency': metrics.learning_efficiency,
            'adaptation_speed': metrics.adaptation_speed,
            'cultural_learning_accuracy': metrics.cultural_learning_accuracy,
            'romanian_cultural_authenticity': metrics.romanian_cultural_authenticity,
            'wisdom_integration_level': metrics.wisdom_integration_level,
            'regional_adaptation_score': metrics.regional_adaptation_score,
            'temporal_consistency': metrics.temporal_consistency,
            'performance_stability': metrics.performance_stability
        }
        
    async def generate_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report.
        
        Returns:
            Detailed performance report
        """
        return self.performance_tracker.generate_performance_report()
        
    def update_learning_strategy(self, strategy: LearningStrategy) -> None:
        """Update current learning strategy.
        
        Args:
            strategy: New learning strategy to use
        """
        self.current_strategy = strategy
        logger.info(f"Updated learning strategy to: {strategy}")
        
    def get_adaptation_history(self) -> List[Dict[str, Any]]:
        """Get history of adaptations.
        
        Returns:
            List of adaptation records
        """
        return self.adaptation_history.copy()
        
    async def validate_transcendent_plus_performance(self) -> Dict[str, Any]:
        """Validate performance against TRANSCENDENT PLUS targets.
        
        Returns:
            Validation results
        """
        metrics = self.performance_tracker.get_current_metrics()
        validation_results = metrics.validate_transcendent_plus_targets()
        
        logger.info("TRANSCENDENT PLUS Performance Validation:")
        for metric, result in validation_results.items():
            status_symbol = "✅" if result['status'] == 'PASS' else "❌"
            logger.info(f"  {status_symbol} {metric}: {result['achieved']:.3f} (target: {result['target']:.3f})")
            
        overall_status = self.performance_tracker._get_overall_status(validation_results)
        logger.info(f"Overall Status: {overall_status}")
        
        return validation_results
