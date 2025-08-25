#!/usr/bin/env python3
"""
Quick fix for syntax error in model_server.py
"""

import os

def fix_model_server_syntax():
    file_path = 'apps/romai/src/ml/serving/model_server.py'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the problematic line
    old_line = "            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):"
    new_line = "            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):"
    
    # Find and fix any line break issues in string literals
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if i == 2043:  # Line 2044 (0-indexed)
            lines[i] = "            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):"
            print(f"Fixed line {i+1}: {lines[i][:100]}...")
    
    # Write back the fixed content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    print("✅ Fixed syntax error in model_server.py")

if __name__ == "__main__":
    fix_model_server_syntax()