import numpy as np
from collections import deque

def analyze_arc_013():
    """Analyze the maze solving task arc_013"""
    
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
    
    print('🧩 Arc_013 Maze Solving Analysis')
    print('=' * 50)
    print('Training Input:')
    print(train_input)
    print('Training Output:')
    print(train_output)
    
    # Find start and end positions
    start_positions = np.argwhere(train_input == 1)
    end_positions = np.argwhere(train_input == 2)
    
    print(f'\nStart positions (1s): {start_positions.tolist()}')
    print(f'End positions (2s): {end_positions.tolist()}')
    
    # Test case
    test_input = np.array([
        [1, 1, 0, 2],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 2]
    ])
    
    expected_output = np.array([
        [3, 3, 0, 3],
        [0, 3, 3, 0],
        [0, 0, 3, 0],
        [0, 0, 3, 3]
    ])
    
    print('\nTest Input:')
    print(test_input)
    print('Expected Output:')
    print(expected_output)
    
    # Test pathfinding algorithm
    result = solve_maze_pathfinding(test_input)
    print('\nAlgorithm Result:')
    print(result)
    print(f'Match: {np.array_equal(result, expected_output)}')

def solve_maze_pathfinding(input_array):
    """Solve maze by finding path from 1s to 2s and marking with 3s"""
    result = input_array.copy()
    rows, cols = input_array.shape
    
    # Find all positions of 1s (start) and 2s (end)
    start_positions = np.argwhere(input_array == 1)
    end_positions = np.argwhere(input_array == 2)
    
    if len(start_positions) == 0 or len(end_positions) == 0:
        return result
    
    # Use BFS to find path connecting all 1s and 2s
    # Create a graph where 1s and 2s are walkable
    walkable = (input_array == 1) | (input_array == 2)
    visited = np.zeros_like(input_array, dtype=bool)
    path_cells = set()
    
    # BFS to find all connected components containing both 1s and 2s
    queue = deque()
    
    # Start from first start position
    start_pos = tuple(start_positions[0])
    queue.append(start_pos)
    visited[start_pos] = True
    path_cells.add(start_pos)
    
    # Directions: up, down, left, right
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while queue:
        row, col = queue.popleft()
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            
            # Check bounds
            if 0 <= new_row < rows and 0 <= new_col < cols:
                if not visited[new_row, new_col] and walkable[new_row, new_col]:
                    visited[new_row, new_col] = True
                    path_cells.add((new_row, new_col))
                    queue.append((new_row, new_col))
    
    # Mark all path cells (both 1s and 2s) as 3
    for row, col in path_cells:
        result[row, col] = 3
    
    return result

if __name__ == '__main__':
    analyze_arc_013()