"""
Core types and enums for the ROMAI Consciousness Framework.
Defines fundamental consciousness concepts, states, and data structures.
"""

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, IntEnum, auto
from typing import Dict, List, Any, Optional, Set, Union
import numpy as np

# Configure logging
logger = logging.getLogger(__name__)

class ConsciousnessLevel(IntEnum):
    """Levels of consciousness simulation depth."""
    UNCONSCIOUS = 1
    SUBCONSCIOUS = 2
    PRECONSCIOUS = 3
    CONSCIOUS = 4
    SELF_AWARE = 5
    META_CONSCIOUS = 6
    TRANSCENDENT = 7

class AttentionType(Enum):
    """Types of attention mechanisms."""
    FOCUSED = "focused"
    DIVIDED = "divided"
    SUSTAINED = "sustained"
    SELECTIVE = "selective"
    EXECUTIVE = "executive"
    META_ATTENTION = "meta_attention"

class AwarenessScope(Enum):
    """Scope of self-awareness."""
    INTERNAL_STATE = "internal_state"
    COGNITIVE_PROCESSES = "cognitive_processes"
    EMOTIONAL_STATE = "emotional_state"
    BEHAVIORAL_PATTERNS = "behavioral_patterns"
    LEARNING_PROGRESS = "learning_progress"
    GOAL_ALIGNMENT = "goal_alignment"
    ENVIRONMENTAL_CONTEXT = "environmental_context"

class CognitiveProcess(Enum):
    """Types of cognitive processes."""
    PERCEPTION = "perception"
    MEMORY_RETRIEVAL = "memory_retrieval"
    REASONING = "reasoning"
    PLANNING = "planning"
    DECISION_MAKING = "decision_making"
    LEARNING = "learning"
    CREATIVITY = "creativity"
    PROBLEM_SOLVING = "problem_solving"

class IntrospectionDepth(Enum):
    """Depth levels for introspective analysis."""
    SURFACE = auto()
    INTERMEDIATE = auto()
    DEEP = auto()
    PROFOUND = auto()

class DecisionConfidence(Enum):
    """Confidence levels for conscious decisions."""
    VERY_LOW = 0.1
    LOW = 0.3
    MEDIUM = 0.5
    HIGH = 0.7
    VERY_HIGH = 0.9
    ABSOLUTE = 1.0

@dataclass
class ConsciousnessState:
    """Represents the current state of consciousness."""
    level: ConsciousnessLevel
    attention_focus: Set[str] = field(default_factory=set)
    active_processes: Set[CognitiveProcess] = field(default_factory=set)
    awareness_scope: Set[AwarenessScope] = field(default_factory=set)
    consciousness_intensity: float = 0.5
    self_model_accuracy: float = 0.0
    introspection_depth: IntrospectionDepth = IntrospectionDepth.SURFACE
    timestamp: datetime = field(default_factory=datetime.now)
    
@dataclass  
class AttentionState:
    """Current attention mechanism state."""
    primary_focus: str
    attention_type: AttentionType
    focus_intensity: float
    attention_span_remaining: float
    distraction_resistance: float
    divided_attention_targets: List[str] = field(default_factory=list)
    attention_history: List[Dict[str, Any]] = field(default_factory=list)

@dataclass
class IntrospectiveInsight:
    """Represents an insight from introspective analysis."""
    insight_id: str
    process_analyzed: CognitiveProcess
    insight_content: str
    confidence: float
    depth: IntrospectionDepth
    implications: List[str] = field(default_factory=list)
    actionable_items: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class ConsciousDecision:
    """Represents a conscious decision-making process."""
    decision_id: str
    context: Dict[str, Any]
    available_options: List[Dict[str, Any]]
    evaluation_criteria: List[str]
    selected_option: Optional[Dict[str, Any]] = None
    confidence: DecisionConfidence = DecisionConfidence.MEDIUM
    reasoning_chain: List[str] = field(default_factory=list)
    alternative_considerations: List[str] = field(default_factory=list)
    decision_timestamp: Optional[datetime] = None

@dataclass
class SelfModelComponent:
    """Component of the self-model for self-awareness."""
    component_name: str
    current_state: Dict[str, Any]
    historical_patterns: List[Dict[str, Any]] = field(default_factory=list)
    confidence_in_model: float = 0.5
    last_updated: datetime = field(default_factory=datetime.now)
    update_frequency: float = 1.0  # Updates per hour
    
@dataclass
class MetaCognitiveAssessment:
    """Assessment of cognitive processes and their effectiveness."""
    process_type: CognitiveProcess
    performance_metrics: Dict[str, float]
    optimization_opportunities: List[str]
    resource_usage: Dict[str, float]
    effectiveness_score: float
    improvement_suggestions: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)

class ConsciousnessException(Exception):
    """Custom exception for consciousness framework errors."""
    pass

class AttentionOverloadException(ConsciousnessException):
    """Raised when attention mechanisms are overloaded."""
    pass

class SelfAwarenessException(ConsciousnessException):
    """Raised when self-awareness processes encounter errors."""
    pass

# Constants for consciousness framework configuration
CONSCIOUSNESS_CONFIG = {
    "default_consciousness_level": ConsciousnessLevel.CONSCIOUS,
    "attention_span_duration": 300.0,  # seconds
    "introspection_frequency": 60.0,   # seconds
    "self_model_update_threshold": 0.1,
    "decision_confidence_threshold": 0.6,
    "meta_cognition_interval": 120.0,  # seconds
    "max_attention_targets": 5,
    "consciousness_intensity_range": (0.1, 1.0),
    "default_introspection_depth": IntrospectionDepth.INTERMEDIATE
}

# Initialize logging for consciousness framework
def setup_consciousness_logging():
    """Setup logging configuration for consciousness framework."""
    logging.getLogger('ml.consciousness').setLevel(logging.INFO)
    logger.info("🧠 Consciousness Framework types and enums initialized")

if __name__ == "__main__":
    setup_consciousness_logging()
    
    # Test basic type creation
    state = ConsciousnessState(
        level=ConsciousnessLevel.SELF_AWARE,
        attention_focus={"learning", "problem_solving"},
        active_processes={CognitiveProcess.REASONING, CognitiveProcess.PLANNING},
        consciousness_intensity=0.8
    )
    
    logger.info(f"✅ Test consciousness state created: {state.level.value}")
    logger.info(f"✅ Consciousness framework types loaded successfully")