"""
Execution Tester - Real code execution and testing
Safe code execution with proper isolation and validation
"""

import asyncio
import subprocess
import tempfile
import os
import sys
import time
import signal
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
from enum import Enum
import logging
import traceback
import threading
import queue

# Import resource module only if available (Unix systems)
try:
    import resource
    HAS_RESOURCE_MODULE = True
except ImportError:
    HAS_RESOURCE_MODULE = False

logger = logging.getLogger(__name__)

class ExecutionResult(Enum):
    SUCCESS = "success"
    TIMEOUT = "timeout"
    MEMORY_EXCEEDED = "memory_exceeded"
    RUNTIME_ERROR = "runtime_error"
    SYNTAX_ERROR = "syntax_error"
    SECURITY_VIOLATION = "security_violation"

@dataclass
class TestCase:
    input_data: Any
    expected_output: Any
    timeout: float = 5.0
    description: str = ""

@dataclass
class ExecutionMetrics:
    execution_time: float
    memory_usage: int  # bytes
    cpu_time: float
    return_code: int
    stdout: str
    stderr: str

@dataclass
class TestResult:
    test_case: TestCase
    actual_output: Any
    execution_result: ExecutionResult
    metrics: ExecutionMetrics
    passed: bool
    error_message: Optional[str] = None

@dataclass
class ExecutionSummary:
    total_tests: int
    passed_tests: int
    failed_tests: int
    success_rate: float
    total_execution_time: float
    average_execution_time: float
    test_results: List[TestResult]

