#!/usr/bin/env python3
"""
Comprehensive fix for all syntax errors in model_server.py
"""

def fix_all_syntax_errors():
    # Read the file
    with open('model_server.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix all broken string patterns
    broken_patterns = [
        # Pattern 1 - the string spans multiple lines with quotes
        "'cultural', '\nromanian culture'",
        "'cultural', 'romanian culture'",
        
        # Pattern 2 - alternative broken pattern
        "'cultural', 'roma\nnian culture'",
        "'cultural', 'romanian culture'",
        
        # Pattern 3 - another possible pattern
        "'cultural', '\nromania",  
        "'cultural', 'romania"
    ]
    
    # Apply fixes
    fixed_content = content
    
    # Use more aggressive replacement
    import re
    
    # Pattern to match the broken elif statements
    pattern = re.compile(
        r"elif any\(pattern in question for pattern in \['romanian', 'romania', 'cultura', 'traditional', 'cultural',.*?'history', 'heritage'\]\):",
        re.MULTILINE | re.DOTALL
    )
    
    replacement = "elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):"
    
    fixed_content = pattern.sub(replacement, fixed_content)
    
    # Also fix line-by-line
    lines = fixed_content.split('\n')
    for i, line in enumerate(lines):
        if 'elif any(pattern in question' in line and ('romanian' in line or 'cultura' in line):
            # Check if this line and next contain a broken pattern
            if i + 1 < len(lines) and ('history' in lines[i+1] or 'heritage' in lines[i+1]):
                # This is likely a broken multi-line pattern
                lines[i] = "            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):"
                # Remove the continuation line
                if i + 1 < len(lines) and lines[i+1].strip().startswith('history'):
                    lines[i+1] = ''  # Empty the continuation line
    
    # Write back
    fixed_content = '\n'.join(lines)
    with open('model_server.py', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print("✅ Applied comprehensive fix for all syntax errors")

if __name__ == "__main__":
    fix_all_syntax_errors()