#!/usr/bin/env python3
"""
RomAI AGI CI/CD Pipeline Testing Script
Phase 3E: CI/CD Pipeline Implementation

Comprehensive testing script for validating CI/CD pipeline functionality,
Docker builds, and deployment readiness for RomAI AGI system.
"""

import asyncio
import json
import logging
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'/tmp/romai-cicd-test-{datetime.now().strftime("%Y%m%d-%H%M%S")}.log')
    ]
)

logger = logging.getLogger(__name__)

@dataclass
class TestResult:
    """Test result data structure"""
    name: str
    success: bool
    duration: float
    message: str
    details: Optional[Dict] = None

@dataclass
class CICDTestReport:
    """CI/CD test execution report"""
    total_tests: int
    passed_tests: int
    failed_tests: int
    test_results: List[TestResult]
    execution_time: float
    success_rate: float
    
    @property
    def overall_success(self) -> bool:
        return self.failed_tests == 0

class CICDPipelineTester:
    """Comprehensive CI/CD pipeline testing engine"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.test_results: List[TestResult] = []
        self.start_time = time.time()
        
    async def run_all_tests(self) -> CICDTestReport:
        """Execute all CI/CD pipeline tests"""
        logger.info("🧪 Starting CI/CD Pipeline Testing Suite")
        logger.info("=" * 60)
        
        # Test categories
        test_categories = [
            ("Docker Configuration Tests", self._test_docker_configuration),
            ("GitHub Actions Workflow Tests", self._test_github_actions),
            ("Production Environment Tests", self._test_production_environment),
            ("Security Configuration Tests", self._test_security_configuration),
            ("Build Process Tests", self._test_build_process),
            ("Deployment Script Tests", self._test_deployment_scripts),
            ("Monitoring Integration Tests", self._test_monitoring_integration),
            ("Backup System Tests", self._test_backup_system)
        ]
        
        for category_name, test_function in test_categories:
            logger.info(f"📋 Running {category_name}...")
            try:
                await test_function()
                logger.info(f"✅ {category_name} completed")
            except Exception as e:
                logger.error(f"❌ {category_name} failed: {str(e)}")
                self.test_results.append(TestResult(
                    name=category_name,
                    success=False,
                    duration=0.0,
                    message=f"Category failed: {str(e)}"
                ))
        
        return self._generate_report()
    
    async def _test_docker_configuration(self):
        """Test Docker configuration files"""
        
        # Test 1: Dockerfile exists and is valid
        test_start = time.time()
        dockerfile_path = self.project_root / "Dockerfile.romai-production"
        
        if dockerfile_path.exists():
            try:
                # Basic Docker syntax validation
                with open(dockerfile_path, 'r') as f:
                    dockerfile_content = f.read()
                
                required_instructions = ['FROM', 'WORKDIR', 'COPY', 'RUN', 'EXPOSE', 'CMD']
                missing_instructions = [instr for instr in required_instructions 
                                      if instr not in dockerfile_content]
                
                if not missing_instructions:
                    self.test_results.append(TestResult(
                        name="Dockerfile Production Configuration",
                        success=True,
                        duration=time.time() - test_start,
                        message="Dockerfile contains all required instructions"
                    ))
                else:
                    self.test_results.append(TestResult(
                        name="Dockerfile Production Configuration",
                        success=False,
                        duration=time.time() - test_start,
                        message=f"Missing instructions: {missing_instructions}"
                    ))
            except Exception as e:
                self.test_results.append(TestResult(
                    name="Dockerfile Production Configuration",
                    success=False,
                    duration=time.time() - test_start,
                    message=f"Error reading Dockerfile: {str(e)}"
                ))
        else:
            self.test_results.append(TestResult(
                name="Dockerfile Production Configuration",
                success=False,
                duration=time.time() - test_start,
                message="Dockerfile.romai-production not found"
            ))
        
        # Test 2: Docker Compose production configuration
        test_start = time.time()
        compose_path = self.project_root / "docker-compose.production.yml"
        
        if compose_path.exists():
            try:
                # Validate Docker Compose syntax
                result = subprocess.run([
                    'docker-compose', '-f', str(compose_path), 'config'
                ], capture_output=True, text=True, check=True)
                
                self.test_results.append(TestResult(
                    name="Docker Compose Production Configuration",
                    success=True,
                    duration=time.time() - test_start,
                    message="Docker Compose configuration is valid"
                ))
            except subprocess.CalledProcessError as e:
                self.test_results.append(TestResult(
                    name="Docker Compose Production Configuration",
                    success=False,
                    duration=time.time() - test_start,
                    message=f"Docker Compose validation failed: {e.stderr}"
                ))
        else:
            self.test_results.append(TestResult(
                name="Docker Compose Production Configuration",
                success=False,
                duration=time.time() - test_start,
                message="docker-compose.production.yml not found"
            ))
    
    async def _test_github_actions(self):
        """Test GitHub Actions workflow configuration"""
        
        test_start = time.time()
        workflow_path = self.project_root / ".github" / "workflows" / "romai-cicd.yml"
        
        if workflow_path.exists():
            try:
                with open(workflow_path, 'r') as f:
                    workflow_content = f.read()
                
                # Check for essential workflow components
                essential_components = [
                    'on:', 'jobs:', 'runs-on:', 'steps:',
                    'uses: actions/checkout',
                    'uses: actions/setup-python',
                    'run:', 'docker build'
                ]
                
                missing_components = [comp for comp in essential_components 
                                    if comp not in workflow_content]
                
                if not missing_components:
                    self.test_results.append(TestResult(
                        name="GitHub Actions Workflow Configuration",
                        success=True,
                        duration=time.time() - test_start,
                        message="GitHub Actions workflow contains all essential components"
                    ))
                else:
                    self.test_results.append(TestResult(
                        name="GitHub Actions Workflow Configuration",
                        success=False,
                        duration=time.time() - test_start,
                        message=f"Missing components: {missing_components}"
                    ))
            except Exception as e:
                self.test_results.append(TestResult(
                    name="GitHub Actions Workflow Configuration",
                    success=False,
                    duration=time.time() - test_start,
                    message=f"Error reading workflow file: {str(e)}"
                ))
        else:
            self.test_results.append(TestResult(
                name="GitHub Actions Workflow Configuration",
                success=False,
                duration=time.time() - test_start,
                message="GitHub Actions workflow file not found"
            ))
    
    async def _test_production_environment(self):
        """Test production environment configuration"""
        
        test_start = time.time()
        env_template_path = self.project_root / ".env.romai.production.template"
        
        if env_template_path.exists():
            try:
                with open(env_template_path, 'r') as f:
                    env_content = f.read()
                
                # Check for critical environment variables
                critical_vars = [
                    'NODE_ENV', 'ROMAI_ENV', 'DATABASE_URL',
                    'JWT_SECRET_KEY', 'AZURE_OPENAI_ENDPOINT',
                    'POSTGRES_PASSWORD', 'REDIS_PASSWORD'
                ]
                
                missing_vars = [var for var in critical_vars 
                              if var not in env_content]
                
                if not missing_vars:
                    self.test_results.append(TestResult(
                        name="Production Environment Template",
                        success=True,
                        duration=time.time() - test_start,
                        message="Production environment template contains all critical variables"
                    ))
                else:
                    self.test_results.append(TestResult(
                        name="Production Environment Template",
                        success=False,
                        duration=time.time() - test_start,
                        message=f"Missing critical variables: {missing_vars}"
                    ))
            except Exception as e:
                self.test_results.append(TestResult(
                    name="Production Environment Template",
                    success=False,
                    duration=time.time() - test_start,
                    message=f"Error reading environment template: {str(e)}"
                ))
        else:
            self.test_results.append(TestResult(
                name="Production Environment Template",
                success=False,
                duration=time.time() - test_start,
                message="Production environment template not found"
            ))
    
    async def _test_security_configuration(self):
        """Test security configuration"""
        
        # Test 1: Security headers configuration
        test_start = time.time()
        
        # Check if Nginx configuration exists (proxy method)
        nginx_configs = list(self.project_root.glob("nginx/*.conf"))
        
        if nginx_configs:
            security_headers_found = False
            for config_file in nginx_configs:
                try:
                    with open(config_file, 'r') as f:
                        content = f.read()
                    
                    security_headers = [
                        'X-Frame-Options', 'X-Content-Type-Options',
                        'X-XSS-Protection', 'Strict-Transport-Security'
                    ]
                    
                    if any(header in content for header in security_headers):
                        security_headers_found = True
                        break
                except Exception:
                    continue
            
            self.test_results.append(TestResult(
                name="Security Headers Configuration",
                success=security_headers_found,
                duration=time.time() - test_start,
                message="Security headers configured" if security_headers_found 
                       else "Security headers not found in Nginx config"
            ))
        else:
            self.test_results.append(TestResult(
                name="Security Headers Configuration",
                success=False,
                duration=time.time() - test_start,
                message="Nginx configuration files not found"
            ))
        
        # Test 2: SSL/TLS configuration
        test_start = time.time()
        env_template_path = self.project_root / ".env.romai.production.template"
        
        ssl_configured = False
        if env_template_path.exists():
            try:
                with open(env_template_path, 'r') as f:
                    content = f.read()
                
                ssl_vars = ['SSL_ENABLED', 'HTTPS_REDIRECT', 'HSTS_MAX_AGE']
                ssl_configured = any(var in content for var in ssl_vars)
            except Exception:
                pass
        
        self.test_results.append(TestResult(
            name="SSL/TLS Configuration",
            success=ssl_configured,
            duration=time.time() - test_start,
            message="SSL/TLS configuration found" if ssl_configured 
                   else "SSL/TLS configuration not found"
        ))
    
    async def _test_build_process(self):
        """Test build process configuration"""
        
        # Test 1: Python requirements
        test_start = time.time()
        requirements_path = self.project_root / "apps" / "romai" / "requirements.txt"
        
        if requirements_path.exists():
            try:
                with open(requirements_path, 'r') as f:
                    requirements = f.read()
                
                essential_packages = [
                    'fastapi', 'uvicorn', 'pydantic', 'asyncio',
                    'torch', 'transformers', 'numpy'
                ]
                
                missing_packages = [pkg for pkg in essential_packages 
                                  if pkg not in requirements.lower()]
                
                if not missing_packages:
                    self.test_results.append(TestResult(
                        name="Python Requirements Configuration",
                        success=True,
                        duration=time.time() - test_start,
                        message="All essential packages found in requirements"
                    ))
                else:
                    self.test_results.append(TestResult(
                        name="Python Requirements Configuration",
                        success=False,
                        duration=time.time() - test_start,
                        message=f"Missing essential packages: {missing_packages}"
                    ))
            except Exception as e:
                self.test_results.append(TestResult(
                    name="Python Requirements Configuration",
                    success=False,
                    duration=time.time() - test_start,
                    message=f"Error reading requirements: {str(e)}"
                ))
        else:
            self.test_results.append(TestResult(
                name="Python Requirements Configuration",
                success=False,
                duration=time.time() - test_start,
                message="requirements.txt not found"
            ))
    
    async def _test_deployment_scripts(self):
        """Test deployment scripts"""
        
        test_start = time.time()
        deployment_script_path = self.project_root / "scripts" / "deploy-romai-production.sh"
        
        if deployment_script_path.exists():
            try:
                with open(deployment_script_path, 'r') as f:
                    script_content = f.read()
                
                essential_functions = [
                    'check_prerequisites', 'pre_deployment_validation',
                    'backup_current_deployment', 'deploy_services',
                    'run_health_checks', 'rollback_deployment'
                ]
                
                missing_functions = [func for func in essential_functions 
                                   if func not in script_content]
                
                if not missing_functions:
                    self.test_results.append(TestResult(
                        name="Deployment Script Configuration",
                        success=True,
                        duration=time.time() - test_start,
                        message="Deployment script contains all essential functions"
                    ))
                else:
                    self.test_results.append(TestResult(
                        name="Deployment Script Configuration",
                        success=False,
                        duration=time.time() - test_start,
                        message=f"Missing functions: {missing_functions}"
                    ))
            except Exception as e:
                self.test_results.append(TestResult(
                    name="Deployment Script Configuration",
                    success=False,
                    duration=time.time() - test_start,
                    message=f"Error reading deployment script: {str(e)}"
                ))
        else:
            self.test_results.append(TestResult(
                name="Deployment Script Configuration",
                success=False,
                duration=time.time() - test_start,
                message="Deployment script not found"
            ))
    
    async def _test_monitoring_integration(self):
        """Test monitoring integration"""
        
        test_start = time.time()
        compose_path = self.project_root / "docker-compose.production.yml"
        
        monitoring_services_found = False
        if compose_path.exists():
            try:
                with open(compose_path, 'r') as f:
                    compose_content = f.read()
                
                monitoring_services = ['prometheus', 'grafana', 'elasticsearch', 'kibana']
                found_services = [service for service in monitoring_services 
                                if service in compose_content.lower()]
                
                monitoring_services_found = len(found_services) >= 2
                
                self.test_results.append(TestResult(
                    name="Monitoring Services Integration",
                    success=monitoring_services_found,
                    duration=time.time() - test_start,
                    message=f"Found monitoring services: {found_services}" if found_services
                           else "No monitoring services found"
                ))
            except Exception as e:
                self.test_results.append(TestResult(
                    name="Monitoring Services Integration",
                    success=False,
                    duration=time.time() - test_start,
                    message=f"Error checking monitoring services: {str(e)}"
                ))
        else:
            self.test_results.append(TestResult(
                name="Monitoring Services Integration",
                success=False,
                duration=time.time() - test_start,
                message="Docker Compose file not found"
            ))
    
    async def _test_backup_system(self):
        """Test backup system configuration"""
        
        test_start = time.time()
        deployment_script_path = self.project_root / "scripts" / "deploy-romai-production.sh"
        
        backup_configured = False
        if deployment_script_path.exists():
            try:
                with open(deployment_script_path, 'r') as f:
                    script_content = f.read()
                
                backup_functions = ['backup_current_deployment', 'pg_dump', 'backup_dir']
                backup_configured = any(func in script_content for func in backup_functions)
                
            except Exception:
                pass
        
        self.test_results.append(TestResult(
            name="Backup System Configuration",
            success=backup_configured,
            duration=time.time() - test_start,
            message="Backup system configured" if backup_configured 
                   else "Backup system not configured"
        ))
    
    def _generate_report(self) -> CICDTestReport:
        """Generate comprehensive test report"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result.success)
        failed_tests = total_tests - passed_tests
        execution_time = time.time() - self.start_time
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        return CICDTestReport(
            total_tests=total_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            test_results=self.test_results,
            execution_time=execution_time,
            success_rate=success_rate
        )

