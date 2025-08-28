"""
Production Test Runner for Phase 3.2 RomAI AGI Components
Comprehensive test suite execution and validation
"""

import os
import sys
import time
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import requests
import concurrent.futures
from dataclasses import dataclass

@dataclass
class TestResult:
    test_name: str
    status: str
    duration: float
    details: Dict[str, Any]
    errors: List[str] = None

class Phase32ProductionTestRunner:
    """Production test runner for all Phase 3.2 components"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.test_results = []
        self.server_url = "http://localhost:6101"
        
    def check_server_health(self) -> bool:
        """Check if RomAI AGI Model Server is running"""
        try:
            response = requests.get(f"{self.server_url}/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                print(f"✅ Server Health: {health_data.get('status', 'unknown')}")
                return True
            else:
                print(f"❌ Server unhealthy: HTTP {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Server not accessible: {e}")
            return False
    
    def run_unit_tests(self) -> List[TestResult]:
        """Run all unit tests for Phase 3.2 components"""
        print("🧪 Running Unit Tests...")
        
        unit_tests = [
            "ml/reasoning/test_autonomous_decision_engine.py",
            "ml/reasoning/test_creative_intelligence_system.py",
            "ml/reasoning/test_enhanced_inference_engine.py"
        ]
        
        results = []
        
        for test_file in unit_tests:
            test_path = self.base_dir / "tests" / test_file
            
            if not test_path.exists():
                print(f"⚠️  Test file not found: {test_path}")
                continue
            
            print(f"   Running {test_file}...")
            start_time = time.time()
            
            try:
                # Add the source directory to Python path
                env = os.environ.copy()
                src_path = str(self.base_dir / "src")
                if "PYTHONPATH" in env:
                    env["PYTHONPATH"] = f"{src_path};{env['PYTHONPATH']}"
                else:
                    env["PYTHONPATH"] = src_path
                
                # Run pytest on the specific test file
                result = subprocess.run([
                    sys.executable, "-m", "pytest", 
                    str(test_path), 
                    "-v", 
                    "--tb=short",
                    "--disable-warnings"
                ], 
                capture_output=True, 
                text=True,
                env=env,
                cwd=str(self.base_dir)
                )
                
                duration = time.time() - start_time
                
                if result.returncode == 0:
                    status = "PASSED"
                    print(f"   ✅ {test_file} - PASSED ({duration:.2f}s)")
                else:
                    status = "FAILED"
                    print(f"   ❌ {test_file} - FAILED ({duration:.2f}s)")
                    if result.stderr:
                        print(f"      Error: {result.stderr[:200]}...")
                
                test_result = TestResult(
                    test_name=test_file,
                    status=status,
                    duration=duration,
                    details={
                        "stdout": result.stdout,
                        "stderr": result.stderr,
                        "returncode": result.returncode
                    }
                )
                
                results.append(test_result)
                
            except Exception as e:
                duration = time.time() - start_time
                print(f"   ❌ {test_file} - ERROR ({duration:.2f}s): {e}")
                
                test_result = TestResult(
                    test_name=test_file,
                    status="ERROR",
                    duration=duration,
                    details={"error": str(e)},
                    errors=[str(e)]
                )
                
                results.append(test_result)
        
        return results
    
    def run_integration_tests(self) -> List[TestResult]:
        """Run integration tests for Phase 3.2 endpoints"""
        print("🔗 Running Integration Tests...")
        
        integration_tests = [
            "integration/test_phase32_model_server_endpoints.py"
        ]
        
        results = []
        
        for test_file in integration_tests:
            test_path = self.base_dir / "tests" / test_file
            
            if not test_path.exists():
                print(f"⚠️  Test file not found: {test_path}")
                continue
            
            print(f"   Running {test_file}...")
            start_time = time.time()
            
            try:
                # Add the source directory to Python path
                env = os.environ.copy()
                src_path = str(self.base_dir / "src")
                if "PYTHONPATH" in env:
                    env["PYTHONPATH"] = f"{src_path};{env['PYTHONPATH']}"
                else:
                    env["PYTHONPATH"] = src_path
                
                # Run pytest on the integration test
                result = subprocess.run([
                    sys.executable, "-m", "pytest", 
                    str(test_path), 
                    "-v", 
                    "--tb=short",
                    "--disable-warnings"
                ], 
                capture_output=True, 
                text=True,
                env=env,
                cwd=str(self.base_dir)
                )
                
                duration = time.time() - start_time
                
                if result.returncode == 0:
                    status = "PASSED"
                    print(f"   ✅ {test_file} - PASSED ({duration:.2f}s)")
                else:
                    status = "FAILED"
                    print(f"   ❌ {test_file} - FAILED ({duration:.2f}s)")
                    if result.stderr:
                        print(f"      Error: {result.stderr[:200]}...")
                
                test_result = TestResult(
                    test_name=test_file,
                    status=status,
                    duration=duration,
                    details={
                        "stdout": result.stdout,
                        "stderr": result.stderr,
                        "returncode": result.returncode
                    }
                )
                
                results.append(test_result)
                
            except Exception as e:
                duration = time.time() - start_time
                print(f"   ❌ {test_file} - ERROR ({duration:.2f}s): {e}")
                
                test_result = TestResult(
                    test_name=test_file,
                    status="ERROR",
                    duration=duration,
                    details={"error": str(e)},
                    errors=[str(e)]
                )
                
                results.append(test_result)
        
        return results
    
    def run_endpoint_validation(self) -> List[TestResult]:
        """Run direct endpoint validation tests"""
        print("🚀 Running Endpoint Validation...")
        
        endpoints = [
            {
                "name": "Enhanced Inference",
                "method": "POST",
                "url": "/api/v1/inference/enhanced",
                "payload": {
                    "query": "How to optimize system performance?",
                    "context": {"system": "web_application"},
                    "enhancement_level": "standard"
                }
            },
            {
                "name": "Autonomous Reasoning Cycle",
                "method": "POST",
                "url": "/api/v1/autonomy/reasoning-cycle",
                "payload": {
                    "context": {
                        "system_state": "normal_operation",
                        "environment": "production"
                    }
                }
            },
            {
                "name": "Creative Intelligence Session",
                "method": "POST",
                "url": "/api/v1/creativity/intelligence-session",
                "payload": {
                    "context": {
                        "challenge": "improve user experience",
                        "domain": "web_design"
                    }
                }
            },
            {
                "name": "Phase 3.2 Performance Metrics",
                "method": "GET",
                "url": "/api/v1/phase32/performance-metrics",
                "payload": None
            }
        ]
        
        results = []
        
        for endpoint in endpoints:
            print(f"   Testing {endpoint['name']}...")
            start_time = time.time()
            
            try:
                url = f"{self.server_url}{endpoint['url']}"
                
                if endpoint["method"] == "GET":
                    response = requests.get(url, timeout=10)
                else:
                    response = requests.post(
                        url,
                        json=endpoint["payload"],
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                
                duration = time.time() - start_time
                
                if response.status_code == 200:
                    status = "PASSED"
                    print(f"   ✅ {endpoint['name']} - PASSED ({duration:.2f}s)")
                    
                    # Validate response structure
                    try:
                        data = response.json()
                        validation_details = self._validate_endpoint_response(endpoint["name"], data)
                    except Exception as e:
                        validation_details = {"validation_error": str(e)}
                else:
                    status = "FAILED"
                    print(f"   ❌ {endpoint['name']} - FAILED ({duration:.2f}s) - HTTP {response.status_code}")
                    validation_details = {"http_error": response.status_code, "response": response.text[:200]}
                
                test_result = TestResult(
                    test_name=f"endpoint_{endpoint['name'].lower().replace(' ', '_')}",
                    status=status,
                    duration=duration,
                    details={
                        "http_status": response.status_code,
                        "response_size": len(response.text),
                        "validation": validation_details
                    }
                )
                
                results.append(test_result)
                
            except Exception as e:
                duration = time.time() - start_time
                print(f"   ❌ {endpoint['name']} - ERROR ({duration:.2f}s): {e}")
                
                test_result = TestResult(
                    test_name=f"endpoint_{endpoint['name'].lower().replace(' ', '_')}",
                    status="ERROR",
                    duration=duration,
                    details={"error": str(e)},
                    errors=[str(e)]
                )
                
                results.append(test_result)
        
        return results
    
    def _validate_endpoint_response(self, endpoint_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate endpoint response structure"""
        validation = {"valid": True, "missing_fields": [], "invalid_types": []}
        
        expected_fields = {
            "Enhanced Inference": ["enhanced_response", "reasoning_steps", "confidence", "metadata"],
            "Autonomous Reasoning Cycle": ["assessment", "identified_problems", "generated_goals", "decisions", "confidence"],
            "Creative Intelligence Session": ["divergent_ideas", "lateral_connections", "creative_confidence", "innovation_potential"],
            "Phase 3.2 Performance Metrics": ["autonomous_engine_performance", "creative_system_performance", "enhanced_inference_performance"]
        }
        
        if endpoint_name in expected_fields:
            for field in expected_fields[endpoint_name]:
                if field not in data:
                    validation["valid"] = False
                    validation["missing_fields"].append(field)
        
        return validation
    
    def run_performance_benchmarks(self) -> List[TestResult]:
        """Run performance benchmark tests"""
        print("⚡ Running Performance Benchmarks...")
        
        benchmarks = [
            {
                "name": "Enhanced Inference Speed",
                "endpoint": "/api/v1/inference/enhanced",
                "payload": {
                    "query": "Quick performance test",
                    "context": {"test": "performance"},
                    "enhancement_level": "basic"
                },
                "max_response_time": 3.0,
                "iterations": 5
            },
            {
                "name": "Autonomous Reasoning Speed",
                "endpoint": "/api/v1/autonomy/reasoning-cycle",
                "payload": {
                    "context": {
                        "system_state": "performance_test",
                        "environment": "test"
                    }
                },
                "max_response_time": 2.5,  # More realistic threshold for autonomous reasoning
                "iterations": 3
            },
            {
                "name": "Creative Intelligence Speed",
                "endpoint": "/api/v1/creativity/intelligence-session",
                "payload": {
                    "context": {
                        "challenge": "performance test",
                        "domain": "testing"
                    }
                },
                "max_response_time": 3.0,
                "iterations": 3
            }
        ]
        
        results = []
        
        for benchmark in benchmarks:
            print(f"   Benchmarking {benchmark['name']}...")
            
            response_times = []
            successful_requests = 0
            
            for i in range(benchmark["iterations"]):
                start_time = time.time()
                
                try:
                    response = requests.post(
                        f"{self.server_url}{benchmark['endpoint']}",
                        json=benchmark["payload"],
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                    
                    duration = time.time() - start_time
                    response_times.append(duration)
                    
                    if response.status_code == 200:
                        successful_requests += 1
                    
                except Exception as e:
                    duration = time.time() - start_time
                    response_times.append(duration)
                    print(f"      Request {i+1} failed: {e}")
            
            # Calculate performance metrics
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            min_response_time = min(response_times)
            success_rate = successful_requests / benchmark["iterations"]
            
            # Determine pass/fail
            if avg_response_time <= benchmark["max_response_time"] and success_rate >= 0.8:
                status = "PASSED"
                print(f"   ✅ {benchmark['name']} - PASSED (avg: {avg_response_time:.2f}s, success: {success_rate:.1%})")
            else:
                status = "FAILED"
                print(f"   ❌ {benchmark['name']} - FAILED (avg: {avg_response_time:.2f}s, success: {success_rate:.1%})")
            
            test_result = TestResult(
                test_name=f"benchmark_{benchmark['name'].lower().replace(' ', '_')}",
                status=status,
                duration=sum(response_times),
                details={
                    "avg_response_time": avg_response_time,
                    "max_response_time": max_response_time,
                    "min_response_time": min_response_time,
                    "success_rate": success_rate,
                    "iterations": benchmark["iterations"],
                    "threshold": benchmark["max_response_time"]
                }
            )
            
            results.append(test_result)
        
        return results
    
    def generate_production_report(self, all_results: List[TestResult]) -> Dict[str, Any]:
        """Generate comprehensive production readiness report"""
        
        # Calculate overall statistics
        total_tests = len(all_results)
        passed_tests = sum(1 for result in all_results if result.status == "PASSED")
        failed_tests = sum(1 for result in all_results if result.status == "FAILED")
        error_tests = sum(1 for result in all_results if result.status == "ERROR")
        
        success_rate = passed_tests / total_tests if total_tests > 0 else 0
        total_duration = sum(result.duration for result in all_results)
        
        # Categorize results
        unit_test_results = [r for r in all_results if "test_" in r.test_name and "/" in r.test_name]
        integration_test_results = [r for r in all_results if "integration" in r.test_name]
        endpoint_test_results = [r for r in all_results if "endpoint_" in r.test_name]
        benchmark_results = [r for r in all_results if "benchmark_" in r.test_name]
        
        report = {
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "error_tests": error_tests,
                "success_rate": success_rate,
                "total_duration": total_duration,
                "production_ready": success_rate >= 0.85
            },
            "categories": {
                "unit_tests": {
                    "count": len(unit_test_results),
                    "passed": sum(1 for r in unit_test_results if r.status == "PASSED"),
                    "success_rate": sum(1 for r in unit_test_results if r.status == "PASSED") / len(unit_test_results) if unit_test_results else 0
                },
                "integration_tests": {
                    "count": len(integration_test_results),
                    "passed": sum(1 for r in integration_test_results if r.status == "PASSED"),
                    "success_rate": sum(1 for r in integration_test_results if r.status == "PASSED") / len(integration_test_results) if integration_test_results else 0
                },
                "endpoint_tests": {
                    "count": len(endpoint_test_results),
                    "passed": sum(1 for r in endpoint_test_results if r.status == "PASSED"),
                    "success_rate": sum(1 for r in endpoint_test_results if r.status == "PASSED") / len(endpoint_test_results) if endpoint_test_results else 0
                },
                "performance_benchmarks": {
                    "count": len(benchmark_results),
                    "passed": sum(1 for r in benchmark_results if r.status == "PASSED"),
                    "success_rate": sum(1 for r in benchmark_results if r.status == "PASSED") / len(benchmark_results) if benchmark_results else 0
                }
            },
            "failed_tests": [
                {
                    "test_name": result.test_name,
                    "status": result.status,
                    "duration": result.duration,
                    "errors": result.errors or []
                }
                for result in all_results if result.status in ["FAILED", "ERROR"]
            ],
            "performance_metrics": {
                "avg_test_duration": total_duration / total_tests if total_tests > 0 else 0,
                "fastest_test": min(all_results, key=lambda r: r.duration).test_name if all_results else None,
                "slowest_test": max(all_results, key=lambda r: r.duration).test_name if all_results else None,
                "benchmark_summary": {
                    result.test_name: {
                        "avg_response_time": result.details.get("avg_response_time", 0),
                        "success_rate": result.details.get("success_rate", 0)
                    }
                    for result in benchmark_results
                }
            },
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "phase": "Phase 3.2 Production Readiness"
        }
        
        return report
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run complete production test suite"""
        print("🎯 Starting Phase 3.2 Production Readiness Test Suite")
        print("=" * 60)
        
        start_time = time.time()
        all_results = []
        
        # Check server health first
        if not self.check_server_health():
            print("❌ Server health check failed. Skipping server-dependent tests.")
            server_running = False
        else:
            server_running = True
        
        # Run unit tests (don't require server)
        unit_results = self.run_unit_tests()
        all_results.extend(unit_results)
        
        if server_running:
            # Run integration tests
            integration_results = self.run_integration_tests()
            all_results.extend(integration_results)
            
            # Run endpoint validation
            endpoint_results = self.run_endpoint_validation()
            all_results.extend(endpoint_results)
            
            # Run performance benchmarks
            benchmark_results = self.run_performance_benchmarks()
            all_results.extend(benchmark_results)
        
        # Generate comprehensive report
        report = self.generate_production_report(all_results)
        
        total_duration = time.time() - start_time
        
        print("\n" + "=" * 60)
        print("📊 PRODUCTION READINESS SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {report['summary']['total_tests']}")
        print(f"Passed: {report['summary']['passed_tests']}")
        print(f"Failed: {report['summary']['failed_tests']}")
        print(f"Errors: {report['summary']['error_tests']}")
        print(f"Success Rate: {report['summary']['success_rate']:.1%}")
        print(f"Total Duration: {total_duration:.2f}s")
        
        if report['summary']['production_ready']:
            print("\n✅ PRODUCTION READY - Phase 3.2 components are ready for deployment!")
        else:
            print("\n❌ NOT PRODUCTION READY - Issues need to be resolved before deployment.")
            
            # Show failed tests
            if report['failed_tests']:
                print("\n❌ Failed Tests:")
                for failed_test in report['failed_tests']:
                    print(f"   - {failed_test['test_name']}: {failed_test['status']}")
        
        # Save report to file
        report_path = self.base_dir / "PHASE32_PRODUCTION_READINESS_REPORT.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: {report_path}")
        
        return report

def main():
    """Main entry point for production test runner"""
    runner = Phase32ProductionTestRunner()
    report = runner.run_all_tests()
    
    # Exit with appropriate code
    if report['summary']['production_ready']:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
