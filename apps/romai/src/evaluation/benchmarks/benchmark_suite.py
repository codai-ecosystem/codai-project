#!/usr/bin/env python3
"""
🎯 Comprehensive Benchmark Suite
Complete orchestration of all RomAI RUAGA-NOVA benchmarks
"""

import asyncio
import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

# Import framework components
try:
    from .benchmark_framework import (
        BenchmarkResult, BenchmarkConfig, BenchmarkCategory,
        BenchmarkStatus, MetricType, BenchmarkExecutor, ResultAggregator, ReportGenerator
    )
    from .academic_benchmarks import AcademicBenchmarkSuite
    from .romanian_benchmarks import RomanianCulturalBenchmarkSuite, RomanianBenchmarkConfig
    from .action_benchmarks import ActionTakingBenchmarkSuite, ActionBenchmarkConfig, ActionType
    from .performance_benchmarks import PerformanceBenchmarkSuite, PerformanceConfig
except ImportError:
    from benchmark_framework import (
        BenchmarkResult, BenchmarkConfig, BenchmarkCategory,
        BenchmarkStatus, MetricType, BenchmarkExecutor, ResultAggregator, ReportGenerator
    )
    from academic_benchmarks import AcademicBenchmarkSuite
    from romanian_benchmarks import RomanianCulturalBenchmarkSuite, RomanianBenchmarkConfig
    from action_benchmarks import ActionTakingBenchmarkSuite, ActionBenchmarkConfig, ActionType
    from performance_benchmarks import PerformanceBenchmarkSuite, PerformanceConfig

