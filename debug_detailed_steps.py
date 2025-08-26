#!/usr/bin/env python3
"""Debug detailed steps for mathematical regression"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import RealNeuralMathematicalEngine

async def debug_detailed_steps():
    """Get detailed steps to understand the regression"""
    engine = RealNeuralMathematicalEngine()
    
    problem = "7*8+4"
    result = await engine.solve_mathematical_problem(problem)
    
    print(f"🔍 Detailed Analysis for: {problem}")
    print("="*60)
    print(f"Final Result: {result.result} (Expected: 60)")
    print("\nAll Steps:")
    for i, step in enumerate(result.steps, 1):
        print(f"{i:2d}. {step}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(debug_detailed_steps())