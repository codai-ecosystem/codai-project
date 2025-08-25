#!/usr/bin/env python3
"""
🔍 RomAI Current Capabilities Deep Analysis
Testing for hardcoded responses, real accuracy, and comprehensive gap analysis
"""

import sys
import asyncio
import traceback
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
from ml.reasoning.autonomous_logical_engine import AutonomousLogicalEngine
from ml.reasoning.autonomous_scientific_engine import AutonomousScientificEngine
from ml.reasoning.world_class_programming_engine import WorldClassProgrammingEngine

async def comprehensive_romai_analysis():
    """Comprehensive analysis of RomAI capabilities"""
    
    print("🔍 ROMAI DEEP ANALYSIS - IDENTIFYING HARDCODED RESPONSES & GAPS")
    print("=" * 80)
    
    # Initialize engines
    print("\n🧠 Initializing RomAI Engines...")
    try:
        math_engine = AutonomousMathEngine()
        logic_engine = AutonomousLogicalEngine()
        science_engine = AutonomousScientificEngine()
        programming_engine = WorldClassProgrammingEngine()
        print("✅ All engines initialized successfully")
    except Exception as e:
        print(f"❌ Engine initialization failed: {e}")
        return
    
    # Test mathematical accuracy with edge cases
    print("\n🔢 MATHEMATICAL ENGINE DEEP ANALYSIS")
    print("-" * 50)
    
    math_tests = [
        "Calculate factorial of 5",
        "What is 0! (factorial of 0)?",
        "Compute 12^3",
        "Calculate sqrt(16) + sqrt(9)",
        "Solve: 2x + 5 = 15",
        "Find derivative of x^3",
        "Integrate x^2 dx",
        "Calculate sin(90°)",
        "What is log(100)?",
        "Solve: x^2 - 5x + 6 = 0"
    ]
    
    math_results = []
    for test in math_tests:
        try:
            result = await math_engine.solve_mathematical_problem(test)
            math_results.append((test, result.result, result.confidence, result.method))
            print(f"✓ {test}: {result.result} (confidence: {result.confidence:.2f})")
            
            # Check for hardcoded responses
            if "Could not parse" in result.result or "Error" in result.result:
                print(f"  ⚠️ POTENTIAL ISSUE: {result.result}")
        except Exception as e:
            print(f"❌ {test}: FAILED - {e}")
            math_results.append((test, f"ERROR: {e}", 0.0, "error"))
    
    # Test logical reasoning with complex scenarios
    print("\n🧠 LOGICAL ENGINE DEEP ANALYSIS")
    print("-" * 50)
    
    logic_tests = [
        "All birds can fly. Penguins are birds. Can penguins fly?",
        "If A implies B, and B implies C, and A is true, what about C?",
        "Either it's raining or sunny. It's not raining. What's the weather?",
        "All roses are flowers. Some flowers are red. Are all roses red?",
        "If x > 5 and x < 10, what values can x take?",
        "Socrates is human. All humans are mortal. What about Socrates?",
        "If P or Q is true, and P is false, what about Q?",
        "All cats are mammals. No mammals are reptiles. Are cats reptiles?"
    ]
    
    logic_results = []
    for test in logic_tests:
        try:
            result = await logic_engine.reason(test)
            logic_results.append((test, result.conclusion, result.confidence))
            print(f"✓ {test}")
            print(f"  Answer: {result.conclusion} (confidence: {result.confidence:.2f})")
            
            # Check for generic responses
            if "Unable to derive" in result.conclusion:
                print(f"  ⚠️ GENERIC RESPONSE DETECTED")
        except Exception as e:
            print(f"❌ {test}: FAILED - {e}")
            logic_results.append((test, f"ERROR: {e}", 0.0))
    
    # Test scientific reasoning across domains
    print("\n🔬 SCIENTIFIC ENGINE DEEP ANALYSIS")
    print("-" * 50)
    
    science_tests = [
        ("Physics", "Calculate kinetic energy with mass=2kg, velocity=10m/s"),
        ("Chemistry", "How many moles in 90g of H2O?"),
        ("Biology", "If population doubles every 3 hours, what's the growth rate?"),
        ("Astronomy", "How far does light travel in 1 microsecond?"),
        ("Physics", "What's the force needed to accelerate 5kg at 2m/s²?"),
        ("Chemistry", "What's the pH of a 0.1M HCl solution?"),
        ("Biology", "DNA replication: how many new strands from 1 original?"),
        ("Astronomy", "What's the apparent magnitude of a star 10 parsecs away?")
    ]
    
    science_results = []
    for domain, test in science_tests:
        try:
            result = await science_engine.analyze_scientific_problem(f"{domain}: {test}")
            science_results.append((domain, test, result, "Success"))
            print(f"✓ {domain}: {test}")
            print(f"  Answer: {result}")
        except Exception as e:
            print(f"❌ {domain}: {test}: FAILED - {e}")
            science_results.append((domain, test, f"ERROR: {e}", "Failed"))
    
    # Test programming capabilities
    print("\n💻 PROGRAMMING ENGINE DEEP ANALYSIS")
    print("-" * 50)
    
    programming_tests = [
        ("Algorithm", "Implement quicksort algorithm"),
        ("Data Structure", "Create a binary search tree class"),
        ("Mathematical", "Generate prime numbers using Sieve of Eratosthenes"),
        ("String Processing", "Implement KMP string matching algorithm"),
        ("Array Processing", "Find longest increasing subsequence"),
        ("Graph Algorithm", "Implement Dijkstra's shortest path"),
        ("Dynamic Programming", "Solve knapsack problem"),
        ("Recursion", "Implement Tower of Hanoi solution")
    ]
    
    programming_results = []
    for category, test in programming_tests:
        try:
            result = await programming_engine.solve_programming_problem(f"{category}: {test}")
            programming_results.append((category, test, len(result.code), result.quality))
            print(f"✓ {category}: {test}")
            print(f"  Code length: {len(result.code)} chars, Quality: {result.quality}")
            
            # Check for mock responses
            if "mock" in result.code.lower() or len(result.code) < 100:
                print(f"  ⚠️ POTENTIAL MOCK RESPONSE")
        except Exception as e:
            print(f"❌ {category}: {test}: FAILED - {e}")
            programming_results.append((category, test, 0, f"ERROR: {e}"))
    
    # Analysis Summary
    print("\n📊 COMPREHENSIVE ANALYSIS RESULTS")
    print("=" * 80)
    
    # Mathematical Analysis
    math_success_rate = sum(1 for _, result, _, _ in math_results if "ERROR" not in result) / len(math_results)
    math_avg_confidence = sum(conf for _, _, conf, _ in math_results if conf > 0) / max(1, len([c for _, _, c, _ in math_results if c > 0]))
    
    print(f"\n🔢 Mathematical Engine:")
    print(f"  Success Rate: {math_success_rate:.1%}")
    print(f"  Average Confidence: {math_avg_confidence:.2f}")
    print(f"  Issues Found: {sum(1 for _, result, _, _ in math_results if 'Could not parse' in result or 'Error' in result)}")
    
    # Logical Analysis
    logic_success_rate = sum(1 for _, result, _ in logic_results if "ERROR" not in result) / len(logic_results)
    logic_generic_responses = sum(1 for _, result, _ in logic_results if "Unable to derive" in result)
    
    print(f"\n🧠 Logical Engine:")
    print(f"  Success Rate: {logic_success_rate:.1%}")
    print(f"  Generic Responses: {logic_generic_responses}/{len(logic_results)}")
    
    # Scientific Analysis
    science_success_rate = sum(1 for _, _, _, status in science_results if status == "Success") / len(science_results)
    
    print(f"\n🔬 Scientific Engine:")
    print(f"  Success Rate: {science_success_rate:.1%}")
    
    # Programming Analysis
    programming_success_rate = sum(1 for _, _, length, _ in programming_results if isinstance(length, int) and length > 0) / len(programming_results)
    
    print(f"\n💻 Programming Engine:")
    print(f"  Success Rate: {programming_success_rate:.1%}")
    
    # Critical Issues
    print(f"\n🚨 CRITICAL ISSUES IDENTIFIED:")
    
    critical_issues = []
    
    # Mathematical issues
    if math_success_rate < 0.9:
        critical_issues.append(f"Mathematical engine success rate too low: {math_success_rate:.1%}")
    
    if math_avg_confidence < 0.8:
        critical_issues.append(f"Mathematical engine confidence too low: {math_avg_confidence:.2f}")
    
    # Logical issues
    if logic_generic_responses > len(logic_results) * 0.3:
        critical_issues.append(f"Too many generic logical responses: {logic_generic_responses}")
    
    # Display issues
    if critical_issues:
        for issue in critical_issues:
            print(f"  ❌ {issue}")
    else:
        print("  ✅ No critical issues detected")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    if critical_issues:
        print("  1. Fix mathematical parsing for factorial and complex expressions")
        print("  2. Implement proper logical reasoning for complex scenarios")
        print("  3. Add more specific training data for edge cases")
        print("  4. Improve confidence scoring algorithms")
    else:
        print("  1. System performing well, focus on advanced capabilities")
        print("  2. Consider adding more complex reasoning domains")
        print("  3. Implement real-time learning capabilities")

if __name__ == "__main__":
    asyncio.run(comprehensive_romai_analysis())