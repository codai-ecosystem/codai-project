import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_logical_engine import AutonomousLogicalEngine

async def test_logical_reasoning():
    print("🧠 Testing RomAI Logical Reasoning Engine")
    print("="*60)
    
    engine = AutonomousLogicalEngine()
    print("✅ Engine initialized successfully\n")
    
    test_cases = [
        "All roses are flowers. This is a rose. What can we conclude?",
        "If it rains, the ground gets wet. It is raining. What happens?",
        "All cats are mammals. Felix is a cat. What is Felix?",
        "No birds can swim underwater. Penguins are birds. Can penguins swim underwater?",
        "If a number is divisible by 6, it's divisible by 3. 18 is divisible by 6. Is 18 divisible by 3?",
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"🔢 Test {i}: {test_case}")
        result = await engine.reason(test_case)
        print(f"📊 Conclusion: {result.conclusion}")
        print(f"🎯 Confidence: {result.confidence:.3f}")
        print(f"🔧 Method: {result.reasoning_method}")
        print(f"🏷️  Type: {result.reasoning_type}")
        print(f"🚀 Steps: {len(result.reasoning_steps)}")
        print(f"✅ Valid: {result.validity}")
        print(f"🧠 Neural Enhanced: {result.neural_enhanced}")
        
        if result.reasoning_steps:
            print("🔍 Reasoning Steps:")
            for j, step in enumerate(result.reasoning_steps, 1):
                print(f"   {j}. {step}")
        
        print("="*40 + "\n")

if __name__ == "__main__":
    asyncio.run(test_logical_reasoning())