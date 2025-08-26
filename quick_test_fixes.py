#!/usr/bin/env python3
import asyncio
import sys
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import RealNeuralMathematicalEngine

async def test_integration():
    engine = RealNeuralMathematicalEngine()
    
    # Test the problematic integration
    result = await engine.solve_mathematical_problem('∫(x²)dx')
    print(f'Integration Result: {result.result}')
    print('Steps:', result.reasoning_chain[:3])
    
    # Test a simple differentiation
    result2 = await engine.solve_mathematical_problem('d/dx(x³)')
    print(f'Differentiation Result: {result2.result}')
    print('Steps:', result2.reasoning_chain[:3])

    # Test power expression
    result3 = await engine.solve_mathematical_problem('3^5 + 2^4')
    print(f'Power Expression Result: {result3.result}')
    print('Steps:', result3.reasoning_chain[:3])

if __name__ == "__main__":
    asyncio.run(test_integration())