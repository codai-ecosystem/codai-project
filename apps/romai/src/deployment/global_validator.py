#!/usr/bin/env python3
"""
RUAGA Global Deployment Validation System
Comprehensive validation and benchmarking for world-class AGI performance
"""

import asyncio
import logging
import json
import time
import requests
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import aiohttp
import statistics
import concurrent.futures
import subprocess
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ValidationConfig:
    """Global validation configuration"""
    
    # Performance targets (world-class standards)
    mathematical_accuracy: float = 0.98
    programming_accuracy: float = 0.95
    logical_accuracy: float = 0.90
    creative_quality: float = 0.85
    multimodal_accuracy: float = 0.90
    romanian_cultural: float = 0.92
    general_knowledge: float = 0.95
    
    # Performance benchmarks
    max_latency_ms: int = 50
    min_throughput_rps: int = 1000
    min_availability: float = 0.9999
    
    # Load testing
    concurrent_users: int = 10000
    test_duration_seconds: int = 3600  # 1 hour
    ramp_up_seconds: int = 300  # 5 minutes
    
    # Deployment endpoints
    endpoints: List[str] = None
    
    def __post_init__(self):
        if self.endpoints is None:
            self.endpoints = [
                "http://localhost:6101",
                "https://ruaga-api.production.com",
                "https://ruaga-eu.production.com",
                "https://ruaga-asia.production.com"
            ]

