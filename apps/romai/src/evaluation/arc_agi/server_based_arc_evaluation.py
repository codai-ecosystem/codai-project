#!/usr/bin/env python3
"""
🧠 ARC-AGI Server-Based Evaluation System
Advanced abstract reasoning evaluation using RomAI server API connectivity
"""

import json
import requests
import time
import logging
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass
from enum import Enum, auto
import os
import sys
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ARCDifficulty(Enum):
    """ARC-AGI task difficulty levels."""
    EASY = auto()
    MEDIUM = auto()
    HARD = auto()
    EXPERT = auto()

class ARCTaskType(Enum):
    """ARC-AGI task pattern types."""
    PATTERN_COMPLETION = auto()
    OBJECT_TRANSFORMATION = auto()
    SPATIAL_REASONING = auto()
    LOGICAL_SEQUENCE = auto()
    ABSTRACT_COUNTING = auto()
    SYMMETRY_DETECTION = auto()
    RULE_INDUCTION = auto()

@dataclass
class ARCTask:
    """ARC-AGI task definition."""
    task_id: str
    input_grids: List[List[List[int]]]
    output_grids: List[List[List[int]]]
    test_input: List[List[int]]
    expected_output: List[List[int]]
    difficulty: ARCDifficulty
    task_type: ARCTaskType
    description: str

@dataclass
class ARCResult:
    """ARC evaluation result."""
    task_id: str
    success: bool
    predicted_output: List[List[int]]
    expected_output: List[List[int]]
    confidence: float
    processing_time: float
    reasoning_trace: List[str]
    server_response: Dict[str, Any]

