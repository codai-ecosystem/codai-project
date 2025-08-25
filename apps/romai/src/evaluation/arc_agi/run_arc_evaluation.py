"""
RomAI ARC-AGI Evaluation Runner
==============================

This script runs the comprehensive ARC-AGI evaluation for RomAI's abstract
reasoning capabilities with real performance measurement and competitive analysis.

Usage:
    python run_arc_evaluation.py [--version arc-agi-1|arc-agi-2] [--max-tasks N] [--quick]

Author: RomAI Excellence Team
"""

import asyncio
import argparse
import sys
import time
from pathlib import Path

# Add the src directory to Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from romai_arc_evaluator import (
    RomAIARCEvaluator,
    ARCBenchmarkVersion,
    evaluate_romai_arc_agi,
    quick_arc_comparison
)

def print_header():
    """Print evaluation header."""
    print("🧠 RomAI ARC-AGI Abstract Reasoning Evaluation")
    print("=" * 60)
    print("Testing RomAI's artificial general intelligence capabilities")
    print("against the gold standard ARC-AGI benchmark.")
    print()
    print("Targets:")
    print("  • ARC-AGI-1: >85% accuracy (human-level performance)")
    print("  • ARC-AGI-2: >25% accuracy (beating AI leaders)")
    print("  • Cost efficiency: <$5 per task")
    print("=" * 60)
    print()

def print_competitive_context():
    """Print competitive context from current AI leaderboard."""
    print("🏆 Current AI Leaderboard (August 2025):")
    print()
    print("ARC-AGI-1 Leaders:")
    print("  1. OpenAI o3-preview (Low): 75.7% - $50.00/task")
    print("  2. Grok 4 (Thinking): 66.7% - $2.17/task") 
    print("  3. OpenAI o3 (High): 60.8% - $200.00/task")
    print("  4. Claude Sonnet 4 (Thinking): 40.0% - $15.00/task")
    print("  5. Human Baseline: 98.0% - $17.00/task")
    print()
    print("ARC-AGI-2 Leaders:")
    print("  1. Grok 4 (Thinking): 16.0% - $2.17/task")
    print("  2. Claude Opus 4 (Thinking): 8.6% - $18.00/task") 
    print("  3. Most Frontier Models: 2-6% - $25.00/task")
    print("  4. Human Baseline: 100.0% - $17.00/task")
    print()
    print("🎯 RomAI's Goal: Surpass all AI models and approach human performance")
    print("=" * 60)
    print()

async def run_full_evaluation(version: ARCBenchmarkVersion, max_tasks: int = None):
    """Run full ARC-AGI evaluation."""
    print(f"🚀 Starting {version.value.upper()} evaluation...")
    if max_tasks:
        print(f"   Limited to {max_tasks} tasks for testing")
    print()
    
    start_time = time.time()
    
    try:
        # Run evaluation
        results = await evaluate_romai_arc_agi(version, max_tasks)
        
        evaluation_time = time.time() - start_time
        
        # Print results
        print_results(results, evaluation_time)
        
        return results
        
    except Exception as e:
        print(f"❌ Evaluation failed: {e}")
        return None

def print_results(results, evaluation_time: float):
    """Print detailed evaluation results."""
    version_name = results.benchmark_version.value.upper()
    
    print(f"📊 {version_name} EVALUATION RESULTS")
    print("=" * 40)
    print(f"Tasks Completed: {results.completed_tasks}/{results.total_tasks}")
    print(f"Evaluation Time: {evaluation_time:.1f} seconds")
    print()
    
    # Core performance metrics
    print("🎯 CORE PERFORMANCE:")
    print(f"   Accuracy: {results.accuracy:.1%}")
    print(f"   Average Solve Time: {results.average_solve_time:.2f}s per task")
    print(f"   Cost per Task: ${results.cost_per_task:.2f}")
    print(f"   Total Cost: ${results.total_cost:.2f}")
    print()
    
    # Target achievement
    print("🏆 TARGET ACHIEVEMENT:")
    if results.benchmark_version == ARCBenchmarkVersion.ARC_AGI_1:
        target_accuracy = 0.85
        human_level = results.accuracy >= target_accuracy
        print(f"   Human-level (>85%): {'✅ ACHIEVED' if human_level else '❌ MISSED'} ({results.accuracy:.1%})")
    else:
        target_accuracy = 0.25
        ai_leader = results.accuracy >= target_accuracy
        print(f"   AI Leader (>25%): {'✅ ACHIEVED' if ai_leader else '❌ MISSED'} ({results.accuracy:.1%})")
    
    cost_efficient = results.cost_per_task <= 5.0
    print(f"   Cost Efficient (<$5): {'✅ ACHIEVED' if cost_efficient else '❌ MISSED'} (${results.cost_per_task:.2f})")
    print()
    
    # Competitive analysis
    print("⚔️  COMPETITIVE ANALYSIS:")
    human_comp = results.human_comparison
    print(f"   vs Human Accuracy: {human_comp.get('accuracy_ratio', 0):.2f}x")
    print(f"   vs Human Cost: {human_comp.get('cost_ratio', 0):.2f}x")
    
    ai_comp = results.ai_leader_comparison
    print(f"   vs Best AI Accuracy: {ai_comp.get('vs_best_ai_accuracy', 0):.2f}x")
    print(f"   vs Best AI Cost: {ai_comp.get('vs_best_ai_cost', 0):.2f}x")
    print()
    
    # Multi-domain intelligence
    print("🔧 MULTI-DOMAIN INTELLIGENCE:")
    for engine, count in results.engine_utilization.items():
        percentage = (count / results.completed_tasks) * 100
        print(f"   {engine.replace('_', ' ').title()}: {count} tasks ({percentage:.1f}%)")
    print()
    
    # Romanian cultural advantage
    if results.romanian_advantage_cases > 0:
        romanian_percentage = (results.romanian_advantage_cases / results.completed_tasks) * 100
        print("🇷🇴 ROMANIAN CULTURAL ADVANTAGE:")
        print(f"   Tasks with Romanian patterns: {results.romanian_advantage_cases} ({romanian_percentage:.1f}%)")
        print()
    
    # Difficulty breakdown
    if results.difficulty_breakdown:
        print("📊 PERFORMANCE BY DIFFICULTY:")
        for difficulty, stats in results.difficulty_breakdown.items():
            print(f"   {difficulty.name.title()}: {stats['accuracy']:.1%} accuracy, {stats['average_time']:.1f}s avg")
        print()
    
    print("=" * 40)

