#!/usr/bin/env python3
"""Test Enhanced Mathematical Reasoning Engine - Phase 1 Day 3"""

import sys
import os
sys.path.append('apps/romai/src')

from ml.math.enhanced_mathematical_reasoning_engine import EnhancedMathematicalReasoningEngine

def test_enhanced_mathematical_engine():
    """Test the enhanced mathematical reasoning engine"""
    print("🧮 Testing Enhanced Mathematical Reasoning Engine - Phase 1 Day 3")
    print("=" * 60)
    
    engine = EnhancedMathematicalReasoningEngine()
    
    # Quick tests
    test_problems = [
        "What is 2 + 2?",
        "Calculate 15 * 3",
        "What is the square root of 144?",
        "Solve for x: 2x + 5 = 15",
        "Find the derivative of x^3"
    ]
    
    print("\n🎯 Quick Mathematical Tests:")
    for problem in test_problems:
        result = engine.solve_enhanced_problem(problem)
        print(f"Problem: {problem}")
        print(f"Solution: {result.solution}")
        print(f"Confidence: {result.confidence:.1%}")
        print(f"Verified: {result.verification_passed}")
        print("-" * 40)
    
    # Full evaluation
    print("\n🔬 Comprehensive Mathematical Evaluation:")
    evaluation = engine.comprehensive_mathematical_evaluation()
    
    print(f"\n📊 FINAL RESULTS:")
    print(f"Mathematical Score: {evaluation['overall_mathematical_score']:.1%}")
    print(f"Success Rate: {evaluation['success_rate']:.1%}")
    print(f"Problems Solved: {evaluation['successful_solutions']}/{evaluation['total_problems']}")
    print(f"Status: {evaluation['status']}")
    
    return evaluation

if __name__ == "__main__":
    result = test_enhanced_mathematical_engine()
