#!/usr/bin/env python3
"""
RomAI AGI Production Load Testing Script
=======================================

Comprehensive load testing for production deployment validation.
Simulates real-world traffic patterns and stress tests all AGI capabilities.

Author: GitHub Copilot Agent
Date: August 5, 2025
Purpose: Day 4 Production Deployment Load Testing
"""

import asyncio
import random
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, asdict
import httpx
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import matplotlib.pyplot as plt

@dataclass
class LoadTestConfig:
    """Configuration for load testing scenarios"""
    base_url: str = "http://localhost:8000"
    duration_seconds: int = 300  # 5 minutes
    max_concurrent_users: int = 50
    ramp_up_time: int = 60  # seconds to reach max users
    scenarios: Dict[str, float] = None  # scenario weights
    
    def __post_init__(self):
        if self.scenarios is None:
            self.scenarios = {
                "basic_health_check": 0.30,
                "inference_requests": 0.25,
                "intelligence_queries": 0.20,
                "training_monitoring": 0.15,
                "capability_assessment": 0.10
            }

@dataclass
class TrafficPattern:
    """Traffic pattern definition"""
    name: str
    base_rps: float  # requests per second
    peak_multiplier: float
    pattern_type: str  # "constant", "spike", "gradual", "random"
    duration: int

class LoadTestScenario:
    """Individual load test scenario"""
    
    def __init__(self, name: str, weight: float, endpoint: str, method: str = "GET", data: Any = None):
        self.name = name
        self.weight = weight
        self.endpoint = endpoint
        self.method = method
        self.data = data
        self.success_count = 0
        self.failure_count = 0
        self.response_times = []
        self.error_messages = []

@dataclass
class LoadTestResult:
    """Load test execution result"""
    scenario: str
    timestamp: datetime
    response_time: float
    status_code: int
    success: bool
    user_id: int
    error_message: str = None

