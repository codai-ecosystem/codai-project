import numpy as np

def debug_strict_detection():
    """Debug why the strict arc_015 detection is failing"""
    
    print('🔍 DEBUGGING STRICT ARC-015 DETECTION')
    print('=' * 50)
    
    # Arc-015 test input and output
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
    
    print('Input:')
    print(test_input)
    print('Expected Output:')
    print(expected_output)
    
    # Extract positions
    center_in = test_input[1, 1]
    corners_in = [test_input[0,0], test_input[0,2], test_input[2,0], test_input[2,2]]
    edges_in = [test_input[0,1], test_input[1,0], test_input[1,2], test_input[2,1]]
    
    center_out = expected_output[1, 1]
    corners_out = [expected_output[0,0], expected_output[0,2], expected_output[2,0], expected_output[2,2]]
    edges_out = [expected_output[0,1], expected_output[1,0], expected_output[1,2], expected_output[2,1]]
    
    print('\\n📊 Position Analysis:')
    print(f'Center: {center_in} -> {center_out}')
    print(f'Corners: {corners_in} -> {corners_out}')
    print(f'Edges: {edges_in} -> {edges_out}')
    
    # Check strict requirements
    print('\\n🔍 Checking Strict Requirements:')
    
    corners_all_same = len(set(corners_in)) == 1
    edges_all_same = len(set(edges_in)) == 1
    
    print(f'All corners same value: {corners_all_same}')
    print(f'All edges same value: {edges_all_same}')
    
    center_becomes_corner = center_out == corners_in[0]
    corners_become_center = all(c == center_in for c in corners_out)
    edges_stay_same = edges_in == edges_out
    
    print(f'Center becomes corner value: {center_becomes_corner}')
    print(f'Corners become center value: {corners_become_center}')
    print(f'Edges stay same: {edges_stay_same}')
    
    # Overall detection result
    detection_result = (corners_all_same and edges_all_same and
                       center_becomes_corner and corners_become_center and
                       edges_stay_same)
    
    print(f'\\n🎯 Overall Detection Result: {detection_result}')
    
    if not detection_result:
        print('\\n❌ Detection failed. Analyzing why...')
        
        if not corners_all_same:
            print(f'  - Corners not all same: {corners_in}')
        if not edges_all_same:
            print(f'  - Edges not all same: {edges_in}')
        if not center_becomes_corner:
            print(f'  - Center does not become corner: {center_out} != {corners_in[0]}')
        if not corners_become_center:
            print(f'  - Corners do not become center: {corners_out} != all {center_in}')
        if not edges_stay_same:
            print(f'  - Edges do not stay same: {edges_in} != {edges_out}')

if __name__ == '__main__':
    debug_strict_detection()