import numpy as np

def analyze_arc_015():
    """Analyze the arc_015_advanced_pattern transformation rule"""
    
    print('🔍 ARC-015 ADVANCED PATTERN ANALYSIS')
    print('=' * 50)
    
    # Training examples
    examples = [
        {
            'name': 'Example 1',
            'input': np.array([
                [1, 2, 1],
                [2, 3, 2], 
                [1, 2, 1]
            ]),
            'output': np.array([
                [3, 2, 3],
                [2, 1, 2],
                [3, 2, 3]
            ])
        },
        {
            'name': 'Example 2',
            'input': np.array([
                [2, 1, 2],
                [1, 4, 1],
                [2, 1, 2]
            ]),
            'output': np.array([
                [4, 1, 4],
                [1, 2, 1],
                [4, 1, 4]
            ])
        }
    ]
    
    # Test case
    test_input = np.array([
        [1, 3, 1],
        [3, 2, 3],
        [1, 3, 1]
    ])
    
    expected_output = np.array([
        [2, 3, 2],
        [3, 1, 3],
        [2, 3, 2]
    ])
    
    for example in examples:
        print(f'\\n📊 {example["name"]}:')
        print('Input:')
        print(example['input'])
        print('Output:')
        print(example['output'])
        
        # Analyze positions
        print('\\nPosition Analysis:')
        inp, out = example['input'], example['output']
        
        # Positions: corners (0,0), (0,2), (2,0), (2,2)
        #           edges (0,1), (1,0), (1,2), (2,1)  
        #           center (1,1)
        
        corners_in = [inp[0,0], inp[0,2], inp[2,0], inp[2,2]]
        edges_in = [inp[0,1], inp[1,0], inp[1,2], inp[2,1]]
        center_in = inp[1,1]
        
        corners_out = [out[0,0], out[0,2], out[2,0], out[2,2]]
        edges_out = [out[0,1], out[1,0], out[1,2], out[2,1]]
        center_out = out[1,1]
        
        print(f'  Corners: {corners_in} -> {corners_out}')
        print(f'  Edges:   {edges_in} -> {edges_out}')
        print(f'  Center:  {center_in} -> {center_out}')
        
        # Check transformation rule
        print('  Analysis:')
        if center_out == corners_in[0]:  # Center becomes corner value
            print(f'    ✅ Center {center_in} -> {center_out} (corner value)')
        if all(c == center_in for c in corners_out):  # Corners become center value
            print(f'    ✅ Corners {corners_in} -> {corners_out} (center value)')
        if set(edges_out) == set(edges_in):  # Edges stay the same values
            print(f'    ✅ Edges {edges_in} -> {edges_out} (same values)')
    
    print('\\n🎯 TEST CASE:')
    print('Input:')
    print(test_input)
    print('Expected:')
    print(expected_output)
    
    # Apply discovered rule to test case
    print('\\n🔬 APPLYING DISCOVERED RULE:')
    
    # Rule: Center -> Corners, Corners -> Center, Edges stay same
    test_corners = [test_input[0,0], test_input[0,2], test_input[2,0], test_input[2,2]]
    test_edges = [test_input[0,1], test_input[1,0], test_input[1,2], test_input[2,1]]
    test_center = test_input[1,1]
    
    print(f'Test corners: {test_corners} (all {test_corners[0]})')
    print(f'Test edges: {test_edges} (all {test_edges[0]})')  
    print(f'Test center: {test_center}')
    
    # Apply transformation
    predicted_output = np.zeros_like(test_input)
    
    # Center value goes to corners
    predicted_output[0,0] = test_center  # 2
    predicted_output[0,2] = test_center  # 2  
    predicted_output[2,0] = test_center  # 2
    predicted_output[2,2] = test_center  # 2
    
    # Corner value goes to center
    predicted_output[1,1] = test_corners[0]  # 1
    
    # Edges stay the same
    predicted_output[0,1] = test_edges[0]  # 3
    predicted_output[1,0] = test_edges[1]  # 3
    predicted_output[1,2] = test_edges[2]  # 3
    predicted_output[2,1] = test_edges[3]  # 3
    
    print('\\nPredicted output:')
    print(predicted_output)
    
    perfect_match = np.array_equal(predicted_output, expected_output)
    print(f'\\n🏆 PERFECT MATCH: {perfect_match}')
    
    return predicted_output, perfect_match

if __name__ == '__main__':
    result, success = analyze_arc_015()
    if success:
        print('\\n🎉 Arc-015 pattern cracked!')
        print('📈 Ready to implement in ARC-AGI engine')
        print('🏆 This will achieve 100% success rate (15/15)!')