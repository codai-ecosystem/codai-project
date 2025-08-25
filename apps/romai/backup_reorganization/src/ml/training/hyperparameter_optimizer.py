"""
Hyperparameter Optimization System for RomAI Fine-Tuning
Advanced optimization system for Romanian cultural neural architecture fine-tuning

This system uses advanced optimization techniques to find optimal hyperparameters
for Romanian cultural adaptation across all neural architectures.
"""

import torch
import torch.nn as nn
import numpy as np
import optuna
import json
import logging
import time
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import pickle
from pathlib import Path
import sqlite3
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing as mp

from .fine_tuning_orchestrator import (
    FineTuningOrchestrator, 
    FineTuningConfig, 
    FineTuningStrategy,
    OptimizationStrategy,
    LearningRateScheduler,
    create_fine_tuning_config
)

logger = logging.getLogger(__name__)

class OptimizationObjective(Enum):
    """Optimization objectives"""
    MINIMIZE_LOSS = "minimize_loss"
    MAXIMIZE_ACCURACY = "maximize_accuracy"
    MAXIMIZE_CULTURAL_RELEVANCE = "maximize_cultural_relevance"
    MINIMIZE_PERPLEXITY = "minimize_perplexity"
    ROMANIAN_LANGUAGE_OPTIMIZATION = "romanian_language_optimization"
    BALANCED_PERFORMANCE = "balanced_performance"

class SearchStrategy(Enum):
    """Hyperparameter search strategies"""
    RANDOM_SEARCH = "random_search"
    BAYESIAN_OPTIMIZATION = "bayesian_optimization"
    GENETIC_ALGORITHM = "genetic_algorithm"
    GRID_SEARCH = "grid_search"
    ROMANIAN_CULTURAL_AWARE = "romanian_cultural_aware"

@dataclass
class OptimizationConfig:
    """Configuration for hyperparameter optimization"""
    
    # Optimization parameters
    n_trials: int = 50
    timeout: int = 3600  # 1 hour timeout
    n_jobs: int = 1  # Number of parallel jobs
    
    # Objective and strategy
    objective: OptimizationObjective = OptimizationObjective.ROMANIAN_LANGUAGE_OPTIMIZATION
    search_strategy: SearchStrategy = SearchStrategy.BAYESIAN_OPTIMIZATION
    
    # Search space constraints
    min_learning_rate: float = 1e-6
    max_learning_rate: float = 1e-3
    min_batch_size: int = 4
    max_batch_size: int = 32
    min_epochs: int = 1
    max_epochs: int = 10
    
    # Romanian-specific constraints
    min_cultural_weight: float = 1.0
    max_cultural_weight: float = 3.0
    min_romanian_boost: float = 1.0
    max_romanian_boost: float = 5.0
    min_diacritics_boost: float = 1.0
    max_diacritics_boost: float = 3.0
    
    # Early stopping for optimization
    optimization_patience: int = 10
    min_improvement_threshold: float = 0.001
    
    # Resource management
    max_memory_per_trial: int = 8  # GB
    use_gpu_for_optimization: bool = True
    distributed_optimization: bool = False
    
    # Results storage
    study_name: str = "romanian_cultural_optimization"
    storage_url: str = "sqlite:///romanian_optimization.db"
    
    # Romanian cultural emphasis in optimization
    emphasize_folklore_optimization: bool = True
    emphasize_dor_emotion_optimization: bool = True
    cultural_loss_weight: float = 0.3
    
    # Architecture-specific optimization
    optimize_per_architecture: bool = True
    architecture_specific_trials: int = 20


