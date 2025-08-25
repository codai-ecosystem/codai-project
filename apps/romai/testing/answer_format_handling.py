#!/usr/bin/env python3
"""
Answer Format Handling System for RomAI
Critical Infrastructure Fix - Phase 1 Priority

This system addresses the most critical competitive gap: RomAI's inability to 
handle structured answer formats, particularly multiple choice questions.

Current Problem: 
- MMLU: 0% accuracy due to inability to extract A/B/C/D answers
- GPQA: 0% accuracy due to poor answer format handling
- Responses are verbose but don't match expected answer formats

Solution Implementation:
- Robust answer extraction from natural language responses
- Format validation and standardization
- Structured response parsing for academic benchmarks
- Confidence-aware answer selection
- Fallback mechanisms for uncertain responses

Critical Requirements:
- Handle multiple choice (A/B/C/D) extraction
- Support numerical answers (AIME mathematics)
- Parse code solutions (SWE-bench programming)
- Validate answer formats before submission
- Maintain high accuracy in answer extraction

This is the foundational fix required for any competitive benchmarking.
"""

import re
import json
import asyncio
import aiohttp
from typing import Dict, List, Optional, Union, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import logging
from pathlib import Path

class AnswerFormat(Enum):
    """Supported answer formats for different benchmarks"""
    MULTIPLE_CHOICE = "multiple_choice"    # A, B, C, D
    NUMERICAL = "numerical"                # Integer or float
    TEXT = "text"                         # Short text answer
    CODE = "code"                         # Programming solution
    BOOLEAN = "boolean"                   # True/False
    LIST = "list"                        # Multiple items

@dataclass
class ParsedAnswer:
    """Parsed and validated answer result"""
    original_response: str
    extracted_answer: Union[str, int, float, bool, List]
    format_type: AnswerFormat
    confidence: float
    is_valid: bool
    extraction_method: str
    fallback_used: bool = False
    validation_errors: List[str] = None

