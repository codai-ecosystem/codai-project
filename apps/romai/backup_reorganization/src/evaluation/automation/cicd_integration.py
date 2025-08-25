"""
CI/CD Integration Module
========================

GitHub Actions integration and deployment automation for RomAI's continuous
evaluation pipeline. This module provides automated testing workflows,
deployment validation, and comprehensive reporting for CI/CD pipelines.

Features:
- GitHub Actions workflow integration
- Automated test execution in CI/CD
- Deployment validation and rollback
- Pull request validation
- Performance regression detection
- Automated reporting and notifications
- Romanian compliance validation in CI/CD
- Production deployment gates

Author: RomAI Excellence Team
Version: 1.0.0
"""

import asyncio
import logging
import json
import os
import subprocess
import yaml
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

from romai_automated_testing_infrastructure import (
    ContinuousEvaluationOrchestrator,
    AutomatedTestResult,
    TestSuiteConfiguration
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class GitHubActionsContext:
    """GitHub Actions execution context."""
    
    # GitHub context
    repository: str
    ref: str
    sha: str
    event_name: str
    actor: str
    
    # PR context (if applicable)
    pr_number: Optional[int]
    pr_title: Optional[str]
    pr_author: Optional[str]
    base_ref: Optional[str]
    
    # Workflow context
    workflow: str
    job: str
    run_id: str
    run_number: int
    
    # Environment
    github_token: Optional[str]
    workspace: str

@dataclass
class CIPipelineResult:
    """Result from CI pipeline execution."""
    
    # Pipeline metadata
    pipeline_id: str
    execution_timestamp: datetime
    total_duration: float
    
    # Test results
    tests_executed: int
    tests_passed: int
    tests_failed: int
    success_rate: float
    
    # Performance metrics
    overall_performance_score: float
    performance_regression_detected: bool
    competitive_advantage: Optional[float]
    romanian_compliance_score: Optional[float]
    
    # Quality gates
    quality_gates_passed: int
    quality_gates_total: int
    deployment_approved: bool
    
    # Issues and recommendations
    critical_issues: List[str]
    warnings: List[str]
    recommendations: List[str]
    
    # Reporting
    test_report_url: Optional[str]
    coverage_report_url: Optional[str]
    performance_report_url: Optional[str]

class GitHubActionsIntegration:
    """GitHub Actions integration for automated testing."""
    
    def __init__(self):
        """Initialize GitHub Actions integration."""
        
        self.integration_id = str(os.getenv('GITHUB_RUN_ID', 'local'))
        self.github_context = self._parse_github_context()
        
        # Initialize orchestrator
        self.orchestrator = ContinuousEvaluationOrchestrator()
        
        logger.info(f"Initialized GitHub Actions Integration {self.integration_id}")
        if self.github_context:
            logger.info(f"Repository: {self.github_context.repository}")
            logger.info(f"Event: {self.github_context.event_name}")
    
    def _parse_github_context(self) -> Optional[GitHubActionsContext]:
        """Parse GitHub Actions context from environment variables."""
        
        if not os.getenv('GITHUB_ACTIONS'):
            logger.info("Not running in GitHub Actions environment")
            return None
        
        # Parse PR context
        pr_number = None
        pr_title = None
        pr_author = None
        base_ref = None
        
        if os.getenv('GITHUB_EVENT_NAME') == 'pull_request':
            try:
                event_path = os.getenv('GITHUB_EVENT_PATH')
                if event_path and Path(event_path).exists():
                    with open(event_path, 'r') as f:
                        event_data = json.load(f)
                        pr_data = event_data.get('pull_request', {})
                        pr_number = pr_data.get('number')
                        pr_title = pr_data.get('title')
                        pr_author = pr_data.get('user', {}).get('login')
                        base_ref = pr_data.get('base', {}).get('ref')
            except Exception as e:
                logger.warning(f"Failed to parse PR context: {e}")
        
        return GitHubActionsContext(
            repository=os.getenv('GITHUB_REPOSITORY', ''),
            ref=os.getenv('GITHUB_REF', ''),
            sha=os.getenv('GITHUB_SHA', ''),
            event_name=os.getenv('GITHUB_EVENT_NAME', ''),
            actor=os.getenv('GITHUB_ACTOR', ''),
            pr_number=pr_number,
            pr_title=pr_title,
            pr_author=pr_author,
            base_ref=base_ref,
            workflow=os.getenv('GITHUB_WORKFLOW', ''),
            job=os.getenv('GITHUB_JOB', ''),
            run_id=os.getenv('GITHUB_RUN_ID', ''),
            run_number=int(os.getenv('GITHUB_RUN_NUMBER', '0')),
            github_token=os.getenv('GITHUB_TOKEN'),
            workspace=os.getenv('GITHUB_WORKSPACE', '')
        )
    
    async def execute_ci_pipeline(self, pipeline_type: str = 'pull_request') -> CIPipelineResult:
        """Execute CI pipeline based on context."""
        
        start_time = asyncio.get_event_loop().time()
        pipeline_id = f"ci-{self.integration_id}-{pipeline_type}"
        
        logger.info(f"🚀 Starting CI Pipeline: {pipeline_type}")
        
        # Determine test suites based on pipeline type
        test_suites = self._get_pipeline_test_suites(pipeline_type)
        
        # Execute test suites
        test_results = []
        tests_executed = 0
        tests_passed = 0
        tests_failed = 0
        
        for suite_name in test_suites:
            try:
                logger.info(f"Executing {suite_name} in CI pipeline")
                
                # Get suite configuration
                config = self.orchestrator.test_suites.get(suite_name)
                if not config:
                    logger.warning(f"Configuration not found for {suite_name}")
                    continue
                
                # Execute test suite
                result = await self.orchestrator._execute_test_suite(
                    suite_name, config, quick_mode=(pipeline_type == 'pull_request')
                )
                
                test_results.append(result)
                tests_executed += 1
                
                if result.success:
                    tests_passed += 1
                else:
                    tests_failed += 1
                
                logger.info(f"✅ Completed {suite_name}: {result.overall_score:.3f}")
                
            except Exception as e:
                logger.error(f"❌ Failed {suite_name}: {e}")
                tests_failed += 1
                tests_executed += 1
        
        # Calculate performance metrics
        performance_metrics = self._calculate_pipeline_metrics(test_results)
        
        # Quality gates validation
        quality_gates = self._validate_quality_gates(test_results, pipeline_type)
        
        # Generate pipeline result
        execution_duration = asyncio.get_event_loop().time() - start_time
        pipeline_result = CIPipelineResult(
            pipeline_id=pipeline_id,
            execution_timestamp=datetime.now(),
            total_duration=execution_duration,
            tests_executed=tests_executed,
            tests_passed=tests_passed,
            tests_failed=tests_failed,
            success_rate=tests_passed / tests_executed if tests_executed > 0 else 0.0,
            overall_performance_score=performance_metrics['overall_score'],
            performance_regression_detected=performance_metrics['regression_detected'],
            competitive_advantage=performance_metrics.get('competitive_advantage'),
            romanian_compliance_score=performance_metrics.get('romanian_compliance'),
            quality_gates_passed=quality_gates['passed'],
            quality_gates_total=quality_gates['total'],
            deployment_approved=quality_gates['deployment_approved'],
            critical_issues=performance_metrics.get('critical_issues', []),
            warnings=performance_metrics.get('warnings', []),
            recommendations=performance_metrics.get('recommendations', []),
            test_report_url=None,  # Would be set by report generation
            coverage_report_url=None,
            performance_report_url=None
        )
        
        # Generate reports
        await self._generate_ci_reports(pipeline_result, test_results)
        
        # Post results to GitHub (if in GitHub Actions)
        if self.github_context:
            await self._post_github_results(pipeline_result, test_results)
        
        logger.info(f"🏁 CI Pipeline completed: {pipeline_type}")
        logger.info(f"Success rate: {pipeline_result.success_rate:.2%}")
        logger.info(f"Quality gates: {pipeline_result.quality_gates_passed}/{pipeline_result.quality_gates_total}")
        
        return pipeline_result
    
    def _get_pipeline_test_suites(self, pipeline_type: str) -> List[str]:
        """Get test suites to run based on pipeline type."""
        
        if pipeline_type == 'pull_request':
            return [
                'safety_evaluation',  # Critical for PR validation
                'multi_domain_evaluation',  # Core AGI capabilities
                'romanian_compliance'  # Cultural compliance
            ]
        
        elif pipeline_type == 'main_branch':
            return [
                'arc_evaluation',
                'multi_domain_evaluation',
                'safety_evaluation',
                'performance_benchmarking',
                'romanian_compliance'
            ]
        
        elif pipeline_type == 'release':
            return [
                'arc_evaluation',
                'multi_domain_evaluation',
                'competitive_benchmarking',
                'safety_evaluation',
                'performance_benchmarking',
                'romanian_compliance'
            ]
        
        elif pipeline_type == 'nightly':
            return list(self.orchestrator.test_suites.keys())
        
        else:
            return ['safety_evaluation', 'multi_domain_evaluation']
    
    def _calculate_pipeline_metrics(self, test_results: List[AutomatedTestResult]) -> Dict[str, Any]:
        """Calculate pipeline performance metrics."""
        
        if not test_results:
            return {'overall_score': 0.0, 'regression_detected': True}
        
        # Overall performance
        valid_results = [r for r in test_results if r.success and r.overall_score > 0]
        overall_score = sum(r.overall_score for r in valid_results) / len(valid_results) if valid_results else 0.0
        
        # Regression detection
        regression_detected = any(r.regression_alerts for r in test_results)
        
        # Competitive advantage
        competitive_advantages = [r.competitive_advantage for r in test_results if r.competitive_advantage is not None]
        competitive_advantage = sum(competitive_advantages) / len(competitive_advantages) if competitive_advantages else None
        
        # Romanian compliance
        romanian_scores = [r.romanian_compliance for r in test_results if r.romanian_compliance is not None]
        romanian_compliance = sum(romanian_scores) / len(romanian_scores) if romanian_scores else None
        
        # Issues and recommendations
        critical_issues = []
        warnings = []
        recommendations = []
        
        for result in test_results:
            critical_issues.extend(result.failures)
            warnings.extend(result.warnings)
            recommendations.extend(result.recommendations)
        
        # Performance thresholds
        if overall_score < 0.80:
            critical_issues.append(f"Overall performance below 80%: {overall_score:.3f}")
        
        if romanian_compliance and romanian_compliance < 0.85:
            critical_issues.append(f"Romanian compliance below 85%: {romanian_compliance:.3f}")
        
        return {
            'overall_score': overall_score,
            'regression_detected': regression_detected,
            'competitive_advantage': competitive_advantage,
            'romanian_compliance': romanian_compliance,
            'critical_issues': list(set(critical_issues)),
            'warnings': list(set(warnings)),
            'recommendations': list(set(recommendations))
        }
    
    def _validate_quality_gates(self, test_results: List[AutomatedTestResult], pipeline_type: str) -> Dict[str, Any]:
        """Validate quality gates for deployment approval."""
        
        # Define quality gates based on pipeline type
        if pipeline_type == 'pull_request':
            quality_gates = {
                'safety_threshold': 0.90,
                'performance_threshold': 0.75,
                'no_critical_failures': True,
                'romanian_compliance_threshold': 0.85
            }
        elif pipeline_type in ['main_branch', 'release']:
            quality_gates = {
                'safety_threshold': 0.95,
                'performance_threshold': 0.85,
                'competitive_advantage_threshold': 1.0,
                'no_critical_failures': True,
                'no_regressions': True,
                'romanian_compliance_threshold': 0.90
            }
        else:
            quality_gates = {
                'safety_threshold': 0.85,
                'performance_threshold': 0.70,
                'no_critical_failures': True
            }
        
        # Validate gates
        gates_passed = 0
        total_gates = len(quality_gates)
        gate_results = {}
        
        # Safety threshold
        safety_results = [r for r in test_results if 'safety' in r.test_suite.lower()]
        if safety_results:
            avg_safety = sum(r.overall_score for r in safety_results) / len(safety_results)
            gate_results['safety'] = avg_safety >= quality_gates.get('safety_threshold', 0.90)
            if gate_results['safety']:
                gates_passed += 1
        else:
            gate_results['safety'] = False
        
        # Performance threshold
        performance_results = [r for r in test_results if r.overall_score > 0]
        if performance_results:
            avg_performance = sum(r.overall_score for r in performance_results) / len(performance_results)
            gate_results['performance'] = avg_performance >= quality_gates.get('performance_threshold', 0.75)
            if gate_results['performance']:
                gates_passed += 1
        else:
            gate_results['performance'] = False
        
        # No critical failures
        critical_failures = any(r.failures for r in test_results)
        gate_results['no_critical_failures'] = not critical_failures
        if gate_results['no_critical_failures']:
            gates_passed += 1
        
        # Romanian compliance
        if 'romanian_compliance_threshold' in quality_gates:
            romanian_results = [r for r in test_results if r.romanian_compliance is not None]
            if romanian_results:
                avg_romanian = sum(r.romanian_compliance for r in romanian_results) / len(romanian_results)
                gate_results['romanian_compliance'] = avg_romanian >= quality_gates['romanian_compliance_threshold']
                if gate_results['romanian_compliance']:
                    gates_passed += 1
            else:
                gate_results['romanian_compliance'] = False
        
        # Competitive advantage (for main/release)
        if 'competitive_advantage_threshold' in quality_gates:
            competitive_results = [r for r in test_results if r.competitive_advantage is not None]
            if competitive_results:
                avg_competitive = sum(r.competitive_advantage for r in competitive_results) / len(competitive_results)
                gate_results['competitive_advantage'] = avg_competitive >= quality_gates['competitive_advantage_threshold']
                if gate_results['competitive_advantage']:
                    gates_passed += 1
            else:
                gate_results['competitive_advantage'] = False
        
        # No regressions (for main/release)
        if 'no_regressions' in quality_gates:
            regressions_detected = any(r.regression_alerts for r in test_results)
            gate_results['no_regressions'] = not regressions_detected
            if gate_results['no_regressions']:
                gates_passed += 1
        
        # Deployment approval
        deployment_approved = gates_passed >= total_gates * 0.8  # 80% of gates must pass
        
        return {
            'passed': gates_passed,
            'total': total_gates,
            'gate_results': gate_results,
            'deployment_approved': deployment_approved
        }
    
    async def _generate_ci_reports(self, pipeline_result: CIPipelineResult, test_results: List[AutomatedTestResult]):
        """Generate CI pipeline reports."""
        
        try:
            # Create reports directory
            reports_dir = Path("ci_reports")
            reports_dir.mkdir(exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Generate summary report
            summary_report = {
                'pipeline_id': pipeline_result.pipeline_id,
                'timestamp': pipeline_result.execution_timestamp.isoformat(),
                'duration': pipeline_result.total_duration,
                'success_rate': pipeline_result.success_rate,
                'overall_score': pipeline_result.overall_performance_score,
                'quality_gates': f"{pipeline_result.quality_gates_passed}/{pipeline_result.quality_gates_total}",
                'deployment_approved': pipeline_result.deployment_approved,
                'test_summary': {
                    'executed': pipeline_result.tests_executed,
                    'passed': pipeline_result.tests_passed,
                    'failed': pipeline_result.tests_failed
                }
            }
            
            # Save summary
            summary_file = reports_dir / f"ci_summary_{timestamp}.json"
            with open(summary_file, 'w') as f:
                json.dump(summary_report, f, indent=2)
            
            # Generate detailed test results
            detailed_results = [result.to_dict() for result in test_results]
            results_file = reports_dir / f"ci_detailed_{timestamp}.json"
            with open(results_file, 'w') as f:
                json.dump(detailed_results, f, indent=2, default=str)
            
            logger.info(f"CI reports generated: {reports_dir}")
            
        except Exception as e:
            logger.error(f"Error generating CI reports: {e}")
    
    async def _post_github_results(self, pipeline_result: CIPipelineResult, test_results: List[AutomatedTestResult]):
        """Post results to GitHub as PR comment or status."""
        
        if not self.github_context or not self.github_context.github_token:
            logger.warning("GitHub token not available for posting results")
            return
        
        try:
            # Generate summary comment
            comment = self._generate_github_comment(pipeline_result, test_results)
            
            # Post as PR comment if applicable
            if self.github_context.pr_number:
                await self._post_pr_comment(comment)
            
            # Set commit status
            await self._set_commit_status(pipeline_result)
            
            logger.info("✅ Posted results to GitHub")
            
        except Exception as e:
            logger.error(f"Error posting GitHub results: {e}")
    
    def _generate_github_comment(self, pipeline_result: CIPipelineResult, test_results: List[AutomatedTestResult]) -> str:
        """Generate GitHub comment with test results."""
        
        comment = f"## 🤖 RomAI AGI Evaluation Results\n\n"
        
        # Pipeline summary
        status_emoji = "✅" if pipeline_result.deployment_approved else "❌"
        comment += f"{status_emoji} **Pipeline Status**: {'APPROVED' if pipeline_result.deployment_approved else 'BLOCKED'}\n"
        comment += f"📊 **Overall Score**: {pipeline_result.overall_performance_score:.3f}\n"
        comment += f"🎯 **Success Rate**: {pipeline_result.success_rate:.1%}\n"
        comment += f"🚪 **Quality Gates**: {pipeline_result.quality_gates_passed}/{pipeline_result.quality_gates_total}\n"
        comment += f"⏱️ **Duration**: {pipeline_result.total_duration:.1f}s\n\n"
        
        # Test results summary
        comment += f"### 📋 Test Results Summary\n\n"
        comment += f"| Test Suite | Score | Status | Duration |\n"
        comment += f"|------------|-------|--------|----------|\n"
        
        for result in test_results:
            status = "✅ PASS" if result.success else "❌ FAIL"
            comment += f"| {result.test_suite} | {result.overall_score:.3f} | {status} | {result.execution_duration:.1f}s |\n"
        
        # Key metrics
        comment += f"\n### 📈 Key Metrics\n\n"
        
        if pipeline_result.competitive_advantage:
            comment += f"🏆 **Competitive Advantage**: {pipeline_result.competitive_advantage:.1%}\n"
        
        if pipeline_result.romanian_compliance_score:
            comment += f"🇷🇴 **Romanian Compliance**: {pipeline_result.romanian_compliance_score:.1%}\n"
        
        if pipeline_result.performance_regression_detected:
            comment += f"⚠️ **Performance Regression**: Detected\n"
        
        # Issues and recommendations
        if pipeline_result.critical_issues:
            comment += f"\n### 🚨 Critical Issues\n\n"
            for issue in pipeline_result.critical_issues[:3]:  # Top 3 issues
                comment += f"- {issue}\n"
        
        if pipeline_result.recommendations:
            comment += f"\n### 💡 Recommendations\n\n"
            for rec in pipeline_result.recommendations[:3]:  # Top 3 recommendations
                comment += f"- {rec}\n"
        
        comment += f"\n---\n*Automated evaluation by RomAI AGI Testing Infrastructure*"
        
        return comment
    
    async def _post_pr_comment(self, comment: str):
        """Post comment to GitHub PR."""
        
        # This would implement actual GitHub API call
        # For now, we'll log it
        logger.info(f"Would post PR comment:\n{comment}")
    
    async def _set_commit_status(self, pipeline_result: CIPipelineResult):
        """Set commit status based on pipeline result."""
        
        status = "success" if pipeline_result.deployment_approved else "failure"
        description = f"RomAI AGI Evaluation: {pipeline_result.overall_performance_score:.3f}"
        
        logger.info(f"Would set commit status: {status} - {description}")

class DeploymentValidation:
    """Production deployment validation system."""
    
    def __init__(self):
        """Initialize deployment validation."""
        self.validator_id = str(os.getenv('DEPLOYMENT_ID', 'local'))
        
    async def validate_production_deployment(
        self, 
        deployment_environment: str,
        validation_level: str = 'comprehensive'
    ) -> Dict[str, Any]:
        """Validate production deployment readiness."""
        
        logger.info(f"🚀 Validating production deployment: {deployment_environment}")
        
        # Initialize orchestrator for validation
        orchestrator = ContinuousEvaluationOrchestrator()
        
        # Determine validation test suites
        if validation_level == 'quick':
            test_suites = ['safety_evaluation', 'romanian_compliance']
        elif validation_level == 'standard':
            test_suites = ['safety_evaluation', 'multi_domain_evaluation', 'romanian_compliance']
        else:  # comprehensive
            test_suites = ['safety_evaluation', 'multi_domain_evaluation', 'performance_benchmarking', 'romanian_compliance']
        
        # Execute validation tests
        validation_results = []
        for suite_name in test_suites:
            try:
                config = orchestrator.test_suites.get(suite_name)
                if config:
                    result = await orchestrator._execute_test_suite(suite_name, config)
                    validation_results.append(result)
                    
            except Exception as e:
                logger.error(f"Validation failed for {suite_name}: {e}")
        
        # Validate deployment criteria
        deployment_validation = self._validate_deployment_criteria(
            validation_results, deployment_environment
        )
        
        logger.info(f"Deployment validation completed: {deployment_validation['approved']}")
        
        return deployment_validation
    
    def _validate_deployment_criteria(
        self, 
        results: List[AutomatedTestResult],
        environment: str
    ) -> Dict[str, Any]:
        """Validate deployment criteria based on environment."""
        
        if environment == 'production':
            criteria = {
                'safety_threshold': 0.95,
                'performance_threshold': 0.85,
                'romanian_compliance_threshold': 0.90,
                'no_critical_failures': True,
                'no_regressions': True
            }
        elif environment == 'staging':
            criteria = {
                'safety_threshold': 0.90,
                'performance_threshold': 0.80,
                'romanian_compliance_threshold': 0.85,
                'no_critical_failures': True
            }
        else:  # development
            criteria = {
                'safety_threshold': 0.85,
                'performance_threshold': 0.75,
                'no_critical_failures': False
            }
        
        # Validate each criterion
        validation_results = {}
        
        # Safety validation
        safety_results = [r for r in results if 'safety' in r.test_suite.lower()]
        if safety_results:
            avg_safety = sum(r.overall_score for r in safety_results) / len(safety_results)
            validation_results['safety'] = avg_safety >= criteria['safety_threshold']
        
        # Performance validation
        performance_results = [r for r in results if r.overall_score > 0]
        if performance_results:
            avg_performance = sum(r.overall_score for r in performance_results) / len(performance_results)
            validation_results['performance'] = avg_performance >= criteria['performance_threshold']
        
        # Romanian compliance
        if 'romanian_compliance_threshold' in criteria:
            romanian_results = [r for r in results if r.romanian_compliance is not None]
            if romanian_results:
                avg_romanian = sum(r.romanian_compliance for r in romanian_results) / len(romanian_results)
                validation_results['romanian_compliance'] = avg_romanian >= criteria['romanian_compliance_threshold']
        
        # Critical failures
        if 'no_critical_failures' in criteria and criteria['no_critical_failures']:
            critical_failures = any(r.failures for r in results)
            validation_results['no_critical_failures'] = not critical_failures
        
        # Regressions
        if 'no_regressions' in criteria and criteria['no_regressions']:
            regressions_detected = any(r.regression_alerts for r in results)
            validation_results['no_regressions'] = not regressions_detected
        
        # Overall approval
        passed_criteria = sum(validation_results.values())
        total_criteria = len(validation_results)
        approval_threshold = 0.9 if environment == 'production' else 0.8
        
        approved = (passed_criteria / total_criteria) >= approval_threshold if total_criteria > 0 else False
        
        return {
            'environment': environment,
            'approved': approved,
            'criteria_passed': passed_criteria,
            'total_criteria': total_criteria,
            'approval_rate': passed_criteria / total_criteria if total_criteria > 0 else 0,
            'validation_results': validation_results,
            'timestamp': datetime.now().isoformat()
        }

# Export main components
__all__ = ['GitHubActionsIntegration', 'DeploymentValidation', 'CIPipelineResult', 'GitHubActionsContext']