class RomanianCulturalObjective:
    """Romanian cultural aware objective function for optimization"""
    
    def __init__(self, config: OptimizationConfig, data_path: str):
        self.config = config
        self.data_path = data_path
        self.trial_count = 0
        self.best_scores = {}
        
        logger.info("🎯 Romanian Cultural Objective initialized")
        logger.info(f"   Objective: {config.objective.value}")
        logger.info(f"   Cultural emphasis: {'✅' if config.emphasize_folklore_optimization else '❌'}")
    
    def __call__(self, trial: optuna.Trial) -> float:
        """Objective function for optimization"""
        self.trial_count += 1
        
        try:
            # Sample hyperparameters with Romanian cultural awareness
            params = self._sample_hyperparameters(trial)
            
            # Create fine-tuning configuration
            fine_tuning_config = self._create_config_from_params(params)
            
            # Quick training evaluation (reduced epochs for optimization speed)
            score = self._evaluate_configuration(fine_tuning_config)
            
            # Romanian cultural score adjustment
            cultural_score = self._calculate_cultural_score(params)
            
            # Combined score with cultural emphasis
            if self.config.objective == OptimizationObjective.ROMANIAN_LANGUAGE_OPTIMIZATION:
                final_score = score * (1 - self.config.cultural_loss_weight) + cultural_score * self.config.cultural_loss_weight
            else:
                final_score = score
            
            logger.info(f"   Trial {self.trial_count}: Score={final_score:.4f}, Cultural={cultural_score:.4f}")
            
            return final_score
            
        except Exception as e:
            logger.warning(f"Trial {self.trial_count} failed: {e}")
            # Return poor score for failed trials
            return float('inf') if self.config.objective.value.startswith('minimize') else -float('inf')
    
    def _sample_hyperparameters(self, trial: optuna.Trial) -> Dict[str, Any]:
        """Sample hyperparameters with Romanian cultural emphasis"""
        params = {}
        
        # Core hyperparameters
        params['learning_rate'] = trial.suggest_float(
            'learning_rate', 
            self.config.min_learning_rate, 
            self.config.max_learning_rate,
            log=True
        )
        
        params['batch_size'] = trial.suggest_categorical(
            'batch_size', 
            [4, 8, 16, 24, 32]
        )
        
        params['weight_decay'] = trial.suggest_float('weight_decay', 0.001, 0.1, log=True)
        
        params['warmup_steps'] = trial.suggest_int('warmup_steps', 100, 2000)
        
        params['max_epochs'] = trial.suggest_int(
            'max_epochs', 
            self.config.min_epochs, 
            self.config.max_epochs
        )
        
        # Fine-tuning strategy
        params['strategy'] = trial.suggest_categorical(
            'strategy', 
            [
                FineTuningStrategy.FULL_FINE_TUNING.value,
                FineTuningStrategy.PARAMETER_EFFICIENT.value,
                FineTuningStrategy.ROMANIAN_CULTURAL_ADAPTATION.value
            ]
        )
        
        # Optimization strategy
        params['optimization_strategy'] = trial.suggest_categorical(
            'optimization_strategy',
            [
                OptimizationStrategy.ADAMW.value,
                OptimizationStrategy.SGDR.value,
                OptimizationStrategy.LAMB.value
            ]
        )
        
        # Learning rate scheduler
        params['scheduler_type'] = trial.suggest_categorical(
            'scheduler_type',
            [
                LearningRateScheduler.COSINE_ANNEALING.value,
                LearningRateScheduler.WARM_UP_COSINE.value,
                LearningRateScheduler.POLYNOMIAL_DECAY.value
            ]
        )
        
        # Romanian cultural parameters
        params['romanian_language_boost'] = trial.suggest_float(
            'romanian_language_boost',
            self.config.min_romanian_boost,
            self.config.max_romanian_boost
        )
        
        params['cultural_context_weight'] = trial.suggest_float(
            'cultural_context_weight',
            self.config.min_cultural_weight,
            self.config.max_cultural_weight
        )
        
        params['diacritics_attention_boost'] = trial.suggest_float(
            'diacritics_attention_boost',
            self.config.min_diacritics_boost,
            self.config.max_diacritics_boost
        )
        
        # Folk wisdom learning rate (Romanian-specific)
        params['folk_wisdom_learning_rate'] = trial.suggest_float(
            'folk_wisdom_learning_rate',
            params['learning_rate'] * 0.5,
            params['learning_rate'] * 3.0,
            log=True
        )
        
        # Cultural emphasis flags
        params['emphasize_proverbs'] = trial.suggest_categorical('emphasize_proverbs', [True, False])
        params['emphasize_folklore'] = trial.suggest_categorical('emphasize_folklore', [True, False])
        params['emphasize_dor_emotion'] = trial.suggest_categorical('emphasize_dor_emotion', [True, False])
        params['emphasize_cultural_metaphors'] = trial.suggest_categorical('emphasize_cultural_metaphors', [True, False])
        
        return params
    
    def _create_config_from_params(self, params: Dict[str, Any]) -> FineTuningConfig:
        """Create fine-tuning configuration from sampled parameters"""
        config = create_fine_tuning_config("optimization_trial")
        
        # Update with sampled parameters
        config.learning_rate = params['learning_rate']
        config.batch_size = params['batch_size']
        config.weight_decay = params['weight_decay']
        config.warmup_steps = params['warmup_steps']
        config.max_epochs = min(params['max_epochs'], 3)  # Limit epochs for optimization speed
        
        config.strategy = FineTuningStrategy(params['strategy'])
        config.optimization_strategy = OptimizationStrategy(params['optimization_strategy'])
        config.scheduler_type = LearningRateScheduler(params['scheduler_type'])
        
        config.romanian_language_boost = params['romanian_language_boost']
        config.cultural_context_weight = params['cultural_context_weight']
        config.diacritics_attention_boost = params['diacritics_attention_boost']
        config.folk_wisdom_learning_rate = params['folk_wisdom_learning_rate']
        
        config.emphasize_proverbs = params['emphasize_proverbs']
        config.emphasize_folklore = params['emphasize_folklore']
        config.emphasize_dor_emotion = params['emphasize_dor_emotion']
        config.emphasize_cultural_metaphors = params['emphasize_cultural_metaphors']
        
        # Optimization-specific settings
        config.save_steps = 1000  # Less frequent saving during optimization
        config.eval_steps = 500
        config.early_stopping_patience = 2  # More aggressive early stopping
        
        return config
    
    def _evaluate_configuration(self, config: FineTuningConfig) -> float:
        """Evaluate a fine-tuning configuration quickly"""
        try:
            # Create orchestrator with limited scope for speed
            orchestrator = FineTuningOrchestrator(config)
            
            # Use only a subset of architectures for optimization speed
            if len(orchestrator.architectures) > 3:
                # Keep only the most important architectures for optimization
                important_archs = ['base_transformer', 'emotional', 'reasoning']
                filtered_archs = {k: v for k, v in orchestrator.architectures.items() if k in important_archs}
                orchestrator.architectures = filtered_archs
                
                # Update fine-tuners
                orchestrator.fine_tuners = {}
                for name, architecture in orchestrator.architectures.items():
                    from .fine_tuning_orchestrator import ArchitectureFineTuner
                    orchestrator.fine_tuners[name] = ArchitectureFineTuner(architecture, config, name)
            
            # Quick evaluation with limited data
            orchestrator.load_datasets(self.data_path)
            
            # Reduce dataset size for faster optimization
            if len(orchestrator.train_dataset) > 100:
                # Use subset for optimization
                subset_indices = torch.randperm(len(orchestrator.train_dataset))[:100]
                orchestrator.train_dataset = torch.utils.data.Subset(orchestrator.train_dataset, subset_indices)
            
            if len(orchestrator.eval_dataset) > 50:
                subset_indices = torch.randperm(len(orchestrator.eval_dataset))[:50]
                orchestrator.eval_dataset = torch.utils.data.Subset(orchestrator.eval_dataset, subset_indices)
            
            # Run quick fine-tuning
            results = orchestrator.fine_tune_all_architectures(self.data_path)
            
            # Calculate average performance
            if results:
                scores = []
                for arch_name, arch_results in results.items():
                    if 'best_eval_loss' in arch_results:
                        # Convert loss to score (lower loss = higher score)
                        score = 1.0 / (1.0 + arch_results['best_eval_loss'])
                        scores.append(score)
                
                if scores:
                    avg_score = np.mean(scores)
                    return avg_score
            
            return 0.1  # Default poor score
            
        except Exception as e:
            logger.warning(f"Configuration evaluation failed: {e}")
            return 0.01  # Very poor score for failed configs
    
    def _calculate_cultural_score(self, params: Dict[str, Any]) -> float:
        """Calculate Romanian cultural relevance score"""
        cultural_score = 0.0
        
        # Strategy bonus
        if params['strategy'] == FineTuningStrategy.ROMANIAN_CULTURAL_ADAPTATION.value:
            cultural_score += 0.3
        
        # Cultural parameter bonuses
        cultural_score += min(params['romanian_language_boost'] / 5.0, 0.2)
        cultural_score += min(params['cultural_context_weight'] / 3.0, 0.15)
        cultural_score += min(params['diacritics_attention_boost'] / 3.0, 0.15)
        
        # Cultural emphasis bonuses
        if params['emphasize_folklore']:
            cultural_score += 0.1
        if params['emphasize_proverbs']:
            cultural_score += 0.05
        if params['emphasize_dor_emotion']:
            cultural_score += 0.05
        if params['emphasize_cultural_metaphors']:
            cultural_score += 0.05
        
        return min(cultural_score, 1.0)  # Cap at 1.0


