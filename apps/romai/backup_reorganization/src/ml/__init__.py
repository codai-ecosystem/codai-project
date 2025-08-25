# RomAI ML Package
"""
RomAI Machine Learning Package

This package contains the core ML components for the Romanian AGI system:
- Neural architecture models
- Romanian language processing
- Training and inference pipelines
- Data collection and preprocessing
"""

__version__ = "1.0.0"
__author__ = "RomAI Team"
__description__ = "Romanian AGI Machine Learning Framework"

# Core components
import logging

logger = logging.getLogger(__name__)

# Import with error handling
try:
    from . import reasoning
    _REASONING_AVAILABLE = True
    logger.info("✅ ML Reasoning package loaded")
except ImportError as e:
    logger.warning(f"⚠️ ML Reasoning package unavailable: {e}")
    _REASONING_AVAILABLE = False
    reasoning = None

try:
    from . import models
    _MODELS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️ Models unavailable: {e}")
    _MODELS_AVAILABLE = False
    models = None

try:
    from . import data
    _DATA_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️ Data unavailable: {e}")
    _DATA_AVAILABLE = False
    data = None

try:
    from . import training
    _TRAINING_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️ Training unavailable: {e}")
    _TRAINING_AVAILABLE = False
    training = None

try:
    from . import inference
    _INFERENCE_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️ Inference unavailable: {e}")
    _INFERENCE_AVAILABLE = False
    inference = None

try:
    from . import testing
    _TESTING_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️ Testing unavailable: {e}")
    _TESTING_AVAILABLE = False
    testing = None

__all__ = [
    'reasoning',
    'models',
    'data', 
    'training',
    'inference',
    'testing',
    'get_ml_status'
]

def get_ml_status():
    """Get ML package status"""
    components = {
        'reasoning': _REASONING_AVAILABLE,
        'models': _MODELS_AVAILABLE,
        'data': _DATA_AVAILABLE,
        'training': _TRAINING_AVAILABLE,
        'inference': _INFERENCE_AVAILABLE,
        'testing': _TESTING_AVAILABLE
    }
    
    available = sum(components.values())
    total = len(components)
    
    return {
        'components': components,
        'available_count': available,
        'total_count': total,
        'availability_rate': available / total,
        'status': 'fully_functional' if available == total else 'partial' if available > 0 else 'unavailable'
    }
