"""
🎭 Multimodal Task Types - Simple Enum Definition for Server Integration

This module contains the multimodal task type definitions that can be imported 
independently without complex dependencies.
"""

from enum import Enum

class MultimodalTaskType(Enum):
    """Multimodal training task types"""
    VISION_LANGUAGE_FUSION = "vision_language_fusion"
    AUDIO_VISUAL_INTEGRATION = "audio_visual_integration"
    CROSS_MODAL_REASONING = "cross_modal_reasoning"
    CULTURAL_MULTIMODAL_UNDERSTANDING = "cultural_multimodal_understanding"
    MULTIMODAL_CONSCIOUSNESS = "multimodal_consciousness"
    ROMANIAN_CULTURAL_VISION = "romanian_cultural_vision"
    VISUAL_QUESTION_ANSWERING = "visual_question_answering"
    CROSS_MODAL_GENERATION = "cross_modal_generation"

# Task descriptions for API documentation
TASK_DESCRIPTIONS = {
    "vision_language_fusion": "Train vision-language integration with Romanian cultural context",
    "audio_visual_integration": "Train audio-visual synchronization and alignment",
    "cross_modal_reasoning": "Train cross-modal reasoning and consistency",
    "cultural_multimodal_understanding": "Train Romanian cultural multimodal understanding",
    "multimodal_consciousness": "Train multimodal self-awareness and reflection",
    "romanian_cultural_vision": "Train Romanian cultural visual recognition",
    "visual_question_answering": "Train visual question answering capabilities",
    "cross_modal_generation": "Train cross-modal content generation"
}

def get_task_description(task_type: str) -> str:
    """Get description for a task type"""
    return TASK_DESCRIPTIONS.get(task_type, "Advanced multimodal task")

# Export all
__all__ = ['MultimodalTaskType', 'TASK_DESCRIPTIONS', 'get_task_description']
