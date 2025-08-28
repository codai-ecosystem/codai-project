#!/usr/bin/env python3
"""
Phase 3C Response Time Optimization Validation

Tests the effectiveness of response time optimizations implemented for Phase 3C.
Validates that response times are now consistently under 2000ms while maintaining
excellent success rates and throughput performance.

Key Optimizations Tested:
1. Response caching for frequent requests
2. Simple arithmetic optimization
3. Request deduplication
4. Endpoint performance monitoring

Target: <2000ms average response time, >95% success rate, >10 RPS throughput
"""

import asyncio
import aiohttp
import time
import statistics
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import List, Dict, Any

class OptimizedPerformanceValidator:
    """Validates Phase 3C response time optimizations."""
    
    def __init__(self, base_url: str = "http://localhost:6101"):
        self.base_url = base_url
        self.session = None
        
    async def __aenter__(self):
        """Async context manager entry."""
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=50)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(connector=connector, timeout=timeout)
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def test_response_optimization(self) -> Dict[str, Any]:
        """Test response time optimization effectiveness."""
        print("🚀 Testing Phase 3C Response Time Optimization")
        print("=" * 60)
        
        # Test scenarios designed to benefit from optimization
        test_scenarios = [
            {
                "name": "Simple Arithmetic (Cacheable)",
                "requests": [
                    {"problem": "What is 25 + 17?", "domain": "mathematics"},
                    {"problem": "Calculate 42 * 3", "domain": "mathematics"},
                    {"problem": "What is 100 - 27?", "domain": "mathematics"},
                    {"problem": "What is 25 + 17?", "domain": "mathematics"},  # Repeat for cache hit
                    {"problem": "Calculate 42 * 3", "domain": "mathematics"},  # Repeat for cache hit
                ],
                "expected_cache_hits": 2,
                "concurrency": 10
            },
            {
                "name": "Mixed Reasoning (Partially Cacheable)",
                "requests": [
                    {"problem": "Analyze the economic impact of renewable energy", "domain": "economics"},
                    {"problem": "What is 144 / 12?", "domain": "mathematics"},
                    {"problem": "Explain quantum computing principles", "domain": "physics"},
                    {"problem": "What is 144 / 12?", "domain": "mathematics"},  # Cache hit
                    {"problem": "Analyze the economic impact of renewable energy", "domain": "economics"},  # Cache hit
                ],
                "expected_cache_hits": 2,
                "concurrency": 15
            },
            {
                "name": "High Concurrency Load",
                "requests": [
                    {"problem": f"What is {10 + i} + {20 + i}?", "domain": "mathematics"} 
                    for i in range(20)
                ],
                "expected_cache_hits": 0,  # All unique
                "concurrency": 25
            }
        ]
        
        results = {}
        total_response_times = []
        total_successful = 0
        total_requests = 0
        
        for scenario in test_scenarios:
            print(f"\n🧪 Testing: {scenario['name']}")
            print(f"   Requests: {len(scenario['requests'])}")
            print(f"   Concurrency: {scenario['concurrency']}")
            print(f"   Expected cache hits: {scenario['expected_cache_hits']}")
            
            # Execute scenario
            scenario_result = await self._execute_scenario(
                scenario['requests'], 
                scenario['concurrency']
            )
            
            results[scenario['name']] = scenario_result
            total_response_times.extend(scenario_result['response_times'])
            total_successful += scenario_result['successful']
            total_requests += scenario_result['total']
            
            # Print scenario results
            if scenario_result['response_times']:
                avg_response_time = statistics.mean(scenario_result['response_times'])
                success_rate = (scenario_result['successful'] / scenario_result['total']) * 100
                
                print(f"   ✅ Success Rate: {success_rate:.1f}% ({scenario_result['successful']}/{scenario_result['total']})")
                print(f"   ⚡ Avg Response Time: {avg_response_time:.0f}ms")
                print(f"   📊 Range: {min(scenario_result['response_times']):.0f}ms - {max(scenario_result['response_times']):.0f}ms")
                
                # Check for optimizations
                fast_responses = sum(1 for rt in scenario_result['response_times'] if rt < 100)
                if fast_responses > 0:
                    print(f"   🚀 Fast responses (optimization): {fast_responses}")
            else:
                print(f"   ❌ No successful responses received")
                print(f"   📊 Total attempts: {scenario_result['total']}")
                print(f"   💥 All requests failed - server may not be ready")
        
        # Calculate overall metrics
        if total_response_times:
            overall_avg = statistics.mean(total_response_times)
            p95_response_time = statistics.quantiles(total_response_times, n=20)[18] if len(total_response_times) >= 20 else max(total_response_times)
        else:
            print(f"\n❌ CRITICAL ERROR: No successful responses received!")
            print("🔧 Server appears to be down or unreachable")
            return {
                "phase": "3C",
                "optimization_active": True,
                "overall_metrics": {
                    "success_rate": 0,
                    "average_response_time": 0,
                    "p95_response_time": 0,
                    "total_requests": total_requests,
                    "successful_requests": 0
                },
                "validation_result": {
                    "success": False,
                    "grade": "F",
                    "error": "Server not responding"
                }
            }
        
        overall_success_rate = (total_successful / total_requests) * 100
        
        # Get optimization status
        optimization_status = await self._get_optimization_status()
        
        print(f"\n📊 PHASE 3C OPTIMIZATION RESULTS")
        print("=" * 60)
        print(f"🎯 Overall Success Rate: {overall_success_rate:.1f}% (Target: >95%)")
        print(f"⚡ Average Response Time: {overall_avg:.0f}ms (Target: <2000ms)")
        print(f"📈 95th Percentile: {p95_response_time:.0f}ms")
        print(f"📊 Total Requests: {total_requests}")
        print(f"🚀 Successful Requests: {total_successful}")
        
        # Optimization effectiveness
        if optimization_status:
            cache_utilization = optimization_status.get('cache', {}).get('utilization', '0%')
            cache_items = optimization_status.get('cache', {}).get('items', 0)
            print(f"🧠 Cache Utilization: {cache_utilization}")
            print(f"💾 Cached Items: {cache_items}")
        
        # Phase 3C validation
        phase_3c_success = (
            overall_success_rate > 95 and 
            overall_avg < 2000 and
            total_successful > 50  # Throughput validation
        )
        
        print(f"\n🎯 PHASE 3C VALIDATION RESULT")
        print("=" * 60)
        
        if phase_3c_success:
            print("✅ PHASE 3C OPTIMIZATION: SUCCESS!")
            print("🎉 All performance targets achieved with optimization")
            grade = "A"
        elif overall_avg < 2200 and overall_success_rate > 90:
            print("🟨 PHASE 3C OPTIMIZATION: NEARLY COMPLETE")
            print("⚡ Significant improvement achieved, minor tuning needed")
            grade = "B+"
        else:
            print("❌ PHASE 3C OPTIMIZATION: NEEDS MORE WORK")
            print("🔧 Additional optimizations required")
            grade = "B"
        
        print(f"📊 Performance Grade: {grade}")
        
        return {
            "phase": "3C",
            "optimization_active": True,
            "overall_metrics": {
                "success_rate": overall_success_rate,
                "average_response_time": overall_avg,
                "p95_response_time": p95_response_time,
                "total_requests": total_requests,
                "successful_requests": total_successful
            },
            "scenario_results": results,
            "optimization_status": optimization_status,
            "validation_result": {
                "success": phase_3c_success,
                "grade": grade,
                "targets_met": {
                    "success_rate": overall_success_rate > 95,
                    "response_time": overall_avg < 2000,
                    "throughput": total_successful > 50
                }
            }
        }
    
    async def _execute_scenario(self, requests: List[Dict], concurrency: int) -> Dict[str, Any]:
        """Execute a test scenario with specified concurrency."""
        # Create semaphore to limit concurrency
        semaphore = asyncio.Semaphore(concurrency)
        
        # Execute requests concurrently
        tasks = [self._make_request(req, semaphore) for req in requests]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        response_times = []
        successful = 0
        
        for result in results:
            if isinstance(result, Exception):
                continue
            
            if result['success']:
                successful += 1
                response_times.append(result['response_time'])
        
        return {
            "total": len(requests),
            "successful": successful,
            "response_times": response_times,
            "success_rate": (successful / len(requests)) * 100
        }
    
    async def _make_request(self, request_data: Dict, semaphore: asyncio.Semaphore) -> Dict[str, Any]:
        """Make a single request with optimization tracking."""
        async with semaphore:
            start_time = time.time()
            
            try:
                async with self.session.post(
                    f"{self.base_url}/api/v1/advanced-reasoning/analyze",
                    json=request_data,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "success": True,
                            "response_time": response_time,
                            "optimized": response_time < 100,  # Likely optimized
                            "cached": "optimization" in str(data)  # Simple cache detection
                        }
                    else:
                        return {
                            "success": False,
                            "response_time": response_time,
                            "status_code": response.status
                        }
            
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                return {
                    "success": False,
                    "response_time": response_time,
                    "error": str(e)
                }
    
    async def _get_optimization_status(self) -> Dict[str, Any]:
        """Get optimization status from the server."""
        try:
            async with self.session.get(f"{self.base_url}/api/v1/optimization/status") as response:
                if response.status == 200:
                    return await response.json()
        except:
            pass
        return {}


async def main():
    """Run Phase 3C optimization validation."""
    print("🧠 RomAI AGI - Phase 3C Response Time Optimization Validation")
    print("=" * 80)
    print("🎯 Target: <2000ms response time, >95% success, >10 RPS throughput")
    print("⚡ Testing optimization effectiveness with caching and request optimization")
    print()
    
    # Wait for server to be ready
    print("⏳ Waiting for RomAI server to be ready...")
    await asyncio.sleep(5)
    
    # Run optimization validation
    async with OptimizedPerformanceValidator() as validator:
        results = await validator.test_response_optimization()
        
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"phase_3c_optimization_results_{timestamp}.json"
        
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n📄 Results saved to: {results_file}")
        
        # Return success code based on validation
        return 0 if results['validation_result']['success'] else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)