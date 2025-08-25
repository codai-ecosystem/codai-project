#!/usr/bin/env python3
"""Test live endpoint to see server logs"""

import requests
import json
import time

def test_live_endpoint():
    """Test the live endpoint to trigger server logs"""
    
    print("📡 Testing live Romanian cultural reasoning endpoint...")
    
    url = "http://localhost:6101/reasoning/romanian_cultural"
    payload = {"problem": "Simple test", "cultural_context": {}}
    
    try:
        print(f"🚀 Sending request to: {url}")
        print(f"📦 Payload: {json.dumps(payload)}")
        
        response = requests.post(url, json=payload, timeout=10)
        
        print(f"📊 Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS!")
            print(f"📋 Result keys: {list(result.keys())}")
        else:
            try:
                error = response.json()
                print(f"❌ ERROR: {error}")
            except:
                print(f"❌ RAW ERROR: {response.text}")
                
        return response.status_code == 200
        
    except Exception as e:
        print(f"💥 Exception: {e}")
        return False

if __name__ == "__main__":
    test_live_endpoint()