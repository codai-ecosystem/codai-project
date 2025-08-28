#!/usr/bin/env python3
"""
Debug MOE System Issue
Test MOE system initialization in isolation to identify the exact problem.
"""

import sys
import os
import logging
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_moe_imports():
    """Test MOE import issues"""
    logger.info("🔍 Testing MOE imports...")
    
    try:
        logger.info("1. Testing tutel import...")
        import tutel
        logger.info("✅ Tutel library available")
    except ImportError as e:
        logger.warning(f"⚠️ Tutel library not available: {e}")
    
    try:
        logger.info("2. Testing tutel_optimized_moe import...")
        from ml.mixture_of_experts.tutel_optimized_moe import (
            RomAITutelMoESystem,
            TutelMoEConfig,
            create_romai_tutel_moe_medium
        )
        logger.info("✅ tutel_optimized_moe imports successful")
        
        logger.info("3. Testing TutelMoEConfig creation...")
        config = TutelMoEConfig()
        logger.info("✅ TutelMoEConfig creation successful")
        
        logger.info("4. Testing create_romai_tutel_moe_medium...")
        # This is where the logger error likely occurs
        model = create_romai_tutel_moe_medium()
        logger.info("✅ create_romai_tutel_moe_medium successful")
        
    except Exception as e:
        logger.error(f"❌ MOE import/creation error: {e}")
        import traceback
        traceback.print_exc()

def test_moe_server_integration():
    """Test MOE server integration imports"""
    logger.info("🔍 Testing MOE server integration imports...")
    
    try:
        from ml.mixture_of_experts.moe_server_integration import (
            integrate_moe_with_server,
            verify_moe_integration,
            MoEServerPatch
        )
        logger.info("✅ MOE server integration imports successful")
        
    except Exception as e:
        logger.error(f"❌ MOE server integration import error: {e}")
        import traceback
        traceback.print_exc()

def test_consciousness_types():
    """Test consciousness_types import"""
    logger.info("🔍 Testing consciousness_types import...")
    
    try:
        from consciousness_types import ConsciousnessLevel, ConsciousnessType
        logger.info("✅ consciousness_types import successful")
    except ImportError as e:
        logger.warning(f"⚠️ consciousness_types not available: {e}")
        
        # Try alternative path
        try:
            from ml.consciousness.consciousness_types import ConsciousnessLevel, ConsciousnessType
            logger.info("✅ consciousness_types found in ml.consciousness")
        except ImportError as e2:
            logger.error(f"❌ consciousness_types not found anywhere: {e2}")

if __name__ == "__main__":
    logger.info("🚀 Starting MOE debug test...")
    
    test_consciousness_types()
    test_moe_imports()
    test_moe_server_integration()
    
    logger.info("✅ MOE debug test completed")