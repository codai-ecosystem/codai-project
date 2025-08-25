#!/usr/bin/env python3
"""
Debug Algebra Issue
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_mathematical_reasoning_engine import EnhancedMathematicalReasoningEngine

# Test algebra problems
engine = EnhancedMathematicalReasoningEngine()

problems = [
    "Solve for x: 2x + 5 = 15",
    "Solve for x: x + 3 = 8",
    "Solve for x: 3x = 12"
]

for problem in problems:
    print(f"\nTesting: {problem}")
    try:
        result = engine.solve_enhanced_problem(problem)
        print(f"Got: {result.solution}")
        print(f"Steps: {result.step_by_step}")
        print(f"Type: {result.reasoning_type}")
        print(f"Confidence: {result.confidence}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
