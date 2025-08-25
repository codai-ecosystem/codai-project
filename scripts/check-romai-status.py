#!/usr/bin/env python3
"""
RomAI AGI Model Server Status Checker
Tests current system capabilities and endpoints
"""

import requests
import json
import sys

def check_romai_status():
    """Check RomAI AGI Model Server status and capabilities"""
    print("🔍 Testing RomAI AGI Model Server Status...")
    
    endpoints = [
        ("/health", "Health Check"),
        ("/status", "System Status"),
        ("/api/v1/capabilities", "Capabilities"),
        ("/code/benchmarks", "Code Benchmarks"),
        ("/api/v1/models", "Available Models"),
        ("/api/v1/performance", "Performance Metrics")
    ]
    
    base_url = "http://localhost:6101"
    results = {}
    
    for endpoint, description in endpoints:
        try:
            print(f"\n📡 Testing {description} - {base_url}{endpoint}")
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            print(f"✅ Status: {response.status_code}")
            
            # Try to parse JSON response
            try:
                json_response = response.json()
                print(f"📄 Response: {json.dumps(json_response, indent=2)}")
                results[endpoint] = {
                    "status": response.status_code,
                    "response": json_response,
                    "success": True
                }
            except:
                print(f"📄 Response: {response.text}")
                results[endpoint] = {
                    "status": response.status_code,
                    "response": response.text,
                    "success": True
                }
                
        except Exception as e:
            print(f"❌ {description} Failed: {e}")
            results[endpoint] = {
                "error": str(e),
                "success": False
            }
    
    # Summary
    print(f"\n📊 RomAI Server Status Summary:")
    working_endpoints = sum(1 for result in results.values() if result.get('success', False))
    total_endpoints = len(endpoints)
    
    print(f"✅ Working Endpoints: {working_endpoints}/{total_endpoints}")
    print(f"🔧 System Availability: {(working_endpoints/total_endpoints)*100:.1f}%")
    
    if working_endpoints > 0:
        print("🚀 RomAI AGI Model Server is partially/fully operational")
        return True
    else:
        print("❌ RomAI AGI Model Server is not responding")
        return False

if __name__ == "__main__":
    success = check_romai_status()
    sys.exit(0 if success else 1)