class AnswerFormatHandler:
    """Comprehensive answer format handling and extraction system"""
    
    def __init__(self):
        self.romai_base_url = 'http://localhost:6101'
        self.session = None
        
        # Multiple choice patterns (most critical for MMLU/GPQA)
        self.multiple_choice_patterns = [
            r'\b([A-D])\b(?:\s*[).]|\s*$)',  # A) or A. or standalone A
            r'answer\s*:?\s*([A-D])\b',      # Answer: A
            r'option\s*([A-D])\b',           # Option A
            r'choice\s*([A-D])\b',           # Choice A
            r'([A-D])\s*is\s*correct',       # A is correct
            r'the\s*answer\s*is\s*([A-D])',  # The answer is A
            r'\b([A-D])\s*[\-–]\s*',         # A - (option format)
            r'^\s*([A-D])\s*$',              # Just A on a line
            r'\(([A-D])\)',                  # (A)
        ]
        
        # Numerical answer patterns (for AIME)
        self.numerical_patterns = [
            r'answer\s*:?\s*([+-]?\d+(?:\.\d+)?)',
            r'result\s*:?\s*([+-]?\d+(?:\.\d+)?)',
            r'solution\s*:?\s*([+-]?\d+(?:\.\d+)?)',
            r'equals?\s*([+-]?\d+(?:\.\d+)?)',
            r'=\s*([+-]?\d+(?:\.\d+)?)',
            r'\b([+-]?\d+(?:\.\d+)?)\s*$',  # Number at end
            r'^\s*([+-]?\d+(?:\.\d+)?)\s*$', # Just number
        ]
        
        # Boolean patterns  
        self.boolean_patterns = [
            r'\b(true|false)\b',
            r'\b(yes|no)\b',
            r'\b(correct|incorrect)\b',
            r'\b(valid|invalid)\b',
        ]
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    async def __aenter__(self):
        """Initialize async context"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Cleanup async context"""
        if self.session:
            await self.session.close()
    
    def extract_multiple_choice(self, response: str) -> Tuple[Optional[str], str]:
        """Extract multiple choice answer (A/B/C/D) from response"""
        
        if not response:
            return None, "empty_response"
        
        response = response.strip()
        
        # Try each pattern in order of preference
        for i, pattern in enumerate(self.multiple_choice_patterns):
            matches = re.findall(pattern, response, re.IGNORECASE)
            if matches:
                # Take the last match (often the final answer)
                answer = matches[-1].upper()
                if answer in ['A', 'B', 'C', 'D']:
                    return answer, f"pattern_{i+1}"
        
        # Fallback: look for first A/B/C/D in response
        matches = re.findall(r'\b([A-D])\b', response)
        if matches:
            answer = matches[-1].upper()
            return answer, "fallback_first_letter"
        
        # Last resort: check if response starts with letter
        if len(response) >= 1 and response[0].upper() in ['A', 'B', 'C', 'D']:
            return response[0].upper(), "first_character"
        
        return None, "no_extraction"
    
    def extract_numerical(self, response: str) -> Tuple[Optional[Union[int, float]], str]:
        """Extract numerical answer from response"""
        
        if not response:
            return None, "empty_response"
        
        # Try each numerical pattern
        for i, pattern in enumerate(self.numerical_patterns):
            matches = re.findall(pattern, response, re.IGNORECASE)
            if matches:
                try:
                    # Take the last match
                    number_str = matches[-1]
                    # Try integer first, then float
                    if '.' in number_str:
                        number = float(number_str)
                    else:
                        number = int(number_str)
                    return number, f"pattern_{i+1}"
                except ValueError:
                    continue
        
        # Fallback: extract any number from response
        numbers = re.findall(r'([+-]?\d+(?:\.\d+)?)', response)
        if numbers:
            try:
                number_str = numbers[-1]  # Take last number
                if '.' in number_str:
                    return float(number_str), "fallback_any_number"
                else:
                    return int(number_str), "fallback_any_number"
            except ValueError:
                pass
        
        return None, "no_extraction"
    
    def extract_boolean(self, response: str) -> Tuple[Optional[bool], str]:
        """Extract boolean answer from response"""
        
        if not response:
            return None, "empty_response"
        
        response = response.lower()
        
        for pattern in self.boolean_patterns:
            matches = re.findall(pattern, response)
            if matches:
                answer = matches[-1].lower()
                if answer in ['true', 'yes', 'correct', 'valid']:
                    return True, "boolean_true"
                elif answer in ['false', 'no', 'incorrect', 'invalid']:
                    return False, "boolean_false"
        
        return None, "no_extraction"
    
    def extract_code(self, response: str) -> Tuple[Optional[str], str]:
        """Extract code solution from response"""
        
        if not response:
            return None, "empty_response"
        
        # Look for code blocks
        code_block_pattern = r'```(?:python|java|cpp|c\+\+|javascript|js)?\s*\n?(.*?)\n?```'
        matches = re.findall(code_block_pattern, response, re.DOTALL | re.IGNORECASE)
        
        if matches:
            # Return the largest code block
            code = max(matches, key=len).strip()
            return code, "code_block"
        
        # Look for function definitions
        function_patterns = [
            r'(def\s+\w+.*?)(?=\n\n|\n[A-Z]|\Z)',  # Python function
            r'(function\s+\w+.*?)(?=\n\n|\n[A-Z]|\Z)',  # JavaScript function
            r'(public\s+.*?)(?=\n\n|\n[A-Z]|\Z)',  # Java/C++ method
        ]
        
        for pattern in function_patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            if matches:
                code = matches[0].strip()
                return code, "function_definition"
        
        # If response looks like code (has programming keywords)
        programming_keywords = ['def ', 'function ', 'class ', 'if ', 'for ', 'while ', 'return ', 'import ']
        if any(keyword in response.lower() for keyword in programming_keywords):
            return response.strip(), "full_response_as_code"
        
        return None, "no_extraction"
    
    def validate_answer_format(self, answer: Any, expected_format: AnswerFormat) -> Tuple[bool, List[str]]:
        """Validate extracted answer matches expected format"""
        
        errors = []
        
        if expected_format == AnswerFormat.MULTIPLE_CHOICE:
            if not isinstance(answer, str) or answer not in ['A', 'B', 'C', 'D']:
                errors.append(f"Expected A/B/C/D, got: {answer}")
        
        elif expected_format == AnswerFormat.NUMERICAL:
            if not isinstance(answer, (int, float)):
                errors.append(f"Expected number, got: {type(answer)}")
        
        elif expected_format == AnswerFormat.BOOLEAN:
            if not isinstance(answer, bool):
                errors.append(f"Expected boolean, got: {type(answer)}")
        
        elif expected_format == AnswerFormat.TEXT:
            if not isinstance(answer, str):
                errors.append(f"Expected string, got: {type(answer)}")
            elif len(answer) > 500:  # Reasonable text limit
                errors.append(f"Text too long: {len(answer)} characters")
        
        elif expected_format == AnswerFormat.CODE:
            if not isinstance(answer, str):
                errors.append(f"Expected code string, got: {type(answer)}")
            elif len(answer) < 10:  # Minimum reasonable code length
                errors.append(f"Code too short: {len(answer)} characters")
        
        return len(errors) == 0, errors
    
    async def query_romai_with_format_hint(self, question: str, expected_format: AnswerFormat) -> str:
        """Query RomAI with specific format instructions"""
        
        # Add format-specific instructions to the question
        format_instructions = {
            AnswerFormat.MULTIPLE_CHOICE: "\n\nIMPORTANT: Answer with ONLY the letter (A, B, C, or D). Do not provide explanations.",
            AnswerFormat.NUMERICAL: "\n\nIMPORTANT: Answer with ONLY the numerical value. No explanations.",
            AnswerFormat.BOOLEAN: "\n\nIMPORTANT: Answer with ONLY True or False.",
            AnswerFormat.TEXT: "\n\nIMPORTANT: Provide a concise answer in 1-2 sentences.",
            AnswerFormat.CODE: "\n\nIMPORTANT: Provide the complete code solution."
        }
        
        enhanced_question = question + format_instructions.get(expected_format, "")
        
        try:
            url = f"{self.romai_base_url}/api/v1/romanian-intelligence/chat"
            payload = {"message": enhanced_question}
            
            async with self.session.post(
                url,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    return result.get('response', '')
                else:
                    return ''
                    
        except Exception as e:
            self.logger.error(f"Error querying RomAI: {str(e)}")
            return ''
    
    async def parse_answer(self, question: str, expected_format: AnswerFormat, 
                          raw_response: Optional[str] = None) -> ParsedAnswer:
        """Parse answer from RomAI response using appropriate extraction method"""
        
        # Get response if not provided
        if raw_response is None:
            raw_response = await self.query_romai_with_format_hint(question, expected_format)
        
        extracted_answer = None
        extraction_method = "none"
        fallback_used = False
        
        # Apply format-specific extraction
        if expected_format == AnswerFormat.MULTIPLE_CHOICE:
            extracted_answer, extraction_method = self.extract_multiple_choice(raw_response)
            
        elif expected_format == AnswerFormat.NUMERICAL:
            extracted_answer, extraction_method = self.extract_numerical(raw_response)
            
        elif expected_format == AnswerFormat.BOOLEAN:
            extracted_answer, extraction_method = self.extract_boolean(raw_response)
            
        elif expected_format == AnswerFormat.CODE:
            extracted_answer, extraction_method = self.extract_code(raw_response)
            
        elif expected_format == AnswerFormat.TEXT:
            extracted_answer = raw_response.strip() if raw_response else None
            extraction_method = "full_text"
        
        # Fallback handling
        if extracted_answer is None:
            fallback_used = True
            if expected_format == AnswerFormat.MULTIPLE_CHOICE:
                # Random guess as last resort
                extracted_answer = 'A'
                extraction_method = "fallback_random_guess"
            elif expected_format == AnswerFormat.NUMERICAL:
                extracted_answer = 0
                extraction_method = "fallback_zero"
            elif expected_format == AnswerFormat.BOOLEAN:
                extracted_answer = False
                extraction_method = "fallback_false"
            else:
                extracted_answer = raw_response or "No answer"
                extraction_method = "fallback_raw_response"
        
        # Validate extracted answer
        is_valid, validation_errors = self.validate_answer_format(extracted_answer, expected_format)
        
        # Calculate confidence (lower if fallback used or validation failed)
        confidence = 0.95  # High confidence for successful extraction
        if fallback_used:
            confidence *= 0.3  # Significant penalty for fallback
        if not is_valid:
            confidence *= 0.5  # Penalty for validation failure
        if extraction_method.startswith("fallback"):
            confidence *= 0.2  # Heavy penalty for fallback methods
        
        return ParsedAnswer(
            original_response=raw_response,
            extracted_answer=extracted_answer,
            format_type=expected_format,
            confidence=confidence,
            is_valid=is_valid,
            extraction_method=extraction_method,
            fallback_used=fallback_used,
            validation_errors=validation_errors or []
        )
    
    async def test_answer_extraction_system(self) -> Dict[str, Any]:
        """Test the answer format handling system with sample questions"""
        
        print("🧪 Testing Answer Format Handling System...")
        
        test_cases = [
            {
                "question": "What is the capital of Romania?\nA) Budapest\nB) Bucharest\nC) Sofia\nD) Prague",
                "expected_format": AnswerFormat.MULTIPLE_CHOICE,
                "expected_answer": "B"
            },
            {
                "question": "What is 15 + 27?",
                "expected_format": AnswerFormat.NUMERICAL,
                "expected_answer": 42
            },
            {
                "question": "Is Python an interpreted language?",
                "expected_format": AnswerFormat.BOOLEAN,
                "expected_answer": True
            },
            {
                "question": "Write a function to calculate factorial of n.",
                "expected_format": AnswerFormat.CODE,
                "expected_answer": "def factorial"  # Should contain this
            }
        ]
        
        results = []
        
        for i, test_case in enumerate(test_cases):
            print(f"   Testing case {i+1}: {test_case['expected_format'].value}")
            
            parsed_answer = await self.parse_answer(
                test_case["question"], 
                test_case["expected_format"]
            )
            
            # Check if extraction was successful
            success = parsed_answer.is_valid and not parsed_answer.fallback_used
            
            result = {
                "test_case": i + 1,
                "question": test_case["question"][:50] + "...",
                "expected_format": test_case["expected_format"].value,
                "extracted_answer": parsed_answer.extracted_answer,
                "confidence": parsed_answer.confidence,
                "is_valid": parsed_answer.is_valid,
                "extraction_method": parsed_answer.extraction_method,
                "fallback_used": parsed_answer.fallback_used,
                "success": success
            }
            
            results.append(result)
            
            status = "✅ SUCCESS" if success else "❌ FAILED"
            print(f"      {status}: {parsed_answer.extracted_answer} (confidence: {parsed_answer.confidence:.1%})")
        
        # Calculate overall success rate
        success_rate = sum(1 for r in results if r["success"]) / len(results)
        
        summary = {
            "test_results": results,
            "success_rate": success_rate,
            "total_tests": len(results),
            "successful_extractions": sum(1 for r in results if r["success"]),
            "fallback_usage": sum(1 for r in results if r["fallback_used"]),
            "system_status": "OPERATIONAL" if success_rate >= 0.75 else "NEEDS_IMPROVEMENT"
        }
        
        print(f"\n📊 Answer Format Handling System Test Results:")
        print(f"   Success Rate: {success_rate:.1%}")
        print(f"   Successful Extractions: {summary['successful_extractions']}/{len(results)}")
        print(f"   Fallback Usage: {summary['fallback_usage']}/{len(results)}")
        print(f"   System Status: {summary['system_status']}")
        
        return summary

async def main():
    """Main test execution"""
    print("🚀 RomAI Answer Format Handling System - Critical Infrastructure Fix")
    print("=" * 80)
    
    async with AnswerFormatHandler() as handler:
        
        # Test the system
        results = await handler.test_answer_extraction_system()
        
        # Assessment
        if results["success_rate"] >= 0.75:
            print(f"\n✅ ANSWER FORMAT HANDLING: OPERATIONAL")
            print(f"   This critical infrastructure fix enables proper benchmarking")
            print(f"   Ready to proceed with academic knowledge enhancement")
        else:
            print(f"\n❌ ANSWER FORMAT HANDLING: NEEDS IMPROVEMENT")
            print(f"   System requires additional tuning before benchmark testing")
            print(f"   Focus on improving extraction patterns and validation")
        
        return results

if __name__ == "__main__":
    results = asyncio.run(main())