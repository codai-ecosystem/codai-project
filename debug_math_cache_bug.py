#!/usr/bin/env python3
"""
Direct test of mathematical reasoning cache bug
This bypasses ALL server infrastructure to isolate the issue
"""

import sys
import asyncio
import time
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine

async def test_direct_math_engine():
    """Test the mathematical engine directly - no API, no cache, no optimization"""
    print("🧮 Direct Mathematical Reasoning Engine Test")
    print("="*60)
    
    # Initialize engine directly
    engine = AutonomousMathEngine()
    
    # Test problems
    problems = [
        "25 + 17",
        "100 - 45", 
        "7 * 8",
        "√144",
        "What is 50 divided by 2?"
    ]
    
    for i, problem in enumerate(problems, 1):
        print(f"\n🔢 Test {i}: {problem}")
        start_time = time.time()
        
        try:
            result = await engine.solve_mathematical_problem(problem)
            duration = (time.time() - start_time) * 1000
            
            print(f"   ✅ Result: {result.result}")
            print(f"   📊 Confidence: {result.confidence}")
            print(f"   ⏱️  Duration: {duration:.2f}ms")
            print(f"   🔧 Method: {result.method}")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "="*60)
    print("🎯 Direct engine test complete - this should show correct results")

if __name__ == "__main__":
    asyncio.run(test_direct_math_engine())