class RomAIAGILoadTester:
    """
    Comprehensive load testing system for RomAI AGI
    """
    
    def __init__(self, config: LoadTestConfig):
        self.config = config
        self.results: List[LoadTestResult] = []
        self.active_users = 0
        self.start_time = None
        self.end_time = None
        
        # Define test scenarios
        self.scenarios = {
            "basic_health_check": LoadTestScenario(
                "basic_health_check", 0.30, "/health", "GET"
            ),
            "inference_requests": LoadTestScenario(
                "inference_requests", 0.25, "/inference", "POST",
                {
                    "text": "Salutare! Povestește-mi despre cultura românească și tradițiile sale.",
                    "max_length": 150,
                    "temperature": 0.7
                }
            ),
            "intelligence_queries": LoadTestScenario(
                "intelligence_queries", 0.20, "/intelligence/romanian_reasoning", "POST",
                {
                    "query": "Cum influențează tehnologia viitorul educației în România?",
                    "cultural_depth": "deep"
                }
            ),
            "training_monitoring": LoadTestScenario(
                "training_monitoring", 0.15, "/training/metrics", "GET"
            ),
            "capability_assessment": LoadTestScenario(
                "capability_assessment", 0.10, "/capability_scores", "GET"
            )
        }
        
        # Traffic patterns for different test phases
        self.traffic_patterns = [
            TrafficPattern("warm_up", 5.0, 1.0, "constant", 30),
            TrafficPattern("ramp_up", 10.0, 3.0, "gradual", 60),
            TrafficPattern("steady_load", 20.0, 1.0, "constant", 120),
            TrafficPattern("peak_traffic", 30.0, 2.0, "spike", 60),
            TrafficPattern("cool_down", 10.0, 0.5, "gradual", 30)
        ]
        
        print(f"🚀 RomAI AGI Load Tester initialized")
        print(f"⏱️  Test duration: {config.duration_seconds}s")
        print(f"👥 Max concurrent users: {config.max_concurrent_users}")
    
    async def execute_scenario(self, scenario: LoadTestScenario, user_id: int, client: httpx.AsyncClient) -> LoadTestResult:
        """Execute a single test scenario"""
        start_time = time.time()
        timestamp = datetime.now()
        
        try:
            url = f"{self.config.base_url}{scenario.endpoint}"
            
            if scenario.method == "GET":
                response = await client.get(url)
            else:
                # Add some variation to POST data
                data = scenario.data.copy() if scenario.data else {}
                if "text" in data:
                    # Vary the text slightly for more realistic testing
                    variations = [
                        "Explică importanța culturii românești în contextul global.",
                        "Povestește despre tradițiile și obiceiurile românești.",
                        "Cum se dezvoltă tehnologia în România?",
                        "Care sunt provocările societății românești moderne?",
                        "Descrie frumusețea peisajelor românești."
                    ]
                    data["text"] = random.choice(variations)
                
                response = await client.post(url, json=data)
            
            response_time = time.time() - start_time
            success = response.status_code == 200
            
            if success:
                scenario.success_count += 1
            else:
                scenario.failure_count += 1
                scenario.error_messages.append(f"HTTP {response.status_code}")
            
            scenario.response_times.append(response_time)
            
            return LoadTestResult(
                scenario=scenario.name,
                timestamp=timestamp,
                response_time=response_time,
                status_code=response.status_code,
                success=success,
                user_id=user_id,
                error_message=None if success else f"HTTP {response.status_code}"
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            scenario.failure_count += 1
            error_msg = str(e)
            scenario.error_messages.append(error_msg)
            
            return LoadTestResult(
                scenario=scenario.name,
                timestamp=timestamp,
                response_time=response_time,
                status_code=0,
                success=False,
                user_id=user_id,
                error_message=error_msg
            )
    
    def select_scenario(self) -> LoadTestScenario:
        """Select a scenario based on weights"""
        scenarios = list(self.scenarios.values())
        weights = [s.weight for s in scenarios]
        return random.choices(scenarios, weights=weights)[0]
    
    def calculate_target_rps(self, pattern: TrafficPattern, elapsed_time: float) -> float:
        """Calculate target requests per second based on traffic pattern"""
        if pattern.pattern_type == "constant":
            return pattern.base_rps
        
        elif pattern.pattern_type == "gradual":
            # Gradual increase/decrease
            progress = min(elapsed_time / pattern.duration, 1.0)
            return pattern.base_rps * (1 + (pattern.peak_multiplier - 1) * progress)
        
        elif pattern.pattern_type == "spike":
            # Spike in the middle
            progress = elapsed_time / pattern.duration
            spike_factor = np.sin(progress * np.pi) * pattern.peak_multiplier
            return pattern.base_rps + spike_factor
        
        elif pattern.pattern_type == "random":
            # Random variation around base
            variation = random.uniform(0.5, pattern.peak_multiplier)
            return pattern.base_rps * variation
        
        return pattern.base_rps
    
    async def user_simulation(self, user_id: int, client: httpx.AsyncClient, duration: int):
        """Simulate a single user's behavior"""
        user_start_time = time.time()
        
        while time.time() - user_start_time < duration:
            try:
                # Select and execute scenario
                scenario = self.select_scenario()
                result = await self.execute_scenario(scenario, user_id, client)
                self.results.append(result)
                
                # Random think time between requests (0.5-3 seconds)
                think_time = random.uniform(0.5, 3.0)
                await asyncio.sleep(think_time)
                
            except Exception as e:
                print(f"❌ User {user_id} error: {e}")
                await asyncio.sleep(1)
    
    async def ramp_up_users(self, max_users: int, ramp_time: int, test_duration: int):
        """Gradually ramp up users over time"""
        users_per_second = max_users / ramp_time
        active_tasks = []
        
        for second in range(ramp_time):
            # Calculate how many users to add this second
            target_users = int((second + 1) * users_per_second)
            users_to_add = target_users - len(active_tasks)
            
            # Start new user simulations
            for i in range(users_to_add):
                user_id = len(active_tasks) + i + 1
                client = httpx.AsyncClient(timeout=30)
                
                # Calculate remaining test time
                remaining_time = test_duration - second
                task = asyncio.create_task(
                    self.user_simulation(user_id, client, remaining_time)
                )
                active_tasks.append(task)
            
            self.active_users = len(active_tasks)
            
            if second % 10 == 0:  # Log every 10 seconds
                print(f"👥 Active users: {self.active_users}/{max_users}")
            
            await asyncio.sleep(1)
        
        # Wait for all users to complete
        print(f"⏱️  Waiting for {len(active_tasks)} users to complete...")
        await asyncio.gather(*active_tasks, return_exceptions=True)
        
        # Cleanup clients
        for task in active_tasks:
            if not task.done():
                task.cancel()
    
    async def execute_traffic_pattern_load_test(self):
        """Execute load test following predefined traffic patterns"""
        print("🚀 Starting traffic pattern-based load test...")
        self.start_time = datetime.now()
        
        for pattern in self.traffic_patterns:
            print(f"\n📈 Starting {pattern.name} phase ({pattern.duration}s)")
            pattern_start = time.time()
            
            # Calculate concurrent users based on pattern
            base_users = int(pattern.base_rps * 2)  # Rough estimation
            max_users = min(int(base_users * pattern.peak_multiplier), self.config.max_concurrent_users)
            
            # Execute this pattern phase
            await self.ramp_up_users(max_users, pattern.duration // 3, pattern.duration)
            
            pattern_elapsed = time.time() - pattern_start
            print(f"✅ {pattern.name} completed in {pattern_elapsed:.1f}s")
        
        self.end_time = datetime.now()
        print("\n🎉 Load test completed!")
    
    async def execute_standard_load_test(self):
        """Execute standard load test with gradual ramp-up"""
        print("🚀 Starting standard load test...")
        self.start_time = datetime.now()
        
        await self.ramp_up_users(
            self.config.max_concurrent_users,
            self.config.ramp_up_time,
            self.config.duration_seconds
        )
        
        self.end_time = datetime.now()
        print("🎉 Load test completed!")
    
    def analyze_results(self) -> Dict[str, Any]:
        """Analyze load test results"""
        if not self.results:
            return {"error": "No results to analyze"}
        
        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r.success)
        failed_requests = total_requests - successful_requests
        
        response_times = [r.response_time for r in self.results if r.success]
        
        # Calculate metrics by scenario
        scenario_metrics = {}
        for scenario_name, scenario in self.scenarios.items():
            scenario_results = [r for r in self.results if r.scenario == scenario_name]
            
            if scenario_results:
                scenario_response_times = [r.response_time for r in scenario_results if r.success]
                scenario_metrics[scenario_name] = {
                    "total_requests": len(scenario_results),
                    "successful_requests": sum(1 for r in scenario_results if r.success),
                    "success_rate": sum(1 for r in scenario_results if r.success) / len(scenario_results),
                    "avg_response_time": np.mean(scenario_response_times) if scenario_response_times else 0,
                    "p95_response_time": np.percentile(scenario_response_times, 95) if scenario_response_times else 0
                }
        
        # Overall metrics
        test_duration = (self.end_time - self.start_time).total_seconds()
        throughput = successful_requests / test_duration if test_duration > 0 else 0
        
        analysis = {
            "test_summary": {
                "duration": test_duration,
                "total_requests": total_requests,
                "successful_requests": successful_requests,
                "failed_requests": failed_requests,
                "success_rate": successful_requests / total_requests,
                "error_rate": failed_requests / total_requests,
                "throughput": throughput
            },
            
            "response_time_analysis": {
                "average": np.mean(response_times) if response_times else 0,
                "median": np.median(response_times) if response_times else 0,
                "p95": np.percentile(response_times, 95) if response_times else 0,
                "p99": np.percentile(response_times, 99) if response_times else 0,
                "min": np.min(response_times) if response_times else 0,
                "max": np.max(response_times) if response_times else 0
            },
            
            "scenario_analysis": scenario_metrics,
            
            "load_characteristics": {
                "peak_concurrent_users": self.config.max_concurrent_users,
                "ramp_up_time": self.config.ramp_up_time,
                "average_concurrent_users": self.config.max_concurrent_users / 2
            }
        }
        
        return analysis
    
    def generate_report(self, analysis: Dict[str, Any], output_file: str = None) -> str:
        """Generate comprehensive load test report"""
        if "error" in analysis:
            return f"❌ Report generation failed: {analysis['error']}"
        
        report_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        summary = analysis["test_summary"]
        response_analysis = analysis["response_time_analysis"]
        
        report = f"""
# 🚀 RomAI AGI Production Load Test Report

**Generated**: {report_time}  
**Test Duration**: {summary['duration']:.1f} seconds  
**Peak Concurrent Users**: {analysis['load_characteristics']['peak_concurrent_users']}

## 📊 Load Test Results

### Overall Performance
| Metric | Value |
|--------|--------|
| Total Requests | {summary['total_requests']:,} |
| Successful Requests | {summary['successful_requests']:,} |
| Failed Requests | {summary['failed_requests']:,} |
| Success Rate | {summary['success_rate']:.1%} |
| Error Rate | {summary['error_rate']:.1%} |
| Throughput | {summary['throughput']:.1f} RPS |

### Response Time Analysis
| Metric | Value |
|--------|--------|
| Average | {response_analysis['average']:.3f}s |
| Median | {response_analysis['median']:.3f}s |
| 95th Percentile | {response_analysis['p95']:.3f}s |
| 99th Percentile | {response_analysis['p99']:.3f}s |
| Min Response Time | {response_analysis['min']:.3f}s |
| Max Response Time | {response_analysis['max']:.3f}s |

## 🎯 Scenario Performance

"""
        
        for scenario_name, metrics in analysis["scenario_analysis"].items():
            report += f"### {scenario_name.replace('_', ' ').title()}\n"
            report += f"- Total Requests: {metrics['total_requests']:,}\n"
            report += f"- Success Rate: {metrics['success_rate']:.1%}\n"
            report += f"- Avg Response: {metrics['avg_response_time']:.3f}s\n"
            report += f"- P95 Response: {metrics['p95_response_time']:.3f}s\n\n"
        
        # Performance assessment
        report += "## 🎯 Performance Assessment\n\n"
        
        if summary['success_rate'] >= 0.99 and response_analysis['p95'] <= 0.5:
            grade = "A+ (Excellent)"
            status = "✅ Production Ready"
        elif summary['success_rate'] >= 0.95 and response_analysis['p95'] <= 1.0:
            grade = "A (Good)"
            status = "✅ Production Ready with Monitoring"
        elif summary['success_rate'] >= 0.90 and response_analysis['p95'] <= 2.0:
            grade = "B (Acceptable)"
            status = "⚠️ Needs Optimization"
        else:
            grade = "C (Poor)"
            status = "❌ Not Production Ready"
        
        report += f"**Overall Grade**: {grade}\n"
        report += f"**Production Status**: {status}\n\n"
        
        # Load test validation
        report += "## 🧪 Load Test Validation\n\n"
        report += f"- ✅ Stability Test: {'PASS' if summary['success_rate'] >= 0.95 else 'FAIL'}\n"
        report += f"- ✅ Performance Test: {'PASS' if response_analysis['p95'] <= 1.0 else 'FAIL'}\n"
        report += f"- ✅ Scalability Test: {'PASS' if summary['throughput'] >= 50 else 'FAIL'}\n"
        report += f"- ✅ Reliability Test: {'PASS' if summary['error_rate'] <= 0.01 else 'FAIL'}\n\n"
        
        # Recommendations
        report += "## 💡 Recommendations\n\n"
        
        if summary['error_rate'] > 0.05:
            report += "- ⚠️ High error rate indicates stability issues. Investigate failed requests.\n"
        if response_analysis['p95'] > 2.0:
            report += "- ⚠️ Slow response times under load. Consider performance optimization.\n"
        if summary['throughput'] < 50:
            report += "- ⚠️ Low throughput indicates capacity constraints. Consider scaling.\n"
        
        if (summary['success_rate'] >= 0.99 and 
            response_analysis['p95'] <= 0.5 and 
            summary['throughput'] >= 100):
            report += "- ✅ Excellent performance! System ready for production deployment.\n"
        
        print(report)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"📄 Report saved to {output_file}")
        
        return report

