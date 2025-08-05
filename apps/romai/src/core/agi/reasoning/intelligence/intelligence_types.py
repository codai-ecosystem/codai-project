"""
🧠 Intelligence Types and Core Definitions
==========================================

Core intelligence type definitions, enums, and base classes for the
Week 14 Advanced Intelligence Enhancement System.

This module provides the foundational types and enumerations used
throughout the intelligence enhancement framework.

Author: RomAI AGI Development Team
Date: August 4, 2025
Version: 1.0.0
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Union
from datetime import datetime


class IntelligenceType(Enum):
    """Types of intelligence that can be enhanced"""
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    PRACTICAL = "practical"
    EMOTIONAL = "emotional"
    SOCIAL = "social"
    CULTURAL = "cultural"
    LINGUISTIC = "linguistic"
    INTERPERSONAL = "interpersonal"
    SPATIAL = "spatial"
    KINESTHETIC = "kinesthetic"
    MUSICAL = "musical"
    NATURALISTIC = "naturalistic"


class ReasoningMode(Enum):
    """Modes of reasoning for intelligence enhancement"""
    LOGICAL = "logical"
    CREATIVE = "creative"
    INTUITIVE = "intuitive"
    ANALOGICAL = "analogical"
    CAUSAL = "causal"
    CULTURAL = "cultural"
    METACOGNITIVE = "metacognitive"
    DEDUCTIVE = "deductive"
    INDUCTIVE = "inductive"
    ABDUCTIVE = "abductive"


class CognitiveEnhancementStrategy(Enum):
    """Strategies for cognitive enhancement"""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    ADAPTIVE = "adaptive"
    HIERARCHICAL = "hierarchical"
    CULTURAL_FOCUSED = "cultural_focused"
    PERFORMANCE_OPTIMIZED = "performance_optimized"
    BALANCED = "balanced"
    INTENSIVE = "intensive"


class EnhancementPriority(Enum):
    """Priority levels for enhancement requests"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    CULTURAL = "cultural"
    URGENT = "urgent"


