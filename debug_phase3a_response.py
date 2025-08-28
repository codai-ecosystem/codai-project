#!/usr/bin/env python3
"""
Debug Phase 3A Advanced Reasoning Response
"""

import requests
import json

def debug_response():
    response = requests.post(
        'http://localhost:6101/api/v1/advanced-reasoning/analyze',
        json={'problem': 'How to implement a function that finds the maximum element in a list?'},
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Raw Response: {response.text}")
    
    try:
        data = response.json()
        print(f"Parsed JSON: {json.dumps(data, indent=2)}")
    except:
        print("Could not parse as JSON")

if __name__ == "__main__":
    debug_response()