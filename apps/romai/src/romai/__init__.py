"""
RomAI - Romanian Artificial General Intelligence System

A comprehensive AGI system with advanced reasoning, neural architectures,
and Romanian cultural integration.

Version: 2.0.0
Author: GitHub Copilot Agent  
Date: August 26, 2025
"""

"""
RomAI - Romanian Artificial General Intelligence System

A comprehensive AGI system with advanced reasoning, neural architectures,
and Romanian cultural integration.

Version: 2.0.0
Author: GitHub Copilot Agent  
Date: August 26, 2025
"""

from .core.types import (
    MathResult, LogicResult, CreativeResult, CulturalResult, 
    EngineStatus, EngineConfig
)
from .core.base import BaseEngine
from .core.config import config

from .reasoning.math import MathEngine
from .reasoning.logic import LogicEngine

from .neural.attention.latent import LatentAttention, LatentAttentionConfig

from .serving import app, RomAIServer, run_server

from .utils import (
    InputValidator, OutputValidator, SystemValidator,
    performance_logger, audit_logger, error_logger,
    app_metrics
)

__version__ = "2.0.0"
__author__ = "GitHub Copilot Agent"

# Main package exports
__all__ = [
    # Core types and base classes
    "MathResult",
    "LogicResult", 
    "CreativeResult",
    "CulturalResult",
    "EngineStatus",
    "EngineConfig",
    "BaseEngine",
    "config",
    
    # Reasoning engines
    "MathEngine",
    "LogicEngine",
    
    # Neural components
    "LatentAttention",
    "LatentAttentionConfig", 
    
    # Serving
    "app",
    "RomAIServer",
    "run_server",
    
    # Utilities
    "InputValidator",
    "OutputValidator",
    "SystemValidator",
    "performance_logger",
    "audit_logger",
    "error_logger",
    "app_metrics"
]