def print_detailed_report(report: CICDTestReport):
    """Print detailed test execution report"""
    print("\n" + "=" * 80)
    print("🧪 RomAI AGI CI/CD Pipeline Test Report")
    print("=" * 80)
    
    print(f"📊 Overall Results:")
    print(f"   Total Tests: {report.total_tests}")
    print(f"   Passed: {report.passed_tests}")
    print(f"   Failed: {report.failed_tests}")
    print(f"   Success Rate: {report.success_rate:.1f}%")
    print(f"   Execution Time: {report.execution_time:.2f}s")
    
    print(f"\n🎯 Overall Status: {'✅ PASS' if report.overall_success else '❌ FAIL'}")
    
    print(f"\n📋 Detailed Test Results:")
    print("-" * 80)
    
    for result in report.test_results:
        status = "✅ PASS" if result.success else "❌ FAIL"
        print(f"{status} | {result.name}")
        print(f"     Duration: {result.duration:.3f}s")
        print(f"     Message: {result.message}")
        if result.details:
            print(f"     Details: {result.details}")
        print()
    
    print("=" * 80)

async def main():
    """Main execution function"""
    print("🚀 RomAI AGI CI/CD Pipeline Testing Suite")
    print("🧪 Phase 3E: CI/CD Pipeline Implementation")
    print("=" * 60)
    
    tester = CICDPipelineTester()
    
    try:
        report = await tester.run_all_tests()
        print_detailed_report(report)
        
        # Success criteria validation
        success_criteria = {
            "minimum_success_rate": 90.0,
            "maximum_failed_tests": 2,
            "required_passed_tests": report.total_tests - 2
        }
        
        print("\n🎯 Success Criteria Validation:")
        criteria_met = []
        
        # Check success rate
        success_rate_met = report.success_rate >= success_criteria["minimum_success_rate"]
        criteria_met.append(success_rate_met)
        print(f"   Success Rate ≥ {success_criteria['minimum_success_rate']}%: "
              f"{'✅' if success_rate_met else '❌'} ({report.success_rate:.1f}%)")
        
        # Check failed tests
        failed_tests_met = report.failed_tests <= success_criteria["maximum_failed_tests"]
        criteria_met.append(failed_tests_met)
        print(f"   Failed Tests ≤ {success_criteria['maximum_failed_tests']}: "
              f"{'✅' if failed_tests_met else '❌'} ({report.failed_tests})")
        
        # Check passed tests
        passed_tests_met = report.passed_tests >= success_criteria["required_passed_tests"]
        criteria_met.append(passed_tests_met)
        print(f"   Passed Tests ≥ {success_criteria['required_passed_tests']}: "
              f"{'✅' if passed_tests_met else '❌'} ({report.passed_tests})")
        
        all_criteria_met = all(criteria_met)
        print(f"\n🏆 Final Result: {'✅ SUCCESS - CI/CD Pipeline Ready for Production!' if all_criteria_met else '❌ FAILURE - CI/CD Pipeline Needs Improvements'}")
        
        # Exit with appropriate code
        sys.exit(0 if all_criteria_met else 1)
        
    except Exception as e:
        logger.error(f"❌ CI/CD testing failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())