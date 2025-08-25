#!/usr/bin/env python3
"""Fix syntax errors in model_server.py"""

import re
import ast

def fix_syntax_errors():
    print("🔧 Fixing syntax errors in model_server.py...")
    
    with open('ml/serving/model_server.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Count triple quotes to find imbalances
    triple_quotes = re.findall(r'"""', content)
    print(f"Total triple quotes found: {len(triple_quotes)}")
    
    if len(triple_quotes) % 2 != 0:
        print(f"❌ UNBALANCED: {len(triple_quotes)} triple quotes (should be even)")
        
        # Add closing quote at the end if needed
        if len(triple_quotes) % 2 == 1:
            print("Adding missing closing triple quote at end of file")
            content += '"""'
    else:
        print("✅ Triple quotes appear balanced")
    
    # Try to compile and find specific errors
    try:
        ast.parse(content)
        print("✅ File compiles successfully!")
        return True
    except SyntaxError as e:
        print(f"❌ Syntax error at line {e.lineno}: {e.msg}")
        print(f"   Text: {e.text}")
        
        # Try to fix common issues
        lines = content.split('\n')
        
        if e.lineno <= len(lines):
            error_line = lines[e.lineno - 1]
            
            # Common fixes
            if 'invalid decimal literal' in e.msg:
                print("Fixing decimal literal issues...")
                # Fix patterns like 1hour, 500ms, etc.
                content = re.sub(r'(\d+)ms\b', r'\1_ms', content)
                content = re.sub(r'(\d+)hour\b', r'\1_hour', content)
                content = re.sub(r'(\d+)h\b', r'\1_hour', content)
                content = re.sub(r'(\d+)k\b', r'\1000', content)
                content = re.sub(r'(\d+)M\b', r'\1000000', content)
        
        # Save fixed content
        with open('ml/serving/model_server.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Test again
        try:
            ast.parse(content)
            print("✅ Fixed! File compiles successfully!")
            return True
        except SyntaxError as e2:
            print(f"❌ Still has syntax error at line {e2.lineno}: {e2.msg}")
            return False

if __name__ == "__main__":
    success = fix_syntax_errors()
    exit(0 if success else 1)