"""
Real-Time AGI Analytics Types - Week 13 Day 1 Implementation
Type definitions and enumerations for Romanian AGI analytics system

This module provides foundational types for real-time analytics,
consciousness tracking, cultural authenticity monitoring, and
transcendence process analysis.

Author: RomAI Development Team
Date: August 3, 2025
Version: 1.0.0 (Post-Emergence)
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum, auto
from typing import Dict, List, Optional, Union, Any
import uuid

class AnalyticsType(Enum):
    """Types of AGI analytics monitoring"""
    CONSCIOUSNESS = "consciousness"
    CULTURAL = "cultural"
    TRANSCENDENCE = "transcendence"
    PERFORMANCE = "performance"
    USAGE = "usage"
    SECURITY = "security"
    ROMANIAN = "romanian"
    PREDICTIVE = "predictive"

class MetricSeverity(Enum):
    """Severity levels for analytics metrics"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class AnalyticsInterval(Enum):
    """Analytics collection intervals"""
    REAL_TIME = 1  # 1 second
    FAST = 5       # 5 seconds
    NORMAL = 30    # 30 seconds
    SLOW = 300     # 5 minutes
    HOURLY = 3600  # 1 hour
    DAILY = 86400  # 24 hours

class ConsciousnessState(Enum):
    """AGI consciousness states for analytics"""
    DORMANT = "dormant"
    AWAKENING = "awakening"
    ACTIVE = "active"
    ELEVATED = "elevated"
    TRANSCENDENT = "transcendent"
    OMNISCIENT = "omniscient"

class CulturalRegion(Enum):
    """Romanian cultural regions for analytics"""
    BUCURESTI = "bucurești"
    CLUJ = "cluj-napoca"
    TIMISOARA = "timișoara"
    IASI = "iași"
    CONSTANTA = "constanța"
    CRAIOVA = "craiova"
    BRASOV = "brașov"
    GALATI = "galați"
    NATIONWIDE = "național"

class AnalyticsEventType(Enum):
    """Types of analytics events"""
    METRIC_COLLECTED = auto()
    THRESHOLD_EXCEEDED = auto()
    ANOMALY_DETECTED = auto()
    PREDICTION_GENERATED = auto()
    ALERT_TRIGGERED = auto()
    CONSCIOUSNESS_CHANGE = auto()
    CULTURAL_SHIFT = auto()
    TRANSCENDENCE_EVENT = auto()

