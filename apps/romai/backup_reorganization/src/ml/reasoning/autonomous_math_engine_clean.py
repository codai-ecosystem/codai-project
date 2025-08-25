"""
🧠 RomAI AGI - Advanced Neural-Symbolic Mathematical Reasoning Engine
A hybrid system combining neural transformers with symbolic computation for mathematical problem solving.
"""

import re
import math
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import logging
from neural_math_transformer import NeuralMathematicalEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MathSolution:
    """Represents a mathematical solution with comprehensive metadata"""
    result: str
    steps: List[str]
    method: str
    confidence: float
    domain: str
    neural_enhanced: bool = False
    attention_weights: Optional[Dict[str, float]] = None

class AutonomousMathEngine:
    """Advanced Neural-Symbolic Mathematical Reasoning Engine"""
    
    def __init__(self):
        """Initialize the hybrid mathematical reasoning system"""
        logger.info("🧠 Initializing Neural-Symbolic Mathematical Engine...")
        
        try:
            # Initialize neural mathematical engine
            self.neural_engine = NeuralMathematicalEngine()
            logger.info("✅ Neural transformer engine loaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Neural engine initialization failed: {e}")
            self.neural_engine = None
    
    async def solve_mathematical_problem(self, problem: str) -> MathSolution:
        """
        Solve mathematical problems using hybrid neural-symbolic approach
        
        Args:
            problem: Mathematical problem as text
            
        Returns:
            MathSolution with comprehensive analysis
        """
        try:
            logger.info(f"🔍 Analyzing mathematical problem: {problem}")
            
            # Primary: Try neural approach first
            if self.neural_engine:
                try:
                    neural_solution = await self.neural_engine.solve_mathematical_problem(problem)
                    
                    # Verify with symbolic computation for accuracy
                    if self._requires_verification(problem, neural_solution):
                        verified_solution = self._verify_with_symbolic(problem, neural_solution)
                        if verified_solution:
                            return verified_solution
                    
                    # Return neural solution if verification not needed or passed
                    return neural_solution
                    
                except Exception as e:
                    logger.warning(f"Neural engine failed: {e}, falling back to symbolic")
            
            # Fallback: Symbolic computation
            return self._solve_symbolic(problem)
            
        except Exception as e:
            logger.error(f"Mathematical problem solving failed: {e}")
            return MathSolution(
                result=f"Error: {str(e)}",
                steps=[f"Error occurred during computation: {str(e)}"],
                method="error_handling",
                confidence=0.0,
                domain="error",
                neural_enhanced=False
            )
    
    def _requires_verification(self, problem: str, neural_solution: MathSolution) -> bool:
        """Determine if neural solution requires symbolic verification"""
        
        # Always verify arithmetic operations for accuracy
        if neural_solution.domain == 'arithmetic':
            return True
        
        # Verify if confidence is below threshold
        if neural_solution.confidence < 0.8:
            return True
        
        # Verify mathematical expressions
        if any(op in problem for op in ['√', '^', 'log', 'sin', 'cos', 'tan']):
            return True
        
        return False
    
    def _verify_with_symbolic(self, problem: str, neural_solution: MathSolution) -> Optional[MathSolution]:
        """Verify neural solution with symbolic computation"""
        
        try:
            symbolic_solution = self._solve_symbolic(problem)
            
            # Compare results
            if self._are_solutions_equivalent(neural_solution.result, symbolic_solution.result):
                # Merge the solutions - use symbolic accuracy with neural reasoning
                return self._merge_neural_symbolic_results(neural_solution, symbolic_solution)
            else:
                # Prefer symbolic for accuracy if different
                logger.warning(f"Neural-symbolic mismatch: {neural_solution.result} vs {symbolic_solution.result}")
                return symbolic_solution
                
        except Exception as e:
            logger.warning(f"Symbolic verification failed: {e}")
            return None
    
    def _merge_neural_symbolic_results(self, neural: MathSolution, symbolic: MathSolution) -> MathSolution:
        """Merge neural and symbolic solutions optimally"""
        
        # Combine steps for comprehensive explanation
        merged_steps = neural.steps + ["--- Symbolic Verification ---"] + symbolic.steps
        
        return MathSolution(
            result=symbolic.result,  # Use symbolic for accuracy
            steps=merged_steps,
            method="hybrid_neural_symbolic_verified",
            confidence=min(0.95, neural.confidence + 0.1),  # Boost confidence
            domain=neural.domain,
            neural_enhanced=True,
            attention_weights=neural.attention_weights
        )
    
    def _are_solutions_equivalent(self, result1: str, result2: str, tolerance: float = 1e-6) -> bool:
        """Check if two mathematical results are equivalent"""
        
        try:
            # Extract numeric values
            num1 = self._extract_numeric_value(result1)
            num2 = self._extract_numeric_value(result2)
            
            if num1 is not None and num2 is not None:
                return abs(num1 - num2) < tolerance
            
            # String comparison for non-numeric results
            return result1.strip() == result2.strip()
            
        except Exception:
            return False
    
    def _extract_numeric_value(self, result: str) -> Optional[float]:
        """Extract numeric value from result string"""
        
        try:
            # Remove common mathematical text
            clean_result = re.sub(r'[^\d\.\-\+eE]', '', result)
            if clean_result:
                return float(clean_result)
        except Exception:
            pass
        
        return None
    
    def _solve_symbolic(self, problem: str) -> MathSolution:
        """Fallback symbolic mathematical computation"""
        
        logger.info(f"🔢 Using symbolic computation for: {problem}")
        
        try:
            # Basic arithmetic detection and solving
            if self._is_arithmetic_problem(problem):
                return self._solve_arithmetic(problem)
            
            # Algebraic expressions
            elif self._is_algebraic_problem(problem):
                return self._solve_algebra(problem)
            
            # Calculus problems
            elif self._is_calculus_problem(problem):
                return self._solve_calculus(problem)
            
            # Geometry problems
            elif self._is_geometry_problem(problem):
                return self._solve_geometry(problem)
            
            # Statistics problems
            elif self._is_statistics_problem(problem):
                return self._solve_statistics(problem)
            
            else:
                return self._solve_general_math(problem)
                
        except Exception as e:
            return MathSolution(
                result=f"Symbolic computation error: {str(e)}",
                steps=[f"Error in symbolic computation: {str(e)}"],
                method="symbolic_error",
                confidence=0.0,
                domain="error",
                neural_enhanced=False
            )
    
    def _is_arithmetic_problem(self, problem: str) -> bool:
        """Check if problem is basic arithmetic"""
        return bool(re.search(r'[\+\-\*\/\(\)\d\s]+$', problem.replace('√', '').replace('^', '')))
    
    def _is_algebraic_problem(self, problem: str) -> bool:
        """Check if problem involves algebra"""
        return bool(re.search(r'[a-zA-Z]', problem)) and any(op in problem for op in ['=', 'x', 'y', 'solve'])
    
    def _is_calculus_problem(self, problem: str) -> bool:
        """Check if problem involves calculus"""
        return any(term in problem.lower() for term in ['derivative', 'integral', 'limit', 'dx', 'dy'])
    
    def _is_geometry_problem(self, problem: str) -> bool:
        """Check if problem involves geometry"""
        return any(term in problem.lower() for term in ['area', 'perimeter', 'volume', 'triangle', 'circle', 'rectangle'])
    
    def _is_statistics_problem(self, problem: str) -> bool:
        """Check if problem involves statistics"""
        return any(term in problem.lower() for term in ['mean', 'median', 'mode', 'standard deviation', 'probability'])
    
    def _solve_arithmetic(self, problem: str) -> MathSolution:
        """Solve basic arithmetic problems"""
        
        try:
            # Handle square roots
            if '√' in problem:
                # Extract number after √
                match = re.search(r'√(\d+)', problem)
                if match:
                    number = int(match.group(1))
                    result = math.sqrt(number)
                    
                    return MathSolution(
                        result=str(result),
                        steps=[
                            f"Identifying square root problem: √{number}",
                            f"Computing √{number} = {result}"
                        ],
                        method="symbolic_arithmetic",
                        confidence=0.95,
                        domain="arithmetic",
                        neural_enhanced=False
                    )
            
            # Basic arithmetic evaluation
            # Clean and evaluate the expression safely
            clean_expr = re.sub(r'[^0-9+\-*/().\s]', '', problem)
            if clean_expr:
                result = eval(clean_expr)  # Note: In production, use safer evaluation
                
                return MathSolution(
                    result=str(result),
                    steps=[
                        f"Parsing expression: {clean_expr}",
                        f"Evaluating: {clean_expr} = {result}"
                    ],
                    method="symbolic_arithmetic",
                    confidence=0.90,
                    domain="arithmetic",
                    neural_enhanced=False
                )
            
            return MathSolution(
                result="Could not parse arithmetic expression",
                steps=[f"Unable to parse: {problem}"],
                method="symbolic_arithmetic_failed",
                confidence=0.0,
                domain="arithmetic",
                neural_enhanced=False
            )
            
        except Exception as e:
            return MathSolution(
                result=f"Arithmetic error: {str(e)}",
                steps=[f"Error in arithmetic computation: {str(e)}"],
                method="symbolic_arithmetic_error",
                confidence=0.0,
                domain="arithmetic",
                neural_enhanced=False
            )
    
    def _solve_algebra(self, problem: str) -> MathSolution:
        """Solve algebraic problems"""
        
        return MathSolution(
            result="Algebraic solving not fully implemented in symbolic mode",
            steps=["This requires neural reasoning or computer algebra system"],
            method="symbolic_algebra_placeholder",
            confidence=0.3,
            domain="algebra",
            neural_enhanced=False
        )
    
    def _solve_calculus(self, problem: str) -> MathSolution:
        """Solve calculus problems"""
        
        return MathSolution(
            result="Calculus solving requires advanced symbolic computation",
            steps=["This needs neural reasoning or specialized calculus engine"],
            method="symbolic_calculus_placeholder", 
            confidence=0.2,
            domain="calculus",
            neural_enhanced=False
        )
    
    def _solve_geometry(self, problem: str) -> MathSolution:
        """Solve geometry problems"""
        
        return MathSolution(
            result="Geometry solving requires spatial reasoning",
            steps=["This needs neural geometric reasoning"],
            method="symbolic_geometry_placeholder",
            confidence=0.2,
            domain="geometry", 
            neural_enhanced=False
        )
    
    def _solve_statistics(self, problem: str) -> MathSolution:
        """Solve statistics problems"""
        
        return MathSolution(
            result="Statistics solving requires data analysis",
            steps=["This needs statistical reasoning engine"],
            method="symbolic_statistics_placeholder",
            confidence=0.2,
            domain="statistics",
            neural_enhanced=False
        )
    
    def _solve_general_math(self, problem: str) -> MathSolution:
        """Handle general mathematical problems"""
        
        return MathSolution(
            result=f"General math problem requires advanced reasoning: {problem}",
            steps=[
                "Problem categorization: General mathematics",
                "This problem requires neural mathematical reasoning",
                "Consider using the neural engine for better results"
            ],
            method="symbolic_general_placeholder",
            confidence=0.1,
            domain="general",
            neural_enhanced=False
        )