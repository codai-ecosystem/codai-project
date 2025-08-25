#!/usr/bin/env python3
"""
Fix syntax errors in model_server.py
"""

# Read the file
with open('model_server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace line 2044 (index 2043) with a clean version
if 2043 < len(lines):
    print(f"Original line 2044: {repr(lines[2043])}")
    # Use double quotes to avoid escaping issues
    lines[2043] = '            elif any(pattern in question for pattern in ["romanian", "romania", "cultura", "traditional", "cultural", "romanian culture", "history", "heritage"]):\n'
    print(f"New line 2044: {repr(lines[2043])}")

# Write back
with open('model_server.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ Replaced line 2044 with clean version")

# Test syntax
import ast
try:
    with open('model_server.py', 'r', encoding='utf-8') as f:
        ast.parse(f.read(), filename='model_server.py')
    print("✅ Syntax validation: PASSED")
except SyntaxError as e:
    print(f"❌ Syntax error still exists at line {e.lineno}: {e.msg}")