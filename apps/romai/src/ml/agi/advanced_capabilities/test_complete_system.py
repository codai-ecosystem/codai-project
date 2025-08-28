#!/usr/bin/env python3
"""
RomAI AGI Advanced Capabilities - Complete System Test Runner

Comprehensive test runner for the complete RomAI AGI Advanced Capabilities system.
Tests all components, integration, and production readiness.
"""

import asyncio
import sys
import logging
import traceback
from datetime import datetime
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import test components
try:
    from ml.agi.advanced_capabilities.system_integration import SystemIntegrationOrchestrator
    from ml.agi.advanced_capabilities.system_validation import ComprehensiveSystemValidator
    from ml.agi.advanced_capabilities.production_deployment import ProductionDeploymentManager
    from ml.agi.advanced_capabilities.learning_types import LearningConfiguration
except ImportError as e:
    logger.error(f"❌ Import failed: {e}")
    logger.info("🔧 Attempting to import with alternative path...")
    
    try:
        # Alternative import path
        from apps.romai.src.ml.agi.advanced_capabilities.system_integration import SystemIntegrationOrchestrator
        from apps.romai.src.ml.agi.advanced_capabilities.system_validation import ComprehensiveSystemValidator
        from apps.romai.src.ml.agi.advanced_capabilities.production_deployment import ProductionDeploymentManager
        from apps.romai.src.ml.agi.advanced_capabilities.learning_types import LearningConfiguration
    except ImportError as e2:
        logger.error(f"❌ Alternative import failed: {e2}")
        sys.exit(1)

