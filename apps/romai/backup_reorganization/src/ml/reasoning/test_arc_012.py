#!/usr/bin/env python3

import sys
import os
import asyncio
sys.path.insert(0, '../..')
from autonomous_arc_agi_engine import AutonomousARCAGIEngine
import json
import numpy as np

async def test_arc_012():
    print('🧠 Testing ARC-AGI Boundary Extraction - Arc_012')
    print('=' * 80)

    # Initialize engine
    engine = AutonomousARCAGIEngine()

    # Load training data
    with open('../../../training_data/arc_agi_training_data.json', 'r') as f:
        training_data = json.load(f)

    # Find arc_012 task
    arc_012 = None
    for task in training_data:
        if task['task_id'] == 'arc_task_012_boundary_extraction':
            arc_012 = task
            break

    if arc_012:
        print(f"✅ Found task: {arc_012['description']}")
        print(f"🎯 Category: {arc_012['category']}")
        print(f"📝 Rule: {arc_012['transformation_rule']}")
        
        # Convert to numpy arrays  
        train_input = np.array(arc_012['task_data']['train'][0]['input'])
        train_output = np.array(arc_012['task_data']['train'][0]['output'])
        test_input = np.array(arc_012['task_data']['test'][0]['input'])
        expected_output = np.array(arc_012['expected_output'])
        
        print(f"\n📊 Input shape: {train_input.shape}")
        print('🔍 Training Input:')
        print(train_input)
        print('✅ Expected Training Output:')  
        print(train_output)
        
        # Test the engine with correct format
        result = await engine.solve_arc_agi_task(arc_012['task_data'])
        
        print('\n🚀 ENGINE RESULT:')
        print(f'📊 Predicted Output:')
        print(np.array(result.predicted_output))
        print(f'🎯 Expected Output:')
        print(expected_output)
        print(f'✅ Match: {np.array_equal(result.predicted_output, expected_output)}')
        print(f'🧠 Reasoning Steps: {result.reasoning_steps}')
        print(f'📈 Confidence: {result.confidence_score:.1%}')
        print(f'🎯 Pattern: {result.pattern_identified}')
        print(f'🔧 Rule: {result.transformation_rule}')
        
        if np.array_equal(result.predicted_output, expected_output):
            print('\n🎉 ARC_012 BOUNDARY EXTRACTION: SUCCESS!')
            print('📈 Expected improvement from 80.0% to 86.7% (13/15 tasks)')
        else:
            print('\n❌ Arc_012 still failing - need to debug')
            
    else:
        print('❌ Task arc_012 not found!')

if __name__ == "__main__":
    asyncio.run(test_arc_012())