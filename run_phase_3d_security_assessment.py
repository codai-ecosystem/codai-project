"""
RomAI AGI - Phase 3D Security Assessment Runner
===============================================

Executes comprehensive security assessment for RomAI AGI system including
vulnerability scanning, penetration testing, and compliance validation.

Author: RomAI Development Team
Created: August 28, 2025
Phase: 3D - Security & Compliance Hardening
"""

import asyncio
import sys
import time
from pathlib import Path

# Add the RomAI module to path correctly
sys.path.append(str(Path(__file__).parent / "apps" / "romai" / "src"))

from ml.security.security_assessment_framework import (
    SecurityAssessmentEngine,
    SecuritySeverity,
    ComplianceStandard
)

async def wait_for_server_ready(target_url: str = "http://localhost:6101", max_wait: int = 30) -> bool:
    """Wait for RomAI server to be ready"""
    import aiohttp
    
    print("⏳ Waiting for RomAI server to be ready...")
    
    for attempt in range(max_wait):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{target_url}/health", timeout=5) as response:
                    if response.status == 200:
                        print("✅ RomAI server is ready!")
                        return True
        except Exception as e:
            if attempt < max_wait - 1:
                print(f"⏳ Attempt {attempt + 1}/{max_wait}: Server not ready, waiting...")
                await asyncio.sleep(2)
            else:
                print(f"❌ Server not ready after {max_wait} attempts: {e}")
                return False
    
    return False

