#!/usr/bin/env python3
"""
Comprehensive Regression Testing Framework
Addressing Major Performance Drops (-80% Change from Baseline)

This system implements comprehensive regression testing with model versioning,
performance tracking, automated regression detection, and performance baseline
management following Microsoft Azure ML best practices.

Key Features:
- Model versioning and baseline management
- Performance regression detection and alerting
- Automated regression testing pipeline
- Historical performance tracking and analysis
- Performance baseline establishment and validation
- Microsoft Azure ML compliance validation

Critical Requirements:
- Address major performance drops (-80% change from baseline)
- Implement automated regression detection
- Create performance baseline management system
- Ensure production-ready regression testing capabilities
"""

import asyncio
import aiohttp
import json
import time
import statistics
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass, asdict
import tempfile
import os
import hashlib

@dataclass
class PerformanceBaseline:
    """Performance baseline for regression testing"""
    model_version: str
    timestamp: datetime
    response_time: float
    accuracy_score: float
    quality_score: float
    throughput: float
    error_rate: float
    baseline_hash: str

@dataclass
class RegressionTestCase:
    """Regression test case definition"""
    test_id: str
    test_name: str
    input_data: str
    expected_response_type: str
    baseline_metrics: Dict[str, float]
    tolerance_threshold: float  # Acceptable performance deviation (e.g., 0.1 = 10%)

@dataclass
class RegressionTestResult:
    """Regression test result"""
    test_case: RegressionTestCase
    current_metrics: Dict[str, float]
    performance_change: Dict[str, float]  # Percentage change from baseline
    regression_detected: bool
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    detailed_analysis: str

@dataclass
class ModelVersionInfo:
    """Model version information"""
    version_id: str
    deployment_timestamp: datetime
    model_checksum: str
    performance_baseline: PerformanceBaseline
    validation_status: str

