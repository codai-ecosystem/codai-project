#!/usr/bin/env python3

import sys
import os
import asyncio
sys.path.insert(0, '../..')
from autonomous_arc_agi_engine import AutonomousARCAGIEngine
import json
import numpy as np

async def test_arc_009():
    print('🧠 Testing ARC-AGI Connected Components Marking - Arc_009')
    print('=' * 80)

    # Initialize engine
    engine = AutonomousARCAGIEngine()

    # Load training data
    with open('../../../training_data/arc_agi_training_data.json', 'r') as f:
        training_data = json.load(f)

    # Find arc_009 task
    arc_009 = None
    for task in training_data:
        if task['task_id'] == 'arc_task_009_connected_components':
            arc_009 = task
            break

    if arc_009:
        print(f"✅ Found task: {arc_009['description']}")
        print(f"🎯 Category: {arc_009['category']}")
        print(f"📝 Rule: {arc_009['transformation_rule']}")
        
        # Convert to numpy arrays  
        train_input = np.array(arc_009['task_data']['train'][0]['input'])
        train_output = np.array(arc_009['task_data']['train'][0]['output'])
        test_input = np.array(arc_009['task_data']['test'][0]['input'])
        expected_output = np.array(arc_009['expected_output'])
        
        print(f"\n📊 Input shape: {train_input.shape}")
        print('🔍 Training Input:')
        print(train_input)
        print('✅ Expected Training Output:')  
        print(train_output)
        
        # Test the engine with correct format
        result = await engine.solve_arc_agi_task(arc_009['task_data'])
        
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
            print('\n🎉 ARC_009 CONNECTED COMPONENTS MARKING: SUCCESS!')
            print('📈 Expected improvement from 73.3% to 80.0% (12/15 tasks)')
        else:
            print('\n❌ Arc_009 still failing - need to debug')
            
    else:
        print('❌ Task arc_009 not found!')

if __name__ == "__main__":
    asyncio.run(test_arc_009())