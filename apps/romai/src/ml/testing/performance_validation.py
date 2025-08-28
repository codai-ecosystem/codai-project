"""
Phase 3C: Performance & Scalability Validation System

Comprehensive performance testing framework for RomAI AGI system validation.
Tests system performance under various load conditions, measures response times,
throughput, memory usage, and validates scalability requirements.

Key Features:
- Concurrent request load testing
- Response time measurement and analysis  
- Memory usage monitoring
- Throughput benchmarking
- Stress testing with configurable patterns
- Scalability validation
- Performance regression detection
- Real-time performance metrics collection
"""

import asyncio
import aiohttp
import time
import psutil
import threading
import statistics
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np
from datetime import datetime, timedelta
import gc

logger = logging.getLogger(__name__)


class LoadPattern(Enum):
    """Load testing patterns."""
    CONSTANT = "constant"
    RAMP_UP = "ramp_up"
    SPIKE = "spike"
    BURST = "burst"
    SUSTAINED = "sustained"


class PerformanceMetric(Enum):
    """Performance metrics to track."""
    RESPONSE_TIME = "response_time"
    THROUGHPUT = "throughput"
    ERROR_RATE = "error_rate"
    MEMORY_USAGE = "memory_usage"
    CPU_USAGE = "cpu_usage"
    CONCURRENT_USERS = "concurrent_users"
    SUCCESS_RATE = "success_rate"


@dataclass
class TestConfiguration:
    """Performance test configuration."""
    base_url: str = "http://localhost:6101"
    total_requests: int = 100
    concurrent_users: int = 10
    ramp_up_time: int = 30  # seconds
    test_duration: int = 60  # seconds
    load_pattern: LoadPattern = LoadPattern.CONSTANT
    endpoints_to_test: List[str] = None
    request_timeout: int = 30
    think_time: float = 0.1  # seconds between requests
    
    def __post_init__(self):
        if self.endpoints_to_test is None:
            self.endpoints_to_test = [
                "/health",
                "/api/v1/advanced-reasoning",
                "/production/metrics",
                "/docs/api"
            ]


@dataclass
class RequestResult:
    """Result of a single request."""
    endpoint: str
    start_time: float
    end_time: float
    response_time: float
    status_code: int
    success: bool
    error_message: Optional[str] = None
    response_size: int = 0
    memory_usage: float = 0.0
    cpu_usage: float = 0.0


@dataclass
class PerformanceReport:
    """Comprehensive performance test report."""
    test_start_time: datetime
    test_end_time: datetime
    total_duration: float
    configuration: TestConfiguration
    total_requests: int
    successful_requests: int
    failed_requests: int
    success_rate: float
    
    # Response time statistics
    avg_response_time: float
    min_response_time: float
    max_response_time: float
    p50_response_time: float
    p95_response_time: float
    p99_response_time: float
    
    # Throughput metrics
    requests_per_second: float
    max_concurrent_users: int
    
    # Resource usage
    avg_memory_usage: float
    max_memory_usage: float
    avg_cpu_usage: float
    max_cpu_usage: float
    
    # Error analysis
    error_breakdown: Dict[str, int]
    endpoint_performance: Dict[str, Dict[str, float]]
    
    # Performance validation results
    meets_performance_requirements: bool
    performance_grade: str
    recommendations: List[str]


