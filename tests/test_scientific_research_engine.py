#!/usr/bin/env python3
"""
RomAI Scientific Research Engine Comprehensive Test Suite

Advanced test validation framework for the Scientific Research Reasoning Engine,
testing research methodology evaluation, experimental design assessment, and
statistical analysis across multiple scientific disciplines.

This test suite validates the proven domain transfer pattern used successfully
in Mathematical, Medical, Legal, Financial, and Engineering engines.

Test Coverage:
- Experimental Design Evaluation
- Statistical Analysis Validation
- Research Methodology Assessment  
- Multi-Disciplinary Science Research
- Publication Readiness Evaluation
- Meta-Analysis Capabilities
"""

import asyncio
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime

# Add project root to path for imports
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root / "apps" / "romai" / "src"))

from ml.reasoning.autonomous_research_engine import AutonomousScientificResearchEngine, ResearchResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScientificResearchEngineValidator:
    """
    Comprehensive validation framework for Scientific Research Reasoning Engine.
    
    Tests research methodology evaluation, experimental design assessment,
    and statistical analysis capabilities across all scientific disciplines.
    """
    
    def __init__(self):
        """Initialize the validator with test data and metrics."""
        self.engine = AutonomousScientificResearchEngine()
        self.test_data = self._load_training_data()
        self.test_results = []
        self.performance_metrics = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "average_confidence": 0.0,
            "discipline_performance": {},
            "methodology_scores": [],
            "design_quality_scores": []
        }
        
        logger.info("✅ Scientific Research Engine Validator initialized")
        logger.info(f"📊 Loaded {len(self.test_data)} test cases")
    
    def _load_training_data(self) -> List[Dict[str, Any]]:
        """Load scientific research training data."""
        try:
            data_path = project_root / "apps" / "romai" / "training_data" / "scientific_research_training_data.json"
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data["scientific_research_training_data"]
        except Exception as e:
            logger.error(f"❌ Failed to load training data: {e}")
            return []
    
    async def run_comprehensive_tests(self) -> Dict[str, Any]:
        """
        Execute comprehensive test suite for Scientific Research Engine.
        
        Returns detailed test results and performance analytics.
        """
        logger.info("🧪 Starting Scientific Research Engine Comprehensive Test Suite")
        logger.info("=" * 80)
        start_time = datetime.now()
        
        # Run all test cases
        for i, test_case in enumerate(self.test_data):
            logger.info(f"\n🔬 Test {i+1}/{len(self.test_data)}: {test_case['discipline'].title()} Research")
            result = await self._run_single_test(test_case)
            self.test_results.append(result)
            self.performance_metrics["total_tests"] += 1
            
            if result["passed"]:
                self.performance_metrics["passed_tests"] += 1
                logger.info(f"✅ Test {i+1} PASSED - Confidence: {result['confidence']:.1%}")
            else:
                self.performance_metrics["failed_tests"] += 1
                logger.info(f"❌ Test {i+1} FAILED - Issues: {', '.join(result['issues'])}")
        
        # Calculate performance metrics
        self._calculate_performance_metrics()
        
        # Generate comprehensive report
        test_duration = (datetime.now() - start_time).total_seconds()
        report = self._generate_test_report(test_duration)
        
        logger.info("\n" + "=" * 80)
        logger.info("🏆 SCIENTIFIC RESEARCH ENGINE TEST RESULTS")
        logger.info("=" * 80)
        logger.info(f"✅ Tests Passed: {self.performance_metrics['passed_tests']}/{self.performance_metrics['total_tests']}")
        logger.info(f"📊 Success Rate: {self.performance_metrics['passed_tests']/self.performance_metrics['total_tests']:.1%}")
        logger.info(f"🎯 Average Confidence: {self.performance_metrics['average_confidence']:.1%}")
        logger.info(f"⏱️ Total Test Duration: {test_duration:.2f} seconds")
        
        return report
    
    async def _run_single_test(self, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """Run a single scientific research test case."""
        try:
            # Execute research analysis
            result = await self.engine.analyze_research_problem(
                test_case["research_question"],
                test_case["data"]
            )
            
            # Validate result
            validation_result = self._validate_research_result(result, test_case)
            
            return {
                "test_case": test_case["research_question"][:100] + "...",
                "discipline": test_case["discipline"],
                "study_type": test_case["study_type"],
                "result": result,
                "confidence": result.confidence_score,
                "passed": validation_result["passed"],
                "issues": validation_result["issues"],
                "performance_score": validation_result["score"]
            }
            
        except Exception as e:
            logger.error(f"❌ Test execution failed: {e}")
            return {
                "test_case": test_case["research_question"][:100] + "...",
                "discipline": test_case["discipline"],
                "study_type": test_case["study_type"],
                "result": None,
                "confidence": 0.0,
                "passed": False,
                "issues": [f"Execution error: {str(e)}"],
                "performance_score": 0.0
            }
    
    def _validate_research_result(self, result: ResearchResult, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """Validate scientific research analysis result against expected outcomes."""
        issues = []
        score = 0.0
        
        expected = test_case.get("expected_outcome", {})
        
        # Validate basic result structure
        if not result.research_conclusion:
            issues.append("Missing research conclusion")
        else:
            score += 15
        
        if not result.research_reasoning:
            issues.append("Missing research reasoning")
        else:
            score += 10
        
        # Validate confidence score
        if result.confidence_score < 0.5:
            issues.append(f"Low confidence score: {result.confidence_score:.1%}")
        elif result.confidence_score >= 0.8:
            score += 15
        else:
            score += 10
        
        # Validate discipline identification
        if result.research_discipline != test_case["discipline"]:
            issues.append(f"Incorrect discipline: {result.research_discipline} vs {test_case['discipline']}")
        else:
            score += 15
        
        # Validate study type identification
        if result.study_type != test_case["study_type"]:
            issues.append(f"Incorrect study type: {result.study_type} vs {test_case['study_type']}")
        else:
            score += 10
        
        # Validate experimental design
        if not result.experimental_design:
            issues.append("Missing experimental design assessment")
        else:
            score += 10
        
        # Validate statistical results
        if not result.statistical_results:
            issues.append("Missing statistical analysis")
        else:
            score += 10
        
        # Validate methodology assessment
        if not result.methodology_assessment:
            issues.append("Missing methodology assessment")
        else:
            score += 10
        
        # Validate publication readiness
        if not result.publication_readiness:
            issues.append("Missing publication readiness evaluation")
        else:
            score += 5
        
        # Check for key expected metrics
        if "statistical_power" in expected:
            expected_power = expected["statistical_power"]
            if "statistical_power" in result.statistical_results:
                actual_power = result.statistical_results["statistical_power"]
                if abs(actual_power - expected_power) > 0.1:
                    issues.append(f"Statistical power mismatch: {actual_power:.2f} vs expected {expected_power:.2f}")
                else:
                    score += 5
        
        passed = len(issues) == 0 and score >= 80
        
        return {
            "passed": passed,
            "issues": issues,
            "score": score,
            "max_score": 100
        }
    
    def _calculate_performance_metrics(self) -> None:
        """Calculate comprehensive performance metrics."""
        if not self.test_results:
            return
        
        # Calculate average confidence
        total_confidence = sum(r["confidence"] for r in self.test_results)
        self.performance_metrics["average_confidence"] = total_confidence / len(self.test_results)
        
        # Calculate discipline-specific performance
        discipline_stats = {}
        for result in self.test_results:
            discipline = result["discipline"]
            if discipline not in discipline_stats:
                discipline_stats[discipline] = {"total": 0, "passed": 0, "avg_confidence": 0}
            
            discipline_stats[discipline]["total"] += 1
            if result["passed"]:
                discipline_stats[discipline]["passed"] += 1
        
        # Calculate discipline success rates
        for discipline, stats in discipline_stats.items():
            stats["success_rate"] = stats["passed"] / stats["total"] if stats["total"] > 0 else 0
            # Calculate average confidence for discipline
            discipline_results = [r for r in self.test_results if r["discipline"] == discipline]
            if discipline_results:
                stats["avg_confidence"] = sum(r["confidence"] for r in discipline_results) / len(discipline_results)
        
        self.performance_metrics["discipline_performance"] = discipline_stats
        
        # Collect methodology and design quality scores
        for result in self.test_results:
            if result["result"] and result["result"].methodology_assessment:
                methodology_score = self._extract_methodology_score(result["result"].methodology_assessment)
                if methodology_score > 0:
                    self.performance_metrics["methodology_scores"].append(methodology_score)
            
            if result["result"] and result["result"].experimental_design:
                design_score = self._extract_design_score(result["result"].experimental_design)
                if design_score > 0:
                    self.performance_metrics["design_quality_scores"].append(design_score)
    
    def _extract_methodology_score(self, methodology_assessment: Dict[str, Any]) -> float:
        """Extract methodology quality score from assessment."""
        score_keys = ["validity_score", "method_score", "design_rigor", "overall_quality"]
        for key in score_keys:
            if key in methodology_assessment:
                return methodology_assessment[key]
        return 0.0
    
    def _extract_design_score(self, experimental_design: Dict[str, Any]) -> float:
        """Extract experimental design quality score."""
        score_keys = ["design_score", "quality_score", "rigor_score", "design_quality", "overall_score"]
        for key in score_keys:
            if key in experimental_design:
                return experimental_design[key]
        return 0.0
    
    def _generate_test_report(self, test_duration: float) -> Dict[str, Any]:
        """Generate comprehensive test report."""
        success_rate = self.performance_metrics["passed_tests"] / self.performance_metrics["total_tests"]
        
        # Determine overall status
        if success_rate >= 0.95:
            status = "EXCEPTIONAL"
            status_emoji = "🏆"
        elif success_rate >= 0.90:
            status = "EXCELLENT"
            status_emoji = "✨"
        elif success_rate >= 0.80:
            status = "GOOD"
            status_emoji = "✅"
        elif success_rate >= 0.70:
            status = "ACCEPTABLE"
            status_emoji = "⚠️"
        else:
            status = "NEEDS_IMPROVEMENT"
            status_emoji = "❌"
        
        report = {
            "summary": {
                "status": status,
                "status_emoji": status_emoji,
                "total_tests": self.performance_metrics["total_tests"],
                "passed_tests": self.performance_metrics["passed_tests"],
                "failed_tests": self.performance_metrics["failed_tests"],
                "success_rate": success_rate,
                "average_confidence": self.performance_metrics["average_confidence"],
                "test_duration_seconds": test_duration
            },
            "discipline_performance": self.performance_metrics["discipline_performance"],
            "quality_metrics": {
                "avg_methodology_score": sum(self.performance_metrics["methodology_scores"]) / len(self.performance_metrics["methodology_scores"]) if self.performance_metrics["methodology_scores"] else 0,
                "avg_design_quality_score": sum(self.performance_metrics["design_quality_scores"]) / len(self.performance_metrics["design_quality_scores"]) if self.performance_metrics["design_quality_scores"] else 0
            },
            "detailed_results": self.test_results,
            "recommendations": self._generate_improvement_recommendations(success_rate)
        }
        
        return report
    
    def _generate_improvement_recommendations(self, success_rate: float) -> List[str]:
        """Generate recommendations for improvement based on test results."""
        recommendations = []
        
        if success_rate < 0.8:
            recommendations.append("Improve experimental design evaluation accuracy")
            recommendations.append("Enhance statistical analysis validation")
            recommendations.append("Strengthen methodology assessment framework")
        
        if success_rate < 0.9:
            recommendations.append("Refine discipline-specific research standards")
            recommendations.append("Improve publication readiness evaluation")
        
        # Discipline-specific recommendations
        for discipline, stats in self.performance_metrics["discipline_performance"].items():
            if stats["success_rate"] < 0.8:
                recommendations.append(f"Improve {discipline} research methodology evaluation")
        
        if self.performance_metrics["average_confidence"] < 0.8:
            recommendations.append("Increase confidence calibration accuracy")
        
        if not recommendations:
            recommendations.append("Maintain excellent performance standards")
            recommendations.append("Continue validation testing")
        
        return recommendations
    
    def save_test_report(self, report: Dict[str, Any], filename: str = None) -> str:
        """Save test report to JSON file."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            filename = f"scientific_research_engine_test_report_{timestamp}.json"
        
        report_path = project_root / filename
        
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False, default=str)
            
            logger.info(f"📊 Test report saved: {report_path}")
            return str(report_path)
            
        except Exception as e:
            logger.error(f"❌ Failed to save test report: {e}")
            return ""


async def main():
    """Main test execution function."""
    print("🧪 RomAI Scientific Research Engine - Comprehensive Test Suite")
    print("=" * 80)
    
    # Initialize validator
    validator = ScientificResearchEngineValidator()
    
    # Run comprehensive tests
    report = await validator.run_comprehensive_tests()
    
    # Save test report
    report_path = validator.save_test_report(report)
    
    # Display final results
    print("\n" + "=" * 80)
    print("🏆 FINAL TEST RESULTS")
    print("=" * 80)
    print(f"{report['summary']['status_emoji']} Status: {report['summary']['status']}")
    print(f"✅ Success Rate: {report['summary']['success_rate']:.1%}")
    print(f"📊 Tests Passed: {report['summary']['passed_tests']}/{report['summary']['total_tests']}")
    print(f"🎯 Average Confidence: {report['summary']['average_confidence']:.1%}")
    print(f"⏱️ Test Duration: {report['summary']['test_duration_seconds']:.2f}s")
    print(f"📋 Report Saved: {report_path}")
    
    # Discipline breakdown
    print("\n📈 Discipline Performance:")
    for discipline, stats in report['discipline_performance'].items():
        print(f"  • {discipline.title()}: {stats['success_rate']:.1%} ({stats['passed']}/{stats['total']})")
    
    # Quality metrics
    quality = report['quality_metrics']
    print(f"\n🔬 Quality Metrics:")
    print(f"  • Methodology Score: {quality['avg_methodology_score']:.1%}")
    print(f"  • Design Quality: {quality['avg_design_quality_score']:.1%}")
    
    if report['summary']['success_rate'] >= 0.90:
        print("\n🎉 SCIENTIFIC RESEARCH ENGINE: PRODUCTION READY!")
        print("🚀 Phase 2 Scientific Research Domain: COMPLETED")
    else:
        print("\n⚠️ Issues detected - review recommendations")
        print("Recommendations:")
        for rec in report['recommendations']:
            print(f"  • {rec}")
    
    return report['summary']['success_rate'] >= 0.90


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)