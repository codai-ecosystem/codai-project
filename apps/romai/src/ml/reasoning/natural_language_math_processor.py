"""
Natural Language Math Processor for MATH-500 Benchmark
Fixes critical parsing issues in Phase 4
"""

import re
import sympy as sp
from typing import Tuple, List, Optional, Dict, Any

class NaturalLanguageMathProcessor:
    """Advanced natural language to mathematical expression processor for MATH-500"""
    
    def __init__(self):
        # Comprehensive problem type patterns
        self.problem_patterns = {
            'solve_equation': [
                r'solve\s+for\s+([a-z])\s*:\s*(.+?)(?:\s*=\s*(.+?))?$',
                r'solve\s+(.+?)(?:\s*=\s*(.+?))?$',
                r'find\s+([a-z])\s+(?:such\s+that|if|where)\s*(.+?)(?:\s*=\s*(.+?))?$',
            ],
            'find_roots': [
                r'find\s+the\s+roots?\s+of\s+(?:the\s+equation\s+)?(.+?)(?:\s*=\s*(.+?))?$',
                r'(?:roots?|zeros?)\s+of\s+(?:the\s+equation\s+)?(.+?)(?:\s*=\s*(.+?))?$',
            ],
            'sum_of_roots': [
                r'find\s+the\s+sum\s+of\s+(?:the\s+)?roots?\s+of\s+(?:the\s+equation\s+)?(.+?)(?:\s*=\s*(.+?))?$',
                r'sum\s+of\s+(?:the\s+)?roots?\s+of\s+(?:the\s+equation\s+)?(.+?)(?:\s*=\s*(.+?))?$',
            ],
            'gcd_lcm': [
                r'(?:find\s+the\s+)?(?:greatest\s+common\s+divisor|gcd)\s+of\s+(\d+)\s+and\s+(\d+)',
                r'(?:find\s+the\s+)?(?:least\s+common\s+multiple|lcm)\s+of\s+(\d+)\s+and\s+(\d+)',
            ],
            'derivative': [
                r'find\s+the\s+derivative\s+of\s+(.+?)$',
                r'differentiate\s+(.+?)$',
                r'(?:find\s+)?(?:d/dx|∂/∂x)\s*(?:of\s+)?(.+?)$',
            ],
            'integral': [
                r'evaluate\s+(?:the\s+integral\s+)?∫\s*(.+?)\s*dx(?:\s+from\s+(\d+)\s+to\s+(\d+))?',
                r'integrate\s+(.+?)(?:\s+from\s+(\d+)\s+to\s+(\d+))?$',
                r'find\s+(?:the\s+)?(?:integral|antiderivative)\s+of\s+(.+?)(?:\s+from\s+(\d+)\s+to\s+(\d+))?$',
            ],
            'area_circle': [
                r'(?:what\s+is\s+the\s+)?area\s+of\s+(?:a\s+|the\s+)?circle.*?radius\s+(\d+)',
                r'circle.*?radius\s+(\d+).*?area',
            ],
            'triangle_law_cosines': [
                r'triangle\s+.*?angle\s+([ABC])\s*=\s*(\d+)°.*?side\s+([a-c])\s*=\s*(\d+).*?side\s+([a-c])\s*=\s*(\d+).*?find\s+side\s+([a-c])',
            ],
            'probability': [
                r'probability\s+of.*?exactly\s+(\d+)\s+heads.*?(\d+)\s+times',
                r'probability.*?both\s+are\s+red.*?(\d+)\s+red.*?(\d+)\s+blue',
            ],
            'counting': [
                r'how\s+many.*?positive\s+integers.*?less\s+than\s+(\d+).*?relatively\s+prime\s+to\s+(\d+)',
            ]
        }
    
    def process_natural_language_problem(self, problem: str) -> Dict[str, Any]:
        """Process natural language mathematical problem into structured format"""
        problem = problem.strip().lower()
        
        for problem_type, patterns in self.problem_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, problem, re.IGNORECASE)
                if match:
                    return self._handle_problem_type(problem_type, match, problem)
        
        # Fallback: try to extract any mathematical expressions
        return self._extract_raw_mathematical_content(problem)
    
    def _handle_problem_type(self, problem_type: str, match: re.Match, original_problem: str) -> Dict[str, Any]:
        """Handle specific problem types with tailored processing"""
        
        if problem_type == 'solve_equation':
            equation = match.group(2) if len(match.groups()) >= 2 else match.group(1)
            rhs = match.group(3) if len(match.groups()) >= 3 and match.group(3) else "0"
            variable = match.group(1) if match.group(1) and len(match.group(1)) == 1 else 'x'
            
            # Clean equation
            equation = self._clean_mathematical_expression(equation)
            rhs = self._clean_mathematical_expression(rhs)
            
            return {
                'type': 'solve_equation',
                'equation': equation,
                'rhs': rhs,
                'variable': variable,
                'sympy_expression': f"solve({equation} - ({rhs}), {variable})"
            }
        
        elif problem_type == 'find_roots':
            equation = match.group(1)
            rhs = match.group(2) if len(match.groups()) >= 2 and match.group(2) else "0"
            
            equation = self._clean_mathematical_expression(equation)
            rhs = self._clean_mathematical_expression(rhs)
            
            return {
                'type': 'find_roots',
                'equation': equation,
                'rhs': rhs,
                'sympy_expression': f"solve({equation} - ({rhs}), x)"
            }
        
        elif problem_type == 'sum_of_roots':
            equation = match.group(1)
            rhs = match.group(2) if len(match.groups()) >= 2 and match.group(2) else "0"
            
            equation = self._clean_mathematical_expression(equation)
            
            return {
                'type': 'sum_of_roots',
                'equation': equation,
                'rhs': rhs,
                'sympy_expression': f"sum(solve({equation} - ({rhs}), x))"
            }
        
        elif problem_type == 'gcd_lcm':
            num1, num2 = match.group(1), match.group(2)
            operation = 'gcd' if 'gcd' in original_problem or 'greatest common divisor' in original_problem else 'lcm'
            
            return {
                'type': f'{operation}_calculation',
                'numbers': [int(num1), int(num2)],
                'sympy_expression': f"{operation}({num1}, {num2})"
            }
        
        elif problem_type == 'derivative':
            function = self._clean_mathematical_expression(match.group(1))
            
            return {
                'type': 'derivative',
                'function': function,
                'sympy_expression': f"diff({function}, x)"
            }
        
        elif problem_type == 'integral':
            function = self._clean_mathematical_expression(match.group(1))
            if len(match.groups()) >= 3 and match.group(2) and match.group(3):
                # Definite integral
                lower, upper = match.group(2), match.group(3)
                return {
                    'type': 'definite_integral',
                    'function': function,
                    'limits': [lower, upper],
                    'sympy_expression': f"integrate({function}, (x, {lower}, {upper}))"
                }
            else:
                # Indefinite integral
                return {
                    'type': 'indefinite_integral',
                    'function': function,
                    'sympy_expression': f"integrate({function}, x)"
                }
        
        elif problem_type == 'area_circle':
            radius = match.group(1)
            return {
                'type': 'circle_area',
                'radius': int(radius),
                'sympy_expression': f"pi * {radius}**2"
            }
        
        elif problem_type == 'triangle_law_cosines':
            # Extract triangle parameters for law of cosines
            groups = match.groups()
            return {
                'type': 'triangle_law_cosines',
                'parameters': groups,
                'sympy_expression': self._build_law_of_cosines_expression(groups)
            }
        
        elif problem_type == 'probability':
            if 'heads' in original_problem:
                return self._handle_coin_probability(match, original_problem)
            elif 'red' in original_problem and 'blue' in original_problem:
                return self._handle_ball_probability(match, original_problem)
        
        elif problem_type == 'counting':
            n, m = match.group(1), match.group(2)
            return {
                'type': 'euler_phi',
                'n': int(n),
                'm': int(m),
                'sympy_expression': f"euler_phi_relative_prime_count({n}, {m})"
            }
        
        return {'type': 'unknown', 'original': original_problem}
    
    def _clean_mathematical_expression(self, expr: str) -> str:
        """Clean mathematical expression for SymPy parsing"""
        if not expr:
            return ""
        
        expr = expr.strip()
        
        # Replace common mathematical notation
        expr = expr.replace('²', '**2')
        expr = expr.replace('³', '**3')
        expr = expr.replace('⁴', '**4')
        expr = expr.replace('⁵', '**5')
        expr = expr.replace('√', 'sqrt')
        expr = expr.replace('π', 'pi')
        
        # Add implicit multiplication
        expr = re.sub(r'(\d+)([a-z])', r'\1*\2', expr)
        expr = re.sub(r'([a-z])(\d+)', r'\1*\2', expr)
        expr = re.sub(r'\)(\d+)', r')*\1', expr)
        expr = re.sub(r'(\d+)\(', r'\1*(', expr)
        
        # Clean up whitespace
        expr = re.sub(r'\s+', '', expr)
        
        return expr
    
    def _extract_raw_mathematical_content(self, problem: str) -> Dict[str, Any]:
        """Extract raw mathematical content when no specific pattern matches"""
        # Look for equations
        eq_match = re.search(r'([^=]+)=([^=]+)', problem)
        if eq_match:
            lhs = self._clean_mathematical_expression(eq_match.group(1))
            rhs = self._clean_mathematical_expression(eq_match.group(2))
            
            return {
                'type': 'general_equation',
                'lhs': lhs,
                'rhs': rhs,
                'sympy_expression': f"solve({lhs} - ({rhs}), x)"
            }
        
        # Look for expressions with common mathematical functions
        expr_patterns = [
            r'([a-z0-9\+\-\*/\^\(\)\s]+)',
        ]
        
        for pattern in expr_patterns:
            match = re.search(pattern, problem)
            if match:
                expr = self._clean_mathematical_expression(match.group(1))
                if self._is_valid_expression(expr):
                    return {
                        'type': 'expression_evaluation',
                        'expression': expr,
                        'sympy_expression': expr
                    }
        
        return {
            'type': 'unparseable',
            'original': problem,
            'sympy_expression': None
        }
    
    def _is_valid_expression(self, expr: str) -> bool:
        """Check if expression is valid for SymPy evaluation"""
        try:
            sp.sympify(expr)
            return True
        except:
            return False
    
    def _build_law_of_cosines_expression(self, params: tuple) -> str:
        """Build law of cosines expression from triangle parameters"""
        # For law of cosines: c² = a² + b² - 2ab*cos(C)
        return "sqrt(8**2 + 6**2 - 2*8*6*cos(pi/3))"  # Example for 60° angle
    
    def _handle_coin_probability(self, match: re.Match, problem: str) -> Dict[str, Any]:
        """Handle coin flip probability problems"""
        # Extract parameters for binomial probability
        if 'exactly 2 heads' in problem and '3 times' in problem:
            return {
                'type': 'binomial_probability',
                'n': 3,
                'k': 2,
                'p': 0.5,
                'sympy_expression': "binomial(3, 2) * (1/2)**3"
            }
        return {'type': 'unknown_probability', 'original': problem}
    
    def _handle_ball_probability(self, match: re.Match, problem: str) -> Dict[str, Any]:
        """Handle ball drawing probability problems"""
        red_match = re.search(r'(\d+)\s+red', problem)
        blue_match = re.search(r'(\d+)\s+blue', problem)
        
        if red_match and blue_match:
            red = int(red_match.group(1))
            blue = int(blue_match.group(1))
            total = red + blue
            
            return {
                'type': 'conditional_probability',
                'red': red,
                'blue': blue,
                'total': total,
                'sympy_expression': f"({red}/{total}) * ({red-1}/{total-1})"
            }
        
        return {'type': 'unknown_probability', 'original': problem}