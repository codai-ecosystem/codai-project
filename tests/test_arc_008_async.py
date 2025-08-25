#!/usr/bin/env python3
"""
Test arc_008 compound transformation using the async API like the main test
"""

import sys
sys.path.insert(0, 'apps/romai/src')
from ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine
import json
import asyncio

async def test_arc_008_async():
    print("🧪 Testing ARC_008 with Async API")
    print("="*40)
    
    # Load the actual task data
    with open('apps/romai/training_data/arc_agi_training_data.json', 'r') as f:
        training_data = json.load(f)
    
    # Find arc_008 task
    task_data = None
    for task in training_data:
        if task['task_id'] == 'arc_task_008_complex_rotation':
            task_data = task
            break
    
    if not task_data:
        print("❌ Arc_008 not found!")
        return
    
    print(f"Task: {task_data['task_id']}")
    print(f"Transformation: {task_data['transformation_rule']}")
    
    # Test input
    input_grid = task_data['task_data']['test'][0]['input']
    expected_output = task_data['expected_output']
    
    print("\nInput:")
    for row in input_grid:
        print(row)
    
    print("\nExpected (180° rotation + color increment):")
    for row in expected_output:
        print(row)
    
    # Use the engine
    engine = AutonomousARCAGIEngine()
    result = await engine.solve_arc_agi_task(task_data['task_data'])
    
    print(f"\n🔍 Engine result:")
    print(f"Success: {result.success}")
    print(f"Confidence: {result.confidence_score}")
    print(f"Transformation: {result.transformation_rule}")
    
    if hasattr(result, 'solution'):
        print("\nActual output:")
        for row in result.solution:
            print(row)
        
        # Check if correct
        matches = result.solution == expected_output
        print(f"\n✅ Matches expected: {matches}")
        
        if not matches:
            print("❌ Output mismatch detected!")

if __name__ == "__main__":
    asyncio.run(test_arc_008_async())