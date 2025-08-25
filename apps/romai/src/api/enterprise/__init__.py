"""
RomAI Enterprise API Module
"""

__version__ = "3.0.0"
__author__ = "RomAI Development Team"
__description__ = "Enterprise API Platform"

try:
    from .compliance_endpoints import compliance_router
    COMPLIANCE_AVAILABLE = True
except ImportError:
    COMPLIANCE_AVAILABLE = False

__all__ = [
    "COMPLIANCE_AVAILABLE"
]

if COMPLIANCE_AVAILABLE:
    __all__.extend(["compliance_router"])
