#!/usr/bin/env python3

import sys
import asyncio
sys.path.append('apps/romai/src')

from ml.reasoning.native_math_engine import AutonomousMathEngine

async def test_math_engine():
    print("🔍 Testing AutonomousMathEngine from server context...")
    
    try:
        engine = AutonomousMathEngine()
        result = await engine.solve_mathematical_problem('What is the square root of 144?')
        
        print(f"✅ Result type: {type(result)}")
        print(f"✅ Result attributes: {dir(result)}")
        print(f"✅ Has final_answer: {hasattr(result, 'final_answer')}")
        print(f"✅ Has result: {hasattr(result, 'result')}")
        
        if hasattr(result, 'final_answer'):
            print(f"✅ Final answer: {result.final_answer}")
        
        if hasattr(result, 'result'):
            print(f"❌ Result attribute: {result.result}")
            
        # Test exact same access as server
        print(f"✅ Server access test: {result.final_answer}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_math_engine())