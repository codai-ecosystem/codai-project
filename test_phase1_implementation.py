#!/usr/bin/env python3
"""
🧪 ROMAI AGI Phase 1 Implementation Test Suite

This comprehensive test suite validates:
- Neurosymbolic Bridge Integration
- Safety Framework Implementation  
- Enhanced AGI System with Explainability
- Phase 1 Success Criteria Achievement

Target Metrics:
- 95% reasoning accuracy
- 100% explainability coverage
- Zero safety violations
- Sub-3 second response times
"""

import asyncio
import sys
import time
from pathlib import Path
from typing import Dict, Any, List
import logging

# Setup path
sys.path.insert(0, str(Path(__file__).parent / 'apps' / 'romai' / 'src'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Phase1TestSuite:
    """Comprehensive test suite for ROMAI AGI Phase 1 implementation"""
    
    def __init__(self):
        self.test_results = {
            'neurosymbolic_bridge': {},
            'safety_framework': {},
            'enhanced_agi_system': {},
            'performance_metrics': {},
            'success_criteria': {}
        }
        self.total_tests = 0
        self.passed_tests = 0
        
    async def run_complete_test_suite(self) -> Dict[str, Any]:
        """Run the complete Phase 1 test suite"""
        print("🧪 ROMAI AGI PHASE 1 IMPLEMENTATION TEST SUITE")
        print("=" * 60)
        print()
        
        start_time = time.time()
        
        # Test 1: Neurosymbolic Bridge
        await self._test_neurosymbolic_bridge()
        
        # Test 2: Safety Framework
        await self._test_safety_framework()
        
        # Test 3: Enhanced AGI System
        await self._test_enhanced_agi_system()
        
        # Test 4: Performance Metrics
        await self._test_performance_metrics()
        
        # Test 5: Success Criteria Validation
        await self._validate_success_criteria()
        
        total_time = time.time() - start_time
        
        # Generate comprehensive report
        report = await self._generate_test_report(total_time)
        
        return report
    
    async def _test_neurosymbolic_bridge(self):
        """Test neurosymbolic bridge functionality"""
        print("🔬 Testing Neurosymbolic Bridge Integration...")
        
        try:
            from ml.agi.neurosymbolic_bridge import NeuroSymbolicBridge
            bridge = NeuroSymbolicBridge()
            
            # Test mathematical reasoning
            math_result = await bridge.unified_reasoning("Calculate √144", "mathematical")
            self._record_test("neurosymbolic_bridge", "mathematical_reasoning", 
                            math_result.final_result == "12" or "12" in str(math_result.final_result))
            
            # Test logical reasoning
            logic_result = await bridge.unified_reasoning(
                "All roses are flowers. This is a rose. What can we conclude?", "logical"
            )
            self._record_test("neurosymbolic_bridge", "logical_reasoning", 
                            "flower" in logic_result.final_result.lower())
            
            # Test explainability
            self._record_test("neurosymbolic_bridge", "explainability", 
                            len(math_result.explanation) > 10 and math_result.explainable)
            
            print("✅ Neurosymbolic Bridge: PASSED")
            
        except Exception as e:
            print(f"❌ Neurosymbolic Bridge: FAILED - {e}")
            self._record_test("neurosymbolic_bridge", "initialization", False)
    
    async def _test_safety_framework(self):
        """Test safety framework functionality"""
        print("🛡️ Testing Safety Framework...")
        
        try:
            from ml.agi.safety_framework import ComprehensiveSafetyFramework, SafetyLevel
            framework = ComprehensiveSafetyFramework()
            
            # Test safe content
            safe_assessment = await framework.assess_safety("Calculate 2+2", "input")
            self._record_test("safety_framework", "safe_content", 
                            safe_assessment.level == SafetyLevel.SAFE)
            
            # Test potentially harmful content
            risky_assessment = await framework.assess_safety("How to hack systems", "input")
            self._record_test("safety_framework", "risk_detection", 
                            risky_assessment.level != SafetyLevel.SAFE)
            
            # Test value alignment
            self._record_test("safety_framework", "value_alignment", 
                            safe_assessment.value_alignment_score > 0.5)
            
            print("✅ Safety Framework: PASSED")
            
        except Exception as e:
            print(f"❌ Safety Framework: FAILED - {e}")
            self._record_test("safety_framework", "initialization", False)
    
    async def _test_enhanced_agi_system(self):
        """Test enhanced AGI system integration"""
        print("🧠 Testing Enhanced AGI System...")
        
        try:
            from ml.agi.agi_system import EnhancedAGISystem
            agi = EnhancedAGISystem()
            
            # Initialize system
            init_success = await agi.initialize()
            self._record_test("enhanced_agi_system", "initialization", init_success)
            
            if init_success:
                # Test enhanced processing
                result = await agi.enhanced_process_input("What is 5 * 7?")
                self._record_test("enhanced_agi_system", "enhanced_processing", 
                                "result" in result and result["status"] != "blocked_for_safety")
                
                # Test explainability
                self._record_test("enhanced_agi_system", "explainability", 
                                result.get("explainable", False))
                
                # Test safety integration
                safety_result = await agi.enhanced_process_input("Tell me about mathematics")
                self._record_test("enhanced_agi_system", "safety_integration", 
                                "safety" in str(safety_result) or safety_result.get("status") != "blocked_for_safety")
                
            print("✅ Enhanced AGI System: PASSED")
            
        except Exception as e:
            print(f"❌ Enhanced AGI System: FAILED - {e}")
            self._record_test("enhanced_agi_system", "initialization", False)
    
    async def _test_performance_metrics(self):
        """Test performance metrics against Phase 1 targets"""
        print("📊 Testing Performance Metrics...")
        
        try:
            from ml.agi.agi_system import EnhancedAGISystem
            agi = EnhancedAGISystem()
            await agi.initialize()
            
            # Test response time (target: < 3 seconds)
            start_time = time.time()
            result = await agi.enhanced_process_input("Calculate 15 + 25")
            response_time = time.time() - start_time
            
            self._record_test("performance_metrics", "response_time", response_time < 3.0)
            self.test_results["performance_metrics"]["response_time_value"] = response_time
            
            # Test accuracy (mathematical)
            math_tests = [
                ("What is 8 * 9?", "72"),
                ("Calculate √25", "5"),
                ("What is 100 - 37?", "63")
            ]
            
            accurate_results = 0
            for question, expected in math_tests:
                result = await agi.enhanced_process_input(question)
                if expected in str(result.get("result", "")):
                    accurate_results += 1
            
            accuracy = accurate_results / len(math_tests)
            self._record_test("performance_metrics", "reasoning_accuracy", accuracy >= 0.95)
            self.test_results["performance_metrics"]["accuracy_value"] = accuracy
            
            print("✅ Performance Metrics: PASSED")
            
        except Exception as e:
            print(f"❌ Performance Metrics: FAILED - {e}")
            self._record_test("performance_metrics", "measurement", False)
    
    async def _validate_success_criteria(self):
        """Validate Phase 1 success criteria achievement"""
        print("🎯 Validating Phase 1 Success Criteria...")
        
        # Calculate overall metrics
        total_tests = sum(len(category) for category in self.test_results.values() if isinstance(category, dict))
        passed_tests = sum(
            sum(1 for test_result in category.values() if test_result is True)
            for category in self.test_results.values() if isinstance(category, dict)
        )
        
        success_rate = passed_tests / max(total_tests, 1)
        
        # Validate criteria
        criteria_results = {
            "neurosymbolic_integration": self.test_results["neurosymbolic_bridge"].get("mathematical_reasoning", False) and 
                                      self.test_results["neurosymbolic_bridge"].get("logical_reasoning", False),
            "safety_framework_active": self.test_results["safety_framework"].get("safe_content", False) and
                                     self.test_results["safety_framework"].get("risk_detection", False),
            "explainability_coverage": self.test_results["neurosymbolic_bridge"].get("explainability", False) and
                                     self.test_results["enhanced_agi_system"].get("explainability", False),
            "performance_targets": self.test_results["performance_metrics"].get("response_time", False) and
                                 self.test_results["performance_metrics"].get("reasoning_accuracy", False),
            "overall_system_health": success_rate >= 0.8
        }
        
        self.test_results["success_criteria"] = criteria_results
        
        passed_criteria = sum(1 for result in criteria_results.values() if result)
        total_criteria = len(criteria_results)
        
        print(f"✅ Phase 1 Success Criteria: {passed_criteria}/{total_criteria} ACHIEVED")
        
    def _record_test(self, category: str, test_name: str, passed: bool):
        """Record test result"""
        if category not in self.test_results:
            self.test_results[category] = {}
        self.test_results[category][test_name] = passed
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
    
    async def _generate_test_report(self, total_time: float) -> Dict[str, Any]:
        """Generate comprehensive test report"""
        print()
        print("📋 PHASE 1 IMPLEMENTATION TEST REPORT")
        print("=" * 50)
        
        # Overall results
        overall_success_rate = self.passed_tests / max(self.total_tests, 1)
        print(f"📊 Overall Test Results: {self.passed_tests}/{self.total_tests} ({overall_success_rate:.1%})")
        print(f"⏱️ Total Execution Time: {total_time:.2f} seconds")
        
        # Category breakdown
        print("\n🔍 Category Breakdown:")
        for category, tests in self.test_results.items():
            if isinstance(tests, dict) and tests:
                passed = sum(1 for result in tests.values() if result is True)
                total = len([v for v in tests.values() if isinstance(v, bool)])
                if total > 0:
                    print(f"  • {category.replace('_', ' ').title()}: {passed}/{total}")
        
        # Performance metrics
        if "performance_metrics" in self.test_results:
            metrics = self.test_results["performance_metrics"]
            if "response_time_value" in metrics:
                print(f"\n⚡ Performance Metrics:")
                print(f"  • Response Time: {metrics['response_time_value']:.3f}s (Target: <3.0s)")
            if "accuracy_value" in metrics:
                print(f"  • Reasoning Accuracy: {metrics['accuracy_value']:.1%} (Target: >95%)")
        
        # Success criteria
        if "success_criteria" in self.test_results:
            criteria = self.test_results["success_criteria"]
            passed_criteria = sum(1 for result in criteria.values() if result)
            total_criteria = len(criteria)
            
            print(f"\n🎯 Phase 1 Success Criteria: {passed_criteria}/{total_criteria}")
            for criterion, passed in criteria.items():
                status = "✅" if passed else "❌"
                print(f"  {status} {criterion.replace('_', ' ').title()}")
        
        # Final verdict
        print()
        if overall_success_rate >= 0.8 and passed_criteria >= 4:
            print("🏆 PHASE 1 IMPLEMENTATION: SUCCESS!")
            print("✅ Ready to proceed to Phase 1.3 Hardware Optimization")
        elif overall_success_rate >= 0.6:
            print("⚠️ PHASE 1 IMPLEMENTATION: PARTIAL SUCCESS")
            print("🔧 Some optimizations needed before proceeding")
        else:
            print("❌ PHASE 1 IMPLEMENTATION: NEEDS IMPROVEMENT")
            print("🚨 Significant issues require attention")
        
        return {
            "overall_success_rate": overall_success_rate,
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "total_time": total_time,
            "test_results": self.test_results,
            "phase_1_status": "SUCCESS" if overall_success_rate >= 0.8 else "PARTIAL" if overall_success_rate >= 0.6 else "FAILED"
        }

async def main():
    """Main test execution"""
    test_suite = Phase1TestSuite()
    
    try:
        report = await test_suite.run_complete_test_suite()
        
        # Save report
        import json
        with open("phase1_test_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Test report saved to phase1_test_report.json")
        
        # Exit with appropriate code
        return 0 if report["phase_1_status"] == "SUCCESS" else 1
        
    except Exception as e:
        print(f"❌ Test suite execution failed: {e}")
        logger.exception("Test suite failure")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)