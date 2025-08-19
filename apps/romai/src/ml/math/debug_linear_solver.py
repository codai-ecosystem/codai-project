#!/usr/bin/env python3
"""
Debug Linear Equation Solver
"""

import sys
import os
import re
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_mathematical_reasoning_engine import EnhancedMathematicalReasoningEngine

# Test the linear equation solver directly
engine = EnhancedMathematicalReasoningEngine()

# Clean the left side like the real code does
left_raw = "2x + 5"
right_raw = "15"

left_clean = engine._clean_algebraic_expression(left_raw)
right_clean = engine._clean_algebraic_expression(right_raw)

print(f"Left raw: '{left_raw}'")
print(f"Left clean: '{left_clean}'")
print(f"Right raw: '{right_raw}'")
print(f"Right clean: '{right_clean}'")

# Test the linear equation solver
steps = []
result = engine._solve_simple_linear_equation(left_clean, right_clean, steps)

print(f"\nResult: {result}")
print(f"Steps: {steps}")

# Also test SymPy parsing of the cleaned expression
import sympy as sp
try:
    x = sp.symbols('x')
    left_expr = sp.sympify(left_clean)
    right_expr = sp.sympify(right_clean)
    print(f"\nSymPy parsing:")
    print(f"Left expr: {left_expr}")
    print(f"Right expr: {right_expr}")
    
    equation = sp.Eq(left_expr, right_expr)
    print(f"Equation: {equation}")
    
    solutions = sp.solve(equation, x)
    print(f"Solutions: {solutions}")
except Exception as e:
    print(f"SymPy error: {e}")
