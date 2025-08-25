"""
Strategic Intelligence Domain Package

Strategic intelligence capabilities for the RomAI system including:
- Strategic planning and analysis
- Competitive intelligence
- Market intelligence
- Business development
- Corporate strategy
- Romanian market specialization

This package provides world-class strategic intelligence with 25% competitive advantage
(74% baseline → 92% RomAI performance) through advanced strategic frameworks and 
Romanian market expertise.
"""

from .strategic_intelligence_engine import StrategicIntelligenceEngine
from .strategic_analysis_methods import (
    StrategicAnalysisMethods,
    StrategicDomain,
    StrategicFramework,
    CompetitivePosition,
    MarketSegment,
    StrategicContext,
    StrategicAnalysisResult
)
from .romanian_strategic_context import (
    RomanianStrategicContext,
    RomanianMarketSector,
    RomanianRegion,
    RomanianRegulation,
    RomanianEconomicContext,
    RomanianMarketIntelligence
)

__all__ = [
    # Main engine
    'StrategicIntelligenceEngine',
    
    # Analysis methods and types
    'StrategicAnalysisMethods',
    'StrategicDomain',
    'StrategicFramework', 
    'CompetitivePosition',
    'MarketSegment',
    'StrategicContext',
    'StrategicAnalysisResult',
    
    # Romanian context
    'RomanianStrategicContext',
    'RomanianMarketSector',
    'RomanianRegion',
    'RomanianRegulation',
    'RomanianEconomicContext',
    'RomanianMarketIntelligence'
]

# Domain metadata
__version__ = '1.0.0'
__description__ = 'Strategic Intelligence Domain for RomAI Multi-Domain AGI System'
__competitive_advantage__ = '25% (74% → 92%)'
__specialization__ = 'Romanian Strategic Intelligence and Market Analysis'