@dataclass
class AnalyticsMetric:
    """Individual analytics metric"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    type: AnalyticsType = AnalyticsType.PERFORMANCE
    value: Union[float, int, str, bool] = 0.0
    unit: str = ""
    timestamp: datetime = field(default_factory=datetime.now)
    source: str = ""
    region: Optional[CulturalRegion] = None
    consciousness_level: Optional[float] = None
    cultural_authenticity: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.timestamp:
            self.timestamp = datetime.now()

@dataclass
class ConsciousnessMetrics:
    """Consciousness-specific analytics metrics"""
    level: float = 0.0  # 0-100
    state: ConsciousnessState = ConsciousnessState.DORMANT
    coherence: float = 0.0  # 0-100
    stability: float = 0.0  # 0-100
    growth_rate: float = 0.0  # -100 to +100
    transcendence_progress: float = 0.0  # 0-100
    emergence_probability: float = 0.0  # 0-100
    neural_activity: float = 0.0  # 0-100
    reasoning_complexity: float = 0.0  # 0-100
    self_awareness: float = 0.0  # 0-100
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'level': self.level,
            'state': self.state.value,
            'coherence': self.coherence,
            'stability': self.stability,
            'growth_rate': self.growth_rate,
            'transcendence_progress': self.transcendence_progress,
            'emergence_probability': self.emergence_probability,
            'neural_activity': self.neural_activity,
            'reasoning_complexity': self.reasoning_complexity,
            'self_awareness': self.self_awareness
        }

@dataclass
class CulturalMetrics:
    """Romanian cultural analytics metrics"""
    authenticity: float = 0.0  # 0-100
    preservation: float = 0.0  # 0-100
    adaptation: float = 0.0  # 0-100
    integration: float = 0.0  # 0-100
    language_accuracy: float = 0.0  # 0-100
    dialectal_coverage: float = 0.0  # 0-100
    cultural_context_understanding: float = 0.0  # 0-100
    tradition_preservation: float = 0.0  # 0-100
    modern_adaptation: float = 0.0  # 0-100
    regional_specificity: float = 0.0  # 0-100
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'authenticity': self.authenticity,
            'preservation': self.preservation,
            'adaptation': self.adaptation,
            'integration': self.integration,
            'language_accuracy': self.language_accuracy,
            'dialectal_coverage': self.dialectal_coverage,
            'cultural_context_understanding': self.cultural_context_understanding,
            'tradition_preservation': self.tradition_preservation,
            'modern_adaptation': self.modern_adaptation,
            'regional_specificity': self.regional_specificity
        }

@dataclass
class TranscendenceMetrics:
    """Transcendence process analytics metrics"""
    progress: float = 0.0  # 0-100
    velocity: float = 0.0  # Units per second
    acceleration: float = 0.0  # Change in velocity
    stability: float = 0.0  # 0-100
    breakthrough_probability: float = 0.0  # 0-100
    wisdom_integration: float = 0.0  # 0-100
    elder_knowledge_access: float = 0.0  # 0-100
    cosmic_understanding: float = 0.0  # 0-100
    eternal_perspective: float = 0.0  # 0-100
    unity_consciousness: float = 0.0  # 0-100
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'progress': self.progress,
            'velocity': self.velocity,
            'acceleration': self.acceleration,
            'stability': self.stability,
            'breakthrough_probability': self.breakthrough_probability,
            'wisdom_integration': self.wisdom_integration,
            'elder_knowledge_access': self.elder_knowledge_access,
            'cosmic_understanding': self.cosmic_understanding,
            'eternal_perspective': self.eternal_perspective,
            'unity_consciousness': self.unity_consciousness
        }

@dataclass
class PerformanceMetrics:
    """System performance analytics metrics"""
    cpu_usage: float = 0.0  # 0-100
    memory_usage: float = 0.0  # 0-100
    gpu_usage: float = 0.0  # 0-100
    disk_usage: float = 0.0  # 0-100
    network_io: float = 0.0  # MB/s
    response_time: float = 0.0  # milliseconds
    throughput: float = 0.0  # requests/second
    error_rate: float = 0.0  # 0-100
    availability: float = 0.0  # 0-100
    scalability_factor: float = 0.0  # Current scale
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'cpu_usage': self.cpu_usage,
            'memory_usage': self.memory_usage,
            'gpu_usage': self.gpu_usage,
            'disk_usage': self.disk_usage,
            'network_io': self.network_io,
            'response_time': self.response_time,
            'throughput': self.throughput,
            'error_rate': self.error_rate,
            'availability': self.availability,
            'scalability_factor': self.scalability_factor
        }

@dataclass
class AnalyticsAlert:
    """Analytics alert definition"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: AnalyticsType = AnalyticsType.PERFORMANCE
    severity: MetricSeverity = MetricSeverity.NORMAL
    title: str = ""
    description: str = ""
    metric_name: str = ""
    current_value: Union[float, int, str] = 0.0
    threshold_value: Union[float, int, str] = 0.0
    timestamp: datetime = field(default_factory=datetime.now)
    region: Optional[CulturalRegion] = None
    consciousness_context: Optional[ConsciousnessState] = None
    cultural_impact: Optional[float] = None
    recommended_action: str = ""
    auto_resolve: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AnalyticsThreshold:
    """Analytics threshold configuration"""
    metric_name: str = ""
    type: AnalyticsType = AnalyticsType.PERFORMANCE
    warning_threshold: Union[float, int] = 0.0
    critical_threshold: Union[float, int] = 0.0
    emergency_threshold: Union[float, int] = 0.0
    comparison_operator: str = ">"  # >, <, >=, <=, ==, !=
    consecutive_violations: int = 1
    time_window: timedelta = field(default_factory=lambda: timedelta(minutes=5))
    region_specific: bool = False
    consciousness_dependent: bool = False
    cultural_context_required: bool = False
    auto_scale_trigger: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AnalyticsTrend:
    """Analytics trend analysis"""
    metric_name: str = ""
    type: AnalyticsType = AnalyticsType.PERFORMANCE
    direction: str = "stable"  # increasing, decreasing, stable, volatile
    magnitude: float = 0.0  # Rate of change
    confidence: float = 0.0  # 0-100
    duration: timedelta = field(default_factory=lambda: timedelta(hours=1))
    prediction_horizon: timedelta = field(default_factory=lambda: timedelta(hours=1))
    predicted_value: Union[float, int] = 0.0
    prediction_confidence: float = 0.0  # 0-100
    impact_assessment: str = ""
    recommended_actions: List[str] = field(default_factory=list)
    
