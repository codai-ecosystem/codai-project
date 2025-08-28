"""
ReAct Framework Type Definitions for RomAI AGI System

This module defines the data structures and types used in the ReAct (Reasoning and Acting)
framework implementation, which provides interleaved reasoning traces and actions with
external knowledge integration.

Based on Microsoft Azure AI best practices and the original ReAct paper by Yao et al., 2022.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Union, Literal
from enum import Enum
import time

class ReActActionType(Enum):
    """Available action types in the ReAct framework"""
    MATH = "math"                    # Mathematical reasoning and calculations
    LOGIC = "logic"                  # Logical reasoning and inference
    SEARCH = "search"                # External knowledge search
    MEMORY = "memory"                # MemorAI knowledge retrieval
    ROMANIAN = "romanian"            # Romanian cultural intelligence
    CREATE = "create"                # Creative intelligence and generation
    VALIDATE = "validate"            # Cross-validation with multiple sources
    PLAN = "plan"                    # Strategic planning and decomposition
    OBSERVE = "observe"              # Environment observation and analysis
    FINAL = "final"                  # Final answer generation

class ReActStepStatus(Enum):
    """Status of individual ReAct steps"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class ReActAction:
    """Represents a single action in the ReAct framework"""
    action_type: ReActActionType
    parameters: Dict[str, Any]
    description: str
    expected_outcome: str
    timeout: float = 30.0
    
    def __post_init__(self):
        """Validate action parameters"""
        if not self.parameters:
            self.parameters = {}
        if not self.description:
            raise ValueError("Action description is required")

@dataclass
class ReActObservation:
    """Represents the result of executing an action"""
    action: ReActAction
    result: Any
    success: bool
    execution_time: float
    error_message: Optional[str] = None
    confidence: float = 1.0
    source: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate observation data"""
        if not self.success and not self.error_message:
            self.error_message = "Unknown error occurred"
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("Confidence must be between 0.0 and 1.0")

@dataclass
class ReActStep:
    """Represents a single step in the ReAct reasoning process"""
    step_number: int
    thought: str
    action: Optional[ReActAction]
    observation: Optional[ReActObservation]
    reasoning_trace: str
    confidence: float
    status: ReActStepStatus = ReActStepStatus.PENDING
    timestamp: float = field(default_factory=time.time)
    context_updates: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate step data"""
        if self.step_number < 0:
            raise ValueError("Step number must be non-negative")
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("Confidence must be between 0.0 and 1.0")
        if not self.thought and not self.action:
            raise ValueError("Step must have either a thought or an action")

@dataclass
class ReActContext:
    """Maintains context and state throughout the ReAct process"""
    problem: str
    goal: str
    facts: Dict[str, Any] = field(default_factory=dict)
    assumptions: List[str] = field(default_factory=list)
    constraints: List[str] = field(default_factory=list)
    external_sources: List[str] = field(default_factory=list)
    intermediate_results: Dict[str, Any] = field(default_factory=dict)
    confidence_history: List[float] = field(default_factory=list)
    
    def add_fact(self, key: str, value: Any, source: str = "unknown") -> None:
        """Add a validated fact to the context"""
        self.facts[key] = {
            "value": value,
            "source": source,
            "timestamp": time.time()
        }
    
    def get_fact(self, key: str, default: Any = None) -> Any:
        """Retrieve a fact value from context"""
        fact_data = self.facts.get(key)
        if fact_data:
            return fact_data["value"]
        return default
    
    def update_confidence(self, confidence: float) -> None:
        """Update confidence tracking"""
        if 0.0 <= confidence <= 1.0:
            self.confidence_history.append(confidence)

@dataclass
class ReActResult:
    """Final result of the ReAct reasoning process"""
    problem: str
    final_answer: str
    reasoning_trace: List[ReActStep]
    total_steps: int
    overall_confidence: float
    success: bool
    execution_time: float
    actions_taken: List[ReActActionType]
    external_sources: List[str]
    context: ReActContext
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate result data and calculate derived metrics"""
        if self.total_steps != len(self.reasoning_trace):
            self.total_steps = len(self.reasoning_trace)
        
        # Extract unique action types from steps
        if not self.actions_taken:
            self.actions_taken = list(set([
                step.action.action_type for step in self.reasoning_trace 
                if step.action is not None
            ]))
        
        # Extract external sources from observations
        if not self.external_sources:
            self.external_sources = list(set([
                step.observation.source for step in self.reasoning_trace 
                if step.observation and step.observation.source
            ]))
        
        # Calculate overall confidence if not provided
        if self.overall_confidence == 0.0 and self.reasoning_trace:
            confidences = [step.confidence for step in self.reasoning_trace]
            self.overall_confidence = sum(confidences) / len(confidences)
    
    @property
    def step_count_by_action(self) -> Dict[ReActActionType, int]:
        """Count steps by action type"""
        counts = {}
        for step in self.reasoning_trace:
            if step.action:
                action_type = step.action.action_type
                counts[action_type] = counts.get(action_type, 0) + 1
        return counts
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate of actions"""
        if not self.reasoning_trace:
            return 0.0
        
        successful_steps = sum(1 for step in self.reasoning_trace 
                             if step.status == ReActStepStatus.COMPLETED)
        return successful_steps / len(self.reasoning_trace)
    
    def get_reasoning_summary(self) -> str:
        """Generate a summary of the reasoning process"""
        if not self.reasoning_trace:
            return "No reasoning steps recorded"
        
        summary_parts = [
            f"Problem: {self.problem}",
            f"Total Steps: {self.total_steps}",
            f"Success Rate: {self.success_rate:.1%}",
            f"Overall Confidence: {self.overall_confidence:.2f}",
            f"Actions Used: {', '.join(action.value for action in self.actions_taken)}",
            f"Final Answer: {self.final_answer}"
        ]
        
        return "\n".join(summary_parts)

# Configuration and settings
@dataclass
class ReActConfig:
    """Configuration for ReAct framework execution"""
    max_steps: int = 20
    step_timeout: float = 30.0
    overall_timeout: float = 300.0
    min_confidence_threshold: float = 0.3
    enable_external_search: bool = True
    enable_memory_retrieval: bool = True
    enable_validation: bool = True
    verbose_logging: bool = False
    fallback_strategies: List[str] = field(default_factory=lambda: ["retry", "alternative_action", "simplify"])
    
    def __post_init__(self):
        """Validate configuration"""
        if self.max_steps <= 0:
            raise ValueError("max_steps must be positive")
        if self.step_timeout <= 0:
            raise ValueError("step_timeout must be positive")
        if not 0.0 <= self.min_confidence_threshold <= 1.0:
            raise ValueError("min_confidence_threshold must be between 0.0 and 1.0")

# Exception types for ReAct framework
class ReActException(Exception):
    """Base exception for ReAct framework errors"""
    pass

class ReActTimeoutException(ReActException):
    """Raised when ReAct execution exceeds timeout"""
    pass

class ReActActionException(ReActException):
    """Raised when an action fails to execute"""
    pass

class ReActValidationException(ReActException):
    """Raised when validation fails"""
    pass

# Type aliases for convenience
ReActTrace = List[ReActStep]
ActionExecutor = callable
ReasoningGenerator = callable