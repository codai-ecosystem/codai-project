#!/usr/bin/env python3

import requests
import json

def test_endpoint():
    """Test the Romanian cultural reasoning endpoint directly"""
    
    try:
        response = requests.post(
            'http://localhost:6101/reasoning/romanian_cultural',
            json={'problem': 'test problem from direct python call'},
            timeout=10
        )
        print(f'Status: {response.status_code}')
        
        if response.status_code == 200:
            print('SUCCESS: Endpoint returned 200')
            result = response.json()
            cultural_reasoning = result.get('cultural_reasoning', {})
            method = cultural_reasoning.get('method', 'unknown')
            status = cultural_reasoning.get('status', 'unknown')
            print(f'Method used: {method}')
            print(f'Status: {status}')
            if 'reasoning_chain' in cultural_reasoning:
                print(f'Reasoning chain length: {len(cultural_reasoning["reasoning_chain"])}')
        else:
            print(f'ERROR: {response.text}')
            
    except requests.exceptions.ConnectionError:
        print('Connection refused - server not ready yet')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    test_endpoint()