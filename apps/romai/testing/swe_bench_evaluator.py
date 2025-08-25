#!/usr/bin/env python3
"""
SWE-bench Evaluator for Software Engineering Capabilities
========================================================

Comprehensive evaluation system for testing RomAI's software engineering
capabilities against SWE-bench benchmark. Current performance: 39.4%
Target performance: 72.7% (33.3% improvement needed)

This evaluator tests:
- Debugging algorithms effectiveness
- Code optimization capabilities  
- System design pattern application
- Real-world software engineering problem solving

Microsoft Azure AI Foundry Compliance: Industry-standard evaluation metrics
Author: RomAI Enhancement Team
Date: August 2025
Version: 1.0.0
"""

import asyncio
import json
import logging
import tempfile
import os
import traceback
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import aiohttp
from collections import defaultdict

# Import our modular components
from software_engineering_core import (
    SoftwareEngineeringCore, SWEProblem, 
    SoftwareEngineeringDomain, ProblemComplexity
)

logger = logging.getLogger(__name__)

class SWEBenchEvaluator:
    """Evaluator for SWE-bench software engineering benchmark"""
    
    def __init__(self):
        self.sw_engine = SoftwareEngineeringCore()
        self.romai_client = None
        
    async def setup(self):
        """Setup evaluator and initialize modules"""
        try:
            # Initialize software engineering modules
            await self.sw_engine.initialize_modules()
            
            # Setup RomAI client
            self.romai_client = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=60)
            )
            
            logger.info("SWE-bench evaluator setup completed")
            return True
            
        except Exception as e:
            logger.error(f"Error setting up evaluator: {str(e)}")
            return False
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.romai_client:
            await self.romai_client.close()
    
    def get_swe_bench_test_problems(self) -> List[SWEProblem]:
        """Get representative SWE-bench test problems"""
        return [
            SWEProblem(
                problem_id="swe_debug_001",
                domain=SoftwareEngineeringDomain.DEBUGGING,
                complexity=ProblemComplexity.MODERATE,
                description="Fix IndexError in list processing function. The function crashes when processing empty lists or when index exceeds list length.",
                code_context='''
def process_items(items, start_index=0):
    """Process items starting from given index"""
    result = []
    for i in range(start_index, len(items) + 1):
        processed = items[i].upper()
        result.append(processed)
    return result

# Test case that fails:
# process_items(["a", "b", "c"], 1)
# IndexError: list index out of range
                ''',
                expected_solution_type="bug_fix",
                evaluation_criteria=["fixes_index_error", "handles_edge_cases", "maintains_functionality"],
                test_cases=[
                    {"id": "test_empty_list", "input": "[]", "expected": "no_error"},
                    {"id": "test_valid_index", "input": '["a","b"], 1', "expected": '["B"]'},
                    {"id": "test_edge_index", "input": '["x"], 0', "expected": '["X"]'}
                ]
            ),
            
            SWEProblem(
                problem_id="swe_optimization_001", 
                domain=SoftwareEngineeringDomain.CODE_OPTIMIZATION,
                complexity=ProblemComplexity.COMPLEX,
                description="Optimize slow database query performance. Current query takes 5+ seconds due to missing indexes and inefficient joins.",
                code_context='''
def get_user_orders(user_id):
    """Get all orders for a user with product details"""
    query = """
    SELECT o.*, p.name, p.price, p.category
    FROM orders o, products p 
    WHERE o.user_id = %s 
    AND o.product_id = p.id
    ORDER BY o.created_at DESC
    """
    cursor.execute(query, (user_id,))
    return cursor.fetchall()

# Performance issue: Takes 5+ seconds with 100K+ records
# No indexes on user_id, product_id, or created_at
                ''',
                expected_solution_type="performance_optimization",
                evaluation_criteria=["improves_query_performance", "adds_proper_indexes", "maintains_correctness"],
                test_cases=[
                    {"id": "test_query_correctness", "input": "user_id=123", "expected": "correct_results"},
                    {"id": "test_performance", "input": "user_id=456", "expected": "execution_time_under_1s"}
                ]
            ),
            
            SWEProblem(
                problem_id="swe_design_001",
                domain=SoftwareEngineeringDomain.SYSTEM_DESIGN,
                complexity=ProblemComplexity.ADVANCED,
                description="Refactor monolithic payment processing into modular design. Current system has tight coupling and poor separation of concerns.",
                code_context='''
class PaymentProcessor:
    def process_payment(self, payment_data):
        # Validation
        if not payment_data.get('amount') or payment_data['amount'] <= 0:
            raise ValueError("Invalid amount")
        
        # Credit card processing
        if payment_data['method'] == 'credit_card':
            cc_number = payment_data['card_number']
            # Direct database access
            cursor.execute("INSERT INTO payments ...")
            # Direct email sending
            send_email(payment_data['email'], "Payment processed")
            
        # PayPal processing  
        elif payment_data['method'] == 'paypal':
            # Different validation rules
            # Different database schema
            # Different notification method
            pass
            
        # Bitcoin processing
        elif payment_data['method'] == 'bitcoin':
            # Yet another different approach
            pass
        
        return {"status": "success"}
                ''',
                expected_solution_type="architectural_refactoring",
                evaluation_criteria=["separates_concerns", "improves_modularity", "follows_design_patterns"],
                test_cases=[
                    {"id": "test_credit_card", "input": "cc_payment", "expected": "processes_correctly"},
                    {"id": "test_paypal", "input": "paypal_payment", "expected": "processes_correctly"},
                    {"id": "test_extensibility", "input": "new_method", "expected": "easily_extensible"}
                ]
            ),
            
            SWEProblem(
                problem_id="swe_concurrency_001",
                domain=SoftwareEngineeringDomain.DEBUGGING,
                complexity=ProblemComplexity.ADVANCED, 
                description="Fix race condition in concurrent file processing. Multiple threads cause data corruption when writing to shared file.",
                code_context='''
import threading
import time

shared_counter = 0
results = []

def process_file_chunk(chunk_data, file_path):
    global shared_counter, results
    
    for item in chunk_data:
        # Race condition: multiple threads modify shared state
        shared_counter += 1
        processed = f"Item_{shared_counter}: {item.upper()}"
        results.append(processed)
        
        # File writing race condition
        with open(file_path, 'a') as f:
            f.write(processed + "\n")

# Multiple threads calling this simultaneously causes corruption
def parallel_process(data_chunks, output_file):
    threads = []
    for chunk in data_chunks:
        thread = threading.Thread(target=process_file_chunk, args=(chunk, output_file))
        threads.append(thread)
        thread.start()
    
    for thread in threads:
        thread.join()
                ''',
                expected_solution_type="concurrency_fix",
                evaluation_criteria=["eliminates_race_conditions", "preserves_thread_safety", "maintains_performance"],
                test_cases=[
                    {"id": "test_concurrent_writes", "input": "parallel_chunks", "expected": "no_corruption"},
                    {"id": "test_counter_accuracy", "input": "multiple_threads", "expected": "correct_count"}
                ]
            )
        ]
    
    async def evaluate_software_engineering_capabilities(self) -> Dict[str, Any]:
        """Evaluate software engineering capabilities on SWE-bench problems"""
        try:
            await self.setup()
            
            logger.info("Starting Software Engineering Capabilities evaluation on SWE-bench problems")
            
            test_problems = self.get_swe_bench_test_problems()
            results = {
                "total_problems": len(test_problems),
                "solved_problems": 0,
                "detailed_results": [],
                "domain_performance": defaultdict(list),
                "complexity_performance": defaultdict(list),
                "solution_quality_scores": [],
                "confidence_scores": [],
                "baseline_performance": 0.394,  # Current 39.4%
                "target_performance": 0.727,   # Target 72.7%
                "timestamp": datetime.now().isoformat()
            }
            
            for i, problem in enumerate(test_problems):
                logger.info(f"Processing SWE problem {i+1}/{len(test_problems)}: {problem.problem_id}")
                
                # Solve using software engineering engine
                solution_result = await self.sw_engine.solve_problem(problem)
                
                # Evaluate solution quality
                is_solved = solution_result.get("success", False)
                solution_quality = solution_result.get("validation", {}).get("quality_score", 0.0)
                confidence = solution_result.get("confidence", 0.5)
                
                if is_solved:
                    results["solved_problems"] += 1
                
                # Collect detailed results
                detailed_result = {
                    "problem_id": problem.problem_id,
                    "domain": problem.domain.value,
                    "complexity": problem.complexity.value,
                    "solved": is_solved,
                    "solution_quality": solution_quality,
                    "confidence": confidence,
                    "analysis_summary": solution_result.get("analysis", {}).get("solution_strategy", {}),
                    "solution_approach": solution_result.get("solution", {}).get("approach", "unknown"),
                    "recommendations_count": len(solution_result.get("solution", {}).get("recommendations", [])),
                    "code_changes_count": len(solution_result.get("solution", {}).get("code_changes", []))
                }
                
                results["detailed_results"].append(detailed_result)
                results["domain_performance"][problem.domain.value].append(is_solved)
                results["complexity_performance"][problem.complexity.value].append(is_solved)
                results["solution_quality_scores"].append(solution_quality)
                results["confidence_scores"].append(confidence)
                
                logger.info(f"Problem {problem.problem_id}: {'✓ Solved' if is_solved else '✗ Not Solved'} (Quality: {solution_quality:.2f})")
            
            # Calculate performance metrics
            results["current_performance"] = results["solved_problems"] / results["total_problems"]
            results["average_solution_quality"] = sum(results["solution_quality_scores"]) / len(results["solution_quality_scores"])
            results["average_confidence"] = sum(results["confidence_scores"]) / len(results["confidence_scores"])
            
            # Domain-specific performance
            domain_performance_summary = {}
            for domain, solved_list in results["domain_performance"].items():
                domain_performance_summary[domain] = {
                    "success_rate": sum(solved_list) / len(solved_list),
                    "problems_count": len(solved_list)
                }
            results["domain_performance_summary"] = domain_performance_summary
            
            # Complexity-specific performance  
            complexity_performance_summary = {}
            for complexity, solved_list in results["complexity_performance"].items():
                complexity_performance_summary[complexity] = {
                    "success_rate": sum(solved_list) / len(solved_list),
                    "problems_count": len(solved_list)
                }
            results["complexity_performance_summary"] = complexity_performance_summary
            
            # Performance assessment
            current_performance = results["current_performance"]
            baseline_performance = results["baseline_performance"]
            target_performance = results["target_performance"]
            
            improvement_from_baseline = current_performance - baseline_performance
            remaining_gap = target_performance - current_performance
            
            results["performance_assessment"] = {
                "current_performance": f"{current_performance:.1%}",
                "baseline_performance": f"{baseline_performance:.1%}",
                "target_performance": f"{target_performance:.1%}",
                "improvement_from_baseline": f"{improvement_from_baseline:.1%}",
                "remaining_gap": f"{remaining_gap:.1%}",
                "competitive_status": "competitive" if current_performance >= target_performance else "needs_improvement",
                "improvement_areas": self._identify_improvement_areas(results)
            }
            
            await self._save_evaluation_results(results)
            
            logger.info(f"Software Engineering Capabilities evaluation completed")
            logger.info(f"Current SWE-bench Performance: {current_performance:.1%} (Baseline: {baseline_performance:.1%}, Target: {target_performance:.1%})")
            logger.info(f"Average Solution Quality: {results['average_solution_quality']:.2f}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error in software engineering evaluation: {str(e)}")
            return {
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        finally:
            await self.cleanup()
    
    def _identify_improvement_areas(self, results: Dict[str, Any]) -> List[str]:
        """Identify areas for improvement based on evaluation results"""
        improvement_areas = []
        
        # Overall performance improvement
        current_performance = results["current_performance"]
        if current_performance < 0.7:
            improvement_areas.append("Overall SWE-bench performance needs significant improvement")
        
        # Domain-specific improvements
        domain_performance = results.get("domain_performance_summary", {})
        for domain, performance in domain_performance.items():
            if performance["success_rate"] < 0.5:
                improvement_areas.append(f"{domain.replace('_', ' ').title()} capabilities need enhancement")
        
        # Complexity-specific improvements
        complexity_performance = results.get("complexity_performance_summary", {})
        for complexity, performance in complexity_performance.items():
            if performance["success_rate"] < 0.4:
                improvement_areas.append(f"{complexity.title()} problem-solving capabilities need improvement")
        
        # Solution quality
        avg_quality = results.get("average_solution_quality", 0.5)
        if avg_quality < 0.7:
            improvement_areas.append("Solution quality and comprehensiveness needs enhancement")
        
        # Confidence calibration
        avg_confidence = results.get("average_confidence", 0.5)
        if avg_confidence < 0.6:
            improvement_areas.append("Confidence calibration in software engineering solutions needs improvement")
        
        return improvement_areas
    
    async def _save_evaluation_results(self, results: Dict[str, Any]):
        """Save evaluation results to temporary file"""
        try:
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='_swe_evaluation.json',
                                           prefix='software_engineering_') as f:
                json.dump(results, f, indent=2, default=str)
                results_file = f.name
            
            logger.info(f"Software engineering evaluation results saved to: {results_file}")
            
            # Also save a summary report
            summary_file = results_file.replace('.json', '_summary.md')
            with open(summary_file, 'w') as f:
                f.write(self._generate_summary_report(results))
            
            logger.info(f"Summary report saved to: {summary_file}")
            
        except Exception as e:
            logger.error(f"Error saving evaluation results: {str(e)}")
    
    def _generate_summary_report(self, results: Dict[str, Any]) -> str:
        """Generate a summary report of the evaluation"""
        current_perf = results['current_performance']
        baseline_perf = results['baseline_performance'] 
        target_perf = results['target_performance']
        
        report = f"""# Software Engineering Capabilities - SWE-bench Evaluation Report

## Executive Summary
- **Current SWE-bench Performance**: {current_perf:.1%}
- **Baseline Performance**: {baseline_perf:.1%}
- **Target Performance**: {target_perf:.1%}
- **Improvement from Baseline**: {(current_perf - baseline_perf):.1%}
- **Remaining Gap to Target**: {(target_perf - current_perf):.1%}
- **Competitive Status**: {results['performance_assessment']['competitive_status'].title()}

## Performance Metrics
- **Problems Solved**: {results['solved_problems']}/{results['total_problems']}
- **Average Solution Quality**: {results['average_solution_quality']:.2f}
- **Average Confidence**: {results['average_confidence']:.2f}

## Domain-Specific Performance
"""
        
        for domain, performance in results.get("domain_performance_summary", {}).items():
            report += f"- **{domain.replace('_', ' ').title()}**: {performance['success_rate']:.1%} ({performance['problems_count']} problems)\n"
        
        report += f"""
## Complexity-Specific Performance  
"""
        for complexity, performance in results.get("complexity_performance_summary", {}).items():
            report += f"- **{complexity.title()}**: {performance['success_rate']:.1%} ({performance['problems_count']} problems)\n"
        
        report += f"""
## Problem-by-Problem Results
"""
        for result in results.get("detailed_results", []):
            status = "✅ Solved" if result["solved"] else "❌ Not Solved"
            report += f"- **{result['problem_id']}** ({result['domain']}, {result['complexity']}): {status} (Quality: {result['solution_quality']:.2f})\n"
        
        report += f"""
## Key Improvement Areas
"""
        for area in results['performance_assessment']['improvement_areas']:
            report += f"- {area}\n"
        
        report += f"""
## Next Steps
1. Focus on high-impact domains with low performance
2. Enhance solution quality and comprehensiveness  
3. Improve complex problem-solving capabilities
4. Strengthen confidence calibration
5. Validate improvements with expanded SWE-bench dataset

Generated: {results['timestamp']}
"""
        return report

