"""Debug Romanian mathematical terminology"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

import re

def test_romanian_patterns():
    print("🔍 Debugging Romanian Mathematical Pattern Recognition\n")
    
    # Test Romanian terms
    problem = "Calculează rădăcina pătrată din 64"
    print(f"Original: {problem}")
    
    # Test the normalization process
    romanian_math_terms = {
        'square_root': ['rădăcina pătrată', 'radical'],
        'calculate': ['calculează', 'rezolvă', 'găsește'],
    }
    
    normalized = problem.lower().strip()
    print(f"Lowercased: {normalized}")
    
    # Test Romanian term replacement
    for english_term, romanian_terms in romanian_math_terms.items():
        for romanian_term in romanian_terms:
            if romanian_term in normalized:
                print(f"Found '{romanian_term}' -> '{english_term}'")
                normalized = normalized.replace(romanian_term, english_term)
    
    print(f"Normalized: {normalized}")
    
    # Test pattern matching
    pattern = r'(?i)(?:square_root|radical|square root)(?:\s+(?:de|of|din))?\s*(\d+(?:\.\d+)?)'
    match = re.search(pattern, normalized)
    
    print(f"Pattern: {pattern}")
    print(f"Match: {match}")
    if match:
        print(f"Captured number: {match.group(1)}")
    else:
        print("❌ No match found!")
        
    # Test with manual pattern
    manual_pattern = r'(?i)(?:calculează|calculate).*(?:rădăcina pătrată|square_root|radical).*(?:din|of)\s*(\d+(?:\.\d+)?)'
    manual_match = re.search(manual_pattern, problem)
    print(f"Manual pattern match: {manual_match}")
    if manual_match:
        print(f"Manual captured: {manual_match.group(1)}")

if __name__ == "__main__":
    test_romanian_patterns()