#!/usr/bin/env python3
"""Debug regex patterns for mathematical expressions."""

import re

def test_patterns():
    text = "What is the square root of 144?"
    text_clean = text.lower().strip()
    print(f"Testing text: '{text_clean}'")
    
    patterns = [
        r'square root of (\d+\.?\d*)',
        r'sqrt\((\d+\.?\d*)\)',
        r'√(\d+\.?\d*)',
        r'what is .*?(?:square root of|√)[\s]*(\d+\.?\d*)',
        r'calculate.*?(?:square root of|√)[\s]*(\d+\.?\d*)',
        r'(?:find|compute|determine).*?(?:square root of|√)[\s]*(\d+\.?\d*)',
        r'(\d+\.?\d*).*?(?:square root|\^0\.5|\^1/2)',
        r'radical.*?(\d+\.?\d*)',
        r'√(\d+\.?\d*)'
    ]
    
    for i, pattern in enumerate(patterns):
        match = re.search(pattern, text_clean)
        print(f"Pattern {i+1}: {pattern}")
        if match:
            print(f"  ✅ Match: {match.group()}")
            print(f"  Number: {match.group(1)}")
        else:
            print(f"  ❌ No match")
        print()

if __name__ == "__main__":
    test_patterns()