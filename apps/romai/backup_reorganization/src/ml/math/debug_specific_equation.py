#!/usr/bin/env python3
"""
Debug Specific Equation: 2x + 5 = 15
"""

import re

problem = "Solve for x: 2x + 5 = 15"
print(f"Testing patterns for: {problem}")

# Test the patterns used in the code
equation_patterns = [
    r':\s*([^:]+=[^:]+)$',  # After colon to end
    r'([a-zA-Z0-9\s\+\-\*\/\^\.]+=[a-zA-Z0-9\s\+\-\*\/\^\.]+)',  # General equation pattern
]

for i, pattern in enumerate(equation_patterns):
    print(f"\nPattern {i+1}: {pattern}")
    equation_match = re.search(pattern, problem)
    if equation_match:
        equation_str = equation_match.group(1).strip()
        print(f"  ✅ Match: '{equation_str}'")
        
        if '=' in equation_str:
            eq_parts = equation_str.split('=')
            print(f"  Left: '{eq_parts[0].strip()}'")
            print(f"  Right: '{eq_parts[1].strip()}'")
    else:
        print(f"  ❌ No match")

# Test simpler pattern
print(f"\nSimple colon split test:")
colon_parts = problem.split(':')
if len(colon_parts) > 1:
    equation_part = colon_parts[1].strip()
    print(f"After colon: '{equation_part}'")
    if '=' in equation_part:
        print("Contains equals - this should work!")
