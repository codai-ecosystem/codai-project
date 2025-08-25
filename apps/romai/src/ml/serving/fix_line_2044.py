#!/usr/bin/env python3
"""
Fix the syntax error by replacing line 2044
"""

# Read the fixed line from external file
with open('fixed_line.txt', 'r') as f:
    fixed_line = f.read().strip() + '\n'

# Read the model server file
with open('model_server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace line 2044 (index 2043)
if 2043 < len(lines):
    print(f"Replacing line 2044...")
    print(f"Old: {repr(lines[2043])}")
    lines[2043] = fixed_line
    print(f"New: {repr(lines[2043])}")

# Write back
with open('model_server.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Line 2044 replaced successfully")

# Test syntax
import ast
try:
    with open('model_server.py', 'r', encoding='utf-8') as f:
        ast.parse(f.read(), filename='model_server.py')
    print("✅ Syntax validation: PASSED")
except SyntaxError as e:
    print(f"❌ Syntax error at line {e.lineno}: {e.msg}")
    # Show context around the error
    with open('model_server.py', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    start = max(0, e.lineno - 3)
    end = min(len(lines), e.lineno + 2)
    for i in range(start, end):
        marker = ">>> " if i == e.lineno - 1 else "    "
        print(f"{marker}Line {i+1}: {repr(lines[i])}")