"""
RomAI Social Intelligence Domain

This package provides comprehensive social intelligence capabilities with Romanian social context integration.
"""

from .social_intelligence_engine import SocialIntelligenceEngine
from .social_dynamics_methods import SocialDynamicsMethods
from .romanian_social_context import RomanianSocialContextMethods

__version__ = "1.0.0"
__author__ = "RomAI Development Team"

__all__ = [
    'SocialIntelligenceEngine',
    'SocialDynamicsMethods', 
    'RomanianSocialContextMethods'
]