#!/usr/bin/env python3
"""
Test RomAI Mathematical Engine
==============================

Direct test of the mathematical reasoning engine to identify calculation errors.
"""

import sys
import asyncio
import os

# Add the RomAI source path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

async def test_mathematical_engine():
    """Test the RomAI mathematical reasoning engine directly"""
    print("🧠 Testing RomAI Mathematical Reasoning Engine")
    print("=" * 60)
    
    try:
        from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
        
        # Initialize the engine
        print("🔧 Initializing Mathematical Engine...")
        engine = AutonomousMathEngine()
        print("✅ Engine initialized successfully")
        
        # Test cases that should be 100% accurate
        test_problems = [
            "25 * 4 + 10",      # Should be 110, not 14
            "25 * 4",           # Should be 100
            "100 + 10",         # Should be 110
            "√144",             # Should be 12
            "2 + 2",            # Should be 4
            "10 - 5",           # Should be 5
            "3 * 7",            # Should be 21
            "20 / 4",           # Should be 5
            "2^3",              # Should be 8
            "5!",               # Should be 120
        ]
        
        print(f"\n� Testing {len(test_problems)} Mathematical Problems")
        print("-" * 60)
        
        failed_tests = []
        passed_tests = []
        
        for i, problem in enumerate(test_problems, 1):
            print(f"\n🔢 Test {i}: {problem}")
            
            try:
                # Solve the problem
                solution = await engine.solve_mathematical_problem(problem)
                
                print(f"📊 Result: {solution.result}")
                print(f"🎯 Confidence: {solution.confidence:.3f}")
                print(f"🔧 Method: {solution.method}")
                print(f"🏷️  Domain: {solution.domain}")
                print(f"🚀 Neural Enhanced: {solution.neural_enhanced}")
                
                # Check if we have reasoning steps
                if solution.steps:
                    print(f"� Reasoning Steps ({len(solution.steps)}):")
                    for j, step in enumerate(solution.steps, 1):
                        print(f"   {j}. {step}")
                
                # Verify correctness for known answers
                expected_answers = {
                    "25 * 4 + 10": 110,
                    "25 * 4": 100,
                    "100 + 10": 110,
                    "√144": 12,
                    "2 + 2": 4,
                    "10 - 5": 5,
                    "3 * 7": 21,
                    "20 / 4": 5,
                    "2^3": 8,
                    "5!": 120
                }
                
                if problem in expected_answers:
                    expected = expected_answers[problem]
                    try:
                        actual = float(solution.result)
                        if abs(actual - expected) < 0.001:
                            print(f"✅ CORRECT: Expected {expected}, Got {actual}")
                            passed_tests.append(problem)
                        else:
                            print(f"❌ INCORRECT: Expected {expected}, Got {actual}")
                            failed_tests.append((problem, expected, actual))
                    except ValueError:
                        print(f"⚠️  NON-NUMERIC RESULT: Expected {expected}, Got '{solution.result}'")
                        failed_tests.append((problem, expected, solution.result))
                
                print(f"{'='*40}")
                
            except Exception as e:
                print(f"💥 ERROR: {str(e)}")
                failed_tests.append((problem, "N/A", f"Error: {str(e)}"))
                import traceback
                print(f"🔍 Traceback: {traceback.format_exc()}")
        
        # Summary
        print(f"\n📈 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {len(passed_tests)}/{len(test_problems)}")
        print(f"❌ Failed: {len(failed_tests)}/{len(test_problems)}")
        print(f"📊 Success Rate: {(len(passed_tests)/len(test_problems)*100):.1f}%")
        
        if passed_tests:
            print(f"\n✅ PASSED TESTS:")
            for test in passed_tests:
                print(f"   • {test}")
        
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test, expected, actual in failed_tests:
                print(f"   • {test}: Expected {expected}, Got {actual}")
        
        # Critical assessment
        if len(failed_tests) > 0:
            print(f"\n� CRITICAL ISSUES DETECTED:")
            print(f"   The mathematical engine is producing incorrect results.")
            print(f"   This undermines the credibility of the entire AGI system.")
            print(f"   Immediate fixes are required for production readiness.")
        else:
            print(f"\n� ALL TESTS PASSED:")
            print(f"   The mathematical engine is working correctly!")
            print(f"   RomAI mathematical reasoning is production-ready.")
        
    except ImportError as e:
        print(f"💥 IMPORT ERROR: {str(e)}")
        print(f"� Could not import mathematical engine components")
        print(f"📁 Check if the RomAI source files are in the correct location")
        import traceback
        print(f"🔧 Traceback: {traceback.format_exc()}")
        
    except Exception as e:
        print(f"💥 UNEXPECTED ERROR: {str(e)}")
        import traceback
        print(f"🔧 Traceback: {traceback.format_exc()}")

def main():
    """Main test function"""
    asyncio.run(test_mathematical_engine())

if __name__ == "__main__":
    main()