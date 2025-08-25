"""
🧪 Core Testing Framework for RomAI AGI
Production-Ready Testing Infrastructure

This module provides the foundation for comprehensive testing of the RomAI AGI system:
- Base test classes and utilities
- Async test execution support
- Metrics collection and reporting
- Configuration management
- Test result validation

Modular design allows for extension with specific test suites:
- AGI capability tests
- Performance and load tests
- Security validation tests
- Integration tests

Author: RomAI Development Team
Version: 1.0.0-production
"""

import asyncio
import time
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable, Union, Tuple
from pathlib import Path
from enum import Enum
import traceback
from contextlib import asynccontextmanager
import aiohttp
import psutil
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('romai_testing')

class TestStatus(Enum):
    """Test execution status"""
    PENDING = "pending"
    RUNNING = "running" 
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    ERROR = "error"

class TestCategory(Enum):
    """Test categories for organization"""
    AGI_CAPABILITY = "agi_capability"
    PERFORMANCE = "performance"
    SECURITY = "security"
    INTEGRATION = "integration"
    RELIABILITY = "reliability"
    COMPLIANCE = "compliance"

@dataclass
class TestMetrics:
    """Comprehensive test execution metrics"""
    test_name: str
    category: TestCategory
    status: TestStatus
    duration: float
    start_time: datetime
    end_time: Optional[datetime] = None
    
    # Performance metrics
    memory_usage_mb: float = 0.0
    cpu_usage_percent: float = 0.0
    response_time_ms: float = 0.0
    throughput_ops_sec: float = 0.0
    
    # Quality metrics
    accuracy: float = 0.0
    confidence: float = 0.0
    error_rate: float = 0.0
    
    # Custom metrics
    custom_metrics: Dict[str, Any] = field(default_factory=dict)
    
    # Test details
    error_message: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        result = asdict(self)
        result['start_time'] = self.start_time.isoformat()
        result['end_time'] = self.end_time.isoformat() if self.end_time else None
        result['status'] = self.status.value
        result['category'] = self.category.value
        return result

@dataclass
class TestConfig:
    """Configuration for test execution"""
    # Basic settings
    test_name: str
    category: TestCategory
    timeout_seconds: int = 300
    retry_count: int = 0
    parallel_execution: bool = False
    
    # Test parameters
    test_data_size: int = 100
    performance_threshold: Dict[str, float] = field(default_factory=dict)
    expected_accuracy: float = 0.8
    
    # Environment settings
    base_url: str = "http://localhost:6100"
    api_key: Optional[str] = None
    test_environment: str = "local"
    
    # Reporting settings
    capture_logs: bool = True
    detailed_metrics: bool = True
    save_artifacts: bool = True
    
    @classmethod
    def default_config(cls, test_name: str, category: TestCategory) -> 'TestConfig':
        """Create default configuration"""
        return cls(
            test_name=test_name,
            category=category,
            performance_threshold={
                'max_response_time_ms': 5000,
                'min_accuracy': 0.8,
                'max_memory_usage_mb': 2048,
                'max_cpu_usage_percent': 80
            }
        )

