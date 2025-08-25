"""
⚡ Neural Architecture Scaling Package
====================================

Advanced neural architecture scaling and optimization system for RomAI AGI.
Provides comprehensive scaling, optimization, and monitoring capabilities
for large-scale Romanian AI models.

This package includes:
- Neural Architecture Scaler: Dynamic parameter scaling and distributed training
- Neural Optimization Engine: Performance and memory optimization with Romanian specializations
- Performance Monitor: Real-time monitoring and analytics with cultural authenticity tracking

Key Features:
- Scalable from millions to billions of parameters
- Romanian cultural and linguistic optimizations
- Real-time performance monitoring and alerts
- Distributed training support
- Memory efficiency optimizations
- Cultural authenticity tracking

Author: RomAI AGI Development Team
Date: August 4, 2025
Version: 1.0.0
"""

from .neural_architecture_scaler import (
    ArchitectureType,
    ScalingStrategy,
    OptimizationLevel,
    ModelConfiguration,
    ScalingPlan,
    ScalingResult,
    RomanianNeuralBlock,
    AdvancedNeuralArchitecture,
    NeuralArchitectureScaler
)

from .neural_optimization_engine import (
    OptimizationStrategy,
    MemoryOptimizationType,
    RomanianOptimizationType,
    OptimizationTarget,
    OptimizationResult,
    PerformanceMetrics,
    RomanianOptimizer,
    PerformanceOptimizer,
    DistributedOptimizer,
    NeuralOptimizationEngine
)

from .performance_monitor import (
    MetricType,
    AlertLevel,
    MonitoringInterval,
    MetricPoint,
    PerformanceSnapshot,
    Alert,
    TrendAnalysis,
    RomanianQualityTracker,
    ResourceMonitor,
    PerformanceMonitor
)

# Package metadata
__version__ = "1.0.0"
__author__ = "RomAI AGI Development Team"
__description__ = "Advanced neural architecture scaling and optimization for Romanian AI"

# Main exports for external use
__all__ = [
    # Architecture Scaling
    "ArchitectureType",
    "ScalingStrategy", 
    "OptimizationLevel",
    "ModelConfiguration",
    "ScalingPlan",
    "ScalingResult",
    "RomanianNeuralBlock",
    "AdvancedNeuralArchitecture", 
    "NeuralArchitectureScaler",
    
    # Optimization Engine
    "OptimizationStrategy",
    "MemoryOptimizationType",
    "RomanianOptimizationType", 
    "OptimizationTarget",
    "OptimizationResult",
    "PerformanceMetrics",
    "RomanianOptimizer",
    "PerformanceOptimizer",
    "DistributedOptimizer",
    "NeuralOptimizationEngine",
    
    # Performance Monitoring
    "MetricType",
    "AlertLevel",
    "MonitoringInterval",
    "MetricPoint", 
    "PerformanceSnapshot",
    "Alert",
    "TrendAnalysis",
    "RomanianQualityTracker",
    "ResourceMonitor",
    "PerformanceMonitor"
]

# Package-level configuration
DEFAULT_SCALING_CONFIG = ModelConfiguration(
    model_name="RomAI_Base",
    architecture_type=ArchitectureType.HYBRID,
    parameter_count=7_000_000_000,  # 7B parameters
    hidden_size=4096,
    num_layers=32,
    num_attention_heads=32,
    intermediate_size=16384,
    max_sequence_length=4096,
    vocabulary_size=50000,
    romanian_vocab_size=50000,
    cultural_embedding_size=1024,
    regional_adaptation_layers=4,
    performance_target=0.95,
    memory_efficiency_target=0.85,
    cultural_authenticity_target=0.92
)

# Default optimization targets
DEFAULT_OPTIMIZATION_TARGETS = OptimizationTarget(
    max_memory_gb=40.0,
    min_performance_score=0.90,
    min_cultural_authenticity=0.92,
    max_inference_latency_ms=100.0,
    min_throughput_tokens_per_sec=1000.0,
    target_efficiency_score=0.85,
    romanian_quality_threshold=0.90,
    distributed_efficiency_target=0.80
)

