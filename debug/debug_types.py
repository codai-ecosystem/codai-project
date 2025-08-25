#!/usr/bin/env python3
"""
Debug the data type issue in arc_008
"""

import numpy as np

def debug_types():
    print("🔍 Debugging Data Types")
    print("="*30)
    
    input_grid = [
        [1, 0, 2],
        [2, 1, 0],
        [0, 2, 1]
    ]
    
    expected_output = [
        [2, 3, 1],
        [1, 2, 3],
        [3, 1, 2]
    ]
    
    # Convert to numpy arrays
    input_array = np.array(input_grid)
    output_array = np.array(expected_output)
    
    print(f"Input array type: {type(input_array)}")
    print(f"Input array shape: {input_array.shape}")
    print(f"Input array dtype: {input_array.dtype}")
    print(f"Input [0,0] type: {type(input_array[0,0])}")
    print(f"Input [0,0] value: {input_array[0,0]}")
    print(f"Input [0,0] has item: {hasattr(input_array[0,0], 'item')}")
    
    try:
        val = input_array[0,0].item()
        print(f"Input [0,0] item(): {val}, type: {type(val)}")
    except Exception as e:
        print(f"Error with item(): {e}")
    
    print("\n" + "="*30)
    
    # Test the same with list of lists input
    print("Testing with list conversion:")
    examples_input = [input_grid]
    examples_output = [expected_output]
    
    input_array_from_list = np.array(examples_input[0])
    output_array_from_list = np.array(examples_output[0])
    
    print(f"From list - Input [0,0] type: {type(input_array_from_list[0,0])}")
    print(f"From list - Input [0,0] value: {input_array_from_list[0,0]}")
    
    try:
        val = input_array_from_list[0,0].item()
        print(f"From list - Input [0,0] item(): {val}, type: {type(val)}")
    except Exception as e:
        print(f"From list - Error with item(): {e}")

if __name__ == "__main__":
    debug_types()