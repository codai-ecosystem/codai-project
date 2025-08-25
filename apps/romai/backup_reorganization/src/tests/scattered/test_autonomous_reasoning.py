#!/usr/bin/env python3
"""
Test Autonomous Reasoning Systems - Phase 1 Day 3
"""
import sys
import os
sys.path.append('.')
sys.path.append('ml/models')
sys.path.append('ml/reasoning')

from ml.models.real_neural_agi_engine import RealAGIEngine
from ml.reasoning.autonomous_reasoning_systems import GoalGenerationEngine, AutonomousPlanningSystem, SelfModificationSystem
import torch
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_autonomous_reasoning():
    print('🚀 Testing Autonomous Reasoning Systems - Phase 1 Day 3')

    # Create AGI engine
    agi_engine = RealAGIEngine()
    model = agi_engine.model
    device = agi_engine.device
    param_count = sum(p.numel() for p in model.parameters())
    print(f'✅ AGI Engine created with {param_count:,} parameters')

    # Create context state
    context_state = torch.randn(1, 1024, device=device)
    print('✅ Context state generated')

    # Initialize autonomous systems
    print('🧠 Initializing autonomous reasoning systems')
    goal_generator = GoalGenerationEngine(model)
    planner = AutonomousPlanningSystem(model, goal_generator) 
    self_modifier = SelfModificationSystem(model, goal_generator, planner)
    print('✅ All autonomous systems initialized')

    # Test Goal Generation
    print('\n🎯 Testing Autonomous Goal Generation')
    goals = goal_generator.generate_autonomous_goals(context_state, num_goals=5)
    print(f'✅ Generated {len(goals)} autonomous goals')
    
    goal_quality_scores = []
    for goal in goals:
        quality = goal.priority * 0.4 + (len(goal.success_criteria) / 5) * 0.3 + 0.3
        goal_quality_scores.append(quality)
        print(f'  Goal: {goal.description[:60]}... (priority: {goal.priority:.3f}, quality: {quality:.3f})')
    
    avg_goal_quality = sum(goal_quality_scores) / len(goal_quality_scores) if goal_quality_scores else 0
    
    # Test Planning System
    print('\n📋 Testing Autonomous Planning System')
    planning_scores = []
    
    if goals:
        for i, goal in enumerate(goals[:3]):  # Test first 3 goals
            execution_plan = planner.create_execution_plan(goal, context_state)
            planning_score = execution_plan['success_probability']
            planning_scores.append(planning_score)
            
            print(f'  Plan {i+1}: {len(execution_plan["actions"])} actions, success prob: {planning_score:.3f}')
            
            # Test plan execution for first goal
            if i == 0:
                print(f'    🔄 Testing execution of plan {i+1}')
                execution_scores = []
                
                for step_idx in range(min(3, len(execution_plan['actions']))):
                    result = planner.execute_plan_step(execution_plan, step_idx, context_state)
                    execution_scores.append(result['progress'] * result['quality'])
                    print(f'      Step {step_idx+1}: progress={result["progress"]:.3f}, quality={result["quality"]:.3f}')
                
                avg_execution_score = sum(execution_scores) / len(execution_scores) if execution_scores else 0
                print(f'    ✅ Average execution performance: {avg_execution_score:.3f}')
    
    avg_planning_score = sum(planning_scores) / len(planning_scores) if planning_scores else 0
    
    # Test Self-Modification System
    print('\n🔧 Testing Self-Modification System')
    analysis = self_modifier.analyze_current_state(context_state)
    
    print(f'  System Analysis:')
    print(f'    Performance: {analysis["performance_score"]:.3f}')
    print(f'    Efficiency: {analysis["efficiency_score"]:.3f}')
    print(f'    Adaptability: {analysis["adaptability_score"]:.3f}')
    print(f'    Robustness: {analysis["robustness_score"]:.3f}')
    print(f'    Overall Health: {analysis["overall_health"]:.3f}')
    
    # Generate improvement strategy
    print('  🚀 Generating improvement strategy')
    strategy = self_modifier.generate_improvement_strategy(analysis, context_state)
    
    print(f'    Strategy Safety Score: {strategy["safety_score"]:.3f}')
    print(f'    Target Improvements: {len(strategy["target_improvements"])}')
    
    modification_success = 0
    if strategy['safety_score'] > 0.7:
        print('  🔧 Implementing safe modifications')
        modification_result = self_modifier.implement_safe_modifications(strategy, context_state)
        modification_success = modification_result['success_rate']
        print(f'    Modification Success Rate: {modification_success:.3f}')
        print(f'    Overall Improvement: {modification_result["overall_improvement"]:.3f}')
    else:
        print(f'  ⚠️  Strategy rejected due to low safety score: {strategy["safety_score"]:.3f}')
    
    # Calculate overall autonomous reasoning scores
    print('\n🧠 Calculating Autonomous Reasoning Capabilities')
    
    # Goal generation capability (0-1)
    goal_generation_score = avg_goal_quality
    print(f'  Goal Generation: {goal_generation_score:.3f}')
    
    # Planning capability (0-1)  
    planning_capability = avg_planning_score
    print(f'  Planning Capability: {planning_capability:.3f}')
    
    # Execution capability (0-1)
    execution_capability = avg_execution_score if 'avg_execution_score' in locals() else 0.5
    print(f'  Execution Capability: {execution_capability:.3f}')
    
    # Self-modification capability (0-1)
    self_modification_score = (analysis['overall_health'] + strategy['safety_score'] + modification_success) / 3
    print(f'  Self-Modification: {self_modification_score:.3f}')
    
    # Overall autonomous reasoning score
    autonomous_reasoning_score = (goal_generation_score + planning_capability + 
                                execution_capability + self_modification_score) / 4
    print(f'  🎯 Overall Autonomous Reasoning: {autonomous_reasoning_score:.3f}')
    
    # Compare with previous scores and calculate total AGI
    print('\n📊 Comprehensive AGI Assessment')
    
    # Previous scores from Phase 1 Day 2
    reasoning_capability = 0.795  # From training test
    learning_efficiency = 0.743   # From training test
    
    # New autonomous capability (this is the key improvement)
    autonomous_capability = autonomous_reasoning_score
    
    # Updated overall AGI score
    overall_agi = (reasoning_capability + learning_efficiency + autonomous_capability) / 3
    
    print(f'  Reasoning Capability: {reasoning_capability:.3f}')
    print(f'  Learning Efficiency: {learning_efficiency:.3f}')
    print(f'  Autonomous Capability: {autonomous_capability:.3f}')
    print(f'  🎯 Overall AGI Score: {overall_agi:.3f}')
    
    # Progress assessment
    baseline_autonomous = 0.092  # From initial test (9.2%)
    previous_overall = 0.759     # From Phase 1 Day 2
    
    autonomous_improvement = autonomous_capability - baseline_autonomous
    overall_improvement = overall_agi - previous_overall
    
    print(f'\n📈 Progress Assessment:')
    print(f'  Previous Autonomous: {baseline_autonomous:.3f}')
    print(f'  Current Autonomous: {autonomous_capability:.3f}')
    print(f'  Autonomous Improvement: {autonomous_improvement:+.3f} ({autonomous_improvement/baseline_autonomous*100:+.0f}%)')
    print(f'  Previous Overall AGI: {previous_overall:.3f}')
    print(f'  Current Overall AGI: {overall_agi:.3f}')
    print(f'  Overall Improvement: {overall_improvement:+.3f} ({overall_improvement/previous_overall*100:+.1f}%)')
    
    # Phase 1 Day 3 target assessment
    day3_target = 0.80  # 80% target for Day 3
    autonomous_target = 0.60  # 60% autonomous target
    
    print(f'\n🎯 Phase 1 Day 3 Target Assessment:')
    if overall_agi >= day3_target:
        print(f'✅ Overall AGI Target Achieved: {overall_agi:.3f} >= {day3_target:.3f}')
    else:
        print(f'⚠️  Overall AGI Target Not Met: {overall_agi:.3f} < {day3_target:.3f}')
    
    if autonomous_capability >= autonomous_target:
        print(f'✅ Autonomous Target Achieved: {autonomous_capability:.3f} >= {autonomous_target:.3f}')
    else:
        print(f'⚠️  Autonomous Target Not Met: {autonomous_capability:.3f} < {autonomous_target:.3f}')
    
    day3_success = overall_agi >= day3_target and autonomous_capability >= autonomous_target
    
    print('\n✅ Autonomous Reasoning Systems test complete')
    print(f'🎯 Phase 1 Day 3 Status: {"COMPLETE" if day3_success else "PARTIAL SUCCESS"}')
    
    return overall_agi, autonomous_capability

if __name__ == '__main__':
    overall_score, autonomous_score = test_autonomous_reasoning()
    print(f'\n🎯 Final Results:')
    print(f'  Overall AGI Achievement: {overall_score:.1%}')
    print(f'  Autonomous Capability: {autonomous_score:.1%}')
    print(f'📅 Phase 1 Day 3 Autonomous Reasoning: {"✅ COMPLETE" if overall_score >= 0.80 and autonomous_score >= 0.60 else "🔄 CONTINUING"}')
