#!/usr/bin/env python3
"""
Test advanced pattern detection on arc_008 specifically
"""

import sys
sys.path.insert(0, 'apps/romai/src')
from ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine
import numpy as np

def test_arc_008_detection():
    print("🔍 Testing Advanced Pattern Detection on Arc_008")
    print("="*50)
    
    # Arc_008 data
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
    
    # Convert to numpy
    input_array = np.array(input_grid)
    output_array = np.array(expected_output)
    
    print("Input:")
    print(input_array)
    print("\nExpected output:")
    print(output_array)
    
    # Extract pattern elements
    center_in = input_array[1, 1]
    corners_in = [input_array[0,0], input_array[0,2], input_array[2,0], input_array[2,2]]
    edges_in = [input_array[0,1], input_array[1,0], input_array[1,2], input_array[2,1]]
    
    center_out = output_array[1, 1]
    corners_out = [output_array[0,0], output_array[0,2], output_array[2,0], output_array[2,2]]
    edges_out = [output_array[0,1], output_array[1,0], output_array[1,2], output_array[2,1]]
    
    print(f"\nPattern Analysis:")
    print(f"Center in: {center_in}, Center out: {center_out}")
    print(f"Corners in: {corners_in}")
    print(f"Corners out: {corners_out}")
    print(f"Edges in: {edges_in}")
    print(f"Edges out: {edges_out}")
    
    # Check conditions
    corners_all_same = len(set(corners_in)) == 1
    edges_all_same = len(set(edges_in)) == 1
    
    print(f"\nConditions:")
    print(f"Corners all same: {corners_all_same} (set: {set(corners_in)})")
    print(f"Edges all same: {edges_all_same} (set: {set(edges_in)})")
    
    if corners_all_same and edges_all_same:
        print("WARNING: This would match advanced pattern!")
        # Check other conditions
        center_to_corners = center_out == corners_in[0]
        corners_to_center = all(c == center_in for c in corners_out)
        edges_same = edges_in == edges_out
        
        print(f"Center to corners: {center_to_corners}")
        print(f"Corners to center: {corners_to_center}")
        print(f"Edges same: {edges_same}")
        
        final_match = center_to_corners and corners_to_center and edges_same
        print(f"FINAL ADVANCED PATTERN MATCH: {final_match}")
    else:
        print("✅ Does NOT match advanced pattern (as expected)")
    
    # Test with actual engine
    engine = AutonomousARCAGIEngine()
    reasoning_engine = engine.reasoning_engine
    
    actual_detection = reasoning_engine._detect_advanced_pattern(input_array, output_array)
    print(f"\n🔍 Actual engine detection: {actual_detection}")

if __name__ == "__main__":
    test_arc_008_detection()