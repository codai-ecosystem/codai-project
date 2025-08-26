"""
Enhanced Natural Language Mathematical Expression Parser

This parser addresses the current limitation where the mathematical engine fails to parse 
natural language questions like "What is 2+2?" vs direct expressions like "2+2".

Key Improvements:
1. Comprehensive natural language parsing for mathematical questions
2. Support for complex mathematical expressions and patterns  
3. Multi-language support (English, Romanian)
4. Confidence scoring for parsing accuracy
5. Detailed reasoning chain for transparency

Performance Target: >95% accuracy on mathematical queries
"""

import re
import logging
from dataclasses import dataclass
from typing import Optional, List, Tuple

logger = logging.getLogger(__name__)

@dataclass
class ParseResult:
    """Result of mathematical expression parsing"""
    expression: str
    confidence: float
    pattern_type: str
    success: bool = True

class EnhancedMathExpressionParser:
    """
    Enhanced mathematical expression parser with comprehensive natural language support
    
    Key Improvements:
    1. Robust natural language parsing for questions like "What is 2+2?"
    2. Support for complex mathematical expressions
    3. Multi-language support (English, Romanian) 
    4. Confidence scoring for parsing accuracy
    5. Detailed reasoning chain for transparency
    """
    
    def __init__(self):
        self.confidence_threshold = 0.8
        self.initialize_patterns()
        logger.info("🔤 Enhanced Mathematical Expression Parser initialized")
    
    def initialize_patterns(self):
        """Initialize comprehensive parsing patterns"""
        
        # Natural language question patterns (highest priority)
        self.question_patterns = [
            # Basic arithmetic questions
            (r'(?i)what\s+is\s+(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "addition_question", 0.95),
            
            (r'(?i)what\s+is\s+(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}-{m.group(2)})", "subtraction_question", 0.95),
            
            (r'(?i)what\s+is\s+(-?\d+(?:\.\d+)?)\s*\*\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}*{m.group(2)})", "multiplication_question", 0.95),
            
            (r'(?i)what\s+is\s+(-?\d+(?:\.\d+)?)\s*[\/÷]\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}/{m.group(2)})", "division_question", 0.95),
            
            (r'(?i)what\s+is\s+(-?\d+(?:\.\d+)?)\s*[\^]\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}**{m.group(2)})", "power_question", 0.95),
            
            # Result of X operation Y patterns - NEW ADDITION
            (r'(?i)what\s+is\s+the\s+result\s+of\s+(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "result_addition", 0.95),
            
            (r'(?i)what\s+is\s+the\s+result\s+of\s+(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}-{m.group(2)})", "result_subtraction", 0.95),
            
            (r'(?i)what\s+is\s+the\s+result\s+of\s+(-?\d+(?:\.\d+)?)\s*\*\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}*{m.group(2)})", "result_multiplication", 0.95),
            
            (r'(?i)what\s+is\s+the\s+result\s+of\s+(-?\d+(?:\.\d+)?)\s*[\/÷]\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}/{m.group(2)})", "result_division", 0.95),
            
            (r'(?i)what\s+is\s+the\s+result\s+of\s+(-?\d+(?:\.\d+)?)\s*[\^]\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}**{m.group(2)})", "result_power", 0.95),
            
            # Calculate/solve patterns - all operations
            (r'(?i)calculate\s+(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "calculate_addition", 0.9),
            
            (r'(?i)calculate\s+(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}-{m.group(2)})", "calculate_subtraction", 0.9),
            
            (r'(?i)calculate\s+(-?\d+(?:\.\d+)?)\s*\*\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}*{m.group(2)})", "calculate_multiplication", 0.9),
            
            (r'(?i)calculate\s+(-?\d+(?:\.\d+)?)\s*[\/÷]\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}/{m.group(2)})", "calculate_division", 0.9),
            
            # Solve patterns  
            (r'(?i)solve\s+(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "solve_addition", 0.9),
            
            (r'(?i)solve\s+(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}-{m.group(2)})", "solve_subtraction", 0.9),
            
            (r'(?i)solve\s+(-?\d+(?:\.\d+)?)\s*\*\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}*{m.group(2)})", "solve_multiplication", 0.9),
            
            (r'(?i)solve\s+(-?\d+(?:\.\d+)?)\s*[\/÷]\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}/{m.group(2)})", "solve_division", 0.9),
            
            # Word-based operations
            (r'(?i)(\d+(?:\.\d+)?)\s*plus\s*(\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "plus_word", 0.85),
            
            (r'(?i)(\d+(?:\.\d+)?)\s*minus\s*(\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}-{m.group(2)})", "minus_word", 0.85),
            
            (r'(?i)(\d+(?:\.\d+)?)\s*times\s*(\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}*{m.group(2)})", "times_word", 0.85),
            
            (r'(?i)(\d+(?:\.\d+)?)\s*divided\s+by\s*(\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}/{m.group(2)})", "divided_by_word", 0.85),
            
            # Complex expressions within questions
            (r'(?i)what\s+is\s+((?:[-+]?\d+(?:\.\d+)?[\+\-\*\/\^\(\)]\s*)+[-+]?\d+(?:\.\d+)?)\s*\??', 
             lambda m: self._clean_expression(m.group(1)), "complex_question", 0.8),
        ]
        
        # Romanian language patterns
        self.romanian_patterns = [
            (r'(?i)cât\s+este\s+(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "romanian_addition", 0.9),
            
            (r'(?i)calculează\s+(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "romanian_calculate", 0.9),
             
            # Ce este patterns for all operations - NEW ADDITION
            (r'(?i)ce\s+este\s+(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "ce_este_addition", 0.95),
            
            (r'(?i)ce\s+este\s+(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}-{m.group(2)})", "ce_este_subtraction", 0.95),
            
            (r'(?i)ce\s+este\s+(-?\d+(?:\.\d+)?)\s*\*\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}*{m.group(2)})", "ce_este_multiplication", 0.95),
            
            (r'(?i)ce\s+este\s+(-?\d+(?:\.\d+)?)\s*[\/÷]\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}/{m.group(2)})", "ce_este_division", 0.95),
            
            (r'(?i)ce\s+este\s+(-?\d+(?:\.\d+)?)\s*[\^]\s*(-?\d+(?:\.\d+)?)\s*\??', 
             lambda m: f"({m.group(1)}**{m.group(2)})", "ce_este_power", 0.95),
        ]
        
        # Direct mathematical expression patterns
        self.direct_patterns = [
            # Powers and roots
            (r'^(-?\d+(?:\.\d+)?)\^(-?\d+(?:\.\d+)?)$', 
             lambda m: f"({m.group(1)}**{m.group(2)})", "power_direct", 0.95),
            
            (r'^(-?\d+(?:\.\d+)?)\*\*(-?\d+(?:\.\d+)?)$', 
             lambda m: f"({m.group(1)}**{m.group(2)})", "power_double_star", 0.95),
            
            (r'^sqrt\((-?\d+(?:\.\d+)?)\)$', 
             lambda m: f"sqrt({m.group(1)})", "sqrt_function", 0.9),
             
            (r'^√(-?\d+(?:\.\d+)?)$', 
             lambda m: f"sqrt({m.group(1)})", "sqrt_symbol", 0.9),
            
            # Basic arithmetic operations (single operations only)
            (r'^(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)$', 
             lambda m: f"({m.group(1)}+{m.group(2)})", "addition_direct", 0.9),
            
            (r'^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$', 
             lambda m: f"({m.group(1)}-{m.group(2)})", "subtraction_direct", 0.9),
            
            (r'^(-?\d+(?:\.\d+)?)\s*\*\s*(-?\d+(?:\.\d+)?)$', 
             lambda m: f"({m.group(1)}*{m.group(2)})", "multiplication_direct", 0.9),
            
            (r'^(-?\d+(?:\.\d+)?)\s*/\s*(-?\d+(?:\.\d+)?)$', 
             lambda m: f"({m.group(1)}/{m.group(2)})", "division_direct", 0.9),
        ]
        
        # Complex mathematical expression patterns  
        self.complex_patterns = [
            # Parenthesized expressions
            (r'^\(((?:[-+]?\d+(?:\.\d+)?[\+\-\*\/\^\(\)]\s*)+[-+]?\d+(?:\.\d+)?)\)$', 
             lambda m: f"({self._clean_expression(m.group(1))})", "parenthesized_complex", 0.85),
            
            # General complex expressions with proper precedence
            (r'^((?:[-+]?\d+(?:\.\d+)?[\+\-\*\/\^\(\)]\s*)+[-+]?\d+(?:\.\d+)?)$', 
             lambda m: self._clean_expression(m.group(1)), "complex_direct", 0.8),
        ]
        
    def parse_mathematical_expression(self, text: str) -> ParseResult:
        """
        Parse mathematical expression from natural language text
        
        Args:
            text: Input text containing mathematical question or expression
            
        Returns:
            ParseResult with expression, confidence, and pattern type
        """
        text = text.strip()
        logger.debug(f"🔍 Parsing mathematical expression: '{text}'")
        
        # Try patterns in order of priority and confidence
        pattern_groups = [
            ("question", self.question_patterns),
            ("romanian", self.romanian_patterns), 
            ("direct", self.direct_patterns),
            ("complex", self.complex_patterns)
        ]
        
        for group_name, patterns in pattern_groups:
            for pattern, transformer, pattern_name, confidence in patterns:
                try:
                    match = re.search(pattern, text)
                    if match:
                        expression = transformer(match)
                        logger.info(f"✅ Pattern matched: '{text}' -> '{expression}' using {pattern_name} (confidence: {confidence})")
                        return ParseResult(
                            expression=expression,
                            confidence=confidence,
                            pattern_type=group_name,
                            success=True
                        )
                except Exception as e:
                    logger.warning(f"Pattern matching error for {pattern_name}: {e}")
                    continue
        
        # Fallback: return original text with low confidence
        logger.debug(f"⚠️ No pattern matched for '{text}', using fallback")
        return ParseResult(
            expression=text,
            confidence=0.1,
            pattern_type="fallback", 
            success=False
        )
    
    def _clean_expression(self, expr: str) -> str:
        """Clean and normalize mathematical expression"""
        # Replace mathematical symbols with Python operators
        replacements = {
            '×': '*',
            '÷': '/',
            '^': '**',
            '√': 'sqrt',
        }
        
        for old, new in replacements.items():
            expr = expr.replace(old, new)
        
        # Clean whitespace around operators
        expr = re.sub(r'\s*([+\-*/^()])\s*', r'\1', expr)
        
        # Ensure parentheses for safety and precedence
        # Only wrap if it's a multi-operation expression
        if not expr.startswith('(') and any(op in expr for op in ['+', '-', '*', '/', '**']):
            expr = f"({expr})"
            
        return expr

# Test cases for validation
if __name__ == "__main__":
    parser = EnhancedMathExpressionParser()
    
    test_cases = [
        "What is 2+2?",
        "Calculate 8*2", 
        "What is the result of 15/3?",
        "Ce este 6+4?",
        "sqrt(16)",
        "(2+3)*4", 
        "What is 5^2?",
        "Solve 15/3",
        "What is 10-5?",
        "Calculate 12+8"
    ]
    
    print("🧮 Enhanced Mathematical Expression Parser - Test Results")
    print("="*65)
    
    for i, test in enumerate(test_cases, 1):
        result = parser.parse_mathematical_expression(test)
        print(f"{i:2d}. '{test}'")
        print(f"    Result: {result.expression}")
        print(f"    Confidence: {result.confidence:.2f}")
        print(f"    Pattern: {result.pattern_type}")
        print(f"    Success: {result.success}")
        print()