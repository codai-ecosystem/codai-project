#!/usr/bin/env python3
"""
Debug script to identify and fix quadratic equation parsing issues
"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import RealNeuralMathematicalEngine

async def test_quadratic_equations():
    """Test specific quadratic equation issues"""
    print("🔍 DEBUGGING QUADRATIC EQUATIONS")
    print("=" * 50)
    
    engine = RealNeuralMathematicalEngine()
    
    # Test cases that should work but currently fail
    test_cases = [
        "x²-16=0",          # Should return x = ±4
        "x²-25=0",          # Should return x = ±5  
        "x²+4x-5=0",        # Should return x = 1, x = -5
        "solve x: x²-16=0", # Alternative format
    ]
    
    for i, problem in enumerate(test_cases, 1):
        print(f"\n🧮 Test {i}: {problem}")
        print("-" * 30)
        
        try:
            result = await engine.solve_mathematical_problem(problem)
            print(f"✅ Result: {result.result}")
            print(f"🧠 Method: {result.method_used}")
            print(f"📝 Reasoning: {result.reasoning_chain[:200]}...")
            
            # Check if result contains "No solution" which indicates the bug
            if "No solution" in str(result.result):
                print(f"❌ BUG DETECTED: Should have solutions but got 'No solution'")
            elif result.result == 0 or result.result == "0":
                print(f"❌ BUG DETECTED: Got zero instead of actual solutions")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n🔍 DEBUGGING PROBLEM CLASSIFICATION")
    print("=" * 50)
    
    for problem in test_cases:
        problem_type = engine._classify_problem_type(problem)
        print(f"Problem: '{problem}' → Type: '{problem_type}'")
        
        expression, steps = engine._parse_complex_expression(problem)
        print(f"  Parsed expression: '{expression}'")
        print(f"  Steps: {len(steps)} reasoning steps")
        print()

if __name__ == "__main__":
    asyncio.run(test_quadratic_equations())