class BaseTestCase(ABC):
    """Abstract base class for all test cases"""
    
    def __init__(self, config: TestConfig):
        self.config = config
        self.metrics = TestMetrics(
            test_name=config.test_name,
            category=config.category,
            status=TestStatus.PENDING,
            duration=0.0,
            start_time=datetime.now()
        )
        self.logger = logging.getLogger(f'test.{config.test_name}')
    
    async def execute(self) -> TestMetrics:
        """Execute the test case with full lifecycle management"""
        self.metrics.status = TestStatus.RUNNING
        self.metrics.start_time = datetime.now()
        
        try:
            # Pre-test setup
            await self.setup()
            
            # Execute test with timeout
            await asyncio.wait_for(
                self.run_test(), 
                timeout=self.config.timeout_seconds
            )
            
            # Validate results
            if await self.validate_results():
                self.metrics.status = TestStatus.PASSED
                self.logger.info(f"✅ Test passed: {self.config.test_name}")
            else:
                self.metrics.status = TestStatus.FAILED
                self.logger.error(f"❌ Test failed validation: {self.config.test_name}")
        
        except asyncio.TimeoutError:
            self.metrics.status = TestStatus.ERROR
            self.metrics.error_message = f"Test timed out after {self.config.timeout_seconds}s"
            self.logger.error(f"⏰ Test timeout: {self.config.test_name}")
        
        except Exception as e:
            self.metrics.status = TestStatus.ERROR
            self.metrics.error_message = str(e)
            self.logger.error(f"💥 Test error: {self.config.test_name} - {e}")
            if self.config.capture_logs:
                self.metrics.details['traceback'] = traceback.format_exc()
        
        finally:
            # Cleanup and finalize metrics
            await self.cleanup()
            self.metrics.end_time = datetime.now()
            self.metrics.duration = (self.metrics.end_time - self.metrics.start_time).total_seconds()
            
            # Collect system metrics
            if self.config.detailed_metrics:
                await self._collect_system_metrics()
        
        return self.metrics
    
    @abstractmethod
    async def setup(self):
        """Setup test environment and dependencies"""
        pass
    
    @abstractmethod
    async def run_test(self):
        """Execute the actual test logic"""
        pass
    
    @abstractmethod
    async def validate_results(self) -> bool:
        """Validate test results and determine pass/fail status"""
        pass
    
    async def cleanup(self):
        """Cleanup test resources (optional override)"""
        pass
    
    async def _collect_system_metrics(self):
        """Collect system performance metrics"""
        try:
            process = psutil.Process()
            memory_info = process.memory_info()
            cpu_percent = process.cpu_percent()
            
            self.metrics.memory_usage_mb = memory_info.rss / 1024 / 1024
            self.metrics.cpu_usage_percent = cpu_percent
        except Exception as e:
            self.logger.warning(f"Failed to collect system metrics: {e}")

class TestSuite:
    """Collection of test cases with execution management"""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.test_cases: List[BaseTestCase] = []
        self.execution_results: List[TestMetrics] = []
        self.logger = logging.getLogger(f'suite.{name}')
    
    def add_test(self, test_case: BaseTestCase):
        """Add a test case to the suite"""
        self.test_cases.append(test_case)
        self.logger.info(f"Added test: {test_case.config.test_name}")
    
    async def execute_all(self, parallel: bool = False) -> List[TestMetrics]:
        """Execute all tests in the suite"""
        self.logger.info(f"🚀 Executing test suite: {self.name} ({len(self.test_cases)} tests)")
        
        if parallel:
            results = await self._execute_parallel()
        else:
            results = await self._execute_sequential()
        
        self.execution_results = results
        self._log_summary()
        return results
    
    async def _execute_sequential(self) -> List[TestMetrics]:
        """Execute tests sequentially"""
        results = []
        for i, test_case in enumerate(self.test_cases, 1):
            self.logger.info(f"Running test {i}/{len(self.test_cases)}: {test_case.config.test_name}")
            result = await test_case.execute()
            results.append(result)
        return results
    
    async def _execute_parallel(self) -> List[TestMetrics]:
        """Execute tests in parallel"""
        tasks = [test_case.execute() for test_case in self.test_cases]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions from parallel execution
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                error_metrics = TestMetrics(
                    test_name=self.test_cases[i].config.test_name,
                    category=self.test_cases[i].config.category,
                    status=TestStatus.ERROR,
                    duration=0.0,
                    start_time=datetime.now(),
                    error_message=str(result)
                )
                processed_results.append(error_metrics)
            else:
                processed_results.append(result)
        
        return processed_results
    
    def _log_summary(self):
        """Log execution summary"""
        if not self.execution_results:
            return
        
        passed = sum(1 for r in self.execution_results if r.status == TestStatus.PASSED)
        failed = sum(1 for r in self.execution_results if r.status == TestStatus.FAILED)
        errors = sum(1 for r in self.execution_results if r.status == TestStatus.ERROR)
        total = len(self.execution_results)
        
        self.logger.info(f"📊 Test Suite Results: {passed}/{total} passed, {failed} failed, {errors} errors")

