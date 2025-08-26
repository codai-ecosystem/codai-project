"""
Quick Mathematical Benchmark Test
================================

Fast test to validate RomAI mathematical capabilities.
Lightweight and focused on core functionality.

Author: GitHub Copilot Agent
Date: August 26, 2025
"""

import asyncio
import sys
import os
from pathlib import Path

# Add project paths
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

async def quick_math_test():
    """Quick mathematical reasoning test"""
    print("🧮 RomAI Quick Mathematical Test")
    print("=" * 40)
    
    # Simple test cases
    test_cases = [
        {"problem": "What is 12 × 15?", "expected": "180"},
        {"problem": "Solve: x² = 25", "expected": "x = ±5"},  
        {"problem": "What is the derivative of x³?", "expected": "3x²"},
        {"problem": "Calculate √144", "expected": "12"}
    ]
    
    try:
        import requests
        
        passed = 0
        total = len(test_cases)
        
        for i, test in enumerate(test_cases, 1):
            print(f"\n🔍 Test {i}: {test['problem']}")
            
            try:
                response = requests.post(
                    'http://localhost:6101/api/v1/mathematical-reasoning/solve',
                    json={
                        "problem": test['problem'],
                        "romanian_emphasis": 0.3
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success', False):
                        solution_steps = result.get('solution_steps', [])
                        answer = result.get('solution', 'No solution')
                        print(f"📝 Answer: {answer}")
                        print(f"🔍 Method: {result.get('method_used', 'unknown')}")
                        print(f"📊 Confidence: {result.get('confidence', 0)}")
                        
                        # Check if the expected answer appears in solution steps or answer
                        found_answer = any(test['expected'].lower() in step.lower() for step in solution_steps)
                        found_answer = found_answer or test['expected'].lower() in answer.lower()
                        
                        if found_answer:
                            print("✅ CORRECT")
                            passed += 1
                        else:
                            print("❌ INCORRECT - Expected contains:", test['expected'])
                    else:
                        print("❌ API returned unsuccessful result")
                else:
                    print(f"❌ API Error: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error: {str(e)}")
        
        # Summary
        print(f"\n📊 RESULTS:")
        print(f"✅ Passed: {passed}/{total} ({passed/total*100:.1f}%)")
        print(f"🎯 Status: {'EXCELLENT' if passed/total >= 0.9 else 'GOOD' if passed/total >= 0.7 else 'NEEDS IMPROVEMENT'}")
        
        return passed/total
        
    except ImportError:
        print("❌ requests library not available")
        return 0.0

if __name__ == "__main__":
    try:
        accuracy = asyncio.run(quick_math_test())
        print(f"\n🏁 Final Accuracy: {accuracy:.1%}")
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")