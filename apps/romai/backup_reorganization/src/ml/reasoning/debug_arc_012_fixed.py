import sys
sys.path.insert(0, '../..')
from autonomous_arc_agi_engine import AutonomousARCAGIEngine
import numpy as np
import asyncio

# Test with the full engine
engine = AutonomousARCAGIEngine()

test_input = np.array([
    [2, 2, 2, 2],
    [2, 2, 2, 2],
    [2, 2, 2, 2],
    [2, 2, 2, 2]
])

expected_output = np.array([
    [2, 2, 2, 2],
    [2, 0, 0, 2],
    [2, 0, 0, 2],
    [2, 2, 2, 2]
])

# Test solve task
async def test():
    task_data = {
        'input_array': test_input,
        'expected_output': expected_output,
        'task_name': 'arc_012_boundary_extraction',
        'transformation_rule': 'extract_boundary'
    }
    
    result = await engine.solve_arc_agi_task(task_data)
    print('🧠 Full Engine Test Result')
    print('=' * 40)
    print('Expected Output:')
    print(expected_output)
    print('Actual Output:')
    print(result.output_array)
    match = np.array_equal(result.output_array, expected_output)
    print(f'Match: {match}')
    print('Reasoning:', result.reasoning_steps)
    print('Confidence:', result.confidence)

asyncio.run(test())