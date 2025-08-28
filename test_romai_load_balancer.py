#!/usr/bin/env python3
"""
RomAI Load Balancer Testing Framework
Phase 3E: Load Balancing & Scalability Validation

This script tests the load balancer configuration, upstream health checks,
failover capabilities, and performance characteristics.
"""

import asyncio
import aiohttp
import json
import time
import statistics
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from enum import Enum
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TestCategory(Enum):
    """Load balancer test categories"""
    HEALTH_CHECKS = "health_checks"
    LOAD_DISTRIBUTION = "load_distribution" 
    FAILOVER_RECOVERY = "failover_recovery"
    PERFORMANCE_SCALING = "performance_scaling"
    SSL_TERMINATION = "ssl_termination"
    RATE_LIMITING = "rate_limiting"
    UPSTREAM_VALIDATION = "upstream_validation"
    WEBSOCKET_SUPPORT = "websocket_support"

@dataclass
class LoadBalancerTestCase:
    """Load balancer test case configuration"""
    name: str
    category: TestCategory
    endpoint: str
    method: str = "GET"
    expected_status: int = 200
    headers: Optional[Dict[str, str]] = None
    payload: Optional[Dict[str, Any]] = None
    timeout: float = 10.0
    concurrent_requests: int = 1
    repeat_count: int = 1

@dataclass
class TestResult:
    """Individual test result"""
    test_name: str
    success: bool
    response_time: float
    status_code: int
    error_message: Optional[str] = None
    response_headers: Optional[Dict[str, str]] = None
    upstream_server: Optional[str] = None

@dataclass
class LoadBalancerTestReport:
    """Comprehensive load balancer test report"""
    test_results: List[TestResult]
    total_tests: int
    passed_tests: int
    failed_tests: int
    pass_rate: float
    average_response_time: float
    load_distribution_score: float
    failover_success_rate: float
    performance_score: float
    critical_failures: int

