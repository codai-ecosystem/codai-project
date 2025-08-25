"""
Legal Intelligence Domain Package

Exports:
- LegalIntelligenceEngine: Advanced legal AI with Romanian law specialization
- legal_intelligence_engine: Global engine instance
- LegalDomain: Legal practice area classifications
- LegalUrgency: Legal matter urgency levels
- LegalRisk: Legal risk assessment categories
"""

from .legal_intelligence_engine import (
    LegalIntelligenceEngine,
    legal_intelligence_engine,
    LegalDomain,
    LegalUrgency, 
    LegalRisk
)

__all__ = [
    'LegalIntelligenceEngine',
    'legal_intelligence_engine', 
    'LegalDomain',
    'LegalUrgency',
    'LegalRisk'
]