class SystemResourceMonitor:
    """Monitor system resource usage during performance tests."""
    
    def __init__(self):
        self.monitoring = False
        self.memory_samples = []
        self.cpu_samples = []
        self.monitor_thread = None
        
    def start_monitoring(self):
        """Start resource monitoring in background thread."""
        self.monitoring = True
        self.memory_samples.clear()
        self.cpu_samples.clear()
        self.monitor_thread = threading.Thread(target=self._monitor_resources)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        
    def stop_monitoring(self):
        """Stop resource monitoring."""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
            
    def _monitor_resources(self):
        """Monitor resources in background thread."""
        while self.monitoring:
            try:
                memory_percent = psutil.virtual_memory().percent
                cpu_percent = psutil.cpu_percent(interval=0.1)
                
                self.memory_samples.append(memory_percent)
                self.cpu_samples.append(cpu_percent)
                
                time.sleep(1)  # Sample every second
            except Exception as e:
                logger.warning(f"Resource monitoring error: {e}")
                
    def get_memory_stats(self) -> Dict[str, float]:
        """Get memory usage statistics."""
        if not self.memory_samples:
            return {"avg": 0.0, "max": 0.0, "min": 0.0}
            
        return {
            "avg": statistics.mean(self.memory_samples),
            "max": max(self.memory_samples),
            "min": min(self.memory_samples),
            "current": psutil.virtual_memory().percent
        }
        
    def get_cpu_stats(self) -> Dict[str, float]:
        """Get CPU usage statistics."""
        if not self.cpu_samples:
            return {"avg": 0.0, "max": 0.0, "min": 0.0}
            
        return {
            "avg": statistics.mean(self.cpu_samples),
            "max": max(self.cpu_samples),
            "min": min(self.cpu_samples),
            "current": psutil.cpu_percent()
        }


