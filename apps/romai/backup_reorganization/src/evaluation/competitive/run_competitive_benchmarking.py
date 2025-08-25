"""
Competitive AI Benchmarking Runner
=================================

Command-line runner for comprehensive competitive AI benchmarking,
providing direct head-to-head comparison between RomAI and leading
AI models with detailed performance analysis and reporting.

Usage:
    python run_competitive_benchmarking.py --mode quick
    python run_competitive_benchmarking.py --mode comprehensive
    python run_competitive_benchmarking.py --domain abstract_reasoning
    python run_competitive_benchmarking.py --models openai_o3,claude_sonnet_4,grok_4

Author: RomAI Excellence Team
Version: 1.0.0
"""

import asyncio
import argparse
import logging
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

from romai_competitive_benchmarker import (
    RomAICompetitiveBenchmarker, CompetitorModel, BenchmarkDomain, 
    EvaluationMetric, BenchmarkTask, ModelResponse
)
from model_adapters import ModelAdapterFactory
from competitive_analysis import RomAICompetitiveAnalyzer

class CompetitiveBenchmarkingRunner:
    """Command-line runner for competitive AI benchmarking."""
    
    def __init__(self):
        """Initialize the benchmarking runner."""
        self.benchmarker = RomAICompetitiveBenchmarker()
        self.analyzer = RomAICompetitiveAnalyzer()
        self.model_adapters = {}
        
        # Logging setup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger("competitive_benchmarking_runner")
    
    async def run_benchmarking(
        self,
        mode: str = "quick",
        domains: Optional[List[BenchmarkDomain]] = None,
        models: Optional[List[CompetitorModel]] = None
    ) -> Dict:
        """
        Run competitive benchmarking evaluation.
        
        Args:
            mode: Evaluation mode ('quick' or 'comprehensive')
            domains: Specific domains to evaluate (None for all)
            models: Specific models to compare against (None for all)
            
        Returns:
            Dictionary containing evaluation results
        """
        print("\n" + "="*80)
        print("🏆 RomAI Competitive AI Benchmarking System")
        print("="*80)
        print(f"Mode: {mode.upper()}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Initialize RomAI system
            print("\n🔧 Initializing RomAI system...")
            await self.benchmarker.initialize_romai_system()
            
            # Initialize model adapters
            print("🤖 Initializing competitor model adapters...")
            self._initialize_model_adapters(models)
            
            # Generate benchmark tasks
            print("📋 Generating benchmark tasks...")
            tasks = self._generate_benchmark_tasks(mode, domains)
            print(f"   Generated {len(tasks)} benchmark tasks")
            
            # Execute benchmarking
            print("\n⚡ Executing competitive benchmarking...")
            responses = await self._execute_benchmarking(tasks)
            print(f"   Collected {len(responses)} model responses")
            
            # Perform competitive analysis
            print("📊 Performing competitive analysis...")
            report = self.analyzer.analyze_competitive_performance(responses, tasks)
            
            # Display results
            self._display_results(report)
            
            # Save detailed results
            results_summary = self._create_results_summary(report, responses, tasks)
            self._save_results(results_summary)
            
            return results_summary
            
        except Exception as e:
            self.logger.error(f"Benchmarking execution failed: {e}")
            raise
    
    def _initialize_model_adapters(self, selected_models: Optional[List[CompetitorModel]]):
        """Initialize model adapters for competitive evaluation."""
        if selected_models:
            models_to_init = selected_models
        else:
            models_to_init = [
                CompetitorModel.OPENAI_O3,
                CompetitorModel.ANTHROPIC_CLAUDE_SONNET_4,
                CompetitorModel.XAI_GROK_4,
                CompetitorModel.GOOGLE_GEMINI_25_FLASH,
                CompetitorModel.OPENAI_GPT4O
            ]
        
        for model in models_to_init:
            try:
                adapter = ModelAdapterFactory.create_adapter(model)
                self.model_adapters[model] = adapter
                print(f"   ✅ {model.name}")
            except Exception as e:
                print(f"   ❌ {model.name}: {e}")
                self.logger.warning(f"Failed to initialize adapter for {model.name}: {e}")
    
    def _generate_benchmark_tasks(
        self, 
        mode: str, 
        selected_domains: Optional[List[BenchmarkDomain]]
    ) -> List[BenchmarkTask]:
        """Generate benchmark tasks based on mode and domains."""
        all_tasks = self.benchmarker.generate_benchmark_tasks()
        
        if selected_domains:
            # Filter tasks by selected domains
            filtered_tasks = [task for task in all_tasks if task.domain in selected_domains]
        else:
            filtered_tasks = all_tasks
        
        if mode == "quick":
            # For quick mode, take subset of tasks
            return filtered_tasks[:min(8, len(filtered_tasks))]
        else:
            # Comprehensive mode uses all tasks
            return filtered_tasks
    
    async def _execute_benchmarking(self, tasks: List[BenchmarkTask]) -> List[ModelResponse]:
        """Execute benchmarking across all models and tasks."""
        all_responses = []
        
        for i, task in enumerate(tasks, 1):
            print(f"   Task {i}/{len(tasks)}: {task.task_name}")
            
            # Execute task with RomAI
            try:
                romai_response = await self.benchmarker.romai_orchestrator.coordinate_competitive_task(
                    self.benchmarker.romai_engines, task
                )
                all_responses.append(romai_response)
                print(f"      ✅ RomAI: {romai_response.accuracy_score:.3f} accuracy")
            except Exception as e:
                self.logger.error(f"RomAI execution failed for task {task.task_id}: {e}")
            
            # Execute task with competitor models
            for model, adapter in self.model_adapters.items():
                try:
                    response = await adapter.process_benchmark_task(task)
                    all_responses.append(response)
                    print(f"      ✅ {model.name}: {response.accuracy_score:.3f} accuracy")
                except Exception as e:
                    self.logger.error(f"{model.name} execution failed for task {task.task_id}: {e}")
            
            print()  # Empty line for readability
        
        return all_responses
    
    def _display_results(self, report):
        """Display competitive benchmarking results."""
        print("\n" + "="*80)
        print("📊 COMPETITIVE BENCHMARKING RESULTS")
        print("="*80)
        
        # Overall performance
        print(f"\n🏆 Overall Performance:")
        print(f"   RomAI AGI Score: {report.overall_romai_score:.3f}")
        print(f"   RomAI Rank: #{report.romai_overall_rank}")
        
        print(f"\n🤖 Competitor Scores:")
        sorted_competitors = sorted(
            report.overall_competitor_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        for i, (model, score) in enumerate(sorted_competitors, 1):
            print(f"   #{i+1 if report.romai_overall_rank <= i else i}: {model.name}: {score:.3f}")
        
        # Romanian cultural analysis
        if report.romanian_cultural_analysis.cultural_task_count > 0:
            cultural = report.romanian_cultural_analysis
            print(f"\n🇷🇴 Romanian Cultural Intelligence:")
            print(f"   RomAI Cultural Score: {cultural.romai_cultural_accuracy:.3f}")
            print(f"   Cultural Superiority Margin: +{cultural.cultural_superiority_margin:.3f}")
            print(f"   Advantage over Competitors: +{cultural.cultural_advantage_percentage:.1f}%")
            print(f"   Models Outperformed: {len(cultural.models_outperformed)}/{len(report.overall_competitor_scores)}")
        
        # Key advantages
        print(f"\n✨ Primary Advantages:")
        for advantage in report.primary_advantages[:5]:
            print(f"   • {advantage}")
        
        # Market positioning
        print(f"\n🎯 Competitive Positioning: {report.competitive_positioning}")
        
        # Leadership areas
        if report.market_leadership_areas:
            print(f"\n👑 Market Leadership Areas:")
            for domain in report.market_leadership_areas:
                print(f"   • {domain.name.replace('_', ' ').title()}")
        
        print("\n" + "="*80)
    
    def _create_results_summary(self, report, responses: List[ModelResponse], tasks: List[BenchmarkTask]) -> Dict:
        """Create comprehensive results summary."""
        return {
            'benchmark_metadata': {
                'execution_timestamp': datetime.now().isoformat(),
                'total_tasks': len(tasks),
                'total_responses': len(responses),
                'models_evaluated': len(set(r.model for r in responses)),
                'evaluation_mode': 'comprehensive'
            },
            'overall_performance': {
                'romai_score': report.overall_romai_score,
                'romai_rank': report.romai_overall_rank,
                'competitor_scores': {model.name: score for model, score in report.overall_competitor_scores.items()},
                'competitive_positioning': report.competitive_positioning
            },
            'romanian_cultural_intelligence': {
                'cultural_tasks': report.romanian_cultural_analysis.cultural_task_count,
                'romai_cultural_score': report.romanian_cultural_analysis.romai_cultural_accuracy,
                'cultural_superiority_margin': report.romanian_cultural_analysis.cultural_superiority_margin,
                'cultural_advantage_percentage': report.romanian_cultural_analysis.cultural_advantage_percentage,
                'models_outperformed_count': len(report.romanian_cultural_analysis.models_outperformed)
            },
            'competitive_advantages': {
                'primary_advantages': report.primary_advantages,
                'market_leadership_areas': [domain.name for domain in report.market_leadership_areas],
                'competitive_gaps': {model.name: gap for model, gap in report.competitive_gaps.items()}
            },
            'performance_metrics': {
                'response_times': {
                    model.name: [r.response_time for r in responses if r.model == model]
                    for model in set(r.model for r in responses)
                },
                'accuracy_scores': {
                    model.name: [r.accuracy_score for r in responses if r.model == model]
                    for model in set(r.model for r in responses)
                },
                'cost_effectiveness': {
                    model.name: [r.cost_estimate for r in responses if r.model == model]
                    for model in set(r.model for r in responses)
                }
            },
            'strategic_recommendations': report.strategic_recommendations,
            'technical_improvements': report.technical_improvements
        }
    
    def _save_results(self, results: Dict):
        """Save detailed results to file."""
        results_dir = Path("e:/GitHub/codai-project/apps/romai/src/evaluation/competitive/results")
        results_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = results_dir / f"competitive_benchmarking_results_{timestamp}.json"
        
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"📁 Detailed results saved: {results_file}")

def print_competitive_context():
    """Print competitive context and current AI landscape."""
    print("\n" + "="*80)
    print("🌍 CURRENT AI COMPETITIVE LANDSCAPE (2025)")
    print("="*80)
    
    print("\n🥇 Leading AI Models:")
    models_info = [
        ("OpenAI o3", "75.7% ARC-AGI-1, 25% ARC-AGI-2 (est.), $15/1K tokens"),
        ("Anthropic Claude Sonnet 4", "40% ARC-AGI-1, 8.6% ARC-AGI-2, $3/1K tokens"),
        ("xAI Grok 4", "66.7% ARC-AGI-1, 16% ARC-AGI-2, $5/1K tokens"),
        ("Google Gemini 2.5 Flash", "58% ARC-AGI-1 (est.), $0.5/1K tokens"),
        ("OpenAI GPT-4o", "52% ARC-AGI-1 (est.), $2.5/1K tokens")
    ]
    
    for model, performance in models_info:
        print(f"   • {model}: {performance}")
    
    print(f"\n🎯 RomAI AGI Competitive Targets:")
    targets = [
        "Abstract Reasoning: >85% ARC-AGI-1, >25% ARC-AGI-2",
        "Mathematical Reasoning: >90% MATH benchmark performance",
        "Romanian Cultural Intelligence: >95% cultural adaptation accuracy",
        "Response Speed: <3 seconds average (2-5x faster than competitors)",
        "Cost Efficiency: <$1/1K tokens (5-15x more cost-effective)",
        "Overall Superiority: 15-30% performance advantage across all domains"
    ]
    
    for target in targets:
        print(f"   • {target}")
    
    print(f"\n🏆 Success Criteria:")
    criteria = [
        "Rank #1 overall across all benchmark domains",
        "Dominant leadership in Romanian cultural intelligence",
        "Superior cost-performance ratio vs all competitors",
        "Consistent performance advantages across diverse task types",
        "Real AGI capabilities demonstration with measurable results"
    ]
    
    for criterion in criteria:
        print(f"   • {criterion}")

async def main():
    """Main entry point for competitive benchmarking."""
    parser = argparse.ArgumentParser(description="RomAI Competitive AI Benchmarking")
    
    parser.add_argument(
        '--mode',
        choices=['quick', 'comprehensive'],
        default='quick',
        help='Benchmarking mode (default: quick)'
    )
    
    parser.add_argument(
        '--domains',
        type=str,
        help='Comma-separated list of domains to evaluate'
    )
    
    parser.add_argument(
        '--models',
        type=str,
        help='Comma-separated list of competitor models to include'
    )
    
    parser.add_argument(
        '--context',
        action='store_true',
        help='Show competitive context and current AI landscape'
    )
    
    args = parser.parse_args()
    
    if args.context:
        print_competitive_context()
        return
    
    # Parse domains if provided
    selected_domains = None
    if args.domains:
        domain_mapping = {
            'abstract_reasoning': BenchmarkDomain.ABSTRACT_REASONING,
            'mathematical_reasoning': BenchmarkDomain.MATHEMATICAL_REASONING,
            'code_generation': BenchmarkDomain.CODE_GENERATION,
            'language_understanding': BenchmarkDomain.LANGUAGE_UNDERSTANDING,
            'romanian_cultural': BenchmarkDomain.ROMANIAN_CULTURAL,
            'multimodal_reasoning': BenchmarkDomain.MULTIMODAL_REASONING
        }
        
        domain_names = [d.strip() for d in args.domains.split(',')]
        selected_domains = [domain_mapping[name] for name in domain_names if name in domain_mapping]
    
    # Parse models if provided
    selected_models = None
    if args.models:
        model_mapping = {
            'openai_o3': CompetitorModel.OPENAI_O3,
            'claude_sonnet_4': CompetitorModel.ANTHROPIC_CLAUDE_SONNET_4,
            'grok_4': CompetitorModel.XAI_GROK_4,
            'gemini_25_flash': CompetitorModel.GOOGLE_GEMINI_25_FLASH,
            'gpt4o': CompetitorModel.OPENAI_GPT4O
        }
        
        model_names = [m.strip() for m in args.models.split(',')]
        selected_models = [model_mapping[name] for name in model_names if name in model_mapping]
    
    # Show competitive context
    print_competitive_context()
    
    # Run benchmarking
    runner = CompetitiveBenchmarkingRunner()
    results = await runner.run_benchmarking(
        mode=args.mode,
        domains=selected_domains,
        models=selected_models
    )
    
    print(f"\n✅ Competitive benchmarking completed successfully!")
    print(f"🎯 RomAI demonstrated competitive advantages across {len(results['competitive_advantages']['primary_advantages'])} key areas")

if __name__ == "__main__":
    asyncio.run(main())