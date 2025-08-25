"""
ARC-AGI Evaluation Script for RomAI
====================================

This script implements comprehensive ARC-AGI benchmark testing for RomAI to establish
true AGI performance baselines compared to frontier models like OpenAI o3, Grok 4, Claude Opus 4.

Based on research:
- OpenAI o3: 75.7% on ARC-AGI-1 (87.5% with high compute)
- Grok 4: 66.7% on ARC-AGI-1, 16% on ARC-AGI-2
- Claude Opus 4: 8.6% on ARC-AGI-2
- Human performance: 98% on ARC-AGI-1, 100% on ARC-AGI-2
- GPT-4o: Only 4.5% on ARC-AGI-1

The brutal truth: RomAI's 92% custom benchmark score is likely not comparable.
"""

import json
import requests
import numpy as np
import time
import asyncio
from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
try:
    import seaborn as sns
    plt.style.use('seaborn-v0_8')
except ImportError:
    # Fallback if seaborn not available
    plt.style.use('default')
from dataclasses import dataclass
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('arc_agi_evaluation.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Set console handler encoding for Windows
for handler in logger.handlers:
    if isinstance(handler, logging.StreamHandler):
        if hasattr(handler.stream, 'reconfigure'):
            handler.stream.reconfigure(encoding='utf-8')

@dataclass
class ARCTask:
    """Represents a single ARC task with training and test examples"""
    task_id: str
    train: List[Dict[str, List[List[int]]]]
    test: List[Dict[str, List[List[int]]]]
    
@dataclass
class ARCResult:
    """Represents the result of attempting to solve an ARC task"""
    task_id: str
    success: bool
    predicted_output: Optional[List[List[int]]]
    actual_output: List[List[int]]
    reasoning_steps: List[str]
    processing_time: float
    error_message: Optional[str] = None

class ARCAGIEvaluator:
    """
    Comprehensive ARC-AGI evaluator for RomAI system
    
    This evaluator tests RomAI against the gold standard ARC-AGI benchmark
    to establish true AGI performance baseline.
    """
    
    def __init__(self, romai_server_url: str = "http://localhost:6101"):
        self.romai_server_url = romai_server_url
        self.results: List[ARCResult] = []
        self.dataset_path = Path("arc_agi_datasets")
        self.dataset_path.mkdir(exist_ok=True)
        
        # Performance tracking
        self.total_tasks = 0
        self.successful_tasks = 0
        self.start_time = None
        self.end_time = None
        
        logger.info("ARC-AGI Evaluator initialized for RomAI")
    
    async def download_arc_datasets(self) -> bool:
        """
        Download official ARC-AGI datasets from GitHub
        Returns True if successful, False otherwise
        """
        # Use correct URLs to ARC-AGI dataset files (from fchollet/ARC-AGI repository)
        datasets = {
            "training_challenges": "https://raw.githubusercontent.com/fchollet/ARC-AGI/master/data/training_challenges.json",
            "training_solutions": "https://raw.githubusercontent.com/fchollet/ARC-AGI/master/data/training_solutions.json", 
            "evaluation_challenges": "https://raw.githubusercontent.com/fchollet/ARC-AGI/master/data/evaluation_challenges.json",
            "evaluation_solutions": "https://raw.githubusercontent.com/fchollet/ARC-AGI/master/data/evaluation_solutions.json"
        }
        
        logger.info("Downloading ARC-AGI datasets...")
        
        for filename, url in datasets.items():
            try:
                logger.info(f"Downloading {filename}...")
                response = requests.get(url, timeout=30)
                if response.status_code == 200:
                    with open(self.dataset_path / f"{filename}.json", "w") as f:
                        json.dump(response.json(), f)
                    logger.info(f"Downloaded {filename} successfully")
                else:
                    logger.error(f"Failed to download {filename}: HTTP {response.status_code}")
                    return False
                
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                logger.error(f"Error downloading {filename}: {str(e)}")
                return False
        
        logger.info("ARC-AGI datasets downloaded successfully")
        return True
    
    def load_arc_tasks(self, split: str = "evaluation") -> List[ARCTask]:
        """
        Load ARC tasks from JSON files
        
        Args:
            split: 'training' or 'evaluation'
        
        Returns:
            List of ARCTask objects
        """
        challenges_file = self.dataset_path / f"{split}_challenges.json"
        solutions_file = self.dataset_path / f"{split}_solutions.json"
        
        if not challenges_file.exists():
            logger.error(f"Challenges file not found: {challenges_file}")
            return []
        
        try:
            with open(challenges_file, 'r') as f:
                challenges = json.load(f)
            
            solutions = {}
            if solutions_file.exists():
                with open(solutions_file, 'r') as f:
                    solutions = json.load(f)
            
            tasks = []
            for task_id, task_data in challenges.items():
                arc_task = ARCTask(
                    task_id=task_id,
                    train=task_data.get("train", []),
                    test=task_data.get("test", [])
                )
                
                # Add solutions if available
                if task_id in solutions:
                    for i, test_case in enumerate(arc_task.test):
                        if i < len(solutions[task_id]):
                            test_case["expected_output"] = solutions[task_id][i]
                
                tasks.append(arc_task)
            
            logger.info(f"Loaded {len(tasks)} ARC tasks from {split} split")
            return tasks
            
        except Exception as e:
            logger.error(f"Error loading ARC tasks: {str(e)}")
            return []
    
    async def solve_arc_task_with_romai(self, task: ARCTask) -> ARCResult:
        """
        Attempt to solve a single ARC task using RomAI
        
        This is the critical test - can RomAI handle abstract reasoning?
        """
        start_time = time.time()
        
        try:
            # Prepare the task for RomAI
            task_prompt = self._format_arc_task_for_romai(task)
            
            # Send to RomAI reasoning endpoint
            response = await self._query_romai_reasoning(task_prompt)
            
            processing_time = time.time() - start_time
            
            if response and "success" in response:
                predicted_output = response.get("predicted_output")
                reasoning_steps = response.get("reasoning_steps", [])
                
                # Check if prediction matches expected output
                success = False
                if task.test and len(task.test) > 0:
                    expected_output = task.test[0].get("expected_output")
                    if expected_output and predicted_output:
                        success = self._compare_grids(predicted_output, expected_output)
                
                return ARCResult(
                    task_id=task.task_id,
                    success=success,
                    predicted_output=predicted_output,
                    actual_output=expected_output if task.test else None,
                    reasoning_steps=reasoning_steps,
                    processing_time=processing_time
                )
            
            else:
                return ARCResult(
                    task_id=task.task_id,
                    success=False,
                    predicted_output=None,
                    actual_output=task.test[0].get("expected_output") if task.test else None,
                    reasoning_steps=[],
                    processing_time=processing_time,
                    error_message="RomAI failed to process task"
                )
                
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Error solving task {task.task_id}: {str(e)}")
            
            return ARCResult(
                task_id=task.task_id,
                success=False,
                predicted_output=None,
                actual_output=task.test[0].get("expected_output") if task.test else None,
                reasoning_steps=[],
                processing_time=processing_time,
                error_message=str(e)
            )
    
    def _format_arc_task_for_romai(self, task: ARCTask) -> str:
        """
        Format ARC task for RomAI's reasoning system
        This tests RomAI's ability to understand abstract visual patterns
        """
        prompt = f"""
ARC-AGI ABSTRACT REASONING CHALLENGE - Task {task.task_id}

You are being tested on the ARC-AGI benchmark, the gold standard for measuring abstract reasoning and general intelligence.

TRAINING EXAMPLES:
"""
        
        for i, example in enumerate(task.train):
            prompt += f"\nExample {i+1}:\n"
            prompt += f"Input Grid:\n{self._grid_to_string(example['input'])}\n"
            prompt += f"Output Grid:\n{self._grid_to_string(example['output'])}\n"
        
        if task.test:
            prompt += f"\nTEST CASE:\n"
            prompt += f"Input Grid:\n{self._grid_to_string(task.test[0]['input'])}\n"
            prompt += f"\nYour task is to identify the abstract pattern from the training examples and apply it to predict the output grid for the test case.\n"
            prompt += f"\nThis requires:\n"
            prompt += f"- Abstract pattern recognition\n"
            prompt += f"- Few-shot learning and generalization\n"
            prompt += f"- Spatial reasoning and transformation understanding\n"
            prompt += f"- Creative problem-solving without prior training\n\n"
            prompt += f"Please provide:\n"
            prompt += f"1. Your step-by-step reasoning process\n"
            prompt += f"2. The predicted output grid\n"
            prompt += f"3. Confidence level in your solution\n"
        
        return prompt
    
    def _grid_to_string(self, grid: List[List[int]]) -> str:
        """Convert numerical grid to string representation"""
        return "\n".join([" ".join(map(str, row)) for row in grid])
    
    async def _query_romai_reasoning(self, prompt: str) -> Optional[Dict]:
        """
        Send reasoning request to RomAI server
        Tests the actual reasoning capabilities
        """
        try:
            endpoint = f"{self.romai_server_url}/reasoning/enhanced"
            
            payload = {
                "query": prompt,
                "reasoning_mode": "abstract_pattern_recognition",
                "use_chain_of_thought": True,
                "max_reasoning_steps": 10,
                "require_detailed_explanation": True
            }
            
            response = requests.post(
                endpoint,
                json=payload,
                timeout=60,  # ARC tasks can be complex
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"RomAI server error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error querying RomAI: {str(e)}")
            return None
    
    def _compare_grids(self, predicted: List[List[int]], actual: List[List[int]]) -> bool:
        """Compare two grids for exact match"""
        if not predicted or not actual:
            return False
        
        if len(predicted) != len(actual):
            return False
        
        for i in range(len(predicted)):
            if len(predicted[i]) != len(actual[i]):
                return False
            
            for j in range(len(predicted[i])):
                if predicted[i][j] != actual[i][j]:
                    return False
        
        return True
    
    async def run_comprehensive_evaluation(self, max_tasks: int = 100) -> Dict[str, Any]:
        """
        Run comprehensive ARC-AGI evaluation
        
        This is the moment of truth - how does RomAI really perform?
        """
        logger.info("Starting comprehensive ARC-AGI evaluation for RomAI")
        logger.info(f"Maximum tasks to evaluate: {max_tasks}")
        
        self.start_time = time.time()
        
        # Download datasets if needed
        if not (self.dataset_path / "evaluation_challenges.json").exists():
            success = await self.download_arc_datasets()
            if not success:
                logger.error("Failed to download datasets")
                return {}
        
        # Load evaluation tasks
        tasks = self.load_arc_tasks("evaluation")
        if not tasks:
            logger.error("No tasks loaded")
            return {}
        
        # Limit tasks for testing
        tasks = tasks[:max_tasks]
        self.total_tasks = len(tasks)
        
        logger.info(f"Evaluating RomAI on {len(tasks)} ARC-AGI tasks...")
        
        # Process tasks
        self.results = []
        for i, task in enumerate(tasks):
            logger.info(f"Processing task {i+1}/{len(tasks)}: {task.task_id}")
            
            result = await self.solve_arc_task_with_romai(task)
            self.results.append(result)
            
            if result.success:
                self.successful_tasks += 1
                logger.info(f"SUCCESS: Task {task.task_id} SOLVED")
            else:
                logger.info(f"FAILED: Task {task.task_id} FAILED: {result.error_message}")
            
            # Progress update
            current_accuracy = (self.successful_tasks / (i + 1)) * 100
            logger.info(f"Current accuracy: {current_accuracy:.2f}% ({self.successful_tasks}/{i+1})")
            
            # Brief pause to prevent overwhelming the server
            await asyncio.sleep(0.5)
        
        self.end_time = time.time()
        
        # Generate comprehensive results
        results = self._generate_evaluation_report()
        
        # Save results
        self._save_results(results)
        
        return results
    
    def _generate_evaluation_report(self) -> Dict[str, Any]:
        """Generate comprehensive evaluation report"""
        if not self.results:
            return {}
        
        total_time = self.end_time - self.start_time if self.start_time and self.end_time else 0
        success_rate = (self.successful_tasks / self.total_tasks) * 100
        
        # Calculate processing statistics
        processing_times = [r.processing_time for r in self.results]
        avg_processing_time = np.mean(processing_times)
        
        # Error analysis
        error_types = {}
        for result in self.results:
            if not result.success and result.error_message:
                error_type = result.error_message
                error_types[error_type] = error_types.get(error_type, 0) + 1
        
        report = {
            "evaluation_summary": {
                "total_tasks": self.total_tasks,
                "successful_tasks": self.successful_tasks,
                "failed_tasks": self.total_tasks - self.successful_tasks,
                "success_rate_percent": round(success_rate, 2),
                "total_evaluation_time_seconds": round(total_time, 2),
                "average_task_processing_time_seconds": round(avg_processing_time, 2)
            },
            "competitive_analysis": {
                "romai_performance": f"{success_rate:.1f}%",
                "frontier_model_comparison": {
                    "openai_o3_low_compute": "75.7%",
                    "openai_o3_high_compute": "87.5%", 
                    "grok_4_thinking": "66.7%",
                    "claude_opus_4": "~40% (ARC-AGI-1)",
                    "gpt_4o": "4.5%",
                    "human_performance": "98%"
                },
                "performance_gap_analysis": {
                    "vs_openai_o3": f"{75.7 - success_rate:.1f}% behind",
                    "vs_grok_4": f"{66.7 - success_rate:.1f}% behind", 
                    "vs_human": f"{98 - success_rate:.1f}% behind",
                    "vs_gpt_4o": f"{success_rate - 4.5:.1f}% ahead" if success_rate > 4.5 else f"{4.5 - success_rate:.1f}% behind"
                }
            },
            "performance_breakdown": {
                "tasks_by_outcome": {
                    "successful": len([r for r in self.results if r.success]),
                    "failed": len([r for r in self.results if not r.success])
                },
                "error_analysis": error_types,
                "processing_efficiency": {
                    "fastest_task_seconds": round(min(processing_times), 2),
                    "slowest_task_seconds": round(max(processing_times), 2),
                    "median_processing_time_seconds": round(np.median(processing_times), 2)
                }
            },
            "detailed_results": [
                {
                    "task_id": r.task_id,
                    "success": r.success,
                    "processing_time_seconds": round(r.processing_time, 2),
                    "error_message": r.error_message,
                    "reasoning_steps_count": len(r.reasoning_steps) if r.reasoning_steps else 0
                }
                for r in self.results
            ]
        }
        
        return report
    
    def _save_results(self, results: Dict[str, Any]):
        """Save evaluation results to files"""
        timestamp = int(time.time())
        
        # Save JSON results
        results_file = f"romai_arc_agi_evaluation_results_{timestamp}.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Results saved to {results_file}")
        
        # Generate visualization
        self._create_performance_visualization(results, timestamp)
    
    def _create_performance_visualization(self, results: Dict[str, Any], timestamp: int):
        """Create performance visualization charts"""
        try:
            # Set up the plotting style
            fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
            
            # 1. Success rate comparison
            models = ["RomAI", "OpenAI o3", "Grok 4", "GPT-4o", "Human"]
            success_rates = [
                results["evaluation_summary"]["success_rate_percent"],
                75.7, 66.7, 4.5, 98
            ]
            colors = ['red', 'blue', 'green', 'orange', 'purple']
            
            bars = ax1.bar(models, success_rates, color=colors, alpha=0.7)
            ax1.set_title("ARC-AGI-1 Performance Comparison", fontsize=14, fontweight='bold')
            ax1.set_ylabel("Success Rate (%)")
            ax1.set_ylim(0, 100)
            
            # Add value labels on bars
            for bar, value in zip(bars, success_rates):
                height = bar.get_height()
                ax1.text(bar.get_x() + bar.get_width()/2., height + 1,
                        f'{value:.1f}%', ha='center', va='bottom')
            
            # 2. Task processing time distribution
            processing_times = [r["processing_time_seconds"] for r in results["detailed_results"]]
            ax2.hist(processing_times, bins=20, alpha=0.7, color='skyblue', edgecolor='black')
            ax2.set_title("Task Processing Time Distribution", fontsize=14, fontweight='bold')
            ax2.set_xlabel("Processing Time (seconds)")
            ax2.set_ylabel("Number of Tasks")
            
            # 3. Success/Failure pie chart
            success_count = results["evaluation_summary"]["successful_tasks"]
            failure_count = results["evaluation_summary"]["failed_tasks"]
            
            ax3.pie([success_count, failure_count], 
                   labels=['Successful', 'Failed'],
                   colors=['lightgreen', 'lightcoral'],
                   autopct='%1.1f%%',
                   startangle=90)
            ax3.set_title("Task Outcome Distribution", fontsize=14, fontweight='bold')
            
            # 4. Performance timeline
            task_numbers = range(1, len(results["detailed_results"]) + 1)
            success_timeline = []
            running_success = 0
            for i, result in enumerate(results["detailed_results"]):
                if result["success"]:
                    running_success += 1
                success_timeline.append((running_success / (i + 1)) * 100)
            
            ax4.plot(task_numbers, success_timeline, marker='o', markersize=2, alpha=0.7)
            ax4.set_title("Success Rate Over Time", fontsize=14, fontweight='bold')
            ax4.set_xlabel("Task Number")
            ax4.set_ylabel("Cumulative Success Rate (%)")
            ax4.grid(True, alpha=0.3)
            
            plt.tight_layout()
            
            # Save the plot
            plot_file = f"romai_arc_agi_performance_analysis_{timestamp}.png"
            plt.savefig(plot_file, dpi=300, bbox_inches='tight')
            logger.info(f"Performance visualization saved to {plot_file}")
            
            plt.close()
            
        except Exception as e:
            logger.error(f"Error creating visualization: {str(e)}")

