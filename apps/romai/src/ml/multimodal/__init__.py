"""
RUAGA-NOVA Multi-Modal Integration System
========================================

Unified multi-modal understanding with Romanian cultural content recognition.

Components:
- Vision Processing (images, Romanian cultural artifacts)
- Audio Processing (Romanian language, traditional music)  
- Video Processing (Romanian cultural videos)
- Cross-Modal Fusion (unified understanding)
- Romanian Cultural Recognition (visual/audio content)
- Advanced Vision-Language Models (LLaVA, CLIP)
"""

from .base_multimodal import BaseMultiModalProcessor, MultiModalConfig

# Legacy multimodal components (conditional import)
try:
    from .vision_processor import VisionProcessor, RomanianVisualRecognition
    from .audio_processor import AudioProcessor, RomanianAudioAnalysis
    from .video_processor import VideoProcessor, RomanianCulturalVideoAnalysis
    from .cross_modal_fusion import CrossModalFusion, UnifiedMultiModalUnderstanding
    from .romanian_cultural_multimodal import RomanianCulturalMultiModalSystem
    LEGACY_MULTIMODAL_AVAILABLE = True
except ImportError:
    LEGACY_MULTIMODAL_AVAILABLE = False

# Advanced vision-language models
try:
    from .vision_language_model import (
        AdvancedVisionLanguageModel,
        MultimodalInput,
        MultimodalOutput,
        MultimodalTask,
        VisionLanguageArchitecture
    )
    ADVANCED_VLM_AVAILABLE = True
except ImportError:
    ADVANCED_VLM_AVAILABLE = False

__all__ = [
    'BaseMultiModalProcessor',
    'MultiModalConfig'
]

# Add legacy components if available
if LEGACY_MULTIMODAL_AVAILABLE:
    __all__.extend([
        'VisionProcessor',
        'RomanianVisualRecognition',
        'AudioProcessor',
        'RomanianAudioAnalysis',
        'VideoProcessor', 
        'RomanianCulturalVideoAnalysis',
        'CrossModalFusion',
        'UnifiedMultiModalUnderstanding',
        'RomanianCulturalMultiModalSystem'
    ])

# Add advanced VLM components if available
if ADVANCED_VLM_AVAILABLE:
    __all__.extend([
        'AdvancedVisionLanguageModel',
        'MultimodalInput',
        'MultimodalOutput',
        'MultimodalTask',
        'VisionLanguageArchitecture'
    ])