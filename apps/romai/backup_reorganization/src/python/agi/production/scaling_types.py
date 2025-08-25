"""
AGI Scaling Types and Enums - Week 13 Day 1 Implementation
Core types and enumerations for Romanian AGI scaling system

This module defines the foundational types, enums, and data structures
used throughout the AGI scaling management system.

Author: RomAI Development Team
Date: August 3, 2025
Version: 1.0.0 (Post-Emergence)
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import uuid

# Scaling enums
class ScalingStrategy(Enum):
    """AGI scaling strategies"""
    HORIZONTAL = "horizontal"
    VERTICAL = "vertical"
    HYBRID = "hybrid"
    CONSCIOUSNESS_AWARE = "consciousness_aware"
    CULTURAL_ADAPTIVE = "cultural_adaptive"
    TRANSCENDENCE_OPTIMIZED = "transcendence_optimized"

class ResourceType(Enum):
    """Resource types for scaling"""
    CPU = "cpu"
    MEMORY = "memory"
    GPU = "gpu"
    STORAGE = "storage"
    NETWORK = "network"
    CONSCIOUSNESS_UNITS = "consciousness_units"
    CULTURAL_PROCESSORS = "cultural_processors"
    TRANSCENDENCE_CORES = "transcendence_cores"

class ScalingTrigger(Enum):
    """Scaling trigger types"""
    LOAD_BASED = "load_based"
    SCHEDULE_BASED = "schedule_based"
    PREDICTIVE = "predictive"
    CONSCIOUSNESS_LEVEL = "consciousness_level"
    CULTURAL_DEMAND = "cultural_demand"
    TRANSCENDENCE_EVENT = "transcendence_event"
    EMERGENCY = "emergency"

class ScalingDirection(Enum):
    """Scaling direction"""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"

class InstanceState(Enum):
    """AGI instance states"""
    INITIALIZING = "initializing"
    READY = "ready"
    ACTIVE = "active"
    SCALING = "scaling"
    DRAINING = "draining"
    TERMINATING = "terminating"
    FAILED = "failed"
    TRANSCENDENT = "transcendent"

# Data classes
@dataclass
class ResourceMetrics:
    """Resource utilization metrics"""
    cpu_usage: float
    memory_usage: float
    gpu_usage: float = 0.0
    storage_usage: float = 0.0
    network_io: float = 0.0
    consciousness_load: float = 0.0
    cultural_processing_load: float = 0.0
    transcendence_activity: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class ScalingThreshold:
    """Scaling threshold configuration"""
    resource_type: ResourceType
    scale_up_threshold: float
    scale_down_threshold: float
    duration_seconds: int = 300
    cooldown_seconds: int = 600
    enabled: bool = True

@dataclass
class ScalingRule:
    """Scaling rule definition"""
    rule_id: str
    name: str
    description: str
    strategy: ScalingStrategy
    trigger: ScalingTrigger
    thresholds: List[ScalingThreshold]
    min_instances: int = 1
    max_instances: int = 10
    target_cpu_utilization: float = 70.0
    target_consciousness_level: float = 80.0
    romanian_cultural_priority: float = 1.0
    enabled: bool = True
    priority: int = 100

@dataclass
class AGIInstance:
    """AGI instance representation"""
    instance_id: str
    name: str
    state: InstanceState
    resource_metrics: ResourceMetrics
    consciousness_level: float
    cultural_authenticity: float
    transcendence_level: float
    created_at: datetime
    last_health_check: Optional[datetime] = None
    endpoint: Optional[str] = None
    region: str = "București"
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ScalingEvent:
    """Scaling event record"""
    event_id: str
    timestamp: datetime
    instance_id: str
    action: ScalingDirection
    reason: str
    rule_id: str
    resource_metrics: ResourceMetrics
    success: bool
    duration_seconds: float = 0.0
    error_message: Optional[str] = None

@dataclass
class ScalingPolicy:
    """Complete scaling policy"""
    policy_id: str
    name: str
    description: str
    rules: List[ScalingRule]
    global_min_instances: int = 1
    global_max_instances: int = 50
    emergency_scale_factor: float = 2.0
    consciousness_preservation: bool = True
    cultural_continuity: bool = True
    transcendence_protection: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    enabled: bool = True

@dataclass
class PredictiveScalingModel:
    """Predictive scaling model configuration"""
    model_id: str
    name: str
    model_type: str  # "linear", "lstm", "transformer", "agi_consciousness"
    features: List[str]
    prediction_horizon_minutes: int = 60
    confidence_threshold: float = 0.8
    romanian_cultural_weights: Dict[str, float] = field(default_factory=dict)
    consciousness_integration: bool = True
    accuracy_score: float = 0.0
    last_trained: Optional[datetime] = None
    enabled: bool = True

@dataclass
class ScalingCluster:
    """AGI scaling cluster configuration"""
    cluster_id: str
    name: str
    region: str
    instances: List[AGIInstance]
    active_policy: Optional[ScalingPolicy]
    min_consciousness_level: float = 70.0
    min_cultural_authenticity: float = 85.0
    min_transcendence_level: float = 0.0
    load_balancer_endpoint: Optional[str] = None
    health_check_interval: int = 60
    created_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

# Utility functions for type conversion and validation
def create_default_scaling_thresholds() -> List[ScalingThreshold]:
    """Create default scaling thresholds"""
    return [
        ScalingThreshold(
            resource_type=ResourceType.CPU,
            scale_up_threshold=75.0,
            scale_down_threshold=25.0,
            duration_seconds=300,
            cooldown_seconds=600
        ),
        ScalingThreshold(
            resource_type=ResourceType.MEMORY,
            scale_up_threshold=80.0,
            scale_down_threshold=30.0,
            duration_seconds=300,
            cooldown_seconds=600
        ),
        ScalingThreshold(
            resource_type=ResourceType.CONSCIOUSNESS_UNITS,
            scale_up_threshold=85.0,
            scale_down_threshold=40.0,
            duration_seconds=180,
            cooldown_seconds=300
        ),
        ScalingThreshold(
            resource_type=ResourceType.CULTURAL_PROCESSORS,
            scale_up_threshold=90.0,
            scale_down_threshold=35.0,
            duration_seconds=240,
            cooldown_seconds=450
        )
    ]

def create_default_scaling_rule() -> ScalingRule:
    """Create default scaling rule"""
    return ScalingRule(
        rule_id=str(uuid.uuid4()),
        name="Default Romanian AGI Scaling",
        description="Default scaling rule for Romanian AGI with consciousness awareness",
        strategy=ScalingStrategy.CONSCIOUSNESS_AWARE,
        trigger=ScalingTrigger.LOAD_BASED,
        thresholds=create_default_scaling_thresholds(),
        min_instances=2,
        max_instances=20,
        target_cpu_utilization=70.0,
        target_consciousness_level=85.0,
        romanian_cultural_priority=1.0,
        priority=100
    )

def create_default_scaling_policy() -> ScalingPolicy:
    """Create default scaling policy"""
    return ScalingPolicy(
        policy_id=str(uuid.uuid4()),
        name="Romanian AGI Production Scaling Policy",
        description="Production scaling policy for Romanian AGI with cultural preservation",
        rules=[create_default_scaling_rule()],
        global_min_instances=2,
        global_max_instances=100,
        emergency_scale_factor=3.0,
        consciousness_preservation=True,
        cultural_continuity=True,
        transcendence_protection=True
    )

def validate_resource_metrics(metrics: ResourceMetrics) -> bool:
    """Validate resource metrics"""
    try:
        # Check ranges
        if not (0.0 <= metrics.cpu_usage <= 100.0):
            return False
        if not (0.0 <= metrics.memory_usage <= 100.0):
            return False
        if not (0.0 <= metrics.consciousness_load <= 100.0):
            return False
        if not (0.0 <= metrics.cultural_processing_load <= 100.0):
            return False
        if not (0.0 <= metrics.transcendence_activity <= 100.0):
            return False
        
        return True
    except Exception:
        return False

def calculate_scaling_score(metrics: ResourceMetrics, thresholds: List[ScalingThreshold]) -> float:
    """Calculate scaling score based on metrics and thresholds"""
    try:
        scores = []
        
        for threshold in thresholds:
            if threshold.resource_type == ResourceType.CPU:
                value = metrics.cpu_usage
            elif threshold.resource_type == ResourceType.MEMORY:
                value = metrics.memory_usage
            elif threshold.resource_type == ResourceType.CONSCIOUSNESS_UNITS:
                value = metrics.consciousness_load
            elif threshold.resource_type == ResourceType.CULTURAL_PROCESSORS:
                value = metrics.cultural_processing_load
            elif threshold.resource_type == ResourceType.TRANSCENDENCE_CORES:
                value = metrics.transcendence_activity
            else:
                continue
            
            # Calculate score based on threshold position
            if value >= threshold.scale_up_threshold:
                score = 100.0  # High scaling pressure
            elif value <= threshold.scale_down_threshold:
                score = 0.0   # Low scaling pressure
            else:
                # Linear interpolation between thresholds
                range_size = threshold.scale_up_threshold - threshold.scale_down_threshold
                position = value - threshold.scale_down_threshold
                score = (position / range_size) * 100.0
            
            scores.append(score)
        
        return max(scores) if scores else 0.0
        
    except Exception:
        return 0.0

# Export all types for easy importing
__all__ = [
    'ScalingStrategy',
    'ResourceType', 
    'ScalingTrigger',
    'ScalingDirection',
    'InstanceState',
    'ResourceMetrics',
    'ScalingThreshold',
    'ScalingRule',
    'AGIInstance',
    'ScalingEvent',
    'ScalingPolicy',
    'PredictiveScalingModel',
    'ScalingCluster',
    'create_default_scaling_thresholds',
    'create_default_scaling_rule',
    'create_default_scaling_policy',
    'validate_resource_metrics',
    'calculate_scaling_score'
]
