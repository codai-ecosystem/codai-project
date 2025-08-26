"""
RomAI Mixture of Experts (MoE) Package

This package contains the implementation of DeepSeek-V3 style
Mixture of Experts architecture for efficient scaling to 671B parameters
while maintaining 37B active parameters during inference.

Components:
- moe_architecture.py: Core MoE layer implementations
- moe_integration.py: Integration with existing systems
- moe_server_integration.py: Server-specific integration
"""

__version__ = "1.0.0"
__author__ = "RomAI Team"

# Import core components
try:
    from .moe_architecture import *
    from .moe_integration import *
    from .moe_server_integration import *
    _MOE_AVAILABLE = True
except ImportError as e:
    _MOE_AVAILABLE = False
    import logging
    logging.getLogger(__name__).warning(f"⚠️ MoE components unavailable: {e}")

__all__ = [
    'moe_architecture',
    'moe_integration', 
    'moe_server_integration'
]

def get_moe_status():
    """Get MoE package availability status"""
    return {
        'available': _MOE_AVAILABLE,
        'version': __version__,
        'components_loaded': _MOE_AVAILABLE
    }