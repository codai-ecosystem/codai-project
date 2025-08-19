"""
RomAI Models Package
===================

Machine learning models and multimodal intelligence capabilities following Microsoft Azure ML standards.

Components:
- model: Core model architecture and neural networks
- multimodal_intelligence: Advanced multimodal processing capabilities  
- agi_evolution_system: Adaptive AGI evolution framework
- memory_architecture: Advanced memory systems

Author: Romanian AGI Development Team
Version: 1.0.0
License: MIT
"""

__version__ = "1.0.0"
__author__ = "Romanian AGI Development Team"  
__license__ = "MIT"

# Core model components
try:
    from .model import *
except ImportError:
    pass

try:
    from .multimodal_intelligence import *
except ImportError:
    pass

try:
    from .agi_evolution_system import *
except ImportError:
    pass

try:
    from .memory_architecture import *
except ImportError:
    pass

__all__ = [
    "model",
    "multimodal_intelligence", 
    "agi_evolution_system",
    "memory_architecture"
]
