#!/usr/bin/env python3
"""
Check arc_008 task details
"""

import json

def check_arc_008():
    # Load training data
    with open('apps/romai/training_data/arc_agi_training_data.json', 'r') as f:
        training_data = json.load(f)
    
    # Find arc_008
    task = None
    for t in training_data:
        if t['task_id'] == 'arc_task_008_complex_rotation':
            task = t
            break
    
    if task:
        print(f"Task: {task['task_id']}")
        print(f"Description: {task['description']}")
        print(f"Transformation: {task['transformation_rule']}")
        print(f"Category: {task['category']}")
        print(f"Difficulty: {task['difficulty']}")
        print(f"\nInput:")
        for row in task['task_data']['test'][0]['input']:
            print(row)
        print(f"\nExpected output:")
        for row in task['expected_output']:
            print(row)

if __name__ == "__main__":
    check_arc_008()