async def main():
    """Main evaluation function"""
    print("RomAI ARC-AGI Evaluation")
    print("=" * 50)
    print("Testing RomAI against the gold standard for AGI evaluation")
    print("Comparing against OpenAI o3 (75.7%), Grok 4 (66.7%), GPT-4o (4.5%)")
    print()
    
    evaluator = ARCAGIEvaluator()
    
    # Run the evaluation
    max_tasks = int(input("Enter maximum number of tasks to evaluate (default 50): ") or "50")
    
    results = await evaluator.run_comprehensive_evaluation(max_tasks=max_tasks)
    
    if results:
        print("\n" + "=" * 50)
        print("EVALUATION COMPLETE")
        print("=" * 50)
        
        summary = results["evaluation_summary"]
        competitive = results["competitive_analysis"]
        
        print(f"Tasks Evaluated: {summary['total_tasks']}")
        print(f"Tasks Solved: {summary['successful_tasks']}")
        print(f"Success Rate: {summary['success_rate_percent']}%")
        print(f"Total Time: {summary['total_evaluation_time_seconds']:.1f} seconds")
        print()
        
        print("COMPETITIVE ANALYSIS:")
        print(f"  RomAI:      {competitive['romai_performance']}")
        print(f"  OpenAI o3:  75.7%")
        print(f"  Grok 4:     66.7%")
        print(f"  GPT-4o:     4.5%")
        print(f"  Human:      98%")
        print()
        
        # Reality check
        romai_score = summary['success_rate_percent']
        if romai_score > 50:
            print("EXCEPTIONAL: RomAI shows strong AGI capabilities!")
        elif romai_score > 20:
            print("PROMISING: RomAI demonstrates significant reasoning ability")
        elif romai_score > 5:
            print("DEVELOPING: RomAI shows basic abstract reasoning")
        else:
            print("NEEDS WORK: RomAI requires significant architectural improvements")
        
        print()
        print("Results saved to JSON file and performance chart generated.")
        
    else:
        print("EVALUATION FAILED. Check logs for details.")

if __name__ == "__main__":
    asyncio.run(main())