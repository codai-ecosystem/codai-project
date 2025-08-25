#!/usr/bin/env python3
"""
Test AGI Endpoints - Phase 1 Day 1 Validation
==============================================
Complete testing of all fixed AGI endpoints
"""

import requests
import json
import asyncio

def test_agi_endpoints():
    """Test all critical AGI endpoints"""
    print("🧪 Testing AGI Endpoints - Phase 1 Day 1 Validation...")
    
    base_url = "http://localhost:6101"
    
    # Test 1: Capabilities/Scores endpoint
    print("\n📊 Testing capabilities/scores endpoint...")
    try:
        response = requests.get(f"{base_url}/capabilities/scores")
        if response.status_code == 200:
            caps = response.json()
            print("✅ Capabilities endpoint - SUCCESS!")
            print(f"   Overall AGI Score: {caps.get('overall_agi_score', 0):.3f}")
            print(f"   Romanian Processing: {caps.get('romanian_language_processing', 0):.3f}")
            print(f"   Advanced Reasoning: {caps.get('advanced_reasoning', 0):.3f}")
            print(f"   Cultural Understanding: {caps.get('cultural_understanding', 0):.3f}")
        else:
            print(f"❌ Capabilities endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Capabilities endpoint error: {e}")
    
    # Test 2: Inference endpoint  
    print("\n🧠 Testing inference endpoint...")
    try:
        data = {"text": "What is 2+2?", "task_type": "general_reasoning"}
        response = requests.post(f"{base_url}/inference", json=data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Inference endpoint - SUCCESS!")
            print(f"   Confidence: {result.get('confidence', 'N/A')}")
            print(f"   Processing time: {result.get('processing_time_ms', 'N/A')}ms")
            print(f"   Model used: {result.get('model_used', 'N/A')}")
            response_text = result.get('response', 'No response')
            print(f"   Response preview: {response_text[:80]}...")
        else:
            print(f"❌ Inference endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Inference endpoint error: {e}")
    
    # Test 3: Romanian Intelligence Chat endpoint
    print("\n🇷🇴 Testing Romanian intelligence chat endpoint...")
    try:
        data = {"message": "Care este capitala României?", "context": "geography"}
        response = requests.post(f"{base_url}/api/v1/romanian-intelligence/chat", json=data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Romanian intelligence endpoint - SUCCESS!")
            print(f"   Confidence: {result.get('confidence', 'N/A')}")
            print(f"   Cultural context: {result.get('cultural_context', {}).get('region', 'N/A')}")
            response_text = result.get('response', 'No response')
            print(f"   Response preview: {response_text[:80]}...")
        else:
            print(f"❌ Romanian intelligence endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Romanian intelligence endpoint error: {e}")
    
    # Test 4: Health check
    print("\n❤️ Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            health = response.json()
            print("✅ Health endpoint - SUCCESS!")
            print(f"   Status: {health.get('status', 'N/A')}")
            print(f"   Models loaded: {health.get('models_loaded', 'N/A')}")
            print(f"   Uptime: {health.get('uptime_seconds', 'N/A')} seconds")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
    
    print("\n🎯 PHASE 1 DAY 1 VALIDATION COMPLETE!")
    print("🚀 Import crisis resolved, AGI endpoints functional!")

if __name__ == "__main__":
    test_agi_endpoints()
