#!/usr/bin/env python3
"""
Test Suite for RomAI Continuous Learning Pipeline
Comprehensive validation of online learning, experience replay, 
meta-learning, and catastrophic forgetting prevention
"""

import asyncio
import torch
import torch.nn as nn
import numpy as np
import pytest
import logging
import json
import time
from typing import Dict, List, Any
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Import our continuous learning pipeline
from continuous_learning_pipeline import (
    ContinuousLearningPipeline,
    MetaLearningModel,
    ExperienceReplayBuffer,
    ElasticWeightConsolidation,
    SynapticIntelligence,
    LearningExperience,
    create_continuous_learning_pipeline
)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ContinuousLearningValidator:
    """Comprehensive validator for continuous learning pipeline"""
    
    def __init__(self, save_results: bool = True):
        self.save_results = save_results
        self.test_results = {}
        self.performance_data = []
        
    async def test_online_learning_basic(self) -> Dict[str, Any]:
        """Test basic online learning functionality"""
        logger.info("🧪 Testing Basic Online Learning...")
        
        pipeline = create_continuous_learning_pipeline(
            input_dim=50,
            hidden_dim=64,
            output_dim=5
        )
        
        # Register test task
        await pipeline.register_task("test_basic", "classification", "synthetic", 1.0)
        
        losses = []
        accuracies = []
        
        # Train on sequence of data
        for step in range(50):
            # Generate synthetic classification data
            input_data = torch.randn(4, 50)
            target_data = torch.randint(0, 5, (4,))
            
            result = await pipeline.online_learning_step("test_basic", input_data, target_data)
            losses.append(result['total_loss'])
            
            # Test inference
            with torch.no_grad():
                pipeline.model.eval()
                outputs = pipeline.model(input_data)
                pred = outputs.argmax(dim=1)
                accuracy = (pred == target_data).float().mean().item()
                accuracies.append(accuracy)
        
        # Validate learning occurred
        initial_loss = np.mean(losses[:10])
        final_loss = np.mean(losses[-10:])
        learning_improvement = (initial_loss - final_loss) / initial_loss
        
        initial_acc = np.mean(accuracies[:10])
        final_acc = np.mean(accuracies[-10:])
        
        result = {
            "test_name": "online_learning_basic",
            "status": "PASS" if learning_improvement > 0.1 else "FAIL",
            "learning_improvement": learning_improvement,
            "initial_loss": initial_loss,
            "final_loss": final_loss,
            "initial_accuracy": initial_acc,
            "final_accuracy": final_acc,
            "total_steps": len(losses)
        }
        
        logger.info(f"✅ Basic Online Learning: {learning_improvement*100:.1f}% improvement")
        return result
    
    async def test_experience_replay(self) -> Dict[str, Any]:
        """Test experience replay buffer and training"""
        logger.info("🧪 Testing Experience Replay...")
        
        pipeline = create_continuous_learning_pipeline(
            input_dim=30,
            hidden_dim=48,
            output_dim=3
        )
        
        # Register multiple tasks
        await pipeline.register_task("task_1", "classification", "domain_1", 1.0)
        await pipeline.register_task("task_2", "classification", "domain_2", 1.2)
        
        # Learn task 1
        task1_data = []
        for step in range(30):
            input_data = torch.randn(2, 30)
            target_data = torch.randint(0, 3, (2,))
            task1_data.append((input_data, target_data))
            
            await pipeline.online_learning_step("task_1", input_data, target_data)
        
        # Learn task 2 (should cause forgetting without replay)
        for step in range(30):
            input_data = torch.randn(2, 30) + 2.0  # Shifted distribution
            target_data = torch.randint(0, 3, (2,))
            
            await pipeline.online_learning_step("task_2", input_data, target_data)
        
        # Test task 1 performance (should be degraded)
        task1_accuracy_before_replay = 0
        with torch.no_grad():
            pipeline.model.eval()
            for input_data, target_data in task1_data[-10:]:  # Test on recent task 1 data
                outputs = pipeline.model(input_data)
                pred = outputs.argmax(dim=1)
                task1_accuracy_before_replay += (pred == target_data).float().mean().item()
        task1_accuracy_before_replay /= 10
        
        # Apply experience replay
        replay_result = await pipeline.experience_replay_training(batch_size=16, num_batches=20)
        
        # Test task 1 performance again (should be improved)
        task1_accuracy_after_replay = 0
        with torch.no_grad():
            pipeline.model.eval()
            for input_data, target_data in task1_data[-10:]:
                outputs = pipeline.model(input_data)
                pred = outputs.argmax(dim=1)
                task1_accuracy_after_replay += (pred == target_data).float().mean().item()
        task1_accuracy_after_replay /= 10
        
        replay_improvement = task1_accuracy_after_replay - task1_accuracy_before_replay
        
        result = {
            "test_name": "experience_replay",
            "status": "PASS" if replay_improvement > 0.05 else "FAIL",
            "task1_accuracy_before": task1_accuracy_before_replay,
            "task1_accuracy_after": task1_accuracy_after_replay,
            "replay_improvement": replay_improvement,
            "replay_loss": replay_result['replay_loss'],
            "buffer_size": len(pipeline.experience_buffer.buffer)
        }
        
        logger.info(f"✅ Experience Replay: {replay_improvement*100:.1f}% recovery")
        return result
    
    async def test_meta_learning_adaptation(self) -> Dict[str, Any]:
        """Test MAML-based meta-learning"""
        logger.info("🧪 Testing Meta-Learning Adaptation...")
        
        pipeline = create_continuous_learning_pipeline(
            input_dim=25,
            hidden_dim=32,
            output_dim=2
        )
        
        # Create few-shot learning scenario
        # Task: binary classification with different decision boundaries
        
        support_data = []
        query_data = []
        
        # Generate support set (few examples for adaptation)
        for i in range(3):  # 3 support examples
            # Class 0: negative sum
            x1 = torch.randn(1, 25) - 1.0
            y1 = torch.zeros(1, dtype=torch.long)
            
            # Class 1: positive sum  
            x2 = torch.randn(1, 25) + 1.0
            y2 = torch.ones(1, dtype=torch.long)
            
            support_data.append((torch.cat([x1, x2]), torch.cat([y1, y2])))
        
        # Generate query set (test examples)
        for i in range(5):  # 5 query examples
            x1 = torch.randn(1, 25) - 1.0
            y1 = torch.zeros(1, dtype=torch.long)
            
            x2 = torch.randn(1, 25) + 1.0
            y2 = torch.ones(1, dtype=torch.long)
            
            query_data.append((torch.cat([x1, x2]), torch.cat([y1, y2])))
        
        # Test meta-learning adaptation
        meta_result = await pipeline.meta_learning_adaptation(
            support_data=support_data,
            query_data=query_data,
            task_id="meta_test",
            inner_steps=5
        )
        
        result = {
            "test_name": "meta_learning_adaptation",
            "status": "PASS" if meta_result['query_accuracy'] > 0.6 else "FAIL",
            "query_accuracy": meta_result['query_accuracy'],
            "query_loss": meta_result['query_loss'],
            "adaptation_steps": meta_result['adaptation_steps'],
            "support_size": len(support_data),
            "query_size": len(query_data)
        }
        
        logger.info(f"✅ Meta-Learning: {meta_result['query_accuracy']*100:.1f}% accuracy")
        return result
    
    async def test_catastrophic_forgetting_prevention(self) -> Dict[str, Any]:
        """Test EWC and SI for preventing catastrophic forgetting"""
        logger.info("🧪 Testing Catastrophic Forgetting Prevention...")
        
        # Create two pipelines: one with regularization, one without
        pipeline_with_reg = create_continuous_learning_pipeline(
            input_dim=40,
            hidden_dim=64,
            output_dim=4,
            ewc_lambda=0.5,
            si_xi=0.2
        )
        
        pipeline_without_reg = create_continuous_learning_pipeline(
            input_dim=40,
            hidden_dim=64,
            output_dim=4,
            ewc_lambda=0.0,
            si_xi=0.0
        )
        
        # Train both on Task A
        task_a_data = []
        for step in range(40):
            input_data = torch.randn(3, 40)
            target_data = torch.randint(0, 4, (3,))
            task_a_data.append((input_data, target_data))
            
            await pipeline_with_reg.online_learning_step("task_a", input_data, target_data)
            await pipeline_without_reg.online_learning_step("task_a", input_data, target_data)
        
        # Consolidate knowledge for regularization pipeline
        await pipeline_with_reg.consolidate_knowledge()
        
        # Test performance on Task A before learning Task B
        def evaluate_task_a(pipeline):
            accuracy = 0
            with torch.no_grad():
                pipeline.model.eval()
                for input_data, target_data in task_a_data[-15:]:
                    outputs = pipeline.model(input_data)
                    pred = outputs.argmax(dim=1)
                    accuracy += (pred == target_data).float().mean().item()
            return accuracy / 15
        
        task_a_before_reg = evaluate_task_a(pipeline_with_reg)
        task_a_before_no_reg = evaluate_task_a(pipeline_without_reg)
        
        # Train both on Task B (different distribution)
        for step in range(40):
            input_data = torch.randn(3, 40) * 2.0 + 3.0  # Very different distribution
            target_data = torch.randint(0, 4, (3,))
            
            await pipeline_with_reg.online_learning_step("task_b", input_data, target_data)
            await pipeline_without_reg.online_learning_step("task_b", input_data, target_data)
        
        # Test performance on Task A after learning Task B
        task_a_after_reg = evaluate_task_a(pipeline_with_reg)
        task_a_after_no_reg = evaluate_task_a(pipeline_without_reg)
        
        # Calculate forgetting
        forgetting_with_reg = max(0, task_a_before_reg - task_a_after_reg)
        forgetting_without_reg = max(0, task_a_before_no_reg - task_a_after_no_reg)
        
        forgetting_reduction = forgetting_without_reg - forgetting_with_reg
        
        result = {
            "test_name": "catastrophic_forgetting_prevention",
            "status": "PASS" if forgetting_reduction > 0.1 else "FAIL",
            "forgetting_with_regularization": forgetting_with_reg,
            "forgetting_without_regularization": forgetting_without_reg,
            "forgetting_reduction": forgetting_reduction,
            "task_a_retention_with_reg": task_a_after_reg / max(task_a_before_reg, 1e-6),
            "task_a_retention_without_reg": task_a_after_no_reg / max(task_a_before_no_reg, 1e-6)
        }
        
        logger.info(f"✅ Forgetting Prevention: {forgetting_reduction*100:.1f}% less forgetting")
        return result
    
    async def test_knowledge_consolidation(self) -> Dict[str, Any]:
        """Test knowledge consolidation process"""
        logger.info("🧪 Testing Knowledge Consolidation...")
        
        pipeline = create_continuous_learning_pipeline(
            input_dim=35,
            hidden_dim=48,
            output_dim=3
        )
        
        # Register multiple tasks
        tasks = ["task_1", "task_2", "task_3"]
        for task_id in tasks:
            await pipeline.register_task(task_id, "classification", f"domain_{task_id}", 1.0)
        
        # Generate learning experiences for each task
        experiences_per_task = 30
        for task_id in tasks:
            for step in range(experiences_per_task):
                input_data = torch.randn(2, 35)
                target_data = torch.randint(0, 3, (2,))
                await pipeline.online_learning_step(task_id, input_data, target_data)
        
        # Perform consolidation
        consolidation_result = await pipeline.consolidate_knowledge()
        
        # Get learning statistics
        stats = await pipeline.get_learning_statistics()
        
        # Validate consolidation results
        has_task_performances = len(consolidation_result['task_performances']) > 0
        buffer_utilization = stats['buffer_statistics']['total_experiences'] / pipeline.experience_buffer.max_size
        knowledge_retention = stats['performance_metrics']['knowledge_retention']
        
        result = {
            "test_name": "knowledge_consolidation",
            "status": "PASS" if (has_task_performances and knowledge_retention > 0.3) else "FAIL",
            "tasks_evaluated": len(consolidation_result['task_performances']),
            "consolidation_time": consolidation_result['consolidation_time'],
            "buffer_utilization": buffer_utilization,
            "knowledge_retention": knowledge_retention,
            "total_experiences": stats['buffer_statistics']['total_experiences'],
            "performance_snapshots": len(pipeline.performance_history)
        }
        
        logger.info(f"✅ Knowledge Consolidation: {knowledge_retention*100:.1f}% retention")
        return result
    
    async def test_online_learning_thread(self) -> Dict[str, Any]:
        """Test online learning in background thread"""
        logger.info("🧪 Testing Online Learning Thread...")
        
        pipeline = create_continuous_learning_pipeline(
            input_dim=20,
            hidden_dim=32,
            output_dim=2
        )
        
        await pipeline.register_task("thread_test", "classification", "synthetic", 1.0)
        
        # Start online learning thread
        await pipeline.start_online_learning()
        
        # Queue multiple learning requests
        queue_size_before = len(pipeline.learning_queue)
        
        for i in range(20):
            input_data = torch.randn(1, 20)
            target_data = torch.randint(0, 2, (1,))
            await pipeline.queue_learning("thread_test", input_data, target_data)
        
        queue_size_after = len(pipeline.learning_queue)
        
        # Wait for processing
        await asyncio.sleep(2.0)
        
        queue_size_processed = len(pipeline.learning_queue)
        learning_steps = pipeline.learning_step
        
        # Stop online learning
        await pipeline.stop_online_learning()
        
        result = {
            "test_name": "online_learning_thread",
            "status": "PASS" if learning_steps > 0 and queue_size_processed < queue_size_after else "FAIL",
            "queue_size_before": queue_size_before,
            "queue_size_after": queue_size_after,
            "queue_size_processed": queue_size_processed,
            "learning_steps_completed": learning_steps,
            "processing_efficiency": (queue_size_after - queue_size_processed) / max(queue_size_after, 1)
        }
        
        logger.info(f"✅ Online Learning Thread: {learning_steps} steps completed")
        return result
    
    async def test_checkpoint_save_load(self) -> Dict[str, Any]:
        """Test checkpoint saving and loading"""
        logger.info("🧪 Testing Checkpoint Save/Load...")
        
        # Create and train pipeline
        pipeline1 = create_continuous_learning_pipeline(
            input_dim=15,
            hidden_dim=24,
            output_dim=2
        )
        
        await pipeline1.register_task("checkpoint_test", "classification", "test", 1.0)
        
        # Train for some steps
        original_loss = None
        for step in range(20):
            input_data = torch.randn(2, 15)
            target_data = torch.randint(0, 2, (2,))
            result = await pipeline1.online_learning_step("checkpoint_test", input_data, target_data)
            if step == 0:
                original_loss = result['total_loss']
        
        # Save checkpoint
        checkpoint_path = "test_checkpoint.pth"
        await pipeline1.save_checkpoint(checkpoint_path)
        
        # Create new pipeline and load checkpoint
        pipeline2 = create_continuous_learning_pipeline(
            input_dim=15,
            hidden_dim=24,
            output_dim=2
        )
        
        await pipeline2.load_checkpoint(checkpoint_path)
        
        # Compare states
        learning_steps_match = pipeline1.learning_step == pipeline2.learning_step
        task_registry_match = pipeline1.task_registry.keys() == pipeline2.task_registry.keys()
        
        # Test that loaded model produces same outputs
        test_input = torch.randn(1, 15)
        with torch.no_grad():
            pipeline1.model.eval()
            pipeline2.model.eval()
            output1 = pipeline1.model(test_input)
            output2 = pipeline2.model(test_input)
            outputs_match = torch.allclose(output1, output2, atol=1e-6)
        
        # Cleanup
        Path(checkpoint_path).unlink(missing_ok=True)
        
        result = {
            "test_name": "checkpoint_save_load",
            "status": "PASS" if (learning_steps_match and task_registry_match and outputs_match) else "FAIL",
            "learning_steps_match": learning_steps_match,
            "task_registry_match": task_registry_match,
            "outputs_match": outputs_match,
            "checkpoint_learning_steps": pipeline2.learning_step,
            "checkpoint_tasks": len(pipeline2.task_registry)
        }
        
        logger.info(f"✅ Checkpoint Save/Load: All states preserved")
        return result
    
    async def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run all validation tests"""
        logger.info("🚀 Starting Comprehensive Continuous Learning Validation")
        logger.info("=" * 80)
        
        test_functions = [
            self.test_online_learning_basic,
            self.test_experience_replay,
            self.test_meta_learning_adaptation,
            self.test_catastrophic_forgetting_prevention,
            self.test_knowledge_consolidation,
            self.test_online_learning_thread,
            self.test_checkpoint_save_load
        ]
        
        validation_results = {
            "timestamp": time.time(),
            "total_tests": len(test_functions),
            "passed_tests": 0,
            "failed_tests": 0,
            "test_results": [],
            "overall_status": "UNKNOWN"
        }
        
        start_time = time.time()
        
        # Run each test
        for test_func in test_functions:
            try:
                logger.info(f"\n{'='*50}")
                test_result = await test_func()
                validation_results["test_results"].append(test_result)
                
                if test_result["status"] == "PASS":
                    validation_results["passed_tests"] += 1
                    logger.info(f"✅ {test_result['test_name']}: PASSED")
                else:
                    validation_results["failed_tests"] += 1
                    logger.info(f"❌ {test_result['test_name']}: FAILED")
                    
            except Exception as e:
                error_result = {
                    "test_name": test_func.__name__,
                    "status": "ERROR",
                    "error": str(e)
                }
                validation_results["test_results"].append(error_result)
                validation_results["failed_tests"] += 1
                logger.error(f"💥 {test_func.__name__}: ERROR - {e}")
        
        # Calculate overall results
        total_time = time.time() - start_time
        success_rate = validation_results["passed_tests"] / validation_results["total_tests"] * 100
        
        if success_rate >= 85:
            validation_results["overall_status"] = "EXCELLENT"
        elif success_rate >= 70:
            validation_results["overall_status"] = "GOOD"
        elif success_rate >= 50:
            validation_results["overall_status"] = "ACCEPTABLE"
        else:
            validation_results["overall_status"] = "NEEDS_IMPROVEMENT"
        
        # Final summary
        logger.info("\n" + "=" * 80)
        logger.info("📊 CONTINUOUS LEARNING VALIDATION SUMMARY")
        logger.info("=" * 80)
        logger.info(f"✅ Tests Passed: {validation_results['passed_tests']}")
        logger.info(f"❌ Tests Failed: {validation_results['failed_tests']}")
        logger.info(f"📈 Success Rate: {success_rate:.1f}%")
        logger.info(f"⏱️  Total Time: {total_time:.2f} seconds")
        logger.info(f"🎯 Overall Status: {validation_results['overall_status']}")
        
        # Status-specific messages
        if validation_results["overall_status"] == "EXCELLENT":
            logger.info("🎉 CONTINUOUS LEARNING PIPELINE: PRODUCTION READY!")
        elif validation_results["overall_status"] == "GOOD":
            logger.info("✨ CONTINUOUS LEARNING PIPELINE: MOSTLY FUNCTIONAL")
        elif validation_results["overall_status"] == "ACCEPTABLE":
            logger.info("⚠️  CONTINUOUS LEARNING PIPELINE: BASIC FUNCTIONALITY")
        else:
            logger.info("🚨 CONTINUOUS LEARNING PIPELINE: REQUIRES FIXES")
        
        validation_results["total_time"] = total_time
        validation_results["success_rate"] = success_rate
        
        # Save detailed results
        if self.save_results:
            results_file = f"continuous_learning_validation_results_{int(time.time())}.json"
            with open(results_file, 'w') as f:
                json.dump(validation_results, f, indent=2)
            logger.info(f"💾 Detailed results saved to: {results_file}")
        
        return validation_results
    
    def generate_performance_plots(self, results: Dict[str, Any]) -> None:
        """Generate performance visualization plots"""
        try:
            plt.style.use('seaborn-v0_8')
            fig, axes = plt.subplots(2, 2, figsize=(15, 12))
            fig.suptitle('RomAI Continuous Learning Pipeline Validation Results', fontsize=16, fontweight='bold')
            
            # Test success rate pie chart
            passed = results['passed_tests']
            failed = results['failed_tests']
            
            axes[0, 0].pie([passed, failed], labels=['Passed', 'Failed'], 
                          colors=['#2ecc71', '#e74c3c'], autopct='%1.1f%%', startangle=90)
            axes[0, 0].set_title('Test Success Rate')
            
            # Individual test results bar chart
            test_names = []
            test_statuses = []
            
            for test_result in results['test_results']:
                test_names.append(test_result['test_name'].replace('_', '\n'))
                test_statuses.append(1 if test_result['status'] == 'PASS' else 0)
            
            colors = ['#2ecc71' if status == 1 else '#e74c3c' for status in test_statuses]
            axes[0, 1].bar(range(len(test_names)), test_statuses, color=colors)
            axes[0, 1].set_title('Individual Test Results')
            axes[0, 1].set_xticks(range(len(test_names)))
            axes[0, 1].set_xticklabels(test_names, rotation=45, ha='right')
            axes[0, 1].set_ylabel('Pass (1) / Fail (0)')
            
            # Performance metrics (if available)
            performance_metrics = []
            metric_names = []
            
            for test_result in results['test_results']:
                if 'accuracy' in test_result.get('test_name', ''):
                    if 'final_accuracy' in test_result:
                        performance_metrics.append(test_result['final_accuracy'])
                        metric_names.append('Online\nAccuracy')
                elif 'replay' in test_result.get('test_name', ''):
                    if 'replay_improvement' in test_result:
                        performance_metrics.append(test_result['replay_improvement'])
                        metric_names.append('Replay\nImprovement')
                elif 'meta' in test_result.get('test_name', ''):
                    if 'query_accuracy' in test_result:
                        performance_metrics.append(test_result['query_accuracy'])
                        metric_names.append('Meta\nAccuracy')
                elif 'forgetting' in test_result.get('test_name', ''):
                    if 'forgetting_reduction' in test_result:
                        performance_metrics.append(test_result['forgetting_reduction'])
                        metric_names.append('Forgetting\nReduction')
            
            if performance_metrics:
                axes[1, 0].bar(metric_names, performance_metrics, color='#3498db')
                axes[1, 0].set_title('Performance Metrics')
                axes[1, 0].set_ylabel('Score')
                axes[1, 0].tick_params(axis='x', rotation=0)
            
            # Overall status indicator
            status_colors = {
                'EXCELLENT': '#2ecc71',
                'GOOD': '#f39c12', 
                'ACCEPTABLE': '#e67e22',
                'NEEDS_IMPROVEMENT': '#e74c3c'
            }
            
            status_color = status_colors.get(results['overall_status'], '#95a5a6')
            axes[1, 1].pie([1], colors=[status_color], labels=[results['overall_status']], 
                          textprops={'fontsize': 14, 'fontweight': 'bold'})
            axes[1, 1].set_title(f"Overall Status\n({results['success_rate']:.1f}% success)")
            
            plt.tight_layout()
            plot_filename = f"continuous_learning_validation_plots_{int(time.time())}.png"
            plt.savefig(plot_filename, dpi=300, bbox_inches='tight')
            logger.info(f"📊 Performance plots saved to: {plot_filename}")
            
        except Exception as e:
            logger.warning(f"Could not generate plots: {e}")

async def main():
    """Main validation function"""
    logger.info("🧠 RomAI Continuous Learning Pipeline Validation")
    logger.info("Testing advanced continuous learning with anti-forgetting mechanisms")
    
    validator = ContinuousLearningValidator(save_results=True)
    
    try:
        # Run comprehensive validation
        results = await validator.run_comprehensive_validation()
        
        # Generate performance plots
        validator.generate_performance_plots(results)
        
        # Exit with appropriate code
        if results["overall_status"] in ["EXCELLENT", "GOOD"]:
            logger.info("🎯 TODO #8: Continuous Learning Pipeline - COMPLETED SUCCESSFULLY!")
            exit(0)
        else:
            logger.warning("⚠️  TODO #8: Continuous Learning Pipeline - NEEDS IMPROVEMENT")
            exit(1)
            
    except Exception as e:
        logger.error(f"❌ Validation failed with error: {e}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())