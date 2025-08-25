"""Test Romanian square root specifically"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

import asyncio

async def test_romanian_square_root():
    from ml.reasoning.advanced_math_engine import get_advanced_math_engine
    
    engine = get_advanced_math_engine()
    print("🧮 Testing Romanian Square Root Calculation")
    
    problem = "Calculează rădăcina pătrată din 64"
    print(f"Problem: {problem}")
    
    result = await engine.solve_problem(problem)
    print(f"Answer: {result.final_answer}")
    print(f"Confidence: {result.confidence}")
    print(f"Domain: {result.domain.value}")
    print(f"Complexity: {result.complexity.value}")
    print("Steps:")
    for step in result.solution_steps:
        print(f"  • {step}")
    
    if result.reasoning_chain:
        print("Reasoning:")
        for reason in result.reasoning_chain:
            print(f"  • {reason}")
    
    if result.verification:
        print(f"Verification: {result.verification}")

if __name__ == "__main__":
    asyncio.run(test_romanian_square_root())