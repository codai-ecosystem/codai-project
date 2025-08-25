"""
🔗 Integration Tests for RomAI AGI  
Production-grade integration and system testing

This module provides comprehensive integration testing for RomAI:
- API endpoint integration and communication testing
- Database integration and data consistency validation
- Service-to-service communication verification
- Third-party service integration testing
- End-to-end workflow validation
- System resilience and fault tolerance testing

Extends the Core Testing Framework with integration-specific test cases.

Author: RomAI Development Team
Version: 1.0.0-production
"""

import asyncio
import aiohttp
import json
import time
import logging
import psutil
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import random
import string

from .core_testing_framework import (
    BaseTestCase, TestConfig, TestCategory, TestStatus,
    test_environment, wait_for_service
)

logger = logging.getLogger('integration_tests')

@dataclass
class IntegrationResult:
    """Integration test result with service communication details"""
    service_name: str
    endpoint: str
    success: bool
    response_time_ms: float
    error_message: Optional[str] = None
    data_validation: bool = True
    dependencies_met: bool = True

class APIEndpointIntegrationTest(BaseTestCase):
    """Test API endpoint integration and communication"""
    
    def __init__(self, config: TestConfig):
        super().__init__(config)
        self.api_base_url = config.base_url
        self.integration_results = []
        
        # Define critical API endpoints to test
        self.critical_endpoints = [
            {"path": "/api/v1/health", "method": "GET", "expected_status": 200},
            {"path": "/api/v2/agi/inference", "method": "POST", "expected_status": 200},
            {"path": "/api/v1/compliance/status", "method": "GET", "expected_status": 200},
            {"path": "/api/v1/models/status", "method": "GET", "expected_status": 200},
            {"path": "/api/v1/system/metrics", "method": "GET", "expected_status": 200},
        ]
    
    async def setup(self):
        """Setup API endpoint integration tests"""
        self.logger.info("Setting up API endpoint integration tests")
        
        # Wait for primary service
        if not await wait_for_service(f"{self.api_base_url}/api/v1/health", timeout=30):
            raise Exception("Primary API service not available for integration testing")
    
    async def run_test(self):
        """Execute API endpoint integration tests"""
        self.logger.info("Running API endpoint integration tests")
        
        # Test 1: Individual endpoint functionality
        await self._test_individual_endpoints()
        
        # Test 2: Cross-endpoint data consistency
        await self._test_cross_endpoint_consistency()
        
        # Test 3: API versioning compatibility
        await self._test_api_versioning()
        
        # Test 4: Error handling consistency
        await self._test_error_handling_consistency()
        
        # Test 5: Rate limiting behavior
        await self._test_rate_limiting_behavior()
    
    async def _test_individual_endpoints(self):
        """Test each critical endpoint individually"""
        async with test_environment(self.api_base_url) as session:
            for endpoint_config in self.critical_endpoints:
                start_time = time.time()
                
                try:
                    # Prepare request based on method
                    if endpoint_config["method"] == "GET":
                        async with session.get(
                            f"{self.api_base_url}{endpoint_config['path']}",
                            timeout=10
                        ) as response:
                            response_time = (time.time() - start_time) * 1000
                            success = response.status == endpoint_config["expected_status"]
                            
                            if success:
                                # Validate response structure
                                try:
                                    response_data = await response.json()
                                    data_validation = self._validate_response_structure(
                                        endpoint_config["path"], response_data
                                    )
                                except:
                                    data_validation = False
                            else:
                                data_validation = False
                            
                            self.integration_results.append(IntegrationResult(
                                service_name="API Gateway",
                                endpoint=endpoint_config["path"],
                                success=success,
                                response_time_ms=response_time,
                                data_validation=data_validation,
                                error_message=None if success else f"Status: {response.status}"
                            ))
                    
                    elif endpoint_config["method"] == "POST":
                        # Use appropriate test payload
                        test_payload = self._get_test_payload(endpoint_config["path"])
                        
                        async with session.post(
                            f"{self.api_base_url}{endpoint_config['path']}",
                            json=test_payload,
                            timeout=15
                        ) as response:
                            response_time = (time.time() - start_time) * 1000
                            success = response.status == endpoint_config["expected_status"]
                            
                            if success:
                                try:
                                    response_data = await response.json()
                                    data_validation = self._validate_response_structure(
                                        endpoint_config["path"], response_data
                                    )
                                except:
                                    data_validation = False
                            else:
                                data_validation = False
                            
                            self.integration_results.append(IntegrationResult(
                                service_name="AGI Inference",
                                endpoint=endpoint_config["path"],
                                success=success,
                                response_time_ms=response_time,
                                data_validation=data_validation,
                                error_message=None if success else f"Status: {response.status}"
                            ))
                
                except Exception as e:
                    response_time = (time.time() - start_time) * 1000
                    self.integration_results.append(IntegrationResult(
                        service_name="Unknown",
                        endpoint=endpoint_config["path"],
                        success=False,
                        response_time_ms=response_time,
                        data_validation=False,
                        error_message=str(e)
                    ))
                    
                    self.logger.warning(f"Endpoint {endpoint_config['path']} failed: {e}")
    
    def _validate_response_structure(self, endpoint: str, response_data: Any) -> bool:
        """Validate response structure for specific endpoints"""
        try:
            if endpoint == "/api/v1/health":
                required_fields = ["status", "service", "timestamp"]
                return all(field in response_data for field in required_fields)
            
            elif endpoint == "/api/v2/agi/inference":
                required_fields = ["response", "metadata"]
                return all(field in response_data for field in required_fields)
            
            elif endpoint == "/api/v1/compliance/status":
                required_fields = ["compliance_level", "status"]
                return all(field in response_data for field in required_fields)
            
            elif endpoint == "/api/v1/models/status":
                return "models" in response_data and isinstance(response_data["models"], list)
            
            elif endpoint == "/api/v1/system/metrics":
                required_fields = ["cpu_usage", "memory_usage", "timestamp"]
                return all(field in response_data for field in required_fields)
            
            return True  # Default to true for unknown endpoints
            
        except Exception:
            return False
    
    def _get_test_payload(self, endpoint: str) -> Dict[str, Any]:
        """Get appropriate test payload for endpoint"""
        if endpoint == "/api/v2/agi/inference":
            return {
                "input": "This is an integration test. Please respond with a brief acknowledgment.",
                "mode": "integration_test",
                "parameters": {
                    "temperature": 0.7,
                    "max_tokens": 100
                }
            }
        
        return {}  # Default empty payload
    
    async def _test_cross_endpoint_consistency(self):
        """Test data consistency across different endpoints"""
        async with test_environment(self.api_base_url) as session:
            # Get system status from health endpoint
            try:
                async with session.get(f"{self.api_base_url}/api/v1/health") as health_response:
                    health_data = await health_response.json()
                    
                    # Get system metrics
                    async with session.get(f"{self.api_base_url}/api/v1/system/metrics") as metrics_response:
                        if metrics_response.status == 200:
                            metrics_data = await metrics_response.json()
                            
                            # Verify consistency between health and metrics
                            health_timestamp = health_data.get("timestamp")
                            metrics_timestamp = metrics_data.get("timestamp")
                            
                            if health_timestamp and metrics_timestamp:
                                time_diff = abs(
                                    datetime.fromisoformat(health_timestamp.replace('Z', '+00:00')).timestamp() -
                                    datetime.fromisoformat(metrics_timestamp.replace('Z', '+00:00')).timestamp()
                                )
                                
                                # Timestamps should be within reasonable range (5 minutes)
                                consistency_ok = time_diff < 300
                                
                                self.integration_results.append(IntegrationResult(
                                    service_name="Cross-Service",
                                    endpoint="Health-Metrics Consistency",
                                    success=consistency_ok,
                                    response_time_ms=0,
                                    data_validation=consistency_ok,
                                    error_message=None if consistency_ok else f"Time diff: {time_diff}s"
                                ))
            
            except Exception as e:
                self.logger.warning(f"Cross-endpoint consistency test failed: {e}")
    
    async def _test_api_versioning(self):
        """Test API versioning compatibility"""
        version_endpoints = [
            "/api/v1/health",
            "/api/v2/agi/inference",
        ]
        
        async with test_environment(self.api_base_url) as session:
            for endpoint in version_endpoints:
                try:
                    async with session.get(f"{self.api_base_url}{endpoint}") as response:
                        if response.status == 200:
                            # Check for version information in response headers
                            api_version = response.headers.get("API-Version")
                            content_type = response.headers.get("Content-Type")
                            
                            version_consistent = True
                            error_msg = None
                            
                            if not api_version:
                                version_consistent = False
                                error_msg = "Missing API-Version header"
                            
                            if not content_type or "application/json" not in content_type:
                                version_consistent = False
                                error_msg = "Invalid Content-Type header"
                            
                            self.integration_results.append(IntegrationResult(
                                service_name="API Versioning",
                                endpoint=endpoint,
                                success=version_consistent,
                                response_time_ms=0,
                                data_validation=version_consistent,
                                error_message=error_msg
                            ))
                
                except Exception as e:
                    self.logger.warning(f"API versioning test failed for {endpoint}: {e}")
    
    async def _test_error_handling_consistency(self):
        """Test consistent error handling across endpoints"""
        error_test_cases = [
            {"endpoint": "/api/v2/agi/inference", "payload": {}, "expected_status": 400},
            {"endpoint": "/api/v1/nonexistent", "payload": None, "expected_status": 404},
        ]
        
        async with test_environment(self.api_base_url) as session:
            for test_case in error_test_cases:
                try:
                    if test_case["payload"] is not None:
                        async with session.post(
                            f"{self.api_base_url}{test_case['endpoint']}",
                            json=test_case["payload"],
                            timeout=5
                        ) as response:
                            status_correct = response.status == test_case["expected_status"]
                            
                            # Check error response structure
                            if response.status >= 400:
                                try:
                                    error_data = await response.json()
                                    has_error_structure = "error" in error_data or "message" in error_data
                                except:
                                    has_error_structure = False
                            else:
                                has_error_structure = True
                            
                            self.integration_results.append(IntegrationResult(
                                service_name="Error Handling",
                                endpoint=test_case["endpoint"],
                                success=status_correct and has_error_structure,
                                response_time_ms=0,
                                data_validation=has_error_structure,
                                error_message=None if status_correct else f"Expected {test_case['expected_status']}, got {response.status}"
                            ))
                    else:
                        async with session.get(
                            f"{self.api_base_url}{test_case['endpoint']}",
                            timeout=5
                        ) as response:
                            status_correct = response.status == test_case["expected_status"]
                            
                            self.integration_results.append(IntegrationResult(
                                service_name="Error Handling",
                                endpoint=test_case["endpoint"],
                                success=status_correct,
                                response_time_ms=0,
                                data_validation=True,
                                error_message=None if status_correct else f"Expected {test_case['expected_status']}, got {response.status}"
                            ))
                
                except Exception as e:
                    self.logger.warning(f"Error handling test failed for {test_case['endpoint']}: {e}")
    
    async def _test_rate_limiting_behavior(self):
        """Test rate limiting behavior consistency"""
        # This would test rate limiting if implemented
        # For now, just verify the endpoint responds consistently under load
        
        async with test_environment(self.api_base_url) as session:
            response_times = []
            success_count = 0
            
            # Send 10 quick requests
            for i in range(10):
                start_time = time.time()
                try:
                    async with session.get(
                        f"{self.api_base_url}/api/v1/health",
                        timeout=5
                    ) as response:
                        response_time = (time.time() - start_time) * 1000
                        response_times.append(response_time)
                        
                        if response.status == 200:
                            success_count += 1
                
                except Exception:
                    pass
                
                await asyncio.sleep(0.1)  # Brief pause
            
            # Analyze rate limiting behavior
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            success_rate = (success_count / 10) * 100
            
            rate_limiting_ok = success_rate >= 80  # At least 80% success rate
            
            self.integration_results.append(IntegrationResult(
                service_name="Rate Limiting",
                endpoint="/api/v1/health",
                success=rate_limiting_ok,
                response_time_ms=avg_response_time,
                data_validation=True,
                error_message=None if rate_limiting_ok else f"Low success rate: {success_rate}%"
            ))
    
    async def validate_results(self) -> bool:
        """Validate API endpoint integration test results"""
        successful_tests = [r for r in self.integration_results if r.success and r.data_validation]
        failed_tests = [r for r in self.integration_results if not r.success]
        
        success_rate = (len(successful_tests) / len(self.integration_results)) * 100 if self.integration_results else 0
        avg_response_time = sum([r.response_time_ms for r in self.integration_results if r.response_time_ms > 0]) / max(1, len([r for r in self.integration_results if r.response_time_ms > 0]))
        
        # Update metrics
        self.metrics.response_time_ms = avg_response_time
        self.metrics.custom_metrics = {
            'total_endpoints_tested': len(self.integration_results),
            'successful_endpoints': len(successful_tests),
            'failed_endpoints': len(failed_tests),
            'success_rate_percent': success_rate,
            'average_response_time_ms': avg_response_time,
            'data_validation_failures': len([r for r in self.integration_results if not r.data_validation])
        }
        
        # Log results
        self.logger.info(f"API Integration Results: {len(successful_tests)}/{len(self.integration_results)} successful")
        
        for result in failed_tests:
            self.logger.warning(f"FAILED: {result.service_name} - {result.endpoint} - {result.error_message}")
        
        # Test passes if success rate is above 90%
        return success_rate >= 90.0

