"""
⚡ Performance Tests for RomAI AGI
Production-grade performance and load testing

This module provides specialized tests for validating RomAI's production performance:
- Response time and throughput testing
- Memory usage and resource consumption validation
- Load testing and scalability assessment
- Stress testing under high concurrent load
- Performance regression detection

Extends the Core Testing Framework with performance-specific test cases.

Author: RomAI Development Team  
Version: 1.0.0-production
"""

import asyncio
import time
import psutil
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import statistics

from .core_testing_framework import (
    BaseTestCase, TestConfig, TestCategory, TestStatus,
    test_environment, wait_for_service
)

logger = logging.getLogger('performance_tests')

@dataclass
class PerformanceMetrics:
    """Performance test metrics collection"""
    response_times: List[float]
    throughput_ops_sec: float
    memory_usage_mb: float
    cpu_usage_percent: float
    concurrent_requests: int
    error_count: int
    total_requests: int
    
    @property
    def avg_response_time(self) -> float:
        return statistics.mean(self.response_times) if self.response_times else 0.0
    
    @property
    def p95_response_time(self) -> float:
        return np.percentile(self.response_times, 95) if self.response_times else 0.0
    
    @property
    def p99_response_time(self) -> float:
        return np.percentile(self.response_times, 99) if self.response_times else 0.0
    
    @property
    def error_rate(self) -> float:
        return (self.error_count / self.total_requests * 100) if self.total_requests > 0 else 0.0

class ResponseTimeTest(BaseTestCase):
    """Test individual request response times"""
    
    def __init__(self, config: TestConfig):
        super().__init__(config)
        self.api_base_url = config.base_url
        self.target_response_time_ms = config.performance_threshold.get('max_response_time_ms', 2000)
        self.test_requests = 50
        self.response_times = []
    
    async def setup(self):
        """Setup response time test"""
        self.logger.info("Setting up response time tests")
        
        # Verify service is available
        if not await wait_for_service(f"{self.api_base_url}/api/v2/agi/inference", timeout=30):
            raise Exception("AGI inference service not available for performance testing")
    
    async def run_test(self):
        """Execute response time tests"""
        self.logger.info(f"Testing response times with {self.test_requests} requests")
        
        test_payload = {
            "input": "What is the capital of Romania and what makes it culturally significant?",
            "mode": "quick_response"
        }
        
        async with test_environment(self.api_base_url) as session:
            for i in range(self.test_requests):
                start_time = time.time()
                
                try:
                    async with session.post(
                        f"{self.api_base_url}/api/v2/agi/inference",
                        json=test_payload,
                        timeout=10
                    ) as response:
                        await response.read()  # Consume response
                        
                        response_time = (time.time() - start_time) * 1000  # Convert to ms
                        self.response_times.append(response_time)
                        
                        if i % 10 == 0:
                            self.logger.info(f"Completed {i+1}/{self.test_requests} requests")
                
                except Exception as e:
                    self.logger.warning(f"Request {i+1} failed: {e}")
                
                # Small delay between requests
                await asyncio.sleep(0.1)
    
    async def validate_results(self) -> bool:
        """Validate response time results"""
        if not self.response_times:
            return False
        
        avg_response_time = statistics.mean(self.response_times)
        p95_response_time = np.percentile(self.response_times, 95)
        p99_response_time = np.percentile(self.response_times, 99)
        
        # Update metrics
        self.metrics.response_time_ms = avg_response_time
        self.metrics.custom_metrics = {
            'avg_response_time_ms': avg_response_time,
            'p95_response_time_ms': p95_response_time,
            'p99_response_time_ms': p99_response_time,
            'min_response_time_ms': min(self.response_times),
            'max_response_time_ms': max(self.response_times),
            'total_requests': len(self.response_times),
            'target_response_time_ms': self.target_response_time_ms
        }
        
        self.logger.info(f"Response time results:")
        self.logger.info(f"  Average: {avg_response_time:.1f}ms")
        self.logger.info(f"  P95: {p95_response_time:.1f}ms")
        self.logger.info(f"  P99: {p99_response_time:.1f}ms")
        
        # Test passes if P95 is within target
        return p95_response_time <= self.target_response_time_ms