class ExecutionTester:
    """Real code execution tester with safety and isolation"""
    
    def __init__(self, max_execution_time: float = 10.0, max_memory_mb: int = 256):
        self.max_execution_time = max_execution_time
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.allowed_builtins = self._get_safe_builtins()
        
    def _get_safe_builtins(self) -> Dict[str, Any]:
        """Get safe built-in functions for code execution"""
        return {
            # Basic types
            'int': int, 'float': float, 'str': str, 'bool': bool,
            'list': list, 'dict': dict, 'tuple': tuple, 'set': set,
            
            # Iteration and sequences
            'range': range, 'enumerate': enumerate, 'zip': zip,
            'len': len, 'reversed': reversed, 'sorted': sorted,
            
            # Math functions
            'abs': abs, 'min': min, 'max': max, 'sum': sum, 'round': round,
            'pow': pow, 'divmod': divmod,
            
            # Type checking
            'isinstance': isinstance, 'type': type, 'hasattr': hasattr,
            
            # String/conversion
            'ord': ord, 'chr': chr, 'repr': repr,
            
            # Import support for typing
            '__import__': __import__,
            
            # Exceptions for proper error handling
            'Exception': Exception, 'ValueError': ValueError,
            'TypeError': TypeError, 'IndexError': IndexError,
            'KeyError': KeyError, 'AttributeError': AttributeError,
        }
    
    def execute_code_safely(self, code: str, test_input: Any = None, 
                          timeout: float = 5.0) -> Tuple[ExecutionResult, Any, ExecutionMetrics, Optional[str]]:
        """Execute code safely with proper isolation and monitoring"""
        
        # Create isolated execution environment
        isolated_globals = {
            '__builtins__': self.allowed_builtins,
            '__name__': '__main__'
        }
        
        start_time = time.time()
        error_message = None
        result_data = None
        execution_result = ExecutionResult.SUCCESS
        
        try:
            # Compile the code first to catch syntax errors
            compiled_code = compile(code, '<string>', 'exec')
            
            # Execute with timeout using threading
            result_queue = queue.Queue()
            execution_thread = threading.Thread(
                target=self._execute_in_thread,
                args=(compiled_code, isolated_globals, test_input, result_queue)
            )
            
            execution_thread.daemon = True
            execution_thread.start()
            execution_thread.join(timeout)
            
            if execution_thread.is_alive():
                execution_result = ExecutionResult.TIMEOUT
                error_message = f"Execution timed out after {timeout}s"
            else:
                try:
                    thread_result = result_queue.get_nowait()
                    if isinstance(thread_result, Exception):
                        execution_result = ExecutionResult.RUNTIME_ERROR
                        error_message = str(thread_result)
                    else:
                        result_data = thread_result
                        execution_result = ExecutionResult.SUCCESS
                except queue.Empty:
                    execution_result = ExecutionResult.RUNTIME_ERROR
                    error_message = "No result returned from execution"
        
        except SyntaxError as e:
            execution_result = ExecutionResult.SYNTAX_ERROR
            error_message = f"Syntax error: {str(e)}"
        
        except Exception as e:
            execution_result = ExecutionResult.RUNTIME_ERROR
            error_message = f"Execution error: {str(e)}"
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Create metrics (simplified for thread-based execution)
        metrics = ExecutionMetrics(
            execution_time=execution_time,
            memory_usage=0,  # Would need psutil for accurate measurement
            cpu_time=execution_time,
            return_code=0 if execution_result == ExecutionResult.SUCCESS else 1,
            stdout="",  # Captured output would go here
            stderr=error_message or ""
        )
        
        return execution_result, result_data, metrics, error_message
    
    def _execute_in_thread(self, compiled_code: Any, isolated_globals: Dict[str, Any], 
                          test_input: Any, result_queue: queue.Queue):
        """Execute code in a separate thread for timeout control"""
        try:
            # Execute the compiled code
            exec(compiled_code, isolated_globals)
            
            # Find and call the main function
            functions = {k: v for k, v in isolated_globals.items() 
                        if callable(v) and not k.startswith('__')}
            
            if not functions:
                result_queue.put(Exception("No callable function found"))
                return
            
            # Get the first function (assumed to be main)
            main_function = list(functions.values())[0]
            
            # Execute with test input
            if test_input is not None:
                if isinstance(test_input, (list, tuple)):
                    result = main_function(*test_input)
                else:
                    result = main_function(test_input)
            else:
                result = main_function()
            
            result_queue.put(result)
            
        except Exception as e:
            result_queue.put(e)
    
    def execute_with_subprocess(self, code: str, test_input: Any = None, 
                               timeout: float = 5.0) -> Tuple[ExecutionResult, Any, ExecutionMetrics, Optional[str]]:
        """Execute code in isolated subprocess for maximum safety"""
        
        # Create temporary file for code execution
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
            # Write the code with test harness
            test_harness = f'''
import sys
import json

# User code
{code}

# Test execution
try:
    # Find the main function
    main_func = None
    for name, obj in globals().items():
        if callable(obj) and not name.startswith('_'):
            main_func = obj
            break
    
    if main_func is None:
        print(json.dumps({{"error": "No callable function found"}}))
        sys.exit(1)
    
    # Execute with test input
    test_input = {repr(test_input)}
    if test_input is not None:
        if isinstance(test_input, (list, tuple)):
            result = main_func(*test_input)
        else:
            result = main_func(test_input)
    else:
        result = main_func()
    
    print(json.dumps({{"result": result}}))
    
except Exception as e:
    print(json.dumps({{"error": str(e)}}))
    sys.exit(1)
'''
            temp_file.write(test_harness)
            temp_file.flush()
            
            start_time = time.time()
            
            try:
                # Execute subprocess with timeout and resource limits
                process = subprocess.Popen(
                    [sys.executable, temp_file.name],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    preexec_fn=self._set_subprocess_limits if os.name != 'nt' else None
                )
                
                stdout, stderr = process.communicate(timeout=timeout)
                end_time = time.time()
                
                execution_time = end_time - start_time
                
                if process.returncode == 0:
                    try:
                        import json
                        output_data = json.loads(stdout.strip())
                        if "error" in output_data:
                            return (ExecutionResult.RUNTIME_ERROR, None,
                                   self._create_metrics(execution_time, process, stdout, stderr),
                                   output_data["error"])
                        else:
                            return (ExecutionResult.SUCCESS, output_data["result"],
                                   self._create_metrics(execution_time, process, stdout, stderr),
                                   None)
                    except json.JSONDecodeError:
                        return (ExecutionResult.RUNTIME_ERROR, None,
                               self._create_metrics(execution_time, process, stdout, stderr),
                               f"Invalid output format: {stdout}")
                else:
                    return (ExecutionResult.RUNTIME_ERROR, None,
                           self._create_metrics(execution_time, process, stdout, stderr),
                           stderr or "Process exited with non-zero code")
            
            except subprocess.TimeoutExpired:
                process.kill()
                end_time = time.time()
                execution_time = end_time - start_time
                return (ExecutionResult.TIMEOUT, None,
                       self._create_metrics(execution_time, process, "", "Timeout"),
                       f"Execution timed out after {timeout}s")
            
            except Exception as e:
                end_time = time.time()
                execution_time = end_time - start_time
                return (ExecutionResult.RUNTIME_ERROR, None,
                       self._create_metrics(execution_time, None, "", str(e)),
                       f"Subprocess execution error: {str(e)}")
            
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_file.name)
                except OSError:
                    pass
    
    def _set_subprocess_limits(self):
        """Set resource limits for subprocess (Unix only)"""
        if not HAS_RESOURCE_MODULE:
            return
            
        try:
            # Set memory limit
            resource.setrlimit(resource.RLIMIT_AS, (self.max_memory_bytes, self.max_memory_bytes))
            
            # Set CPU time limit
            resource.setrlimit(resource.RLIMIT_CPU, (int(self.max_execution_time), int(self.max_execution_time)))
        except (AttributeError, OSError):
            # Resource limits not available on this system
            pass
    
    def _create_metrics(self, execution_time: float, process: Optional[subprocess.Popen], 
                       stdout: str, stderr: str) -> ExecutionMetrics:
        """Create execution metrics from subprocess results"""
        return ExecutionMetrics(
            execution_time=execution_time,
            memory_usage=0,  # Would need additional tools to measure
            cpu_time=execution_time,
            return_code=process.returncode if process else -1,
            stdout=stdout,
            stderr=stderr
        )
    
    def run_test_suite(self, code: str, test_cases: List[TestCase], 
                      use_subprocess: bool = False) -> ExecutionSummary:
        """Run a complete test suite against the code"""
        
        test_results = []
        total_execution_time = 0.0
        
        for test_case in test_cases:
            start_time = time.time()
            
            if use_subprocess:
                execution_result, actual_output, metrics, error_message = \
                    self.execute_with_subprocess(code, test_case.input_data, test_case.timeout)
            else:
                execution_result, actual_output, metrics, error_message = \
                    self.execute_code_safely(code, test_case.input_data, test_case.timeout)
            
            # Determine if test passed
            passed = (execution_result == ExecutionResult.SUCCESS and 
                     self._outputs_equal(actual_output, test_case.expected_output))
            
            test_result = TestResult(
                test_case=test_case,
                actual_output=actual_output,
                execution_result=execution_result,
                metrics=metrics,
                passed=passed,
                error_message=error_message
            )
            
            test_results.append(test_result)
            total_execution_time += metrics.execution_time
        
        # Calculate summary statistics
        passed_tests = sum(1 for result in test_results if result.passed)
        failed_tests = len(test_results) - passed_tests
        success_rate = passed_tests / len(test_results) if test_results else 0.0
        average_execution_time = total_execution_time / len(test_results) if test_results else 0.0
        
        return ExecutionSummary(
            total_tests=len(test_results),
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            success_rate=success_rate,
            total_execution_time=total_execution_time,
            average_execution_time=average_execution_time,
            test_results=test_results
        )
    
    def _outputs_equal(self, actual: Any, expected: Any) -> bool:
        """Compare outputs with tolerance for floating point numbers"""
        if type(actual) != type(expected):
            return False
        
        if isinstance(actual, float) and isinstance(expected, float):
            return abs(actual - expected) < 1e-9
        
        if isinstance(actual, (list, tuple)) and isinstance(expected, (list, tuple)):
            if len(actual) != len(expected):
                return False
            return all(self._outputs_equal(a, e) for a, e in zip(actual, expected))
        
        return actual == expected

