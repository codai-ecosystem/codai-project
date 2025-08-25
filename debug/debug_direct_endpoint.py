#!/usr/bin/env python3
"""
Test the RomAI server endpoint directly to debug multiprocessing issue
"""

import requests
import json
import sys

def test_romanian_cultural_reasoning():
    """Test Romanian cultural reasoning endpoint directly"""
    
    print("🔧 DEBUG: Testing Romanian cultural reasoning endpoint directly...")
    
    # Test data
    test_request = {
        "problem": "How should a Romanian company handle international partnerships?",
        "cultural_context": {
            "domain": "business",
            "urgency": "normal",
            "stakeholders": ["romanian_team", "international_partners"]
        }
    }
    
    try:
        # Make request to server
        print(f"🌐 Calling endpoint: http://localhost:6101/reasoning/romanian_cultural")
        print(f"📤 Request payload: {json.dumps(test_request, indent=2)}")
        
        response = requests.post(
            "http://localhost:6101/reasoning/romanian_cultural",
            json=test_request,
            timeout=30
        )
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📨 Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS: Romanian cultural reasoning endpoint working!")
            print(f"📄 Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(f"📄 Error response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_server_health():
    """Test server health"""
    try:
        response = requests.get("http://localhost:6101/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Server healthy: {health_data.get('models_loaded', 'unknown')} models loaded")
            return True
        else:
            print(f"❌ Server unhealthy: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🧠 RomAI Server Direct Endpoint Testing")
    print("=" * 60)
    
    # Test server health first
    if not test_server_health():
        print("❌ Server not responding, exiting...")
        sys.exit(1)
    
    print("") # blank line
    
    # Test Romanian cultural reasoning
    success = test_romanian_cultural_reasoning()
    
    print("") # blank line
    print("=" * 60)
    
    if success:
        print("🎉 ALL TESTS PASSED: Romanian cultural reasoning endpoint working!")
        sys.exit(0)
    else:
        print("❌ TESTS FAILED: Romanian cultural reasoning endpoint has issues")
        sys.exit(1)