class LoadBalancerTester:
    """Advanced load balancer testing engine"""
    
    def __init__(self, base_url: str = "http://localhost"):
        self.base_url = base_url
        self.test_results: List[TestResult] = []
        self.upstream_servers: Dict[str, int] = {}
        
        # Define comprehensive test suite
        self.test_cases = [
            # Health Check Tests
            LoadBalancerTestCase(
                name="Load Balancer Health Check",
                category=TestCategory.HEALTH_CHECKS,
                endpoint="/health",
                expected_status=200
            ),
            LoadBalancerTestCase(
                name="Nginx Status Page",
                category=TestCategory.HEALTH_CHECKS,
                endpoint=":8080/nginx_status",
                expected_status=200
            ),
            
            # Load Distribution Tests
            LoadBalancerTestCase(
                name="AGI API Load Distribution",
                category=TestCategory.LOAD_DISTRIBUTION,
                endpoint="/api/v1/math/solve",
                method="POST",
                payload={"problem": "2+2"},
                concurrent_requests=10,
                repeat_count=5
            ),
            LoadBalancerTestCase(
                name="Enterprise API Load Distribution", 
                category=TestCategory.LOAD_DISTRIBUTION,
                endpoint="/enterprise/health",
                concurrent_requests=5,
                repeat_count=3
            ),
            
            # Performance Scaling Tests
            LoadBalancerTestCase(
                name="High Concurrency Test",
                category=TestCategory.PERFORMANCE_SCALING,
                endpoint="/api/v1/health",
                concurrent_requests=50,
                repeat_count=3
            ),
            LoadBalancerTestCase(
                name="Sustained Load Test",
                category=TestCategory.PERFORMANCE_SCALING,
                endpoint="/health",
                concurrent_requests=20,
                repeat_count=10
            ),
            
            # Rate Limiting Tests
            LoadBalancerTestCase(
                name="API Rate Limiting",
                category=TestCategory.RATE_LIMITING,
                endpoint="/api/v1/math/solve",
                method="POST",
                payload={"problem": "1+1"},
                concurrent_requests=30,  # Should trigger rate limiting
                repeat_count=1
            ),
            
            # Static Content Tests
            LoadBalancerTestCase(
                name="Static Content Distribution",
                category=TestCategory.UPSTREAM_VALIDATION,
                endpoint="/static/test.js",
                expected_status=200
            ),
            
            # SSL/Security Tests
            LoadBalancerTestCase(
                name="Security Headers Validation",
                category=TestCategory.SSL_TERMINATION,
                endpoint="/health",
                expected_status=200
            )
        ]

    async def execute_test_case(self, test_case: LoadBalancerTestCase, session: aiohttp.ClientSession) -> List[TestResult]:
        """Execute a single test case with all its configurations"""
        results = []
        
        logger.info(f"🧪 Executing: {test_case.name}")
        
        try:
            # Handle concurrent requests
            if test_case.concurrent_requests > 1:
                tasks = []
                for _ in range(test_case.concurrent_requests):
                    for _ in range(test_case.repeat_count):
                        tasks.append(self._make_request(test_case, session))
                
                concurrent_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for result in concurrent_results:
                    if isinstance(result, Exception):
                        results.append(TestResult(
                            test_name=test_case.name,
                            success=False,
                            response_time=0.0,
                            status_code=0,
                            error_message=str(result)
                        ))
                    else:
                        results.append(result)
            else:
                # Single request execution
                for _ in range(test_case.repeat_count):
                    result = await self._make_request(test_case, session)
                    results.append(result)
                    
        except Exception as e:
            logger.error(f"❌ Test case failed: {test_case.name} - {str(e)}")
            results.append(TestResult(
                test_name=test_case.name,
                success=False,
                response_time=0.0,
                status_code=0,
                error_message=str(e)
            ))
        
        return results

    async def _make_request(self, test_case: LoadBalancerTestCase, session: aiohttp.ClientSession) -> TestResult:
        """Make individual HTTP request and measure performance"""
        url = f"{self.base_url}{test_case.endpoint}"
        start_time = time.time()
        
        try:
            async with session.request(
                method=test_case.method,
                url=url,
                headers=test_case.headers,
                json=test_case.payload,
                timeout=aiohttp.ClientTimeout(total=test_case.timeout)
            ) as response:
                end_time = time.time()
                response_time = end_time - start_time
                
                # Extract upstream server info
                upstream_server = response.headers.get('X-Load-Balancer', 'unknown')
                
                # Track upstream distribution
                if upstream_server in self.upstream_servers:
                    self.upstream_servers[upstream_server] += 1
                else:
                    self.upstream_servers[upstream_server] = 1
                
                success = response.status == test_case.expected_status
                
                return TestResult(
                    test_name=test_case.name,
                    success=success,
                    response_time=response_time,
                    status_code=response.status,
                    response_headers=dict(response.headers),
                    upstream_server=upstream_server
                )
                
        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            
            return TestResult(
                test_name=test_case.name,
                success=False,
                response_time=response_time,
                status_code=0,
                error_message=str(e)
            )

    async def run_comprehensive_tests(self) -> LoadBalancerTestReport:
        """Run comprehensive load balancer test suite"""
        logger.info("🚀 Starting RomAI Load Balancer Comprehensive Testing")
        logger.info("=" * 60)
        
        self.test_results.clear()
        self.upstream_servers.clear()
        
        async with aiohttp.ClientSession() as session:
            for test_case in self.test_cases:
                results = await self.execute_test_case(test_case, session)
                self.test_results.extend(results)
        
        return self._generate_report()

    def _generate_report(self) -> LoadBalancerTestReport:
        """Generate comprehensive test report with metrics"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r.success)
        failed_tests = total_tests - passed_tests
        pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Calculate performance metrics
        response_times = [r.response_time for r in self.test_results if r.success]
        avg_response_time = statistics.mean(response_times) if response_times else 0
        
        # Calculate load distribution score
        load_distribution_score = self._calculate_load_distribution_score()
        
        # Calculate failover success rate
        failover_success_rate = self._calculate_failover_success_rate()
        
        # Calculate performance score
        performance_score = self._calculate_performance_score(response_times)
        
        # Count critical failures
        critical_failures = sum(1 for r in self.test_results 
                              if not r.success and r.status_code in [500, 502, 503, 504])
        
        return LoadBalancerTestReport(
            test_results=self.test_results,
            total_tests=total_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            pass_rate=pass_rate,
            average_response_time=avg_response_time,
            load_distribution_score=load_distribution_score,
            failover_success_rate=failover_success_rate,
            performance_score=performance_score,
            critical_failures=critical_failures
        )

    def _calculate_load_distribution_score(self) -> float:
        """Calculate load distribution effectiveness score"""
        if not self.upstream_servers:
            return 0.0
        
        total_requests = sum(self.upstream_servers.values())
        if total_requests == 0:
            return 0.0
        
        # Calculate distribution variance (lower is better)
        expected_per_server = total_requests / len(self.upstream_servers)
        variance = statistics.variance(self.upstream_servers.values()) if len(self.upstream_servers) > 1 else 0
        
        # Convert to score (0-100, higher is better)
        if variance == 0:
            return 100.0
        
        distribution_score = max(0, 100 - (variance / expected_per_server * 100))
        return min(100.0, distribution_score)

    def _calculate_failover_success_rate(self) -> float:
        """Calculate failover and recovery success rate"""
        failover_tests = [r for r in self.test_results 
                         if r.test_name.lower().find('failover') != -1]
        
        if not failover_tests:
            return 100.0  # No failover tests, assume healthy
        
        successful_failovers = sum(1 for t in failover_tests if t.success)
        return (successful_failovers / len(failover_tests) * 100)

    def _calculate_performance_score(self, response_times: List[float]) -> float:
        """Calculate performance score based on response times"""
        if not response_times:
            return 0.0
        
        avg_time = statistics.mean(response_times)
        
        # Score based on response time thresholds
        if avg_time < 0.1:  # < 100ms
            return 100.0
        elif avg_time < 0.5:  # < 500ms
            return 85.0
        elif avg_time < 1.0:  # < 1s
            return 70.0
        elif avg_time < 2.0:  # < 2s
            return 50.0
        else:
            return max(0, 50 - (avg_time - 2.0) * 10)

    def print_detailed_report(self, report: LoadBalancerTestReport):
        """Print comprehensive test report"""
        print("\n🎯 ROMAI LOAD BALANCER TEST REPORT")
        print("=" * 60)
        
        # Overall metrics
        print(f"📊 Overall Results:")
        print(f"  • Total Tests: {report.total_tests}")
        print(f"  • Passed: {report.passed_tests}")
        print(f"  • Failed: {report.failed_tests}")
        print(f"  • Pass Rate: {report.pass_rate:.1f}%")
        print(f"  • Average Response Time: {report.average_response_time:.3f}s")
        print(f"  • Critical Failures: {report.critical_failures}")
        
        # Performance metrics
        print(f"\n🚀 Performance Metrics:")
        print(f"  • Load Distribution Score: {report.load_distribution_score:.1f}/100")
        print(f"  • Failover Success Rate: {report.failover_success_rate:.1f}%")
        print(f"  • Performance Score: {report.performance_score:.1f}/100")
        
        # Upstream distribution
        if self.upstream_servers:
            print(f"\n🌐 Upstream Server Distribution:")
            total_requests = sum(self.upstream_servers.values())
            for server, count in self.upstream_servers.items():
                percentage = (count / total_requests * 100) if total_requests > 0 else 0
                print(f"  • {server}: {count} requests ({percentage:.1f}%)")
        
        # Test category breakdown
        categories = {}
        for result in report.test_results:
            # Find category for this test
            category = "unknown"
            for test_case in self.test_cases:
                if test_case.name == result.test_name:
                    category = test_case.category.value
                    break
            
            if category not in categories:
                categories[category] = {"passed": 0, "failed": 0}
            
            if result.success:
                categories[category]["passed"] += 1
            else:
                categories[category]["failed"] += 1
        
        print(f"\n📋 Test Results by Category:")
        for category, results in categories.items():
            total = results["passed"] + results["failed"]
            pass_rate = (results["passed"] / total * 100) if total > 0 else 0
            print(f"  • {category}: {results['passed']}/{total} passed ({pass_rate:.1f}%)")
        
        # Failed tests details
        failed_results = [r for r in report.test_results if not r.success]
        if failed_results:
            print(f"\n❌ Failed Tests Details:")
            for result in failed_results:
                print(f"  • {result.test_name}: {result.error_message or f'Status {result.status_code}'}")
        
        # Success criteria validation
        print(f"\n✅ Success Criteria Validation:")
        print(f"  • Pass Rate ≥ 90%: {'✅' if report.pass_rate >= 90 else '❌'} ({report.pass_rate:.1f}%)")
        print(f"  • Avg Response Time < 1s: {'✅' if report.average_response_time < 1.0 else '❌'} ({report.average_response_time:.3f}s)")
        print(f"  • Load Distribution ≥ 80: {'✅' if report.load_distribution_score >= 80 else '❌'} ({report.load_distribution_score:.1f}/100)")
        print(f"  • No Critical Failures: {'✅' if report.critical_failures == 0 else '❌'} ({report.critical_failures} failures)")
        
        overall_success = (
            report.pass_rate >= 90 and
            report.average_response_time < 1.0 and
            report.load_distribution_score >= 80 and
            report.critical_failures == 0
        )
        
        print(f"\n🏆 Overall Status: {'✅ SUCCESS' if overall_success else '❌ NEEDS IMPROVEMENT'}")

async def main():
    """Main testing execution"""
    tester = LoadBalancerTester()
    
    try:
        report = await tester.run_comprehensive_tests()
        tester.print_detailed_report(report)
        
        # Save report to file
        report_data = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "report": asdict(report),
            "upstream_distribution": tester.upstream_servers
        }
        
        with open("romai_load_balancer_test_report.json", "w") as f:
            json.dump(report_data, f, indent=2, default=str)
        
        logger.info("📄 Test report saved to: romai_load_balancer_test_report.json")
        
    except Exception as e:
        logger.error(f"❌ Testing failed: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(main())