async def run_quick_comparison():
    """Run quick comparison across both ARC versions."""
    print("🔄 Running quick comparison across ARC-AGI versions...")
    print()
    
    start_time = time.time()
    
    try:
        results = await quick_arc_comparison()
        evaluation_time = time.time() - start_time
        
        print(f"⏱️  Total evaluation time: {evaluation_time:.1f} seconds")
        print()
        
        # Print comparison summary
        print("📊 QUICK COMPARISON RESULTS")
        print("=" * 50)
        
        arc1_results = results['arc_agi_1']
        arc2_results = results['arc_agi_2']
        
        print("ARC-AGI-1 Performance:")
        print(f"   Accuracy: {arc1_results.accuracy:.1%}")
        print(f"   Cost: ${arc1_results.cost_per_task:.2f}/task")
        print(f"   Target (>85%): {'✅' if arc1_results.accuracy >= 0.85 else '❌'}")
        print()
        
        print("ARC-AGI-2 Performance:")
        print(f"   Accuracy: {arc2_results.accuracy:.1%}")
        print(f"   Cost: ${arc2_results.cost_per_task:.2f}/task")
        print(f"   Target (>25%): {'✅' if arc2_results.accuracy >= 0.25 else '❌'}")
        print()
        
        # Overall assessment
        arc1_success = arc1_results.accuracy >= 0.85
        arc2_success = arc2_results.accuracy >= 0.25
        
        if arc1_success and arc2_success:
            print("🏆 OVERALL ASSESSMENT: RomAI demonstrates HUMAN-LEVEL AGI capabilities!")
            print("   Successfully achieved targets on both ARC-AGI benchmarks.")
        elif arc1_success or arc2_success:
            print("⚡ OVERALL ASSESSMENT: RomAI shows STRONG AGI potential!")
            print("   Achieved target on one benchmark, approaching AGI capability.")
        else:
            print("🔧 OVERALL ASSESSMENT: RomAI needs optimization for full AGI!")
            print("   Strong foundation but requires enhancement for human-level performance.")
        
        print("=" * 50)
        
        return results
        
    except Exception as e:
        print(f"❌ Quick comparison failed: {e}")
        return None

def main():
    """Main evaluation entry point."""
    parser = argparse.ArgumentParser(description="RomAI ARC-AGI Evaluation Runner")
    parser.add_argument(
        '--version',
        choices=['arc-agi-1', 'arc-agi-2'],
        help='ARC-AGI version to evaluate'
    )
    parser.add_argument(
        '--max-tasks',
        type=int,
        help='Maximum number of tasks to evaluate'
    )
    parser.add_argument(
        '--quick',
        action='store_true',
        help='Run quick comparison across both versions'
    )
    
    args = parser.parse_args()
    
    print_header()
    print_competitive_context()
    
    if args.quick:
        # Run quick comparison
        results = asyncio.run(run_quick_comparison())
    elif args.version:
        # Run specific version evaluation
        version = ARCBenchmarkVersion.ARC_AGI_1 if args.version == 'arc-agi-1' else ARCBenchmarkVersion.ARC_AGI_2
        results = asyncio.run(run_full_evaluation(version, args.max_tasks))
    else:
        # Default: run quick comparison
        print("No specific version specified, running quick comparison...")
        print()
        results = asyncio.run(run_quick_comparison())
    
    if results:
        print()
        print("✅ Evaluation completed successfully!")
        print("📁 Detailed results saved in the results directory.")
    else:
        print()
        print("❌ Evaluation failed. Check logs for details.")
        sys.exit(1)

if __name__ == "__main__":
    main()