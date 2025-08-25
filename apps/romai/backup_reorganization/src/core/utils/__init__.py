"""
RomAI Core Utilities Package
============================

Essential utility modules for the RomAI AGI system including:
- Configuration management
- Logging systems  
- Custom exceptions
- Performance monitoring
- Data validation
"""

from .config import RomAIConfig, get_config
from .logging import setup_logging, get_logger
from .exceptions import (
    RomAIError, ConfigurationError, ModelError, DataError,
    CulturalError, LearningError, ReasoningError, MemoryError,
    APIError, PerformanceError, IntegrationError
)
from .validation import (
    DataValidator, ValidationResult, ValidationType,
    create_model_config_validator, create_romanian_cultural_validator,
    validate_performance_metrics
)
from .performance import (
    PerformanceMetrics, PerformanceProfiler, PerformanceTimer,
    get_profiler, profile_operation, get_performance_stats,
    reset_performance_stats, check_performance_health, timeout
)

__all__ = [
    # Configuration
    "RomAIConfig", "get_config",
    
    # Logging
    "setup_logging", "get_logger",
    
    # Exceptions
    "RomAIError", "ConfigurationError", "ModelError", "DataError",
    "CulturalError", "LearningError", "ReasoningError", "MemoryError",
    "APIError", "PerformanceError", "IntegrationError",
    
    # Validation
    "DataValidator", "ValidationResult", "ValidationType",
    "create_model_config_validator", "create_romanian_cultural_validator",
    "validate_performance_metrics",
    
    # Performance
    "PerformanceMetrics", "PerformanceProfiler", "PerformanceTimer",
    "get_profiler", "profile_operation", "get_performance_stats",
    "reset_performance_stats", "check_performance_health", "timeout"
]
