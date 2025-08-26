#!/usr/bin/env python3
import sympy as sp

def test_sympy_diff_directly():
    """Test SymPy differentiation directly to isolate the issue"""
    
    print("Testing SymPy differentiation directly...")
    
    # Test what our engine should be doing
    x = sp.Symbol('x')
    
    # Test the exact function our parsing creates
    function = "x³"
    print(f"Original function: {function}")
    
    # Apply our conversions
    function = function.replace('³', '**3')
    print(f"After conversion: {function}")
    
    try:
        f = sp.sympify(function)
        print(f"SymPy parsed: {f}")
        
        derivative = sp.diff(f, x)
        print(f"Derivative: {derivative}")
        print(f"Type: {type(derivative)}")
        
        # Test conversion to float (this might be where the error comes from)
        try:
            float_val = float(derivative)
            print(f"Float conversion: {float_val}")
        except Exception as e:
            print(f"Float conversion failed (expected): {e}")
            
        # Test string conversion
        str_val = str(derivative)
        print(f"String conversion: {str_val}")
        
        # Test LaTeX conversion
        if hasattr(sp, 'latex'):
            latex_val = sp.latex(derivative)
            print(f"LaTeX conversion: {latex_val}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_sympy_diff_directly()