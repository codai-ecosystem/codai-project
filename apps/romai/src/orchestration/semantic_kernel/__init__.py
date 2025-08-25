"""
RomAI Semantic Kernel Integration Package

Microsoft Semantic Kernel integration for Romanian AGI with advanced
cultural adaptation, business communication, and compliance processing.

This package provides:
- Romanian-specific semantic skills for cultural adaptation
- Business communication optimization for Romanian stakeholders
- Compliance processing with Romanian regulatory requirements
- Advanced prompt engineering with cultural context
- Semantic planning with Romanian business practices
- Cultural coherence validation across AI interactions

Key Components:
- RomanianCulturalAdaptationSkill: Cultural context adaptation
- RomanianBusinessCommunicationSkill: Business communication optimization
- RomanianComplianceSkill: Regulatory compliance processing
- RomAISemanticKernelIntegration: Master integration system

Author: RomAI Development Team
Version: 2.0.0 - Professional Romanian AGI System
"""

from .romanian_semantic_integration import (
    # Main integration class
    RomAISemanticKernelIntegration,
    
    # Romanian semantic skills
    RomanianCulturalAdaptationSkill,
    RomanianBusinessCommunicationSkill,
    RomanianComplianceSkill,
    
    # Data structures
    RomanianSemanticContext,
    
    # Enums
    RomanianSemanticSkillType,
    
    # Convenience functions
    create_romai_semantic_integration,
    adapt_content_to_romanian_culture
)

# Package metadata
__version__ = "2.0.0"
__author__ = "RomAI Development Team"
__description__ = "Microsoft Semantic Kernel Integration for Romanian AGI"

# Package exports
__all__ = [
    # Main integration
    "RomAISemanticKernelIntegration",
    "create_romai_semantic_integration",
    
    # Semantic skills
    "RomanianCulturalAdaptationSkill", 
    "RomanianBusinessCommunicationSkill",
    "RomanianComplianceSkill",
    
    # Data structures
    "RomanianSemanticContext",
    "RomanianSemanticSkillType",
    
    # Convenience functions
    "adapt_content_to_romanian_culture"
]