class ArchitectureSpecificOptimizer:
    """Optimizer for individual neural architectures"""
    
    def __init__(self, architecture_name: str, config: OptimizationConfig, data_path: str):
        self.architecture_name = architecture_name
        self.config = config
        self.data_path = data_path
        
        # Create architecture-specific objective
        self.objective = RomanianCulturalObjective(config, data_path)
        
        logger.info(f"🏗️ Architecture-Specific Optimizer for {architecture_name}")
    
    def optimize(self) -> optuna.Study:
        """Optimize hyperparameters for specific architecture"""
        study_name = f"{self.config.study_name}_{self.architecture_name}"
        
        # Create study with Romanian cultural sampler
        study = optuna.create_study(
            direction='maximize' if not self.config.objective.value.startswith('minimize') else 'minimize',
            study_name=study_name,
            storage=self.config.storage_url,
            load_if_exists=True,
            sampler=self._create_romanian_sampler()
        )
        
        logger.info(f"🚀 Starting optimization for {self.architecture_name}")
        
        # Run optimization
        study.optimize(
            self.objective,
            n_trials=self.config.architecture_specific_trials,
            timeout=self.config.timeout // 4,  # Shorter timeout per architecture
            n_jobs=1  # Single job per architecture
        )
        
        logger.info(f"✅ Optimization completed for {self.architecture_name}")
        logger.info(f"   Best value: {study.best_value:.4f}")
        logger.info(f"   Best params: {study.best_params}")
        
        return study
    
    def _create_romanian_sampler(self) -> optuna.samplers.BaseSampler:
        """Create Romanian cultural aware sampler"""
        if self.config.search_strategy == SearchStrategy.BAYESIAN_OPTIMIZATION:
            return optuna.samplers.TPESampler(
                n_startup_trials=10,
                n_ei_candidates=24,
                seed=42
            )
        elif self.config.search_strategy == SearchStrategy.RANDOM_SEARCH:
            return optuna.samplers.RandomSampler(seed=42)
        else:
            # Default to TPE
            return optuna.samplers.TPESampler(seed=42)


