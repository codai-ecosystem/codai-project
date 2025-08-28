#!/usr/bin/env python3
"""Simple test to debug mathematical reasoning engine"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.join('apps', 'romai', 'src'))

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine

async def debug_math_engine():
    """Debug what's happening in the math engine"""
    print("🔍 DEBUGGING MATHEMATICAL ENGINE")
    print("=" * 50)
    
    engine = AutonomousMathEngine()
    test_cases = ["√144", "25 + 17", "(15 * 4) + (32 / 8) - 7"]
    
    for problem in test_cases:
        print(f"\n🧮 Testing: {problem}")
        print("-" * 30)
        
        try:
            result = await engine.solve_mathematical_problem(problem)
            print(f"Result: {result.result}")
            print(f"Method: {result.method_used}")
            print(f"Confidence: {result.confidence}")
            print(f"Verification: {result.verification}")
            print(f"Steps: {result.steps[:3] if len(result.steps) > 3 else result.steps}")  # First 3 steps
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_math_engine())