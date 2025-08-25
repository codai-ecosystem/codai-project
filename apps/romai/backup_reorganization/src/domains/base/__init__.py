"""
RomAI Base Intelligence Domain
============================

Standard interface and utilities for all intelligence engines.

This package provides:
- BaseIntelligenceEngine: Standard interface for all 23 domain engines
- Performance monitoring and competitive benchmarking
- Microsoft Semantic Kernel integration
- Romanian cultural integration capabilities
- Azure Well-Architected Framework compliance
"""

from .base_intelligence_engine import (
    BaseIntelligenceEngine,
    IntelligenceRequest,
    IntelligenceResponse, 
    IntelligenceLevel,
    ProcessingMode,
    CompetitorModel,
    PerformanceMetrics,
    RomanianCulturalIntegration,
    PerformanceBenchmarking,
    create_standard_response,
    validate_intelligence_engine
)

__all__ = [
    'BaseIntelligenceEngine',
    'IntelligenceRequest',
    'IntelligenceResponse', 
    'IntelligenceLevel',
    'ProcessingMode',
    'CompetitorModel',
    'PerformanceMetrics',
    'RomanianCulturalIntegration',
    'PerformanceBenchmarking',
    'create_standard_response',
    'validate_intelligence_engine'
]

__version__ = '1.0.0'
__author__ = 'GitHub Copilot'