class TestRunner:
    """Advanced test runner with reporting and analysis"""
    
    def __init__(self, output_dir: str = "test_results"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.test_suites: List[TestSuite] = []
        self.global_results: List[TestMetrics] = []
        self.logger = logging.getLogger('test_runner')
    
    def add_suite(self, suite: TestSuite):
        """Add a test suite to the runner"""
        self.test_suites.append(suite)
        self.logger.info(f"Added test suite: {suite.name}")
    
    async def execute_all_suites(self, parallel_suites: bool = False) -> Dict[str, List[TestMetrics]]:
        """Execute all test suites"""
        self.logger.info(f"🎯 Starting execution of {len(self.test_suites)} test suites")
        start_time = datetime.now()
        
        suite_results = {}
        
        if parallel_suites:
            tasks = [(suite.name, suite.execute_all()) for suite in self.test_suites]
            results = await asyncio.gather(*[task[1] for task in tasks], return_exceptions=True)
            
            for (suite_name, _), result in zip(tasks, results):
                if isinstance(result, Exception):
                    self.logger.error(f"Suite {suite_name} failed: {result}")
                    suite_results[suite_name] = []
                else:
                    suite_results[suite_name] = result
        else:
            for suite in self.test_suites:
                self.logger.info(f"Executing suite: {suite.name}")
                results = await suite.execute_all()
                suite_results[suite.name] = results
        
        # Aggregate all results
        for results in suite_results.values():
            self.global_results.extend(results)
        
        execution_time = (datetime.now() - start_time).total_seconds()
        self.logger.info(f"✅ All test suites completed in {execution_time:.2f}s")
        
        # Generate comprehensive report
        await self.generate_report(suite_results, execution_time)
        
        return suite_results
    
    async def generate_report(self, suite_results: Dict[str, List[TestMetrics]], execution_time: float):
        """Generate comprehensive test report"""
        report_data = {
            'execution_summary': {
                'total_execution_time': execution_time,
                'timestamp': datetime.now().isoformat(),
                'total_tests': len(self.global_results),
                'passed': sum(1 for r in self.global_results if r.status == TestStatus.PASSED),
                'failed': sum(1 for r in self.global_results if r.status == TestStatus.FAILED),
                'errors': sum(1 for r in self.global_results if r.status == TestStatus.ERROR)
            },
            'suite_results': {
                suite_name: [result.to_dict() for result in results]
                for suite_name, results in suite_results.items()
            },
            'performance_analysis': self._analyze_performance(),
            'failure_analysis': self._analyze_failures()
        }
        
        # Save detailed JSON report
        json_report_path = self.output_dir / f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_report_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        # Generate human-readable summary
        summary_path = self.output_dir / f"test_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        await self._generate_text_summary(report_data, summary_path)
        
        self.logger.info(f"📄 Reports generated: {json_report_path}, {summary_path}")
    
    def _analyze_performance(self) -> Dict[str, Any]:
        """Analyze performance metrics across all tests"""
        if not self.global_results:
            return {}
        
        durations = [r.duration for r in self.global_results if r.duration > 0]
        response_times = [r.response_time_ms for r in self.global_results if r.response_time_ms > 0]
        memory_usage = [r.memory_usage_mb for r in self.global_results if r.memory_usage_mb > 0]
        
        return {
            'average_duration': np.mean(durations) if durations else 0,
            'max_duration': max(durations) if durations else 0,
            'average_response_time': np.mean(response_times) if response_times else 0,
            'max_response_time': max(response_times) if response_times else 0,
            'average_memory_usage': np.mean(memory_usage) if memory_usage else 0,
            'peak_memory_usage': max(memory_usage) if memory_usage else 0,
            'total_tests_analyzed': len(self.global_results)
        }
    
    def _analyze_failures(self) -> Dict[str, Any]:
        """Analyze test failures and common issues"""
        failed_tests = [r for r in self.global_results if r.status in [TestStatus.FAILED, TestStatus.ERROR]]
        
        if not failed_tests:
            return {'total_failures': 0}
        
        # Group by error types
        error_types = {}
        for test in failed_tests:
            if test.error_message:
                error_type = type(test.error_message).__name__ if hasattr(test.error_message, '__name__') else 'Unknown'
                error_types[error_type] = error_types.get(error_type, 0) + 1
        
        # Group by category
        failure_by_category = {}
        for test in failed_tests:
            category = test.category.value
            failure_by_category[category] = failure_by_category.get(category, 0) + 1
        
        return {
            'total_failures': len(failed_tests),
            'failure_rate': len(failed_tests) / len(self.global_results) * 100,
            'error_types': error_types,
            'failures_by_category': failure_by_category,
            'failed_tests': [
                {
                    'test_name': test.test_name,
                    'category': test.category.value,
                    'error': test.error_message
                } for test in failed_tests[:10]  # Top 10 failures
            ]
        }
    
    async def _generate_text_summary(self, report_data: Dict, output_path: Path):
        """Generate human-readable test summary"""
        summary = report_data['execution_summary']
        performance = report_data['performance_analysis']
        failures = report_data['failure_analysis']
        
        content = f"""
RomAI AGI Test Execution Summary
{'=' * 50}

Execution Overview:
- Total Tests: {summary['total_tests']}
- Passed: {summary['passed']} ({summary['passed']/summary['total_tests']*100:.1f}%)
- Failed: {summary['failed']} ({summary['failed']/summary['total_tests']*100:.1f}%)
- Errors: {summary['errors']} ({summary['errors']/summary['total_tests']*100:.1f}%)
- Total Execution Time: {summary['total_execution_time']:.2f}s
- Timestamp: {summary['timestamp']}

Performance Analysis:
- Average Test Duration: {performance.get('average_duration', 0):.2f}s
- Maximum Test Duration: {performance.get('max_duration', 0):.2f}s
- Average Response Time: {performance.get('average_response_time', 0):.1f}ms
- Peak Memory Usage: {performance.get('peak_memory_usage', 0):.1f}MB

"""
        
        if failures.get('total_failures', 0) > 0:
            content += f"""
Failure Analysis:
- Total Failures: {failures['total_failures']}
- Failure Rate: {failures['failure_rate']:.1f}%
- Failures by Category: {failures.get('failures_by_category', {})}

Recent Failed Tests:
"""
            for failed_test in failures.get('failed_tests', [])[:5]:
                content += f"- {failed_test['test_name']} ({failed_test['category']}): {failed_test['error']}\n"
        
        content += f"""

Test Suite Results:
{'=' * 20}
"""
        
        for suite_name, results in report_data['suite_results'].items():
            passed = sum(1 for r in results if r['status'] == 'passed')
            total = len(results)
            content += f"- {suite_name}: {passed}/{total} passed\n"
        
        with open(output_path, 'w') as f:
            f.write(content)

class MockTestCase(BaseTestCase):
    """Example test case implementation for demonstration"""
    
    async def setup(self):
        """Setup mock test environment"""
        self.logger.info("Setting up mock test")
        self.test_data = {"mock": "data"}
    
    async def run_test(self):
        """Execute mock test"""
        await asyncio.sleep(0.1)  # Simulate test execution
        self.metrics.accuracy = 0.95
        self.metrics.response_time_ms = 150
        self.metrics.custom_metrics = {"mock_metric": "success"}
    
    async def validate_results(self) -> bool:
        """Validate mock test results"""
        return self.metrics.accuracy >= self.config.expected_accuracy

# Utility functions for test management
@asynccontextmanager
async def test_environment(base_url: str = "http://localhost:6100"):
    """Context manager for test environment setup"""
    logger.info(f"Setting up test environment: {base_url}")
    
    # Setup code here (e.g., database connections, service health checks)
    session = aiohttp.ClientSession()
    
    try:
        # Validate environment is ready
        async with session.get(f"{base_url}/health") as response:
            if response.status != 200:
                raise Exception(f"Test environment not ready: {response.status}")
        
        yield session
    finally:
        # Cleanup
        await session.close()
        logger.info("Test environment cleaned up")

async def wait_for_service(url: str, timeout: int = 60) -> bool:
    """Wait for a service to become available"""
    logger.info(f"Waiting for service: {url}")
    start_time = time.time()
    
    async with aiohttp.ClientSession() as session:
        while time.time() - start_time < timeout:
            try:
                async with session.get(url) as response:
                    if response.status == 200:
                        logger.info(f"✅ Service ready: {url}")
                        return True
            except:
                pass
            
            await asyncio.sleep(2)
    
    logger.error(f"❌ Service not ready within {timeout}s: {url}")
    return False

# Example usage
if __name__ == "__main__":
    async def demo_test_framework():
        """Demonstrate the core testing framework"""
        logger.info("🧪 Demonstrating Core Testing Framework")
        
        # Create test configuration
        config = TestConfig.default_config("demo_test", TestCategory.AGI_CAPABILITY)
        
        # Create and execute a mock test
        test_case = MockTestCase(config)
        result = await test_case.execute()
        
        logger.info(f"Test result: {result.status.value}")
        logger.info(f"Test metrics: {result.to_dict()}")
        
        # Create test suite
        suite = TestSuite("Demo Suite", "Demonstration of testing framework")
        suite.add_test(test_case)
        
        # Execute suite
        suite_results = await suite.execute_all()
        
        # Create test runner
        runner = TestRunner("demo_results")
        runner.add_suite(suite)
        
        # Execute all suites and generate report
        all_results = await runner.execute_all_suites()
        
        return all_results
    
    # Run demonstration
    asyncio.run(demo_test_framework())
    print("✅ Core Testing Framework demonstration completed")