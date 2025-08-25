#!/usr/bin/env python3
"""Test server endpoint directly"""

import requests
import json

def test_romanian_cultural_endpoint():
    """Test the Romanian cultural reasoning endpoint directly"""
    
    print("🧪 TESTING: Romanian Cultural Reasoning Endpoint")
    print("=" * 60)
    
    url = "http://localhost:6101/reasoning/romanian_cultural"
    payload = {
        "problem": "How can Romanian values improve business decision-making?",
        "cultural_context": {
            "domain": "business",
            "emphasis": "cultural_wisdom"
        }
    }
    
    try:
        print(f"📡 Sending request to: {url}")
        print(f"📦 Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS!")
            print(f"📋 Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ FAILED!")
            try:
                error_detail = response.json()
                print(f"💥 Error Detail: {json.dumps(error_detail, indent=2)}")
            except:
                print(f"💥 Raw Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"💥 Exception: {e}")
        return False

def test_server_health():
    """Test server health first"""
    
    print("🏥 TESTING: Server Health")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:6101/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Server healthy: {health.get('models_loaded', 0)} models loaded")
            return True
        else:
            print(f"❌ Server unhealthy: {response.status_code}")
            return False
    except Exception as e:
        print(f"💥 Server connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 DEBUGGING: Direct Server Endpoint Testing")
    print("=" * 80)
    
    # Test server health first
    if test_server_health():
        print()
        test_romanian_cultural_endpoint()
    else:
        print("❌ Server not available - skipping endpoint tests")