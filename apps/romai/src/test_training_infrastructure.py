#!/usr/bin/env python3
"""
Test Enhanced Training Infrastructure - Phase 1 Day 2
"""
import sys
import os
sys.path.append('.')
sys.path.append('ml/models')
sys.path.append('ml/training')

from ml.models.real_neural_agi_engine import RealAGIEngine
from ml.training.enhanced_training_infrastructure import create_enhanced_training_dataset, RealWorldDataset, RealTimeTrainingOrchestrator
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_enhanced_training():
    print('🚀 Testing Enhanced Training Infrastructure')

    # Create model
    agi_engine = RealAGIEngine()
    model = agi_engine.model  # Get the neural model
    param_count = sum(p.numel() for p in model.parameters())
    print(f'✅ Model created with {param_count:,} parameters')

    # Create training dataset
    training_data = create_enhanced_training_dataset()
    dataset = RealWorldDataset(training_data)
    print(f'✅ Training dataset created with {len(training_data)} samples')

    # Initialize training orchestrator
    orchestrator = RealTimeTrainingOrchestrator(model, {
        'max_epochs': 3,
        'learning_rate': 0.0001,
        'optimization_interval': 10
    })
    print('✅ Training orchestrator initialized')

    # Start training
    print('🔄 Starting training process')
    results = orchestrator.start_continuous_training(dataset, batch_size=8)

    # Display results
    print('📊 Training Results:')
    print(f'Epochs completed: {results["epochs_completed"]}')
    print(f'Final loss: {results["training_loss"][-1]:.4f}')
    final_performance = results["performance_metrics"][-1]["overall_score"]
    print(f'Final performance: {final_performance:.3f}')
    print(f'Optimizations applied: {len(results["optimization_history"])}')

    # Show detailed performance metrics
    final_metrics = results["performance_metrics"][-1]
    print('\n📈 Final Performance Breakdown:')
    print(f'  Reasoning Accuracy: {final_metrics["reasoning_accuracy"]:.3f}')
    print(f'  Learning Efficiency: {final_metrics["learning_efficiency"]:.3f}')
    print(f'  Autonomous Capability: {final_metrics["autonomous_capability"]:.3f}')
    print(f'  Overall AGI Score: {final_metrics["overall_score"]:.3f}')

    print('\n✅ Enhanced Training Infrastructure test complete')
    return final_performance

if __name__ == '__main__':
    test_enhanced_training()
