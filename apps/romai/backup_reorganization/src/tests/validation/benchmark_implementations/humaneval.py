#!/usr/bin/env python3
"""
HumanEval Benchmark Implementation
=================================

Implementation of the HumanEval benchmark for testing code generation capabilities.
This benchmark evaluates the model's ability to generate Python code from natural 
language descriptions.
"""

import asyncio
import aiohttp
import json
import tempfile
import subprocess
import sys
from typing import Dict, List, Any, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Sample HumanEval problems (subset for testing)
HUMANEVAL_SAMPLE_PROBLEMS = [
    {
        "task_id": "HumanEval/0",
        "prompt": "from typing import List\n\n\ndef has_close_elements(numbers: List[float], threshold: float) -> bool:\n    \"\"\" Check if in given list of numbers, are any two numbers closer to each other than\n    given threshold.\n    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)\n    False\n    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)\n    True\n    \"\"\"\n",
        "canonical_solution": "    for idx, elem in enumerate(numbers):\n        for idx2, elem2 in enumerate(numbers):\n            if idx != idx2:\n                distance = abs(elem - elem2)\n                if distance < threshold:\n                    return True\n\n    return False\n",
        "test": "def check(candidate):\n    assert candidate([1.0, 2.0, 3.0], 0.5) == False\n    assert candidate([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3) == True\n    assert candidate([1.0, 2.0, 3.9, 4.0, 5.0, 2.2], 0.3) == True\n    assert candidate([1.0, 2.0, 3.9, 4.0, 5.0, 2.2], 0.05) == False\n    assert candidate([1.0, 2.0, 5.9, 4.0, 5.0], 0.95) == True\n    assert candidate([1.0, 2.0, 5.9, 4.0, 5.0], 0.8) == False\n    assert candidate([1.0, 2.0, 3.0, 4.0, 5.0, 2.0], 0.1) == True\n    print('All tests passed!')\n\ncheck(has_close_elements)"
    },
    {
        "task_id": "HumanEval/1", 
        "prompt": "from typing import List\n\n\ndef separate_paren_groups(paren_string: str) -> List[str]:\n    \"\"\" Input to this function is a string containing multiple groups of nested parentheses. Your goal is to\n    separate those group into separate strings and return the list of those.\n    Separate groups are balanced (each open brace is properly closed) and not nested within each other\n    Ignore any spaces in the input string.\n    >>> separate_paren_groups('( ) (( )) (( )( ))')\n    ['()', '(())', '(()())']\n    \"\"\"\n",
        "canonical_solution": "    result = []\n    current_string = []\n    current_depth = 0\n\n    for c in paren_string:\n        if c == '(':\n            current_depth += 1\n            current_string.append(c)\n        elif c == ')':\n            current_depth -= 1\n            current_string.append(c)\n\n            if current_depth == 0:\n                result.append(''.join(current_string))\n                current_string = []\n\n    return result\n",
        "test": "def check(candidate):\n    assert candidate('(()()) ((())) () ((())()())') == ['(()())', '((()))', '()', '((())()())']\n    assert candidate('() (()) ((())) (((())))') == ['()', '(())', '((()))', '(((())))']\n    assert candidate('(()(())((())))') == ['(()(())((())))'] \n    assert candidate('( ) (( )) (( )( ))') == ['()', '(())', '(()())']\n    print('All tests passed!')\n\ncheck(separate_paren_groups)"
    },
    {
        "task_id": "HumanEval/2",
        "prompt": "\n\ndef truncate_number(number: float) -> float:\n    \"\"\" Given a positive floating point number, it can be decomposed into\n    and integer part (largest integer smaller than given number) and decimals\n    (leftover part always smaller than 1).\n\n    Return the decimal part of the number.\n    >>> truncate_number(3.5)\n    0.5\n    \"\"\"\n",
        "canonical_solution": "    return number % 1.0\n",
        "test": "def check(candidate):\n    assert candidate(3.5) == 0.5\n    assert abs(candidate(1.33) - 0.33) < 1e-6\n    assert abs(candidate(123.456) - 0.456) < 1e-6\n    print('All tests passed!')\n\ncheck(truncate_number)"
    }
]

