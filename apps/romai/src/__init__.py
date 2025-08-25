"""
🧠 RomAI - Romanian Artificial General Intelligence
===================================================

A comprehensive AGI system with Romanian cultural consciousness and advanced reasoning capabilities.

Core Components:
- Machine Learning reasoning engines (mathematical, logical, cultural)
- Romanian language and cultural processing
- Multi-modal intelligence integration
- Production-ready deployment system

Usage:
    from romai import RomAI
    
    # Initialize AGI system
    agi = RomAI()
    
    # Use mathematical reasoning
    math_result = await agi.solve_math("√(144 + 256) × 2/3")
    
    # Use logical reasoning  
    logic_result = await agi.reason("Toate florile sunt plante. Aceasta este o floare.")
    
    # Use cultural analysis
    cultural_result = await agi.analyze_culture("Castelul Bran din Transilvania")
"""

import logging
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add current directory to path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import core components with error handling
_COMPONENTS_STATUS = {}

try:
    from . import ml
    _COMPONENTS_STATUS['ml'] = True
    logger.info("✅ ML package loaded successfully")
except ImportError as e:
    _COMPONENTS_STATUS['ml'] = False
    logger.warning(f"⚠️ ML package unavailable: {e}")
    ml = None

try:
    from . import domains
    _COMPONENTS_STATUS['domains'] = True
    logger.info("✅ Domains package loaded successfully")
except ImportError as e:
    _COMPONENTS_STATUS['domains'] = False
    logger.warning(f"⚠️ Domains package unavailable: {e}")
    domains = None

try:
    from . import core
    _COMPONENTS_STATUS['core'] = True
    logger.info("✅ Core package loaded successfully") 
except ImportError as e:
    _COMPONENTS_STATUS['core'] = False
    logger.warning(f"⚠️ Core package unavailable: {e}")
    core = None

# Import main RomAI class
try:
    from .romai_agi_system import RomAI, RomAIConfig
    _COMPONENTS_STATUS['main_system'] = True
    logger.info("✅ Main RomAI system loaded successfully")
except ImportError as e:
    _COMPONENTS_STATUS['main_system'] = False
    logger.warning(f"⚠️ Main RomAI system unavailable: {e}")
    
    # Create fallback RomAI class
    class RomAI:
        """Fallback RomAI class when main system is unavailable"""
        def __init__(self):
            logger.error("❌ RomAI main system is not available - using fallback")
            self._available = False
            
        async def solve_math(self, problem: str):
            if not self._available:
                raise RuntimeError("RomAI system is not fully loaded")
            
        async def reason(self, premise: str):
            if not self._available:
                raise RuntimeError("RomAI system is not fully loaded")
                
        async def analyze_culture(self, context: str):
            if not self._available:
                raise RuntimeError("RomAI system is not fully loaded")
    
    RomAIConfig = dict  # Fallback config type

# Quick system status check
def get_system_status():
    """Get comprehensive RomAI system status"""
    available_components = sum(_COMPONENTS_STATUS.values())
    total_components = len(_COMPONENTS_STATUS)
    
    status = {
        'components': _COMPONENTS_STATUS,
        'available_count': available_components,
        'total_count': total_components,
        'availability_rate': available_components / total_components if total_components > 0 else 0,
        'is_fully_functional': available_components == total_components,
        'status_level': (
            'FULLY_FUNCTIONAL' if available_components == total_components
            else 'PARTIALLY_FUNCTIONAL' if available_components > 0
            else 'UNAVAILABLE'
        )
    }
    
    return status

def validate_system():
    """Validate and report system functionality"""
    status = get_system_status()
    
    print(f"\n🧠 RomAI System Status Report")
    print(f"============================")
    print(f"📊 Components: {status['available_count']}/{status['total_count']} available")
    print(f"📈 Availability: {status['availability_rate']:.1%}")
    print(f"🎯 Status: {status['status_level']}")
    
    if not status['is_fully_functional']:
        print(f"\n⚠️ Missing Components:")
        for component, available in status['components'].items():
            if not available:
                print(f"   ❌ {component}")
    
    return status

# Export main components
__all__ = [
    'RomAI',
    'RomAIConfig', 
    'ml',
    'domains',
    'core',
    'get_system_status',
    'validate_system'
]

# Package metadata
__version__ = "1.0.0"
__author__ = "RomAI AGI Development Team"
__description__ = "Romanian Artificial General Intelligence System"
__license__ = "MIT"

# Auto-validate on import
if __name__ != "__main__":
    logger.info("🧠 RomAI package initialized successfully")
    initial_status = get_system_status()
    if initial_status['is_fully_functional']:
        logger.info("🎉 All RomAI components are functional!")
    else:
        logger.warning(f"⚠️ RomAI partially functional: {initial_status['availability_rate']:.1%} components available")