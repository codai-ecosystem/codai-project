#!/usr/bin/env python3
"""
Run comprehensive testing against enhanced secure server
"""

import asyncio
import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath('.'))

from apps.romai.testing.comprehensive_inference_testing import RomAIInferenceEndpointTester

async def main():
    """Test the enhanced secure server on port 6102"""
    print("🔒 COMPREHENSIVE TESTING - ENHANCED SECURE ROMAI SERVER")
    print("🎯 Microsoft Azure ML Standards Validation")
    print("=" * 70)
    
    # Test against the enhanced secure server
    async with RomAIInferenceEndpointTester(base_url="http://localhost:6102") as tester:
        # Override the session to include API key authentication
        import aiohttp
        
        # Close existing session
        if tester.session:
            await tester.session.close()
        
        # Create authenticated session
        headers = {
            "Authorization": "Bearer romai_secure_api_key_2025_production",
            "Content-Type": "application/json"
        }
        
        tester.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=100),
            headers=headers
        )
        
        # Run the full testing suite
        report = await tester.run_comprehensive_test_suite()
        
        # Display enhanced results
        print("\n🎯 ENHANCED SECURITY VALIDATION RESULTS:")
        print(f"   Overall Status: {report['overall_assessment']['status']}")
        print(f"   Success Rate: {report['overall_assessment']['overall_success_rate']}%")
        print(f"   Compliance Score: {report['overall_assessment']['overall_compliance_score']}/100")
        print(f"   Microsoft Standards Met: {report['overall_assessment']['microsoft_standards_met']}")
        
        # Show specific improvements
        security_tests = [r for r in report['detailed_test_results'] if 'security' in r['test_name']]
        if security_tests:
            for test in security_tests:
                print(f"   Security Test '{test['test_name']}': {test['compliance_score']:.1f}%")
        
        math_tests = [r for r in report['detailed_test_results'] if 'math' in r['test_name']]
        if math_tests:
            for test in math_tests:
                print(f"   Math Test '{test['test_name']}': {test['compliance_score']:.1f}%")
        
        if report['overall_assessment']['microsoft_standards_met']:
            print("\n✅ PRODUCTION READY - Enhanced Security Fixes Successful!")
            print("🚀 Ready for Microsoft Azure ML Production Deployment")
        else:
            print(f"\n⚠️  Additional improvements needed")
            if 'recommendations' in report:
                for rec in report['recommendations']:
                    print(f"   - {rec}")

if __name__ == "__main__":
    asyncio.run(main())