"""
Romanian Visual Processing Package
Complete visual analysis system for Romanian cultural content
Week 8 Day 3 - RomAI Multimodal System
"""

from .visual_analysis_core import (
    ImageSegment,
    VisualAnalysisRequest,
    VisualAnalysisResult,
    VisualPreprocessor,
    RomanianLanguageDetector,
    VisualQualityAssessment,
    RomanianCulturalMarkerDetector,
    AnalysisQuality,
    RomanianRegion,
    VisualFeatureType,
    FeatureExtractorBase
)

from .romanian_object_detection import (
    RomanianObjectDetector,
    RomanianSceneAnalyzer,
    DetectedObject,
    SceneAnalysis,
    RomanianObjectCategory,
    SceneType
)

from .romanian_text_recognition import (
    RomanianOCREngine,
    RomanianTextAnalysis,
    TextRegion,
    TextType,
    RomanianTextCategory,
    LinguisticFeatures,
    PhoneticAnalysis,
    MorphologicalAnalysis,
    SyntacticAnalysis
)

from .romanian_visual_pipeline import (
    RomanianVisualProcessingPipeline,
    ComprehensiveVisualAnalysis,
    analyze_romanian_image,
    quick_romanian_visual_analysis
)

# Version information
__version__ = "1.0.0"
__author__ = "RomAI Development Team"
__description__ = "Romanian Visual Processing System - Complete visual analysis for Romanian cultural content"

# Package metadata
__all__ = [
    # Core components
    "ImageSegment",
    "VisualAnalysisRequest", 
    "VisualAnalysisResult",
    "VisualPreprocessor",
    "RomanianLanguageDetector",
    "VisualQualityAssessment",
    "RomanianCulturalMarkerDetector",
    "FeatureExtractorBase",
    
    # Object detection
    "RomanianObjectDetector",
    "RomanianSceneAnalyzer",
    "DetectedObject",
    "SceneAnalysis",
    
    # Text recognition
    "RomanianOCREngine",
    "RomanianTextAnalysis",
    "TextRegion",
    "LinguisticFeatures",
    "PhoneticAnalysis",
    "MorphologicalAnalysis",
    "SyntacticAnalysis",
    
    # Main pipeline
    "RomanianVisualProcessingPipeline",
    "ComprehensiveVisualAnalysis",
    
    # Convenience functions
    "analyze_romanian_image",
    "quick_romanian_visual_analysis",
    
    # Enums and types
    "AnalysisQuality",
    "RomanianRegion",
    "VisualFeatureType",
    "RomanianObjectCategory",
    "SceneType",
    "TextType",
    "RomanianTextCategory"
]

# Configuration constants
DEFAULT_ANALYSIS_QUALITY = AnalysisQuality.STANDARD
DEFAULT_REGION = RomanianRegion.BUCURESTI

# Processing configuration
PROCESSING_CONFIG = {
    'version': __version__,
    'supported_formats': ['jpg', 'jpeg', 'png', 'bmp', 'tiff'],
    'max_image_size': (4096, 4096),
    'min_image_size': (100, 100),
    'default_quality': DEFAULT_ANALYSIS_QUALITY,
    'default_region': DEFAULT_REGION,
    'parallel_processing': True,
    'cache_enabled': True,
    'cultural_analysis_enabled': True,
    'text_recognition_enabled': True,
    'object_detection_enabled': True
}

# Romanian cultural markers configuration
CULTURAL_MARKERS_CONFIG = {
    'traditional_architecture': {
        'wooden_churches': ['biserici_de_lemn', 'maramures_churches'],
        'painted_monasteries': ['bucovina_monasteries', 'moldavia_monasteries'],
        'fortified_churches': ['transylvania_churches', 'saxon_churches'],
        'traditional_houses': ['casa_taraneasca', 'casa_olteneasca']
    },
    'national_symbols': {
        'flag_colors': ['albastru', 'galben', 'rosu'],
        'coat_of_arms': ['vultur', 'scut', 'coroana'],
        'traditional_dress': ['ie', 'catrinta', 'opinci']
    },
    'regional_specific': {
        'maramures': ['poarta_maramureseana', 'biserica_lemn'],
        'transylvania': ['cetati_medievale', 'biserici_fortificate'],
        'moldova': ['manastiri_pictate', 'ceramica_horezu'],
        'oltenia': ['brancusi_sculptures', 'ceramica_olteneasca'],
        'muntenia': ['palate_regale', 'arhitectura_brancoveana']
    }
}

