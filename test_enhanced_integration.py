#!/usr/bin/env python3
"""
Test Enhanced Mathematical Parser Integration
Tests the integration of EnhancedMathExpressionParser into AutonomousMathEngine
"""

import sys
import os
import asyncio

# Add paths for imports
sys.path.append('.')
sys.path.append('apps/romai/src')

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine

async def test_enhanced_integration():
    """Test the enhanced mathematical parser integration"""
    print("🧮 Testing Enhanced Mathematical Parser Integration")
    print("=" * 60)
    
    # Initialize the enhanced mathematical engine
    try:
        engine = AutonomousMathEngine()
        print("✅ Mathematical engine initialized successfully")
    except Exception as e:
        print(f"❌ Engine initialization failed: {e}")
        return
    
    # Test cases that should now work with enhanced parser
    test_cases = [
        "What is 2+2?",
        "Calculate 8*2",
        "Solve 10-5",
        "What is the result of 15/3?",
        "Ce este 6+4?",  # Romanian
        "(2+3)*4",       # Complex expression
        "2+2",           # Direct expression
        "sqrt(16)",      # Function call
        "What is 5^2?",  # Power operation
    ]
    
    print(f"\n🎯 Testing {len(test_cases)} mathematical expressions:")
    print("-" * 60)
    
    success_count = 0
    for i, test_case in enumerate(test_cases, 1):
        try:
            print(f"\n{i}. Testing: '{test_case}'")
            
            # Test the mathematical problem solving
            result = await engine.solve_mathematical_problem(test_case)
            
            if result and hasattr(result, 'result'):
                print(f"   ✅ Result: {result.result}")
                print(f"   📊 Confidence: {result.confidence:.2f}")
                print(f"   🔧 Method: {result.method_used}")
                success_count += 1
            else:
                print(f"   ❌ Failed: No valid result returned")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 Integration Test Summary:")
    print(f"✅ Successful: {success_count}/{len(test_cases)} ({success_count/len(test_cases)*100:.1f}%)")
    print(f"❌ Failed: {len(test_cases)-success_count}/{len(test_cases)}")
    
    if success_count >= len(test_cases) * 0.8:
        print("🎉 INTEGRATION SUCCESS: Enhanced parser working correctly!")
        return True
    else:
        print("⚠️ INTEGRATION ISSUES: Some test cases failed")
        return False

if __name__ == "__main__":
    asyncio.run(test_enhanced_integration())