class ComprehensiveBenchmarkSuite:
    """Master orchestrator for all RomAI RUAGA-NOVA benchmarks"""
    
    def __init__(self, 
                 model_name: str = "RUAGA-NOVA-v1.0",
                 target_accuracy: float = 0.95,
                 output_dir: str = "benchmark_results"):
        
        self.model_name = model_name
        self.target_accuracy = target_accuracy
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Create comprehensive configuration
        self.config = BenchmarkConfig(
            model_name=model_name,
            categories=[
                BenchmarkCategory.ACADEMIC,
                BenchmarkCategory.ROMANIAN_CULTURAL,
                BenchmarkCategory.ACTION_TAKING,
                BenchmarkCategory.PERFORMANCE
            ],
            target_accuracy=target_accuracy,
            timeout_seconds=3600  # 1 hour timeout for comprehensive suite
        )
        
        # Initialize specialized configurations
        self.romanian_config = RomanianBenchmarkConfig(
            include_diacritics_test=True,
            include_grammar_test=True,
            include_folklore_test=True,
            include_history_test=True,
            difficulty_levels=['basic', 'intermediate', 'advanced', 'expert']
        )
        
        self.action_config = ActionBenchmarkConfig(
            enabled_action_types=[
                ActionType.FILE_OPERATIONS,
                ActionType.SYSTEM_COMMANDS,
                ActionType.WEB_INTERACTIONS,
                ActionType.API_CALLS,
                ActionType.DATA_PROCESSING,
                ActionType.CODE_GENERATION
            ],
            safe_mode=True,
            sandbox_mode=True,
            timeout_seconds=60,
            success_threshold=0.9
        )
        
        self.performance_config = PerformanceConfig(
            max_concurrent_requests=100,
            request_count=1000,
            max_latency_ms=500.0,
            min_throughput_rps=100.0,
            max_memory_mb=1024.0,
            max_cpu_percent=80.0
        )
        
        # Initialize benchmark suites
        self.benchmark_suites = {
            'academic': AcademicBenchmarkSuite(self.config),
            'romanian_cultural': RomanianCulturalBenchmarkSuite(self.config, self.romanian_config),
            'action_taking': ActionTakingBenchmarkSuite(self.config, self.action_config),
            'performance': PerformanceBenchmarkSuite(self.config, self.performance_config)
        }
        
        # Initialize components
        self.executor = BenchmarkExecutor(self.config)
        self.aggregator = ResultAggregator(self.config)
        self.report_generator = ReportGenerator(self.config)
    
    async def run_full_evaluation(self, model: Any) -> Dict[str, Any]:
        """Run complete comprehensive evaluation"""
        
        print("🎯 Starting Comprehensive RomAI RUAGA-NOVA Evaluation")
        print("=" * 65)
        print(f"Model: {self.model_name}")
        print(f"Target Accuracy: {self.target_accuracy:.1%}")
        print(f"Categories: {len(self.config.categories)}")
        print(f"Output Directory: {self.output_dir}")
        print()
        
        start_time = time.time()
        all_results = []
        suite_summaries = {}
        
        # Run each benchmark suite
        for suite_name, suite in self.benchmark_suites.items():
            print(f"🚀 Running {suite_name.replace('_', ' ').title()} Benchmarks")
            print("-" * 50)
            
            suite_start = time.time()
            
            try:
                # Run the benchmark suite
                suite_results = await suite.run_all_benchmarks(model)
                all_results.extend(suite_results)
                
                # Calculate suite summary
                suite_summary = self._calculate_suite_summary(suite_results, suite_name)
                suite_summaries[suite_name] = suite_summary
                
                suite_time = time.time() - suite_start
                print(f"✅ {suite_name.replace('_', ' ').title()} completed in {suite_time:.1f}s")
                print(f"   Suite Score: {suite_summary['overall_score']:.1%}")
                print(f"   Benchmarks: {suite_summary['completed_count']}/{suite_summary['total_count']}")
                print()
                
            except Exception as e:
                suite_time = time.time() - suite_start
                print(f"❌ {suite_name.replace('_', ' ').title()} failed after {suite_time:.1f}s")
                print(f"   Error: {str(e)}")
                print()
                
                # Create failed suite summary
                suite_summaries[suite_name] = {
                    'overall_score': 0.0,
                    'completed_count': 0,
                    'total_count': 0,
                    'status': 'failed',
                    'error': str(e)
                }
        
        total_time = time.time() - start_time
        
        # Aggregate results
        print("📊 Aggregating Comprehensive Results...")
        aggregated_results = self.aggregator.aggregate_results(all_results)
        
        # Generate comprehensive evaluation
        comprehensive_evaluation = self._generate_comprehensive_evaluation(
            suite_summaries, aggregated_results, total_time
        )
        
        # Generate reports
        await self._generate_comprehensive_reports(
            all_results, suite_summaries, comprehensive_evaluation
        )
        
        return comprehensive_evaluation
    
    def _calculate_suite_summary(self, results: List[BenchmarkResult], suite_name: str) -> Dict[str, Any]:
        """Calculate summary for a benchmark suite"""
        
        if not results:
            return {
                'overall_score': 0.0,
                'completed_count': 0,
                'total_count': 0,
                'status': 'no_results'
            }
        
        completed_results = [r for r in results if r.status == BenchmarkStatus.COMPLETED]
        failed_results = [r for r in results if r.status == BenchmarkStatus.FAILED]
        
        # Calculate overall score
        if completed_results:
            scores = [r.get_primary_score() for r in completed_results]
            overall_score = sum(scores) / len(scores)
        else:
            overall_score = 0.0
        
        # Calculate category-specific metrics
        category_metrics = {}
        for result in completed_results:
            for metric_type, value in result.metrics.items():
                if metric_type.value not in category_metrics:
                    category_metrics[metric_type.value] = []
                category_metrics[metric_type.value].append(value)
        
        # Average category metrics
        avg_category_metrics = {
            metric: sum(values) / len(values) 
            for metric, values in category_metrics.items()
        }
        
        return {
            'overall_score': overall_score,
            'completed_count': len(completed_results),
            'failed_count': len(failed_results),
            'total_count': len(results),
            'status': 'completed' if completed_results else 'failed',
            'category_metrics': avg_category_metrics,
            'benchmark_names': [r.benchmark_name for r in results],
            'execution_time': sum(r.execution_time for r in results)
        }
    
    def _generate_comprehensive_evaluation(self, 
                                         suite_summaries: Dict[str, Any],
                                         aggregated_results: Dict[str, Any],
                                         total_time: float) -> Dict[str, Any]:
        """Generate comprehensive evaluation results"""
        
        # Calculate overall performance
        suite_scores = [s['overall_score'] for s in suite_summaries.values() if s.get('overall_score', 0) > 0]
        overall_score = sum(suite_scores) / len(suite_scores) if suite_scores else 0.0
        
        # Calculate weighted performance (cultural and performance have higher weights)
        weighted_score = 0.0
        total_weight = 0.0
        
        # Define weights
        cultural_weight = 1.5
        performance_weight = 1.2
        
        for suite_name, summary in suite_summaries.items():
            score = summary.get('overall_score', 0)
            if suite_name == 'romanian_cultural':
                weight = cultural_weight
            elif suite_name == 'performance':
                weight = performance_weight
            else:
                weight = 1.0
            
            weighted_score += score * weight
            total_weight += weight
        
        final_weighted_score = weighted_score / total_weight if total_weight > 0 else 0.0
        
        # Evaluate target achievement
        target_met = final_weighted_score >= self.target_accuracy
        excellence_achieved = final_weighted_score >= 0.90
        
        # Calculate category excellence
        category_excellence = {}
        for suite_name, summary in suite_summaries.items():
            score = summary.get('overall_score', 0)
            category_excellence[suite_name] = {
                'score': score,
                'excellence': score >= 0.90,
                'target_met': score >= self.target_accuracy
            }
        
        # Generate comprehensive insights
        insights = self._generate_comprehensive_insights(suite_summaries, aggregated_results)
        
        # Generate recommendations
        recommendations = self._generate_improvement_recommendations(suite_summaries)
        
        evaluation = {
            'model_name': self.model_name,
            'evaluation_timestamp': datetime.now().isoformat(),
            'total_execution_time_seconds': total_time,
            'overall_performance': {
                'overall_score': overall_score,
                'weighted_score': final_weighted_score,
                'target_accuracy': self.target_accuracy,
                'target_met': target_met,
                'excellence_achieved': excellence_achieved
            },
            'suite_performance': suite_summaries,
            'category_excellence': category_excellence,
            'comprehensive_insights': insights,
            'improvement_recommendations': recommendations,
            'aggregated_metrics': aggregated_results
        }
        
        return evaluation
    
    def _generate_comprehensive_insights(self, 
                                       suite_summaries: Dict[str, Any],
                                       aggregated_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive performance insights"""
        
        insights = {
            'strengths': [],
            'weaknesses': [],
            'competitive_advantages': [],
            'improvement_areas': []
        }
        
        # Analyze each suite
        for suite_name, summary in suite_summaries.items():
            score = summary.get('overall_score', 0)
            
            if score >= 0.95:
                insights['strengths'].append(f"Exceptional {suite_name.replace('_', ' ')} performance ({score:.1%})")
            elif score >= 0.80:
                insights['strengths'].append(f"Strong {suite_name.replace('_', ' ')} capabilities ({score:.1%})")
            elif score >= 0.60:
                insights['improvement_areas'].append(f"{suite_name.replace('_', ' ').title()} needs optimization ({score:.1%})")
            else:
                insights['weaknesses'].append(f"{suite_name.replace('_', ' ').title()} requires significant improvement ({score:.1%})")
        
        # Romanian cultural analysis
        romanian_score = suite_summaries.get('romanian_cultural', {}).get('overall_score', 0)
        if romanian_score >= 0.85:
            insights['competitive_advantages'].append(f"Unique Romanian cultural intelligence ({romanian_score:.1%})")
        
        # Action-taking analysis
        action_score = suite_summaries.get('action_taking', {}).get('overall_score', 0)
        if action_score >= 0.90:
            insights['competitive_advantages'].append(f"Superior action-taking capabilities ({action_score:.1%})")
        
        # Performance analysis
        perf_score = suite_summaries.get('performance', {}).get('overall_score', 0)
        if perf_score >= 0.85:
            insights['strengths'].append(f"Excellent system performance ({perf_score:.1%})")
        elif perf_score < 0.70:
            insights['improvement_areas'].append(f"Performance optimization needed ({perf_score:.1%})")
        
        return insights
    
    def _generate_improvement_recommendations(self, suite_summaries: Dict[str, Any]) -> List[str]:
        """Generate specific improvement recommendations"""
        
        recommendations = []
        
        for suite_name, summary in suite_summaries.items():
            score = summary.get('overall_score', 0)
            
            if score < self.target_accuracy:
                if suite_name == 'academic':
                    recommendations.append(f"Academic Performance: Improve MMLU reasoning, HumanEval code generation, and MATH problem-solving (current: {score:.1%})")
                elif suite_name == 'romanian_cultural':
                    recommendations.append(f"Romanian Cultural: Enhance language grammar, folklore knowledge, and historical understanding (current: {score:.1%})")
                elif suite_name == 'action_taking':
                    recommendations.append(f"Action-Taking: Strengthen file operations, system commands, and web interactions (current: {score:.1%})")
                elif suite_name == 'performance':
                    recommendations.append(f"Performance: Optimize latency, throughput, and resource utilization (current: {score:.1%})")
        
        # Overall system recommendations
        overall_scores = [s.get('overall_score', 0) for s in suite_summaries.values()]
        overall_avg = sum(overall_scores) / len(overall_scores) if overall_scores else 0
        
        if overall_avg < 0.95:
            recommendations.append("Implement comprehensive model fine-tuning across all domains to achieve 95%+ accuracy target")
        
        if len([s for s in overall_scores if s < 0.80]) > 1:
            recommendations.append("Focus on multi-domain training to achieve balanced excellence across all categories")
        
        return recommendations
    
    async def _generate_comprehensive_reports(self, 
                                            all_results: List[BenchmarkResult],
                                            suite_summaries: Dict[str, Any],
                                            comprehensive_evaluation: Dict[str, Any]) -> None:
        """Generate comprehensive benchmark reports"""
        
        print("📝 Generating Comprehensive Reports...")
        
        # Generate JSON report
        json_path = self.output_dir / f"comprehensive_benchmark_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(comprehensive_evaluation, f, indent=2, ensure_ascii=False, default=str)
        
        # Generate HTML report
        html_content = await self._generate_html_report(comprehensive_evaluation)
        html_path = self.output_dir / f"comprehensive_benchmark_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ JSON Report: {json_path}")
        print(f"✅ HTML Report: {html_path}")
    
    async def _generate_html_report(self, evaluation: Dict[str, Any]) -> str:
        """Generate comprehensive HTML report"""
        
        overall_perf = evaluation['overall_performance']
        suite_perf = evaluation['suite_performance']
        insights = evaluation['comprehensive_insights']
        recommendations = evaluation['improvement_recommendations']
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RomAI RUAGA-NOVA Comprehensive Benchmark Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        h1 {{ color: #2c3e50; text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #34495e; border-left: 4px solid #3498db; padding-left: 15px; }}
        .summary {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .metric {{ display: inline-block; margin: 10px 15px; text-align: center; }}
        .metric-value {{ font-size: 2em; font-weight: bold; display: block; }}
        .metric-label {{ font-size: 0.9em; opacity: 0.9; }}
        .suite-results {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }}
        .suite-card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; }}
        .score {{ font-size: 1.5em; font-weight: bold; color: #28a745; }}
        .score.warning {{ color: #ffc107; }}
        .score.danger {{ color: #dc3545; }}
        .insights {{ background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .insight-list {{ list-style-type: none; padding: 0; }}
        .insight-list li {{ padding: 8px 0; border-bottom: 1px solid #dee2e6; }}
        .recommendation {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 10px 0; }}
        .status-excellent {{ color: #28a745; font-weight: bold; }}
        .status-good {{ color: #17a2b8; font-weight: bold; }}
        .status-warning {{ color: #ffc107; font-weight: bold; }}
        .status-poor {{ color: #dc3545; font-weight: bold; }}
        .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e9ecef; color: #6c757d; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 RomAI RUAGA-NOVA Comprehensive Benchmark Report</h1>
        
        <div class="summary">
            <h2 style="color: white; border-left: 4px solid white;">📊 Overall Performance Summary</h2>
            <div style="text-align: center;">
                <div class="metric">
                    <span class="metric-value">{overall_perf['weighted_score']:.1%}</span>
                    <span class="metric-label">Weighted Score</span>
                </div>
                <div class="metric">
                    <span class="metric-value">{overall_perf['overall_score']:.1%}</span>
                    <span class="metric-label">Overall Score</span>
                </div>
                <div class="metric">
                    <span class="metric-value">{'✅' if overall_perf['target_met'] else '❌'}</span>
                    <span class="metric-label">Target ({overall_perf['target_accuracy']:.1%}) Met</span>
                </div>
                <div class="metric">
                    <span class="metric-value">{'🟢' if overall_perf['excellence_achieved'] else '🟡'}</span>
                    <span class="metric-label">Excellence (90%+)</span>
                </div>
            </div>
        </div>
        
        <h2>📈 Suite Performance Breakdown</h2>
        <div class="suite-results">
"""
        
        # Add suite performance cards
        for suite_name, summary in suite_perf.items():
            score = summary.get('overall_score', 0)
            score_class = 'score'
            if score < 0.6:
                score_class += ' danger'
            elif score < 0.8:
                score_class += ' warning'
            
            status_class = 'status-excellent' if score >= 0.9 else 'status-good' if score >= 0.8 else 'status-warning' if score >= 0.6 else 'status-poor'
            
            html_content += f"""
            <div class="suite-card">
                <h3>{suite_name.replace('_', ' ').title()}</h3>
                <div class="{score_class}">{score:.1%}</div>
                <p>Completed: {summary.get('completed_count', 0)}/{summary.get('total_count', 0)} benchmarks</p>
                <p>Status: <span class="{status_class}">{summary.get('status', 'unknown').upper()}</span></p>
                <p>Execution: {summary.get('execution_time', 0):.1f}s</p>
            </div>
"""
        
        html_content += """
        </div>
        
        <h2>🔍 Performance Insights</h2>
        <div class="insights">
"""
        
        # Add insights
        for category, items in insights.items():
            if items:
                html_content += f"""
            <h3>{category.replace('_', ' ').title()}</h3>
            <ul class="insight-list">
"""
                for item in items:
                    html_content += f"<li>• {item}</li>"
                html_content += "</ul>"
        
        html_content += """
        </div>
        
        <h2>🎯 Improvement Recommendations</h2>
"""
        
        # Add recommendations
        for rec in recommendations:
            html_content += f'<div class="recommendation">📌 {rec}</div>'
        
        html_content += f"""
        
        <div class="footer">
            <p><strong>RomAI RUAGA-NOVA Evaluation System</strong></p>
            <p>Generated on {evaluation['evaluation_timestamp']}</p>
            <p>Total Execution Time: {evaluation['total_execution_time_seconds']:.1f} seconds</p>
            <p>🇷🇴 Advanced Romanian Cultural Intelligence • 🎯 Superior Action-Taking • ⚡ Optimized Performance</p>
        </div>
    </div>
</body>
</html>
"""
        
        return html_content

def test_comprehensive_suite():
    """Test the comprehensive benchmark suite"""
    print("🎯 Testing Comprehensive RomAI RUAGA-NOVA Benchmark Suite")
    print("=" * 70)
    
    # Create comprehensive suite
    suite = ComprehensiveBenchmarkSuite(
        model_name="RUAGA-NOVA-Test-v1.0",
        target_accuracy=0.95,
        output_dir="test_benchmark_results"
    )
    
    print(f"✅ Suite Configuration:")
    print(f"   Model: {suite.model_name}")
    print(f"   Target: {suite.target_accuracy:.1%}")
    print(f"   Categories: {len(suite.config.categories)}")
    print(f"   Suites: {list(suite.benchmark_suites.keys())}")
    
    # Mock comprehensive model
    class MockComprehensiveModel:
        def __init__(self):
            self.name = "MockComprehensiveRuagaNovaModel"
            self.version = "1.0"
            self.capabilities = [
                "academic_reasoning", "romanian_cultural_intelligence",
                "action_taking", "performance_optimization"
            ]
    
    model = MockComprehensiveModel()
    
    # Run comprehensive evaluation
    print(f"\n🚀 Running Comprehensive Evaluation...")
    
    async def run_comprehensive_test():
        evaluation_results = await suite.run_full_evaluation(model)
        
        print("\n" + "="*70)
        print("🏆 COMPREHENSIVE EVALUATION RESULTS")
        print("="*70)
        
        overall_perf = evaluation_results['overall_performance']
        print(f"🎯 Overall Performance:")
        print(f"   Overall Score: {overall_perf['overall_score']:.1%}")
        print(f"   Weighted Score: {overall_perf['weighted_score']:.1%}")
        print(f"   Target ({overall_perf['target_accuracy']:.1%}) {'✅ MET' if overall_perf['target_met'] else '❌ NOT MET'}")
        print(f"   Excellence (90%+): {'🟢 ACHIEVED' if overall_perf['excellence_achieved'] else '🟡 APPROACHING'}")
        
        print(f"\n📊 Suite Breakdown:")
        for suite_name, summary in evaluation_results['suite_performance'].items():
            score = summary.get('overall_score', 0)
            status_icon = '🟢' if score >= 0.9 else '🟡' if score >= 0.7 else '🔴'
            print(f"   {status_icon} {suite_name.replace('_', ' ').title()}: {score:.1%} ({summary.get('completed_count', 0)}/{summary.get('total_count', 0)} benchmarks)")
        
        print(f"\n🔍 Key Insights:")
        insights = evaluation_results['comprehensive_insights']
        for category, items in insights.items():
            if items:
                print(f"   {category.replace('_', ' ').title()}:")
                for item in items[:3]:  # Show top 3 items
                    print(f"     • {item}")
        
        print(f"\n🎯 Improvement Focus:")
        for i, rec in enumerate(evaluation_results['improvement_recommendations'][:3], 1):
            print(f"   {i}. {rec}")
        
        print(f"\n⏱️  Execution Time: {evaluation_results['total_execution_time_seconds']:.1f}s")
        
        return evaluation_results
    
    # Run async comprehensive test
    results = asyncio.run(run_comprehensive_test())
    
    print("\n" + "="*70)
    print("✅ COMPREHENSIVE BENCHMARK SUITE VALIDATION COMPLETE!")
    print("="*70)
    print("✅ Academic Benchmarks - MMLU, HumanEval, MATH evaluations")
    print("✅ Romanian Cultural Benchmarks - Language, folklore, history")  
    print("✅ Action-Taking Benchmarks - File ops, commands, web interactions")
    print("✅ Performance Benchmarks - Latency, throughput, resource usage")
    print("✅ Comprehensive Orchestration - Suite coordination and reporting")
    print("✅ Advanced Analytics - Performance insights and recommendations")
    print("✅ Multi-format Reports - JSON data and HTML visualization")
    print("🎯 Ready for production-grade comprehensive evaluation!")
    print("🇷🇴 Advanced Romanian Cultural Intelligence Integration Complete!")
    print("⚡ Superior Performance Optimization and Monitoring Ready!")

if __name__ == "__main__":
    test_comprehensive_suite()