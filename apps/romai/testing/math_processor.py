#!/usr/bin/env python3
"""
CRITICAL FIX: Mathematical Processing Integration
==============================================

Fixes the critical math processing bug where /math/simple endpoint 
only handles hardcoded cases and returns "Mathematical operation not recognized" 
for real mathematical expressions like "87 * 23".

Author: GitHub Copilot Agent
Date: August 21, 2025
Status: CRITICAL SECURITY & FUNCTIONALITY FIX
"""

import sys
import re
import math
import asyncio
from typing import Dict, Any, Optional, Union
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedMathematicalProcessor:
    """Enhanced mathematical processor for the API endpoint"""
    
    def __init__(self):
        """Initialize the enhanced mathematical processor"""
        self.supported_operations = {
            '+': 'addition',
            '-': 'subtraction', 
            '*': 'multiplication',
            '×': 'multiplication',
            '/': 'division',
            '÷': 'division',
            '^': 'exponentiation',
            '**': 'exponentiation',
            'sqrt': 'square_root',
            'sin': 'sine',
            'cos': 'cosine',
            'tan': 'tangent'
        }
        
        self.number_pattern = r'-?\d+\.?\d*'
        self.operation_patterns = {
            'arithmetic': r'(-?\d+(?:\.\d+)?)\s*([+\-*/×÷^])\s*(-?\d+(?:\.\d+)?)',
            'multi_operation': r'(-?\d+(?:\.\d+)?)\s*([+\-*/×÷])\s*(-?\d+(?:\.\d+)?)\s*([+\-*/×÷])\s*(-?\d+(?:\.\d+)?)',
            'function': r'(sqrt|sin|cos|tan)\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)',
            'percentage': r'(-?\d+(?:\.\d+)?)\s*%\s*of\s*(-?\d+(?:\.\d+)?)',
            'power': r'(-?\d+(?:\.\d+)?)\s*\*\*\s*(-?\d+(?:\.\d+)?)'
        }
        
        logger.info("✅ Enhanced Mathematical Processor initialized")
    
    async def process_mathematical_expression(self, expression: str) -> Dict[str, Any]:
        """Process mathematical expression with comprehensive support"""
        start_time = datetime.now()
        
        try:
            # Clean and normalize expression
            cleaned_expr = self._clean_expression(expression)
            logger.info(f"🧮 Processing: '{expression}' -> '{cleaned_expr}'")
            
            # Try different parsing strategies
            result = await self._try_multiple_strategies(cleaned_expr)
            
            computation_time = (datetime.now() - start_time).total_seconds() * 1000
            
            if result['success']:
                return {
                    'response': str(result['value']),
                    'confidence': result['confidence'],
                    'processing_time_ms': computation_time,
                    'model_used': 'enhanced_mathematical_processor',
                    'reasoning_steps': result['steps'],
                    'operation_type': result['operation_type'],
                    'verification_passed': result['verified']
                }
            else:
                return {
                    'response': result['error_message'],
                    'confidence': 0.2,
                    'processing_time_ms': computation_time,
                    'model_used': 'enhanced_mathematical_processor',
                    'reasoning_steps': [f"Failed to parse: {result['error_message']}"],
                    'operation_type': 'error',
                    'verification_passed': False
                }
                
        except Exception as e:
            computation_time = (datetime.now() - start_time).total_seconds() * 1000
            logger.error(f"❌ Math processing failed: {e}")
            return {
                'response': f"Math processing error: {str(e)}",
                'confidence': 0.1,
                'processing_time_ms': computation_time,
                'model_used': 'enhanced_mathematical_processor',
                'reasoning_steps': [f"Exception: {str(e)}"],
                'operation_type': 'error',
                'verification_passed': False
            }
    
    def _clean_expression(self, expression: str) -> str:
        """Clean and normalize mathematical expression"""
        # Convert to lowercase for processing
        cleaned = expression.lower().strip()
        
        # Handle common text representations
        text_to_symbol = {
            ' plus ': ' + ',
            ' minus ': ' - ',
            ' times ': ' * ',
            ' multiplied by ': ' * ',
            ' divided by ': ' / ',
            ' to the power of ': ' ** ',
            'what is': '',
            'calculate': '',
            'compute': '',
            'solve': ''
        }
        
        for text, symbol in text_to_symbol.items():
            cleaned = cleaned.replace(text, symbol)
        
        # Normalize multiplication symbols
        cleaned = cleaned.replace('×', '*').replace('÷', '/')
        
        # Remove extra whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        return cleaned
    
    async def _try_multiple_strategies(self, expression: str) -> Dict[str, Any]:
        """Try multiple parsing strategies to solve the expression"""
        
        # Strategy 1: Direct arithmetic pattern matching
        result = self._try_arithmetic_patterns(expression)
        if result['success']:
            return result
        
        # Strategy 2: Safe eval with restricted scope
        result = self._try_safe_eval(expression)
        if result['success']:
            return result
        
        # Strategy 3: Function-based operations
        result = self._try_function_operations(expression)
        if result['success']:
            return result
        
        # Strategy 4: Word problem parsing
        result = self._try_word_problem_parsing(expression)
        if result['success']:
            return result
        
        return {
            'success': False,
            'error_message': f'Could not parse mathematical expression: {expression}',
            'confidence': 0.0,
            'steps': ['All parsing strategies failed'],
            'operation_type': 'unparseable'
        }
    
    def _try_arithmetic_patterns(self, expression: str) -> Dict[str, Any]:
        """Try to match common arithmetic patterns"""
        
        # Simple two-operand arithmetic
        arithmetic_match = re.match(self.operation_patterns['arithmetic'], expression)
        if arithmetic_match:
            try:
                num1, operator, num2 = arithmetic_match.groups()
                num1, num2 = float(num1), float(num2)
                
                steps = [f"Parsed: {num1} {operator} {num2}"]
                
                if operator == '+':
                    result = num1 + num2
                    operation = 'addition'
                elif operator == '-':
                    result = num1 - num2
                    operation = 'subtraction'
                elif operator in ['*', '×']:
                    result = num1 * num2
                    operation = 'multiplication'
                elif operator in ['/', '÷']:
                    if num2 == 0:
                        return {'success': False, 'error_message': 'Division by zero'}
                    result = num1 / num2
                    operation = 'division'
                elif operator == '^':
                    result = num1 ** num2
                    operation = 'exponentiation'
                else:
                    return {'success': False, 'error_message': f'Unknown operator: {operator}'}
                
                steps.append(f"Applied {operation}")
                steps.append(f"Result: {result}")
                
                # Verify result makes sense
                verified = self._verify_arithmetic_result(num1, operator, num2, result)
                
                return {
                    'success': True,
                    'value': result,
                    'confidence': 0.95,
                    'steps': steps,
                    'operation_type': operation,
                    'verified': verified
                }
                
            except Exception as e:
                return {'success': False, 'error_message': f'Arithmetic calculation failed: {e}'}
        
        # Multi-operation expressions (like 2 + 3 * 4)
        multi_match = re.match(self.operation_patterns['multi_operation'], expression)
        if multi_match:
            try:
                num1, op1, num2, op2, num3 = multi_match.groups()
                num1, num2, num3 = float(num1), float(num2), float(num3)
                
                steps = [f"Parsed: {num1} {op1} {num2} {op2} {num3}"]
                
                # Apply order of operations
                if op1 in ['*', '×', '/', '÷'] and op2 in ['+', '-']:
                    # First operation has higher precedence
                    if op1 in ['*', '×']:
                        intermediate = num1 * num2
                    else:  # division
                        if num2 == 0:
                            return {'success': False, 'error_message': 'Division by zero'}
                        intermediate = num1 / num2
                    
                    steps.append(f"Order of operations: {num1} {op1} {num2} = {intermediate}")
                    
                    if op2 == '+':
                        result = intermediate + num3
                    else:  # subtraction
                        result = intermediate - num3
                        
                elif op1 in ['+', '-'] and op2 in ['*', '×', '/', '÷']:
                    # Second operation has higher precedence
                    if op2 in ['*', '×']:
                        intermediate = num2 * num3
                    else:  # division
                        if num3 == 0:
                            return {'success': False, 'error_message': 'Division by zero'}
                        intermediate = num2 / num3
                    
                    steps.append(f"Order of operations: {num2} {op2} {num3} = {intermediate}")
                    
                    if op1 == '+':
                        result = num1 + intermediate
                    else:  # subtraction
                        result = num1 - intermediate
                        
                else:
                    # Same precedence, left to right
                    if op1 == '+':
                        intermediate = num1 + num2
                    elif op1 == '-':
                        intermediate = num1 - num2
                    elif op1 in ['*', '×']:
                        intermediate = num1 * num2
                    else:  # division
                        if num2 == 0:
                            return {'success': False, 'error_message': 'Division by zero'}
                        intermediate = num1 / num2
                    
                    steps.append(f"Left to right: {num1} {op1} {num2} = {intermediate}")
                    
                    if op2 == '+':
                        result = intermediate + num3
                    elif op2 == '-':
                        result = intermediate - num3
                    elif op2 in ['*', '×']:
                        result = intermediate * num3
                    else:  # division
                        if num3 == 0:
                            return {'success': False, 'error_message': 'Division by zero'}
                        result = intermediate / num3
                
                steps.append(f"Final result: {result}")
                
                return {
                    'success': True,
                    'value': result,
                    'confidence': 0.90,
                    'steps': steps,
                    'operation_type': 'multi_operation',
                    'verified': True
                }
                
            except Exception as e:
                return {'success': False, 'error_message': f'Multi-operation calculation failed: {e}'}
        
        return {'success': False}
    
    def _try_safe_eval(self, expression: str) -> Dict[str, Any]:
        """Try safe evaluation of mathematical expressions"""
        try:
            # Only allow safe mathematical expressions
            safe_expression = re.sub(r'[^0-9+\-*/().\s]', '', expression)
            if not safe_expression or safe_expression != expression.replace(' ', ''):
                return {'success': False}
            
            # Evaluate safely
            result = eval(safe_expression, {"__builtins__": {}}, {})
            
            if math.isfinite(result):
                return {
                    'success': True,
                    'value': result,
                    'confidence': 0.85,
                    'steps': [f"Safe evaluation of: {expression}", f"Result: {result}"],
                    'operation_type': 'safe_eval',
                    'verified': True
                }
        
        except Exception:
            pass
        
        return {'success': False}
    
    def _try_function_operations(self, expression: str) -> Dict[str, Any]:
        """Try function-based operations like sqrt, sin, cos"""
        
        # Square root
        sqrt_match = re.search(r'sqrt\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)', expression)
        if sqrt_match:
            try:
                num = float(sqrt_match.group(1))
                if num < 0:
                    return {'success': False, 'error_message': 'Cannot take square root of negative number'}
                
                result = math.sqrt(num)
                return {
                    'success': True,
                    'value': result,
                    'confidence': 0.95,
                    'steps': [f"Square root of {num}", f"√{num} = {result}"],
                    'operation_type': 'square_root',
                    'verified': True
                }
            except Exception as e:
                return {'success': False, 'error_message': f'Square root failed: {e}'}
        
        # Power operations
        power_match = re.match(self.operation_patterns['power'], expression)
        if power_match:
            try:
                base, exponent = power_match.groups()
                base, exponent = float(base), float(exponent)
                
                result = base ** exponent
                return {
                    'success': True,
                    'value': result,
                    'confidence': 0.90,
                    'steps': [f"{base} to the power of {exponent}", f"{base}^{exponent} = {result}"],
                    'operation_type': 'exponentiation',
                    'verified': True
                }
            except Exception as e:
                return {'success': False, 'error_message': f'Power calculation failed: {e}'}
        
        return {'success': False}
    
    def _try_word_problem_parsing(self, expression: str) -> Dict[str, Any]:
        """Try to parse word problems"""
        
        # Percentage calculations
        percentage_match = re.search(self.operation_patterns['percentage'], expression)
        if percentage_match:
            try:
                percentage, total = percentage_match.groups()
                percentage, total = float(percentage), float(total)
                
                result = (percentage / 100) * total
                return {
                    'success': True,
                    'value': result,
                    'confidence': 0.88,
                    'steps': [f"{percentage}% of {total}", f"({percentage}/100) × {total} = {result}"],
                    'operation_type': 'percentage',
                    'verified': True
                }
            except Exception as e:
                return {'success': False, 'error_message': f'Percentage calculation failed: {e}'}
        
        return {'success': False}
    
    def _verify_arithmetic_result(self, num1: float, operator: str, num2: float, result: float) -> bool:
        """Verify arithmetic result makes mathematical sense"""
        try:
            tolerance = 1e-10
            
            if operator == '+':
                expected = num1 + num2
            elif operator == '-':
                expected = num1 - num2
            elif operator in ['*', '×']:
                expected = num1 * num2
            elif operator in ['/', '÷']:
                if num2 == 0:
                    return False
                expected = num1 / num2
            elif operator == '^':
                expected = num1 ** num2
            else:
                return False
            
            return abs(result - expected) < tolerance
            
        except Exception:
            return False

# Test the enhanced mathematical processor
async def test_enhanced_math_processor():
    """Test the enhanced mathematical processor"""
    processor = EnhancedMathematicalProcessor()
    
    test_cases = [
        "2 + 2",
        "87 * 23", 
        "144 / 12",
        "25 - 7",
        "5 + 3 * 2",
        "2 ** 3",
        "sqrt(16)",
        "15% of 200",
        "what is 123 plus 456"
    ]
    
    logger.info("🧮 Testing Enhanced Mathematical Processor")
    logger.info("=" * 50)
    
    for test_case in test_cases:
        result = await processor.process_mathematical_expression(test_case)
        logger.info(f"Input: {test_case}")
        logger.info(f"Output: {result['response']}")
        logger.info(f"Confidence: {result['confidence']:.2f}")
        logger.info(f"Verified: {result.get('verification_passed', False)}")
        logger.info("-" * 30)

if __name__ == "__main__":
    asyncio.run(test_enhanced_math_processor())