"""
ML Processing Engines for RomAI AGI System
==========================================

This module contains specialized processing engines for different aspects
of artificial general intelligence, following Microsoft ML best practices.

Engines:
- Mathematical Reasoning Engine: Advanced mathematical problem solving
- Logical Inference Engine: Formal logic and reasoning
- Language Generation Engine: Natural language processing and generation
"""

from .mathematical_reasoning_engine import (
    MathematicalReasoningEngine,
    MathematicalResult,
    get_mathematical_reasoning_engine,
    solve_with_neural_math  # Backward compatibility
)

from .logical_inference_engine import (
    LogicalInferenceEngine,
    LogicalResult,
    get_logical_inference_engine,
    reason_with_neural_logic  # Backward compatibility
)

from .language_generation_engine import (
    LanguageGenerationEngine,
    LanguageModelResponse,
    get_language_generation_engine,
    generate_with_neural_language,
    replace_template_with_neural  # Backward compatibility
)

__all__ = [
    "MathematicalReasoningEngine",
    "MathematicalResult", 
    "get_mathematical_reasoning_engine",
    "solve_with_neural_math",
    "LogicalInferenceEngine",
    "LogicalResult",
    "get_logical_inference_engine", 
    "reason_with_neural_logic",
    "LanguageGenerationEngine",
    "LanguageModelResponse",
    "get_language_generation_engine",
    "generate_with_neural_language",
    "replace_template_with_neural"
]