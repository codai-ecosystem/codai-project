"""
🧠 RomAI ML Reasoning Package
============================

Core reasoning engines for RomAI AGI system including:
- Mathematical reasoning engine
- Logical reasoning engine 
- Romanian cultural intelligence engine
- Creative intelligence system
- Cross-modal reasoning integration

All engines follow production Python 2025 best practices with proper imports and error handling.
"""

# Import core reasoning engines with proper error handling
import logging

logger = logging.getLogger(__name__)

try:
    from .autonomous_math_engine import AutonomousMathEngine, MathematicalResult
    # Create alias for backwards compatibility
    MathSolution = MathematicalResult
    _MATH_ENGINE_AVAILABLE = True
    logger.info("✅ Mathematical reasoning engine loaded")
except ImportError as e:
    logger.warning(f"⚠️ Mathematical reasoning engine unavailable: {e}")
    _MATH_ENGINE_AVAILABLE = False
    AutonomousMathEngine = None
    MathSolution = None
    MathematicalResult = None

try:
    from .autonomous_logical_engine import AutonomousLogicalEngine, LogicalSolution
    _LOGICAL_ENGINE_AVAILABLE = True
    logger.info("✅ Logical reasoning engine loaded")
except ImportError as e:
    logger.warning(f"⚠️ Logical reasoning engine unavailable: {e}")
    _LOGICAL_ENGINE_AVAILABLE = False
    AutonomousLogicalEngine = None
    LogicalSolution = None

try:
    from .real_romanian_engine_simple import RealRomanianEngine, RomanianSolution
    _ROMANIAN_ENGINE_AVAILABLE = True
    logger.info("✅ Romanian cultural engine loaded")
except ImportError as e:
    logger.warning(f"⚠️ Romanian cultural engine unavailable: {e}")
    _ROMANIAN_ENGINE_AVAILABLE = False
    RealRomanianEngine = None
    RomanianSolution = None

try:
    from .creative_intelligence_system import CreativeIntelligenceSystem, CreativeSolution
    _CREATIVE_ENGINE_AVAILABLE = True
    logger.info("✅ Creative intelligence engine loaded")
except ImportError as e:
    logger.warning(f"⚠️ Creative intelligence engine unavailable: {e}")
    _CREATIVE_ENGINE_AVAILABLE = False
    CreativeIntelligenceSystem = None
    CreativeSolution = None

try:
    from .cross_modal_knowledge_integration_engine import CrossModalKnowledgeIntegrationEngine
    # Add alias for compatibility
    CrossModalIntegrationSystem = CrossModalKnowledgeIntegrationEngine
    _CROSS_MODAL_AVAILABLE = True
    logger.info("✅ Cross-modal integration engine loaded")
except ImportError as e:
    logger.warning(f"⚠️ Cross-modal integration engine unavailable: {e}")
    _CROSS_MODAL_AVAILABLE = False
    CrossModalKnowledgeIntegrationEngine = None
    CrossModalIntegrationSystem = None

# Define what's exported when using "from ml.reasoning import *"
__all__ = [
    # Core engines
    'AutonomousMathEngine',
    'AutonomousLogicalEngine', 
    'RealRomanianEngine',
    'CreativeIntelligenceSystem',
    'CrossModalKnowledgeIntegrationEngine',
    'CrossModalIntegrationSystem',  # Alias for compatibility
    
    # Result types
    'MathSolution',
    'LogicalSolution',
    'RomanianSolution',
    'CreativeSolution',
    
    # Availability flags
    'ENGINE_STATUS',
    'get_available_engines',
    'validate_engine_availability'
]

# Engine availability status
ENGINE_STATUS = {
    'math': _MATH_ENGINE_AVAILABLE,
    'logical': _LOGICAL_ENGINE_AVAILABLE,
    'romanian': _ROMANIAN_ENGINE_AVAILABLE,
    'creative': _CREATIVE_ENGINE_AVAILABLE,
    'cross_modal': _CROSS_MODAL_AVAILABLE
}

def get_available_engines():
    """Get list of available reasoning engines"""
    return [name for name, available in ENGINE_STATUS.items() if available]

def validate_engine_availability():
    """Validate and report engine availability status"""
    available = get_available_engines()
    total = len(ENGINE_STATUS)
    
    status_report = {
        'available_engines': available,
        'total_engines': total,
        'availability_rate': len(available) / total,
        'missing_engines': [name for name, available in ENGINE_STATUS.items() if not available],
        'is_fully_functional': len(available) == total
    }
    
    return status_report

# Package metadata
__version__ = "1.0.0"
__author__ = "RomAI Development Team"
__description__ = "Advanced reasoning engines for Romanian AGI system"