def create_scaling_system(
    base_config: ModelConfiguration = None,
    optimization_targets: OptimizationTarget = None,
    enable_monitoring: bool = True,
    device: str = "auto"
) -> tuple:
    """
    Create a complete neural scaling system with scaler, optimizer, and monitor
    
    Args:
        base_config: Base model configuration (uses default if None)
        optimization_targets: Optimization targets (uses default if None)
        enable_monitoring: Whether to enable performance monitoring
        device: Device to use for computations ("auto", "cuda", "cpu")
    
    Returns:
        Tuple of (scaler, optimizer, monitor) instances
    """
    import torch
    
    # Use defaults if not provided
    config = base_config or DEFAULT_SCALING_CONFIG
    targets = optimization_targets or DEFAULT_OPTIMIZATION_TARGETS
    
    # Determine device
    if device == "auto":
        if torch.cuda.is_available():
            device = torch.device("cuda")
        else:
            device = torch.device("cpu")
    else:
        device = torch.device(device)
    
    # Create scaler
    scaler = NeuralArchitectureScaler(
        base_config=config,
        device=device,
        mixed_precision=True,
        gradient_checkpointing=True
    )
    
    # Create optimizer (will need model instance)
    optimizer = None  # Will be created when model is available
    
    # Create monitor
    monitor = None
    if enable_monitoring:
        monitor = PerformanceMonitor(
            model_name=config.model_name,
            monitoring_interval=MonitoringInterval.NORMAL,
            enable_alerts=True
        )
    
    return scaler, optimizer, monitor

def get_romanian_optimization_preset() -> dict:
    """
    Get Romanian-specific optimization preset configuration
    
    Returns:
        Dictionary with Romanian optimization parameters
    """
    return {
        "cultural_weight": 0.15,
        "linguistic_weight": 0.20,
        "regional_weight": 0.10,
        "authenticity_threshold": 0.90,
        "performance_target": 0.95,
        "diacritics_optimization": True,
        "cultural_embedding_compression": True,
        "regional_adaptation_pruning": True,
        "linguistic_pattern_caching": True,
        "authentic_generation_boost": True
    }

def get_scaling_recommendations(current_params: int, target_params: int) -> dict:
    """
    Get scaling recommendations based on parameter counts
    
    Args:
        current_params: Current parameter count
        target_params: Target parameter count
        
    Returns:
        Dictionary with scaling recommendations
    """
    scaling_ratio = target_params / current_params
    
    if scaling_ratio < 2.0:
        strategy = ScalingStrategy.WIDTH_SCALING
        complexity = "low"
    elif scaling_ratio < 10.0:
        strategy = ScalingStrategy.BALANCED
        complexity = "medium" 
    elif scaling_ratio < 100.0:
        strategy = ScalingStrategy.DEPTH_SCALING
        complexity = "high"
    else:
        strategy = ScalingStrategy.ADAPTIVE_SCALING
        complexity = "extreme"
    
    return {
        "recommended_strategy": strategy,
        "complexity": complexity,
        "estimated_time_hours": max(1.0, scaling_ratio * 0.5),
        "memory_requirements_gb": max(8.0, target_params / 1e9 * 4),
        "distributed_training_recommended": scaling_ratio > 50.0,
        "romanian_optimizations_priority": "high" if complexity in ["high", "extreme"] else "medium"
    }

# Package initialization
def initialize_scaling_package():
    """Initialize the scaling package with optimal settings"""
    import logging
    
    # Setup package-level logging
    logger = logging.getLogger("romai.scaling")
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    logger.info("RomAI Neural Architecture Scaling Package initialized")
    logger.info(f"Version: {__version__}")
    logger.info("Features: Scaling, Optimization, Monitoring, Romanian AI Specialization")

# Auto-initialize when package is imported
initialize_scaling_package()
