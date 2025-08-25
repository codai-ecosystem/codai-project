"""
🚀 Production Testing Suite for RomAI AGI
Comprehensive production readiness validation

This module orchestrates the complete production testing suite:
- AGI Capability Tests: Core AGI functionality validation
- Performance Tests: Load testing and performance benchmarks
- Security Tests: Security validation and penetration testing
- Integration Tests: API and service integration verification
- Production Readiness Assessment: Overall system validation

Combines all testing modules into a unified production testing pipeline.

Author: RomAI Development Team  
Version: 1.0.0-production
"""

import asyncio
import json
import logging
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from .core_testing_framework import TestRunner, TestMetrics, TestStatus
from .agi_capability_tests import create_agi_capability_test_suite
from .performance_tests import create_performance_test_suite
from .security_tests import create_security_test_suite
from .integration_tests import create_integration_test_suite

logger = logging.getLogger('production_testing_suite')

@dataclass
class ProductionTestReport:
    """Comprehensive production test report"""
    test_timestamp: str
    total_duration_seconds: float
    overall_success: bool
    overall_score: float  # 0-100
    
    # Test suite results
    agi_tests: Dict[str, Any]
    performance_tests: Dict[str, Any]
    security_tests: Dict[str, Any]
    integration_tests: Dict[str, Any]
    
    # Summary statistics
    total_tests: int
    passed_tests: int
    failed_tests: int
    critical_failures: List[str]
    recommendations: List[str]
    
    production_readiness_level: str  # NOT_READY, NEEDS_IMPROVEMENT, READY, PRODUCTION_GRADE

