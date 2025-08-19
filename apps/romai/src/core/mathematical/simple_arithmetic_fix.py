"""
Simple arithmetic solver for mathematical engine
Provides a direct, reliable solution for basic mathematical expressions
"""
import re
import math

def solve_arithmetic_simple(problem: str) -> dict:
    """Simple and reliable arithmetic solver"""
    steps = []
    problem_lower = problem.lower()
    
    # Handle square root
    if any(pattern in problem_lower for pattern in ['sqrt', 'square root', '√']):
        numbers = re.findall(r'\d+\.?\d*', problem)
        if numbers:
            num = float(numbers[0])
            result = math.sqrt(num)
            steps.append(f"Square root of {num}")
            steps.append(f"√{num} = {result}")
            return {'solution': result, 'steps': steps, 'confidence': 0.98}
    
    # Handle power/exponent
    if '^' in problem or '**' in problem:
        # Convert ^ to ** for Python
        expr = problem.replace('^', '**')
        # Extract just the mathematical expression
        expr = re.sub(r'[^0-9+\-*/\(\)\.\s*]', '', expr)
        if expr.strip():
            try:
                result = eval(expr)
                steps.append(f"Power calculation: {expr}")
                steps.append(f"Result: {result}")
                return {'solution': float(result), 'steps': steps, 'confidence': 0.95}
            except:
                pass
    
    # Handle basic mathematical expressions
    # Extract the core mathematical expression from the problem
    expression = problem.strip()
    
    # Remove common question words
    for word in ['what', 'is', 'calculate', 'compute', 'find', 'solve']:
        expression = re.sub(r'\b' + re.escape(word) + r'\b', '', expression, flags=re.IGNORECASE)
    
    # Remove question mark specifically
    expression = expression.replace('?', '')
    
    expression = expression.strip()
    
    # Clean to keep only mathematical characters
    clean_expr = re.sub(r'[^0-9+\-*/\(\)\.\s]', '', expression)
    clean_expr = clean_expr.strip()
    
    if clean_expr and re.match(r'^[0-9+\-*/\(\)\.\s]+$', clean_expr):
        try:
            result = eval(clean_expr)
            steps.append(f"Original: {problem}")
            steps.append(f"Expression: {clean_expr}")
            steps.append(f"Result: {result}")
            return {'solution': float(result), 'steps': steps, 'confidence': 0.95}
        except Exception as e:
            steps.append(f"Evaluation error: {e}")
    
    # Fallback to simple number extraction
    numbers = re.findall(r'\d+\.?\d*', problem)
    if numbers:
        nums = [float(n) for n in numbers]
        if '+' in problem:
            result = sum(nums)
            steps.append(f"Addition: {' + '.join(numbers)} = {result}")
            return {'solution': result, 'steps': steps, 'confidence': 0.80}
        elif '*' in problem and len(nums) >= 2:
            result = nums[0] * nums[1]
            steps.append(f"Multiplication: {nums[0]} * {nums[1]} = {result}")
            return {'solution': result, 'steps': steps, 'confidence': 0.80}
        elif '/' in problem and len(nums) >= 2 and nums[1] != 0:
            result = nums[0] / nums[1]
            steps.append(f"Division: {nums[0]} / {nums[1]} = {result}")
            return {'solution': result, 'steps': steps, 'confidence': 0.80}
        elif '-' in problem and len(nums) >= 2:
            result = nums[0] - nums[1]
            steps.append(f"Subtraction: {nums[0]} - {nums[1]} = {result}")
            return {'solution': result, 'steps': steps, 'confidence': 0.80}
    
    return {'solution': 0, 'steps': ['Could not solve arithmetic problem'], 'confidence': 0.1}

# Test the simple solver
if __name__ == "__main__":
    test_cases = [
        '15 * 4 + 20',
        '100 / 5 - 8', 
        'sqrt(64)',
        '12 + 8',
        '7 * 6'
    ]
    
    print("Testing simple arithmetic solver:")
    for case in test_cases:
        result = solve_arithmetic_simple(case)
        print(f"{case} = {result['solution']} (confidence: {result['confidence']:.1%})")