class HumanEvalRunner:
    """Runner for HumanEval benchmark tests"""
    
    def __init__(self, model_url: str):
        self.model_url = model_url
        self.timeout_seconds = 10
    
    async def generate_code(self, prompt: str) -> str:
        """Generate code completion from RomAI"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "prompt": prompt,
                    "max_tokens": 512,
                    "temperature": 0.1,
                    "stop": ["\nclass", "\ndef", "\n#", "\nif", "\nprint"]
                }
                
                async with session.post(
                    f"{self.model_url}/generate", 
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get('generated_text', '').strip()
                    else:
                        logger.error(f"RomAI API error: {response.status}")
                        return ""
                        
        except Exception as e:
            logger.error(f"Error generating code: {e}")
            return ""
    
    async def test_generated_code(self, problem: Dict[str, Any], generated_code: str) -> Dict[str, Any]:
        """Test generated code against the problem's test cases"""
        result = {
            'task_id': problem['task_id'],
            'passed': False,
            'error': None,
            'execution_time': 0,
            'generated_code': generated_code
        }
        
        if not generated_code.strip():
            result['error'] = "No code generated"
            return result
        
        # Create complete code with function definition
        full_code = problem['prompt'] + generated_code + "\n\n" + problem['test']
        
        try:
            # Create temporary file for testing
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(full_code)
                temp_file = f.name
            
            # Execute the code
            import time
            start_time = time.time()
            
            process = subprocess.run(
                [sys.executable, temp_file],
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds
            )
            
            execution_time = time.time() - start_time
            result['execution_time'] = execution_time
            
            if process.returncode == 0 and "All tests passed!" in process.stdout:
                result['passed'] = True
            else:
                result['error'] = process.stderr or process.stdout
            
            # Clean up
            Path(temp_file).unlink(missing_ok=True)
            
        except subprocess.TimeoutExpired:
            result['error'] = "Code execution timeout"
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    async def run_humaneval_benchmark(self, problems: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run HumanEval benchmark on given problems"""
        results = []
        total_problems = len(problems)
        passed_problems = 0
        
        logger.info(f"Running HumanEval benchmark on {total_problems} problems")
        
        for i, problem in enumerate(problems):
            logger.info(f"Processing problem {i+1}/{total_problems}: {problem['task_id']}")
            
            # Generate code
            generated_code = await self.generate_code(problem['prompt'])
            
            # Test generated code
            test_result = await self.test_generated_code(problem, generated_code)
            
            if test_result['passed']:
                passed_problems += 1
                logger.info(f"✅ {problem['task_id']} passed")
            else:
                logger.info(f"❌ {problem['task_id']} failed: {test_result['error']}")
            
            results.append(test_result)
        
        # Calculate pass@1 score
        pass_at_1 = passed_problems / total_problems if total_problems > 0 else 0.0
        
        return {
            'score': pass_at_1,
            'details': {
                'total_problems': total_problems,
                'passed_problems': passed_problems,
                'failed_problems': total_problems - passed_problems,
                'pass_rate': pass_at_1,
                'individual_results': results,
                'benchmark': 'HumanEval',
                'metric': 'pass@1'
            }
        }

async def run_benchmark(
    model_url: str, 
    benchmark_spec: Any, 
    custom_parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """Main entry point for running HumanEval benchmark"""
    
    # Use sample problems or custom problems if provided
    problems = custom_parameters.get('problems', HUMANEVAL_SAMPLE_PROBLEMS)
    
    # Initialize runner
    runner = HumanEvalRunner(model_url)
    
    # Run benchmark
    result = await runner.run_humaneval_benchmark(problems)
    
    logger.info(f"HumanEval benchmark completed: {result['score']:.3f} pass@1")
    
    return result

# For testing purposes
async def test_humaneval_implementation():
    """Test the HumanEval implementation"""
    print("🧪 Testing HumanEval Implementation")
    
    # Mock model URL for testing
    model_url = "http://localhost:6101"
    
    class MockBenchmarkSpec:
        name = "HumanEval"
        evaluation_metric = "pass@1"
    
    result = await run_benchmark(
        model_url=model_url,
        benchmark_spec=MockBenchmarkSpec(),
        custom_parameters={"problems": HUMANEVAL_SAMPLE_PROBLEMS[:2]}  # Test with first 2 problems
    )
    
    print(f"✅ HumanEval test completed")
    print(f"Score: {result['score']:.3f}")
    print(f"Details: {result['details']['passed_problems']}/{result['details']['total_problems']} problems passed")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_humaneval_implementation())