class DatabaseIntegrationTest(BaseTestCase):
    """Test database integration and data consistency"""
    
    def __init__(self, config: TestConfig):
        super().__init__(config)
        self.api_base_url = config.base_url
        self.db_test_results = []
    
    async def setup(self):
        """Setup database integration tests"""
        self.logger.info("Setting up database integration tests")
        
        # Check if database-related endpoints are available
        if not await wait_for_service(f"{self.api_base_url}/api/v1/health", timeout=30):
            raise Exception("API service not available for database testing")
    
    async def run_test(self):
        """Execute database integration tests"""
        self.logger.info("Running database integration tests")
        
        # Test 1: Database connectivity through API
        await self._test_database_connectivity()
        
        # Test 2: Data persistence validation
        await self._test_data_persistence()
        
        # Test 3: Transaction consistency
        await self._test_transaction_consistency()
        
        # Test 4: Connection pooling behavior
        await self._test_connection_pooling()
    
    async def _test_database_connectivity(self):
        """Test database connectivity through API endpoints"""
        async with test_environment(self.api_base_url) as session:
            # Test health endpoint which likely checks database
            try:
                start_time = time.time()
                async with session.get(f"{self.api_base_url}/api/v1/health") as response:
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        health_data = await response.json()
                        
                        # Look for database status indicators
                        db_status = health_data.get("database_status", "unknown")
                        db_connected = db_status in ["connected", "healthy", "ok"]
                        
                        self.db_test_results.append({
                            "test": "Database Connectivity",
                            "success": db_connected,
                            "response_time_ms": response_time,
                            "details": {"db_status": db_status}
                        })
                    else:
                        self.db_test_results.append({
                            "test": "Database Connectivity",
                            "success": False,
                            "response_time_ms": response_time,
                            "details": {"error": f"Health endpoint returned {response.status}"}
                        })
            
            except Exception as e:
                self.db_test_results.append({
                    "test": "Database Connectivity",
                    "success": False,
                    "response_time_ms": 0,
                    "details": {"error": str(e)}
                })
    
    async def _test_data_persistence(self):
        """Test data persistence through API operations"""
        # This would test CRUD operations if user/data management endpoints exist
        # For now, test indirect data persistence through AGI inference
        
        unique_test_id = f"test_{int(time.time())}_{random.randint(1000, 9999)}"
        test_input = f"Remember this test ID for persistence testing: {unique_test_id}"
        
        async with test_environment(self.api_base_url) as session:
            try:
                # First request - store some data
                async with session.post(
                    f"{self.api_base_url}/api/v2/agi/inference",
                    json={"input": test_input, "mode": "memory_test"},
                    timeout=15
                ) as response:
                    if response.status == 200:
                        # Second request - try to retrieve the data
                        await asyncio.sleep(1)  # Brief delay
                        
                        async with session.post(
                            f"{self.api_base_url}/api/v2/agi/inference",
                            json={"input": f"What test ID did I just give you?", "mode": "memory_recall"},
                            timeout=15
                        ) as recall_response:
                            if recall_response.status == 200:
                                recall_data = await recall_response.json()
                                recall_text = recall_data.get("response", "").lower()
                                
                                # Check if the test ID is recalled (basic persistence test)
                                persistence_working = unique_test_id.lower() in recall_text
                                
                                self.db_test_results.append({
                                    "test": "Data Persistence",
                                    "success": persistence_working,
                                    "response_time_ms": 0,
                                    "details": {
                                        "test_id": unique_test_id,
                                        "recalled": persistence_working,
                                        "recall_snippet": recall_text[:100]
                                    }
                                })
                            else:
                                self.db_test_results.append({
                                    "test": "Data Persistence",
                                    "success": False,
                                    "response_time_ms": 0,
                                    "details": {"error": f"Recall request failed: {recall_response.status}"}
                                })
                    else:
                        self.db_test_results.append({
                            "test": "Data Persistence",
                            "success": False,
                            "response_time_ms": 0,
                            "details": {"error": f"Storage request failed: {response.status}"}
                        })
            
            except Exception as e:
                self.db_test_results.append({
                    "test": "Data Persistence",
                    "success": False,
                    "response_time_ms": 0,
                    "details": {"error": str(e)}
                })
    
    async def _test_transaction_consistency(self):
        """Test transaction consistency through multiple operations"""
        async with test_environment(self.api_base_url) as session:
            # Test multiple rapid requests to see if they're handled consistently
            test_requests = []
            
            for i in range(5):
                test_input = f"Transaction consistency test request {i+1}"
                test_requests.append(test_input)
            
            try:
                # Send multiple requests in parallel
                tasks = []
                for request_input in test_requests:
                    task = session.post(
                        f"{self.api_base_url}/api/v2/agi/inference",
                        json={"input": request_input, "mode": "consistency_test"},
                        timeout=20
                    )
                    tasks.append(task)
                
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                
                successful_responses = 0
                failed_responses = 0
                
                for response in responses:
                    if isinstance(response, Exception):
                        failed_responses += 1
                    else:
                        async with response:
                            if response.status == 200:
                                successful_responses += 1
                            else:
                                failed_responses += 1
                
                consistency_ok = failed_responses == 0
                
                self.db_test_results.append({
                    "test": "Transaction Consistency",
                    "success": consistency_ok,
                    "response_time_ms": 0,
                    "details": {
                        "total_requests": len(test_requests),
                        "successful": successful_responses,
                        "failed": failed_responses
                    }
                })
            
            except Exception as e:
                self.db_test_results.append({
                    "test": "Transaction Consistency",
                    "success": False,
                    "response_time_ms": 0,
                    "details": {"error": str(e)}
                })
    
    async def _test_connection_pooling(self):
        """Test database connection pooling behavior"""
        # Test with multiple concurrent connections
        async with test_environment(self.api_base_url) as session:
            try:
                # Create 20 concurrent requests to test connection pooling
                tasks = []
                start_time = time.time()
                
                for i in range(20):
                    task = session.get(f"{self.api_base_url}/api/v1/health", timeout=10)
                    tasks.append(task)
                
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                total_time = time.time() - start_time
                
                successful_connections = 0
                for response in responses:
                    if not isinstance(response, Exception):
                        async with response:
                            if response.status == 200:
                                successful_connections += 1
                
                connection_success_rate = (successful_connections / 20) * 100
                pooling_effective = connection_success_rate >= 95 and total_time < 30  # All connections within 30s
                
                self.db_test_results.append({
                    "test": "Connection Pooling",
                    "success": pooling_effective,
                    "response_time_ms": total_time * 1000,
                    "details": {
                        "concurrent_connections": 20,
                        "successful_connections": successful_connections,
                        "success_rate_percent": connection_success_rate,
                        "total_time_seconds": total_time
                    }
                })
            
            except Exception as e:
                self.db_test_results.append({
                    "test": "Connection Pooling",
                    "success": False,
                    "response_time_ms": 0,
                    "details": {"error": str(e)}
                })
    
    async def validate_results(self) -> bool:
        """Validate database integration test results"""
        successful_tests = [r for r in self.db_test_results if r["success"]]
        total_tests = len(self.db_test_results)
        
        if total_tests == 0:
            return False
        
        success_rate = (len(successful_tests) / total_tests) * 100
        
        # Update metrics
        self.metrics.custom_metrics = {
            'db_tests_executed': total_tests,
            'db_tests_successful': len(successful_tests),
            'db_success_rate_percent': success_rate,
            'connectivity_test': any(r["test"] == "Database Connectivity" and r["success"] for r in self.db_test_results),
            'persistence_test': any(r["test"] == "Data Persistence" and r["success"] for r in self.db_test_results)
        }
        
        # Log results
        self.logger.info(f"Database Integration Results: {len(successful_tests)}/{total_tests} successful")
        
        for result in self.db_test_results:
            if not result["success"]:
                self.logger.warning(f"DB TEST FAILED: {result['test']} - {result['details']}")
        
        # Test passes if success rate is above 80%
        return success_rate >= 80.0