async def main():
    """Main load testing execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description="RomAI AGI Load Tester")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL for testing")
    parser.add_argument("--duration", type=int, default=300, help="Test duration in seconds")
    parser.add_argument("--users", type=int, default=50, help="Maximum concurrent users")
    parser.add_argument("--ramp-up", type=int, default=60, help="Ramp-up time in seconds")
    parser.add_argument("--pattern", action="store_true", help="Use traffic patterns")
    parser.add_argument("--output", help="Output file for report")
    
    args = parser.parse_args()
    
    config = LoadTestConfig(
        base_url=args.url,
        duration_seconds=args.duration,
        max_concurrent_users=args.users,
        ramp_up_time=args.ramp_up
    )
    
    load_tester = RomAIAGILoadTester(config)
    
    try:
        if args.pattern:
            await load_tester.execute_traffic_pattern_load_test()
        else:
            await load_tester.execute_standard_load_test()
        
        # Analyze and report results
        analysis = load_tester.analyze_results()
        load_tester.generate_report(analysis, args.output)
        
        # Print summary
        if "test_summary" in analysis:
            summary = analysis["test_summary"]
            print(f"\n🎉 Load test completed!")
            print(f"✅ Success Rate: {summary['success_rate']:.1%}")
            print(f"⚡ Throughput: {summary['throughput']:.1f} RPS")
            print(f"🕒 P95 Response: {analysis['response_time_analysis']['p95']:.3f}s")
        
    except KeyboardInterrupt:
        print("\n🛑 Load test interrupted by user")
    except Exception as e:
        print(f"❌ Load test failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
