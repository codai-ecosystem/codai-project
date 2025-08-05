"""
Learning Strategies and Adaptation Types
=======================================

Enumeration classes for learning strategies and adaptation mechanisms.
"""

from enum import Enum
from typing import Dict, Any

class LearningStrategy(Enum):
    """Types of learning strategies for adaptive systems."""
    
    INCREMENTAL = "incremental"
    BATCH = "batch" 
    ONLINE = "online"
    CURRICULUM = "curriculum"
    ADAPTIVE = "adaptive"
    ROMANIAN_CULTURAL = "romanian_cultural"
    SEASONAL_ADAPTIVE = "seasonal_adaptive"
    EXPERIENCE_REPLAY = "experience_replay"
    
    @classmethod
    def get_strategy_properties(cls, strategy: 'LearningStrategy') -> Dict[str, Any]:
        """Get properties for a learning strategy."""
        properties = {
            cls.INCREMENTAL: {
                "description": "Gradual incremental learning",
                "batch_size": 1,
                "update_frequency": "continuous",
                "memory_usage": "low"
            },
            cls.BATCH: {
                "description": "Batch-based learning", 
                "batch_size": 32,
                "update_frequency": "epoch_end",
                "memory_usage": "high"
            },
            cls.ONLINE: {
                "description": "Real-time online learning",
                "batch_size": 1, 
                "update_frequency": "immediate",
                "memory_usage": "minimal"
            },
            cls.CURRICULUM: {
                "description": "Curriculum-guided learning",
                "batch_size": 16,
                "update_frequency": "curriculum_stage",
                "memory_usage": "medium"
            },
            cls.ADAPTIVE: {
                "description": "Self-adaptive learning",
                "batch_size": "dynamic",
                "update_frequency": "adaptive",
                "memory_usage": "variable"
            },
            cls.ROMANIAN_CULTURAL: {
                "description": "Romanian cultural pattern learning",
                "batch_size": 8,
                "update_frequency": "cultural_milestone",
                "memory_usage": "cultural_optimized"
            },
            cls.SEASONAL_ADAPTIVE: {
                "description": "Seasonal adaptation learning",
                "batch_size": "seasonal",
                "update_frequency": "seasonal_cycle", 
                "memory_usage": "temporal_optimized"
            },
            cls.EXPERIENCE_REPLAY: {
                "description": "Experience replay learning",
                "batch_size": 64,
                "update_frequency": "replay_cycle",
                "memory_usage": "experience_buffer"
            }
        }
        return properties.get(strategy, {})

class AdaptationType(Enum):
    """Types of adaptation mechanisms for learning systems."""
    
    LEARNING_RATE = "learning_rate"
    ARCHITECTURE = "architecture"
    PARAMETERS = "parameters"
    OBJECTIVE = "objective"
    CURRICULUM = "curriculum"
    CULTURAL_CONTEXT = "cultural_context"
    REGIONAL_VARIATION = "regional_variation"
    TEMPORAL_PATTERN = "temporal_pattern"
    
    @classmethod
    def get_adaptation_scope(cls, adaptation_type: 'AdaptationType') -> Dict[str, Any]:
        """Get scope and impact of adaptation type."""
        scopes = {
            cls.LEARNING_RATE: {
                "scope": "optimizer",
                "impact": "convergence_speed",
                "complexity": "low",
                "stability": "high"
            },
            cls.ARCHITECTURE: {
                "scope": "network_structure",
                "impact": "model_capacity",
                "complexity": "high", 
                "stability": "medium"
            },
            cls.PARAMETERS: {
                "scope": "model_weights",
                "impact": "decision_boundary",
                "complexity": "medium",
                "stability": "high"
            },
            cls.OBJECTIVE: {
                "scope": "loss_function",
                "impact": "learning_direction",
                "complexity": "medium",
                "stability": "medium"
            },
            cls.CURRICULUM: {
                "scope": "training_sequence",
                "impact": "learning_progression",
                "complexity": "high",
                "stability": "low"
            },
            cls.CULTURAL_CONTEXT: {
                "scope": "cultural_alignment",
                "impact": "authenticity_preservation",
                "complexity": "high",
                "stability": "medium"
            },
            cls.REGIONAL_VARIATION: {
                "scope": "regional_specificity",
                "impact": "local_adaptation",
                "complexity": "medium",
                "stability": "medium"
            },
            cls.TEMPORAL_PATTERN: {
                "scope": "temporal_dynamics",
                "impact": "temporal_consistency",
                "complexity": "high",
                "stability": "low"
            }
        }
        return scopes.get(adaptation_type, {})
