#!/usr/bin/env python3
"""
🧪 RomAI Phase 2.3 Quick Deployment Validation
Simplified validation test for running services

Author: RomAI Development Team
Version: 2.3.0
Date: 2025-01-27
"""

import asyncio
import aiohttp
import time
import json
from datetime import datetime
from typing import Dict, List

async def validate_deployment():
    """Quick validation of Phase 2.3 deployment"""
    
    print("🚀 RomAI Phase 2.3 Quick Deployment Validation")
    print("=" * 60)
    
    # Service endpoints to test
    services = {
        "CBD Database": "http://localhost:4180/health",
        "MemorAI MCP": "http://localhost:4950/health", 
        "RomAI AGI": "http://localhost:6101/health",
        "Enterprise API": "http://localhost:8001/api/v1/health",
        "MemorAI GraphQL": "http://localhost:4500/health",
        "Frontend App": "http://localhost:6100/api/health"
    }
    
    results = {}
    total_tests = len(services)
    passed_tests = 0
    
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
        
        for service_name, url in services.items():
            print(f"🔍 Testing {service_name}...")
            
            try:
                start_time = time.time()
                async with session.get(url) as response:
                    duration = time.time() - start_time
                    
                    if response.status == 200:
                        try:
                            data = await response.json()
                            results[service_name] = {
                                "status": "✅ PASS",
                                "response_time": f"{duration*1000:.1f}ms",
                                "data": data
                            }
                            passed_tests += 1
                            print(f"   ✅ {service_name}: OK ({duration*1000:.1f}ms)")
                        except:
                            results[service_name] = {
                                "status": "✅ PASS", 
                                "response_time": f"{duration*1000:.1f}ms",
                                "data": "Non-JSON response"
                            }
                            passed_tests += 1
                            print(f"   ✅ {service_name}: OK ({duration*1000:.1f}ms)")
                    else:
                        results[service_name] = {
                            "status": f"❌ FAIL (HTTP {response.status})",
                            "response_time": f"{duration*1000:.1f}ms",
                            "data": None
                        }
                        print(f"   ❌ {service_name}: HTTP {response.status}")
                        
            except asyncio.TimeoutError:
                results[service_name] = {
                    "status": "❌ TIMEOUT",
                    "response_time": "30s+",
                    "data": None
                }
                print(f"   ❌ {service_name}: Timeout")
                
            except Exception as e:
                results[service_name] = {
                    "status": f"❌ ERROR ({str(e)})",
                    "response_time": "N/A",
                    "data": None
                }
                print(f"   ❌ {service_name}: {str(e)}")
    
    print("\n" + "=" * 60)
    print("📊 VALIDATION SUMMARY")
    print("=" * 60)
    
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"🎯 Success Rate: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
    
    if success_rate >= 90:
        print("✅ Status: EXCELLENT - Ready for production")
        status_emoji = "✅"
    elif success_rate >= 75:
        print("⚠️ Status: GOOD - Minor issues detected")
        status_emoji = "⚠️"
    elif success_rate >= 50:
        print("🔧 Status: NEEDS WORK - Several services down")
        status_emoji = "🔧"
    else:
        print("❌ Status: CRITICAL - Major deployment issues")
        status_emoji = "❌"
    
    print("\n📝 Detailed Results:")
    for service, result in results.items():
        print(f"   {result['status']} {service} ({result['response_time']})")
    
    # Test enterprise functionality if API is available
    if "Enterprise API" in results and "PASS" in results["Enterprise API"]["status"]:
        print("\n🏢 Testing Enterprise Features...")
        await test_enterprise_features(session)
    
    # Test AGI functionality if available
    if "RomAI AGI" in results and "PASS" in results["RomAI AGI"]["status"]:
        print("\n🧠 Testing AGI Capabilities...")
        await test_agi_features(session)
    
    # Generate quick report
    report = {
        "timestamp": datetime.now().isoformat(),
        "success_rate": success_rate,
        "status": status_emoji,
        "services_tested": total_tests,
        "services_passed": passed_tests,
        "results": results
    }
    
    with open("quick_validation_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📋 Report saved to: quick_validation_report.json")
    print("🏁 Validation Complete!")
    
    return success_rate >= 75

async def test_enterprise_features(session):
    """Test enterprise API features"""
    
    try:
        # Test compliance endpoint
        async with session.get(
            "http://localhost:8001/api/v1/compliance/status",
            headers={"X-API-Key": "romai_gTPuSTeViI8-wn1Ru45P6BIXpesKLiubsSQSnmRHXLA"}
        ) as response:
            if response.status == 200:
                data = await response.json()
                print(f"   ✅ EU AI Act Compliance: {data.get('status', 'Unknown')}")
            else:
                print(f"   ⚠️ Compliance endpoint: HTTP {response.status}")
    except Exception as e:
        print(f"   ❌ Enterprise features test failed: {e}")

async def test_agi_features(session):
    """Test AGI model capabilities"""
    
    try:
        # Test basic inference
        payload = {
            "text": "Test Romanian AGI capability",
            "model": "romai-103m",
            "max_tokens": 20
        }
        
        async with session.post(
            "http://localhost:6101/api/v1/inference",
            json=payload
        ) as response:
            if response.status == 200:
                data = await response.json()
                print(f"   ✅ AGI Inference: Success")
                if "response" in data:
                    print(f"   💬 Sample: {data['response'][:50]}...")
            else:
                print(f"   ⚠️ AGI inference: HTTP {response.status}")
    except Exception as e:
        print(f"   ❌ AGI features test failed: {e}")

if __name__ == "__main__":
    try:
        success = asyncio.run(validate_deployment())
        exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Validation error: {e}")
        exit(2)
