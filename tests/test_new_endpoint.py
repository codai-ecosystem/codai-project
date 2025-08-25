#!/usr/bin/env python3

import requests
import json

def test_new_endpoint():
    """Test the new Romanian cultural reasoning endpoint"""
    
    try:
        response = requests.post(
            'http://localhost:6101/test/romanian_cultural_new',
            json={'problem': 'test problem for new endpoint'},
            timeout=10
        )
        print(f'Status: {response.status_code}')
        
        if response.status_code == 200:
            result = response.json()
            print('SUCCESS: New endpoint works!')
            print(f'Test endpoint: {result.get("test_endpoint", False)}')
            print(f'Method: {result.get("method", "unknown")}')
            reasoning = result.get("cultural_reasoning", {})
            print(f'Reasoning status: {reasoning.get("status", "unknown")}')
            print(f'Reasoning keys: {list(reasoning.keys())}')
        else:
            print(f'ERROR: {response.text}')
            
    except requests.exceptions.ConnectionError:
        print('Connection refused - server not ready')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    test_new_endpoint()