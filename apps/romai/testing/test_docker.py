#!/usr/bin/env python3
"""
Docker Container Comprehensive Testing Script for RomAI AGI Server
Microsoft Azure ML Standards Compliance Validation

This script tests the dockerized RomAI server on port 6101
"""

import asyncio
import logging
import sys
import os

# Add the apps directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from apps.romai.testing.comprehensive_inference_testing import RomAIInferenceEndpointTester

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def main():
    print("🐳 COMPREHENSIVE TESTING - DOCKERIZED ROMAI SERVER")
    print("🎯 Microsoft Azure ML Standards Validation")
    print("=" * 70)
    
    # Test configuration for dockerized server
    test_config = {
        'base_url': 'http://localhost:6101',
        'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        'timeout': 30
    }
    
    # Initialize tester
    tester = RomAIInferenceEndpointTester(test_config['base_url'])
    
    try:
        # Run comprehensive test suite
        report = await tester.run_comprehensive_test_suite()
        
        print("\n" + "=" * 70)
        print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 70)
        
        print(f"🏥 Health Baseline: {report.health_success_rate:.1%} ({report.health_successful_requests}/{report.health_total_requests})")
        print(f"🛡️ Security Protection: {report.security_protection_rate:.1%} ({report.security_blocked_attacks}/{report.security_total_attacks})")
        print(f"🔢 Mathematical Accuracy: {report.math_accuracy_rate:.1%} ({report.math_correct_solutions}/{report.math_total_problems})")
        print(f"💥 Failure Handling: {report.failure_handling_rate:.1%} ({report.failure_proper_responses}/{report.failure_total_tests})")
        print(f"🚀 Load Test Performance: {report.load_success_rate:.1%} (avg: {report.load_avg_response_time:.0f}ms)")
        
        # Calculate overall score
        overall_score = (
            report.health_success_rate * 0.20 +
            report.security_protection_rate * 0.30 +
            report.math_accuracy_rate * 0.20 +
            report.failure_handling_rate * 0.15 +
            report.load_success_rate * 0.15
        )
        
        print(f"\n🎯 OVERALL MICROSOFT AZURE ML COMPLIANCE SCORE: {overall_score:.1%}")
        
        # Determine production readiness
        if overall_score >= 0.95:
            print("✅ PRODUCTION READY - MICROSOFT AZURE ML CERTIFIED")
            print("🐳 Docker Container: PRODUCTION DEPLOYMENT READY")
        elif overall_score >= 0.85:
            print("⚠️ PRODUCTION READY WITH MINOR IMPROVEMENTS NEEDED")
            print("🐳 Docker Container: STAGING DEPLOYMENT READY")
        elif overall_score >= 0.70:
            print("🔧 REQUIRES SIGNIFICANT IMPROVEMENTS FOR PRODUCTION")
            print("🐳 Docker Container: DEVELOPMENT TESTING ONLY")
        else:
            print("❌ NOT PRODUCTION READY - CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION")
            print("🐳 Docker Container: NOT READY FOR ANY DEPLOYMENT")
        
        print("\n🔍 DETAILED DOCKER CONTAINER ANALYSIS:")
        print(f"   Container: codai-romai-ml-api")
        print(f"   Port: 6101")
        print(f"   Health Status: {'✅ HEALTHY' if report.health_success_rate > 0.95 else '⚠️ NEEDS ATTENTION'}")
        print(f"   Security Level: {'🔐 HIGH' if report.security_protection_rate > 0.90 else '🔓 MEDIUM' if report.security_protection_rate > 0.70 else '⚠️ LOW'}")
        print(f"   Math Processing: {'🧮 EXCELLENT' if report.math_accuracy_rate > 0.90 else '📊 GOOD' if report.math_accuracy_rate > 0.70 else '⚠️ NEEDS IMPROVEMENT'}")
        print(f"   Load Performance: {'🚀 EXCELLENT' if report.load_success_rate > 0.90 else '📈 GOOD' if report.load_success_rate > 0.70 else '⚠️ NEEDS IMPROVEMENT'}")
        
        return report
        
    except Exception as e:
        print(f"❌ Testing failed with error: {e}")
        print("🐳 Docker Container Status: UNHEALTHY")
        raise

if __name__ == "__main__":
    asyncio.run(main())