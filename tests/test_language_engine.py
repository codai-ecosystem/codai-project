#!/usr/bin/env python3
"""
🗣️ Language and Literature Engine Comprehensive Test Suite
==========================================================

Comprehensive validation suite for RomAI Language and Literature Engine
covering literary analysis, linguistic research, and translation capabilities.

Test Categories:
- Literary Analysis (poetry, prose, drama)
- Linguistic Analysis (phonetics, morphology, syntax, semantics, pragmatics)
- Translation Services (cultural, semantic, communicative approaches)
- Cross-Cultural Communication
- Comparative Literature Analysis

Performance Targets:
- Success Rate: 95%+ 
- Average Confidence: 85%+
- Processing Speed: <1s per analysis
"""

import sys
import json
import asyncio
import logging
import time
from pathlib import Path
from typing import Dict, List, Any, Tuple

# Add the RomAI source directory to the path
sys.path.insert(0, str(Path(__file__).parent / "apps" / "romai" / "src"))

from ml.reasoning.autonomous_language_engine import AutonomousLanguageEngine, LanguageResult

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LanguageEngineValidator:
    """Comprehensive validation suite for Language and Literature Engine."""
    
    def __init__(self):
        """Initialize the validator."""
        self.engine = AutonomousLanguageEngine()
        self.test_data = self._load_test_data()
        self.results = []
        logger.info("🗣️ Language Engine Validator initialized")
    
    def _load_test_data(self) -> Dict[str, Any]:
        """Load test cases from training data."""
        try:
            with open("apps/romai/training_data/language_literature_training_data.json", "r") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error("❌ Training data file not found")
            return {"language_literature_test_cases": []}
    
    async def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run complete validation suite."""
        logger.info("🚀 Starting Language Engine Comprehensive Validation")
        
        test_cases = self.test_data.get("language_literature_test_cases", [])
        logger.info(f"📋 Loaded {len(test_cases)} language test cases")
        
        total_tests = len(test_cases)
        passed_tests = 0
        failed_tests = []
        
        start_time = time.time()
        
        for i, test_case in enumerate(test_cases, 1):
            logger.info(f"🗣️ Running test {i}/{total_tests}: {test_case['test_id']}")
            
            try:
                result = await self._execute_test_case(test_case)
                
                if result["passed"]:
                    passed_tests += 1
                    logger.info(f"✅ PASSED - {test_case['category']} (Confidence: {result['confidence']:.1f}%, Time: {result['processing_time']:.2f}s)")
                else:
                    failed_tests.append({
                        "test_id": test_case["test_id"],
                        "category": test_case["category"],
                        "reason": result["failure_reason"],
                        "expected": test_case["expected"],
                        "actual": result["actual_result"]
                    })
                    logger.error(f"❌ FAILED - {test_case['category']}: {result['failure_reason']}")
                
                self.results.append(result)
                
            except Exception as e:
                logger.error(f"❌ ERROR in test {test_case['test_id']}: {str(e)}")
                failed_tests.append({
                    "test_id": test_case["test_id"],
                    "category": test_case["category"],
                    "reason": f"Exception: {str(e)}",
                    "expected": test_case["expected"],
                    "actual": None
                })
        
        total_time = time.time() - start_time
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        # Calculate performance metrics
        avg_confidence = sum(r["confidence"] for r in self.results) / len(self.results) if self.results else 0
        avg_processing_time = sum(r["processing_time"] for r in self.results) / len(self.results) if self.results else 0
        
        # Category-specific performance
        category_performance = self._analyze_category_performance()
        
        validation_summary = {
            "overall_status": "SUCCESS" if success_rate >= 95.0 else "NEEDS_IMPROVEMENT",
            "performance_level": self._determine_performance_level(success_rate, avg_confidence),
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": len(failed_tests),
            "success_rate": success_rate,
            "avg_confidence": avg_confidence,
            "avg_processing_time": avg_processing_time,
            "total_validation_time": total_time,
            "category_performance": category_performance,
            "failed_test_details": failed_tests,
            "production_ready": success_rate >= 95.0 and avg_confidence >= 85.0
        }
        
        logger.info(f"⏱️ Total validation time: {total_time:.2f}s")
        self._print_validation_summary(validation_summary)
        
        return validation_summary
    
    async def _execute_test_case(self, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single test case."""
        test_input = test_case["input"]
        expected = test_case["expected"]
        
        # Determine test type and execute appropriate method
        if test_case["category"] in ["poetry_analysis", "prose_analysis", "drama_analysis", "cultural_analysis", "comparative_analysis", "contemporary_literature", "persuasive_discourse", "structural_analysis"]:
            result = await self.engine.analyze_literary_work(
                text=test_input["text"],
                context=test_input.get("context", {})
            )
        elif test_case["category"] in ["comprehensive_linguistic", "phonetic_analysis", "academic_analysis", "sociolinguistic_analysis", "code_switching"]:
            result = await self.engine.analyze_linguistic_features(
                text=test_input["text"],
                analysis_level=test_input.get("analysis_level", "comprehensive")
            )
        elif test_case["category"] in ["cultural_translation", "semantic_translation"]:
            result = await self.engine.translate_with_context(
                text=test_input["text"],
                source_lang=test_input["source_lang"],
                target_lang=test_input["target_lang"],
                approach=test_input["approach"]
            )
        else:
            raise ValueError(f"Unknown test category: {test_case['category']}")
        
        # Validate results
        validation_result = self._validate_result(result, expected, test_case)
        
        return {
            "test_id": test_case["test_id"],
            "category": test_case["category"],
            "passed": validation_result["passed"],
            "confidence": result.confidence,
            "processing_time": result.processing_time,
            "failure_reason": validation_result.get("failure_reason", ""),
            "actual_result": {
                "analysis_type": result.analysis_type,
                "primary_language": result.primary_language,
                "confidence": result.confidence,
                "additional_details": validation_result.get("actual_details", {})
            }
        }
    
    def _validate_result(self, result: LanguageResult, expected: Dict[str, Any], test_case: Dict[str, Any]) -> Dict[str, Any]:
        """Validate result against expected outcomes."""
        failures = []
        actual_details = {}
        
        # Check analysis type
        if result.analysis_type != expected.get("analysis_type"):
            failures.append(f"Analysis type mismatch: got {result.analysis_type}, expected {expected.get('analysis_type')}")
        
        # Check primary language
        if result.primary_language != expected.get("primary_language"):
            failures.append(f"Language mismatch: got {result.primary_language}, expected {expected.get('primary_language')}")
        
        # Check confidence threshold
        min_confidence = expected.get("min_confidence", 80.0)
        if result.confidence < min_confidence:
            failures.append(f"Confidence too low: {result.confidence:.1f}% < {min_confidence}%")
        
        # Category-specific validations
        if test_case["category"] in ["poetry_analysis", "prose_analysis", "drama_analysis"]:
            actual_details["literary_genre"] = result.literary_genre
            if result.literary_genre != expected.get("literary_genre"):
                failures.append(f"Genre mismatch: got {result.literary_genre}, expected {expected.get('literary_genre')}")
        
        # Check linguistic features for linguistic analysis
        if "linguistic_features" in expected:
            actual_details["linguistic_features"] = result.linguistic_features
            expected_features = expected["linguistic_features"]
            missing_features = [f for f in expected_features if f not in result.linguistic_features]
            if missing_features:
                failures.append(f"Missing linguistic features: {missing_features}")
        
        # Check translation-specific validations
        if result.analysis_type == "translation":
            actual_details["secondary_language"] = result.secondary_language
            if result.secondary_language != expected.get("secondary_language"):
                failures.append(f"Target language mismatch: got {result.secondary_language}, expected {expected.get('secondary_language')}")
        
        return {
            "passed": len(failures) == 0,
            "failure_reason": "; ".join(failures) if failures else "",
            "actual_details": actual_details
        }
    
    def _analyze_category_performance(self) -> Dict[str, Dict[str, float]]:
        """Analyze performance by category."""
        categories = {}
        
        for result in self.results:
            category = result["category"]
            if category not in categories:
                categories[category] = {"tests": 0, "passed": 0, "total_confidence": 0.0}
            
            categories[category]["tests"] += 1
            categories[category]["total_confidence"] += result["confidence"]
            if result["passed"]:
                categories[category]["passed"] += 1
        
        # Calculate percentages
        for category, data in categories.items():
            data["success_rate"] = (data["passed"] / data["tests"]) * 100
            data["avg_confidence"] = data["total_confidence"] / data["tests"]
        
        return categories
    
    def _determine_performance_level(self, success_rate: float, avg_confidence: float) -> str:
        """Determine overall performance level."""
        if success_rate >= 95.0 and avg_confidence >= 90.0:
            return "EXCEPTIONAL"
        elif success_rate >= 90.0 and avg_confidence >= 85.0:
            return "EXCELLENT"
        elif success_rate >= 85.0 and avg_confidence >= 80.0:
            return "GOOD"
        elif success_rate >= 75.0 and avg_confidence >= 75.0:
            return "FAIR"
        else:
            return "NEEDS_IMPROVEMENT"
    
    def _print_validation_summary(self, summary: Dict[str, Any]) -> None:
        """Print comprehensive validation summary."""
        print(f"\n📊 VALIDATION SUMMARY")
        print("=" * 50)
        print(f"✅ Overall Status: {summary['overall_status']}")
        print(f"🏆 Performance Level: {summary['performance_level']}")
        print(f"📋 Total Tests: {summary['total_tests']}")
        print(f"✅ Passed: {summary['passed_tests']}")
        print(f"❌ Failed: {summary['failed_tests']}")
        print(f"📈 Success Rate: {summary['success_rate']:.1f}%")
        
        print(f"\n🎯 Performance Metrics:")
        print(f"  • Average Confidence: {summary['avg_confidence']:.1f}%")
        print(f"  • Average Processing Time: {summary['avg_processing_time']:.2f}s")
        
        print(f"\n🗣️ Category Performance:")
        for category, performance in summary['category_performance'].items():
            success_rate = performance['success_rate']
            avg_conf = performance['avg_confidence']
            test_count = performance['tests']
            passed_count = performance['passed']
            print(f"  • {category.replace('_', ' ').title()}: {success_rate:.1f}% ({passed_count}/{test_count}, Conf: {avg_conf:.1f}%)")
        
        production_status = "🚀 PRODUCTION READY" if summary['production_ready'] else "⚠️ NEEDS IMPROVEMENT"
        print(f"\n{production_status}: Language Engine {'ready for deployment!' if summary['production_ready'] else 'requires optimization'}")
        
        if summary['failed_tests'] > 0:
            print(f"\n❌ Failed Tests:")
            for failure in summary['failed_test_details'][:3]:  # Show first 3 failures
                print(f"  • {failure['test_id']} ({failure['category']}): {failure['reason']}")
        
        print(f"\n💡 Recommendations:")
        if summary['success_rate'] < 95.0:
            print("  1. Review failed test cases and improve analysis algorithms")
        if summary['avg_confidence'] < 85.0:
            print("  2. Enhance confidence calculation methods")
        if summary['avg_processing_time'] > 1.0:
            print("  3. Optimize processing speed for real-time applications")
        if summary['production_ready']:
            print("  1. Language Engine performance is excellent - consider advanced feature development")

async def main():
    """Main validation execution."""
    print("🗣️ RomAI Language and Literature Engine Comprehensive Validation")
    print("=" * 70)
    
    try:
        validator = LanguageEngineValidator()
        results = await validator.run_comprehensive_validation()
        
        return results
        
    except Exception as e:
        logger.error(f"❌ Validation failed with error: {str(e)}")
        print(f"\n💥 VALIDATION ERROR: {str(e)}")
        return None

if __name__ == "__main__":
    asyncio.run(main())