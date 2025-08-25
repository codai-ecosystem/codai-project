import numpy as np
from collections import deque

def solve_maze_final(input_array):
    """
    Maze solver with correct logic:
    1. Find all connected 1s using BFS
    2. Mark connected 1s as 3s 
    3. Mark ALL 2s as 3s (regardless of connectivity)
    4. Keep some original 1s based on the specific pattern
    """
    result = input_array.copy()
    rows, cols = input_array.shape
    
    # Find positions
    ones_positions = set(map(tuple, np.argwhere(input_array == 1)))
    twos_positions = set(map(tuple, np.argwhere(input_array == 2)))
    
    # Strategy: ALL 2s become 3s, connected 1s become 3s based on path logic
    
    # Mark all 2s as 3s
    for row, col in twos_positions:
        result[row, col] = 3
    
    # Find connected components of 1s
    if ones_positions:
        walkable_ones = (input_array == 1)
        visited = np.zeros_like(input_array, dtype=bool)
        
        # BFS from first 1 to find main path
        start_pos = list(ones_positions)[0]
        queue = deque([start_pos])
        visited[start_pos] = True
        connected_ones = set([start_pos])
        
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        
        while queue:
            row, col = queue.popleft()
            
            for dr, dc in directions:
                new_row, new_col = row + dr, col + dc
                
                if (0 <= new_row < rows and 0 <= new_col < cols and
                    not visited[new_row, new_col] and walkable_ones[new_row, new_col]):
                    visited[new_row, new_col] = True
                    connected_ones.add((new_row, new_col))
                    queue.append((new_row, new_col))
        
        # Apply pattern from training: some 1s stay as 1, others become 3
        # Looking at training: (0,0) and (1,0) stay as 1, others become 3
        # This suggests edge/start positions stay as 1
        
        for row, col in connected_ones:
            # Heuristic: positions with fewer connected neighbors stay as 1
            neighbor_count = 0
            for dr, dc in directions:
                new_row, new_col = row + dr, col + dc
                if (0 <= new_row < rows and 0 <= new_col < cols and
                    (new_row, new_col) in connected_ones):
                    neighbor_count += 1
            
            # If it's an edge node (1 neighbor) or isolated, might stay as 1
            # But this is getting complex - let me try different approach
            pass
    
    return result

# Actually, let me analyze the exact pattern more systematically
def analyze_pattern():
    """Analyze the exact pattern by comparing input/output positions"""
    
    # Training example
    train_input = np.array([
        [1, 0, 0, 2],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 2]
    ])
    
    train_output = np.array([
        [1, 0, 0, 3],  # (0,0): 1->1, (0,3): 2->3
        [1, 3, 0, 0],  # (1,0): 1->1, (1,1): 1->3
        [0, 3, 3, 0],  # (2,1): 1->3, (2,2): 1->3
        [0, 0, 3, 3]   # (3,2): 1->3, (3,3): 2->3
    ])
    
    print('🔍 Training Pattern Analysis')
    print('Positions that stay as 1:')
    for r in range(4):
        for c in range(4):
            if train_input[r,c] == 1 and train_output[r,c] == 1:
                print(f'  ({r},{c}): stays as 1')
    
    print('Positions that become 3:')
    for r in range(4):
        for c in range(4):
            if train_input[r,c] != 0 and train_output[r,c] == 3:
                print(f'  ({r},{c}): {train_input[r,c]} -> 3')
    
    # Check connectivity of positions that stay as 1
    ones_that_stay = [(0,0), (1,0)]
    print(f'\\n1s that stay as 1: {ones_that_stay}')
    print('These seem to be the "start" positions')
    
    # The pattern might be: mark path from start to end, keep starts as 1
    
if __name__ == '__main__':
    analyze_pattern()