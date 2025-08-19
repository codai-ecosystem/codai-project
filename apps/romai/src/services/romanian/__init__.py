"""
Romanian Services Package
Enterprise-grade Romanian language and cultural processing services

This package provides comprehensive Romanian processing capabilities including:
- Cultural analysis and authenticity validation
- Language processing and grammatical analysis
- Translation services with cultural adaptation
- Text generation with cultural authenticity

All services integrate with core AGI components for enhanced accuracy.
"""

from .cultural_analysis_service import (
    RomanianCulturalAnalysisService,
    CulturalAnalysis,
    AuthenticityScore,
    RomanianProcessingResult,
    CulturalContext,
    romanian_cultural_service
)

from .language_processing_service import (
    RomanianLanguageProcessingService,
    LanguageProcessingResult,
    GrammaticalAnalysis,
    SemanticAnalysis,
    TranslationResult,
    RomanianTextGeneration,
    romanian_language_service
)

__all__ = [
    'RomanianCulturalAnalysisService',
    'RomanianLanguageProcessingService',
    'CulturalAnalysis',
    'AuthenticityScore',
    'RomanianProcessingResult',
    'CulturalContext',
    'LanguageProcessingResult',
    'GrammaticalAnalysis',
    'SemanticAnalysis',
    'TranslationResult',
    'RomanianTextGeneration',
    'romanian_cultural_service',
    'romanian_language_service'
]

# Service instances ready for import
__version__ = "1.0.0"
__author__ = "RomAI Enterprise Team"
__description__ = "Enterprise Romanian processing services"
