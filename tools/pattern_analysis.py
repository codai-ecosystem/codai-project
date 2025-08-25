import numpy as np

def final_analysis():
    """Let's look at both examples side by side to find the real pattern"""
    
    # Training example
    train_input = np.array([
        [1, 0, 0, 2],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 2]
    ])
    
    train_output = np.array([
        [1, 0, 0, 3],
        [1, 3, 0, 0],
        [0, 3, 3, 0],
        [0, 0, 3, 3]
    ])
    
    # Arc013 example
    arc013_input = np.array([
        [1, 1, 0, 2],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 1]
    ])
    
    arc013_output = np.array([
        [3, 3, 0, 3],
        [0, 3, 3, 0],
        [0, 0, 3, 0],
        [0, 0, 3, 3]
    ])
    
    print('📊 COMPLETE PATTERN ANALYSIS')
    print('=' * 50)
    
    print('\\n🔹 TRAINING EXAMPLE:')
    print('Input  -> Output')
    for r in range(4):
        input_row = ' '.join(map(str, train_input[r]))
        output_row = ' '.join(map(str, train_output[r]))
        print(f'{input_row} -> {output_row}')
    
    print('\\n🔹 ARC-013 EXAMPLE:')
    print('Input  -> Output')
    for r in range(4):
        input_row = ' '.join(map(str, arc013_input[r]))
        output_row = ' '.join(map(str, arc013_output[r]))
        print(f'{input_row} -> {output_row}')
    
    print('\\n🔍 TRANSFORMATION ANALYSIS:')
    print('\\nTraining transformations:')
    for r in range(4):
        for c in range(4):
            if train_input[r,c] != 0:
                print(f'  ({r},{c}): {train_input[r,c]} -> {train_output[r,c]}')
    
    print('\\nArc-013 transformations:')
    for r in range(4):
        for c in range(4):
            if arc013_input[r,c] != 0:
                print(f'  ({r},{c}): {arc013_input[r,c]} -> {arc013_output[r,c]}')
    
    print('\\n💡 KEY INSIGHTS:')
    
    # Check if ALL 2s become 3s
    print('1. ALL 2s -> 3s:')
    train_2s_to_3s = all(train_output[r,c] == 3 for r in range(4) for c in range(4) if train_input[r,c] == 2)
    arc013_2s_to_3s = all(arc013_output[r,c] == 3 for r in range(4) for c in range(4) if arc013_input[r,c] == 2)
    print(f'   Training: {train_2s_to_3s}')
    print(f'   Arc-013: {arc013_2s_to_3s}')
    
    # Check what happens to 1s
    print('\\n2. What happens to 1s:')
    print('   Training:')
    for r in range(4):
        for c in range(4):
            if train_input[r,c] == 1:
                print(f'     ({r},{c}): 1 -> {train_output[r,c]}')
    
    print('   Arc-013:')
    for r in range(4):
        for c in range(4):
            if arc013_input[r,c] == 1:
                print(f'     ({r},{c}): 1 -> {arc013_output[r,c]}')
    
    # HYPOTHESIS: Maybe it's not about connectivity, but about position relative to 2s?
    print('\\n3. HYPOTHESIS - Distance/Connection to 2s:')
    
    # In training: 2s at (0,3) and (3,3)
    # 1s that stay: (0,0), (1,0) - both have row=0 or col=0 (edges)
    # 1s that become 3: (1,1), (2,1), (2,2), (3,2) - interior positions
    
    # In arc-013: 2 at (0,3)  
    # Expected: ALL 1s become 3s
    
    print('   Maybe the pattern is: ALL non-zero values become 3, except for specific start positions?')
    
    # Let me check if there's a simpler pattern
    print('\\n🎯 SIMPLE PATTERN TEST:')
    print('What if ALL non-zero positions become 3?')
    
    # Test this hypothesis
    simple_train = np.where(train_input != 0, 3, 0)
    simple_arc013 = np.where(arc013_input != 0, 3, 0)
    
    print('Simple training result:')
    print(simple_train)
    print('Training expected:')
    print(train_output)
    print(f'Match: {np.array_equal(simple_train, train_output)}')
    
    print('\\nSimple arc-013 result:')
    print(simple_arc013)
    print('Arc-013 expected:')
    print(arc013_output)
    print(f'Match: {np.array_equal(simple_arc013, arc013_output)}')

if __name__ == '__main__':
    final_analysis()