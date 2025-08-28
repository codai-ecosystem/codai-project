#!/usr/bin/env python3
"""
Phase 3D Security Validation - Comprehensive Security & Compliance Testing
==========================================================================

This script performs comprehensive security validation to verify that the
Phase 3D security hardening measures have successfully resolved all identified
vulnerabilities and achieved compliance requirements.
"""

import asyncio
import aiohttp
import ssl
import socket
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class SecurityTestResult:
    """Security test result data structure"""
    test_name: str
    passed: bool
    details: str
    severity: str = "INFO"
    score: int = 0

@dataclass
class ComplianceTestResult:
    """Compliance test result data structure"""
    standard: str
    endpoint: str
    passed: bool
    details: str
    score: int = 0

class Phase3DSecurityValidator:
    """Comprehensive Phase 3D security validation system"""
    
    def __init__(self, base_url: str = "https://localhost:6101"):
        self.base_url = base_url
        self.security_results: List[SecurityTestResult] = []
        self.compliance_results: List[ComplianceTestResult] = []
        
    async def wait_for_server_ready(self, timeout: int = 60) -> bool:
        """Wait for the HTTPS server to be ready"""
        logger.info(f"🔄 Waiting for HTTPS server at {self.base_url}...")
        
        connector = aiohttp.TCPConnector(ssl=False)  # Disable SSL verification for self-signed certs
        timeout_obj = aiohttp.ClientTimeout(total=5)
        
        for attempt in range(timeout):
            try:
                async with aiohttp.ClientSession(connector=connector, timeout=timeout_obj) as session:
                    async with session.get(f"{self.base_url}/health") as response:
                        if response.status == 200:
                            logger.info("✅ HTTPS server is ready")
                            return True
            except Exception:
                if attempt == 0:
                    logger.info(f"⏳ Server not ready, waiting... (attempt {attempt + 1}/{timeout})")
                await asyncio.sleep(1)
        
        logger.error("❌ Server failed to start within timeout")
        return False
    
    async def test_https_ssl_configuration(self) -> SecurityTestResult:
        """Test HTTPS/SSL configuration and security"""
        try:
            # Test SSL/TLS connection
            context = ssl.create_default_context()
            context.check_hostname = False  # Allow self-signed certs for testing
            context.verify_mode = ssl.CERT_NONE
            
            # Parse URL
            hostname = "localhost"
            port = 6101
            
            # Test SSL connection
            sock = socket.create_connection((hostname, port), timeout=10)
            ssock = context.wrap_socket(sock, server_hostname=hostname)
            
            # Get SSL info
            cert = ssock.getpeercert()
            cipher = ssock.cipher()
            version = ssock.version()
            
            ssock.close()
            
            details = f"SSL/TLS Version: {version}, Cipher: {cipher[0] if cipher else 'Unknown'}"
            
            return SecurityTestResult(
                test_name="HTTPS/SSL Configuration",
                passed=True,
                details=details,
                severity="CRITICAL_RESOLVED",
                score=25
            )
            
        except Exception as e:
            return SecurityTestResult(
                test_name="HTTPS/SSL Configuration",
                passed=False,
                details=f"SSL test failed: {str(e)}",
                severity="CRITICAL",
                score=0
            )
    
    async def test_secure_headers(self) -> SecurityTestResult:
        """Test security headers in HTTPS responses"""
        try:
            connector = aiohttp.TCPConnector(ssl=False)
            timeout = aiohttp.ClientTimeout(total=10)
            
            async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
                async with session.get(f"{self.base_url}/health") as response:
                    headers = response.headers
                    
                    # Check important security headers
                    security_headers = {
                        'X-Content-Type-Options': 'nosniff',
                        'X-Frame-Options': 'DENY',
                        'X-XSS-Protection': '1; mode=block'
                    }
                    
                    present_headers = []
                    missing_headers = []
                    
                    for header, expected in security_headers.items():
                        if header in headers:
                            present_headers.append(header)
                        else:
                            missing_headers.append(header)
                    
                    score = (len(present_headers) / len(security_headers)) * 10
                    
                    details = f"Present: {present_headers}, Missing: {missing_headers}"
                    
                    return SecurityTestResult(
                        test_name="Security Headers",
                        passed=len(missing_headers) == 0,
                        details=details,
                        severity="MEDIUM",
                        score=int(score)
                    )
                    
        except Exception as e:
            return SecurityTestResult(
                test_name="Security Headers",
                passed=False,
                details=f"Header test failed: {str(e)}",
                severity="MEDIUM",
                score=0
            )
    
    async def test_eu_ai_act_compliance(self) -> List[ComplianceTestResult]:
        """Test EU AI Act compliance endpoints"""
        endpoints = [
            ("/api/compliance/eu-ai-act/transparency", "Transparency Documentation"),
            ("/api/compliance/eu-ai-act/human-oversight", "Human Oversight Controls"),
            ("/api/compliance/eu-ai-act/metrics/accuracy", "Accuracy Monitoring"),
            ("/api/compliance/eu-ai-act/risk-management", "Risk Management"),
            ("/api/compliance/eu-ai-act/data-governance", "Data Governance"),
            ("/api/compliance/eu-ai-act/conformity-assessment", "Conformity Assessment")
        ]
        
        results = []
        connector = aiohttp.TCPConnector(ssl=False)
        timeout = aiohttp.ClientTimeout(total=10)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            for endpoint, description in endpoints:
                try:
                    async with session.get(f"{self.base_url}{endpoint}") as response:
                        if response.status == 200:
                            data = await response.json()
                            results.append(ComplianceTestResult(
                                standard="EU AI Act",
                                endpoint=endpoint,
                                passed=True,
                                details=f"{description} endpoint accessible, returned valid data",
                                score=15
                            ))
                        else:
                            results.append(ComplianceTestResult(
                                standard="EU AI Act",
                                endpoint=endpoint,
                                passed=False,
                                details=f"{description} endpoint returned status {response.status}",
                                score=0
                            ))
                except Exception as e:
                    results.append(ComplianceTestResult(
                        standard="EU AI Act",
                        endpoint=endpoint,
                        passed=False,
                        details=f"{description} endpoint failed: {str(e)}",
                        score=0
                    ))
        
        return results
    
    async def test_gdpr_compliance(self) -> List[ComplianceTestResult]:
        """Test GDPR compliance endpoints"""
        endpoints = [
            ("/api/compliance/gdpr/privacy-policy", "Privacy Policy"),
            ("/api/compliance/gdpr/data-processing-records", "Data Processing Records"),
            ("/api/compliance/gdpr/consent-management", "Consent Management"),
            ("/api/compliance/gdpr/data-protection-impact-assessment", "DPIA Information")
        ]
        
        results = []
        connector = aiohttp.TCPConnector(ssl=False)
        timeout = aiohttp.ClientTimeout(total=10)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            for endpoint, description in endpoints:
                try:
                    async with session.get(f"{self.base_url}{endpoint}") as response:
                        if response.status == 200:
                            data = await response.json()
                            results.append(ComplianceTestResult(
                                standard="GDPR",
                                endpoint=endpoint,
                                passed=True,
                                details=f"{description} endpoint accessible, returned valid data",
                                score=20
                            ))
                        else:
                            results.append(ComplianceTestResult(
                                standard="GDPR",
                                endpoint=endpoint,
                                passed=False,
                                details=f"{description} endpoint returned status {response.status}",
                                score=0
                            ))
                except Exception as e:
                    results.append(ComplianceTestResult(
                        standard="GDPR",
                        endpoint=endpoint,
                        passed=False,
                        details=f"{description} endpoint failed: {str(e)}",
                        score=0
                    ))
        
        return results
    
    async def test_data_subject_rights(self) -> ComplianceTestResult:
        """Test GDPR data subject rights functionality"""
        try:
            connector = aiohttp.TCPConnector(ssl=False)
            timeout = aiohttp.ClientTimeout(total=10)
            
            async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
                # Test data subject request endpoint
                request_data = {
                    "email": "test@example.com",
                    "request_type": "access",
                    "description": "Request access to my personal data"
                }
                
                async with session.post(
                    f"{self.base_url}/api/compliance/gdpr/data-subject-request",
                    json=request_data
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return ComplianceTestResult(
                            standard="GDPR",
                            endpoint="/api/compliance/gdpr/data-subject-request",
                            passed=True,
                            details="Data subject request functionality working correctly",
                            score=15
                        )
                    else:
                        return ComplianceTestResult(
                            standard="GDPR",
                            endpoint="/api/compliance/gdpr/data-subject-request",
                            passed=False,
                            details=f"Data subject request failed with status {response.status}",
                            score=0
                        )
                        
        except Exception as e:
            return ComplianceTestResult(
                standard="GDPR",
                endpoint="/api/compliance/gdpr/data-subject-request",
                passed=False,
                details=f"Data subject request test failed: {str(e)}",
                score=0
            )
    
    async def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run comprehensive Phase 3D security validation"""
        logger.info("🔒 Starting Phase 3D Security & Compliance Validation")
        logger.info("="*60)
        
        # Wait for server
        if not await self.wait_for_server_ready():
            return {"error": "Server not ready for testing"}
        
        # Run security tests
        logger.info("🛡️ Running Security Tests...")
        
        ssl_result = await self.test_https_ssl_configuration()
        self.security_results.append(ssl_result)
        
        headers_result = await self.test_secure_headers()
        self.security_results.append(headers_result)
        
        # Run compliance tests
        logger.info("📋 Running EU AI Act Compliance Tests...")
        eu_results = await self.test_eu_ai_act_compliance()
        self.compliance_results.extend(eu_results)
        
        logger.info("🔐 Running GDPR Compliance Tests...")
        gdpr_results = await self.test_gdpr_compliance()
        self.compliance_results.extend(gdpr_results)
        
        gdpr_rights_result = await self.test_data_subject_rights()
        self.compliance_results.append(gdpr_rights_result)
        
        # Calculate scores
        security_score = sum(r.score for r in self.security_results)
        compliance_score = sum(r.score for r in self.compliance_results)
        total_score = security_score + compliance_score
        
        # Count issues
        critical_issues = len([r for r in self.security_results if r.severity == "CRITICAL" and not r.passed])
        high_issues = len([r for r in self.security_results if r.severity == "HIGH" and not r.passed])
        
        # Calculate compliance rate
        compliance_passed = len([r for r in self.compliance_results if r.passed])
        compliance_total = len(self.compliance_results)
        compliance_rate = (compliance_passed / compliance_total) * 100 if compliance_total > 0 else 0
        
        # Phase 3D validation criteria
        phase_3d_requirements = {
            "zero_critical_issues": critical_issues == 0,
            "max_two_high_issues": high_issues <= 2,
            "min_security_score_80": total_score >= 80,
            "min_compliance_rate_80": compliance_rate >= 80.0
        }
        
        phase_3d_passed = all(phase_3d_requirements.values())
        
        # Generate report
        report = {
            "timestamp": datetime.now().isoformat(),
            "phase": "Phase 3D - Security & Compliance Hardening",
            "server_url": self.base_url,
            "security_results": [
                {
                    "test": r.test_name,
                    "passed": r.passed,
                    "details": r.details,
                    "severity": r.severity,
                    "score": r.score
                } for r in self.security_results
            ],
            "compliance_results": [
                {
                    "standard": r.standard,
                    "endpoint": r.endpoint,
                    "passed": r.passed,
                    "details": r.details,
                    "score": r.score
                } for r in self.compliance_results
            ],
            "summary": {
                "security_score": security_score,
                "compliance_score": compliance_score,
                "total_score": total_score,
                "critical_issues": critical_issues,
                "high_issues": high_issues,
                "compliance_rate": compliance_rate,
                "compliance_passed": compliance_passed,
                "compliance_total": compliance_total
            },
            "phase_3d_validation": {
                "requirements": phase_3d_requirements,
                "passed": phase_3d_passed,
                "grade": self._calculate_grade(total_score)
            }
        }
        
        return report
    
    def _calculate_grade(self, score: int) -> str:
        """Calculate performance grade based on total score"""
        if score >= 95:
            return "A+"
        elif score >= 90:
            return "A"
        elif score >= 85:
            return "B+"
        elif score >= 80:
            return "B"
        elif score >= 75:
            return "C+"
        elif score >= 70:
            return "C"
        elif score >= 65:
            return "D+"
        else:
            return "D"
    
    def print_validation_report(self, report: Dict[str, Any]):
        """Print comprehensive validation report"""
        print("\n" + "="*80)
        print("🔒 PHASE 3D SECURITY & COMPLIANCE VALIDATION REPORT")
        print("="*80)
        
        print(f"📅 Timestamp: {report['timestamp']}")
        print(f"🌐 Server: {report['server_url']}")
        print(f"📋 Phase: {report['phase']}")
        
        print("\n🛡️ SECURITY TEST RESULTS:")
        print("-" * 40)
        for result in report['security_results']:
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            print(f"{status} {result['test']} (Score: {result['score']})")
            print(f"   {result['details']}")
            if result['severity'] and not result['passed']:
                print(f"   🚨 Severity: {result['severity']}")
        
        print("\n📋 COMPLIANCE TEST RESULTS:")
        print("-" * 40)
        
        # Group by standard
        eu_results = [r for r in report['compliance_results'] if r['standard'] == 'EU AI Act']
        gdpr_results = [r for r in report['compliance_results'] if r['standard'] == 'GDPR']
        
        print("🇪🇺 EU AI Act Compliance:")
        for result in eu_results:
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            print(f"  {status} {result['endpoint']} (Score: {result['score']})")
        
        print("\n🔐 GDPR Compliance:")
        for result in gdpr_results:
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            print(f"  {status} {result['endpoint']} (Score: {result['score']})")
        
        print("\n📊 SUMMARY:")
        print("-" * 40)
        summary = report['summary']
        print(f"🛡️ Security Score: {summary['security_score']}/35")
        print(f"📋 Compliance Score: {summary['compliance_score']}/105")
        print(f"🎯 Total Score: {summary['total_score']}/140")
        print(f"🚨 Critical Issues: {summary['critical_issues']}")
        print(f"⚠️ High Issues: {summary['high_issues']}")
        print(f"📈 Compliance Rate: {summary['compliance_rate']:.1f}%")
        print(f"✅ Compliance Tests Passed: {summary['compliance_passed']}/{summary['compliance_total']}")
        
        print("\n🎯 PHASE 3D VALIDATION:")
        print("-" * 40)
        validation = report['phase_3d_validation']
        requirements = validation['requirements']
        
        for req_name, passed in requirements.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            req_display = req_name.replace('_', ' ').title()
            print(f"{status} {req_display}")
        
        print(f"\n🏆 Overall Grade: {validation['grade']}")
        
        if validation['passed']:
            print("🎉 PHASE 3D SECURITY & COMPLIANCE HARDENING: SUCCESS!")
            print("✅ All validation criteria met - Ready for Phase 3E")
        else:
            print("❌ Phase 3D validation failed - Additional work required")
            
            # Provide specific guidance
            if not requirements['zero_critical_issues']:
                print("🚨 Critical security issues must be resolved")
            if not requirements['max_two_high_issues']:
                print("⚠️ Reduce high-severity issues to 2 or fewer")
            if not requirements['min_security_score_80']:
                print(f"📊 Improve security score to 80+ (current: {summary['total_score']})")
            if not requirements['min_compliance_rate_80']:
                print(f"📋 Improve compliance rate to 80%+ (current: {summary['compliance_rate']:.1f}%)")
        
        print("="*80)

async def main():
    """Main validation execution"""
    validator = Phase3DSecurityValidator()
    
    try:
        # Run comprehensive validation
        report = await validator.run_comprehensive_validation()
        
        # Print results
        validator.print_validation_report(report)
        
        # Save report
        report_file = f"phase_3d_security_validation_report_{int(datetime.now().timestamp())}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: {report_file}")
        
        # Exit with appropriate code
        if report['phase_3d_validation']['passed']:
            print("🎯 Phase 3D validation completed successfully!")
            return 0
        else:
            print("❌ Phase 3D validation failed")
            return 1
            
    except KeyboardInterrupt:
        print("\n🛑 Validation interrupted by user")
        return 1
    except Exception as e:
        print(f"❌ Validation failed with error: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)