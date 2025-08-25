"""
RomAI Exception Hierarchy
=========================

Custom exception classes for the RomAI AGI system.
"""

from typing import Optional, Any, Dict


class RomAIError(Exception):
    """Base exception for all RomAI errors"""
    
    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or {}
    
    def __str__(self) -> str:
        if self.error_code:
            return f"[{self.error_code}] {self.message}"
        return self.message


# Configuration Errors
class ConfigurationError(RomAIError):
    """Raised when there's a configuration issue"""
    pass


class EnvironmentError(ConfigurationError):
    """Raised when environment variables are missing or invalid"""
    pass


# Model Errors
class ModelError(RomAIError):
    """Base class for model-related errors"""
    pass


class ModelLoadError(ModelError):
    """Raised when a model fails to load"""
    pass


class ModelInferenceError(ModelError):
    """Raised when model inference fails"""
    pass


class ModelTrainingError(ModelError):
    """Raised when model training fails"""
    pass


# Data Errors
class DataError(RomAIError):
    """Base class for data-related errors"""
    pass


class DataValidationError(DataError):
    """Raised when data validation fails"""
    pass


class DataProcessingError(DataError):
    """Raised when data processing fails"""
    pass


class DataNotFoundError(DataError):
    """Raised when required data is not found"""
    pass


# Cultural System Errors
class CulturalError(RomAIError):
    """Base class for cultural system errors"""
    pass


class CulturalValidationError(CulturalError):
    """Raised when cultural validation fails"""
    pass


class CulturalPatternError(CulturalError):
    """Raised when cultural pattern recognition fails"""
    pass


# Learning System Errors
class LearningError(RomAIError):
    """Base class for learning system errors"""
    pass


class AdaptationError(LearningError):
    """Raised when adaptation fails"""
    pass


class MetaLearningError(LearningError):
    """Raised when meta-learning fails"""
    pass


class TransferLearningError(LearningError):
    """Raised when transfer learning fails"""
    pass


# Reasoning System Errors
class ReasoningError(RomAIError):
    """Base class for reasoning system errors"""
    pass


class LogicalReasoningError(ReasoningError):
    """Raised when logical reasoning fails"""
    pass


class CreativeReasoningError(ReasoningError):
    """Raised when creative reasoning fails"""
    pass


class ContextualReasoningError(ReasoningError):
    """Raised when contextual reasoning fails"""
    pass


# Memory System Errors
class MemoryError(RomAIError):
    """Base class for memory system errors"""
    pass


class MemoryStorageError(MemoryError):
    """Raised when memory storage fails"""
    pass


class MemoryRetrievalError(MemoryError):
    """Raised when memory retrieval fails"""
    pass


class MemoryIndexError(MemoryError):
    """Raised when memory indexing fails"""
    pass


# API Errors
class APIError(RomAIError):
    """Base class for API-related errors"""
    pass


class AuthenticationError(APIError):
    """Raised when authentication fails"""
    pass


class AuthorizationError(APIError):
    """Raised when authorization fails"""
    pass


class RateLimitError(APIError):
    """Raised when rate limits are exceeded"""
    pass


class ValidationError(APIError):
    """Raised when API input validation fails"""
    pass


# Performance Errors
class PerformanceError(RomAIError):
    """Base class for performance-related errors"""
    pass


class TimeoutError(PerformanceError):
    """Raised when operations timeout"""
    pass


class ResourceError(PerformanceError):
    """Raised when resource limits are exceeded"""
    pass


class OptimizationError(PerformanceError):
    """Raised when optimization fails"""
    pass


# Integration Errors
class IntegrationError(RomAIError):
    """Base class for integration errors"""
    pass


class ExternalServiceError(IntegrationError):
    """Raised when external service integration fails"""
    pass


class DatabaseError(IntegrationError):
    """Raised when database operations fail"""
    pass


class NetworkError(IntegrationError):
    """Raised when network operations fail"""
    pass


# Warning Classes (for non-fatal issues)
class RomAIWarning(UserWarning):
    """Base warning for RomAI system"""
    pass


class PerformanceWarning(RomAIWarning):
    """Warning for performance issues"""
    pass


class CulturalWarning(RomAIWarning):
    """Warning for cultural authenticity issues"""
    pass


class CompatibilityWarning(RomAIWarning):
    """Warning for compatibility issues"""
    pass


# Error Handler Functions
def handle_error(
    error: Exception,
    context: Optional[str] = None,
    raise_original: bool = True
) -> Optional[RomAIError]:
    """
    Handle and convert generic exceptions to RomAI exceptions
    
    Args:
        error: The original exception
        context: Additional context information
        raise_original: Whether to raise the original exception
    
    Returns:
        RomAI exception if not raising original
    """
    from .logging import get_logger
    
    logger = get_logger()
    
    # Create context message
    context_msg = f" (Context: {context})" if context else ""
    
    # Map common exceptions to RomAI exceptions
    if isinstance(error, FileNotFoundError):
        romai_error = DataNotFoundError(
            f"File not found: {error}{context_msg}",
            error_code="DATA_NOT_FOUND",
            details={"original_error": str(error), "context": context}
        )
    elif isinstance(error, ValueError):
        romai_error = DataValidationError(
            f"Invalid value: {error}{context_msg}",
            error_code="VALIDATION_ERROR",
            details={"original_error": str(error), "context": context}
        )
    elif isinstance(error, KeyError):
        romai_error = ConfigurationError(
            f"Missing key: {error}{context_msg}",
            error_code="MISSING_KEY",
            details={"original_error": str(error), "context": context}
        )
    elif isinstance(error, ImportError):
        romai_error = ModelLoadError(
            f"Import failed: {error}{context_msg}",
            error_code="IMPORT_ERROR",
            details={"original_error": str(error), "context": context}
        )
    else:
        romai_error = RomAIError(
            f"Unexpected error: {error}{context_msg}",
            error_code="UNKNOWN_ERROR",
            details={"original_error": str(error), "context": context}
        )
    
    # Log the error
    logger.error(f"Error handled: {romai_error}")
    
    if raise_original:
        raise romai_error
    
    return romai_error
