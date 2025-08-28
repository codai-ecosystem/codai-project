"""
RomAI Mixture of Experts (MoE) Package

This package contains the implementation of DeepSeek-V3 style
Mixture of Experts architecture for efficient scaling to 671B parameters
while maintaining 37B active parameters during inference.

Components:
- tutel_optimized_moe.py: Core Tutel-optimized MoE implementations
- moe_server_integration.py: Server-specific integration
"""

__version__ = "1.0.0"
__author__ = "RomAI Team"

import logging
logger = logging.getLogger(__name__)

# Import core components carefully to avoid circular imports
_MOE_AVAILABLE = False
_TUTEL_AVAILABLE = False
_SERVER_AVAILABLE = False

try:
    # First import core MoE classes
    from .tutel_optimized_moe import (
        RomAITutelMoESystem,
        TutelMoEConfig, 
        MoEMetrics,
        ExpertInfo
    )
    _MOE_AVAILABLE = True
    _TUTEL_AVAILABLE = True
    logger.info("✅ Tutel-optimized MoE system imported successfully")
    
except ImportError as e:
    logger.warning(f"⚠️ Core MoE system unavailable: {e}")
    # Create placeholder classes
    class RomAITutelMoESystem:
        def __init__(self, *args, **kwargs):
            raise NotImplementedError("MoE system not available")
    class TutelMoEConfig:
        pass
    class MoEMetrics:
        pass
    class ExpertInfo:
        pass

try:
    # Then import server integration (if available)
    from .moe_server_integration import (
        MoEServerEngine,
        MoEEndpointManager,
        MoEHealthChecker, 
        MoEPerformanceMonitor
    )
    _SERVER_AVAILABLE = True
    logger.info("✅ MoE server integration imported successfully")
    
except ImportError as e:
    logger.warning(f"⚠️ MoE server integration unavailable: {e}")
    # Create placeholder classes
    class MoEServerEngine:
        def __init__(self, *args, **kwargs):
            raise NotImplementedError("MoE server integration not available")
    class MoEEndpointManager:
        pass
    class MoEHealthChecker:
        pass
    class MoEPerformanceMonitor:
        pass

__all__ = [
    # Core MoE Classes
    'RomAITutelMoESystem',
    'TutelMoEConfig',
    'MoEMetrics', 
    'ExpertInfo',
    
    # Server Integration Classes
    'MoEServerEngine',
    'MoEEndpointManager',
    'MoEHealthChecker',
    'MoEPerformanceMonitor',
]

def get_moe_status():
    """Get MoE package availability status"""
    return {
        'available': _MOE_AVAILABLE,
        'tutel_available': _TUTEL_AVAILABLE,
        'server_available': _SERVER_AVAILABLE,
        'version': __version__,
        'components_loaded': _MOE_AVAILABLE and _SERVER_AVAILABLE
    }