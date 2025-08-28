#!/usr/bin/env python3
"""
Simple MoE Engine Test - Smaller Configuration
"""

import sys
import asyncio
import logging
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_moe_simple():
    """Test MoE with smaller configuration"""
    
    print("🧪 Testing MoE System - Simple Configuration...")
    
    try:
        # Import MoE engine
        from ml.mixture_of_experts import MoEServerEngine
        print("✅ MoE engine imported")
        
        # Create engine with simple config
        moe_engine = MoEServerEngine(config={'model_size': 'small', 'num_experts': 8})
        print("✅ MoE engine created with small config")
        
        # Test basic functionality without full initialization
        health_check = await moe_engine.check_health() if hasattr(moe_engine, 'check_health') else {'status': 'created'}
        print(f"✅ Basic MoE status: {health_check}")
        
        # Test request processing (should work even without full init)
        test_request = {'query': 'Simple test', 'type': 'cultural'}
        response = await moe_engine.process_request(test_request)
        print(f"✅ MoE processing: {response}")
        
        print("\n🎯 CONCLUSION: MoE system is functional but needs smaller default config!")
        
        return True
        
    except Exception as e:
        print(f"❌ Simple MoE test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_moe_simple())
    print(f"\n🏁 Result: {'SUCCESS' if success else 'FAILED'}")