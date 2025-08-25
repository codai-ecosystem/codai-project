#!/usr/bin/env python3
"""
Debug Specific Algebra Parsing
"""

import sys
import os
import re
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml.math.mathematical_reasoning_engine import MathematicalReasoningEngine

# Test the specific equation parsing
problem = "Solve for x: 2x + 5 = 15"
print(f"Testing: {problem}")

# Extract equation from word problem
equation_match = re.search(r'(\w+.*=.*\w+)', problem)
if equation_match:
    equation_str = equation_match.group(1)
    print(f"Extracted equation: '{equation_str}'")
    
    if '=' in equation_str:
        eq_parts = equation_str.split('=')
        print(f"Left side: '{eq_parts[0].strip()}'")
        print(f"Right side: '{eq_parts[1].strip()}'")
        
        # Test clean function
        engine = MathematicalReasoningEngine()
        left_clean = engine._clean_algebraic_expression(eq_parts[0].strip())
        right_clean = engine._clean_algebraic_expression(eq_parts[1].strip())
        print(f"Cleaned left: '{left_clean}'")
        print(f"Cleaned right: '{right_clean}'")
else:
    print("No equation match found!")

# Test a simpler approach
print(f"\nDirect '=' split test:")
if '=' in problem:
    equation_parts = problem.split('=')
    print(f"Split parts: {equation_parts}")
    
    # Find the equation part
    for part in equation_parts:
        if 'x' in part and any(c.isdigit() for c in part):
            print(f"Found equation part: '{part.strip()}'")
        elif any(c.isdigit() for c in part) and len(part.strip()) < 10:
            print(f"Found number part: '{part.strip()}'")