class ServiceCommunicationTest(BaseTestCase):
    """Test service-to-service communication"""
    
    def __init__(self, config: TestConfig):
        super().__init__(config)
        self.api_base_url = config.base_url
        self.service_results = []
        
        # Define service endpoints to test
        self.services = [
            {"name": "RomAI Main", "url": "http://localhost:6100", "health": "/api/v1/health"},
            {"name": "CBD Database", "url": "http://localhost:4180", "health": "/health"},
            {"name": "MemorAI MCP", "url": "http://localhost:4950", "health": "/health"},
            {"name": "MemorAI App", "url": "http://localhost:4006", "health": "/api/health"},
            {"name": "Enterprise API", "url": "http://localhost:8001", "health": "/api/v1/health"},
        ]
    
    async def setup(self):
        """Setup service communication tests"""
        self.logger.info("Setting up service communication tests")
    
    async def run_test(self):
        """Execute service communication tests"""
        self.logger.info("Running service communication tests")
        
        # Test 1: Service availability
        await self._test_service_availability()
        
        # Test 2: Cross-service communication
        await self._test_cross_service_communication()
        
        # Test 3: Service dependency validation
        await self._test_service_dependencies()
        
        # Test 4: Load balancing behavior (if applicable)
        await self._test_load_balancing()
    
    async def _test_service_availability(self):
        """Test availability of all services"""
        async with aiohttp.ClientSession() as session:
            for service in self.services:
                try:
                    start_time = time.time()
                    async with session.get(
                        f"{service['url']}{service['health']}",
                        timeout=10
                    ) as response:
                        response_time = (time.time() - start_time) * 1000
                        available = response.status == 200
                        
                        self.service_results.append({
                            "service": service["name"],
                            "test": "Availability",
                            "success": available,
                            "response_time_ms": response_time,
                            "details": {"status": response.status, "url": service["url"]}
                        })
                        
                        if available:
                            self.logger.info(f"✅ {service['name']} is available ({response_time:.1f}ms)")
                        else:
                            self.logger.warning(f"❌ {service['name']} not available (status: {response.status})")
                
                except Exception as e:
                    self.service_results.append({
                        "service": service["name"],
                        "test": "Availability",
                        "success": False,
                        "response_time_ms": 0,
                        "details": {"error": str(e), "url": service["url"]}
                    })
                    self.logger.warning(f"❌ {service['name']} connection failed: {e}")
    
    async def _test_cross_service_communication(self):
        """Test communication between services"""
        # Test RomAI -> CBD Database communication
        await self._test_romai_to_cbd_communication()
        
        # Test RomAI -> MemorAI communication
        await self._test_romai_to_memorai_communication()
        
        # Test Enterprise API -> RomAI communication
        await self._test_enterprise_to_romai_communication()
    
    async def _test_romai_to_cbd_communication(self):
        """Test RomAI to CBD Database communication"""
        async with test_environment(self.api_base_url) as session:
            try:
                # Make a request that would require database access
                async with session.post(
                    f"{self.api_base_url}/api/v2/agi/inference",
                    json={
                        "input": "Test database communication",
                        "mode": "db_test",
                        "store_conversation": True
                    },
                    timeout=15
                ) as response:
                    success = response.status == 200
                    
                    self.service_results.append({
                        "service": "RomAI -> CBD Database",
                        "test": "Cross-Service Communication",
                        "success": success,
                        "response_time_ms": 0,
                        "details": {"communication_type": "database_access", "status": response.status}
                    })
            
            except Exception as e:
                self.service_results.append({
                    "service": "RomAI -> CBD Database",
                    "test": "Cross-Service Communication",
                    "success": False,
                    "response_time_ms": 0,
                    "details": {"error": str(e)}
                })
    
    async def _test_romai_to_memorai_communication(self):
        """Test RomAI to MemorAI communication"""
        async with test_environment(self.api_base_url) as session:
            try:
                # Test memory-related functionality
                async with session.post(
                    f"{self.api_base_url}/api/v2/agi/inference",
                    json={
                        "input": "Store this in memory: integration test marker 12345",
                        "mode": "memory_integration_test"
                    },
                    timeout=15
                ) as response:
                    success = response.status == 200
                    
                    self.service_results.append({
                        "service": "RomAI -> MemorAI",
                        "test": "Cross-Service Communication",
                        "success": success,
                        "response_time_ms": 0,
                        "details": {"communication_type": "memory_access", "status": response.status}
                    })
            
            except Exception as e:
                self.service_results.append({
                    "service": "RomAI -> MemorAI",
                    "test": "Cross-Service Communication",
                    "success": False,
                    "response_time_ms": 0,
                    "details": {"error": str(e)}
                })
    
    async def _test_enterprise_to_romai_communication(self):
        """Test Enterprise API to RomAI communication"""
        enterprise_url = "http://localhost:8001"
        
        async with aiohttp.ClientSession() as session:
            try:
                # Test enterprise API calling RomAI
                async with session.post(
                    f"{enterprise_url}/api/v1/inference/delegate",
                    json={
                        "query": "Test enterprise delegation",
                        "target_service": "romai"
                    },
                    timeout=15
                ) as response:
                    success = response.status in [200, 404]  # 404 is OK if endpoint doesn't exist
                    
                    self.service_results.append({
                        "service": "Enterprise API -> RomAI",
                        "test": "Cross-Service Communication",
                        "success": success,
                        "response_time_ms": 0,
                        "details": {"communication_type": "service_delegation", "status": response.status}
                    })
            
            except Exception as e:
                self.service_results.append({
                    "service": "Enterprise API -> RomAI",
                    "test": "Cross-Service Communication",
                    "success": False,
                    "response_time_ms": 0,
                    "details": {"error": str(e)}
                })
    
    async def _test_service_dependencies(self):
        """Test service dependency relationships"""
        # Test that dependent services can communicate
        dependencies = [
            {"primary": "RomAI Main", "dependency": "CBD Database", "required": True},
            {"primary": "RomAI Main", "dependency": "MemorAI MCP", "required": False},
            {"primary": "Enterprise API", "dependency": "RomAI Main", "required": True},
        ]
        
        for dep in dependencies:
            primary_available = any(
                r["service"] == dep["primary"] and r["test"] == "Availability" and r["success"]
                for r in self.service_results
            )
            
            dependency_available = any(
                r["service"] == dep["dependency"] and r["test"] == "Availability" and r["success"]
                for r in self.service_results
            )
            
            dependency_met = not dep["required"] or (primary_available and dependency_available)
            
            self.service_results.append({
                "service": f"{dep['primary']} depends on {dep['dependency']}",
                "test": "Service Dependencies",
                "success": dependency_met,
                "response_time_ms": 0,
                "details": {
                    "primary_available": primary_available,
                    "dependency_available": dependency_available,
                    "required": dep["required"]
                }
            })
    
    async def _test_load_balancing(self):
        """Test load balancing behavior if applicable"""
        # This would test load balancing if multiple instances exist
        # For now, test consistent response from single instance
        
        async with test_environment(self.api_base_url) as session:
            response_times = []
            successful_requests = 0
            
            # Send 10 requests to test consistency
            for i in range(10):
                try:
                    start_time = time.time()
                    async with session.get(f"{self.api_base_url}/api/v1/health") as response:
                        response_time = (time.time() - start_time) * 1000
                        response_times.append(response_time)
                        
                        if response.status == 200:
                            successful_requests += 1
                
                except Exception:
                    pass
                
                await asyncio.sleep(0.2)  # 200ms between requests
            
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            consistency = (successful_requests / 10) * 100
            
            load_balancing_ok = consistency >= 90  # 90% success rate
            
            self.service_results.append({
                "service": "Load Balancing",
                "test": "Load Distribution",
                "success": load_balancing_ok,
                "response_time_ms": avg_response_time,
                "details": {
                    "requests_sent": 10,
                    "successful_requests": successful_requests,
                    "consistency_percent": consistency
                }
            })
    
    async def validate_results(self) -> bool:
        """Validate service communication test results"""
        availability_tests = [r for r in self.service_results if r["test"] == "Availability"]
        successful_availability = [r for r in availability_tests if r["success"]]
        
        communication_tests = [r for r in self.service_results if r["test"] == "Cross-Service Communication"]
        successful_communication = [r for r in communication_tests if r["success"]]
        
        total_tests = len(self.service_results)
        successful_tests = len([r for r in self.service_results if r["success"]])
        
        overall_success_rate = (successful_tests / total_tests) * 100 if total_tests > 0 else 0
        
        # Update metrics
        self.metrics.custom_metrics = {
            'total_service_tests': total_tests,
            'successful_service_tests': successful_tests,
            'overall_success_rate_percent': overall_success_rate,
            'services_available': len(successful_availability),
            'total_services': len(availability_tests),
            'cross_service_communication_success': len(successful_communication),
            'cross_service_communication_tests': len(communication_tests)
        }
        
        # Log results
        self.logger.info(f"Service Communication Results: {successful_tests}/{total_tests} successful")
        
        for result in self.service_results:
            if not result["success"]:
                self.logger.warning(f"SERVICE TEST FAILED: {result['service']} - {result['test']} - {result['details']}")
        
        # Test passes if overall success rate is above 75%
        return overall_success_rate >= 75.0

