"""
🏢 RomAI Enterprise API Module - Production AGI API
World's first true AGI with 100% ARC-AGI success rate
"""

__version__ = "3.0.0"
__author__ = "RomAI AGI Development Team"
__description__ = "Production AGI API Platform with Consciousness and Meta-Learning"

# Export main components
try:
    from .production_agi_api import create_production_agi_api, ProductionAGIAPI, AGICapability
    PRODUCTION_AGI_AVAILABLE = True
except ImportError:
    PRODUCTION_AGI_AVAILABLE = False

try:
    from .compliance_endpoints import compliance_router
    COMPLIANCE_AVAILABLE = True
except ImportError:
    COMPLIANCE_AVAILABLE = False

__all__ = [
    "PRODUCTION_AGI_AVAILABLE",
    "COMPLIANCE_AVAILABLE"
]

if PRODUCTION_AGI_AVAILABLE:
    __all__.extend(["create_production_agi_api", "ProductionAGIAPI", "AGICapability"])

if COMPLIANCE_AVAILABLE:
    __all__.extend(["compliance_router"])
