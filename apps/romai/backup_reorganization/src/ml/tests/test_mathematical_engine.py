"""
Unit Tests for RomAI Mathematical Engine
Focused testing of mathematical reasoning capabilities
"""

import pytest
import asyncio
import sys
import os
from datetime import datetime

# Add RomAI paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from reasoning.autonomous_math_engine import AutonomousMathEngine

class TestMathematicalEngine:
    """Unit tests for mathematical reasoning engine"""
    
    @pytest.fixture
    def engine(self):
        """Create mathematical engine instance"""
        return AutonomousMathEngine()
    
    @pytest.mark.asyncio
    async def test_basic_addition(self, engine):
        """Test basic addition operations"""
        result = await engine.solve_mathematical_problem("2 + 2")
        expected = 4
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_basic_subtraction(self, engine):
        """Test basic subtraction operations"""
        result = await engine.solve_mathematical_problem("10 - 3")
        expected = 7
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_basic_multiplication(self, engine):
        """Test basic multiplication operations"""
        result = await engine.solve_mathematical_problem("6 * 7")
        expected = 42
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_basic_division(self, engine):
        """Test basic division operations"""
        result = await engine.solve_mathematical_problem("84 / 12")
        expected = 7
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_square_root(self, engine):
        """Test square root calculations"""
        result = await engine.solve_mathematical_problem("√144")
        expected = 12
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_power_operations(self, engine):
        """Test power operations"""
        result = await engine.solve_mathematical_problem("2^3")
        expected = 8
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_algebraic_equation(self, engine):
        """Test solving algebraic equations"""
        result = await engine.solve_mathematical_problem("solve x: 2x + 3 = 11")
        expected = 4
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_derivative_calculation(self, engine):
        """Test calculus derivative calculations"""
        result = await engine.solve_mathematical_problem("derivative of x^2")
        
        if hasattr(result, 'result'):
            actual = str(result.result)
        else:
            actual = str(result)
        
        # Check if result contains expected derivative form
        assert "2*x" in actual or "2x" in actual, f"Expected derivative form, got {actual}"
    
    @pytest.mark.asyncio
    async def test_geometric_area(self, engine):
        """Test geometric area calculations"""
        result = await engine.solve_mathematical_problem("area of circle with radius 5")
        expected = 78.54  # π * 5^2 ≈ 78.54
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 5.0, f"Expected ~{expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_statistical_mean(self, engine):
        """Test statistical calculations"""
        result = await engine.solve_mathematical_problem("mean of [1, 2, 3, 4, 5]")
        expected = 3
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"
    
    @pytest.mark.asyncio
    async def test_performance_multiple_operations(self, engine):
        """Test performance with multiple rapid operations"""
        start_time = datetime.now()
        
        problems = ["2 + 2", "√16", "3 * 4", "15 - 7", "24 / 6"]
        
        for problem in problems:
            result = await engine.solve_mathematical_problem(problem)
            assert result is not None, f"Failed to solve {problem}"
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Should complete 5 operations in under 5 seconds
        assert duration < 5.0, f"Performance test failed: took {duration:.2f}s for 5 operations"
    
    @pytest.mark.asyncio
    async def test_error_handling_invalid_input(self, engine):
        """Test error handling for invalid mathematical input"""
        try:
            result = await engine.solve_mathematical_problem("invalid math expression xyz")
            # Should either return an error result or raise an exception
            if hasattr(result, 'error'):
                assert result.error is not None
            elif hasattr(result, 'result'):
                # If it returns a result, it should indicate an error
                assert 'error' in str(result.result).lower() or 'invalid' in str(result.result).lower()
        except Exception as e:
            # It's acceptable to raise an exception for invalid input
            assert True
    
    @pytest.mark.asyncio
    async def test_complex_expression(self, engine):
        """Test complex mathematical expressions"""
        result = await engine.solve_mathematical_problem("(3 + 4) * 2 - 1")
        expected = 13  # (3 + 4) * 2 - 1 = 7 * 2 - 1 = 14 - 1 = 13
        
        if hasattr(result, 'result'):
            actual = float(result.result)
        else:
            actual = float(result)
        
        assert abs(actual - expected) < 0.1, f"Expected {expected}, got {actual}"

if __name__ == "__main__":
    # Run specific tests
    pytest.main([__file__, "-v"])