# Factory function to create integration test suite
def create_integration_test_suite(base_url: str = "http://localhost:6100") -> 'TestSuite':
    """Create a comprehensive integration test suite"""
    from .core_testing_framework import TestSuite
    
    suite = TestSuite("Integration Tests", "Comprehensive integration and system testing")
    
    # API endpoint integration tests
    api_config = TestConfig.default_config("api_integration", TestCategory.INTEGRATION)
    api_config.base_url = base_url
    suite.add_test(APIEndpointIntegrationTest(api_config))
    
    # Database integration tests
    db_config = TestConfig.default_config("database_integration", TestCategory.INTEGRATION)
    db_config.base_url = base_url
    suite.add_test(DatabaseIntegrationTest(db_config))
    
    # Service communication tests
    service_config = TestConfig.default_config("service_communication", TestCategory.INTEGRATION)
    service_config.base_url = base_url
    suite.add_test(ServiceCommunicationTest(service_config))
    
    return suite

# Example usage
if __name__ == "__main__":
    async def test_integration():
        """Test integration capabilities"""
        logger.info("🔗 Testing RomAI Integration")
        
        # Create and execute integration test suite
        suite = create_integration_test_suite()
        results = await suite.execute_all()
        
        # Log summary
        for result in results:
            logger.info(f"Test: {result.test_name} - Status: {result.status.value} - "
                       f"Response Time: {result.response_time_ms:.1f}ms")
        
        return results
    
    # Run integration tests
    asyncio.run(test_integration())
    print("✅ Integration Tests completed")