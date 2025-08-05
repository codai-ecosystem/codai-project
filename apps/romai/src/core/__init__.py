"""
RomAI AGI Core Package
======================

This package contains the core AGI systems for the Romanian AGI implementation,
including reasoning, learning, memory, consciousness, optimization, multimodal, 
coordination, testing, and cultural intelligence systems.

Packages:
- agi: Advanced General Intelligence modules (8 specialized packages)
- ml: Machine Learning training and optimization  
- testing: Comprehensive testing and validation
- utils: Shared utilities and common functionality

Author: Romanian AGI Development Team
Version: 1.0.0
License: MIT
"""

__version__ = "1.0.0"
__author__ = "Romanian AGI Development Team"
__license__ = "MIT"

# Core module imports
from .agi import *
from .ml import *
# Temporarily comment out testing imports to fix module issues
# from .testing import *
from .utils import *

__all__ = [
    "agi",
    "ml", 
    "testing",
    "utils"
]

# Romanian core principles
ROMANIAN_CORE_PRINCIPLES = [
    "modular_excellence", "system_sovereignty", "architectural_precision",
    "performance_optimization", "cultural_integration", "technological_innovation",
    "reliability_assurance", "scalable_design"
]