class ExpertDomainValidator:
    """Validates expert domain performance"""
    
    def __init__(self, config: ValidationConfig):
        self.config = config
        self.session = None
    
    async def initialize(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        logger.info("✅ Expert validator initialized")
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
    
    async def validate_mathematical_expert(self, endpoint: str) -> Dict[str, Any]:
        """Validate mathematical reasoning performance"""
        logger.info("🧮 Validating Mathematical Expert...")
        
        test_cases = [
            {
                "query": "What is the derivative of x^3 + 2x^2 - 5x + 1?",
                "expected_contains": ["3x^2", "4x", "-5"],
                "difficulty": "intermediate"
            },
            {
                "query": "Solve the integral of sin(x)cos(x) dx",
                "expected_contains": ["sin^2(x)/2", "integration"],
                "difficulty": "intermediate"
            },
            {
                "query": "Find the eigenvalues of the matrix [[2, 1], [1, 2]]",
                "expected_contains": ["3", "1", "eigenvalue"],
                "difficulty": "advanced"
            },
            {
                "query": "What is the solution to the differential equation dy/dx = y?",
                "expected_contains": ["e^x", "exponential"],
                "difficulty": "advanced"
            },
            {
                "query": "Prove that sqrt(2) is irrational",
                "expected_contains": ["contradiction", "rational", "proof"],
                "difficulty": "expert"
            }
        ]
        
        results = []
        correct = 0
        
        for case in test_cases:
            try:
                start_time = time.time()
                
                async with self.session.post(
                    f"{endpoint}/agi/reason",
                    json={
                        "query": case["query"],
                        "capability": "mathematical",
                        "expert_routing": True
                    }
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        response_time = (time.time() - start_time) * 1000
                        
                        # Check if response contains expected elements
                        response_text = result.get("result", "").lower()
                        contains_expected = any(
                            expected.lower() in response_text 
                            for expected in case["expected_contains"]
                        )
                        
                        if contains_expected:
                            correct += 1
                        
                        results.append({
                            "query": case["query"],
                            "difficulty": case["difficulty"],
                            "correct": contains_expected,
                            "response_time_ms": response_time,
                            "response": result.get("result", "")
                        })
                    else:
                        results.append({
                            "query": case["query"],
                            "difficulty": case["difficulty"],
                            "correct": False,
                            "error": f"HTTP {response.status}"
                        })
                        
            except Exception as e:
                results.append({
                    "query": case["query"],
                    "difficulty": case["difficulty"],
                    "correct": False,
                    "error": str(e)
                })
        
        accuracy = correct / len(test_cases)
        avg_response_time = statistics.mean([
            r.get("response_time_ms", 0) for r in results if "response_time_ms" in r
        ])
        
        logger.info(f"📊 Mathematical Expert: {accuracy:.1%} accuracy, {avg_response_time:.1f}ms avg")
        
        return {
            "domain": "mathematical",
            "accuracy": accuracy,
            "target": self.config.mathematical_accuracy,
            "meets_target": accuracy >= self.config.mathematical_accuracy,
            "avg_response_time_ms": avg_response_time,
            "test_results": results
        }
    
    async def validate_programming_expert(self, endpoint: str) -> Dict[str, Any]:
        """Validate programming assistance performance"""
        logger.info("💻 Validating Programming Expert...")
        
        test_cases = [
            {
                "query": "Write a Python function to implement binary search",
                "expected_contains": ["def", "binary_search", "while", "mid"],
                "language": "python"
            },
            {
                "query": "Create a JavaScript function to debounce user input",
                "expected_contains": ["function", "setTimeout", "clearTimeout"],
                "language": "javascript"
            },
            {
                "query": "Implement a quicksort algorithm in C++",
                "expected_contains": ["void", "quicksort", "partition", "pivot"],
                "language": "cpp"
            },
            {
                "query": "Write a SQL query to find the top 5 customers by revenue",
                "expected_contains": ["SELECT", "TOP", "ORDER BY", "DESC"],
                "language": "sql"
            },
            {
                "query": "Create a React component with hooks for state management",
                "expected_contains": ["useState", "function", "return", "jsx"],
                "language": "react"
            }
        ]
        
        results = []
        correct = 0
        
        for case in test_cases:
            try:
                start_time = time.time()
                
                async with self.session.post(
                    f"{endpoint}/agi/reason",
                    json={
                        "query": case["query"],
                        "capability": "programming",
                        "expert_routing": True,
                        "language": case["language"]
                    }
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        response_time = (time.time() - start_time) * 1000
                        
                        response_text = result.get("result", "").lower()
                        contains_expected = any(
                            expected.lower() in response_text 
                            for expected in case["expected_contains"]
                        )
                        
                        if contains_expected:
                            correct += 1
                        
                        results.append({
                            "query": case["query"],
                            "language": case["language"],
                            "correct": contains_expected,
                            "response_time_ms": response_time,
                            "response": result.get("result", "")
                        })
                    else:
                        results.append({
                            "query": case["query"],
                            "language": case["language"],
                            "correct": False,
                            "error": f"HTTP {response.status}"
                        })
                        
            except Exception as e:
                results.append({
                    "query": case["query"],
                    "language": case["language"],
                    "correct": False,
                    "error": str(e)
                })
        
        accuracy = correct / len(test_cases)
        avg_response_time = statistics.mean([
            r.get("response_time_ms", 0) for r in results if "response_time_ms" in r
        ])
        
        logger.info(f"📊 Programming Expert: {accuracy:.1%} accuracy, {avg_response_time:.1f}ms avg")
        
        return {
            "domain": "programming",
            "accuracy": accuracy,
            "target": self.config.programming_accuracy,
            "meets_target": accuracy >= self.config.programming_accuracy,
            "avg_response_time_ms": avg_response_time,
            "test_results": results
        }
    
    async def validate_action_capabilities(self, endpoint: str) -> Dict[str, Any]:
        """Validate action-taking capabilities"""
        logger.info("⚡ Validating Action Capabilities...")
        
        test_cases = [
            {
                "action": "ui_automation",
                "query": "Click button with text 'Submit' on the current page",
                "expected_result": "action_planned"
            },
            {
                "action": "api_call",
                "query": "Make a GET request to https://api.example.com/users",
                "expected_result": "api_request_prepared"
            },
            {
                "action": "file_operation",
                "query": "Create a new file called 'test.txt' with content 'Hello World'",
                "expected_result": "file_operation_prepared"
            },
            {
                "action": "web_search",
                "query": "Search for 'latest AI research papers' and summarize findings",
                "expected_result": "web_search_prepared"
            },
            {
                "action": "code_generation",
                "query": "Generate a Python class for user management with CRUD operations",
                "expected_result": "code_generated"
            }
        ]
        
        results = []
        successful = 0
        
        for case in test_cases:
            try:
                start_time = time.time()
                
                async with self.session.post(
                    f"{endpoint}/agi/action",
                    json={
                        "action_type": case["action"],
                        "query": case["query"],
                        "validate_only": True  # Don't actually execute
                    }
                ) as response:
                    
                    response_time = (time.time() - start_time) * 1000
                    
                    if response.status == 200:
                        result = await response.json()
                        
                        # Check if action was properly planned/prepared
                        if "action_plan" in result or "prepared" in result.get("status", ""):
                            successful += 1
                        
                        results.append({
                            "action": case["action"],
                            "successful": True,
                            "response_time_ms": response_time,
                            "result": result
                        })
                    else:
                        results.append({
                            "action": case["action"],
                            "successful": False,
                            "error": f"HTTP {response.status}"
                        })
                        
            except Exception as e:
                results.append({
                    "action": case["action"],
                    "successful": False,
                    "error": str(e)
                })
        
        success_rate = successful / len(test_cases)
        avg_response_time = statistics.mean([
            r.get("response_time_ms", 0) for r in results if "response_time_ms" in r
        ])
        
        logger.info(f"📊 Action Capabilities: {success_rate:.1%} success rate, {avg_response_time:.1f}ms avg")
        
        return {
            "domain": "actions",
            "success_rate": success_rate,
            "target": 0.90,
            "meets_target": success_rate >= 0.90,
            "avg_response_time_ms": avg_response_time,
            "test_results": results
        }

class PerformanceValidator:
    """Validates system performance metrics"""
    
    def __init__(self, config: ValidationConfig):
        self.config = config
    
    async def validate_latency(self, endpoint: str) -> Dict[str, Any]:
        """Validate response latency"""
        logger.info("⏱️  Validating Latency Performance...")
        
        latencies = []
        successful_requests = 0
        total_requests = 100
        
        async with aiohttp.ClientSession() as session:
            for i in range(total_requests):
                try:
                    start_time = time.time()
                    
                    async with session.get(f"{endpoint}/health") as response:
                        if response.status == 200:
                            latency = (time.time() - start_time) * 1000
                            latencies.append(latency)
                            successful_requests += 1
                            
                except Exception as e:
                    logger.warning(f"Request {i} failed: {e}")
        
        if latencies:
            avg_latency = statistics.mean(latencies)
            p95_latency = np.percentile(latencies, 95)
            p99_latency = np.percentile(latencies, 99)
            
            meets_target = p95_latency <= self.config.max_latency_ms
            
            logger.info(f"📊 Latency: {avg_latency:.1f}ms avg, {p95_latency:.1f}ms p95")
            
            return {
                "avg_latency_ms": avg_latency,
                "p95_latency_ms": p95_latency,
                "p99_latency_ms": p99_latency,
                "target_ms": self.config.max_latency_ms,
                "meets_target": meets_target,
                "successful_requests": successful_requests,
                "total_requests": total_requests
            }
        else:
            return {
                "error": "No successful requests",
                "meets_target": False
            }
    
    async def validate_throughput(self, endpoint: str) -> Dict[str, Any]:
        """Validate system throughput"""
        logger.info("🚀 Validating Throughput Performance...")
        
        concurrent_requests = 100
        test_duration = 60  # 1 minute
        
        successful_requests = 0
        start_time = time.time()
        
        async def make_request(session):
            nonlocal successful_requests
            try:
                async with session.get(f"{endpoint}/health") as response:
                    if response.status == 200:
                        successful_requests += 1
            except:
                pass
        
        async with aiohttp.ClientSession() as session:
            while time.time() - start_time < test_duration:
                tasks = [
                    make_request(session) 
                    for _ in range(concurrent_requests)
                ]
                await asyncio.gather(*tasks, return_exceptions=True)
                await asyncio.sleep(1)  # 1 second interval
        
        actual_duration = time.time() - start_time
        requests_per_second = successful_requests / actual_duration
        
        meets_target = requests_per_second >= self.config.min_throughput_rps
        
        logger.info(f"📊 Throughput: {requests_per_second:.0f} RPS, target: {self.config.min_throughput_rps} RPS")
        
        return {
            "requests_per_second": requests_per_second,
            "target_rps": self.config.min_throughput_rps,
            "meets_target": meets_target,
            "total_requests": successful_requests,
            "test_duration_seconds": actual_duration
        }

class GlobalDeploymentValidator:
    """Main global deployment validation orchestrator"""
    
    def __init__(self, config: ValidationConfig):
        self.config = config
        self.expert_validator = ExpertDomainValidator(config)
        self.performance_validator = PerformanceValidator(config)
    
    async def initialize(self):
        """Initialize all validators"""
        await self.expert_validator.initialize()
        logger.info("✅ Global validator initialized")
    
    async def cleanup(self):
        """Cleanup resources"""
        await self.expert_validator.cleanup()
    
    async def validate_single_endpoint(self, endpoint: str) -> Dict[str, Any]:
        """Validate a single deployment endpoint"""
        logger.info(f"🔍 Validating endpoint: {endpoint}")
        
        results = {}
        
        try:
            # Expert domain validations
            results["mathematical"] = await self.expert_validator.validate_mathematical_expert(endpoint)
            results["programming"] = await self.expert_validator.validate_programming_expert(endpoint)
            results["actions"] = await self.expert_validator.validate_action_capabilities(endpoint)
            
            # Performance validations
            results["latency"] = await self.performance_validator.validate_latency(endpoint)
            results["throughput"] = await self.performance_validator.validate_throughput(endpoint)
            
            # Overall endpoint health
            endpoint_healthy = all(
                result.get("meets_target", False) 
                for result in results.values()
                if "meets_target" in result
            )
            
            results["endpoint_status"] = {
                "healthy": endpoint_healthy,
                "endpoint": endpoint,
                "validation_time": datetime.now().isoformat()
            }
            
            logger.info(f"{'✅' if endpoint_healthy else '❌'} Endpoint {endpoint}: {'HEALTHY' if endpoint_healthy else 'ISSUES DETECTED'}")
            
        except Exception as e:
            logger.error(f"❌ Failed to validate {endpoint}: {e}")
            results["error"] = str(e)
            results["endpoint_status"] = {
                "healthy": False,
                "endpoint": endpoint,
                "error": str(e)
            }
        
        return results
    
    async def validate_all_endpoints(self) -> Dict[str, Any]:
        """Validate all deployment endpoints"""
        logger.info("🌍 Starting Global Deployment Validation...")
        
        start_time = time.time()
        all_results = {}
        
        # Validate each endpoint
        for endpoint in self.config.endpoints:
            all_results[endpoint] = await self.validate_single_endpoint(endpoint)
        
        # Generate global summary
        healthy_endpoints = sum(
            1 for result in all_results.values()
            if result.get("endpoint_status", {}).get("healthy", False)
        )
        
        total_endpoints = len(self.config.endpoints)
        global_health_percentage = (healthy_endpoints / total_endpoints) * 100
        
        validation_time = time.time() - start_time
        
        global_summary = {
            "validation_completed": datetime.now().isoformat(),
            "validation_duration_seconds": validation_time,
            "total_endpoints": total_endpoints,
            "healthy_endpoints": healthy_endpoints,
            "global_health_percentage": global_health_percentage,
            "meets_availability_target": global_health_percentage >= (self.config.min_availability * 100),
            "world_class_ready": self.assess_world_class_readiness(all_results)
        }
        
        final_results = {
            "global_summary": global_summary,
            "endpoint_results": all_results,
            "performance_targets": asdict(self.config)
        }
        
        # Save validation report
        await self.save_validation_report(final_results)
        
        # Log summary
        logger.info("\n" + "="*60)
        logger.info("🏆 GLOBAL DEPLOYMENT VALIDATION COMPLETED!")
        logger.info(f"🌍 Global Health: {global_health_percentage:.1f}%")
        logger.info(f"✅ Healthy Endpoints: {healthy_endpoints}/{total_endpoints}")
        logger.info(f"⏱️  Validation Time: {validation_time/60:.2f} minutes")
        logger.info(f"🚀 World-Class Ready: {'YES' if global_summary['world_class_ready'] else 'NOT YET'}")
        logger.info("="*60)
        
        return final_results
    
    def assess_world_class_readiness(self, all_results: Dict[str, Any]) -> bool:
        """Assess if deployment meets world-class standards"""
        
        # Check if at least one endpoint meets all targets
        for endpoint_results in all_results.values():
            if endpoint_results.get("endpoint_status", {}).get("healthy", False):
                
                # Check expert domain performance
                math_meets = endpoint_results.get("mathematical", {}).get("meets_target", False)
                prog_meets = endpoint_results.get("programming", {}).get("meets_target", False)
                action_meets = endpoint_results.get("actions", {}).get("meets_target", False)
                
                # Check performance metrics
                latency_meets = endpoint_results.get("latency", {}).get("meets_target", False)
                throughput_meets = endpoint_results.get("throughput", {}).get("meets_target", False)
                
                if all([math_meets, prog_meets, action_meets, latency_meets, throughput_meets]):
                    return True
        
        return False
    
    async def save_validation_report(self, results: Dict[str, Any]):
        """Save comprehensive validation report"""
        report_dir = "deployment/validation_reports"
        os.makedirs(report_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = os.path.join(report_dir, f"global_validation_{timestamp}.json")
        
        with open(report_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"📋 Validation report saved: {report_path}")
        
        # Also create human-readable summary
        summary_path = os.path.join(report_dir, f"validation_summary_{timestamp}.txt")
        
        with open(summary_path, 'w') as f:
            f.write("RUAGA Global Deployment Validation Summary\n")
            f.write("=" * 50 + "\n\n")
            
            summary = results["global_summary"]
            f.write(f"Validation Completed: {summary['validation_completed']}\n")
            f.write(f"Duration: {summary['validation_duration_seconds']/60:.2f} minutes\n")
            f.write(f"Global Health: {summary['global_health_percentage']:.1f}%\n")
            f.write(f"Healthy Endpoints: {summary['healthy_endpoints']}/{summary['total_endpoints']}\n")
            f.write(f"World-Class Ready: {'YES' if summary['world_class_ready'] else 'NOT YET'}\n\n")
            
            f.write("Endpoint Details:\n")
            f.write("-" * 20 + "\n")
            
            for endpoint, result in results["endpoint_results"].items():
                status = result.get("endpoint_status", {})
                f.write(f"{endpoint}: {'HEALTHY' if status.get('healthy') else 'ISSUES'}\n")
        
        logger.info(f"📄 Human-readable summary: {summary_path}")

async def main():
    """Main validation execution"""
    config = ValidationConfig()
    
    # Use only local endpoint for initial validation
    config.endpoints = ["http://localhost:6101"]
    
    validator = GlobalDeploymentValidator(config)
    
    try:
        await validator.initialize()
        results = await validator.validate_all_endpoints()
        
        # Print key results
        global_summary = results["global_summary"]
        
        if global_summary["world_class_ready"]:
            logger.info("🏆 RUAGA IS WORLD-CLASS READY!")
        else:
            logger.info("⚠️  RUAGA needs improvement to reach world-class standards")
            
    except Exception as e:
        logger.error(f"❌ Validation failed: {e}")
        raise
    
    finally:
        await validator.cleanup()

if __name__ == "__main__":
    asyncio.run(main())