class ProcessingStatus(Enum):
    """Status of processing operations"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class QualityLevel(Enum):
    """Quality levels for enhancement results"""
    POOR = "poor"
    FAIR = "fair"
    GOOD = "good"
    EXCELLENT = "excellent"
    OUTSTANDING = "outstanding"


@dataclass
class IntelligenceMetrics:
    """Metrics for intelligence assessment and enhancement"""
    performance_score: float = 0.0
    accuracy: float = 0.0
    creativity_index: float = 0.0
    cultural_authenticity: float = 0.0
    processing_speed: float = 0.0
    efficiency: float = 0.0
    adaptability: float = 0.0
    consistency: float = 0.0
    
    def calculate_overall_score(self) -> float:
        """Calculate overall intelligence score"""
        metrics = [
            self.performance_score,
            self.accuracy,
            self.creativity_index,
            self.cultural_authenticity,
            self.processing_speed,
            self.efficiency,
            self.adaptability,
            self.consistency
        ]
        return sum(metrics) / len(metrics)
    
    def validate_metrics(self) -> bool:
        """Validate that all metrics are within valid ranges"""
        metrics = [
            self.performance_score,
            self.accuracy,
            self.creativity_index,
            self.cultural_authenticity,
            self.processing_speed,
            self.efficiency,
            self.adaptability,
            self.consistency
        ]
        return all(0.0 <= metric <= 1.0 for metric in metrics)


@dataclass
class IntelligenceCapability:
    """Represents a specific intelligence capability"""
    intelligence_type: IntelligenceType
    capability_name: str
    description: str
    current_level: float = 0.0
    target_level: float = 1.0
    enhancement_potential: float = 0.0
    cultural_relevance: float = 0.0
    romanian_specific: bool = False
    learning_rate: float = 0.1
    improvement_metrics: IntelligenceMetrics = field(default_factory=IntelligenceMetrics)
    last_enhanced: Optional[datetime] = None
    enhancement_history: List[Dict[str, Any]] = field(default_factory=list)
    
    def calculate_enhancement_potential(self) -> float:
        """Calculate the potential for enhancement"""
        gap = self.target_level - self.current_level
        base_potential = gap * self.learning_rate
        
        # Boost for Romanian-specific capabilities
        if self.romanian_specific:
            base_potential *= 1.2
        
        # Adjust for cultural relevance
        cultural_boost = self.cultural_relevance * 0.1
        
        self.enhancement_potential = min(1.0, base_potential + cultural_boost)
        return self.enhancement_potential
    
    def enhance(self, enhancement_amount: float) -> bool:
        """Apply enhancement to this capability"""
        if enhancement_amount <= 0:
            return False
        
        # Calculate actual improvement
        max_improvement = self.enhancement_potential * enhancement_amount
        actual_improvement = min(max_improvement, self.target_level - self.current_level)
        
        # Apply improvement
        old_level = self.current_level
        self.current_level += actual_improvement
        
        # Record enhancement
        enhancement_record = {
            "timestamp": datetime.now(),
            "old_level": old_level,
            "new_level": self.current_level,
            "improvement": actual_improvement,
            "enhancement_amount": enhancement_amount
        }
        self.enhancement_history.append(enhancement_record)
        self.last_enhanced = datetime.now()
        
        return True
    
    def get_enhancement_efficiency(self) -> float:
        """Calculate enhancement efficiency over time"""
        if not self.enhancement_history:
            return 0.0
        
        total_improvement = sum(record["improvement"] for record in self.enhancement_history)
        total_enhancement_input = sum(record["enhancement_amount"] for record in self.enhancement_history)
        
        if total_enhancement_input == 0:
            return 0.0
        
        return total_improvement / total_enhancement_input


# Intelligence type mappings and utilities
INTELLIGENCE_CATEGORIES = {
    "cognitive": [
        IntelligenceType.ANALYTICAL,
        IntelligenceType.LOGICAL,
        IntelligenceType.METACOGNITIVE
    ],
    "creative": [
        IntelligenceType.CREATIVE,
        IntelligenceType.MUSICAL,
        IntelligenceType.SPATIAL
    ],
    "social": [
        IntelligenceType.SOCIAL,
        IntelligenceType.INTERPERSONAL,
        IntelligenceType.EMOTIONAL
    ],
    "cultural": [
        IntelligenceType.CULTURAL,
        IntelligenceType.LINGUISTIC
    ],
    "practical": [
        IntelligenceType.PRACTICAL,
        IntelligenceType.KINESTHETIC,
        IntelligenceType.NATURALISTIC
    ]
}

ROMANIAN_PRIORITY_TYPES = [
    IntelligenceType.CULTURAL,
    IntelligenceType.LINGUISTIC,
    IntelligenceType.SOCIAL,
    IntelligenceType.EMOTIONAL
]

DEFAULT_ENHANCEMENT_THRESHOLDS = {
    "minimum_performance": 0.60,
    "target_performance": 0.85,
    "excellent_performance": 0.95,
    "cultural_authenticity": 0.80,
    "processing_efficiency": 0.75
}


def get_intelligence_category(intelligence_type: IntelligenceType) -> str:
    """Get the category for an intelligence type"""
    for category, types in INTELLIGENCE_CATEGORIES.items():
        if intelligence_type in types:
            return category
    return "unknown"


def is_romanian_priority(intelligence_type: IntelligenceType) -> bool:
    """Check if intelligence type is Romanian priority"""
    return intelligence_type in ROMANIAN_PRIORITY_TYPES


def create_default_capability(intelligence_type: IntelligenceType, 
                            capability_name: str,
                            romanian_specific: bool = False) -> IntelligenceCapability:
    """Create a default intelligence capability"""
    return IntelligenceCapability(
        intelligence_type=intelligence_type,
        capability_name=capability_name,
        description=f"Default {intelligence_type.value} capability: {capability_name}",
        current_level=0.5,
        target_level=0.9,
        cultural_relevance=0.8 if romanian_specific else 0.5,
        romanian_specific=romanian_specific,
        learning_rate=0.15 if romanian_specific else 0.1
    )
