"""Debug calculus parsing in enhanced parser"""

from enhanced_math_expression_parser import EnhancedMathExpressionParser

parser = EnhancedMathExpressionParser()

# Test exactly what the benchmark uses
test = 'derivative of x^2'
print(f'Testing: "{test}"')

parse_result = parser.parse_mathematical_expression(test)
print(f'Parse result:')
print(f'  success: {parse_result.success}')
print(f'  confidence: {parse_result.confidence}')
print(f'  expression: "{parse_result.expression}"')
print(f'  pattern: {parse_result.pattern_type}')

# Check if it meets the 0.7 confidence threshold
if parse_result.success and parse_result.confidence >= 0.7:
    processed = parser._process_special_functions(parse_result.expression)
    print(f'✅ Should work! Processed: "{processed}"')
    
    import sympy as sp
    try:
        result = sp.sympify(processed)
        print(f'✅ SymPy result: {result}')
    except Exception as e:
        print(f'❌ SymPy error: {e}')
else:
    print(f'❌ Would not use enhanced parser - confidence {parse_result.confidence} < 0.7 or success={parse_result.success}')