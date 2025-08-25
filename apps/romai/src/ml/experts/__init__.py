"""
RomAI Expert System Module

Specialized expert modules for domain-specific processing within the MoE system.
Each expert is optimized for specific capabilities and knowledge domains.

Available Experts:
- Mathematical Reasoning Expert: Advanced mathematical problem solving
- Programming/Coding Expert: Code generation, debugging, architecture
- Multimodal Processing Expert: Vision, audio, video understanding
- Action-Taking Expert: UI automation, API integration, task execution
- Creative/Artistic Expert: Content generation, design, creativity
- Logical Reasoning Expert: Complex reasoning, problem solving
- Romanian Cultural Expert: Romanian language, culture, history
- General Knowledge Expert: Broad knowledge base, factual information
"""

from .mathematical_expert import MathematicalReasoningExpert
from .programming_expert import ProgrammingCodingExpert
from .multimodal_expert import MultimodalProcessingExpert
from .action_expert import ActionTakingExpert
from .creative_expert import CreativeArtisticExpert
from .logical_expert import LogicalReasoningExpert
from .romanian_expert import RomanianCulturalExpert
from .general_expert import GeneralKnowledgeExpert

__all__ = [
    'MathematicalReasoningExpert',
    'ProgrammingCodingExpert',
    'MultimodalProcessingExpert', 
    'ActionTakingExpert',
    'CreativeArtisticExpert',
    'LogicalReasoningExpert',
    'RomanianCulturalExpert',
    'GeneralKnowledgeExpert'
]