# Text recognition configuration
TEXT_RECOGNITION_CONFIG = {
    'romanian_diacritics': ['ă', 'â', 'î', 'ș', 'ț'],
    'regional_dialects': {
        'maramures': ['dialectul_maramuresan'],
        'transylvania': ['dialectul_ardelenesc'],
        'moldova': ['dialectul_moldovenesc'],
        'oltenia': ['dialectul_oltenesc'],
        'muntenia': ['dialectul_muntenesc']
    },
    'language_detection_threshold': 0.7,
    'ocr_confidence_threshold': 0.5
}

# Object detection configuration  
OBJECT_DETECTION_CONFIG = {
    'romanian_objects': {
        'traditional_items': ['ie', 'cojoc', 'opinci', 'caciula'],
        'cultural_artifacts': ['ceramica', 'lemn_sculptat', 'icoane'],
        'architectural_elements': ['ancadramente', 'pridvor', 'foișor'],
        'food_items': ['cozonac', 'mici', 'sarmale', 'papanasi']
    },
    'scene_types': {
        'religious': ['biserica', 'manastire', 'cimitir'],
        'cultural': ['muzeu', 'festival', 'spectacol'],
        'natural': ['munte', 'delta', 'padure', 'camp'],
        'urban': ['oras', 'sat', 'piata', 'strada']
    },
    'confidence_thresholds': {
        'high': 0.8,
        'medium': 0.6,
        'low': 0.4
    }
}

def get_version_info():
    """Get package version information"""
    return {
        'version': __version__,
        'author': __author__,
        'description': __description__,
        'components': len(__all__),
        'configuration': PROCESSING_CONFIG
    }

def get_supported_regions():
    """Get list of supported Romanian regions"""
    return [region.value for region in RomanianRegion]

def get_supported_qualities():
    """Get list of supported analysis qualities"""
    return [quality.value for quality in AnalysisQuality]

def get_cultural_markers():
    """Get cultural markers configuration"""
    return CULTURAL_MARKERS_CONFIG

def validate_image_format(file_path: str) -> bool:
    """Validate if image format is supported"""
    extension = file_path.lower().split('.')[-1]
    return extension in PROCESSING_CONFIG['supported_formats']

def get_recommended_settings(image_size: tuple, processing_speed: str = 'balanced') -> dict:
    """Get recommended processing settings based on image size and speed preference"""
    width, height = image_size
    total_pixels = width * height
    
    if processing_speed == 'fast':
        if total_pixels > 1000000:  # 1MP
            quality = AnalysisQuality.FAST
        else:
            quality = AnalysisQuality.STANDARD
    elif processing_speed == 'quality':
        quality = AnalysisQuality.HIGH
    else:  # balanced
        if total_pixels > 2000000:  # 2MP
            quality = AnalysisQuality.STANDARD
        else:
            quality = AnalysisQuality.HIGH
    
    return {
        'recommended_quality': quality,
        'parallel_processing': total_pixels > 500000,  # 0.5MP
        'enable_cultural_analysis': True,
        'enable_text_recognition': True,
        'enable_object_detection': True
    }

# Package initialization message
print(f"🇷🇴 Romanian Visual Processing System v{__version__} initialized")
print(f"   📊 {len(__all__)} components available")
print(f"   🎯 Cultural analysis: {PROCESSING_CONFIG['cultural_analysis_enabled']}")
print(f"   📝 Text recognition: {PROCESSING_CONFIG['text_recognition_enabled']}")
print(f"   🔍 Object detection: {PROCESSING_CONFIG['object_detection_enabled']}")
print(f"   ⚡ Parallel processing: {PROCESSING_CONFIG['parallel_processing']}")