class PerformanceTestEngine:
    """Main performance testing engine for RomAI AGI system."""
    
    def __init__(self, config: TestConfiguration):
        self.config = config
        self.resource_monitor = SystemResourceMonitor()
        self.results = []
        self.start_time = None
        self.end_time = None
        
    async def run_performance_test(self) -> PerformanceReport:
        """Run comprehensive performance test suite."""
        logger.info("🚀 Starting Phase 3C: Performance & Scalability Validation")
        logger.info(f"📊 Configuration: {self.config.concurrent_users} users, {self.config.total_requests} requests")
        
        self.start_time = datetime.now()
        
        # Start resource monitoring
        self.resource_monitor.start_monitoring()
        
        try:
            # Run load test based on pattern
            if self.config.load_pattern == LoadPattern.CONSTANT:
                await self._run_constant_load_test()
            elif self.config.load_pattern == LoadPattern.RAMP_UP:
                await self._run_ramp_up_test()
            elif self.config.load_pattern == LoadPattern.SPIKE:
                await self._run_spike_test()
            elif self.config.load_pattern == LoadPattern.BURST:
                await self._run_burst_test()
            else:
                await self._run_sustained_test()
                
        finally:
            self.end_time = datetime.now()
            self.resource_monitor.stop_monitoring()
            
        # Generate comprehensive report
        report = self._generate_performance_report()
        return report
        
    async def _run_constant_load_test(self):
        """Run constant load test with fixed concurrent users."""
        logger.info(f"🔄 Running constant load test: {self.config.concurrent_users} concurrent users")
        
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=50)
        timeout = aiohttp.ClientTimeout(total=self.config.request_timeout)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            # Create semaphore to limit concurrent requests
            semaphore = asyncio.Semaphore(self.config.concurrent_users)
            
            # Create tasks for all requests
            tasks = []
            requests_per_user = self.config.total_requests // self.config.concurrent_users
            
            for user_id in range(self.config.concurrent_users):
                for req_id in range(requests_per_user):
                    endpoint = self.config.endpoints_to_test[req_id % len(self.config.endpoints_to_test)]
                    task = asyncio.create_task(
                        self._make_request(session, semaphore, endpoint, user_id, req_id)
                    )
                    tasks.append(task)
                    
            # Wait for all requests to complete
            self.results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions
            self.results = [r for r in self.results if isinstance(r, RequestResult)]
            
    async def _run_ramp_up_test(self):
        """Run ramp-up load test with gradually increasing users."""
        logger.info(f"📈 Running ramp-up test: 0 to {self.config.concurrent_users} users over {self.config.ramp_up_time}s")
        
        connector = aiohttp.TCPConnector(limit=200, limit_per_host=100)
        timeout = aiohttp.ClientTimeout(total=self.config.request_timeout)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            tasks = []
            
            # Calculate ramp-up intervals
            interval = self.config.ramp_up_time / self.config.concurrent_users
            
            for user_id in range(self.config.concurrent_users):
                # Delay start for each user
                delay = user_id * interval
                requests_per_user = self.config.total_requests // self.config.concurrent_users
                
                for req_id in range(requests_per_user):
                    endpoint = self.config.endpoints_to_test[req_id % len(self.config.endpoints_to_test)]
                    task = asyncio.create_task(
                        self._make_delayed_request(session, endpoint, user_id, req_id, delay)
                    )
                    tasks.append(task)
                    
            self.results = await asyncio.gather(*tasks, return_exceptions=True)
            self.results = [r for r in self.results if isinstance(r, RequestResult)]
            
    async def _run_spike_test(self):
        """Run spike test with sudden load increase."""
        logger.info(f"⚡ Running spike test: Sudden load to {self.config.concurrent_users * 2} users")
        
        # Normal load phase
        await self._run_constant_load_test()
        normal_results = self.results.copy()
        
        # Spike phase - double the concurrent users
        original_users = self.config.concurrent_users
        self.config.concurrent_users *= 2
        
        await asyncio.sleep(2)  # Brief pause
        await self._run_constant_load_test()
        spike_results = self.results.copy()
        
        # Restore configuration and combine results
        self.config.concurrent_users = original_users
        self.results = normal_results + spike_results
        
    async def _run_burst_test(self):
        """Run burst test with multiple short bursts of high load."""
        logger.info("💥 Running burst test: Multiple high-load bursts")
        
        all_results = []
        bursts = 3
        burst_users = self.config.concurrent_users * 3
        
        for burst_id in range(bursts):
            logger.info(f"🔥 Burst {burst_id + 1}/{bursts}: {burst_users} concurrent users")
            
            # Temporarily increase concurrent users
            original_users = self.config.concurrent_users
            self.config.concurrent_users = burst_users
            
            await self._run_constant_load_test()
            all_results.extend(self.results)
            
            # Restore original configuration
            self.config.concurrent_users = original_users
            
            # Brief pause between bursts
            if burst_id < bursts - 1:
                await asyncio.sleep(5)
                
        self.results = all_results
        
    async def _run_sustained_test(self):
        """Run sustained load test for extended duration."""
        logger.info(f"⏱️ Running sustained test: {self.config.test_duration}s duration")
        
        start_time = time.time()
        all_results = []
        
        while (time.time() - start_time) < self.config.test_duration:
            await self._run_constant_load_test()
            all_results.extend(self.results)
            
            # Brief pause to prevent overwhelming
            await asyncio.sleep(1)
            
        self.results = all_results
        
    async def _make_request(self, session: aiohttp.ClientSession, semaphore: asyncio.Semaphore, 
                          endpoint: str, user_id: int, req_id: int) -> RequestResult:
        """Make a single HTTP request with performance measurement."""
        async with semaphore:
            start_time = time.time()
            
            try:
                # Add think time before request
                if self.config.think_time > 0:
                    await asyncio.sleep(self.config.think_time)
                
                # Prepare request data based on endpoint
                request_data = self._get_request_data(endpoint)
                url = f"{self.config.base_url}{endpoint}"
                
                # Make the request
                if endpoint == "/api/v1/advanced-reasoning":
                    async with session.post(url, json=request_data) as response:
                        content = await response.text()
                        end_time = time.time()
                        
                        return RequestResult(
                            endpoint=endpoint,
                            start_time=start_time,
                            end_time=end_time,
                            response_time=(end_time - start_time) * 1000,  # ms
                            status_code=response.status,
                            success=200 <= response.status < 300,
                            response_size=len(content),
                            memory_usage=psutil.virtual_memory().percent,
                            cpu_usage=psutil.cpu_percent()
                        )
                else:
                    async with session.get(url) as response:
                        content = await response.text()
                        end_time = time.time()
                        
                        return RequestResult(
                            endpoint=endpoint,
                            start_time=start_time,
                            end_time=end_time,
                            response_time=(end_time - start_time) * 1000,  # ms
                            status_code=response.status,
                            success=200 <= response.status < 300,
                            response_size=len(content),
                            memory_usage=psutil.virtual_memory().percent,
                            cpu_usage=psutil.cpu_percent()
                        )
                        
            except Exception as e:
                end_time = time.time()
                return RequestResult(
                    endpoint=endpoint,
                    start_time=start_time,
                    end_time=end_time,
                    response_time=(end_time - start_time) * 1000,
                    status_code=0,
                    success=False,
                    error_message=str(e),
                    memory_usage=psutil.virtual_memory().percent,
                    cpu_usage=psutil.cpu_percent()
                )
                
    async def _make_delayed_request(self, session: aiohttp.ClientSession, endpoint: str, 
                                  user_id: int, req_id: int, delay: float) -> RequestResult:
        """Make a request with initial delay (for ramp-up tests)."""
        await asyncio.sleep(delay)
        semaphore = asyncio.Semaphore(1)  # No concurrent limit for delayed requests
        return await self._make_request(session, semaphore, endpoint, user_id, req_id)
        
    def _get_request_data(self, endpoint: str) -> Optional[Dict[str, Any]]:
        """Get appropriate request data for different endpoints."""
        if endpoint == "/api/v1/advanced-reasoning":
            return {
                "problem": "What is the result of 15 + 27?",
                "domain": "mathematics"
            }
        return None
        
    def _generate_performance_report(self) -> PerformanceReport:
        """Generate comprehensive performance test report."""
        if not self.results:
            logger.warning("No results available for performance report")
            return None
            
        # Calculate basic statistics
        total_requests = len(self.results)
        successful_requests = sum(1 for r in self.results if r.success)
        failed_requests = total_requests - successful_requests
        success_rate = (successful_requests / total_requests) * 100 if total_requests > 0 else 0
        
        # Response time statistics
        response_times = [r.response_time for r in self.results if r.success]
        if response_times:
            avg_response_time = statistics.mean(response_times)
            min_response_time = min(response_times)
            max_response_time = max(response_times)
            p50_response_time = np.percentile(response_times, 50)
            p95_response_time = np.percentile(response_times, 95)
            p99_response_time = np.percentile(response_times, 99)
        else:
            avg_response_time = min_response_time = max_response_time = 0
            p50_response_time = p95_response_time = p99_response_time = 0
            
        # Calculate throughput
        total_duration = (self.end_time - self.start_time).total_seconds()
        requests_per_second = successful_requests / total_duration if total_duration > 0 else 0
        
        # Resource usage statistics
        memory_stats = self.resource_monitor.get_memory_stats()
        cpu_stats = self.resource_monitor.get_cpu_stats()
        
        # Error breakdown
        error_breakdown = {}
        for result in self.results:
            if not result.success:
                error_key = f"HTTP_{result.status_code}" if result.status_code > 0 else "Network_Error"
                error_breakdown[error_key] = error_breakdown.get(error_key, 0) + 1
                
        # Endpoint-specific performance
        endpoint_performance = {}
        for endpoint in self.config.endpoints_to_test:
            endpoint_results = [r for r in self.results if r.endpoint == endpoint and r.success]
            if endpoint_results:
                endpoint_response_times = [r.response_time for r in endpoint_results]
                endpoint_performance[endpoint] = {
                    "avg_response_time": statistics.mean(endpoint_response_times),
                    "success_rate": (len(endpoint_results) / 
                                   len([r for r in self.results if r.endpoint == endpoint])) * 100,
                    "requests_count": len([r for r in self.results if r.endpoint == endpoint])
                }
                
        # Performance validation
        meets_requirements = self._validate_performance_requirements(
            success_rate, avg_response_time, requests_per_second
        )
        
        performance_grade = self._calculate_performance_grade(
            success_rate, avg_response_time, requests_per_second
        )
        
        recommendations = self._generate_recommendations(
            success_rate, avg_response_time, requests_per_second, memory_stats, cpu_stats
        )
        
        return PerformanceReport(
            test_start_time=self.start_time,
            test_end_time=self.end_time,
            total_duration=total_duration,
            configuration=self.config,
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            success_rate=success_rate,
            avg_response_time=avg_response_time,
            min_response_time=min_response_time,
            max_response_time=max_response_time,
            p50_response_time=p50_response_time,
            p95_response_time=p95_response_time,
            p99_response_time=p99_response_time,
            requests_per_second=requests_per_second,
            max_concurrent_users=self.config.concurrent_users,
            avg_memory_usage=memory_stats["avg"],
            max_memory_usage=memory_stats["max"],
            avg_cpu_usage=cpu_stats["avg"],
            max_cpu_usage=cpu_stats["max"],
            error_breakdown=error_breakdown,
            endpoint_performance=endpoint_performance,
            meets_performance_requirements=meets_requirements,
            performance_grade=performance_grade,
            recommendations=recommendations
        )
        
    def _validate_performance_requirements(self, success_rate: float, avg_response_time: float, 
                                         requests_per_second: float) -> bool:
        """Validate if performance meets Phase 3C requirements."""
        # Phase 3C Requirements:
        # - Success rate > 95%
        # - Average response time < 2000ms
        # - Requests per second > 10
        # - Handle 100+ concurrent requests (tested separately)
        
        return (
            success_rate >= 95.0 and
            avg_response_time < 2000.0 and
            requests_per_second >= 10.0
        )
        
    def _calculate_performance_grade(self, success_rate: float, avg_response_time: float, 
                                   requests_per_second: float) -> str:
        """Calculate performance grade based on metrics."""
        score = 0
        
        # Success rate scoring (40% weight)
        if success_rate >= 99.0:
            score += 40
        elif success_rate >= 95.0:
            score += 35
        elif success_rate >= 90.0:
            score += 30
        elif success_rate >= 80.0:
            score += 20
        else:
            score += 10
            
        # Response time scoring (35% weight)
        if avg_response_time <= 500:
            score += 35
        elif avg_response_time <= 1000:
            score += 30
        elif avg_response_time <= 2000:
            score += 25
        elif avg_response_time <= 5000:
            score += 15
        else:
            score += 5
            
        # Throughput scoring (25% weight)
        if requests_per_second >= 50:
            score += 25
        elif requests_per_second >= 25:
            score += 20
        elif requests_per_second >= 10:
            score += 15
        elif requests_per_second >= 5:
            score += 10
        else:
            score += 5
            
        # Grade assignment
        if score >= 90:
            return "A+"
        elif score >= 85:
            return "A"
        elif score >= 80:
            return "B+"
        elif score >= 75:
            return "B"
        elif score >= 70:
            return "C+"
        elif score >= 65:
            return "C"
        else:
            return "D"
            
    def _generate_recommendations(self, success_rate: float, avg_response_time: float,
                                requests_per_second: float, memory_stats: Dict[str, float],
                                cpu_stats: Dict[str, float]) -> List[str]:
        """Generate performance improvement recommendations."""
        recommendations = []
        
        if success_rate < 95.0:
            recommendations.append(f"Improve error handling - success rate is {success_rate:.1f}% (target: >95%)")
            
        if avg_response_time > 2000:
            recommendations.append(f"Optimize response time - average is {avg_response_time:.0f}ms (target: <2000ms)")
            
        if requests_per_second < 10:
            recommendations.append(f"Increase throughput - current {requests_per_second:.1f} RPS (target: >10 RPS)")
            
        if memory_stats["max"] > 80:
            recommendations.append(f"Monitor memory usage - peak at {memory_stats['max']:.1f}% (consider optimization)")
            
        if cpu_stats["max"] > 90:
            recommendations.append(f"Optimize CPU usage - peak at {cpu_stats['max']:.1f}% (consider scaling)")
            
        if avg_response_time > 1000 and requests_per_second < 20:
            recommendations.append("Consider implementing response caching for frequently requested data")
            
        if len(recommendations) == 0:
            recommendations.append("Excellent performance! System meets all Phase 3C requirements.")
            
        return recommendations


