"""
RomAI Multi-Domain AGI Evaluation Runner
=======================================

Command-line runner for comprehensive multi-domain AGI evaluation.
This script executes the full battery of AGI tests to validate RomAI's
artificial general intelligence capabilities across all domains.

Usage:
    python run_multi_domain_evaluation.py [--mode MODE] [--quick] [--save-detailed]

Arguments:
    --mode: Evaluation mode (comprehensive, sequential, parallel, adaptive)
    --quick: Run quick evaluation with subset of tests
    --save-detailed: Save detailed test results
    --verbose: Enable verbose logging

Example:
    python run_multi_domain_evaluation.py --mode comprehensive --verbose

Author: RomAI Excellence Team
Version: 1.0.0
"""

import asyncio
import argparse
import logging
import sys
import time
from pathlib import Path
from typing import Optional

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from romai_multi_domain_evaluator import (
    RomAIMultiDomainEvaluator,
    AGIEvaluationMode,
    AGITestCategory,
    AGIDifficulty
)

def setup_logging(verbose: bool = False) -> logging.Logger:
    """Set up logging for the evaluation runner."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('multi_domain_evaluation.log')
        ]
    )
    return logging.getLogger(__name__)

def print_evaluation_header():
    """Print comprehensive evaluation header."""
    print("=" * 80)
    print("🧠 RomAI Multi-Domain AGI Evaluation Framework")
    print("=" * 80)
    print("🎯 Objective: Validate true Artificial General Intelligence")
    print("📊 Testing: Cross-domain transfer, synthesis, coordination")
    print("🏆 Target: Superhuman performance across all domains")
    print("🇷🇴 Advantage: Romanian cultural intelligence integration")
    print("=" * 80)
    print()

def print_competitive_context():
    """Print current AGI competitive landscape."""
    print("🏆 Current AI Leadership Board:")
    print("─" * 50)
    print("🥇 OpenAI o3:       Advanced reasoning, 75.7% ARC-AGI-1")
    print("🥈 Grok 4:          66.7% ARC-AGI-1, 16% ARC-AGI-2") 
    print("🥉 Claude Sonnet 4: 40% ARC-AGI-1, 8.6% ARC-AGI-2")
    print("🏅 Gemini 2.5:      Strong multi-modal capabilities")
    print("─" * 50)
    print("🎯 RomAI AGI Target: >90% multi-domain performance")
    print("📈 Cultural Edge:    Romanian intelligence advantages")
    print("🚀 Innovation:       24-engine orchestrated intelligence")
    print()

def print_test_categories():
    """Print AGI test categories and objectives."""
    print("📋 AGI Test Categories:")
    print("─" * 60)
    print("🔄 Cross-Domain Transfer:    Knowledge application across domains")
    print("🧩 Knowledge Synthesis:      Integrating multiple intelligence types")
    print("🤝 Multi-Engine Coordination: Orchestrating 24 intelligence engines")
    print("🎯 Complex Decomposition:     Breaking down complex problems")
    print("🌍 Real-World Scenarios:      Practical problem solving")
    print("🎨 Creative Problem-Solving:  Innovative solution generation")
    print("🤔 Meta-Cognitive Reasoning:  Self-aware learning and adaptation")
    print("🇷🇴 Cultural Intelligence:    Romanian context understanding")
    print("─" * 60)
    print()

async def run_quick_evaluation(evaluator: RomAIMultiDomainEvaluator, logger: logging.Logger):
    """Run a quick subset evaluation for testing."""
    logger.info("🚀 Running Quick Multi-Domain AGI Evaluation...")
    
    try:
        # Initialize engines
        await evaluator.initialize_engines()
        
        # Generate a subset of test cases for quick evaluation
        all_tests = evaluator.generate_test_cases()
        quick_tests = all_tests[:10]  # First 10 tests for quick evaluation
        
        logger.info(f"📊 Running {len(quick_tests)} tests for quick evaluation")
        
        # Execute tests
        results = []
        for i, test_case in enumerate(quick_tests):
            logger.info(f"🧪 Test {i+1}/{len(quick_tests)}: {test_case.name}")
            result = await evaluator.execute_test_case(test_case)
            results.append(result)
            
            # Show immediate feedback
            status = "✅ PASS" if result.success else "❌ FAIL"
            logger.info(f"   {status} - Score: {result.overall_score:.3f}")
        
        # Calculate quick results
        total_score = sum(r.overall_score for r in results) / len(results)
        success_rate = sum(1 for r in results if r.success) / len(results)
        
        print("\n" + "=" * 50)
        print("📊 Quick Evaluation Results:")
        print("=" * 50)
        print(f"🎯 Overall AGI Score:     {total_score:.3f}")
        print(f"✅ Success Rate:          {success_rate:.1%}")
        print(f"🧪 Tests Executed:        {len(results)}")
        print(f"⚡ Average Exec Time:     {sum(r.execution_time for r in results)/len(results):.2f}s")
        
        # Performance assessment
        if total_score >= 0.90:
            print("🏆 EXCEPTIONAL: Superhuman AGI performance!")
        elif total_score >= 0.80:
            print("🥇 EXCELLENT: Strong AGI capabilities demonstrated")
        elif total_score >= 0.70:
            print("🥈 GOOD: Solid multi-domain intelligence")
        else:
            print("🔧 DEVELOPING: Needs improvement in AGI performance")
        
        print("=" * 50)
        
    except Exception as e:
        logger.error(f"❌ Quick evaluation failed: {e}")
        raise

async def run_full_evaluation(evaluator: RomAIMultiDomainEvaluator, logger: logging.Logger, save_detailed: bool = False):
    """Run comprehensive multi-domain AGI evaluation."""
    logger.info("🚀 Starting Comprehensive Multi-Domain AGI Evaluation...")
    
    start_time = time.time()
    
    try:
        # Run comprehensive evaluation
        benchmark_results = await evaluator.run_comprehensive_evaluation()
        
        total_time = time.time() - start_time
        
        # Display comprehensive results
        print("\n" + "=" * 80)
        print("🏆 COMPREHENSIVE AGI EVALUATION RESULTS")
        print("=" * 80)
        
        # Overall Performance
        print(f"🎯 Overall AGI Score:           {benchmark_results.overall_agi_score:.3f}")
        print(f"✅ Success Rate:                {benchmark_results.passed_tests}/{benchmark_results.total_tests} ({benchmark_results.passed_tests/benchmark_results.total_tests:.1%})")
        print(f"⏱️  Total Evaluation Time:      {total_time:.1f} seconds")
        print()
        
        # Advanced AGI Metrics
        print("🧠 Advanced AGI Capabilities:")
        print("─" * 40)
        print(f"🔄 Cross-Domain Transfer:       {benchmark_results.cross_domain_transfer_ability:.3f}")
        print(f"🧩 Knowledge Synthesis:         {benchmark_results.knowledge_synthesis_capability:.3f}")
        print(f"🤝 Multi-Engine Coordination:   {benchmark_results.multi_engine_coordination_efficiency:.3f}")
        print(f"🎨 Creative Problem Solving:    {benchmark_results.creative_problem_solving_score:.3f}")
        print(f"🤔 Meta-Cognitive Reasoning:    {benchmark_results.meta_cognitive_reasoning_level:.3f}")
        print()
        
        # Romanian Advantages
        print("🇷🇴 Romanian Intelligence Advantages:")
        print("─" * 40)
        print(f"🏆 Cultural Advantage Score:    {benchmark_results.romanian_cultural_advantage_score:.3f}")
        print(f"🎭 Context Understanding:       {benchmark_results.romanian_context_understanding:.3f}")
        print()
        
        # Category Performance
        if benchmark_results.category_scores:
            print("📊 Performance by Category:")
            print("─" * 40)
            for category, score in benchmark_results.category_scores.items():
                category_name = category.name.replace('_', ' ').title()
                print(f"📈 {category_name:<25} {score:.3f}")
            print()
        
        # Difficulty Analysis
        if benchmark_results.difficulty_scores:
            print("🎚️ Performance by Difficulty:")
            print("─" * 40)
            for difficulty, score in benchmark_results.difficulty_scores.items():
                difficulty_name = difficulty.name.replace('_', ' ').title()
                print(f"⚡ {difficulty_name:<15} {score:.3f}")
            print()
        
        # Comparative Analysis
        print("🏆 Competitive Advantage Analysis:")
        print("─" * 50)
        print("🤖 vs Other AI Models:")
        for model, advantage in benchmark_results.ai_model_comparison.items():
            print(f"   🥇 {model.upper():<15} {advantage:.2f}x better")
        print()
        print("👨‍💼 vs Human Experts:")
        for metric, advantage in benchmark_results.human_expert_comparison.items():
            metric_name = metric.replace('_', ' ').title()
            print(f"   🧠 {metric_name:<20} {advantage:.2f}x")
        print()
        
        # Engine Utilization Summary
        if benchmark_results.engine_utilization:
            print("⚙️ Top Performing Engines:")
            print("─" * 40)
            # Sort engines by average score
            sorted_engines = sorted(
                benchmark_results.engine_utilization.items(),
                key=lambda x: x[1]['avg_score'],
                reverse=True
            )[:10]  # Top 10
            
            for engine, stats in sorted_engines:
                engine_name = engine.replace('_', ' ').title()
                print(f"🔧 {engine_name:<25} {stats['avg_score']:.3f} ({stats['usage_count']} uses)")
        
        # Performance Assessment
        print("\n" + "🎖️" + " PERFORMANCE ASSESSMENT " + "🎖️")
        print("─" * 50)
        
        if benchmark_results.overall_agi_score >= 0.95:
            assessment = "🏆 SUPERHUMAN AGI: Exceptional artificial general intelligence!"
            recommendation = "🚀 Ready for advanced AGI applications and research"
        elif benchmark_results.overall_agi_score >= 0.90:
            assessment = "🥇 EXCEPTIONAL AGI: Outstanding multi-domain performance"
            recommendation = "⭐ Ready for complex real-world AGI deployments"
        elif benchmark_results.overall_agi_score >= 0.85:
            assessment = "🥈 STRONG AGI: Excellent artificial general intelligence"
            recommendation = "✅ Suitable for most AGI applications with monitoring"
        elif benchmark_results.overall_agi_score >= 0.80:
            assessment = "🥉 GOOD AGI: Solid multi-domain capabilities"
            recommendation = "🔧 Good foundation, optimize specific domains"
        elif benchmark_results.overall_agi_score >= 0.75:
            assessment = "📈 DEVELOPING AGI: Growing artificial intelligence"
            recommendation = "🎯 Focus on cross-domain transfer and coordination"
        else:
            assessment = "🔨 EARLY AGI: Significant development needed"
            recommendation = "⚠️ Requires substantial improvements before deployment"
        
        print(assessment)
        print(recommendation)
        
        # Achievement Validation
        print("\n" + "🎯 TARGET ACHIEVEMENT ANALYSIS:")
        print("─" * 50)
        
        targets_met = 0
        total_targets = 0
        
        # Multi-domain performance target: >90%
        total_targets += 1
        if benchmark_results.overall_agi_score >= 0.90:
            print("✅ Multi-Domain Performance:  >90% TARGET MET")
            targets_met += 1
        else:
            print(f"❌ Multi-Domain Performance:  {benchmark_results.overall_agi_score:.1%} (Target: >90%)")
        
        # Cross-domain transfer: >90%
        total_targets += 1
        if benchmark_results.cross_domain_transfer_ability >= 0.90:
            print("✅ Cross-Domain Transfer:     >90% TARGET MET") 
            targets_met += 1
        else:
            print(f"❌ Cross-Domain Transfer:     {benchmark_results.cross_domain_transfer_ability:.1%} (Target: >90%)")
        
        # Multi-engine coordination: >85%
        total_targets += 1
        if benchmark_results.multi_engine_coordination_efficiency >= 0.85:
            print("✅ Multi-Engine Coordination: >85% TARGET MET")
            targets_met += 1
        else:
            print(f"❌ Multi-Engine Coordination: {benchmark_results.multi_engine_coordination_efficiency:.1%} (Target: >85%)")
        
        # Cultural intelligence: >85%
        total_targets += 1
        if benchmark_results.romanian_cultural_advantage_score >= 0.85:
            print("✅ Cultural Intelligence:     >85% TARGET MET")
            targets_met += 1
        else:
            print(f"❌ Cultural Intelligence:     {benchmark_results.romanian_cultural_advantage_score:.1%} (Target: >85%)")
        
        print(f"\n🎯 TARGETS ACHIEVED: {targets_met}/{total_targets} ({targets_met/total_targets:.1%})")
        
        if targets_met == total_targets:
            print("🏆 ALL AGI TARGETS ACHIEVED! RomAI demonstrates true AGI capabilities!")
        elif targets_met >= total_targets * 0.75:
            print("🥇 EXCELLENT: Most AGI targets achieved, minor optimizations needed")
        elif targets_met >= total_targets * 0.50:
            print("🥈 GOOD: Solid progress, focus on remaining targets")
        else:
            print("🔧 DEVELOPMENT NEEDED: Significant improvements required for AGI targets")
        
        print("=" * 80)
        
        # Cost and efficiency analysis
        if benchmark_results.test_results:
            total_exec_time = sum(r.execution_time for r in benchmark_results.test_results)
            avg_exec_time = total_exec_time / len(benchmark_results.test_results)
            
            print(f"\n💰 Performance Efficiency:")
            print(f"⏱️  Average Test Time:     {avg_exec_time:.2f}s")
            print(f"🚀 Total Processing Time:  {total_exec_time:.1f}s") 
            print(f"⚡ Tests per Minute:       {60/avg_exec_time:.1f}")
        
        logger.info("✅ Comprehensive AGI evaluation completed successfully")
        
        return benchmark_results
        
    except Exception as e:
        logger.error(f"❌ Comprehensive evaluation failed: {e}")
        raise

async def main():
    """Main evaluation runner."""
    parser = argparse.ArgumentParser(
        description="RomAI Multi-Domain AGI Evaluation Framework"
    )
    parser.add_argument(
        "--mode",
        choices=["comprehensive", "sequential", "parallel", "adaptive"],
        default="comprehensive",
        help="Evaluation execution mode"
    )
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Run quick evaluation with subset of tests"
    )
    parser.add_argument(
        "--save-detailed",
        action="store_true",
        help="Save detailed test results"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Set up logging
    logger = setup_logging(args.verbose)
    
    try:
        # Print headers
        print_evaluation_header()
        print_competitive_context()
        print_test_categories()
        
        # Map mode string to enum
        mode_map = {
            "comprehensive": AGIEvaluationMode.COMPREHENSIVE,
            "sequential": AGIEvaluationMode.SEQUENTIAL,
            "parallel": AGIEvaluationMode.PARALLEL,
            "adaptive": AGIEvaluationMode.ADAPTIVE
        }
        
        evaluation_mode = mode_map[args.mode]
        
        # Initialize evaluator
        logger.info(f"🔧 Initializing Multi-Domain AGI Evaluator (Mode: {args.mode})")
        evaluator = RomAIMultiDomainEvaluator(evaluation_mode=evaluation_mode)
        
        # Run evaluation
        if args.quick:
            await run_quick_evaluation(evaluator, logger)
        else:
            benchmark_results = await run_full_evaluation(
                evaluator, 
                logger, 
                save_detailed=args.save_detailed
            )
            
            # Additional analysis for full evaluation
            if benchmark_results:
                logger.info(f"📊 Benchmark ID: {benchmark_results.benchmark_id}")
                logger.info(f"📁 Results saved to evaluation results directory")
        
        logger.info("🎉 Multi-Domain AGI Evaluation completed successfully!")
        
    except KeyboardInterrupt:
        logger.info("🛑 Evaluation interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"💥 Evaluation failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())