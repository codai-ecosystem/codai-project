#!/usr/bin/env python3
import re
import sympy as sp

def debug_calculus_parsing():
    # Test integration parsing
    problem = "∫(x²)dx"
    print(f"Testing: {problem}")
    
    int_match = re.search(r'∫\(([^)]+)\)d([a-z])', problem)
    if int_match:
        function = int_match.group(1)
        variable = int_match.group(2)
        
        print(f"Original function: '{function}'")
        print(f"Variable: '{variable}'")
        
        # Apply our transformations
        function = function.replace('²', '**2').replace('³', '**3').replace('⁴', '**4').replace('⁵', '**5')
        print(f"After superscript conversion: '{function}'")
        
        function = re.sub(r'(\d+)([a-z])', r'\1*\2', function)  # 2x → 2*x
        function = re.sub(r'([a-z])(\d+)', r'\1**\2', function)  # x2 → x**2 
        print(f"After implicit multiplication: '{function}'")
        
        try:
            x = sp.Symbol(variable)
            f = sp.sympify(function)
            print(f"SymPy parsed as: {f}")
            
            integral = sp.integrate(f, x)
            print(f"Integral: {integral}")
            
            simplified = sp.simplify(integral)
            print(f"Simplified: {simplified}")
            print(f"Final result: {simplified} + C")
        except Exception as e:
            print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test differentiation parsing  
    problem = "d/dx(x³)"
    print(f"Testing: {problem}")
    
    deriv_match = re.search(r'd/dx\(([^)]+)\)', problem)
    if deriv_match:
        function = deriv_match.group(1)
        print(f"Original function: '{function}'")
        
        # Apply our transformations
        function = function.replace('²', '**2').replace('³', '**3').replace('⁴', '**4').replace('⁵', '**5')
        print(f"After superscript conversion: '{function}'")
        
        function = re.sub(r'(\d+)([a-z])', r'\1*\2', function)  # 2x → 2*x
        function = re.sub(r'([a-z])(\d+)', r'\1**\2', function)  # x2 → x**2
        print(f"After implicit multiplication: '{function}'")
        
        try:
            x = sp.Symbol('x')
            f = sp.sympify(function)
            print(f"SymPy parsed as: {f}")
            
            derivative = sp.diff(f, x)
            print(f"Derivative: {derivative}")
            
            simplified = sp.simplify(derivative)
            print(f"Simplified: {simplified}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    debug_calculus_parsing()