class RomAIAdvancedCapabilitiesTestRunner:
    """Complete test runner for RomAI AGI Advanced Capabilities system"""
    
    def __init__(self):
        self.config = LearningConfiguration()
        self.test_results = {}
        
    async def run_complete_test_suite(self) -> bool:
        """Run the complete test suite"""
        logger.info("🧪 Starting RomAI AGI Phase 2 Complete Test Suite")
        logger.info("=" * 60)
        
        overall_success = True
        
        try:
            # Test 1: System Integration
            logger.info("🔧 Test 1: System Integration")
            integration_success = await self._test_system_integration()
            self.test_results['system_integration'] = integration_success
            overall_success = overall_success and integration_success
            
            # Test 2: Component Validation
            logger.info("🧪 Test 2: Component Validation")
            validation_success = await self._test_component_validation()
            self.test_results['component_validation'] = validation_success
            overall_success = overall_success and validation_success
            
            # Test 3: Production Deployment
            logger.info("🚀 Test 3: Production Deployment")
            deployment_success = await self._test_production_deployment()
            self.test_results['production_deployment'] = deployment_success
            overall_success = overall_success and deployment_success
            
            # Test 4: API Functionality
            logger.info("🔌 Test 4: API Functionality")
            api_success = await self._test_api_functionality()
            self.test_results['api_functionality'] = api_success
            overall_success = overall_success and api_success
            
            # Test 5: Performance Validation
            logger.info("⚡ Test 5: Performance Validation")
            performance_success = await self._test_performance()
            self.test_results['performance_validation'] = performance_success
            overall_success = overall_success and performance_success
            
        except Exception as e:
            logger.error(f"❌ Test suite failed with error: {e}")
            logger.error(traceback.format_exc())
            overall_success = False
        
        # Generate test report
        self._generate_test_report(overall_success)
        
        return overall_success
    
    async def _test_system_integration(self) -> bool:
        """Test system integration"""
        try:
            # Create and initialize orchestrator
            orchestrator = SystemIntegrationOrchestrator(self.config)
            
            # Test initialization
            init_success = await orchestrator.initialize_system()
            
            if not init_success:
                logger.error("❌ System integration initialization failed")
                return False
            
            # Test component registration
            components = orchestrator.component_registry.list_components()
            expected_components = 10  # 6 Phase 1 + 4 Phase 2
            
            if len(components) < expected_components:
                logger.warning(f"⚠️ Expected {expected_components} components, found {len(components)}")
            
            # Test message bus
            message_stats = orchestrator.message_bus.get_message_statistics()
            
            # Test integration statistics
            integration_stats = orchestrator.get_integration_statistics()
            
            logger.info(f"✅ System integration test passed")
            logger.info(f"   - Components registered: {len(components)}")
            logger.info(f"   - Integration statistics: {integration_stats['system_overview']['total_components']} components")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ System integration test failed: {e}")
            return False
    
    async def _test_component_validation(self) -> bool:
        """Test component validation"""
        try:
            # Create validator
            validator = ComprehensiveSystemValidator(self.config)
            
            # Run comprehensive validation
            validation_report = await validator.run_comprehensive_validation()
            
            # Check results
            if not validation_report.overall_success:
                logger.error("❌ Component validation failed")
                logger.error(f"   - Failed tests: {sum(1 for r in validation_report.test_results if not r.success)}")
                
                # Show failed tests
                for result in validation_report.test_results:
                    if not result.success:
                        logger.error(f"   - FAILED: {result.test_name}")
                        if result.error_message:
                            logger.error(f"     Error: {result.error_message[:100]}...")
                
                return False
            
            # Success metrics
            total_tests = len(validation_report.test_results)
            passed_tests = sum(1 for r in validation_report.test_results if r.success)
            success_rate = passed_tests / total_tests if total_tests > 0 else 0
            
            logger.info(f"✅ Component validation test passed")
            logger.info(f"   - Total tests: {total_tests}")
            logger.info(f"   - Passed tests: {passed_tests}")
            logger.info(f"   - Success rate: {success_rate:.1%}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Component validation test failed: {e}")
            return False
    
    async def _test_production_deployment(self) -> bool:
        """Test production deployment"""
        try:
            # Create deployment manager
            deployment_manager = ProductionDeploymentManager()
            
            # Test deployment process
            deployment_result = await deployment_manager.deploy_production_system()
            
            if not deployment_result['success']:
                logger.error("❌ Production deployment failed")
                logger.error(f"   - Errors: {deployment_result.get('errors', [])}")
                return False
            
            # Test production status
            status = deployment_manager.get_production_status()
            
            if not status['is_running']:
                logger.error("❌ Production system not running after deployment")
                return False
            
            # Test graceful shutdown
            shutdown_result = await deployment_manager.shutdown_gracefully()
            
            if not shutdown_result['success']:
                logger.error("❌ Graceful shutdown failed")
                return False
            
            logger.info(f"✅ Production deployment test passed")
            logger.info(f"   - Deployment ID: {deployment_result['deployment_id']}")
            logger.info(f"   - Stages completed: {len(deployment_result.get('stages', {}))}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Production deployment test failed: {e}")
            return False
    
    async def _test_api_functionality(self) -> bool:
        """Test API functionality"""
        try:
            # Create orchestrator for API testing
            orchestrator = SystemIntegrationOrchestrator(self.config)
            
            # Initialize system
            init_success = await orchestrator.initialize_system()
            
            if not init_success:
                logger.error("❌ Failed to initialize system for API testing")
                return False
            
            # Test core API endpoints
            api_tests = [
                ('get_system_status', {}),
                ('process_input', {'input': 'Test input for API functionality'}),
                ('generate_response', {'prompt': 'Test prompt for response generation'}),
                ('list_tools', {}),
                ('query_knowledge', {'query': 'Test knowledge query'})
            ]
            
            successful_tests = 0
            
            for request_type, request_data in api_tests:
                try:
                    response = await orchestrator.process_unified_request(request_type, request_data)
                    
                    if response.get('success', False):
                        successful_tests += 1
                        logger.debug(f"   ✅ {request_type}: SUCCESS")
                    else:
                        logger.warning(f"   ❌ {request_type}: FAILED - {response.get('error', 'Unknown error')}")
                    
                except Exception as e:
                    logger.warning(f"   ❌ {request_type}: ERROR - {e}")
            
            success_rate = successful_tests / len(api_tests)
            
            if success_rate < 0.8:  # 80% success rate required
                logger.error(f"❌ API functionality test failed - success rate: {success_rate:.1%}")
                return False
            
            logger.info(f"✅ API functionality test passed")
            logger.info(f"   - Successful tests: {successful_tests}/{len(api_tests)}")
            logger.info(f"   - Success rate: {success_rate:.1%}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ API functionality test failed: {e}")
            return False
    
    async def _test_performance(self) -> bool:
        """Test system performance"""
        try:
            # Create orchestrator for performance testing
            orchestrator = SystemIntegrationOrchestrator(self.config)
            
            # Initialize system
            init_success = await orchestrator.initialize_system()
            
            if not init_success:
                logger.error("❌ Failed to initialize system for performance testing")
                return False
            
            # Performance test: Response time
            import time
            
            request_times = []
            
            for i in range(10):  # Run 10 test requests
                start_time = time.time()
                
                response = await orchestrator.process_unified_request(
                    'get_system_status', {}
                )
                
                end_time = time.time()
                request_time = end_time - start_time
                request_times.append(request_time)
            
            # Calculate statistics
            avg_response_time = sum(request_times) / len(request_times)
            max_response_time = max(request_times)
            
            # Performance thresholds
            MAX_AVG_RESPONSE_TIME = 2.0  # 2 seconds
            MAX_SINGLE_RESPONSE_TIME = 5.0  # 5 seconds
            
            performance_passed = (
                avg_response_time <= MAX_AVG_RESPONSE_TIME and
                max_response_time <= MAX_SINGLE_RESPONSE_TIME
            )
            
            if not performance_passed:
                logger.error("❌ Performance test failed")
                logger.error(f"   - Average response time: {avg_response_time:.3f}s (max: {MAX_AVG_RESPONSE_TIME}s)")
                logger.error(f"   - Max response time: {max_response_time:.3f}s (max: {MAX_SINGLE_RESPONSE_TIME}s)")
                return False
            
            logger.info(f"✅ Performance test passed")
            logger.info(f"   - Average response time: {avg_response_time:.3f}s")
            logger.info(f"   - Max response time: {max_response_time:.3f}s")
            logger.info(f"   - Test requests: {len(request_times)}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Performance test failed: {e}")
            return False
    
    def _generate_test_report(self, overall_success: bool):
        """Generate comprehensive test report"""
        logger.info("=" * 60)
        logger.info("📋 RomAI AGI Phase 2 Test Report")
        logger.info("=" * 60)
        
        # Overall result
        status = "✅ SUCCESS" if overall_success else "❌ FAILURE"
        logger.info(f"🎯 Overall Result: {status}")
        logger.info("")
        
        # Individual test results
        logger.info("📊 Individual Test Results:")
        
        test_descriptions = {
            'system_integration': 'System Integration',
            'component_validation': 'Component Validation',
            'production_deployment': 'Production Deployment',
            'api_functionality': 'API Functionality',
            'performance_validation': 'Performance Validation'
        }
        
        passed_tests = 0
        total_tests = len(self.test_results)
        
        for test_key, description in test_descriptions.items():
            result = self.test_results.get(test_key, False)
            status_icon = "✅" if result else "❌"
            logger.info(f"   {status_icon} {description}: {'PASSED' if result else 'FAILED'}")
            
            if result:
                passed_tests += 1
        
        logger.info("")
        logger.info(f"📈 Success Rate: {passed_tests}/{total_tests} ({passed_tests/total_tests:.1%})")
        
        # Recommendations
        logger.info("")
        logger.info("💡 Recommendations:")
        
        if overall_success:
            logger.info("   ✅ All tests passed - System ready for production deployment")
            logger.info("   ✅ RomAI AGI Phase 2 evolution completed successfully")
            logger.info("   ✅ Proceed with full system deployment")
        else:
            failed_tests = [name for name, result in self.test_results.items() if not result]
            logger.info(f"   ❌ Address failures in: {', '.join(failed_tests)}")
            logger.info("   ❌ Re-run tests after fixing issues")
            logger.info("   ❌ Do not deploy to production until all tests pass")
        
        logger.info("=" * 60)
        
        # Save report to file
        self._save_test_report_to_file(overall_success)
    
    def _save_test_report_to_file(self, overall_success: bool):
        """Save test report to file"""
        try:
            report_filename = f"romai_agi_advanced_capabilities_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            
            report_content = f"""# RomAI AGI Phase 2 Test Report

**Generated:** {datetime.now().isoformat()}
**Overall Result:** {'✅ SUCCESS' if overall_success else '❌ FAILURE'}

## Test Results Summary

| Test | Result | Status |
|------|--------|---------|
"""
            
            test_descriptions = {
                'system_integration': 'System Integration',
                'component_validation': 'Component Validation', 
                'production_deployment': 'Production Deployment',
                'api_functionality': 'API Functionality',
                'performance_validation': 'Performance Validation'
            }
            
            for test_key, description in test_descriptions.items():
                result = self.test_results.get(test_key, False)
                status_icon = "✅" if result else "❌"
                status_text = "PASSED" if result else "FAILED"
                report_content += f"| {description} | {status_icon} | {status_text} |\n"
            
            passed_tests = sum(1 for result in self.test_results.values() if result)
            total_tests = len(self.test_results)
            success_rate = passed_tests / total_tests if total_tests > 0 else 0
            
            report_content += f"""
## Statistics

- **Total Tests:** {total_tests}
- **Passed Tests:** {passed_tests}
- **Failed Tests:** {total_tests - passed_tests}
- **Success Rate:** {success_rate:.1%}

## Recommendations

"""
            
            if overall_success:
                report_content += """- ✅ All tests passed - System ready for production deployment
- ✅ RomAI AGI Phase 2 evolution completed successfully  
- ✅ Proceed with full system deployment
"""
            else:
                failed_tests = [name for name, result in self.test_results.items() if not result]
                report_content += f"""- ❌ Address failures in: {', '.join(failed_tests)}
- ❌ Re-run tests after fixing issues
- ❌ Do not deploy to production until all tests pass
"""
            
            # Write to file
            with open(report_filename, 'w', encoding='utf-8') as f:
                f.write(report_content)
            
            logger.info(f"📄 Test report saved to: {report_filename}")
            
        except Exception as e:
            logger.error(f"❌ Failed to save test report: {e}")

async def main():
    """Main entry point"""
    try:
        logger.info("🚀 RomAI AGI Phase 2 Complete Test Runner")
        logger.info(f"⏰ Started at: {datetime.now().isoformat()}")
        
        # Create and run test suite
        test_runner = RomAIAdvancedCapabilitiesTestRunner()
        success = await test_runner.run_complete_test_suite()
        
        logger.info(f"⏰ Completed at: {datetime.now().isoformat()}")
        
        if success:
            logger.info("🎉 ALL TESTS PASSED - RomAI AGI Phase 2 system is ready!")
            return 0
        else:
            logger.error("❌ SOME TESTS FAILED - Please address issues before deployment")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Test runner failed: {e}")
        logger.error(traceback.format_exc())
        return 1

if __name__ == '__main__':
    exit_code = asyncio.run(main())
    sys.exit(exit_code)