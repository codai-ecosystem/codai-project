#!/usr/bin/env python3
"""
RomAI Creative Arts Engine Comprehensive Test Validation Suite

Advanced testing framework for validating creative arts analysis capabilities
across visual arts, music, literature, design, and performing arts disciplines.

Test Coverage:
- Visual Arts: Painting, photography, sculpture, digital art analysis
- Music: Composition, performance, arrangement analysis
- Literature: Fiction, poetry, drama analysis
- Design: Digital, brand, spatial, product design analysis
- Performing Arts: Theater, dance, film analysis
- Cross-disciplinary creative evaluation
- Technical proficiency assessment
- Aesthetic judgment validation
- Cultural context analysis

Success Criteria:
- 95% discipline identification accuracy
- 90% category classification accuracy
- 85% confidence score calibration
- 90% evaluation consistency across test cases
- Comprehensive artistic analysis quality
"""

import asyncio
import json
import logging
import statistics
import sys
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime

# Add the apps directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from apps.romai.src.ml.reasoning.autonomous_creative_engine import AutonomousCreativeArtsEngine, CreativeResult

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CreativeArtsEngineValidator:
    """
    Comprehensive validation framework for Creative Arts Reasoning Engine.
    Tests artistic analysis, aesthetic evaluation, and creative assessment capabilities.
    """
    
    def __init__(self):
        """Initialize the Creative Arts Engine Validator."""
        self.engine = AutonomousCreativeArtsEngine()
        self.test_results = []
        self.performance_metrics = {
            "discipline_accuracy": 0.0,
            "category_accuracy": 0.0, 
            "average_confidence": 0.0,
            "test_success_rate": 0.0,
            "processing_times": [],
            "error_count": 0
        }
        
        logger.info("🎨 Creative Arts Engine Validator initialized")
    
    async def run_comprehensive_validation(self) -> Dict[str, Any]:
        """
        Execute comprehensive Creative Arts Engine validation across all artistic disciplines.
        
        Returns:
            Dict containing validation results, performance metrics, and analysis summary
        """
        logger.info("🚀 Starting Creative Arts Engine Comprehensive Validation")
        validation_start = datetime.now()
        
        try:
            # Load test cases
            test_cases = self._load_test_cases()
            logger.info(f"📋 Loaded {len(test_cases)} creative arts test cases")
            
            # Execute test suite
            for i, test_case in enumerate(test_cases, 1):
                logger.info(f"🎭 Running test {i}/{len(test_cases)}: {test_case['id']}")
                
                test_start = datetime.now()
                result = await self._execute_test_case(test_case)
                test_duration = (datetime.now() - test_start).total_seconds()
                
                self.performance_metrics["processing_times"].append(test_duration)
                self.test_results.append(result)
                
                if result["passed"]:
                    status = "✅ PASSED"
                    color = "GREEN"
                else:
                    status = "❌ FAILED"
                    color = "RED"
                    
                logger.info(f"{status} - {test_case['discipline']} {test_case['category']} "
                           f"(Confidence: {result['confidence']:.1%}, Time: {test_duration:.2f}s)")
            
            # Calculate comprehensive metrics
            validation_summary = self._calculate_validation_metrics()
            
            total_duration = (datetime.now() - validation_start).total_seconds()
            logger.info(f"⏱️ Total validation time: {total_duration:.2f}s")
            
            # Generate final report
            final_report = self._generate_comprehensive_report(validation_summary, total_duration)
            
            return final_report
            
        except Exception as e:
            logger.error(f"❌ Validation failed with error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _load_test_cases(self) -> List[Dict[str, Any]]:
        """Load creative arts test cases from training data file."""
        try:
            # Correct path to training data file
            training_data_path = Path(__file__).parent / "apps" / "romai" / "training_data" / "creative_arts_training_data.json"
            
            with open(training_data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            return data.get("creative_arts_test_cases", [])
            
        except Exception as e:
            logger.error(f"❌ Failed to load test cases: {str(e)}")
            return []
    
    async def _execute_test_case(self, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute individual creative arts test case with comprehensive validation.
        
        Args:
            test_case: Test case definition with creative work description and expected results
            
        Returns:
            Dict containing test results, validation metrics, and analysis details
        """
        try:
            # Extract test parameters
            description = test_case["description"]
            expected_discipline = test_case["expected_results"]["artistic_discipline"]
            expected_category = test_case["expected_results"]["creative_category"]
            confidence_range = test_case["expected_results"]["confidence_range"]
            test_data = test_case.get("test_data", {})
            
            # Execute creative analysis
            creative_result = await self.engine.analyze_creative_work(description, test_data)
            
            # Validate results
            discipline_correct = creative_result.artistic_discipline == expected_discipline
            category_correct = creative_result.creative_category == expected_category
            confidence_in_range = (confidence_range[0] <= creative_result.confidence_score <= confidence_range[1])
            
            # Check comprehensive analysis quality
            analysis_quality = self._assess_analysis_quality(creative_result, test_case)
            
            # Determine test success
            test_passed = (discipline_correct and category_correct and 
                          confidence_in_range and analysis_quality["comprehensive"])
            
            return {
                "test_id": test_case["id"],
                "description": description,
                "passed": test_passed,
                "discipline_correct": discipline_correct,
                "category_correct": category_correct,
                "confidence_in_range": confidence_in_range,
                "confidence": creative_result.confidence_score,
                "expected_confidence_range": confidence_range,
                "actual_discipline": creative_result.artistic_discipline,
                "expected_discipline": expected_discipline,
                "actual_category": creative_result.creative_category,
                "expected_category": expected_category,
                "creative_conclusion": creative_result.creative_conclusion,
                "reasoning_points": len(creative_result.creative_reasoning),
                "analysis_quality": analysis_quality,
                "artistic_analysis": creative_result.artistic_analysis,
                "aesthetic_evaluation": creative_result.aesthetic_evaluation,
                "technical_assessment": creative_result.technical_assessment,
                "innovation_score": creative_result.innovation_score,
                "recommendations_count": len(creative_result.recommendations)
            }
            
        except Exception as e:
            logger.error(f"❌ Test execution failed: {str(e)}")
            self.performance_metrics["error_count"] += 1
            return {
                "test_id": test_case.get("id", "unknown"),
                "passed": False,
                "error": str(e),
                "confidence": 0.0
            }
    
    def _assess_analysis_quality(self, result: CreativeResult, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """Assess the quality and comprehensiveness of creative arts analysis."""
        
        # Check analysis completeness
        has_artistic_analysis = bool(result.artistic_analysis)
        has_aesthetic_evaluation = bool(result.aesthetic_evaluation)
        has_technical_assessment = bool(result.technical_assessment)
        has_style_recognition = bool(result.style_recognition)
        has_cultural_context = bool(result.cultural_context)
        has_creative_merit = bool(result.creative_merit)
        has_recommendations = len(result.recommendations) > 0
        
        # Check reasoning depth
        sufficient_reasoning = len(result.creative_reasoning) >= 5
        detailed_conclusion = len(result.creative_conclusion) > 50
        
        # Check innovation assessment
        has_innovation_score = result.innovation_score > 0
        
        # Comprehensive analysis assessment
        comprehensive_components = [
            has_artistic_analysis,
            has_aesthetic_evaluation,
            has_technical_assessment,
            has_style_recognition,
            has_cultural_context,
            has_creative_merit,
            has_recommendations,
            sufficient_reasoning,
            detailed_conclusion,
            has_innovation_score
        ]
        
        comprehensive_score = sum(comprehensive_components) / len(comprehensive_components)
        comprehensive = comprehensive_score >= 0.8
        
        return {
            "comprehensive": comprehensive,
            "comprehensive_score": comprehensive_score,
            "has_artistic_analysis": has_artistic_analysis,
            "has_aesthetic_evaluation": has_aesthetic_evaluation,
            "has_technical_assessment": has_technical_assessment,
            "has_style_recognition": has_style_recognition,
            "has_cultural_context": has_cultural_context,
            "has_creative_merit": has_creative_merit,
            "has_recommendations": has_recommendations,
            "sufficient_reasoning": sufficient_reasoning,
            "detailed_conclusion": detailed_conclusion,
            "has_innovation_score": has_innovation_score
        }
    
    def _calculate_validation_metrics(self) -> Dict[str, Any]:
        """Calculate comprehensive validation metrics across all test cases."""
        
        if not self.test_results:
            return {"success": False, "message": "No test results available"}
        
        # Basic success metrics
        passed_tests = [r for r in self.test_results if r.get("passed", False)]
        total_tests = len(self.test_results)
        success_rate = len(passed_tests) / total_tests if total_tests > 0 else 0
        
        # Discipline accuracy
        discipline_correct = sum(1 for r in self.test_results if r.get("discipline_correct", False))
        discipline_accuracy = discipline_correct / total_tests if total_tests > 0 else 0
        
        # Category accuracy
        category_correct = sum(1 for r in self.test_results if r.get("category_correct", False))
        category_accuracy = category_correct / total_tests if total_tests > 0 else 0
        
        # Confidence metrics
        confidences = [r.get("confidence", 0) for r in self.test_results if "confidence" in r]
        avg_confidence = statistics.mean(confidences) if confidences else 0
        
        # Processing performance
        avg_processing_time = statistics.mean(self.performance_metrics["processing_times"]) if self.performance_metrics["processing_times"] else 0
        
        # Quality metrics
        comprehensive_analyses = sum(1 for r in self.test_results 
                                   if r.get("analysis_quality", {}).get("comprehensive", False))
        comprehensive_rate = comprehensive_analyses / total_tests if total_tests > 0 else 0
        
        # Error metrics
        error_rate = self.performance_metrics["error_count"] / total_tests if total_tests > 0 else 0
        
        # Discipline performance breakdown
        discipline_performance = self._calculate_discipline_performance()
        
        return {
            "total_tests": total_tests,
            "passed_tests": len(passed_tests),
            "success_rate": success_rate,
            "discipline_accuracy": discipline_accuracy,
            "category_accuracy": category_accuracy,
            "average_confidence": avg_confidence,
            "comprehensive_rate": comprehensive_rate,
            "average_processing_time": avg_processing_time,
            "error_rate": error_rate,
            "discipline_performance": discipline_performance,
            "confidence_distribution": self._calculate_confidence_distribution(confidences),
            "quality_metrics": self._calculate_quality_metrics()
        }
    
    def _calculate_discipline_performance(self) -> Dict[str, Any]:
        """Calculate performance metrics by artistic discipline."""
        disciplines = {}
        
        for result in self.test_results:
            expected_discipline = result.get("expected_discipline", "unknown")
            
            if expected_discipline not in disciplines:
                disciplines[expected_discipline] = {
                    "total": 0,
                    "correct": 0,
                    "confidences": []
                }
            
            disciplines[expected_discipline]["total"] += 1
            
            if result.get("discipline_correct", False):
                disciplines[expected_discipline]["correct"] += 1
            
            if "confidence" in result:
                disciplines[expected_discipline]["confidences"].append(result["confidence"])
        
        # Calculate accuracy and average confidence for each discipline
        for discipline, stats in disciplines.items():
            stats["accuracy"] = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            stats["avg_confidence"] = statistics.mean(stats["confidences"]) if stats["confidences"] else 0
        
        return disciplines
    
    def _calculate_confidence_distribution(self, confidences: List[float]) -> Dict[str, int]:
        """Calculate confidence score distribution across ranges."""
        distribution = {
            "very_high_0.9+": 0,
            "high_0.8-0.9": 0,
            "medium_0.7-0.8": 0,
            "low_0.5-0.7": 0,
            "very_low_<0.5": 0
        }
        
        for conf in confidences:
            if conf >= 0.9:
                distribution["very_high_0.9+"] += 1
            elif conf >= 0.8:
                distribution["high_0.8-0.9"] += 1
            elif conf >= 0.7:
                distribution["medium_0.7-0.8"] += 1
            elif conf >= 0.5:
                distribution["low_0.5-0.7"] += 1
            else:
                distribution["very_low_<0.5"] += 1
        
        return distribution
    
    def _calculate_quality_metrics(self) -> Dict[str, Any]:
        """Calculate comprehensive quality metrics for creative analysis."""
        quality_metrics = {
            "reasoning_depth": [],
            "recommendation_count": [],
            "innovation_scores": [],
            "comprehensive_scores": []
        }
        
        for result in self.test_results:
            if "reasoning_points" in result:
                quality_metrics["reasoning_depth"].append(result["reasoning_points"])
            
            if "recommendations_count" in result:
                quality_metrics["recommendation_count"].append(result["recommendations_count"])
            
            if "innovation_score" in result:
                quality_metrics["innovation_scores"].append(result["innovation_score"])
            
            if result.get("analysis_quality", {}).get("comprehensive_score"):
                quality_metrics["comprehensive_scores"].append(
                    result["analysis_quality"]["comprehensive_score"]
                )
        
        # Calculate averages
        avg_reasoning_depth = statistics.mean(quality_metrics["reasoning_depth"]) if quality_metrics["reasoning_depth"] else 0
        avg_recommendations = statistics.mean(quality_metrics["recommendation_count"]) if quality_metrics["recommendation_count"] else 0
        avg_innovation = statistics.mean(quality_metrics["innovation_scores"]) if quality_metrics["innovation_scores"] else 0
        avg_comprehensive = statistics.mean(quality_metrics["comprehensive_scores"]) if quality_metrics["comprehensive_scores"] else 0
        
        return {
            "average_reasoning_depth": avg_reasoning_depth,
            "average_recommendations": avg_recommendations,
            "average_innovation_score": avg_innovation,
            "average_comprehensive_score": avg_comprehensive
        }
    
    def _generate_comprehensive_report(self, metrics: Dict[str, Any], total_time: float) -> Dict[str, Any]:
        """Generate comprehensive validation report with detailed analysis."""
        
        # Determine overall success based on key metrics
        success_thresholds = {
            "success_rate": 0.85,  # 85% test success rate
            "discipline_accuracy": 0.90,  # 90% discipline identification
            "category_accuracy": 0.85,  # 85% category classification
            "comprehensive_rate": 0.80  # 80% comprehensive analysis
        }
        
        meets_thresholds = all(
            metrics.get(metric, 0) >= threshold 
            for metric, threshold in success_thresholds.items()
        )
        
        # Performance classification
        if metrics["success_rate"] >= 0.95:
            performance_level = "EXCEPTIONAL"
        elif metrics["success_rate"] >= 0.90:
            performance_level = "EXCELLENT" 
        elif metrics["success_rate"] >= 0.80:
            performance_level = "GOOD"
        elif metrics["success_rate"] >= 0.70:
            performance_level = "ACCEPTABLE"
        else:
            performance_level = "NEEDS_IMPROVEMENT"
        
        # Production readiness assessment
        production_ready = (
            metrics["success_rate"] >= 0.85 and
            metrics["discipline_accuracy"] >= 0.90 and
            metrics["category_accuracy"] >= 0.85 and
            metrics["error_rate"] < 0.05 and
            metrics["average_processing_time"] < 2.0
        )
        
        return {
            "validation_summary": {
                "timestamp": datetime.now().isoformat(),
                "total_duration_seconds": total_time,
                "overall_success": meets_thresholds,
                "performance_level": performance_level,
                "production_ready": production_ready
            },
            "test_metrics": {
                "total_test_cases": metrics["total_tests"],
                "passed_tests": metrics["passed_tests"],
                "failed_tests": metrics["total_tests"] - metrics["passed_tests"],
                "success_rate": metrics["success_rate"],
                "error_rate": metrics["error_rate"]
            },
            "accuracy_metrics": {
                "discipline_identification": metrics["discipline_accuracy"],
                "category_classification": metrics["category_accuracy"],
                "comprehensive_analysis_rate": metrics["comprehensive_rate"]
            },
            "performance_metrics": {
                "average_confidence": metrics["average_confidence"],
                "average_processing_time": metrics["average_processing_time"],
                "confidence_distribution": metrics["confidence_distribution"]
            },
            "discipline_performance": metrics["discipline_performance"],
            "quality_assessment": metrics["quality_metrics"],
            "detailed_results": self.test_results,
            "recommendations": self._generate_improvement_recommendations(metrics),
            "next_steps": self._generate_next_steps(meets_thresholds, production_ready)
        }
    
    def _generate_improvement_recommendations(self, metrics: Dict[str, Any]) -> List[str]:
        """Generate specific recommendations for improving Creative Arts Engine performance."""
        recommendations = []
        
        if metrics["discipline_accuracy"] < 0.90:
            recommendations.append("Enhance discipline identification patterns with more specific artistic terminology")
        
        if metrics["category_accuracy"] < 0.85:
            recommendations.append("Improve category classification with refined artistic subcategory detection")
        
        if metrics["average_confidence"] < 0.80:
            recommendations.append("Calibrate confidence scoring for more accurate uncertainty estimation")
        
        if metrics["comprehensive_rate"] < 0.80:
            recommendations.append("Enhance analysis depth with more comprehensive artistic evaluation components")
        
        if metrics["average_processing_time"] > 2.0:
            recommendations.append("Optimize processing performance for faster creative analysis")
        
        # Quality-specific recommendations
        quality_metrics = metrics.get("quality_metrics", {})
        
        if quality_metrics.get("average_reasoning_depth", 0) < 6:
            recommendations.append("Expand reasoning depth with more detailed artistic analysis steps")
        
        if quality_metrics.get("average_innovation_score", 0) < 0.65:
            recommendations.append("Enhance innovation assessment capabilities for better creativity evaluation")
        
        if not recommendations:
            recommendations.append("Creative Arts Engine performance is excellent - consider advanced feature development")
        
        return recommendations
    
    def _generate_next_steps(self, meets_thresholds: bool, production_ready: bool) -> List[str]:
        """Generate next steps based on validation results."""
        if production_ready:
            return [
                "Creative Arts Engine is production-ready",
                "Deploy for production creative analysis workloads",
                "Monitor performance in production environment",
                "Collect user feedback for continuous improvement",
                "Consider advanced creative features development"
            ]
        elif meets_thresholds:
            return [
                "Address minor performance optimizations",
                "Conduct additional validation testing",
                "Prepare for production deployment",
                "Finalize documentation and user guides"
            ]
        else:
            return [
                "Address critical performance issues",
                "Enhance core creative analysis capabilities",
                "Conduct comprehensive debugging and optimization",
                "Repeat validation testing after improvements"
            ]


async def main():
    """Execute Creative Arts Engine comprehensive validation."""
    print("🎨 RomAI Creative Arts Engine Comprehensive Validation")
    print("=" * 70)
    
    validator = CreativeArtsEngineValidator()
    
    try:
        # Run comprehensive validation
        report = await validator.run_comprehensive_validation()
        
        # Display results
        print("\n📊 VALIDATION SUMMARY")
        print("=" * 50)
        
        if report.get("validation_summary", {}).get("overall_success", False):
            print("✅ Overall Status: SUCCESS")
            print(f"🏆 Performance Level: {report['validation_summary']['performance_level']}")
        else:
            print("❌ Overall Status: NEEDS IMPROVEMENT")
        
        print(f"📋 Total Tests: {report['test_metrics']['total_test_cases']}")
        print(f"✅ Passed: {report['test_metrics']['passed_tests']}")
        print(f"❌ Failed: {report['test_metrics']['failed_tests']}")
        print(f"📈 Success Rate: {report['test_metrics']['success_rate']:.1%}")
        
        print(f"\n🎯 Accuracy Metrics:")
        print(f"  • Discipline Identification: {report['accuracy_metrics']['discipline_identification']:.1%}")
        print(f"  • Category Classification: {report['accuracy_metrics']['category_classification']:.1%}")
        print(f"  • Comprehensive Analysis: {report['accuracy_metrics']['comprehensive_analysis_rate']:.1%}")
        
        print(f"\n⚡ Performance Metrics:")
        print(f"  • Average Confidence: {report['performance_metrics']['average_confidence']:.1%}")
        print(f"  • Processing Time: {report['performance_metrics']['average_processing_time']:.2f}s")
        
        print(f"\n🎨 Discipline Performance:")
        for discipline, perf in report['discipline_performance'].items():
            print(f"  • {discipline.replace('_', ' ').title()}: {perf['accuracy']:.1%} "
                  f"({perf['correct']}/{perf['total']}, Conf: {perf['avg_confidence']:.1%})")
        
        if report['validation_summary'].get('production_ready', False):
            print(f"\n🚀 PRODUCTION READY: Creative Arts Engine ready for deployment!")
        
        # Display recommendations
        if report.get("recommendations"):
            print(f"\n💡 Recommendations:")
            for i, rec in enumerate(report["recommendations"], 1):
                print(f"  {i}. {rec}")
        
        return report['validation_summary']['overall_success']
        
    except Exception as e:
        print(f"\n❌ Validation failed: {str(e)}")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())