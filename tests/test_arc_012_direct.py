import sys
sys.path.insert(0, 'apps/romai/src')
from ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine
import numpy as np
import asyncio

async def test_engine_direct():
    engine = AutonomousARCAGIEngine()
    
    # Create task data in the format the engine expects
    task_data = {
        'id': 'arc_012',
        'train': [
            {
                'input': [
                    [0, 0, 0, 0],
                    [0, 1, 1, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0]
                ],
                'output': [
                    [0, 0, 0, 0],
                    [0, 1, 1, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0]
                ]
            }
        ],
        'test': [
            {
                'input': [
                    [2, 2, 2, 2],
                    [2, 2, 2, 2],
                    [2, 2, 2, 2],
                    [2, 2, 2, 2]
                ]
            }
        ]
    }
    
    print('🧠 Testing Engine with Direct Task Format')
    print('=' * 50)
    
    result = await engine.solve_arc_agi_task(task_data)
    
    expected = np.array([
        [2, 2, 2, 2],
        [2, 0, 0, 2],
        [2, 0, 0, 2],
        [2, 2, 2, 2]
    ])
    
    print('Expected:')
    print(expected)
    print('Predicted:')
    if result.predicted_output:
        predicted = np.array(result.predicted_output)
        print(predicted)
        print(f'Match: {np.array_equal(predicted, expected)}')
    else:
        print('Empty output!')
    
    print(f'Success: {result.success}')
    print(f'Confidence: {result.confidence_score}')
    print(f'Rule: {result.transformation_rule}')
    print('Reasoning:', result.reasoning_steps)

asyncio.run(test_engine_direct())