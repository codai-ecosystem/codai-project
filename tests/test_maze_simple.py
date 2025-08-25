import numpy as np
from collections import deque

def solve_maze_simple(input_array):
    """
    Simple maze solver: Mark ALL connected 1s and 2s as 3s
    """
    result = input_array.copy()
    rows, cols = input_array.shape
    
    # Find all 1s and 2s
    start_end_positions = np.argwhere((input_array == 1) | (input_array == 2))
    
    if len(start_end_positions) == 0:
        return result
    
    # BFS to find all connected components
    walkable = (input_array == 1) | (input_array == 2)
    visited = np.zeros_like(input_array, dtype=bool)
    
    # Start BFS from first position
    queue = deque([tuple(start_end_positions[0])])
    visited[tuple(start_end_positions[0])] = True
    connected_cells = set([tuple(start_end_positions[0])])
    
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while queue:
        row, col = queue.popleft()
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            
            if (0 <= new_row < rows and 0 <= new_col < cols and
                not visited[new_row, new_col] and walkable[new_row, new_col]):
                visited[new_row, new_col] = True
                connected_cells.add((new_row, new_col))
                queue.append((new_row, new_col))
    
    # Mark all connected cells as 3
    for row, col in connected_cells:
        result[row, col] = 3
    
    return result

# Test
if __name__ == '__main__':
    # Training example
    train_input = np.array([
        [1, 0, 0, 2],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 2]
    ])
    
    train_expected = np.array([
        [1, 0, 0, 3],
        [1, 3, 0, 0],
        [0, 3, 3, 0],
        [0, 0, 3, 3]
    ])
    
    train_result = solve_maze_simple(train_input)
    print('🧪 Training Example')
    print('Input:')
    print(train_input)
    print('Expected:')
    print(train_expected)
    print('Result:')
    print(train_result)
    print(f'Training Match: {np.array_equal(train_result, train_expected)}')
    
    # Test example
    test_input = np.array([
        [1, 1, 0, 2],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 2]
    ])
    
    test_expected = np.array([
        [3, 3, 0, 3],
        [0, 3, 3, 0],
        [0, 0, 3, 0],
        [0, 0, 3, 3]
    ])
    
    test_result = solve_maze_simple(test_input)
    print('\\n🎯 Test Example')
    print('Input:')
    print(test_input)
    print('Expected:')
    print(test_expected)
    print('Result:')
    print(test_result)
    print(f'Test Match: {np.array_equal(test_result, test_expected)}')