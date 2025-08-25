#!/usr/bin/env python3
"""
Test the Fixed RomAI Mathematical Reasoning
"""

import requests
import json
import time

def test_mathematical_reasoning():
    """Test the fixed mathematical reasoning endpoint"""
    print("🧠 Testing FIXED RomAI Mathematical Reasoning...")
    
    # Wait for server to be ready
    time.sleep(2)
    
    test_cases = [
        {'query': 'what is 2+3?', 'capability': 'mathematical'},
        {'query': 'what is sqrt(16)?', 'capability': 'mathematical'},
        {'query': 'solve x^2 = 4', 'capability': 'mathematical'},
        {'query': 'derivative of x^2', 'capability': 'mathematical'}
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        try:
            print(f"\n{i}. Testing: {test_case['query']}")
            response = requests.post(
                'http://localhost:6101/agi/reason', 
                json=test_case, 
                timeout=15
            )
            
            print(f"Status: {response.status_code}")
            result = response.json()
            
            # Show key information
            print(f"Architecture: {result.get('architecture', 'Unknown')}")
            print(f"Result: {result.get('result', 'No result')[:100]}...")
            print(f"Confidence: {result.get('confidence', 'Unknown')}")
            
            if 'DeepSeek' in str(result.get('architecture', '')):
                print("✅ Using DeepSeek V3 architecture!")
            else:
                print("⚠️ Still using legacy system")
                
        except Exception as e:
            print(f"❌ Error testing {test_case['query']}: {e}")

if __name__ == "__main__":
    test_mathematical_reasoning()