class ProductionTestingSuite:
    """
    Comprehensive production testing suite for RomAI AGI
    
    Orchestrates all testing modules and provides unified reporting
    """
    
    def __init__(self, base_url: str = "http://localhost:6100"):
        self.base_url = base_url
        self.test_runner = TestRunner()
        self.start_time = None
        self.results = {
            'agi': None,
            'performance': None,
            'security': None,
            'integration': None
        }
        
    async def run_complete_test_suite(self, 
                                     include_performance: bool = True,
                                     include_security: bool = True,
                                     include_integration: bool = True,
                                     performance_duration_minutes: int = 10) -> ProductionTestReport:
        """
        Run the complete production testing suite
        
        Args:
            include_performance: Whether to run performance tests
            include_security: Whether to run security tests  
            include_integration: Whether to run integration tests
            performance_duration_minutes: Duration for performance tests
        """
        self.start_time = time.time()
        logger.info("🚀 Starting RomAI Production Testing Suite")
        
        try:
            # Phase 1: AGI Capability Tests (Critical - always run)
            logger.info("📋 Phase 1: AGI Capability Tests")
            agi_results = await self._run_agi_tests()
            
            # Phase 2: Integration Tests (Run before performance for service validation)
            integration_results = None
            if include_integration:
                logger.info("🔗 Phase 2: Integration Tests")  
                integration_results = await self._run_integration_tests()
            
            # Phase 3: Security Tests
            security_results = None
            if include_security:
                logger.info("🔒 Phase 3: Security Tests")
                security_results = await self._run_security_tests()
            
            # Phase 4: Performance Tests (Run last as they're resource intensive)
            performance_results = None
            if include_performance:
                logger.info("⚡ Phase 4: Performance Tests")
                performance_results = await self._run_performance_tests(performance_duration_minutes)
            
            # Generate comprehensive report
            report = await self._generate_production_report(
                agi_results, performance_results, security_results, integration_results
            )
            
            logger.info(f"✅ Production Testing Suite completed in {report.total_duration_seconds:.1f}s")
            logger.info(f"🏆 Overall Score: {report.overall_score:.1f}/100")
            logger.info(f"📊 Production Readiness: {report.production_readiness_level}")
            
            return report
            
        except Exception as e:
            logger.error(f"❌ Production Testing Suite failed: {e}")
            raise
    
    async def _run_agi_tests(self) -> List[TestMetrics]:
        """Run AGI capability tests"""
        logger.info("  🧠 Running AGI capability validation...")
        
        agi_suite = create_agi_capability_test_suite(self.base_url)
        results = await agi_suite.execute_all()
        
        self.results['agi'] = results
        
        passed = len([r for r in results if r.status == TestStatus.PASSED])
        total = len(results)
        
        logger.info(f"  🧠 AGI Tests: {passed}/{total} passed")
        
        return results
    
    async def _run_performance_tests(self, duration_minutes: int) -> List[TestMetrics]:
        """Run performance tests"""
        logger.info(f"  ⚡ Running performance tests ({duration_minutes} min duration)...")
        
        # Adjust performance test configuration for shorter duration if needed
        performance_suite = create_performance_test_suite(self.base_url)
        
        # Modify memory leak test duration based on overall test duration
        for test in performance_suite.tests:
            if hasattr(test, 'test_duration_minutes'):
                test.test_duration_minutes = min(test.test_duration_minutes, duration_minutes)
        
        results = await performance_suite.execute_all()
        
        self.results['performance'] = results
        
        passed = len([r for r in results if r.status == TestStatus.PASSED])
        total = len(results)
        
        logger.info(f"  ⚡ Performance Tests: {passed}/{total} passed")
        
        return results
    
    async def _run_security_tests(self) -> List[TestMetrics]:
        """Run security tests"""
        logger.info("  🔒 Running security validation...")
        
        security_suite = create_security_test_suite(self.base_url)
        results = await security_suite.execute_all()
        
        self.results['security'] = results
        
        passed = len([r for r in results if r.status == TestStatus.PASSED])
        total = len(results)
        
        logger.info(f"  🔒 Security Tests: {passed}/{total} passed")
        
        return results
    
    async def _run_integration_tests(self) -> List[TestMetrics]:
        """Run integration tests"""
        logger.info("  🔗 Running integration validation...")
        
        integration_suite = create_integration_test_suite(self.base_url)
        results = await integration_suite.execute_all()
        
        self.results['integration'] = results
        
        passed = len([r for r in results if r.status == TestStatus.PASSED])
        total = len(results)
        
        logger.info(f"  🔗 Integration Tests: {passed}/{total} passed")
        
        return results
    
    async def _generate_production_report(self, 
                                        agi_results: Optional[List[TestMetrics]],
                                        performance_results: Optional[List[TestMetrics]], 
                                        security_results: Optional[List[TestMetrics]],
                                        integration_results: Optional[List[TestMetrics]]) -> ProductionTestReport:
        """Generate comprehensive production test report"""
        
        total_duration = time.time() - self.start_time
        all_results = []
        
        # Collect all results
        if agi_results:
            all_results.extend(agi_results)
        if performance_results:
            all_results.extend(performance_results)  
        if security_results:
            all_results.extend(security_results)
        if integration_results:
            all_results.extend(integration_results)
        
        # Calculate statistics
        total_tests = len(all_results)
        passed_tests = len([r for r in all_results if r.status == TestStatus.PASSED])
        failed_tests = len([r for r in all_results if r.status == TestStatus.FAILED])
        
        # Identify critical failures
        critical_failures = []
        for result in all_results:
            if result.status == TestStatus.FAILED:
                if "security" in result.test_name.lower() or "agi" in result.test_name.lower():
                    critical_failures.append(f"{result.test_name}: {result.error_message or 'Failed'}")
        
        # Calculate overall score
        overall_score = self._calculate_overall_score(agi_results, performance_results, security_results, integration_results)
        overall_success = overall_score >= 85.0 and len(critical_failures) == 0
        
        # Generate recommendations
        recommendations = self._generate_recommendations(all_results, overall_score)
        
        # Determine production readiness level
        readiness_level = self._assess_production_readiness(overall_score, critical_failures, all_results)
        
        # Create detailed test suite summaries
        report = ProductionTestReport(
            test_timestamp=datetime.now().isoformat(),
            total_duration_seconds=total_duration,
            overall_success=overall_success,
            overall_score=overall_score,
            
            agi_tests=self._summarize_test_results(agi_results, "AGI Capability"),
            performance_tests=self._summarize_test_results(performance_results, "Performance"),
            security_tests=self._summarize_test_results(security_results, "Security"),
            integration_tests=self._summarize_test_results(integration_results, "Integration"),
            
            total_tests=total_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            critical_failures=critical_failures,
            recommendations=recommendations,
            production_readiness_level=readiness_level
        )
        
        return report
    
    def _calculate_overall_score(self, 
                               agi_results: Optional[List[TestMetrics]],
                               performance_results: Optional[List[TestMetrics]],
                               security_results: Optional[List[TestMetrics]], 
                               integration_results: Optional[List[TestMetrics]]) -> float:
        """Calculate weighted overall score"""
        
        # Weighted scoring: AGI (40%), Security (30%), Integration (20%), Performance (10%)
        weights = {
            'agi': 0.40,
            'security': 0.30, 
            'integration': 0.20,
            'performance': 0.10
        }
        
        scores = {}
        
        # Calculate individual suite scores
        if agi_results:
            passed = len([r for r in agi_results if r.status == TestStatus.PASSED])
            total = len(agi_results)
            scores['agi'] = (passed / total * 100) if total > 0 else 0
        
        if security_results:
            passed = len([r for r in security_results if r.status == TestStatus.PASSED])
            total = len(security_results)
            scores['security'] = (passed / total * 100) if total > 0 else 0
            
        if integration_results:
            passed = len([r for r in integration_results if r.status == TestStatus.PASSED])
            total = len(integration_results)
            scores['integration'] = (passed / total * 100) if total > 0 else 0
            
        if performance_results:
            passed = len([r for r in performance_results if r.status == TestStatus.PASSED])
            total = len(performance_results)
            scores['performance'] = (passed / total * 100) if total > 0 else 0
        
        # Calculate weighted average
        total_weight = 0
        weighted_score = 0
        
        for test_type, weight in weights.items():
            if test_type in scores:
                weighted_score += scores[test_type] * weight
                total_weight += weight
        
        return weighted_score / total_weight if total_weight > 0 else 0
    
    def _summarize_test_results(self, results: Optional[List[TestMetrics]], test_type: str) -> Dict[str, Any]:
        """Summarize test results for a specific test type"""
        if not results:
            return {
                'test_type': test_type,
                'executed': False,
                'total_tests': 0,
                'passed_tests': 0,
                'failed_tests': 0,
                'success_rate_percent': 0,
                'average_response_time_ms': 0,
                'details': []
            }
        
        passed = len([r for r in results if r.status == TestStatus.PASSED])
        failed = len([r for r in results if r.status == TestStatus.FAILED])
        total = len(results)
        
        # Calculate average response time
        response_times = [r.response_time_ms for r in results if r.response_time_ms > 0]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        return {
            'test_type': test_type,
            'executed': True,
            'total_tests': total,
            'passed_tests': passed,
            'failed_tests': failed,
            'success_rate_percent': (passed / total * 100) if total > 0 else 0,
            'average_response_time_ms': avg_response_time,
            'details': [
                {
                    'test_name': r.test_name,
                    'status': r.status.value,
                    'response_time_ms': r.response_time_ms,
                    'error_message': r.error_message
                } for r in results
            ]
        }
    
    def _generate_recommendations(self, results: List[TestMetrics], overall_score: float) -> List[str]:
        """Generate improvement recommendations based on test results"""
        recommendations = []
        
        # Score-based recommendations
        if overall_score < 60:
            recommendations.append("🚫 CRITICAL: System not ready for production - major issues detected")
        elif overall_score < 80:
            recommendations.append("⚠️  System needs improvement before production deployment")
        elif overall_score < 95:
            recommendations.append("✅ System is production ready with minor optimizations needed")
        else:
            recommendations.append("🏆 Excellent! System exceeds production readiness standards")
        
        # Specific failure recommendations
        failed_tests = [r for r in results if r.status == TestStatus.FAILED]
        
        agi_failures = [r for r in failed_tests if 'agi' in r.test_name.lower() or 'reasoning' in r.test_name.lower()]
        if agi_failures:
            recommendations.append("🧠 AGI Capability Issues: Review model training and Romanian language processing")
        
        security_failures = [r for r in failed_tests if 'security' in r.test_name.lower()]  
        if security_failures:
            recommendations.append("🔒 Security Vulnerabilities: Address security issues before production")
        
        performance_failures = [r for r in failed_tests if 'performance' in r.test_name.lower()]
        if performance_failures:
            recommendations.append("⚡ Performance Issues: Optimize response times and resource usage")
        
        integration_failures = [r for r in failed_tests if 'integration' in r.test_name.lower()]
        if integration_failures:
            recommendations.append("🔗 Integration Issues: Fix service communication and API consistency")
        
        return recommendations
    
    def _assess_production_readiness(self, overall_score: float, critical_failures: List[str], all_results: List[TestMetrics]) -> str:
        """Assess production readiness level"""
        
        # Critical failure check
        if critical_failures:
            return "NOT_READY"
        
        # Score-based assessment
        if overall_score >= 95:
            return "PRODUCTION_GRADE"
        elif overall_score >= 85:
            return "READY"
        elif overall_score >= 70:
            return "NEEDS_IMPROVEMENT"
        else:
            return "NOT_READY"
    
    async def save_report_to_file(self, report: ProductionTestReport, filename: str = None) -> str:
        """Save production test report to file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"romai_production_test_report_{timestamp}.json"
        
        # Convert dataclass to dict for JSON serialization
        report_dict = {
            'test_timestamp': report.test_timestamp,
            'total_duration_seconds': report.total_duration_seconds,
            'overall_success': report.overall_success,
            'overall_score': report.overall_score,
            'agi_tests': report.agi_tests,
            'performance_tests': report.performance_tests,
            'security_tests': report.security_tests,
            'integration_tests': report.integration_tests,
            'total_tests': report.total_tests,
            'passed_tests': report.passed_tests,
            'failed_tests': report.failed_tests,
            'critical_failures': report.critical_failures,
            'recommendations': report.recommendations,
            'production_readiness_level': report.production_readiness_level
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report_dict, f, indent=2, ensure_ascii=False)
        
        logger.info(f"📄 Production test report saved to: {filename}")
        return filename
    
    def print_summary_report(self, report: ProductionTestReport):
        """Print a formatted summary report to console"""
        print("\n" + "="*80)
        print("🚀 RomAI AGI Production Testing Suite Report")
        print("="*80)
        print(f"📅 Test Date: {report.test_timestamp}")
        print(f"⏱️  Duration: {report.total_duration_seconds:.1f} seconds")
        print(f"🏆 Overall Score: {report.overall_score:.1f}/100")
        print(f"✅ Overall Success: {'YES' if report.overall_success else 'NO'}")
        print(f"📊 Production Readiness: {report.production_readiness_level}")
        print("\n" + "-"*80)
        
        # Test suite summaries
        test_suites = [
            ("🧠 AGI Capabilities", report.agi_tests),
            ("⚡ Performance", report.performance_tests),
            ("🔒 Security", report.security_tests),
            ("🔗 Integration", report.integration_tests)
        ]
        
        for suite_name, suite_data in test_suites:
            if suite_data['executed']:
                success_rate = suite_data['success_rate_percent']
                status_emoji = "✅" if success_rate >= 90 else "⚠️" if success_rate >= 70 else "❌"
                print(f"{suite_name}: {status_emoji} {suite_data['passed_tests']}/{suite_data['total_tests']} "
                      f"({success_rate:.1f}%) - Avg: {suite_data['average_response_time_ms']:.1f}ms")
            else:
                print(f"{suite_name}: ⏭️  Not executed")
        
        # Critical failures
        if report.critical_failures:
            print("\n🚨 Critical Failures:")
            for failure in report.critical_failures:
                print(f"   ❌ {failure}")
        
        # Recommendations  
        if report.recommendations:
            print("\n💡 Recommendations:")
            for rec in report.recommendations:
                print(f"   {rec}")
        
        print("\n" + "="*80)

# Factory function for easy usage
async def run_production_tests(base_url: str = "http://localhost:6100", 
                             duration_minutes: int = 10,
                             save_report: bool = True) -> ProductionTestReport:
    """
    Run the complete RomAI production testing suite
    
    Args:
        base_url: Base URL of RomAI service
        duration_minutes: Duration for performance tests
        save_report: Whether to save report to file
        
    Returns:
        ProductionTestReport with complete results
    """
    suite = ProductionTestingSuite(base_url)
    
    report = await suite.run_complete_test_suite(
        performance_duration_minutes=duration_minutes
    )
    
    # Print summary
    suite.print_summary_report(report)
    
    # Save report if requested
    if save_report:
        filename = await suite.save_report_to_file(report)
        print(f"📄 Full report saved to: {filename}")
    
    return report

# Example usage
if __name__ == "__main__":
    async def main():
        """Run production tests"""
        logger.info("🚀 Starting RomAI Production Testing Suite")
        
        # Run complete test suite
        report = await run_production_tests(
            base_url="http://localhost:6100",
            duration_minutes=5,  # Shorter duration for example
            save_report=True
        )
        
        # Production readiness assessment
        if report.production_readiness_level in ["READY", "PRODUCTION_GRADE"]:
            print("\n🎉 RomAI is ready for production deployment!")
        else:
            print(f"\n⚠️  RomAI needs improvement before production: {report.production_readiness_level}")
    
    # Run the production testing suite
    asyncio.run(main())
    print("✅ Production Testing Suite completed")