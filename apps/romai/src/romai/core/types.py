"""
Common data types and result classes for RomAI system.

This module provides standardized data structures used across all reasoning engines
and neural components to ensure consistency and type safety.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Union
from enum import Enum
import sympy as sp


class EngineStatus(Enum):
    """Status enumeration for engine operations."""
    SUCCESS = "success"
    ERROR = "error"
    PARTIAL = "partial"
    TIMEOUT = "timeout"


class ConfidenceLevel(Enum):
    """Confidence level enumeration."""
    VERY_LOW = 0.0
    LOW = 0.25
    MEDIUM = 0.5
    HIGH = 0.75
    VERY_HIGH = 1.0


@dataclass
class MathResult:
    """Result class for mathematical operations."""
    # Required fields
    status: EngineStatus
    confidence: float
    processing_time: float
    result: Union[float, int, str, sp.Expr]
    steps: List[str]
    method_used: str
    
    # Optional fields with defaults
    verification: bool = False
    symbolic_form: Optional[str] = None
    numerical_form: Optional[Union[float, int]] = None
    metadata: Optional[Dict[str, Any]] = field(default_factory=dict)
    
    @property
    def success(self) -> bool:
        """Check if operation was successful."""
        return self.status == EngineStatus.SUCCESS
    
    @property
    def failed(self) -> bool:
        """Check if operation failed."""
        return self.status == EngineStatus.ERROR


@dataclass
class LogicResult:
    """Result class for logical reasoning operations."""
    # Required fields
    status: EngineStatus
    confidence: float
    processing_time: float
    conclusion: str
    reasoning_chain: List[str]
    premises: List[str]
    inference_rules: List[str]
    
    # Optional fields with defaults
    validity: bool = False
    logical_form: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = field(default_factory=dict)
    
    @property
    def success(self) -> bool:
        """Check if operation was successful."""
        return self.status == EngineStatus.SUCCESS
    
    @property
    def failed(self) -> bool:
        """Check if operation failed."""
        return self.status == EngineStatus.ERROR


@dataclass
class CreativeResult:
    """Result class for creative reasoning operations."""
    # Required fields
    status: EngineStatus
    confidence: float
    processing_time: float
    creative_output: str
    inspiration_sources: List[str]
    creativity_score: float
    originality_score: float
    coherence_score: float
    
    # Optional fields with defaults
    metadata: Optional[Dict[str, Any]] = field(default_factory=dict)
    
    @property
    def success(self) -> bool:
        """Check if operation was successful."""
        return self.status == EngineStatus.SUCCESS
    
    @property
    def failed(self) -> bool:
        """Check if operation failed."""
        return self.status == EngineStatus.ERROR


@dataclass
class CulturalResult:
    """Result class for cultural reasoning operations."""
    # Required fields
    status: EngineStatus
    confidence: float
    processing_time: float
    cultural_analysis: str
    cultural_context: Dict[str, Any]
    relevance_score: float
    cultural_sensitivity: float
    
    # Optional fields with defaults
    metadata: Optional[Dict[str, Any]] = field(default_factory=dict)
    
    @property
    def success(self) -> bool:
        """Check if operation was successful."""
        return self.status == EngineStatus.SUCCESS
    
    @property
    def failed(self) -> bool:
        """Check if operation failed."""
        return self.status == EngineStatus.ERROR


@dataclass
class EngineConfig:
    """Configuration class for reasoning engines."""
    max_iterations: int = 100
    timeout_seconds: float = 30.0
    confidence_threshold: float = 0.5
    enable_cultural_context: bool = True
    enable_romanian_processing: bool = True
    log_level: str = "INFO"
    cache_enabled: bool = True
    max_cache_size: int = 1000