class ThroughputTest(BaseTestCase):
    """Test system throughput under sustained load"""
    
    def __init__(self, config: TestConfig):
        super().__init__(config)
        self.api_base_url = config.base_url
        self.test_duration_seconds = 60  # 1 minute test
        self.concurrent_users = 10
        self.target_throughput = config.performance_threshold.get('min_throughput_ops_sec', 5.0)
        self.completed_requests = 0
        self.error_count = 0
    
    async def setup(self):
        """Setup throughput test"""
        self.logger.info("Setting up throughput tests")
        
        if not await wait_for_service(f"{self.api_base_url}/api/v2/agi/inference", timeout=30):
            raise Exception("AGI inference service not available")
    
    async def run_test(self):
        """Execute throughput test with concurrent users"""
        self.logger.info(f"Testing throughput with {self.concurrent_users} concurrent users for {self.test_duration_seconds}s")
        
        start_time = time.time()
        
        # Create tasks for concurrent users
        tasks = []
        for user_id in range(self.concurrent_users):
            task = asyncio.create_task(self._simulate_user_load(user_id, start_time))
            tasks.append(task)
        
        # Wait for all tasks to complete
        await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        throughput = self.completed_requests / total_time
        
        self.logger.info(f"Throughput test completed:")
        self.logger.info(f"  Requests completed: {self.completed_requests}")
        self.logger.info(f"  Errors: {self.error_count}")
        self.logger.info(f"  Throughput: {throughput:.2f} req/s")
    
    async def _simulate_user_load(self, user_id: int, start_time: float):
        """Simulate load from a single user"""
        test_payloads = [
            {"input": "Explain Romanian history briefly", "mode": "concise"},
            {"input": "What are Romanian traditions?", "mode": "cultural"},
            {"input": "How does AI work?", "mode": "educational"},
            {"input": "Descrie cultura română", "mode": "romanian"}
        ]
        
        async with aiohttp.ClientSession() as session:
            while (time.time() - start_time) < self.test_duration_seconds:
                payload = test_payloads[self.completed_requests % len(test_payloads)]
                
                try:
                    async with session.post(
                        f"{self.api_base_url}/api/v2/agi/inference",
                        json=payload,
                        timeout=15
                    ) as response:
                        if response.status == 200:
                            self.completed_requests += 1
                        else:
                            self.error_count += 1
                            
                except Exception:
                    self.error_count += 1
                
                # Brief pause to prevent overwhelming
                await asyncio.sleep(0.5)
    
    async def validate_results(self) -> bool:
        """Validate throughput results"""
        total_requests = self.completed_requests + self.error_count
        throughput = self.completed_requests / self.test_duration_seconds
        error_rate = (self.error_count / total_requests * 100) if total_requests > 0 else 0
        
        # Update metrics
        self.metrics.throughput = throughput
        self.metrics.custom_metrics = {
            'throughput_ops_sec': throughput,
            'completed_requests': self.completed_requests,
            'error_count': self.error_count,
            'error_rate_percent': error_rate,
            'target_throughput': self.target_throughput,
            'concurrent_users': self.concurrent_users,
            'test_duration_seconds': self.test_duration_seconds
        }
        
        # Test passes if throughput meets target and error rate is low
        return throughput >= self.target_throughput and error_rate < 5.0

