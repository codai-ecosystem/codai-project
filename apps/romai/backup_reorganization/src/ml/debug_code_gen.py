"""
Code Generation Test - Debug the code generation process
"""

import asyncio
from code_generation_engine import CodeGenerationEngine, CodeGenerationRequest

async def debug_code_generation():
    """Debug the code generation process"""
    engine = CodeGenerationEngine()
    
    test_prompts = [
        """def has_close_elements(numbers: List[float], threshold: float) -> bool:
    \"\"\" Check if in given list of numbers, are any two numbers closer to each other than
    given threshold.
    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)
    False
    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)
    True
    \"\"\"
""",
        """def truncate_number(number: float) -> float:
    \"\"\" Given a positive floating point number, it can be decomposed into
    and integer part (largest integer smaller than given number) and decimals
    (leftover part always smaller than 1).

    Return the decimal part of the number.
    >>> truncate_number(3.5)
    0.5
    \"\"\"
"""
    ]
    
    for i, prompt in enumerate(test_prompts):
        print(f"\n=== Test {i+1} ===")
        print(f"Prompt: {prompt[:100]}...")
        
        request = CodeGenerationRequest(prompt=prompt, temperature=0.1)
        result = await engine.generate_code(request)
        
        print(f"Generated Code:")
        print(result.code)
        print(f"Syntax Valid: {result.syntax_valid}")
        print(f"Execution Success: {result.execution_success}")
        if result.error_message:
            print(f"Error: {result.error_message}")

if __name__ == "__main__":
    asyncio.run(debug_code_generation())