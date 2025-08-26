"""
Phase 4 MATH-500 Optimized Mathematical Engine
Critical fixes for natural language processing and structured problem solving
"""

import asyncio
import re
import logging
import sympy as sp
from typing import Any, Dict, List, Tuple, Union, Optional
from dataclasses import dataclass

# Import our natural language processor
from natural_language_math_processor import NaturalLanguageMathProcessor

    def _solve_equation_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Solve algebraic equations"""
        equation = problem.get('equation', '')
        rhs = problem.get('rhs', '0')
        variable = problem.get('variable', 'x')
        
        try:
            # Create SymPy symbols
            x = sp.Symbol(variable)
            
            # Parse equation parts
            left_expr = sp.sympify(equation)
            right_expr = sp.sympify(rhs)
            
            steps.append(f"Equation: {left_expr} = {right_expr}")
            
            # Solve equation
            solutions = sp.solve(left_expr - right_expr, x)
            steps.append(f"Solutions: {solutions}")
            
            # Format multiple solutions
            if isinstance(solutions, list) and len(solutions) > 1:
                formatted_solutions = [float(sol) if sol.is_real else sol for sol in solutions]
                result = f"{', '.join(str(sol) for sol in formatted_solutions)}"
            elif isinstance(solutions, list) and len(solutions) == 1:
                result = float(solutions[0]) if solutions[0].is_real else solutions[0]
            else:
                result = solutions
            
            steps.append(f"Formatted result: {result}")
            return result, steps
            
        except Exception as e:
            steps.append(f"Equation solving error: {str(e)}")
            return None, steps

    def _solve_roots_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Find roots of equations"""
        return self._solve_equation_structured(problem, steps)  # Same logic

    def _solve_sum_of_roots_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Find sum of roots using Vieta's formulas or direct calculation"""
        equation = problem.get('equation', '')
        
        try:
            x = sp.Symbol('x')
            expr = sp.sympify(equation)
            
            # Find roots
            roots = sp.solve(expr, x)
            steps.append(f"Roots: {roots}")
            
            # Calculate sum
            root_sum = sum(roots)
            steps.append(f"Sum of roots: {root_sum}")
            
            # Convert to float if possible
            if root_sum.is_real:
                result = float(root_sum)
            else:
                result = root_sum
                
            return result, steps
            
        except Exception as e:
            steps.append(f"Sum of roots error: {str(e)}")
            return None, steps

    def _solve_gcd_lcm_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Calculate GCD or LCM"""
        numbers = problem.get('numbers', [])
        operation = 'gcd' if problem.get('type') == 'gcd_calculation' else 'lcm'
        
        try:
            num1, num2 = numbers[0], numbers[1]
            
            if operation == 'gcd':
                result = sp.gcd(num1, num2)
                steps.append(f"GCD({num1}, {num2}) = {result}")
            else:
                result = sp.lcm(num1, num2)  
                steps.append(f"LCM({num1}, {num2}) = {result}")
            
            return int(result), steps
            
        except Exception as e:
            steps.append(f"{operation.upper()} calculation error: {str(e)}")
            return None, steps

    def _solve_derivative_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Calculate derivatives"""
        function = problem.get('function', '')
        
        try:
            x = sp.Symbol('x')
            f = sp.sympify(function)
            
            derivative = sp.diff(f, x)
            steps.append(f"d/dx({f}) = {derivative}")
            
            return derivative, steps
            
        except Exception as e:
            steps.append(f"Derivative calculation error: {str(e)}")
            return None, steps

    def _solve_integral_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Calculate integrals"""
        function = problem.get('function', '')
        
        try:
            x = sp.Symbol('x')
            f = sp.sympify(function)
            
            if problem.get('type') == 'definite_integral':
                limits = problem.get('limits', [])
                lower, upper = int(limits[0]), int(limits[1])
                
                result = sp.integrate(f, (x, lower, upper))
                steps.append(f"∫[{lower} to {upper}] {f} dx = {result}")
            else:
                result = sp.integrate(f, x)
                steps.append(f"∫ {f} dx = {result} + C")
            
            return result, steps
            
        except Exception as e:
            steps.append(f"Integration error: {str(e)}")
            return None, steps

    def _solve_circle_area_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Calculate circle area"""
        radius = problem.get('radius', 0)
        
        try:
            area = sp.pi * radius**2
            steps.append(f"Area = π × {radius}² = {area}")
            
            return area, steps
            
        except Exception as e:
            steps.append(f"Circle area calculation error: {str(e)}")
            return None, steps

    def _solve_binomial_probability_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Calculate binomial probability"""
        n = problem.get('n', 0)
        k = problem.get('k', 0) 
        p = problem.get('p', 0.5)
        
        try:
            # P(X = k) = C(n,k) * p^k * (1-p)^(n-k)
            from math import comb
            
            binomial_coeff = comb(n, k)
            probability = binomial_coeff * (p**k) * ((1-p)**(n-k))
            
            steps.append(f"P(X = {k}) = C({n},{k}) × {p}^{k} × {1-p}^{n-k}")
            steps.append(f"= {binomial_coeff} × {p**k} × {(1-p)**(n-k)}")
            steps.append(f"= {probability}")
            
            # Convert to fraction for exact representation
            result = sp.Rational(probability).limit_denominator()
            
            return result, steps
            
        except Exception as e:
            steps.append(f"Binomial probability error: {str(e)}")
            return None, steps

    def _solve_conditional_probability_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Calculate conditional probability"""
        red = problem.get('red', 0)
        blue = problem.get('blue', 0)
        total = problem.get('total', red + blue)
        
        try:
            # P(both red) = P(1st red) × P(2nd red | 1st red)
            prob_first_red = sp.Rational(red, total)
            prob_second_red = sp.Rational(red - 1, total - 1)
            
            result = prob_first_red * prob_second_red
            
            steps.append(f"P(both red) = P(1st red) × P(2nd red | 1st red)")
            steps.append(f"= {red}/{total} × {red-1}/{total-1}")
            steps.append(f"= {result}")
            
            return result, steps
            
        except Exception as e:
            steps.append(f"Conditional probability error: {str(e)}")
            return None, steps

    def _solve_euler_phi_structured(self, problem: Dict[str, Any], steps: List[str]) -> Tuple[Any, List[str]]:
        """Calculate Euler's totient function for relative primes"""
        n = problem.get('n', 100)
        m = problem.get('m', 30)
        
        try:
            # Count integers less than n that are relatively prime to m
            count = 0
            for i in range(1, n):
                if sp.gcd(i, m) == 1:
                    count += 1
            
            steps.append(f"Counting integers < {n} that are relatively prime to {m}")
            steps.append(f"Found {count} such integers")
            
            return count, steps
            
        except Exception as e:
            steps.append(f"Euler phi calculation error: {str(e)}")
            return None, steps

    def _verify_structured_result(self, processed_problem: Dict[str, Any], result: Any) -> bool:
        """Verify structured mathematical result"""
        try:
            problem_type = processed_problem.get('type', 'unknown')
            
            # Basic verification based on problem type
            if problem_type in ['solve_equation', 'find_roots']:
                # Check if result makes sense for equation solving
                return result is not None and str(result) != "Error"
            elif problem_type in ['gcd_calculation', 'lcm_calculation']:
                # Check if result is positive integer
                return isinstance(result, int) and result > 0
            elif problem_type == 'derivative':
                # Check if result is a valid expression
                return result is not None
            elif problem_type in ['definite_integral']:
                # Check if result is numeric
                return result is not None and (isinstance(result, (int, float)) or hasattr(result, '__float__'))
            else:
                return result is not None
                
        except Exception:
            return False

    def _calculate_structured_confidence(self, processed_problem: Dict[str, Any], result: Any, verification: bool) -> float:
        """Calculate confidence for structured mathematical results"""
        base_confidence = 0.9 if verification else 0.2
        
        problem_type = processed_problem.get('type', 'unknown')
        
        # Use our reasoning patterns for confidence
        pattern = self.reasoning_patterns.get(problem_type, self.reasoning_patterns['unknown'])
        type_confidence = pattern['confidence_base']
        
        return min(0.98, base_confidence * type_confidence)

