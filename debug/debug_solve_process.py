import sys
sys.path.insert(0, 'apps/romai/src')
from ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine, AbstractReasoningEngine
import numpy as np
import asyncio

async def debug_solve_process():
    engine = AutonomousARCAGIEngine()
    
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
    
    print('🔍 DEBUG: Full Solve Process')
    print('=' * 50)
    
    # Step 1: Manually test training analysis
    training_pairs = task_data.get('train', [])
    print(f'Training pairs: {len(training_pairs)}')
    
    # Step 2: Test analyze_training_examples
    reasoning_engine = engine.reasoning_engine
    pattern_analysis = await reasoning_engine._analyze_training_examples(training_pairs)
    print(f'Pattern analysis result: {pattern_analysis}')
    
    # Step 3: Test generate_solution
    test_input = task_data.get('test', [{}])[0].get('input', [])
    predicted_output, confidence, reasoning = await reasoning_engine._generate_solution(
        test_input, pattern_analysis
    )
    
    print(f'Generated output: {predicted_output}')
    print(f'Confidence: {confidence}')
    print(f'Reasoning: {reasoning}')
    
    # Compare with expected
    expected = [
        [2, 2, 2, 2],
        [2, 0, 0, 2],
        [2, 0, 0, 2],
        [2, 2, 2, 2]
    ]
    
    print('Expected:')
    for row in expected:
        print(row)
    
    if predicted_output:
        match = np.array_equal(predicted_output, expected)
        print(f'Match: {match}')

asyncio.run(debug_solve_process())