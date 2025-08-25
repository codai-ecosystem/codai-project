"""
HumanEval Runner - Real HumanEval benchmark implementation
Comprehensive evaluation targeting >90% pass@1 rate
"""

import asyncio
import json
import os
import re
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import time
import logging

# Import our components
from code_generation_engine import CodeGenerationEngine, CodeGenerationRequest
from execution_tester import ExecutionTester, TestCase, ExecutionResult
from syntax_validator import SyntaxValidator

logger = logging.getLogger(__name__)

@dataclass
class HumanEvalProblem:
    task_id: str
    prompt: str
    canonical_solution: str
    test_cases: str
    entry_point: str
    description: str = ""

@dataclass
class HumanEvalResult:
    task_id: str
    prompt: str
    generated_code: str
    passed: bool
    execution_time: float
    syntax_valid: bool
    error_message: Optional[str] = None
    test_results: Optional[Dict] = None

@dataclass
class HumanEvalSummary:
    total_problems: int
    solved_problems: int
    pass_at_1_rate: float
    average_execution_time: float
    syntax_success_rate: float
    results: List[HumanEvalResult]

class HumanEvalRunner:
    """Real HumanEval benchmark runner with comprehensive evaluation"""
    
    def __init__(self):
        self.code_generator = CodeGenerationEngine()
        self.execution_tester = ExecutionTester()
        self.syntax_validator = SyntaxValidator()
        self.problems = self._load_humaneval_problems()
    
    def _load_humaneval_problems(self) -> List[HumanEvalProblem]:
        """Load real HumanEval problems (subset for testing)"""
        problems = [
            HumanEvalProblem(
                task_id="HumanEval/0",
                prompt="""def has_close_elements(numbers: List[float], threshold: float) -> bool:
    \"\"\" Check if in given list of numbers, are any two numbers closer to each other than
    given threshold.
    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)
    False
    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)
    True
    \"\"\"
""",
                canonical_solution="""    for idx, elem in enumerate(numbers):
        for idx2, elem2 in enumerate(numbers):
            if idx != idx2:
                distance = abs(elem - elem2)
                if distance < threshold:
                    return True

    return False""",
                test_cases="""
assert has_close_elements([1.0, 2.0, 3.0], 0.5) == False
assert has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3) == True
assert has_close_elements([1.0, 2.0, 3.9, 4.0, 5.0, 2.2], 0.3) == True
assert has_close_elements([1.0, 2.0, 3.9, 4.0, 5.0, 2.2], 0.05) == False
assert has_close_elements([1.0, 2.0, 5.9, 4.0, 5.0], 0.95) == True
""",
                entry_point="has_close_elements",
                description="Check if any two numbers are closer than threshold"
            ),
            
            HumanEvalProblem(
                task_id="HumanEval/1",
                prompt="""def separate_paren_groups(paren_string: str) -> List[str]:
    \"\"\" Input to this function is a string containing multiple groups of nested parentheses.
    Your goal is to separate those group and return the list of those.
    Separate groups are balanced (each open brace is properly closed) and not nested within each other
    Ignore any spaces in the input string.
    >>> separate_paren_groups('( ) (( )) (( )( ))')
    ['()', '(())', '(()())']
    \"\"\"
""",
                canonical_solution="""    result = []
    current_string = []
    current_depth = 0

    for c in paren_string:
        if c == '(':
            current_depth += 1
            current_string.append(c)
        elif c == ')':
            current_depth -= 1
            current_string.append(c)

            if current_depth == 0:
                result.append(''.join(current_string))
                current_string = []

    return result""",
                test_cases="""
assert separate_paren_groups('(()()) ((())) () ((())()())') == ['(()())', '((()))', '()', '((())()())']
assert separate_paren_groups('() (()) ((())) (((())))') == ['()', '(())', '((()))', '(((())))']
assert separate_paren_groups('(()(())((())))') == ['(()(())((())))']
""",
                entry_point="separate_paren_groups",
                description="Separate groups of balanced parentheses"
            ),
            
            HumanEvalProblem(
                task_id="HumanEval/2", 
                prompt="""def truncate_number(number: float) -> float:
    \"\"\" Given a positive floating point number, it can be decomposed into
    and integer part (largest integer smaller than given number) and decimals
    (leftover part always smaller than 1).

    Return the decimal part of the number.
    >>> truncate_number(3.5)
    0.5
    \"\"\"
""",
                canonical_solution="""    return number % 1.0""",
                test_cases="""
assert truncate_number(3.5) == 0.5
assert abs(truncate_number(1.25) - 0.25) < 1e-6
assert abs(truncate_number(123.0) - 0.0) < 1e-6
""",
                entry_point="truncate_number",
                description="Return decimal part of a float"
            ),
            
            HumanEvalProblem(
                task_id="HumanEval/3",
                prompt="""def below_zero(operations: List[int]) -> bool:
    \"\"\" You're given a list of deposit and withdrawal operations on a bank account that starts with
    zero balance. Your task is to detect if at any point the balance of account fallls below zero, and
    at that point function should return True. Otherwise it should return False.
    >>> below_zero([1, 2, 3])
    False
    >>> below_zero([1, 2, -4, 5])
    True
    \"\"\"
""",
                canonical_solution="""    balance = 0

    for op in operations:
        balance += op
        if balance < 0:
            return True

    return False""",
                test_cases="""
assert below_zero([]) == False
assert below_zero([1, 2, -3, 1, 2, -3]) == False
assert below_zero([1, 2, -4, 5, 6]) == True
assert below_zero([1, 2, -3, -10]) == True
assert below_zero([2, 3, -5, -10]) == True
""",
                entry_point="below_zero",
                description="Detect if bank account goes below zero"
            ),
            
            HumanEvalProblem(
                task_id="HumanEval/4",
                prompt="""def mean_absolute_deviation(numbers: List[float]) -> float:
    \"\"\" For a given list of input numbers, calculate Mean Absolute Deviation
    around the mean of this dataset.
    Mean Absolute Deviation is the average absolute difference between each
    element and a centerpoint (mean in this case):
    MAD = average | x - x_mean |
    >>> mean_absolute_deviation([1.0, 2.0, 3.0, 4.0])
    1.0
    \"\"\"
""",
                canonical_solution="""    mean = sum(numbers) / len(numbers)
    return sum(abs(x - mean) for x in numbers) / len(numbers)""",
                test_cases="""
assert abs(mean_absolute_deviation([1.0, 2.0, 3.0]) - 2.0/3.0) < 1e-6
assert abs(mean_absolute_deviation([1.0, 2.0, 3.0, 4.0]) - 1.0) < 1e-6
assert abs(mean_absolute_deviation([1.0, 2.0, 3.0, 4.0, 5.0]) - 1.2) < 1e-6
""",
                entry_point="mean_absolute_deviation",
                description="Calculate Mean Absolute Deviation"
            ),
            
            HumanEvalProblem(
                task_id="HumanEval/5",
                prompt="""def intersperse(numbers: List[int], delimeter: int) -> List[int]:
    \"\"\" Insert a number 'delimeter' between every two consecutive elements of input list `numbers'
    >>> intersperse([], 4)
    []
    >>> intersperse([1, 2, 3], 4)
    [1, 4, 2, 4, 3]
    \"\"\"
""",
                canonical_solution="""    if not numbers:
        return []

    result = []

    for i, n in enumerate(numbers):
        result.append(n)

        if i != len(numbers) - 1:
            result.append(delimeter)

    return result""",
                test_cases="""
assert intersperse([], 7) == []
assert intersperse([5, 6, 3, 2], 8) == [5, 8, 6, 8, 3, 8, 2]
assert intersperse([2, 2, 2], 2) == [2, 2, 2, 2, 2]
""",
                entry_point="intersperse",
                description="Intersperse delimiter between elements"
            )
        ]
        
        return problems
    
    def extract_function_from_generated_code(self, generated_code: str, entry_point: str) -> str:
        """Extract the target function from generated code"""
        lines = generated_code.split('\n')
        
        # Find function definition
        function_lines = []
        inside_function = False
        indent_level = 0
        
        for line in lines:
            if f"def {entry_point}" in line:
                inside_function = True
                indent_level = len(line) - len(line.lstrip())
                function_lines.append(line)
            elif inside_function:
                current_indent = len(line) - len(line.lstrip())
                
                # If we're at same or less indentation and line is not empty, function ended
                if line.strip() and current_indent <= indent_level:
                    break
                
                function_lines.append(line)
        
        return '\n'.join(function_lines)
    
    def create_test_execution_code(self, problem: HumanEvalProblem, generated_code: str) -> str:
        """Create executable test code"""
        
        # Add List import if needed
        imports = "from typing import List\n" if "List[" in problem.prompt else ""
        
        # Clean and prepare the generated code
        function_code = self.extract_function_from_generated_code(generated_code, problem.entry_point)
        
        if not function_code.strip():
            # Fallback: use the complete generated code
            function_code = generated_code
        
        # Create complete test code with proper structure
        test_code = f"""{imports}

{function_code}

# Test execution
def run_tests():
    try:
{self._indent_test_cases(problem.test_cases)}
        return True
    except Exception as e:
        print(f"Test failed: {{e}}")
        return False

# Execute tests
test_result = run_tests()
"""
        
        return test_code
    
    def _indent_test_cases(self, test_cases: str) -> str:
        """Properly indent test cases for function execution"""
        lines = test_cases.strip().split('\n')
        indented_lines = []
        
        for line in lines:
            if line.strip():  # Skip empty lines
                indented_lines.append(f"        {line}")
        
        return '\n'.join(indented_lines)
    
    async def evaluate_single_problem(self, problem: HumanEvalProblem) -> HumanEvalResult:
        """Evaluate a single HumanEval problem"""
        logger.info(f"Evaluating {problem.task_id}: {problem.description}")
        
        start_time = time.time()
        
        # Generate code
        request = CodeGenerationRequest(
            prompt=problem.prompt,
            temperature=0.1,  # Low temperature for consistency
            max_tokens=512
        )
        
        generated_result = await self.code_generator.generate_code(request)
        
        # Validate syntax
        validation_result = self.syntax_validator.validate_syntax(generated_result.code)
        
        if not validation_result.is_valid:
            execution_time = time.time() - start_time
            return HumanEvalResult(
                task_id=problem.task_id,
                prompt=problem.prompt,
                generated_code=generated_result.code,
                passed=False,
                execution_time=execution_time,
                syntax_valid=False,
                error_message=f"Syntax validation failed: {len(validation_result.issues)} issues"
            )
        
        # Create test execution code
        test_code = self.create_test_execution_code(problem, generated_result.code)
        
        # Execute tests
        try:
            execution_result, output, metrics, error = self.execution_tester.execute_code_safely(
                test_code, timeout=10.0
            )
            
            passed = (execution_result == ExecutionResult.SUCCESS and output is True)
            
            execution_time = time.time() - start_time
            
            return HumanEvalResult(
                task_id=problem.task_id,
                prompt=problem.prompt,
                generated_code=generated_result.code,
                passed=passed,
                execution_time=execution_time,
                syntax_valid=True,
                error_message=error if not passed else None,
                test_results={
                    "execution_result": execution_result.value,
                    "output": output,
                    "metrics": {
                        "execution_time": metrics.execution_time,
                        "return_code": metrics.return_code
                    }
                }
            )
        
        except Exception as e:
            execution_time = time.time() - start_time
            return HumanEvalResult(
                task_id=problem.task_id,
                prompt=problem.prompt,
                generated_code=generated_result.code,
                passed=False,
                execution_time=execution_time,
                syntax_valid=True,
                error_message=f"Test execution failed: {str(e)}"
            )
    
    async def run_humaneval_benchmark(self, max_problems: Optional[int] = None) -> HumanEvalSummary:
        """Run the complete HumanEval benchmark"""
        problems_to_test = self.problems[:max_problems] if max_problems else self.problems
        
        logger.info(f"Running HumanEval benchmark on {len(problems_to_test)} problems")
        
        results = []
        
        # Evaluate each problem
        for problem in problems_to_test:
            result = await self.evaluate_single_problem(problem)
            results.append(result)
        
        # Calculate summary statistics
        total_problems = len(results)
        solved_problems = sum(1 for r in results if r.passed)
        pass_at_1_rate = solved_problems / total_problems if total_problems > 0 else 0.0
        average_execution_time = sum(r.execution_time for r in results) / total_problems if total_problems > 0 else 0.0
        syntax_success_rate = sum(1 for r in results if r.syntax_valid) / total_problems if total_problems > 0 else 0.0
        
        return HumanEvalSummary(
            total_problems=total_problems,
            solved_problems=solved_problems,
            pass_at_1_rate=pass_at_1_rate,
            average_execution_time=average_execution_time,
            syntax_success_rate=syntax_success_rate,
            results=results
        )
    
    def print_detailed_results(self, summary: HumanEvalSummary):
        """Print detailed benchmark results"""
        print("\n" + "="*60)
        print("🏆 HUMANEVAL BENCHMARK RESULTS")
        print("="*60)
        
        print(f"📊 Overall Performance:")
        print(f"   Total Problems: {summary.total_problems}")
        print(f"   Solved: {summary.solved_problems}")
        print(f"   Pass@1 Rate: {summary.pass_at_1_rate:.1%}")
        print(f"   Syntax Success Rate: {summary.syntax_success_rate:.1%}")
        print(f"   Average Execution Time: {summary.average_execution_time:.3f}s")
        
        # Grade based on pass@1 rate
        if summary.pass_at_1_rate >= 0.90:
            grade = "A+ (WORLD-CLASS)"
        elif summary.pass_at_1_rate >= 0.80:
            grade = "A (EXCELLENT)"
        elif summary.pass_at_1_rate >= 0.70:
            grade = "B (GOOD)"
        elif summary.pass_at_1_rate >= 0.60:
            grade = "C (SATISFACTORY)"
        elif summary.pass_at_1_rate >= 0.50:
            grade = "D (NEEDS IMPROVEMENT)"
        else:
            grade = "F (POOR)"
        
        print(f"🎯 Grade: {grade}")
        
        print(f"\n📋 Individual Results:")
        for result in summary.results:
            status = "✅" if result.passed else "❌"
            syntax = "✓" if result.syntax_valid else "✗"
            print(f"   {status} {result.task_id} (Syntax: {syntax}) - {result.execution_time:.3f}s")
            if not result.passed and result.error_message:
                print(f"      Error: {result.error_message[:100]}...")
        
        return summary.pass_at_1_rate >= 0.90  # True if world-class performance

# Test function
async def test_humaneval_runner():
    """Test the HumanEval runner"""
    runner = HumanEvalRunner()
    
    print("🚀 Testing HumanEval Runner")
    print("=" * 50)
    
    # Run benchmark on all problems
    summary = await runner.run_humaneval_benchmark()
    
    # Print results
    world_class = runner.print_detailed_results(summary)
    
    if world_class:
        print("\n🎉 CONGRATULATIONS! RomAI achieved world-class HumanEval performance!")
    else:
        print(f"\n🎯 Target: >90% pass@1 rate. Current: {summary.pass_at_1_rate:.1%}")
        print("💪 Continue improving to reach world-class performance!")
    
    return summary

if __name__ == "__main__":
    asyncio.run(test_humaneval_runner())