#!/usr/bin/env python3
"""
EXTENDED LOAD TESTING - Docker Container Validation
==================================================

Extended load testing with concurrent users and stress testing
following Microsoft Azure ML requirements.

Author: GitHub Copilot Agent
Date: January 2025
Status: PRODUCTION VALIDATION
"""

import asyncio
import aiohttp
import time
import statistics
import json
from dataclasses import dataclass
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LoadTestResult:
    """Load test result structure"""
    test_name: str
    concurrent_users: int
    duration_seconds: int
    total_requests: int
    successful_requests: int
    avg_latency_ms: float
    p95_latency_ms: float
    requests_per_second: float
    error_rate: float

class ExtendedLoadTester:
    """Extended load testing for production validation"""
    
    def __init__(self, base_url: str = "http://localhost:6101"):
        self.base_url = base_url
        
    async def load_test_endpoint(self, endpoint_path: str, payload: dict, 
                               concurrent_users: int = 10, duration_seconds: int = 30,
                               test_name: str = "load_test") -> LoadTestResult:
        """Generic load testing function"""
        logger.info(f"🚀 Load testing {test_name}: {concurrent_users} users for {duration_seconds}s")
        
        results = []
        start_time = time.time()
        
        async def user_session(user_id: int):
            """Individual user session"""
            session_results = []
            timeout = aiohttp.ClientTimeout(total=10)
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                while time.time() - start_time < duration_seconds:
                    request_start = time.time()
                    try:
                        if payload:
                            async with session.post(
                                f"{self.base_url}{endpoint_path}",
                                json=payload,
                                headers={"Content-Type": "application/json"}
                            ) as response:
                                latency_ms = (time.time() - request_start) * 1000
                                session_results.append({
                                    'latency_ms': latency_ms,
                                    'status': response.status,
                                    'success': response.status == 200
                                })
                        else:
                            async with session.get(f"{self.base_url}{endpoint_path}") as response:
                                latency_ms = (time.time() - request_start) * 1000
                                session_results.append({
                                    'latency_ms': latency_ms,
                                    'status': response.status,
                                    'success': response.status == 200
                                })
                                
                    except Exception as e:
                        latency_ms = (time.time() - request_start) * 1000
                        session_results.append({
                            'latency_ms': latency_ms,
                            'status': 0,
                            'success': False,
                            'error': str(e)
                        })
                    
                    await asyncio.sleep(0.1)  # Prevent overwhelming
                    
            return session_results
        
        # Run concurrent user sessions
        tasks = [user_session(i) for i in range(concurrent_users)]
        user_results = await asyncio.gather(*tasks)
        
        # Flatten results
        for user_result in user_results:
            results.extend(user_result)
        
        # Calculate metrics
        total_requests = len(results)
        successful_requests = sum(1 for r in results if r['success'])
        latencies = [r['latency_ms'] for r in results]
        
        avg_latency = statistics.mean(latencies) if latencies else 0
        p95_latency = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else max(latencies, default=0)
        
        actual_duration = time.time() - start_time
        rps = total_requests / actual_duration if actual_duration > 0 else 0
        error_rate = (total_requests - successful_requests) / total_requests if total_requests > 0 else 0
        
        result = LoadTestResult(
            test_name=test_name,
            concurrent_users=concurrent_users,
            duration_seconds=int(actual_duration),
            total_requests=total_requests,
            successful_requests=successful_requests,
            avg_latency_ms=avg_latency,
            p95_latency_ms=p95_latency,
            requests_per_second=rps,
            error_rate=error_rate
        )
        
        logger.info(f"✅ {test_name}: {successful_requests}/{total_requests} success, "
                   f"{rps:.1f} RPS, {avg_latency:.2f}ms avg, {error_rate*100:.1f}% error rate")
        
        return result
    
    async def run_extended_load_tests(self) -> dict:
        """Run comprehensive load testing suite"""
        logger.info("🎯 EXTENDED LOAD TESTING - DOCKER CONTAINER VALIDATION")
        logger.info("="*80)
        
        results = []
        
        # Test 1: Health endpoint load test
        health_result = await self.load_test_endpoint(
            endpoint_path="/health",
            payload=None,
            concurrent_users=20,
            duration_seconds=30,
            test_name="Health Endpoint Load Test"
        )
        results.append(health_result)
        
        # Test 2: Romanian intelligence load test  
        romanian_result = await self.load_test_endpoint(
            endpoint_path="/api/v1/romanian-intelligence/chat",
            payload={"message": "Salut! Povestește despre România."},
            concurrent_users=10,
            duration_seconds=30,
            test_name="Romanian Intelligence Load Test"
        )
        results.append(romanian_result)
        
        # Test 3: Math processing load test
        math_result = await self.load_test_endpoint(
            endpoint_path="/math/simple",
            payload={"text": "25 * 4"},
            concurrent_users=8,
            duration_seconds=20,
            test_name="Math Processing Load Test"
        )
        results.append(math_result)
        
        # Test 4: Mixed workload stress test
        logger.info("🔥 Running mixed workload stress test...")
        
        async def mixed_workload():
            endpoints = [
                ("/health", None),
                ("/api/v1/romanian-intelligence/chat", {"message": "Explică cultura română."}),
                ("/math/simple", {"text": "100 / 5"})
            ]
            
            mixed_results = []
            for endpoint_path, payload in endpoints:
                result = await self.load_test_endpoint(
                    endpoint_path=endpoint_path,
                    payload=payload,
                    concurrent_users=5,
                    duration_seconds=15,
                    test_name=f"Mixed Workload - {endpoint_path.split('/')[-1]}"
                )
                mixed_results.append(result)
            return mixed_results
        
        mixed_results = await mixed_workload()
        results.extend(mixed_results)
        
        # Calculate overall performance metrics
        total_requests = sum(r.total_requests for r in results)
        total_successful = sum(r.successful_requests for r in results)
        overall_success_rate = total_successful / total_requests if total_requests > 0 else 0
        avg_rps = statistics.mean([r.requests_per_second for r in results])
        avg_latency = statistics.mean([r.avg_latency_ms for r in results])
        max_error_rate = max([r.error_rate for r in results])
        
        # Performance classification
        if overall_success_rate >= 0.99 and max_error_rate <= 0.01 and avg_latency <= 50:
            performance_grade = "EXCELLENT"
            production_status = "PRODUCTION READY - HIGH PERFORMANCE ✅"
        elif overall_success_rate >= 0.95 and max_error_rate <= 0.05 and avg_latency <= 100:
            performance_grade = "GOOD"
            production_status = "PRODUCTION READY ✅"
        elif overall_success_rate >= 0.90 and max_error_rate <= 0.10 and avg_latency <= 200:
            performance_grade = "ACCEPTABLE"
            production_status = "PRODUCTION READY WITH MONITORING ⚠️"
        else:
            performance_grade = "POOR"
            production_status = "NEEDS OPTIMIZATION ❌"
        
        # Generate comprehensive report
        report = {
            "load_test_summary": {
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "docker_container": "codai-romai-ml-api:6101",
                "total_test_scenarios": len(results),
                "total_requests": total_requests,
                "total_successful_requests": total_successful,
                "overall_success_rate": overall_success_rate,
                "average_rps": avg_rps,
                "average_latency_ms": avg_latency,
                "max_error_rate": max_error_rate,
                "performance_grade": performance_grade,
                "production_status": production_status
            },
            "detailed_results": [
                {
                    "test_name": r.test_name,
                    "concurrent_users": r.concurrent_users,
                    "duration_seconds": r.duration_seconds,
                    "total_requests": r.total_requests,
                    "successful_requests": r.successful_requests,
                    "success_rate": r.successful_requests / r.total_requests if r.total_requests > 0 else 0,
                    "avg_latency_ms": r.avg_latency_ms,
                    "p95_latency_ms": r.p95_latency_ms,
                    "requests_per_second": r.requests_per_second,
                    "error_rate": r.error_rate
                } for r in results
            ]
        }
        
        # Print detailed report
        print("\n" + "="*80)
        print("🎯 EXTENDED LOAD TESTING - FINAL REPORT")
        print("="*80)
        print(f"📊 OVERALL PERFORMANCE: {performance_grade}")
        print(f"🏆 STATUS: {production_status}")
        print(f"⚡ TOTAL LOAD: {total_requests} requests | SUCCESS: {total_successful} ({overall_success_rate*100:.1f}%)")
        print(f"🚀 THROUGHPUT: {avg_rps:.1f} requests/second")
        print(f"⏱️  LATENCY: {avg_latency:.2f}ms average")
        print(f"❌ ERROR RATE: {max_error_rate*100:.2f}% maximum")
        print("\n📋 LOAD TEST BREAKDOWN:")
        
        for result in results:
            success_rate = result.successful_requests / result.total_requests if result.total_requests > 0 else 0
            print(f"   • {result.test_name}:")
            print(f"     - {result.concurrent_users} concurrent users, {result.duration_seconds}s duration")
            print(f"     - {result.successful_requests}/{result.total_requests} success ({success_rate*100:.1f}%)")
            print(f"     - {result.requests_per_second:.1f} RPS, {result.avg_latency_ms:.2f}ms avg latency")
        
        print("="*80)
        
        return report

async def main():
    """Execute extended load testing"""
    tester = ExtendedLoadTester()
    
    try:
        report = await tester.run_extended_load_tests()
        
        # Save comprehensive report
        with open("extended_load_test_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"\n✅ Extended load test report saved to: extended_load_test_report.json")
        print(f"🎯 Final Performance Grade: {report['load_test_summary']['performance_grade']}")
        print(f"🏆 Production Status: {report['load_test_summary']['production_status']}")
        
    except Exception as e:
        logger.error(f"Extended load testing failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())