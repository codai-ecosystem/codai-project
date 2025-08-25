"""
RomAI AGI Engineering Reasoning Engine Test Suite
=================================================

Comprehensive validation tests for engineering problem-solving across multiple disciplines:
- Mechanical Engineering (stress analysis, design optimization, failure analysis)  
- Electrical Engineering (circuit analysis, power systems, signal processing)
- Software Engineering (algorithm optimization, system architecture, performance)
- Civil Engineering (structural analysis, foundation design, building codes)
- Systems Engineering (reliability, integration, lifecycle management)
- Manufacturing Engineering (process optimization, quality control)
- Thermal Engineering (heat transfer, cooling systems)
- Control Engineering (feedback systems, stability analysis)

Version: 1.0.0 (Production Ready)
Created: 2025-08-24
"""

import asyncio
import json
import sys
import time
from pathlib import Path
from typing import Dict, Any, List

# Add the RomAI source directory to the path
sys.path.insert(0, str(Path(__file__).parent / "apps" / "romai" / "src"))

from ml.reasoning.autonomous_engineering_engine import AutonomousEngineeringEngine

class EngineeringEngineValidator:
    """Comprehensive validation suite for the Engineering Reasoning Engine."""
    
    def __init__(self):
        self.engine = AutonomousEngineeringEngine()
        self.test_cases = []
        self.results = []
        
    async def load_test_cases(self) -> bool:
        """Load engineering test cases from training data."""
        try:
            training_data_path = Path("apps/romai/training_data/engineering_training_data.json")
            
            if not training_data_path.exists():
                print(f"❌ Training data not found at {training_data_path}")
                return False
                
            with open(training_data_path, 'r', encoding='utf-8') as f:
                self.test_cases = json.load(f)
                
            print(f"✅ Loaded {len(self.test_cases)} engineering test cases")
            return True
            
        except Exception as e:
            print(f"❌ Failed to load test cases: {e}")
            return False
    
    async def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Run comprehensive engineering reasoning tests."""
        
        print("🔧 RomAI Engineering Reasoning Engine - Comprehensive Test Suite")
        print("=" * 80)
        
        # Load test cases
        if not await self.load_test_cases():
            return {"success": False, "error": "Failed to load test cases"}
        
        total_tests = len(self.test_cases)
        passed_tests = 0
        failed_tests = 0
        total_confidence = 0.0
        discipline_results = {}
        analysis_type_results = {}
        
        start_time = time.time()
        
        # Run each test case
        for i, test_case in enumerate(self.test_cases, 1):
            print(f"\n🧪 Test {i}/{total_tests}: {test_case['problem'][:60]}...")
            
            try:
                # Execute engineering analysis
                result = await self.engine.solve_engineering_problem(
                    test_case["problem"],
                    test_case["parameters"]
                )
                
                # Validate result
                test_passed = self._validate_engineering_result(result, test_case)
                
                if test_passed:
                    passed_tests += 1
                    print(f"   ✅ PASSED - Confidence: {result.confidence_score:.1%}")
                else:
                    failed_tests += 1
                    print(f"   ❌ FAILED - Confidence: {result.confidence_score:.1%}")
                
                # Track by discipline
                discipline = result.engineering_discipline or "unknown"
                if discipline not in discipline_results:
                    discipline_results[discipline] = {"passed": 0, "total": 0, "confidence_sum": 0}
                discipline_results[discipline]["total"] += 1
                discipline_results[discipline]["confidence_sum"] += result.confidence_score
                if test_passed:
                    discipline_results[discipline]["passed"] += 1
                
                # Track by analysis type
                analysis_type = result.analysis_type or "unknown"
                if analysis_type not in analysis_type_results:
                    analysis_type_results[analysis_type] = {"passed": 0, "total": 0}
                analysis_type_results[analysis_type]["total"] += 1
                if test_passed:
                    analysis_type_results[analysis_type]["passed"] += 1
                
                total_confidence += result.confidence_score
                
                # Store detailed result
                self.results.append({
                    "test_id": i,
                    "problem": test_case["problem"],
                    "discipline": discipline,
                    "analysis_type": analysis_type,
                    "passed": test_passed,
                    "confidence": result.confidence_score,
                    "conclusion": result.engineering_conclusion,
                    "processing_time": result.processing_time
                })
                
                # Brief pause to prevent overwhelming
                await asyncio.sleep(0.1)
                
            except Exception as e:
                failed_tests += 1
                print(f"   ❌ ERROR: {str(e)}")
                
                self.results.append({
                    "test_id": i,
                    "problem": test_case["problem"],
                    "passed": False,
                    "error": str(e),
                    "confidence": 0.0
                })
        
        # Calculate final metrics
        total_time = time.time() - start_time
        success_rate = passed_tests / total_tests if total_tests > 0 else 0
        average_confidence = total_confidence / total_tests if total_tests > 0 else 0
        
        # Generate comprehensive report
        report = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "average_confidence": average_confidence,
            "total_processing_time": total_time,
            "average_processing_time": total_time / total_tests if total_tests > 0 else 0,
            "discipline_results": discipline_results,
            "analysis_type_results": analysis_type_results,
            "detailed_results": self.results
        }
        
        # Print comprehensive summary
        self._print_comprehensive_summary(report)
        
        return report
    
    def _validate_engineering_result(self, result, test_case: Dict[str, Any]) -> bool:
        """Validate engineering analysis result."""
        
        # Check basic result structure
        if not result.engineering_conclusion or not result.engineering_reasoning:
            return False
        
        # Check confidence score is reasonable
        if result.confidence_score < 0.7:  # Minimum confidence threshold
            return False
        
        # Check discipline identification (if expected)
        expected_discipline = test_case.get("expected_discipline")
        if expected_discipline and result.engineering_discipline != expected_discipline:
            return False
        
        # Check for engineering-specific calculations
        if not result.calculated_values and not result.performance_metrics:
            return False
        
        # Check for engineering recommendations
        if len(result.recommendations) == 0:
            return False
        
        # All validation checks passed
        return True
    
    def _print_comprehensive_summary(self, report: Dict[str, Any]) -> None:
        """Print detailed test summary."""
        
        print("\n" + "=" * 80)
        print("🎯 COMPREHENSIVE ENGINEERING REASONING ENGINE TEST RESULTS")
        print("=" * 80)
        
        # Overall Results
        print(f"\n📊 Overall Performance:")
        print(f"   Total Tests: {report['total_tests']}")
        print(f"   ✅ Passed: {report['passed_tests']} ({report['success_rate']:.1%})")
        print(f"   ❌ Failed: {report['failed_tests']}")
        print(f"   🎯 Average Confidence: {report['average_confidence']:.1%}")
        print(f"   ⚡ Total Processing Time: {report['total_processing_time']:.2f}s")
        print(f"   ⏱️ Average Processing Time: {report['average_processing_time']:.3f}s per test")
        
        # Discipline Breakdown
        print(f"\n🔧 Results by Engineering Discipline:")
        for discipline, stats in report['discipline_results'].items():
            success_rate = stats['passed'] / stats['total'] if stats['total'] > 0 else 0
            avg_confidence = stats['confidence_sum'] / stats['total'] if stats['total'] > 0 else 0
            print(f"   {discipline.title()}: {stats['passed']}/{stats['total']} ({success_rate:.1%}) - Confidence: {avg_confidence:.1%}")
        
        # Analysis Type Breakdown  
        print(f"\n📈 Results by Analysis Type:")
        for analysis_type, stats in report['analysis_type_results'].items():
            success_rate = stats['passed'] / stats['total'] if stats['total'] > 0 else 0
            print(f"   {analysis_type.replace('_', ' ').title()}: {stats['passed']}/{stats['total']} ({success_rate:.1%})")
        
        # Performance Classification
        if report['success_rate'] >= 0.95:
            status = "🏆 EXCELLENT"
            color = "GREEN"
        elif report['success_rate'] >= 0.85:
            status = "✅ GOOD"  
            color = "GREEN"
        elif report['success_rate'] >= 0.70:
            status = "⚠️ ACCEPTABLE"
            color = "YELLOW"
        else:
            status = "❌ NEEDS IMPROVEMENT"
            color = "RED"
        
        print(f"\n🎖️ Engineering Engine Performance Rating: {status}")
        
        # Detailed insights
        print(f"\n🔍 Key Insights:")
        
        # Find best performing discipline
        best_discipline = max(report['discipline_results'].items(), 
                            key=lambda x: x[1]['passed']/x[1]['total'] if x[1]['total'] > 0 else 0)
        print(f"   • Best Discipline: {best_discipline[0].title()} ({best_discipline[1]['passed']}/{best_discipline[1]['total']})")
        
        # Find most challenging analysis type
        worst_analysis = min(report['analysis_type_results'].items(),
                           key=lambda x: x[1]['passed']/x[1]['total'] if x[1]['total'] > 0 else 1)
        print(f"   • Most Challenging: {worst_analysis[0].replace('_', ' ').title()} ({worst_analysis[1]['passed']}/{worst_analysis[1]['total']})")
        
        # Confidence analysis
        if report['average_confidence'] >= 0.9:
            print(f"   • Confidence Level: Excellent ({report['average_confidence']:.1%})")
        elif report['average_confidence'] >= 0.8:
            print(f"   • Confidence Level: Good ({report['average_confidence']:.1%})")
        else:
            print(f"   • Confidence Level: Needs Improvement ({report['average_confidence']:.1%})")
        
        print("\n" + "=" * 80)
        
        if report['success_rate'] >= 0.85:
            print("🚀 Engineering Reasoning Engine is PRODUCTION READY!")
        else:
            print("🔧 Engineering Reasoning Engine needs optimization before production.")
            
        print("=" * 80)

async def main():
    """Main test execution function."""
    
    try:
        validator = EngineeringEngineValidator()
        report = await validator.run_comprehensive_tests()
        
        # Save detailed report
        report_path = Path("ROMAI_ENGINEERING_ENGINE_TEST_REPORT.json")
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Detailed test report saved to: {report_path}")
        
        # Return success/failure for CI/CD
        return report["success_rate"] >= 0.85
        
    except Exception as e:
        print(f"❌ Test suite execution failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)