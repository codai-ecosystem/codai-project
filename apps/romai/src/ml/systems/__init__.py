"""
ML Systems for RomAI AGI System
===============================

This module contains complete systems that integrate multiple ML components
for comprehensive functionality, following Microsoft ML best practices.

Systems:
- Uncertainty Quantification System: Advanced confidence estimation using multiple methods
"""

from .uncertainty_quantification_system import (
    UncertaintyQuantificationSystem,
    ConfidenceEstimation,
    get_uncertainty_quantification_system,
    estimate_neural_confidence,  # Backward compatibility
    get_neural_confidence_system  # Backward compatibility
)

__all__ = [
    "UncertaintyQuantificationSystem",
    "ConfidenceEstimation",
    "get_uncertainty_quantification_system",
    "estimate_neural_confidence",
    "get_neural_confidence_system"
]