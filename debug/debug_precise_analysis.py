import sys
sys.path.insert(0, 'apps/romai/src')
from ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine, AbstractReasoningEngine
import numpy as np
import asyncio

async def debug_precise_analysis():
    engine = AutonomousARCAGIEngine()
    reasoning_engine = engine.reasoning_engine
    
    # Create task data
    training_pairs = [
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
    ]
    
    # Set task data for consistent transformation testing
    reasoning_engine._current_task_data = {
        'train': training_pairs
    }
    
    print('🔍 PRECISE DEBUG: Analysis Step by Step')
    print('=' * 60)
    
    # Step 1: Pattern Analysis
    all_patterns = []
    transformations = []
    
    for i, pair in enumerate(training_pairs):
        input_grid = pair['input']
        output_grid = pair['output']
        
        print(f'\\n--- Example {i+1} ---')
        
        # Pattern analyzer result
        pattern_info = reasoning_engine.pattern_analyzer.analyze_grid_patterns([input_grid, output_grid])
        all_patterns.append(pattern_info)
        print(f'Pattern analyzer result: {pattern_info}')
        
        # Direct transformation identification
        transformation = reasoning_engine._identify_transformation(input_grid, output_grid)
        transformations.append(transformation)
        print(f'Direct transformation: {transformation}')
    
    # Step 2: Find dominant pattern vs consistent transformation
    print(f'\\n--- Final Analysis ---')
    print(f'All patterns: {all_patterns}')
    print(f'All transformations: {transformations}')
    
    dominant_pattern = reasoning_engine._find_dominant_pattern(all_patterns)
    print(f'Dominant pattern: {dominant_pattern}')
    
    consistent_transformation = reasoning_engine._find_consistent_transformation(transformations)
    print(f'Consistent transformation: {consistent_transformation}')
    
    # Step 3: What gets returned
    final_result = {
        'dominant_pattern': dominant_pattern,
        'transformation_rule': consistent_transformation,
    }
    print(f'Final result: {final_result}')

asyncio.run(debug_precise_analysis())