# Test function
def test_execution_tester():
    """Test the execution tester with real code examples"""
    tester = ExecutionTester(max_execution_time=5.0, max_memory_mb=128)
    
    # Test case 1: Simple function
    factorial_code = '''def factorial(n):
    """Calculate factorial of n"""
    if n <= 1:
        return 1
    return n * factorial(n - 1)'''
    
    factorial_tests = [
        TestCase(5, 120, description="5! = 120"),
        TestCase(0, 1, description="0! = 1"),
        TestCase(3, 6, description="3! = 6"),
        TestCase(1, 1, description="1! = 1"),
    ]
    
    # Test case 2: Prime checker
    prime_code = '''def is_prime(n):
    """Check if n is prime"""
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True'''
    
    prime_tests = [
        TestCase(2, True, description="2 is prime"),
        TestCase(17, True, description="17 is prime"),
        TestCase(4, False, description="4 is not prime"),
        TestCase(1, False, description="1 is not prime"),
    ]
    
    # Test case 3: Code with error
    error_code = '''def divide(a, b):
    return a / b  # Will cause ZeroDivisionError'''
    
    error_tests = [
        TestCase([10, 2], 5.0, description="10 / 2 = 5"),
        TestCase([10, 0], None, description="Division by zero"),
    ]
    
    test_suites = [
        ("Factorial", factorial_code, factorial_tests),
        ("Prime Checker", prime_code, prime_tests),
        ("Error Handling", error_code, error_tests),
    ]
    
    print("🧪 Testing Execution Tester")
    print("=" * 50)
    
    overall_success_rate = 0.0
    total_suites = len(test_suites)
    
    for suite_name, code, test_cases in test_suites:
        print(f"\n📋 Test Suite: {suite_name}")
        
        summary = tester.run_test_suite(code, test_cases)
        
        print(f"   Total Tests: {summary.total_tests}")
        print(f"   Passed: {summary.passed_tests}")
        print(f"   Failed: {summary.failed_tests}")
        print(f"   Success Rate: {summary.success_rate:.1%}")
        print(f"   Average Execution Time: {summary.average_execution_time:.4f}s")
        
        overall_success_rate += summary.success_rate
        
        # Show individual test results
        for result in summary.test_results:
            status = "✅" if result.passed else "❌"
            print(f"     {status} {result.test_case.description}")
            if not result.passed and result.error_message:
                print(f"        Error: {result.error_message}")
    
    overall_success_rate /= total_suites
    print(f"\n🎯 Overall Success Rate: {overall_success_rate:.1%}")
    
    return overall_success_rate

if __name__ == "__main__":
    test_execution_tester()