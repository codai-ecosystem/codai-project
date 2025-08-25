import numpy as np
import sys
import os
import json

# Add the path to import the ARC-AGI engine
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

from ml.reasoning.autonomous_arc_agi_engine import AbstractReasoningEngine, AutonomousARCAGIEngine

def debug_arc_015():
    """Debug why arc_015 is still failing"""
    
    print('🔍 DEBUGGING ARC-015 FAILURE')
    print('=' * 50)
    
    # Load the training data to get exact task details
    with open('apps/romai/training_data/arc_agi_training_data.json', 'r') as f:
        training_data = json.load(f)
    
    # Find arc_015 task
    arc_015_task = None
    for task in training_data:
        if task.get('task_data', {}).get('id') == 'arc_015':
            arc_015_task = task
            break
    
    if not arc_015_task:
        print('❌ Arc_015 task not found')
        return
    
    test_input = np.array(arc_015_task['task_data']['test'][0]['input'])
    expected_output = np.array(arc_015_task['expected_output'])
    
    print('🧪 Task Details:')
    print('Input:')
    print(test_input)
    print('Expected Output:')
    print(expected_output)
    
    # Test detection algorithm
    reasoning_engine = AbstractReasoningEngine()
    
    print('\\n🔍 Testing Detection Algorithm:')
    detects_advanced = reasoning_engine._detect_advanced_pattern(test_input, expected_output)
    print(f'_detect_advanced_pattern: {detects_advanced}')
    
    # Test transformation identification
    transformation = reasoning_engine._identify_transformation(test_input, expected_output)
    print(f'Identified transformation: {transformation}')
    
    # Test solve method directly
    print('\\n🧪 Testing Solve Method:')
    solve_result = reasoning_engine._solve_advanced_pattern(test_input)
    print('Solve Result:')
    print(solve_result)
    
    perfect_match = np.array_equal(solve_result, expected_output)
    print(f'Perfect Match: {perfect_match}')
    
    # Test full engine workflow
    print('\\n🔬 Testing Full Engine Workflow:')
    full_engine = AutonomousARCAGIEngine()
    
    try:
        full_result = full_engine.solve_arc_agi_task('arc_015', test_input, expected_output)
        print(f'Full engine result success: {full_result.success}')
        print(f'Full engine confidence: {full_result.confidence}')
        print('Full engine output:')
        print(full_result.output)
        
        full_match = np.array_equal(full_result.output, expected_output)
        print(f'Full engine perfect match: {full_match}')
        
    except Exception as e:
        print(f'❌ Full engine error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_arc_015()