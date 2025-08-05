# RomAI ML Package
"""
RomAI Machine Learning Package

This package contains the core ML components for the Romanian AGI system:
- Neural architecture models
- Romanian language processing
- Training and inference pipelines
- Data collection and preprocessing
"""

__version__ = "1.0.0"
__author__ = "RomAI Team"
__description__ = "Romanian AGI Machine Learning Framework"

# Core components
from . import models
from . import data
from . import training
from . import inference
from . import testing

__all__ = [
    'models',
    'data', 
    'training',
    'inference',
    'testing'
]
