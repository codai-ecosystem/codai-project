"""
Advanced Word Problem Parser for Mathematical Reasoning
Based on Microsoft AI Language Processing Best Practices

This parser extracts mathematical operations from natural language word problems
and converts them into solvable mathematical expressions.
"""

import re
import logging
from typing import Dict, List, Tuple, Optional, Union
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class OperationType(Enum):
    ADDITION = "addition"
    SUBTRACTION = "subtraction"
    MULTIPLICATION = "multiplication"
    DIVISION = "division"
    MIXED = "mixed_operations"

@dataclass
class ParsedOperation:
    """Represents a parsed mathematical operation from natural language"""
    operation_type: OperationType
    numbers: List[Union[int, float]]
    operations: List[str]
    expression: str
    reasoning_steps: List[str]
    confidence: float

class WordProblemParser:
    """
    Advanced parser for mathematical word problems using Microsoft NLP best practices
    """
    
    def __init__(self):
        self.number_patterns = self._build_number_patterns()
        self.operation_patterns = self._build_operation_patterns()
        self.word_to_number = self._build_word_to_number_mapping()
        
    def _build_number_patterns(self) -> Dict[str, str]:
        """Build patterns to extract numbers from text"""
        return {
            'digits': r'\b\d+(?:\.\d+)?\b',
            'written_numbers': r'\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)\b',
            'ordinals': r'\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b'
        }
    
    def _build_operation_patterns(self) -> Dict[str, Dict]:
        """Build patterns to identify mathematical operations"""
        return {
            'addition': {
                'patterns': [
                    r'\badd(?:ed|s|ing)?\b',
                    r'\bplus\b',
                    r'\band\b.*\bmore\b',
                    r'\bbuy\b.*\bmore\b',
                    r'\bgain(?:ed|s)?\b',
                    r'\bincrease(?:d|s)?\b',
                    r'\btotal\b',
                    r'\bsum\b',
                    r'\bcombine(?:d|s)?\b',
                    r'\+',  # Literal plus symbol
                    r'＋'   # Unicode plus symbol
                ],
                'symbol': '+'
            },
            'subtraction': {
                'patterns': [
                    r'\bsubtract(?:ed|s|ing)?\b',
                    r'\bminus\b',
                    r'\btake(?:n)?\s+away\b',
                    r'\bgive(?:n)?\s+away\b',
                    r'\bremove(?:d|s)?\b',
                    r'\blose(?:s|t)?\b',
                    r'\bspend(?:s|t)?\b',
                    r'\bdecrease(?:d|s)?\b',
                    r'\bless\b',
                    r'\bhow\s+many\s+(?:are\s+)?left\b',
                    r'-',   # Literal minus symbol
                    r'−'    # Unicode minus symbol
                ],
                'symbol': '-'
            },
            'multiplication': {
                'patterns': [
                    r'\bmultipli(?:ed|es|y)\b',
                    r'\btimes\b',
                    r'\bof\b.*\beach\b',
                    r'\bper\b',
                    r'\beach\b.*\bhas\b',
                    r'\bdouble(?:d|s)?\b',
                    r'\btriple(?:d|s)?\b',
                    r'\*',  # Literal * symbol
                    r'×',   # Multiplication symbol
                    r'\bx\b'  # X as multiplication (common in simple problems)
                ],
                'symbol': '*'
            },
            'division': {
                'patterns': [
                    r'\bdivid(?:ed|es|e)\b',
                    r'\bsplit(?:s)?\b',
                    r'\bshare(?:d|s)?\b',
                    r'\bdistribut(?:ed|es|e)\b',
                    r'/',   # Literal division symbol
                    r'÷',   # Division symbol
                    r'\bover\b',  # "8 over 4" meaning 8/4
                    r'\bper\b.*\bgroup\b',
                    r'\bhalf\b',
                    r'\bequal(?:ly)?\s+parts?\b'
                ],
                'symbol': '/'
            }
        }
    
    def _build_word_to_number_mapping(self) -> Dict[str, int]:
        """Build mapping from word numbers to digits"""
        return {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
            'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
            'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
            'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000
        }
    
    def extract_numbers(self, text: str) -> List[Union[int, float]]:
        """Extract all numbers from text (both digits and written words)"""
        numbers = []
        
        # Extract digit numbers
        digit_matches = re.finditer(self.number_patterns['digits'], text, re.IGNORECASE)
        for match in digit_matches:
            try:
                num_str = match.group()
                if '.' in num_str:
                    numbers.append(float(num_str))
                else:
                    numbers.append(int(num_str))
            except ValueError:
                continue
        
        # Extract written numbers
        word_matches = re.finditer(self.number_patterns['written_numbers'], text, re.IGNORECASE)
        for match in word_matches:
            word = match.group().lower()
            if word in self.word_to_number:
                numbers.append(self.word_to_number[word])
        
        return numbers
    
    def identify_operations(self, text: str) -> List[Tuple[str, str]]:
        """Identify mathematical operations in text"""
        operations = []
        
        for operation_name, operation_data in self.operation_patterns.items():
            for pattern in operation_data['patterns']:
                if re.search(pattern, text, re.IGNORECASE):
                    operations.append((operation_name, operation_data['symbol']))
                    break  # Only count each operation type once
        
        return operations
    
    def parse_word_problem(self, problem: str) -> ParsedOperation:
        """
        Parse a mathematical word problem into a structured mathematical expression
        """
        logger.info(f"📝 Parsing word problem: '{problem}'")
        
        # Clean the input
        problem = problem.strip().lower()
        
        # Extract numbers
        numbers = self.extract_numbers(problem)
        logger.info(f"🔢 Extracted numbers: {numbers}")
        
        # Identify operations
        operations = self.identify_operations(problem)
        logger.info(f"⚙️ Identified operations: {operations}")
        
        if not numbers:
            return ParsedOperation(
                operation_type=OperationType.MIXED,
                numbers=[],
                operations=[],
                expression="",
                reasoning_steps=["❌ No numbers found in the problem"],
                confidence=0.0
            )
        
        # Build reasoning steps and expression
        reasoning_steps = []
        reasoning_steps.append(f"📋 Problem: {problem}")
        reasoning_steps.append(f"🔢 Numbers found: {numbers}")
        
        # Handle specific word problem patterns
        expression, operation_type, additional_steps = self._build_expression_from_context(
            problem, numbers, operations
        )
        reasoning_steps.extend(additional_steps)
        
        # Calculate confidence based on parsing success
        confidence = self._calculate_confidence(numbers, operations, expression)
        
        return ParsedOperation(
            operation_type=operation_type,
            numbers=numbers,
            operations=[op[1] for op in operations],
            expression=expression,
            reasoning_steps=reasoning_steps,
            confidence=confidence
        )
    
    def _build_expression_from_context(
        self, 
        problem: str, 
        numbers: List[Union[int, float]], 
        operations: List[Tuple[str, str]]
    ) -> Tuple[str, OperationType, List[str]]:
        """Build mathematical expression based on problem context"""
        
        reasoning_steps = []
        
        # Handle apple/object counting problems (common pattern)
        apple_pattern = r'(?:i\s+)?have\s+(\d+)\s+(?:apples?|items?|things?).*?(?:buy|get|add)\s+(\d+)\s+more.*?(?:give\s+away|remove|take\s+away|lose)\s+(\d+)'
        apple_match = re.search(apple_pattern, problem, re.IGNORECASE)
        
        if apple_match and len(numbers) >= 3:
            start, add, subtract = numbers[0], numbers[1], numbers[2]
            expression = f"(({start} + {add}) - {subtract})"
            reasoning_steps.append(f"🍎 Apple counting problem detected")
            reasoning_steps.append(f"📊 Start with {start}, add {add}, subtract {subtract}")
            reasoning_steps.append(f"🧮 Expression: {expression}")
            return expression, OperationType.MIXED, reasoning_steps
        
        # Handle simple multiplication problems
        if len(operations) == 1 and operations[0][0] == 'multiplication' and len(numbers) == 2:
            expression = f"({numbers[0]} * {numbers[1]})"
            reasoning_steps.append(f"✖️ Simple multiplication: {numbers[0]} * {numbers[1]}")
            return expression, OperationType.MULTIPLICATION, reasoning_steps
            
        # Handle simple division problems
        if len(operations) == 1 and operations[0][0] == 'division' and len(numbers) == 2:
            expression = f"({numbers[0]} / {numbers[1]})"
            reasoning_steps.append(f"➗ Simple division: {numbers[0]} / {numbers[1]}")
            return expression, OperationType.DIVISION, reasoning_steps
        
        # Handle simple addition problems
        if len(operations) == 1 and operations[0][0] == 'addition' and len(numbers) == 2:
            expression = f"({numbers[0]} + {numbers[1]})"
            reasoning_steps.append(f"➕ Simple addition: {numbers[0]} + {numbers[1]}")
            return expression, OperationType.ADDITION, reasoning_steps
        
        # Handle simple subtraction problems
        if len(operations) == 1 and operations[0][0] == 'subtraction' and len(numbers) == 2:
            expression = f"({numbers[0]} - {numbers[1]})"
            reasoning_steps.append(f"➖ Simple subtraction: {numbers[0]} - {numbers[1]}")
            return expression, OperationType.SUBTRACTION, reasoning_steps
        
        # Handle sequential operations (most common in word problems)
        if len(numbers) >= 2:
            expr_parts = [str(numbers[0])]
            reasoning_steps.append(f"🚀 Starting with: {numbers[0]}")
            
            # Map operations to numbers (sequential processing)
            op_symbols = [op[1] for op in operations]
            
            for i, num in enumerate(numbers[1:], 1):
                if i-1 < len(op_symbols):
                    op = op_symbols[i-1]
                    expr_parts.append(f" {op} {num}")
                    op_name = "add" if op == "+" else "subtract" if op == "-" else "multiply" if op == "*" else "divide"
                    reasoning_steps.append(f"🔄 Then {op_name} {num}")
                else:
                    # Default to addition if no more operations specified
                    expr_parts.append(f" + {num}")
                    reasoning_steps.append(f"🔄 Then add {num} (default)")
            
            expression = f"({(''.join(expr_parts))})"
            reasoning_steps.append(f"🎯 Final expression: {expression}")
            
            return expression, OperationType.MIXED, reasoning_steps
        
        # Fallback for unclear problems
        if len(numbers) == 1:
            expression = str(numbers[0])
            reasoning_steps.append(f"⚠️ Single number found: {numbers[0]}")
            return expression, OperationType.MIXED, reasoning_steps
        
        # Ultimate fallback
        expression = " + ".join(map(str, numbers))
        reasoning_steps.append(f"⚠️ Fallback: summing all numbers")
        return f"({expression})", OperationType.MIXED, reasoning_steps
    
    def _calculate_confidence(
        self, 
        numbers: List[Union[int, float]], 
        operations: List[Tuple[str, str]], 
        expression: str
    ) -> float:
        """Calculate confidence score for the parsing result"""
        confidence = 0.0
        
        # Base confidence for finding numbers
        if numbers:
            confidence += 0.4
        
        # Additional confidence for finding operations
        if operations:
            confidence += 0.3
        
        # Bonus for successful expression building
        if expression and len(expression) > 1:
            confidence += 0.2
        
        # Bonus for reasonable number of elements
        if len(numbers) >= 2 and len(operations) >= 1:
            confidence += 0.1
        
        return min(1.0, confidence)

# Test the parser
if __name__ == "__main__":
    parser = WordProblemParser()
    
    test_problems = [
        "If I have 3 apples and buy 7 more, then give away 4, how many do I have?",
        "What is 2 plus 3?",
        "Calculate 8 times 2",
        "John has 15 marbles. He gives away 6. How many are left?"
    ]
    
    for problem in test_problems:
        result = parser.parse_word_problem(problem)
        print(f"\n📝 Problem: {problem}")
        print(f"🔢 Numbers: {result.numbers}")
        print(f"⚙️ Operations: {result.operations}")
        print(f"🧮 Expression: {result.expression}")
        print(f"💪 Confidence: {result.confidence:.2f}")
        print("📋 Reasoning:")
        for step in result.reasoning_steps:
            print(f"   {step}")