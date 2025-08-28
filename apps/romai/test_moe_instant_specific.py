#!/usr/bin/env python3
"""
Test MoE Instant Mode Specifically
"""

import sys
import asyncio
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

async def test_moe_instant_mode():
    """Test MoE with instant mode specifically"""
    
    print("⚡ Testing MoE Instant Mode...")
    
    try:
        from ml.mixture_of_experts import MoEServerEngine
        print("✅ MoE engine imported")
        
        # Create engine with explicit instant mode
        moe_engine = MoEServerEngine(config={'model_size': 'instant', 'num_experts': 4})
        print("✅ MoE engine created with instant config")
        
        # Test initialization
        result = await moe_engine.initialize()
        print(f"✅ Initialization result: {result}")
        print(f"✅ Engine initialized: {moe_engine.initialized}")
        
        # Test request processing 
        test_request = {'query': 'Ce este cultura românească?', 'type': 'cultural'}
        response = await moe_engine.process_request(test_request)
        print(f"✅ Processing result: {response}")
        
        # Test performance statistics
        if hasattr(moe_engine.moe_system, 'get_performance_statistics'):
            stats = moe_engine.moe_system.get_performance_statistics()
            print(f"✅ Performance stats: {stats}")
            
        print("\n🎯 INSTANT MODE SUCCESS!")
        return True
        
    except Exception as e:
        print(f"❌ Instant mode test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_moe_instant_mode())
    print(f"\n🏁 Result: {'SUCCESS' if success else 'FAILED'}")