#!/usr/bin/env python3
"""Debug algebra and calculus issues"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import RealNeuralMathematicalEngine

async def debug_advanced_math():
    """Debug algebra and calculus parsing"""
    engine = RealNeuralMathematicalEngine()
    
    test_cases = [
        "solve x: 2x+5=17",  # Algebra
        "∫(x²)dx",           # Calculus  
        "sin(π/6)"           # Trigonometry (working)
    ]
    
    print("🔍 Debugging Advanced Mathematical Operations")
    print("="*60)
    
    for problem in test_cases:
        try:
            result = await engine.solve_mathematical_problem(problem)
            print(f"\nProblem: {problem}")
            print(f"Result: {result.result}")
            print(f"Success: {result.verification}")
            print(f"Method: {result.method_used}")
            print("Key Steps:")
            for i, step in enumerate(result.steps[:10]):  # First 10 steps
                print(f"  {i+1}. {step}")
            if len(result.steps) > 10:
                print(f"  ... ({len(result.steps)-10} more steps)")
                
        except Exception as e:
            print(f"❌ Error with {problem}: {e}")
            import traceback
            traceback.print_exc()
            
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(debug_advanced_math())