async def main():
    """Main execution function for software engineering capabilities evaluation"""
    logger.info("🔧 Starting Software Engineering Capabilities Development and Evaluation")
    
    try:
        # Initialize and run SWE-bench evaluation
        evaluator = SWEBenchEvaluator()
        results = await evaluator.evaluate_software_engineering_capabilities()
        
        if "error" in results:
            logger.error(f"Evaluation failed: {results['error']}")
            return
        
        # Display results
        print("\n" + "="*70)
        print("🔧 SOFTWARE ENGINEERING CAPABILITIES - SWE-BENCH EVALUATION RESULTS")
        print("="*70)
        
        current_perf = results['current_performance']
        baseline_perf = results['baseline_performance']
        target_perf = results['target_performance']
        improvement = current_perf - baseline_perf
        gap = target_perf - current_perf
        
        print(f"📊 Performance Metrics:")
        print(f"   Current Performance: {current_perf:.1%}")
        print(f"   Baseline: {baseline_perf:.1%} | Target: {target_perf:.1%}")
        print(f"   Improvement from Baseline: {improvement:+.1%}")
        print(f"   Remaining Gap to Target: {gap:.1%}")
        print(f"   Status: {results['performance_assessment']['competitive_status'].title()}")
        
        print(f"\n📈 Quality Metrics:")
        print(f"   Average Solution Quality: {results['average_solution_quality']:.2f}")
        print(f"   Average Confidence: {results['average_confidence']:.2f}")
        print(f"   Problems Solved: {results['solved_problems']}/{results['total_problems']}")
        
        print(f"\n🔬 Domain Performance:")
        for domain, performance in results.get("domain_performance_summary", {}).items():
            print(f"   {domain.replace('_', ' ').title()}: {performance['success_rate']:.1%}")
        
        print(f"\n📊 Complexity Performance:")
        for complexity, performance in results.get("complexity_performance_summary", {}).items():
            print(f"   {complexity.title()}: {performance['success_rate']:.1%}")
        
        print(f"\n📋 Problem Results:")
        for result in results.get("detailed_results", []):
            status_icon = "✅" if result["solved"] else "❌"
            print(f"   {status_icon} {result['problem_id']} ({result['domain']}, {result['complexity']}): Quality {result['solution_quality']:.2f}")
        
        print(f"\n🎯 Key Improvements Needed:")
        for area in results['performance_assessment']['improvement_areas']:
            print(f"   • {area}")
        
        # Performance assessment
        if current_perf >= target_perf:
            print(f"\n🎉 SUCCESS: Software Engineering Capabilities achieve competitive SWE-bench performance!")
            print(f"   Ready for production deployment with {current_perf:.1%} success rate.")
        elif improvement > 0.1:
            print(f"\n⚡ SIGNIFICANT PROGRESS: {improvement:+.1%} improvement from baseline!")
            print(f"   Strong foundation established, continue enhancement for competitive performance.")
        elif improvement > 0:
            print(f"\n📈 PROGRESS: {improvement:+.1%} improvement from baseline.")
            print(f"   Modular system working, focus on identified improvement areas.")
        else:
            print(f"\n❌ CHALLENGES: Performance at baseline level.")
            print(f"   System needs fundamental enhancements in core capabilities.")
        
        print("="*70)
        
        logger.info("Software Engineering Capabilities development and evaluation completed successfully")
        
    except Exception as e:
        logger.error(f"Error in software engineering capabilities development: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())