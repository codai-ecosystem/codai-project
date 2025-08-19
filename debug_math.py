#!/usr/bin/env python3
"""Debug specific mathematical problems"""

import sys
import os
sys.path.append('apps/romai/src')

from ml.math.enhanced_mathematical_reasoning_engine import EnhancedMathematicalReasoningEngine

def debug_specific_problems():
    """Debug specific failing problems"""
    print("🔬 Debugging Specific Mathematical Problems")
    print("=" * 50)
    
    engine = EnhancedMathematicalReasoningEngine()
    
    # Debug specific failing problems
    debug_problems = [
        "What is 2^8?",
        "What is the square root of 144?",
        "What is 6!?",
        "Calculate C(5,2)",
        "Solve for x: 2x + 5 = 15"
    ]
    
    for problem in debug_problems:
        print(f"\n🎯 Problem: {problem}")
        
        # Analyze problem type first
        analysis = engine._analyze_problem_complexity(problem)
        print(f"Analysis: {analysis}")
        
        # Try solving
        result = engine.solve_enhanced_problem(problem)
        print(f"Solution: {result.solution}")
        print(f"Steps: {result.step_by_step}")
        print(f"Confidence: {result.confidence:.1%}")
        print(f"Type: {result.reasoning_type}")
        print("-" * 30)

if __name__ == "__main__":
    debug_specific_problems()
