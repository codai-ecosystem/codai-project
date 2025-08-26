#!/usr/bin/env python3
"""
Phase 2.5 Comprehensive Test Suite: Advanced Proofs & Multi-Solutions
"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import RealNeuralMathematicalEngine

async def test_phase_25_advanced_capabilities():
    """Test advanced mathematical capabilities for Phase 2.5"""
    print("🎯 PHASE 2.5 COMPREHENSIVE TEST SUITE")
    print("🧮 Advanced Proofs & Multi-Solutions")
    print("=" * 60)
    
    engine = RealNeuralMathematicalEngine()
    
    # Phase 2.5 Test Cases: Advanced algebraic equations with multiple solutions
    test_cases = [
        # Quadratic equations with multiple solutions
        ("x²-16=0", "x = ±4.0"),
        ("x²-25=0", "x = ±5.0"),
        ("x²-9=0", "x = ±3.0"),
        ("x²+4x-5=0", "x = -5.0, x = 1.0"),
        ("x²-6x+9=0", "x = 3.0"),  # Perfect square
        ("2x²-8=0", "x = ±2.0"),
        
        # Cubic and higher-order polynomials
        ("x³-8=0", "x = 2"),  # Should find real root
        ("x³-27=0", "x = 3"),
        
        # Rational equations
        ("x²/4-1=0", "x = ±2.0"),
        
        # Mixed format tests
        ("solve x: x²-49=0", "x = ±7.0"),
        ("solve x: 3x²-12=0", "x = ±2.0"),
        
        # Previous Phase 2 capabilities (should still work)
        ("∫(x²)dx", "x³/3 + C"),
        ("d/dx(x³)", "3*x²"),
        ("3^5 + 2^4", "259"),
        ("√144", "12"),
        ("solve x: 2x+5=17", "6"),
    ]
    
    passed = 0
    failed = 0
    
    for i, (problem, expected) in enumerate(test_cases, 1):
        print(f"\n🧮 Test {i}: {problem}")
        print("-" * 40)
        
        try:
            result = await engine.solve_mathematical_problem(problem)
            result_str = str(result.result).strip()
            
            print(f"✅ Result: {result_str}")
            print(f"🎯 Expected: {expected}")
            
            # Check if result matches expected (flexible matching)
            if expected in result_str or result_str in expected:
                print("✅ PASSED!")
                passed += 1
            elif "±" in expected and "±" in result_str:
                # Special handling for ± results
                expected_num = expected.replace("x = ±", "").replace(".0", "")
                result_num = result_str.replace("x = ±", "").replace(".0", "")
                if expected_num == result_num:
                    print("✅ PASSED! (±format match)")
                    passed += 1
                else:
                    print("❌ FAILED! (±format mismatch)")
                    failed += 1
            elif "," in expected and "," in result_str:
                # Special handling for multiple solutions  
                expected_parts = set(expected.split(", "))
                result_parts = set(result_str.split(", "))
                if expected_parts == result_parts:
                    print("✅ PASSED! (multi-solution match)")
                    passed += 1
                else:
                    print("❌ FAILED! (multi-solution mismatch)")
                    failed += 1
            else:
                print("❌ FAILED!")
                failed += 1
                
        except Exception as e:
            print(f"❌ Error: {e}")
            failed += 1
    
    print(f"\n🎯 PHASE 2.5 RESULTS SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    if passed / (passed + failed) >= 0.95:  # 95%+ target
        print("🏆 PHASE 2.5 SUCCESS CRITERIA MET!")
        print("🚀 Ready to advance to Phase 3 (Romanian Integration)")
    elif passed / (passed + failed) >= 0.85:
        print("⚡ STRONG PERFORMANCE - Minor optimizations needed")
    else:
        print("🔧 NEEDS IMPROVEMENT - Additional fixes required")
    
    return passed, failed

if __name__ == "__main__":
    asyncio.run(test_phase_25_advanced_capabilities())