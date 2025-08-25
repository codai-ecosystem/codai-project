#!/usr/bin/env python3
"""
RomAI AGI Production Performance Benchmarking Script
==================================================

Comprehensive performance testing and benchmarking for production deployment.
Tests all AGI capabilities under load and measures performance metrics.

Author: GitHub Copilot Agent
Date: August 5, 2025
Purpose: Day 4 Production Deployment Validation
"""

import asyncio
import time
import statistics
import json
import argparse
from datetime import datetime
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, asdict
import httpx
import matplotlib.pyplot as plt
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np

@dataclass
class BenchmarkConfig:
    """Configuration for benchmark testing"""
    base_url: str = "http://localhost:8000"
    concurrent_users: int = 10
    total_requests: int = 100
    timeout: int = 30
    warm_up_requests: int = 10
    test_duration: int = 60  # seconds

@dataclass
class TestResult:
    """Individual test result"""
    endpoint: str
    response_time: float
    status_code: int
    success: bool
    timestamp: datetime
    error_message: str = None

@dataclass
class BenchmarkResults:
    """Complete benchmark results"""
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time: float
    p95_response_time: float
    p99_response_time: float
    throughput: float  # requests per second
    error_rate: float
    test_duration: float
    endpoint_results: Dict[str, List[TestResult]]

