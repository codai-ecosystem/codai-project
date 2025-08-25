#!/usr/bin/env python3
"""
Debug current ARC-AGI status to identify which task is still failing
"""

import json
import sys
sys.path.insert(0, 'apps/romai/src')
from ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine

def debug_arc_status():
    print("🔍 Debugging Current ARC-AGI Status")
    print("="*50)
    
    # Load training data
    with open('apps/romai/training_data/arc_agi_training_data.json', 'r') as f:
        training_data = json.load(f)
    
    # Initialize engine
    engine = AutonomousARCAGIEngine()
    
    failed_tasks = []
    passed_tasks = []
    
    for task_data in training_data:
        task_id = task_data['task_id']
        print(f"\n🧪 Testing {task_id}...")
        try:
            # Get input and expected output from task_data structure
            actual_task_data = task_data['task_data']
            test_input = actual_task_data['test'][0]['input']
            expected_output = task_data['expected_output']
            
            # Solve the task
            result = engine.solve_arc_task(task_id, actual_task_data)
            
            if result['success']:
                # Compare outputs
                actual_output = result['solution']
                if actual_output == expected_output:
                    print(f"✅ {task_id}: PASS")
                    passed_tasks.append(task_id)
                else:
                    print(f"❌ {task_id}: FAIL (wrong output)")
                    print(f"Expected: {expected_output}")
                    print(f"Got:      {actual_output}")
                    failed_tasks.append(task_id)
            else:
                print(f"❌ {task_id}: FAIL (engine error)")
                print(f"Error: {result.get('error', 'Unknown error')}")
                failed_tasks.append(task_id)
                
        except Exception as e:
            print(f"❌ {task_id}: EXCEPTION - {str(e)}")
            failed_tasks.append(task_id)
    
    print(f"\n📊 FINAL STATUS")
    print("="*30)
    print(f"✅ Passed: {len(passed_tasks)}/15 ({len(passed_tasks)/15*100:.1f}%)")
    print(f"❌ Failed: {len(failed_tasks)}/15")
    
    if failed_tasks:
        print(f"\n❌ Failed Tasks: {failed_tasks}")
    
    print(f"\n✅ Passed Tasks: {passed_tasks}")

if __name__ == "__main__":
    debug_arc_status()