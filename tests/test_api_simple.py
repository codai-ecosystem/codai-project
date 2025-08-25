#!/usr/bin/env python3
"""
Simple API test for RomAI Production API
"""
import requests
import json

def test_romai_api():
    """Test the RomAI Production API"""
    print("🧠 Testing RomAI Production API...")
    
    # Test health first
    try:
        health_response = requests.get("http://localhost:8003/health", timeout=10)
        print(f"✅ Health Check: {health_response.status_code}")
        print(f"Health Data: {health_response.json()}")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return
    
    # Test capabilities
    try:
        cap_response = requests.get("http://localhost:8003/capabilities", timeout=10)
        print(f"✅ Capabilities: {cap_response.status_code}")
        print(f"Capabilities: {cap_response.json()}")
    except Exception as e:
        print(f"❌ Capabilities Failed: {e}")
    
    # Test AGI reasoning without authentication first
    try:
        payload = {
            "capability": "mathematical_analysis",
            "query": "What is 2+2?",
            "complexity": "simple"
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        print(f"Sending payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            "http://localhost:8003/agi/reason", 
            json=payload,
            headers=headers,
            timeout=30
        )
        
        print(f"✅ AGI Reasoning: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Result: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ Error Response: {response.text}")
            
    except Exception as e:
        print(f"❌ AGI Reasoning Failed: {e}")
        
    # Try with authentication
    try:
        payload = {
            "capability": "mathematical_analysis", 
            "query": "What is the square root of 144?",
            "complexity": "simple"
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer romai-api-dev-test-token-2025"
        }
        
        print(f"\nTesting with auth: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            "http://localhost:8003/agi/reason",
            json=payload,
            headers=headers, 
            timeout=30
        )
        
        print(f"✅ AGI Reasoning with Auth: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Result: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ Error Response: {response.text}")
            
    except Exception as e:
        print(f"❌ AGI Reasoning with Auth Failed: {e}")

if __name__ == "__main__":
    test_romai_api()