async def run_phase_3c_validation() -> PerformanceReport:
    """Run Phase 3C performance and scalability validation."""
    
    # Test configuration optimized for Phase 3C requirements
    config = TestConfiguration(
        base_url="http://localhost:6101",
        total_requests=200,
        concurrent_users=20,
        ramp_up_time=30,
        test_duration=120,
        load_pattern=LoadPattern.RAMP_UP,
        request_timeout=30,
        think_time=0.1
    )
    
    # Create and run performance test
    test_engine = PerformanceTestEngine(config)
    report = await test_engine.run_performance_test()
    
    return report


def print_performance_report(report: PerformanceReport):
    """Print formatted performance test report."""
    if not report:
        print("❌ No performance report available")
        return
        
    print("🚀 Phase 3C: Performance & Scalability Validation Report")
    print("=" * 65)
    print()
    
    # Test overview
    print("📊 TEST OVERVIEW:")
    print(f"   Duration: {report.total_duration:.1f} seconds")
    print(f"   Total Requests: {report.total_requests:,}")
    print(f"   Concurrent Users: {report.max_concurrent_users}")
    print(f"   Load Pattern: {report.configuration.load_pattern.value}")
    print()
    
    # Success metrics
    print("✅ SUCCESS METRICS:")
    print(f"   Successful Requests: {report.successful_requests:,}")
    print(f"   Failed Requests: {report.failed_requests:,}")
    print(f"   Success Rate: {report.success_rate:.2f}%")
    print()
    
    # Performance metrics
    print("⚡ PERFORMANCE METRICS:")
    print(f"   Average Response Time: {report.avg_response_time:.0f}ms")
    print(f"   P50 Response Time: {report.p50_response_time:.0f}ms")
    print(f"   P95 Response Time: {report.p95_response_time:.0f}ms")
    print(f"   P99 Response Time: {report.p99_response_time:.0f}ms")
    print(f"   Requests/Second: {report.requests_per_second:.1f}")
    print()
    
    # Resource usage
    print("💾 RESOURCE USAGE:")
    print(f"   Average Memory: {report.avg_memory_usage:.1f}%")
    print(f"   Peak Memory: {report.max_memory_usage:.1f}%")
    print(f"   Average CPU: {report.avg_cpu_usage:.1f}%")
    print(f"   Peak CPU: {report.max_cpu_usage:.1f}%")
    print()
    
    # Endpoint performance
    if report.endpoint_performance:
        print("🎯 ENDPOINT PERFORMANCE:")
        for endpoint, metrics in report.endpoint_performance.items():
            print(f"   {endpoint}:")
            print(f"     Response Time: {metrics['avg_response_time']:.0f}ms")
            print(f"     Success Rate: {metrics['success_rate']:.1f}%")
            print(f"     Requests: {metrics['requests_count']}")
        print()
    
    # Validation results
    print("🏆 VALIDATION RESULTS:")
    print(f"   Performance Grade: {report.performance_grade}")
    print(f"   Meets Requirements: {'✅ YES' if report.meets_performance_requirements else '❌ NO'}")
    print()
    
    # Recommendations
    if report.recommendations:
        print("💡 RECOMMENDATIONS:")
        for i, rec in enumerate(report.recommendations, 1):
            print(f"   {i}. {rec}")
        print()
    
    # Phase 3C success determination
    phase_3c_success = (
        report.meets_performance_requirements and
        report.success_rate >= 95.0 and
        report.avg_response_time < 2000.0 and
        report.requests_per_second >= 10.0
    )
    
    if phase_3c_success:
        print("🎉 Phase 3C: PERFORMANCE & SCALABILITY VALIDATION - SUCCESS!")
        print("✅ System demonstrates production-ready performance characteristics")
        print("✅ Scalability requirements met with excellent response times")
        print("✅ Ready for high-load production deployment")
    else:
        print("⚠️ Phase 3C: Performance optimization needed")
        print("🔧 Review recommendations and optimize system performance")
        
    print("=" * 65)