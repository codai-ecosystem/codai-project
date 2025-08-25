#!/usr/bin/env python3
"""
Simple RUAGA System Test
Quick validation of key endpoints
"""

import requests
import json
import time

def test_endpoint(url, description):
    """Test a simple endpoint"""
    try:
        start_time = time.time()
        response = requests.get(url, timeout=10)
        elapsed = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {description}: OK ({elapsed:.1f}ms)")
            return True, result
        else:
            print(f"❌ {description}: HTTP {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ {description}: {str(e)}")
        return False, None

def test_reasoning(query, capability):
    """Test reasoning endpoint"""
    try:
        start_time = time.time()
        response = requests.post(
            "http://localhost:6101/agi/reason",
            json={
                "query": query,
                "capability": capability
            },
            timeout=10
        )
        elapsed = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {capability.title()} reasoning: '{result.get('result', 'No result')}' ({elapsed:.1f}ms)")
            return True, result
        else:
            print(f"❌ {capability.title()} reasoning: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ {capability.title()} reasoning: {str(e)}")
        return False, None

def main():
    print("🚀 RUAGA System Quick Test")
    print("=" * 40)
    
    # Basic endpoints
    health_ok, health_result = test_endpoint("http://localhost:6101/health", "Health Check")
    models_ok, models_result = test_endpoint("http://localhost:6101/models", "Models List")
    capabilities_ok, cap_result = test_endpoint("http://localhost:6101/agi/capabilities", "AGI Capabilities")
    
    print("\n🧠 Reasoning Tests")
    print("-" * 20)
    
    # Reasoning tests
    math_ok, math_result = test_reasoning("What is 2+2?", "mathematical")
    prog_ok, prog_result = test_reasoning("Write a simple Python function", "programming")
    logic_ok, logic_result = test_reasoning("If A implies B and B implies C, what can we conclude?", "logical")
    
    print("\n📊 Summary")
    print("-" * 20)
    
    total_tests = 6
    passed_tests = sum([health_ok, models_ok, capabilities_ok, math_ok, prog_ok, logic_ok])
    
    print(f"Passed: {passed_tests}/{total_tests} tests")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests >= 4:
        print("🏆 RUAGA System: OPERATIONAL")
    else:
        print("⚠️  RUAGA System: NEEDS ATTENTION")
    
    # Health details
    if health_result:
        print(f"\nServer Uptime: {health_result.get('uptime_seconds', 0):.1f}s")
        print(f"Models Loaded: {health_result.get('models_loaded', 0)}")
        print(f"Total Inferences: {health_result.get('total_inferences', 0)}")

if __name__ == "__main__":
    main()