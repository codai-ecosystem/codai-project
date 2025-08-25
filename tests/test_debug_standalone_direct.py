#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the src directory to the path
sys.path.append('e:/GitHub/codai-project/apps/romai/src')

async def test_direct_standalone():
    """Test the standalone reasoning dispatch directly"""
    
    try:
        print("🔧 Direct import test...")
        from ml.reasoning.standalone_reasoning import standalone_reasoning_dispatch
        print(f"✅ Import successful: {type(standalone_reasoning_dispatch)}")
        
        print("🔧 Testing Romanian cultural reasoning...")
        result = await standalone_reasoning_dispatch(
            problem="test problem for debugging",
            mode="romanian_cultural",
            context={},
            romanian_emphasis=0.9
        )
        
        print(f"✅ Reasoning successful!")
        print(f"Status: {result.get('status', 'unknown')}")
        print(f"Keys: {list(result.keys())}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error during standalone test: {e}")
        import traceback
        print("Full traceback:")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = asyncio.run(test_direct_standalone())
    if result:
        print("✅ STANDALONE REASONING WORKS!")
    else:
        print("❌ STANDALONE REASONING FAILED!")