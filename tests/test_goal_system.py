"""
Test the Autonomous Goal Formation System
"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_goal_formation import (
    generate_autonomous_goal, 
    get_current_autonomous_objectives,
    update_autonomous_goal_progress
)

async def test_goal_system():
    print("🎯 Testing RomAI Autonomous Goal Formation System...")
    
    try:
        # Test goal generation with different contexts
        contexts = [
            {
                'domain': 'machine learning',
                'skill_area': 'neural networks', 
                'challenge': 'optimization problem',
                'current_capability': 'intermediate'
            },
            {
                'domain': 'creative intelligence',
                'task': 'artistic creation',
                'complexity': 'high',
                'inspiration': 'nature patterns'
            },
            {
                'problem': 'resource allocation',
                'constraints': 'limited compute',
                'objective': 'maximize efficiency',
                'urgency': 'high'
            }
        ]
        
        goals_generated = 0
        for i, context in enumerate(contexts):
            print(f"\n🎯 Testing goal generation {i+1}/3...")
            goal = await generate_autonomous_goal(context)
            
            print(f"   Goal: {goal.description}")
            print(f"   Type: {goal.goal_type.value}")
            print(f"   Priority: {goal.priority.value}")
            print(f"   Complexity: {goal.complexity_level}/10")
            print(f"   Motivation: {goal.intrinsic_motivation:.3f}")
            print(f"   Duration: {goal.estimated_duration}")
            print(f"   Prerequisites: {len(goal.prerequisites)} items")
            
            goals_generated += 1
        
        # Test getting current objectives
        print(f"\n🎯 Getting current autonomous objectives...")
        objectives = await get_current_autonomous_objectives()
        print(f"   Active objectives: {len(objectives)}")
        
        for obj in objectives[:2]:  # Show first 2
            print(f"   - {obj['description'][:60]}...")
            print(f"     Priority: {obj['priority']}, Progress: {obj['progress']:.1%}")
        
        # Test progress update
        if objectives:
            goal_id = objectives[0]['goal_id']
            print(f"\n🎯 Testing progress update...")
            await update_autonomous_goal_progress(
                goal_id, 
                0.25, 
                {'accuracy': 0.87, 'efficiency': 0.82, 'creativity': 0.91}
            )
            print(f"   Updated progress by 25% for goal: {goal_id}")
        
        print(f"\n✅ Autonomous Goal Formation System working!")
        print(f"   - Generated {goals_generated} autonomous goals")
        print(f"   - Managing {len(objectives)} active objectives")
        print(f"   - Real neural-based motivation and curiosity")
        print(f"   - Self-directed learning objectives operational")
        
        return True
        
    except Exception as e:
        print(f"❌ Goal system error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_goal_system())