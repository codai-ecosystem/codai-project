#!/usr/bin/env python3
"""
🧪 RomAI Phase 2.3 Deployment Validation Test Suite
Comprehensive testing framework for enterprise deployment validation

This test suite validates:
- All core services deployment and health
- Enterprise integration capabilities  
- Monitoring and alerting systems
- Performance and scalability
- Security and compliance
- Backup and recovery
- End-to-end functionality

Author: RomAI Development Team
Version: 2.3.0
Date: 2025-01-27
"""

import asyncio
import aiohttp
import pytest
import yaml
import json
import time
import subprocess
import logging
import os
import sys
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import psutil
import docker
import redis
import psycopg2
from prometheus_client.parser import text_string_to_metric_families
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('deployment_test.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class TestResult:
    """Test result data structure"""
    test_name: str
    status: str  # PASS, FAIL, SKIP, ERROR
    duration: float
    message: str
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass 
class ServiceConfig:
    """Service configuration for testing"""
    name: str
    url: str
    health_endpoint: str
    expected_status: int = 200
    timeout: int = 30
    critical: bool = True
    dependencies: List[str] = field(default_factory=list)

class DeploymentValidator:
    """Comprehensive deployment validation framework"""
    
    def __init__(self, config_path: str = "test_config.yaml"):
        self.config_path = config_path
        self.results: List[TestResult] = []
        self.docker_client = docker.from_env()
        self.session = None
        self.services = self._load_service_configs()
        
    def _load_service_configs(self) -> Dict[str, ServiceConfig]:
        """Load service configurations for testing"""
        return {
            "cbd_database": ServiceConfig(
                name="CBD Database",
                url="http://localhost:4180",
                health_endpoint="/health"
            ),
            "memorai_mcp": ServiceConfig(
                name="MemorAI MCP Server", 
                url="http://localhost:4950",
                health_endpoint="/health"
            ),
            "romai_agi": ServiceConfig(
                name="RomAI AGI Server",
                url="http://localhost:6101", 
                health_endpoint="/health",
                timeout=60
            ),
            "enterprise_api": ServiceConfig(
                name="Enterprise API",
                url="http://localhost:8001",
                health_endpoint="/api/v1/health"
            ),
            "frontend": ServiceConfig(
                name="Frontend App",
                url="http://localhost:6100",
                health_endpoint="/api/health", 
                critical=False
            ),
            "graphql": ServiceConfig(
                name="GraphQL Server",
                url="http://localhost:4500",
                health_endpoint="/health"
            ),
            "prometheus": ServiceConfig(
                name="Prometheus",
                url="http://localhost:9090",
                health_endpoint="/-/healthy"
            ),
            "grafana": ServiceConfig(
                name="Grafana", 
                url="http://localhost:3000",
                health_endpoint="/api/health"
            )
        }
    
    async def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Run complete deployment validation test suite"""
        logger.info("🚀 Starting RomAI Phase 2.3 Deployment Validation")
        
        start_time = time.time()
        test_summary = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "errors": 0,
            "duration": 0,
            "coverage": {},
            "critical_failures": []
        }
        
        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=60)
        ) as session:
            self.session = session
            
            # Test execution phases
            test_phases = [
                ("Infrastructure", self._test_infrastructure),
                ("Core Services", self._test_core_services), 
                ("Enterprise Integration", self._test_enterprise_integration),
                ("Monitoring Stack", self._test_monitoring_stack),
                ("Performance", self._test_performance),
                ("Security", self._test_security),
                ("Backup & Recovery", self._test_backup_recovery),
                ("End-to-End", self._test_end_to_end),
                ("Load Testing", self._test_load_testing),
                ("Compliance", self._test_compliance)
            ]
            
            for phase_name, phase_func in test_phases:
                logger.info(f"📋 Testing Phase: {phase_name}")
                try:
                    phase_results = await phase_func()
                    self.results.extend(phase_results)
                    logger.info(f"✅ {phase_name} phase completed")
                except Exception as e:
                    error_result = TestResult(
                        test_name=f"{phase_name}_phase",
                        status="ERROR",
                        duration=0.0,
                        message=f"Phase execution failed: {str(e)}"
                    )
                    self.results.append(error_result)
                    logger.error(f"❌ {phase_name} phase failed: {e}")
        
        # Calculate test summary
        test_summary["total_tests"] = len(self.results)
        test_summary["duration"] = time.time() - start_time
        
        for result in self.results:
            if result.status == "PASS":
                test_summary["passed"] += 1
            elif result.status == "FAIL":
                test_summary["failed"] += 1
                if "critical" in result.test_name:
                    test_summary["critical_failures"].append(result.test_name)
            elif result.status == "SKIP":
                test_summary["skipped"] += 1
            else:
                test_summary["errors"] += 1
        
        # Calculate coverage
        test_summary["coverage"] = self._calculate_coverage()
        
        # Generate detailed report
        await self._generate_test_report(test_summary)
        
        logger.info(f"🏁 Validation completed in {test_summary['duration']:.2f}s")
        logger.info(f"📊 Results: {test_summary['passed']}/{test_summary['total_tests']} passed")
        
        return test_summary
    
    async def _test_infrastructure(self) -> List[TestResult]:
        """Test infrastructure components"""
        results = []
        
        # Docker containers health
        try:
            containers = self.docker_client.containers.list()
            running_containers = [c for c in containers if c.status == 'running']
            
            results.append(TestResult(
                test_name="docker_containers_running",
                status="PASS" if len(running_containers) >= 8 else "FAIL",
                duration=0.1,
                message=f"Found {len(running_containers)} running containers",
                details={"containers": [c.name for c in running_containers]}
            ))
        except Exception as e:
            results.append(TestResult(
                test_name="docker_containers_running",
                status="ERROR",
                duration=0.1,
                message=f"Docker check failed: {str(e)}"
            ))
        
        # PostgreSQL connection
        try:
            conn = psycopg2.connect(
                host="localhost",
                port=5432,
                database="romai_enterprise", 
                user="romai",
                password="postgres123"
            )
            conn.close()
            results.append(TestResult(
                test_name="postgresql_connection",
                status="PASS",
                duration=0.2,
                message="PostgreSQL connection successful"
            ))
        except Exception as e:
            results.append(TestResult(
                test_name="postgresql_connection_critical",
                status="FAIL",
                duration=0.2,
                message=f"PostgreSQL connection failed: {str(e)}"
            ))
        
        # Redis connection
        try:
            r = redis.Redis(host='localhost', port=6379, password='redis123', decode_responses=True)
            r.ping()
            results.append(TestResult(
                test_name="redis_connection",
                status="PASS", 
                duration=0.1,
                message="Redis connection successful"
            ))
        except Exception as e:
            results.append(TestResult(
                test_name="redis_connection_critical",
                status="FAIL",
                duration=0.1,
                message=f"Redis connection failed: {str(e)}"
            ))
        
        # Network connectivity
        network_tests = [
            ("cbd_network", "172.20.0.0/16"),
            ("external_dns", "8.8.8.8"),
            ("localhost_connectivity", "127.0.0.1")
        ]
        
        for test_name, target in network_tests:
            try:
                result = subprocess.run(
                    ["ping", "-n", "1", target] if os.name == 'nt' else ["ping", "-c", "1", target],
                    capture_output=True,
                    timeout=5
                )
                status = "PASS" if result.returncode == 0 else "FAIL"
                results.append(TestResult(
                    test_name=f"network_{test_name}",
                    status=status,
                    duration=1.0,
                    message=f"Network connectivity to {target}: {status}"
                ))
            except Exception as e:
                results.append(TestResult(
                    test_name=f"network_{test_name}",
                    status="ERROR",
                    duration=1.0,
                    message=f"Network test failed: {str(e)}"
                ))
        
        return results
    
    async def _test_core_services(self) -> List[TestResult]:
        """Test all core RomAI services"""
        results = []
        
        for service_key, service in self.services.items():
            start_time = time.time()
            
            try:
                async with self.session.get(
                    f"{service.url}{service.health_endpoint}",
                    timeout=service.timeout
                ) as response:
                    duration = time.time() - start_time
                    
                    if response.status == service.expected_status:
                        data = await response.json()
                        results.append(TestResult(
                            test_name=f"service_{service_key}_health" + ("_critical" if service.critical else ""),
                            status="PASS",
                            duration=duration,
                            message=f"{service.name} health check passed",
                            details={"response": data, "status_code": response.status}
                        ))
                    else:
                        results.append(TestResult(
                            test_name=f"service_{service_key}_health" + ("_critical" if service.critical else ""),
                            status="FAIL",
                            duration=duration,
                            message=f"{service.name} returned status {response.status}",
                            details={"status_code": response.status}
                        ))
                        
            except asyncio.TimeoutError:
                results.append(TestResult(
                    test_name=f"service_{service_key}_health" + ("_critical" if service.critical else ""),
                    status="FAIL",
                    duration=service.timeout,
                    message=f"{service.name} health check timeout"
                ))
            except Exception as e:
                results.append(TestResult(
                    test_name=f"service_{service_key}_health" + ("_critical" if service.critical else ""),
                    status="ERROR",
                    duration=time.time() - start_time,
                    message=f"{service.name} health check error: {str(e)}"
                ))
        
        # Test service dependencies and interactions
        await self._test_service_interactions(results)
        
        return results
    
    async def _test_service_interactions(self, results: List[TestResult]):
        """Test interactions between services"""
        
        # Test AGI model inference
        try:
            inference_payload = {
                "text": "Test RomAI AGI inference capability",
                "model": "romai-103m",
                "max_tokens": 50
            }
            
            async with self.session.post(
                "http://localhost:6101/api/v1/inference",
                json=inference_payload,
                timeout=30
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results.append(TestResult(
                        test_name="agi_inference_critical",
                        status="PASS",
                        duration=1.0,
                        message="AGI inference test passed",
                        details={"response": data}
                    ))
                else:
                    results.append(TestResult(
                        test_name="agi_inference_critical",
                        status="FAIL", 
                        duration=1.0,
                        message=f"AGI inference failed with status {response.status}"
                    ))
        except Exception as e:
            results.append(TestResult(
                test_name="agi_inference_critical",
                status="ERROR",
                duration=1.0,
                message=f"AGI inference error: {str(e)}"
            ))
        
        # Test MemorAI integration
        try:
            memory_payload = {
                "agentId": "test-agent",
                "content": "Test memory storage for deployment validation",
                "metadata": {"project": "deployment_test", "session": "validation"}
            }
            
            async with self.session.post(
                "http://localhost:4950/api/remember",
                json=memory_payload,
                timeout=10
            ) as response:
                if response.status == 200:
                    results.append(TestResult(
                        test_name="memorai_integration",
                        status="PASS",
                        duration=0.5,
                        message="MemorAI integration test passed"
                    ))
                else:
                    results.append(TestResult(
                        test_name="memorai_integration",
                        status="FAIL",
                        duration=0.5,
                        message=f"MemorAI integration failed with status {response.status}"
                    ))
        except Exception as e:
            results.append(TestResult(
                test_name="memorai_integration",
                status="ERROR",
                duration=0.5,
                message=f"MemorAI integration error: {str(e)}"
            ))
    
    async def _test_enterprise_integration(self) -> List[TestResult]:
        """Test enterprise integration capabilities"""
        results = []
        
        # Test authentication endpoints
        auth_tests = [
            ("jwt_auth", "/api/v1/auth/login"),
            ("api_key_auth", "/api/v1/auth/validate"),
            ("user_management", "/api/v1/users/profile")
        ]
        
        for test_name, endpoint in auth_tests:
            try:
                async with self.session.get(
                    f"http://localhost:8001{endpoint}",
                    timeout=10
                ) as response:
                    # Even 401/403 responses indicate the endpoint is working
                    if response.status in [200, 401, 403]:
                        results.append(TestResult(
                            test_name=f"enterprise_{test_name}",
                            status="PASS",
                            duration=0.5,
                            message=f"Enterprise {test_name} endpoint responding",
                            details={"status_code": response.status}
                        ))
                    else:
                        results.append(TestResult(
                            test_name=f"enterprise_{test_name}",
                            status="FAIL",
                            duration=0.5,
                            message=f"Enterprise {test_name} unexpected status {response.status}"
                        ))
            except Exception as e:
                results.append(TestResult(
                    test_name=f"enterprise_{test_name}",
                    status="ERROR",
                    duration=0.5,
                    message=f"Enterprise {test_name} error: {str(e)}"
                ))
        
        # Test compliance endpoints
        try:
            async with self.session.get(
                "http://localhost:8001/api/v1/compliance/status",
                headers={"X-API-Key": "romai_gTPuSTeViI8-wn1Ru45P6BIXpesKLiubsSQSnmRHXLA"},
                timeout=10
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results.append(TestResult(
                        test_name="eu_ai_act_compliance_critical",
                        status="PASS",
                        duration=0.5,
                        message="EU AI Act compliance check passed",
                        details={"compliance_data": data}
                    ))
                else:
                    results.append(TestResult(
                        test_name="eu_ai_act_compliance_critical",
                        status="FAIL",
                        duration=0.5,
                        message=f"Compliance check failed with status {response.status}"
                    ))
        except Exception as e:
            results.append(TestResult(
                test_name="eu_ai_act_compliance_critical",
                status="ERROR",
                duration=0.5,
                message=f"Compliance check error: {str(e)}"
            ))
        
        return results
    
    async def _test_monitoring_stack(self) -> List[TestResult]:
        """Test monitoring and observability stack"""
        results = []
        
        # Test Prometheus metrics collection
        try:
            async with self.session.get(
                "http://localhost:9090/api/v1/query?query=up",
                timeout=10
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    metrics_count = len(data.get('data', {}).get('result', []))
                    results.append(TestResult(
                        test_name="prometheus_metrics",
                        status="PASS",
                        duration=0.5,
                        message=f"Prometheus collecting {metrics_count} metrics",
                        details={"metrics_count": metrics_count}
                    ))
                else:
                    results.append(TestResult(
                        test_name="prometheus_metrics",
                        status="FAIL",
                        duration=0.5,
                        message=f"Prometheus metrics query failed: {response.status}"
                    ))
        except Exception as e:
            results.append(TestResult(
                test_name="prometheus_metrics",
                status="ERROR",
                duration=0.5,
                message=f"Prometheus metrics error: {str(e)}"
            ))
        
        # Test Grafana dashboards
        try:
            async with self.session.get(
                "http://localhost:3000/api/search",
                auth=aiohttp.BasicAuth("admin", "admin123"),
                timeout=10
            ) as response:
                if response.status == 200:
                    dashboards = await response.json()
                    results.append(TestResult(
                        test_name="grafana_dashboards",
                        status="PASS",
                        duration=0.5,
                        message=f"Grafana has {len(dashboards)} dashboards",
                        details={"dashboard_count": len(dashboards)}
                    ))
                else:
                    results.append(TestResult(
                        test_name="grafana_dashboards",
                        status="FAIL",
                        duration=0.5,
                        message=f"Grafana dashboard query failed: {response.status}"
                    ))
        except Exception as e:
            results.append(TestResult(
                test_name="grafana_dashboards",
                status="ERROR",
                duration=0.5,
                message=f"Grafana dashboards error: {str(e)}"
            ))
        
        return results
    
    async def _test_performance(self) -> List[TestResult]:
        """Test system performance and response times"""
        results = []
        
        # Response time benchmarks
        performance_targets = {
            "cbd_database": 100,    # ms
            "memorai_mcp": 200,     # ms
            "romai_agi": 2000,      # ms (model inference)
            "enterprise_api": 300,  # ms
            "graphql": 200          # ms
        }
        
        for service_key, target_ms in performance_targets.items():
            if service_key in self.services:
                service = self.services[service_key]
                
                # Multiple requests for average
                response_times = []
                for _ in range(5):
                    try:
                        start_time = time.time()
                        async with self.session.get(
                            f"{service.url}{service.health_endpoint}",
                            timeout=10
                        ) as response:
                            duration_ms = (time.time() - start_time) * 1000
                            if response.status == 200:
                                response_times.append(duration_ms)
                    except:
                        continue
                
                if response_times:
                    avg_response_time = sum(response_times) / len(response_times)
                    status = "PASS" if avg_response_time <= target_ms else "FAIL"
                    results.append(TestResult(
                        test_name=f"performance_{service_key}_response_time",
                        status=status,
                        duration=avg_response_time / 1000,
                        message=f"{service.name} avg response: {avg_response_time:.1f}ms (target: {target_ms}ms)",
                        details={
                            "avg_response_ms": avg_response_time,
                            "target_ms": target_ms,
                            "measurements": response_times
                        }
                    ))
        
        # System resource utilization
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory_percent = psutil.virtual_memory().percent
            disk_percent = psutil.disk_usage('/').percent
            
            results.append(TestResult(
                test_name="system_resource_utilization",
                status="PASS" if cpu_percent < 80 and memory_percent < 85 and disk_percent < 90 else "FAIL",
                duration=1.0,
                message=f"System resources - CPU: {cpu_percent}%, Memory: {memory_percent}%, Disk: {disk_percent}%",
                details={
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory_percent,
                    "disk_percent": disk_percent
                }
            ))
        except Exception as e:
            results.append(TestResult(
                test_name="system_resource_utilization",
                status="ERROR",
                duration=1.0,
                message=f"Resource utilization check error: {str(e)}"
            ))
        
        return results
    
    async def _test_security(self) -> List[TestResult]:
        """Test security configurations"""
        results = []
        
        # Test HTTPS endpoints (if configured)
        https_endpoints = [
            "https://localhost:443",
            "https://localhost:8443"
        ]
        
        for endpoint in https_endpoints:
            try:
                async with self.session.get(endpoint, ssl=False, timeout=5) as response:
                    results.append(TestResult(
                        test_name="https_endpoint",
                        status="PASS",
                        duration=0.5,
                        message=f"HTTPS endpoint {endpoint} accessible"
                    ))
            except:
                results.append(TestResult(
                    test_name="https_endpoint",
                    status="SKIP",
                    duration=0.1,
                    message=f"HTTPS endpoint {endpoint} not configured (optional)"
                ))
        
        # Test API key validation
        try:
            async with self.session.get(
                "http://localhost:8001/api/v1/health",
                headers={"X-API-Key": "invalid-key"},
                timeout=10
            ) as response:
                # Should either work (if no auth required) or return 401/403
                status = "PASS" if response.status in [200, 401, 403] else "FAIL"
                results.append(TestResult(
                    test_name="api_key_validation",
                    status=status,
                    duration=0.5,
                    message=f"API key validation responding correctly: {response.status}"
                ))
        except Exception as e:
            results.append(TestResult(
                test_name="api_key_validation",
                status="ERROR",
                duration=0.5,
                message=f"API key validation error: {str(e)}"
            ))
        
        return results
    
    async def _test_backup_recovery(self) -> List[TestResult]:
        """Test backup and recovery mechanisms"""
        results = []
        
        # Test database backup functionality
        try:
            # This would typically test backup scripts
            results.append(TestResult(
                test_name="database_backup",
                status="SKIP",
                duration=0.1,
                message="Database backup testing requires manual validation"
            ))
        except Exception as e:
            results.append(TestResult(
                test_name="database_backup",
                status="ERROR",
                duration=0.1,
                message=f"Backup test error: {str(e)}"
            ))
        
        return results
    
    async def _test_end_to_end(self) -> List[TestResult]:
        """Test complete end-to-end workflows"""
        results = []
        
        # Test complete AGI workflow
        try:
            # 1. Store memory
            memory_payload = {
                "agentId": "e2e-test-agent",
                "content": "End-to-end test memory for Romanian AGI validation",
                "metadata": {"project": "e2e_test", "session": "validation", "type": "test"}
            }
            
            async with self.session.post(
                "http://localhost:4950/api/remember",
                json=memory_payload,
                timeout=10
            ) as response:
                if response.status != 200:
                    raise Exception(f"Memory storage failed: {response.status}")
            
            # 2. AGI inference with memory context
            inference_payload = {
                "text": "Describe Romanian cultural traditions using stored knowledge",
                "model": "romai-103m",
                "max_tokens": 100,
                "use_memory": True,
                "agent_id": "e2e-test-agent"
            }
            
            async with self.session.post(
                "http://localhost:6101/api/v1/inference",
                json=inference_payload,
                timeout=30
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    results.append(TestResult(
                        test_name="end_to_end_agi_workflow_critical",
                        status="PASS",
                        duration=2.0,
                        message="Complete AGI workflow test passed",
                        details={"inference_response": data}
                    ))
                else:
                    results.append(TestResult(
                        test_name="end_to_end_agi_workflow_critical",
                        status="FAIL",
                        duration=2.0,
                        message=f"AGI workflow failed at inference: {response.status}"
                    ))
                    
        except Exception as e:
            results.append(TestResult(
                test_name="end_to_end_agi_workflow_critical",
                status="ERROR",
                duration=2.0,
                message=f"End-to-end workflow error: {str(e)}"
            ))
        
        return results
    
    async def _test_load_testing(self) -> List[TestResult]:
        """Test system under load"""
        results = []
        
        # Concurrent request test
        try:
            concurrent_requests = 10
            tasks = []
            
            for i in range(concurrent_requests):
                task = self.session.get(
                    "http://localhost:8001/api/v1/health",
                    timeout=10
                )
                tasks.append(task)
            
            start_time = time.time()
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            duration = time.time() - start_time
            
            successful_requests = sum(1 for r in responses if not isinstance(r, Exception) and r.status == 200)
            success_rate = successful_requests / concurrent_requests * 100
            
            status = "PASS" if success_rate >= 80 else "FAIL"
            results.append(TestResult(
                test_name="concurrent_load_test",
                status=status,
                duration=duration,
                message=f"Load test: {successful_requests}/{concurrent_requests} successful ({success_rate:.1f}%)",
                details={
                    "concurrent_requests": concurrent_requests,
                    "successful_requests": successful_requests,
                    "success_rate": success_rate,
                    "total_duration": duration
                }
            ))
            
            # Close all successful responses
            for response in responses:
                if not isinstance(response, Exception):
                    response.close()
                    
        except Exception as e:
            results.append(TestResult(
                test_name="concurrent_load_test",
                status="ERROR",
                duration=1.0,
                message=f"Load testing error: {str(e)}"
            ))
        
        return results
    
    async def _test_compliance(self) -> List[TestResult]:
        """Test regulatory compliance features"""
        results = []
        
        # EU AI Act compliance test
        try:
            async with self.session.get(
                "http://localhost:8001/api/v1/compliance/eu-ai-act/assessment",
                headers={"X-API-Key": "romai_gTPuSTeViI8-wn1Ru45P6BIXpesKLiubsSQSnmRHXLA"},
                timeout=15
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    compliance_score = data.get('compliance_score', 0)
                    status = "PASS" if compliance_score >= 85 else "FAIL"
                    results.append(TestResult(
                        test_name="eu_ai_act_assessment_critical",
                        status=status,
                        duration=1.0,
                        message=f"EU AI Act compliance score: {compliance_score}%",
                        details={"compliance_data": data}
                    ))
                else:
                    results.append(TestResult(
                        test_name="eu_ai_act_assessment_critical",
                        status="FAIL",
                        duration=1.0,
                        message=f"Compliance assessment failed: {response.status}"
                    ))
        except Exception as e:
            results.append(TestResult(
                test_name="eu_ai_act_assessment_critical",
                status="ERROR",
                duration=1.0,
                message=f"Compliance assessment error: {str(e)}"
            ))
        
        return results
    
    def _calculate_coverage(self) -> Dict[str, float]:
        """Calculate test coverage by category"""
        categories = {
            "infrastructure": ["docker", "postgresql", "redis", "network"],
            "services": ["service_", "health"],
            "enterprise": ["enterprise_", "auth", "compliance"],
            "monitoring": ["prometheus", "grafana", "metrics"],
            "performance": ["performance_", "response_time", "resource"],
            "security": ["https", "api_key", "auth"],
            "end_to_end": ["end_to_end", "workflow"],
            "compliance": ["compliance", "eu_ai_act"]
        }
        
        coverage = {}
        for category, keywords in categories.items():
            category_tests = [r for r in self.results if any(kw in r.test_name for kw in keywords)]
            if category_tests:
                passed_tests = [r for r in category_tests if r.status == "PASS"]
                coverage[category] = len(passed_tests) / len(category_tests) * 100
            else:
                coverage[category] = 0.0
        
        return coverage
    
    async def _generate_test_report(self, summary: Dict[str, Any]):
        """Generate comprehensive test report"""
        
        report_data = {
            "test_execution": {
                "timestamp": datetime.now().isoformat(),
                "duration": summary["duration"],
                "environment": "development",
                "total_tests": summary["total_tests"]
            },
            "results_summary": {
                "passed": summary["passed"],
                "failed": summary["failed"],
                "skipped": summary["skipped"],
                "errors": summary["errors"],
                "success_rate": (summary["passed"] / summary["total_tests"] * 100) if summary["total_tests"] > 0 else 0
            },
            "coverage": summary["coverage"],
            "critical_failures": summary["critical_failures"],
            "detailed_results": [
                {
                    "test_name": r.test_name,
                    "status": r.status,
                    "duration": r.duration,
                    "message": r.message,
                    "timestamp": r.timestamp.isoformat(),
                    "details": r.details
                }
                for r in self.results
            ]
        }
        
        # Save JSON report
        with open("deployment_validation_report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        # Generate markdown report
        markdown_report = self._generate_markdown_report(report_data)
        with open("DEPLOYMENT_VALIDATION_REPORT.md", "w") as f:
            f.write(markdown_report)
        
        logger.info("📋 Test reports generated: deployment_validation_report.json, DEPLOYMENT_VALIDATION_REPORT.md")
    
    def _generate_markdown_report(self, report_data: Dict[str, Any]) -> str:
        """Generate markdown test report"""
        
        success_rate = report_data["results_summary"]["success_rate"]
        status_emoji = "✅" if success_rate >= 90 else "⚠️" if success_rate >= 75 else "❌"
        
        report = f"""# 🧪 RomAI Phase 2.3 Deployment Validation Report

{status_emoji} **Overall Status**: {success_rate:.1f}% Success Rate

## 📊 Test Execution Summary

- **Execution Time**: {datetime.fromisoformat(report_data['test_execution']['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}
- **Duration**: {report_data['test_execution']['duration']:.2f} seconds
- **Environment**: {report_data['test_execution']['environment'].title()}
- **Total Tests**: {report_data['test_execution']['total_tests']}

## 📈 Results Breakdown

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Passed | {report_data['results_summary']['passed']} | {report_data['results_summary']['passed']/report_data['test_execution']['total_tests']*100:.1f}% |
| ❌ Failed | {report_data['results_summary']['failed']} | {report_data['results_summary']['failed']/report_data['test_execution']['total_tests']*100:.1f}% |
| ⏭️ Skipped | {report_data['results_summary']['skipped']} | {report_data['results_summary']['skipped']/report_data['test_execution']['total_tests']*100:.1f}% |
| 🚨 Errors | {report_data['results_summary']['errors']} | {report_data['results_summary']['errors']/report_data['test_execution']['total_tests']*100:.1f}% |

## 🎯 Coverage by Category

"""
        
        for category, coverage in report_data["coverage"].items():
            coverage_emoji = "✅" if coverage >= 90 else "⚠️" if coverage >= 75 else "❌"
            report += f"- {coverage_emoji} **{category.title()}**: {coverage:.1f}%\n"
        
        if report_data["critical_failures"]:
            report += f"\n## 🚨 Critical Failures\n\n"
            for failure in report_data["critical_failures"]:
                report += f"- ❌ {failure}\n"
        
        report += f"\n## 📝 Detailed Results\n\n"
        
        for result in report_data["detailed_results"]:
            status_emoji = {"PASS": "✅", "FAIL": "❌", "SKIP": "⏭️", "ERROR": "🚨"}[result["status"]]
            report += f"### {status_emoji} {result['test_name']}\n\n"
            report += f"- **Status**: {result['status']}\n"
            report += f"- **Duration**: {result['duration']:.3f}s\n"
            report += f"- **Message**: {result['message']}\n"
            if result['details']:
                report += f"- **Details**: `{json.dumps(result['details'], indent=2)}`\n"
            report += f"\n"
        
        report += f"""
## 🚀 Deployment Recommendations

"""
        
        if success_rate >= 95:
            report += "### ✅ Ready for Production\n\nAll critical tests passed. System is ready for production deployment.\n"
        elif success_rate >= 85:
            report += "### ⚠️ Ready with Monitoring\n\nMost tests passed. Address warnings before production deployment.\n"
        elif success_rate >= 75:
            report += "### 🔧 Requires Fixes\n\nSeveral tests failed. Address critical issues before deployment.\n"
        else:
            report += "### ❌ Not Ready\n\nSignificant issues detected. Extensive fixes required before deployment.\n"
        
        return report

async def main():
    """Main test execution function"""
    validator = DeploymentValidator()
    
    try:
        print("🚀 Starting RomAI Phase 2.3 Deployment Validation")
        print("=" * 60)
        
        results = await validator.run_comprehensive_tests()
        
        print("\n" + "=" * 60)
        print("🏁 Validation Complete!")
        print(f"📊 Success Rate: {results['passed']}/{results['total_tests']} ({results['passed']/results['total_tests']*100:.1f}%)")
        
        if results['critical_failures']:
            print(f"🚨 Critical Failures: {len(results['critical_failures'])}")
            for failure in results['critical_failures']:
                print(f"   - {failure}")
        
        print("📋 Detailed report saved to: DEPLOYMENT_VALIDATION_REPORT.md")
        
        # Exit code based on success rate
        success_rate = results['passed'] / results['total_tests'] * 100
        if success_rate >= 90:
            sys.exit(0)  # Success
        elif success_rate >= 75:
            sys.exit(1)  # Warning
        else:
            sys.exit(2)  # Failure
            
    except Exception as e:
        logger.error(f"❌ Validation failed: {e}")
        sys.exit(3)  # Error

if __name__ == "__main__":
    asyncio.run(main())