class ServerBasedARCEvaluator:
    """Server-based ARC-AGI evaluation system using RomAI API."""
    
    def __init__(self, server_url: str = "http://localhost:6101"):
        """Initialize the evaluator with RomAI server connection."""
        self.server_url = server_url
        self.session = requests.Session()
        self.results = []
        
        # Test server connectivity
        try:
            response = self.session.get(f"{server_url}/health", timeout=10)
            if response.status_code == 200:
                logger.info("✅ RomAI server connection established")
            else:
                logger.error(f"❌ Server health check failed: {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Cannot connect to RomAI server: {e}")
            raise
    
    def create_arc_test_tasks(self) -> List[ARCTask]:
        """Create comprehensive ARC-AGI test tasks."""
        tasks = [
            ARCTask(
                task_id="arc_pattern_1",
                input_grids=[
                    [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
                    [[1, 0, 1], [0, 1, 0], [1, 0, 1]]
                ],
                output_grids=[
                    [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
                    [[0, 1, 0], [1, 0, 1], [0, 1, 0]]
                ],
                test_input=[[0, 0, 1], [0, 1, 0], [1, 0, 0]],
                expected_output=[[1, 1, 0], [1, 0, 1], [0, 1, 1]],
                difficulty=ARCDifficulty.EASY,
                task_type=ARCTaskType.PATTERN_COMPLETION,
                description="Simple binary pattern inversion"
            ),
            ARCTask(
                task_id="arc_spatial_1",
                input_grids=[
                    [[1, 2, 0], [2, 1, 0], [0, 0, 0]],
                    [[0, 1, 2], [0, 2, 1], [0, 0, 0]]
                ],
                output_grids=[
                    [[0, 0, 0], [1, 2, 0], [2, 1, 0]],
                    [[0, 0, 0], [0, 1, 2], [0, 2, 1]]
                ],
                test_input=[[3, 1, 0], [1, 3, 0], [0, 0, 0]],
                expected_output=[[0, 0, 0], [3, 1, 0], [1, 3, 0]],
                difficulty=ARCDifficulty.MEDIUM,
                task_type=ARCTaskType.SPATIAL_REASONING,
                description="Spatial transformation - downward shift"
            ),
            ARCTask(
                task_id="arc_logical_1",
                input_grids=[
                    [[1, 1, 2], [1, 2, 2], [2, 2, 3]],
                    [[2, 2, 3], [2, 3, 3], [3, 3, 4]]
                ],
                output_grids=[
                    [[3, 3, 6], [3, 6, 6], [6, 6, 9]],
                    [[6, 6, 9], [6, 9, 9], [9, 9, 12]]
                ],
                test_input=[[4, 4, 5], [4, 5, 5], [5, 5, 6]],
                expected_output=[[12, 12, 15], [12, 15, 15], [15, 15, 18]],
                difficulty=ARCDifficulty.HARD,
                task_type=ARCTaskType.LOGICAL_SEQUENCE,
                description="Mathematical transformation - multiply by 3"
            ),
            ARCTask(
                task_id="arc_abstract_1",
                input_grids=[
                    [[1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1]],
                    [[2, 0, 2, 0], [0, 2, 0, 2], [2, 0, 2, 0], [0, 2, 0, 2]]
                ],
                output_grids=[
                    [[4, 4, 4, 4]],
                    [[8, 8, 8, 8]]
                ],
                test_input=[[3, 0, 3, 0], [0, 3, 0, 3], [3, 0, 3, 0], [0, 3, 0, 3]],
                expected_output=[[12, 12, 12, 12]],
                difficulty=ARCDifficulty.EXPERT,
                task_type=ARCTaskType.ABSTRACT_COUNTING,
                description="Abstract pattern recognition - count and multiply"
            ),
            ARCTask(
                task_id="arc_symmetry_1",
                input_grids=[
                    [[1, 2, 1], [2, 3, 2], [1, 2, 1]],
                    [[4, 5, 4], [5, 6, 5], [4, 5, 4]]
                ],
                output_grids=[
                    [[1, 2, 1, 1, 2, 1], [2, 3, 2, 2, 3, 2], [1, 2, 1, 1, 2, 1]],
                    [[4, 5, 4, 4, 5, 4], [5, 6, 5, 5, 6, 5], [4, 5, 4, 4, 5, 4]]
                ],
                test_input=[[7, 8, 7], [8, 9, 8], [7, 8, 7]],
                expected_output=[[7, 8, 7, 7, 8, 7], [8, 9, 8, 8, 9, 8], [7, 8, 7, 7, 8, 7]],
                difficulty=ARCDifficulty.MEDIUM,
                task_type=ARCTaskType.SYMMETRY_DETECTION,
                description="Symmetry recognition and horizontal mirroring"
            )
        ]
        
        logger.info(f"✅ Created {len(tasks)} ARC-AGI test tasks")
        return tasks
    
    def format_task_for_server(self, task: ARCTask) -> str:
        """Format ARC task for server reasoning."""
        examples_text = ""
        for i, (input_grid, output_grid) in enumerate(zip(task.input_grids, task.output_grids)):
            examples_text += f"\nExample {i+1}:\nInput: {input_grid}\nOutput: {output_grid}\n"
        
        prompt = f"""
ARC-AGI Abstract Reasoning Task: {task.description}

Task Type: {task.task_type.name}
Difficulty: {task.difficulty.name}

Training Examples:{examples_text}

Test Input: {task.test_input}

Analyze the pattern in the training examples and predict the output for the test input.
Provide your reasoning step by step, then give the final predicted output as a grid.

Format your response as:
REASONING: [Your step-by-step analysis]
PREDICTION: [The output grid as nested list]
"""
        return prompt.strip()
    
    def evaluate_task_with_server(self, task: ARCTask) -> ARCResult:
        """Evaluate a single ARC task using RomAI server."""
        start_time = time.time()
        
        try:
            # Format task for server
            prompt = self.format_task_for_server(task)
            
            # Make request to RomAI server reasoning endpoint
            payload = {
                "text": prompt,
                "task_type": "abstract_reasoning",
                "include_cultural_context": False,
                "temperature": 0.1
            }
            
            response = self.session.post(
                f"{self.server_url}/reasoning",
                json=payload,
                timeout=30
            )
            
            processing_time = time.time() - start_time
            
            if response.status_code == 200:
                server_response = response.json()
                response_text = server_response.get("response", "")
                confidence = server_response.get("confidence", 0.0)
                
                # Parse reasoning and prediction from response
                reasoning_trace = self.parse_reasoning(response_text)
                predicted_output = self.parse_prediction(response_text, task)
                
                # Check if prediction matches expected output
                success = self.compare_outputs(predicted_output, task.expected_output)
                
                result = ARCResult(
                    task_id=task.task_id,
                    success=success,
                    predicted_output=predicted_output,
                    expected_output=task.expected_output,
                    confidence=confidence,
                    processing_time=processing_time,
                    reasoning_trace=reasoning_trace,
                    server_response=server_response
                )
                
                logger.info(f"Task {task.task_id}: {'✅ SUCCESS' if success else '❌ FAILED'} "
                           f"(confidence: {confidence:.2f}, time: {processing_time:.2f}s)")
                
                return result
                
            else:
                logger.error(f"Server error for task {task.task_id}: {response.status_code}")
                return self.create_failed_result(task, processing_time, f"Server error: {response.status_code}")
                
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Exception evaluating task {task.task_id}: {e}")
            return self.create_failed_result(task, processing_time, str(e))
    
    def parse_reasoning(self, response_text: str) -> List[str]:
        """Extract reasoning steps from server response."""
        try:
            if "REASONING:" in response_text:
                reasoning_section = response_text.split("REASONING:")[1].split("PREDICTION:")[0].strip()
                return [step.strip() for step in reasoning_section.split('\n') if step.strip()]
            else:
                # Fallback: return full response as single reasoning step
                return [response_text.strip()]
        except:
            return ["Failed to parse reasoning"]
    
    def parse_prediction(self, response_text: str, task: ARCTask) -> List[List[int]]:
        """Extract prediction from server response."""
        try:
            if "PREDICTION:" in response_text:
                prediction_section = response_text.split("PREDICTION:")[1].strip()
                # Try to parse as Python list
                prediction = eval(prediction_section)
                if isinstance(prediction, list) and all(isinstance(row, list) for row in prediction):
                    return prediction
            
            # Fallback: return task input as default
            logger.warning(f"Could not parse prediction from response, using fallback")
            return task.test_input
            
        except Exception as e:
            logger.warning(f"Error parsing prediction: {e}, using fallback")
            return task.test_input
    
    def compare_outputs(self, predicted: List[List[int]], expected: List[List[int]]) -> bool:
        """Compare predicted and expected outputs."""
        try:
            return predicted == expected
        except:
            return False
    
    def create_failed_result(self, task: ARCTask, processing_time: float, error_msg: str) -> ARCResult:
        """Create a failed result."""
        return ARCResult(
            task_id=task.task_id,
            success=False,
            predicted_output=task.test_input,  # Fallback
            expected_output=task.expected_output,
            confidence=0.0,
            processing_time=processing_time,
            reasoning_trace=[f"Error: {error_msg}"],
            server_response={}
        )
    
    def run_comprehensive_evaluation(self) -> Dict[str, Any]:
        """Run comprehensive ARC-AGI evaluation."""
        logger.info("🚀 Starting Server-Based ARC-AGI Evaluation")
        
        # Create test tasks
        tasks = self.create_arc_test_tasks()
        
        # Track results by difficulty and type
        results_by_difficulty = {diff: [] for diff in ARCDifficulty}
        results_by_type = {task_type: [] for task_type in ARCTaskType}
        all_results = []
        
        total_start_time = time.time()
        
        # Evaluate each task
        for i, task in enumerate(tasks, 1):
            logger.info(f"[{i}/{len(tasks)}] Evaluating {task.task_id} ({task.difficulty.name}, {task.task_type.name})")
            
            result = self.evaluate_task_with_server(task)
            all_results.append(result)
            results_by_difficulty[task.difficulty].append(result)
            results_by_type[task.task_type].append(result)
        
        total_time = time.time() - total_start_time
        
        # Calculate comprehensive metrics
        total_tasks = len(tasks)
        successful_tasks = sum(1 for r in all_results if r.success)
        overall_success_rate = successful_tasks / total_tasks if total_tasks > 0 else 0.0
        
        # Calculate by difficulty
        difficulty_metrics = {}
        for diff, results in results_by_difficulty.items():
            if results:
                success_rate = sum(1 for r in results if r.success) / len(results)
                avg_confidence = sum(r.confidence for r in results) / len(results)
                avg_time = sum(r.processing_time for r in results) / len(results)
                difficulty_metrics[diff.name] = {
                    "success_rate": success_rate,
                    "average_confidence": avg_confidence,
                    "average_time": avg_time,
                    "tasks_count": len(results)
                }
        
        # Calculate by task type
        type_metrics = {}
        for task_type, results in results_by_type.items():
            if results:
                success_rate = sum(1 for r in results if r.success) / len(results)
                avg_confidence = sum(r.confidence for r in results) / len(results)
                type_metrics[task_type.name] = {
                    "success_rate": success_rate,
                    "average_confidence": avg_confidence,
                    "tasks_count": len(results)
                }
        
        # Create comprehensive report
        evaluation_report = {
            "evaluation_type": "ARC-AGI Server-Based Evaluation",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "server_url": self.server_url,
            "total_evaluation_time": total_time,
            "overall_metrics": {
                "total_tasks": total_tasks,
                "successful_tasks": successful_tasks,
                "overall_success_rate": overall_success_rate,
                "average_confidence": sum(r.confidence for r in all_results) / len(all_results) if all_results else 0.0,
                "average_processing_time": sum(r.processing_time for r in all_results) / len(all_results) if all_results else 0.0
            },
            "difficulty_breakdown": difficulty_metrics,
            "task_type_breakdown": type_metrics,
            "individual_results": [
                {
                    "task_id": r.task_id,
                    "success": r.success,
                    "confidence": r.confidence,
                    "processing_time": r.processing_time,
                    "reasoning_steps": len(r.reasoning_trace)
                }
                for r in all_results
            ],
            "detailed_results": [
                {
                    "task_id": r.task_id,
                    "success": r.success,
                    "predicted_output": r.predicted_output,
                    "expected_output": r.expected_output,
                    "confidence": r.confidence,
                    "processing_time": r.processing_time,
                    "reasoning_trace": r.reasoning_trace,
                    "server_response_summary": {
                        "model_used": r.server_response.get("model_used", "unknown"),
                        "cultural_context": bool(r.server_response.get("cultural_context")),
                        "response_length": len(r.server_response.get("response", ""))
                    }
                }
                for r in all_results
            ]
        }
        
        self.results = all_results
        
        # Print summary
        logger.info("📊 ARC-AGI Evaluation Complete!")
        logger.info(f"Overall Success Rate: {overall_success_rate:.1%} ({successful_tasks}/{total_tasks})")
        
        for diff_name, metrics in difficulty_metrics.items():
            logger.info(f"{diff_name}: {metrics['success_rate']:.1%} success rate, "
                       f"{metrics['average_confidence']:.2f} avg confidence")
        
        return evaluation_report
    
    def save_results(self, filename: str = None):
        """Save evaluation results to JSON file."""
        if not filename:
            filename = f"arc_agi_server_evaluation_{int(time.time())}.json"
        
        if hasattr(self, 'results') and self.results:
            evaluation_report = self.run_comprehensive_evaluation() if not hasattr(self, 'last_report') else self.last_report
            
            with open(filename, 'w') as f:
                json.dump(evaluation_report, f, indent=2)
            
            logger.info(f"💾 Results saved to {filename}")
            return filename
        else:
            logger.warning("No results to save")
            return None

def main():
    """Main execution function."""
    try:
        # Initialize evaluator
        evaluator = ServerBasedARCEvaluator()
        
        # Run comprehensive evaluation
        report = evaluator.run_comprehensive_evaluation()
        evaluator.last_report = report
        
        # Save results
        results_file = evaluator.save_results()
        
        # Print final summary
        print("\n" + "="*80)
        print("🧠 ARC-AGI SERVER-BASED EVALUATION SUMMARY")
        print("="*80)
        print(f"Overall Success Rate: {report['overall_metrics']['overall_success_rate']:.1%}")
        print(f"Average Confidence: {report['overall_metrics']['average_confidence']:.2f}")
        print(f"Total Evaluation Time: {report['total_evaluation_time']:.2f}s")
        print(f"Results saved to: {results_file}")
        
        # Compare to targets
        success_rate = report['overall_metrics']['overall_success_rate']
        if success_rate >= 0.85:
            print("✅ EXCELLENT: Exceeds ARC-AGI-1 target (>85%)")
        elif success_rate >= 0.25:
            print("🎯 GOOD: Meets ARC-AGI-2 baseline (>25%)")
        else:
            print("❌ NEEDS IMPROVEMENT: Below ARC-AGI targets")
        
        print("="*80)
        
        return True
        
    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)