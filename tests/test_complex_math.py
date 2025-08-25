import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine

async def test_complex_math():
    print("🧠 Testing Complex Mathematical Operation")
    print("="*50)
    
    engine = AutonomousMathEngine()
    print("✅ Engine initialized\n")
    
    # Test complex mathematical operation
    problem = "sqrt(144) * 5"
    print(f"🔢 Problem: {problem}")
    result = await engine.solve_mathematical_problem(problem)
    
    print(f"📊 Result: {result.result}")
    print(f"🎯 Confidence: {result.confidence:.3f}")
    print(f"🔧 Method: {result.method}")
    print(f"🏷️  Domain: {result.domain}")
    print(f"🚀 Neural Enhanced: {result.neural_enhanced}")
    
    if result.steps:
        print("🧠 Reasoning Steps:")
        for i, step in enumerate(result.steps, 1):
            print(f"   {i}. {step}")
    
    # Verify the answer: sqrt(144) = 12, 12 * 5 = 60
    expected = 60.0
    actual = float(result.result)
    if abs(actual - expected) < 0.001:
        print(f"✅ CORRECT: Expected {expected}, Got {actual}")
    else:
        print(f"❌ INCORRECT: Expected {expected}, Got {actual}")

if __name__ == "__main__":
    asyncio.run(test_complex_math())