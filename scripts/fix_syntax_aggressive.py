#!/usr/bin/env python3
"""
Aggressive fix for model_server.py syntax error
"""

def fix_model_server_aggressive():
    file_path = 'apps/romai/src/ml/serving/model_server.py'
    
    # Read the file with explicit UTF-8 encoding
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Split into lines
    lines = content.split('\n')
    
    # Find the problematic section and reconstruct it
    for i in range(len(lines)):
        line = lines[i]
        
        # Look for the problematic elif statement
        if 'elif any(pattern in question' in line and 'romanian' in line:
            print(f"Found problematic line at {i+1}: {line[:50]}...")
            
            # Replace with a clean, properly formatted line
            lines[i] = "            elif any(pattern in question for pattern in ['romanian', 'romania', 'cultura', 'traditional', 'cultural', 'romanian culture', 'history', 'heritage']):"
            print(f"Replaced with: {lines[i]}")
            
            # Check if the next line might be a continuation that needs to be removed
            if i + 1 < len(lines) and lines[i + 1].strip().startswith("history"):
                print(f"Removing continuation line: {lines[i + 1]}")
                lines.pop(i + 1)
    
    # Write back with UTF-8 encoding
    with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines))
    
    print("✅ Aggressively fixed syntax error in model_server.py")

if __name__ == "__main__":
    fix_model_server_aggressive()