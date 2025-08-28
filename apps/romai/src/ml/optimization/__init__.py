"""
RomAI AGI Hardware Optimization Module

Advanced hardware optimization system for RTX 3060 Ti 8GB VRAM constraints.
Provides LoRA/QLoRA, quantization, model sharding, and intelligent memory management.
"""

from .hardware_optimizer import (
    HardwareOptimizer,
    HardwareConfig,
    OptimizationLevel,
    MemoryStrategy,
    LoRAOptimizer,
    QuantizationOptimizer,
    ModelShardingManager,
    get_hardware_optimizer,
    initialize_hardware_optimization
)

from .agi_hardware_integration import (
    AGIHardwareIntegration,
    get_agi_hardware_integration,
    apply_hardware_optimization_to_agi,
    get_hardware_optimization_status
)

__all__ = [
    # Hardware Optimizer
    'HardwareOptimizer',
    'HardwareConfig',
    'OptimizationLevel',
    'MemoryStrategy',
    'LoRAOptimizer',
    'QuantizationOptimizer',
    'ModelShardingManager',
    'get_hardware_optimizer',
    'initialize_hardware_optimization',
    
    # AGI Integration
    'AGIHardwareIntegration',
    'get_agi_hardware_integration',
    'apply_hardware_optimization_to_agi',
    'get_hardware_optimization_status'
]

# Initialize default optimizer for RTX 3060 Ti
default_optimizer = None

def setup_rtx_3060_ti_optimization():
    """Setup default optimization for RTX 3060 Ti + i9-14900K"""
    global default_optimizer
    if default_optimizer is None:
        default_optimizer = initialize_hardware_optimization(
            gpu_vram_gb=8.0,
            cpu_ram_gb=192.0,
            optimization_level="balanced"
        )
    return default_optimizer