class RomAIAGIBenchmark:
    """
    Comprehensive benchmarking suite for RomAI AGI system
    """
    
    def __init__(self, config: BenchmarkConfig):
        self.config = config
        self.client = httpx.AsyncClient(timeout=config.timeout)
        self.results: List[TestResult] = []
        
        # Test scenarios for different AGI capabilities
        self.test_scenarios = {
            "health": {
                "method": "GET",
                "endpoint": "/health",
                "data": None
            },
            "basic_inference": {
                "method": "POST", 
                "endpoint": "/inference",
                "data": {
                    "text": "Salutare! Cum pot îmbunătăți performanța aplicației?",
                    "max_length": 100,
                    "temperature": 0.7
                }
            },
            "intelligence_capabilities": {
                "method": "GET",
                "endpoint": "/intelligence/capabilities",
                "data": None
            },
            "romanian_reasoning": {
                "method": "POST",
                "endpoint": "/intelligence/romanian_reasoning", 
                "data": {
                    "query": "Explică importanța culturii românești în contextul global",
                    "cultural_depth": "deep"
                }
            },
            "training_metrics": {
                "method": "GET",
                "endpoint": "/training/metrics",
                "data": None
            },
            "capability_scores": {
                "method": "GET", 
                "endpoint": "/capabilities/scores",
                "data": None
            }
        }
        
        print(f"🚀 RomAI AGI Benchmark initialized")
        print(f"📊 Configuration: {config.concurrent_users} users, {config.total_requests} requests")
    
    async def warm_up(self):
        """Warm up the system with initial requests"""
        print("🔥 Warming up AGI system...")
        
        for _ in range(self.config.warm_up_requests):
            try:
                response = await self.client.get(f"{self.config.base_url}/health")
                if response.status_code == 200:
                    print("✅ Warm-up request successful")
                else:
                    print(f"⚠️ Warm-up request returned {response.status_code}")
            except Exception as e:
                print(f"❌ Warm-up request failed: {e}")
            
            await asyncio.sleep(0.1)
        
        print("✅ Warm-up completed")
    
    async def run_single_test(self, scenario_name: str, scenario: Dict[str, Any]) -> TestResult:
        """Run a single test scenario"""
        start_time = time.time()
        timestamp = datetime.now()
        
        try:
            url = f"{self.config.base_url}{scenario['endpoint']}"
            
            if scenario['method'] == 'GET':
                response = await self.client.get(url)
            else:
                response = await self.client.post(url, json=scenario['data'])
            
            response_time = time.time() - start_time
            success = response.status_code == 200
            
            return TestResult(
                endpoint=scenario_name,
                response_time=response_time,
                status_code=response.status_code,
                success=success,
                timestamp=timestamp,
                error_message=None if success else f"HTTP {response.status_code}"
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            return TestResult(
                endpoint=scenario_name,
                response_time=response_time,
                status_code=0,
                success=False,
                timestamp=timestamp,
                error_message=str(e)
            )
    
    async def run_concurrent_tests(self, scenario_name: str, num_requests: int) -> List[TestResult]:
        """Run concurrent tests for a specific scenario"""
        scenario = self.test_scenarios[scenario_name]
        tasks = []
        
        for _ in range(num_requests):
            task = asyncio.create_task(self.run_single_test(scenario_name, scenario))
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and convert to TestResult objects
        valid_results = []
        for result in results:
            if isinstance(result, TestResult):
                valid_results.append(result)
            else:
                # Handle exceptions as failed tests
                valid_results.append(TestResult(
                    endpoint=scenario_name,
                    response_time=0,
                    status_code=0,
                    success=False,
                    timestamp=datetime.now(),
                    error_message=str(result)
                ))
        
        return valid_results
    
    async def run_load_test(self, scenario_name: str) -> List[TestResult]:
        """Run load test for specific scenario"""
        print(f"🔄 Running load test for {scenario_name}...")
        
        requests_per_batch = self.config.total_requests // self.config.concurrent_users
        remaining_requests = self.config.total_requests % self.config.concurrent_users
        
        all_results = []
        
        # Run batches of concurrent requests
        for batch in range(self.config.concurrent_users):
            batch_size = requests_per_batch + (1 if batch < remaining_requests else 0)
            
            if batch_size > 0:
                batch_results = await self.run_concurrent_tests(scenario_name, batch_size)
                all_results.extend(batch_results)
                
                # Small delay between batches to prevent overwhelming
                await asyncio.sleep(0.1)
        
        return all_results
    
    def calculate_metrics(self, results: List[TestResult]) -> Dict[str, Any]:
        """Calculate performance metrics from test results"""
        if not results:
            return {}
        
        response_times = [r.response_time for r in results if r.success]
        successful_results = [r for r in results if r.success]
        failed_results = [r for r in results if not r.success]
        
        if not response_times:
            return {
                "total_requests": len(results),
                "successful_requests": 0,
                "failed_requests": len(results),
                "success_rate": 0.0,
                "error_rate": 1.0
            }
        
        # Calculate timing metrics
        avg_response_time = statistics.mean(response_times)
        p95_response_time = np.percentile(response_times, 95)
        p99_response_time = np.percentile(response_times, 99)
        
        # Calculate throughput (requests per second)
        if results:
            time_span = (max(r.timestamp for r in results) - min(r.timestamp for r in results)).total_seconds()
            throughput = len(successful_results) / max(time_span, 1)
        else:
            throughput = 0
        
        return {
            "total_requests": len(results),
            "successful_requests": len(successful_results),
            "failed_requests": len(failed_results),
            "success_rate": len(successful_results) / len(results),
            "error_rate": len(failed_results) / len(results),
            "avg_response_time": avg_response_time,
            "p95_response_time": p95_response_time,
            "p99_response_time": p99_response_time,
            "min_response_time": min(response_times),
            "max_response_time": max(response_times),
            "throughput": throughput,
            "response_times": response_times
        }
    
    async def run_comprehensive_benchmark(self) -> BenchmarkResults:
        """Run comprehensive benchmark across all AGI capabilities"""
        print("🚀 Starting comprehensive AGI benchmark...")
        start_time = time.time()
        
        # Warm up the system
        await self.warm_up()
        
        all_results = []
        endpoint_results = {}
        
        # Test each scenario
        for scenario_name in self.test_scenarios.keys():
            print(f"\n🧪 Testing {scenario_name}...")
            scenario_results = await self.run_load_test(scenario_name)
            all_results.extend(scenario_results)
            endpoint_results[scenario_name] = scenario_results
            
            # Calculate and display metrics for this endpoint
            metrics = self.calculate_metrics(scenario_results)
            print(f"✅ {scenario_name}: {metrics.get('success_rate', 0):.1%} success rate, "
                  f"{metrics.get('avg_response_time', 0):.3f}s avg response time")
        
        total_duration = time.time() - start_time
        
        # Calculate overall metrics
        overall_metrics = self.calculate_metrics(all_results)
        
        benchmark_results = BenchmarkResults(
            total_requests=overall_metrics.get('total_requests', 0),
            successful_requests=overall_metrics.get('successful_requests', 0),
            failed_requests=overall_metrics.get('failed_requests', 0),
            avg_response_time=overall_metrics.get('avg_response_time', 0),
            p95_response_time=overall_metrics.get('p95_response_time', 0),
            p99_response_time=overall_metrics.get('p99_response_time', 0),
            throughput=overall_metrics.get('throughput', 0),
            error_rate=overall_metrics.get('error_rate', 0),
            test_duration=total_duration,
            endpoint_results=endpoint_results
        )
        
        return benchmark_results
    
    def generate_report(self, results: BenchmarkResults, output_file: str = None):
        """Generate comprehensive benchmark report"""
        report_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        report = f"""
# 🚀 RomAI AGI Production Benchmark Report

**Generated**: {report_time}  
**Test Duration**: {results.test_duration:.2f} seconds  
**Configuration**: {self.config.concurrent_users} concurrent users, {self.config.total_requests} total requests

## 📊 Overall Performance Metrics

| Metric | Value |
|--------|--------|
| Total Requests | {results.total_requests} |
| Successful Requests | {results.successful_requests} |
| Failed Requests | {results.failed_requests} |
| Success Rate | {(1 - results.error_rate):.1%} |
| Error Rate | {results.error_rate:.1%} |
| Average Response Time | {results.avg_response_time:.3f}s |
| 95th Percentile | {results.p95_response_time:.3f}s |
| 99th Percentile | {results.p99_response_time:.3f}s |
| Throughput | {results.throughput:.1f} requests/second |

## 🎯 Performance Assessment

"""
        
        # Performance grade calculation
        success_rate = 1 - results.error_rate
        if success_rate >= 0.99 and results.p95_response_time <= 0.2:
            grade = "A+ (Excellent)"
        elif success_rate >= 0.95 and results.p95_response_time <= 0.5:
            grade = "A (Good)"
        elif success_rate >= 0.90 and results.p95_response_time <= 1.0:
            grade = "B (Acceptable)"
        else:
            grade = "C (Needs Improvement)"
        
        report += f"**Overall Grade**: {grade}\n\n"
        
        # SLO Assessment
        report += "## 🎯 SLO Compliance\n\n"
        report += f"- ✅ Uptime Target (99.9%): {'PASS' if success_rate >= 0.999 else 'FAIL'}\n"
        report += f"- ✅ Response Time Target (p95 < 200ms): {'PASS' if results.p95_response_time <= 0.2 else 'FAIL'}\n"
        report += f"- ✅ Throughput Target (>100 RPS): {'PASS' if results.throughput >= 100 else 'FAIL'}\n\n"
        
        # Endpoint-specific results
        report += "## 📈 Endpoint Performance\n\n"
        for endpoint, endpoint_results in results.endpoint_results.items():
            metrics = self.calculate_metrics(endpoint_results)
            report += f"### {endpoint.replace('_', ' ').title()}\n"
            report += f"- Success Rate: {metrics.get('success_rate', 0):.1%}\n"
            report += f"- Avg Response Time: {metrics.get('avg_response_time', 0):.3f}s\n"
            report += f"- Throughput: {metrics.get('throughput', 0):.1f} RPS\n\n"
        
        # Recommendations
        report += "## 💡 Recommendations\n\n"
        if results.error_rate > 0.01:
            report += "- ⚠️ High error rate detected. Investigate failed requests and improve error handling.\n"
        if results.p95_response_time > 0.5:
            report += "- ⚠️ Slow response times. Consider caching, connection pooling, or scaling.\n"
        if results.throughput < 100:
            report += "- ⚠️ Low throughput. Consider horizontal scaling or performance optimization.\n"
        
        if results.error_rate <= 0.001 and results.p95_response_time <= 0.2:
            report += "- ✅ Excellent performance! System is production-ready.\n"
        
        print(report)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"📄 Report saved to {output_file}")
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

