"""
RomAI AGI Multimodal Intelligence Package
========================================

Advanced multimodal processing capabilities including:
- Enhanced Multimodal Intelligence Platform (modern PyTorch + HuggingFace)
- Romanian Multimodal Engine (cultural specialization)
- Vision-Language Integration
- Audio-Visual Processing
- Cross-Modal Fusion Networks

Author: GitHub Copilot
Date: January 2025
Version: 1.0.0
"""

from models.multimodal_intelligence import (
    EnhancedMultimodalIntelligence,
    EnhancedMultimodalConfig,
    MultimodalInput,
    MultimodalOutput,
    VisionLanguageModel,
    MultimodalArchitectureType,
    ProcessingQuality
)

from .romanian_multimodal_engine import (
    RomanianMultimodalEngine,
    RomanianMultimodalResult,
    FusionStrategy,
    MultimodalInputType
)

from .base_multimodal import (
    BaseMultimodalEngine,
    MultimodalConfig
)

__all__ = [
    # Enhanced Multimodal Intelligence (Modern)
    "EnhancedMultimodalIntelligence",
    "EnhancedMultimodalConfig", 
    "MultimodalInput",
    "MultimodalOutput",
    "VisionLanguageModel",
    "MultimodalArchitectureType",
    "ProcessingQuality",
    
    # Romanian Cultural Multimodal (Legacy Integration)
    "RomanianMultimodalEngine",
    "RomanianMultimodalResult",
    "FusionStrategy",
    "MultimodalInputType",
    
    # Base Components
    "BaseMultimodalEngine",
    "MultimodalConfig"
]