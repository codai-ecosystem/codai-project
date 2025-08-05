"""
Adaptive Learning Systems
========================

Modular adaptive learning system with Romanian cultural integration.

This package provides:
- Core adaptive learning engine
- Learning strategies and adaptation mechanisms  
- Romanian cultural learning patterns
- Performance monitoring and optimization
"""

from .core import AdaptiveLearningEngine
from .strategies import LearningStrategy, AdaptationType
from .cultural_patterns import RomanianLearningPattern, RomanianCulturalProcessor
from .networks import AdaptiveLearningNetwork, CulturalLearningNetwork
from .performance import PerformanceTracker, ValidationMetrics

__all__ = [
    'AdaptiveLearningEngine',
    'LearningStrategy', 
    'AdaptationType',
    'RomanianLearningPattern',
    'RomanianCulturalProcessor',
    'AdaptiveLearningNetwork',
    'CulturalLearningNetwork', 
    'PerformanceTracker',
    'ValidationMetrics'
]

__version__ = "1.0.0"
