"""
ARC-AGI Abstract Reasoning Engine Test Suite
===========================================

Comprehensive validation suite for RomAI's ARC-AGI abstract reasoning capabilities.
Tests the engine against a diverse set of abstract reasoning tasks that require
novel pattern recognition, skill acquisition, and transfer learning.

Target Performance: >95% success rate to surpass OpenAI O3's 83.3% ARC-AGI score.

This validation framework tests the core capabilities required for true AGI:
- Abstract reasoning without domain-specific training
- Pattern recognition in novel scenarios
- Few-shot learning from minimal examples
- Spatial and logical transformation understanding
"""

import asyncio
import json
import numpy as np
import time
from pathlib import Path
from typing import Dict, List, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our ARC-AGI engine
from apps.romai.src.ml.reasoning.autonomous_arc_agi_engine import AutonomousARCAGIEngine

class ARCAGIEngineValidator:
    """Comprehensive validation suite for ARC-AGI abstract reasoning"""
    
    def __init__(self):
        self.engine = AutonomousARCAGIEngine()
        self.results = []
        self.start_time = None
        
    async def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run complete validation suite"""
        print("🔬 ROMAI ARC-AGI ABSTRACT REASONING ENGINE VALIDATION")
        print("=" * 65)
        print("Target: >95% success rate (surpass OpenAI O3's 83.3%)")
        print("Testing: Novel pattern recognition, abstract reasoning, skill acquisition")
        print()
        
        self.start_time = time.time()
        
        # Load test data
        test_data = self._load_test_data()
        
        if not test_data:
            return {"error": "Failed to load test data"}
            
        print(f"🧪 Loaded {len(test_data)} ARC-AGI test tasks")
        print()
        
        # Run tests by category
        categories = self._group_tests_by_category(test_data)
        
        total_tests = 0
        total_passed = 0
        category_results = {}
        
        for category, tasks in categories.items():
            print(f"🎯 Testing {category.upper().replace('_', ' ')} ({len(tasks)} tasks)")
            
            category_passed = 0
            category_total = len(tasks)
            
            for i, task in enumerate(tasks, 1):
                print(f"  [{i:2d}/{category_total:2d}] {task['task_id']}", end=" ")
                
                try:
                    result = await self.engine.solve_arc_agi_task(task['task_data'])
                    
                    # Validate result
                    is_correct = self._validate_result(result, task)
                    confidence = result.confidence_score
                    
                    if is_correct and confidence >= 0.5:  # Success criteria
                        print(f"✅ PASS (conf: {confidence:.3f})")
                        category_passed += 1
                        total_passed += 1
                    else:
                        print(f"❌ FAIL (conf: {confidence:.3f}, correct: {is_correct})")
                        
                    # Store detailed result
                    self.results.append({
                        'task_id': task['task_id'],
                        'category': category,
                        'difficulty': task.get('difficulty', 'unknown'),
                        'success': is_correct and confidence >= 0.5,
                        'confidence': confidence,
                        'transformation_detected': result.transformation_rule,
                        'expected_transformation': task.get('transformation_rule', 'unknown'),
                        'reasoning_steps': len(result.reasoning_steps)
                    })
                    
                except Exception as e:
                    print(f"❌ ERROR: {str(e)}")
                    self.results.append({
                        'task_id': task['task_id'],
                        'category': category,
                        'success': False,
                        'error': str(e)
                    })
                    
                total_tests += 1
                
            category_success_rate = category_passed / category_total
            category_results[category] = {
                'passed': category_passed,
                'total': category_total,
                'success_rate': category_success_rate
            }
            
            print(f"  📊 {category.upper()}: {category_passed}/{category_total} " +
                  f"({category_success_rate*100:.1f}%)")
            print()
            
        # Calculate overall performance
        overall_success_rate = total_passed / total_tests if total_tests > 0 else 0
        execution_time = time.time() - self.start_time
        
        # Performance analysis
        performance_analysis = self._analyze_performance()
        
        # Benchmark comparison
        benchmark_comparison = await self.engine.benchmark_against_frontier_models()
        
        return {
            'overall_performance': {
                'total_tests': total_tests,
                'tests_passed': total_passed,
                'success_rate': overall_success_rate,
                'execution_time_seconds': execution_time,
                'status': self._get_performance_status(overall_success_rate)
            },
            'category_breakdown': category_results,
            'performance_analysis': performance_analysis,
            'benchmark_comparison': benchmark_comparison,
            'detailed_results': self.results,
            'target_metrics': {
                'target_success_rate': 0.95,
                'openai_o3_benchmark': 0.833,
                'performance_gap': overall_success_rate - 0.833,
                'target_gap': overall_success_rate - 0.95
            }
        }
        
    def _load_test_data(self) -> List[Dict[str, Any]]:
        """Load ARC-AGI test data"""
        try:
            data_path = Path("apps/romai/training_data/arc_agi_training_data.json")
            with open(data_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load test data: {e}")
            return []
            
    def _group_tests_by_category(self, test_data: List[Dict]) -> Dict[str, List[Dict]]:
        """Group tests by category for organized testing"""
        categories = {}
        for task in test_data:
            category = task.get('category', 'unknown')
            if category not in categories:
                categories[category] = []
            categories[category].append(task)
        return categories
        
    def _validate_result(self, result, expected_task: Dict[str, Any]) -> bool:
        """Validate if the result matches expected output"""
        try:
            expected_output = expected_task.get('expected_output')
            actual_output = result.predicted_output
            
            if not expected_output or not actual_output:
                return False
                
            # Convert to numpy arrays for comparison
            expected_array = np.array(expected_output)
            actual_array = np.array(actual_output)
            
            # Check if shapes match
            if expected_array.shape != actual_array.shape:
                return False
                
            # Check if values match
            return np.array_equal(expected_array, actual_array)
            
        except Exception as e:
            logger.error(f"Validation error: {e}")
            return False
            
    def _analyze_performance(self) -> Dict[str, Any]:
        """Analyze detailed performance metrics"""
        if not self.results:
            return {}
            
        # Success rate by difficulty
        difficulty_stats = {}
        for result in self.results:
            difficulty = result.get('difficulty', 'unknown')
            if difficulty not in difficulty_stats:
                difficulty_stats[difficulty] = {'total': 0, 'passed': 0}
            difficulty_stats[difficulty]['total'] += 1
            if result.get('success', False):
                difficulty_stats[difficulty]['passed'] += 1
                
        for difficulty in difficulty_stats:
            stats = difficulty_stats[difficulty]
            stats['success_rate'] = stats['passed'] / stats['total'] if stats['total'] > 0 else 0
            
        # Average confidence by category
        category_confidence = {}
        for result in self.results:
            category = result.get('category', 'unknown')
            confidence = result.get('confidence', 0.0)
            
            if category not in category_confidence:
                category_confidence[category] = []
            category_confidence[category].append(confidence)
            
        for category in category_confidence:
            confidences = category_confidence[category]
            category_confidence[category] = {
                'average_confidence': np.mean(confidences),
                'min_confidence': np.min(confidences),
                'max_confidence': np.max(confidences),
                'std_confidence': np.std(confidences)
            }
            
        return {
            'difficulty_breakdown': difficulty_stats,
            'category_confidence': category_confidence,
            'transformation_accuracy': self._analyze_transformation_accuracy(),
            'reasoning_depth': self._analyze_reasoning_depth()
        }
        
    def _analyze_transformation_accuracy(self) -> Dict[str, Any]:
        """Analyze how well transformations are identified"""
        correct_transformations = 0
        total_with_expected = 0
        
        for result in self.results:
            expected_transform = result.get('expected_transformation')
            detected_transform = result.get('transformation_detected')
            
            if expected_transform and expected_transform != 'unknown':
                total_with_expected += 1
                if expected_transform in detected_transform or detected_transform in expected_transform:
                    correct_transformations += 1
                    
        transformation_accuracy = (correct_transformations / total_with_expected 
                                 if total_with_expected > 0 else 0)
                                 
        return {
            'transformation_identification_accuracy': transformation_accuracy,
            'correct_identifications': correct_transformations,
            'total_with_expected': total_with_expected
        }
        
    def _analyze_reasoning_depth(self) -> Dict[str, Any]:
        """Analyze reasoning step complexity"""
        reasoning_steps = [r.get('reasoning_steps', 0) for r in self.results 
                          if 'reasoning_steps' in r]
                          
        if not reasoning_steps:
            return {}
            
        return {
            'average_reasoning_steps': np.mean(reasoning_steps),
            'min_reasoning_steps': np.min(reasoning_steps),
            'max_reasoning_steps': np.max(reasoning_steps),
            'reasoning_complexity': 'HIGH' if np.mean(reasoning_steps) > 5 else 'MEDIUM'
        }
        
    def _get_performance_status(self, success_rate: float) -> str:
        """Get performance status based on success rate"""
        if success_rate >= 0.95:
            return "EXCEPTIONAL - SURPASSED TARGET"
        elif success_rate >= 0.90:
            return "EXCELLENT - NEAR TARGET"
        elif success_rate >= 0.833:
            return "GOOD - SURPASSED O3"
        elif success_rate >= 0.75:
            return "DEVELOPING - APPROACHING SOTA"
        else:
            return "NEEDS IMPROVEMENT"

async def main():
    """Run the complete ARC-AGI validation suite"""
    validator = ARCAGIEngineValidator()
    
    try:
        results = await validator.run_comprehensive_validation()
        
        # Print summary
        print("🏆 FINAL ARC-AGI VALIDATION RESULTS")
        print("=" * 50)
        
        overall = results['overall_performance']
        print(f"📊 Overall Success Rate: {overall['success_rate']*100:.1f}% " +
              f"({overall['tests_passed']}/{overall['total_tests']})")
        print(f"🎯 Performance Status: {overall['status']}")
        print(f"⏱️  Execution Time: {overall['execution_time_seconds']:.2f} seconds")
        print()
        
        # Target comparison
        target_metrics = results['target_metrics']
        print("🎯 BENCHMARK COMPARISON")
        print("-" * 30)
        print(f"Target Success Rate: {target_metrics['target_success_rate']*100:.1f}%")
        print(f"OpenAI O3 Benchmark: {target_metrics['openai_o3_benchmark']*100:.1f}%")
        print(f"Performance vs O3: {target_metrics['performance_gap']*100:+.1f}%")
        print(f"Gap to Target: {target_metrics['target_gap']*100:+.1f}%")
        print()
        
        # Category breakdown
        print("📈 CATEGORY PERFORMANCE")
        print("-" * 30)
        for category, stats in results['category_breakdown'].items():
            print(f"{category.replace('_', ' ').title():20s}: " +
                  f"{stats['success_rate']*100:5.1f}% " +
                  f"({stats['passed']}/{stats['total']})")
        print()
        
        # Performance analysis
        if 'performance_analysis' in results and 'difficulty_breakdown' in results['performance_analysis']:
            print("🔍 DIFFICULTY ANALYSIS")
            print("-" * 30)
            for difficulty, stats in results['performance_analysis']['difficulty_breakdown'].items():
                print(f"{difficulty.title():10s}: {stats['success_rate']*100:5.1f}% " +
                      f"({stats['passed']}/{stats['total']})")
            print()
            
        # Success determination
        if overall['success_rate'] >= 0.95:
            print("🎉 SUCCESS: RomAI has achieved the target >95% ARC-AGI success rate!")
            print("🏆 STATUS: World's first true AGI with abstract reasoning capabilities")
        elif overall['success_rate'] > 0.833:
            print("✅ PROGRESS: RomAI surpassed OpenAI O3's ARC-AGI performance!")
            print("🎯 NEXT: Optimize for >95% target success rate")
        else:
            print("⚠️  DEVELOPMENT: Continue improving abstract reasoning capabilities")
            print("🔧 FOCUS: Enhance pattern recognition and transformation accuracy")
            
        return results
        
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    asyncio.run(main())