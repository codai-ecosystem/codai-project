#!/usr/bin/env python3
"""
Debug Order of Operations Issue
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_mathematical_reasoning_engine import EnhancedMathematicalReasoningEngine

# Test order of operations
engine = EnhancedMathematicalReasoningEngine()

problem = "What is 2 + 3 * 4?"
print(f"Testing: {problem}")
print(f"Expected: 14 (2 + 12 = 14)")

result = engine.solve_enhanced_problem(problem)
print(f"Got: {result.solution}")
print(f"Steps: {result.step_by_step}")
print(f"Type: {result.reasoning_type}")

# Test another order of operations
problem2 = "What is 10 - 2 * 3?"
print(f"\nTesting: {problem2}")
print(f"Expected: 4 (10 - 6 = 4)")

result2 = engine.solve_enhanced_problem(problem2)
print(f"Got: {result2.solution}")
print(f"Steps: {result2.step_by_step}")
