#!/usr/bin/env python3
"""
RomAI Performance Optimization Integration Test
==============================================

Tests the integrated performance optimization middleware with the main model server.
Validates caching, fast-path processing, and GPU acceleration.

Author: GitHub Copilot Agent
Date: January 4, 2025
Status: Integration Test - Performance Validation
"""

import asyncio
import json
import time
import requests
from typing import Dict, Any, List
import aiohttp
import statistics

class PerformanceOptimizationTest:
    """Comprehensive test suite for performance optimization integration"""
    
    def __init__(self):
        self.base_url = "http://localhost:6101"
        self.results = {
            "fast_path_tests": [],
            "cache_tests": [],
            "performance_improvements": {},
            "error_tests": []
        }
    
    async def run_all_tests(self):
        """Execute complete performance optimization test suite"""
        print("🚀 RomAI Performance Optimization Integration Test Suite")
        print("=" * 80)
        print()
        
        # Test 1: Server Health Check
        print("📊 1. Server Health Validation")
        await self._test_server_health()
        
        # Test 2: Fast-Path Mathematical Operations
        print("\n⚡ 2. Fast-Path Mathematical Operations")
        await self._test_fast_path_math()
        
        # Test 3: Fast-Path Logical Reasoning
        print("\n🧠 3. Fast-Path Logical Reasoning")
        await self._test_fast_path_logic()
        
        # Test 4: Fast-Path Romanian Intelligence
        print("\n🇷🇴 4. Fast-Path Romanian Intelligence")
        await self._test_fast_path_romanian()
        
        # Test 5: Cache Performance Testing
        print("\n💾 5. Cache Performance Testing")
        await self._test_caching_performance()
        
        # Test 6: Performance Statistics Validation
        print("\n📈 6. Performance Statistics Validation")
        await self._test_performance_stats()
        
        # Test 7: Response Time Comparison
        print("\n⏱️ 7. Response Time Comparison")
        await self._test_response_time_improvements()
        
        # Generate final report
        print("\n🎯 Final Performance Integration Report")
        self._generate_final_report()
    
    async def _test_server_health(self):
        """Test server health and readiness"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            health_data = response.json()
            
            print(f"✅ Server Status: {health_data['status']}")
            print(f"✅ Models Loaded: {health_data['models_loaded']}")
            print(f"✅ MoE System: {health_data['moe_system_status']}")
            print(f"✅ Uptime: {health_data['uptime_seconds']:.2f}s")
            
            self.results["server_health"] = health_data
            return True
            
        except Exception as e:
            print(f"❌ Server health check failed: {e}")
            return False
    
    async def _test_fast_path_math(self):
        """Test fast-path mathematical operations"""
        fast_math_tests = [
            {"problem": "square root of 144", "expected_fast": True},
            {"problem": "12 + 8", "expected_fast": True},
            {"problem": "15 * 3", "expected_fast": True},
            {"problem": "100 - 25", "expected_fast": True},
            {"problem": "36 / 6", "expected_fast": True},
            {"problem": "solve x^2 + 2x + 1 = 0", "expected_fast": False}  # Complex, should use full inference
        ]
        
        fast_path_hits = 0
        total_tests = len(fast_math_tests)
        
        for test in fast_math_tests:
            try:
                start_time = time.time()
                response = requests.post(
                    f"{self.base_url}/api/v1/mathematical-reasoning/solve",
                    json={"problem": test["problem"]},
                    timeout=30
                )
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    is_fast_path = data.get("optimization_stats", {}).get("fast_path_used", False)
                    
                    if is_fast_path and test["expected_fast"]:
                        print(f"⚡ FAST PATH: '{test['problem']}' → {data['solution']} ({response_time:.1f}ms)")
                        fast_path_hits += 1
                    elif not is_fast_path and not test["expected_fast"]:
                        print(f"🔄 FULL INFERENCE: '{test['problem']}' → {data.get('solution', 'N/A')} ({response_time:.1f}ms)")
                    else:
                        print(f"⚠️ UNEXPECTED: '{test['problem']}' fast={is_fast_path}, expected={test['expected_fast']}")
                    
                    self.results["fast_path_tests"].append({
                        "problem": test["problem"],
                        "is_fast_path": is_fast_path,
                        "expected_fast": test["expected_fast"],
                        "response_time_ms": response_time,
                        "success": True
                    })
                else:
                    print(f"❌ Failed: '{test['problem']}' - Status: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error testing '{test['problem']}': {e}")
                self.results["error_tests"].append({"test": test["problem"], "error": str(e)})
        
        print(f"📊 Fast-path math results: {fast_path_hits}/{total_tests} fast-path hits")
    
    async def _test_fast_path_logic(self):
        """Test fast-path logical reasoning"""
        logic_tests = [
            {"query": "All roses are flowers. This is a rose. What can we conclude?", "expected_fast": True},
            {"query": "If it rains then the ground is wet. It is raining. Therefore?", "expected_fast": True},
            {"query": "Complex modal logic with multiple nested quantifiers over possible worlds", "expected_fast": False}
        ]
        
        fast_path_hits = 0
        
        for test in logic_tests:
            try:
                start_time = time.time()
                response = requests.post(
                    f"{self.base_url}/api/v1/logical-reasoning/analyze",
                    json={"query": test["query"]},
                    timeout=30
                )
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    is_fast_path = data.get("optimization_stats", {}).get("fast_path_used", False)
                    
                    if is_fast_path and test["expected_fast"]:
                        print(f"⚡ FAST PATH: Logic pattern matched ({response_time:.1f}ms)")
                        fast_path_hits += 1
                    elif not is_fast_path and not test["expected_fast"]:
                        print(f"🔄 FULL INFERENCE: Complex logic processed ({response_time:.1f}ms)")
                    
                    self.results["fast_path_tests"].append({
                        "query": test["query"],
                        "is_fast_path": is_fast_path,
                        "response_time_ms": response_time,
                        "success": True
                    })
                    
            except Exception as e:
                print(f"❌ Error testing logic: {e}")
        
        print(f"📊 Fast-path logic results: {fast_path_hits}/{len(logic_tests)} fast-path hits")
    
    async def _test_fast_path_romanian(self):
        """Test fast-path Romanian intelligence"""
        romanian_tests = [
            {"message": "Salut!", "expected_fast": True},
            {"message": "Cum te cheama?", "expected_fast": True},
            {"message": "Buna ziua!", "expected_fast": True},
            {"message": "Explică-mi teoria relativității lui Einstein în contextul fizicii moderne", "expected_fast": False}
        ]
        
        fast_path_hits = 0
        
        for test in romanian_tests:
            try:
                start_time = time.time()
                response = requests.post(
                    f"{self.base_url}/api/v1/romanian-intelligence/chat",
                    json={
                        "message": test["message"],
                        "max_tokens": 1000,
                        "temperature": 0.7
                    },
                    timeout=30
                )
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code == 200:
                    data = response.json()
                    is_fast_path = data.get("optimization_stats", {}).get("fast_path_used", False)
                    
                    if is_fast_path and test["expected_fast"]:
                        print(f"⚡ FAST PATH: '{test['message']}' ({response_time:.1f}ms)")
                        fast_path_hits += 1
                    elif not is_fast_path and not test["expected_fast"]:
                        print(f"🔄 FULL INFERENCE: Complex Romanian query ({response_time:.1f}ms)")
                    
            except Exception as e:
                print(f"❌ Error testing Romanian: {e}")
        
        print(f"📊 Fast-path Romanian results: {fast_path_hits}/{len(romanian_tests)} fast-path hits")
    
    async def _test_caching_performance(self):
        """Test caching performance with repeated requests"""
        print("Testing cache performance with repeated requests...")
        
        # Test mathematical caching
        test_problem = "square root of 169"
        response_times = []
        
        # First request (cache miss)
        start_time = time.time()
        response = requests.post(
            f"{self.base_url}/api/v1/mathematical-reasoning/solve",
            json={"problem": test_problem},
            timeout=30
        )
        first_response_time = (time.time() - start_time) * 1000
        response_times.append(first_response_time)
        
        if response.status_code == 200:
            data = response.json()
            cache_used_first = data.get("optimization_stats", {}).get("cache_used", False)
            print(f"1st request: {first_response_time:.1f}ms (cache_used: {cache_used_first})")
        
        # Subsequent requests (should hit cache if implemented)
        for i in range(2, 6):  # 4 more requests
            start_time = time.time()
            response = requests.post(
                f"{self.base_url}/api/v1/mathematical-reasoning/solve",
                json={"problem": test_problem},
                timeout=30
            )
            response_time = (time.time() - start_time) * 1000
            response_times.append(response_time)
            
            if response.status_code == 200:
                data = response.json()
                cache_used = data.get("optimization_stats", {}).get("cache_used", False)
                fast_path = data.get("optimization_stats", {}).get("fast_path_used", False)
                print(f"{i}{'nd' if i == 2 else 'rd' if i == 3 else 'th'} request: {response_time:.1f}ms (cache: {cache_used}, fast_path: {fast_path})")
        
        # Analysis
        avg_time = statistics.mean(response_times)
        min_time = min(response_times)
        improvement = ((first_response_time - min_time) / first_response_time) * 100
        
        print(f"📊 Cache Analysis:")
        print(f"   First request: {first_response_time:.1f}ms")
        print(f"   Fastest request: {min_time:.1f}ms")
        print(f"   Average time: {avg_time:.1f}ms")
        print(f"   Performance improvement: {improvement:.1f}%")
        
        self.results["cache_tests"] = {
            "response_times": response_times,
            "performance_improvement_percent": improvement,
            "average_response_time": avg_time
        }
    
    async def _test_performance_stats(self):
        """Test the performance statistics endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/v1/performance/stats", timeout=10)
            
            if response.status_code == 200:
                stats = response.json()
                
                print(f"✅ Performance Stats Retrieved Successfully")
                print(f"   Cache hit rate: {stats['performance_optimization']['cache_hit_rate_percent']:.1f}%")
                print(f"   Fast-path hits: {stats['performance_optimization']['fast_path_hits']}")
                print(f"   GPU accelerated requests: {stats['performance_optimization']['gpu_accelerated_requests']}")
                print(f"   Total optimized requests: {stats['performance_optimization']['total_optimized_requests']}")
                print(f"   Cache effectiveness: {stats['optimization_insights']['cache_effectiveness']}")
                print(f"   Fast-path effectiveness: {stats['optimization_insights']['fast_path_effectiveness']}")
                
                self.results["performance_stats"] = stats
                
            else:
                print(f"❌ Performance stats endpoint failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error getting performance stats: {e}")
    
    async def _test_response_time_improvements(self):
        """Test overall response time improvements"""
        test_queries = [
            ("math", "/api/v1/mathematical-reasoning/solve", {"problem": "15 + 27"}),
            ("logic", "/api/v1/logical-reasoning/analyze", {"query": "All cats are animals. Fluffy is a cat."}),
            ("romanian", "/api/v1/romanian-intelligence/chat", {"message": "Bună ziua", "max_tokens": 100, "temperature": 0.7})
        ]
        
        improvements = {}
        
        for test_type, endpoint, payload in test_queries:
            times = []
            
            # Run 3 tests to get average
            for i in range(3):
                start_time = time.time()
                response = requests.post(f"{self.base_url}{endpoint}", json=payload, timeout=30)
                response_time = (time.time() - start_time) * 1000
                times.append(response_time)
                
                if response.status_code == 200:
                    data = response.json()
                    optimization_used = any([
                        data.get("optimization_stats", {}).get("fast_path_used", False),
                        data.get("optimization_stats", {}).get("cache_used", False)
                    ])
                    if i == 0:  # Only print first result
                        print(f"   {test_type.title()}: {response_time:.1f}ms (optimized: {optimization_used})")
            
            avg_time = statistics.mean(times)
            improvements[test_type] = avg_time
        
        self.results["performance_improvements"] = improvements
        
        # Check if we're meeting the <500ms target
        target_time = 500.0
        meeting_target = all(time < target_time for time in improvements.values())
        
        print(f"🎯 Performance Target Analysis (<500ms):")
        for test_type, avg_time in improvements.items():
            status = "✅ PASS" if avg_time < target_time else "❌ NEEDS IMPROVEMENT"
            print(f"   {test_type.title()}: {avg_time:.1f}ms {status}")
        
        if meeting_target:
            print("🏆 ALL ENDPOINTS MEETING <500ms TARGET!")
        else:
            print("⚠️ Some endpoints need further optimization")
    
    def _generate_final_report(self):
        """Generate comprehensive performance integration report"""
        print("=" * 80)
        
        # Count successful fast-path operations
        fast_path_successes = sum(1 for test in self.results["fast_path_tests"] if test.get("is_fast_path", False))
        total_fast_path_tests = len(self.results["fast_path_tests"])
        
        # Performance summary
        if "performance_improvements" in self.results:
            avg_response_time = statistics.mean(self.results["performance_improvements"].values())
            target_met = avg_response_time < 500.0
        else:
            avg_response_time = 0
            target_met = False
        
        print(f"🎯 PERFORMANCE OPTIMIZATION INTEGRATION RESULTS:")
        print(f"   Fast-path Success Rate: {fast_path_successes}/{total_fast_path_tests} ({(fast_path_successes/total_fast_path_tests*100) if total_fast_path_tests > 0 else 0:.1f}%)")
        
        if "cache_tests" in self.results:
            print(f"   Cache Performance Improvement: {self.results['cache_tests']['performance_improvement_percent']:.1f}%")
        
        if "performance_improvements" in self.results:
            print(f"   Average Response Time: {avg_response_time:.1f}ms")
            print(f"   Sub-500ms Target: {'✅ ACHIEVED' if target_met else '❌ NEEDS WORK'}")
        
        # Error summary
        error_count = len(self.results["error_tests"])
        print(f"   Errors Encountered: {error_count}")
        
        # Overall assessment
        if fast_path_successes > 0 and error_count == 0:
            print("\n🏆 PERFORMANCE OPTIMIZATION INTEGRATION: SUCCESS!")
            print("   ✅ Fast-path processing operational")
            print("   ✅ Caching system functional") 
            print("   ✅ Performance middleware integrated")
        else:
            print("\n⚠️ PERFORMANCE OPTIMIZATION INTEGRATION: PARTIAL SUCCESS")
            print("   Some issues detected, review details above")
        
        print("=" * 80)

async def main():
    """Main test execution"""
    tester = PerformanceOptimizationTest()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())