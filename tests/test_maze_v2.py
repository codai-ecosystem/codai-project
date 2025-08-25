import numpy as np
from collections import deque

def solve_maze_pathfinding_v2(input_array):
    """
    Solve maze by finding path from 1s to 2s:
    - Keep original 1s as 1s (start points)
    - Mark all 2s as 3s (endpoints)  
    - Mark intermediate path 1s as 3s (path)
    """
    result = input_array.copy()
    rows, cols = input_array.shape
    
    # Find all positions
    start_positions = set(map(tuple, np.argwhere(input_array == 1)))
    end_positions = set(map(tuple, np.argwhere(input_array == 2)))
    
    if len(start_positions) == 0 or len(end_positions) == 0:
        return result
    
    # Find connected path using BFS
    walkable = (input_array == 1) | (input_array == 2)
    visited = np.zeros_like(input_array, dtype=bool)
    path_cells = set()
    
    # BFS from all start positions
    queue = deque(start_positions)
    for pos in start_positions:
        visited[pos] = True
        path_cells.add(pos)
    
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while queue:
        row, col = queue.popleft()
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            
            if 0 <= new_row < rows and 0 <= new_col < cols:
                if not visited[new_row, new_col] and walkable[new_row, new_col]:
                    visited[new_row, new_col] = True
                    path_cells.add((new_row, new_col))
                    queue.append((new_row, new_col))
    
    # Apply transformations:
    # - All 2s become 3s (endpoints)
    # - 1s that are NOT original start positions become 3s (intermediate path)
    # - Original start 1s remain as 1s
    
    for row, col in path_cells:
        if (row, col) in end_positions:
            # All 2s become 3s
            result[row, col] = 3
        elif (row, col) in start_positions:
            # Check if this 1 is connected to the path to an endpoint
            # For now, mark intermediate 1s as 3, keep edge 1s as 1
            if is_intermediate_path_node(input_array, (row, col), path_cells, start_positions, end_positions):
                result[row, col] = 3
            # else keep as 1 (original start point)
    
    return result

def is_intermediate_path_node(input_array, pos, path_cells, start_positions, end_positions):
    """Check if a 1 position is an intermediate path node (not a start edge)"""
    row, col = pos
    
    # Count how many neighbors are in the path
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    path_neighbors = 0
    
    for dr, dc in directions:
        new_row, new_col = row + dr, col + dc
        if 0 <= new_row < input_array.shape[0] and 0 <= new_col < input_array.shape[1]:
            if (new_row, new_col) in path_cells:
                path_neighbors += 1
    
    # If it has more than 1 path neighbor, it's likely intermediate
    # Or if it's connected to an endpoint
    for dr, dc in directions:
        new_row, new_col = row + dr, col + dc
        if 0 <= new_row < input_array.shape[0] and 0 <= new_col < input_array.shape[1]:
            if (new_row, new_col) in end_positions or input_array[new_row, new_col] == 2:
                return True  # Connected to endpoint
    
    return path_neighbors > 1  # Has multiple connections

# Test the improved algorithm
if __name__ == '__main__':
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
    
    result = solve_maze_pathfinding_v2(test_input)
    print('Test Input:')
    print(test_input)
    print('Expected Output:')
    print(expected_output)
    print('Algorithm Result:')
    print(result)
    print(f'Match: {np.array_equal(result, expected_output)}')