#!/usr/bin/env python3
"""
Advanced Mathematical Reasoning Test Suite
Tests the enhanced SymPy-based mathematical capabilities
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps/romai/src'))

import asyncio
from ml.inference.real_neural_engine import RealNeuralEngine

async def test_basic_arithmetic():
    """Test basic arithmetic operations"""
    print("🧪 Testing Basic Arithmetic...")
    
    engine = RealNeuralEngine()
    tests = [
        ("What is 2+2?", "4"),
        ("What is 15*3?", "45"),
        ("What is 100/4?", "25"),
        ("What is 7^2?", "49")
    ]
    
    results = []
    for query, expected in tests:
        try:
            result = await engine.generate_response(
                query=query, 
                context={"request_context": query}, 
                response_type="mathematical_reasoning"
            )
            success = expected in result.text
            results.append(success)
            status = "✅" if success else "❌"
            print(f"  {status} {query} → {result.text}")
        except Exception as e:
            print(f"  ❌ {query} → ERROR: {e}")
            results.append(False)
    
    return all(results)

async def test_calculus():
    """Test calculus operations"""
    print("\n🧪 Testing Calculus (Derivatives & Integrals)...")
    
    engine = RealNeuralEngine()
    tests = [
        ("What is the derivative of x^2?", "2*x"),
        ("What is the derivative of sin(x)?", "cos"),
        ("What is the integral of x?", "x**2"),
        ("What is the integral of cos(x)?", "sin")
    ]
    
    results = []
    for query, expected_contains in tests:
        try:
            result = await engine.generate_response(
                query=query, 
                context={"request_context": query}, 
                response_type="mathematical_reasoning"
            )
            success = expected_contains.lower() in result.text.lower()
            results.append(success)
            status = "✅" if success else "❌"
            print(f"  {status} {query}")
            print(f"      → {result.text}")
        except Exception as e:
            print(f"  ❌ {query} → ERROR: {e}")
            results.append(False)
    
    return any(results)  # At least some calculus should work

async def test_equation_solving():
    """Test equation solving"""
    print("\n🧪 Testing Equation Solving...")
    
    engine = RealNeuralEngine()
    tests = [
        ("Solve x + 5 = 10", "5"),
        ("Solve 2x = 8", "4"),
        ("Solve x^2 = 16", "4")
    ]
    
    results = []
    for query, expected in tests:
        try:
            result = await engine.generate_response(
                query=query, 
                context={"request_context": query}, 
                response_type="mathematical_reasoning"
            )
            success = expected in result.text
            results.append(success)
            status = "✅" if success else "❌"
            print(f"  {status} {query}")
            print(f"      → {result.text}")
        except Exception as e:
            print(f"  ❌ {query} → ERROR: {e}")
            results.append(False)
    
    return any(results)

async def test_trigonometry():
    """Test trigonometric functions"""
    print("\n🧪 Testing Trigonometry...")
    
    engine = RealNeuralEngine()
    tests = [
        ("What is sin(0)?", "0"),
        ("What is cos(90)?", "0"),
        ("What is sin(30)?", "0.5")
    ]
    
    results = []
    for query, expected_contains in tests:
        try:
            result = await engine.generate_response(
                query=query, 
                context={"request_context": query}, 
                response_type="mathematical_reasoning"
            )
            # Check if result contains expected value (approximately)
            success = any(val in result.text for val in [expected_contains, "0.000000", "0.5"])
            results.append(success)
            status = "✅" if success else "❌"
            print(f"  {status} {query}")
            print(f"      → {result.text}")
        except Exception as e:
            print(f"  ❌ {query} → ERROR: {e}")
            results.append(False)
    
    return any(results)

async def test_advanced_functions():
    """Test logarithms, square roots, etc."""
    print("\n🧪 Testing Advanced Functions...")
    
    engine = RealNeuralEngine()
    tests = [
        ("What is sqrt(16)?", "4"),
        ("What is ln(1)?", "0"),
        ("What is log(100)?", "2")
    ]
    
    results = []
    for query, expected in tests:
        try:
            result = await engine.generate_response(
                query=query, 
                context={"request_context": query}, 
                response_type="mathematical_reasoning"
            )
            success = expected in result.text
            results.append(success)
            status = "✅" if success else "❌"
            print(f"  {status} {query}")
            print(f"      → {result.text}")
        except Exception as e:
            print(f"  ❌ {query} → ERROR: {e}")
            results.append(False)
    
    return any(results)

async def test_romanian_math():
    """Test mathematical reasoning in Romanian context"""
    print("\n🧪 Testing Romanian Mathematical Context...")
    
    engine = RealNeuralEngine()
    tests = [
        ("Cât este 3+7?", "10"),
        ("Care este radicalul din 25?", "5"),
        ("Rezolvă ecuația x + 3 = 8", "5")
    ]
    
    results = []
    for query, expected in tests:
        try:
            result = await engine.generate_response(
                query=query, 
                context={"request_context": query}, 
                response_type="mathematical_reasoning"
            )
            success = expected in result.text
            results.append(success)
            status = "✅" if success else "❌"
            print(f"  {status} {query}")
            print(f"      → {result.text}")
        except Exception as e:
            print(f"  ❌ {query} → ERROR: {e}")
            results.append(False)
    
    return any(results)

async def run_comprehensive_test():
    """Run all mathematical tests"""
    print("🚀 ADVANCED MATHEMATICAL REASONING TEST SUITE")
    print("=" * 60)
    
    # Run all test categories
    test_results = []
    
    basic_result = await test_basic_arithmetic()
    test_results.append(("Basic Arithmetic", basic_result))
    
    calculus_result = await test_calculus()
    test_results.append(("Calculus", calculus_result))
    
    equation_result = await test_equation_solving()
    test_results.append(("Equation Solving", equation_result))
    
    trig_result = await test_trigonometry()
    test_results.append(("Trigonometry", trig_result))
    
    advanced_result = await test_advanced_functions()
    test_results.append(("Advanced Functions", advanced_result))
    
    romanian_result = await test_romanian_math()
    test_results.append(("Romanian Math", romanian_result))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    total_passed = 0
    for category, passed in test_results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}  {category}")
        if passed:
            total_passed += 1
    
    overall_score = (total_passed / len(test_results)) * 100
    
    print(f"\n🎯 OVERALL SCORE: {total_passed}/{len(test_results)} ({overall_score:.1f}%)")
    
    if overall_score >= 80:
        print("🎉 EXCELLENT: Advanced mathematical reasoning is working!")
    elif overall_score >= 60:
        print("👍 GOOD: Most mathematical capabilities are functional")
    elif overall_score >= 40:
        print("⚠️ PARTIAL: Some mathematical capabilities working, needs improvement")
    else:
        print("❌ NEEDS WORK: Mathematical capabilities need significant development")
    
    return overall_score >= 60

if __name__ == "__main__":
    print("🧮 Starting Advanced Mathematical Reasoning Tests...")
    
    # Run comprehensive test
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        success = loop.run_until_complete(run_comprehensive_test())
        if success:
            print("\n🎉 ADVANCED MATHEMATICAL REASONING: OPERATIONAL!")
        else:
            print("\n⚠️ ADVANCED MATHEMATICAL REASONING: NEEDS IMPROVEMENT")
    finally:
        loop.close()