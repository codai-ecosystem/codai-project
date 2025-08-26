#!/usr/bin/env python3
"""Debug mathematical regression in RomAI"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import RealNeuralMathematicalEngine

async def test_math_regression():
    """Test mathematical operations to identify regression"""
    engine = RealNeuralMathematicalEngine()
    
    test_cases = [
        "7*8+4",  # Should be 60
        "7*8",    # Should be 56  
        "8+4",    # Should be 12
        "(3+4)*2" # Should be 14
    ]
    
    print("🔍 Debugging Mathematical Regression")
    print("="*50)
    
    for problem in test_cases:
        try:
            result = await engine.solve_mathematical_problem(problem)
            print(f"\nProblem: {problem}")
            print(f"Result: {result.result}")
            print(f"Expected vs Actual:")
            if problem == "7*8+4":
                expected = 60
                print(f"  Expected: {expected}, Got: {result.result}, Correct: {float(result.result) == expected}")
            elif problem == "7*8":
                expected = 56
                print(f"  Expected: {expected}, Got: {result.result}, Correct: {float(result.result) == expected}")
            elif problem == "8+4":
                expected = 12
                print(f"  Expected: {expected}, Got: {result.result}, Correct: {float(result.result) == expected}")
            elif problem == "(3+4)*2":
                expected = 14
                print(f"  Expected: {expected}, Got: {result.result}, Correct: {float(result.result) == expected}")
                
            print(f"Steps (last 3):")
            for step in result.steps[-3:]:
                print(f"  - {step}")
                
        except Exception as e:
            print(f"❌ Error with {problem}: {e}")
            
    print("\n" + "="*50)

if __name__ == "__main__":
    asyncio.run(test_math_regression())