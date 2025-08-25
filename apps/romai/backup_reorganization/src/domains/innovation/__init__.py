"""
Innovation Intelligence Domain

This module provides comprehensive innovation intelligence and analysis capabilities,
specializing in R&D optimization, patent analysis, technology scouting, startup
intelligence, and Romanian innovation ecosystem integration.
"""

from .innovation_intelligence_engine import InnovationIntelligenceEngine
from .innovation_analysis_methods import (
    InnovationAnalysisMethods,
    InnovationDomain,
    InnovationType, 
    InnovationStage,
    TechnologyReadiness,
    InnovationContext,
    InnovationAnalysisResult
)
from .romanian_innovation_context import (
    RomanianInnovationContext,
    RomanianInnovationEcosystem
)

__all__ = [
    'InnovationIntelligenceEngine',
    'InnovationAnalysisMethods',
    'InnovationDomain',
    'InnovationType',
    'InnovationStage', 
    'TechnologyReadiness',
    'InnovationContext',
    'InnovationAnalysisResult',
    'RomanianInnovationContext',
    'RomanianInnovationEcosystem'
]

# Version information
__version__ = '1.0.0'
__author__ = 'RomAI Innovation Intelligence Team'
__description__ = 'Advanced innovation intelligence engine with Romanian specialization'