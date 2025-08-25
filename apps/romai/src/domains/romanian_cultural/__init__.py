"""
🇷🇴 Romanian Cultural Intelligence Domain
==========================================

Romanian cultural reasoning and intelligence processing module.
Provides comprehensive Romanian cultural context analysis, language processing,
and cultural knowledge integration.
"""

import logging

logger = logging.getLogger(__name__)

try:
    from .romanian_cultural_intelligence_engine import (
        RomanianCulturalIntelligenceEngine,
        RomanianCulturalSolution,
        RomanianCulturalAnalyzer
    )
    _CULTURAL_ENGINE_AVAILABLE = True
    logger.info("✅ Romanian Cultural Intelligence Engine loaded")
except ImportError as e:
    logger.warning(f"⚠️ Romanian Cultural Intelligence Engine unavailable: {e}")
    _CULTURAL_ENGINE_AVAILABLE = False
    RomanianCulturalIntelligenceEngine = None
    RomanianCulturalSolution = None
    RomanianCulturalAnalyzer = None

# Create convenient aliases for backward compatibility
romanian_cultural_engine = RomanianCulturalIntelligenceEngine
process_romanian_cultural_query = None

if _CULTURAL_ENGINE_AVAILABLE:
    try:
        # Create global instance for convenience
        _global_engine = RomanianCulturalIntelligenceEngine()
        
        async def process_romanian_cultural_query(query: str):
            """Process Romanian cultural query using global engine"""
            return await _global_engine.analyze_cultural_context(query)
            
    except Exception as e:
        logger.warning(f"⚠️ Could not initialize global Romanian cultural engine: {e}")
        process_romanian_cultural_query = None

__all__ = [
    'RomanianCulturalIntelligenceEngine',
    'RomanianCulturalSolution', 
    'RomanianCulturalAnalyzer',
    'romanian_cultural_engine',
    'process_romanian_cultural_query',
    'is_available'
]

def is_available():
    """Check if Romanian cultural engine is available"""
    return _CULTURAL_ENGINE_AVAILABLE