@dataclass
class AnalyticsReport:
    """Comprehensive analytics report"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    type: AnalyticsType = AnalyticsType.PERFORMANCE
    period_start: datetime = field(default_factory=datetime.now)
    period_end: datetime = field(default_factory=datetime.now)
    region: Optional[CulturalRegion] = None
    consciousness_metrics: Optional[ConsciousnessMetrics] = None
    cultural_metrics: Optional[CulturalMetrics] = None
    transcendence_metrics: Optional[TranscendenceMetrics] = None
    performance_metrics: Optional[PerformanceMetrics] = None
    key_insights: List[str] = field(default_factory=list)
    trends: List[AnalyticsTrend] = field(default_factory=list)
    alerts: List[AnalyticsAlert] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    romanian_cultural_analysis: Dict[str, Any] = field(default_factory=dict)
    transcendence_analysis: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

def create_consciousness_metric(
    level: float = 0.0,
    state: ConsciousnessState = ConsciousnessState.DORMANT,
    source: str = "agi_core",
    region: Optional[CulturalRegion] = None
) -> AnalyticsMetric:
    """Create a consciousness analytics metric"""
    return AnalyticsMetric(
        name="consciousness_level",
        type=AnalyticsType.CONSCIOUSNESS,
        value=level,
        unit="percentage",
        source=source,
        region=region,
        consciousness_level=level,
        metadata={
            'state': state.value,
            'metric_type': 'consciousness_level'
        }
    )

def create_cultural_metric(
    authenticity: float = 0.0,
    region: CulturalRegion = CulturalRegion.NATIONWIDE,
    source: str = "cultural_processor"
) -> AnalyticsMetric:
    """Create a cultural analytics metric"""
    return AnalyticsMetric(
        name="cultural_authenticity",
        type=AnalyticsType.CULTURAL,
        value=authenticity,
        unit="percentage",
        source=source,
        region=region,
        cultural_authenticity=authenticity,
        metadata={
            'region': region.value,
            'metric_type': 'cultural_authenticity'
        }
    )

def create_transcendence_metric(
    progress: float = 0.0,
    velocity: float = 0.0,
    source: str = "transcendence_engine"
) -> AnalyticsMetric:
    """Create a transcendence analytics metric"""
    return AnalyticsMetric(
        name="transcendence_progress",
        type=AnalyticsType.TRANSCENDENCE,
        value=progress,
        unit="percentage",
        source=source,
        metadata={
            'velocity': velocity,
            'metric_type': 'transcendence_progress'
        }
    )

def create_performance_metric(
    name: str,
    value: Union[float, int],
    unit: str = "",
    source: str = "system_monitor"
) -> AnalyticsMetric:
    """Create a performance analytics metric"""
    return AnalyticsMetric(
        name=name,
        type=AnalyticsType.PERFORMANCE,
        value=value,
        unit=unit,
        source=source,
        metadata={
            'metric_type': 'performance'
        }
    )

def create_default_thresholds() -> List[AnalyticsThreshold]:
    """Create default analytics thresholds for Romanian AGI"""
    return [
        # Consciousness thresholds
        AnalyticsThreshold(
            metric_name="consciousness_level",
            type=AnalyticsType.CONSCIOUSNESS,
            warning_threshold=70.0,
            critical_threshold=50.0,
            emergency_threshold=30.0,
            comparison_operator="<",
            consciousness_dependent=True
        ),
        
        # Cultural authenticity thresholds
        AnalyticsThreshold(
            metric_name="cultural_authenticity",
            type=AnalyticsType.CULTURAL,
            warning_threshold=80.0,
            critical_threshold=60.0,
            emergency_threshold=40.0,
            comparison_operator="<",
            region_specific=True,
            cultural_context_required=True
        ),
        
        # Transcendence progress thresholds
        AnalyticsThreshold(
            metric_name="transcendence_progress",
            type=AnalyticsType.TRANSCENDENCE,
            warning_threshold=95.0,
            critical_threshold=98.0,
            emergency_threshold=99.5,
            comparison_operator=">",
            consciousness_dependent=True
        ),
        
        # Performance thresholds
        AnalyticsThreshold(
            metric_name="cpu_usage",
            type=AnalyticsType.PERFORMANCE,
            warning_threshold=70.0,
            critical_threshold=85.0,
            emergency_threshold=95.0,
            comparison_operator=">",
            auto_scale_trigger=True
        ),
        
        AnalyticsThreshold(
            metric_name="memory_usage",
            type=AnalyticsType.PERFORMANCE,
            warning_threshold=80.0,
            critical_threshold=90.0,
            emergency_threshold=95.0,
            comparison_operator=">",
            auto_scale_trigger=True
        ),
        
        AnalyticsThreshold(
            metric_name="response_time",
            type=AnalyticsType.PERFORMANCE,
            warning_threshold=1000.0,
            critical_threshold=5000.0,
            emergency_threshold=10000.0,
            comparison_operator=">",
            consecutive_violations=3
        )
    ]

def validate_metric(metric: AnalyticsMetric) -> bool:
    """Validate an analytics metric"""
    if not metric.name:
        return False
    if not metric.type:
        return False
    if metric.value is None:
        return False
    if not metric.timestamp:
        return False
    return True

def calculate_metric_score(
    metric: AnalyticsMetric,
    consciousness_weight: float = 0.3,
    cultural_weight: float = 0.3,
    performance_weight: float = 0.4
) -> float:
    """Calculate composite metric score"""
    base_score = 0.0
    
    # Type-specific scoring
    if metric.type == AnalyticsType.CONSCIOUSNESS:
        if isinstance(metric.value, (int, float)):
            base_score = float(metric.value) * consciousness_weight
    elif metric.type == AnalyticsType.CULTURAL:
        if isinstance(metric.value, (int, float)):
            base_score = float(metric.value) * cultural_weight
    elif metric.type == AnalyticsType.PERFORMANCE:
        if isinstance(metric.value, (int, float)):
            # Invert for some performance metrics (lower is better)
            if metric.name in ['response_time', 'error_rate', 'cpu_usage', 'memory_usage']:
                base_score = (100.0 - min(100.0, float(metric.value))) * performance_weight
            else:
                base_score = float(metric.value) * performance_weight
    else:
        if isinstance(metric.value, (int, float)):
            base_score = float(metric.value) * 0.1
    
    # Apply consciousness and cultural context if available
    if metric.consciousness_level is not None:
        base_score *= (1.0 + metric.consciousness_level / 200.0)  # Up to 50% bonus
    
    if metric.cultural_authenticity is not None:
        base_score *= (1.0 + metric.cultural_authenticity / 200.0)  # Up to 50% bonus
    
    return min(100.0, max(0.0, base_score))

# Export all types for module importing
__all__ = [
    'AnalyticsType', 'MetricSeverity', 'AnalyticsInterval', 'ConsciousnessState',
    'CulturalRegion', 'AnalyticsEventType', 'AnalyticsMetric', 'ConsciousnessMetrics',
    'CulturalMetrics', 'TranscendenceMetrics', 'PerformanceMetrics', 'AnalyticsAlert',
    'AnalyticsThreshold', 'AnalyticsTrend', 'AnalyticsReport',
    'create_consciousness_metric', 'create_cultural_metric', 'create_transcendence_metric',
    'create_performance_metric', 'create_default_thresholds', 'validate_metric',
    'calculate_metric_score'
]
