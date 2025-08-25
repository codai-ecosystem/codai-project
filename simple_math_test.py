"""Simple test for advanced mathematical reasoning"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

import asyncio

async def test_math():
    from ml.reasoning.advanced_math_engine import get_advanced_math_engine
    
    engine = get_advanced_math_engine()
    print("🧮 Testing Advanced Mathematical Engine")
    
    # Test a word problem
    result = await engine.solve_problem('I have 10 apples and give away 3. How many do I have left?')
    print(f"Problem: I have 10 apples and give away 3. How many do I have left?")
    print(f"Answer: {result.final_answer}")
    print(f"Confidence: {result.confidence}")
    print(f"Domain: {result.domain.value}")
    print(f"Steps:")
    for step in result.solution_steps:
        print(f"  • {step}")
    
    # Test basic arithmetic
    print("\n" + "="*50)
    result2 = await engine.solve_problem('Calculate 25 + 17')
    print(f"Problem: Calculate 25 + 17")
    print(f"Answer: {result2.final_answer}")
    print(f"Confidence: {result2.confidence}")
    
    # Test Romanian mathematical terminology
    print("\n" + "="*50)
    result3 = await engine.solve_problem('Calculează rădăcina pătrată din 64')
    print(f"Problem: Calculează rădăcina pătrată din 64")
    print(f"Answer: {result3.final_answer}")
    print(f"Confidence: {result3.confidence}")
    
    print("\n✅ Mathematical engine test completed!")

if __name__ == "__main__":
    asyncio.run(test_math())