class LoadTest(BaseTestCase):
    """Comprehensive load testing with gradual ramp-up"""
    
    def __init__(self, config: TestConfig):
        super().__init__(config)
        self.api_base_url = config.base_url
        self.max_concurrent_users = 25
        self.ramp_up_duration = 30  # 30 seconds ramp-up
        self.sustained_duration = 60  # 60 seconds sustained load
        self.performance_data = []
    
    async def setup(self):
        """Setup load test"""
        self.logger.info("Setting up comprehensive load tests")
        
        if not await wait_for_service(f"{self.api_base_url}/api/v2/agi/inference", timeout=30):
            raise Exception("AGI inference service not available")
    
    async def run_test(self):
        """Execute comprehensive load test"""
        self.logger.info(f"Starting load test: ramp up to {self.max_concurrent_users} users")
        
        # Phase 1: Ramp-up
        await self._ramp_up_phase()
        
        # Phase 2: Sustained load
        await self._sustained_load_phase()
        
        # Phase 3: Ramp-down  
        await self._ramp_down_phase()
    
    async def _ramp_up_phase(self):
        """Gradually increase load"""
        self.logger.info("Phase 1: Ramping up load")
        
        users_per_step = max(1, self.max_concurrent_users // 10)
        step_duration = self.ramp_up_duration // 10
        
        current_users = 0
        active_tasks = []
        
        for step in range(10):
            # Add more users
            for _ in range(users_per_step):
                if current_users < self.max_concurrent_users:
                    task = asyncio.create_task(self._user_simulation(f"rampup_user_{current_users}"))
                    active_tasks.append(task)
                    current_users += 1
            
            # Wait for step duration
            await asyncio.sleep(step_duration)
            
            # Collect performance sample
            await self._collect_performance_sample(f"rampup_step_{step}", current_users)
        
        # Wait a bit for tasks to settle
        await asyncio.sleep(2)
        
        # Cancel ramp-up tasks
        for task in active_tasks:
            task.cancel()
        
        await asyncio.gather(*active_tasks, return_exceptions=True)
    
    async def _sustained_load_phase(self):
        """Maintain sustained load"""
        self.logger.info(f"Phase 2: Sustained load with {self.max_concurrent_users} users")
        
        # Create sustained load tasks
        tasks = []
        for user_id in range(self.max_concurrent_users):
            task = asyncio.create_task(self._user_simulation(f"sustained_user_{user_id}"))
            tasks.append(task)
        
        # Monitor performance during sustained load
        monitoring_task = asyncio.create_task(self._monitor_sustained_performance())
        
        # Run for sustained duration
        await asyncio.sleep(self.sustained_duration)
        
        # Cancel tasks
        monitoring_task.cancel()
        for task in tasks:
            task.cancel()
        
        await asyncio.gather(*tasks, monitoring_task, return_exceptions=True)
    
    async def _ramp_down_phase(self):
        """Gradually decrease load"""
        self.logger.info("Phase 3: Ramping down load")
        await asyncio.sleep(5)  # Cool down period
        await self._collect_performance_sample("rampdown", 0)
    
    async def _user_simulation(self, user_id: str):
        """Simulate a single user's behavior"""
        requests_count = 0
        
        async with aiohttp.ClientSession() as session:
            while True:
                try:
                    # Vary request types
                    if requests_count % 3 == 0:
                        payload = {"input": "Quick test question", "mode": "fast"}
                    elif requests_count % 3 == 1:
                        payload = {"input": "Ce tradițiile românești cunosci?", "mode": "cultural"}
                    else:
                        payload = {"input": "Complex reasoning problem solving", "mode": "reasoning"}
                    
                    async with session.post(
                        f"{self.api_base_url}/api/v2/agi/inference",
                        json=payload,
                        timeout=20
                    ) as response:
                        await response.read()
                        requests_count += 1
                        
                except Exception:
                    pass  # Continue despite errors
                
                # Realistic user pause
                await asyncio.sleep(np.random.exponential(2.0))  # Average 2s pause
    
    async def _monitor_sustained_performance(self):
        """Monitor performance during sustained load"""
        sample_count = 0
        
        while True:
            await asyncio.sleep(10)  # Sample every 10 seconds
            await self._collect_performance_sample(f"sustained_{sample_count}", self.max_concurrent_users)
            sample_count += 1
    
    async def _collect_performance_sample(self, phase: str, concurrent_users: int):
        """Collect performance metrics sample"""
        try:
            # System metrics
            memory_usage = psutil.virtual_memory().percent
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # Store sample
            sample = {
                'timestamp': datetime.now().isoformat(),
                'phase': phase,
                'concurrent_users': concurrent_users,
                'memory_usage_percent': memory_usage,
                'cpu_usage_percent': cpu_usage
            }
            
            self.performance_data.append(sample)
            
            self.logger.info(f"Performance sample [{phase}]: "
                           f"Users={concurrent_users}, Memory={memory_usage:.1f}%, CPU={cpu_usage:.1f}%")
        
        except Exception as e:
            self.logger.warning(f"Failed to collect performance sample: {e}")
    
    async def validate_results(self) -> bool:
        """Validate load test results"""
        if not self.performance_data:
            return False
        
        # Analyze performance data
        sustained_samples = [s for s in self.performance_data if 'sustained' in s['phase']]
        
        if not sustained_samples:
            return False
        
        avg_memory = statistics.mean([s['memory_usage_percent'] for s in sustained_samples])
        avg_cpu = statistics.mean([s['cpu_usage_percent'] for s in sustained_samples])
        max_memory = max([s['memory_usage_percent'] for s in sustained_samples])
        max_cpu = max([s['cpu_usage_percent'] for s in sustained_samples])
        
        # Update metrics
        self.metrics.memory_usage_mb = avg_memory * psutil.virtual_memory().total / 100 / 1024 / 1024
        self.metrics.cpu_usage_percent = avg_cpu
        
        self.metrics.custom_metrics = {
            'avg_memory_usage_percent': avg_memory,
            'avg_cpu_usage_percent': avg_cpu,
            'max_memory_usage_percent': max_memory,
            'max_cpu_usage_percent': max_cpu,
            'max_concurrent_users': self.max_concurrent_users,
            'performance_samples': len(self.performance_data),
            'sustained_samples': len(sustained_samples)
        }
        
        self.logger.info(f"Load test results:")
        self.logger.info(f"  Average Memory: {avg_memory:.1f}%")
        self.logger.info(f"  Average CPU: {avg_cpu:.1f}%")
        self.logger.info(f"  Peak Memory: {max_memory:.1f}%")
        self.logger.info(f"  Peak CPU: {max_cpu:.1f}%")
        
        # Test passes if resource usage is reasonable
        memory_threshold = self.config.performance_threshold.get('max_memory_usage_mb', 4096)
        cpu_threshold = self.config.performance_threshold.get('max_cpu_usage_percent', 85)
        
        memory_ok = (avg_memory * psutil.virtual_memory().total / 100 / 1024 / 1024) < memory_threshold
        cpu_ok = avg_cpu < cpu_threshold
        
        return memory_ok and cpu_ok

class MemoryLeakTest(BaseTestCase):
    """Test for memory leaks under extended operation"""
    
    def __init__(self, config: TestConfig):
        super().__init__(config)
        self.api_base_url = config.base_url
        self.test_duration_minutes = 15  # 15 minute test
        self.memory_samples = []
    
    async def setup(self):
        """Setup memory leak test"""
        self.logger.info("Setting up memory leak detection test")
        
        if not await wait_for_service(f"{self.api_base_url}/api/v2/agi/inference", timeout=30):
            raise Exception("AGI inference service not available")
    
    async def run_test(self):
        """Execute memory leak test"""
        self.logger.info(f"Running memory leak test for {self.test_duration_minutes} minutes")
        
        # Start monitoring memory
        monitoring_task = asyncio.create_task(self._monitor_memory())
        
        # Generate consistent load
        load_task = asyncio.create_task(self._generate_consistent_load())
        
        # Wait for test duration
        await asyncio.sleep(self.test_duration_minutes * 60)
        
        # Stop monitoring and load
        monitoring_task.cancel()
        load_task.cancel()
        
        await asyncio.gather(monitoring_task, load_task, return_exceptions=True)
    
    async def _monitor_memory(self):
        """Monitor memory usage over time"""
        sample_count = 0
        
        while True:
            try:
                # Get process memory info
                process = psutil.Process()
                memory_info = process.memory_info()
                
                sample = {
                    'timestamp': datetime.now().isoformat(),
                    'sample_id': sample_count,
                    'rss_mb': memory_info.rss / 1024 / 1024,  # Resident Set Size
                    'vms_mb': memory_info.vms / 1024 / 1024,  # Virtual Memory Size
                    'percent': process.memory_percent()
                }
                
                self.memory_samples.append(sample)
                
                if sample_count % 12 == 0:  # Log every minute
                    self.logger.info(f"Memory sample {sample_count}: RSS={sample['rss_mb']:.1f}MB, "
                                   f"VMS={sample['vms_mb']:.1f}MB, Percent={sample['percent']:.2f}%")
                
                sample_count += 1
                await asyncio.sleep(5)  # Sample every 5 seconds
                
            except Exception as e:
                self.logger.warning(f"Failed to collect memory sample: {e}")
                await asyncio.sleep(5)
    
    async def _generate_consistent_load(self):
        """Generate consistent load for memory testing"""
        request_count = 0
        
        async with aiohttp.ClientSession() as session:
            while True:
                try:
                    # Vary request complexity to test different memory paths
                    if request_count % 4 == 0:
                        payload = {"input": "Simple question", "mode": "quick"}
                    elif request_count % 4 == 1:
                        payload = {"input": "Medium complexity reasoning task", "mode": "reasoning"}
                    elif request_count % 4 == 2:
                        payload = {"input": "Complex Romanian cultural analysis", "mode": "cultural"}
                    else:
                        payload = {"input": "Creative writing task with detailed output", "mode": "creative"}
                    
                    async with session.post(
                        f"{self.api_base_url}/api/v2/agi/inference",
                        json=payload,
                        timeout=30
                    ) as response:
                        await response.read()
                        request_count += 1
                
                except Exception:
                    pass  # Continue despite errors
                
                await asyncio.sleep(2)  # Consistent 2-second intervals
    
    async def validate_results(self) -> bool:
        """Validate memory leak test results"""
        if len(self.memory_samples) < 10:
            return False
        
        # Analyze memory trend
        rss_values = [s['rss_mb'] for s in self.memory_samples]
        timestamps = [datetime.fromisoformat(s['timestamp']) for s in self.memory_samples]
        
        # Calculate memory growth rate
        initial_memory = statistics.mean(rss_values[:5])  # First 5 samples
        final_memory = statistics.mean(rss_values[-5:])    # Last 5 samples
        memory_growth = final_memory - initial_memory
        growth_rate = memory_growth / (len(rss_values) / 12)  # MB per minute
        
        # Update metrics
        self.metrics.memory_usage_mb = final_memory
        self.metrics.custom_metrics = {
            'initial_memory_mb': initial_memory,
            'final_memory_mb': final_memory,
            'memory_growth_mb': memory_growth,
            'growth_rate_mb_per_min': growth_rate,
            'max_memory_mb': max(rss_values),
            'min_memory_mb': min(rss_values),
            'total_samples': len(self.memory_samples),
            'test_duration_minutes': self.test_duration_minutes
        }
        
        self.logger.info(f"Memory leak test results:")
        self.logger.info(f"  Initial memory: {initial_memory:.1f}MB")
        self.logger.info(f"  Final memory: {final_memory:.1f}MB")
        self.logger.info(f"  Growth: {memory_growth:.1f}MB")
        self.logger.info(f"  Growth rate: {growth_rate:.2f}MB/min")
        
        # Test passes if growth rate is acceptable (< 5MB per minute)
        acceptable_growth_rate = 5.0  # MB per minute
        return abs(growth_rate) < acceptable_growth_rate

# Factory function to create performance test suite
def create_performance_test_suite(base_url: str = "http://localhost:6100") -> 'TestSuite':
    """Create a comprehensive performance test suite"""
    from .core_testing_framework import TestSuite
    
    suite = TestSuite("Performance Tests", "Comprehensive performance and load testing")
    
    # Response time tests
    response_time_config = TestConfig.default_config("response_time", TestCategory.PERFORMANCE)
    response_time_config.base_url = base_url
    response_time_config.performance_threshold = {'max_response_time_ms': 2000}
    suite.add_test(ResponseTimeTest(response_time_config))
    
    # Throughput tests
    throughput_config = TestConfig.default_config("throughput", TestCategory.PERFORMANCE)
    throughput_config.base_url = base_url
    throughput_config.performance_threshold = {'min_throughput_ops_sec': 5.0}
    throughput_config.timeout_seconds = 120  # Longer timeout for throughput
    suite.add_test(ThroughputTest(throughput_config))
    
    # Load tests
    load_config = TestConfig.default_config("load_test", TestCategory.PERFORMANCE)
    load_config.base_url = base_url
    load_config.performance_threshold = {
        'max_memory_usage_mb': 4096,
        'max_cpu_usage_percent': 85
    }
    load_config.timeout_seconds = 180  # 3 minutes timeout
    suite.add_test(LoadTest(load_config))
    
    # Memory leak tests  
    memory_config = TestConfig.default_config("memory_leak", TestCategory.PERFORMANCE)
    memory_config.base_url = base_url
    memory_config.timeout_seconds = 1200  # 20 minutes timeout
    suite.add_test(MemoryLeakTest(memory_config))
    
    return suite

# Example usage
if __name__ == "__main__":
    async def test_performance():
        """Test performance capabilities"""
        logger.info("⚡ Testing RomAI Performance")
        
        # Create and execute performance test suite
        suite = create_performance_test_suite()
        results = await suite.execute_all()
        
        # Log summary
        for result in results:
            logger.info(f"Test: {result.test_name} - Status: {result.status.value} - "
                       f"Response Time: {result.response_time_ms:.1f}ms")
        
        return results
    
    # Run performance tests
    asyncio.run(test_performance())
    print("✅ Performance Tests completed")