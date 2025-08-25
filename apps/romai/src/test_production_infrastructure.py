#!/usr/bin/env python3
"""
🧪 RomAI Production Testing Suite - Quick Validation
Simple test runner to validate the complete testing infrastructure

Usage:
    python test_production_infrastructure.py
"""

import asyncio
import logging
import sys
import time
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from testing.core_testing_framework import TestSuite, TestConfig, TestCategory
from testing.agi_capability_tests import create_agi_capability_test_suite
from testing.performance_tests import create_performance_test_suite
from testing.security_tests import create_security_test_suite
from testing.integration_tests import create_integration_test_suite
from testing.production_test_suite import ProductionTestingSuite, run_production_tests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('test_infrastructure')

async def test_individual_test_suites():
    """Test each test suite individually (without running actual tests)"""
    logger.info("🧪 Testing Individual Test Suite Creation")
    
    base_url = "http://localhost:6100"
    
    try:
        # Test AGI Capability Tests
        logger.info("  🧠 Creating AGI Capability Test Suite...")
        agi_suite = create_agi_capability_test_suite(base_url)
        logger.info(f"    ✅ AGI Suite created with {len(agi_suite.test_cases)} tests")
        
        # Test Performance Tests
        logger.info("  ⚡ Creating Performance Test Suite...")
        performance_suite = create_performance_test_suite(base_url)
        logger.info(f"    ✅ Performance Suite created with {len(performance_suite.test_cases)} tests")
        
        # Test Security Tests
        logger.info("  🔒 Creating Security Test Suite...")
        security_suite = create_security_test_suite(base_url)
        logger.info(f"    ✅ Security Suite created with {len(security_suite.test_cases)} tests")
        
        # Test Integration Tests
        logger.info("  🔗 Creating Integration Test Suite...")
        integration_suite = create_integration_test_suite(base_url)
        logger.info(f"    ✅ Integration Suite created with {len(integration_suite.test_cases)} tests")
        
        # Calculate totals
        total_tests = (len(agi_suite.test_cases) + len(performance_suite.test_cases) + 
                      len(security_suite.test_cases) + len(integration_suite.test_cases))
        
        logger.info(f"📊 Total Test Infrastructure: {total_tests} tests across 4 test suites")
        return True
        
    except Exception as e:
        logger.error(f"❌ Test suite creation failed: {e}")
        return False

async def test_production_testing_suite():
    """Test the production testing suite orchestrator"""
    logger.info("🚀 Testing Production Testing Suite Orchestrator")
    
    try:
        # Create production testing suite
        production_suite = ProductionTestingSuite("http://localhost:6100")
        production_suite.start_time = time.time()  # Initialize start_time for testing
        logger.info("  ✅ Production Testing Suite created successfully")
        
        # Test report generation (without running actual tests)
        logger.info("  📄 Testing report structure...")
        
        # Create mock results for testing report generation
        from testing.core_testing_framework import TestMetrics, TestStatus, TestCategory
        from datetime import datetime
        
        mock_results = [
            TestMetrics(
                test_name="Mock AGI Test",
                category=TestCategory.AGI_CAPABILITY,
                status=TestStatus.PASSED,
                duration=1.5,
                start_time=datetime.now(),
                end_time=datetime.now(),
                response_time_ms=150.0
            ),
            TestMetrics(
                test_name="Mock Performance Test",
                category=TestCategory.PERFORMANCE,
                status=TestStatus.PASSED,
                duration=2.0,
                start_time=datetime.now(),
                end_time=datetime.now(),
                throughput_ops_sec=10.5
            )
        ]
        
        # Test report generation
        report = await production_suite._generate_production_report(
            mock_results, None, None, None
        )
        
        logger.info(f"  ✅ Test report generated successfully")
        logger.info(f"    📊 Overall Score: {report.overall_score:.1f}/100")
        logger.info(f"    🎯 Readiness Level: {report.production_readiness_level}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Production testing suite failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_complete_infrastructure():
    """Test the complete testing infrastructure"""
    logger.info("🌟 RomAI Production Testing Infrastructure Validation")
    logger.info("="*70)
    
    # Test 1: Individual test suite creation
    success1 = await test_individual_test_suites()
    
    # Test 2: Production testing suite orchestrator
    success2 = await test_production_testing_suite()
    
    # Final assessment
    logger.info("="*70)
    if success1 and success2:
        logger.info("🎉 ALL TESTS PASSED - Production Testing Infrastructure is operational!")
        logger.info("✅ RomAI Testing Framework Status: READY FOR PRODUCTION TESTING")
        logger.info("")
        logger.info("📋 Available Test Capabilities:")
        logger.info("  🧠 AGI Capability Tests: Reasoning, Romanian mastery, creativity")
        logger.info("  ⚡ Performance Tests: Response time, throughput, load testing, memory leak detection")
        logger.info("  🔒 Security Tests: Authentication, input validation, EU AI Act compliance")
        logger.info("  🔗 Integration Tests: API endpoints, database integration, service communication")
        logger.info("  🚀 Production Suite: Comprehensive orchestration and reporting")
        logger.info("")
        logger.info("🎯 Next Steps:")
        logger.info("  1. Start RomAI services (AGI server, database, etc.)")
        logger.info("  2. Run: python -m testing.production_test_suite")
        logger.info("  3. Review comprehensive production readiness report")
        return True
    else:
        logger.error("❌ TESTING INFRASTRUCTURE VALIDATION FAILED")
        logger.error("🚫 Issues detected in production testing framework")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_complete_infrastructure())
    sys.exit(0 if success else 1)