async def main():
    """Main benchmark execution"""
    parser = argparse.ArgumentParser(description="RomAI AGI Production Benchmark")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL for testing")
    parser.add_argument("--users", type=int, default=10, help="Number of concurrent users")
    parser.add_argument("--requests", type=int, default=100, help="Total number of requests")
    parser.add_argument("--timeout", type=int, default=30, help="Request timeout in seconds")
    parser.add_argument("--output", help="Output file for report")
    
    args = parser.parse_args()
    
    config = BenchmarkConfig(
        base_url=args.url,
        concurrent_users=args.users,
        total_requests=args.requests,
        timeout=args.timeout
    )
    
    benchmark = RomAIAGIBenchmark(config)
    
    try:
        results = await benchmark.run_comprehensive_benchmark()
        benchmark.generate_report(results, args.output)
        
        # Print summary
        print(f"\n🎉 Benchmark completed!")
        print(f"✅ Success Rate: {(1 - results.error_rate):.1%}")
        print(f"⚡ Throughput: {results.throughput:.1f} RPS")
        print(f"🕒 P95 Response Time: {results.p95_response_time:.3f}s")
        
    except KeyboardInterrupt:
        print("\n🛑 Benchmark interrupted by user")
    except Exception as e:
        print(f"❌ Benchmark failed: {e}")
    finally:
        await benchmark.close()

if __name__ == "__main__":
    asyncio.run(main())
