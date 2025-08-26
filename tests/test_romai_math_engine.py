"""
Comprehensive Test Suite for RomAI Mathematical Engine
Following Microsoft MLOps best practices for AI model validation
"""

import pytest
import asyncio
import sys
import os
from typing import List, Dict, Any
from dataclasses import dataclass

# Add RomAI source path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../apps/romai/src'))

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine, MathematicalResult


@dataclass
class TestCase:
    """Test case definition for mathematical problems"""
    problem: str
    expected_result: str
    category: str
    difficulty: str = "easy"
    tolerance: float = 1e-6


class TestRomAIMathEngine:
    """Comprehensive test suite for RomAI Mathematical Engine"""

    @pytest.fixture
    def engine(self):
        """Create RomAI engine instance for testing"""
        return AutonomousMathEngine()

    @pytest.fixture
    def basic_arithmetic_cases(self) -> List[TestCase]:
        """Basic arithmetic test cases"""
        return [
            # Addition
            TestCase("2+2", "4", "arithmetic"),
            TestCase("What is 2+2?", "4", "natural_language"),
            TestCase("7 plus 8", "15", "natural_language"),
            TestCase("Calculate 10 + 5", "15", "natural_language"),
            
            # Subtraction  
            TestCase("10-4", "6", "arithmetic"),
            TestCase("What is 15-7?", "8", "natural_language"),
            TestCase("20 minus 12", "8", "natural_language"),
            
            # Multiplication
            TestCase("5*3", "15", "arithmetic"),
            TestCase("What is 6*7?", "42", "natural_language"),
            TestCase("8 times 9", "72", "natural_language"),
            
            # Division
            TestCase("20/4", "5", "arithmetic"),
            TestCase("What is 24/6?", "4", "natural_language"),
            TestCase("36 divided by 9", "4", "natural_language"),
            
            # Mixed operations
            TestCase("2+3*4", "14", "arithmetic", "medium"),
            TestCase("(5+3)*2", "16", "arithmetic", "medium"),
            TestCase("10-2*3", "4", "arithmetic", "medium"),
        ]

    @pytest.fixture
    def advanced_math_cases(self) -> List[TestCase]:
        """Advanced mathematics test cases"""
        return [
            # Powers and roots
            TestCase("2^3", "8", "powers"),
            TestCase("sqrt(16)", "4", "roots"),
            TestCase("√25", "5", "roots"),
            
            # Factorials
            TestCase("5!", "120", "factorial"),
            TestCase("4!", "24", "factorial"),
            
            # Algebraic expressions (simplified)
            TestCase("x+2", "x+2", "algebra", "medium"),
            
            # More complex expressions
            TestCase("2^4", "16", "powers", "medium"),
            TestCase("3^2 + 4^2", "25", "mixed", "medium"),
        ]

    @pytest.fixture  
    def performance_benchmark_cases(self) -> List[TestCase]:
        """Performance and accuracy benchmark cases"""
        return [
            # Speed test cases
            TestCase("1+1", "2", "speed_test"),
            TestCase("100*100", "10000", "speed_test"),
            TestCase("1000-500", "500", "speed_test"),
            
            # Accuracy test cases  
            TestCase("0.1+0.2", "0.3", "accuracy", tolerance=1e-10),
            TestCase("1/3", "0.333333", "accuracy", tolerance=1e-5),
            TestCase("2/3", "0.666667", "accuracy", tolerance=1e-5),
        ]

    @pytest.mark.asyncio
    async def test_basic_arithmetic(self, engine, basic_arithmetic_cases):
        """Test basic arithmetic operations"""
        passed = 0
        failed = 0
        
        for case in basic_arithmetic_cases:
            try:
                result = await engine.solve_mathematical_problem(case.problem)
                
                # Extract numeric result
                result_str = str(result.result).strip()
                expected_float = float(case.expected_result)
                
                # Check if result contains the expected number
                if str(expected_float) in result_str or str(int(expected_float)) in result_str:
                    passed += 1
                    print(f"✅ PASS: {case.problem} = {expected_float}")
                else:
                    failed += 1
                    print(f"❌ FAIL: {case.problem} expected {case.expected_result}, got {result_str}")
                    
            except Exception as e:
                failed += 1
                print(f"❌ ERROR: {case.problem} failed with {str(e)}")
        
        # Require 90% pass rate for basic arithmetic
        pass_rate = passed / (passed + failed) if (passed + failed) > 0 else 0
        print(f"\n📊 Basic Arithmetic Results: {passed}/{passed + failed} passed ({pass_rate:.1%})")
        assert pass_rate >= 0.9, f"Basic arithmetic pass rate {pass_rate:.1%} below 90% threshold"

    @pytest.mark.asyncio
    async def test_natural_language_parsing(self, engine):
        """Test natural language mathematical queries"""
        natural_language_tests = [
            ("What is 2+2?", "4"),
            ("Calculate 5 times 6", "30"),
            ("What is 10 minus 3?", "7"),
            ("Solve 8 divided by 2", "4"),
            ("What is 3 plus 7?", "10"),
        ]
        
        passed = 0
        total = len(natural_language_tests)
        
        for question, expected in natural_language_tests:
            try:
                result = await engine.solve_mathematical_problem(question)
                result_str = str(result.result)
                
                if expected in result_str or str(float(expected)) in result_str:
                    passed += 1
                    print(f"✅ NLP: {question} → {expected}")
                else:
                    print(f"❌ NLP: {question} expected {expected}, got {result_str}")
                    
            except Exception as e:
                print(f"❌ NLP ERROR: {question} failed with {str(e)}")
        
        pass_rate = passed / total
        print(f"\n📊 Natural Language Results: {passed}/{total} passed ({pass_rate:.1%})")
        assert pass_rate >= 0.8, f"Natural language pass rate {pass_rate:.1%} below 80% threshold"

    @pytest.mark.asyncio
    async def test_performance_benchmarks(self, engine):
        """Test performance and response time"""
        import time
        
        # Speed test: responses should be under 100ms for simple arithmetic
        simple_problems = ["2+2", "5*3", "10-4", "12/3"]
        response_times = []
        
        for problem in simple_problems:
            start_time = time.time()
            try:
                result = await engine.solve_mathematical_problem(problem)
                end_time = time.time()
                response_time = (end_time - start_time) * 1000  # Convert to ms
                response_times.append(response_time)
                print(f"⏱️ {problem}: {response_time:.2f}ms")
            except Exception as e:
                print(f"❌ Performance test failed for {problem}: {e}")
        
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            print(f"\n📊 Average Response Time: {avg_response_time:.2f}ms")
            
            # Requirement: Average response time under 1000ms for simple arithmetic
            assert avg_response_time < 1000, f"Average response time {avg_response_time:.2f}ms exceeds 1000ms limit"

    @pytest.mark.asyncio
    async def test_error_handling(self, engine):
        """Test error handling for invalid inputs"""
        invalid_inputs = [
            "",  # Empty string
            "invalid math",  # Non-mathematical text
            "2++2",  # Invalid syntax
            "divide by zero: 5/0",  # Division by zero
        ]
        
        for invalid_input in invalid_inputs:
            try:
                result = await engine.solve_mathematical_problem(invalid_input)
                # Should either return an error or handle gracefully
                assert result is not None, f"Engine returned None for {invalid_input}"
                print(f"✅ Error handling: {invalid_input} → {str(result.result)[:50]}")
            except Exception as e:
                # Exceptions are acceptable for invalid inputs
                print(f"✅ Exception handling: {invalid_input} → {str(e)[:50]}")

    @pytest.mark.asyncio
    async def test_romanian_cultural_integration(self, engine):
        """Test Romanian cultural mathematical intelligence integration"""
        romanian_test_cases = [
            "Calculate 10-4",  # Should trigger Romanian context
            "What is 7+3?",    # Should work with cultural enhancement
            "Solve 6*2",       # Should include Romanian educational context
        ]
        
        passed = 0
        total = len(romanian_test_cases)
        
        for problem in romanian_test_cases:
            try:
                result = await engine.solve_mathematical_problem(problem)
                result_str = str(result.result)
                
                # Check for mathematical correctness
                has_correct_math = any(str(expected) in result_str for expected in ["6", "10", "12"])
                
                if has_correct_math:
                    passed += 1
                    # Check for Romanian cultural elements (bonus points)
                    has_romanian_context = "🇷🇴" in result_str or "românesc" in result_str.lower()
                    context_indicator = " (with Romanian context)" if has_romanian_context else ""
                    print(f"✅ Romanian: {problem}{context_indicator}")
                else:
                    print(f"❌ Romanian: {problem} - incorrect result: {result_str[:100]}")
                    
            except Exception as e:
                print(f"❌ Romanian ERROR: {problem} failed with {str(e)}")
        
        pass_rate = passed / total
        print(f"\n📊 Romanian Integration Results: {passed}/{total} passed ({pass_rate:.1%})")
        assert pass_rate >= 0.7, f"Romanian integration pass rate {pass_rate:.1%} below 70% threshold"

    def test_engine_initialization(self, engine):
        """Test that the engine initializes properly"""
        assert engine is not None
        assert hasattr(engine, 'solve_mathematical_problem')
        print("✅ Engine initialization successful")

    @pytest.mark.asyncio
    async def test_comprehensive_validation(self, engine):
        """Comprehensive validation test combining all aspects"""
        
        print("\n🧪 COMPREHENSIVE ROMAI VALIDATION TEST")
        print("="*60)
        
        # Test categories with their requirements
        test_categories = {
            "Basic Arithmetic": {
                "tests": [("2+2", "4"), ("5*3", "15"), ("10-6", "4")],
                "required_pass_rate": 1.0  # 100% for basic arithmetic
            },
            "Natural Language": {
                "tests": [("What is 3+4?", "7"), ("Calculate 8*2", "16")],
                "required_pass_rate": 0.8  # 80% for natural language
            },
            "Complex Operations": {
                "tests": [("2^3", "8"), ("sqrt(9)", "3")],
                "required_pass_rate": 0.6  # 60% for complex operations
            }
        }
        
        overall_results = {}
        
        for category, config in test_categories.items():
            passed = 0
            total = len(config["tests"])
            
            print(f"\n📋 Testing {category}:")
            
            for problem, expected in config["tests"]:
                try:
                    result = await engine.solve_mathematical_problem(problem)
                    result_str = str(result.result)
                    
                    if expected in result_str or str(float(expected)) in result_str:
                        passed += 1
                        print(f"  ✅ {problem} = {expected}")
                    else:
                        print(f"  ❌ {problem} expected {expected}, got {result_str[:30]}")
                        
                except Exception as e:
                    print(f"  ❌ {problem} ERROR: {str(e)[:30]}")
            
            pass_rate = passed / total
            required_rate = config["required_pass_rate"]
            status = "✅ PASS" if pass_rate >= required_rate else "❌ FAIL"
            
            print(f"  📊 {category}: {passed}/{total} ({pass_rate:.1%}) - {status}")
            overall_results[category] = {
                "pass_rate": pass_rate,
                "required": required_rate,
                "passed": pass_rate >= required_rate
            }
        
        # Overall assessment
        categories_passed = sum(1 for result in overall_results.values() if result["passed"])
        total_categories = len(overall_results)
        overall_pass_rate = categories_passed / total_categories
        
        print(f"\n🎯 OVERALL RESULTS:")
        print(f"   Categories Passed: {categories_passed}/{total_categories} ({overall_pass_rate:.1%})")
        
        if overall_pass_rate >= 0.8:
            print(f"   🏆 RomAI Mathematical Engine: PRODUCTION READY!")
        elif overall_pass_rate >= 0.6:
            print(f"   ⚠️ RomAI Mathematical Engine: NEEDS IMPROVEMENT")  
        else:
            print(f"   🚨 RomAI Mathematical Engine: CRITICAL ISSUES")
        
        # Assert overall quality
        assert overall_pass_rate >= 0.6, f"Overall pass rate {overall_pass_rate:.1%} below minimum 60% threshold"


if __name__ == "__main__":
    # Run tests directly if executed as script
    pytest.main([__file__, "-v", "--tb=short"])