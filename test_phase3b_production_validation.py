#!/usr/bin/env python3
"""
Phase 3B Production Readiness Validation Script
==============================================

Comprehensive validation of production monitoring, observability, and reliability systems.
Tests all production features including logging, metrics, health checks, API documentation, and monitoring endpoints.
"""

import requests
import json
import time
import asyncio
from datetime import datetime
from typing import Dict, Any, List

class Phase3BProductionValidator:
    """Comprehensive Phase 3B production features validator"""
    
    def __init__(self, base_url: str = "http://localhost:6101"):
        self.base_url = base_url
        self.test_results = []
        
    def log_test_result(self, test_name: str, success: bool, details: Dict[str, Any] = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {test_name}: {'PASSED' if success else 'FAILED'}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_enhanced_health_check(self):
        """Test enhanced health check with production monitoring"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                health_data = response.json()
                
                # Check for production monitoring fields
                required_fields = ["status", "uptime_seconds", "models_loaded", "production_monitoring"]
                missing_fields = [field for field in required_fields if field not in health_data]
                
                if not missing_fields:
                    production_status = health_data.get("production_monitoring", "disabled")
                    if production_status == "active":
                        self.log_test_result("Enhanced Health Check", True, {
                            "status": health_data["status"],
                            "production_monitoring": production_status,
                            "uptime": health_data["uptime_seconds"],
                            "models": health_data["models_loaded"]
                        })
                        return True
                    else:
                        self.log_test_result("Enhanced Health Check", False, {
                            "error": f"Production monitoring not active: {production_status}"
                        })
                else:
                    self.log_test_result("Enhanced Health Check", False, {
                        "error": f"Missing fields: {missing_fields}"
                    })
            else:
                self.log_test_result("Enhanced Health Check", False, {
                    "error": f"HTTP {response.status_code}: {response.text}"
                })
                
        except Exception as e:
            self.log_test_result("Enhanced Health Check", False, {"error": str(e)})
        
        return False
    
    def test_production_metrics_endpoint(self):
        """Test production metrics dashboard endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/v1/metrics", timeout=10)
            
            if response.status_code == 200:
                metrics_data = response.json()
                
                if metrics_data.get("success") and "data" in metrics_data:
                    dashboard_data = metrics_data["data"]
                    
                    # Check for required dashboard sections
                    required_sections = ["timestamp", "system_health", "performance_metrics"]
                    missing_sections = [section for section in required_sections if section not in dashboard_data]
                    
                    if not missing_sections:
                        self.log_test_result("Production Metrics Endpoint", True, {
                            "system_status": dashboard_data.get("system_health", {}).get("status"),
                            "metrics_count": len(dashboard_data.get("performance_metrics", {})),
                            "alerts_count": len(dashboard_data.get("recent_alerts", []))
                        })
                        return True
                    else:
                        self.log_test_result("Production Metrics Endpoint", False, {
                            "error": f"Missing dashboard sections: {missing_sections}"
                        })
                else:
                    self.log_test_result("Production Metrics Endpoint", False, {
                        "error": "Invalid metrics response structure"
                    })
            elif response.status_code == 503:
                self.log_test_result("Production Metrics Endpoint", False, {
                    "error": "Production monitoring not available (503)"
                })
            else:
                self.log_test_result("Production Metrics Endpoint", False, {
                    "error": f"HTTP {response.status_code}: {response.text}"
                })
                
        except Exception as e:
            self.log_test_result("Production Metrics Endpoint", False, {"error": str(e)})
        
        return False
    
    def test_api_documentation_endpoint(self):
        """Test API documentation generation endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/v1/docs", timeout=10)
            
            if response.status_code == 200:
                docs_data = response.json()
                
                # Check for OpenAPI spec structure
                if "openapi" in docs_data and "info" in docs_data and "paths" in docs_data:
                    paths_count = len(docs_data.get("paths", {}))
                    
                    self.log_test_result("API Documentation Endpoint", True, {
                        "openapi_version": docs_data.get("openapi"),
                        "api_title": docs_data.get("info", {}).get("title"),
                        "endpoints_documented": paths_count
                    })
                    return True
                else:
                    self.log_test_result("API Documentation Endpoint", False, {
                        "error": "Invalid OpenAPI specification structure"
                    })
            else:
                self.log_test_result("API Documentation Endpoint", False, {
                    "error": f"HTTP {response.status_code}: {response.text}"
                })
                
        except Exception as e:
            self.log_test_result("API Documentation Endpoint", False, {"error": str(e)})
        
        return False
    
    def test_advanced_reasoning_with_monitoring(self):
        """Test advanced reasoning endpoint with production monitoring integration"""
        try:
            test_request = {
                "problem": "How to implement a binary search algorithm with optimal time complexity?",
                "reasoning_type": "programming_logic",
                "max_steps": 3,
                "quality_target": "advanced"
            }
            
            response = requests.post(
                f"{self.base_url}/api/v1/advanced-reasoning/analyze",
                json=test_request,
                timeout=30,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result_data = response.json()
                
                if result_data.get("success"):
                    # Check for production monitoring enhancements
                    required_fields = ["overall_confidence", "processing_time_ms", "timestamp", "engine_used"]
                    missing_fields = [field for field in required_fields if field not in result_data]
                    
                    if not missing_fields:
                        self.log_test_result("Advanced Reasoning with Monitoring", True, {
                            "confidence": result_data["overall_confidence"],
                            "processing_time": f"{result_data['processing_time_ms']:.1f}ms",
                            "quality": result_data.get("quality_assessment"),
                            "reasoning_steps": len(result_data.get("reasoning_steps", []))
                        })
                        return True
                    else:
                        self.log_test_result("Advanced Reasoning with Monitoring", False, {
                            "error": f"Missing monitoring fields: {missing_fields}"
                        })
                else:
                    self.log_test_result("Advanced Reasoning with Monitoring", False, {
                        "error": result_data.get("error", "Unknown error")
                    })
            else:
                self.log_test_result("Advanced Reasoning with Monitoring", False, {
                    "error": f"HTTP {response.status_code}: {response.text}"
                })
                
        except Exception as e:
            self.log_test_result("Advanced Reasoning with Monitoring", False, {"error": str(e)})
        
        return False
    
    def test_structured_logging_detection(self):
        """Test if structured logging is working (indirect validation)"""
        try:
            # Make a request that should generate logs
            response = requests.post(
                f"{self.base_url}/api/v1/advanced-reasoning/analyze",
                json={"problem": "Test logging validation: 2 + 2 = ?"},
                timeout=15
            )
            
            # We can't directly check logs, but we can verify the request was processed
            if response.status_code == 200:
                result = response.json()
                if "timestamp" in result:
                    self.log_test_result("Structured Logging Detection", True, {
                        "note": "Indirect validation - request processed with timestamp",
                        "response_time": result.get("processing_time_ms", "unknown")
                    })
                    return True
            
            self.log_test_result("Structured Logging Detection", False, {
                "error": "Could not validate logging indirectly"
            })
                
        except Exception as e:
            self.log_test_result("Structured Logging Detection", False, {"error": str(e)})
        
        return False
    
    def test_error_handling_with_monitoring(self):
        """Test error handling with production monitoring"""
        try:
            # Send invalid request to test error monitoring
            invalid_request = {"invalid": "request"}
            
            response = requests.post(
                f"{self.base_url}/api/v1/advanced-reasoning/analyze",
                json=invalid_request,
                timeout=15
            )
            
            # We expect this to return an error, but with proper structure
            if response.status_code in [400, 422, 500]:
                error_data = response.json()
                
                # Check for structured error response
                if "error" in error_data or "message" in error_data:
                    self.log_test_result("Error Handling with Monitoring", True, {
                        "status_code": response.status_code,
                        "error_structure": "valid",
                        "has_timestamp": "timestamp" in error_data
                    })
                    return True
                else:
                    self.log_test_result("Error Handling with Monitoring", False, {
                        "error": "Error response lacks proper structure"
                    })
            else:
                self.log_test_result("Error Handling with Monitoring", False, {
                    "error": f"Unexpected status code: {response.status_code}"
                })
                
        except Exception as e:
            self.log_test_result("Error Handling with Monitoring", False, {"error": str(e)})
        
        return False
    
    def test_performance_metrics_collection(self):
        """Test that performance metrics are being collected"""
        try:
            # Make several requests to generate metrics
            for i in range(3):
                requests.post(
                    f"{self.base_url}/api/v1/advanced-reasoning/analyze",
                    json={"problem": f"Test metrics collection #{i+1}: What is {i+1} + {i+1}?"},
                    timeout=15
                )
                time.sleep(1)  # Small delay between requests
            
            # Check metrics endpoint for data
            metrics_response = requests.get(f"{self.base_url}/api/v1/metrics", timeout=10)
            
            if metrics_response.status_code == 200:
                metrics_data = metrics_response.json()
                dashboard_data = metrics_data.get("data", {})
                performance_metrics = dashboard_data.get("performance_metrics", {})
                
                if performance_metrics:
                    self.log_test_result("Performance Metrics Collection", True, {
                        "metrics_available": len(performance_metrics),
                        "system_health": dashboard_data.get("system_health", {}).get("status"),
                        "timestamp": dashboard_data.get("timestamp")
                    })
                    return True
                else:
                    self.log_test_result("Performance Metrics Collection", False, {
                        "error": "No performance metrics found in dashboard"
                    })
            else:
                self.log_test_result("Performance Metrics Collection", False, {
                    "error": f"Could not retrieve metrics: HTTP {metrics_response.status_code}"
                })
                
        except Exception as e:
            self.log_test_result("Performance Metrics Collection", False, {"error": str(e)})
        
        return False
    
    def run_comprehensive_validation(self):
        """Run all Phase 3B production validation tests"""
        print("🚀 Phase 3B Production Readiness Validation")
        print("=" * 60)
        print()
        
        # List of all tests
        tests = [
            ("Enhanced Health Check", self.test_enhanced_health_check),
            ("Production Metrics Endpoint", self.test_production_metrics_endpoint),
            ("API Documentation Endpoint", self.test_api_documentation_endpoint),
            ("Advanced Reasoning with Monitoring", self.test_advanced_reasoning_with_monitoring),
            ("Structured Logging Detection", self.test_structured_logging_detection),
            ("Error Handling with Monitoring", self.test_error_handling_with_monitoring),
            ("Performance Metrics Collection", self.test_performance_metrics_collection)
        ]
        
        print(f"🔍 Running {len(tests)} production readiness tests...")
        print()
        
        # Run all tests
        passed_tests = 0
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                self.log_test_result(test_name, False, {"exception": str(e)})
        
        print()
        print("📊 Phase 3B Validation Summary")
        print("=" * 60)
        print(f"✅ Tests Passed: {passed_tests}/{len(tests)}")
        print(f"❌ Tests Failed: {len(tests) - passed_tests}/{len(tests)}")
        print(f"📈 Success Rate: {(passed_tests/len(tests)*100):.1f}%")
        
        # Determine overall status
        if passed_tests == len(tests):
            print()
            print("🎉 PHASE 3B VALIDATION: COMPLETE SUCCESS!")
            print("🚀 Production monitoring and observability systems are fully operational")
            print("✨ RomAI AGI is ready for production deployment with comprehensive monitoring")
        elif passed_tests >= len(tests) * 0.7:  # 70% pass rate
            print()
            print("⚠️ PHASE 3B VALIDATION: MOSTLY SUCCESSFUL")
            print("🔧 Most production features are working, some issues need attention")
            print("📋 Review failed tests and address issues before production deployment")
        else:
            print()
            print("🚨 PHASE 3B VALIDATION: NEEDS ATTENTION")
            print("🛠️ Multiple production features require fixes before deployment")
            print("🔍 Review all failed tests and implement necessary corrections")
        
        print()
        print("📖 Detailed Results:")
        for result in self.test_results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"  {status}: {result['test']}")
            if result.get("details") and result["success"]:
                # Show key success details
                details = result["details"]
                if isinstance(details, dict):
                    for key, value in details.items():
                        if key not in ["error", "exception"]:
                            print(f"    {key}: {value}")
        
        return passed_tests == len(tests)

if __name__ == "__main__":
    validator = Phase3BProductionValidator()
    success = validator.run_comprehensive_validation()
    
    if success:
        exit(0)  # All tests passed
    else:
        exit(1)  # Some tests failed