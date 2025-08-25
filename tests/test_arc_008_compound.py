#!/usr/bin/env python3
"""
Test arc_008 compound transformation specifically
"""

import sys
sys.path.insert(0, 'apps/romai/src')
from ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine
import numpy as np
import asyncio

async def test_arc_008():
    print("🧪 Testing ARC_008 Compound Transformation")
    print("="*50)
    
    engine = AutonomousARCAGIEngine()
    
    # Test input
    input_grid = [
        [1, 0, 2],
        [2, 1, 0],
        [0, 2, 1]
    ]
    
    # Expected output (180-degree rotation + color increment)
    expected_output = [
        [2, 3, 1],
        [1, 2, 3],
        [3, 1, 2]
    ]
    
    print("Input:")
    for row in input_grid:
        print(row)
    
    print("\nExpected output (180-degree rotation + color increment):")
    for row in expected_output:
        print(row)
    
    # Test transformation detection
    reasoning_engine = engine.reasoning_engine
    transformation = reasoning_engine._identify_transformation(
        [input_grid], [expected_output]
    )
    print(f"\n🔍 Detected transformation: {transformation}")
    
    # Test if this is detected as compound
    is_compound = reasoning_engine._is_compound_transformation(
        [input_grid], [expected_output]
    )
    print(f"🔍 Is compound: {is_compound}")
    
    if is_compound:
        compound_transformations = reasoning_engine._get_compound_transformation_candidates(
            [input_grid], [expected_output]
        )
        print(f"🔍 Compound candidates: {compound_transformations}")
    
    # Test each component
    print("\n🧪 Testing 180-degree rotation alone:")
    rotated = np.rot90(np.rot90(np.array(input_grid)))
    print("Rotated 180 degrees:")
    print(rotated.tolist())
    
    print("\n🧪 Testing color increment after rotation:")
    rotated_and_incremented = rotated + 1
    print("Rotated + incremented:")
    print(rotated_and_incremented.tolist())
    
    # Check if this matches expected
    matches = np.array_equal(rotated_and_incremented, expected_output)
    print(f"\n✅ Matches expected: {matches}")

if __name__ == "__main__":
    asyncio.run(test_arc_008())