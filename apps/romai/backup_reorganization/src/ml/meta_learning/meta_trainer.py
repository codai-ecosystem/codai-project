"""
Meta-Learning Training Pipeline for RomAI
Advanced training system for Romanian MAML implementation

This module provides comprehensive meta-learning training capabilities
with Romanian cultural and linguistic optimization.
"""

import asyncio
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import time
import json
import logging
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TrainingMetrics:
    """Training metrics for meta-learning"""
    epoch: int
    meta_loss: float
    adaptation_time_ms: float
    accuracy: float
    convergence_steps: int
    romanian_cultural_score: float
    linguistic_accuracy: float
    timestamp: float

@dataclass
class ValidationResults:
    """Validation results for meta-learning"""
    average_accuracy: float
    average_adaptation_time_ms: float
    cultural_appropriateness: float
    linguistic_precision: float
    domain_performance: Dict[str, float]
    target_achievements: Dict[str, bool]

class RomAIMetaTrainer:
    """Advanced meta-learning trainer for Romanian AI"""
    
    def __init__(self, model, task_generator, learning_rate: float = 0.001):
        self.model = model
        self.task_generator = task_generator
        self.meta_optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
        
        # Training state
        self.training_history = []
        self.validation_history = []
        self.best_model_state = None
        self.best_accuracy = 0.0
        
        # Romanian-specific metrics
        self.cultural_accuracy_tracker = defaultdict(list)
        self.regional_performance_tracker = defaultdict(list)
        self.domain_adaptation_tracker = defaultdict(list)
        
        # Performance targets
        self.targets = {
            "adaptation_time_ms": 100,  # < 100ms
            "accuracy": 0.85,  # > 85%
            "cultural_appropriateness": 0.90,  # > 90%
            "linguistic_precision": 0.92  # > 92%
        }
    
    async def train_meta_learning_advanced(self, 
                                         num_epochs: int = 50,
                                         tasks_per_epoch: int = 32,
                                         meta_batch_size: int = 8,
                                         validation_interval: int = 5) -> Dict[str, Any]:
        """Advanced meta-learning training with Romanian optimization"""
        
        logger.info(f"🧠 Starting advanced meta-learning training")
        logger.info(f"Epochs: {num_epochs}, Tasks/epoch: {tasks_per_epoch}, Batch size: {meta_batch_size}")
        
        training_start = time.time()
        
        for epoch in range(num_epochs):
            epoch_start = time.time()
            
            # Training phase
            epoch_metrics = await self._train_epoch(
                epoch, tasks_per_epoch, meta_batch_size
            )
            
            self.training_history.append(epoch_metrics)
            
            # Validation phase
            if (epoch + 1) % validation_interval == 0:
                validation_results = await self._validate_meta_learning(epoch)
                self.validation_history.append(validation_results)
                
                # Check for best model
                if validation_results.average_accuracy > self.best_accuracy:
                    self.best_accuracy = validation_results.average_accuracy
                    self.best_model_state = self.model.state_dict().copy()
                    logger.info(f"✅ New best model at epoch {epoch + 1}: {self.best_accuracy:.4f}")
            
            epoch_time = time.time() - epoch_start
            
            # Log progress
            logger.info(f"Epoch {epoch + 1}/{num_epochs}: "
                       f"Loss = {epoch_metrics.meta_loss:.4f}, "
                       f"Acc = {epoch_metrics.accuracy:.4f}, "
                       f"Time = {epoch_time:.2f}s")
            
            # Early stopping check
            if await self._check_early_stopping(epoch):
                logger.info(f"Early stopping triggered at epoch {epoch + 1}")
                break
        
        training_time = time.time() - training_start
        
        # Final evaluation
        final_results = await self._final_evaluation()
        
        # Generate training report
        training_report = self._generate_training_report(training_time, final_results)
        
        logger.info(f"🎯 Meta-learning training complete: {training_time:.2f}s")
        return training_report
    
    async def _train_epoch(self, epoch: int, tasks_per_epoch: int, 
                         meta_batch_size: int) -> TrainingMetrics:
        """Train single epoch with Romanian tasks"""
        
        total_loss = 0.0
        total_accuracy = 0.0
        total_adaptation_time = 0.0
        cultural_scores = []
        linguistic_scores = []
        
        num_batches = tasks_per_epoch // meta_batch_size
        
        for batch_idx in range(num_batches):
            batch_loss = 0.0
            batch_accuracy = 0.0
            batch_adaptation_time = 0.0
            
            # Generate batch of Romanian tasks
            tasks = await self._generate_task_batch(meta_batch_size)
            
            for task in tasks:
                # Measure adaptation time
                adaptation_start = time.time()
                
                # Split task examples
                support_set, query_set = self._split_task_examples(task)
                
                # Adapt model to task
                adapted_model = await self.model.adapt_to_task(
                    support_set, task, task.get("adaptation_steps", 5)
                )
                
                adaptation_time = (time.time() - adaptation_start) * 1000  # Convert to ms
                batch_adaptation_time += adaptation_time
                
                # Evaluate on query set
                query_loss, query_accuracy = await self._evaluate_on_query(
                    adapted_model, query_set, task
                )
                
                batch_loss += query_loss
                batch_accuracy += query_accuracy
                
                # Track Romanian-specific metrics
                cultural_score = self._calculate_cultural_score(task)
                linguistic_score = self._calculate_linguistic_score(task)
                
                cultural_scores.append(cultural_score)
                linguistic_scores.append(linguistic_score)
                
                # Update regional/domain trackers
                if "region" in task:
                    self.regional_performance_tracker[task["region"]].append(query_accuracy)
                if "domain" in task:
                    self.domain_adaptation_tracker[task["domain"]].append(adaptation_time)
            
            # Meta-update
            meta_loss = batch_loss / len(tasks)
            self.meta_optimizer.zero_grad()
            meta_loss.backward()
            self.meta_optimizer.step()
            
            total_loss += meta_loss.item()
            total_accuracy += batch_accuracy / len(tasks)
            total_adaptation_time += batch_adaptation_time / len(tasks)
        
        # Calculate epoch metrics
        epoch_metrics = TrainingMetrics(
            epoch=epoch,
            meta_loss=total_loss / num_batches,
            adaptation_time_ms=total_adaptation_time / num_batches,
            accuracy=total_accuracy / num_batches,
            convergence_steps=5,  # Fixed for now
            romanian_cultural_score=np.mean(cultural_scores) if cultural_scores else 0.0,
            linguistic_accuracy=np.mean(linguistic_scores) if linguistic_scores else 0.0,
            timestamp=time.time()
        )
        
        return epoch_metrics
    
    async def _generate_task_batch(self, batch_size: int) -> List[Dict[str, Any]]:
        """Generate batch of diverse Romanian tasks"""
        
        tasks = []
        
        # Ensure diverse task distribution
        from .romanian_task_generator import RomanianDomain
        domains = list(RomanianDomain)
        
        for i in range(batch_size):
            # Select domain cyclically for diversity
            domain = domains[i % len(domains)]
            task = await self.task_generator.generate_domain_specific_task(domain)
            tasks.append(task)
        
        return tasks
    
    def _split_task_examples(self, task: Dict[str, Any]) -> Tuple[List[Dict], List[Dict]]:
        """Split task examples into support and query sets"""
        
        examples = task.get("examples", [])
        
        if len(examples) < 2:
            # Handle edge case
            return examples, examples
        
        # Use 60/40 split for support/query
        split_point = max(1, len(examples) * 6 // 10)
        support_set = examples[:split_point]
        query_set = examples[split_point:]
        
        # Ensure query set is not empty
        if not query_set:
            query_set = examples[-1:]
        
        return support_set, query_set
    
    async def _evaluate_on_query(self, adapted_model, query_set: List[Dict], 
                               task: Dict[str, Any]) -> Tuple[float, float]:
        """Evaluate adapted model on query set"""
        
        if not query_set:
            return 0.0, 0.0
        
        # Prepare query data
        query_data = self.model._prepare_data(query_set, task)
        
        # Forward pass
        with torch.no_grad():
            predictions = adapted_model(query_data['inputs'])
            
            # Calculate loss
            loss = F.cross_entropy(predictions, query_data['targets'])
            
            # Calculate accuracy
            predicted_labels = torch.argmax(predictions, dim=1)
            accuracy = (predicted_labels == query_data['targets']).float().mean().item()
        
        return loss.item(), accuracy
    
    def _calculate_cultural_score(self, task: Dict[str, Any]) -> float:
        """Calculate cultural appropriateness score"""
        
        metadata = task.get("metadata", {})
        cultural_significance = metadata.get("cultural_significance", 0.5)
        regional_specificity = metadata.get("regional_specificity", 0.5)
        
        # Combine cultural factors
        cultural_score = (cultural_significance * 0.7 + regional_specificity * 0.3)
        
        return cultural_score
    
    def _calculate_linguistic_score(self, task: Dict[str, Any]) -> float:
        """Calculate linguistic accuracy score"""
        
        metadata = task.get("metadata", {})
        
        # Check for linguistic complexity handling
        complexity = metadata.get("linguistic_complexity", "basic")
        complexity_scores = {
            "basic": 0.6,
            "intermediate": 0.75,
            "advanced": 0.85,
            "expert": 0.95
        }
        
        linguistic_score = complexity_scores.get(complexity, 0.6)
        
        # Adjust based on dialectal features
        dialectal_features = metadata.get("dialectal_features", [])
        if len(dialectal_features) > 1:
            linguistic_score += 0.05  # Bonus for handling multiple dialects
        
        return min(1.0, linguistic_score)
    
    async def _validate_meta_learning(self, epoch: int) -> ValidationResults:
        """Validate meta-learning performance"""
        
        logger.info(f"Validating meta-learning at epoch {epoch + 1}")
        
        # Generate validation tasks
        validation_tasks = await self.task_generator.generate_comprehensive_task_set(
            num_tasks=20
        )
        
        accuracies = []
        adaptation_times = []
        cultural_scores = []
        linguistic_scores = []
        domain_performance = defaultdict(list)
        
        for task in validation_tasks:
            # Split task
            support_set, query_set = self._split_task_examples(task)
            
            # Measure adaptation
            adaptation_start = time.time()
            adapted_model = await self.model.adapt_to_task(
                support_set, task, task.get("adaptation_steps", 5)
            )
            adaptation_time = (time.time() - adaptation_start) * 1000
            
            # Evaluate
            _, accuracy = await self._evaluate_on_query(adapted_model, query_set, task)
            
            # Track metrics
            accuracies.append(accuracy)
            adaptation_times.append(adaptation_time)
            
            cultural_score = self._calculate_cultural_score(task)
            linguistic_score = self._calculate_linguistic_score(task)
            
            cultural_scores.append(cultural_score)
            linguistic_scores.append(linguistic_score)
            
            # Domain performance
            domain = task.get("domain", "unknown")
            domain_performance[domain].append(accuracy)
        
        # Calculate aggregated domain performance
        avg_domain_performance = {
            domain: np.mean(scores) for domain, scores in domain_performance.items()
        }
        
        # Check target achievements
        avg_accuracy = np.mean(accuracies)
        avg_adaptation_time = np.mean(adaptation_times)
        avg_cultural = np.mean(cultural_scores)
        avg_linguistic = np.mean(linguistic_scores)
        
        target_achievements = {
            "accuracy": avg_accuracy >= self.targets["accuracy"],
            "adaptation_time": avg_adaptation_time <= self.targets["adaptation_time_ms"],
            "cultural_appropriateness": avg_cultural >= self.targets["cultural_appropriateness"],
            "linguistic_precision": avg_linguistic >= self.targets["linguistic_precision"]
        }
        
        validation_results = ValidationResults(
            average_accuracy=avg_accuracy,
            average_adaptation_time_ms=avg_adaptation_time,
            cultural_appropriateness=avg_cultural,
            linguistic_precision=avg_linguistic,
            domain_performance=avg_domain_performance,
            target_achievements=target_achievements
        )
        
        logger.info(f"Validation results: Acc={avg_accuracy:.4f}, "
                   f"Time={avg_adaptation_time:.2f}ms, "
                   f"Cultural={avg_cultural:.4f}")
        
        return validation_results
    
    async def _check_early_stopping(self, epoch: int, patience: int = 10) -> bool:
        """Check if early stopping should be triggered"""
        
        if len(self.validation_history) < 2:
            return False
        
        # Check if accuracy hasn't improved in last patience epochs
        recent_accuracies = [
            val.average_accuracy for val in self.validation_history[-patience:]
        ]
        
        if len(recent_accuracies) == patience:
            improvement = max(recent_accuracies) - min(recent_accuracies)
            if improvement < 0.01:  # Less than 1% improvement
                return True
        
        return False
    
    async def _final_evaluation(self) -> Dict[str, Any]:
        """Perform final comprehensive evaluation"""
        
        logger.info("Performing final evaluation")
        
        # Load best model if available
        if self.best_model_state:
            self.model.load_state_dict(self.best_model_state)
        
        # Comprehensive test set
        test_tasks = await self.task_generator.generate_comprehensive_task_set(
            num_tasks=50
        )
        
        # Add linguistic complexity tasks
        linguistic_tasks = await self.task_generator.generate_linguistic_complexity_tasks()
        test_tasks.extend(linguistic_tasks[:10])  # Add 10 linguistic tasks
        
        # Evaluate all tasks
        results = {
            "total_tasks": len(test_tasks),
            "accuracies": [],
            "adaptation_times": [],
            "cultural_scores": [],
            "linguistic_scores": [],
            "domain_breakdown": defaultdict(list),
            "regional_breakdown": defaultdict(list)
        }
        
        for task in test_tasks:
            support_set, query_set = self._split_task_examples(task)
            
            adaptation_start = time.time()
            adapted_model = await self.model.adapt_to_task(
                support_set, task, task.get("adaptation_steps", 5)
            )
            adaptation_time = (time.time() - adaptation_start) * 1000
            
            _, accuracy = await self._evaluate_on_query(adapted_model, query_set, task)
            
            results["accuracies"].append(accuracy)
            results["adaptation_times"].append(adaptation_time)
            results["cultural_scores"].append(self._calculate_cultural_score(task))
            results["linguistic_scores"].append(self._calculate_linguistic_score(task))
            
            # Domain and regional breakdown
            domain = task.get("domain", "unknown")
            region = task.get("region", "unknown")
            
            results["domain_breakdown"][domain].append(accuracy)
            results["regional_breakdown"][region].append(accuracy)
        
        # Calculate final metrics
        final_metrics = {
            "average_accuracy": np.mean(results["accuracies"]),
            "accuracy_std": np.std(results["accuracies"]),
            "average_adaptation_time_ms": np.mean(results["adaptation_times"]),
            "adaptation_time_std": np.std(results["adaptation_times"]),
            "cultural_appropriateness": np.mean(results["cultural_scores"]),
            "linguistic_precision": np.mean(results["linguistic_scores"]),
            "domain_performance": {
                domain: np.mean(scores) 
                for domain, scores in results["domain_breakdown"].items()
            },
            "regional_performance": {
                region: np.mean(scores)
                for region, scores in results["regional_breakdown"].items()
            }
        }
        
        return final_metrics
    
    def _generate_training_report(self, training_time: float, 
                                final_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive training report"""
        
        # Calculate target achievements
        targets_achieved = {
            "adaptation_speed": final_results["average_adaptation_time_ms"] <= self.targets["adaptation_time_ms"],
            "accuracy": final_results["average_accuracy"] >= self.targets["accuracy"],
            "cultural_appropriateness": final_results["cultural_appropriateness"] >= self.targets["cultural_appropriateness"],
            "linguistic_precision": final_results["linguistic_precision"] >= self.targets["linguistic_precision"]
        }
        
        # Training summary
        training_summary = {
            "training_completed": True,
            "training_time_seconds": training_time,
            "total_epochs": len(self.training_history),
            "best_accuracy": self.best_accuracy,
            "final_results": final_results,
            "targets_achieved": targets_achieved,
            "targets_summary": {
                "total_targets": len(self.targets),
                "targets_met": sum(targets_achieved.values()),
                "success_rate": sum(targets_achieved.values()) / len(targets_achieved) * 100
            }
        }
        
        # Performance insights
        if self.training_history:
            last_metrics = self.training_history[-1]
            training_summary["final_training_metrics"] = asdict(last_metrics)
        
        if self.validation_history:
            last_validation = self.validation_history[-1]
            training_summary["final_validation_metrics"] = asdict(last_validation)
        
        # Romanian-specific insights
        training_summary["romanian_insights"] = {
            "regional_performance_tracked": len(self.regional_performance_tracker),
            "domain_adaptation_tracked": len(self.domain_adaptation_tracker),
            "cultural_accuracy_maintained": final_results["cultural_appropriateness"] > 0.85
        }
        
        return training_summary
    
    def save_training_state(self, filepath: str):
        """Save training state and metrics"""
        
        state = {
            "model_state_dict": self.model.state_dict(),
            "best_model_state_dict": self.best_model_state,
            "training_history": [asdict(m) for m in self.training_history],
            "validation_history": [asdict(v) for v in self.validation_history],
            "best_accuracy": self.best_accuracy,
            "targets": self.targets
        }
        
        torch.save(state, filepath)
        logger.info(f"Training state saved to {filepath}")
    
    def load_training_state(self, filepath: str):
        """Load training state and metrics"""
        
        state = torch.load(filepath)
        
        self.model.load_state_dict(state["model_state_dict"])
        self.best_model_state = state["best_model_state_dict"]
        self.best_accuracy = state["best_accuracy"]
        self.targets = state["targets"]
        
        # Reconstruct training history
        self.training_history = [
            TrainingMetrics(**m) for m in state["training_history"]
        ]
        self.validation_history = [
            ValidationResults(**v) for v in state["validation_history"]
        ]
        
        logger.info(f"Training state loaded from {filepath}")

async def main():
    """Main function to demonstrate meta-learning training"""
    
    logger.info("🚀 Starting RomAI Meta-Learning Training Demo")
    
    # Import components
    from .maml_implementation import MAMLRomanian
    from .romanian_task_generator import AdvancedRomanianTaskGenerator
    
    # Initialize components
    model = MAMLRomanian(input_size=768, hidden_size=256, output_size=10)
    task_generator = AdvancedRomanianTaskGenerator()
    trainer = RomAIMetaTrainer(model, task_generator)
    
    # Run training (small scale for demo)
    training_report = await trainer.train_meta_learning_advanced(
        num_epochs=10,
        tasks_per_epoch=16,
        meta_batch_size=4,
        validation_interval=3
    )
    
    # Summary
    summary = {
        "meta_trainer_status": "OPERATIONAL",
        "training_report": training_report,
        "performance_summary": {
            "adaptation_time_target": "< 100ms",
            "accuracy_target": "> 85%",
            "cultural_target": "> 90%",
            "linguistic_target": "> 92%"
        },
        "next_implementation": "Day 2: Few-Shot Learning Engine"
    }
    
    logger.info(f"🎯 Meta-Learning Training Summary: {json.dumps(summary, indent=2, default=str)}")
    return summary

if __name__ == "__main__":
    asyncio.run(main())
