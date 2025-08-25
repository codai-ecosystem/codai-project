import sys
sys.path.insert(0, 'apps/romai/src')
from ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine, AbstractReasoningEngine
import numpy as np
import asyncio

async def debug_transformation_finding():
    engine = AutonomousARCAGIEngine()
    reasoning_engine = engine.reasoning_engine
    
    # Create task data
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
            },
            {
                'input': [
                    [1, 1, 1],
                    [1, 1, 1],
                    [1, 1, 1]
                ],
                'output': [
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 1, 1]
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
    
    # Set current task data BEFORE calling the methods
    reasoning_engine._current_task_data = task_data
    
    print('🔍 DEBUG: Transformation Finding in Context')
    print('=' * 50)
    
    transformations = []
    for i, pair in enumerate(task_data['train']):
        input_grid = np.array(pair['input'])
        output_grid = np.array(pair['output'])
        transformation = reasoning_engine._identify_transformation(input_grid, output_grid)
        transformations.append(transformation)
        print(f'Example {i+1} transformation: {transformation}')
    
    print(f'All transformations: {transformations}')
    
    # Test find_consistent_transformation with task data set
    consistent = reasoning_engine._find_consistent_transformation(transformations)
    print(f'Consistent transformation (with task data): {consistent}')

asyncio.run(debug_transformation_finding())