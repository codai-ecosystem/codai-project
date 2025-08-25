#!/usr/bin/env python3
"""
Quick fix for syntax error in model_server.py
"""

def fix_syntax_error():
    # Read the file content
    with open('model_server.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the broken pattern
    broken_pattern = """elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', '
romanian culture', 'history', 'heritage']):"""
    
    fixed_pattern = """elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):"""
    
    if broken_pattern in content:
        print("Found broken pattern, fixing...")
        fixed_content = content.replace(broken_pattern, fixed_pattern)
        
        # Write back
        with open('model_server.py', 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print("✅ Syntax error fixed!")
    else:
        print("Broken pattern not found, checking line by line...")
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'romanian cu' in line and 'lture' in line:
                print(f"Found problematic line {i+1}: {repr(line)}")
                # Fix the specific line
                lines[i] = line.replace('romanian cu\\nlture', 'romanian culture')
                fixed_content = '\n'.join(lines)
                
                with open('model_server.py', 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                
                print("✅ Line-by-line fix applied!")
                break
        else:
            print("❌ Could not locate the syntax error")

if __name__ == "__main__":
    fix_syntax_error()