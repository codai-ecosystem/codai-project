#!/usr/bin/env python3
"""
Test Enhanced Mathematical Reasoning Engine
Phase 1 Day 3 - Mathematical Debugging and Validation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_mathematical_reasoning_engine import EnhancedMathematicalReasoningEngine

def test_specific_failures():
    """Test specific mathematical operations that were failing"""
    engine = EnhancedMathematicalReasoningEngine()
    
    print("🧮 Testing Enhanced Mathematical Reasoning Engine")
    print("=" * 60)
    
    # Critical test cases that were failing
    test_cases = [
        ("What is 2^8?", "arithmetic", 256),
        ("What is 3^4?", "arithmetic", 81),
        ("What is the square root of 144?", "arithmetic", 12),
        ("What is 6!?", "discrete_math", 720),
        ("Calculate C(5,2)", "discrete_math", 10),
        ("Solve for x: 2x + 5 = 15", "algebra", 5),
        ("What is 2 + 3 * 4?", "arithmetic", 14),
        ("What is sin(30°)?", "trigonometry", 0.5)
    ]
    
    results = {}
    
    for problem, expected_category, expected_answer in test_cases:
        print(f"\n🔍 Testing: {problem}")
        print(f"   Expected: {expected_answer}")
        
        try:
            result = engine.solve_enhanced_problem(problem)
            
            # Extract numerical result from EnhancedMathematicalResult object
            solution = result.solution
            print(f"   Got: {solution}")
            
            # Try to extract number from solution
            if isinstance(solution, (int, float)):
                actual_result = float(solution)
                success = abs(actual_result - expected_answer) < 0.01
                print(f"   ✅ Success: {success} (Got {actual_result}, Expected {expected_answer})")
                results[problem] = {'success': success, 'result': actual_result, 'expected': expected_answer}
            else:
                # Try to extract from string representation
                import re
                solution_str = str(solution)
                numbers = re.findall(r'-?\d+\.?\d*', solution_str)
                if numbers:
                    try:
                        actual_result = float(numbers[-1])  # Take last number found
                        success = abs(actual_result - expected_answer) < 0.01
                        print(f"   ✅ Success: {success} (Got {actual_result}, Expected {expected_answer})")
                        results[problem] = {'success': success, 'result': actual_result, 'expected': expected_answer}
                    except ValueError:
                        print(f"   ❌ Failed: Could not parse numerical result")
                        results[problem] = {'success': False, 'result': solution_str, 'expected': expected_answer}
                else:
                    print(f"   ❌ Failed: No numerical result found")
                    results[problem] = {'success': False, 'result': solution_str, 'expected': expected_answer}
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            results[problem] = {'success': False, 'result': f"ERROR: {e}", 'expected': expected_answer}
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY OF CRITICAL TESTS")
    print("=" * 60)
    
    successes = sum(1 for r in results.values() if r['success'])
    total = len(results)
    success_rate = (successes / total) * 100
    
    print(f"✅ Successes: {successes}/{total} ({success_rate:.1f}%)")
    print(f"❌ Failures: {total - successes}/{total}")
    
    # Show failures
    failures = [prob for prob, result in results.items() if not result['success']]
    if failures:
        print(f"\n🚨 FAILED TESTS:")
        for failure in failures:
            result = results[failure]
            print(f"   • {failure}")
            print(f"     Got: {result['result']}, Expected: {result['expected']}")
    
    return success_rate

def run_comprehensive_test():
    """Run the comprehensive mathematical evaluation"""
    print("\n" + "=" * 60)
    print("🎯 COMPREHENSIVE MATHEMATICAL EVALUATION")
    print("=" * 60)
    
    engine = EnhancedMathematicalReasoningEngine()
    evaluation = engine.comprehensive_mathematical_evaluation()
    
    print(f"\n📈 Overall Mathematical Score: {evaluation['overall_mathematical_score']:.1%}")
    print(f"🎯 Target for Phase 1 Day 3: 85.0%")
    
    success = evaluation['overall_mathematical_score'] >= 0.85
    print(f"✅ Phase 1 Day 3 Target Achieved: {success}")
    
    # Category breakdown
    print(f"\n📊 Category Breakdown:")
    for category, score in evaluation['category_performance'].items():
        print(f"   {category}: {score:.1%}")
    
    return evaluation

if __name__ == "__main__":
    print("🧮 Enhanced Mathematical Reasoning Engine - Phase 1 Day 3")
    print("Testing critical mathematical operations...")
    
    # Test specific failures
    critical_success_rate = test_specific_failures()
    
    # Run comprehensive evaluation
    evaluation = run_comprehensive_test()
    
    # Final assessment
    print("\n" + "=" * 60)
    print("🎯 PHASE 1 DAY 3 ASSESSMENT")
    print("=" * 60)
    
    overall_score = evaluation['overall_mathematical_score']
    target_achieved = overall_score >= 0.85
    
    print(f"📈 Mathematical Score: {overall_score:.1%}")
    print(f"🎯 Target Achievement: {target_achieved}")
    print(f"🔧 Critical Tests: {critical_success_rate:.1f}% success rate")
    
    if target_achieved:
        print("✅ Phase 1 Day 3 COMPLETE - Mathematical reasoning enhanced successfully!")
    else:
        print("❌ Phase 1 Day 3 INCOMPLETE - More debugging required")
        print("🔧 Focus areas for improvement:")
        for category, score in evaluation['category_performance'].items():
            if score < 0.70:
                print(f"   • {category}: {score:.1%} (needs improvement)")
