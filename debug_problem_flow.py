#!/usr/bin/env python3
import asyncio
import sys
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import RealNeuralMathematicalEngine

async def debug_problem_classification():
    engine = RealNeuralMathematicalEngine()
    
    # Get access to the internal methods for debugging
    problem = '∫(x²)dx'
    print(f"Testing problem: {problem}")
    
    # Check problem type classification
    problem_type = engine._classify_problem_type(problem)
    print(f"Problem type: {problem_type}")
    
    # Check complex expression parsing
    if hasattr(engine, '_parse_complex_expression'):
        expression, parsing_steps = engine._parse_complex_expression(problem)
        print(f"Parsed expression: {expression}")
        print(f"Parsing steps: {parsing_steps}")
    
    print("\n" + "="*50 + "\n")
    
    # Test differentiation
    problem2 = 'd/dx(x³)'
    print(f"Testing problem: {problem2}")
    
    problem_type2 = engine._classify_problem_type(problem2)
    print(f"Problem type: {problem_type2}")
    
    if hasattr(engine, '_parse_complex_expression'):
        expression2, parsing_steps2 = engine._parse_complex_expression(problem2)
        print(f"Parsed expression: {expression2}")
        print(f"Parsing steps: {parsing_steps2}")

if __name__ == "__main__":
    asyncio.run(debug_problem_classification())