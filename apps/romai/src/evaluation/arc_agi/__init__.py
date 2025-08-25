"""
ARC-AGI Abstract Reasoning Evaluation
====================================

Advanced evaluation framework for testing abstract reasoning capabilities
using the ARC-AGI benchmark - the gold standard for measuring artificial
general intelligence.

Components:
- RomAIARCEvaluator: Main evaluation engine
- ARC-AGI-1 and ARC-AGI-2 benchmark support
- Multi-domain intelligence integration
- Competitive performance analysis
- Romanian cultural pattern detection

Author: RomAI Excellence Team
"""

from .romai_arc_evaluator import RomAIARCEvaluator, ARCBenchmarkVersion, ARCDifficulty, ARCTaskType

__all__ = ['RomAIARCEvaluator', 'ARCBenchmarkVersion', 'ARCDifficulty', 'ARCTaskType']