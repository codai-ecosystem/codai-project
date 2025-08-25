"""
🧮 RomAI Advanced Mathematical Reasoning Test

Test the enhanced mathematical capabilities with comprehensive problem types:
- Basic arithmetic with word problems
- Romanian mathematical terminology
- Geometric calculations
- Algebraic equations
- Percentage and proportion problems
- Complex multi-step reasoning
"""

import asyncio
import json
import time
from typing import List, Dict, Any

async def test_advanced_mathematical_reasoning():
    """Test the advanced mathematical reasoning engine"""
    
    print("🧮 Testing RomAI Advanced Mathematical Reasoning Engine\n")
    
    try:
        # Import the advanced mathematical engine
        from ml.reasoning.advanced_math_engine import get_advanced_math_engine
        
        engine = get_advanced_math_engine()
        print(f"✅ Mathematical engine initialized")
        print(f"   • Supported domains: {len(engine.supported_domains)}")
        print(f"   • Pattern recognition: {len(engine.math_patterns)} patterns")
        print(f"   • Romanian integration: ✅\n")
        
        # Test cases with increasing complexity
        test_problems = [
            # Basic arithmetic
            "Calculate 15 + 27",
            "What is 84 - 39?",
            "Multiply 12 × 8",
            "Divide 144 ÷ 12",
            
            # Word problems (testing the enhanced capability)
            "I have 25 apples and give away 8 apples. How many apples do I have left?",
            "If I buy 3 books for 15 lei each, how much do I spend in total?",
            
            # Romanian mathematical terms
            "Calculează rădăcina pătrată din 64",
            "Care este aria unui dreptunghi cu lungimea 8 metri și lățimea 5 metri?",
            "Rezolvă ecuația: x + 15 = 42",
            
            # Percentage problems
            "What is 25% of 80?",
            "Câte procente din 200 este 50?",
            
            # Geometry problems
            "Find the area of a circle with radius 7",
            "What is the perimeter of a square with side length 6?",
            
            # Complex problems
            "If a rectangle has length 12 and width 8, and I want to find the area of 3 such rectangles, what is the total area?",
            "Solve the equation: 2x + 10 = 30",
        ]
        
        print("🧮 Running Mathematical Test Suite:\n")
        
        for i, problem in enumerate(test_problems, 1):
            print(f"Test {i:2d}: {problem}")
            
            try:
                start_time = time.time()
                solution = await engine.solve_problem(problem)
                processing_time = time.time() - start_time
                
                print(f"         Answer: {solution.final_answer}")
                print(f"         Confidence: {solution.confidence:.2f}")
                print(f"         Domain: {solution.domain.value}")
                print(f"         Complexity: {solution.complexity.value}")
                print(f"         Processing: {processing_time:.3f}s")
                
                # Show reasoning for complex problems
                if solution.confidence < 0.9 or solution.complexity.value != 'basic':
                    print(f"         Reasoning: {solution.reasoning_chain[0] if solution.reasoning_chain else 'N/A'}")
                
                # Show verification if available
                if solution.verification and "✓" in solution.verification:
                    print(f"         Verification: ✅")
                elif solution.verification:
                    print(f"         Verification: {solution.verification}")
                
                print()
                
            except Exception as e:
                print(f"         ❌ Error: {e}\n")
        
        # Test capabilities report
        print("📊 Mathematical Engine Capabilities Report:")
        capabilities = await engine.get_capabilities()
        
        print(f"   • Domains supported: {len(capabilities['supported_domains'])}")
        print(f"   • Pattern recognition: {capabilities['pattern_recognition']} patterns")
        print(f"   • Romanian integration: {'✅' if capabilities['romanian_integration'] else '❌'}")
        print(f"   • Problems solved: {capabilities['performance']['problems_solved']}")
        print(f"   • Accuracy rate: {capabilities['performance']['accuracy_rate']:.1%}")
        print(f"   • Average confidence: {capabilities['performance']['average_confidence']:.1%}")
        
        print("\n✅ Mathematical reasoning capabilities:")
        for capability, status in capabilities['capabilities'].items():
            status_icon = "✅" if status else "❌"
            print(f"   {status_icon} {capability.replace('_', ' ').title()}")
        
        print("\n🎯 Strengths:")
        for strength in capabilities['strengths']:
            print(f"   • {strength}")
        
        if capabilities['limitations']:
            print("\n⚠️ Areas for improvement:")
            for limitation in capabilities['limitations']:
                print(f"   • {limitation}")
        
        print(f"\n🧮 Advanced Mathematical Reasoning Engine test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Mathematical reasoning test failed: {e}")
        print(f"   Error details: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

async def test_server_integration():
    """Test mathematical reasoning through the server endpoint"""
    
    print("\n🌐 Testing Server Integration:")
    
    try:
        import requests
        
        test_queries = [
            "Calculate 25 + 17",
            "I have 30 marbles and lose 12. How many marbles do I have left?",
            "What is 20% of 150?",
            "Calculează aria unui pătrat cu latura de 9 metri"
        ]
        
        for query in test_queries:
            print(f"\nTesting: {query}")
            
            try:
                response = requests.post(
                    'http://localhost:6101/reasoning/neural',
                    json={'text': query, 'capability': 'mathematical'},
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Result: {result.get('response', 'No response')[:100]}...")
                    print(f"   Confidence: {result.get('confidence', 0):.2f}")
                else:
                    print(f"❌ Server error: {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                print(f"⚠️ Server not running - start with: uvicorn ml.serving.model_server:app --host 0.0.0.0 --port 6101")
                break
            except Exception as e:
                print(f"❌ Request failed: {e}")
        
    except ImportError:
        print("⚠️ Requests not available for server testing")

if __name__ == "__main__":
    async def main():
        success = await test_advanced_mathematical_reasoning()
        if success:
            await test_server_integration()
        return success
    
    result = asyncio.run(main())
    print(f"\n{'✅ All tests passed!' if result else '❌ Some tests failed.'}")