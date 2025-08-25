"""
Romanian Cultural Intelligence Evaluation Package
================================================

Comprehensive Romanian cultural intelligence testing framework for
RomAI Multi-Domain AGI system, providing specialized evaluation
of cultural adaptation capabilities.

This package contains:
- Main cultural intelligence evaluator
- Scenario generators for different cultural domains
- Test runner for automated execution
- Reporting and analysis tools

Author: RomAI Excellence Team
Version: 1.0.0
"""

from .romai_cultural_intelligence_evaluator import (
    RomAIRomanianCulturalIntelligenceEvaluator,
    CulturalDomain,
    RegionalContext,
    CulturalComplexity,
    CulturalTestScenario,
    CulturalIntelligenceResponse,
    CulturalIntelligenceReport
)

from .cultural_scenario_generators import RomanianCulturalScenarioGenerator

def create_cultural_intelligence_evaluator(**kwargs) -> RomAIRomanianCulturalIntelligenceEvaluator:
    """Factory function to create cultural intelligence evaluator."""
    return RomAIRomanianCulturalIntelligenceEvaluator(**kwargs)

def create_scenario_generator() -> RomanianCulturalScenarioGenerator:
    """Factory function to create cultural scenario generator."""
    return RomanianCulturalScenarioGenerator()

def get_supported_domains():
    """Get list of supported cultural domains."""
    return [domain.value for domain in CulturalDomain]

def get_supported_regions():
    """Get list of supported regional contexts."""
    return [region.value for region in RegionalContext]

def get_complexity_levels():
    """Get list of supported complexity levels."""
    return [level.value for level in CulturalComplexity]

def check_evaluator_health() -> bool:
    """Quick health check for cultural intelligence evaluation system."""
    try:
        evaluator = create_cultural_intelligence_evaluator()
        generator = create_scenario_generator()
        
        # Test basic functionality
        domains = get_supported_domains()
        regions = get_supported_regions()
        levels = get_complexity_levels()
        
        return (
            len(domains) == 8 and
            len(regions) == 8 and  
            len(levels) == 5 and
            evaluator is not None and
            generator is not None
        )
    except Exception:
        return False

# Package metadata
__version__ = "1.0.0"
__author__ = "RomAI Excellence Team"
__description__ = "Romanian Cultural Intelligence Evaluation Framework"

# Export all main components
__all__ = [
    # Main classes
    'RomAIRomanianCulturalIntelligenceEvaluator',
    'RomanianCulturalScenarioGenerator',
    
    # Enums and data classes
    'CulturalDomain',
    'RegionalContext', 
    'CulturalComplexity',
    'CulturalTestScenario',
    'CulturalIntelligenceResponse',
    'CulturalIntelligenceReport',
    
    # Factory functions
    'create_cultural_intelligence_evaluator',
    'create_scenario_generator',
    
    # Utility functions
    'get_supported_domains',
    'get_supported_regions',
    'get_complexity_levels',
    'check_evaluator_health'
]