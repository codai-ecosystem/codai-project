"""
🏢 RomAI Enterprise API Module - Phase 2.1 & 2.2 Implementation
Production-grade enterprise API with advanced EU AI Act compliance
"""

__version__ = "2.2.0"
__author__ = "RomAI Development Team"
__description__ = "Enterprise API Platform with Advanced EU AI Act Compliance"

# Export main components
from .api_platform_minimal import app as enterprise_app
try:
    from .compliance_endpoints import compliance_router
    from .advanced_eu_ai_act_framework import compliance_framework
    COMPLIANCE_AVAILABLE = True
except ImportError:
    COMPLIANCE_AVAILABLE = False

__all__ = [
    "enterprise_app",
    "COMPLIANCE_AVAILABLE"
]

if COMPLIANCE_AVAILABLE:
    __all__.extend(["compliance_router", "compliance_framework"])