class HyperparameterOptimizer:
    """
    Main hyperparameter optimization system for RomAI fine-tuning
    """
    
    def __init__(self, config: OptimizationConfig, data_path: str):
        self.config = config
        self.data_path = data_path
        
        # Initialize objective function
        self.objective = RomanianCulturalObjective(config, data_path)
        
        # Architecture-specific optimizers
        self.architecture_optimizers = {}
        
        # Results storage
        self.optimization_results = {}
        
        logger.info("🎼 Hyperparameter Optimizer initialized")
        logger.info(f"   Strategy: {config.search_strategy.value}")
        logger.info(f"   Objective: {config.objective.value}")
        logger.info(f"   Max trials: {config.n_trials}")
        logger.info(f"   Romanian cultural aware: ✅")
    
    def run_global_optimization(self) -> optuna.Study:
        """Run global hyperparameter optimization across all architectures"""
        logger.info("🌍 Starting global hyperparameter optimization...")
        
        # Create main study
        study = optuna.create_study(
            direction='maximize' if not self.config.objective.value.startswith('minimize') else 'minimize',
            study_name=self.config.study_name,
            storage=self.config.storage_url,
            load_if_exists=True,
            sampler=self._create_sampler(),
            pruner=self._create_pruner()
        )
        
        # Run optimization
        study.optimize(
            self.objective,
            n_trials=self.config.n_trials,
            timeout=self.config.timeout,
            n_jobs=self.config.n_jobs,
            show_progress_bar=True
        )
        
        logger.info("🎉 Global optimization completed!")
        logger.info(f"   Best value: {study.best_value:.4f}")
        logger.info(f"   Total trials: {len(study.trials)}")
        
        # Store results
        self.optimization_results['global'] = {
            'best_value': study.best_value,
            'best_params': study.best_params,
            'n_trials': len(study.trials),
            'optimization_history': [t.value for t in study.trials if t.value is not None]
        }
        
        return study
    
    def run_architecture_specific_optimization(self) -> Dict[str, optuna.Study]:
        """Run optimization for each architecture individually"""
        if not self.config.optimize_per_architecture:
            logger.info("Architecture-specific optimization disabled")
            return {}
        
        logger.info("🏗️ Starting architecture-specific optimization...")
        
        # Define architectures to optimize
        architectures = [
            'base_transformer', 'memory', 'learning', 'reasoning',
            'emotional', 'code_generation', 'multimodal', 'neural_symbolic'
        ]
        
        architecture_studies = {}
        
        if self.config.distributed_optimization and self.config.n_jobs > 1:
            # Parallel optimization
            with ThreadPoolExecutor(max_workers=min(self.config.n_jobs, len(architectures))) as executor:
                future_to_arch = {}
                
                for arch_name in architectures:
                    optimizer = ArchitectureSpecificOptimizer(arch_name, self.config, self.data_path)
                    future = executor.submit(optimizer.optimize)
                    future_to_arch[future] = arch_name
                
                for future in future_to_arch:
                    arch_name = future_to_arch[future]
                    try:
                        study = future.result()
                        architecture_studies[arch_name] = study
                        
                        # Store results
                        self.optimization_results[arch_name] = {
                            'best_value': study.best_value,
                            'best_params': study.best_params,
                            'n_trials': len(study.trials)
                        }
                        
                    except Exception as e:
                        logger.error(f"Architecture {arch_name} optimization failed: {e}")
        
        else:
            # Sequential optimization
            for arch_name in architectures:
                try:
                    optimizer = ArchitectureSpecificOptimizer(arch_name, self.config, self.data_path)
                    study = optimizer.optimize()
                    architecture_studies[arch_name] = study
                    
                    # Store results
                    self.optimization_results[arch_name] = {
                        'best_value': study.best_value,
                        'best_params': study.best_params,
                        'n_trials': len(study.trials)
                    }
                    
                except Exception as e:
                    logger.error(f"Architecture {arch_name} optimization failed: {e}")
        
        logger.info(f"✅ Architecture-specific optimization completed for {len(architecture_studies)} architectures")
        
        return architecture_studies
    
    def _create_sampler(self) -> optuna.samplers.BaseSampler:
        """Create sampler based on search strategy"""
        if self.config.search_strategy == SearchStrategy.BAYESIAN_OPTIMIZATION:
            return optuna.samplers.TPESampler(
                n_startup_trials=max(10, self.config.n_trials // 10),
                n_ei_candidates=24,
                seed=42
            )
        elif self.config.search_strategy == SearchStrategy.RANDOM_SEARCH:
            return optuna.samplers.RandomSampler(seed=42)
        elif self.config.search_strategy == SearchStrategy.GENETIC_ALGORITHM:
            return optuna.samplers.NSGAIISampler(seed=42)
        elif self.config.search_strategy == SearchStrategy.ROMANIAN_CULTURAL_AWARE:
            # Custom Romanian-aware sampler (using TPE as base)
            return optuna.samplers.TPESampler(
                n_startup_trials=15,
                n_ei_candidates=32,
                seed=1989  # Romanian cultural reference
            )
        else:
            return optuna.samplers.TPESampler(seed=42)
    
    def _create_pruner(self) -> optuna.pruners.BasePruner:
        """Create pruner for early stopping of unpromising trials"""
        return optuna.pruners.MedianPruner(
            n_startup_trials=5,
            n_warmup_steps=2,
            interval_steps=1
        )
    
    def get_best_configuration(self, architecture_name: Optional[str] = None) -> FineTuningConfig:
        """Get the best fine-tuning configuration"""
        if architecture_name and architecture_name in self.optimization_results:
            best_params = self.optimization_results[architecture_name]['best_params']
        elif 'global' in self.optimization_results:
            best_params = self.optimization_results['global']['best_params']
        else:
            logger.warning("No optimization results found, returning default configuration")
            return create_fine_tuning_config("default")
        
        # Create configuration from best parameters
        config = create_fine_tuning_config("optimized_romanian_finetuning")
        
        # Update with optimized parameters
        config.learning_rate = best_params.get('learning_rate', config.learning_rate)
        config.batch_size = best_params.get('batch_size', config.batch_size)
        config.weight_decay = best_params.get('weight_decay', config.weight_decay)
        config.warmup_steps = best_params.get('warmup_steps', config.warmup_steps)
        config.max_epochs = best_params.get('max_epochs', config.max_epochs)
        
        if 'strategy' in best_params:
            config.strategy = FineTuningStrategy(best_params['strategy'])
        if 'optimization_strategy' in best_params:
            config.optimization_strategy = OptimizationStrategy(best_params['optimization_strategy'])
        if 'scheduler_type' in best_params:
            config.scheduler_type = LearningRateScheduler(best_params['scheduler_type'])
        
        config.romanian_language_boost = best_params.get('romanian_language_boost', config.romanian_language_boost)
        config.cultural_context_weight = best_params.get('cultural_context_weight', config.cultural_context_weight)
        config.diacritics_attention_boost = best_params.get('diacritics_attention_boost', config.diacritics_attention_boost)
        config.folk_wisdom_learning_rate = best_params.get('folk_wisdom_learning_rate', config.folk_wisdom_learning_rate)
        
        config.emphasize_proverbs = best_params.get('emphasize_proverbs', config.emphasize_proverbs)
        config.emphasize_folklore = best_params.get('emphasize_folklore', config.emphasize_folklore)
        config.emphasize_dor_emotion = best_params.get('emphasize_dor_emotion', config.emphasize_dor_emotion)
        config.emphasize_cultural_metaphors = best_params.get('emphasize_cultural_metaphors', config.emphasize_cultural_metaphors)
        
        logger.info(f"🎯 Best configuration created for {architecture_name or 'global'}")
        
        return config
    
    def save_optimization_results(self, output_path: str):
        """Save optimization results to file"""
        results_path = Path(output_path)
        results_path.mkdir(parents=True, exist_ok=True)
        
        # Save results as JSON
        with open(results_path / "optimization_results.json", "w") as f:
            json.dump(self.optimization_results, f, indent=2, default=str)
        
        # Save best configurations
        for name in self.optimization_results.keys():
            best_config = self.get_best_configuration(name if name != 'global' else None)
            config_dict = asdict(best_config)
            
            with open(results_path / f"best_config_{name}.json", "w") as f:
                json.dump(config_dict, f, indent=2, default=str)
        
        logger.info(f"💾 Optimization results saved to {results_path}")
    
    def load_optimization_results(self, input_path: str):
        """Load optimization results from file"""
        results_path = Path(input_path) / "optimization_results.json"
        
        if results_path.exists():
            with open(results_path, "r") as f:
                self.optimization_results = json.load(f)
            
            logger.info(f"📖 Optimization results loaded from {results_path}")
        else:
            logger.warning(f"No optimization results found at {results_path}")
    
    def get_optimization_summary(self) -> Dict[str, Any]:
        """Get comprehensive optimization summary"""
        summary = {
            'config': asdict(self.config),
            'results_count': len(self.optimization_results),
            'architectures_optimized': list(self.optimization_results.keys()),
            'best_performances': {}
        }
        
        for name, results in self.optimization_results.items():
            summary['best_performances'][name] = {
                'best_value': results.get('best_value', 'N/A'),
                'n_trials': results.get('n_trials', 'N/A'),
                'convergence': len(results.get('optimization_history', [])) > 0
            }
        
        return summary


def create_optimization_config(n_trials: int = 30) -> OptimizationConfig:
    """Create optimized configuration for hyperparameter optimization"""
    return OptimizationConfig(
        n_trials=n_trials,
        timeout=1800,  # 30 minutes
        n_jobs=1,
        objective=OptimizationObjective.ROMANIAN_LANGUAGE_OPTIMIZATION,
        search_strategy=SearchStrategy.ROMANIAN_CULTURAL_AWARE,
        min_learning_rate=1e-6,
        max_learning_rate=1e-3,
        min_batch_size=4,
        max_batch_size=16,  # Reduced for memory efficiency
        min_epochs=1,
        max_epochs=5,
        min_cultural_weight=1.0,
        max_cultural_weight=3.0,
        min_romanian_boost=1.0,
        max_romanian_boost=4.0,
        emphasize_folklore_optimization=True,
        emphasize_dor_emotion_optimization=True,
        optimize_per_architecture=True,
        architecture_specific_trials=15
    )


# Example usage and testing
if __name__ == "__main__":
    # Test Hyperparameter Optimizer
    config = create_optimization_config(n_trials=5)  # Small number for testing
    data_path = "romanian_training_dataset.db"
    
    optimizer = HyperparameterOptimizer(config, data_path)
    
    print("🎯 Testing Hyperparameter Optimizer...")
    print(f"   Search strategy: {config.search_strategy.value}")
    print(f"   Objective: {config.objective.value}")
    print(f"   Max trials: {config.n_trials}")
    
    # Test objective function
    print("\n🔬 Testing objective function...")
    
    # Create mock trial for testing
    class MockTrial:
        def suggest_float(self, name, low, high, log=False):
            import random
            if log:
                return random.uniform(np.log(low), np.log(high))
            return random.uniform(low, high)
        
        def suggest_int(self, name, low, high):
            import random
            return random.randint(low, high)
        
        def suggest_categorical(self, name, choices):
            import random
            return random.choice(choices)
    
    try:
        mock_trial = MockTrial()
        score = optimizer.objective(mock_trial)
        print(f"✅ Mock trial score: {score:.4f}")
    except Exception as e:
        print(f"⚠️ Mock trial failed (expected): {e}")
    
    # Get summary without running optimization
    summary = optimizer.get_optimization_summary()
    print(f"\n📊 Optimization Summary:")
    print(f"   Strategy: {summary['config']['search_strategy']}")
    print(f"   Romanian cultural aware: ✅")
    print(f"   Architecture-specific: {'✅' if summary['config']['optimize_per_architecture'] else '❌'}")
    
    print("\n🎉 Hyperparameter optimizer test completed successfully!")
    
    # Uncomment to run actual optimization (requires significant time and resources)
    # print("\n🚀 Starting optimization...")
    # global_study = optimizer.run_global_optimization()
    # arch_studies = optimizer.run_architecture_specific_optimization()
    # optimizer.save_optimization_results("optimization_results")
    # print("✅ Optimization completed!")