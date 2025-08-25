"""
RomAI AGI Core Systems Package
==============================

Advanced General Intelligence systems for RomAI including:
- learning: Advanced learning and adaptation systems
- reasoning: Cognitive reasoning frameworks
- memory: Knowledge and memory systems
- coordination: Multi-agent coordination
- cultural: Romanian cultural intelligence integration
- multimodal: Enhanced multimodal intelligence (Vision + Language + Audio)
"""

from .learning import (
    RomanianMetaLearningEngine,
    MetaLearningResult,
    RomanianMetaAdaptationEngine,
    AdaptationResult,
    RomanianFewShotLearningEngine,
    FewShotResult,
    MetaLearningIntegrationOrchestrator,
    Week9Day1MetaLearningFoundation
)

from .multimodal import (
    EnhancedMultimodalIntelligence,
    EnhancedMultimodalConfig,
    MultimodalInput,
    MultimodalOutput,
    VisionLanguageModel,
    MultimodalArchitectureType,
    ProcessingQuality,
    RomanianMultimodalEngine,
    RomanianMultimodalResult,
    FusionStrategy
)

__all__ = [
    # Learning Systems  
    "RomanianMetaLearningEngine",
    "MetaLearningResult",
    "RomanianMetaAdaptationEngine",
    "AdaptationResult",
    "RomanianFewShotLearningEngine",
    "FewShotResult",
    "MetaLearningIntegrationOrchestrator",
    "Week9Day1MetaLearningFoundation",
    
    # Enhanced Multimodal Intelligence (NEW)
    "EnhancedMultimodalIntelligence",
    "EnhancedMultimodalConfig",
    "MultimodalInput", 
    "MultimodalOutput",
    "VisionLanguageModel",
    "MultimodalArchitectureType",
    "ProcessingQuality",
    "RomanianMultimodalEngine",
    "RomanianMultimodalResult",
    "FusionStrategy"
]
