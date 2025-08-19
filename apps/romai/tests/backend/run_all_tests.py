"""
🧪 RomAI Backend Test Suite Runner
Comprehensive testing for world-class AGI capabilities
"""

import subprocess
import sys
import time
import requests
import json
from pathlib import Path
from typing import Dict, List, Optional
import pytest

class RomAITestRunner:
    """Comprehensive test runner for RomAI AGI system"""
    
    def __init__(self):
        self.agi_server_url = "http://localhost:6101"
        self.cbd_database_url = "http://localhost:4180"
        self.enterprise_api_url = "http://localhost:8002"
        self.test_results = {}
        
    def check_service_health(self, service_name: str, url: str, timeout: int = 5) -> bool:
        """Check if a service is healthy and responsive"""
        try:
            response = requests.get(f"{url}/health", timeout=timeout)
            if response.status_code == 200:
                print(f"✅ {service_name} is healthy")
                return True
            else:
                print(f"❌ {service_name} returned status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ {service_name} is not accessible: {e}")
            return False
    
    def check_all_services(self) -> bool:
        """Check health of all required services"""
        print("🔍 Checking service health...")
        
        services = [
            ("AGI Model Server", self.agi_server_url),
            ("CBD Database", self.cbd_database_url),
            # ("Enterprise API", self.enterprise_api_url)  # Temporarily disabled due to restart issues
        ]
        
        all_healthy = True
        for service_name, url in services:
            if not self.check_service_health(service_name, url):
                all_healthy = False
                
        return all_healthy
    
    def run_mathematical_tests(self) -> Dict:
        """Run mathematical engine tests"""
        print("\n🧮 Running Mathematical Engine Tests...")
        
        test_file = "test_mathematical_engine.py"
        cmd = [sys.executable, "-m", "pytest", test_file, "-v", "-s", "--tb=short"]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent)
            return {
                "status": "passed" if result.returncode == 0 else "failed",
                "output": result.stdout,
                "errors": result.stderr,
                "return_code": result.returncode
            }
        except Exception as e:
            return {
                "status": "error",
                "output": "",
                "errors": str(e),
                "return_code": -1
            }
    
    def run_logical_reasoning_tests(self) -> Dict:
        """Run logical reasoning engine tests"""
        print("\n🧠 Running Logical Reasoning Engine Tests...")
        
        test_file = "test_logical_reasoning_engine.py"
        cmd = [sys.executable, "-m", "pytest", test_file, "-v", "-s", "--tb=short"]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent)
            return {
                "status": "passed" if result.returncode == 0 else "failed",
                "output": result.stdout,
                "errors": result.stderr,
                "return_code": result.returncode
            }
        except Exception as e:
            return {
                "status": "error",
                "output": "",
                "errors": str(e),
                "return_code": -1
            }
    
    def run_integration_tests(self) -> Dict:
        """Run integration engine tests"""
        print("\n🔗 Running Integration Engine Tests...")
        
        test_file = "test_integration_engine.py"
        cmd = [sys.executable, "-m", "pytest", test_file, "-v", "-s", "--tb=short"]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent)
            return {
                "status": "passed" if result.returncode == 0 else "failed",
                "output": result.stdout,
                "errors": result.stderr,
                "return_code": result.returncode
            }
        except Exception as e:
            return {
                "status": "error",
                "output": "",
                "errors": str(e),
                "return_code": -1
            }
    
    def run_api_integration_tests(self) -> Dict:
        """Run API integration tests"""
        print("\n🌐 Running API Integration Tests...")
        
        try:
            # Test AGI Model Server endpoints
            endpoints = [
                "/solve",      # Mathematical solving
                "/reason",     # Logical reasoning
                "/integrate",  # Component integration
                "/health"      # Health check
            ]
            
            test_results = []
            for endpoint in endpoints:
                try:
                    url = f"{self.agi_server_url}{endpoint}"
                    if endpoint == "/health":
                        response = requests.get(url, timeout=5)
                    else:
                        # Test with sample data
                        response = requests.post(url, json={
                            "type": "test",
                            "problem": "Test problem for API validation"
                        }, timeout=10)
                    
                    test_results.append({
                        "endpoint": endpoint,
                        "status_code": response.status_code,
                        "success": response.status_code in [200, 201, 422]  # 422 for validation errors is OK
                    })
                    
                except Exception as e:
                    test_results.append({
                        "endpoint": endpoint,
                        "status_code": None,
                        "success": False,
                        "error": str(e)
                    })
            
            successful_tests = sum(1 for test in test_results if test["success"])
            total_tests = len(test_results)
            
            return {
                "status": "passed" if successful_tests >= total_tests * 0.8 else "failed",
                "successful_tests": successful_tests,
                "total_tests": total_tests,
                "success_rate": successful_tests / total_tests,
                "test_results": test_results
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def run_performance_benchmarks(self) -> Dict:
        """Run performance benchmark tests"""
        print("\n⚡ Running Performance Benchmarks...")
        
        try:
            benchmark_tests = [
                {
                    "name": "Mathematical Engine Speed",
                    "endpoint": "/solve",
                    "payload": {"type": "mathematical", "problem": "derivative of x^2 + 3x + 2"},
                    "max_time": 1.0
                },
                {
                    "name": "Logical Reasoning Speed",
                    "endpoint": "/reason",
                    "payload": {"type": "logical", "premises": ["All A are B", "C is A"], "task": "conclusion"},
                    "max_time": 1.5
                },
                {
                    "name": "Integration Engine Speed",
                    "endpoint": "/integrate",
                    "payload": {"type": "integration", "components": ["mathematical", "reasoning"]},
                    "max_time": 2.0
                }
            ]
            
            benchmark_results = []
            for test in benchmark_tests:
                start_time = time.time()
                try:
                    response = requests.post(
                        f"{self.agi_server_url}{test['endpoint']}", 
                        json=test['payload'], 
                        timeout=test['max_time'] + 1
                    )
                    execution_time = time.time() - start_time
                    
                    benchmark_results.append({
                        "name": test['name'],
                        "execution_time": execution_time,
                        "max_time": test['max_time'],
                        "passed": execution_time <= test['max_time'] and response.status_code == 200,
                        "status_code": response.status_code
                    })
                    
                except Exception as e:
                    execution_time = time.time() - start_time
                    benchmark_results.append({
                        "name": test['name'],
                        "execution_time": execution_time,
                        "max_time": test['max_time'],
                        "passed": False,
                        "error": str(e)
                    })
            
            passed_benchmarks = sum(1 for result in benchmark_results if result["passed"])
            total_benchmarks = len(benchmark_results)
            
            return {
                "status": "passed" if passed_benchmarks >= total_benchmarks * 0.8 else "failed",
                "passed_benchmarks": passed_benchmarks,
                "total_benchmarks": total_benchmarks,
                "benchmark_results": benchmark_results
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def generate_test_report(self) -> str:
        """Generate comprehensive test report"""
        report = []
        report.append("# 🧪 RomAI Backend Test Report")
        report.append(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        total_suites = len(self.test_results)
        passed_suites = sum(1 for result in self.test_results.values() if result.get("status") == "passed")
        
        report.append(f"## Summary")
        report.append(f"- **Total Test Suites**: {total_suites}")
        report.append(f"- **Passed Suites**: {passed_suites}")
        report.append(f"- **Failed Suites**: {total_suites - passed_suites}")
        report.append(f"- **Success Rate**: {passed_suites/total_suites:.1%}")
        report.append("")
        
        for suite_name, result in self.test_results.items():
            status_emoji = "✅" if result.get("status") == "passed" else "❌"
            report.append(f"## {status_emoji} {suite_name}")
            
            if result.get("status") == "passed":
                report.append("**Status**: PASSED")
            else:
                report.append("**Status**: FAILED")
                
            if "successful_tests" in result:
                report.append(f"**Success Rate**: {result['successful_tests']}/{result['total_tests']} ({result.get('success_rate', 0):.1%})")
            
            if "passed_benchmarks" in result:
                report.append(f"**Benchmarks**: {result['passed_benchmarks']}/{result['total_benchmarks']} passed")
            
            if result.get("errors"):
                report.append("**Errors**:")
                report.append(f"```\n{result['errors']}\n```")
            
            report.append("")
        
        return "\n".join(report)
    
    def run_all_tests(self) -> bool:
        """Run all test suites"""
        print("🧪 Starting RomAI Backend Test Suite")
        print("=" * 60)
        
        # Check service health first
        if not self.check_all_services():
            print("❌ Some services are not healthy. Please start all services before running tests.")
            return False
        
        # Run all test suites
        test_suites = [
            ("Mathematical Engine Tests", self.run_mathematical_tests),
            ("Logical Reasoning Tests", self.run_logical_reasoning_tests),
            ("Integration Engine Tests", self.run_integration_tests),
            ("API Integration Tests", self.run_api_integration_tests),
            ("Performance Benchmarks", self.run_performance_benchmarks)
        ]
        
        for suite_name, test_function in test_suites:
            print(f"\n{'='*60}")
            self.test_results[suite_name] = test_function()
            
            if self.test_results[suite_name]["status"] == "passed":
                print(f"✅ {suite_name} PASSED")
            else:
                print(f"❌ {suite_name} FAILED")
        
        # Generate and save report
        report = self.generate_test_report()
        
        # Save report to file
        report_file = Path(__file__).parent / "test_report.md"
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(report)
        
        print(f"\n{'='*60}")
        print("📊 TEST SUITE COMPLETE")
        print(f"📋 Report saved to: {report_file}")
        
        # Print summary
        total_suites = len(self.test_results)
        passed_suites = sum(1 for result in self.test_results.values() if result.get("status") == "passed")
        
        print(f"🎯 Results: {passed_suites}/{total_suites} test suites passed ({passed_suites/total_suites:.1%})")
        
        if passed_suites == total_suites:
            print("🎉 ALL TESTS PASSED! RomAI is performing at world-class levels!")
            return True
        else:
            print("⚠️  Some tests failed. Please review the report for details.")
            return False

if __name__ == "__main__":
    runner = RomAITestRunner()
    success = runner.run_all_tests()
    sys.exit(0 if success else 1)