async def run_phase_3d_security_assessment():
    """Run comprehensive Phase 3D security assessment"""
    
    print("🛡️ RomAI AGI - Phase 3D: Security & Compliance Hardening")
    print("=" * 80)
    print("🎯 Comprehensive Security Assessment & Vulnerability Testing")
    print("📋 Standards: EU AI Act, GDPR, OWASP Top 10, ISO 27001")
    print("")
    
    target_url = "http://localhost:6101"
    
    # Wait for server to be ready
    if not await wait_for_server_ready(target_url):
        print("❌ Cannot proceed: RomAI server is not accessible")
        return False
    
    print("🔍 Starting Phase 3D Security Assessment...")
    print("=" * 60)
    
    # Initialize security assessment engine
    security_engine = SecurityAssessmentEngine(target_url)
    
    try:
        start_time = time.time()
        
        # Execute comprehensive security assessment
        print("🛡️ Executing comprehensive security scan...")
        security_report = await security_engine.run_comprehensive_assessment()
        
        end_time = time.time()
        assessment_duration = end_time - start_time
        
        # Save detailed report
        report_path = await security_engine.save_report(security_report)
        
        # Display comprehensive results
        print("\n" + "=" * 80)
        print("🛡️ PHASE 3D SECURITY ASSESSMENT RESULTS")
        print("=" * 80)
        
        # Executive summary
        print(security_report.executive_summary)
        
        print("\n" + "=" * 60)
        print("📊 DETAILED SECURITY FINDINGS")
        print("=" * 60)
        
        if security_report.findings:
            # Group findings by severity
            by_severity = {}
            for finding in security_report.findings:
                if finding.severity not in by_severity:
                    by_severity[finding.severity] = []
                by_severity[finding.severity].append(finding)
            
            # Display findings by severity (Critical first)
            severity_order = [SecuritySeverity.CRITICAL, SecuritySeverity.HIGH, 
                            SecuritySeverity.MEDIUM, SecuritySeverity.LOW, SecuritySeverity.INFO]
            
            for severity in severity_order:
                if severity in by_severity:
                    findings = by_severity[severity]
                    print(f"\n🔴 {severity.value.upper()} SEVERITY ({len(findings)} findings):")
                    print("-" * 50)
                    
                    for i, finding in enumerate(findings[:3], 1):  # Show top 3 per severity
                        print(f"{i}. {finding.title}")
                        print(f"   Component: {finding.affected_component}")
                        print(f"   CVSS Score: {finding.cvss_score}")
                        print(f"   Description: {finding.description}")
                        print(f"   Recommendation: {finding.recommendation}")
                        print()
                    
                    if len(findings) > 3:
                        print(f"   ... and {len(findings) - 3} more {severity.value} severity issues")
                        print()
        else:
            print("✅ No security vulnerabilities detected!")
        
        print("=" * 60)
        print("📋 COMPLIANCE ASSESSMENT RESULTS")
        print("=" * 60)
        
        for assessment in security_report.compliance_assessments:
            status_emoji = "✅" if assessment.compliant else "❌"
            status_text = "COMPLIANT" if assessment.compliant else "NON-COMPLIANT"
            
            print(f"\n{status_emoji} {assessment.standard.value.upper()}: {status_text}")
            print(f"   Score: {assessment.overall_score:.1f}%")
            print(f"   Requirements Passed: {assessment.requirements_passed}/{assessment.requirements_tested}")
            
            if assessment.critical_gaps:
                print(f"   🚨 Critical Gaps:")
                for gap in assessment.critical_gaps[:3]:
                    print(f"      • {gap}")
            
            if assessment.recommendations:
                print(f"   💡 Key Recommendations:")
                for rec in assessment.recommendations[:2]:
                    print(f"      • {rec}")
            print()
        
        print("=" * 60)
        print("🎯 OVERALL SECURITY POSTURE")
        print("=" * 60)
        
        # Security score analysis
        if security_report.overall_security_score >= 90:
            score_status = "🟢 EXCELLENT"
        elif security_report.overall_security_score >= 80:
            score_status = "🟡 GOOD"
        elif security_report.overall_security_score >= 70:
            score_status = "🟠 ACCEPTABLE"
        else:
            score_status = "🔴 NEEDS IMPROVEMENT"
        
        print(f"Security Score: {security_report.overall_security_score:.1f}/100 {score_status}")
        print(f"Risk Level: {security_report.risk_level}")
        print(f"Assessment Duration: {assessment_duration:.1f} seconds")
        print(f"Total Findings: {len(security_report.findings)}")
        print(f"Compliance Standards Tested: {len(security_report.compliance_assessments)}")
        
        # Phase 3D validation criteria
        print("\n" + "=" * 60)
        print("🎯 PHASE 3D VALIDATION CRITERIA")
        print("=" * 60)
        
        critical_issues = sum(1 for f in security_report.findings if f.severity == SecuritySeverity.CRITICAL)
        high_issues = sum(1 for f in security_report.findings if f.severity == SecuritySeverity.HIGH)
        compliance_rate = sum(1 for a in security_report.compliance_assessments if a.compliant) / len(security_report.compliance_assessments) * 100
        
        # Define Phase 3D success criteria
        criteria_met = []
        criteria_failed = []
        
        # Criterion 1: No critical security vulnerabilities
        if critical_issues == 0:
            criteria_met.append("✅ Zero critical security vulnerabilities")
        else:
            criteria_failed.append(f"❌ {critical_issues} critical security vulnerabilities found")
        
        # Criterion 2: Maximum 2 high-severity issues
        if high_issues <= 2:
            criteria_met.append(f"✅ High-severity issues within acceptable limit ({high_issues}/2)")
        else:
            criteria_failed.append(f"❌ Too many high-severity issues ({high_issues}/2 max)")
        
        # Criterion 3: Security score above 80
        if security_report.overall_security_score >= 80:
            criteria_met.append(f"✅ Security score meets threshold ({security_report.overall_security_score:.1f}/80)")
        else:
            criteria_failed.append(f"❌ Security score below threshold ({security_report.overall_security_score:.1f}/80)")
        
        # Criterion 4: Compliance rate above 80%
        if compliance_rate >= 80:
            criteria_met.append(f"✅ Compliance rate meets requirement ({compliance_rate:.1f}%/80%)")
        else:
            criteria_failed.append(f"❌ Compliance rate below requirement ({compliance_rate:.1f}%/80%)")
        
        print("Criteria Met:")
        for criterion in criteria_met:
            print(f"  {criterion}")
        
        if criteria_failed:
            print("\nCriteria Failed:")
            for criterion in criteria_failed:
                print(f"  {criterion}")
        
        # Overall Phase 3D result
        print("\n" + "=" * 60)
        print("🛡️ PHASE 3D SECURITY VALIDATION RESULT")
        print("=" * 60)
        
        if not criteria_failed:
            phase_result = "🟢 PHASE 3D: SECURITY VALIDATION PASSED"
            phase_status = "All security and compliance criteria met"
            grade = "A"
        elif len(criteria_failed) <= 1:
            phase_result = "🟡 PHASE 3D: SECURITY VALIDATION PARTIALLY PASSED"
            phase_status = "Minor security issues require attention"
            grade = "B+"
        elif len(criteria_failed) <= 2:
            phase_result = "🟠 PHASE 3D: SECURITY VALIDATION NEEDS IMPROVEMENT"
            phase_status = "Significant security improvements required"
            grade = "B"
        else:
            phase_result = "🔴 PHASE 3D: SECURITY VALIDATION FAILED"
            phase_status = "Critical security issues must be resolved"
            grade = "C"
        
        print(f"{phase_result}")
        print(f"Status: {phase_status}")
        print(f"Security Grade: {grade}")
        print()
        
        print("📊 Key Metrics:")
        print(f"  • Security Score: {security_report.overall_security_score:.1f}/100")
        print(f"  • Risk Level: {security_report.risk_level}")
        print(f"  • Critical Issues: {critical_issues}")
        print(f"  • High Issues: {high_issues}")
        print(f"  • Compliance Rate: {compliance_rate:.1f}%")
        print()
        
        print("🔗 Priority Actions:")
        for i, recommendation in enumerate(security_report.recommendations[:5], 1):
            print(f"  {i}. {recommendation}")
        
        print(f"\n📄 Detailed report saved to: {report_path}")
        
        # Return success status for automation
        return len(criteria_failed) == 0
        
    except Exception as e:
        print(f"❌ Security assessment failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(run_phase_3d_security_assessment())
    if success:
        print("\n🎉 Phase 3D Security Assessment completed successfully!")
        exit(0)
    else:
        print("\n⚠️ Phase 3D Security Assessment completed with issues.")
        exit(1)