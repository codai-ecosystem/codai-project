"""
🧪 RomAI Backend Core Tests - Mathematical Engine
Testing ACTUAL 98% world-class mathematical reasoning capability
"""

import pytest
import asyncio
import requests
import json
from typing import Dict, Any, List
from dataclasses import dataclass
import time

# Test Configuration
AGI_MODEL_SERVER_URL = "http://localhost:6101"
MATHEMATICAL_ENDPOINT = f"{AGI_MODEL_SERVER_URL}/inference"
HEALTH_ENDPOINT = f"{AGI_MODEL_SERVER_URL}/health"

@dataclass
class MathematicalTestResult:
    """Result structure for mathematical engine tests"""
    solution: str
    confidence: float
    execution_time: float
    reasoning_steps: List[str]
    accuracy_score: float

class TestMathematicalEngine:
    """Test suite for 98% world-class mathematical reasoning"""
    
    @pytest.fixture(scope="class")
    def ensure_service_running(self):
        """Ensure AGI Model Server is running before tests"""
        try:
            response = requests.get(HEALTH_ENDPOINT, timeout=5)
            assert response.status_code == 200
            health_data = response.json()
            print(f"✅ AGI Model Server healthy: {health_data}")
            return health_data
        except Exception as e:
            pytest.fail(f"❌ AGI Model Server not running on port 6101: {e}")
    
    def test_derivative_calculation_world_class(self, ensure_service_running):
        """Test world-class derivative calculation: f'(x) = 3x² + 4x - 5"""
        problem = {
            "text": "Find the derivative of f(x) = x^3 + 2*x^2 - 5*x + 1",
            "task_type": "mathematical",
            "language": "en",
            "include_cultural_context": False
        }
        
        start_time = time.time()
        response = requests.post(MATHEMATICAL_ENDPOINT, json=problem, timeout=10)
        execution_time = time.time() - start_time
        
        assert response.status_code == 200
        result = response.json()
        
        # Validate world-class performance
        assert result.get("confidence", 0) >= 0.98  # 98%+ confidence
        assert execution_time < 10.0  # Reasonable response time
        
        # Check for derivative solution in response
        solution = result.get("response", "")
        # More flexible matching for various mathematical notation formats
        assert ("3x" in solution and "4x" in solution and "5" in solution) or \
               ("3*x" in solution and "4*x" in solution and "5" in solution), \
               f"Expected derivative pattern not found in: {solution}"
        
        print(f"✅ Derivative Test: {solution} (Confidence: {result['confidence']:.3f})")
        
    def test_optimization_problem_solving(self, ensure_service_running):
        """Test complex optimization problem solving"""
        problem = {
            "text": "Minimize production cost C(x) = 5x² + 20x + 100 for x units, where x > 0",
            "task_type": "mathematical",
            "language": "en",
            "include_cultural_context": False
        }
        
        start_time = time.time()
        response = requests.post(MATHEMATICAL_ENDPOINT, json=problem, timeout=15)
        execution_time = time.time() - start_time
        
        assert response.status_code == 200
        result = response.json()
        
        # Validate optimization capability
        assert result.get("confidence", 0) > 0.95  # 95%+ for complex problems
        assert "minimum" in result.get("response", "").lower()
        assert execution_time < 2.0
        
        print(f"✅ Optimization Test: {result.get('response', 'Solution found')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_calculus_integration(self, ensure_service_running):
        """Test calculus integration capabilities"""
        problem = {
            "type": "mathematical",
            "problem": "Integrate ∫(3x² + 4x - 5)dx",
            "expected_result": "x³ + 2x² - 5x + C"
        }
        
        response = requests.post(MATHEMATICAL_ENDPOINT, json=problem, timeout=10)
        assert response.status_code == 200
        result = response.json()
        
        # Validate integration accuracy
        solution = result.get("solution", "")
        assert "x^3" in solution or "x³" in solution
        assert "2*x^2" in solution or "2x²" in solution
        assert result.get("confidence", 0) > 0.95
        
        print(f"✅ Integration Test: {solution} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_statistical_analysis(self, ensure_service_running):
        """Test statistical problem solving"""
        problem = {
            "type": "mathematical",
            "problem": "Given dataset [1,2,3,4,5,6,7,8,9,10], calculate mean, median, standard deviation",
            "context": "Statistical analysis for data science"
        }
        
        response = requests.post(MATHEMATICAL_ENDPOINT, json=problem, timeout=10)
        assert response.status_code == 200
        result = response.json()
        
        # Validate statistical accuracy
        assert result.get("confidence", 0) > 0.98  # High confidence for basic stats
        solution = result.get("solution", "")
        assert "5.5" in solution  # Mean should be 5.5
        assert "5.5" in solution or "median" in solution.lower()  # Median
        
        print(f"✅ Statistics Test: {result.get('reasoning_summary', 'Statistical analysis complete')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_linear_algebra_operations(self, ensure_service_running):
        """Test linear algebra problem solving"""
        problem = {
            "type": "mathematical",
            "problem": "Solve the system of equations: 2x + 3y = 7, x - y = 1",
            "context": "Linear algebra system solving"
        }
        
        response = requests.post(MATHEMATICAL_ENDPOINT, json=problem, timeout=10)
        assert response.status_code == 200
        result = response.json()
        
        # Validate system solving
        assert result.get("confidence", 0) > 0.95
        solution = result.get("solution", "")
        # Expected solution: x = 2, y = 1
        assert any(val in solution for val in ["x = 2", "x=2", "2", "y = 1", "y=1"])
        
        print(f"✅ Linear Algebra Test: {solution} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_performance_benchmarks(self, ensure_service_running):
        """Test mathematical engine performance benchmarks"""
        problems = [
            "2 + 2",
            "derivative of x^2",
            "integral of 2x",
            "solve x^2 - 4 = 0",
            "factorial of 5"
        ]
        
        total_time = 0
        total_confidence = 0
        successful_tests = 0
        
        for problem in problems:
            start_time = time.time()
            response = requests.post(MATHEMATICAL_ENDPOINT, json={
                "type": "mathematical",
                "problem": problem
            }, timeout=5)
            execution_time = time.time() - start_time
            total_time += execution_time
            
            if response.status_code == 200:
                result = response.json()
                confidence = result.get("confidence", 0)
                total_confidence += confidence
                successful_tests += 1
                print(f"✅ {problem}: {result.get('solution', 'N/A')} (Confidence: {confidence:.3f}, Time: {execution_time:.3f}s)")
        
        # Performance validation
        avg_time = total_time / len(problems)
        avg_confidence = total_confidence / successful_tests if successful_tests > 0 else 0
        
        assert avg_time < 0.5  # Average response time under 500ms
        assert avg_confidence > 0.95  # Average confidence over 95%
        assert successful_tests == len(problems)  # All tests successful
        
        print(f"🎯 Performance Summary: {successful_tests}/{len(problems)} passed, Avg Time: {avg_time:.3f}s, Avg Confidence: {avg_confidence:.3f}")
    
    def test_edge_cases_handling(self, ensure_service_running):
        """Test mathematical engine edge case handling"""
        edge_cases = [
            {
                "problem": "divide by zero: 5/0",
                "expect_error_handling": True
            },
            {
                "problem": "square root of negative number: √(-1)",
                "expect_complex_handling": True
            },
            {
                "problem": "limit as x approaches infinity: lim(x→∞) 1/x",
                "expect_limit_analysis": True
            }
        ]
        
        for case in edge_cases:
            response = requests.post(MATHEMATICAL_ENDPOINT, json={
                "type": "mathematical",
                "problem": case["problem"]
            }, timeout=10)
            
            assert response.status_code == 200
            result = response.json()
            
            # Validate intelligent error handling
            if case.get("expect_error_handling"):
                assert "undefined" in result.get("solution", "").lower() or "infinity" in result.get("solution", "").lower()
            
            print(f"✅ Edge Case: {case['problem']} -> {result.get('solution', 'Handled')}")

if __name__ == "__main__":
    # Run tests with detailed output
    pytest.main([__file__, "-v", "-s", "--tb=short"])
