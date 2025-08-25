"""
🧠 RomAI ML Package - Azure ML Best Practices Structure

Microsoft Azure ML compliant machine learning package for RomAI AGI system.

Directory Structure:
- core/: Core AGI engines (reasoning, mathematical, learning, integration)
- models/: Model definitions and architectures  
- inference/: Inference and serving infrastructure
- training/: Training scripts and pipelines
- evaluation/: Model evaluation and benchmarks
- pipelines/: ML pipelines and orchestration
- utils/: Utilities and helper functions
- experiments/: Experiment tracking and configurations
- deployment/: Deployment configurations and containerization
- data/: Data processing and loading utilities

Performance Targets:
- Overall AGI Score: ≥79.6% (breakthrough achievement)
- Component Excellence: All core engines ≥80% proven performance
"""

# Core imports
from .core import ReasoningEngine, MathematicalEngine, LearningEngine, IntegrationEngine
from .models import ExecutionEngine
# from .inference import AGIServer  # Temporarily disabled - missing agi_server.py

__all__ = [
    # Core engines
    'ReasoningEngine',
    'MathematicalEngine', 
    'LearningEngine',
    'IntegrationEngine',
    # Models
    'ExecutionEngine',
    # Inference - temporarily disabled
    # 'AGIServer'
]

__version__ = "2.0.0"
__author__ = "RomAI Team"
__description__ = "Microsoft Azure ML compliant AGI system"
