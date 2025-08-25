#!/usr/bin/env python3
"""
🧪 RomAI AGI - Phase 4.3 Ecosystem QA Module Initialization
Module initialization for comprehensive ecosystem quality assurance

Author: RomAI Quality Team
Version: 4.3.0
Date: 2025-08-08
"""

from .ecosystem_quality_assurance import (
    EcosystemQualityAssurance,
    TestType,
    TestSeverity,
    TestResult,
    ServiceHealth
)

# Global ecosystem QA instance
_ecosystem_qa = None

async def initialize_ecosystem_qa():
    """Initialize the ecosystem quality assurance framework"""
    global _ecosystem_qa
    
    if _ecosystem_qa is None:
        _ecosystem_qa = EcosystemQualityAssurance()
        await _ecosystem_qa.initialize()
    
    return _ecosystem_qa

async def run_comprehensive_qa():
    """Run comprehensive ecosystem quality assurance"""
    qa_framework = await initialize_ecosystem_qa()
    return await qa_framework.run_comprehensive_qa()

async def validate_service_health():
    """Validate health of all ecosystem services"""
    qa_framework = await initialize_ecosystem_qa()
    await qa_framework.validate_service_health()
    return qa_framework.service_health

async def run_compliance_verification():
    """Run EU AI Act compliance verification"""
    qa_framework = await initialize_ecosystem_qa()
    await qa_framework.test_compliance_verification()
    return qa_framework.compliance_results

async def run_performance_benchmarks():
    """Run performance benchmarks across the ecosystem"""
    qa_framework = await initialize_ecosystem_qa()
    await qa_framework.test_performance_benchmarks()
    return qa_framework.performance_metrics

async def run_security_validation():
    """Run security validation across the ecosystem"""
    qa_framework = await initialize_ecosystem_qa()
    await qa_framework.test_security_validation()
    
    # Return security test results
    security_tests = [t for t in qa_framework.test_results if t.test_type == TestType.SECURITY]
    return security_tests

async def run_end_to_end_tests():
    """Run end-to-end scenario tests"""
    qa_framework = await initialize_ecosystem_qa()
    await qa_framework.test_end_to_end_scenarios()
    
    # Return E2E test results
    e2e_tests = [t for t in qa_framework.test_results if t.test_type == TestType.END_TO_END]
    return e2e_tests

async def get_qa_status():
    """Get current QA status and metrics"""
    if _ecosystem_qa is None:
        return {"status": "not_initialized"}
    
    total_tests = len(_ecosystem_qa.test_results)
    passed_tests = len([t for t in _ecosystem_qa.test_results if t.status == "passed"])
    
    success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
    
    healthy_services = len([s for s in _ecosystem_qa.service_health.values() if s.status == "healthy"])
    total_services = len(_ecosystem_qa.service_health)
    service_health_rate = (healthy_services / total_services) * 100 if total_services > 0 else 0
    
    return {
        "status": "initialized",
        "test_results": {
            "total": total_tests,
            "passed": passed_tests,
            "success_rate": success_rate
        },
        "service_health": {
            "total": total_services,
            "healthy": healthy_services,
            "health_rate": service_health_rate
        },
        "compliance": _ecosystem_qa.compliance_results,
        "performance": _ecosystem_qa.performance_metrics
    }

async def test_ecosystem_qa_framework():
    """Test the ecosystem QA framework functionality"""
    try:
        print("🧪 Testing Ecosystem QA Framework...")
        
        # Initialize framework
        qa_framework = await initialize_ecosystem_qa()
        print("✅ Framework initialized successfully")
        
        # Test service health validation
        await validate_service_health()
        print("✅ Service health validation completed")
        
        # Test performance benchmarks
        performance_metrics = await run_performance_benchmarks()
        print(f"✅ Performance benchmarks completed - {len(performance_metrics)} metrics")
        
        # Test compliance verification
        compliance_results = await run_compliance_verification()
        print(f"✅ Compliance verification completed - {len(compliance_results)} results")
        
        # Get overall status
        status = await get_qa_status()
        print(f"✅ QA Status: {status['test_results']['success_rate']:.1f}% success rate")
        
        print("🎉 Ecosystem QA Framework test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Ecosystem QA Framework test failed: {e}")
        return False

# Convenient exports
__all__ = [
    "EcosystemQualityAssurance",
    "TestType", 
    "TestSeverity",
    "TestResult",
    "ServiceHealth",
    "initialize_ecosystem_qa",
    "run_comprehensive_qa",
    "validate_service_health",
    "run_compliance_verification", 
    "run_performance_benchmarks",
    "run_security_validation",
    "run_end_to_end_tests",
    "get_qa_status",
    "test_ecosystem_qa_framework"
]
