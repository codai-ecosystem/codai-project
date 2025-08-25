#!/usr/bin/env python3

import sys
import os
import asyncio
sys.path.insert(0, '../..')
from autonomous_arc_agi_engine import AutonomousARCAGIEngine
import json
import numpy as np

async def analyze_arc_009():
    print('🔍 ANALYZING ARC_009 CONNECTED COMPONENTS')
    print('=' * 60)

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
        print(f"✅ Task: {arc_009['description']}")
        print(f"🎯 Category: {arc_009['category']}")
        print(f"📝 Rule: {arc_009['transformation_rule']}")
        print(f"🔥 Difficulty: {arc_009['difficulty']}")
        
        # Get task data
        train_input = np.array(arc_009['task_data']['train'][0]['input'])
        train_output = np.array(arc_009['task_data']['train'][0]['output'])
        test_input = np.array(arc_009['task_data']['test'][0]['input'])
        expected_output = np.array(arc_009['expected_output'])
        
        print('\n📊 TRAINING EXAMPLE:')
        print('🔍 Input:')
        print(train_input)
        print('✅ Expected Output:')
        print(train_output)
        
        print('\n📊 TEST CASE:')
        print('🔍 Test Input:')
        print(test_input)
        print('🎯 Expected Output:')
        print(expected_output)
        
        # Test current engine
        engine = AutonomousARCAGIEngine()
        result = await engine.solve_arc_agi_task(arc_009['task_data'])
        
        print('\n🤖 CURRENT ENGINE OUTPUT:')
        print('📊 Predicted:')
        print(np.array(result.predicted_output))
        print(f"❌ Match: {np.array_equal(result.predicted_output, expected_output)}")
        
        print('\n🔍 MANUAL ANALYSIS:')
        print('Pattern Analysis: Connected components detection and labeling')
        print('Expected Pattern: Identify separate connected components and assign unique labels')
        print('Training Example: Multiple disconnected regions should get different labels')
        print('Current Issue: Engine needs connected components detection algorithm')

if __name__ == '__main__':
    asyncio.run(analyze_arc_009())