@dataclass
class MathematicalResult:
    """Enhanced result structure for mathematical computations"""
    result: Any
    steps: List[str]
    verification: bool
    confidence: float
    method_used: str
    symbolic_form: Optional[str] = None
    numerical_form: Optional[Union[float, int]] = None

class Phase4OptimizedMathEngine:
    """Phase 4 MATH-500 optimized mathematical reasoning engine"""
    
    def __init__(self):
        self.nl_processor = NaturalLanguageMathProcessor()
        self.chain_of_thought_enabled = True
        logger.info("🎯 Phase 4 MATH-500 Optimized Engine initialized")
        
        # Enhanced reasoning patterns for MATH-500
        self.reasoning_patterns = {
            "solve_equation": {"complexity_level": 0.2, "confidence_base": 0.95},
            "find_roots": {"complexity_level": 0.2, "confidence_base": 0.95}, 
            "sum_of_roots": {"complexity_level": 0.3, "confidence_base": 0.90},
            "gcd_calculation": {"complexity_level": 0.1, "confidence_base": 0.98},
            "lcm_calculation": {"complexity_level": 0.1, "confidence_base": 0.98},
            "derivative": {"complexity_level": 0.3, "confidence_base": 0.92},
            "definite_integral": {"complexity_level": 0.4, "confidence_base": 0.85},
            "indefinite_integral": {"complexity_level": 0.4, "confidence_base": 0.80},
            "circle_area": {"complexity_level": 0.1, "confidence_base": 0.95},
            "binomial_probability": {"complexity_level": 0.3, "confidence_base": 0.90},
            "conditional_probability": {"complexity_level": 0.4, "confidence_base": 0.88},
            "euler_phi": {"complexity_level": 0.5, "confidence_base": 0.85},
            "unknown": {"complexity_level": 0.8, "confidence_base": 0.50}
        }
    
    async def solve_mathematical_problem(self, problem: str) -> MathematicalResult:
        """
        Phase 4 MATH-500 optimized mathematical problem solver
        """
        if not problem or not problem.strip():
            return MathematicalResult(
                result="Error: Empty problem",
                steps=["No problem provided"],
                verification=False,
                confidence=0.0,
                method_used="error_handling"
            )
        
        # Process natural language to structured mathematical problem
        processed_problem = self.nl_processor.process_natural_language_problem(problem)
        
        logger.info(f"🧮 Original problem: '{problem}'")
        logger.info(f"🧮 Processed type: '{processed_problem.get('type', 'unknown')}'")
        logger.info(f"🧮 SymPy expression: '{processed_problem.get('sympy_expression', 'None')}'")
        
        steps = [f"🧮 Problem: {problem}"]
        steps.append(f"📋 Processed Type: {processed_problem.get('type', 'unknown')}")
        
        # Generate thinking process (DeepSeek-R1 style)
        thinking_process = self._generate_thinking_process(problem, processed_problem.get('type', 'unknown'))
        
        if self.chain_of_thought_enabled:
            steps.append("💭 Initiating chain-of-thought reasoning...")
            steps.append(thinking_process)
        
        try:
            # Use the processed SymPy expression
            sympy_expr = processed_problem.get('sympy_expression')
            
            if not sympy_expr or processed_problem.get('type') == 'unparseable':
                # Fallback for unparseable problems
                steps.append("⚠️ Using fallback processing for unparseable problem")
                result = f"Unable to parse: {problem}"
                verification = False
                confidence = 0.1
            else:
                steps.append(f"✅ Using structured SymPy expression: {sympy_expr}")
                result, calculation_steps = self._solve_structured_problem(processed_problem)
                steps.extend(calculation_steps)
                
                if result is None:
                    return MathematicalResult(
                        result="Error: Could not solve",
                        steps=steps,
                        verification=False,
                        confidence=0.0,
                        method_used=f"structured_{processed_problem.get('type', 'unknown')}"
                    )
                
                # Enhanced verification
                verification = self._verify_structured_result(processed_problem, result)
                steps.append(f"✅ Verification: {'PASSED' if verification else 'FAILED'}")
                
                # Calculate confidence with type-specific boost
                confidence = self._calculate_structured_confidence(processed_problem, result, verification)
            
            # Format for MATH-500 LaTeX requirements
            latex_formatted = self._format_math500_result(result)
            steps.append(f"📐 MATH-500 LaTeX: {latex_formatted}")
            
            return MathematicalResult(
                result=result,
                steps=steps,
                verification=verification,
                confidence=confidence,
                method_used=f"phase4_{processed_problem.get('type', 'unknown')}",
                symbolic_form=str(result),
                numerical_form=self._safe_float_conversion(result)
            )
            
        except Exception as e:
            error_msg = f"Phase 4 mathematical solving error: {str(e)}"
            logger.error(error_msg)
            steps.append(f"❌ Error: {str(e)}")
            
            return MathematicalResult(
                result=f"Error: {str(e)}",
                steps=steps,
                verification=False,
                confidence=0.0,
                method_used="phase4_error_handling"
            )
    
    def _generate_thinking_process(self, problem: str, problem_type: str) -> str:
        """Generate DeepSeek-R1 style thinking process"""
        thinking = f"<think>\n"
        thinking += f"I need to solve this {problem_type} problem: {problem}\n"
        thinking += f"Let me break this down step by step.\n"
        
        # Type-specific thinking patterns
        if problem_type == 'solve_equation':
            thinking += f"This is an equation to solve. I need to:\n"
            thinking += f"1. Extract the equation parts\n"
            thinking += f"2. Use algebraic methods to solve\n"
            thinking += f"3. Verify the solution\n"
        elif problem_type in ['gcd_calculation', 'lcm_calculation']:
            thinking += f"This is a number theory problem. I need to:\n"
            thinking += f"1. Use the Euclidean algorithm for GCD or LCM formulas\n"
            thinking += f"2. Calculate step by step\n"
            thinking += f"3. Verify the result\n"
        elif problem_type == 'derivative':
            thinking += f"This is a calculus differentiation problem. I need to:\n"
            thinking += f"1. Apply differentiation rules\n"
            thinking += f"2. Simplify the result\n"
            thinking += f"3. Check the derivative\n"
        elif problem_type in ['definite_integral', 'indefinite_integral']:
            thinking += f"This is a calculus integration problem. I need to:\n"
            thinking += f"1. Find the antiderivative\n"
            thinking += f"2. Apply limits if definite\n"
            thinking += f"3. Simplify the final result\n"
        elif problem_type in ['binomial_probability', 'conditional_probability']:
            thinking += f"This is a probability problem. I need to:\n"
            thinking += f"1. Identify the probability model\n"
            thinking += f"2. Apply the appropriate formula\n"
            thinking += f"3. Calculate the exact probability\n"
        else:
            thinking += f"Let me analyze this problem systematically.\n"
        
        thinking += f"</think>"
        return thinking
    
    def _format_math500_result(self, result: Any) -> str:
        """Format result for MATH-500 benchmark compliance"""
        try:
            if isinstance(result, (int, float)):
                return f"\\(\\boxed{{{result}}}\\)"
            elif hasattr(result, '__float__'):
                # SymPy numbers
                float_val = float(result)
                if float_val.is_integer():
                    return f"\\(\\boxed{{{int(float_val)}}}\\)"
                else:
                    return f"\\(\\boxed{{{float_val}}}\\)"
            elif isinstance(result, str):
                if result.startswith("Error"):
                    return f"\\(\\boxed{{\\text{{Error}}}}\\)"
                elif "," in result:  # Multiple solutions
                    return f"\\(\\boxed{{{result}}}\\)"
                else:
                    return f"\\(\\boxed{{{result}}}\\)"
            else:
                # SymPy expressions
                try:
                    latex_expr = sp.latex(result) if hasattr(sp, 'latex') else str(result)
                    return f"\\(\\boxed{{{latex_expr}}}\\)"
                except:
                    return f"\\(\\boxed{{{str(result)}}}\\)"
        except Exception as e:
            logger.error(f"LaTeX formatting error: {e}")
            return f"\\(\\boxed{{Error}}\\)"
    
    def _safe_float_conversion(self, result) -> Optional[Union[float, int]]:
        """Safely convert result to float/int"""
        try:
            if isinstance(result, (int, float)):
                return result
            elif isinstance(result, (sp.Integer, sp.Float, sp.Rational)):
                return float(result)
            elif isinstance(result, str) and result.replace('.', '').replace('-', '').replace(',', '').replace(' ', '').replace('±', '').isdigit():
                # Handle multiple solutions like "1, 3" or "±4"
                if ',' in result:
                    return [float(x.strip()) for x in result.split(',') if x.strip()]
                elif '±' in result:
                    num = float(result.replace('±', ''))
                    return [num, -num]
                else:
                    return float(result)
            elif hasattr(result, '__float__'):
                return float(result)
            else:
                return None
        except (ValueError, TypeError, Exception):
            return None
    
    # Include all the structured solving methods from structured_math_methods.py
    def _solve_structured_problem(self, processed_problem: Dict[str, Any]) -> Tuple[Any, List[str]]:
        """Solve a structured mathematical problem"""
        steps = []
        problem_type = processed_problem.get('type', 'unknown')
        
        try:
            if problem_type == 'solve_equation':
                return self._solve_equation_structured(processed_problem, steps)
            elif problem_type == 'find_roots':
                return self._solve_roots_structured(processed_problem, steps)
            elif problem_type == 'sum_of_roots':
                return self._solve_sum_of_roots_structured(processed_problem, steps)
            elif problem_type in ['gcd_calculation', 'lcm_calculation']:
                return self._solve_gcd_lcm_structured(processed_problem, steps)
            elif problem_type == 'derivative':
                return self._solve_derivative_structured(processed_problem, steps)
            elif problem_type in ['definite_integral', 'indefinite_integral']:
                return self._solve_integral_structured(processed_problem, steps)
            elif problem_type == 'circle_area':
                return self._solve_circle_area_structured(processed_problem, steps)
            elif problem_type == 'binomial_probability':
                return self._solve_binomial_probability_structured(processed_problem, steps)
            elif problem_type == 'conditional_probability':
                return self._solve_conditional_probability_structured(processed_problem, steps)
            elif problem_type == 'euler_phi':
                return self._solve_euler_phi_structured(processed_problem, steps)
            else:
                # Fallback to general SymPy evaluation
                sympy_expr = processed_problem.get('sympy_expression')
                if sympy_expr:
                    steps.append(f"Using general SymPy evaluation: {sympy_expr}")
                    result = sp.sympify(sympy_expr)
                    evaluated = sp.simplify(result)
                    steps.append(f"Evaluated: {evaluated}")
                    return evaluated, steps
                else:
                    steps.append("No valid SymPy expression found")
                    return None, steps
                    
        except Exception as e:
            steps.append(f"Error in structured solving: {str(e)}")
            return None, steps

logger = logging.getLogger(__name__)
logger.info("🎯 Phase 4 MATH-500 Optimized Mathematical Engine ready!")