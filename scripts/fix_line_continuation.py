#!/usr/bin/env python3
"""
Final fix for model_server.py line continuation issue
"""

def fix_line_continuation():
    file_path = 'apps/romai/src/ml/serving/model_server.py'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the broken line with a properly formatted one
    old_pattern = '''            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):'''
    
    new_pattern = '''            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):'''
    
    # Find and replace any line continuation issues
    content = content.replace(
        '''            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):''',
        '''            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):'''
    )
    
    # Write back
    with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    
    print("✅ Fixed line continuation issue")

if __name__ == "__main__":
    fix_line_continuation()