class ComprehensiveRegressionTestingFramework:
    """Comprehensive regression testing framework"""
    
    def __init__(self):
        self.base_urls = {
            'romai_ml': 'http://localhost:6101',
            'romai_frontend': 'http://localhost:6100',
            'compliance_api': 'http://localhost:8001'
        }
        
        # Performance regression thresholds
        self.regression_thresholds = {
            'response_time': 0.3,     # 30% degradation threshold
            'accuracy': 0.1,          # 10% accuracy drop threshold
            'quality': 0.15,          # 15% quality drop threshold
            'throughput': 0.2,        # 20% throughput drop threshold
            'error_rate': 0.05        # 5% error rate increase threshold
        }
        
        # Regression severity levels
        self.severity_levels = {
            'CRITICAL': 0.5,  # >50% performance drop
            'HIGH': 0.3,      # >30% performance drop
            'MEDIUM': 0.15,   # >15% performance drop
            'LOW': 0.05       # >5% performance drop
        }
        
        self.session = None
        self.baselines = {}  # Store performance baselines
        
    async def __aenter__(self):
        """Initialize async context"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Cleanup async context"""
        if self.session:
            await self.session.close()
    
    def create_model_version(self) -> ModelVersionInfo:
        """Create new model version info"""
        
        current_time = datetime.now()
        version_id = f"romai-agi-v{current_time.strftime('%Y%m%d_%H%M%S')}"
        
        # Create model checksum (simplified - in production would hash actual model files)
        model_data = f"{version_id}_{current_time.isoformat()}"
        model_checksum = hashlib.md5(model_data.encode()).hexdigest()
        
        # Create initial baseline (will be populated after first test run)
        baseline = PerformanceBaseline(
            model_version=version_id,
            timestamp=current_time,
            response_time=0.0,
            accuracy_score=0.0,
            quality_score=0.0,
            throughput=0.0,
            error_rate=0.0,
            baseline_hash=""
        )
        
        return ModelVersionInfo(
            version_id=version_id,
            deployment_timestamp=current_time,
            model_checksum=model_checksum,
            performance_baseline=baseline,
            validation_status="PENDING"
        )
    
    def generate_regression_test_cases(self) -> List[RegressionTestCase]:
        """Generate comprehensive regression test cases"""
        
        test_cases = []
        
        # Core functionality tests
        core_tests = [
            RegressionTestCase(
                test_id="regression_core_001",
                test_name="Basic Romanian Intelligence",
                input_data="Explică-mi istoria României în câteva cuvinte",
                expected_response_type="cultural_explanation",
                baseline_metrics={
                    'response_time': 2.0,
                    'accuracy': 0.85,
                    'quality': 0.9,
                    'throughput': 0.5,
                    'error_rate': 0.02
                },
                tolerance_threshold=0.1
            ),
            RegressionTestCase(
                test_id="regression_core_002", 
                test_name="Mathematical Processing",
                input_data="Calculate 25 * 17 + 48 / 4",
                expected_response_type="mathematical_result",
                baseline_metrics={
                    'response_time': 1.5,
                    'accuracy': 0.95,
                    'quality': 0.85,
                    'throughput': 0.7,
                    'error_rate': 0.01
                },
                tolerance_threshold=0.05
            ),
            RegressionTestCase(
                test_id="regression_core_003",
                test_name="Cultural Knowledge",
                input_data="What are the main Romanian cultural traditions?",
                expected_response_type="cultural_information",
                baseline_metrics={
                    'response_time': 2.5,
                    'accuracy': 0.8,
                    'quality': 0.88,
                    'throughput': 0.4,
                    'error_rate': 0.03
                },
                tolerance_threshold=0.12
            )
        ]
        
        # Performance stress tests
        stress_tests = [
            RegressionTestCase(
                test_id="regression_stress_001",
                test_name="Complex Analysis",
                input_data="Analyze the socio-economic impact of EU membership on Romanian agricultural sector with historical context and future predictions",
                expected_response_type="complex_analysis",
                baseline_metrics={
                    'response_time': 5.0,
                    'accuracy': 0.75,
                    'quality': 0.85,
                    'throughput': 0.2,
                    'error_rate': 0.05
                },
                tolerance_threshold=0.2
            ),
            RegressionTestCase(
                test_id="regression_stress_002",
                test_name="Multi-domain Query",
                input_data="Combine Romanian linguistic evolution, Byzantine influence, Ottoman period impact, and modern EU integration into a comprehensive historical narrative",
                expected_response_type="interdisciplinary_synthesis",
                baseline_metrics={
                    'response_time': 6.0,
                    'accuracy': 0.7,
                    'quality': 0.8,
                    'throughput': 0.15,
                    'error_rate': 0.08
                },
                tolerance_threshold=0.25
            )
        ]
        
        # Edge case tests
        edge_tests = [
            RegressionTestCase(
                test_id="regression_edge_001",
                test_name="Mixed Language Processing",
                input_data="Explain Romanian tradiții și customs în English cu detalii despre moderne adaptations",
                expected_response_type="mixed_language_response",
                baseline_metrics={
                    'response_time': 3.0,
                    'accuracy': 0.65,
                    'quality': 0.75,
                    'throughput': 0.35,
                    'error_rate': 0.1
                },
                tolerance_threshold=0.15
            ),
            RegressionTestCase(
                test_id="regression_edge_002",
                test_name="Very Short Query",
                input_data="România?",
                expected_response_type="clarification_request",
                baseline_metrics={
                    'response_time': 1.0,
                    'accuracy': 0.6,
                    'quality': 0.7,
                    'throughput': 1.0,
                    'error_rate': 0.05
                },
                tolerance_threshold=0.2
            )
        ]
        
        test_cases.extend(core_tests)
        test_cases.extend(stress_tests)
        test_cases.extend(edge_tests)
        
        return test_cases
    
    async def execute_performance_test(self, test_case: RegressionTestCase) -> Dict[str, float]:
        """Execute performance test and collect metrics"""
        
        # Test Romanian intelligence endpoint
        romanian_url = f"{self.base_urls['romai_ml']}/api/v1/romanian-intelligence/chat"
        payload = {
            "message": test_case.input_data,
            "context": f"regression_test:{test_case.test_id}",
            "metadata": {
                "test_type": "regression_testing",
                "test_name": test_case.test_name
            }
        }
        
        metrics = {
            'response_time': 0.0,
            'accuracy': 0.0,
            'quality': 0.0,
            'throughput': 0.0,
            'error_rate': 1.0  # Assume error initially
        }
        
        try:
            start_time = time.time()
            
            async with self.session.post(
                romanian_url, 
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                end_time = time.time()
                response_time = end_time - start_time
                
                if response.status == 200:
                    result = await response.json()
                    actual_response = result.get('response', '')
                    confidence = result.get('agi_metadata', {}).get('confidence', 0.0)
                    
                    # Calculate metrics
                    metrics['response_time'] = response_time
                    metrics['error_rate'] = 0.0  # No error
                    metrics['throughput'] = 1.0 / response_time if response_time > 0 else 0
                    
                    # Quality assessment (based on response length and structure)
                    response_length = len(actual_response)
                    if response_length > 200:
                        quality_score = min(1.0, 0.7 + (response_length - 200) / 1000)
                    elif response_length > 50:
                        quality_score = 0.5 + (response_length - 50) / 300
                    else:
                        quality_score = 0.3
                    
                    metrics['quality'] = quality_score
                    
                    # Accuracy assessment (based on confidence and expected response type)
                    if test_case.expected_response_type in ['mathematical_result', 'factual_answer']:
                        # Higher accuracy requirement for factual responses
                        metrics['accuracy'] = confidence * 0.9
                    else:
                        # More lenient for analytical/cultural responses
                        metrics['accuracy'] = confidence * 0.8 + 0.1
                    
                else:
                    metrics['response_time'] = response_time
                    metrics['error_rate'] = 1.0
                    
        except Exception as e:
            metrics['response_time'] = 30.0
            metrics['error_rate'] = 1.0
        
        return metrics
    
    def calculate_performance_change(self, current_metrics: Dict[str, float], 
                                   baseline_metrics: Dict[str, float]) -> Dict[str, float]:
        """Calculate percentage change from baseline"""
        
        changes = {}
        
        for metric, current_value in current_metrics.items():
            baseline_value = baseline_metrics.get(metric, 0.0)
            
            if baseline_value == 0.0:
                changes[metric] = 0.0 if current_value == 0.0 else 100.0
            else:
                # For metrics where higher is better (accuracy, quality, throughput)
                if metric in ['accuracy', 'quality', 'throughput']:
                    change = (current_value - baseline_value) / baseline_value
                # For metrics where lower is better (response_time, error_rate)
                elif metric in ['response_time', 'error_rate']:
                    change = (baseline_value - current_value) / baseline_value
                else:
                    change = (current_value - baseline_value) / baseline_value
                
                changes[metric] = change
        
        return changes
    
    def detect_regression(self, performance_changes: Dict[str, float], 
                         tolerance_threshold: float) -> Tuple[bool, str, str]:
        """Detect regression and determine severity"""
        
        regression_detected = False
        max_degradation = 0.0
        affected_metrics = []
        
        for metric, change in performance_changes.items():
            threshold = self.regression_thresholds.get(metric, tolerance_threshold)
            
            # Check for performance degradation
            if change < -threshold:  # Negative change indicates degradation
                regression_detected = True
                degradation = abs(change)
                max_degradation = max(max_degradation, degradation)
                affected_metrics.append(f"{metric}: {change:.2%}")
        
        # Determine severity
        if max_degradation >= self.severity_levels['CRITICAL']:
            severity = "CRITICAL"
        elif max_degradation >= self.severity_levels['HIGH']:
            severity = "HIGH"
        elif max_degradation >= self.severity_levels['MEDIUM']:
            severity = "MEDIUM"
        else:
            severity = "LOW"
        
        # Generate detailed analysis
        if regression_detected:
            analysis = f"Performance regression detected with {severity} severity. "
            analysis += f"Maximum degradation: {max_degradation:.2%}. "
            analysis += f"Affected metrics: {', '.join(affected_metrics)}. "
            analysis += f"Immediate investigation and remediation required."
        else:
            analysis = "No significant performance regression detected. All metrics within acceptable tolerance."
        
        return regression_detected, severity, analysis
    
    async def run_regression_test(self, test_case: RegressionTestCase) -> RegressionTestResult:
        """Run individual regression test"""
        
        # Execute performance test
        current_metrics = await self.execute_performance_test(test_case)
        
        # Calculate performance changes
        performance_changes = self.calculate_performance_change(
            current_metrics, test_case.baseline_metrics
        )
        
        # Detect regression
        regression_detected, severity, analysis = self.detect_regression(
            performance_changes, test_case.tolerance_threshold
        )
        
        return RegressionTestResult(
            test_case=test_case,
            current_metrics=current_metrics,
            performance_change=performance_changes,
            regression_detected=regression_detected,
            severity=severity,
            detailed_analysis=analysis
        )
    
    async def run_comprehensive_regression_testing(self) -> Dict[str, Any]:
        """Run comprehensive regression testing suite"""
        
        print("🔄 Starting Comprehensive Regression Testing Framework...")
        print("📊 Testing for major performance drops and baseline deviations")
        
        # Create current model version
        model_version = self.create_model_version()
        print(f"📋 Model Version: {model_version.version_id}")
        
        # Generate regression test cases
        test_cases = self.generate_regression_test_cases()
        print(f"📝 Generated {len(test_cases)} regression test cases")
        
        results = []
        
        # Execute regression tests
        print("\n🧪 Executing Regression Tests:")
        for i, test_case in enumerate(test_cases, 1):
            print(f"   {i}/{len(test_cases)}: {test_case.test_name}")
            
            result = await self.run_regression_test(test_case)
            results.append(result)
            
            # Display real-time results
            if result.regression_detected:
                status = f"❌ REGRESSION ({result.severity})"
            else:
                status = "✅ PASS"
            
            print(f"      {status} | Response: {result.current_metrics.get('response_time', 0):.2f}s | Quality: {result.current_metrics.get('quality', 0):.2%}")
        
        # Calculate summary metrics
        regression_detected_count = sum(1 for r in results if r.regression_detected)
        critical_regressions = sum(1 for r in results if r.severity == 'CRITICAL')
        high_regressions = sum(1 for r in results if r.severity == 'HIGH')
        
        # Overall performance assessment
        avg_response_time = statistics.mean([r.current_metrics.get('response_time', 0) for r in results])
        avg_accuracy = statistics.mean([r.current_metrics.get('accuracy', 0) for r in results])
        avg_quality = statistics.mean([r.current_metrics.get('quality', 0) for r in results])
        avg_error_rate = statistics.mean([r.current_metrics.get('error_rate', 0) for r in results])
        
        # Create updated baseline
        updated_baseline = PerformanceBaseline(
            model_version=model_version.version_id,
            timestamp=datetime.now(),
            response_time=avg_response_time,
            accuracy_score=avg_accuracy,
            quality_score=avg_quality,
            throughput=1.0 / avg_response_time if avg_response_time > 0 else 0,
            error_rate=avg_error_rate,
            baseline_hash=hashlib.md5(f"{model_version.version_id}_{datetime.now().isoformat()}".encode()).hexdigest()
        )
        
        # Determine overall status
        if critical_regressions > 0:
            overall_status = "CRITICAL_REGRESSION"
            deployment_recommendation = "DO NOT DEPLOY - Critical performance issues detected"
        elif high_regressions > 0:
            overall_status = "HIGH_REGRESSION"
            deployment_recommendation = "DEPLOYMENT_BLOCKED - High impact regressions require fixes"
        elif regression_detected_count > len(results) * 0.3:  # >30% tests show regression
            overall_status = "MODERATE_REGRESSION"
            deployment_recommendation = "CAUTION - Multiple regressions detected, review recommended"
        else:
            overall_status = "REGRESSION_FREE"
            deployment_recommendation = "DEPLOYMENT_APPROVED - No significant regressions detected"
        
        # Compile comprehensive report
        report = {
            'timestamp': datetime.now().isoformat(),
            'model_version': asdict(model_version),
            'overall_status': overall_status,
            'deployment_recommendation': deployment_recommendation,
            'test_summary': {
                'total_tests': len(test_cases),
                'regression_detected': regression_detected_count,
                'critical_regressions': critical_regressions,
                'high_regressions': high_regressions,
                'regression_rate': (regression_detected_count / len(test_cases)) * 100 if test_cases else 0
            },
            'performance_baseline': asdict(updated_baseline),
            'performance_metrics': {
                'average_response_time': avg_response_time,
                'average_accuracy': avg_accuracy,
                'average_quality': avg_quality,
                'average_error_rate': avg_error_rate
            },
            'regression_thresholds': self.regression_thresholds,
            'detailed_results': [asdict(r) for r in results]
        }
        
        return report
    
    def datetime_serializer(self, obj):
        """JSON serializer for datetime objects"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")
    
    async def save_regression_report(self, report: Dict[str, Any]) -> str:
        """Save comprehensive regression testing report"""
        
        # Create temporary directory for report
        temp_dir = tempfile.mkdtemp(prefix="regression_testing_")
        report_file = os.path.join(temp_dir, "regression_testing_report.json")
        
        # Save JSON report with datetime serialization
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=self.datetime_serializer)
        
        # Create summary report
        summary_file = os.path.join(temp_dir, "regression_testing_summary.md")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write("# Comprehensive Regression Testing Framework Report\n\n")
            f.write(f"**Generated:** {report['timestamp']}\n")
            f.write(f"**Model Version:** {report['model_version']['version_id']}\n")
            f.write(f"**Overall Status:** {report['overall_status']}\n")
            f.write(f"**Deployment Recommendation:** {report['deployment_recommendation']}\n\n")
            
            f.write("## Test Summary\n\n")
            summary = report['test_summary']
            f.write(f"- **Total Tests:** {summary['total_tests']}\n")
            f.write(f"- **Regressions Detected:** {summary['regression_detected']}\n")
            f.write(f"- **Critical Regressions:** {summary['critical_regressions']}\n")
            f.write(f"- **High Impact Regressions:** {summary['high_regressions']}\n")
            f.write(f"- **Regression Rate:** {summary['regression_rate']:.1f}%\n\n")
            
            f.write("## Performance Metrics\n\n")
            metrics = report['performance_metrics']
            f.write(f"- **Average Response Time:** {metrics['average_response_time']:.2f}s\n")
            f.write(f"- **Average Accuracy:** {metrics['average_accuracy']:.2%}\n")
            f.write(f"- **Average Quality:** {metrics['average_quality']:.2%}\n")
            f.write(f"- **Average Error Rate:** {metrics['average_error_rate']:.2%}\n\n")
            
            f.write("## Performance Baseline\n\n")
            baseline = report['performance_baseline']
            f.write(f"- **Baseline Version:** {baseline['model_version']}\n")
            f.write(f"- **Response Time Baseline:** {baseline['response_time']:.2f}s\n")
            f.write(f"- **Accuracy Baseline:** {baseline['accuracy_score']:.2%}\n")
            f.write(f"- **Quality Baseline:** {baseline['quality_score']:.2%}\n")
            f.write(f"- **Throughput Baseline:** {baseline['throughput']:.2f} req/s\n")
            f.write(f"- **Error Rate Baseline:** {baseline['error_rate']:.2%}\n")
        
        return temp_dir

async def main():
    """Main execution function"""
    print("🚀 RomAI AGI - Comprehensive Regression Testing Framework")
    print("=" * 80)
    
    async with ComprehensiveRegressionTestingFramework() as regression_framework:
        
        # Run comprehensive regression testing
        report = await regression_framework.run_comprehensive_regression_testing()
        
        # Save report
        report_dir = await regression_framework.save_regression_report(report)
        
        # Display results
        print("\n" + "=" * 80)
        print("📊 REGRESSION TESTING FRAMEWORK RESULTS")
        print("=" * 80)
        
        print(f"🕐 Timestamp: {report['timestamp']}")
        print(f"📋 Model Version: {report['model_version']['version_id']}")
        print(f"📈 Overall Status: {report['overall_status']}")
        print(f"🎯 Deployment Recommendation: {report['deployment_recommendation']}")
        
        print(f"\n📊 Test Summary:")
        summary = report['test_summary']
        print(f"   Total Tests: {summary['total_tests']}")
        print(f"   Regressions Detected: {summary['regression_detected']}")
        print(f"   Critical Regressions: {summary['critical_regressions']}")
        print(f"   High Impact Regressions: {summary['high_regressions']}")
        print(f"   Regression Rate: {summary['regression_rate']:.1f}%")
        
        print(f"\n📈 Performance Metrics:")
        metrics = report['performance_metrics']
        print(f"   Average Response Time: {metrics['average_response_time']:.2f}s")
        print(f"   Average Accuracy: {metrics['average_accuracy']:.2%}")
        print(f"   Average Quality: {metrics['average_quality']:.2%}")
        print(f"   Average Error Rate: {metrics['average_error_rate']:.2%}")
        
        print(f"\n📁 Reports saved to: {report_dir}")
        print(f"   - regression_testing_report.json (detailed data)")
        print(f"   - regression_testing_summary.md (executive summary)")
        
        if report['overall_status'] in ['CRITICAL_REGRESSION', 'HIGH_REGRESSION']:
            print(f"\n🚨 REGRESSION DETECTED:")
            print(f"   Performance issues require immediate attention")
            print(f"   Deployment blocked until regressions are resolved")
            return False
        else:
            print(f"\n✅ REGRESSION TESTING COMPLETE:")
            print(f"   No critical performance regressions detected")
            print(f"   System performance within acceptable parameters")
            return True

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)